import crypto from "node:crypto";
import { cookies } from "next/headers";
import type { SessionUser, UserRole } from "@/types/trip";

export const ADMIN_COOKIE_NAME = "tamroi_admin_session";
export const USER_COOKIE_NAME = "tamroi_user_session";
const SESSION_TTL_MS = 1000 * 60 * 60 * 12; // 12 hours for admin
const USER_SESSION_TTL_MS = 1000 * 60 * 60 * 24 * 7; // 7 days for users

interface AdminConfig {
  email: string;
  password: string;
  secret: string;
  isUsingDevDefaults: boolean;
}

export function getAdminConfig(): AdminConfig | null {
  const envEmail = process.env.ADMIN_EMAIL?.trim();
  const envPassword = process.env.ADMIN_PASSWORD?.trim();
  const envSecret = process.env.ADMIN_SESSION_SECRET?.trim();

  if (envEmail && envPassword && envSecret) {
    return {
      email: envEmail.toLowerCase(),
      password: envPassword,
      secret: envSecret,
      isUsingDevDefaults: false,
    };
  }

  // In production, never fall back to default credentials
  if (process.env.NODE_ENV === "production") {
    return null;
  }

  return {
    email: (envEmail || "admin@tamroi.local").toLowerCase(),
    password: envPassword || "tamroi-dev-admin-2026",
    secret: envSecret || "tamroi-local-dev-only-session-secret-key-2026",
    isUsingDevDefaults: true,
  };
}

function safeEqualStrings(a: string, b: string): boolean {
  const hashA = crypto.createHash("sha256").update(a).digest();
  const hashB = crypto.createHash("sha256").update(b).digest();
  return crypto.timingSafeEqual(hashA, hashB) && a.length === b.length;
}

export function verifyAdminCredentials(
  email: string,
  password: string
): { valid: boolean; error?: string } {
  const config = getAdminConfig();
  if (!config) {
    return {
      valid: false,
      error:
        "Admin credentials are not configured on the server. Set ADMIN_EMAIL, ADMIN_PASSWORD, and ADMIN_SESSION_SECRET.",
    };
  }

  const normalizedEmail = email.trim().toLowerCase();
  const emailMatches = safeEqualStrings(normalizedEmail, config.email);
  const passwordMatches = safeEqualStrings(password, config.password);

  if (!emailMatches || !passwordMatches) {
    return { valid: false, error: "Invalid admin email or password." };
  }

  return { valid: true };
}

export function createAdminSessionToken(email: string, nowMs = Date.now()): string {
  const config = getAdminConfig();
  if (!config) {
    throw new Error("Admin configuration missing; cannot issue session token.");
  }

  const payload = {
    sub: email.trim().toLowerCase(),
    role: "admin",
    iat: nowMs,
    exp: nowMs + SESSION_TTL_MS,
  };

  const encodedPayload = Buffer.from(JSON.stringify(payload), "utf8").toString("base64url");
  const signature = crypto
    .createHmac("sha256", config.secret)
    .update(encodedPayload)
    .digest("base64url");

  return `${encodedPayload}.${signature}`;
}

export function verifyAdminSessionToken(
  token: string | undefined | null,
  nowMs = Date.now()
): { authenticated: boolean; email?: string } {
  if (!token || typeof token !== "string") {
    return { authenticated: false };
  }

  const config = getAdminConfig();
  if (!config) {
    return { authenticated: false };
  }

  const parts = token.split(".");
  if (parts.length !== 2) {
    return { authenticated: false };
  }

  const [encodedPayload, providedSignature] = parts;
  const expectedSignature = crypto
    .createHmac("sha256", config.secret)
    .update(encodedPayload)
    .digest("base64url");

  if (!safeEqualStrings(providedSignature, expectedSignature)) {
    return { authenticated: false };
  }

  try {
    const rawJson = Buffer.from(encodedPayload, "base64url").toString("utf8");
    const parsed = JSON.parse(rawJson) as {
      sub?: string;
      role?: string;
      exp?: number;
    };

    if (
      parsed.role !== "admin" ||
      typeof parsed.sub !== "string" ||
      typeof parsed.exp !== "number" ||
      parsed.exp <= nowMs
    ) {
      return { authenticated: false };
    }

    if (!safeEqualStrings(parsed.sub.toLowerCase(), config.email)) {
      return { authenticated: false };
    }

    return { authenticated: true, email: parsed.sub };
  } catch {
    return { authenticated: false };
  }
}

