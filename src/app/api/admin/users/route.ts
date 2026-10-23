import { NextResponse } from "next/server";
import { getAdminSession, getUserSession } from "@/lib/auth";
import { getTripRepository } from "@/lib/db";
import { adminUserActionSchema } from "@/lib/validation";

async function isAuthorizedAdmin(): Promise<boolean> {
  const adminSession = await getAdminSession();
  if (adminSession.authenticated) return true;

  const userSession = await getUserSession();
  return Boolean(userSession.authenticated && userSession.user?.role === "admin");
}

export async function GET() {
  const authorized = await isAuthorizedAdmin();
  if (!authorized) {
    return NextResponse.json({ error: "Unauthorized: Admin privileges required." }, { status: 401 });
  }

  try {
    const repo = getTripRepository();
    const users = await repo.listUsersForAdmin();
    return NextResponse.json({ users });
  } catch (error) {
    console.error("List users error:", error);
    return NextResponse.json({ error: "Failed to list users." }, { status: 500 });
  }
}

export async function POST(request: Request) {
  const authorized = await isAuthorizedAdmin();
  if (!authorized) {
    return NextResponse.json({ error: "Unauthorized: Admin privileges required." }, { status: 401 });
  }

  try {
    const json = await request.json();
    const parsed = adminUserActionSchema.safeParse(json);
    if (!parsed.success) {
      return NextResponse.json(
        {
          error: "Validation failed",
          details: parsed.error.flatten().fieldErrors,
        },
        { status: 400 }
      );
    }

    const { action, userId, reason, message } = parsed.data;
    const repo = getTripRepository();

    if (action === "ban") {
      const updated = await repo.setUserBanStatus(userId, true, reason || "ฝ่าฝืนกฎการใช้งานของระบบ");
      return NextResponse.json({ message: "User banned successfully", profile: updated });
    }

    if (action === "unban") {
      const updated = await repo.setUserBanStatus(userId, false);
      return NextResponse.json({ message: "User unbanned successfully", profile: updated });
    }

    if (action === "warn") {
      const updated = await repo.warnUser(userId, message || "คำเตือนจากผู้ดูแลระบบ: กรุณาปฏิบัติตามกฎของชุมชน");
      return NextResponse.json({ message: "Warning sent successfully", profile: updated });
    }

    if (action === "clear_warn") {
      const updated = await repo.clearUserWarning(userId);
      return NextResponse.json({ message: "Warning cleared successfully", profile: updated });
    }

    return NextResponse.json({ error: "Invalid action." }, { status: 400 });
  } catch (error) {
    console.error("User action error:", error);
    return NextResponse.json(
      { error: error instanceof Error ? error.message : "Failed to execute user action." },
      { status: 500 }
    );
  }
}

