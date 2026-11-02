-- =====================================================================
-- Migration 004 — optional deadline on tasks
-- Run once in Supabase Dashboard → SQL Editor (safe to run again).
-- =====================================================================

-- Deadline set by the admin. Past it and not completed = overdue (shown in red).
alter table public.tasks add column if not exists due_date date;

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
    or new.due_date       is distinct from old.due_date
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
