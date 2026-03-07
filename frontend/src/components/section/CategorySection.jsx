import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { motion, AnimatePresence } from "framer-motion";
import { ChevronRight, RefreshCw, Layers } from "lucide-react";
import { animeService } from "../../services/animeService";
import AnimeCard from "./AnimeCard";

/* ══════════════════════════════════════════════════════════
   FULL CATEGORY LIST  (matches image: all Jikan genres)
══════════════════════════════════════════════════════════ */
const CATEGORIES = [
  { name: "Action",          id: 1,   icon: "⚔️",  accent: "rgba(239,68,68,.7)",    glow: "rgba(239,68,68,.18)"    },
  { name: "Adventure",       id: 2,   icon: "🗺️",  accent: "rgba(249,115,22,.7)",   glow: "rgba(249,115,22,.18)"   },
  { name: "Cars",            id: 3,   icon: "🏎️",  accent: "rgba(234,179,8,.7)",    glow: "rgba(234,179,8,.18)"    },
  { name: "Comedy",          id: 4,   icon: "😄",  accent: "rgba(132,204,22,.7)",   glow: "rgba(132,204,22,.18)"   },
  { name: "Dementia",        id: 5,   icon: "🌀",  accent: "rgba(168,85,247,.7)",   glow: "rgba(168,85,247,.18)"   },
  { name: "Demons",          id: 6,   icon: "😈",  accent: "rgba(220,38,38,.7)",    glow: "rgba(220,38,38,.18)"    },
  { name: "Drama",           id: 8,   icon: "🎭",  accent: "rgba(236,72,153,.7)",   glow: "rgba(236,72,153,.18)"   },
  { name: "Ecchi",           id: 9,   icon: "✨",  accent: "rgba(251,113,133,.7)",  glow: "rgba(251,113,133,.18)"  },
  { name: "Fantasy",         id: 10,  icon: "🧙",  accent: "rgba(99,102,241,.7)",   glow: "rgba(99,102,241,.18)"   },
  { name: "Game",            id: 11,  icon: "🎮",  accent: "rgba(34,197,94,.7)",    glow: "rgba(34,197,94,.18)"    },
  { name: "Harem",           id: 35,  icon: "💞",  accent: "rgba(244,114,182,.7)",  glow: "rgba(244,114,182,.18)"  },
  { name: "Historical",      id: 13,  icon: "🏯",  accent: "rgba(161,98,7,.7)",     glow: "rgba(161,98,7,.18)"     },
  { name: "Horror",          id: 14,  icon: "👻",  accent: "rgba(88,28,135,.7)",    glow: "rgba(88,28,135,.18)"    },
  { name: "Isekai",          id: 62,  icon: "🌍",  accent: "rgba(16,185,129,.7)",   glow: "rgba(16,185,129,.18)"   },
  { name: "Josei",           id: 43,  icon: "👩",  accent: "rgba(236,72,153,.7)",   glow: "rgba(236,72,153,.18)"   },
  { name: "Kids",            id: 15,  icon: "🧒",  accent: "rgba(234,179,8,.7)",    glow: "rgba(234,179,8,.18)"    },
  { name: "Magic",           id: 16,  icon: "🪄",  accent: "rgba(139,92,246,.7)",   glow: "rgba(139,92,246,.18)"   },
  { name: "Martial Arts",    id: 17,  icon: "🥋",  accent: "rgba(239,68,68,.7)",    glow: "rgba(239,68,68,.18)"    },
  { name: "Mecha",           id: 18,  icon: "🤖",  accent: "rgba(59,130,246,.7)",   glow: "rgba(59,130,246,.18)"   },
  { name: "Military",        id: 38,  icon: "🎖️",  accent: "rgba(101,163,13,.7)",   glow: "rgba(101,163,13,.18)"   },
  { name: "Music",           id: 19,  icon: "🎵",  accent: "rgba(236,72,153,.7)",   glow: "rgba(236,72,153,.18)"   },
  { name: "Mystery",         id: 7,   icon: "🔍",  accent: "rgba(99,102,241,.7)",   glow: "rgba(99,102,241,.18)"   },
  { name: "Parody",          id: 20,  icon: "🃏",  accent: "rgba(234,179,8,.7)",    glow: "rgba(234,179,8,.18)"    },
  { name: "Police",          id: 39,  icon: "🚔",  accent: "rgba(59,130,246,.7)",   glow: "rgba(59,130,246,.18)"   },
  { name: "Psychological",   id: 40,  icon: "🧠",  accent: "rgba(168,85,247,.7)",   glow: "rgba(168,85,247,.18)"   },
  { name: "Romance",         id: 22,  icon: "💕",  accent: "rgba(236,72,153,.7)",   glow: "rgba(236,72,153,.18)"   },
  { name: "Samurai",         id: 21,  icon: "🗡️",  accent: "rgba(161,98,7,.7)",     glow: "rgba(161,98,7,.18)"     },
  { name: "School",          id: 23,  icon: "🏫",  accent: "rgba(34,197,94,.7)",    glow: "rgba(34,197,94,.18)"    },
  { name: "Sci-Fi",          id: 24,  icon: "🚀",  accent: "rgba(59,130,246,.7)",   glow: "rgba(59,130,246,.18)"   },
  { name: "Seinen",          id: 42,  icon: "👨",  accent: "rgba(99,102,241,.7)",   glow: "rgba(99,102,241,.18)"   },
  { name: "Shoujo",          id: 25,  icon: "🌸",  accent: "rgba(244,114,182,.7)",  glow: "rgba(244,114,182,.18)"  },
  { name: "Shoujo Ai",       id: 26,  icon: "🌺",  accent: "rgba(251,113,133,.7)",  glow: "rgba(251,113,133,.18)"  },
  { name: "Shounen",         id: 27,  icon: "💪",  accent: "rgba(249,115,22,.7)",   glow: "rgba(249,115,22,.18)"   },
  { name: "Shounen Ai",      id: 28,  icon: "💙",  accent: "rgba(59,130,246,.7)",   glow: "rgba(59,130,246,.18)"   },
  { name: "Slice of Life",   id: 36,  icon: "🌅",  accent: "rgba(16,185,129,.7)",   glow: "rgba(16,185,129,.18)"   },
  { name: "Space",           id: 29,  icon: "🌌",  accent: "rgba(99,102,241,.7)",   glow: "rgba(99,102,241,.18)"   },
  { name: "Sports",          id: 30,  icon: "⚽",  accent: "rgba(34,197,94,.7)",    glow: "rgba(34,197,94,.18)"    },
  { name: "Super Power",     id: 31,  icon: "⚡",  accent: "rgba(234,179,8,.7)",    glow: "rgba(234,179,8,.18)"    },
  { name: "Supernatural",    id: 37,  icon: "👁️",  accent: "rgba(168,85,247,.7)",   glow: "rgba(168,85,247,.18)"   },
  { name: "Thriller",        id: 41,  icon: "😱",  accent: "rgba(239,68,68,.7)",    glow: "rgba(239,68,68,.18)"    },
  { name: "Vampire",         id: 32,  icon: "🧛",  accent: "rgba(220,38,38,.7)",    glow: "rgba(220,38,38,.18)"    },
];

