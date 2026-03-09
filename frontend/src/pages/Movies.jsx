// Movies.jsx
import { useState, useEffect, useCallback, useRef } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Link } from "react-router-dom";
import {
  Film, Star, ChevronRight, RefreshCw, SlidersHorizontal,
  LayoutGrid, LayoutList, Calendar, Clock,
  Flame, Sparkles, TrendingUp,
} from "lucide-react";
import { animeService } from "../services/animeService";
import AnimeCard from "../components/section/AnimeCard";

/* ══════════════════════════════════════════════════════════
   CONSTANTS
══════════════════════════════════════════════════════════ */
const MOVIE_FILTERS = [
  { key: "all",      label: "All Movies", icon: <Film size={13} />,        params: { type: "Movie", order_by: "popularity", sort: "desc" } },
  { key: "popular",  label: "Popular",    icon: <TrendingUp size={13} />,   params: { type: "Movie", order_by: "members",    sort: "desc" } },
  { key: "trending", label: "Trending",   icon: <Flame size={13} />,        params: { type: "Movie", order_by: "popularity", sort: "desc", status: "airing" } },
  { key: "newest",   label: "Newest",     icon: <Sparkles size={13} />,     params: { type: "Movie", order_by: "start_date", sort: "desc" } },
  { key: "upcoming", label: "Upcoming",   icon: <Calendar size={13} />,     params: { type: "Movie", status: "upcoming",    order_by: "start_date", sort: "asc" } },
];

const SORT_OPTIONS = [
  { label: "Popularity", value: "popularity" },
  { label: "Score",      value: "score"      },
  { label: "Newest",     value: "start_date" },
  { label: "Title",      value: "title"      },
  { label: "Rank",       value: "rank"       },
];

const SCORE_FILTERS = ["9+", "8+", "7+", "6+"];

const STATUS_OPTIONS = [
  { label: "All",      value: ""         },
  { label: "Finished", value: "complete" },
  { label: "Airing",   value: "airing"   },
];

/* default filter values — single source of truth */
const DEFAULT_SORT   = "popularity";
const DEFAULT_SCORE  = "";
const DEFAULT_STATUS = "";

/* ══════════════════════════════════════════════════════════
   CARD SKELETON
══════════════════════════════════════════════════════════ */
const CardSkeleton = ({ index }) => (
  <motion.div
    initial={{ opacity: 0 }}
    animate={{ opacity: 1 }}
    transition={{ delay: index * 0.03 }}
    className="flex flex-col gap-2.5"
  >
    <div
      className="w-full rounded-2xl animate-pulse"
      style={{ aspectRatio: "2/3", background: "rgba(255,255,255,.06)" }}
    />
    <div className="space-y-1.5 px-0.5">
      <div className="h-2.5 rounded-full animate-pulse"
           style={{ width: "80%", background: "rgba(255,255,255,.05)" }} />
      <div className="h-2 rounded-full animate-pulse"
           style={{ width: "55%", background: "rgba(255,255,255,.04)" }} />
    </div>
  </motion.div>
);

