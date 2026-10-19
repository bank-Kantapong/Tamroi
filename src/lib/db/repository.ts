import fs from "node:fs";
import path from "node:path";
import crypto from "node:crypto";
import { createClient, type SupabaseClient } from "@supabase/supabase-js";
import type {
  CreateOrUpdateStopInput,
  CreateOrUpdateTripInput,
  Trip,
  TripFilterParams,
  TripListItem,
  TripStatus,
  TripStop,
  TripWithStops,
} from "../../types/trip";
import { INITIAL_SEED_DATA, type SeedDatabaseState } from "./seed-data.ts";

export class DuplicateSlugError extends Error {
  constructor(slug: string) {
    super(`A trip with the slug "${slug}" already exists.`);
    this.name = "DuplicateSlugError";
  }
}

export class NotFoundError extends Error {
  constructor(message: string) {
    super(message);
    this.name = "NotFoundError";
  }
}

export interface TripFilterMetadata {
  provinces: string[];
  categories: string[];
  durations: string[];
}

export interface TripRepository {
  readonly backendName: "local-json" | "supabase-postgres";
  listPublishedTrips(filters?: TripFilterParams): Promise<TripListItem[]>;
  getPublishedFilterMetadata(): Promise<TripFilterMetadata>;
  getPublishedTripBySlug(slug: string): Promise<TripWithStops | null>;
  listAllTripsForAdmin(): Promise<TripListItem[]>;
  getTripByIdForAdmin(tripId: string): Promise<TripWithStops | null>;
  getTripBySlugForAdmin(slug: string): Promise<TripWithStops | null>;
  createTrip(input: CreateOrUpdateTripInput): Promise<Trip>;
  updateTrip(tripId: string, input: CreateOrUpdateTripInput): Promise<Trip>;
  setTripStatus(tripId: string, status: TripStatus): Promise<Trip>;
  deleteTrip(tripId: string): Promise<void>;
  createStop(tripId: string, input: CreateOrUpdateStopInput): Promise<TripStop>;
  updateStop(tripId: string, stopId: string, input: CreateOrUpdateStopInput): Promise<TripStop>;
  deleteStop(tripId: string, stopId: string): Promise<void>;
  reorderStops(tripId: string, orderedStopIds: string[]): Promise<TripStop[]>;
  resetToSeedData(): Promise<void>;
}

const BILINGUAL_SEARCH_ALIASES: Record<string, string> = {
  "sample-rattanakosin-riverside-walk":
    "กรุงเทพ เกาะรัตนโกสินทร์ ท่าเตียน วัดโพธิ์ ปากคลองตลาด มิวเซียมสยาม สวนลอยฟ้า เดินเล่น ไหว้พระ",
  "sample-chiang-mai-old-city-loop":
    "เชียงใหม่ คูเมือง ประตูท่าแพ สามกษัตริย์ วัดเจดีย์หลวง วัดพระสิงห์ คาเฟ่ กาแฟ",
  "sample-phuket-scenic-11-stops":
    "ภูเก็ต เมืองเก่า ถนนถลาง ซอยรมณีย์ เขารัง วัดฉลอง ราไวย์ แหลมพรหมเทพ ทะเล จุดชมวิว",
  "sample-draft-ayutthaya-cycling":
    "อยุธยา ปั่นจักรยาน วัดมหาธาตุ เมืองเก่า",
};

