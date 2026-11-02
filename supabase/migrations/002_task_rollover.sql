-- =====================================================================
-- Migration 002 — roll unfinished tasks over to the next day
-- Run once in Supabase Dashboard → SQL Editor (safe to run again).
-- Already included in schema.sql for fresh installs.
-- =====================================================================

-- The task-protection trigger would block these backfills; keep it off meanwhile.
alter table public.tasks disable trigger mt_tasks_guard_update;

-- Where a task was first scheduled, and how many days it has been carried.
alter table public.tasks add column if not exists original_date date;
alter table public.tasks add column if not exists carried_days integer not null default 0;
alter table public.tasks add column if not exists rolls_over boolean not null default true;
update public.tasks set original_date = task_date where original_date is null;

-- Rollover starts today: unfinished tasks from before today stay where they
-- are as history instead of all piling onto today.
update public.tasks
   set rolls_over = false
 where task_date < (now() at time zone 'Asia/Karachi')::date
   and status <> 'completed'
   and carried_days = 0;

-- Members may only change status + comment on their own tasks.
-- The rollover function sets mt.rollover so it may move dates.
create or replace function public.mt_guard_task_update()
returns trigger
language plpgsql
security definer
set search_path = public
as $$
begin
  if not public.mt_is_admin() and coalesce(current_setting('mt.rollover', true), '') <> 'on' then
    if new.title          is distinct from old.title
    or new.description    is distinct from old.description
    or new.assigned_to    is distinct from old.assigned_to
    or new.assigned_by    is distinct from old.assigned_by
    or new.task_date      is distinct from old.task_date
    or new.original_date  is distinct from old.original_date
    or new.carried_days   is distinct from old.carried_days
    or new.rolls_over     is distinct from old.rolls_over
    or new.priority       is distinct from old.priority
    or new.created_at     is distinct from old.created_at then
      raise exception 'Members can only update status and comment';
    end if;
  end if;

  new.updated_at := now();
  if new.status = 'completed' and old.status is distinct from 'completed' then
    new.completed_at := now();
  elsif new.status <> 'completed' then
    new.completed_at := null;
  end if;
  return new;
end;
$$;

-- Move every unfinished task dated before p_today onto p_today.
-- Returns how many tasks moved. Only the server (service role) may call it.
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

alter table public.tasks enable trigger mt_tasks_guard_update;
