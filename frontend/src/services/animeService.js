import { jikanAPI } from "./api.js";

/* ══════════════════════════════════════════════════════════
   CONSTANTS
══════════════════════════════════════════════════════════ */
const QUEUE_INTERVAL_MS = 1000;
const MAX_RETRIES       = 5;
const RETRY_BASE_MS     = 2000;
const CACHE_TTL         = 5 * 60 * 1000;

/* ══════════════════════════════════════════════════════════
   REQUEST QUEUE
══════════════════════════════════════════════════════════ */
class RequestQueue {
  constructor() {
    this.queue      = [];
    this.running    = false;
    this.lastCallAt = 0;
  }

  enqueue(fn, cacheKey = "") {
    return new Promise((resolve, reject) => {
      this.queue.push({ fn, resolve, reject, retries: 0, cacheKey });
      if (!this.running) this._run();
    });
  }

  cancelByPrefix(prefix) {
    this.queue
      .filter(job => job.cacheKey?.startsWith(prefix))
      .forEach(job =>
        job.reject(Object.assign(new Error("cancelled"), { cancelled: true }))
      );
    this.queue = this.queue.filter(job => !job.cacheKey?.startsWith(prefix));
  }

  async _run() {
    this.running = true;
    while (this.queue.length > 0) {
      const elapsed = Date.now() - this.lastCallAt;
      const gap     = QUEUE_INTERVAL_MS - elapsed;
      if (gap > 0) await this._sleep(gap);

      const job = this.queue.shift();
      this.lastCallAt = Date.now();
      try {
        job.resolve(await job.fn());
      } catch (err) {
        await this._handleError(err, job);
      }
    }
    this.running = false;
  }

  async _handleError(err, job) {
    const status   = err?.response?.status;
    const canRetry =
      (status === 429 || status >= 500) && job.retries < MAX_RETRIES;

    if (canRetry) {
      const delay = RETRY_BASE_MS * Math.pow(2, job.retries);
      job.retries++;
      console.warn(
        `[Jikan] HTTP ${status} — retry ${job.retries}/${MAX_RETRIES} ` +
        `for "${job.cacheKey}" in ${delay}ms`
      );
      await this._sleep(delay);
      this.queue.unshift(job);
    } else {
      job.reject(err);
    }
  }

  _sleep(ms) {
    return new Promise(r => setTimeout(r, ms));
  }
}

const queue = new RequestQueue();

/* ══════════════════════════════════════════════════════════
   TTL CACHE
══════════════════════════════════════════════════════════ */
const MAX_CACHE_SIZE = 200;

class TTLCache {
  constructor(ttl) {
    this.ttl   = ttl;
    this.store = new Map();
  }

  get(key) {
    const entry = this.store.get(key);
    if (!entry) return null;
    if (Date.now() - entry.ts > this.ttl) {
      this.store.delete(key);
      return null;
    }
    return entry.data;
  }

  set(key, data) {
    if (this.store.size >= MAX_CACHE_SIZE) {
      const oldest = this.store.keys().next().value;
      this.store.delete(oldest);
    }
    this.store.set(key, { data, ts: Date.now() });
  }

  has(key)         { return this.get(key) !== null; }
  invalidate(key)  { this.store.delete(key); }
  clear()          { this.store.clear(); }
}

const cache    = new TTLCache(CACHE_TTL);
const inflight = new Map();

/* ══════════════════════════════════════════════════════════
   CORE FETCH HELPER
══════════════════════════════════════════════════════════ */
function fetchCached(key, apiFn) {
  const hit = cache.get(key);
  if (hit !== null) return Promise.resolve(hit);
  if (inflight.has(key)) return inflight.get(key);

  const promise = queue
    .enqueue(apiFn, key)
    .then(data => {
      cache.set(key, data);
      inflight.delete(key);
      return data;
    })
    .catch(err => {
      inflight.delete(key);
      throw err;
    });

  inflight.set(key, promise);
  return promise;
}

/* ══════════════════════════════════════════════════════════
   PARAM BUILDER
══════════════════════════════════════════════════════════ */
function buildParams(obj) {
  return new URLSearchParams(
    Object.fromEntries(
      Object.entries(obj).filter(([, v]) => v !== "" && v != null && v !== false)
    )
  ).toString();
}