function matchesTripFilters(trip: Trip, filters?: TripFilterParams): boolean {
  if (!filters) return true;

  if (filters.q && filters.q.trim().length > 0) {
    const q = filters.q.trim().toLowerCase();
    const extraKeywords = BILINGUAL_SEARCH_ALIASES[trip.slug] || "";
    const haystack = `${trip.title} ${trip.short_description} ${trip.description} ${trip.province} ${trip.category} ${extraKeywords}`.toLowerCase();
    if (!haystack.includes(q)) {
      return false;
    }
  }

  if (filters.province && filters.province.trim().length > 0) {
    if (trip.province.toLowerCase() !== filters.province.trim().toLowerCase()) {
      return false;
    }
  }

  if (filters.category && filters.category.trim().length > 0) {
    if (trip.category.toLowerCase() !== filters.category.trim().toLowerCase()) {
      return false;
    }
  }

  if (filters.duration && filters.duration.trim().length > 0) {
    const d = filters.duration.trim().toLowerCase();
    if (d === "half-day") {
      if (trip.duration_hours !== null ? trip.duration_hours > 5 : !trip.duration_label.toLowerCase().includes("half")) {
        return false;
      }
    } else if (d === "full-day") {
      if (
        trip.duration_hours !== null
          ? trip.duration_hours <= 5 || trip.duration_hours > 12
          : !trip.duration_label.toLowerCase().includes("1 day")
      ) {
        return false;
      }
    } else if (d === "multi-day") {
      if (
        trip.duration_hours !== null
          ? trip.duration_hours <= 12
          : !trip.duration_label.toLowerCase().includes("days")
      ) {
        return false;
      }
    } else if (trip.duration_label.toLowerCase() !== d) {
      return false;
    }
  }

  if (typeof filters.maxBudget === "number" && Number.isFinite(filters.maxBudget) && filters.maxBudget > 0) {
    const effectiveMinBudget = trip.budget_min ?? trip.budget_max;
    if (effectiveMinBudget !== null && effectiveMinBudget > filters.maxBudget) {
      return false;
    }
  }

  return true;
}

/**
 * Local file-backed relational repository for $0 zero-configuration local dev and testing.
 */
export class LocalFileTripRepository implements TripRepository {
  public readonly backendName = "local-json" as const;
  private readonly filePath: string;

  constructor(customFilePath?: string) {
    const resolved =
      customFilePath ||
      process.env.TAMROI_LOCAL_DB_PATH ||
      path.join(process.cwd(), "data", "tamroi-db.json");
    this.filePath = path.isAbsolute(resolved) ? resolved : path.join(process.cwd(), resolved);
  }

  private readState(): SeedDatabaseState {
    if (!fs.existsSync(this.filePath)) {
      const initial = structuredClone(INITIAL_SEED_DATA);
      this.writeState(initial);
      return initial;
    }
    try {
      const raw = fs.readFileSync(this.filePath, "utf8");
      const parsed = JSON.parse(raw) as SeedDatabaseState;
      if (!parsed || !Array.isArray(parsed.trips) || !Array.isArray(parsed.trip_stops)) {
        const initial = structuredClone(INITIAL_SEED_DATA);
        this.writeState(initial);
        return initial;
      }
      return parsed;
    } catch {
      const initial = structuredClone(INITIAL_SEED_DATA);
      this.writeState(initial);
      return initial;
    }
  }

  private writeState(state: SeedDatabaseState): void {
    const dir = path.dirname(this.filePath);
    if (!fs.existsSync(dir)) {
      fs.mkdirSync(dir, { recursive: true });
    }
    fs.writeFileSync(this.filePath, JSON.stringify(state, null, 2), "utf8");
  }

  private normalizeStopSequences(state: SeedDatabaseState, tripId: string): TripStop[] {
    const tripStops = state.trip_stops
      .filter((s) => s.trip_id === tripId)
      .sort((a, b) => a.sequence - b.sequence || a.created_at.localeCompare(b.created_at));

    tripStops.forEach((stop, index) => {
      stop.sequence = index + 1;
    });

    return tripStops;
  }

  async listPublishedTrips(filters?: TripFilterParams): Promise<TripListItem[]> {
    const state = this.readState();
    const published = state.trips
      .filter((t) => t.status === "published")
      .filter((t) => matchesTripFilters(t, filters))
      .sort((a, b) => b.created_at.localeCompare(a.created_at));

    return published.map((trip) => ({
      ...trip,
      stop_count: state.trip_stops.filter((s) => s.trip_id === trip.id).length,
    }));
  }

  async getPublishedFilterMetadata(): Promise<TripFilterMetadata> {
    const state = this.readState();
    const published = state.trips.filter((t) => t.status === "published");
    const provinces = Array.from(new Set(published.map((t) => t.province))).sort();
    const categories = Array.from(new Set(published.map((t) => t.category))).sort();
    const durations = Array.from(new Set(published.map((t) => t.duration_label))).sort();
    return { provinces, categories, durations };
  }