/* ══════════════════════════════════════════════════════════
   FEATURED (shown by default, rest behind "Show All")
══════════════════════════════════════════════════════════ */
const FEATURED_IDS = [1, 22, 4, 14, 24, 10, 2, 40, 36, 27];

/* ══════════════════════════════════════════════════════════
   SKELETON CARD
══════════════════════════════════════════════════════════ */
const SkeletonCard = ({ delay = 0 }) => (
  <motion.div
    initial={{ opacity: 0 }}
    animate={{ opacity: 1 }}
    transition={{ delay, duration: 0.3 }}
    className="flex flex-col gap-2.5"
  >
    <div
      className="w-full rounded-2xl animate-pulse"
      style={{ aspectRatio: "2/3", background: "rgba(255,255,255,.06)" }}
    />
    <div className="space-y-1.5 px-0.5">
      <div className="h-2.5 rounded-full animate-pulse" style={{ width: "80%", background: "rgba(255,255,255,.05)" }} />
      <div className="h-2   rounded-full animate-pulse" style={{ width: "55%", background: "rgba(255,255,255,.04)" }} />
      <div className="h-2   rounded-full animate-pulse" style={{ width: "40%", background: "rgba(255,255,255,.03)" }} />
    </div>
  </motion.div>
);

/* ══════════════════════════════════════════════════════════
   ERROR STATE
══════════════════════════════════════════════════════════ */
const ErrorState = ({ name, onRetry }) => (
  <motion.div
    initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }}
    className="flex flex-col sm:flex-row items-center gap-4 py-6 px-5 rounded-2xl"
    style={{ background: "rgba(239,68,68,.06)", border: "1px solid rgba(239,68,68,.18)" }}
  >
    <div className="flex-1 text-center sm:text-left">
      <p className="text-sm font-semibold" style={{ color: "rgba(252,165,165,.85)" }}>
        Failed to load {name}
      </p>
      <p className="text-xs mt-0.5" style={{ color: "rgba(252,165,165,.45)" }}>
        Rate-limit hit — wait a moment and retry.
      </p>
    </div>
    <button
      onClick={onRetry}
      className="flex items-center gap-2 px-4 py-2 rounded-xl text-xs font-semibold transition-all hover:scale-105 active:scale-95 flex-shrink-0"
      style={{ background: "rgba(239,68,68,.14)", color: "rgba(252,165,165,.9)", border: "1px solid rgba(239,68,68,.25)" }}
    >
      <RefreshCw size={11} /> Retry
    </button>
  </motion.div>
);

