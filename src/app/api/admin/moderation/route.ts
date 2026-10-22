import { NextResponse } from "next/server";
import { getAdminSession } from "@/lib/auth";
import { getTripRepository } from "@/lib/db";

export async function GET() {
  try {
    const session = await getAdminSession();
    if (!session.authenticated) {
      return NextResponse.json({ error: "Unauthorized admin access." }, { status: 401 });
    }

    const repo = getTripRepository();
    const pending = await repo.listPendingSubmissions();

    return NextResponse.json({ pending });
  } catch (error) {
    console.error("List pending submissions error:", error);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}

