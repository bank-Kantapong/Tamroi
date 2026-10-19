import { NextResponse } from "next/server";
import { getAdminSession } from "@/lib/auth";
import { DuplicateSlugError, NotFoundError, getTripRepository } from "@/lib/db";
import { TRIP_STATUSES, tripInputSchema } from "@/lib/validation";
import type { TripStatus } from "@/types/trip";

interface RouteContext {
  params: Promise<{ tripId: string }>;
}

export async function GET(_request: Request, context: RouteContext) {
  const session = await getAdminSession();
  if (!session.authenticated) {
    return NextResponse.json({ error: "Unauthorized: Admin login required." }, { status: 401 });
  }

  const { tripId } = await context.params;
  const repo = getTripRepository();
  const trip = await repo.getTripByIdForAdmin(tripId);
  if (!trip) {
    return NextResponse.json({ error: "Trip not found." }, { status: 404 });
  }

  return NextResponse.json({ trip });
}

export async function PUT(request: Request, context: RouteContext) {
  const session = await getAdminSession();
  if (!session.authenticated) {
    return NextResponse.json({ error: "Unauthorized: Admin login required." }, { status: 401 });
  }

  const { tripId } = await context.params;

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
    const updated = await repo.updateTrip(tripId, parsed.data);
    return NextResponse.json({ trip: updated });
  } catch (err) {
    if (err instanceof DuplicateSlugError) {
      return NextResponse.json(
        { error: err.message, fieldErrors: { slug: [err.message] } },
        { status: 409 }
      );
    }
    if (err instanceof NotFoundError) {
      return NextResponse.json({ error: err.message }, { status: 404 });
    }
    return NextResponse.json(
      { error: err instanceof Error ? err.message : "Failed to update trip." },
      { status: 500 }
    );
  }
}

export async function PATCH(request: Request, context: RouteContext) {
  const session = await getAdminSession();
  if (!session.authenticated) {
    return NextResponse.json({ error: "Unauthorized: Admin login required." }, { status: 401 });
  }

  const { tripId } = await context.params;

  try {
    const body = (await request.json()) as { status?: string };
    if (!body.status || !TRIP_STATUSES.includes(body.status as TripStatus)) {
      return NextResponse.json(
        { error: "Status must be either 'draft' or 'published'." },
        { status: 400 }
      );
    }

    const repo = getTripRepository();
    const updated = await repo.setTripStatus(tripId, body.status as TripStatus);
    return NextResponse.json({ trip: updated });
  } catch (err) {
    if (err instanceof NotFoundError) {
      return NextResponse.json({ error: err.message }, { status: 404 });
    }
    return NextResponse.json(
      { error: err instanceof Error ? err.message : "Failed to update trip status." },
      { status: 500 }
    );
  }
}

export async function DELETE(_request: Request, context: RouteContext) {
  const session = await getAdminSession();
  if (!session.authenticated) {
    return NextResponse.json({ error: "Unauthorized: Admin login required." }, { status: 401 });
  }

  const { tripId } = await context.params;
  try {
    const repo = getTripRepository();
    await repo.deleteTrip(tripId);
    return NextResponse.json({ ok: true });
  } catch (err) {
    if (err instanceof NotFoundError) {
      return NextResponse.json({ error: err.message }, { status: 404 });
    }
    return NextResponse.json(
      { error: err instanceof Error ? err.message : "Failed to delete trip." },
      { status: 500 }
    );
  }
}

