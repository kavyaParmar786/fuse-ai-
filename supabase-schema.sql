-- ============================================================
-- Emoji Fusion — Supabase Schema
-- Run this in: Supabase Dashboard → SQL Editor → New Query
-- ============================================================

-- Enable UUID extension
create extension if not exists "uuid-ossp";

-- ─── Users table (NextAuth stores users here) ─────────────────
create table if not exists public.users (
  id uuid primary key default uuid_generate_v4(),
  name text,
  email text unique,
  image text,
  email_verified timestamptz,
  created_at timestamptz default now()
);

-- ─── NextAuth required tables ─────────────────────────────────
create table if not exists public.accounts (
  id uuid primary key default uuid_generate_v4(),
  user_id uuid references public.users(id) on delete cascade,
  type text not null,
  provider text not null,
  provider_account_id text not null,
  refresh_token text,
  access_token text,
  expires_at bigint,
  token_type text,
  scope text,
  id_token text,
  session_state text,
  unique(provider, provider_account_id)
);

create table if not exists public.sessions (
  id uuid primary key default uuid_generate_v4(),
  session_token text unique not null,
  user_id uuid references public.users(id) on delete cascade,
  expires timestamptz not null
);

create table if not exists public.verification_tokens (
  identifier text,
  token text unique not null,
  expires timestamptz not null,
  primary key (identifier, token)
);

-- ─── Fusions ──────────────────────────────────────────────────
create table if not exists public.fusions (
  id uuid primary key default uuid_generate_v4(),
  user_id uuid references public.users(id) on delete cascade,
  emojis text[] not null,
  prompt text,
  style text,
  ai_prompt text,
  image_url text not null,
  like_count int default 0,
  is_public boolean default true,
  created_at timestamptz default now()
);

-- ─── Likes ────────────────────────────────────────────────────
create table if not exists public.likes (
  id uuid primary key default uuid_generate_v4(),
  user_id uuid references public.users(id) on delete cascade,
  fusion_id uuid references public.fusions(id) on delete cascade,
  created_at timestamptz default now(),
  unique(user_id, fusion_id)
);

-- ─── Indexes ──────────────────────────────────────────────────
create index if not exists fusions_user_id_idx on public.fusions(user_id);
create index if not exists fusions_created_at_idx on public.fusions(created_at desc);
create index if not exists fusions_like_count_idx on public.fusions(like_count desc);
create index if not exists likes_user_id_idx on public.likes(user_id);
create index if not exists likes_fusion_id_idx on public.likes(fusion_id);

-- ─── Row Level Security ───────────────────────────────────────
alter table public.fusions enable row level security;
alter table public.likes enable row level security;
alter table public.users enable row level security;

-- Fusions: public can read public ones, users manage their own
create policy "Public fusions are viewable by everyone"
  on public.fusions for select
  using (is_public = true);

create policy "Users can insert their own fusions"
  on public.fusions for insert
  with check (auth.uid()::text = user_id::text);

create policy "Users can update their own fusions"
  on public.fusions for update
  using (auth.uid()::text = user_id::text);

create policy "Users can delete their own fusions"
  on public.fusions for delete
  using (auth.uid()::text = user_id::text);

-- Likes: users manage their own
create policy "Users can see all likes"
  on public.likes for select using (true);

create policy "Users can insert their own likes"
  on public.likes for insert
  with check (auth.uid()::text = user_id::text);

create policy "Users can delete their own likes"
  on public.likes for delete
  using (auth.uid()::text = user_id::text);

-- Users: viewable by all, editable by self
create policy "Users are viewable by everyone"
  on public.users for select using (true);

create policy "Users can update own record"
  on public.users for update
  using (auth.uid()::text = id::text);

-- ─── Service role bypass (for NextAuth adapter) ───────────────
-- The service role key bypasses RLS automatically, so the
-- NextAuth adapter (using service role) will work fine.

select 'Schema created successfully!' as result;
