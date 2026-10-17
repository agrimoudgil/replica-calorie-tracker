-- Run after migrations/20261017120000_recipe_rules.sql. Read-only.
-- Expected: new_columns 2, recipes_missing_servings 0, cross_owner_links 0,
--           policy_checks_ingredients true, key_checked_at_end true.
-- cross_owner_links counts recipes that use someone else's private food: links the old
-- policy allowed and the new one refuses. They aren't removed automatically.
select
  (select count(*)::int from information_schema.columns
    where table_schema = 'public' and table_name = 'foods' and column_name in ('recipe_servings', 'cooked_grams')) as new_columns,
  (select count(*)::int from public.foods where is_recipe and recipe_servings is null) as recipes_missing_servings,
  (select count(*)::int from public.recipe_ingredients ri
     join public.foods r on r.id = ri.recipe_id
     join public.foods i on i.id = ri.ingredient_id
    where i.owner_id is not null and i.owner_id <> r.owner_id) as cross_owner_links,
  (select coalesce(bool_or(with_check like '%is_recipe%'), false) from pg_policies
    where schemaname = 'public' and tablename = 'recipe_ingredients' and policyname = 'recipe_ingredients_own') as policy_checks_ingredients,
  (select coalesce(bool_or(condeferred), false) from pg_constraint
    where conrelid = 'public.recipe_ingredients'::regclass and conname = 'recipe_ingredients_ingredient_id_fkey') as key_checked_at_end;
