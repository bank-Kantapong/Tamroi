import { NextResponse } from "next/server";
import {
  ADMIN_COOKIE_NAME,
  createAdminSessionToken,
  verifyAdminCredentials,
} from "@/lib/auth";

export async function POST(request: Request) {
  try {
    const body = (await request.json()) as { email?: string; password?: string };
    const email = typeof body.email === "string" ? body.email : "";
    const password = typeof body.password === "string" ? body.password : "";

    if (!email.trim() || !password) {
      return NextResponse.json(
        { error: "Email and password are required." },
        { status: 400 }
      );
    }

    const result = verifyAdminCredentials(email, password);
    if (!result.valid) {
      return NextResponse.json(
        { error: result.error || "Invalid credentials." },
        { status: 401 }
      );
    }

    const token = createAdminSessionToken(email);
    const response = NextResponse.json({ ok: true, email: email.trim().toLowerCase() });

    response.cookies.set({
      name: ADMIN_COOKIE_NAME,
      value: token,
      httpOnly: true,
      sameSite: "lax",
      secure: process.env.NODE_ENV === "production",
      path: "/",
      maxAge: 60 * 60 * 12,
    });

    return response;
  } catch {
    return NextResponse.json(
      { error: "Unable to process login request." },
      { status: 400 }
    );
  }
}

