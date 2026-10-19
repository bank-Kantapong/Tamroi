import { NextResponse } from "next/server";
import { getAdminSession } from "@/lib/auth";
import { getTripRepository } from "@/lib/db";

export async function POST() {
  const session = await getAdminSession();
  if (!session.authenticated) {
    return NextResponse.json({ error: "Unauthorized: Admin login required." }, { status: 401 });
  }

  try {
    const repo = getTripRepository();
    await repo.resetToSeedData();
    const trips = await repo.listAllTripsForAdmin();
    return NextResponse.json({ ok: true, count: trips.length });
  } catch (err) {
    return NextResponse.json(
      { error: err instanceof Error ? err.message : "Failed to reset seed data." },
      { status: 500 }
    );
  }
}

