// Kids.jsx
import { useState, useEffect, useCallback, useRef } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
  Baby, Star, ChevronRight, RefreshCw,
  LayoutGrid, LayoutList, Sparkles, Shield,
} from "lucide-react";
import { animeService } from "../services/animeService";
import AnimeCard from "../components/section/AnimeCard";

/* ══════════════════════════════════════════════════════════
   CONSTANTS
   MAL genre IDs (verified):
     15  = Kids
      1  = Action
      2  = Adventure
      4  = Comedy
      8  = Drama
     10  = Fantasy
     14  = Horror  (not used)
     16  = Magic
     22  = Romance (not used)
     30  = Sports
     36  = Slice of Life
     37  = Supernatural
══════════════════════════════════════════════════════════ */
const KIDS_CATEGORIES = [
  {
    key:    "all",
    label:  "All Kids",
    emoji:  "🌟",
    color:  "#fbbf24",
    glow:   "rgba(251,191,36,.18)",
    /* genre 15 = Kids — no extra genre filter */
    params: {
      genres:    "15",
      order_by:  "score",
      sort:      "desc",
      min_score: "5",
    },
  },
  {
    key:    "toprated",
    label:  "Top Rated",
    emoji:  "⭐",
    color:  "#fb923c",
    glow:   "rgba(249,115,22,.18)",
    params: {
      genres:    "15",
      order_by:  "score",
      sort:      "desc",
      min_score: "7.5",
    },
  },
  {
    key:    "adventure",
    label:  "Adventure",
    emoji:  "🗺️",
    color:  "#4ade80",
    glow:   "rgba(74,222,128,.18)",
    /* Kids (15) + Adventure (2) */
    params: {
      genres:   "15,2",
      order_by: "score",
      sort:     "desc",
      min_score: "5",
    },
  },
  {
    key:    "comedy",
    label:  "Comedy",
    emoji:  "😄",
    color:  "#f9a8d4",
    glow:   "rgba(249,168,212,.18)",
    /* Kids (15) + Comedy (4) */
    params: {
      genres:    "15,4",
      order_by:  "score",
      sort:      "desc",
      min_score: "5",
    },
  },
  {
    key:    "magic",
    label:  "Magic",
    emoji:  "🪄",
    color:  "#c4b5fd",
    glow:   "rgba(196,181,253,.18)",
    /* Kids (15) + Fantasy (10) — genre 16 is "Magic" but has
       very few Kids entries; Fantasy gives much better results */
    params: {
      genres:    "15,10",
      order_by:  "score",
      sort:      "desc",
      min_score: "5",
    },
  },
  {
    key:    "sports",
    label:  "Sports",
    emoji:  "⚽",
    color:  "#67e8f9",
    glow:   "rgba(103,232,249,.18)",
    /* Kids (15) + Sports (30) */
    params: {
      genres:    "15,30",
      order_by:  "score",
      sort:      "desc",
      min_score: "5",
    },
  },
];

const AGE_GROUPS = [
  { label: "All Ages", value: ""   },
  { label: "G",        value: "g"  },
  { label: "PG",       value: "pg" },
];

const FUN_FACTS = [
  { icon: "🎌", text: "Japan produces 60% of the world's animated content." },
  { icon: "📺", text: "Doraemon has been airing since 1973 — over 50 years!" },
  { icon: "🏆", text: "Spirited Away won the Academy Award for Best Animated Feature." },
  { icon: "🌍", text: "Pokémon is the highest-grossing media franchise of all time." },
];

/* default filter values */
const DEFAULT_AGE = "";

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
   FUN FACT TICKER
