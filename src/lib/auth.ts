import crypto from "node:crypto";
import { cookies } from "next/headers";

export const ADMIN_COOKIE_NAME = "tamroi_admin_session";
const SESSION_TTL_MS = 1000 * 60 * 60 * 12; // 12 hours

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
  isUsingDevDefaults: boolean;
}> {
  const config = getAdminConfig();
  const cookieStore = await cookies();
  const token = cookieStore.get(ADMIN_COOKIE_NAME)?.value;
  const verified = verifyAdminSessionToken(token);

  return {
    ...verified,
    isUsingDevDefaults: config?.isUsingDevDefaults ?? false,
  };
}

