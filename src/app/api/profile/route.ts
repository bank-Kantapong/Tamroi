import { NextResponse } from "next/server";
import { getUserSession } from "@/lib/auth";
import { getTripRepository } from "@/lib/db";
import { profileUpdateSchema } from "@/lib/validation";

export async function GET() {
  try {
    const session = await getUserSession();
    if (!session.authenticated || !session.user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const repo = getTripRepository();
    const profile = await repo.getProfile(session.user.id);
    if (!profile) {
      return NextResponse.json({ error: "Profile not found" }, { status: 404 });
    }

    return NextResponse.json({
      profile: {
        ...profile,
        email: session.user.email,
      },
    });
  } catch (error) {
    console.error("Get profile error:", error);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}

export async function PUT(request: Request) {
  try {
    const session = await getUserSession();
    if (!session.authenticated || !session.user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const json = await request.json();
    const parsed = profileUpdateSchema.safeParse(json);
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
    const updated = await repo.updateProfile(session.user.id, parsed.data);

    return NextResponse.json({
      message: "Profile updated successfully",
      profile: {
        ...updated,
        email: session.user.email,
      },
    });
  } catch (error) {
    console.error("Update profile error:", error);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}

