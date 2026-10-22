import { NextResponse } from "next/server";
import { getUserSession } from "@/lib/auth";
import { getTripRepository } from "@/lib/db";
import { tripSubmissionSchema } from "@/lib/validation";

export async function GET() {
  try {
    const session = await getUserSession();
    if (!session.authenticated || !session.user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const repo = getTripRepository();
    const submissions = await repo.listUserSubmissions(session.user.id);

    return NextResponse.json({ submissions });
  } catch (error) {
    console.error("List submissions error:", error);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}

export async function POST(request: Request) {
  try {
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
    const created = await repo.createSubmission(session.user.id, parsed.data);

    return NextResponse.json(
      {
        message: "Submission created successfully",
        submission: created,
      },
      { status: 201 }
    );
  } catch (error) {
    console.error("Create submission error:", error);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}

