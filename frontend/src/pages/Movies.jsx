// src/pages/Movies.jsx
import { useState, useEffect, useRef, useMemo } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Link } from "react-router-dom";
import {
  Film, Star, ChevronRight, RefreshCw, SlidersHorizontal, LayoutGrid, LayoutList,
  Calendar, Clock, Flame, Sparkles, TrendingUp, X,
} from "lucide-react";
import { animeService } from "../services/animeService";
import AnimeCard from "../components/anime/AnimeCard";
import ScrollRope from "../components/ui/ScrollRope";

const ACCENT = "#f5b83d";
const PAGE_SIZE = 24;

const TABS = [
  { key: "all",      label: "All",      icon: Film,       params: { order_by: "popularity", sort: "desc" } },
  { key: "popular",  label: "Popular",  icon: TrendingUp, params: { order_by: "members",    sort: "desc" } },
  { key: "trending", label: "Trending", icon: Flame,      params: { order_by: "popularity", sort: "desc", status: "airing" } },
  { key: "newest",   label: "Newest",   icon: Sparkles,   params: { order_by: "start_date", sort: "desc" } },
  { key: "upcoming", label: "Upcoming", icon: Calendar,   params: { status: "upcoming", order_by: "start_date", sort: "asc" } },
];
const SORTS = [
  ["Popularity", "popularity"], ["Score", "score"], ["Newest", "start_date"], ["Title", "title"], ["Rank", "rank"],
];
const SCORES = ["9", "8", "7", "6"];
const STATUSES = [["Any", ""], ["Finished", "complete"], ["Airing", "airing"]];
const DEFAULTS = { sort: "popularity", score: "", status: "" };

const Chip = ({ active, onClick, children }) => (
  <button onClick={onClick} aria-pressed={active}
    className="px-3 py-1.5 rounded-lg text-xs font-semibold whitespace-nowrap transition-colors focus-visible:outline focus-visible:outline-2 focus-visible:outline-amber-400"
    style={{
      background: active ? "var(--nav-link-active-bg, rgba(245,184,61,.16))" : "var(--nav-btn-bg, rgba(255,255,255,.04))",
      border: `1px solid ${active ? "var(--border-accent, rgba(245,184,61,.5))" : "var(--border-subtle, rgba(255,255,255,.08))"}`,
      color: active ? ACCENT : "var(--text-muted, rgba(255,255,255,.65))",
    }}>
    {children}
  </button>
);

const Skeleton = () => (
  <div className="space-y-2">
    <div className="w-full rounded-xl animate-pulse" style={{ aspectRatio: "2/3", background: "var(--border-subtle, rgba(255,255,255,.05))" }} />
    <div className="h-2.5 w-4/5 rounded-full animate-pulse" style={{ background: "var(--border-subtle, rgba(255,255,255,.05))" }} />
    <div className="h-2 w-1/2 rounded-full animate-pulse" style={{ background: "var(--border-subtle, rgba(255,255,255,.03))" }} />
  </div>
);

const ListRow = ({ anime, index }) => {
  const img = anime.images?.jpg?.large_image_url || anime.images?.jpg?.image_url;
  const title = anime.title_english || anime.title;
  return (
    <Link to={`/anime/${anime.mal_id}`}
      className="group flex items-center gap-4 p-3 rounded-xl transition-colors hover:bg-white/[.06] focus-visible:outline focus-visible:outline-2 focus-visible:outline-amber-400"
      style={{ background: "var(--bg-card, rgba(255,255,255,.025))", border: "1px solid var(--border-subtle, rgba(255,255,255,.06))" }}>
      <span className="w-8 text-center text-xs font-bold tabular-nums"
            style={{ color: index < 3 ? ACCENT : "var(--text-subtle, rgba(255,255,255,.3))" }}>{index + 1}</span>
      <img src={img} alt="" loading="lazy" className="w-12 h-16 rounded-lg object-cover flex-shrink-0" />
      <div className="flex-1 min-w-0">
        <p className="font-semibold text-sm sm:text-[15px] truncate transition-colors" style={{ color: "var(--text-heading, #fff)" }}>{title}</p>
        <div className="flex items-center gap-3 mt-1 text-[11px] flex-wrap" style={{ color: "var(--text-muted, #94a3b8)" }}>
          {anime.duration && <span className="inline-flex items-center gap-1"><Clock size={10} />{anime.duration}</span>}
          {anime.year && <span>{anime.year}</span>}
          {anime.genres?.slice(0, 2).map((g) => <span key={g.mal_id} style={{ color: "var(--color-primary, #f5b83d)", opacity: 0.85 }}>{g.name}</span>)}
        </div>
      </div>
      {anime.score && (
        <span className="inline-flex items-center gap-1 text-sm font-bold tabular-nums" style={{ color: "var(--text-heading, #fff)" }}>
          <Star size={12} fill={ACCENT} stroke={ACCENT} />{anime.score.toFixed(1)}
        </span>
      )}
    </Link>
  );
};

