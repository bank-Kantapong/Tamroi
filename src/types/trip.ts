export type TravelMode = "driving" | "walking" | "transit" | "bicycling";

export type TripStatus = "draft" | "published";

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
  status: TripStatus;
  is_sample: boolean;
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
  travel_mode: TravelMode;
  status: TripStatus;
  is_sample?: boolean;
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

