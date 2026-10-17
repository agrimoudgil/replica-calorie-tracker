-- Your own targets (Goals & budgets, 2026-10-18). Safe to run more than once.
--
-- true: the person set their calorie and macro targets themselves, so saving body
-- details no longer recomputes them. "Use suggested targets" sets it back to false.
-- The target columns themselves already exist on profiles.

alter table public.profiles
  add column if not exists targets_custom boolean not null default false;
