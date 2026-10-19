import { NextResponse } from "next/server";
import { getAdminSession } from "@/lib/auth";
import { NotFoundError, getTripRepository } from "@/lib/db";
import { stopInputSchema } from "@/lib/validation";

interface RouteContext {
  params: Promise<{ tripId: string; stopId: string }>;
}

export async function PUT(request: Request, context: RouteContext) {
  const session = await getAdminSession();
  if (!session.authenticated) {
    return NextResponse.json({ error: "Unauthorized: Admin login required." }, { status: 401 });
  }

  const { tripId, stopId } = await context.params;

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
    const stop = await repo.updateStop(tripId, stopId, parsed.data);
    return NextResponse.json({ stop });
  } catch (err) {
    if (err instanceof NotFoundError) {
      return NextResponse.json({ error: err.message }, { status: 404 });
    }
    return NextResponse.json(
      { error: err instanceof Error ? err.message : "Failed to update stop." },
      { status: 500 }
    );
  }
}

export async function DELETE(_request: Request, context: RouteContext) {
  const session = await getAdminSession();
  if (!session.authenticated) {
    return NextResponse.json({ error: "Unauthorized: Admin login required." }, { status: 401 });
  }

  const { tripId, stopId } = await context.params;

  try {
    const repo = getTripRepository();
    await repo.deleteStop(tripId, stopId);
    return NextResponse.json({ ok: true });
  } catch (err) {
    if (err instanceof NotFoundError) {
      return NextResponse.json({ error: err.message }, { status: 404 });
    }
    return NextResponse.json(
      { error: err instanceof Error ? err.message : "Failed to delete stop." },
      { status: 500 }
    );
  }
}