  async getPublishedTripBySlug(slug: string): Promise<TripWithStops | null> {
    const state = this.readState();
    const normalizedSlug = slug.trim().toLowerCase();
    const trip = state.trips.find(
      (t) => t.slug.toLowerCase() === normalizedSlug && t.status === "published"
    );
    if (!trip) return null;

    const stops = state.trip_stops
      .filter((s) => s.trip_id === trip.id)
      .sort((a, b) => a.sequence - b.sequence);

    return { ...trip, stops };
  }

  async listAllTripsForAdmin(): Promise<TripListItem[]> {
    const state = this.readState();
    return [...state.trips]
      .sort((a, b) => b.updated_at.localeCompare(a.updated_at))
      .map((trip) => ({
        ...trip,
        stop_count: state.trip_stops.filter((s) => s.trip_id === trip.id).length,
      }));
  }

  async getTripByIdForAdmin(tripId: string): Promise<TripWithStops | null> {
    const state = this.readState();
    const trip = state.trips.find((t) => t.id === tripId);
    if (!trip) return null;
    const stops = state.trip_stops
      .filter((s) => s.trip_id === trip.id)
      .sort((a, b) => a.sequence - b.sequence);
    return { ...trip, stops };
  }

  async getTripBySlugForAdmin(slug: string): Promise<TripWithStops | null> {
    const state = this.readState();
    const normalizedSlug = slug.trim().toLowerCase();
    const trip = state.trips.find((t) => t.slug.toLowerCase() === normalizedSlug);
    if (!trip) return null;
    const stops = state.trip_stops
      .filter((s) => s.trip_id === trip.id)
      .sort((a, b) => a.sequence - b.sequence);
    return { ...trip, stops };
  }

  async createTrip(input: CreateOrUpdateTripInput): Promise<Trip> {
    const state = this.readState();
    const slugLower = input.slug.trim().toLowerCase();
    if (state.trips.some((t) => t.slug.toLowerCase() === slugLower)) {
      throw new DuplicateSlugError(slugLower);
    }

    const now = new Date().toISOString();
    const newTrip: Trip = {
      id: crypto.randomUUID(),
      title: input.title.trim(),
      slug: slugLower,
      short_description: input.short_description.trim(),
      description: input.description.trim(),
      cover_image_url: input.cover_image_url ?? null,
      province: input.province.trim(),
      category: input.category.trim(),
      duration_label: input.duration_label.trim(),
      duration_hours: input.duration_hours ?? null,
      budget_min: input.budget_min ?? null,
      budget_max: input.budget_max ?? null,
      travel_mode: input.travel_mode,
      status: input.status,
      is_sample: input.is_sample ?? false,
      created_at: now,
      updated_at: now,
    };

    state.trips.push(newTrip);
    this.writeState(state);
    return newTrip;
  }

  async updateTrip(tripId: string, input: CreateOrUpdateTripInput): Promise<Trip> {
    const state = this.readState();
    const index = state.trips.findIndex((t) => t.id === tripId);
    if (index === -1) {
      throw new NotFoundError(`Trip "${tripId}" not found.`);
    }

    const slugLower = input.slug.trim().toLowerCase();
    if (state.trips.some((t) => t.id !== tripId && t.slug.toLowerCase() === slugLower)) {
      throw new DuplicateSlugError(slugLower);
    }

    const existing = state.trips[index];
    const updated: Trip = {
      ...existing,
      title: input.title.trim(),
      slug: slugLower,
      short_description: input.short_description.trim(),
      description: input.description.trim(),
      cover_image_url: input.cover_image_url ?? null,
      province: input.province.trim(),
      category: input.category.trim(),
      duration_label: input.duration_label.trim(),
      duration_hours: input.duration_hours ?? null,
      budget_min: input.budget_min ?? null,
      budget_max: input.budget_max ?? null,
      travel_mode: input.travel_mode,
      status: input.status,
      is_sample: input.is_sample ?? existing.is_sample,
      updated_at: new Date().toISOString(),
    };

    state.trips[index] = updated;
    this.writeState(state);
    return updated;
  }

  async setTripStatus(tripId: string, status: TripStatus): Promise<Trip> {
    const state = this.readState();
    const trip = state.trips.find((t) => t.id === tripId);
    if (!trip) {
      throw new NotFoundError(`Trip "${tripId}" not found.`);
    }
    trip.status = status;
    trip.updated_at = new Date().toISOString();
    this.writeState(state);
    return trip;
  }

