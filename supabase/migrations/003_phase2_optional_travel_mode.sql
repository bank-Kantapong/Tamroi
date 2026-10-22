-- TAMROI Migration 003: Optional travel_mode, 'other' support, and travel_mode_note
-- Backward-compatible, non-destructive migration

ALTER TABLE public.trips ALTER COLUMN travel_mode DROP NOT NULL;

ALTER TABLE public.trips DROP CONSTRAINT IF EXISTS trips_travel_mode_check;

ALTER TABLE public.trips ADD CONSTRAINT trips_travel_mode_check CHECK (
  travel_mode IS NULL OR travel_mode IN ('driving', 'walking', 'transit', 'bicycling', 'other')
);

ALTER TABLE public.trips ADD COLUMN IF NOT EXISTS travel_mode_note TEXT NULL;

