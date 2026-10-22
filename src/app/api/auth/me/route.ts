import { NextResponse } from "next/server";
import { getUserSession } from "@/lib/auth";
import { getTripRepository } from "@/lib/db";

export async function GET() {
  try {
    const session = await getUserSession();
    if (!session.authenticated || !session.user) {
      return NextResponse.json({ authenticated: false, user: null });
    }

    // Refresh profile details from database
    const repo = getTripRepository();
    const profile = await repo.getProfile(session.user.id);

    return NextResponse.json({
      authenticated: true,
      user: {
        id: session.user.id,
        email: session.user.email,
        display_name: profile?.display_name || session.user.display_name,
        role: profile?.role || session.user.role,
        avatar_url: profile?.avatar_url || session.user.avatar_url,
      },
    });
  } catch (error) {
    console.error("Auth me error:", error);
    return NextResponse.json({ authenticated: false, user: null });
  }
}