/* ══════════════════════════════════════════════════════════
   LIST ROW
══════════════════════════════════════════════════════════ */
const ListRow = ({ anime, index }) => {
  const [hov, setHov] = useState(false);
  const img   = anime.images?.jpg?.large_image_url || anime.images?.jpg?.image_url;
  const title = anime.title_english || anime.title;

  return (
    <motion.div
      initial={{ opacity: 0, y: 8 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: Math.min(index * 0.025, 0.5) }}
    >
      <Link
        to={`/anime/${anime.mal_id}`}
        onMouseEnter={() => setHov(true)}
        onMouseLeave={() => setHov(false)}
        className="flex items-center gap-3 sm:gap-4 p-3 sm:p-4 rounded-2xl transition-all duration-200"
        style={{
          background: hov ? "rgba(255,255,255,.06)" : "rgba(255,255,255,.03)",
          border:     `1px solid ${hov ? "rgba(234,179,8,.28)" : "rgba(255,255,255,.07)"}`,
          transform:  hov ? "scale(1.008)" : "scale(1)",
        }}
      >
        {/* rank */}
        <span
          className="flex-shrink-0 font-black text-center w-7"
          style={{
            fontSize: 11,
            color:
              index === 0 ? "#fbbf24" :
              index === 1 ? "#94a3b8" :
              index === 2 ? "#fb923c" :
              "rgba(148,163,184,.28)",
          }}
        >
          {index < 3 ? ["🥇","🥈","🥉"][index] : index + 1}
        </span>

        {/* thumbnail */}
        <div
          className="flex-shrink-0 rounded-xl overflow-hidden"
          style={{ width: 46, height: 62, border: "1px solid rgba(255,255,255,.08)" }}
        >
          <img
            src={img}
            alt={title}
            className="w-full h-full object-cover"
            style={{ transform: hov ? "scale(1.08)" : "scale(1)", transition: "transform .4s" }}
          />
        </div>

        {/* info */}
        <div className="flex-1 min-w-0">
          <p
            className="font-bold line-clamp-1 transition-colors duration-200"
            style={{ fontSize: "clamp(12px,2vw,14px)", color: hov ? "#fbbf24" : "#fff" }}
          >
            {title}
          </p>
          <div className="flex items-center gap-2 mt-1 flex-wrap">
            {anime.duration && (
              <span
                className="flex items-center gap-1 text-[10px]"
                style={{ color: "rgba(148,163,184,.42)" }}
              >
                <Clock size={9} /> {anime.duration}
              </span>
            )}
            {anime.year && (
              <span className="text-[10px]" style={{ color: "rgba(148,163,184,.35)" }}>
                {anime.year}
              </span>
            )}
            {anime.genres?.slice(0, 2).map(g => (
              <span
                key={g.mal_id}
                className="text-[9px] font-semibold px-1.5 py-0.5 rounded-md"
                style={{
                  background: "rgba(234,179,8,.10)",
                  border:     "1px solid rgba(234,179,8,.20)",
                  color:      "rgba(251,191,36,.75)",
                }}
              >
                {g.name}
              </span>
            ))}
          </div>
        </div>

        {/* score */}
        {anime.score && (
          <div className="flex-shrink-0 flex items-center gap-1">
            <Star size={10} style={{ color: "#fbbf24", fill: "#fbbf24" }} />
            <span className="font-black text-white" style={{ fontSize: 12 }}>
              {anime.score.toFixed(1)}
            </span>
          </div>
        )}
      </Link>
    </motion.div>
  );
};

/* ══════════════════════════════════════════════════════════
   CHIP
══════════════════════════════════════════════════════════ */
const Chip = ({ active, onClick, children }) => (
  <button
    onClick={onClick}
    className="px-3 py-1.5 rounded-xl text-xs font-semibold transition-all
               hover:scale-105 active:scale-95 whitespace-nowrap"
    style={{
      background: active ? "rgba(234,179,8,.22)"          : "rgba(255,255,255,.05)",
      border:     active ? "1px solid rgba(234,179,8,.40)" : "1px solid rgba(255,255,255,.08)",
      color:      active ? "#fbbf24"                       : "rgba(255,255,255,.52)",
    }}
  >
    {children}
  </button>
);

