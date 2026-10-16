-- Replica calorie tracker: first migration, for a NEW Supabase project (Postgres 15+).
-- Never re-run it on a database that already has these tables; add a new migration instead.
--
-- Access rules: row level security on every table. Each user-owned row has user_id and
-- the policies compare it with auth.uid(). The service role (secret key) bypasses RLS,
-- so server code using it must always filter by user_id itself.
-- Times are timestamptz (UTC). local_date is the user's calendar day, fixed at write time.

create extension if not exists pg_trgm;

-- ---------------------------------------------------------------- helpers

create or replace function public.set_updated_at() returns trigger
language plpgsql set search_path = public as $$
begin
  new.updated_at := now();
  return new;
end $$;

-- Sets local_date from the timestamp column named in the trigger argument,
-- using the owner's profile time zone (India by default).
create or replace function public.set_local_date() returns trigger
language plpgsql set search_path = public as $$
declare
  tz text;
begin
  select timezone into tz from public.profiles where id = new.user_id;
  new.local_date := ((to_jsonb(new) ->> tg_argv[0])::timestamptz
                     at time zone coalesce(tz, 'Asia/Kolkata'))::date;
  return new;
end $$;

-- ---------------------------------------------------------------- profiles
-- A row exists only once onboarding is complete, so its fields are required.

create table public.profiles (
  id uuid primary key references auth.users(id) on delete cascade,
  display_name text check (char_length(display_name) <= 80),
  sex text not null check (sex in ('female', 'male', 'other')),
  birth_year smallint not null check (birth_year between 1900 and 2100),
  height_cm numeric(5,1) not null check (height_cm between 50 and 260),
  weight_kg numeric(5,1) not null check (weight_kg between 20 and 350),
  activity_level text not null check (activity_level in ('sedentary', 'light', 'moderate', 'active', 'very_active')),
  goal text not null check (goal in ('lose', 'maintain', 'gain')),
  diet_type text not null check (diet_type in ('vegetarian', 'eggetarian', 'non_vegetarian', 'vegan', 'jain')),
  daily_kcal_target integer not null check (daily_kcal_target between 800 and 6000),
  protein_g_target integer not null check (protein_g_target between 0 and 500),
  carb_g_target integer not null check (carb_g_target between 0 and 1000),
  fat_g_target integer not null check (fat_g_target between 0 and 400),
  fiber_g_target integer not null check (fiber_g_target between 0 and 150),
  timezone text not null default 'Asia/Kolkata',
  onboarded_at timestamptz not null default now(),
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);
create trigger profiles_updated_at before update on public.profiles
  for each row execute function public.set_updated_at();

-- ---------------------------------------------------------------- foods
-- owner_id null = shared catalogue (written only with the secret key by the seed script);
-- owner_id set = a user's custom food or recipe. Nutrients are per 100 g.
-- Text ids so catalogue rows keep readable ids like 'seed-phulka'; custom foods get uuids.

create table public.foods (
  id text primary key default gen_random_uuid()::text,
  owner_id uuid references auth.users(id) on delete cascade,
  name text not null check (char_length(name) between 1 and 120),
  name_hi text check (char_length(name_hi) <= 120),
  aliases text[] not null default '{}',
  diet_tags text[] not null default '{}',
  is_recipe boolean not null default false,
  unit_grams jsonb not null default '{"g": 1}',
  default_unit text not null default 'g' check (default_unit in ('katori', 'piece', 'glass', 'tbsp', 'g')),
  kcal numeric(7,2) not null check (kcal >= 0),
  protein_g numeric(6,2) not null default 0 check (protein_g >= 0),
  carb_g numeric(6,2) not null default 0 check (carb_g >= 0),
  fat_g numeric(6,2) not null default 0 check (fat_g >= 0),
  fiber_g numeric(6,2) not null default 0 check (fiber_g >= 0),
  sugar_g numeric(6,2) check (sugar_g >= 0),
  sat_fat_g numeric(6,2) check (sat_fat_g >= 0),
  sodium_mg numeric(8,2) check (sodium_mg >= 0),
  calcium_mg numeric(8,2) check (calcium_mg >= 0),
  iron_mg numeric(7,2) check (iron_mg >= 0),
  source text not null check (source in ('usda', 'off', 'ifct', 'ai', 'user')),
  source_ref text,
  verified boolean not null default false,
  search_text text not null default '',
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  constraint shared_foods_have_source check (owner_id is not null or source <> 'user')
);
create index foods_owner_idx on public.foods (owner_id);
create index foods_search_trgm_idx on public.foods using gin (search_text gin_trgm_ops);
create unique index foods_shared_name_uq on public.foods (lower(name)) where owner_id is null;

