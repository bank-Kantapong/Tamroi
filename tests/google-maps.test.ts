import { describe, expect, it } from "vitest";
import {
  buildStopNavigationUrl,
  buildTripGoogleMapsLinks,
  formatCoordinatePair,
  isValidCoordinatePair,
} from "@/lib/google-maps";

describe("Google Maps URL generation & coordinate helpers", () => {
  it("validates coordinate ranges accurately", () => {
    expect(isValidCoordinatePair(13.7563, 100.5018)).toBe(true);
    expect(isValidCoordinatePair(-90, -180)).toBe(true);
    expect(isValidCoordinatePair(90, 180)).toBe(true);
    expect(isValidCoordinatePair(90.001, 100)).toBe(false);
    expect(isValidCoordinatePair(-91, 100)).toBe(false);
    expect(isValidCoordinatePair(13, 180.5)).toBe(false);
    expect(isValidCoordinatePair(Number.NaN, 100)).toBe(false);
  });

  it("formats coordinate pairs with requested precision", () => {
    expect(formatCoordinatePair(13.7440812, 100.4941234, 5)).toBe(
      "13.74408, 100.49412"
    );
    expect(formatCoordinatePair(999, 100)).toBe("Invalid coordinates");
  });

  it("builds a properly URL-encoded per-stop navigation link", () => {
    const url = buildStopNavigationUrl(
      {
        place_name: "Wat Pho & Tha Tien",
        latitude: 13.74655,
        longitude: 100.4933,
      },
      "walking"
    );

    const parsed = new URL(url);
    expect(parsed.origin + parsed.pathname).toBe("https://www.google.com/maps/dir/");
    expect(parsed.searchParams.get("api")).toBe("1");
    expect(parsed.searchParams.get("destination")).toBe("13.74655,100.4933");
    expect(parsed.searchParams.get("travelmode")).toBe("walking");
  });

  it("orders stops by sequence and builds a single whole-trip URL when stops <= 10", () => {
    const unorderedStops = [
      {
        place_name: "Stop Three",
        latitude: 13.7418,
        longitude: 100.4961,
        sequence: 3,
      },
      {
        place_name: "Stop One",
        latitude: 13.74408,
        longitude: 100.49412,
        sequence: 1,
      },
      {
        place_name: "Stop Two",
        latitude: 13.74655,
        longitude: 100.4933,
        sequence: 2,
      },
    ];

    const result = buildTripGoogleMapsLinks(unorderedStops, "walking");
    expect(result.hasValidRoute).toBe(true);
    expect(result.isSegmented).toBe(false);
    expect(result.segments).toHaveLength(1);

    const parsed = new URL(result.primaryUrl!);
    expect(parsed.searchParams.get("origin")).toBe("13.74408,100.49412");
    expect(parsed.searchParams.get("destination")).toBe("13.7418,100.4961");
    expect(parsed.searchParams.get("waypoints")).toBe("13.74655,100.4933");
    expect(parsed.searchParams.get("travelmode")).toBe("walking");
  });

  it("splits long itineraries (>10 stops) into continuous overlapping segments", () => {
    const twelveStops = Array.from({ length: 12 }, (_, idx) => ({
      place_name: `Stop #${idx + 1}`,
      latitude: 7.8 + idx * 0.01,
      longitude: 98.3 + idx * 0.01,
      sequence: idx + 1,
    }));

    const result = buildTripGoogleMapsLinks(twelveStops, "driving", 10);
    expect(result.hasValidRoute).toBe(true);
    expect(result.isSegmented).toBe(true);
    expect(result.segments).toHaveLength(2);

    // Segment 1 covers stops 1..10
    expect(result.segments[0].fromStopNumber).toBe(1);
    expect(result.segments[0].toStopNumber).toBe(10);
    expect(result.segments[0].stopCount).toBe(10);

    // Segment 2 starts at stop 10 and finishes at stop 12 (continuous handoff)
    expect(result.segments[1].fromStopNumber).toBe(10);
    expect(result.segments[1].toStopNumber).toBe(12);
    expect(result.segments[1].stopCount).toBe(3);

    const seg1Url = new URL(result.segments[0].url);
    const seg2Url = new URL(result.segments[1].url);
    expect(seg1Url.searchParams.get("destination")).toBe(
      seg2Url.searchParams.get("origin")
    );
  });
});

