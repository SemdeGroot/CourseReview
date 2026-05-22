-- Delete reviews older than 3 years and schedule the cleanup daily.

create extension if not exists pg_cron with schema extensions;

create or replace function public.delete_expired_reviews()
returns integer
language plpgsql
security definer
set search_path = public
as $$
declare
  deleted_count integer;
begin
  delete from public.reviews
  where created_at < now() - interval '3 years';

  get diagnostics deleted_count = row_count;
  return deleted_count;
end;
$$;

do $$
declare
  existing_job_id bigint;
begin
  select jobid
  into existing_job_id
  from cron.job
  where jobname = 'delete-expired-reviews';

  if existing_job_id is not null then
    perform cron.unschedule(existing_job_id);
  end if;

  perform cron.schedule(
    'delete-expired-reviews',
    '17 3 * * *',
    'select public.delete_expired_reviews();'
  );
end;
$$;