create or replace function public.set_food_search_text() returns trigger
language plpgsql set search_path = public as $$
begin
  new.search_text := lower(concat_ws(' ', new.name, new.name_hi, array_to_string(new.aliases, ' ')));
  return new;
end $$;
create trigger foods_search_text before insert or update of name, name_hi, aliases on public.foods
  for each row execute function public.set_food_search_text();
create trigger foods_updated_at before update on public.foods
  for each row execute function public.set_updated_at();

create table public.recipe_ingredients (
  id uuid primary key default gen_random_uuid(),
  recipe_id text not null references public.foods(id) on delete cascade,
  ingredient_id text not null references public.foods(id) on delete restrict,
  grams numeric(7,1) not null check (grams > 0),
  created_at timestamptz not null default now(),
  constraint recipe_not_own_ingredient check (recipe_id <> ingredient_id),
  unique (recipe_id, ingredient_id)
);
create index recipe_ingredients_ingredient_idx on public.recipe_ingredients (ingredient_id);

create table public.favourite_foods (
  user_id uuid not null references auth.users(id) on delete cascade,
  food_id text not null references public.foods(id) on delete cascade,
  created_at timestamptz not null default now(),
  primary key (user_id, food_id)
);
create index favourite_foods_food_idx on public.favourite_foods (food_id);

-- ---------------------------------------------------------------- meals
-- A photo or text estimate creates a draft; the user reviews it and saves it.
-- The client sends its own meal id so a retried request cannot create two meals.

create table public.meals (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users(id) on delete cascade,
  status text not null default 'draft' check (status in ('draft', 'saved')),
  meal_type text not null check (meal_type in ('breakfast', 'lunch', 'snack', 'dinner')),
  input_method text not null check (input_method in ('photo', 'voice', 'text', 'search', 'auto')),
  eaten_at timestamptz not null default now(),
  local_date date not null,
  photo_path text,
  raw_text text check (char_length(raw_text) <= 1000),
  health_score smallint check (health_score between 0 and 10),
  ai_model text,
  saved_at timestamptz,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  constraint saved_meals_have_saved_at check (status = 'draft' or saved_at is not null),
  constraint photo_meals_have_photo check (input_method <> 'photo' or photo_path is not null),
  unique (id, user_id)
);
create index meals_user_day_idx on public.meals (user_id, local_date desc, eaten_at) where status = 'saved';
create index meals_drafts_idx on public.meals (created_at) where status = 'draft';
create trigger meals_local_date before insert or update of eaten_at, user_id on public.meals
  for each row execute function public.set_local_date('eaten_at');
create trigger meals_updated_at before update on public.meals
  for each row execute function public.set_updated_at();

