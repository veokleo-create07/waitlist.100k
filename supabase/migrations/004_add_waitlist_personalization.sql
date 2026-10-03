-- Store the optional post-signup personalization answers.
-- Existing waitlist subscribers remain intact.

ALTER TABLE public.waitlist
  ADD COLUMN IF NOT EXISTS audience_type TEXT,
  ADD COLUMN IF NOT EXISTS brand_goal TEXT,
  ADD COLUMN IF NOT EXISTS personalization_challenge TEXT;
