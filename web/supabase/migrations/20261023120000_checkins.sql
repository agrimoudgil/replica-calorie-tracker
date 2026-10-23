-- Recovery check-ins (2026-10-23). Safe to run more than once.
--
-- One row per person per local day: hours slept last night, and how they feel today,
-- energy and soreness on a 1 to 5 scale (energy 1 very low ... 5 great; soreness
-- 1 none ... 5 very sore). Shown next to that day's calories; never shared.

create table if not exists public.checkins (
  user_id uuid not null references auth.users(id) on delete cascade,
  local_date date not null,
  sleep_hours numeric(3,1) not null check (sleep_hours between 0 and 16),
  energy smallint not null check (energy between 1 and 5),
  soreness smallint not null check (soreness between 1 and 5),
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  primary key (user_id, local_date)
);

drop trigger if exists checkins_updated_at on public.checkins;
create trigger checkins_updated_at before update on public.checkins
  for each row execute function public.set_updated_at();

-- Signed-out visitors get nothing (migration 1 closes new tables to anon by default);
-- signed-in people reach only their own rows.
revoke all on public.checkins from anon;
grant select, insert, update, delete on public.checkins to authenticated;
alter table public.checkins enable row level security;

drop policy if exists checkins_own on public.checkins;
create policy checkins_own on public.checkins for all to authenticated
  using (user_id = (select auth.uid())) with check (user_id = (select auth.uid()));
