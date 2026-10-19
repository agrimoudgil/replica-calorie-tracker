-- How many people started Oswald with just an email (read-only; run in the SQL Editor).
-- The emails aren't checked, so one person may appear more than once (each browser starts
-- a new account). Accounts deleted by their owners are gone from both counts.

-- 1. Totals: accounts started, distinct emails, and how many finished setup.
select
  count(*) as accounts_started,
  count(distinct lower(u.raw_user_meta_data ->> 'signup_email')) as distinct_emails,
  count(p.id) as finished_setup
from auth.users u
left join public.profiles p on p.id = u.id
where u.raw_user_meta_data ? 'signup_email'
  and u.raw_user_meta_data ->> 'signup_email' not like 'rct-e2e-%';  -- leave out automated test users

-- 2. Sign-ups per day (India time).
select
  (u.created_at at time zone 'Asia/Kolkata')::date as day,
  count(*) as started
from auth.users u
where u.raw_user_meta_data ? 'signup_email'
  and u.raw_user_meta_data ->> 'signup_email' not like 'rct-e2e-%'
group by 1
order by 1 desc;
