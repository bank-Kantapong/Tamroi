import { NextResponse } from "next/server";
import { getTripRepository } from "@/lib/db";
import { loginSchema } from "@/lib/validation";
import {
  createUserSessionToken,
  getAdminConfig,
  hashPassword,
  USER_COOKIE_NAME,
  verifyAdminCredentials,
  verifyPassword,
} from "@/lib/auth";
import type { SessionUser, UserRole } from "@/types/trip";

export async function POST(request: Request) {
  try {
    const json = await request.json();
    const parsed = loginSchema.safeParse(json);

    if (!parsed.success) {
      return NextResponse.json(
        {
          error: "Validation failed",
          details: parsed.error.flatten().fieldErrors,
        },
        { status: 400 }
      );
    }

    const { email, password } = parsed.data;
    const repo = getTripRepository();

    let user = await repo.findUserByEmail(email);

    // If user is not yet registered, check if they are the provisioned administrator
    if (!user) {
      const adminCreds = verifyAdminCredentials(email, password);
      if (adminCreds.valid) {
        // Auto-provision admin user and profile in repository
        const { salt, hash } = hashPassword(password);
        const displayName = email.split("@")[0] || "Admin";
        const provisioned = await repo.createUser(
          email,
          hash,
          salt,
          displayName,
          "admin"
        );
        user = provisioned.user;
      }
    }

    if (!user) {
      return NextResponse.json(
        { error: "Invalid email or password." },
        { status: 401 }
      );
    }

    // Verify password if not auto-provisioned right above
    if (user.password_hash) {
      const passwordOk = verifyPassword(password, user.salt, user.password_hash);
      if (!passwordOk) {
        return NextResponse.json(
          { error: "Invalid email or password." },
          { status: 401 }
        );
      }
    }

    const profile = await repo.getProfile(user.id);
    const adminConfig = getAdminConfig();
    const isConfiguredAdmin =
      adminConfig && email.toLowerCase() === adminConfig.email.toLowerCase();
    const finalRole: UserRole =
      profile?.role === "admin" || isConfiguredAdmin ? "admin" : "user";

    const sessionUser: SessionUser = {
      id: user.id,
      email: user.email,
      display_name: profile?.display_name || user.email.split("@")[0],
      role: finalRole,
      avatar_url: profile?.avatar_url || null,
    };

    const token = createUserSessionToken(sessionUser);
    const response = NextResponse.json({
      message: "Login successful",
      user: sessionUser,
    });

    response.cookies.set(USER_COOKIE_NAME, token, {
      httpOnly: true,
      secure: process.env.NODE_ENV === "production",
      sameSite: "lax",
      path: "/",
      maxAge: 60 * 60 * 24 * 7, // 7 days
    });

    return response;
  } catch (error) {
    console.error("Login error:", error);
    return NextResponse.json(
      { error: "Internal server error during login." },
      { status: 500 }
    );
  }
}

