import { notFound } from "next/navigation";
import type { Metadata } from "next";
import { getTripRepository } from "@/lib/db";
import { getAdminSession } from "@/lib/auth";
import { TripDetailView } from "@/components/trip";

export const dynamic = "force-dynamic";

interface TripPageProps {
  params: Promise<{ slug: string }>;
  searchParams: Promise<{ preview?: string }>;
}

export async function generateMetadata({ params }: TripPageProps): Promise<Metadata> {
  const { slug } = await params;
  const repo = getTripRepository();
  const trip = await repo.getPublishedTripBySlug(slug);
  if (!trip) {
    return { title: "Trip Not Found — TAMROI" };
  }
  return {
    title: `${trip.title} (${trip.province}) — TAMROI`,
    description: trip.short_description,
  };
}

export default async function TripDetailPage({ params, searchParams }: TripPageProps) {
  const [{ slug }, query] = await Promise.all([params, searchParams]);
  const repo = getTripRepository();

  // First try public published trip lookup
  const publishedTrip = await repo.getPublishedTripBySlug(slug);
  if (publishedTrip) {
    const adminSession = query.preview === "1" ? await getAdminSession() : null;
    return (
      <TripDetailView
        trip={publishedTrip}
        isAdminPreview={Boolean(adminSession?.authenticated)}
      />
    );
  }

  // If not published, allow viewing ONLY if ?preview=1 AND visitor has a valid admin session
  if (query.preview === "1") {
    const session = await getAdminSession();
    if (session.authenticated) {
      const draftOrAnyTrip = await repo.getTripBySlugForAdmin(slug);
      if (draftOrAnyTrip) {
        return <TripDetailView trip={draftOrAnyTrip} isAdminPreview={true} />;
      }
    }
  }

  notFound();
}

