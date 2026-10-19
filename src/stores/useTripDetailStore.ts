import { create } from "zustand";

interface TripDetailState {
  selectedStopId: string | null;
  coverFailed: boolean;
  failedStopImages: Record<string, boolean>;

  // Actions
  setSelectedStopId: (stopId: string | null) => void;
  selectStop: (stopId: string, panMap?: boolean) => void;
  setCoverFailed: (failed: boolean) => void;
  markStopImageFailed: (stopId: string) => void;
  resetState: (initialStopId?: string | null) => void;
}

export const useTripDetailStore = create<TripDetailState>((set) => ({
  selectedStopId: null,
  coverFailed: false,
  failedStopImages: {},

  setSelectedStopId: (stopId) => set({ selectedStopId: stopId }),

  selectStop: (stopId, panMap = false) => {
    set({ selectedStopId: stopId });

    if (typeof document !== "undefined") {
      const el = document.getElementById(`stop-item-${stopId}`);
      if (el) {
        el.scrollIntoView({ behavior: "smooth", block: "nearest" });
      }
    }

    if (panMap && typeof window !== "undefined") {
      window.dispatchEvent(
        new CustomEvent("tamroi:pan-to-stop", { detail: { stopId } })
      );
    }
  },

  setCoverFailed: (failed) => set({ coverFailed: failed }),

  markStopImageFailed: (stopId) =>
    set((state) => ({
      failedStopImages: {
        ...state.failedStopImages,
        [stopId]: true,
      },
    })),

  resetState: (initialStopId = null) =>
    set({
      selectedStopId: initialStopId,
      coverFailed: false,
      failedStopImages: {},
    }),
}));