-- Nutrients here are absolute amounts for the eaten portion, copied at save time,
-- so later catalogue edits never change a meal already eaten.
-- The composite key makes the database refuse an item whose user differs from its meal's.
create table public.meal_items (
  id uuid primary key default gen_random_uuid(),
  meal_id uuid not null,
  user_id uuid not null references auth.users(id) on delete cascade,
  food_id text references public.foods(id) on delete set null,
  position smallint not null default 0,
  name text not null check (char_length(name) between 1 and 120),
  name_hi text check (char_length(name_hi) <= 120),
  quantity numeric(7,2) not null check (quantity > 0 and quantity <= 3000),
  unit text not null check (unit in ('katori', 'piece', 'glass', 'tbsp', 'g')),
  grams numeric(7,1) not null check (grams > 0 and grams <= 3000),
  kcal numeric(7,1) not null check (kcal >= 0),
  protein_g numeric(6,1) not null default 0 check (protein_g >= 0),
  carb_g numeric(6,1) not null default 0 check (carb_g >= 0),
  fat_g numeric(6,1) not null default 0 check (fat_g >= 0),
  fiber_g numeric(6,1) not null default 0 check (fiber_g >= 0),
  sugar_g numeric(6,1) check (sugar_g >= 0),
  sat_fat_g numeric(6,1) check (sat_fat_g >= 0),
  sodium_mg numeric(8,1) check (sodium_mg >= 0),
  calcium_mg numeric(8,1) check (calcium_mg >= 0),
  iron_mg numeric(7,2) check (iron_mg >= 0),
  source text not null check (source in ('ai', 'db', 'user')),
  ai_confidence text check (ai_confidence in ('high', 'medium', 'low')),
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  foreign key (meal_id, user_id) references public.meals(id, user_id) on delete cascade
);
create index meal_items_meal_idx on public.meal_items (meal_id, position);
create index meal_items_user_idx on public.meal_items (user_id);
create index meal_items_food_idx on public.meal_items (food_id);
create trigger meal_items_updated_at before update on public.meal_items
  for each row execute function public.set_updated_at();

-- Daily totals for the dashboard and insights. security_invoker applies the caller's RLS.
create view public.daily_totals with (security_invoker = true) as
select m.user_id,
       m.local_date,
       count(distinct m.id) as meal_count,
       coalesce(sum(i.kcal), 0) as kcal,
       coalesce(sum(i.protein_g), 0) as protein_g,
       coalesce(sum(i.carb_g), 0) as carb_g,
       coalesce(sum(i.fat_g), 0) as fat_g,
       coalesce(sum(i.fiber_g), 0) as fiber_g,
       sum(i.sugar_g) as sugar_g,
       sum(i.sat_fat_g) as sat_fat_g,
       sum(i.sodium_mg) as sodium_mg,
       sum(i.calcium_mg) as calcium_mg,
       sum(i.iron_mg) as iron_mg
from public.meals m
left join public.meal_items i on i.meal_id = m.id
where m.status = 'saved'
group by m.user_id, m.local_date;

-- ---------------------------------------------------------------- body and water

create table public.water_logs (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users(id) on delete cascade,
  logged_at timestamptz not null default now(),
  local_date date not null,
  ml integer not null check (ml between 1 and 5000),
  created_at timestamptz not null default now()
);
create index water_logs_user_day_idx on public.water_logs (user_id, local_date);
create trigger water_logs_local_date before insert or update of logged_at, user_id on public.water_logs
  for each row execute function public.set_local_date('logged_at');

create table public.weight_logs (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users(id) on delete cascade,
  logged_at timestamptz not null default now(),
  local_date date not null,
  weight_kg numeric(5,1) not null check (weight_kg between 20 and 350),
  created_at timestamptz not null default now(),
  unique (user_id, local_date)
);
create trigger weight_logs_local_date before insert or update of logged_at, user_id on public.weight_logs
  for each row execute function public.set_local_date('logged_at');

-- ---------------------------------------------------------------- insights and chat

create table public.insights (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users(id) on delete cascade,
  kind text not null check (kind in ('weekly', 'next_meal')),
  period_start date not null,
  period_end date not null,
  body jsonb not null,
  ai_model text,
  created_at timestamptz not null default now(),
  constraint insight_period_order check (period_end >= period_start),
  unique (user_id, kind, period_start)
);

