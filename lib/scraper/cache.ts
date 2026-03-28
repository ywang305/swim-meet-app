interface CacheEntry<T> {
  data: T;
  expiresAt: number;
}

class TtlCache {
  private store = new Map<string, CacheEntry<unknown>>();

  get<T>(key: string): T | null {
    const entry = this.store.get(key);
    if (!entry) return null;
    if (Date.now() > entry.expiresAt) {
      this.store.delete(key);
      return null;
    }
    return entry.data as T;
  }

  set<T>(key: string, value: T, ttlMs: number): void {
    this.store.set(key, { data: value, expiresAt: Date.now() + ttlMs });
  }

  has(key: string): boolean {
    return this.get(key) !== null;
  }
}

// Module-level singleton — shared within a single Lambda execution
export const cache = new TtlCache();
