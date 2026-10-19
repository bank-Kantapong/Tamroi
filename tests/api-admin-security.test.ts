import { describe, expect, it, vi } from "vitest";

// Mock next/headers cookies() to return no admin session cookie
vi.mock("next/headers", () => ({
  cookies: async () => ({
    get: () => undefined,
  }),
}));

import { GET as getAdminTrips, POST as postAdminTrip } from "@/app/api/admin/trips/route";
import {
  DELETE as deleteAdminTrip,
  PATCH as patchAdminTrip,
  PUT as putAdminTrip,
} from "@/app/api/admin/trips/[tripId]/route";
import {
  POST as postAdminStop,
  PUT as putReorderStops,
} from "@/app/api/admin/trips/[tripId]/stops/route";

describe("Admin API Route Handlers unauthorized write protection", () => {
  it("blocks unauthenticated GET and POST on /api/admin/trips with 401", async () => {
    const getRes = await getAdminTrips();
    expect(getRes.status).toBe(401);

    const postReq = new Request("http://localhost:3000/api/admin/trips", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ title: "Unauthorized Trip" }),
    });
    const postRes = await postAdminTrip(postReq);
    expect(postRes.status).toBe(401);
  });

  it("blocks unauthenticated PUT, PATCH, and DELETE on /api/admin/trips/[tripId] with 401", async () => {
    const context = { params: Promise.resolve({ tripId: "11111111-1111-4111-8111-111111111101" }) };

    const putReq = new Request("http://localhost:3000/api/admin/trips/1", {
      method: "PUT",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ title: "Tamper" }),
    });
    expect((await putAdminTrip(putReq, context)).status).toBe(401);

    const patchReq = new Request("http://localhost:3000/api/admin/trips/1", {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ status: "published" }),
    });
    expect((await patchAdminTrip(patchReq, context)).status).toBe(401);

    const delReq = new Request("http://localhost:3000/api/admin/trips/1", {
      method: "DELETE",
    });
    expect((await deleteAdminTrip(delReq, context)).status).toBe(401);
  });

  it("blocks unauthenticated stop creation and reordering with 401", async () => {
    const context = { params: Promise.resolve({ tripId: "11111111-1111-4111-8111-111111111101" }) };

    const postStopReq = new Request("http://localhost:3000/api/admin/trips/1/stops", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ place_name: "Unauthorized Stop" }),
    });
    expect((await postAdminStop(postStopReq, context)).status).toBe(401);

    const reorderReq = new Request("http://localhost:3000/api/admin/trips/1/stops", {
      method: "PUT",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ orderedStopIds: ["a", "b"] }),
    });
    expect((await putReorderStops(reorderReq, context)).status).toBe(401);
  });
});

