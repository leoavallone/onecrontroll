create extension if not exists "pgcrypto";

create table if not exists public.account_data (
  user_id uuid primary key references auth.users (id) on delete cascade,
  email text not null unique,
  name text,
  initials text,
  transactions jsonb not null default '[]'::jsonb,
  cards jsonb not null default '[]'::jsonb,
  updated_at timestamptz not null default timezone('utc', now())
);

alter table public.account_data enable row level security;

create policy "Users can read own data"
on public.account_data
for select
using (auth.uid() = user_id);

create policy "Users can insert own data"
on public.account_data
for insert
with check (auth.uid() = user_id);

create policy "Users can update own data"
on public.account_data
for update
using (auth.uid() = user_id)
with check (auth.uid() = user_id);
