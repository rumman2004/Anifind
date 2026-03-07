// Series.jsx
import { useState, useEffect, useCallback } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Link } from "react-router-dom";
import {
  Tv, Star, ChevronRight, RefreshCw, SlidersHorizontal,
  LayoutGrid, LayoutList, Flame, Sparkles, Calendar,
  Radio, Clock, TrendingUp, Filter,
} from "lucide-react";
import { animeService } from "../services/animeService";
import AnimeCard from "../components/section/AnimeCard";

/* ══════════════════════════════════════════════════════════
   CONSTANTS
══════════════════════════════════════════════════════════ */
const SERIES_FILTERS = [
  { key: "all",      label: "All Series",   icon: <Tv size={13} />,         params: { type: "TV", order_by: "popularity", sort: "desc" } },
  { key: "top",      label: "Top Rated",    icon: <Star size={13} />,        params: { type: "TV", order_by: "score",      sort: "desc" } },
  { key: "airing",   label: "Now Airing",   icon: <Radio size={13} />,       params: { type: "TV", status: "airing",      order_by: "score", sort: "desc" } },
  { key: "trending", label: "Trending",     icon: <Flame size={13} />,       params: { type: "TV", order_by: "members",   sort: "desc" } },
  { key: "upcoming", label: "Upcoming",     icon: <Calendar size={13} />,    params: { type: "TV", status: "upcoming",    order_by: "start_date" } },
  { key: "ova",      label: "OVA / ONA",    icon: <Sparkles size={13} />,    params: { order_by: "score", sort: "desc" } },
];

const OVA_FILTER_PARAMS = { order_by: "score", sort: "desc" }; // handled separately for OVA+ONA

const SORT_OPTIONS = [
  { label: "Popularity", value: "popularity" },
  { label: "Score",      value: "score"      },
  { label: "Newest",     value: "start_date" },
  { label: "Episodes",   value: "episodes"   },
  { label: "Title",      value: "title"      },
];

const SCORE_FILTERS = ["9+", "8+", "7+", "6+"];

const SEASON_OPTIONS = [
  { label: "Any",    value: "" },
  { label: "Winter", value: "winter" },
  { label: "Spring", value: "spring" },
  { label: "Summer", value: "summer" },
  { label: "Fall",   value: "fall"   },
];

/* ══════════════════════════════════════════════════════════
   SKELETON / LIST ROW / CHIP  (same pattern as Movies)
══════════════════════════════════════════════════════════ */
const CardSkeleton = ({ index }) => (
  <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: index * 0.03 }}
    className="flex flex-col gap-2.5">
    <div className="w-full rounded-2xl animate-pulse"
         style={{ aspectRatio: "2/3", background: "rgba(255,255,255,.06)" }} />
    <div className="space-y-1.5 px-0.5">
      <div className="h-2.5 rounded-full animate-pulse" style={{ width: "80%", background: "rgba(255,255,255,.05)" }} />
      <div className="h-2 rounded-full animate-pulse"   style={{ width: "55%", background: "rgba(255,255,255,.04)" }} />
    </div>
  </motion.div>
);

const ListRow = ({ anime, index }) => {
  const [hov, setHov] = useState(false);
  const img   = anime.images?.jpg?.large_image_url || anime.images?.jpg?.image_url;
  const title = anime.title_english || anime.title;

  return (
    <motion.div initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }}
      transition={{ delay: Math.min(index * 0.025, 0.5) }}>
      <Link to={`/anime/${anime.mal_id}`}
        onMouseEnter={() => setHov(true)} onMouseLeave={() => setHov(false)}
        className="flex items-center gap-3 sm:gap-4 p-3 sm:p-4 rounded-2xl transition-all duration-200"
        style={{
          background: hov ? "rgba(255,255,255,.06)" : "rgba(255,255,255,.03)",
          border: `1px solid ${hov ? "rgba(99,102,241,.28)" : "rgba(255,255,255,.07)"}`,
          transform: hov ? "scale(1.008)" : "scale(1)",
        }}
      >
        <span className="flex-shrink-0 font-black text-center w-7" style={{
          fontSize: 11,
          color: index === 0 ? "#fbbf24" : index === 1 ? "#94a3b8" : index === 2 ? "#fb923c" : "rgba(148,163,184,.28)",
        }}>
          {index < 3 ? ["🥇","🥈","🥉"][index] : index + 1}
        </span>
        <div className="flex-shrink-0 rounded-xl overflow-hidden"
             style={{ width: 46, height: 62, border: "1px solid rgba(255,255,255,.08)" }}>
          <img src={img} alt={title} className="w-full h-full object-cover"
               style={{ transform: hov ? "scale(1.08)" : "scale(1)", transition: "transform .4s" }} />
        </div>
        <div className="flex-1 min-w-0">
          <p className="font-bold line-clamp-1 transition-colors duration-200"
             style={{ fontSize: "clamp(12px,2vw,14px)", color: hov ? "#a5b4fc" : "#fff" }}>
            {title}
          </p>
          <div className="flex items-center gap-2 mt-1 flex-wrap">
            {anime.episodes && (
              <span className="text-[10px]" style={{ color: "rgba(148,163,184,.42)" }}>
                {anime.episodes} eps
              </span>
            )}
            {anime.status === "Currently Airing" && (
              <span className="flex items-center gap-1 text-[9px] font-bold px-1.5 py-0.5 rounded-full"
                    style={{ background: "rgba(74,222,128,.12)", color: "#4ade80", border: "1px solid rgba(74,222,128,.22)" }}>
                <span className="w-1.5 h-1.5 rounded-full bg-green-400" style={{ boxShadow: "0 0 4px #4ade80" }} />
                Airing
              </span>
            )}
            {anime.genres?.slice(0, 2).map(g => (
              <span key={g.mal_id} className="text-[9px] font-semibold px-1.5 py-0.5 rounded-md"
                    style={{ background: "rgba(99,102,241,.10)", border: "1px solid rgba(99,102,241,.18)", color: "rgba(165,180,252,.65)" }}>
                {g.name}
              </span>
            ))}
          </div>
        </div>
        {anime.score && (
          <div className="flex-shrink-0 flex items-center gap-1">
            <Star size={10} style={{ color: "#fbbf24", fill: "#fbbf24" }} />
            <span className="font-black text-white" style={{ fontSize: 12 }}>{anime.score.toFixed(1)}</span>
          </div>
        )}
      </Link>
    </motion.div>
  );
};