export async function getAdminSession(): Promise<{
  authenticated: boolean;
  email?: string;
  userId?: string;
  isUsingDevDefaults: boolean;
}> {
  const config = getAdminConfig();
  try {
    const cookieStore = await cookies();
    const token = cookieStore.get(ADMIN_COOKIE_NAME)?.value;
    const verified = verifyAdminSessionToken(token);
    if (verified.authenticated) {
      return {
        ...verified,
        isUsingDevDefaults: config?.isUsingDevDefaults ?? false,
      };
    }

    // Also support user session with role === "admin"
    const userToken = cookieStore.get(USER_COOKIE_NAME)?.value;
    const userVerified = verifyUserSessionToken(userToken);
    if (userVerified.authenticated && userVerified.user?.role === "admin") {
      return {
        authenticated: true,
        email: userVerified.user.email,
        userId: userVerified.user.id,
        isUsingDevDefaults: config?.isUsingDevDefaults ?? false,
      };
    }
  } catch {
    // Ignore cookie read failure
  }

  return {
    authenticated: false,
    isUsingDevDefaults: config?.isUsingDevDefaults ?? false,
  };
}

// ---------------------------------------------------------------------------
// Phase 2: User Password Hashing and Session Management
// ---------------------------------------------------------------------------

export function hashPassword(password: string): { salt: string; hash: string } {
  const salt = crypto.randomBytes(16).toString("hex");
  const hash = crypto.scryptSync(password, salt, 64).toString("hex");
  return { salt, hash };
}

export function verifyPassword(password: string, salt: string, expectedHash: string): boolean {
  try {
    const hash = crypto.scryptSync(password, salt, 64).toString("hex");
    return safeEqualStrings(hash, expectedHash);
  } catch {
    return false;
  }
}

function getSessionSecret(): string {
  const secret = process.env.ADMIN_SESSION_SECRET?.trim() || process.env.SESSION_SECRET?.trim();
  if (secret) return secret;
  if (process.env.NODE_ENV === "production") {
    throw new Error("SESSION_SECRET or ADMIN_SESSION_SECRET is required in production.");
  }
  return "tamroi-local-dev-only-session-secret-key-2026";
}

export function createUserSessionToken(user: SessionUser, nowMs = Date.now()): string {
  const secret = getSessionSecret();
  const payload = {
    sub: user.id,
    email: user.email.toLowerCase(),
    display_name: user.display_name,
    role: user.role,
    avatar_url: user.avatar_url,
    iat: nowMs,
    exp: nowMs + USER_SESSION_TTL_MS,
  };

  const encodedPayload = Buffer.from(JSON.stringify(payload), "utf8").toString("base64url");
  const signature = crypto.createHmac("sha256", secret).update(encodedPayload).digest("base64url");
  return `${encodedPayload}.${signature}`;
}

export function verifyUserSessionToken(
  token: string | undefined | null,
  nowMs = Date.now()
): { authenticated: boolean; user?: SessionUser } {
  if (!token || typeof token !== "string") {
    return { authenticated: false };
  }

  const parts = token.split(".");
  if (parts.length !== 2) {
    return { authenticated: false };
  }

  try {
    const secret = getSessionSecret();
    const [encodedPayload, providedSignature] = parts;
    const expectedSignature = crypto
      .createHmac("sha256", secret)
      .update(encodedPayload)
      .digest("base64url");

    if (!safeEqualStrings(providedSignature, expectedSignature)) {
      return { authenticated: false };
    }

    const rawJson = Buffer.from(encodedPayload, "base64url").toString("utf8");
    const parsed = JSON.parse(rawJson) as {
      sub?: string;
      email?: string;
      display_name?: string;
      role?: UserRole;
      avatar_url?: string | null;
      exp?: number;
    };

    if (
      typeof parsed.sub !== "string" ||
      typeof parsed.email !== "string" ||
      typeof parsed.exp !== "number" ||
      parsed.exp <= nowMs
    ) {
      return { authenticated: false };
    }

    return {
      authenticated: true,
      user: {
        id: parsed.sub,
        email: parsed.email,
        display_name: parsed.display_name || parsed.email.split("@")[0],
        role: parsed.role || "user",
        avatar_url: parsed.avatar_url || null,
      },
    };
  } catch {
    return { authenticated: false };
  }
}

export async function getUserSession(): Promise<{
  authenticated: boolean;
  user?: SessionUser;
}> {
  try {
    const cookieStore = await cookies();
    const token = cookieStore.get(USER_COOKIE_NAME)?.value;
    return verifyUserSessionToken(token);
  } catch {
    return { authenticated: false };
  }
}

