import { notFound, redirect } from "next/navigation";
import { getAdminSession } from "@/lib/auth";
import { getTripRepository } from "@/lib/db";
import { TripEditorClient } from "@/components/admin/TripEditorClient";

export const dynamic = "force-dynamic";

interface EditTripPageProps {
  params: Promise<{ tripId: string }>;
}

export default async function EditTripAdminPage({ params }: EditTripPageProps) {
  const session = await getAdminSession();
  if (!session.authenticated) {
    redirect("/admin/login");
  }

  const { tripId } = await params;
  const repo = getTripRepository();
  const trip = await repo.getTripByIdForAdmin(tripId);

  if (!trip) {
    notFound();
  }

  return (
    <div className="mx-auto max-w-7xl px-4 py-8 sm:px-6 lg:px-8">
      <TripEditorClient mode="edit" initialTrip={trip} />
    </div>
  );
}

