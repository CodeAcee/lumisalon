-- ============================================================
-- LumiSalon — Supabase Schema
-- Run this in your Supabase SQL editor to set up the database
-- ============================================================

-- profiles (one-to-one with auth.users)
create table if not exists public.profiles (
  id      uuid primary key references auth.users on delete cascade,
  name    text,
  phone   text,
  avatar  text
);

-- locations
create table if not exists public.locations (
  id         uuid primary key default gen_random_uuid(),
  user_id    uuid references auth.users on delete cascade not null,
  name       text not null,
  address    text not null,
  image      text,
  created_at timestamptz default now()
);

-- masters
create table if not exists public.masters (
  id             uuid primary key default gen_random_uuid(),
  user_id        uuid references auth.users on delete cascade not null,
  name           text not null,
  phone          text,
  avatar         text,
  positions      text[] not null default '{}',
  clients_served int not null default 0,
  location_ids   text[] not null default '{}',
  created_at     timestamptz default now()
);

-- clients
create table if not exists public.clients (
  id          uuid primary key default gen_random_uuid(),
  user_id     uuid references auth.users on delete cascade not null,
  name        text not null,
  phone       text not null,
  email       text,
  notes       text,
  avatar      text,
  last_visit  text,
  category    text,
  location_id text,
  created_at  timestamptz default now()
);

-- procedures
create table if not exists public.procedures (
  id          uuid primary key default gen_random_uuid(),
  user_id     uuid references auth.users on delete cascade not null,
  client_id   uuid references public.clients on delete cascade not null,
  master_id   uuid references public.masters on delete cascade not null,
  location_id text,
  date        text not null,
  services    text[] not null default '{}',
  positions   text[] not null default '{}',
  notes       text,
  photos      text[] not null default '{}',
  created_at  timestamptz default now()
);

-- ============================================================
-- Row Level Security
-- ============================================================

alter table public.profiles    enable row level security;
alter table public.locations   enable row level security;
alter table public.masters     enable row level security;
alter table public.clients     enable row level security;
alter table public.procedures  enable row level security;

-- profiles: user sees / edits only their own row
drop policy if exists "profiles_select" on public.profiles;
drop policy if exists "profiles_insert" on public.profiles;
drop policy if exists "profiles_update" on public.profiles;
create policy "profiles_select" on public.profiles for select using (auth.uid() = id);
create policy "profiles_insert" on public.profiles for insert with check (auth.uid() = id);
create policy "profiles_update" on public.profiles for update using (auth.uid() = id);

-- locations
drop policy if exists "locations_all" on public.locations;
create policy "locations_all" on public.locations for all using (auth.uid() = user_id) with check (auth.uid() = user_id);

-- masters
drop policy if exists "masters_all" on public.masters;
create policy "masters_all" on public.masters for all using (auth.uid() = user_id) with check (auth.uid() = user_id);

-- clients
drop policy if exists "clients_all" on public.clients;
create policy "clients_all" on public.clients for all using (auth.uid() = user_id) with check (auth.uid() = user_id);

-- procedures
drop policy if exists "procedures_all" on public.procedures;
create policy "procedures_all" on public.procedures for all using (auth.uid() = user_id) with check (auth.uid() = user_id);

-- ============================================================
-- Trigger: auto-create profile row on new user signup
-- ============================================================

create or replace function public.handle_new_user()
returns trigger
language plpgsql
security definer set search_path = ''
as $$
begin
  insert into public.profiles (id, name, phone)
  values (
    new.id,
    new.raw_user_meta_data ->> 'name',
    new.raw_user_meta_data ->> 'phone'
  );
  return new;
end;
$$;

drop trigger if exists on_auth_user_created on auth.users;
create trigger on_auth_user_created
  after insert on auth.users
  for each row execute procedure public.handle_new_user();

-- ============================================================
-- Storage: "images" bucket (public so URLs work without auth headers)
-- ============================================================

-- Create the bucket as public (images are served via CDN, no auth header needed)
insert into storage.buckets (id, name, public)
values ('images', 'images', true)
on conflict (id) do update set public = true;

-- Users can upload to their own folder (procedures/{user_id}/*, masters/{user_id}/*, etc.)
drop policy if exists "Users can upload their own images" on storage.objects;
create policy "Users can upload their own images"
on storage.objects for insert
to authenticated
with check (
  bucket_id = 'images' AND
  (storage.foldername(name))[2] = auth.uid()::text
);

-- Public read — bucket is public so this is a safety net for anon access
drop policy if exists "Public read images" on storage.objects;
create policy "Public read images"
on storage.objects for select
to public
using (bucket_id = 'images');

-- Users can delete only their own images
drop policy if exists "Users can delete their own images" on storage.objects;
create policy "Users can delete their own images"
on storage.objects for delete
to authenticated
using (
  bucket_id = 'images' AND
  (storage.foldername(name))[2] = auth.uid()::text
);
