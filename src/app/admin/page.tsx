import { redirect } from "next/navigation";
import { getAdminSession } from "@/lib/auth";
import { getTripRepository } from "@/lib/db";
import { AdminDashboardClient } from "@/components/admin/AdminDashboardClient";

export const dynamic = "force-dynamic";

export default async function AdminDashboardPage() {
  const session = await getAdminSession();
  if (!session.authenticated) {
    redirect("/admin/login");
  }

  const repo = getTripRepository();
  const trips = await repo.listAllTripsForAdmin();

  return (
    <div className="mx-auto max-w-7xl px-4 py-8 sm:px-6 lg:px-8">
      <AdminDashboardClient
        initialTrips={trips}
        adminEmail={session.email || "admin"}
        backendName={repo.backendName}
      />
    </div>
  );
}

