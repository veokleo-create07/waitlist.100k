-- Track the one-time Brand Diagnosis email independently from diagnosis completion.
-- A claim status prevents concurrent requests from sending duplicate emails.

alter table public.waitlist
  add column if not exists diagnosis_email_status text not null default 'pending',
  add column if not exists diagnosis_email_sent_at timestamptz;

alter table public.waitlist
  drop constraint if exists waitlist_diagnosis_email_status_check;

alter table public.waitlist
  add constraint waitlist_diagnosis_email_status_check
  check (diagnosis_email_status in ('pending', 'sending', 'sent', 'failed'));
