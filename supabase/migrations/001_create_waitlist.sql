create extension if not exists pgcrypto;

create table if not exists public.waitlist (
  id uuid primary key default gen_random_uuid(),
  email text not null unique,
  first_name text,
  source text not null default 'hero-waitlist',
  status text not null default 'pending',
  created_at timestamptz not null default now(),
  confirmation_sent_at timestamptz
);

alter table public.waitlist enable row level security;

revoke all on table public.waitlist from anon, authenticated;
grant all on table public.waitlist to service_role;