  async deleteTrip(tripId: string): Promise<void> {
    const state = this.readState();
    const exists = state.trips.some((t) => t.id === tripId);
    if (!exists) {
      throw new NotFoundError(`Trip "${tripId}" not found.`);
    }
    state.trips = state.trips.filter((t) => t.id !== tripId);
    state.trip_stops = state.trip_stops.filter((s) => s.trip_id !== tripId);
    this.writeState(state);
  }

  async createStop(tripId: string, input: CreateOrUpdateStopInput): Promise<TripStop> {
    const state = this.readState();
    const trip = state.trips.find((t) => t.id === tripId);
    if (!trip) {
      throw new NotFoundError(`Trip "${tripId}" not found.`);
    }

    const existingStops = state.trip_stops
      .filter((s) => s.trip_id === tripId)
      .sort((a, b) => a.sequence - b.sequence);

    const desiredSeq =
      input.sequence && input.sequence >= 1 && input.sequence <= existingStops.length + 1
        ? input.sequence
        : existingStops.length + 1;

    // Shift sequences at or after desiredSeq
    for (const s of existingStops) {
      if (s.sequence >= desiredSeq) {
        s.sequence += 1;
      }
    }

    const now = new Date().toISOString();
    const newStop: TripStop = {
      id: crypto.randomUUID(),
      trip_id: tripId,
      place_name: input.place_name.trim(),
      description: input.description.trim(),
      latitude: input.latitude,
      longitude: input.longitude,
      sequence: desiredSeq,
      image_url: input.image_url ?? null,
      estimated_minutes: input.estimated_minutes ?? null,
      suggested_arrival_time: input.suggested_arrival_time ?? null,
      estimated_cost: input.estimated_cost ?? null,
      notes: input.notes ?? null,
      created_at: now,
      updated_at: now,
    };

    state.trip_stops.push(newStop);
    this.normalizeStopSequences(state, tripId);
    trip.updated_at = now;
    this.writeState(state);
    return newStop;
  }

  async updateStop(
    tripId: string,
    stopId: string,
    input: CreateOrUpdateStopInput
  ): Promise<TripStop> {
    const state = this.readState();
    const stopIndex = state.trip_stops.findIndex(
      (s) => s.id === stopId && s.trip_id === tripId
    );
    if (stopIndex === -1) {
      throw new NotFoundError(`Stop "${stopId}" not found in trip "${tripId}".`);
    }

    const now = new Date().toISOString();
    const existing = state.trip_stops[stopIndex];
    const updated: TripStop = {
      ...existing,
      place_name: input.place_name.trim(),
      description: input.description.trim(),
      latitude: input.latitude,
      longitude: input.longitude,
      image_url: input.image_url ?? null,
      estimated_minutes: input.estimated_minutes ?? null,
      suggested_arrival_time: input.suggested_arrival_time ?? null,
      estimated_cost: input.estimated_cost ?? null,
      notes: input.notes ?? null,
      updated_at: now,
    };

    state.trip_stops[stopIndex] = updated;
    const trip = state.trips.find((t) => t.id === tripId);
    if (trip) trip.updated_at = now;
    this.writeState(state);
    return updated;
  }

  async deleteStop(tripId: string, stopId: string): Promise<void> {
    const state = this.readState();
    const exists = state.trip_stops.some((s) => s.id === stopId && s.trip_id === tripId);
    if (!exists) {
      throw new NotFoundError(`Stop "${stopId}" not found in trip "${tripId}".`);
    }

    state.trip_stops = state.trip_stops.filter(
      (s) => !(s.id === stopId && s.trip_id === tripId)
    );
    this.normalizeStopSequences(state, tripId);

    const trip = state.trips.find((t) => t.id === tripId);
    if (trip) trip.updated_at = new Date().toISOString();
    this.writeState(state);
  }

  async reorderStops(tripId: string, orderedStopIds: string[]): Promise<TripStop[]> {
    const state = this.readState();
    const trip = state.trips.find((t) => t.id === tripId);
    if (!trip) {
      throw new NotFoundError(`Trip "${tripId}" not found.`);
    }

    const currentStops = state.trip_stops.filter((s) => s.trip_id === tripId);
    if (currentStops.length !== orderedStopIds.length) {
      throw new Error("Ordered stop IDs count does not match existing stops for this trip.");
    }

    const stopMap = new Map(currentStops.map((s) => [s.id, s]));
    const now = new Date().toISOString();

    orderedStopIds.forEach((id, idx) => {
      const stop = stopMap.get(id);
      if (!stop) {
        throw new Error(`Stop ID "${id}" does not belong to trip "${tripId}".`);
      }
      stop.sequence = idx + 1;
      stop.updated_at = now;
    });

    trip.updated_at = now;
    this.writeState(state);

    return state.trip_stops
      .filter((s) => s.trip_id === tripId)
      .sort((a, b) => a.sequence - b.sequence);
  }

