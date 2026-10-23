import { redirect } from "next/navigation";
import { getAdminSession } from "@/lib/auth";

export const dynamic = "force-dynamic";

export default async function AdminModerationPage() {
  const session = await getAdminSession();
  if (!session.authenticated) {
    redirect("/admin/login");
  }

  // Pre-moderation queue has been replaced by post & user management in /admin
  redirect("/admin");
}

