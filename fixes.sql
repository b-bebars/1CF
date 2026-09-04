-- ============================================================
-- RoseUp Quest 2026 — FIX MIGRATION
-- Run in Supabase Dashboard → SQL Editor (all at once)
-- Safe to re-run (idempotent)
-- ============================================================

-- 0) Ensure extensions
create extension if not exists pgcrypto;
create extension if not exists pg_cron;

-- ============================================================
-- 1) FIX: Auto-create participant row on signup
-- ============================================================
create or replace function public.handle_new_user()
returns trigger
language plpgsql
security definer
set search_path = public
as $$
begin
  insert into public.participants (id, display_name, avatar, points, km, streak, completed, completed_challenge_ids)
  values (
    new.id,
    coalesce(new.raw_user_meta_data->>'name', split_part(new.email, '@', 1), 'Rose'),
    coalesce(new.raw_user_meta_data->>'avatar', '🌹'),
    0, 0, 1, 0, '{}'::text[]
  )
  on conflict (id) do nothing;
  return new;
end;
$$;

drop trigger if exists on_auth_user_created on auth.users;
create trigger on_auth_user_created
  after insert on auth.users
  for each row execute function public.handle_new_user();

-- Backfill: create participants for users who signed up before the trigger
insert into public.participants (id, display_name, avatar)
select u.id,
       coalesce(u.raw_user_meta_data->>'name', split_part(u.email, '@', 1), 'Rose'),
       '🌹'
from auth.users u
left join public.participants p on p.id = u.id
where p.id is null;

-- ============================================================
-- 2) FIX: Missing table `challenge_completions` (used in code)
-- ============================================================
create table if not exists public.challenge_completions (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users(id) on delete cascade,
  challenge_id text not null,
  created_at timestamptz not null default now(),
  unique(user_id, challenge_id)
);

alter table public.challenge_completions enable row level security;

drop policy if exists cc_sel on public.challenge_completions;
create policy cc_sel on public.challenge_completions for select using (true);

drop policy if exists cc_ins on public.challenge_completions;
create policy cc_ins on public.challenge_completions for insert to authenticated
  with check (auth.uid() = user_id);

-- ============================================================
-- 3) FIX: Points RPC (secure server-side increment)
-- ============================================================
create or replace function public.increment_points(p_user_id uuid, p_amount integer, p_km numeric default 0)
returns void
language plpgsql
security definer
set search_path = public
as $$
begin
  update public.participants
     set points = coalesce(points, 0) + p_amount,
         km = coalesce(km, 0) + coalesce(p_km, 0),
         last_active = now()
   where id = p_user_id;
end;
$$;

grant execute on function public.increment_points(uuid, integer, numeric) to authenticated;

-- ============================================================
-- 4) DELETE Weekly & Special challenges permanently
-- ============================================================
delete from public.challenges where type in ('weekly', 'special');

-- Loosen the check constraint (only allow 'daily')
alter table public.challenges drop constraint if exists challenges_type_check;
alter table public.challenges add constraint challenges_type_check
  check (type in ('daily'));

-- ============================================================
-- 5) FIX: Ensure participants SELECT is public (leaderboard/count)
-- ============================================================
drop policy if exists p_sel on public.participants;
create policy p_sel on public.participants for select using (true);

-- Ensure challenges SELECT is public for daily challenges
drop policy if exists c_sel on public.challenges;
create policy c_sel on public.challenges for select using (true);

-- ============================================================
-- 6) FIX: Storage bucket policies for proof-images (video + image)
-- ============================================================
-- Make bucket exist + allow larger uploads
update storage.buckets
  set file_size_limit = 52428800,  -- 50 MB
      allowed_mime_types = array['image/jpeg','image/png','image/webp','image/gif','video/mp4','video/quicktime','video/webm']
  where id = 'proof-images';

insert into storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
values ('proof-images', 'proof-images', false, 52428800,
        array['image/jpeg','image/png','image/webp','image/gif','video/mp4','video/quicktime','video/webm'])
on conflict (id) do nothing;

-- Allow authenticated users to upload into their own folder (user_id/...)
drop policy if exists proof_ins on storage.objects;
create policy proof_ins on storage.objects for insert to authenticated
with check (
  bucket_id = 'proof-images'
  and auth.uid()::text = (storage.foldername(name))[1]
);

-- Allow authenticated users to read their own proofs (admins read all)
drop policy if exists proof_sel on storage.objects;
create policy proof_sel on storage.objects for select to authenticated
using (
  bucket_id = 'proof-images'
  and (auth.uid()::text = (storage.foldername(name))[1] or public.is_admin())
);

-- Allow owner or admin to delete
drop policy if exists proof_del on storage.objects;
create policy proof_del on storage.objects for delete to authenticated
using (
  bucket_id = 'proof-images'
  and (auth.uid()::text = (storage.foldername(name))[1] or public.is_admin())
);

-- ============================================================
-- 7) SEED: 25 new daily challenges (in addition to existing)
-- ============================================================
-- Clean existing daily seed first so we have a fresh curated set
delete from public.challenges where type = 'daily';

