import { NextRequest, NextResponse } from "next/server";
import { scrapeSwimmerProfile } from "@/lib/scraper/swimmers";
import type { ApiResponse, SwimmerProfile } from "@/types";

export const runtime = "nodejs";

export async function GET(
  _req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params;

  try {
    const profile = await scrapeSwimmerProfile(id);
    const res: ApiResponse<SwimmerProfile> = {
      data: profile,
      cached: false,
      fetchedAt: Date.now(),
    };
    return NextResponse.json(res, {
      headers: { "Cache-Control": "public, s-maxage=60, stale-while-revalidate=30" },
    });
  } catch (err) {
    const res: ApiResponse<SwimmerProfile> = {
      data: null,
      error: err instanceof Error ? err.message : "Failed to fetch swimmer",
      cached: false,
      fetchedAt: Date.now(),
    };
    return NextResponse.json(res, { status: 500 });
  }
}
