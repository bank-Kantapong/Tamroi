-- Migration 005: User moderation (ban, warn) and post moderation notes
-- Non-destructive additive migration.

ALTER TABLE public.profiles
  ADD COLUMN IF NOT EXISTS is_banned BOOLEAN NOT NULL DEFAULT false,
  ADD COLUMN IF NOT EXISTS banned_reason TEXT NULL,
  ADD COLUMN IF NOT EXISTS warning_message TEXT NULL,
  ADD COLUMN IF NOT EXISTS warning_count INT NOT NULL DEFAULT 0;

ALTER TABLE public.trips
  ADD COLUMN IF NOT EXISTS moderation_note TEXT NULL;

CREATE INDEX IF NOT EXISTS idx_profiles_is_banned ON public.profiles(is_banned);

