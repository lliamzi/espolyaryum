-- ============================================================
-- ESPOLYARYUM ARCHIVE — Database Schema (Supabase / Postgres)
-- Run this in: Supabase Dashboard → SQL Editor → New Query
-- ============================================================

-- 1. PROFILES TABLE
-- Extends Supabase's built-in auth.users with a username + role.
-- Supabase Auth requires an email internally, so signup uses
-- "<username>@espolyaryum.local" as a synthetic email — the user
-- only ever sees/enters a username.
create table public.profiles (
  id uuid references auth.users(id) on delete cascade primary key,
  username text unique not null,
  is_admin boolean not null default false,
  created_at timestamptz not null default now()
);

-- 2. POSTS TABLE
-- One row per "memory": a photo, video, audio file, or text note.
create table public.posts (
  id uuid primary key default gen_random_uuid(),
  user_id uuid references public.profiles(id) on delete cascade not null,
  type text not null check (type in ('photo', 'video', 'audio', 'text')),
  caption text,
  body text,                 -- used for text-note posts
  media_url text,            -- public URL into Supabase Storage (null for text posts)
  media_path text,           -- storage object path, needed to delete the file itself
  created_at timestamptz not null default now()
);

create index posts_created_at_idx on public.posts (created_at desc);
create index posts_user_id_idx on public.posts (user_id);

-- ============================================================
-- ROW LEVEL SECURITY
-- ============================================================
alter table public.profiles enable row level security;
alter table public.posts enable row level security;

-- Anyone signed in can read all profiles (needed to show usernames on posts)
create policy "profiles are viewable by everyone"
  on public.profiles for select
  using (true);

-- Users can only update their own profile row
create policy "users can update own profile"
  on public.profiles for update
  using (auth.uid() = id);

-- Everyone signed in can view the whole archive (feed/gallery)
create policy "posts are viewable by everyone"
  on public.posts for select
  using (true);

-- Only the authenticated user can insert a post as themselves
create policy "users can insert own posts"
  on public.posts for insert
  with check (auth.uid() = user_id);

-- DELETE RULE (the important one):
-- A row can be deleted if you are the owner OR your profile has is_admin = true.
create policy "owner or admin can delete posts"
  on public.posts for delete
  using (
    auth.uid() = user_id
    or exists (
      select 1 from public.profiles
      where profiles.id = auth.uid() and profiles.is_admin = true
    )
  );

-- ============================================================
-- AUTO-CREATE PROFILE ON SIGNUP
-- ============================================================
create or replace function public.handle_new_user()
returns trigger as $$
begin
  insert into public.profiles (id, username)
  values (new.id, new.raw_user_meta_data->>'username');
  return new;
end;
$$ language plpgsql security definer;

create trigger on_auth_user_created
  after insert on auth.users
  for each row execute procedure public.handle_new_user();

-- ============================================================
-- STORAGE BUCKET + POLICIES
-- Run in the Supabase Dashboard → Storage → create bucket "archive-media" (public)
-- then run the policies below in the SQL editor.
-- ============================================================
insert into storage.buckets (id, name, public)
values ('archive-media', 'archive-media', true)
on conflict (id) do nothing;

create policy "anyone can view archive media"
  on storage.objects for select
  using (bucket_id = 'archive-media');

create policy "authenticated users can upload media"
  on storage.objects for insert
  with check (bucket_id = 'archive-media' and auth.role() = 'authenticated');

-- Owner or admin can delete the underlying file too.
-- Files are stored under a path like "<user_id>/<filename>", so this policy
-- checks the folder name against the current user, or admin status.
create policy "owner or admin can delete media"
  on storage.objects for delete
  using (
    bucket_id = 'archive-media'
    and (
      auth.uid()::text = (storage.foldername(name))[1]
      or exists (
        select 1 from public.profiles
        where profiles.id = auth.uid() and profiles.is_admin = true
      )
    )
  );

-- ============================================================
-- TO MAKE A USER AN ADMIN (run manually, replace the username):
-- ============================================================
-- update public.profiles set is_admin = true where username = 'your_admin_username';

