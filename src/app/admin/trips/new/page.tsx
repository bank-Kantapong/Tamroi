import { redirect } from "next/navigation";
import { getAdminSession } from "@/lib/auth";
import { TripEditorClient } from "@/components/admin/TripEditorClient";

export const dynamic = "force-dynamic";

export default async function NewTripAdminPage() {
  const session = await getAdminSession();
  if (!session.authenticated) {
    redirect("/admin/login");
  }

  return <TripEditorClient mode="create" />;
}

