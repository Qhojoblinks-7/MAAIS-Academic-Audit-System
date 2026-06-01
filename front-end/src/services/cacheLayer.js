class CacheLayer {
  constructor(defaultTTL = 300000) {
    this.cache = new Map();
    this.ttl = defaultTTL;
  }

  set(key, value, ttl = this.ttl) {
    const expiry = Date.now() + ttl;
    this.cache.set(key, { value, expiry });
  }

  get(key) {
    const item = this.cache.get(key);
    if (!item) return undefined;

    if (Date.now() > item.expiry) {
      this.cache.delete(key);
      return undefined;
    }

    return item.value;
  }

  has(key) {
    const item = this.cache.get(key);
    if (!item) return false;

    if (Date.now() > item.expiry) {
      this.cache.delete(key);
      return false;
    }

    return true;
  }

  delete(key) {
    this.cache.delete(key);
  }

  clear() {
    this.cache.clear();
  }

  cleanup() {
    const now = Date.now();
    for (const [key, item] of this.cache.entries()) {
      if (now > item.expiry) {
        this.cache.delete(key);
      }
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