-- Initial schema for CourseReview.
-- Creates tables, constraints, triggers, views, RLS policies, and the
-- is_admin() helper. Run with `npx supabase db reset` (local) or
-- `npx supabase db push` (remote).

-- ============================================================================
-- Tables
-- ============================================================================

create table if not exists public.specializations (
  id         smallserial primary key,
  code       text unique not null,
  name       text not null,
  study_id   text
);

create table if not exists public.courses (
  id             uuid primary key default gen_random_uuid(),
  code           text unique not null,
  title          text not null,
  description    text not null,
  studiegids_url text not null,
  color          text not null default '#001158',
  icon           text not null default 'book-open',
  ec             smallint not null default 6,
  created_at     timestamptz not null default now()
);
create index if not exists courses_title_lower_idx on public.courses (lower(title));

create table if not exists public.course_specializations (
  course_id         uuid not null references public.courses(id) on delete cascade,
  specialization_id smallint not null references public.specializations(id) on delete cascade,
  role              text not null check (role in ('core', 'elective')),
  primary key (course_id, specialization_id)
);

create table if not exists public.reviews (
  id             uuid primary key default gen_random_uuid(),
  course_id      uuid not null references public.courses(id) on delete cascade,
  author_id      uuid not null references auth.users(id) on delete cascade,
  title          text not null check (char_length(title) between 3 and 120),
  body           text not null check (char_length(body) between 10 and 4000),
  rating         smallint not null check (rating between 1 and 5),
  difficulty     smallint not null check (difficulty between 1 and 5),
  workload_hours smallint not null check (workload_hours between 1 and 80),
  created_at     timestamptz not null default now(),
  unique (course_id, author_id)
);
create index if not exists reviews_course_created_idx on public.reviews (course_id, created_at desc);

create table if not exists public.admins (
  email      text primary key,
  created_at timestamptz not null default now()
);

-- ============================================================================
-- Helper functions
-- ============================================================================

create or replace function public.is_admin() returns boolean
language sql stable security definer
set search_path = public, auth
as $$
  select exists (
    select 1
    from public.admins a
    join auth.users u on lower(u.email) = lower(a.email)
    where u.id = auth.uid()
  );
$$;

grant execute on function public.is_admin() to anon, authenticated;

-- ============================================================================
-- Domain restriction trigger
-- Reject any signup or email change that is not @umail.leidenuniv.nl.
-- ============================================================================

create or replace function public.enforce_leiden_domain()
returns trigger language plpgsql security definer
set search_path = public, auth
as $$
begin
  if new.email is null or new.email !~* '@umail\.leidenuniv\.nl$' then
    raise exception 'Only @umail.leidenuniv.nl addresses are allowed.'
      using errcode = '22000';
  end if;
  return new;
end;
$$;

drop trigger if exists enforce_leiden_domain_before_insert on auth.users;
create trigger enforce_leiden_domain_before_insert
  before insert on auth.users
  for each row execute function public.enforce_leiden_domain();

drop trigger if exists enforce_leiden_domain_before_update on auth.users;
create trigger enforce_leiden_domain_before_update
  before update of email on auth.users
  for each row execute function public.enforce_leiden_domain();

-- ============================================================================
-- Views
-- Public read-only aggregates and sanitised review view (no author_id).
-- ============================================================================

create or replace view public.courses_with_stats as
select c.id,
       c.code,
       c.title,
       c.description,
       c.studiegids_url,
       c.color,
       c.icon,
       c.ec,
       c.created_at,
       coalesce(avg(r.rating), 0)::numeric(3, 2)         as avg_rating,
       coalesce(avg(r.difficulty), 0)::numeric(3, 2)     as avg_difficulty,
       coalesce(avg(r.workload_hours), 0)::numeric(4, 1) as avg_workload,
       count(r.id)                                       as review_count
from public.courses c
left join public.reviews r on r.course_id = c.id
group by c.id;

create or replace view public.reviews_public as
select id, course_id, title, body, rating, difficulty, workload_hours, created_at
from public.reviews;

grant select on public.courses_with_stats to anon, authenticated;
grant select on public.reviews_public to anon, authenticated;

-- Views run with their owner's privileges so anon can read aggregated stats
-- and the sanitised review columns even though the base reviews table denies
-- anon SELECTs. Privacy is enforced by the explicit column list of each view
-- (author_id is never exposed).
alter view public.courses_with_stats set (security_invoker = off);
alter view public.reviews_public set (security_invoker = off);

-- ============================================================================
-- Row Level Security
-- ============================================================================

alter table public.specializations enable row level security;
alter table public.courses enable row level security;
alter table public.course_specializations enable row level security;
alter table public.reviews enable row level security;
alter table public.admins enable row level security;

-- Specializations: public read, admin write.
drop policy if exists "specializations readable by all" on public.specializations;
create policy "specializations readable by all"
  on public.specializations for select
  using (true);

drop policy if exists "specializations admin write" on public.specializations;
create policy "specializations admin write"
  on public.specializations for all
  using (public.is_admin()) with check (public.is_admin());

-- Courses: public read, admin write.
drop policy if exists "courses readable by all" on public.courses;
create policy "courses readable by all"
  on public.courses for select
  using (true);

drop policy if exists "courses admin write" on public.courses;
create policy "courses admin write"
  on public.courses for all
  using (public.is_admin()) with check (public.is_admin());

-- Join table: public read, admin write.
drop policy if exists "course_specializations readable by all" on public.course_specializations;
create policy "course_specializations readable by all"
  on public.course_specializations for select
  using (true);

drop policy if exists "course_specializations admin write" on public.course_specializations;
create policy "course_specializations admin write"
  on public.course_specializations for all
  using (public.is_admin()) with check (public.is_admin());

-- Reviews base table: author can read own, admin can read all, author can insert
-- for self, only admin can delete. No public select (use reviews_public view).
drop policy if exists "reviews select admin or author" on public.reviews;
create policy "reviews select admin or author"
  on public.reviews for select
  using (public.is_admin() or author_id = auth.uid());

drop policy if exists "reviews insert by author" on public.reviews;
create policy "reviews insert by author"
  on public.reviews for insert
  with check (auth.uid() = author_id);

drop policy if exists "reviews delete by admin" on public.reviews;
create policy "reviews delete by admin"
  on public.reviews for delete
  using (public.is_admin());

-- Admins: only admins can read or write.
drop policy if exists "admins admin read" on public.admins;
create policy "admins admin read"
  on public.admins for select
  using (public.is_admin());

drop policy if exists "admins admin write" on public.admins;
create policy "admins admin write"
  on public.admins for all
  using (public.is_admin()) with check (public.is_admin());
