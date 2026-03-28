import { NextRequest, NextResponse } from "next/server";
import { scrapeRecentMeets } from "@/lib/scraper/meets";
import type { ApiResponse, Meet } from "@/types";

export const runtime = "nodejs";

export async function GET(req: NextRequest) {
  const hours = parseInt(req.nextUrl.searchParams.get("hours") || "24");

  try {
    const meets = await scrapeRecentMeets(Math.min(hours, 7 * 24));
    const res: ApiResponse<Meet[]> = {
      data: meets,
      cached: false,
      fetchedAt: Date.now(),
    };
    return NextResponse.json(res, {
      headers: { "Cache-Control": "public, s-maxage=300, stale-while-revalidate=120" },
    });
  } catch (err) {
    const res: ApiResponse<Meet[]> = {
      data: null,
      error: err instanceof Error ? err.message : "Failed to fetch meets",
      cached: false,
      fetchedAt: Date.now(),
    };
    return NextResponse.json(res, { status: 500 });
  }
}
