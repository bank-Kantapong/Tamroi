-- TAMROI Migration 004: Optional coordinates & location_name for single-review trips
-- Backward-compatible, non-destructive migration

ALTER TABLE public.trips ADD COLUMN IF NOT EXISTS latitude DOUBLE PRECISION NULL;
ALTER TABLE public.trips ADD COLUMN IF NOT EXISTS longitude DOUBLE PRECISION NULL;
ALTER TABLE public.trips ADD COLUMN IF NOT EXISTS location_name TEXT NULL;

