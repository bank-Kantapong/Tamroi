import { NextResponse } from "next/server";
import { getAdminSession } from "@/lib/auth";
import { getTripRepository, NotFoundError } from "@/lib/db";
import { moderationActionSchema } from "@/lib/validation";

interface RouteContext {
  params: Promise<{ tripId: string }>;
}

export async function GET(_request: Request, context: RouteContext) {
  try {
    const session = await getAdminSession();
    if (!session.authenticated) {
      return NextResponse.json({ error: "Unauthorized admin access." }, { status: 401 });
    }

    const { tripId } = await context.params;
    const repo = getTripRepository();
    const trip = await repo.getTripByIdForAdmin(tripId);

    if (!trip) {
      return NextResponse.json({ error: "Trip not found." }, { status: 404 });
    }

    return NextResponse.json({ trip });
  } catch (error) {
    console.error("Get moderation trip error:", error);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}

export async function POST(request: Request, context: RouteContext) {
  try {
    const session = await getAdminSession();
    if (!session.authenticated) {
      return NextResponse.json({ error: "Unauthorized admin access." }, { status: 401 });
    }

    const { tripId } = await context.params;
    const json = await request.json();
    const parsed = moderationActionSchema.safeParse(json);

    if (!parsed.success) {
      return NextResponse.json(
        {
          error: "Validation failed",
          details: parsed.error.flatten().fieldErrors,
        },
        { status: 400 }
      );
    }

    const repo = getTripRepository();
    try {
      const reviewerIdentifier = session.userId || session.email || "admin";
      const reviewed = await repo.reviewSubmission(
        reviewerIdentifier,
        tripId,
        parsed.data.action,
        parsed.data.rejection_reason
      );

      return NextResponse.json({
        message: `Submission ${parsed.data.action === "approve" ? "approved and published" : "rejected"} successfully`,
        trip: reviewed,
      });
    } catch (err) {
      if (err instanceof NotFoundError) {
        return NextResponse.json({ error: "Submission not found." }, { status: 404 });
      }
      console.error("Review submission error:", err);
      return NextResponse.json(
        { error: err instanceof Error ? err.message : "Failed to review submission." },
        { status: 500 }
      );
    }
  } catch (error) {
    console.error("Review submission error:", error);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}