/* ══════════════════════════════════════════════════════════
   SERVICE
══════════════════════════════════════════════════════════ */
export const animeService = {

  getTopAnime(page = 1, limit = 10) {
    const key = `top-anime-p${page}-l${limit}`;
    return fetchCached(key, () =>
      jikanAPI.get(`/top/anime?page=${page}&limit=${limit}`).then(r => r.data)
    );
  },

  getAnimeByGenre(genreId, limit = 10, page = 1) {
    const key = `genre-${genreId}-p${page}-l${limit}`;
    return fetchCached(key, () =>
      jikanAPI
        .get(`/anime?genres=${genreId}&order_by=score&sort=desc&limit=${limit}&page=${page}`)
        .then(r => r.data)
    );
  },

  searchAnime(query = "", filters = {}) {
    const params = buildParams({ q: query || undefined, limit: 24, ...filters });
    const key    = `search-${params}`;
    return fetchCached(key, () =>
      jikanAPI.get(`/anime?${params}`).then(r => r.data)
    );
  },

  getAnimeById(id) {
    if (!id) return Promise.reject(new Error("getAnimeById: id is required"));
    const key = `anime-${id}`;
    return fetchCached(key, () =>
      jikanAPI.get(`/anime/${id}/full`).then(r => r.data)
    );
  },

  getAnimeCharacters(id) {
    if (!id) return Promise.reject(new Error("getAnimeCharacters: id is required"));
    const key = `chars-${id}`;
    return fetchCached(key, () =>
      jikanAPI.get(`/anime/${id}/characters`).then(r => r.data)
    );
  },

  getAnimeStaff(id) {
    if (!id) return Promise.reject(new Error("getAnimeStaff: id is required"));
    const key = `staff-${id}`;
    return fetchCached(key, () =>
      jikanAPI.get(`/anime/${id}/staff`).then(r => r.data)
    );
  },

  getAnimeEpisodes(id, page = 1) {
    if (!id) return Promise.reject(new Error("getAnimeEpisodes: id is required"));
    const key = `episodes-${id}-p${page}`;
    return fetchCached(key, () =>
      jikanAPI.get(`/anime/${id}/episodes?page=${page}`).then(r => r.data)
    );
  },

  getAnimeReviews(id, page = 1) {
    if (!id) return Promise.reject(new Error("getAnimeReviews: id is required"));
    const key = `reviews-${id}-p${page}`;
    return fetchCached(key, () =>
      jikanAPI.get(`/anime/${id}/reviews?page=${page}`).then(r => r.data)
    );
  },

  getAnimeRecommendations(id) {
    if (!id)
      return Promise.reject(new Error("getAnimeRecommendations: id is required"));
    const key = `recs-${id}`;
    return fetchCached(key, () =>
      jikanAPI.get(`/anime/${id}/recommendations`).then(r => r.data)
    );
  },

  getAnimeRelations(id) {
    if (!id) return Promise.reject(new Error("getAnimeRelations: id is required"));
    return animeService.getAnimeById(id).then(data => data.data?.relations ?? []);
  },

  getSearchSuggestions(query) {
    if (!query || query.trim().length < 2) return Promise.resolve({ data: [] });
    const key = `suggest-${query.trim().toLowerCase()}`;
    return fetchCached(key, () =>
      jikanAPI
        .get(`/anime?q=${encodeURIComponent(query.trim())}&limit=6`)
        .then(r => r.data)
    );
  },

  getSeasonNow(limit = 20) {
    const key = `season-now-l${limit}`;
    return fetchCached(key, () =>
      jikanAPI.get(`/seasons/now?limit=${limit}`).then(r => r.data)
    );
  },

  getSeasonUpcoming(limit = 20) {
    const key = `season-upcoming-l${limit}`;
    return fetchCached(key, () =>
      jikanAPI.get(`/seasons/upcoming?limit=${limit}`).then(r => r.data)
    );
  },

  getSeason(year, season, limit = 20) {
    const key = `season-${year}-${season}-l${limit}`;
    return fetchCached(key, () =>
      jikanAPI.get(`/seasons/${year}/${season}?limit=${limit}`).then(r => r.data)
    );
  },

  getAnimeStatistics(id) {
    if (!id) return Promise.reject(new Error("getAnimeStatistics: id is required"));
    const key = `stats-${id}`;
    return fetchCached(key, () =>
      jikanAPI.get(`/anime/${id}/statistics`).then(r => r.data)
    );
  },

  getRandomAnime() {
    return queue.enqueue(
      () => jikanAPI.get("/random/anime").then(r => r.data),
      "random-anime"
    );
  },

  getGenres() {
    const key = "genres-list";
    return fetchCached(key, () =>
      jikanAPI.get("/genres/anime").then(r => r.data)
    );
  },

  /* ── Schedule: page 1 only (used internally) ── */
  getSchedule(day = "") {
    const path = day ? `/schedules?filter=${day}&limit=25` : "/schedules?limit=25";
    const key  = `schedule-${day || "all"}-p1`;
    return fetchCached(key, () =>
      jikanAPI.get(path).then(r => r.data)
    );
  },

  /* ── Schedule: specific page — NEW ── */
  getSchedulePage(day = "", page = 1) {
    const path = day
      ? `/schedules?filter=${day}&page=${page}&limit=25`
      : `/schedules?page=${page}&limit=25`;
    const key = `schedule-${day || "all"}-p${page}`;
    return fetchCached(key, () =>
      jikanAPI.get(path).then(r => r.data)
    );
  },

  /* ── Invalidate all cached pages for one day ── */
  invalidateSchedule(day = "") {
    const prefix = `schedule-${day || "all"}-p`;
    /* evict every page key that matches */
    for (let pg = 1; pg <= 20; pg++) {
      cache.invalidate(`${prefix}${pg}`);
    }
  },

  /* ══════════════════════════════════════════════════════
     CACHE UTILITIES
  ══════════════════════════════════════════════════════ */
  invalidate(key)  { cache.invalidate(key); },
  clearCache()     { cache.clear(); inflight.clear(); },
  cancelRequests(prefix) { queue.cancelByPrefix(prefix); },
};