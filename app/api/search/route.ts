import { NextRequest, NextResponse } from "next/server";
import { searchSwimmers } from "@/lib/scraper/swimmers";
import { scrapeRecentMeets } from "@/lib/scraper/meets";
import type { ApiResponse, SearchResults } from "@/types";

export const runtime = "nodejs";

export async function GET(req: NextRequest) {
  const q = req.nextUrl.searchParams.get("q")?.trim() || "";
  const type = req.nextUrl.searchParams.get("type") || "all";

  if (!q || q.length < 2) {
    const res: ApiResponse<SearchResults> = {
      data: { swimmers: [], meets: [], query: q, timestamp: Date.now() },
      cached: false,
      fetchedAt: Date.now(),
    };
    return NextResponse.json(res);
  }

  try {
    const [swimmers, allMeets] = await Promise.all([
      type === "meet" ? Promise.resolve([]) : searchSwimmers(q),
      type === "swimmer" ? Promise.resolve([]) : scrapeRecentMeets(7 * 24),
    ]);

    // Filter meets by name query
    const meetMatches =
      type === "swimmer"
        ? []
        : allMeets.filter((m) =>
            m.name.toLowerCase().includes(q.toLowerCase())
          );

    const result: ApiResponse<SearchResults> = {
      data: {
        swimmers,
        meets: meetMatches,
        query: q,
        timestamp: Date.now(),
      },
      cached: false,
      fetchedAt: Date.now(),
    };

    return NextResponse.json(result, {
      headers: { "Cache-Control": "public, s-maxage=120, stale-while-revalidate=60" },
    });
  } catch (err) {
    const res: ApiResponse<SearchResults> = {
      data: null,
      error: err instanceof Error ? err.message : "Search failed",
      cached: false,
      fetchedAt: Date.now(),
    };
    return NextResponse.json(res, { status: 500 });
  }
}
