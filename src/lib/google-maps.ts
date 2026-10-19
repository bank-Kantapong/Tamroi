import type { TravelMode, TripStop } from "@/types/trip";

/**
 * Google Maps URLs standard limit:
 * On mobile and desktop web, Google Maps reliably supports 1 origin + 1 destination
 * + up to 8 intermediate waypoints (10 stops total per URL).
 * When a trip has more than 10 stops, we split it into sequential overlapping
 * route segments where the end of Segment N becomes the origin of Segment N+1.
 */
export const MAX_STOPS_PER_GOOGLE_MAPS_SEGMENT = 10;

export interface RouteSegmentLink {
  segmentIndex: number;
  label: string;
  fromStopNumber: number;
  toStopNumber: number;
  fromPlaceName: string;
  toPlaceName: string;
  stopCount: number;
  url: string;
}

export interface TripGoogleMapsResult {
  hasValidRoute: boolean;
  isSegmented: boolean;
  primaryUrl: string | null;
  segments: RouteSegmentLink[];
  reason?: string;
}

export function isValidCoordinatePair(lat: number, lng: number): boolean {
  return (
    typeof lat === "number" &&
    typeof lng === "number" &&
    Number.isFinite(lat) &&
    Number.isFinite(lng) &&
    lat >= -90 &&
    lat <= 90 &&
    lng >= -180 &&
    lng <= 180
  );
}

export function formatCoordinatePair(lat: number, lng: number, decimals = 5): string {
  if (!isValidCoordinatePair(lat, lng)) {
    return "Invalid coordinates";
  }
  return `${lat.toFixed(decimals)}, ${lng.toFixed(decimals)}`;
}

/**
 * Generates a Google Maps navigation link to a single stop using official
 * Google Maps URLs format (`https://www.google.com/maps/dir/?api=1&...`).
 * Uses URLSearchParams so all parameters are safely URL-encoded.
 */
export function buildStopNavigationUrl(
  stop: Pick<TripStop, "latitude" | "longitude" | "place_name">,
  travelMode: TravelMode = "driving"
): string {
  if (!isValidCoordinatePair(stop.latitude, stop.longitude)) {
    const fallbackParams = new URLSearchParams({
      api: "1",
      query: stop.place_name.trim(),
    });
    return `https://www.google.com/maps/search/?${fallbackParams.toString()}`;
  }

  const destinationCoord = `${Number(stop.latitude.toFixed(6))},${Number(stop.longitude.toFixed(6))}`;
  const params = new URLSearchParams({
    api: "1",
    destination: destinationCoord,
    travelmode: travelMode,
  });

  return `https://www.google.com/maps/dir/?${params.toString()}`;
}

/**
 * Generates a Google Maps URL for a slice of ordered stops (between 1 and 10 stops).
 */
function buildSegmentUrl(
  stops: Pick<TripStop, "latitude" | "longitude" | "place_name">[],
  travelMode: TravelMode
): string {
  if (stops.length === 1) {
    return buildStopNavigationUrl(stops[0], travelMode);
  }

  const first = stops[0];
  const last = stops[stops.length - 1];
  const intermediate = stops.slice(1, -1);

  const origin = `${Number(first.latitude.toFixed(6))},${Number(first.longitude.toFixed(6))}`;
  const destination = `${Number(last.latitude.toFixed(6))},${Number(last.longitude.toFixed(6))}`;

  const params = new URLSearchParams({
    api: "1",
    origin,
    destination,
    travelmode: travelMode,
  });

  if (intermediate.length > 0) {
    const waypointsValue = intermediate
      .map((s) => `${Number(s.latitude.toFixed(6))},${Number(s.longitude.toFixed(6))}`)
      .join("|");
    params.set("waypoints", waypointsValue);
  }

  return `https://www.google.com/maps/dir/?${params.toString()}`;
}

/**
 * Builds the whole-trip Google Maps itinerary link(s).
 * - Filters and sorts stops by `sequence` ascending.
 * - If stops <= 10, returns a single whole-trip URL.
 * - If stops > 10, splits into overlapping segments of up to 10 stops each
 *   (e.g., Stops 1–10, Stops 10–19, etc.) so the traveler has a continuous route.
 */
export function buildTripGoogleMapsLinks(
  stops: Pick<TripStop, "latitude" | "longitude" | "place_name" | "sequence">[],
  travelMode: TravelMode = "driving",
  maxStopsPerSegment: number = MAX_STOPS_PER_GOOGLE_MAPS_SEGMENT
): TripGoogleMapsResult {
  const validOrderedStops = [...stops]
    .filter((s) => isValidCoordinatePair(s.latitude, s.longitude))
    .sort((a, b) => a.sequence - b.sequence);

  if (validOrderedStops.length === 0) {
    return {
      hasValidRoute: false,
      isSegmented: false,
      primaryUrl: null,
      segments: [],
      reason: "No stops with valid coordinates are available for this trip.",
    };
  }

  if (validOrderedStops.length === 1) {
    const singleStop = validOrderedStops[0];
    const url = buildStopNavigationUrl(singleStop, travelMode);
    return {
      hasValidRoute: true,
      isSegmented: false,
      primaryUrl: url,
      segments: [
        {
          segmentIndex: 1,
          label: `Stop 1: ${singleStop.place_name}`,
          fromStopNumber: 1,
          toStopNumber: 1,
          fromPlaceName: singleStop.place_name,
          toPlaceName: singleStop.place_name,
          stopCount: 1,
          url,
        },
      ],
    };
  }

  const safeCap = Math.max(2, maxStopsPerSegment);

  if (validOrderedStops.length <= safeCap) {
    const url = buildSegmentUrl(validOrderedStops, travelMode);
    return {
      hasValidRoute: true,
      isSegmented: false,
      primaryUrl: url,
      segments: [
        {
          segmentIndex: 1,
          label: `Full Route (Stops 1–${validOrderedStops.length})`,
          fromStopNumber: 1,
          toStopNumber: validOrderedStops.length,
          fromPlaceName: validOrderedStops[0].place_name,
          toPlaceName: validOrderedStops[validOrderedStops.length - 1].place_name,
          stopCount: validOrderedStops.length,
          url,
        },
      ],
    };
  }

  // Split into overlapping segments so each segment starts where the previous one ended
  const segments: RouteSegmentLink[] = [];
  const stepSize = safeCap - 1;
  let startIdx = 0;
  let segmentIndex = 1;

  while (startIdx < validOrderedStops.length - 1) {
    const endIdx = Math.min(startIdx + stepSize, validOrderedStops.length - 1);
    const slice = validOrderedStops.slice(startIdx, endIdx + 1);
    const fromStopNumber = startIdx + 1;
    const toStopNumber = endIdx + 1;

    segments.push({
      segmentIndex,
      label: `Part ${segmentIndex}: Stops ${fromStopNumber}–${toStopNumber}`,
      fromStopNumber,
      toStopNumber,
      fromPlaceName: slice[0].place_name,
      toPlaceName: slice[slice.length - 1].place_name,
      stopCount: slice.length,
      url: buildSegmentUrl(slice, travelMode),
    });

    startIdx = endIdx;
    segmentIndex += 1;
  }

  return {
    hasValidRoute: true,
    isSegmented: true,
    primaryUrl: segments[0]?.url ?? null,
    segments,
  };
}