  async resetToSeedData(): Promise<void> {
    this.writeState(structuredClone(INITIAL_SEED_DATA));
  }
}

/**
 * Supabase PostgreSQL repository (Free Tier compatible).
 * Uses the anon key for public read operations and service_role key for server-side admin writes.
 */
export class SupabaseTripRepository implements TripRepository {
  public readonly backendName = "supabase-postgres" as const;
  private readonly publicClient: SupabaseClient;
  private readonly adminClient: SupabaseClient;

  constructor(url: string, anonKey: string, serviceRoleKey: string) {
    this.publicClient = createClient(url, anonKey, {
      auth: { persistSession: false },
    });
    this.adminClient = createClient(url, serviceRoleKey, {
      auth: { persistSession: false },
    });
  }

  async listPublishedTrips(filters?: TripFilterParams): Promise<TripListItem[]> {
    const { data: tripsData, error } = await this.publicClient
      .from("trips")
      .select("*, trip_stops(count)")
      .eq("status", "published")
      .order("created_at", { ascending: false });

    if (error) {
      throw new Error(`Supabase query failed: ${error.message}`);
    }

    const items: TripListItem[] = (tripsData ?? []).map((row: Record<string, unknown>) => {
      const stopCountArr = row.trip_stops as Array<{ count: number }> | undefined;
      const count = stopCountArr?.[0]?.count ?? 0;
      const { trip_stops: _ignored, ...rest } = row;
      void _ignored;
      return {
        ...(rest as unknown as Trip),
        duration_hours: rest.duration_hours !== null ? Number(rest.duration_hours) : null,
        stop_count: count,
      };
    });

    return items.filter((trip) => matchesTripFilters(trip, filters));
  }

  async getPublishedFilterMetadata(): Promise<TripFilterMetadata> {
    const { data, error } = await this.publicClient
      .from("trips")
      .select("province, category, duration_label")
      .eq("status", "published");

    if (error) {
      throw new Error(`Supabase metadata query failed: ${error.message}`);
    }

    const rows = data ?? [];
    return {
      provinces: Array.from(new Set(rows.map((r) => String(r.province)))).sort(),
      categories: Array.from(new Set(rows.map((r) => String(r.category)))).sort(),
      durations: Array.from(new Set(rows.map((r) => String(r.duration_label)))).sort(),
    };
  }

  async getPublishedTripBySlug(slug: string): Promise<TripWithStops | null> {
    const { data: trip, error } = await this.publicClient
      .from("trips")
      .select("*")
      .eq("slug", slug.trim().toLowerCase())
      .eq("status", "published")
      .maybeSingle();

    if (error) {
      throw new Error(`Supabase trip lookup failed: ${error.message}`);
    }
    if (!trip) return null;

    const { data: stops, error: stopsError } = await this.publicClient
      .from("trip_stops")
      .select("*")
      .eq("trip_id", trip.id)
      .order("sequence", { ascending: true });

    if (stopsError) {
      throw new Error(`Supabase stops lookup failed: ${stopsError.message}`);
    }

    return {
      ...(trip as Trip),
      duration_hours: trip.duration_hours !== null ? Number(trip.duration_hours) : null,
      stops: (stops ?? []) as TripStop[],
    };
  }

  async listAllTripsForAdmin(): Promise<TripListItem[]> {
    const { data, error } = await this.adminClient
      .from("trips")
      .select("*, trip_stops(count)")
      .order("updated_at", { ascending: false });

    if (error) {
      throw new Error(`Supabase admin list failed: ${error.message}`);
    }

    return (data ?? []).map((row: Record<string, unknown>) => {
      const stopCountArr = row.trip_stops as Array<{ count: number }> | undefined;
      const count = stopCountArr?.[0]?.count ?? 0;
      const { trip_stops: _ignored, ...rest } = row;
      void _ignored;
      return {
        ...(rest as unknown as Trip),
        duration_hours: rest.duration_hours !== null ? Number(rest.duration_hours) : null,
        stop_count: count,
      };
    });
  }

