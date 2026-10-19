import { getTripRepository } from "@/lib/db";
import { HomeClient } from "@/components/home";
import type { TripFilterParams } from "@/types/trip";

export const dynamic = "force-dynamic";

interface HomePageProps {
  searchParams: Promise<{
    q?: string;
    province?: string;
    category?: string;
    duration?: string;
    maxBudget?: string;
  }>;
}

export default async function HomePage({ searchParams }: HomePageProps) {
  const resolvedParams = await searchParams;
  const maxBudgetNum = resolvedParams.maxBudget
    ? Number(resolvedParams.maxBudget)
    : undefined;

  const filters: TripFilterParams = {
    q: resolvedParams.q?.trim() || undefined,
    province: resolvedParams.province?.trim() || undefined,
    category: resolvedParams.category?.trim() || undefined,
    duration: resolvedParams.duration?.trim() || undefined,
    maxBudget:
      maxBudgetNum !== undefined && Number.isFinite(maxBudgetNum) && maxBudgetNum > 0
        ? maxBudgetNum
        : undefined,
  };

  const repo = getTripRepository();
  const [trips, metadata] = await Promise.all([
    repo.listPublishedTrips(filters),
    repo.getPublishedFilterMetadata(),
  ]);

  return <HomeClient trips={trips} metadata={metadata} filters={filters} />;
}
