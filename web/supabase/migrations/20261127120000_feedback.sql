-- Feedback (2026-11-27). Safe to run more than once.
--
-- What people tell us about Oswald: a one-time question after their third saved meal, or any time
-- from Profile. How easy logging is (1 to 5), what's missing, and whether they'd rather log on
-- WhatsApp. People add and read only their own; deleting the account deletes it.

create table if not exists public.feedback (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users(id) on delete cascade,
  kind text not null check (kind in ('prompt', 'profile')),
  ease smallint check (ease between 1 and 5),
  missing text check (char_length(missing) between 1 and 1000),
  prefers_whatsapp text check (prefers_whatsapp in ('yes', 'maybe', 'no')),
  dismissed boolean not null default false,
  created_at timestamptz not null default now(),
  -- An answer has at least one part, unless it's "Not now" on the question.
  check (dismissed or ease is not null or missing is not null or prefers_whatsapp is not null)
);
create index if not exists feedback_user_created on public.feedback (user_id, created_at);

revoke all on public.feedback from anon;
grant select, insert on public.feedback to authenticated;
alter table public.feedback enable row level security;
drop policy if exists feedback_own_read on public.feedback;
create policy feedback_own_read on public.feedback for select to authenticated
  using (user_id = (select auth.uid()));
drop policy if exists feedback_own_insert on public.feedback;
create policy feedback_own_insert on public.feedback for insert to authenticated
  with check (user_id = (select auth.uid()));

-- At most 10 a day per person, so a stuck button or a script can't flood the table.
create or replace function public.feedback_daily_limit() returns trigger
language plpgsql security definer set search_path = '' as $$
begin
  if (select count(*) from public.feedback where user_id = new.user_id and created_at > now() - interval '1 day') >= 10 then
    raise exception 'feedback daily limit' using errcode = '23514';
  end if;
  return new;
end;
$$;
revoke all on function public.feedback_daily_limit() from public, anon, authenticated;
drop trigger if exists feedback_daily_limit on public.feedback;
create trigger feedback_daily_limit before insert on public.feedback
  for each row execute function public.feedback_daily_limit();
