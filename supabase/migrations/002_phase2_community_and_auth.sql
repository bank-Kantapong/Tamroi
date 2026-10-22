-- ============================================================================
-- TAMROI (ตามรอย) — Phase 2 Community Submissions, User Profiles & Saved Trips
-- ============================================================================
-- Non-destructive additive migration.
-- Preserves all Phase 1 trips and stop records without data loss.
-- ============================================================================

-- 1. Extend trips table with moderation and ownership fields
ALTER TABLE public.trips
  ADD COLUMN IF NOT EXISTS created_by UUID NULL REFERENCES auth.users(id) ON DELETE SET NULL,
  ADD COLUMN IF NOT EXISTS rejection_reason TEXT NULL,
  ADD COLUMN IF NOT EXISTS submitted_at TIMESTAMPTZ NULL,
  ADD COLUMN IF NOT EXISTS reviewed_at TIMESTAMPTZ NULL,
  ADD COLUMN IF NOT EXISTS reviewed_by UUID NULL REFERENCES auth.users(id) ON DELETE SET NULL;

-- Expand status check constraint to include pending_review and rejected
ALTER TABLE public.trips DROP CONSTRAINT IF EXISTS trips_status_check;
ALTER TABLE public.trips ADD CONSTRAINT trips_status_check
  CHECK (status IN ('draft', 'pending_review', 'published', 'rejected'));

-- Index for creator lookup and moderation status filter
CREATE INDEX IF NOT EXISTS idx_trips_created_by ON public.trips(created_by);
CREATE INDEX IF NOT EXISTS idx_trips_submitted_at ON public.trips(submitted_at);

-- 2. Create profiles table
CREATE TABLE IF NOT EXISTS public.profiles (
  user_id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  display_name TEXT NOT NULL CHECK (char_length(trim(display_name)) >= 2),
  avatar_url TEXT NULL,
  role TEXT NOT NULL DEFAULT 'user' CHECK (role IN ('user', 'admin')),
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- Trigger for profiles updated_at
DROP TRIGGER IF EXISTS trg_profiles_updated_at ON public.profiles;
CREATE TRIGGER trg_profiles_updated_at
  BEFORE UPDATE ON public.profiles
  FOR EACH ROW
  EXECUTE FUNCTION public.set_updated_at();

-- 3. Create saved_trips table
CREATE TABLE IF NOT EXISTS public.saved_trips (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  trip_id UUID NOT NULL REFERENCES public.trips(id) ON DELETE CASCADE,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  CONSTRAINT saved_trips_user_trip_key UNIQUE (user_id, trip_id)
);

CREATE INDEX IF NOT EXISTS idx_saved_trips_user_id ON public.saved_trips(user_id);
CREATE INDEX IF NOT EXISTS idx_saved_trips_trip_id ON public.saved_trips(trip_id);

-- 4. Row Level Security (RLS) Policies

-- Profiles RLS
ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Public can read profiles" ON public.profiles;
CREATE POLICY "Public can read profiles"
  ON public.profiles
  FOR SELECT
  TO anon, authenticated
  USING (true);

DROP POLICY IF EXISTS "Users can insert their own profile" ON public.profiles;
CREATE POLICY "Users can insert their own profile"
  ON public.profiles
  FOR INSERT
  TO authenticated
  WITH CHECK (auth.uid() = user_id);

DROP POLICY IF EXISTS "Users can update their own profile" ON public.profiles;
CREATE POLICY "Users can update their own profile"
  ON public.profiles
  FOR UPDATE
  TO authenticated
  USING (auth.uid() = user_id)
  WITH CHECK (auth.uid() = user_id);

-- Saved Trips RLS
ALTER TABLE public.saved_trips ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Users can read own saved trips" ON public.saved_trips;
CREATE POLICY "Users can read own saved trips"
  ON public.saved_trips
  FOR SELECT
  TO authenticated
  USING (auth.uid() = user_id);

DROP POLICY IF EXISTS "Users can insert own saved trips" ON public.saved_trips;
CREATE POLICY "Users can insert own saved trips"
  ON public.saved_trips
  FOR INSERT
  TO authenticated
  WITH CHECK (auth.uid() = user_id);

DROP POLICY IF EXISTS "Users can delete own saved trips" ON public.saved_trips;
CREATE POLICY "Users can delete own saved trips"
  ON public.saved_trips
  FOR DELETE
  TO authenticated
  USING (auth.uid() = user_id);

-- Trips RLS updates
DROP POLICY IF EXISTS "Public can read published trips" ON public.trips;
CREATE POLICY "Public or creator can read trips"
  ON public.trips
  FOR SELECT
  TO anon, authenticated
  USING (
    status = 'published'
    OR (auth.uid() IS NOT NULL AND created_by = auth.uid())
  );

DROP POLICY IF EXISTS "Users can insert own draft or pending trips" ON public.trips;
CREATE POLICY "Users can insert own draft or pending trips"
  ON public.trips
  FOR INSERT
  TO authenticated
  WITH CHECK (
    auth.uid() = created_by
    AND status IN ('draft', 'pending_review')
  );

DROP POLICY IF EXISTS "Users can update own draft or pending trips" ON public.trips;
CREATE POLICY "Users can update own draft or pending trips"
  ON public.trips
  FOR UPDATE
  TO authenticated
  USING (
    auth.uid() = created_by
    AND status IN ('draft', 'pending_review', 'rejected')
  )
  WITH CHECK (
    auth.uid() = created_by
    AND status IN ('draft', 'pending_review')
  );

-- Stops RLS updates
DROP POLICY IF EXISTS "Public can read stops of published trips" ON public.trip_stops;
CREATE POLICY "Public or creator can read stops"
  ON public.trip_stops
  FOR SELECT
  TO anon, authenticated
  USING (
    EXISTS (
      SELECT 1 FROM public.trips
      WHERE public.trips.id = public.trip_stops.trip_id
        AND (
          public.trips.status = 'published'
          OR (auth.uid() IS NOT NULL AND public.trips.created_by = auth.uid())
        )
    )
  );

