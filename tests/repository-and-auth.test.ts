import fs from "node:fs";
import os from "node:os";
import path from "node:path";
import { afterEach, beforeEach, describe, expect, it } from "vitest";
import {
  DuplicateSlugError,
  LocalFileTripRepository,
} from "@/lib/db/repository";
import {
  createAdminSessionToken,
  verifyAdminCredentials,
  verifyAdminSessionToken,
} from "@/lib/auth";

describe("TripRepository CRUD, publication visibility, stop reordering, and Admin Auth", () => {
  let tempDbPath: string;
  let repo: LocalFileTripRepository;

  beforeEach(async () => {
    const tempDir = fs.mkdtempSync(path.join(os.tmpdir(), "tamroi-test-"));
    tempDbPath = path.join(tempDir, "test-db.json");
    repo = new LocalFileTripRepository(tempDbPath);
    await repo.resetToSeedData();
  });

  afterEach(() => {
    try {
      if (fs.existsSync(tempDbPath)) {
        fs.rmSync(path.dirname(tempDbPath), { recursive: true, force: true });
      }
    } catch {
      // ignore cleanup errors
    }
  });

  it("hides draft trips from public queries while exposing them to admin queries", async () => {
    const publicTrips = await repo.listPublishedTrips();
    const adminTrips = await repo.listAllTripsForAdmin();

    expect(publicTrips.length).toBe(4);
    expect(adminTrips.length).toBe(5);
    expect(publicTrips.every((t) => t.status === "published")).toBe(true);

    // Draft slug must return null publicly
    const draftPublic = await repo.getPublishedTripBySlug(
      "sample-draft-ayutthaya-cycling"
    );
    expect(draftPublic).toBeNull();

    // Admin can still load the draft trip for preview/editing
    const draftAdmin = await repo.getTripBySlugForAdmin(
      "sample-draft-ayutthaya-cycling"
    );
    expect(draftAdmin).not.toBeNull();
    expect(draftAdmin?.status).toBe("draft");
  });

  it("filters published trips by keyword (EN and TH), province, category, duration, and maxBudget", async () => {
    const byKeyword = await repo.listPublishedTrips({ q: "Rattanakosin" });
    expect(byKeyword).toHaveLength(1);
    expect(byKeyword[0].province).toBe("Bangkok");

    const byThaiKeyword = await repo.listPublishedTrips({ q: "ท่าเตียน" });
    expect(byThaiKeyword).toHaveLength(1);
    expect(byThaiKeyword[0].slug).toBe("sample-rattanakosin-riverside-walk");

    const byProvince = await repo.listPublishedTrips({ province: "Chiang Mai" });
    expect(byProvince).toHaveLength(1);
    expect(byProvince[0].slug).toBe("sample-chiang-mai-old-city-loop");

    const byDuration = await repo.listPublishedTrips({ duration: "half-day" });
    expect(byDuration).toHaveLength(1);
    expect(byDuration[0].slug).toBe("sample-rattanakosin-riverside-walk");

    const byBudget = await repo.listPublishedTrips({ maxBudget: 500 });
    expect(byBudget.length).toBeGreaterThanOrEqual(2);
    expect(byBudget.every((t) => (t.budget_min ?? 0) <= 500)).toBe(true);
  });

  it("enforces unique slugs, supports publish/unpublish, and manages ordered stops", async () => {
    const created = await repo.createTrip({
      title: "Krabi Ao Nang Kayaking Day",
      slug: "krabi-ao-nang-kayaking",
      short_description: "Curated coastal kayaking and viewpoint itinerary in Krabi.",
      description:
        "Full-day itinerary starting from Ao Nang to Ao Thalane mangrove channels and sunset beach.",
      province: "Krabi",
      category: "Coastal & Scenic",
      duration_label: "1 Day (7 hrs)",
      duration_hours: 7,
      budget_min: 600,
      budget_max: 1400,
      travel_mode: "driving",
      status: "draft",
      is_sample: false,
    });

    // Reject duplicate slug
    await expect(
      repo.createTrip({
        title: "Duplicate Slug Trip",
        slug: "krabi-ao-nang-kayaking",
        short_description: "Another short description here.",
        description: "Another long description with at least twenty characters.",
        province: "Krabi",
        category: "Coastal",
        duration_label: "1 Day",
        travel_mode: "driving",
        status: "draft",
      })
    ).rejects.toThrow(DuplicateSlugError);

    // Add 3 stops and verify sequences 1, 2, 3
    const s1 = await repo.createStop(created.id, {
      place_name: "Ao Nang Pier",
      description: "Morning departure point.",
      latitude: 8.0321,
      longitude: 98.8225,
    });
    const s2 = await repo.createStop(created.id, {
      place_name: "Ao Thalane Kayak Center",
      description: "Mangrove kayaking bay.",
      latitude: 8.1415,
      longitude: 98.7452,
    });
    const s3 = await repo.createStop(created.id, {
      place_name: "Khao Thong Hill Viewpoint",
      description: "Sunset cafe overlooking Hong Island.",
      latitude: 8.1651,
      longitude: 98.7488,
    });

    expect([s1.sequence, s2.sequence, s3.sequence]).toEqual([1, 2, 3]);

    // Reorder stops to [s3, s1, s2]
    const reordered = await repo.reorderStops(created.id, [s3.id, s1.id, s2.id]);
    expect(reordered.map((s) => s.place_name)).toEqual([
      "Khao Thong Hill Viewpoint",
      "Ao Nang Pier",
      "Ao Thalane Kayak Center",
    ]);
    expect(reordered.map((s) => s.sequence)).toEqual([1, 2, 3]);

    // Delete middle stop (s1) and confirm remaining stops renumber to [1, 2]
    await repo.deleteStop(created.id, s1.id);
    const afterStopDelete = await repo.getTripByIdForAdmin(created.id);
    expect(afterStopDelete?.stops.map((s) => s.sequence)).toEqual([1, 2]);

    // Publish trip and verify it becomes visible publicly
    await repo.setTripStatus(created.id, "published");
    const nowPublic = await repo.getPublishedTripBySlug("krabi-ao-nang-kayaking");
    expect(nowPublic).not.toBeNull();
    expect(nowPublic?.stops).toHaveLength(2);

    // Delete trip and verify cascade removal
    await repo.deleteTrip(created.id);
    const afterTripDelete = await repo.getTripByIdForAdmin(created.id);
    expect(afterTripDelete).toBeNull();
  });

  it("verifies admin credentials and rejects tampered or expired session tokens", () => {
    const badLogin = verifyAdminCredentials("wrong@tamroi.local", "wrong");
    expect(badLogin.valid).toBe(false);

    const devLogin = verifyAdminCredentials(
      "admin@tamroi.local",
      "tamroi-dev-admin-2026"
    );
    expect(devLogin.valid).toBe(true);

    const now = 1_700_000_000_000;
    const token = createAdminSessionToken("admin@tamroi.local", now);

    // Valid within TTL
    expect(verifyAdminSessionToken(token, now + 60_000).authenticated).toBe(true);

    // Expired after 13 hours
    expect(
      verifyAdminSessionToken(token, now + 13 * 60 * 60 * 1000).authenticated
    ).toBe(false);

    // Tampered signature rejected
    expect(verifyAdminSessionToken(`${token}tampered`, now).authenticated).toBe(
      false
    );
  });
});

