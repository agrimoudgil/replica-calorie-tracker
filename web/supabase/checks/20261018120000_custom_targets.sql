-- Run after migrations/20261018120000_custom_targets.sql. Read-only.
-- Expected: has_column true, custom_profiles 0 (nobody has set their own targets yet).
select
  exists (select 1 from information_schema.columns
           where table_schema = 'public' and table_name = 'profiles' and column_name = 'targets_custom') as has_column,
  (select count(*)::int from public.profiles where targets_custom) as custom_profiles;
