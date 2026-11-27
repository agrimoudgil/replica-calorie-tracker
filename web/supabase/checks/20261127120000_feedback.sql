-- Run after migrations/20261127120000_feedback.sql. Read-only.
-- Expected: true, true, false, true, true.
select
  to_regclass('public.feedback') is not null as has_table,
  (select relrowsecurity from pg_class where oid = 'public.feedback'::regclass) as row_security,
  has_table_privilege('anon', 'public.feedback', 'select') as visitors_can_read,
  has_table_privilege('authenticated', 'public.feedback', 'insert') as people_can_send,
  exists (select 1 from pg_trigger where tgrelid = 'public.feedback'::regclass and tgname = 'feedback_daily_limit') as daily_limit;
