-- ============================================================
-- RoseUp Quest 2026 — Full Supabase schema, RLS, storage, seed
-- Run this ENTIRE script in Supabase Dashboard → SQL Editor
-- ============================================================

create extension if not exists pgcrypto;

-- Admin helper
create or replace function public.is_admin()
returns boolean language sql stable as $$
  select coalesce(auth.jwt() -> 'app_metadata' ->> 'role', '') = 'admin';
$$;

-- =========== TABLES ===========
create table if not exists public.participants (
  id uuid primary key references auth.users(id) on delete cascade,
  display_name text not null default 'Rose',
  avatar text default '🌹',
  points integer not null default 0,
  km numeric not null default 0,
  streak integer not null default 1,
  completed integer not null default 0,
  completed_challenge_ids text[] not null default '{}',
  last_active timestamptz default now(),
  created_at timestamptz not null default now()
);

create table if not exists public.challenges (
  id text primary key,
  type text not null check (type in ('daily','weekly','special')),
  title text not null,
  description text default '',
  icon text default '⭐',
  points integer not null default 0,
  category text,
  active boolean not null default true,
  ends_at timestamptz,
  created_at timestamptz not null default now()
);

create table if not exists public.submissions (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users(id) on delete cascade,
  user_name text,
  user_avatar text,
  challenge_id text not null,
  challenge_title text,
  challenge_type text,
  points integer default 0,
  km numeric default 0,
  proof_path text,
  note text,
  status text not null default 'pending' check (status in ('pending','approved','rejected')),
  reason text,
  reviewed_by uuid,
  reviewed_at timestamptz,
  created_at timestamptz not null default now()
);

create table if not exists public.announcements (
  id uuid primary key default gen_random_uuid(),
  title text not null,
  body text not null default '',
  pinned boolean not null default false,
  created_at timestamptz not null default now()
);

create table if not exists public.bonuses (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users(id) on delete cascade,
  points integer not null default 0,
  reason text,
  created_at timestamptz not null default now()
);

create table if not exists public.meta (
  key text primary key,
  value jsonb
);
insert into public.meta (key, value) values ('config', '{"fundGoal":250000}'::jsonb)
on conflict (key) do nothing;

-- =========== RLS ===========
alter table public.participants enable row level security;
alter table public.challenges enable row level security;
alter table public.submissions enable row level security;
alter table public.announcements enable row level security;
alter table public.bonuses enable row level security;
alter table public.meta enable row level security;

-- Participants: public read (leaderboard), own upsert
drop policy if exists p_sel on public.participants;
create policy p_sel on public.participants for select using (true);
drop policy if exists p_ins on public.participants;
create policy p_ins on public.participants for insert with check (auth.uid() = id);
drop policy if exists p_upd on public.participants;
create policy p_upd on public.participants for update using (auth.uid() = id or public.is_admin()) with check (auth.uid() = id or public.is_admin());
drop policy if exists p_del on public.participants;
create policy p_del on public.participants for delete using (public.is_admin());

-- Challenges: public read active or admin all
drop policy if exists c_sel on public.challenges;
create policy c_sel on public.challenges for select using (active = true or public.is_admin());
drop policy if exists c_ins on public.challenges;
create policy c_ins on public.challenges for insert with check (public.is_admin());
drop policy if exists c_upd on public.challenges;
create policy c_upd on public.challenges for update using (public.is_admin()) with check (public.is_admin());
drop policy if exists c_del on public.challenges;
create policy c_del on public.challenges for delete using (public.is_admin());

-- Submissions
drop policy if exists s_sel on public.submissions;
create policy s_sel on public.submissions for select using (auth.uid() = user_id or public.is_admin());
drop policy if exists s_ins on public.submissions;
create policy s_ins on public.submissions for insert with check (auth.uid() = user_id);
drop policy if exists s_upd on public.submissions;
create policy s_upd on public.submissions for update using (public.is_admin()) with check (public.is_admin());
drop policy if exists s_del on public.submissions;
create policy s_del on public.submissions for delete using (public.is_admin());

