import { redirect } from "next/navigation";
import { getAdminSession } from "@/lib/auth";
import { getTripRepository } from "@/lib/db";
import { ModerationQueueClient } from "@/components/admin/ModerationQueueClient";

export const dynamic = "force-dynamic";

export default async function AdminModerationPage() {
  const session = await getAdminSession();
  if (!session.authenticated) {
    redirect("/admin/login");
  }

  const repo = getTripRepository();
  const pending = await repo.listPendingSubmissions();

  return (
    <div className="mx-auto max-w-7xl px-4 py-8 sm:px-6 lg:px-8">
      <ModerationQueueClient
        initialPending={pending}
        adminEmail={session.email || "admin"}
        backendName={repo.backendName}
      />
    </div>
  );
}