══════════════════════════════════════════════════════════ */
const FunFactTicker = () => {
  const [idx, setIdx] = useState(0);
  useEffect(() => {
    const t = setInterval(() => setIdx(i => (i + 1) % FUN_FACTS.length), 4000);
    return () => clearInterval(t);
  }, []);
  const fact = FUN_FACTS[idx];
  return (
    <AnimatePresence mode="wait">
      <motion.div
        key={idx}
        initial={{ opacity: 0, y: 6 }}
        animate={{ opacity: 1, y: 0 }}
        exit={{   opacity: 0, y: -6 }}
        transition={{ duration: 0.35 }}
        className="flex items-center gap-2"
      >
        <span className="text-lg">{fact.icon}</span>
        <p className="text-xs sm:text-sm" style={{ color: "rgba(148,163,184,.60)" }}>
          {fact.text}
        </p>
      </motion.div>
    </AnimatePresence>
  );
};

/* ══════════════════════════════════════════════════════════
   CATEGORY CARD
══════════════════════════════════════════════════════════ */
const CategoryCard = ({ cat, active, onClick }) => (
  <button
    onClick={onClick}
    className="flex flex-col items-center gap-2 p-3 sm:p-4 rounded-2xl transition-all
               hover:scale-105 active:scale-95"
    style={{
      background: active ? cat.glow                         : "rgba(255,255,255,.04)",
      border:     `1px solid ${active ? cat.color + "45"   : "rgba(255,255,255,.08)"}`,
      boxShadow:  active ? `0 0 20px ${cat.glow}`          : "none",
    }}
  >
    <span className="text-2xl sm:text-3xl leading-none">{cat.emoji}</span>
    <span
      className="text-xs font-bold whitespace-nowrap"
      style={{ color: active ? cat.color : "rgba(255,255,255,.55)" }}
    >
      {cat.label}
    </span>
  </button>
);

