-- WhatsApp link (2026-11-10). Safe to run more than once.
--
-- Links one web account to the Oswald WhatsApp tracker by a random link_ref: never a phone
-- number. Meals saved on WhatsApp after linking are copied here as origin 'whatsapp'; WhatsApp
-- is their source (its later corrections overwrite, its UNDO and deletion remove them).
-- Codes, nonces and the write functions are server-only; people see and remove only their own link.

alter table public.meals add column if not exists origin text not null default 'app';
alter table public.meals add column if not exists external_id text;
alter table public.meals add column if not exists source_updated_at timestamptz;
do $$
begin
  if not exists (select 1 from pg_constraint where conname = 'meals_origin_check') then
    alter table public.meals add constraint meals_origin_check check (origin in ('app', 'whatsapp'));
  end if;
  if not exists (select 1 from pg_constraint where conname = 'meals_external_id_check') then
    alter table public.meals add constraint meals_external_id_check check (
      (origin = 'app') = (external_id is null) and (external_id is null or char_length(external_id) between 1 and 64));
  end if;
end $$;
create unique index if not exists meals_external_uq on public.meals (user_id, origin, external_id) where external_id is not null;

create table if not exists public.whatsapp_links (
  user_id uuid primary key references auth.users(id) on delete cascade,
  link_ref uuid not null unique,
  linked_at timestamptz not null default now()
);
create table if not exists public.whatsapp_link_codes (
  code_hash text primary key check (code_hash ~ '^[0-9a-f]{64}$'),
  user_id uuid not null references auth.users(id) on delete cascade,
  expires_at timestamptz not null,
  created_at timestamptz not null default now()
);
create index if not exists whatsapp_link_codes_user on public.whatsapp_link_codes (user_id);
create table if not exists public.integration_nonces (
  nonce uuid primary key,
  seen_at timestamptz not null default now()
);
create index if not exists integration_nonces_seen on public.integration_nonces (seen_at);

revoke all on public.whatsapp_links, public.whatsapp_link_codes, public.integration_nonces from anon, authenticated;
grant select, delete on public.whatsapp_links to authenticated;
alter table public.whatsapp_links enable row level security;
alter table public.whatsapp_link_codes enable row level security;
alter table public.integration_nonces enable row level security;
drop policy if exists whatsapp_links_own on public.whatsapp_links;
create policy whatsapp_links_own on public.whatsapp_links for all to authenticated
  using (user_id = (select auth.uid()));

-- Server-only: creates or replaces one WhatsApp meal for a linked person, newest version wins.
-- Items arrive with nutrients the server computed from its own food list.
create or replace function public.upsert_whatsapp_meal(
  p_user uuid, p_external_id text, p_version timestamptz, p_meal jsonb, p_items jsonb)
returns text language plpgsql security definer set search_path = '' as $$
declare
  existing public.meals%rowtype;
  target uuid;
  updating boolean := false;
begin
  if p_user is null or p_external_id is null or p_version is null or p_meal is null then
    raise exception 'missing arguments' using errcode = '22023';
  end if;
  if jsonb_typeof(p_items) is distinct from 'array' or jsonb_array_length(p_items) not between 1 and 12 then
    raise exception 'between 1 and 12 items' using errcode = '22023';
  end if;
  perform pg_catalog.pg_advisory_xact_lock(pg_catalog.hashtextextended('whatsapp:' || p_user::text || ':' || p_external_id, 0));
  select * into existing from public.meals
    where user_id = p_user and origin = 'whatsapp' and external_id = p_external_id for update;
  if found then
    if existing.source_updated_at is not null and existing.source_updated_at >= p_version then
      return 'stale';
    end if;
    updating := true;
    target := existing.id;
    delete from public.meal_items where meal_id = target and user_id = p_user;
    update public.meals set meal_type = p_meal->>'meal_type', eaten_at = (p_meal->>'eaten_at')::timestamptz,
      raw_text = p_meal->>'raw_text', health_score = (p_meal->>'health_score')::numeric,
      source_updated_at = p_version, updated_at = now()
      where id = target and user_id = p_user;
  else
    target := gen_random_uuid();
    insert into public.meals (id, user_id, status, meal_type, input_method, eaten_at, raw_text, health_score,
      saved_at, origin, external_id, source_updated_at)
    values (target, p_user, 'saved', p_meal->>'meal_type', 'text', (p_meal->>'eaten_at')::timestamptz, p_meal->>'raw_text',
      (p_meal->>'health_score')::numeric, now(), 'whatsapp', p_external_id, p_version);
  end if;
  insert into public.meal_items (meal_id, user_id, position, food_id, name, quantity, unit, grams,
    kcal, protein_g, carb_g, fat_g, fiber_g, sugar_g, sat_fat_g, sodium_mg, calcium_mg, iron_mg, source)
  select target, p_user, (t.ord - 1)::smallint, t.i->>'food_id', t.i->>'name', (t.i->>'quantity')::numeric, t.i->>'unit',
    (t.i->>'grams')::numeric, (t.i->>'kcal')::numeric, (t.i->>'protein_g')::numeric, (t.i->>'carb_g')::numeric,
    (t.i->>'fat_g')::numeric, (t.i->>'fiber_g')::numeric, (t.i->>'sugar_g')::numeric, (t.i->>'sat_fat_g')::numeric,
    (t.i->>'sodium_mg')::numeric, (t.i->>'calcium_mg')::numeric, (t.i->>'iron_mg')::numeric, t.i->>'source'
  from jsonb_array_elements(p_items) with ordinality as t(i, ord);
  return case when updating then 'updated' else 'created' end;
end;
$$;

-- Server-only: removes one WhatsApp meal, or all of them when p_external_id is null.
create or replace function public.delete_whatsapp_meals(p_user uuid, p_external_id text)
returns integer language plpgsql security definer set search_path = '' as $$
declare n integer;
begin
  if p_user is null then raise exception 'missing user' using errcode = '22023'; end if;
  delete from public.meals
    where user_id = p_user and origin = 'whatsapp' and (p_external_id is null or external_id = p_external_id);
  get diagnostics n = row_count;
  return n;
end;
$$;

revoke all on function public.upsert_whatsapp_meal(uuid, text, timestamptz, jsonb, jsonb) from public, anon, authenticated;
revoke all on function public.delete_whatsapp_meals(uuid, text) from public, anon, authenticated;
grant execute on function public.upsert_whatsapp_meal(uuid, text, timestamptz, jsonb, jsonb) to service_role;
grant execute on function public.delete_whatsapp_meals(uuid, text) to service_role;
