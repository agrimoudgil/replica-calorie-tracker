-- Run after migrations/20261110120000_whatsapp_link.sql. Read-only.
-- Expected: true, true, true, 0, false, false, true.
select
  exists (select 1 from information_schema.columns
           where table_schema = 'public' and table_name = 'meals' and column_name = 'origin') as has_origin,
  exists (select 1 from information_schema.tables where table_schema = 'public' and table_name = 'whatsapp_links') as has_links,
  (select relrowsecurity from pg_class where oid = 'public.whatsapp_link_codes'::regclass) as codes_rls,
  (select count(*)::int from public.meals where origin = 'whatsapp') as whatsapp_meals,
  has_function_privilege('anon', 'public.upsert_whatsapp_meal(uuid, text, timestamptz, jsonb, jsonb)', 'execute') as anon_can_write,
  has_table_privilege('authenticated', 'public.whatsapp_link_codes', 'select') as people_see_codes,
  has_function_privilege('service_role', 'public.delete_whatsapp_meals(uuid, text)', 'execute') as server_can_delete;
