import { get, set, del, keys } from 'idb-keyval';

const IDB_PREFIX = 'maais-cache:';

/**
 * Two-tier cache: fast in-memory Map for the current session, with a
 * persistent IndexedDB backing store so cached data survives reloads and
 * works offline (Level 2 of the SYSTEM_OPTIMIZATION roadmap).
 */
class CacheLayer {
  constructor(defaultTTL = 300000) {
    this.cache = new Map();
    this.ttl = defaultTTL;
  }

  set(key, value, ttl = this.ttl) {
    const expiry = Date.now() + ttl;
    this.cache.set(key, { value, expiry });

    // Best-effort persistence to IndexedDB (fire-and-forget)
    set(IDB_PREFIX + key, { value, expiry }).catch(() => {});
  }

  get(key) {
    const item = this.cache.get(key);
    if (!item) return undefined;

    if (Date.now() > item.expiry) {
      this.cache.delete(key);
      del(IDB_PREFIX + key).catch(() => {});
      return undefined;
    }

    return item.value;
  }

  has(key) {
    const item = this.cache.get(key);
    if (!item) return false;

    if (Date.now() > item.expiry) {
      this.cache.delete(key);
      del(IDB_PREFIX + key).catch(() => {});
      return false;
    }

    return true;
  }

  delete(key) {
    this.cache.delete(key);
    del(IDB_PREFIX + key).catch(() => {});
  }

  clear() {
    this.cache.clear();
    this._clearPersisted().catch(() => {});
  }

  cleanup() {
    const now = Date.now();
    for (const [key, item] of this.cache.entries()) {
      if (now > item.expiry) {
        this.cache.delete(key);
        del(IDB_PREFIX + key).catch(() => {});
      }
    }
  }

  async _clearPersisted() {
    const allKeys = await keys();
    await Promise.all(
      allKeys
        .filter((k) => typeof k === 'string' && k.startsWith(IDB_PREFIX))
        .map((k) => del(k)),
    );
  }

  /**
   * Loads unexpired entries from IndexedDB into memory. Call once during
   * app bootstrap so the synchronous get()/set() API reflects persisted data.
   * @returns {Promise<void>}
   */
  async init() {
    try {
      const allKeys = await keys();
      const now = Date.now();
      await Promise.all(
        allKeys
          .filter((k) => typeof k === 'string' && k.startsWith(IDB_PREFIX))
          .map(async (k) => {
            const raw = await get(k);
            if (!raw) return;
            if (now > raw.expiry) {
              await del(k);
              return;
            }
            this.cache.set(k.slice(IDB_PREFIX.length), raw);
          }),
      );
    } catch {
      // IndexedDB unavailable (e.g. private mode) — memory cache still works
    }
  }

  getOrFetch(key, fetchFn, ttl = this.ttl) {
    const cached = this.get(key);
    if (cached !== undefined) return Promise.resolve(cached);

    return fetchFn().then((value) => {
      this.set(key, value, ttl);
      return value;
    });
  }
}

export const cacheLayer = new CacheLayer();
