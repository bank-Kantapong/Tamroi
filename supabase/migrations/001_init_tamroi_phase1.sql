-- ============================================================================
-- TAMROI (ตามรอย) — Phase 1 Initial PostgreSQL / Supabase Migration
-- ============================================================================
-- Purpose:
--   Creates the `trips` and `trip_stops` tables, indexes, constraints,
--   automatic `updated_at` triggers, and Row Level Security (RLS) policies
--   separating public read access (published trips only) from privileged
--   service-role admin mutations.
-- ============================================================================

CREATE EXTENSION IF NOT EXISTS "pgcrypto";

-- 1. trips table
CREATE TABLE IF NOT EXISTS public.trips (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  title TEXT NOT NULL CHECK (char_length(trim(title)) > 0),
  slug TEXT NOT NULL UNIQUE CHECK (slug ~ '^[a-z0-9]+(?:-[a-z0-9]+)*$'),
  short_description TEXT NOT NULL CHECK (char_length(trim(short_description)) > 0),
  description TEXT NOT NULL CHECK (char_length(trim(description)) > 0),
  cover_image_url TEXT NULL,
  province TEXT NOT NULL CHECK (char_length(trim(province)) > 0),
  category TEXT NOT NULL CHECK (char_length(trim(category)) > 0),
  duration_label TEXT NOT NULL CHECK (char_length(trim(duration_label)) > 0),
  duration_hours NUMERIC(5, 1) NULL CHECK (duration_hours IS NULL OR duration_hours > 0),
  budget_min INTEGER NULL CHECK (budget_min IS NULL OR budget_min >= 0),
  budget_max INTEGER NULL CHECK (budget_max IS NULL OR (budget_max >= 0 AND (budget_min IS NULL OR budget_max >= budget_min))),
  travel_mode TEXT NOT NULL DEFAULT 'driving' CHECK (travel_mode IN ('driving', 'walking', 'transit', 'bicycling')),
  status TEXT NOT NULL DEFAULT 'draft' CHECK (status IN ('draft', 'published')),
  is_sample BOOLEAN NOT NULL DEFAULT FALSE,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- 2. trip_stops table
CREATE TABLE IF NOT EXISTS public.trip_stops (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  trip_id UUID NOT NULL REFERENCES public.trips(id) ON DELETE CASCADE,
  place_name TEXT NOT NULL CHECK (char_length(trim(place_name)) > 0),
  description TEXT NOT NULL CHECK (char_length(trim(description)) > 0),
  latitude DOUBLE PRECISION NOT NULL CHECK (latitude >= -90 AND latitude <= 90),
  longitude DOUBLE PRECISION NOT NULL CHECK (longitude >= -180 AND longitude <= 180),
  sequence INTEGER NOT NULL CHECK (sequence >= 1),
  image_url TEXT NULL,
  estimated_minutes INTEGER NULL CHECK (estimated_minutes IS NULL OR estimated_minutes >= 0),
  suggested_arrival_time TEXT NULL,
  estimated_cost INTEGER NULL CHECK (estimated_cost IS NULL OR estimated_cost >= 0),
  notes TEXT NULL,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  CONSTRAINT trip_stops_trip_sequence_key UNIQUE (trip_id, sequence) DEFERRABLE INITIALLY DEFERRED
);

-- 3. Indexes for search, filtering, and ordered itinerary lookup
CREATE INDEX IF NOT EXISTS idx_trips_status ON public.trips(status);
CREATE INDEX IF NOT EXISTS idx_trips_province ON public.trips(province);
CREATE INDEX IF NOT EXISTS idx_trips_category ON public.trips(category);
CREATE INDEX IF NOT EXISTS idx_trip_stops_trip_sequence ON public.trip_stops(trip_id, sequence ASC);

-- 4. Automatic updated_at trigger
CREATE OR REPLACE FUNCTION public.set_updated_at()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

DROP TRIGGER IF EXISTS trg_trips_updated_at ON public.trips;
CREATE TRIGGER trg_trips_updated_at
  BEFORE UPDATE ON public.trips
  FOR EACH ROW
  EXECUTE FUNCTION public.set_updated_at();

DROP TRIGGER IF EXISTS trg_trip_stops_updated_at ON public.trip_stops;
CREATE TRIGGER trg_trip_stops_updated_at
  BEFORE UPDATE ON public.trip_stops
  FOR EACH ROW
  EXECUTE FUNCTION public.set_updated_at();

-- 5. Row Level Security (RLS)
-- Public anonymous users can only read published trips and their stops.
-- Admin mutations use the server-only SUPABASE_SERVICE_ROLE_KEY after passing
-- server-side admin session authentication.
ALTER TABLE public.trips ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.trip_stops ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Public can read published trips" ON public.trips;
CREATE POLICY "Public can read published trips"
  ON public.trips
  FOR SELECT
  TO anon, authenticated
  USING (status = 'published');

DROP POLICY IF EXISTS "Public can read stops of published trips" ON public.trip_stops;
CREATE POLICY "Public can read stops of published trips"
  ON public.trip_stops
  FOR SELECT
  TO anon, authenticated
  USING (
    EXISTS (
      SELECT 1 FROM public.trips
      WHERE public.trips.id = public.trip_stops.trip_id
        AND public.trips.status = 'published'
    )
  );