-- Announcements: public read, admin write
drop policy if exists a_sel on public.announcements;
create policy a_sel on public.announcements for select using (true);
drop policy if exists a_ins on public.announcements;
create policy a_ins on public.announcements for insert with check (public.is_admin());
drop policy if exists a_upd on public.announcements;
create policy a_upd on public.announcements for update using (public.is_admin()) with check (public.is_admin());
drop policy if exists a_del on public.announcements;
create policy a_del on public.announcements for delete using (public.is_admin());

-- Bonuses
drop policy if exists b_sel on public.bonuses;
create policy b_sel on public.bonuses for select using (auth.uid() = user_id or public.is_admin());
drop policy if exists b_all on public.bonuses;
create policy b_all on public.bonuses for all using (public.is_admin()) with check (public.is_admin());

-- Meta
drop policy if exists m_sel on public.meta;
create policy m_sel on public.meta for select using (true);
drop policy if exists m_all on public.meta;
create policy m_all on public.meta for all using (public.is_admin()) with check (public.is_admin());

-- =========== STORAGE BUCKET ===========
insert into storage.buckets (id, name, public)
values ('proof-images', 'proof-images', false)
on conflict (id) do nothing;

drop policy if exists proof_ins on storage.objects;
create policy proof_ins on storage.objects for insert to authenticated
with check (bucket_id = 'proof-images' and auth.uid()::text = (storage.foldername(name))[1]);

drop policy if exists proof_sel on storage.objects;
create policy proof_sel on storage.objects for select to authenticated
using (bucket_id = 'proof-images' and (auth.uid()::text = (storage.foldername(name))[1] or public.is_admin()));

drop policy if exists proof_del on storage.objects;
create policy proof_del on storage.objects for delete to authenticated
using (bucket_id = 'proof-images' and (auth.uid()::text = (storage.foldername(name))[1] or public.is_admin()));

-- =========== REALTIME ===========
alter publication supabase_realtime add table public.participants;
alter publication supabase_realtime add table public.submissions;
alter publication supabase_realtime add table public.announcements;
alter publication supabase_realtime add table public.challenges;

-- =========== SEED CHALLENGES ===========
insert into public.challenges (id, type, title, description, icon, points, category, active) values
  ('d-walk3','daily','Walk 3 km today','Lace up your shoes and log a 3 km walk.','🚶',30,'move',true),
  ('d-photo','daily','Take a photo with a rose','Snap a picture with any rose — real, drawn, or digital.','🌹',20,'create',true),
  ('d-read','daily','Read about Cystic Fibrosis','Learn one new fact about CF.','📚',15,'learn',true),
  ('d-story','daily','Share a RoseUp Story','Post a short story of hope.','✨',25,'share',true),
  ('d-invite','daily','Invite a friend','Invite one friend to join the Quest.','💜',35,'grow',true),
  ('d-post','daily','Share an awareness post','Share with #RoseUp2026.','📱',20,'share',true),
  ('d-stretch','daily','15 min of stretching','Move gently for 15 minutes.','🧘',15,'move',true),
  ('d-water','daily','Drink 2L of water','Stay hydrated.','💧',10,'wellness',true),
  ('w-walk20','weekly','Walk 20 km','Complete 20 kilometers this week.','👟',150,null,true),
  ('w-video','weekly','Create a RoseUp video','Record a 60-second awareness clip.','🎬',200,null,true),
  ('w-invite3','weekly','Invite 3 friends','Grow the movement.','💜',180,null,true),
  ('w-photo5','weekly','Take 5 nature photos','Capture five moments outdoors.','📸',120,null,true),
  ('s-purpleday','special','Purple Day','Wear purple and share a photo.','👕',60,null,true),
  ('s-marathon','special','Weekend Marathon','Log 42 km across the weekend.','🏃',300,null,true)
on conflict (id) do nothing;

-- =========== SEED ANNOUNCEMENT ===========
insert into public.announcements (title, body, pinned) values
  ('Welcome to RoseUp Quest 2026!', 'Every step gives hope. Complete daily challenges to bloom your Rose Path.', true)
on conflict do nothing;

-- Done
select 'RoseUp schema installed ✅' as status;
