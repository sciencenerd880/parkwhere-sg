-- ==============================================================================
-- ParkWhere SG: Supabase Schema & Analytics Setup
-- Run this in your Supabase Dashboard SQL Editor (https://supabase.com/dashboard/project/ijoeholrnwrydnzfdpko/sql)
-- ==============================================================================

-- 1. Create Profiles Table (Synced with auth.users)
create table if not exists public.profiles (
  id uuid primary key references auth.users(id) on delete cascade,
  email text,
  full_name text,
  avatar_url text,
  provider text default 'google',
  login_count integer default 1,
  first_seen_at timestamptz default timezone('utc'::text, now()) not null,
  last_seen_at timestamptz default timezone('utc'::text, now()) not null,
  created_at timestamptz default timezone('utc'::text, now()) not null,
  updated_at timestamptz default timezone('utc'::text, now()) not null
);

-- Enable RLS on profiles
alter table public.profiles enable row level security;

create policy "Users can view their own profile"
  on public.profiles for select
  using (auth.uid() = id);

create policy "Users can update their own profile"
  on public.profiles for update
  using (auth.uid() = id);

create policy "Public/Anon can upsert profile on login"
  on public.profiles for insert
  with check (true);

-- 2. Trigger to automatically populate public.profiles on Auth Sign-In / Sign-Up
create or replace function public.handle_user_login()
returns trigger as $$
begin
  insert into public.profiles (id, email, full_name, avatar_url, provider, first_seen_at, last_seen_at)
  values (
    new.id,
    new.email,
    new.raw_user_meta_data->>'full_name',
    new.raw_user_meta_data->>'avatar_url',
    coalesce(new.raw_app_meta_data->>'provider', 'google'),
    now(),
    now()
  )
  on conflict (id) do update set
    last_seen_at = now(),
    login_count = coalesce(public.profiles.login_count, 1) + 1,
    avatar_url = coalesce(excluded.avatar_url, public.profiles.avatar_url),
    full_name = coalesce(excluded.full_name, public.profiles.full_name),
    updated_at = now();
  return new;
end;
$$ language plpgsql security definer;

-- Drop trigger if already exists then recreate
drop trigger if exists on_auth_user_created on auth.users;
create trigger on_auth_user_created
  after insert on auth.users
  for each row execute procedure public.handle_user_login();

-- Populate existing auth.users into profiles table immediately
insert into public.profiles (id, email, full_name, avatar_url, provider, first_seen_at, last_seen_at)
select
  id,
  email,
  raw_user_meta_data->>'full_name',
  raw_user_meta_data->>'avatar_url',
  coalesce(raw_app_meta_data->>'provider', 'google'),
  created_at,
  coalesce(last_sign_in_at, created_at)
from auth.users
on conflict (id) do nothing;


-- 3. Create User Events Table (First-Party Telemetry & Analytics)
create table if not exists public.user_events (
  id uuid primary key default gen_random_uuid(),
  user_id uuid references auth.users(id) on delete set null,
  event_name text not null,
  properties jsonb default '{}'::jsonb,
  device_type text,
  path text,
  created_at timestamptz default timezone('utc'::text, now()) not null
);

-- Enable RLS on user_events
alter table public.user_events enable row level security;

-- Allow any client (anonymous or logged in) to insert tracking events
create policy "Allow insert telemetry events"
  on public.user_events for insert
  with check (true);

-- Users can only read their own events (or admin via Service Role)
create policy "Allow users to read own telemetry"
  on public.user_events for select
  using (auth.uid() = user_id);

-- Indexes for lightning fast analytics querying
create index if not exists idx_user_events_name_created on public.user_events (event_name, created_at desc);
create index if not exists idx_user_events_user_id on public.user_events (user_id);
