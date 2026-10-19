import { describe, expect, it } from "vitest";
import { slugify, stopInputSchema, tripInputSchema } from "@/lib/validation";

describe("Server-side Zod validation schemas", () => {
  it("normalizes titles into URL-safe slugs", () => {
    expect(slugify("  Chiang Mai: Old City & Cafe Loop! ")).toBe(
      "chiang-mai-old-city-cafe-loop"
    );
  });

  it("accepts a valid trip payload and normalizes optional fields", () => {
    const parsed = tripInputSchema.safeParse({
      title: "Nan Scenic Mountain Loop",
      slug: "nan-scenic-mountain-loop",
      short_description: "A curated 2-day driving loop through Nan's mountain viewpoints.",
      description:
        "Follow Highway 1081 and 1256 in sequence with scenic viewpoints, local coffee stops, and heritage temples.",
      cover_image_url: "",
      province: "Nan",
      category: "Nature & Scenic",
      duration_label: "2 Days 1 Night",
      duration_hours: "16",
      budget_min: "1500",
      budget_max: "3500",
      travel_mode: "driving",
      status: "published",
      is_sample: false,
    });

    expect(parsed.success).toBe(true);
    if (parsed.success) {
      expect(parsed.data.cover_image_url).toBeNull();
      expect(parsed.data.duration_hours).toBe(16);
      expect(parsed.data.budget_min).toBe(1500);
      expect(parsed.data.budget_max).toBe(3500);
    }
  });

  it("rejects invalid slug formats and inverted budget ranges", () => {
    const result = tripInputSchema.safeParse({
      title: "Invalid Trip",
      slug: "Invalid Slug With Spaces!",
      short_description: "Valid short description for test.",
      description: "Valid long description with more than twenty characters.",
      province: "Bangkok",
      category: "City",
      duration_label: "1 Day",
      budget_min: 2000,
      budget_max: 500,
      travel_mode: "walking",
      status: "draft",
    });

    expect(result.success).toBe(false);
    if (!result.success) {
      const fieldErrors = result.error.flatten().fieldErrors;
      expect(fieldErrors.slug).toBeDefined();
      expect(fieldErrors.budget_max).toBeDefined();
    }
  });

  it("validates stop coordinate bounds [-90, 90] and [-180, 180]", () => {
    const validStop = stopInputSchema.safeParse({
      place_name: "Wat Phra That Khao Noi",
      description: "Hilltop temple overlooking Nan town.",
      latitude: "18.7691234",
      longitude: "100.7519876",
      estimated_minutes: "45",
      estimated_cost: "0",
    });
    expect(validStop.success).toBe(true);

    const invalidLat = stopInputSchema.safeParse({
      place_name: "Out of bounds stop",
      description: "Invalid latitude coordinate test.",
      latitude: 105.5,
      longitude: 100.5,
    });
    expect(invalidLat.success).toBe(false);

    const invalidLng = stopInputSchema.safeParse({
      place_name: "Out of bounds stop",
      description: "Invalid longitude coordinate test.",
      latitude: 13.7,
      longitude: -195.2,
    });
    expect(invalidLng.success).toBe(false);
  });
});

