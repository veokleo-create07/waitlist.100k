-- Track the one-time Brand Diagnosis email independently from diagnosis completion.
-- A claim status prevents concurrent requests from sending duplicate emails.

alter table public.waitlist
  add column if not exists diagnosis_email_status text not null default 'pending',
  add column if not exists diagnosis_email_sent_at timestamptz;

alter table public.waitlist
  add column if not exists linkedin_profile_url text,
  add column if not exists linkedin_first_name text,
  add column if not exists linkedin_full_name text,
  add column if not exists linkedin_headline text,
  add column if not exists linkedin_about text,
  add column if not exists linkedin_current_role text,
  add column if not exists linkedin_company text,
  add column if not exists linkedin_profile_image_url text;

alter table public.waitlist
  drop constraint if exists waitlist_diagnosis_email_status_check;

alter table public.waitlist
  add constraint waitlist_diagnosis_email_status_check
  check (diagnosis_email_status in ('pending', 'sending', 'sent', 'failed'));
