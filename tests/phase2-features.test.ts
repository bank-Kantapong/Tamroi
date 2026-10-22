import fs from "node:fs";
import os from "node:os";
import path from "node:path";
import { afterEach, beforeEach, describe, expect, it } from "vitest";
import {
  DuplicateEmailError,
  DuplicateSaveError,
  ForbiddenError,
  LocalFileTripRepository,
} from "@/lib/db/repository";
import {
  createUserSessionToken,
  hashPassword,
  verifyPassword,
  verifyUserSessionToken,
} from "@/lib/auth";
import {
  moderationActionSchema,
  profileUpdateSchema,
  registerSchema,
  tripSubmissionSchema,
} from "@/lib/validation";

describe("Phase 2: Authentication, Profiles, Saved Trips, Submissions, and Moderation", () => {
  let tempDbPath: string;
  let repo: LocalFileTripRepository;

  beforeEach(async () => {
    const tempDir = fs.mkdtempSync(path.join(os.tmpdir(), "tamroi-phase2-test-"));
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

  describe("1. Password hashing and User Session Tokens", () => {
    it("hashes passwords securely with unique salts and verifies correctly", () => {
      const password = "mySecurePassword2026!";
      const { salt, hash } = hashPassword(password);

      expect(salt).toBeDefined();
      expect(hash).toBeDefined();
      expect(hash).not.toBe(password);

      // Verify correct password
      expect(verifyPassword(password, salt, hash)).toBe(true);
      // Reject incorrect password
      expect(verifyPassword("wrongPassword", salt, hash)).toBe(false);

      // Different salt for same password produces different hash
      const second = hashPassword(password);
      expect(second.salt).not.toBe(salt);
      expect(second.hash).not.toBe(hash);
    });

    it("creates and verifies tamper-proof HMAC user session tokens", () => {
      const user = {
        id: "user-12345",
        email: "traveler@tamroi.local",
        display_name: "Explorer Somchai",
        role: "user" as const,
        avatar_url: null,
      };

      const token = createUserSessionToken(user);
      const verified = verifyUserSessionToken(token);

      expect(verified.authenticated).toBe(true);
      expect(verified.user?.id).toBe("user-12345");
      expect(verified.user?.email).toBe("traveler@tamroi.local");
      expect(verified.user?.role).toBe("user");

      // Reject tampered token
      const [payload, signature] = token.split(".");
      const tamperedPayload = Buffer.from(
        JSON.stringify({ ...JSON.parse(Buffer.from(payload, "base64url").toString()), role: "admin" })
      ).toString("base64url");
      const tamperedToken = `${tamperedPayload}.${signature}`;

      const tamperedVerified = verifyUserSessionToken(tamperedToken);
      expect(tamperedVerified.authenticated).toBe(false);
    });
  });

  describe("2. User Registration and Profile Management", () => {
    it("registers a new user with profile and enforces unique email", async () => {
      const { salt, hash } = hashPassword("SomchaiPassword123");
      const { user, profile } = await repo.createUser(
        "somchai@example.com",
        hash,
        salt,
        "Somchai Jaidee"
      );

      expect(user.id).toBeDefined();
      expect(user.email).toBe("somchai@example.com");
      expect(profile.display_name).toBe("Somchai Jaidee");
      expect(profile.role).toBe("user");

      // Reject duplicate email
      await expect(
        repo.createUser("somchai@example.com", hash, salt, "Somchai 2")
      ).rejects.toThrow(DuplicateEmailError);
    });

    it("allows user to update their own profile display name and avatar", async () => {
      const { salt, hash } = hashPassword("TestPassword123");
      const { user } = await repo.createUser("user1@example.com", hash, salt, "Old Name");

      const updated = await repo.updateProfile(user.id, {
        display_name: "New Somchai",
        avatar_url: "https://example.com/avatar.jpg",
      });

      expect(updated.display_name).toBe("New Somchai");
      expect(updated.avatar_url).toBe("https://example.com/avatar.jpg");

      const fetched = await repo.getProfile(user.id);
      expect(fetched?.display_name).toBe("New Somchai");
    });
  });

  describe("3. Saved Trips (Cross-Device Sync & Isolation)", () => {
    it("allows user to save published trips and prevents duplicate saves", async () => {
      const { salt, hash } = hashPassword("Pass12345");
      const { user } = await repo.createUser("traveler1@example.com", hash, salt, "Traveler 1");

      const publishedTrips = await repo.listPublishedTrips();
      const targetTrip = publishedTrips[0];

      // Save trip
      const saved = await repo.saveTrip(user.id, targetTrip.id);
      expect(saved.trip_id).toBe(targetTrip.id);
      expect(saved.user_id).toBe(user.id);

      // Check isTripSaved
      expect(await repo.isTripSaved(user.id, targetTrip.id)).toBe(true);

      // Reject duplicate save
      await expect(repo.saveTrip(user.id, targetTrip.id)).rejects.toThrow(DuplicateSaveError);

      // Verify listSavedTrips returns the saved trip
      const list = await repo.listSavedTrips(user.id);
      expect(list).toHaveLength(1);
      expect(list[0].id).toBe(targetTrip.id);

      // Unsave trip
      await repo.unsaveTrip(user.id, targetTrip.id);
      expect(await repo.isTripSaved(user.id, targetTrip.id)).toBe(false);
      expect(await repo.listSavedTrips(user.id)).toHaveLength(0);
    });

    it("enforces strict user isolation for saved trips", async () => {
      const { salt, hash } = hashPassword("Pass12345");
      const { user: userA } = await repo.createUser("userA@example.com", hash, salt, "User A");
      const { user: userB } = await repo.createUser("userB@example.com", hash, salt, "User B");

      const publishedTrips = await repo.listPublishedTrips();
      await repo.saveTrip(userA.id, publishedTrips[0].id);

      // User B has not saved any trips
      expect(await repo.isTripSaved(userB.id, publishedTrips[0].id)).toBe(false);
      expect(await repo.listSavedTrips(userB.id)).toHaveLength(0);

      // User A has 1 saved trip
      expect(await repo.listSavedTrips(userA.id)).toHaveLength(1);
    });

    it("safely excludes unpublished or deleted trips from saved trip lists", async () => {
      const { salt, hash } = hashPassword("Pass12345");
      const { user } = await repo.createUser("user@example.com", hash, salt, "User");

      const published = await repo.listPublishedTrips();
      const trip = published[0];

      await repo.saveTrip(user.id, trip.id);
      expect(await repo.listSavedTrips(user.id)).toHaveLength(1);

      // Unpublish the trip (status -> draft)
      await repo.setTripStatus(trip.id, "draft");

      // Saved trips query must NOT leak the unpublished trip
      const savedList = await repo.listSavedTrips(user.id);
      expect(savedList).toHaveLength(0);
    });
  });

  describe("4. Community Submissions Workflow & Privacy", () => {
    it("creates submission defaulting to pending_review and isolates from public discovery", async () => {
      const { salt, hash } = hashPassword("Pass12345");
      const { user } = await repo.createUser("creator@example.com", hash, salt, "Trip Creator");

      const submission = await repo.createSubmission(user.id, {
        title: "Hidden Bangkok Rooftop Cafes",
        short_description: "A relaxed evening itinerary exploring hidden cafe viewpoints.",
        description: "Full details of 2 hidden rooftop cafes in Thonglor and Phrom Phong.",
        province: "Bangkok",
        category: "Cafe & Views",
        duration_label: "Half Day (4 hrs)",
        travel_mode: "walking",
        stops: [
          {
            place_name: "Thonglor Secret Deck",
            description: "Sunset coffee deck overlooking Sukhumvit.",
            latitude: 13.731,
            longitude: 100.581,
          },
          {
            place_name: "Phrom Phong Sky Bar",
            description: "Chilled mocktail lounge with live acoustic music.",
            latitude: 13.729,
            longitude: 100.569,
          },
        ],
      });

      expect(submission.status).toBe("pending_review");
      expect(submission.created_by).toBe(user.id);
      expect(submission.stops).toHaveLength(2);

      // Must NOT appear in public trips list
      const publicTrips = await repo.listPublishedTrips();
      expect(publicTrips.some((t) => t.id === submission.id)).toBe(false);

      // Must NOT be accessible via public slug lookup
      const publicLookup = await repo.getPublishedTripBySlug(submission.slug);
      expect(publicLookup).toBeNull();

      // Must appear in creator's own submissions
      const userSubmissions = await repo.listUserSubmissions(user.id);
      expect(userSubmissions.some((t) => t.id === submission.id)).toBe(true);
    });

    it("prevents non-owners from editing someone else's submission", async () => {
      const { salt, hash } = hashPassword("Pass12345");
      const { user: owner } = await repo.createUser("owner@example.com", hash, salt, "Owner");
      const { user: hacker } = await repo.createUser("hacker@example.com", hash, salt, "Hacker");

      const submission = await repo.createSubmission(owner.id, {
        title: "Original Trip",
        short_description: "Original short description here.",
        description: "Original long description here with enough characters.",
        province: "Bangkok",
        category: "Culture",
        duration_label: "1 Day",
        travel_mode: "driving",
        stops: [
          {
            place_name: "Stop 1",
            description: "Description 1",
            latitude: 13.75,
            longitude: 100.5,
          },
        ],
      });

      // Hacker tries to update Owner's submission
      await expect(
        repo.updateSubmission(hacker.id, submission.id, {
          title: "Hacked Trip Title",
          short_description: "Hacked short description.",
          description: "Hacked long description with enough characters.",
          province: "Bangkok",
          category: "Culture",
          duration_label: "1 Day",
          travel_mode: "driving",
          stops: [
            {
              place_name: "Hacked Stop",
              description: "Hacked Description",
              latitude: 13.75,
              longitude: 100.5,
            },
          ],
        })
      ).rejects.toThrow(ForbiddenError);
    });
  });

  describe("5. Admin Moderation Queue, Approval & Rejection", () => {
    it("allows admin to inspect, approve, or reject submissions with reason", async () => {
      const { salt, hash } = hashPassword("Pass12345");
      const { user: creator } = await repo.createUser("creator2@example.com", hash, salt, "Creator 2");

      const submission = await repo.createSubmission(creator.id, {
        title: "Nan Valley Scenic Loop",
        short_description: "Scenic motorbike route through misty northern valleys.",
        description: "Explore traditional Nan villages, salt pits, and temple viewpoints.",
        province: "Nan",
        category: "Scenic Nature",
        duration_label: "1 Day (8 hrs)",
        travel_mode: "driving",
        stops: [
          {
            place_name: "Bo Kluea Ancient Salt Well",
            description: "Ancient mountain rock salt wells still in active use.",
            latitude: 19.15,
            longitude: 101.17,
          },
        ],
      });

      // 1. Pending submission appears in admin moderation queue
      const pendingQueue = await repo.listPendingSubmissions();
      expect(pendingQueue.some((p) => p.id === submission.id)).toBe(true);

      // 2. Admin rejects with reason
      const rejected = await repo.reviewSubmission(
        "admin@tamroi.local",
        submission.id,
        "reject",
        "Please add at least 2 more stops for a full day itinerary."
      );
      expect(rejected.status).toBe("rejected");
      expect(rejected.rejection_reason).toBe(
        "Please add at least 2 more stops for a full day itinerary."
      );

      // Rejected trip is removed from pending queue
      const queueAfterReject = await repo.listPendingSubmissions();
      expect(queueAfterReject.some((p) => p.id === submission.id)).toBe(false);

      // Creator edits submission to address feedback and resubmits
      const resubmitted = await repo.updateSubmission(creator.id, submission.id, {
        title: "Nan Valley Scenic Loop",
        short_description: "Scenic motorbike route through misty northern valleys.",
        description: "Explore traditional Nan villages, salt pits, and temple viewpoints.",
        province: "Nan",
        category: "Scenic Nature",
        duration_label: "1 Day (8 hrs)",
        travel_mode: "driving",
        status: "pending_review",
        stops: [
          {
            place_name: "Bo Kluea Ancient Salt Well",
            description: "Ancient mountain rock salt wells still in active use.",
            latitude: 19.15,
            longitude: 101.17,
          },
          {
            place_name: "Wat Phumin",
            description: "Famous temple with Whispering Lovers mural.",
            latitude: 18.77,
            longitude: 100.77,
          },
        ],
      });
      expect(resubmitted.status).toBe("pending_review");
      expect(resubmitted.rejection_reason).toBeNull();

      // 3. Admin approves submission
      const approved = await repo.reviewSubmission(
        "admin@tamroi.local",
        submission.id,
        "approve"
      );
      expect(approved.status).toBe("published");
      expect(approved.reviewed_by).toBe("admin@tamroi.local");
      expect(approved.reviewed_at).toBeDefined();

      // Now publicly visible!
      const publicLookup = await repo.getPublishedTripBySlug(submission.slug);
      expect(publicLookup).not.toBeNull();
      expect(publicLookup?.title).toBe("Nan Valley Scenic Loop");
    });
  });

  describe("6. Schema Validation for Phase 2", () => {
    it("validates register schema requirements", () => {
      expect(
        registerSchema.safeParse({
          email: "invalid-email",
          password: "short",
          display_name: "A",
        }).success
      ).toBe(false);

      expect(
        registerSchema.safeParse({
          email: "valid@tamroi.local",
          password: "strongPassword123",
          display_name: "Valid Name",
        }).success
      ).toBe(true);
    });

    it("validates profile update schema requirements", () => {
      expect(
        profileUpdateSchema.safeParse({
          display_name: "X",
        }).success
      ).toBe(false);

      expect(
        profileUpdateSchema.safeParse({
          display_name: "Good Display Name",
          avatar_url: "not-a-url",
        }).success
      ).toBe(false);

      expect(
        profileUpdateSchema.safeParse({
          display_name: "Good Display Name",
          avatar_url: "https://example.com/photo.png",
        }).success
      ).toBe(true);
    });

    it("validates trip submission schema requires at least 1 stop and valid coordinates", () => {
      expect(
        tripSubmissionSchema.safeParse({
          title: "Trip without stops",
          short_description: "Short description with enough characters.",
          description: "Full description with enough characters to pass validation.",
          province: "Bangkok",
          category: "Culture",
          duration_label: "1 Day",
          travel_mode: "driving",
          status: "pending_review",
          stops: [], // Empty stops!
        }).success
      ).toBe(false);

      expect(
        tripSubmissionSchema.safeParse({
          title: "Trip with invalid coordinates",
          short_description: "Short description with enough characters.",
          description: "Full description with enough characters to pass validation.",
          province: "Bangkok",
          category: "Culture",
          duration_label: "1 Day",
          travel_mode: "driving",
          status: "pending_review",
          stops: [
            {
              place_name: "Bad Stop",
              description: "Description here",
              latitude: 95, // Out of range [-90, 90]
              longitude: 100,
            },
          ],
        }).success
      ).toBe(false);
    });

    it("allows saving draft without any validation checks (safe fallbacks applied)", () => {
      // Empty draft with virtually no fields filled in
      const emptyDraft = tripSubmissionSchema.safeParse({
        title: "",
        status: "draft",
        stops: [],
      });

      expect(emptyDraft.success).toBe(true);
      if (emptyDraft.success) {
        expect(emptyDraft.data.title).toBe("แบบร่างทริปใหม่");
        expect(emptyDraft.data.status).toBe("draft");
        expect(emptyDraft.data.stops.length).toBeGreaterThanOrEqual(1);
      }

      // Draft with partially filled stop
      const partialDraft = tripSubmissionSchema.safeParse({
        title: "D",
        status: "draft",
        stops: [
          {
            place_name: "X",
            description: "Y",
            latitude: "",
            longitude: "",
          },
        ],
      });

      expect(partialDraft.success).toBe(true);
      if (partialDraft.success) {
        expect(partialDraft.data.status).toBe("draft");
        expect(partialDraft.data.stops[0].place_name).toBeDefined();
        expect(partialDraft.data.stops[0].latitude).toBe(13.7563);
        expect(partialDraft.data.stops[0].longitude).toBe(100.5018);
      }
    });

    it("validates moderation rejection requires a reason", () => {
      expect(
        moderationActionSchema.safeParse({
          action: "approve",
        }).success
      ).toBe(true);

      expect(
        moderationActionSchema.safeParse({
          action: "reject",
          rejection_reason: "", // Empty rejection reason!
        }).success
      ).toBe(false);

      expect(
        moderationActionSchema.safeParse({
          action: "reject",
          rejection_reason: "Coordinates of stop #1 are missing or invalid.",
        }).success
      ).toBe(true);
    });

    it("supports optional travel mode, 'other' mode with note, single budget, and multi-cover photos", () => {
      const parsed = tripSubmissionSchema.safeParse({
        title: "Boat Trip in Chao Phraya",
        short_description: "Scenic boat trip along the historic river.",
        description: "Explore temples and riverside cafes by express boat in Bangkok.",
        province: "กรุงเทพมหานคร",
        category: "Riverside",
        duration_label: "1 Day",
        budget_min: 350,
        budget_max: 350, // Single budget value
        travel_mode: "other",
        travel_mode_note: "เรือด่วนเจ้าพระยา",
        cover_image_url: "/uploads/cover1.webp\n/uploads/cover2.webp",
        status: "pending_review",
        stops: [
          {
            place_name: "ท่าเตียน",
            description: "ชมวิวพระปรางค์วัดอรุณฝั่งตรงข้าม",
            latitude: 13.7465,
            longitude: 100.493,
          },
        ],
      });

      expect(parsed.success).toBe(true);
      if (parsed.success) {
        expect(parsed.data.travel_mode).toBe("other");
        expect(parsed.data.travel_mode_note).toBe("เรือด่วนเจ้าพระยา");
        expect(parsed.data.budget_min).toBe(350);
        expect(parsed.data.budget_max).toBe(350);
        expect(parsed.data.cover_image_url).toContain("/uploads/cover1.webp");
        expect(parsed.data.cover_image_url).toContain("/uploads/cover2.webp");
      }

      // Also verify travel_mode is completely optional (null/omitted)
      const parsedNoMode = tripSubmissionSchema.safeParse({
        title: "Flexible Walking Tour",
        short_description: "Relaxed tour with no strict travel mode required.",
        description: "Walk or ride as you like around the historic city center.",
        province: "เชียงใหม่",
        category: "Culture",
        duration_label: "Half Day",
        travel_mode: null,
        status: "pending_review",
        stops: [
          {
            place_name: "ประตูท่าแพ",
            description: "แลนด์มาร์กสำคัญใจกลางเมืองเชียงใหม่",
            latitude: 18.7877,
            longitude: 98.9931,
          },
        ],
      });

      expect(parsedNoMode.success).toBe(true);
      if (parsedNoMode.success) {
        expect(parsedNoMode.data.travel_mode).toBeNull();
      }
    });
  });
});