const Chip = ({ active, onClick, children }) => (
  <button onClick={onClick}
    className="px-3 py-1.5 rounded-xl text-xs font-semibold transition-all hover:scale-105 active:scale-95 whitespace-nowrap"
    style={{
      background: active ? "rgba(99,102,241,.22)"          : "rgba(255,255,255,.05)",
      border:     active ? "1px solid rgba(99,102,241,.40)" : "1px solid rgba(255,255,255,.08)",
      color:      active ? "#a5b4fc"                        : "rgba(255,255,255,.52)",
    }}
  >
    {children}
  </button>
);

/* ══════════════════════════════════════════════════════════
   SERIES PAGE
══════════════════════════════════════════════════════════ */
const Series = () => {
  const [activeFilter, setActiveFilter] = useState("all");
  const [series,       setSeries]       = useState([]);
  const [loading,      setLoading]      = useState(true);
  const [error,        setError]        = useState(false);
  const [viewMode,     setViewMode]     = useState("grid");
  const [showPanel,    setShowPanel]    = useState(false);
  const [sortBy,       setSortBy]       = useState("popularity");
  const [minScore,     setMinScore]     = useState("");
  const [season,       setSeason]       = useState("");
  const [page,         setPage]         = useState(1);
  const [hasMore,      setHasMore]      = useState(true);
  const [loadingMore,  setLoadingMore]  = useState(false);

  const fetchSeries = useCallback(async (pg = 1, append = false) => {
    pg === 1 ? setLoading(true) : setLoadingMore(true);
    setError(false);
    try {
      let base = SERIES_FILTERS.find(f => f.key === activeFilter)?.params ?? {};

      /* OVA filter: fetch both OVA and ONA */
      if (activeFilter === "ova") {
        const [ovaData, onaData] = await Promise.all([
          animeService.searchAnime("", { type: "OVA", order_by: "score", sort: "desc", limit: 12, page: pg }),
          animeService.searchAnime("", { type: "ONA", order_by: "score", sort: "desc", limit: 12, page: pg }),
        ]);
        const merged = [
          ...(ovaData.data ?? []),
          ...(onaData.data ?? []),
        ].sort((a, b) => (b.score ?? 0) - (a.score ?? 0));
        setHasMore(merged.length >= 20);
        setSeries(prev => append ? [...prev, ...merged] : merged);
        setLoading(false);
        setLoadingMore(false);
        return;
      }

      const params = {
        ...base,
        limit: 24,
        page:  pg,
        ...(sortBy   ? { order_by: sortBy }    : {}),
        ...(minScore ? { min_score: minScore }  : {}),
        ...(season   ? { season }               : {}),
      };
      const data  = await animeService.searchAnime("", params);
      const items = data.data ?? [];
      setHasMore(items.length === 24);
      setSeries(prev => append ? [...prev, ...items] : items);
    } catch {
      setError(true);
    } finally {
      setLoading(false);
      setLoadingMore(false);
    }
  }, [activeFilter, sortBy, minScore, season]);

  useEffect(() => {
    setPage(1);
    setSeries([]);
    fetchSeries(1, false);
  }, [fetchSeries]);

  const loadMore = () => {
    const next = page + 1;
    setPage(next);
    fetchSeries(next, true);
  };

  return (
    <div className="min-h-screen" style={{ background: "#0a0a14" }}>
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 sm:py-12">

        {/* ── HERO ── */}
        <motion.div
          initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }}
          className="relative overflow-hidden rounded-3xl mb-8 sm:mb-12 p-6 sm:p-10"
          style={{
            background: "linear-gradient(135deg,rgba(99,102,241,.12),rgba(168,85,247,.06),rgba(10,10,20,0))",
            border: "1px solid rgba(99,102,241,.18)",
          }}
        >
          <div className="absolute -top-16 -right-16 w-64 h-64 rounded-full pointer-events-none"
               style={{ background: "rgba(99,102,241,.06)", filter: "blur(60px)" }} />
          <div className="relative z-10 flex flex-col sm:flex-row sm:items-center gap-4">
            <div className="w-14 h-14 sm:w-16 sm:h-16 rounded-2xl flex items-center justify-center flex-shrink-0"
                 style={{
                   background: "linear-gradient(135deg,rgba(99,102,241,.25),rgba(99,102,241,.10))",
                   border: "1px solid rgba(99,102,241,.35)",
                   boxShadow: "0 0 32px rgba(99,102,241,.20)",
                 }}>
              <Tv size={28} style={{ color: "#a5b4fc" }} />
            </div>
            <div className="flex-1">
              <div className="flex items-center gap-2 mb-1">
                <h1 className="font-black text-white"
                    style={{ fontSize: "clamp(24px,5vw,40px)", letterSpacing: "-0.03em" }}>
                  Anime Series
                </h1>
                <span className="text-[10px] font-black uppercase px-2 py-0.5 rounded-full"
                      style={{ background: "rgba(74,222,128,.16)", color: "#4ade80", border: "1px solid rgba(74,222,128,.28)" }}>
                  Live
                </span>
              </div>
              <p className="text-sm" style={{ color: "rgba(148,163,184,.55)" }}>
                Dive into thousands of TV series, OVAs, and ONAs — from legendary long-runners to seasonal gems.
              </p>
            </div>
            <div className="hidden sm:flex items-center p-1 rounded-xl gap-0.5"
                 style={{ background: "rgba(255,255,255,.05)", border: "1px solid rgba(255,255,255,.08)" }}>
              {[{ k: "grid", I: LayoutGrid }, { k: "list", I: LayoutList }].map(({ k, I }) => (
                <button key={k} onClick={() => setViewMode(k)}
                  className="w-8 h-8 rounded-lg flex items-center justify-center transition-all"
                  style={{
                    background: viewMode === k ? "rgba(99,102,241,.28)"          : "transparent",
                    color:      viewMode === k ? "#a5b4fc"                        : "rgba(255,255,255,.30)",
                    border:     viewMode === k ? "1px solid rgba(99,102,241,.28)" : "1px solid transparent",
                  }}>
                  <I size={13} />
                </button>
              ))}
            </div>
          </div>
        </motion.div>

        {/* ── FILTER TABS ── */}
        <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.1 }}
          className="flex flex-col sm:flex-row gap-3 sm:gap-4 mb-6 sm:mb-8">
          <div className="flex items-center gap-2 overflow-x-auto pb-1 flex-1" style={{ scrollbarWidth: "none" }}>
            {SERIES_FILTERS.map(f => (
              <button key={f.key} onClick={() => setActiveFilter(f.key)}
                className="flex items-center gap-1.5 px-3.5 py-2 rounded-xl text-xs font-bold whitespace-nowrap transition-all hover:scale-105 active:scale-95 flex-shrink-0"
                style={{
                  background: activeFilter === f.key ? "rgba(99,102,241,.22)"           : "rgba(255,255,255,.05)",
                  border:     activeFilter === f.key ? "1px solid rgba(99,102,241,.40)"  : "1px solid rgba(255,255,255,.08)",
                  color:      activeFilter === f.key ? "#a5b4fc"                         : "rgba(255,255,255,.50)",
                }}>
                {f.icon} {f.label}
              </button>
            ))}
          </div>
          <button onClick={() => setShowPanel(p => !p)}
            className="flex items-center gap-2 px-4 py-2 rounded-xl text-xs font-semibold transition-all hover:scale-105 active:scale-95 flex-shrink-0 self-start"
            style={{
              background: showPanel ? "rgba(99,102,241,.18)"          : "rgba(255,255,255,.05)",
              border:     showPanel ? "1px solid rgba(99,102,241,.35)" : "1px solid rgba(255,255,255,.08)",
              color:      showPanel ? "#a5b4fc"                        : "rgba(255,255,255,.55)",
            }}>
            <SlidersHorizontal size={13} /> Filters
          </button>
        </motion.div>

        {/* ── FILTER PANEL ── */}
        <AnimatePresence>
          {showPanel && (
            <motion.div initial={{ opacity: 0, height: 0 }} animate={{ opacity: 1, height: "auto" }}
              exit={{ opacity: 0, height: 0 }} transition={{ duration: 0.25 }} className="overflow-hidden mb-6">
              <div className="p-4 sm:p-5 rounded-2xl flex flex-wrap gap-6"
                   style={{ background: "rgba(255,255,255,.03)", border: "1px solid rgba(255,255,255,.07)" }}>
                <div>
                  <p className="text-[9px] uppercase tracking-widest font-bold mb-2" style={{ color: "rgba(148,163,184,.42)" }}>Sort By</p>
                  <div className="flex flex-wrap gap-1.5">
                    {SORT_OPTIONS.map(o => (
                      <Chip key={o.value} active={sortBy === o.value} onClick={() => setSortBy(o.value)}>{o.label}</Chip>
                    ))}
                  </div>
                </div>
                <div>
                  <p className="text-[9px] uppercase tracking-widest font-bold mb-2" style={{ color: "rgba(148,163,184,.42)" }}>Min Score</p>
                  <div className="flex flex-wrap gap-1.5">
                    {SCORE_FILTERS.map(s => (
                      <Chip key={s} active={minScore === s.replace("+","")} onClick={() => setMinScore(p => p === s.replace("+","") ? "" : s.replace("+",""))}>⭐ {s}</Chip>
                    ))}
                  </div>
                </div>
                <div>
                  <p className="text-[9px] uppercase tracking-widest font-bold mb-2" style={{ color: "rgba(148,163,184,.42)" }}>Season</p>
                  <div className="flex flex-wrap gap-1.5">
                    {SEASON_OPTIONS.map(o => (
                      <Chip key={o.value} active={season === o.value} onClick={() => setSeason(o.value)}>{o.label}</Chip>
                    ))}
                  </div>
                </div>
              </div>
            </motion.div>
          )}
        </AnimatePresence>

        {/* ── CONTENT ── */}
        <AnimatePresence mode="wait">
          {loading && (
            <motion.div key="loading" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
              className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-6 gap-3 sm:gap-4">
              {Array.from({ length: 24 }).map((_, i) => <CardSkeleton key={i} index={i} />)}
            </motion.div>
          )}
          {error && !loading && (
            <motion.div key="error" initial={{ opacity: 0 }} animate={{ opacity: 1 }}
              className="flex flex-col items-center gap-4 py-24 text-center">
              <Tv size={40} style={{ color: "rgba(99,102,241,.30)" }} />
              <p className="font-bold text-white">Failed to load series</p>
              <button onClick={() => fetchSeries(1)} className="flex items-center gap-2 px-4 py-2 rounded-xl text-sm font-semibold"
                style={{ background: "rgba(99,102,241,.15)", color: "#a5b4fc", border: "1px solid rgba(99,102,241,.25)" }}>
                <RefreshCw size={13} /> Retry
              </button>
            </motion.div>
          )}
          {!loading && !error && series.length > 0 && (
            <motion.div key="results" initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0 }}>
              {viewMode === "grid" ? (
                <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-6 gap-3 sm:gap-4">
                  {series.map((s, i) => <AnimeCard key={s.mal_id} anime={s} index={i} />)}
                </div>
              ) : (
                <div className="flex flex-col gap-2 sm:gap-2.5">
                  {series.map((s, i) => <ListRow key={s.mal_id} anime={s} index={i} />)}
                </div>
              )}
              {hasMore && (
                <div className="flex justify-center mt-8 sm:mt-12">
                  <button onClick={loadMore} disabled={loadingMore}
                    className="flex items-center gap-2 px-6 py-3 rounded-2xl text-sm font-bold transition-all hover:scale-105 active:scale-95 disabled:opacity-60"
                    style={{ background: "rgba(99,102,241,.15)", color: "#a5b4fc", border: "1px solid rgba(99,102,241,.28)" }}>
                    {loadingMore ? <><RefreshCw size={14} className="animate-spin" /> Loading…</> : <>Load More <ChevronRight size={14} /></>}
                  </button>
                </div>
              )}
            </motion.div>
          )}
          {!loading && !error && series.length === 0 && (
            <motion.div key="empty" initial={{ opacity: 0 }} animate={{ opacity: 1 }}
              className="flex flex-col items-center gap-4 py-24 text-center">
              <Tv size={40} style={{ color: "rgba(99,102,241,.25)" }} />
              <p className="font-bold text-white">No series found</p>
              <p className="text-sm" style={{ color: "rgba(148,163,184,.45)" }}>Try adjusting your filters</p>
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </div>
  );
};

export default Series;