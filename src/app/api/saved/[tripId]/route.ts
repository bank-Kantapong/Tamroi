import { NextResponse } from "next/server";
import { getUserSession } from "@/lib/auth";
import { getTripRepository } from "@/lib/db";

interface RouteContext {
  params: Promise<{ tripId: string }>;
}

export async function GET(_request: Request, context: RouteContext) {
  try {
    const { tripId } = await context.params;
    const session = await getUserSession();
    if (!session.authenticated || !session.user) {
      return NextResponse.json({ saved: false });
    }

    const repo = getTripRepository();
    const saved = await repo.isTripSaved(session.user.id, tripId);

    return NextResponse.json({ saved });
  } catch (error) {
    console.error("Check trip saved error:", error);
    return NextResponse.json({ saved: false });
  }
}