  async getTripByIdForAdmin(tripId: string): Promise<TripWithStops | null> {
    const { data: trip, error } = await this.adminClient
      .from("trips")
      .select("*")
      .eq("id", tripId)
      .maybeSingle();

    if (error) throw new Error(error.message);
    if (!trip) return null;

    const { data: stops, error: stopsError } = await this.adminClient
      .from("trip_stops")
      .select("*")
      .eq("trip_id", trip.id)
      .order("sequence", { ascending: true });

    if (stopsError) throw new Error(stopsError.message);

    return {
      ...(trip as Trip),
      duration_hours: trip.duration_hours !== null ? Number(trip.duration_hours) : null,
      stops: (stops ?? []) as TripStop[],
    };
  }

  async getTripBySlugForAdmin(slug: string): Promise<TripWithStops | null> {
    const { data: trip, error } = await this.adminClient
      .from("trips")
      .select("*")
      .eq("slug", slug.trim().toLowerCase())
      .maybeSingle();

    if (error) throw new Error(error.message);
    if (!trip) return null;

    const { data: stops, error: stopsError } = await this.adminClient
      .from("trip_stops")
      .select("*")
      .eq("trip_id", trip.id)
      .order("sequence", { ascending: true });

    if (stopsError) throw new Error(stopsError.message);

    return {
      ...(trip as Trip),
      duration_hours: trip.duration_hours !== null ? Number(trip.duration_hours) : null,
      stops: (stops ?? []) as TripStop[],
    };
  }

  async createTrip(input: CreateOrUpdateTripInput): Promise<Trip> {
    const slugLower = input.slug.trim().toLowerCase();
    const { data: existing } = await this.adminClient
      .from("trips")
      .select("id")
      .eq("slug", slugLower)
      .maybeSingle();

    if (existing) {
      throw new DuplicateSlugError(slugLower);
    }

    const { data, error } = await this.adminClient
      .from("trips")
      .insert({
        title: input.title.trim(),
        slug: slugLower,
        short_description: input.short_description.trim(),
        description: input.description.trim(),
        cover_image_url: input.cover_image_url ?? null,
        province: input.province.trim(),
        category: input.category.trim(),
        duration_label: input.duration_label.trim(),
        duration_hours: input.duration_hours ?? null,
        budget_min: input.budget_min ?? null,
        budget_max: input.budget_max ?? null,
        travel_mode: input.travel_mode,
        status: input.status,
        is_sample: input.is_sample ?? false,
      })
      .select("*")
      .single();

    if (error) throw new Error(error.message);
    return data as Trip;
  }

  async updateTrip(tripId: string, input: CreateOrUpdateTripInput): Promise<Trip> {
    const slugLower = input.slug.trim().toLowerCase();
    const { data: conflict } = await this.adminClient
      .from("trips")
      .select("id")
      .eq("slug", slugLower)
      .neq("id", tripId)
      .maybeSingle();

    if (conflict) {
      throw new DuplicateSlugError(slugLower);
    }

    const { data, error } = await this.adminClient
      .from("trips")
      .update({
        title: input.title.trim(),
        slug: slugLower,
        short_description: input.short_description.trim(),
        description: input.description.trim(),
        cover_image_url: input.cover_image_url ?? null,
        province: input.province.trim(),
        category: input.category.trim(),
        duration_label: input.duration_label.trim(),
        duration_hours: input.duration_hours ?? null,
        budget_min: input.budget_min ?? null,
        budget_max: input.budget_max ?? null,
        travel_mode: input.travel_mode,
        status: input.status,
      })
      .eq("id", tripId)
      .select("*")
      .single();

    if (error) throw new Error(error.message);
    return data as Trip;
  }

  async setTripStatus(tripId: string, status: TripStatus): Promise<Trip> {
    const { data, error } = await this.adminClient
      .from("trips")
      .update({ status })
      .eq("id", tripId)
      .select("*")
      .single();

    if (error) throw new Error(error.message);
    return data as Trip;
  }

