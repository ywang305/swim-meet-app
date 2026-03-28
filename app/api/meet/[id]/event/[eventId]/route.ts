import { NextRequest, NextResponse } from "next/server";
import { scrapeEventResults } from "@/lib/scraper/events";
import type { ApiResponse, EventResults } from "@/types";

export const runtime = "nodejs";

export async function GET(
  req: NextRequest,
  { params }: { params: Promise<{ id: string; eventId: string }> }
) {
  const { id, eventId } = await params;
  const meetName = req.nextUrl.searchParams.get("meetName") || "";

  try {
    const results = await scrapeEventResults(id, eventId, meetName);
    const res: ApiResponse<EventResults> = {
      data: results,
      cached: false,
      fetchedAt: Date.now(),
    };
    return NextResponse.json(res, {
      headers: { "Cache-Control": "public, s-maxage=15, stale-while-revalidate=15" },
    });
  } catch (err) {
    const res: ApiResponse<EventResults> = {
      data: null,
      error: err instanceof Error ? err.message : "Failed to fetch event results",
      cached: false,
      fetchedAt: Date.now(),
    };
    return NextResponse.json(res, { status: 500 });
  }
}
