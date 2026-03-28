import { NextRequest, NextResponse } from "next/server";
import { scrapeMeetDetail } from "@/lib/scraper/meets";
import type { ApiResponse, MeetDetail } from "@/types";

export const runtime = "nodejs";

export async function GET(
  _req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params;

  try {
    const meet = await scrapeMeetDetail(id);
    const res: ApiResponse<MeetDetail> = {
      data: meet,
      cached: false,
      fetchedAt: Date.now(),
    };
    return NextResponse.json(res, {
      headers: { "Cache-Control": "public, s-maxage=60, stale-while-revalidate=30" },
    });
  } catch (err) {
    const res: ApiResponse<MeetDetail> = {
      data: null,
      error: err instanceof Error ? err.message : "Failed to fetch meet",
      cached: false,
      fetchedAt: Date.now(),
    };
    return NextResponse.json(res, { status: 500 });
  }
}
