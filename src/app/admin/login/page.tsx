import { redirect } from "next/navigation";
import { getAdminSession } from "@/lib/auth";
import { AdminLoginForm } from "@/components/admin/AdminLoginForm";

export const dynamic = "force-dynamic";

export default async function AdminLoginPage() {
  const session = await getAdminSession();
  if (session.authenticated) {
    redirect("/admin");
  }

  return (
    <div className="mx-auto max-w-md px-4 py-12 sm:px-6">
      <AdminLoginForm isUsingDevDefaults={session.isUsingDevDefaults} />
    </div>
  );
}

