import { NextResponse } from "next/server";
import { getAdminSession } from "@/lib/auth";
import { NotFoundError, getTripRepository } from "@/lib/db";
import { reorderStopsSchema, stopInputSchema } from "@/lib/validation";

interface RouteContext {
  params: Promise<{ tripId: string }>;
}

export async function POST(request: Request, context: RouteContext) {
  const session = await getAdminSession();
  if (!session.authenticated) {
    return NextResponse.json({ error: "Unauthorized: Admin login required." }, { status: 401 });
  }

  const { tripId } = await context.params;

  try {
    const raw = await request.json();
    const parsed = stopInputSchema.safeParse(raw);
    if (!parsed.success) {
      return NextResponse.json(
        {
          error: "Stop validation failed",
          fieldErrors: parsed.error.flatten().fieldErrors,
          issues: parsed.error.issues.map((i) => i.message),
        },
        { status: 400 }
      );
    }

    const repo = getTripRepository();
    const stop = await repo.createStop(tripId, parsed.data);
    return NextResponse.json({ stop }, { status: 201 });
  } catch (err) {
    if (err instanceof NotFoundError) {
      return NextResponse.json({ error: err.message }, { status: 404 });
    }
    return NextResponse.json(
      { error: err instanceof Error ? err.message : "Failed to create stop." },
      { status: 500 }
    );
  }
}

export async function PUT(request: Request, context: RouteContext) {
  const session = await getAdminSession();
  if (!session.authenticated) {
    return NextResponse.json({ error: "Unauthorized: Admin login required." }, { status: 401 });
  }

  const { tripId } = await context.params;

  try {
    const raw = await request.json();
    const parsed = reorderStopsSchema.safeParse(raw);
    if (!parsed.success) {
      return NextResponse.json(
        { error: "Invalid stop reorder payload.", issues: parsed.error.issues },
        { status: 400 }
      );
    }

    const repo = getTripRepository();
    const stops = await repo.reorderStops(tripId, parsed.data.orderedStopIds);
    return NextResponse.json({ stops });
  } catch (err) {
    if (err instanceof NotFoundError) {
      return NextResponse.json({ error: err.message }, { status: 404 });
    }
    return NextResponse.json(
      { error: err instanceof Error ? err.message : "Failed to reorder stops." },
      { status: 400 }
    );
  }
}