/* ══════════════════════════════════════════════════════════
   KIDS PAGE
══════════════════════════════════════════════════════════ */
const Kids = () => {
  const [activeKey,   setActiveKey]   = useState("all");
  const [anime,       setAnime]       = useState([]);
  const [loading,     setLoading]     = useState(true);
  const [error,       setError]       = useState(false);
  const [viewMode,    setViewMode]    = useState("grid");
  const [ageFilter,   setAgeFilter]   = useState(DEFAULT_AGE);
  const [page,        setPage]        = useState(1);
  const [hasMore,     setHasMore]     = useState(true);
  const [loadingMore, setLoadingMore] = useState(false);

  /* ref holds committed filter so fetchAnime never reads stale closure */
  const filterRef = useRef({ ageFilter: DEFAULT_AGE });

  /* derived — always current */
  const activeCat = KIDS_CATEGORIES.find(c => c.key === activeKey) ?? KIDS_CATEGORIES[0];

  /* ── core fetch ── */
  const fetchAnime = useCallback(async (pg = 1, append = false) => {
    pg === 1 ? setLoading(true) : setLoadingMore(true);
    setError(false);

    /* read committed values from ref */
    const { ageFilter: af } = filterRef.current;

    /* find the category params using activeKey (captured in closure) */
    const cat    = KIDS_CATEGORIES.find(c => c.key === activeKey) ?? KIDS_CATEGORIES[0];
    const params = {
      ...cat.params,
      limit: 24,
      page:  pg,
      ...(af ? { rating: af } : {}),
    };

    try {
      const data  = await animeService.searchAnime("", params);
      const items = data.data ?? [];
      setHasMore(items.length === 24);
      setAnime(prev => append ? [...prev, ...items] : items);
    } catch {
      setError(true);
    } finally {
      setLoading(false);
      setLoadingMore(false);
    }
  }, [activeKey]); // only activeKey — ageFilter comes from the ref

  /* re-fetch when category changes */
  useEffect(() => {
    setPage(1);
    setAnime([]);
    fetchAnime(1, false);
  }, [fetchAnime]);

  /* re-fetch when age filter changes — update ref first */
  useEffect(() => {
    filterRef.current = { ageFilter };
    setPage(1);
    setAnime([]);
    fetchAnime(1, false);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [ageFilter]);

  /* ── category change with filter reset ── */
  const handleCategoryChange = (key) => {
    if (key === activeKey) return;

    /* commit reset to ref immediately */
    filterRef.current = { ageFilter: DEFAULT_AGE };

    setAgeFilter(DEFAULT_AGE);
    setPage(1);
    setAnime([]);
    setActiveKey(key); // triggers useEffect → fetchAnime
  };

  /* ── load more ── */
  const loadMore = () => {
    const next = page + 1;
    setPage(next);
    fetchAnime(next, true);
  };

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
            background: "linear-gradient(135deg,rgba(251,191,36,.14),rgba(249,168,212,.08),rgba(196,181,253,.06),rgba(10,10,20,0))",
            border:     "1px solid rgba(251,191,36,.20)",
          }}
        >
          {/* decorative blobs */}
          <div
            className="absolute -top-10 -right-10 w-52 h-52 rounded-full pointer-events-none"
            style={{ background: "rgba(251,191,36,.06)", filter: "blur(50px)" }}
          />
          <div
            className="absolute -bottom-10 -left-10 w-52 h-52 rounded-full pointer-events-none"
            style={{ background: "rgba(249,168,212,.06)", filter: "blur(50px)" }}
          />

          {/* floating emojis */}
          {["🌟","🎮","🎵","📚","🌈","🚀"].map((e, i) => (
            <motion.span
              key={i}
              className="absolute text-2xl sm:text-3xl pointer-events-none select-none"
              style={{ top: `${15 + i * 12}%`, right: `${5 + i * 6}%`, opacity: 0.12 }}
              animate={{ y: [0, -8, 0], rotate: [0, 5, 0] }}
              transition={{ repeat: Infinity, duration: 3 + i * 0.4, delay: i * 0.3, ease: "easeInOut" }}
            >
              {e}
            </motion.span>
          ))}

          <div className="relative z-10">
            <div className="flex flex-col sm:flex-row sm:items-center gap-4 mb-5">
              {/* icon */}
              <div
                className="w-14 h-14 sm:w-16 sm:h-16 rounded-2xl flex items-center justify-center flex-shrink-0"
                style={{
                  background: "linear-gradient(135deg,rgba(251,191,36,.28),rgba(249,168,212,.18))",
                  border:     "1px solid rgba(251,191,36,.35)",
                  boxShadow:  "0 0 32px rgba(251,191,36,.18)",
                }}
              >
                <Baby size={28} style={{ color: "#fbbf24" }} />
              </div>

              {/* text */}
              <div className="flex-1">
                <div className="flex items-center gap-2 mb-1">
                  <h1
                    className="font-black text-white"
                    style={{ fontSize: "clamp(24px,5vw,40px)", letterSpacing: "-0.03em" }}
                  >
                    Kids Anime
                  </h1>
                  <span
                    className="text-[10px] font-black uppercase px-2 py-0.5 rounded-full"
                    style={{
                      background: "rgba(74,222,128,.16)",
                      color:       "#4ade80",
                      border:      "1px solid rgba(74,222,128,.28)",
                    }}
                  >
                    Family Safe
                  </span>
                </div>
                <p className="text-sm" style={{ color: "rgba(148,163,184,.55)" }}>
                  Age-appropriate anime for young viewers — adventure, comedy, magic and more!
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
                      background: viewMode === k ? "rgba(251,191,36,.28)"          : "transparent",
                      color:      viewMode === k ? "#fbbf24"                        : "rgba(255,255,255,.30)",
                      border:     viewMode === k ? "1px solid rgba(251,191,36,.28)" : "1px solid transparent",
                    }}
                  >
                    <I size={13} />
                  </button>
                ))}
              </div>
            </div>

            {/* fun fact ticker */}
            <div
              className="p-3 rounded-xl"
              style={{ background: "rgba(255,255,255,.04)", border: "1px solid rgba(255,255,255,.07)" }}
            >
              <div className="flex items-center gap-2 mb-1">
                <Sparkles size={11} style={{ color: "#fbbf24" }} />
                <span
                  className="text-[9px] uppercase tracking-widest font-bold"
                  style={{ color: "rgba(251,191,36,.65)" }}
                >
                  Did you know?
                </span>
              </div>
              <FunFactTicker />
            </div>
          </div>
        </motion.div>

        {/* ════ CATEGORY PICKER ════ */}
        <motion.div
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
          className="mb-6 sm:mb-8"
        >
          <p
            className="text-xs font-bold uppercase tracking-widest mb-3"
            style={{ color: "rgba(148,163,184,.38)" }}
          >
            Browse by Category
          </p>
          <div className="grid grid-cols-3 sm:grid-cols-6 gap-2 sm:gap-3">
            {KIDS_CATEGORIES.map(cat => (
              <CategoryCard
                key={cat.key}
                cat={cat}
                active={activeKey === cat.key}
                onClick={() => handleCategoryChange(cat.key)}
              />
            ))}
          </div>
        </motion.div>

        {/* ════ AGE FILTER + CONTROLS ════ */}
        <motion.div
          initial={{ opacity: 0, y: 8 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.15 }}
          className="flex flex-wrap items-center gap-3 mb-6"
        >
          <div className="flex items-center gap-2">
            <Shield size={13} style={{ color: "rgba(74,222,128,.70)" }} />
            <span className="text-xs font-bold" style={{ color: "rgba(148,163,184,.45)" }}>
              Age Rating:
            </span>
          </div>

          {AGE_GROUPS.map(a => (
            <button
              key={a.value}
              onClick={() => setAgeFilter(prev => prev === a.value ? DEFAULT_AGE : a.value)}
              className="px-3 py-1.5 rounded-xl text-xs font-semibold transition-all
                         hover:scale-105 active:scale-95"
              style={{
                background: ageFilter === a.value ? "rgba(74,222,128,.18)"          : "rgba(255,255,255,.04)",
                border:     ageFilter === a.value ? "1px solid rgba(74,222,128,.35)" : "1px solid rgba(255,255,255,.08)",
                color:      ageFilter === a.value ? "#4ade80"                        : "rgba(255,255,255,.50)",
              }}
            >
              {a.label}
            </button>
          ))}

          {/* mobile view toggle */}
          <div
            className="sm:hidden flex items-center p-1 rounded-xl gap-0.5 ml-auto"
            style={{ background: "rgba(255,255,255,.05)", border: "1px solid rgba(255,255,255,.08)" }}
          >
            {[{ k: "grid", I: LayoutGrid }, { k: "list", I: LayoutList }].map(({ k, I }) => (
              <button
                key={k}
                onClick={() => setViewMode(k)}
                className="w-7 h-7 rounded-lg flex items-center justify-center transition-all"
                style={{
                  background: viewMode === k ? "rgba(251,191,36,.28)" : "transparent",
                  color:      viewMode === k ? "#fbbf24"               : "rgba(255,255,255,.30)",
                }}
              >
                <I size={12} />
              </button>
            ))}
          </div>
        </motion.div>

        {/* ════ ACTIVE CATEGORY BANNER ════ */}
        <AnimatePresence mode="wait">
          <motion.div
            key={activeKey}
            initial={{ opacity: 0, x: -12 }}
            animate={{ opacity: 1, x: 0   }}
            exit={{   opacity: 0, x: 12   }}
            transition={{ duration: 0.25 }}
            className="flex items-center gap-3 mb-5 sm:mb-6 p-3 rounded-2xl"
            style={{
              background: activeCat.glow,
              border:     `1px solid ${activeCat.color}28`,
            }}
          >
            <span className="text-2xl leading-none">{activeCat.emoji}</span>
            <div>
              <p className="font-bold text-sm" style={{ color: activeCat.color }}>
                {activeCat.label}
              </p>
              {!loading && anime.length > 0 && (
                <p className="text-[10px]" style={{ color: "rgba(148,163,184,.45)" }}>
                  {anime.length} titles loaded
                </p>
              )}
            </div>
          </motion.div>
        </AnimatePresence>

        {/* ════ CONTENT ════ */}
        <AnimatePresence mode="wait">

          {/* loading */}
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
                <span className="text-3xl">😢</span>
              </div>
              <p className="font-bold text-white text-lg">Could not load anime</p>
              <p className="text-sm" style={{ color: "rgba(148,163,184,.50)" }}>
                Something went wrong. Check your connection and try again.
              </p>
              <button
                onClick={() => fetchAnime(1, false)}
                className="flex items-center gap-2 px-5 py-2.5 rounded-xl text-sm font-semibold
                           transition-all hover:scale-105 active:scale-95 mt-2"
                style={{
                  background: "rgba(251,191,36,.15)",
                  color:       "#fbbf24",
                  border:      "1px solid rgba(251,191,36,.25)",
                }}
              >
                <RefreshCw size={13} /> Try Again
              </button>
            </motion.div>
          )}

          {/* results */}
          {!loading && !error && anime.length > 0 && (
            <motion.div
              key="results"
              initial={{ opacity: 0, y: 8 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{   opacity: 0        }}
            >
              {viewMode === "grid" ? (
                <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-6 gap-3 sm:gap-4">
                  {anime.map((a, i) => (
                    <AnimeCard key={`${a.mal_id}-${i}`} anime={a} index={i} />
                  ))}
                </div>
              ) : (
                <div className="space-y-2 sm:space-y-2.5">
                  {anime.map((a, i) => (
                    <motion.div
                      key={`${a.mal_id}-${i}`}
                      initial={{ opacity: 0, y: 8 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ delay: Math.min(i * 0.025, 0.5) }}
                    >
                      <AnimeCard anime={a} index={i} />
                    </motion.div>
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
                      background: "rgba(251,191,36,.15)",
                      color:       "#fbbf24",
                      border:      "1px solid rgba(251,191,36,.28)",
                    }}
                  >
                    {loadingMore
                      ? <><RefreshCw size={14} className="animate-spin" /> Loading…</>
                      : <>Discover More <ChevronRight size={14} /></>
                    }
                  </button>
                </div>
              )}
            </motion.div>
          )}

          {/* empty */}
          {!loading && !error && anime.length === 0 && (
            <motion.div
              key="empty"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              className="flex flex-col items-center gap-4 py-24 text-center"
            >
              <div
                className="w-16 h-16 rounded-2xl flex items-center justify-center mb-2"
                style={{ background: "rgba(251,191,36,.08)", border: "1px solid rgba(251,191,36,.16)" }}
              >
                <span className="text-3xl">🔍</span>
              </div>
              <p className="font-bold text-white text-lg">No anime found</p>
              <p className="text-sm" style={{ color: "rgba(148,163,184,.45)" }}>
                Try a different category or remove the age filter.
              </p>
              {ageFilter !== DEFAULT_AGE && (
                <button
                  onClick={() => {
                    filterRef.current = { ageFilter: DEFAULT_AGE };
                    setAgeFilter(DEFAULT_AGE);
                  }}
                  className="flex items-center gap-1.5 text-xs font-semibold px-4 py-2
                             rounded-xl transition-all hover:scale-105 mt-2"
                  style={{
                    background: "rgba(251,191,36,.12)",
                    border:     "1px solid rgba(251,191,36,.22)",
                    color:      "#fbbf24",
                  }}
                >
                  <RefreshCw size={11} /> Clear Age Filter
                </button>
              )}
            </motion.div>
          )}

        </AnimatePresence>
      </div>
    </div>
  );
};

export default Kids;