import fs from "node:fs";
import path from "node:path";
import crypto from "node:crypto";
import { createClient, type SupabaseClient } from "@supabase/supabase-js";
import type {
  CreateOrUpdateStopInput,
  CreateOrUpdateTripInput,
  Profile,
  SavedTrip,
  Trip,
  TripFilterParams,
  TripListItem,
  TripStatus,
  TripStop,
  TripSubmissionInput,
  TripWithStops,
  UserRecord,
  UserRole,
} from "../../types/trip";
import { INITIAL_SEED_DATA, type SeedDatabaseState } from "./seed-data.ts";
import { slugify } from "../validation";

export class DuplicateSlugError extends Error {
  constructor(slug: string) {
    super(`A trip with the slug "${slug}" already exists.`);
    this.name = "DuplicateSlugError";
  }
}

export class DuplicateEmailError extends Error {
  constructor(email: string) {
    super(`A user with the email "${email}" already exists.`);
    this.name = "DuplicateEmailError";
  }
}

export class DuplicateSaveError extends Error {
  constructor() {
    super("This trip is already in your saved trips.");
    this.name = "DuplicateSaveError";
  }
}

export class NotFoundError extends Error {
  constructor(message: string) {
    super(message);
    this.name = "NotFoundError";
  }
}

export class ForbiddenError extends Error {
  constructor(message = "You do not have permission to perform this action.") {
    super(message);
    this.name = "ForbiddenError";
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

  // Phase 2: Auth & Profiles
  findUserByEmail(email: string): Promise<UserRecord | null>;
  findUserById(id: string): Promise<UserRecord | null>;
  createUser(
    email: string,
    passwordHash: string,
    salt: string,
    displayName: string,
    role?: UserRole
  ): Promise<{ user: UserRecord; profile: Profile }>;
  getProfile(userId: string): Promise<Profile | null>;
  updateProfile(userId: string, input: { display_name?: string; avatar_url?: string | null }): Promise<Profile>;

  // Phase 2: Saved Trips
  saveTrip(userId: string, tripId: string): Promise<SavedTrip>;
  unsaveTrip(userId: string, tripId: string): Promise<void>;
  isTripSaved(userId: string, tripId: string): Promise<boolean>;
  listSavedTripIds(userId: string): Promise<string[]>;
  listSavedTrips(userId: string): Promise<TripListItem[]>;

  // Phase 2: Community Submissions
  listUserSubmissions(userId: string): Promise<TripListItem[]>;
  getUserSubmissionById(userId: string, tripId: string): Promise<TripWithStops | null>;
  createSubmission(userId: string, input: TripSubmissionInput): Promise<TripWithStops>;
  updateSubmission(userId: string, tripId: string, input: TripSubmissionInput): Promise<TripWithStops>;

  // Phase 2: Admin Moderation
  listPendingSubmissions(): Promise<TripListItem[]>;
  reviewSubmission(
    adminUserId: string,
    tripId: string,
    action: "approve" | "reject",
    rejectionReason?: string | null
  ): Promise<Trip>;
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
      if (!Array.isArray(parsed.users)) parsed.users = [];
      if (!Array.isArray(parsed.profiles)) parsed.profiles = [];
      if (!Array.isArray(parsed.saved_trips)) parsed.saved_trips = [];
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
      travel_mode: input.travel_mode ?? null,
      travel_mode_note: input.travel_mode_note ?? null,
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
      travel_mode: input.travel_mode ?? null,
      travel_mode_note: input.travel_mode_note ?? null,
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
    state.saved_trips = state.saved_trips.filter((s) => s.trip_id !== tripId);
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

  // --- Phase 2: Auth & Profiles ---

  async findUserByEmail(email: string): Promise<UserRecord | null> {
    const state = this.readState();
    const normalized = email.trim().toLowerCase();
    const user = state.users.find((u) => u.email.toLowerCase() === normalized);
    return user ? structuredClone(user) : null;
  }

  async findUserById(id: string): Promise<UserRecord | null> {
    const state = this.readState();
    const user = state.users.find((u) => u.id === id);
    return user ? structuredClone(user) : null;
  }

  async createUser(
    email: string,
    passwordHash: string,
    salt: string,
    displayName: string,
    role: UserRole = "user"
  ): Promise<{ user: UserRecord; profile: Profile }> {
    const state = this.readState();
    const normalized = email.trim().toLowerCase();
    if (state.users.some((u) => u.email.toLowerCase() === normalized)) {
      throw new DuplicateEmailError(normalized);
    }

    const now = new Date().toISOString();
    const userId = crypto.randomUUID();

    const user: UserRecord = {
      id: userId,
      email: normalized,
      password_hash: passwordHash,
      salt,
      created_at: now,
      updated_at: now,
    };

    const profile: Profile = {
      user_id: userId,
      display_name: displayName.trim(),
      avatar_url: null,
      role,
      created_at: now,
      updated_at: now,
    };

    state.users.push(user);
    state.profiles.push(profile);
    this.writeState(state);

    return { user: structuredClone(user), profile: structuredClone(profile) };
  }

  async getProfile(userId: string): Promise<Profile | null> {
    const state = this.readState();
    const profile = state.profiles.find((p) => p.user_id === userId);
    return profile ? structuredClone(profile) : null;
  }

  async updateProfile(
    userId: string,
    input: { display_name?: string; avatar_url?: string | null }
  ): Promise<Profile> {
    const state = this.readState();
    const profile = state.profiles.find((p) => p.user_id === userId);
    if (!profile) {
      throw new NotFoundError(`Profile for user "${userId}" not found.`);
    }

    const now = new Date().toISOString();
    if (typeof input.display_name === "string" && input.display_name.trim().length > 0) {
      profile.display_name = input.display_name.trim();
    }
    if (input.avatar_url !== undefined) {
      profile.avatar_url = input.avatar_url;
    }
    profile.updated_at = now;

    this.writeState(state);
    return structuredClone(profile);
  }

  // --- Phase 2: Saved Trips ---

  async saveTrip(userId: string, tripId: string): Promise<SavedTrip> {
    const state = this.readState();
    const trip = state.trips.find((t) => t.id === tripId);
    if (!trip || trip.status !== "published") {
      throw new NotFoundError("Trip not found or is not published.");
    }

    const exists = state.saved_trips.some(
      (s) => s.user_id === userId && s.trip_id === tripId
    );
    if (exists) {
      throw new DuplicateSaveError();
    }

    const saved: SavedTrip = {
      id: crypto.randomUUID(),
      user_id: userId,
      trip_id: tripId,
      created_at: new Date().toISOString(),
    };

    state.saved_trips.push(saved);
    this.writeState(state);
    return structuredClone(saved);
  }

  async unsaveTrip(userId: string, tripId: string): Promise<void> {
    const state = this.readState();
    const initialLen = state.saved_trips.length;
    state.saved_trips = state.saved_trips.filter(
      (s) => !(s.user_id === userId && s.trip_id === tripId)
    );
    if (state.saved_trips.length !== initialLen) {
      this.writeState(state);
    }
  }

  async isTripSaved(userId: string, tripId: string): Promise<boolean> {
    const state = this.readState();
    return state.saved_trips.some(
      (s) => s.user_id === userId && s.trip_id === tripId
    );
  }

  async listSavedTripIds(userId: string): Promise<string[]> {
    const state = this.readState();
    return state.saved_trips
      .filter((s) => s.user_id === userId)
      .map((s) => s.trip_id);
  }

  async listSavedTrips(userId: string): Promise<TripListItem[]> {
    const state = this.readState();
    const savedIds = new Set(
      state.saved_trips
        .filter((s) => s.user_id === userId)
        .map((s) => s.trip_id)
    );

    const published = state.trips
      .filter((t) => savedIds.has(t.id) && t.status === "published")
      .sort((a, b) => b.created_at.localeCompare(a.created_at));

    return published.map((trip) => ({
      ...trip,
      stop_count: state.trip_stops.filter((s) => s.trip_id === trip.id).length,
    }));
  }

  // --- Phase 2: Community Submissions ---

  async listUserSubmissions(userId: string): Promise<TripListItem[]> {
    const state = this.readState();
    const submissions = state.trips
      .filter((t) => t.created_by === userId)
      .sort((a, b) => b.updated_at.localeCompare(a.updated_at));

    return submissions.map((trip) => ({
      ...trip,
      stop_count: state.trip_stops.filter((s) => s.trip_id === trip.id).length,
    }));
  }

  async getUserSubmissionById(userId: string, tripId: string): Promise<TripWithStops | null> {
    const state = this.readState();
    const trip = state.trips.find((t) => t.id === tripId && t.created_by === userId);
    if (!trip) return null;

    const stops = state.trip_stops
      .filter((s) => s.trip_id === trip.id)
      .sort((a, b) => a.sequence - b.sequence);

    return { ...trip, stops };
  }

  async createSubmission(userId: string, input: TripSubmissionInput): Promise<TripWithStops> {
    const state = this.readState();
    let baseSlug = input.slug?.trim() ? slugify(input.slug) : slugify(input.title);
    if (!baseSlug) baseSlug = `trip-${Date.now()}`;
    let finalSlug = baseSlug;
    let counter = 1;
    while (state.trips.some((t) => t.slug.toLowerCase() === finalSlug.toLowerCase())) {
      finalSlug = `${baseSlug}-${counter++}`;
    }

    const now = new Date().toISOString();
    const status: TripStatus = input.status === "draft" ? "draft" : "pending_review";
    const tripId = crypto.randomUUID();

    const trip: Trip = {
      id: tripId,
      title: input.title.trim(),
      slug: finalSlug,
      short_description: input.short_description.trim(),
      description: input.description.trim(),
      cover_image_url: input.cover_image_url ?? null,
      province: input.province.trim(),
      category: input.category.trim(),
      duration_label: input.duration_label.trim(),
      duration_hours: input.duration_hours ?? null,
      budget_min: input.budget_min ?? null,
      budget_max: input.budget_max ?? null,
      travel_mode: input.travel_mode ?? null,
      travel_mode_note: input.travel_mode_note ?? null,
      status,
      is_sample: false,
      created_by: userId,
      rejection_reason: null,
      submitted_at: status === "pending_review" ? now : null,
      reviewed_at: null,
      reviewed_by: null,
      created_at: now,
      updated_at: now,
    };

    state.trips.push(trip);

    const stops: TripStop[] = input.stops.map((stopInput, index) => ({
      id: crypto.randomUUID(),
      trip_id: tripId,
      place_name: stopInput.place_name.trim(),
      description: stopInput.description.trim(),
      latitude: stopInput.latitude,
      longitude: stopInput.longitude,
      sequence: index + 1,
      image_url: stopInput.image_url ?? null,
      estimated_minutes: stopInput.estimated_minutes ?? null,
      suggested_arrival_time: stopInput.suggested_arrival_time ?? null,
      estimated_cost: stopInput.estimated_cost ?? null,
      notes: stopInput.notes ?? null,
      created_at: now,
      updated_at: now,
    }));

    state.trip_stops.push(...stops);
    this.writeState(state);

    return { ...trip, stops };
  }

  async updateSubmission(
    userId: string,
    tripId: string,
    input: TripSubmissionInput
  ): Promise<TripWithStops> {
    const state = this.readState();
    const trip = state.trips.find((t) => t.id === tripId);
    if (!trip) {
      throw new NotFoundError("Submission not found.");
    }
    if (trip.created_by !== userId) {
      throw new ForbiddenError("You can only edit your own submissions.");
    }
    if (trip.status === "published") {
      throw new ForbiddenError("Published trips cannot be edited via submission workflow.");
    }

    const now = new Date().toISOString();
    const nextStatus: TripStatus = input.status === "draft" ? "draft" : "pending_review";

    trip.title = input.title.trim();
    trip.short_description = input.short_description.trim();
    trip.description = input.description.trim();
    trip.cover_image_url = input.cover_image_url ?? null;
    trip.province = input.province.trim();
    trip.category = input.category.trim();
    trip.duration_label = input.duration_label.trim();
    trip.duration_hours = input.duration_hours ?? null;
    trip.budget_min = input.budget_min ?? null;
    trip.budget_max = input.budget_max ?? null;
    trip.travel_mode = input.travel_mode ?? null;
    trip.travel_mode_note = input.travel_mode_note ?? null;
    trip.status = nextStatus;
    trip.updated_at = now;
    if (nextStatus === "pending_review") {
      trip.submitted_at = now;
      trip.rejection_reason = null;
    }

    state.trip_stops = state.trip_stops.filter((s) => s.trip_id !== tripId);
    const stops: TripStop[] = input.stops.map((stopInput, index) => ({
      id: crypto.randomUUID(),
      trip_id: tripId,
      place_name: stopInput.place_name.trim(),
      description: stopInput.description.trim(),
      latitude: stopInput.latitude,
      longitude: stopInput.longitude,
      sequence: index + 1,
      image_url: stopInput.image_url ?? null,
      estimated_minutes: stopInput.estimated_minutes ?? null,
      suggested_arrival_time: stopInput.suggested_arrival_time ?? null,
      estimated_cost: stopInput.estimated_cost ?? null,
      notes: stopInput.notes ?? null,
      created_at: now,
      updated_at: now,
    }));
    state.trip_stops.push(...stops);

    this.writeState(state);
    return { ...trip, stops };
  }

  // --- Phase 2: Admin Moderation ---

  async listPendingSubmissions(): Promise<TripListItem[]> {
    const state = this.readState();
    const pending = state.trips
      .filter((t) => t.status === "pending_review")
      .sort((a, b) => {
        const timeA = a.submitted_at || a.created_at;
        const timeB = b.submitted_at || b.created_at;
        return timeA.localeCompare(timeB);
      });

    return pending.map((trip) => ({
      ...trip,
      stop_count: state.trip_stops.filter((s) => s.trip_id === trip.id).length,
    }));
  }

  async reviewSubmission(
    adminUserId: string,
    tripId: string,
    action: "approve" | "reject",
    rejectionReason?: string | null
  ): Promise<Trip> {
    const state = this.readState();
    const trip = state.trips.find((t) => t.id === tripId);
    if (!trip) {
      throw new NotFoundError("Submission not found.");
    }
    const now = new Date().toISOString();
    if (action === "approve") {
      trip.status = "published";
      trip.reviewed_at = now;
      trip.reviewed_by = adminUserId;
      trip.rejection_reason = null;
    } else {
      trip.status = "rejected";
      trip.reviewed_at = now;
      trip.reviewed_by = adminUserId;
      trip.rejection_reason = rejectionReason?.trim() || "Rejected by administrator.";
    }
    trip.updated_at = now;
    this.writeState(state);
    return structuredClone(trip);
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
        travel_mode: input.travel_mode ?? null,
      travel_mode_note: input.travel_mode_note ?? null,
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
        travel_mode: input.travel_mode ?? null,
      travel_mode_note: input.travel_mode_note ?? null,
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

  // --- Phase 2: Auth & Profiles (Supabase) ---

  async findUserByEmail(email: string): Promise<UserRecord | null> {
    const { data, error } = await this.adminClient.auth.admin.listUsers();
    if (error || !data) return null;
    const normalized = email.trim().toLowerCase();
    const user = data.users.find((u) => u.email?.toLowerCase() === normalized);
    if (!user) return null;
    return {
      id: user.id,
      email: user.email!,
      password_hash: "",
      salt: "",
      created_at: user.created_at,
      updated_at: user.updated_at || user.created_at,
    };
  }

  async findUserById(id: string): Promise<UserRecord | null> {
    const { data, error } = await this.adminClient.auth.admin.getUserById(id);
    if (error || !data.user) return null;
    const u = data.user;
    return {
      id: u.id,
      email: u.email!,
      password_hash: "",
      salt: "",
      created_at: u.created_at,
      updated_at: u.updated_at || u.created_at,
    };
  }

  async createUser(
    email: string,
    passwordHash: string,
    _salt: string,
    displayName: string,
    role: UserRole = "user"
  ): Promise<{ user: UserRecord; profile: Profile }> {
    const normalized = email.trim().toLowerCase();
    const { data, error } = await this.adminClient.auth.admin.createUser({
      email: normalized,
      password: passwordHash,
      email_confirm: true,
    });
    if (error) {
      if (error.message.toLowerCase().includes("already registered")) {
        throw new DuplicateEmailError(normalized);
      }
      throw new Error(error.message);
    }

    const now = new Date().toISOString();
    const profile: Profile = {
      user_id: data.user.id,
      display_name: displayName.trim(),
      avatar_url: null,
      role,
      created_at: now,
      updated_at: now,
    };

    const { error: profileErr } = await this.adminClient.from("profiles").upsert(profile);
    if (profileErr) throw new Error(profileErr.message);

    const userRecord: UserRecord = {
      id: data.user.id,
      email: normalized,
      password_hash: "",
      salt: "",
      created_at: now,
      updated_at: now,
    };

    return { user: userRecord, profile };
  }

  async getProfile(userId: string): Promise<Profile | null> {
    const { data, error } = await this.adminClient
      .from("profiles")
      .select("*")
      .eq("user_id", userId)
      .maybeSingle();

    if (error) throw new Error(error.message);
    return data as Profile | null;
  }

  async updateProfile(
    userId: string,
    input: { display_name?: string; avatar_url?: string | null }
  ): Promise<Profile> {
    const updatePayload: Record<string, unknown> = {
      updated_at: new Date().toISOString(),
    };
    if (input.display_name !== undefined) updatePayload.display_name = input.display_name.trim();
    if (input.avatar_url !== undefined) updatePayload.avatar_url = input.avatar_url;

    const { data, error } = await this.adminClient
      .from("profiles")
      .update(updatePayload)
      .eq("user_id", userId)
      .select("*")
      .single();

    if (error) throw new Error(error.message);
    return data as Profile;
  }

  // --- Phase 2: Saved Trips (Supabase) ---

  async saveTrip(userId: string, tripId: string): Promise<SavedTrip> {
    const { data: trip, error: tripErr } = await this.adminClient
      .from("trips")
      .select("id, status")
      .eq("id", tripId)
      .maybeSingle();

    if (tripErr) throw new Error(tripErr.message);
    if (!trip || trip.status !== "published") {
      throw new NotFoundError("Trip not found or is not published.");
    }

    const { data, error } = await this.adminClient
      .from("saved_trips")
      .insert({ user_id: userId, trip_id: tripId })
      .select("*")
      .single();

    if (error) {
      if (error.code === "23505" || error.message.toLowerCase().includes("unique")) {
        throw new DuplicateSaveError();
      }
      throw new Error(error.message);
    }

    return data as SavedTrip;
  }

  async unsaveTrip(userId: string, tripId: string): Promise<void> {
    const { error } = await this.adminClient
      .from("saved_trips")
      .delete()
      .eq("user_id", userId)
      .eq("trip_id", tripId);

    if (error) throw new Error(error.message);
  }

  async isTripSaved(userId: string, tripId: string): Promise<boolean> {
    const { data, error } = await this.adminClient
      .from("saved_trips")
      .select("id")
      .eq("user_id", userId)
      .eq("trip_id", tripId)
      .maybeSingle();

    if (error) throw new Error(error.message);
    return !!data;
  }

  async listSavedTripIds(userId: string): Promise<string[]> {
    const { data, error } = await this.adminClient
      .from("saved_trips")
      .select("trip_id")
      .eq("user_id", userId);

    if (error) throw new Error(error.message);
    return (data ?? []).map((row) => String(row.trip_id));
  }

  async listSavedTrips(userId: string): Promise<TripListItem[]> {
    const { data: savedRows, error: savedErr } = await this.adminClient
      .from("saved_trips")
      .select("trip_id, created_at")
      .eq("user_id", userId)
      .order("created_at", { ascending: false });

    if (savedErr) throw new Error(savedErr.message);
    if (!savedRows || savedRows.length === 0) return [];

    const tripIds = savedRows.map((r) => r.trip_id);
    const { data: tripsData, error: tripsErr } = await this.adminClient
      .from("trips")
      .select("*, trip_stops(count)")
      .in("id", tripIds)
      .eq("status", "published");

    if (tripsErr) throw new Error(tripsErr.message);

    const tripMap = new Map((tripsData ?? []).map((t) => [t.id, t]));
    const result: TripListItem[] = [];

    for (const row of savedRows) {
      const trip = tripMap.get(row.trip_id);
      if (trip) {
        const count = (trip.trip_stops as Array<{ count: number }>)?.[0]?.count ?? 0;
        const { trip_stops: _ignored, ...rest } = trip;
        void _ignored;
        result.push({
          ...(rest as unknown as Trip),
          duration_hours: rest.duration_hours !== null ? Number(rest.duration_hours) : null,
          stop_count: count,
        });
      }
    }

    return result;
  }

  // --- Phase 2: Community Submissions (Supabase) ---

  async listUserSubmissions(userId: string): Promise<TripListItem[]> {
    const { data, error } = await this.adminClient
      .from("trips")
      .select("*, trip_stops(count)")
      .eq("created_by", userId)
      .order("updated_at", { ascending: false });

    if (error) throw new Error(error.message);

    return (data ?? []).map((row: Record<string, unknown>) => {
      const count = (row.trip_stops as Array<{ count: number }>)?.[0]?.count ?? 0;
      const { trip_stops: _ignored, ...rest } = row;
      void _ignored;
      return {
        ...(rest as unknown as Trip),
        duration_hours: rest.duration_hours !== null ? Number(rest.duration_hours) : null,
        stop_count: count,
      };
    });
  }

  async getUserSubmissionById(userId: string, tripId: string): Promise<TripWithStops | null> {
    const { data: trip, error } = await this.adminClient
      .from("trips")
      .select("*")
      .eq("id", tripId)
      .eq("created_by", userId)
      .maybeSingle();

    if (error) throw new Error(error.message);
    if (!trip) return null;

    const { data: stops, error: stopsError } = await this.adminClient
      .from("trip_stops")
      .select("*")
      .eq("trip_id", tripId)
      .order("sequence", { ascending: true });

    if (stopsError) throw new Error(stopsError.message);

    return {
      ...(trip as Trip),
      duration_hours: trip.duration_hours !== null ? Number(trip.duration_hours) : null,
      stops: (stops ?? []) as TripStop[],
    };
  }

  async createSubmission(userId: string, input: TripSubmissionInput): Promise<TripWithStops> {
    let baseSlug = input.slug?.trim() ? slugify(input.slug) : slugify(input.title);
    if (!baseSlug) baseSlug = `trip-${Date.now()}`;
    let finalSlug = baseSlug;

    const { data: existing } = await this.adminClient
      .from("trips")
      .select("id")
      .eq("slug", finalSlug)
      .maybeSingle();

    if (existing) {
      finalSlug = `${baseSlug}-${Date.now().toString(36)}`;
    }

    const now = new Date().toISOString();
    const status: TripStatus = input.status === "draft" ? "draft" : "pending_review";

    const { data: createdTrip, error: tripErr } = await this.adminClient
      .from("trips")
      .insert({
        title: input.title.trim(),
        slug: finalSlug,
        short_description: input.short_description.trim(),
        description: input.description.trim(),
        cover_image_url: input.cover_image_url ?? null,
        province: input.province.trim(),
        category: input.category.trim(),
        duration_label: input.duration_label.trim(),
        duration_hours: input.duration_hours ?? null,
        budget_min: input.budget_min ?? null,
        budget_max: input.budget_max ?? null,
        travel_mode: input.travel_mode ?? null,
      travel_mode_note: input.travel_mode_note ?? null,
        status,
        is_sample: false,
        created_by: userId,
        rejection_reason: null,
        submitted_at: status === "pending_review" ? now : null,
      })
      .select("*")
      .single();

    if (tripErr) throw new Error(tripErr.message);

    const stopsPayload = input.stops.map((stopInput, index) => ({
      trip_id: createdTrip.id,
      place_name: stopInput.place_name.trim(),
      description: stopInput.description.trim(),
      latitude: stopInput.latitude,
      longitude: stopInput.longitude,
      sequence: index + 1,
      image_url: stopInput.image_url ?? null,
      estimated_minutes: stopInput.estimated_minutes ?? null,
      suggested_arrival_time: stopInput.suggested_arrival_time ?? null,
      estimated_cost: stopInput.estimated_cost ?? null,
      notes: stopInput.notes ?? null,
    }));

    const { data: createdStops, error: stopsErr } = await this.adminClient
      .from("trip_stops")
      .insert(stopsPayload)
      .select("*")
      .order("sequence", { ascending: true });

    if (stopsErr) throw new Error(stopsErr.message);

    return {
      ...(createdTrip as Trip),
      stops: (createdStops ?? []) as TripStop[],
    };
  }

  async updateSubmission(
    userId: string,
    tripId: string,
    input: TripSubmissionInput
  ): Promise<TripWithStops> {
    const { data: existing, error: findErr } = await this.adminClient
      .from("trips")
      .select("*")
      .eq("id", tripId)
      .maybeSingle();

    if (findErr) throw new Error(findErr.message);
    if (!existing) throw new NotFoundError("Submission not found.");
    if (existing.created_by !== userId) {
      throw new ForbiddenError("You can only edit your own submissions.");
    }
    if (existing.status === "published") {
      throw new ForbiddenError("Published trips cannot be edited via submission workflow.");
    }

    const now = new Date().toISOString();
    const nextStatus: TripStatus = input.status === "draft" ? "draft" : "pending_review";

    const { data: updatedTrip, error: updateErr } = await this.adminClient
      .from("trips")
      .update({
        title: input.title.trim(),
        short_description: input.short_description.trim(),
        description: input.description.trim(),
        cover_image_url: input.cover_image_url ?? null,
        province: input.province.trim(),
        category: input.category.trim(),
        duration_label: input.duration_label.trim(),
        duration_hours: input.duration_hours ?? null,
        budget_min: input.budget_min ?? null,
        budget_max: input.budget_max ?? null,
        travel_mode: input.travel_mode ?? null,
      travel_mode_note: input.travel_mode_note ?? null,
        status: nextStatus,
        updated_at: now,
        submitted_at: nextStatus === "pending_review" ? now : existing.submitted_at,
        rejection_reason: nextStatus === "pending_review" ? null : existing.rejection_reason,
      })
      .eq("id", tripId)
      .select("*")
      .single();

    if (updateErr) throw new Error(updateErr.message);

    await this.adminClient.from("trip_stops").delete().eq("trip_id", tripId);

    const stopsPayload = input.stops.map((stopInput, index) => ({
      trip_id: tripId,
      place_name: stopInput.place_name.trim(),
      description: stopInput.description.trim(),
      latitude: stopInput.latitude,
      longitude: stopInput.longitude,
      sequence: index + 1,
      image_url: stopInput.image_url ?? null,
      estimated_minutes: stopInput.estimated_minutes ?? null,
      suggested_arrival_time: stopInput.suggested_arrival_time ?? null,
      estimated_cost: stopInput.estimated_cost ?? null,
      notes: stopInput.notes ?? null,
    }));

    const { data: createdStops, error: stopsErr } = await this.adminClient
      .from("trip_stops")
      .insert(stopsPayload)
      .select("*")
      .order("sequence", { ascending: true });

    if (stopsErr) throw new Error(stopsErr.message);

    return {
      ...(updatedTrip as Trip),
      stops: (createdStops ?? []) as TripStop[],
    };
  }

  // --- Phase 2: Admin Moderation (Supabase) ---

  async listPendingSubmissions(): Promise<TripListItem[]> {
    const { data, error } = await this.adminClient
      .from("trips")
      .select("*, trip_stops(count)")
      .eq("status", "pending_review")
      .order("submitted_at", { ascending: true });

    if (error) throw new Error(error.message);

    return (data ?? []).map((row: Record<string, unknown>) => {
      const count = (row.trip_stops as Array<{ count: number }>)?.[0]?.count ?? 0;
      const { trip_stops: _ignored, ...rest } = row;
      void _ignored;
      return {
        ...(rest as unknown as Trip),
        duration_hours: rest.duration_hours !== null ? Number(rest.duration_hours) : null,
        stop_count: count,
      };
    });
  }

  async reviewSubmission(
    adminUserId: string,
    tripId: string,
    action: "approve" | "reject",
    rejectionReason?: string | null
  ): Promise<Trip> {
    const now = new Date().toISOString();
    const isUuid =
      typeof adminUserId === "string" &&
      /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i.test(adminUserId);

    const updatePayload: Record<string, unknown> = {
      status: action === "approve" ? "published" : "rejected",
      reviewed_at: now,
      reviewed_by: isUuid ? adminUserId : null,
      rejection_reason:
        action === "reject" ? rejectionReason?.trim() || "Rejected by administrator." : null,
      updated_at: now,
    };

    const { data, error } = await this.adminClient
      .from("trips")
      .update(updatePayload)
      .eq("id", tripId)
      .select("*")
      .single();

    if (error) throw new Error(error.message);
    return data as Trip;
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
