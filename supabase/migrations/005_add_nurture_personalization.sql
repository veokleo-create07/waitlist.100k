-- Store the final waitlist personalization fields for email nurture.
-- Existing subscribers and prior personalization fields remain intact.

ALTER TABLE public.waitlist
  ADD COLUMN IF NOT EXISTS persona_type TEXT,
  ADD COLUMN IF NOT EXISTS main_challenge TEXT,
  ADD COLUMN IF NOT EXISTS personalization_completed BOOLEAN NOT NULL DEFAULT false,
  ADD COLUMN IF NOT EXISTS personalization_completed_at TIMESTAMPTZ;