  async deleteTrip(tripId: string): Promise<void> {
    const { error } = await this.adminClient.from("trips").delete().eq("id", tripId);
    if (error) throw new Error(error.message);
  }

  async createStop(tripId: string, input: CreateOrUpdateStopInput): Promise<TripStop> {
    const { data: currentStops, error: listErr } = await this.adminClient
      .from("trip_stops")
      .select("id, sequence")
      .eq("trip_id", tripId)
      .order("sequence", { ascending: true });

    if (listErr) throw new Error(listErr.message);
    const nextSequence = (currentStops?.length ?? 0) + 1;

    const { data, error } = await this.adminClient
      .from("trip_stops")
      .insert({
        trip_id: tripId,
        place_name: input.place_name.trim(),
        description: input.description.trim(),
        latitude: input.latitude,
        longitude: input.longitude,
        sequence: nextSequence,
        image_url: input.image_url ?? null,
        estimated_minutes: input.estimated_minutes ?? null,
        suggested_arrival_time: input.suggested_arrival_time ?? null,
        estimated_cost: input.estimated_cost ?? null,
        notes: input.notes ?? null,
      })
      .select("*")
      .single();

    if (error) throw new Error(error.message);
    return data as TripStop;
  }

  async updateStop(
    tripId: string,
    stopId: string,
    input: CreateOrUpdateStopInput
  ): Promise<TripStop> {
    const { data, error } = await this.adminClient
      .from("trip_stops")
      .update({
        place_name: input.place_name.trim(),
        description: input.description.trim(),
        latitude: input.latitude,
        longitude: input.longitude,
        image_url: input.image_url ?? null,
        estimated_minutes: input.estimated_minutes ?? null,
        suggested_arrival_time: input.suggested_arrival_time ?? null,
        estimated_cost: input.estimated_cost ?? null,
        notes: input.notes ?? null,
      })
      .eq("id", stopId)
      .eq("trip_id", tripId)
      .select("*")
      .single();

    if (error) throw new Error(error.message);
    return data as TripStop;
  }

  async deleteStop(tripId: string, stopId: string): Promise<void> {
    const { error } = await this.adminClient
      .from("trip_stops")
      .delete()
      .eq("id", stopId)
      .eq("trip_id", tripId);

    if (error) throw new Error(error.message);

    // Re-normalize remaining stop sequences 1..N
    const { data: remaining } = await this.adminClient
      .from("trip_stops")
      .select("id")
      .eq("trip_id", tripId)
      .order("sequence", { ascending: true });

    if (remaining && remaining.length > 0) {
      await this.reorderStops(
        tripId,
        remaining.map((r) => String(r.id))
      );
    }
  }

  async reorderStops(tripId: string, orderedStopIds: string[]): Promise<TripStop[]> {
    // Two-phase sequence update to avoid unique constraint collisions when deferred constraints aren't active in REST calls
    for (let i = 0; i < orderedStopIds.length; i++) {
      const { error: tempErr } = await this.adminClient
        .from("trip_stops")
        .update({ sequence: 10000 + i + 1 })
        .eq("id", orderedStopIds[i])
        .eq("trip_id", tripId);
      if (tempErr) throw new Error(tempErr.message);
    }

    for (let i = 0; i < orderedStopIds.length; i++) {
      const { error: finalErr } = await this.adminClient
        .from("trip_stops")
        .update({ sequence: i + 1 })
        .eq("id", orderedStopIds[i])
        .eq("trip_id", tripId);
      if (finalErr) throw new Error(finalErr.message);
    }

    const { data, error } = await this.adminClient
      .from("trip_stops")
      .select("*")
      .eq("trip_id", tripId)
      .order("sequence", { ascending: true });

    if (error) throw new Error(error.message);
    return (data ?? []) as TripStop[];
  }

  async resetToSeedData(): Promise<void> {
    await this.adminClient
      .from("trips")
      .delete()
      .neq("id", "00000000-0000-0000-0000-000000000000");
    const { error: tripErr } = await this.adminClient
      .from("trips")
      .insert(INITIAL_SEED_DATA.trips);
    if (tripErr) throw new Error(tripErr.message);

    const { error: stopErr } = await this.adminClient
      .from("trip_stops")
      .insert(INITIAL_SEED_DATA.trip_stops);
    if (stopErr) throw new Error(stopErr.message);
  }
}
