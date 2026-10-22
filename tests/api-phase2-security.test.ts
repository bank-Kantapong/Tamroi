import { describe, expect, it, vi } from "vitest";

// Mock next/headers cookies() to simulate unauthenticated requests (no cookies)
vi.mock("next/headers", () => ({
  cookies: async () => ({
    get: () => undefined,
  }),
}));

import { GET as getProfile, PUT as putProfile } from "@/app/api/profile/route";
import { GET as getSaved, POST as postSaved, DELETE as deleteSaved } from "@/app/api/saved/route";
import { GET as getSubmissions, POST as postSubmission } from "@/app/api/submissions/route";
import {
  GET as getSubmissionById,
  PUT as putSubmissionById,
} from "@/app/api/submissions/[tripId]/route";
import { GET as getModerationQueue } from "@/app/api/admin/moderation/route";
import {
  GET as getModerationTrip,
  POST as postModerationReview,
} from "@/app/api/admin/moderation/[tripId]/route";
import { POST as postUpload } from "@/app/api/upload/route";
import { GET as getProvinces } from "@/app/api/provinces/route";

describe("Phase 2 API Security — Direct Unauthorized Mutation & Read Rejection", () => {
  it("blocks unauthenticated GET and PUT on /api/profile with 401", async () => {
    const getRes = await getProfile();
    expect(getRes.status).toBe(401);

    const putReq = new Request("http://localhost:3000/api/profile", {
      method: "PUT",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ display_name: "Hacker" }),
    });
    const putRes = await putProfile(putReq);
    expect(putRes.status).toBe(401);
  });

  it("blocks unauthenticated GET, POST, and DELETE on /api/saved with 401", async () => {
    const getReq = new Request("http://localhost:3000/api/saved");
    const getRes = await getSaved(getReq);
    expect(getRes.status).toBe(401);

    const postReq = new Request("http://localhost:3000/api/saved", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ tripId: "some-trip-id" }),
    });
    const postRes = await postSaved(postReq);
    expect(postRes.status).toBe(401);

    const delReq = new Request("http://localhost:3000/api/saved?tripId=some-trip-id", {
      method: "DELETE",
    });
    const delRes = await deleteSaved(delReq);
    expect(delRes.status).toBe(401);
  });

  it("blocks unauthenticated GET and POST on /api/submissions with 401", async () => {
    const getRes = await getSubmissions();
    expect(getRes.status).toBe(401);

    const postReq = new Request("http://localhost:3000/api/submissions", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ title: "Unauthorized Submission" }),
    });
    const postRes = await postSubmission(postReq);
    expect(postRes.status).toBe(401);
  });

  it("blocks unauthenticated GET and PUT on /api/submissions/[tripId] with 401", async () => {
    const context = { params: Promise.resolve({ tripId: "trip-uuid-123" }) };

    const getReq = new Request("http://localhost:3000/api/submissions/trip-uuid-123");
    const getRes = await getSubmissionById(getReq, context);
    expect(getRes.status).toBe(401);

    const putReq = new Request("http://localhost:3000/api/submissions/trip-uuid-123", {
      method: "PUT",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ title: "Tamper" }),
    });
    const putRes = await putSubmissionById(putReq, context);
    expect(putRes.status).toBe(401);
  });

  it("blocks unauthenticated GET and POST on /api/admin/moderation routes with 401", async () => {
    const getQueueRes = await getModerationQueue();
    expect(getQueueRes.status).toBe(401);

    const context = { params: Promise.resolve({ tripId: "trip-uuid-123" }) };
    const getTripReq = new Request("http://localhost:3000/api/admin/moderation/trip-uuid-123");
    const getTripRes = await getModerationTrip(getTripReq, context);
    expect(getTripRes.status).toBe(401);

    const postReviewReq = new Request(
      "http://localhost:3000/api/admin/moderation/trip-uuid-123",
      {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ action: "approve" }),
      }
    );
    const postReviewRes = await postModerationReview(postReviewReq, context);
    expect(postReviewRes.status).toBe(401);
  });

  it("blocks unauthenticated POST on /api/upload with 401", async () => {
    const uploadReq = new Request("http://localhost:3000/api/upload", {
      method: "POST",
    });
    const uploadRes = await postUpload(uploadReq);
    expect(uploadRes.status).toBe(401);
  });

  it("allows public GET on /api/provinces returning all 77 Thai provinces", async () => {
    const res = await getProvinces();
    expect(res.status).toBe(200);
    const data = await res.json();
    expect(data.provinces).toBeDefined();
    expect(data.provinces.length).toBe(77);
    expect(data.total).toBe(77);
  });
});

