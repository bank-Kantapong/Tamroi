import { NextRequest, NextResponse } from "next/server";
import { getTripRepository } from "@/lib/db";
import { TripFilterParams } from "@/types/trip";

export const dynamic = "force-dynamic";

export async function GET(request: NextRequest) {
  try {
    const searchParams = request.nextUrl.searchParams;
    const q = searchParams.get("q")?.trim() || undefined;
    const province = searchParams.get("province")?.trim() || undefined;
    const category = searchParams.get("category")?.trim() || undefined;
    const duration = searchParams.get("duration")?.trim() || undefined;
    const maxBudgetParam = searchParams.get("maxBudget")?.trim();

    const maxBudgetNum = maxBudgetParam ? Number(maxBudgetParam) : undefined;
    const maxBudget =
      maxBudgetNum !== undefined && Number.isFinite(maxBudgetNum) && maxBudgetNum > 0
        ? maxBudgetNum
        : undefined;

    const filters: TripFilterParams = {
      q,
      province,
      category,
      duration,
      maxBudget,
    };

    const repo = getTripRepository();
    const trips = await repo.listPublishedTrips(filters);

    return NextResponse.json({
      trips,
      totalCount: trips.length,
      filters,
    });
  } catch (error) {
    console.error("Failed to query trips:", error);
    return NextResponse.json(
      { error: "Failed to query trips" },
      { status: 500 }
    );
  }
}

