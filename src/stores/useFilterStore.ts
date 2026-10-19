import { create } from "zustand";
import { TripFilterParams } from "@/types/trip";

interface FilterState {
  q: string;
  province: string;
  category: string;
  duration: string;
  maxBudget: string;

  // Actions
  setQ: (q: string) => void;
  setProvince: (province: string) => void;
  setCategory: (category: string) => void;
  setDuration: (duration: string) => void;
  setMaxBudget: (maxBudget: string) => void;
  initFromParams: (params: TripFilterParams) => void;
  resetFilters: () => void;
  hasActiveFilters: () => boolean;
}

export const useFilterStore = create<FilterState>((set, get) => ({
  q: "",
  province: "",
  category: "",
  duration: "",
  maxBudget: "",

  setQ: (q) => set({ q }),
  setProvince: (province) => set({ province }),
  setCategory: (category) => set({ category }),
  setDuration: (duration) => set({ duration }),
  setMaxBudget: (maxBudget) => set({ maxBudget }),

  initFromParams: (params) =>
    set({
      q: params.q || "",
      province: params.province || "",
      category: params.category || "",
      duration: params.duration || "",
      maxBudget: params.maxBudget ? String(params.maxBudget) : "",
    }),

  resetFilters: () =>
    set({
      q: "",
      province: "",
      category: "",
      duration: "",
      maxBudget: "",
    }),

  hasActiveFilters: () => {
    const s = get();
    return Boolean(s.q || s.province || s.category || s.duration || s.maxBudget);
  },
}));

