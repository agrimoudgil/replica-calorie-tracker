-- Recipes, part 2 (2026-10-17). Safe to run more than once.
--
-- 1. A recipe's servings and cooked weight get real columns. Until now they were JSON in
--    foods.source_ref; existing recipes are copied over and source_ref is cleared.
-- 2. An ingredient must be a food the recipe's owner can see (shared, or their own), and
--    not a recipe itself; ingredients can only hang off a recipe. The old policy checked
--    only the recipe, and foreign keys ignore RLS, so a direct API call could link someone
--    else's private food (and so stop them deleting it).
-- 3. The ingredient key is checked when the transaction ends (deferred NO ACTION) instead of
--    straight away (RESTRICT). Deleting an account then removes recipes and their owner's
--    own ingredients in any order; before, it failed about two times in three. Deleting a
--    food that a recipe still uses is still refused.

begin;

-- 1 ---------------------------------------------------------------- recipe columns

alter table public.foods
  add column if not exists recipe_servings numeric check (recipe_servings > 0 and recipe_servings <= 50),
  add column if not exists cooked_grams numeric check (cooked_grams >= 1 and cooked_grams <= 50000);

-- Reads one number out of the old JSON; anything unreadable or out of range gives null.
create or replace function pg_temp.meta_number(ref text, key text, lo numeric, hi numeric) returns numeric
language plpgsql as $$
declare v numeric;
begin
  v := (ref::jsonb ->> key)::numeric;
  return case when v >= lo and v <= hi then v end;
exception when others then
  return null;
end $$;

update public.foods
   set recipe_servings = coalesce(recipe_servings, pg_temp.meta_number(source_ref, 'servings', 0.01, 50), 1),
       cooked_grams = coalesce(cooked_grams, pg_temp.meta_number(source_ref, 'cookedGrams', 1, 50000)),
       source_ref = null
 where is_recipe and (recipe_servings is null or source_ref is not null);

alter table public.foods drop constraint if exists recipe_columns_only_on_recipes;
alter table public.foods add constraint recipe_columns_only_on_recipes check (
  case when is_recipe then recipe_servings is not null
       else recipe_servings is null and cooked_grams is null end);

-- 2 ---------------------------------------------------------------- ingredient policy

drop policy if exists recipe_ingredients_own on public.recipe_ingredients;
create policy recipe_ingredients_own on public.recipe_ingredients for all to authenticated
  using (exists (select 1 from public.foods r where r.id = recipe_id and r.owner_id = (select auth.uid())))
  with check (
    exists (select 1 from public.foods r
             where r.id = recipe_id and r.owner_id = (select auth.uid()) and r.is_recipe)
    and exists (select 1 from public.foods i
                 where i.id = ingredient_id and not i.is_recipe
                   and (i.owner_id is null or i.owner_id = (select auth.uid()))));

-- 3 ---------------------------------------------------------------- ingredient key

-- Drop the ingredient key whatever it's called, then add it back deferred.
do $$
declare c text;
begin
  for c in
    select con.conname
      from pg_constraint con
      join pg_attribute a on a.attrelid = con.conrelid and a.attnum = any (con.conkey)
     where con.conrelid = 'public.recipe_ingredients'::regclass and con.contype = 'f' and a.attname = 'ingredient_id'
  loop
    execute format('alter table public.recipe_ingredients drop constraint %I', c);
  end loop;
end $$;

alter table public.recipe_ingredients
  add constraint recipe_ingredients_ingredient_id_fkey foreign key (ingredient_id)
  references public.foods(id) on delete no action deferrable initially deferred;

commit;
