-- Sheba Parking Guide – Supabase schema (run once in Supabase → SQL editor).
-- Anonymous visitors can ONLY: submit a tip (pending), vote, upload a photo to the private pending bucket,
-- read approved tips and vote totals. Only users listed in public.admins can review/approve.
-- No personal data is stored: no names, emails, IPs. client_token is a random per-device id (rate limiting only).

create extension if not exists pgcrypto;

-- ---------------------------------------------------------------- tables
create table if not exists public.submissions (
  id           uuid primary key default gen_random_uuid(),
  created_at   timestamptz not null default now(),
  kind         text not null check (kind in ('parking','entrance','destination','rule','path','routeNote','correction')),
  payload      jsonb not null,
  photo_path   text,
  status       text not null default 'pending' check (status in ('pending','approved','rejected')),
  flags        text[] not null default '{}',
  client_token text not null,
  reviewed_at  timestamptz,
  review_note  text
);
create index if not exists submissions_token_time on public.submissions (client_token, created_at desc);
create index if not exists submissions_status on public.submissions (status, created_at);

create table if not exists public.published_tips (
  id            uuid primary key default gen_random_uuid(),
  submission_id uuid references public.submissions(id) on delete set null,
  kind          text not null,
  payload       jsonb not null,
  photo_url     text,
  approved_at   timestamptz not null default now(),
  confirmed_at  timestamptz          -- admin re-confirmed on site; resets the 6-month staleness flag
);

create table if not exists public.votes (
  id           bigserial primary key,
  created_at   timestamptz not null default now(),
  target_id    text not null check (target_id ~ '^[A-Za-z0-9:_.-]{1,100}$'),
  value        smallint not null check (value in (-1, 1)),
  client_token text not null,
  unique (target_id, client_token)
);

create table if not exists public.admins (
  user_id uuid primary key references auth.users(id) on delete cascade
);

-- ---------------------------------------------------------------- helpers
create or replace function public.is_admin() returns boolean
language sql stable security definer set search_path = public as $$
  select exists (select 1 from public.admins where user_id = auth.uid());
$$;

-- Vote totals only (no tokens) – readable by everyone.
create or replace view public.vote_summary as
  select target_id,
         count(*) filter (where value = 1)  as ups,
         count(*) filter (where value = -1) as downs,
         max(created_at) filter (where value = 1) as last_up
  from public.votes group by target_id;

-- ---------------------------------------------------------------- RLS
alter table public.submissions    enable row level security;
alter table public.published_tips enable row level security;
alter table public.votes          enable row level security;
alter table public.admins         enable row level security;

drop policy if exists "admin reads submissions" on public.submissions;
create policy "admin reads submissions" on public.submissions for select using (public.is_admin());
drop policy if exists "admin updates submissions" on public.submissions;
create policy "admin updates submissions" on public.submissions for update using (public.is_admin());

drop policy if exists "everyone reads published" on public.published_tips;
create policy "everyone reads published" on public.published_tips for select using (true);
drop policy if exists "admin writes published" on public.published_tips;
create policy "admin writes published" on public.published_tips for all using (public.is_admin()) with check (public.is_admin());

drop policy if exists "admin reads votes" on public.votes;
create policy "admin reads votes" on public.votes for select using (public.is_admin());

drop policy if exists "admin sees self" on public.admins;
create policy "admin sees self" on public.admins for select using (user_id = auth.uid());

revoke all on public.submissions, public.votes, public.admins from anon;
revoke insert, update, delete on public.published_tips from anon;
grant select on public.published_tips, public.vote_summary to anon, authenticated;

-- ---------------------------------------------------------------- submit (anonymous)
create or replace function public.submit_tip(p_kind text, p_payload jsonb, p_photo_path text, p_client_token text, p_hp text)
returns uuid language plpgsql security definer set search_path = public as $$
declare
  v_text  text;
  v_flags text[] := '{}';
  v_id    uuid;