create table public.chat_messages (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users(id) on delete cascade,
  role text not null check (role in ('user', 'assistant')),
  content text not null check (char_length(content) between 1 and 8000),
  created_at timestamptz not null default now()
);
create index chat_messages_user_time_idx on public.chat_messages (user_id, created_at);

-- AI calls per user, for the daily free quota and cost tracking.
-- Written only by the server with the secret key; users may read their own rows.
create table public.ai_usage (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users(id) on delete cascade,
  kind text not null check (kind in ('photo', 'text', 'insight', 'next_meal', 'chat')),
  model text not null,
  input_tokens integer not null default 0 check (input_tokens >= 0),
  output_tokens integer not null default 0 check (output_tokens >= 0),
  created_at timestamptz not null default now()
);
create index ai_usage_user_time_idx on public.ai_usage (user_id, created_at);

-- ---------------------------------------------------------------- reminders

create table public.reminders (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users(id) on delete cascade,
  kind text not null check (kind in ('log_meal', 'water', 'weigh_in')),
  local_time time not null,
  enabled boolean not null default true,
  last_sent_at timestamptz,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  unique (user_id, kind, local_time)
);
create index reminders_due_idx on public.reminders (local_time) where enabled;
create trigger reminders_updated_at before update on public.reminders
  for each row execute function public.set_updated_at();

create table public.push_subscriptions (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users(id) on delete cascade,
  endpoint text not null unique,
  p256dh text not null,
  auth text not null,
  created_at timestamptz not null default now()
);
create index push_subscriptions_user_idx on public.push_subscriptions (user_id);

-- ---------------------------------------------------------------- meal functions
-- Both run as the caller (security invoker), so RLS still applies inside them.
-- Items are a JSON array of objects with the meal_items column names.

create or replace function public.insert_meal_items(p_meal_id uuid, p_user_id uuid, p_items jsonb)
returns void language sql security invoker set search_path = public as $$
  insert into public.meal_items (
    id, meal_id, user_id, food_id, position, name, name_hi, quantity, unit, grams,
    kcal, protein_g, carb_g, fat_g, fiber_g, sugar_g, sat_fat_g, sodium_mg, calcium_mg, iron_mg,
    source, ai_confidence)
  select coalesce((e.item ->> 'id')::uuid, gen_random_uuid()), p_meal_id, p_user_id,
         e.item ->> 'food_id', (e.ord - 1)::smallint, e.item ->> 'name', e.item ->> 'name_hi',
         (e.item ->> 'quantity')::numeric, e.item ->> 'unit', (e.item ->> 'grams')::numeric,
         (e.item ->> 'kcal')::numeric, (e.item ->> 'protein_g')::numeric, (e.item ->> 'carb_g')::numeric,
         (e.item ->> 'fat_g')::numeric, (e.item ->> 'fiber_g')::numeric, (e.item ->> 'sugar_g')::numeric,
         (e.item ->> 'sat_fat_g')::numeric, (e.item ->> 'sodium_mg')::numeric, (e.item ->> 'calcium_mg')::numeric,
         (e.item ->> 'iron_mg')::numeric, e.item ->> 'source', e.item ->> 'ai_confidence'
  from jsonb_array_elements(p_items) with ordinality as e(item, ord);
$$;

-- Creates a draft meal and its items in one transaction. Retrying with the same id
-- returns the existing meal; an id that belongs to someone else is refused.
create or replace function public.create_draft_meal(p_meal jsonb, p_items jsonb)
returns uuid language plpgsql security invoker set search_path = public as $$
declare
  v_user uuid := auth.uid();
  v_id uuid := (p_meal ->> 'id')::uuid;
