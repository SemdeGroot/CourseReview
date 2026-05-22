alter table public.courses
add column if not exists offered_semesters text[] not null default '{}';

alter table public.courses
drop constraint if exists courses_offered_semesters_valid;

alter table public.courses
add constraint courses_offered_semesters_valid
check (offered_semesters <@ array['S1', 'S2']::text[]);

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
       count(r.id)                                       as review_count,
       c.offered_semesters
from public.courses c
left join public.reviews r on r.course_id = c.id
group by c.id;

grant select on public.courses_with_stats to anon, authenticated;
alter view public.courses_with_stats set (security_invoker = off);
