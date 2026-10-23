import type { Metadata } from "next";
import { getAdminSession } from "@/lib/auth";
import { getTripRepository } from "@/lib/db";
import { AdminLayoutClient } from "@/components/admin/AdminLayoutClient";

export const dynamic = "force-dynamic";

export const metadata: Metadata = {
  title: "TAMROI Admin Console — ระบบจัดการหลังบ้าน",
  description: "ระบบบริหารจัดการโพสต์และสมาชิกสำหรับผู้ดูแลระบบ TAMROI",
};

export default async function AdminLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const session = await getAdminSession();
  const repo = getTripRepository();

  return (
    <AdminLayoutClient
      isAuthenticated={session.authenticated}
      adminEmail={session.email || "admin@tamroi.local"}
      backendName={repo.backendName}
    >
      {children}
    </AdminLayoutClient>
  );
}

