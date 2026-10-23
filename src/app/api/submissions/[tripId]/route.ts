import { NextResponse } from "next/server";
import { getUserSession } from "@/lib/auth";
import { ForbiddenError, getTripRepository, NotFoundError } from "@/lib/db";
import { tripSubmissionSchema } from "@/lib/validation";

interface RouteContext {
  params: Promise<{ tripId: string }>;
}

export async function GET(_request: Request, context: RouteContext) {
  try {
    const { tripId } = await context.params;
    const session = await getUserSession();
    if (!session.authenticated || !session.user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const repo = getTripRepository();
    const profile = await repo.getProfile(session.user.id);
    if (profile?.is_banned) {
      return NextResponse.json(
        {
          error: `บัญชีของคุณถูกระงับการใช้งาน: ${profile.banned_reason || "ฝ่าฝืนกฎการใช้งานของชุมชน"}`,
        },
        { status: 403 }
      );
    }
    const submission = await repo.getUserSubmissionById(session.user.id, tripId);
    if (!submission) {
      return NextResponse.json({ error: "Submission not found" }, { status: 404 });
    }

    return NextResponse.json({ submission });
  } catch (error) {
    console.error("Get submission error:", error);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}

export async function PUT(request: Request, context: RouteContext) {
  try {
    const { tripId } = await context.params;
    const session = await getUserSession();
    if (!session.authenticated || !session.user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const json = await request.json();
    const parsed = tripSubmissionSchema.safeParse(json);

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
    const profile = await repo.getProfile(session.user.id);
    if (profile?.is_banned) {
      return NextResponse.json(
        {
          error: `บัญชีของคุณถูกระงับการใช้งาน: ${profile.banned_reason || "ฝ่าฝืนกฎการใช้งานของชุมชน"}`,
        },
        { status: 403 }
      );
    }
    try {
      const updated = await repo.updateSubmission(session.user.id, tripId, parsed.data);
      return NextResponse.json({
        message: "Submission updated successfully",
        submission: updated,
      });
    } catch (err) {
      if (err instanceof NotFoundError) {
        return NextResponse.json({ error: "Submission not found" }, { status: 404 });
      }
      if (err instanceof ForbiddenError) {
        return NextResponse.json({ error: err.message }, { status: 403 });
      }
      throw err;
    }
  } catch (error) {
    console.error("Update submission error:", error);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}