begin
  if v_user is null then
    raise exception 'not signed in' using errcode = '28000';
  end if;
  if jsonb_typeof(p_items) <> 'array' or jsonb_array_length(p_items) = 0 then
    raise exception 'a meal needs at least one item' using errcode = '22023';
  end if;

  insert into public.meals (id, user_id, meal_type, input_method, eaten_at, photo_path, raw_text, ai_model, health_score)
  values (v_id, v_user, p_meal ->> 'meal_type', p_meal ->> 'input_method', (p_meal ->> 'eaten_at')::timestamptz,
          p_meal ->> 'photo_path', p_meal ->> 'raw_text', p_meal ->> 'ai_model', (p_meal ->> 'health_score')::smallint)
  on conflict (id) do nothing;

  if not found then
    if exists (select 1 from public.meals where id = v_id and user_id = v_user) then
      return v_id;
    end if;
    raise exception 'meal id already used' using errcode = '23505';
  end if;

  perform public.insert_meal_items(v_id, v_user, p_items);
  return v_id;
end $$;

-- Replaces a meal's items and marks it saved, in one transaction. The row lock
-- stops two saves interleaving; a stale p_expected_updated_at is refused.
create or replace function public.save_meal(
  p_meal_id uuid,
  p_meal_type text,
  p_health_score smallint,
  p_items jsonb,
  p_expected_updated_at timestamptz default null)
returns void language plpgsql security invoker set search_path = public as $$
declare
  v_user uuid := auth.uid();
  v_updated timestamptz;
begin
  if v_user is null then
    raise exception 'not signed in' using errcode = '28000';
  end if;
  if jsonb_typeof(p_items) <> 'array' or jsonb_array_length(p_items) = 0 then
    raise exception 'a meal needs at least one item' using errcode = '22023';
  end if;

  select updated_at into v_updated from public.meals
  where id = p_meal_id and user_id = v_user
  for update;
  if not found then
    raise exception 'meal not found' using errcode = 'P0002';
  end if;
  if p_expected_updated_at is not null and v_updated <> p_expected_updated_at then
    raise exception 'meal changed since it was loaded' using errcode = '40001';
  end if;

  delete from public.meal_items where meal_id = p_meal_id;
  perform public.insert_meal_items(p_meal_id, v_user, p_items);
  update public.meals
     set status = 'saved', meal_type = p_meal_type, health_score = p_health_score,
         saved_at = coalesce(saved_at, now())
   where id = p_meal_id;
end $$;

revoke all on function public.insert_meal_items(uuid, uuid, jsonb) from public, anon;
revoke all on function public.create_draft_meal(jsonb, jsonb) from public, anon;
revoke all on function public.save_meal(uuid, text, smallint, jsonb, timestamptz) from public, anon;
grant execute on function public.insert_meal_items(uuid, uuid, jsonb) to authenticated;
grant execute on function public.create_draft_meal(jsonb, jsonb) to authenticated;
grant execute on function public.save_meal(uuid, text, smallint, jsonb, timestamptz) to authenticated;

-- ---------------------------------------------------------------- grants and RLS
-- Signed-out visitors (anon) get nothing. Signed-in users get table access, and RLS
-- decides which rows. Read-only tables get read-only grants.

revoke all on all tables in schema public from anon;
-- Tables and functions added by later migrations start closed to signed-out visitors too.
alter default privileges in schema public revoke all on tables from anon;
alter default privileges in schema public revoke execute on functions from anon, public;
revoke insert, update, delete, truncate on public.insights, public.ai_usage, public.daily_totals from authenticated;
grant select, insert, update, delete on
  public.profiles, public.foods, public.recipe_ingredients, public.favourite_foods,
  public.meals, public.meal_items, public.water_logs, public.weight_logs,
  public.chat_messages, public.reminders, public.push_subscriptions
  to authenticated;
grant select on public.insights, public.ai_usage, public.daily_totals to authenticated;

