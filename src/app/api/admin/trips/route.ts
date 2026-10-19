import { NextResponse } from "next/server";
import { getAdminSession } from "@/lib/auth";
import { DuplicateSlugError, getTripRepository } from "@/lib/db";
import { tripInputSchema } from "@/lib/validation";

export async function GET() {
  const session = await getAdminSession();
  if (!session.authenticated) {
    return NextResponse.json({ error: "Unauthorized: Admin login required." }, { status: 401 });
  }

  const repo = getTripRepository();
  const trips = await repo.listAllTripsForAdmin();
  return NextResponse.json({ trips, backend: repo.backendName });
}

export async function POST(request: Request) {
  const session = await getAdminSession();
  if (!session.authenticated) {
    return NextResponse.json({ error: "Unauthorized: Admin login required." }, { status: 401 });
  }

  try {
    const raw = await request.json();
    const parsed = tripInputSchema.safeParse(raw);
    if (!parsed.success) {
      return NextResponse.json(
        {
          error: "Validation failed",
          fieldErrors: parsed.error.flatten().fieldErrors,
          issues: parsed.error.issues.map((i) => i.message),
        },
        { status: 400 }
      );
    }

    const repo = getTripRepository();
    const created = await repo.createTrip(parsed.data);
    return NextResponse.json({ trip: created }, { status: 201 });
  } catch (err) {
    if (err instanceof DuplicateSlugError) {
      return NextResponse.json(
        {
          error: err.message,
          fieldErrors: { slug: [err.message] },
        },
        { status: 409 }
      );
    }
    return NextResponse.json(
      { error: err instanceof Error ? err.message : "Failed to create trip." },
      { status: 500 }
    );
  }
}

