const TIMEOUT_MS = 8000;
const MAX_RETRIES = 1;

const DEFAULT_HEADERS = {
  "User-Agent":
    "Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/124.0.0.0 Safari/537.36",
  "Accept": "text/html,application/xhtml+xml,application/xml;q=0.9,*/*;q=0.8",
  "Accept-Language": "en-US,en;q=0.9",
  "Accept-Encoding": "gzip, deflate, br",
};

function sleep(ms: number) {
  return new Promise((r) => setTimeout(r, ms));
}

export async function fetchPage(url: string): Promise<string> {
  let lastError: Error | null = null;

  for (let attempt = 0; attempt <= MAX_RETRIES; attempt++) {
    if (attempt > 0) {
      await sleep(Math.min(1000 * attempt, 3000));
    }

    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), TIMEOUT_MS);

    try {
      const res = await fetch(url, {
        headers: DEFAULT_HEADERS,
        signal: controller.signal,
        // Next.js fetch cache with revalidation
        next: { revalidate: 60 },
      });

      clearTimeout(timeoutId);

      if (!res.ok) {
        if (res.status >= 500 && attempt < MAX_RETRIES) {
          lastError = new Error(`HTTP ${res.status}`);
          continue;
        }
        throw new Error(`HTTP ${res.status} fetching ${url}`);
      }

      return await res.text();
    } catch (err) {
      clearTimeout(timeoutId);
      if (err instanceof Error && err.name === "AbortError") {
        throw new Error(`Timeout fetching ${url}`);
      }
      lastError = err instanceof Error ? err : new Error(String(err));
      if (attempt < MAX_RETRIES) continue;
    }
  }

  throw lastError ?? new Error(`Failed to fetch ${url}`);
}

/** Fetch with a specific revalidate window (seconds) */
export async function fetchPageWithRevalidate(
  url: string,
  revalidate: number
): Promise<string> {
  const controller = new AbortController();
  const timeoutId = setTimeout(() => controller.abort(), TIMEOUT_MS);

  try {
    const res = await fetch(url, {
      headers: DEFAULT_HEADERS,
      signal: controller.signal,
      next: { revalidate },
    });

    clearTimeout(timeoutId);

    if (!res.ok) throw new Error(`HTTP ${res.status} fetching ${url}`);
    return await res.text();
  } catch (err) {
    clearTimeout(timeoutId);
    if (err instanceof Error && err.name === "AbortError") {
      throw new Error(`Timeout fetching ${url}`);
    }
    throw err;
  }
}
