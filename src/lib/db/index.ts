import {
  LocalFileTripRepository,
  SupabaseTripRepository,
  type TripRepository,
} from "./repository.ts";

let cachedRepo: TripRepository | null = null;

export function getTripRepository(): TripRepository {
  if (cachedRepo) {
    return cachedRepo;
  }

  const mode = (process.env.TAMROI_DATA_BACKEND || "auto").toLowerCase();
  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL?.trim();
  const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY?.trim();
  const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY?.trim();

  if (mode === "supabase") {
    if (!supabaseUrl || !supabaseAnonKey || !supabaseServiceKey) {
      throw new Error(
        "TAMROI_DATA_BACKEND is set to 'supabase', but NEXT_PUBLIC_SUPABASE_URL, NEXT_PUBLIC_SUPABASE_ANON_KEY, or SUPABASE_SERVICE_ROLE_KEY is missing."
      );
    }
    cachedRepo = new SupabaseTripRepository(supabaseUrl, supabaseAnonKey, supabaseServiceKey);
    return cachedRepo;
  }

  if (mode === "auto" && supabaseUrl && supabaseAnonKey && supabaseServiceKey) {
    cachedRepo = new SupabaseTripRepository(supabaseUrl, supabaseAnonKey, supabaseServiceKey);
    return cachedRepo;
  }

  cachedRepo = new LocalFileTripRepository();
  return cachedRepo;
}

export * from "./repository.ts";