/* ══════════════════════════════════════════════════════════
   GENRE CHIP  (for the picker grid)
══════════════════════════════════════════════════════════ */
const GenreChip = ({ cat, active, onClick }) => (
  <button
    onClick={onClick}
    className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-semibold transition-all hover:scale-105 active:scale-95 whitespace-nowrap"
    style={{
      background: active
        ? cat.glow.replace(".18", ".30")
        : "rgba(255,255,255,.04)",
      border: `1px solid ${active
        ? cat.accent.replace(".7", ".45")
        : "rgba(255,255,255,.08)"}`,
      color: active ? cat.accent.replace(".7", "1") : "rgba(255,255,255,.55)",
    }}
  >
    <span style={{ fontSize: 13 }}>{cat.icon}</span>
    {cat.name}
  </button>
);

/* ══════════════════════════════════════════════════════════
   SINGLE CATEGORY ROW
══════════════════════════════════════════════════════════ */
const CategoryRow = ({ category, visible, rowIndex }) => {
  const [anime,   setAnime]   = useState([]);
  const [loading, setLoading] = useState(false);
  const [error,   setError]   = useState(false);
  const [fetched, setFetched] = useState(false);

  useEffect(() => {
    if (!visible || fetched) return;
    let cancelled = false;
    (async () => {
      setLoading(true);
      setError(false);
      try {
        const data = await animeService.getAnimeByGenre(category.id);
        if (!cancelled) { setAnime(data.data?.slice(0, 10) ?? []); setFetched(true); }
      } catch {
        if (!cancelled) setError(true);
      } finally {
        if (!cancelled) setLoading(false);
      }
    })();
    return () => { cancelled = true; };
  }, [visible, fetched, category.id]);

  const retry = () => { setFetched(false); setError(false); };

  /* Build the "View all" URL — passes genre id + name so SearchPage can read it */
  const viewAllUrl = `/search?genres=${category.id}&genreName=${encodeURIComponent(category.name)}`;

  return (
    <motion.div
      initial={{ opacity: 0, y: 24 }}
      animate={{ opacity: visible ? 1 : 0, y: visible ? 0 : 24 }}
      transition={{ duration: 0.45, delay: rowIndex * 0.04, ease: "easeOut" }}
      className="relative"
    >
      {/* accent side bar */}
      <div
        className="absolute left-0 top-0 bottom-0 w-0.5 rounded-full"
        style={{ background: `linear-gradient(to bottom, ${category.accent}, transparent)`, opacity: 0.7 }}
      />

      <div className="pl-5 sm:pl-6">
        {/* ── header ── */}
        <div className="flex items-center justify-between mb-4 sm:mb-5">
          <div className="flex items-center gap-2.5 sm:gap-3 min-w-0">
            {/* icon blob */}
            <div
              className="w-9 h-9 sm:w-10 sm:h-10 rounded-xl flex items-center justify-center flex-shrink-0"
              style={{
                fontSize: "clamp(16px,3vw,20px)",
                background: `linear-gradient(135deg,${category.glow},rgba(255,255,255,.03))`,
                border: `1px solid ${category.accent.replace(".7", ".25")}`,
                boxShadow: `0 0 18px ${category.glow}`,
              }}
            >
              {category.icon}
            </div>

            <div className="min-w-0">
              <div className="flex items-center gap-2 flex-wrap">
                <h2
                  className="font-black text-white leading-none"
                  style={{ fontSize: "clamp(14px,2.5vw,19px)", letterSpacing: "-0.02em" }}
                >
                  {category.name}
                </h2>
                {!loading && anime.length > 0 && (
                  <span
                    className="text-[9px] font-bold px-1.5 py-0.5 rounded-full"
                    style={{
                      background: category.glow,
                      color: category.accent.replace(".7", "1"),
                      border: `1px solid ${category.accent.replace(".7", ".28")}`,
                    }}
                  >
                    {anime.length} titles
                  </span>
                )}
              </div>
              <p className="text-[10px] sm:text-xs mt-0.5 hidden sm:block"
                 style={{ color: "rgba(148,163,184,.42)" }}>
                Top {category.name.toLowerCase()} anime
              </p>
            </div>
          </div>

          {/* view all link */}
          <Link
            to={viewAllUrl}
            className="flex items-center gap-1 font-semibold transition-all hover:scale-105 active:scale-95 flex-shrink-0 ml-3 group"
            style={{ fontSize: "clamp(10px,1.8vw,12px)", color: category.accent.replace(".7", "1") }}
          >
            <span className="hidden sm:inline">View all</span>
            <span className="sm:hidden">All</span>
            <ChevronRight size={13} className="transition-transform duration-200 group-hover:translate-x-0.5" />
          </Link>
        </div>

        {/* ── content ── */}
        <AnimatePresence mode="wait">
          {loading && (
            <motion.div key="sk" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
              className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-3 sm:gap-4">
              {Array.from({ length: 5 }).map((_, i) => <SkeletonCard key={i} delay={i * 0.04} />)}
            </motion.div>
          )}

          {error && !loading && (
            <motion.div key="err" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}>
              <ErrorState name={category.name} onRetry={retry} />
            </motion.div>
          )}

          {!loading && !error && anime.length > 0 && (
            <motion.div key="cards"
              initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0 }} transition={{ duration: 0.35 }}
              className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-3 sm:gap-4"
            >
              {anime.map((a, i) => <AnimeCard key={a.mal_id} anime={a} index={i} />)}
            </motion.div>
          )}
        </AnimatePresence>
      </div>

      {/* separator */}
      <div
        className="mt-8 sm:mt-10 mb-10 sm:mb-14 ml-5 sm:ml-6"
        style={{
          height: 1,
          background: `linear-gradient(to right,${category.accent.replace(".7", ".22")},rgba(255,255,255,.05),transparent)`,
        }}
      />
    </motion.div>
  );
};

