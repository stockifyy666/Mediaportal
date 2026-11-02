-- =====================================================================
-- Migration 003 — roll over pre-existing unfinished tasks, without duplicates
-- Run once in Supabase Dashboard → SQL Editor.
-- =====================================================================

-- 1. Rollover skips a task when the same member already has a task with the
--    same title (ignoring case and extra spaces) on the target day — e.g. an
--    admin re-assigned it by hand. The skipped copy stays where it is.
create or replace function public.mt_rollover_tasks(p_today date)
returns integer
language plpgsql
security definer
set search_path = public
as $$
declare
  moved integer;
begin
  perform set_config('mt.rollover', 'on', true);

  -- Leave behind any task whose title is already on the member's list for p_today,
  -- and all but the newest of several identical unfinished tasks.
  update public.tasks t
     set rolls_over = false
   where t.task_date < p_today
     and t.status <> 'completed'
     and t.rolls_over
     and (
       exists (
         select 1 from public.tasks x
          where x.assigned_to = t.assigned_to
            and x.task_date = p_today
            and lower(regexp_replace(trim(x.title), '\s+', ' ', 'g'))
              = lower(regexp_replace(trim(t.title), '\s+', ' ', 'g'))
       )
       or exists (
         select 1 from public.tasks y
          where y.assigned_to = t.assigned_to
            and y.id <> t.id
            and y.task_date < p_today
            and y.status <> 'completed'
            and y.rolls_over
            and lower(regexp_replace(trim(y.title), '\s+', ' ', 'g'))
              = lower(regexp_replace(trim(t.title), '\s+', ' ', 'g'))
            and (y.task_date, y.created_at) > (t.task_date, t.created_at)
       )
     );

  update public.tasks
     set original_date = coalesce(original_date, task_date),
         carried_days  = carried_days + (p_today - task_date),
         task_date     = p_today
   where task_date < p_today
     and status <> 'completed'
     and rolls_over;
  get diagnostics moved = row_count;

  perform set_config('mt.rollover', 'off', true);
  return moved;
end;
$$;

revoke all on function public.mt_rollover_tasks(date) from public, anon, authenticated;
grant execute on function public.mt_rollover_tasks(date) to service_role;

-- 2. One-time: let the unfinished tasks from before rollover started roll too.
--    (The function above keeps just one copy of each repeated task.)
alter table public.tasks disable trigger mt_tasks_guard_update;
update public.tasks
   set rolls_over = true
 where status <> 'completed'
   and rolls_over = false
   and carried_days = 0;
alter table public.tasks enable trigger mt_tasks_guard_update;

-- 3. Roll them onto today now (Pakistan time), instead of waiting for the app.
select public.mt_rollover_tasks((now() at time zone 'Asia/Karachi')::date) as tasks_moved;
