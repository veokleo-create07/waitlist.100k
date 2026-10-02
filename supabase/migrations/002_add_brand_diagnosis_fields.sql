-- Extend the existing waitlist records for the free Brand Diagnosis flow.
-- This migration is additive: existing subscribers and the current signup flow remain intact.

create extension if not exists pgcrypto;

alter table public.waitlist
  add column if not exists linkedin_url text,
  add column if not exists desired_positioning text,
  add column if not exists biggest_challenge text,
  add column if not exists diagnosis_status text not null default 'not_started',
  add column if not exists diagnosis_json jsonb,
  add column if not exists updated_at timestamptz not null default now(),
  add column if not exists result_token text not null default encode(gen_random_bytes(32), 'hex');

-- The token is generated server-side with 256 bits of randomness and is safe to
-- use as an opaque, non-sequential result URL identifier.
create unique index if not exists waitlist_result_token_unique
  on public.waitlist (result_token);

create or replace function public.set_waitlist_updated_at()
returns trigger
language plpgsql
as $$
begin
  new.updated_at = now();
  return new;
end;
$$;

drop trigger if exists waitlist_set_updated_at on public.waitlist;
create trigger waitlist_set_updated_at
before update on public.waitlist
for each row
execute function public.set_waitlist_updated_at();