const GRID = "grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-6 2xl:grid-cols-8 gap-4";

const Movies = () => {
  const [tab, setTab] = useState("all");
  const [f, setF] = useState(DEFAULTS);
  const [movies, setMovies] = useState([]);
  const [page, setPage] = useState(1);
  const [hasMore, setHasMore] = useState(true);
  const [loading, setLoading] = useState(true);
  const [loadingMore, setLoadingMore] = useState(false);
  const [error, setError] = useState(false);
  const [view, setView] = useState("grid");
  const [panel, setPanel] = useState(false);
  const reqId = useRef(0);

  const changed = useMemo(
    () => Object.keys(DEFAULTS).filter((k) => f[k] !== DEFAULTS[k]).length, [f]);

  const load = async (pg, append) => {
    const id = ++reqId.current; // ignore stale responses
    append ? setLoadingMore(true) : setLoading(true);
    setError(false);
    try {
      const base = TABS.find((t) => t.key === tab).params;
      const params = {
        type: "Movie", ...base, limit: PAGE_SIZE, page: pg,
        ...(f.sort && { order_by: f.sort }),
        ...(f.score && { min_score: f.score }),
        ...(f.status && { status: f.status }),
      };
      const res = await animeService.searchAnime("", params);
      if (id !== reqId.current) return;
      const items = res.data ?? [];
      setHasMore(items.length === PAGE_SIZE);
      setMovies((p) => (append ? [...p, ...items] : items));
      setPage(pg);
    } catch {
      if (id === reqId.current) setError(true);
    } finally {
      if (id === reqId.current) { setLoading(false); setLoadingMore(false); }
    }
  };

  /* one effect: tab or any filter change → first page */
  useEffect(() => { load(1, false); /* eslint-disable-next-line */ }, [tab, f]);

  const switchTab = (k) => { if (k !== tab) { setF(DEFAULTS); setPanel(false); setTab(k); } };
  const set = (k, v) => setF((p) => ({ ...p, [k]: v }));
  const tabLabel = TABS.find((t) => t.key === tab).label;

  return (
    <div className="min-h-screen w-full" style={{ background: "var(--bg-main, #0a0a14)" }}>
      <ScrollRope color={ACCENT} />

      {/* header */}
      <header className="w-full border-b"
              style={{ borderColor: "var(--border-subtle, rgba(255,255,255,.05))", background: "linear-gradient(180deg,rgba(245,184,61,.06),transparent)" }}>
        <div className="w-full max-w-[1920px] mx-auto px-4 sm:px-8 xl:px-14 py-8 sm:py-12 flex flex-col sm:flex-row sm:items-end justify-between gap-5">
          <div>
            <h1 className="font-extrabold tracking-tight" style={{ fontSize: "clamp(28px,4.5vw,48px)", lineHeight: 1.05, color: "var(--text-heading, #fff)" }}>
              Anime Movies
            </h1>
            <p className="mt-2 text-sm sm:text-base max-w-xl" style={{ color: "var(--text-muted, #94a3b8)" }}>
              Feature films from Studio Ghibli classics to this year's releases. Filter by score, status, or release date.
            </p>
          </div>
          <div className="hidden sm:flex p-1 rounded-xl gap-1" style={{ background: "var(--nav-btn-bg, rgba(255,255,255,.05))", border: "1px solid var(--border-subtle, rgba(255,255,255,.1))" }} role="group" aria-label="Layout">
            {[["grid", LayoutGrid], ["list", LayoutList]].map(([k, I]) => (
              <button key={k} onClick={() => setView(k)} aria-label={`${k} view`} aria-pressed={view === k}
                className="w-9 h-9 rounded-lg grid place-items-center transition-colors"
                style={{ background: view === k ? "rgba(245,184,61,.2)" : "transparent", color: view === k ? ACCENT : "var(--text-muted, rgba(255,255,255,.4))" }}>
                <I size={15} />
              </button>
            ))}
          </div>
        </div>
      </header>

      {/* sticky toolbar */}
      <div className="sticky top-0 z-30 w-full backdrop-blur-xl border-b" style={{ background: "var(--nav-bg, rgba(10,10,20,.85))", borderColor: "var(--border-subtle, rgba(255,255,255,.05))" }}>
        <div className="w-full max-w-[1920px] mx-auto px-4 sm:px-8 xl:px-14 py-3 flex items-center gap-3">
          <nav className="flex-1 flex gap-2 overflow-x-auto" style={{ scrollbarWidth: "none" }} aria-label="Movie categories">
            {TABS.map(({ key, label, icon: I }) => {
              const on = tab === key;
              return (
                <button key={key} onClick={() => switchTab(key)} aria-current={on}
                  className="flex items-center gap-1.5 px-3.5 py-2 rounded-lg text-xs sm:text-[13px] font-semibold whitespace-nowrap transition-colors"
                  style={{
                    background: on ? "rgba(245,184,61,.16)" : "transparent",
                    color: on ? ACCENT : "var(--text-muted, rgba(255,255,255,.55))",
                    border: `1px solid ${on ? "rgba(245,184,61,.45)" : "transparent"}`,
                  }}>
                  <I size={13} />{label}
                </button>
              );
            })}
          </nav>
          <button onClick={() => setPanel((p) => !p)} aria-expanded={panel}
            className="flex items-center gap-2 px-3.5 py-2 rounded-lg text-xs sm:text-[13px] font-semibold border transition-colors"
            style={{
              background: panel ? "rgba(245,184,61,.16)" : "var(--nav-btn-bg, rgba(255,255,255,.04))",
              borderColor: panel ? "rgba(245,184,61,.45)" : "var(--border-subtle, rgba(255,255,255,.1))",
              color: panel ? ACCENT : "var(--text-muted, rgba(255,255,255,.7))",
            }}>
            <SlidersHorizontal size={13} /> Filters
            {changed > 0 && <span className="w-4 h-4 rounded-full text-[10px] font-bold grid place-items-center text-black" style={{ background: ACCENT }}>{changed}</span>}
          </button>
        </div>

        <AnimatePresence>
          {panel && (
            <motion.div initial={{ height: 0, opacity: 0 }} animate={{ height: "auto", opacity: 1 }} exit={{ height: 0, opacity: 0 }}
                        transition={{ duration: 0.2 }} className="overflow-hidden border-t" style={{ borderColor: "var(--border-subtle, rgba(255,255,255,.05))" }}>
              <div className="w-full max-w-[1920px] mx-auto px-4 sm:px-8 xl:px-14 py-4 grid gap-5 sm:grid-cols-2 lg:grid-cols-[2fr_1fr_1fr_auto] items-start">
                <fieldset><legend className="text-xs mb-2" style={{ color: "var(--text-muted, #94a3b8)" }}>Sort by</legend>
                  <div className="flex flex-wrap gap-1.5">{SORTS.map(([l, v]) => <Chip key={v} active={f.sort === v} onClick={() => set("sort", v)}>{l}</Chip>)}</div>
                </fieldset>
                <fieldset><legend className="text-xs mb-2" style={{ color: "var(--text-muted, #94a3b8)" }}>Minimum score</legend>
                  <div className="flex flex-wrap gap-1.5">{SCORES.map((s) => <Chip key={s} active={f.score === s} onClick={() => set("score", f.score === s ? "" : s)}>{s}+</Chip>)}</div>
                </fieldset>
                {tab !== "upcoming" && tab !== "trending" && (
                  <fieldset><legend className="text-xs mb-2" style={{ color: "var(--text-muted, #94a3b8)" }}>Status</legend>
                    <div className="flex flex-wrap gap-1.5">{STATUSES.map(([l, v]) => <Chip key={v} active={f.status === v} onClick={() => set("status", v)}>{l}</Chip>)}</div>
                  </fieldset>
                )}
                {changed > 0 && (
                  <button onClick={() => setF(DEFAULTS)} className="inline-flex items-center gap-1.5 text-xs font-semibold text-rose-300 hover:text-rose-200 self-end">
                    <X size={12} /> Reset filters
                  </button>
                )}
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </div>

      {/* content */}
      <main className="w-full max-w-[1920px] mx-auto px-4 sm:px-8 xl:px-14 py-6 sm:py-8">
        {!loading && !error && movies.length > 0 && (
          <div className="flex items-center justify-between mb-5">
            <p className="text-sm" style={{ color: "var(--text-muted, #94a3b8)" }}>
              <span className="font-bold tabular-nums" style={{ color: "var(--text-heading, #fff)" }}>{movies.length}</span> {tabLabel.toLowerCase()} movies
            </p>
            <div className="sm:hidden flex p-1 rounded-lg gap-1" style={{ background: "var(--nav-btn-bg, rgba(255,255,255,.05))", border: "1px solid var(--border-subtle, rgba(255,255,255,.1))" }}>
              {[["grid", LayoutGrid], ["list", LayoutList]].map(([k, I]) => (
                <button key={k} onClick={() => setView(k)} aria-label={`${k} view`}
                  className="w-8 h-8 rounded-md grid place-items-center"
                  style={{ background: view === k ? "rgba(245,184,61,.2)" : "transparent", color: view === k ? ACCENT : "var(--text-muted, rgba(255,255,255,.4))" }}>
                  <I size={14} />
                </button>
              ))}
            </div>
          </div>
        )}

        {loading && <div className={GRID}>{Array.from({ length: PAGE_SIZE }).map((_, i) => <Skeleton key={i} />)}</div>}

        {error && !loading && (
          <div className="py-24 text-center">
            <p className="text-lg font-bold" style={{ color: "var(--text-heading, #fff)" }}>Couldn't load movies</p>
            <p className="text-sm mt-1" style={{ color: "var(--text-muted, #94a3b8)" }}>Check your connection, then try again.</p>
            <button onClick={() => load(1, false)} className="mt-5 inline-flex items-center gap-2 px-5 py-2.5 rounded-lg text-sm font-semibold text-black" style={{ background: ACCENT }}>
              <RefreshCw size={14} /> Retry
            </button>
          </div>
        )}

        {!loading && !error && movies.length === 0 && (
          <div className="py-24 text-center">
            <p className="text-lg font-bold" style={{ color: "var(--text-heading, #fff)" }}>No {tabLabel.toLowerCase()} movies match</p>
            <p className="text-sm mt-1" style={{ color: "var(--text-muted, #94a3b8)" }}>Loosen the filters or pick another category.</p>
            {changed > 0 && <button onClick={() => setF(DEFAULTS)} className="mt-5 px-5 py-2.5 rounded-lg text-sm font-semibold text-black" style={{ background: ACCENT }}>Clear filters</button>}
          </div>
        )}

        {!loading && !error && movies.length > 0 && (
          <>
            {view === "grid" ? (
              <div className={GRID}>{movies.map((m, i) => <AnimeCard key={`${m.mal_id}-${i}`} anime={m} index={i % PAGE_SIZE} />)}</div>
            ) : (
              <div className="grid gap-2 xl:grid-cols-2">{movies.map((m, i) => <ListRow key={`${m.mal_id}-${i}`} anime={m} index={i} />)}</div>
            )}
            {hasMore && (
              <div className="flex justify-center mt-10">
                <button onClick={() => load(page + 1, true)} disabled={loadingMore}
                  className="inline-flex items-center gap-2 px-7 py-3 rounded-xl text-sm font-bold border transition-colors hover:bg-amber-400/10 disabled:opacity-60"
                  style={{ color: ACCENT, borderColor: "rgba(245,184,61,.4)" }}>
                  {loadingMore ? <><RefreshCw size={14} className="animate-spin" /> Loading</> : <>Load more <ChevronRight size={14} /></>}
                </button>
              </div>
            )}
          </>
        )}
      </main>
    </div>
  );
};

export default Movies;