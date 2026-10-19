import { redirect } from "next/navigation";
import { getAdminSession } from "@/lib/auth";
import { TripEditorClient } from "@/components/admin/TripEditorClient";

export const dynamic = "force-dynamic";

export default async function NewTripAdminPage() {
  const session = await getAdminSession();
  if (!session.authenticated) {
    redirect("/admin/login");
  }

  return (
    <div className="mx-auto max-w-5xl px-4 py-8 sm:px-6 lg:px-8">
      <TripEditorClient mode="create" />
    </div>
  );
}

