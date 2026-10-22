import { NextResponse } from "next/server";
import { THAI_PROVINCES } from "@/lib/provinces";

export const dynamic = "force-static";

export async function GET() {
  return NextResponse.json({
    provinces: THAI_PROVINCES,
    total: THAI_PROVINCES.length,
  });
}

