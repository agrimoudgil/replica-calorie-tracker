-- A stale save now raises SQLSTATE PT409, which PostgREST returns as HTTP 409.
-- The first migration used 40001 (serialization_failure). Clients treat that code as
-- temporary and retry it, so a stale save hung for about two minutes instead of
-- failing at once. Same signature, so existing grants stay.

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
    raise exception 'meal changed since it was loaded' using errcode = 'PT409';
  end if;

  delete from public.meal_items where meal_id = p_meal_id;
  perform public.insert_meal_items(p_meal_id, v_user, p_items);
  update public.meals
     set status = 'saved', meal_type = p_meal_type, health_score = p_health_score,
         saved_at = coalesce(saved_at, now())
   where id = p_meal_id;
end $$;