insert into public.challenges (id, type, title, description, icon, points, category, active) values
  ('d-walk3',     'daily', 'Walk 3 km',              'Lace up and log a 3 km walk today.',                  '🚶', 30, 'move',     false),
  ('d-photo',     'daily', 'Photo with a rose',      'Snap a picture with any rose — real, drawn, or digital.','🌹', 20, 'create',  false),
  ('d-read',      'daily', 'Learn about CF',         'Read one new fact about Cystic Fibrosis and share it.','📚', 15, 'learn',   false),
  ('d-story',     'daily', 'Share a RoseUp Story',   'Post a short story of hope on your feed.',            '✨', 25, 'share',    false),
  ('d-invite',    'daily', 'Invite a friend',        'Invite one friend to join the Quest.',                '💜', 35, 'grow',     false),
  ('d-post',      'daily', 'Awareness post',         'Share an awareness post with #RoseUp2026.',           '📱', 20, 'share',    false),
  ('d-stretch',   'daily', '15 min stretching',      'Move gently for 15 minutes.',                         '🧘', 15, 'wellness', false),
  ('d-water',     'daily', 'Drink 2L of water',      'Stay hydrated all day.',                              '💧', 10, 'wellness', false),
  ('d-run1',      'daily', 'Run 1 km',               'A quick 1 km run to fuel hope.',                      '🏃', 40, 'move',     false),
  ('d-stairs',    'daily', '50 stairs today',        'Take the stairs — at least 50 steps.',                '🪜', 15, 'move',     false),
  ('d-nature',    'daily', '20 min in nature',       'Spend 20 minutes outdoors, phone away.',              '🌿', 20, 'wellness', false),
  ('d-meditate',  'daily', '10 min meditation',      'Sit and breathe for 10 mindful minutes.',             '🧠', 20, 'wellness', false),
  ('d-sunrise',   'daily', 'Catch a sunrise',        'Watch (or photograph) the sunrise.',                  '🌅', 25, 'create',   false),
  ('d-thanks',    'daily', 'Thank someone',          'Send a genuine thank-you message today.',             '💌', 15, 'share',    false),
  ('d-fruit',     'daily', 'Eat 3 fruits',           'Eat three different fruits today.',                   '🍎', 10, 'wellness', false),
  ('d-book',      'daily', 'Read 10 pages',          'Read at least 10 pages of a book.',                   '📖', 20, 'learn',    false),
  ('d-music',     'daily', 'RoseUp playlist',        'Listen to an uplifting song and share the title.',    '🎵', 10, 'share',    false),
  ('d-draw',      'daily', 'Draw a rose',            'Doodle or paint a rose — any style.',                 '🎨', 25, 'create',   false),
  ('d-video',     'daily', '30-sec awareness clip',  'Record a 30-second clip about the cause.',            '🎥', 45, 'create',   false),
  ('d-declutter', 'daily', 'Declutter one shelf',    'Give a small space some love.',                       '🧹', 15, 'wellness', false),
  ('d-cf-fact',   'daily', 'Teach a CF fact',        'Explain one CF fact to a family member.',             '🎓', 20, 'learn',    false),
  ('d-donate',    'daily', 'Micro-donation',         'Donate any small amount (or note an intention).',     '💝', 30, 'grow',     false),
  ('d-yoga',      'daily', '15 min yoga',            'Flow through 15 minutes of yoga.',                    '🧘‍♀️', 25, 'wellness', false),
  ('d-cycle',     'daily', 'Cycle 5 km',             'Ride a bike for at least 5 kilometers.',              '🚴', 40, 'move',     false),
  ('d-selfie',    'daily', 'Purple selfie',          'Wear something purple and post a selfie.',            '💜', 20, 'share',    false)
on conflict (id) do update
  set title = excluded.title,
      description = excluded.description,
      icon = excluded.icon,
      points = excluded.points,
      category = excluded.category;

-- ============================================================
-- 8) DAILY ROTATION: activate 5 challenges/day, reset progress
-- ============================================================
create or replace function public.rotate_daily_challenges()
returns void
language plpgsql
security definer
set search_path = public
as $$
declare
  today_seed integer;
begin
  -- Deterministic seed based on today's date (UTC)
  today_seed := to_char(current_date, 'YYYYDDD')::integer;

  -- Deactivate all daily challenges
  update public.challenges set active = false where type = 'daily';

  -- Activate 5 pseudo-random daily challenges for today
  with pick as (
    select id from public.challenges
    where type = 'daily'
    order by md5(id || today_seed::text)
    limit 5
  )
  update public.challenges set active = true
   where id in (select id from pick);

  -- Reset every participant's completed_challenge_ids so they can do today's set
  update public.participants
     set completed_challenge_ids = '{}'::text[];

  -- Optional: clear completions log older than 30 days (keeps table small)
  delete from public.challenge_completions where created_at < now() - interval '30 days';
end;
$$;

-- Run it once now so today has 5 active challenges immediately
select public.rotate_daily_challenges();

-- ============================================================
-- 9) CRON: run rotation every day at 00:00 UTC
-- ============================================================
-- Remove old job if exists (safe re-run)
do $$
declare
  jid integer;
begin
  select jobid into jid from cron.job where jobname = 'roseup_daily_rotation';
  if jid is not null then perform cron.unschedule(jid); end if;
end $$;

select cron.schedule(
  'roseup_daily_rotation',
  '0 0 * * *',
  $$select public.rotate_daily_challenges();$$
);

-- ============================================================
-- Done
-- ============================================================
select 'RoseUp fixes installed ✅' as status,
       (select count(*) from public.participants) as participants_count,
       (select count(*) from public.challenges where type='daily' and active=true) as todays_challenges,
       (select count(*) from public.challenges where type='daily') as total_daily_pool;
