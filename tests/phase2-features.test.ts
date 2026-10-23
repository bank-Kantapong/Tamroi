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
  adminPostActionSchema,
  adminUserActionSchema,
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
    it("creates submission as draft and isolates from public discovery", async () => {
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
        status: "draft",
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

      expect(submission.status).toBe("draft");
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

    it("creates submission directly published and makes it immediately live publicly", async () => {
      const { salt, hash } = hashPassword("Pass12345");
      const { user } = await repo.createUser("publisher@example.com", hash, salt, "Live Publisher");

      const submission = await repo.createSubmission(user.id, {
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

      // Community submission defaults directly to published (no pre-moderation required)
      expect(submission.status).toBe("published");
      expect(submission.created_by).toBe(user.id);

      // Immediately visible in public trips list
      const publicTrips = await repo.listPublishedTrips();
      expect(publicTrips.some((t) => t.id === submission.id)).toBe(true);

      // Immediately accessible via public slug lookup
      const publicLookup = await repo.getPublishedTripBySlug(submission.slug);
      expect(publicLookup).not.toBeNull();
      expect(publicLookup?.title).toBe("Nan Valley Scenic Loop");
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

    it("prevents banned users from creating or updating submissions", async () => {
      const { salt, hash } = hashPassword("Pass12345");
      const { user: bannedUser } = await repo.createUser("baduser@example.com", hash, salt, "Bad User");

      await repo.setUserBanStatus(bannedUser.id, true, "Posting inappropriate content");

      // Banned user cannot create submissions
      await expect(
        repo.createSubmission(bannedUser.id, {
          title: "Inappropriate Trip",
          short_description: "Short description.",
          description: "Long enough description for the trip.",
          province: "Bangkok",
          category: "General",
          duration_label: "1 Day",
          stops: [],
        })
      ).rejects.toThrow(ForbiddenError);
    });
  });

  describe("5. Admin Post & User Management (Banning, Warning, Post Unpublishing, Deleting)", () => {
    it("allows admin to list users, warn user, and clear warning", async () => {
      const { salt, hash } = hashPassword("Pass12345");
      const { user } = await repo.createUser("user-for-warning@example.com", hash, salt, "Warned User");

      // 1. List users
      const users = await repo.listUsersForAdmin();
      const found = users.find((u) => u.id === user.id);
      expect(found).toBeDefined();
      expect(found?.warning_count).toBe(0);

      // 2. Warn user
      const warnedProfile = await repo.warnUser(
        user.id,
        "Please avoid offensive language in trip descriptions."
      );
      expect(warnedProfile.warning_count).toBe(1);
      expect(warnedProfile.warning_message).toBe("Please avoid offensive language in trip descriptions.");

      // Warn a second time
      const warnedAgain = await repo.warnUser(
        user.id,
        "Second warning: respect community guidelines."
      );
      expect(warnedAgain.warning_count).toBe(2);

      // 3. Clear warnings
      const clearedProfile = await repo.clearUserWarning(user.id);
      expect(clearedProfile.warning_count).toBe(0);
      expect(clearedProfile.warning_message).toBeNull();
    });

    it("allows admin to unpublish a trip with a moderation note", async () => {
      const { salt, hash } = hashPassword("Pass12345");
      const { user } = await repo.createUser("contentcreator@example.com", hash, salt, "Content Creator");

      const trip = await repo.createSubmission(user.id, {
        title: "Spammy Trip Content",
        short_description: "Short description with spam links.",
        description: "Long description with spam links and offensive details.",
        province: "Bangkok",
        category: "Cafe",
        duration_label: "1 Day",
        stops: [],
      });

      expect(trip.status).toBe("published");

      // Admin unpublishes the trip with a note
      const unpublished = await repo.unpublishTripWithNote(
        trip.id,
        "Unpublished due to spam links. Please remove before republishing."
      );

      expect(unpublished.status).toBe("draft");
      expect(unpublished.moderation_note).toBe(
        "Unpublished due to spam links. Please remove before republishing."
      );

      // Must no longer be in public trips list
      const publicTrips = await repo.listPublishedTrips();
      expect(publicTrips.some((t) => t.id === trip.id)).toBe(false);

      // Public lookup must be null
      const publicLookup = await repo.getPublishedTripBySlug(trip.slug);
      expect(publicLookup).toBeNull();
    });

    it("allows admin to ban user and automatically unpublishes all of their published trips", async () => {
      const { salt, hash } = hashPassword("Pass12345");
      const { user } = await repo.createUser("malicious@example.com", hash, salt, "Malicious Actor");

      // Create two published trips
      const trip1 = await repo.createSubmission(user.id, {
        title: "Malicious Trip 1",
        short_description: "Short description 1.",
        description: "Long description 1 for trip.",
        province: "Bangkok",
        category: "Cafe",
        duration_label: "1 Day",
        stops: [],
      });
      const trip2 = await repo.createSubmission(user.id, {
        title: "Malicious Trip 2",
        short_description: "Short description 2.",
        description: "Long description 2 for trip.",
        province: "Phuket",
        category: "Beach",
        duration_label: "2 Days",
        stops: [],
      });

      expect(trip1.status).toBe("published");
      expect(trip2.status).toBe("published");

      // Admin bans user
      const bannedProfile = await repo.setUserBanStatus(
        user.id,
        true,
        "Repeated violation of community terms of service."
      );

      expect(bannedProfile.is_banned).toBe(true);
      expect(bannedProfile.banned_reason).toBe("Repeated violation of community terms of service.");

      // Both trips must be automatically unpublished!
      const publicTrips = await repo.listPublishedTrips();
      expect(publicTrips.some((t) => t.id === trip1.id)).toBe(false);
      expect(publicTrips.some((t) => t.id === trip2.id)).toBe(false);

      const lookup1 = await repo.getPublishedTripBySlug(trip1.slug);
      const lookup2 = await repo.getPublishedTripBySlug(trip2.slug);
      expect(lookup1).toBeNull();
      expect(lookup2).toBeNull();

      // Admin unbans user
      const unbannedProfile = await repo.setUserBanStatus(user.id, false);
      expect(unbannedProfile.is_banned).toBe(false);
      expect(unbannedProfile.banned_reason).toBeNull();
    });

    it("allows admin to permanently delete an inappropriate trip", async () => {
      const { salt, hash } = hashPassword("Pass12345");
      const { user } = await repo.createUser("spammer@example.com", hash, salt, "Spammer");

      const trip = await repo.createSubmission(user.id, {
        title: "Trip To Delete",
        short_description: "Short description to delete.",
        description: "Long description to delete permanently.",
        province: "Bangkok",
        category: "Nightlife",
        duration_label: "1 Day",
        stops: [],
      });

      // Admin deletes the trip
      await repo.deleteTrip(trip.id);

      const publicLookup = await repo.getPublishedTripBySlug(trip.slug);
      expect(publicLookup).toBeNull();

      const userTrips = await repo.listUserSubmissions(user.id);
      expect(userTrips.some((t) => t.id === trip.id)).toBe(false);
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

    it("validates trip submission schema allows 0 stops (e.g. single cafe/restaurant review) and enforces coordinate bounds when stops exist", () => {
      // 0 stops is valid for cafe / restaurant reviews
      expect(
        tripSubmissionSchema.safeParse({
          title: "Shibainu Story Cafe Review",
          short_description: "A cozy shibainu cafe review in Banthat Thong.",
          description: "Great matcha latte and friendly dogs in central Bangkok.",
          province: "Bangkok",
          category: "Cafe & Bakery",
          duration_label: "2 Hours",
          travel_mode: "walking",
          status: "pending_review",
          stops: [], // 0 stops allowed!
        }).success
      ).toBe(true);

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
        expect(emptyDraft.data.stops).toHaveLength(0);
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

    it("validates admin user actions and admin post actions", () => {
      // User actions
      expect(adminUserActionSchema.safeParse({ userId: "u1", action: "ban", reason: "Spam" }).success).toBe(true);
      expect(adminUserActionSchema.safeParse({ userId: "u1", action: "unban" }).success).toBe(true);
      expect(adminUserActionSchema.safeParse({ userId: "u1", action: "warn", message: "Please mind rules" }).success).toBe(true);
      expect(adminUserActionSchema.safeParse({ userId: "u1", action: "warn", message: "" }).success).toBe(false);
      expect(adminUserActionSchema.safeParse({ userId: "u1", action: "clear_warn" }).success).toBe(true);

      // Post actions
      expect(adminPostActionSchema.safeParse({ action: "unpublish", note: "Contains copyright violation" }).success).toBe(true);
      expect(adminPostActionSchema.safeParse({ action: "unpublish", note: "" }).success).toBe(false);
      expect(adminPostActionSchema.safeParse({ action: "delete" }).success).toBe(true);
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
