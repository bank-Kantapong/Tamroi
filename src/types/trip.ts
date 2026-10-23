export type TravelMode = "driving" | "walking" | "transit" | "bicycling" | "other" | null;

export type TripStatus = "draft" | "pending_review" | "published" | "rejected";

export type UserRole = "user" | "admin";

export interface Profile {
  user_id: string;
  display_name: string;
  avatar_url: string | null;
  role: UserRole;
  is_banned?: boolean;
  banned_reason?: string | null;
  warning_message?: string | null;
  warning_count?: number;
  created_at: string;
  updated_at: string;
}

export interface SavedTrip {
  id: string;
  user_id: string;
  trip_id: string;
  created_at: string;
}

export interface UserRecord {
  id: string;
  email: string;
  password_hash: string;
  salt: string;
  created_at: string;
  updated_at: string;
}

export interface SessionUser {
  id: string;
  email: string;
  display_name: string;
  role: UserRole;
  avatar_url: string | null;
  is_banned?: boolean;
  banned_reason?: string | null;
  warning_message?: string | null;
  warning_count?: number;
}

export interface AdminUserListItem {
  id: string;
  email: string;
  display_name: string;
  avatar_url: string | null;
  role: UserRole;
  is_banned: boolean;
  banned_reason: string | null;
  warning_message: string | null;
  warning_count: number;
  post_count: number;
  created_at: string;
}

export interface TripStop {
  id: string;
  trip_id: string;
  place_name: string;
  description: string;
  latitude: number;
  longitude: number;
  sequence: number;
  image_url: string | null;
  estimated_minutes: number | null;
  suggested_arrival_time: string | null;
  estimated_cost: number | null;
  notes: string | null;
  created_at: string;
  updated_at: string;
}

export interface Trip {
  id: string;
  title: string;
  slug: string;
  short_description: string;
  description: string;
  cover_image_url: string | null;
  province: string;
  category: string;
  duration_label: string;
  duration_hours: number | null;
  budget_min: number | null;
  budget_max: number | null;
  travel_mode: TravelMode;
  travel_mode_note?: string | null;
  latitude?: number | null;
  longitude?: number | null;
  location_name?: string | null;
  status: TripStatus;
  is_sample: boolean;
  created_by?: string | null;
  moderation_note?: string | null;
  rejection_reason?: string | null;
  submitted_at?: string | null;
  reviewed_at?: string | null;
  reviewed_by?: string | null;
  created_at: string;
  updated_at: string;
}

export interface TripWithStops extends Trip {
  stops: TripStop[];
}

export interface TripListItem extends Trip {
  stop_count: number;
}

export interface TripFilterParams {
  q?: string;
  province?: string;
  category?: string;
  duration?: string;
  maxBudget?: number;
}

export interface CreateOrUpdateTripInput {
  title: string;
  slug: string;
  short_description: string;
  description: string;
  cover_image_url?: string | null;
  province: string;
  category: string;
  duration_label: string;
  duration_hours?: number | null;
  budget_min?: number | null;
  budget_max?: number | null;
  travel_mode?: TravelMode;
  travel_mode_note?: string | null;
  latitude?: number | null;
  longitude?: number | null;
  location_name?: string | null;
  status: TripStatus;
  is_sample?: boolean;
  created_by?: string | null;
  moderation_note?: string | null;
  rejection_reason?: string | null;
  submitted_at?: string | null;
  reviewed_at?: string | null;
  reviewed_by?: string | null;
}

export interface TripSubmissionInput {
  title: string;
  slug?: string;
  short_description: string;
  description: string;
  cover_image_url?: string | null;
  province: string;
  category: string;
  duration_label: string;
  duration_hours?: number | null;
  budget_min?: number | null;
  budget_max?: number | null;
  travel_mode?: TravelMode;
  travel_mode_note?: string | null;
  latitude?: number | null;
  longitude?: number | null;
  location_name?: string | null;
  status?: "draft" | "pending_review" | "published";
  moderation_note?: string | null;
  stops: CreateOrUpdateStopInput[];
}

export interface ModerationActionInput {
  action: "approve" | "reject";
  rejection_reason?: string | null;
}

export interface CreateOrUpdateStopInput {
  place_name: string;
  description: string;
  latitude: number;
  longitude: number;
  sequence?: number;
  image_url?: string | null;
  estimated_minutes?: number | null;
  suggested_arrival_time?: string | null;
  estimated_cost?: number | null;
  notes?: string | null;
}