alter table public.profiles enable row level security;
alter table public.foods enable row level security;
alter table public.recipe_ingredients enable row level security;
alter table public.favourite_foods enable row level security;
alter table public.meals enable row level security;
alter table public.meal_items enable row level security;
alter table public.water_logs enable row level security;
alter table public.weight_logs enable row level security;
alter table public.insights enable row level security;
alter table public.chat_messages enable row level security;
alter table public.ai_usage enable row level security;
alter table public.reminders enable row level security;
alter table public.push_subscriptions enable row level security;

create policy profiles_own on public.profiles for all to authenticated
  using (id = (select auth.uid())) with check (id = (select auth.uid()));

create policy foods_read on public.foods for select to authenticated
  using (owner_id is null or owner_id = (select auth.uid()));
create policy foods_insert_own on public.foods for insert to authenticated
  with check (owner_id = (select auth.uid()) and source = 'user');
create policy foods_update_own on public.foods for update to authenticated
  using (owner_id = (select auth.uid())) with check (owner_id = (select auth.uid()) and source = 'user');
create policy foods_delete_own on public.foods for delete to authenticated
  using (owner_id = (select auth.uid()));

create policy recipe_ingredients_own on public.recipe_ingredients for all to authenticated
  using (exists (select 1 from public.foods f where f.id = recipe_id and f.owner_id = (select auth.uid())))
  with check (exists (select 1 from public.foods f where f.id = recipe_id and f.owner_id = (select auth.uid())));

create policy favourite_foods_own on public.favourite_foods for all to authenticated
  using (user_id = (select auth.uid())) with check (user_id = (select auth.uid()));
create policy meals_own on public.meals for all to authenticated
  using (user_id = (select auth.uid())) with check (user_id = (select auth.uid()));
create policy meal_items_own on public.meal_items for all to authenticated
  using (user_id = (select auth.uid())) with check (user_id = (select auth.uid()));
create policy water_logs_own on public.water_logs for all to authenticated
  using (user_id = (select auth.uid())) with check (user_id = (select auth.uid()));
create policy weight_logs_own on public.weight_logs for all to authenticated
  using (user_id = (select auth.uid())) with check (user_id = (select auth.uid()));
create policy chat_messages_own on public.chat_messages for all to authenticated
  using (user_id = (select auth.uid())) with check (user_id = (select auth.uid()));
create policy reminders_own on public.reminders for all to authenticated
  using (user_id = (select auth.uid())) with check (user_id = (select auth.uid()));
create policy push_subscriptions_own on public.push_subscriptions for all to authenticated
  using (user_id = (select auth.uid())) with check (user_id = (select auth.uid()));

create policy insights_read_own on public.insights for select to authenticated
  using (user_id = (select auth.uid()));
create policy ai_usage_read_own on public.ai_usage for select to authenticated
  using (user_id = (select auth.uid()));

-- ---------------------------------------------------------------- photo storage
-- Private bucket, 2 MB and image types only. Objects live under "<user_id>/<meal_id>.jpg".

insert into storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
values ('meal-photos', 'meal-photos', false, 2097152, array['image/jpeg', 'image/png', 'image/webp'])
on conflict (id) do nothing;

create policy meal_photos_read_own on storage.objects for select to authenticated
  using (bucket_id = 'meal-photos' and (storage.foldername(name))[1] = (select auth.uid())::text);
create policy meal_photos_insert_own on storage.objects for insert to authenticated
  with check (bucket_id = 'meal-photos' and (storage.foldername(name))[1] = (select auth.uid())::text);
create policy meal_photos_update_own on storage.objects for update to authenticated
  using (bucket_id = 'meal-photos' and (storage.foldername(name))[1] = (select auth.uid())::text)
  with check (bucket_id = 'meal-photos' and (storage.foldername(name))[1] = (select auth.uid())::text);
create policy meal_photos_delete_own on storage.objects for delete to authenticated
  using (bucket_id = 'meal-photos' and (storage.foldername(name))[1] = (select auth.uid())::text);