begin
  -- honeypot: bots fill the hidden field. Pretend success, store nothing.
  if coalesce(p_hp, '') <> '' then return gen_random_uuid(); end if;
  if p_kind not in ('parking','entrance','destination','rule','path','routeNote','correction') then raise exception 'bad_kind'; end if;
  if p_client_token is null or length(p_client_token) not between 8 and 64 then raise exception 'bad_token'; end if;
  if jsonb_typeof(p_payload) <> 'object' or length(p_payload::text) > 20000 then raise exception 'payload_too_large'; end if;
  if p_photo_path is not null and p_photo_path !~ '^pending/[0-9a-fA-F-]{8,40}\.jpg$' then raise exception 'bad_photo_path'; end if;

  -- rate limits: per device and global
  if (select count(*) from submissions where client_token = p_client_token and created_at > now() - interval '1 hour') >= 5
     or (select count(*) from submissions where client_token = p_client_token and created_at > now() - interval '1 day') >= 20
     or (select count(*) from submissions where created_at > now() - interval '1 minute') >= 30
  then raise exception 'rate_limit'; end if;

  -- sanitize: no markup at all (the app also escapes on output)
  v_text := regexp_replace(p_payload::text, '[<>]', '', 'g');
  p_payload := v_text::jsonb;

  -- safety: the submitter must confirm the spot is not an emergency lane / disabled spot / fire access
  if p_kind in ('parking','path','entrance') and coalesce((p_payload->>'safetyConfirmed')::boolean, false) is not true then
    raise exception 'safety_not_confirmed';
  end if;
  if v_text ~* '(אמבולנס|נתיב חירום|חירום|כיבוי|כבאות|הידרנט|נכים|נכה|אדום.?לבן|מנחת|ambulance|emergency|fire|hydrant|disabled|handicap)' then
    v_flags := array_append(v_flags, 'mentions-emergency-or-disabled');
  end if;
  if v_text ~* '(עובדים בלבד|לעובדים בלבד|כרטיס עובד|צוות בלבד|אין כניסה|staff only|employees only)' then
    v_flags := array_append(v_flags, 'mentions-non-public');
  end if;
  if p_kind = 'entrance' and coalesce(p_payload->>'publicAccess', '') <> 'yes' then v_flags := array_append(v_flags, 'entrance-not-public'); end if;
  if p_payload ? 'clientFlags' and jsonb_typeof(p_payload->'clientFlags') = 'array' then
    v_flags := v_flags || array(select jsonb_array_elements_text(p_payload->'clientFlags') limit 10);
  end if;

  insert into submissions (kind, payload, photo_path, flags, client_token)
  values (p_kind, p_payload, p_photo_path, v_flags, p_client_token) returning id into v_id;
  return v_id;
end $$;

-- ---------------------------------------------------------------- vote (anonymous, one per device per target)
create or replace function public.cast_vote(p_target_id text, p_value int, p_client_token text)
returns void language plpgsql security definer set search_path = public as $$
begin
  if p_value not in (-1, 1) then raise exception 'bad_value'; end if;
  if p_client_token is null or length(p_client_token) not between 8 and 64 then raise exception 'bad_token'; end if;
  if (select count(*) from votes where client_token = p_client_token and created_at > now() - interval '1 hour') >= 30 then raise exception 'rate_limit'; end if;
  insert into votes (target_id, value, client_token) values (p_target_id, p_value, p_client_token)
  on conflict (target_id, client_token) do update set value = excluded.value, created_at = now();
end $$;

-- ---------------------------------------------------------------- admin actions
create or replace function public.approve_submission(p_id uuid, p_payload jsonb, p_kind text, p_photo_url text default null)
returns uuid language plpgsql security definer set search_path = public as $$
declare v_id uuid;
begin
  if not public.is_admin() then raise exception 'not_admin'; end if;
  insert into published_tips (submission_id, kind, payload, photo_url) values (p_id, p_kind, p_payload, p_photo_url) returning id into v_id;
  update submissions set status = 'approved', reviewed_at = now() where id = p_id;
  return v_id;
end $$;

create or replace function public.reject_submission(p_id uuid, p_note text default null)
returns void language plpgsql security definer set search_path = public as $$
begin
  if not public.is_admin() then raise exception 'not_admin'; end if;
  update submissions set status = 'rejected', reviewed_at = now(), review_note = left(p_note, 500) where id = p_id;
end $$;

revoke execute on function public.approve_submission, public.reject_submission from anon;
grant execute on function public.submit_tip, public.cast_vote, public.is_admin to anon, authenticated;
grant execute on function public.approve_submission, public.reject_submission to authenticated;

-- ---------------------------------------------------------------- storage (photos)
insert into storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
values ('tip-photos-pending', 'tip-photos-pending', false, 700000, '{image/jpeg}'),
       ('tip-photos',         'tip-photos',         true,  700000, '{image/jpeg}')
on conflict (id) do nothing;

drop policy if exists "anon uploads pending photos" on storage.objects;
create policy "anon uploads pending photos" on storage.objects for insert to anon, authenticated
  with check (bucket_id = 'tip-photos-pending' and name like 'pending/%');
drop policy if exists "admin reads pending photos" on storage.objects;
create policy "admin reads pending photos" on storage.objects for select
  using (bucket_id in ('tip-photos-pending', 'tip-photos') and public.is_admin());
drop policy if exists "admin writes public photos" on storage.objects;
create policy "admin writes public photos" on storage.objects for insert
  with check (bucket_id = 'tip-photos' and public.is_admin());
drop policy if exists "admin deletes photos" on storage.objects;
create policy "admin deletes photos" on storage.objects for delete
  using (bucket_id in ('tip-photos-pending', 'tip-photos') and public.is_admin());

-- ---------------------------------------------------------------- make yourself admin (run after you sign up once)
-- 1. Supabase → Authentication → Users → "Add user" → your e-mail (or "Send invite").
-- 2. Authentication → Providers → Email: turn OFF "Allow new users to sign up" (only you can log in).
-- 3. insert into public.admins (user_id) select id from auth.users where email = 'YOUR-EMAIL';
