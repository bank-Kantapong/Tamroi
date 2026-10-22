import { NextResponse } from "next/server";
import { getUserSession } from "@/lib/auth";
import { DuplicateSaveError, getTripRepository, NotFoundError } from "@/lib/db";

export async function GET(request: Request) {
  try {
    const session = await getUserSession();
    if (!session.authenticated || !session.user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { searchParams } = new URL(request.url);
    const idsOnly = searchParams.get("idsOnly") === "1" || searchParams.get("idsOnly") === "true";

    const repo = getTripRepository();

    if (idsOnly) {
      const savedTripIds = await repo.listSavedTripIds(session.user.id);
      return NextResponse.json({ savedTripIds });
    }

    const savedTrips = await repo.listSavedTrips(session.user.id);
    return NextResponse.json({ savedTrips });
  } catch (error) {
    console.error("List saved trips error:", error);
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
    const tripId = json?.tripId;

    if (!tripId || typeof tripId !== "string") {
      return NextResponse.json({ error: "tripId is required" }, { status: 400 });
    }

    const repo = getTripRepository();
    try {
      const saved = await repo.saveTrip(session.user.id, tripId);
      return NextResponse.json({ message: "Trip saved successfully", saved }, { status: 201 });
    } catch (err) {
      if (err instanceof DuplicateSaveError) {
        return NextResponse.json(
          { message: "Trip is already saved", alreadySaved: true },
          { status: 200 }
        );
      }
      if (err instanceof NotFoundError) {
        return NextResponse.json(
          { error: "Trip not found or is not published" },
          { status: 404 }
        );
      }
      throw err;
    }
  } catch (error) {
    console.error("Save trip error:", error);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}

export async function DELETE(request: Request) {
  try {
    const session = await getUserSession();
    if (!session.authenticated || !session.user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    let tripId: string | null = null;
    const { searchParams } = new URL(request.url);
    tripId = searchParams.get("tripId");

    if (!tripId) {
      try {
        const json = await request.json();
        tripId = json?.tripId;
      } catch {
        // ignore JSON parse error if body is empty
      }
    }

    if (!tripId || typeof tripId !== "string") {
      return NextResponse.json({ error: "tripId is required" }, { status: 400 });
    }

    const repo = getTripRepository();
    await repo.unsaveTrip(session.user.id, tripId);

    return NextResponse.json({ message: "Trip unsaved successfully", success: true });
  } catch (error) {
    console.error("Unsave trip error:", error);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}

