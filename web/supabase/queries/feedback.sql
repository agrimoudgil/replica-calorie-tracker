-- Oswald's public-test numbers (read-only; run in the SQL Editor). Automated test users are left out.
-- No names or emails are shown: answers stay anonymous when you read them.

-- 1. The funnel: who started, set up, logged, came back.
with people as (
  select u.id, u.created_at
  from auth.users u
  where coalesce(u.raw_user_meta_data ->> 'signup_email', u.email, '') not like 'rct-e2e-%'
),
logs as (
  select m.user_id, count(*) as meals, count(distinct m.local_date) as days, min(m.local_date) as first_day, max(m.local_date) as last_day
  from public.meals m
  where m.status = 'saved'
  group by m.user_id
)
select
  count(*) as started,
  count(p2.id) as finished_setup,
  count(l.user_id) as logged_a_meal,
  count(*) filter (where l.meals >= 3) as logged_3_meals,
  count(*) filter (where l.days >= 2) as logged_on_2_days,
  count(*) filter (where l.last_day >= l.first_day + 7) as still_logging_after_a_week,
  count(*) filter (where l.last_day >= (now() at time zone 'Asia/Kolkata')::date - 7) as logged_in_the_last_7_days
from people p
left join public.profiles p2 on p2.id = p.id
left join logs l on l.user_id = p.id;

-- 2. Answers: how easy logging feels, and whether people would rather use WhatsApp.
select
  count(*) filter (where not dismissed) as answers,
  count(*) filter (where dismissed) as said_not_now,
  round(avg(ease), 2) as average_ease_1_to_5,
  count(*) filter (where ease <= 2) as found_it_hard,
  count(*) filter (where ease >= 4) as found_it_easy,
  count(*) filter (where prefers_whatsapp = 'yes') as want_whatsapp,
  count(*) filter (where prefers_whatsapp = 'maybe') as maybe_whatsapp,
  count(*) filter (where prefers_whatsapp = 'no') as no_whatsapp
from public.feedback f
join auth.users u on u.id = f.user_id
where coalesce(u.raw_user_meta_data ->> 'signup_email', u.email, '') not like 'rct-e2e-%';

-- 3. What's missing, newest first.
select
  (f.created_at at time zone 'Asia/Kolkata')::date as day,
  f.ease,
  f.prefers_whatsapp,
  f.missing
from public.feedback f
join auth.users u on u.id = f.user_id
where f.missing is not null
  and coalesce(u.raw_user_meta_data ->> 'signup_email', u.email, '') not like 'rct-e2e-%'
order by f.created_at desc
limit 100;
