-- =====================================================================
-- Media Team Task Platform — Supabase schema
-- Run this whole file once in Supabase Dashboard → SQL Editor.
-- =====================================================================

-- ---------- Types ----------
do $$ begin
  create type public.mt_user_role as enum ('admin', 'member');
exception when duplicate_object then null; end $$;

do $$ begin
  create type public.mt_task_status as enum ('pending', 'in_progress', 'completed', 'blocked');
exception when duplicate_object then null; end $$;

do $$ begin
  create type public.mt_task_priority as enum ('low', 'medium', 'high');
exception when duplicate_object then null; end $$;

-- ---------- Tables ----------
create table if not exists public.profiles (
  id          uuid primary key references auth.users (id) on delete cascade,
  email       text not null,
  full_name   text not null default '',
  designation text not null default '',
  role        public.mt_user_role not null default 'member',
  is_active   boolean not null default true,
  created_at  timestamptz not null default now()
);

create table if not exists public.tasks (
  id             uuid primary key default gen_random_uuid(),
  title          text not null,
  description    text not null default '',
  assigned_to    uuid not null references public.profiles (id) on delete cascade,
  assigned_by    uuid references public.profiles (id) on delete set null,
  task_date      date not null,
  priority       public.mt_task_priority not null default 'medium',
  status         public.mt_task_status not null default 'pending',
  member_comment text not null default '',
  completed_at   timestamptz,
  created_at     timestamptz not null default now(),
  updated_at     timestamptz not null default now()
);
create index if not exists tasks_assigned_date_idx on public.tasks (assigned_to, task_date);
create index if not exists tasks_date_idx on public.tasks (task_date);

-- One closing note per member per day
create table if not exists public.daily_reports (
  id          uuid primary key default gen_random_uuid(),
  user_id     uuid not null references public.profiles (id) on delete cascade,
  report_date date not null,
  note        text not null,
  created_at  timestamptz not null default now(),
  updated_at  timestamptz not null default now(),
  unique (user_id, report_date)
);
create index if not exists daily_reports_user_date_idx on public.daily_reports (user_id, report_date);

-- ---------- Helpers ----------
create or replace function public.mt_is_admin()
returns boolean
language sql
stable
security definer
set search_path = public
as $$
  select exists (
    select 1 from public.profiles
    where id = auth.uid() and role = 'admin' and is_active
  );
$$;

-- Auto-create a profile whenever an auth user is created.
-- There is no public sign-up: accounts are created by the admin in the app.
-- The very first account (created in the Supabase dashboard) becomes the active
-- admin; any other profile starts inactive, and the app activates the accounts
-- it creates straight away.
create or replace function public.mt_handle_new_user()
returns trigger
language plpgsql
security definer
set search_path = public
as $$
declare
  first_user boolean;
begin
  perform pg_advisory_xact_lock(hashtext('mt_handle_new_user'));
  select not exists (select 1 from public.profiles) into first_user;

  insert into public.profiles (id, email, full_name, designation, role, is_active)
  values (
    new.id,
    new.email,
    coalesce(new.raw_user_meta_data ->> 'full_name', ''),
    coalesce(new.raw_user_meta_data ->> 'designation', ''),
    case when first_user then 'admin'::public.mt_user_role else 'member'::public.mt_user_role end,
    first_user
  )
  on conflict (id) do nothing;
  return new;
end;
$$;

drop trigger if exists mt_on_auth_user_created on auth.users;
create trigger mt_on_auth_user_created
  after insert on auth.users
  for each row execute function public.mt_handle_new_user();

-- Members may only change status + comment on their own tasks.
create or replace function public.mt_guard_task_update()
returns trigger
language plpgsql
security definer
set search_path = public
as $$
begin
  if not public.mt_is_admin() then
    if new.title          is distinct from old.title
    or new.description    is distinct from old.description
    or new.assigned_to    is distinct from old.assigned_to
    or new.assigned_by    is distinct from old.assigned_by
    or new.task_date      is distinct from old.task_date
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

drop trigger if exists mt_tasks_guard_update on public.tasks;
create trigger mt_tasks_guard_update
  before update on public.tasks
  for each row execute function public.mt_guard_task_update();

create or replace function public.mt_touch_updated_at()
returns trigger language plpgsql as $$
begin
  new.updated_at := now();
  return new;
end;
$$;

drop trigger if exists mt_daily_reports_touch on public.daily_reports;
create trigger mt_daily_reports_touch
  before update on public.daily_reports
  for each row execute function public.mt_touch_updated_at();

-- ---------- Row Level Security ----------
alter table public.profiles      enable row level security;
alter table public.tasks         enable row level security;
alter table public.daily_reports enable row level security;

-- profiles
drop policy if exists "profiles: read own or admin" on public.profiles;
create policy "profiles: read own or admin" on public.profiles
  for select to authenticated
  using (id = auth.uid() or public.mt_is_admin());

drop policy if exists "profiles: admin update" on public.profiles;
create policy "profiles: admin update" on public.profiles
  for update to authenticated
  using (public.mt_is_admin()) with check (public.mt_is_admin());

-- tasks
drop policy if exists "tasks: read own or admin" on public.tasks;
create policy "tasks: read own or admin" on public.tasks
  for select to authenticated
  using (assigned_to = auth.uid() or public.mt_is_admin());

drop policy if exists "tasks: admin insert" on public.tasks;
create policy "tasks: admin insert" on public.tasks
  for insert to authenticated
  with check (public.mt_is_admin());

drop policy if exists "tasks: update own or admin" on public.tasks;
create policy "tasks: update own or admin" on public.tasks
  for update to authenticated
  using (assigned_to = auth.uid() or public.mt_is_admin())
  with check (assigned_to = auth.uid() or public.mt_is_admin());

drop policy if exists "tasks: admin delete" on public.tasks;
create policy "tasks: admin delete" on public.tasks
  for delete to authenticated
  using (public.mt_is_admin());

-- daily_reports
drop policy if exists "reports: read own or admin" on public.daily_reports;
create policy "reports: read own or admin" on public.daily_reports
  for select to authenticated
  using (user_id = auth.uid() or public.mt_is_admin());

drop policy if exists "reports: insert own" on public.daily_reports;
create policy "reports: insert own" on public.daily_reports
  for insert to authenticated
  with check (user_id = auth.uid());

drop policy if exists "reports: update own" on public.daily_reports;
create policy "reports: update own" on public.daily_reports
  for update to authenticated
  using (user_id = auth.uid()) with check (user_id = auth.uid());
