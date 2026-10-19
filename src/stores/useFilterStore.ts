import { create } from "zustand";
import { TripFilterParams, TripListItem } from "@/types/trip";

interface FilterState {
  q: string;
  province: string;
  category: string;
  duration: string;
  maxBudget: string;

  // Async search state
  trips: TripListItem[];
  isLoading: boolean;
  totalCount: number;

  // Actions
  setQ: (q: string) => void;
  setProvince: (province: string) => void;
  setCategory: (category: string) => void;
  setDuration: (duration: string) => void;
  setMaxBudget: (maxBudget: string) => void;
  initFromParams: (params: TripFilterParams, initialTrips?: TripListItem[]) => void;
  resetFilters: () => void;
  hasActiveFilters: () => boolean;
  fetchTrips: () => Promise<void>;
}

export const useFilterStore = create<FilterState>((set, get) => ({
  q: "",
  province: "",
  category: "",
  duration: "",
  maxBudget: "",

  trips: [],
  isLoading: false,
  totalCount: 0,

  setQ: (q) => set({ q }),
  setProvince: (province) => set({ province }),
  setCategory: (category) => set({ category }),
  setDuration: (duration) => set({ duration }),
  setMaxBudget: (maxBudget) => set({ maxBudget }),

  initFromParams: (params, initialTrips) => {
    set((state) => ({
      q: params.q || "",
      province: params.province || "",
      category: params.category || "",
      duration: params.duration || "",
      maxBudget: params.maxBudget ? String(params.maxBudget) : "",
      trips: initialTrips ?? state.trips,
      totalCount: initialTrips ? initialTrips.length : state.totalCount,
    }));
  },

  resetFilters: () => {
    set({
      q: "",
      province: "",
      category: "",
      duration: "",
      maxBudget: "",
    });
  },

  hasActiveFilters: () => {
    const s = get();
    return Boolean(s.q || s.province || s.category || s.duration || s.maxBudget);
  },

  fetchTrips: async () => {
    const s = get();
    set({ isLoading: true });

    try {
      const params = new URLSearchParams();
      if (s.q.trim()) params.set("q", s.q.trim());
      if (s.province.trim()) params.set("province", s.province.trim());
      if (s.category.trim()) params.set("category", s.category.trim());
      if (s.duration.trim()) params.set("duration", s.duration.trim());
      if (s.maxBudget.trim()) params.set("maxBudget", s.maxBudget.trim());

      const queryString = params.toString();
      const url = queryString ? `/api/trips?${queryString}` : `/api/trips`;

      // Update browser URL without triggering server navigation or page reload
      const nextBrowserUrl = queryString ? `/?${queryString}` : "/";
      if (typeof window !== "undefined") {
        window.history.replaceState(null, "", nextBrowserUrl);
      }

      const res = await fetch(url);
      if (!res.ok) {
        throw new Error("Failed to fetch trips");
      }

      const data = await res.json();
      set({
        trips: data.trips || [],
        totalCount: data.totalCount ?? (data.trips ? data.trips.length : 0),
        isLoading: false,
      });
    } catch (err) {
      console.error("Filter fetchTrips error:", err);
      set({ isLoading: false });
    }
  },
}));