/* ══════════════════════════════════════════════════════════
   MAIN — CategorySection
══════════════════════════════════════════════════════════ */
const CategorySection = () => {
  const STAGGER_MS = 520;

  /* Which categories are currently "active" (showing rows) */
  const [activeIds,    setActiveIds]    = useState(FEATURED_IDS);
  /* How many of the active list have been unlocked for fetching */
  const [visibleCount, setVisibleCount] = useState(1);
  /* Whether the full picker is open */
  const [pickerOpen,   setPickerOpen]   = useState(false);
  /* Search within picker */
  const [pickerQuery,  setPickerQuery]  = useState("");

  /* stagger unlock */
  useEffect(() => {
    if (visibleCount >= activeIds.length) return;
    const t = setTimeout(
      () => setVisibleCount(c => Math.min(c + 1, activeIds.length)),
      STAGGER_MS
    );
    return () => clearTimeout(t);
  }, [visibleCount, activeIds.length]);

  /* When activeIds changes (genre toggled) restart stagger from current count */
  const toggleGenre = (id) => {
    setActiveIds(prev => {
      if (prev.includes(id)) {
        const next = prev.filter(x => x !== id);
        setVisibleCount(next.length); // all already-loaded stay visible
        return next;
      } else {
        setVisibleCount(prev.length); // existing rows already loaded
        return [...prev, id];
      }
    });
  };

  const activeCategories = activeIds
    .map(id => CATEGORIES.find(c => c.id === id))
    .filter(Boolean);

  const filteredPicker = CATEGORIES.filter(c =>
    c.name.toLowerCase().includes(pickerQuery.toLowerCase())
  );

  return (
    <section className="w-full py-10 sm:py-14">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">

        {/* ── SECTION HEADER ── */}
        <motion.div
          initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.5 }}
          className="flex flex-col sm:flex-row sm:items-end justify-between gap-3 sm:gap-6 mb-8 sm:mb-12"
        >
          {/* left */}
          <div className="flex items-center gap-3 sm:gap-4">
            <div
              className="w-10 h-10 sm:w-12 sm:h-12 rounded-2xl flex items-center justify-center flex-shrink-0"
              style={{
                background: "linear-gradient(135deg,rgba(99,102,241,.22),rgba(99,102,241,.06))",
                border: "1px solid rgba(99,102,241,.28)",
                boxShadow: "0 0 28px rgba(99,102,241,.14)",
              }}
            >
              <Layers size={20} style={{ color: "#a5b4fc", filter: "drop-shadow(0 0 6px rgba(99,102,241,.6))" }} />
            </div>
            <div>
              <div className="flex items-center gap-2 flex-wrap">
                <h2 className="font-black text-white" style={{ fontSize: "clamp(18px,3.5vw,28px)", letterSpacing: "-0.025em" }}>
                  Browse by Genre
                </h2>
                <span
                  className="text-[10px] font-bold px-2 py-0.5 rounded-full"
                  style={{ background: "rgba(99,102,241,.14)", color: "#a5b4fc", border: "1px solid rgba(99,102,241,.28)" }}
                >
                  {CATEGORIES.length} genres
                </span>
              </div>
              <p className="text-xs sm:text-sm mt-0.5" style={{ color: "rgba(148,163,184,.50)" }}>
                Discover anime by your favourite genre
              </p>
            </div>
          </div>

          {/* right: progress dots + picker toggle */}
          <div className="flex items-center gap-3 self-start sm:self-auto">
            {/* animated progress dots for active rows */}
            <div className="hidden sm:flex items-center gap-1.5">
              {activeCategories.slice(0, 10).map((cat, i) => (
                <div
                  key={cat.id}
                  className="rounded-full transition-all duration-500"
                  style={{
                    width:      i < visibleCount ? 18 : 6,
                    height:     6,
                    background: i < visibleCount
                      ? `linear-gradient(to right,${cat.accent},${cat.accent.replace(".7", ".45")})`
                      : "rgba(255,255,255,.10)",
                  }}
                />
              ))}
            </div>

            {/* toggle picker */}
            <button
              onClick={() => setPickerOpen(p => !p)}
              className="flex items-center gap-2 px-3 sm:px-4 py-2 rounded-xl text-xs sm:text-sm font-semibold transition-all hover:scale-105 active:scale-95"
              style={{
                background: pickerOpen ? "rgba(99,102,241,.28)" : "rgba(255,255,255,.06)",
                color:      pickerOpen ? "#a5b4fc"              : "rgba(255,255,255,.60)",
                border:     pickerOpen ? "1px solid rgba(99,102,241,.40)" : "1px solid rgba(255,255,255,.10)",
              }}
            >
              {pickerOpen ? "Hide genres" : "All genres"}
            </button>
          </div>
        </motion.div>

        {/* ── GENRE PICKER ── */}
        <AnimatePresence>
          {pickerOpen && (
            <motion.div
              initial={{ opacity: 0, height: 0 }}
              animate={{ opacity: 1, height: "auto" }}
              exit={{ opacity: 0, height: 0 }}
              transition={{ duration: 0.35 }}
              className="overflow-hidden mb-10 sm:mb-14"
            >
              <div
                className="rounded-2xl p-4 sm:p-6"
                style={{ background: "rgba(255,255,255,.03)", border: "1px solid rgba(255,255,255,.07)" }}
              >
                {/* picker search */}
                <div className="flex items-center gap-3 mb-4">
                  <input
                    type="text"
                    value={pickerQuery}
                    onChange={e => setPickerQuery(e.target.value)}
                    placeholder="Filter genres…"
                    className="flex-1 bg-transparent text-white placeholder-slate-500 text-sm outline-none border-b pb-1"
                    style={{ borderColor: "rgba(255,255,255,.12)", fontSize: 13 }}
                  />
                  <span className="text-xs" style={{ color: "rgba(148,163,184,.4)" }}>
                    {activeIds.length} selected
                  </span>
                </div>

                {/* chips */}
                <div className="flex flex-wrap gap-2">
                  {filteredPicker.map(cat => (
                    <GenreChip
                      key={cat.id}
                      cat={cat}
                      active={activeIds.includes(cat.id)}
                      onClick={() => toggleGenre(cat.id)}
                    />
                  ))}
                </div>

                {filteredPicker.length === 0 && (
                  <p className="text-xs text-center py-4" style={{ color: "rgba(148,163,184,.4)" }}>
                    No genres match "{pickerQuery}"
                  </p>
                )}
              </div>
            </motion.div>
          )}
        </AnimatePresence>

        {/* ── ROWS ── */}
        {activeCategories.map((cat, idx) => (
          <CategoryRow
            key={cat.id}
            category={cat}
            visible={idx < visibleCount}
            rowIndex={idx}
          />
        ))}

        {activeCategories.length === 0 && (
          <div className="text-center py-20" style={{ color: "rgba(148,163,184,.4)" }}>
            <p className="text-sm">No genres selected. Open "All genres" to pick some.</p>
          </div>
        )}

        {/* bottom glow */}
        <div
          className="mt-4"
          style={{ height: 1, background: "linear-gradient(to right,transparent,rgba(99,102,241,.25),transparent)" }}
        />
      </div>
    </section>
  );
};

export default CategorySection;