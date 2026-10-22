import { NextResponse } from "next/server";
import { getTripRepository } from "@/lib/db";
import { registerSchema } from "@/lib/validation";
import {
  createUserSessionToken,
  getAdminConfig,
  hashPassword,
  USER_COOKIE_NAME,
} from "@/lib/auth";
import type { UserRole } from "@/types/trip";

export async function POST(request: Request) {
  try {
    const json = await request.json();
    const parsed = registerSchema.safeParse(json);

    if (!parsed.success) {
      return NextResponse.json(
        {
          error: "Validation failed",
          details: parsed.error.flatten().fieldErrors,
        },
        { status: 400 }
      );
    }

    const { email, password, display_name } = parsed.data;
    const repo = getTripRepository();

    // Check if user already exists
    const existing = await repo.findUserByEmail(email);
    if (existing) {
      return NextResponse.json(
        { error: "An account with this email address already exists." },
        { status: 409 }
      );
    }

    // Determine initial role: if matches configured ADMIN_EMAIL, automatically grant admin
    const adminConfig = getAdminConfig();
    let role: UserRole = "user";
    if (adminConfig && email.toLowerCase() === adminConfig.email.toLowerCase()) {
      role = "admin";
    }

    const { salt, hash } = hashPassword(password);
    const { user, profile } = await repo.createUser(
      email,
      hash,
      salt,
      display_name,
      role
    );

    const sessionUser = {
      id: user.id,
      email: user.email,
      display_name: profile.display_name,
      role: profile.role,
      avatar_url: profile.avatar_url,
    };

    const token = createUserSessionToken(sessionUser);
    const response = NextResponse.json(
      {
        message: "Registration successful",
        user: sessionUser,
      },
      { status: 201 }
    );

    response.cookies.set(USER_COOKIE_NAME, token, {
      httpOnly: true,
      secure: process.env.NODE_ENV === "production",
      sameSite: "lax",
      path: "/",
      maxAge: 60 * 60 * 24 * 7, // 7 days
    });

    return response;
  } catch (error) {
    console.error("Register error:", error);
    return NextResponse.json(
      { error: "Internal server error during registration." },
      { status: 500 }
    );
  }
}