/* ══════════════════════════════════════════════════════════
   MOVIES PAGE
══════════════════════════════════════════════════════════ */
const Movies = () => {
  const [activeFilter, setActiveFilter] = useState("all");
  const [movies,       setMovies]       = useState([]);
  const [loading,      setLoading]      = useState(true);
  const [error,        setError]        = useState(false);
  const [viewMode,     setViewMode]     = useState("grid");
  const [showPanel,    setShowPanel]    = useState(false);
  const [sortBy,       setSortBy]       = useState(DEFAULT_SORT);
  const [minScore,     setMinScore]     = useState(DEFAULT_SCORE);
  const [status,       setStatus]       = useState(DEFAULT_STATUS);
  const [page,         setPage]         = useState(1);
  const [hasMore,      setHasMore]      = useState(true);
  const [loadingMore,  setLoadingMore]  = useState(false);

  /* ref holds committed filter values so fetchMovies never reads stale closure */
  const filterRef = useRef({
    sortBy:   DEFAULT_SORT,
    minScore: DEFAULT_SCORE,
    status:   DEFAULT_STATUS,
  });

  /* ── core fetch ── */
  const fetchMovies = useCallback(async (pg = 1, append = false) => {
    pg === 1 ? setLoading(true) : setLoadingMore(true);
    setError(false);

    /* always read from ref — never from closed-over state */
    const { sortBy: sb, minScore: ms, status: st } = filterRef.current;

    try {
      const base   = MOVIE_FILTERS.find(f => f.key === activeFilter)?.params ?? {};
      const params = {
        ...base,
        limit: 24,
        page:  pg,
        ...(sb ? { order_by: sb }  : {}),
        ...(ms ? { min_score: ms } : {}),
        ...(st ? { status: st }    : {}),
      };

      const data  = await animeService.searchAnime("", params);
      const items = data.data ?? [];
      setHasMore(items.length === 24);
      setMovies(prev => append ? [...prev, ...items] : items);
    } catch {
      setError(true);
    } finally {
      setLoading(false);
      setLoadingMore(false);
    }
  }, [activeFilter]); // only activeFilter — filter values come from the ref

  /* re-fetch when active tab changes */
  useEffect(() => {
    setPage(1);
    setMovies([]);
    fetchMovies(1, false);
  }, [fetchMovies]);

  /* re-fetch when panel filters change — update ref first */
  useEffect(() => {
    filterRef.current = { sortBy, minScore, status };
    setPage(1);
    setMovies([]);
    fetchMovies(1, false);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [sortBy, minScore, status]);

  /* ── tab change: reset all filters synchronously via the ref ── */
  const handleFilterChange = (key) => {
    if (key === activeFilter) return;

    /* 1. commit reset values to ref immediately */
    filterRef.current = {
      sortBy:   DEFAULT_SORT,
      minScore: DEFAULT_SCORE,
      status:   DEFAULT_STATUS,
    };

    /* 2. update React state */
    setSortBy(DEFAULT_SORT);
    setMinScore(DEFAULT_SCORE);
    setStatus(DEFAULT_STATUS);
    setShowPanel(false);
    setPage(1);
    setMovies([]);
    setActiveFilter(key); // triggers useEffect → fetchMovies
  };

  /* ── load more ── */
  const loadMore = () => {
    const next = page + 1;
    setPage(next);
    fetchMovies(next, true);
  };

  /* ── helpers ── */
  const activeFilterObj   = MOVIE_FILTERS.find(f => f.key === activeFilter);
  const activeLabel       = activeFilterObj?.label ?? "Movies";
  const hasActiveFilters  = sortBy !== DEFAULT_SORT || minScore !== DEFAULT_SCORE || status !== DEFAULT_STATUS;
  const activeFilterCount = [
    sortBy   !== DEFAULT_SORT,
    minScore !== DEFAULT_SCORE,
    status   !== DEFAULT_STATUS,
  ].filter(Boolean).length;

  /* ══════════════════════════════════════════════════════
     RENDER
  ══════════════════════════════════════════════════════ */
  return (
    <div className="min-h-screen" style={{ background: "#0a0a14" }}>
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 sm:py-12">

        {/* ════ HERO ════ */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="relative overflow-hidden rounded-3xl mb-8 sm:mb-12 p-6 sm:p-10"
          style={{
            background: "linear-gradient(135deg,rgba(234,179,8,.12),rgba(251,191,36,.06),rgba(10,10,20,0))",
            border:     "1px solid rgba(234,179,8,.18)",
          }}
        >
          <div
            className="absolute -top-16 -right-16 w-64 h-64 rounded-full pointer-events-none"
            style={{ background: "rgba(234,179,8,.06)", filter: "blur(60px)" }}
          />

          <div className="relative z-10 flex flex-col sm:flex-row sm:items-center gap-4">
            {/* icon */}
            <div
              className="w-14 h-14 sm:w-16 sm:h-16 rounded-2xl flex items-center justify-center flex-shrink-0"
              style={{
                background: "linear-gradient(135deg,rgba(234,179,8,.25),rgba(234,179,8,.10))",
                border:     "1px solid rgba(234,179,8,.35)",
                boxShadow:  "0 0 32px rgba(234,179,8,.20)",
              }}
            >
              <Film size={28} style={{ color: "#fbbf24" }} />
            </div>

            {/* text */}
            <div className="flex-1">
              <div className="flex items-center gap-2 mb-1">
                <h1
                  className="font-black text-white"
                  style={{ fontSize: "clamp(24px,5vw,40px)", letterSpacing: "-0.03em" }}
                >
                  Anime Movies
                </h1>
                <span
                  className="text-[10px] font-black uppercase px-2 py-0.5 rounded-full"
                  style={{
                    background: "rgba(234,179,8,.18)",
                    color:       "#fbbf24",
                    border:      "1px solid rgba(234,179,8,.30)",
                  }}
                >
                  HD
                </span>
              </div>
              <p className="text-sm" style={{ color: "rgba(148,163,184,.55)" }}>
                Explore the greatest anime films — from Studio Ghibli classics to modern masterpieces.
              </p>
            </div>

            {/* view toggle — desktop */}
            <div
              className="hidden sm:flex items-center p-1 rounded-xl gap-0.5"
              style={{ background: "rgba(255,255,255,.05)", border: "1px solid rgba(255,255,255,.08)" }}
            >
              {[{ k: "grid", I: LayoutGrid }, { k: "list", I: LayoutList }].map(({ k, I }) => (
                <button
                  key={k}
                  onClick={() => setViewMode(k)}
                  className="w-8 h-8 rounded-lg flex items-center justify-center transition-all"
                  style={{
                    background: viewMode === k ? "rgba(234,179,8,.28)"          : "transparent",
                    color:      viewMode === k ? "#fbbf24"                       : "rgba(255,255,255,.30)",
                    border:     viewMode === k ? "1px solid rgba(234,179,8,.28)" : "1px solid transparent",
                  }}
                >
                  <I size={13} />
                </button>
              ))}
            </div>
          </div>
        </motion.div>

        {/* ════ FILTER TABS ════ */}
        <motion.div
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
          className="flex flex-col sm:flex-row gap-3 sm:gap-4 mb-6 sm:mb-8"
        >
          <div
            className="flex items-center gap-2 overflow-x-auto pb-1 flex-1"
            style={{ scrollbarWidth: "none" }}
          >
            {MOVIE_FILTERS.map(f => (
              <button
                key={f.key}
                onClick={() => handleFilterChange(f.key)}
                className="flex items-center gap-1.5 px-3.5 py-2 rounded-xl text-xs font-bold
                           whitespace-nowrap transition-all hover:scale-105 active:scale-95 flex-shrink-0"
                style={{
                  background: activeFilter === f.key ? "rgba(234,179,8,.22)"          : "rgba(255,255,255,.05)",
                  border:     activeFilter === f.key ? "1px solid rgba(234,179,8,.40)" : "1px solid rgba(255,255,255,.08)",
                  color:      activeFilter === f.key ? "#fbbf24"                       : "rgba(255,255,255,.50)",
                }}
              >
                {f.icon} {f.label}
              </button>
            ))}
          </div>

          {/* filters toggle */}
          <button
            onClick={() => setShowPanel(p => !p)}
            className="flex items-center gap-2 px-4 py-2 rounded-xl text-xs font-semibold
                       transition-all hover:scale-105 active:scale-95 flex-shrink-0 self-start"
            style={{
              background: showPanel ? "rgba(234,179,8,.18)"          : "rgba(255,255,255,.05)",
              border:     showPanel ? "1px solid rgba(234,179,8,.35)" : "1px solid rgba(255,255,255,.08)",
              color:      showPanel ? "#fbbf24"                       : "rgba(255,255,255,.55)",
            }}
          >
            <SlidersHorizontal size={13} />
            Filters
            {/* active filter count badge */}
            {hasActiveFilters && (
              <span
                className="flex items-center justify-center w-4 h-4 rounded-full text-[9px] font-black"
                style={{ background: "#d97706", color: "#fff" }}
              >
                {activeFilterCount}
              </span>
            )}
          </button>
        </motion.div>

        {/* ════ FILTER PANEL ════ */}
        <AnimatePresence>
          {showPanel && (
            <motion.div
              initial={{ opacity: 0, height: 0 }}
              animate={{ opacity: 1, height: "auto" }}
              exit={{   opacity: 0, height: 0      }}
              transition={{ duration: 0.25 }}
              className="overflow-hidden mb-6"
            >
              <div
                className="p-4 sm:p-5 rounded-2xl flex flex-wrap gap-6"
                style={{ background: "rgba(255,255,255,.03)", border: "1px solid rgba(255,255,255,.07)" }}
              >
                {/* sort */}
                <div>
                  <p className="text-[9px] uppercase tracking-widest font-bold mb-2"
                     style={{ color: "rgba(148,163,184,.42)" }}>
                    Sort By
                  </p>
                  <div className="flex flex-wrap gap-1.5">
                    {SORT_OPTIONS.map(o => (
                      <Chip
                        key={o.value}
                        active={sortBy === o.value}
                        onClick={() => setSortBy(o.value)}
                      >
                        {o.label}
                      </Chip>
                    ))}
                  </div>
                </div>

                {/* min score */}
                <div>
                  <p className="text-[9px] uppercase tracking-widest font-bold mb-2"
                     style={{ color: "rgba(148,163,184,.42)" }}>
                    Min Score
                  </p>
                  <div className="flex flex-wrap gap-1.5">
                    {SCORE_FILTERS.map(s => {
                      const val = s.replace("+", "");
                      return (
                        <Chip
                          key={s}
                          active={minScore === val}
                          onClick={() => setMinScore(p => p === val ? DEFAULT_SCORE : val)}
                        >
                          ⭐ {s}
                        </Chip>
                      );
                    })}
                  </div>
                </div>

                {/* status — hidden for upcoming & trending tabs */}
                {activeFilter !== "upcoming" && activeFilter !== "trending" && (
                  <div>
                    <p className="text-[9px] uppercase tracking-widest font-bold mb-2"
                       style={{ color: "rgba(148,163,184,.42)" }}>
                      Status
                    </p>
                    <div className="flex flex-wrap gap-1.5">
                      {STATUS_OPTIONS.map(o => (
                        <Chip
                          key={o.value}
                          active={status === o.value}
                          onClick={() => setStatus(o.value)}
                        >
                          {o.label}
                        </Chip>
                      ))}
                    </div>
                  </div>
                )}

                {/* reset button */}
                {hasActiveFilters && (
                  <div
                    className="w-full flex items-center pt-1"
                    style={{ borderTop: "1px solid rgba(255,255,255,.06)" }}
                  >
                    <button
                      onClick={() => {
                        filterRef.current = {
                          sortBy:   DEFAULT_SORT,
                          minScore: DEFAULT_SCORE,
                          status:   DEFAULT_STATUS,
                        };
                        setSortBy(DEFAULT_SORT);
                        setMinScore(DEFAULT_SCORE);
                        setStatus(DEFAULT_STATUS);
                      }}
                      className="flex items-center gap-1.5 text-xs font-semibold px-3 py-1.5
                                 rounded-xl transition-all hover:scale-105"
                      style={{
                        background: "rgba(239,68,68,.10)",
                        border:     "1px solid rgba(239,68,68,.20)",
                        color:      "rgba(252,165,165,.80)",
                      }}
                    >
                      <RefreshCw size={11} /> Reset Filters
                    </button>
                  </div>
                )}
              </div>
            </motion.div>
          )}
        </AnimatePresence>

        {/* ════ RESULTS HEADER ════ */}
        {!loading && movies.length > 0 && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            className="flex items-center justify-between mb-4 sm:mb-5"
          >
            <p className="text-xs sm:text-sm" style={{ color: "rgba(148,163,184,.45)" }}>
              <span className="font-bold text-white">{movies.length}</span> movies found
              {activeFilterObj && <span> · {activeFilterObj.label}</span>}
            </p>

            {/* view toggle — mobile */}
            <div
              className="flex sm:hidden items-center p-1 rounded-xl gap-0.5"
              style={{ background: "rgba(255,255,255,.05)", border: "1px solid rgba(255,255,255,.08)" }}
            >
              {[{ k: "grid", I: LayoutGrid }, { k: "list", I: LayoutList }].map(({ k, I }) => (
                <button
                  key={k}
                  onClick={() => setViewMode(k)}
                  className="w-7 h-7 rounded-lg flex items-center justify-center transition-all"
                  style={{
                    background: viewMode === k ? "rgba(234,179,8,.28)" : "transparent",
                    color:      viewMode === k ? "#fbbf24"              : "rgba(255,255,255,.30)",
                  }}
                >
                  <I size={12} />
                </button>
              ))}
            </div>
          </motion.div>
        )}

        {/* ════ CONTENT ════ */}
        <AnimatePresence mode="wait">

          {/* loading skeletons */}
          {loading && (
            <motion.div
              key="loading"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{   opacity: 0 }}
              className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-6 gap-3 sm:gap-4"
            >
              {Array.from({ length: 24 }).map((_, i) => (
                <CardSkeleton key={i} index={i} />
              ))}
            </motion.div>
          )}

          {/* error */}
          {error && !loading && (
            <motion.div
              key="error"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              className="flex flex-col items-center gap-4 py-24 text-center"
            >
              <div
                className="w-16 h-16 rounded-2xl flex items-center justify-center mb-2"
                style={{ background: "rgba(239,68,68,.10)", border: "1px solid rgba(239,68,68,.20)" }}
              >
                <Film size={28} style={{ color: "rgba(239,68,68,.60)" }} />
              </div>
              <p className="font-bold text-white text-lg">Failed to load movies</p>
              <p className="text-sm" style={{ color: "rgba(148,163,184,.50)" }}>
                Something went wrong. Check your connection and try again.
              </p>
              <button
                onClick={() => fetchMovies(1, false)}
                className="flex items-center gap-2 px-5 py-2.5 rounded-xl text-sm font-semibold
                           transition-all hover:scale-105 active:scale-95 mt-2"
                style={{
                  background: "rgba(234,179,8,.15)",
                  color:       "#fbbf24",
                  border:      "1px solid rgba(234,179,8,.25)",
                }}
              >
                <RefreshCw size={13} /> Retry
              </button>
            </motion.div>
          )}

          {/* results */}
          {!loading && !error && movies.length > 0 && (
            <motion.div
              key="results"
              initial={{ opacity: 0, y: 8 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{   opacity: 0        }}
            >
              {viewMode === "grid" ? (
                <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-6 gap-3 sm:gap-4">
                  {movies.map((m, i) => (
                    <AnimeCard key={`${m.mal_id}-${i}`} anime={m} index={i} />
                  ))}
                </div>
              ) : (
                <div className="flex flex-col gap-2 sm:gap-2.5">
                  {movies.map((m, i) => (
                    <ListRow key={`${m.mal_id}-${i}`} anime={m} index={i} />
                  ))}
                </div>
              )}

              {/* load more */}
              {hasMore && (
                <div className="flex justify-center mt-8 sm:mt-12">
                  <button
                    onClick={loadMore}
                    disabled={loadingMore}
                    className="flex items-center gap-2 px-6 py-3 rounded-2xl text-sm font-bold
                               transition-all hover:scale-105 active:scale-95 disabled:opacity-60
                               disabled:cursor-not-allowed disabled:hover:scale-100"
                    style={{
                      background: "rgba(234,179,8,.15)",
                      color:       "#fbbf24",
                      border:      "1px solid rgba(234,179,8,.28)",
                    }}
                  >
                    {loadingMore
                      ? <><RefreshCw size={14} className="animate-spin" /> Loading…</>
                      : <>Load More Movies <ChevronRight size={14} /></>
                    }
                  </button>
                </div>
              )}
            </motion.div>
          )}

          {/* empty */}
          {!loading && !error && movies.length === 0 && (
            <motion.div
              key="empty"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              className="flex flex-col items-center gap-4 py-24 text-center"
            >
              <div
                className="w-16 h-16 rounded-2xl flex items-center justify-center mb-2"
                style={{ background: "rgba(234,179,8,.08)", border: "1px solid rgba(234,179,8,.16)" }}
              >
                <Film size={28} style={{ color: "rgba(234,179,8,.40)" }} />
              </div>
              <p className="font-bold text-white text-lg">No {activeLabel} found</p>
              <p className="text-sm" style={{ color: "rgba(148,163,184,.45)" }}>
                Try adjusting your filters or switching to a different tab.
              </p>
              {hasActiveFilters && (
                <button
                  onClick={() => {
                    filterRef.current = {
                      sortBy:   DEFAULT_SORT,
                      minScore: DEFAULT_SCORE,
                      status:   DEFAULT_STATUS,
                    };
                    setSortBy(DEFAULT_SORT);
                    setMinScore(DEFAULT_SCORE);
                    setStatus(DEFAULT_STATUS);
                  }}
                  className="flex items-center gap-1.5 text-xs font-semibold px-4 py-2
                             rounded-xl transition-all hover:scale-105 mt-2"
                  style={{
                    background: "rgba(234,179,8,.12)",
                    border:     "1px solid rgba(234,179,8,.22)",
                    color:      "#fbbf24",
                  }}
                >
                  <RefreshCw size={11} /> Clear Filters
                </button>
              )}
            </motion.div>
          )}

        </AnimatePresence>
      </div>
    </div>
  );
};

export default Movies;