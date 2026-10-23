import { redirect } from "next/navigation";
import { getAdminSession } from "@/lib/auth";
import { getTripRepository } from "@/lib/db";
import { AdminDashboardClient } from "@/components/admin/AdminDashboardClient";

export const dynamic = "force-dynamic";

interface AdminPageProps {
  searchParams: Promise<{ tab?: string }>;
}

export default async function AdminDashboardPage({ searchParams }: AdminPageProps) {
  const session = await getAdminSession();
  if (!session.authenticated) {
    redirect("/admin/login");
  }

  const { tab } = await searchParams;
  const repo = getTripRepository();
  const trips = await repo.listAllTripsForAdmin();
  const users = await repo.listUsersForAdmin();

  return (
    <AdminDashboardClient
      initialTrips={trips}
      initialUsers={users}
      initialTab={tab === "users" ? "users" : "posts"}
      adminEmail={session.email || "admin"}
      backendName={repo.backendName}
    />
  );
}
