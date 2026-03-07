// Favorites.jsx
import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
  Heart, Trash2, Star, ArrowRight, Search,
  Grid3X3, List, SortAsc, Sparkles, Clock,
  Tv, Film, BookMarked, TrendingUp, X,
} from "lucide-react";
import { Link } from "react-router-dom";
import { useFavorites } from "../context/FavoritesContext";
import { useAuth }      from "../context/AuthContext";

/* ══════════════════════════════════════════════════════════
   HELPERS
══════════════════════════════════════════════════════════ */
const scoreColor = (s) =>
  !s       ? "#94a3b8" :
  s >= 8.5 ? "#fbbf24" :
  s >= 7.5 ? "#a3e635" :
  s >= 6.5 ? "#60a5fa" :
             "#94a3b8";

const statusColor = (status) => {
  if (!status) return { bg: "rgba(148,163,184,.12)", color: "rgba(148,163,184,.70)" };
  if (status.includes("Airing"))      return { bg: "rgba(74,222,128,.12)", color: "#4ade80" };
  if (status.includes("Finished"))    return { bg: "rgba(96,165,250,.12)", color: "#60a5fa" };
  if (status.includes("Not yet"))     return { bg: "rgba(251,191,36,.12)",  color: "#fbbf24" };
  return { bg: "rgba(148,163,184,.12)", color: "rgba(148,163,184,.70)" };
};

/* ══════════════════════════════════════════════════════════
   GENRE PILL
══════════════════════════════════════════════════════════ */
const GenrePill = ({ label }) => (
  <span
    className="text-[9px] font-bold uppercase px-1.5 py-0.5 rounded-md tracking-wide flex-shrink-0"
    style={{
      background: "rgba(99,102,241,.12)",
      border:     "1px solid rgba(99,102,241,.20)",
      color:      "rgba(165,180,252,.75)",
    }}
  >
    {label}
  </span>
);

/* ══════════════════════════════════════════════════════════
   REMOVE BUTTON  (shared)
══════════════════════════════════════════════════════════ */
const RemoveBtn = ({ onClick, size = 14 }) => (
  <button
    onClick={(e) => { e.preventDefault(); e.stopPropagation(); onClick(); }}
    className="flex items-center justify-center rounded-xl transition-all
               hover:scale-110 active:scale-95"
    style={{
      width: 30, height: 30,
      background: "rgba(239,68,68,.12)",
      border:     "1px solid rgba(239,68,68,.20)",
      color:      "rgba(248,113,113,.80)",
    }}
    onMouseEnter={e => {
      e.currentTarget.style.background = "rgba(239,68,68,.22)";
      e.currentTarget.style.color      = "#fca5a5";
    }}
    onMouseLeave={e => {
      e.currentTarget.style.background = "rgba(239,68,68,.12)";
      e.currentTarget.style.color      = "rgba(248,113,113,.80)";
    }}
    aria-label="Remove favourite"
  >
    <Trash2 size={size} />
  </button>
);

/* ══════════════════════════════════════════════════════════
   GRID CARD
══════════════════════════════════════════════════════════ */
const GridCard = ({ fav, index, onRemove }) => {
  const [imgErr, setImgErr] = useState(false);
  const sc  = fav.score;
  const st  = statusColor(fav.status);

  return (
    <motion.div
      layout
      initial={{ opacity: 0, y: 24, scale: 0.96 }}
      animate={{ opacity: 1, y: 0,  scale: 1    }}
      exit={{   opacity: 0, y: -12, scale: 0.94 }}
      transition={{ delay: index * 0.035, duration: 0.35, ease: [0.22,1,0.36,1] }}
      className="group relative flex flex-col rounded-2xl overflow-hidden"
      style={{
        background: "rgba(14,14,28,.95)",
        border:     "1px solid rgba(255,255,255,.07)",
        boxShadow:  "0 4px 24px rgba(0,0,0,.35)",
      }}
      whileHover={{ y: -4, transition: { duration: 0.22 } }}
    >
      {/* ── poster ── */}
      <Link to={`/anime/${fav.animeId}`} className="relative block overflow-hidden flex-shrink-0">
        <div style={{ paddingBottom: "140%", position: "relative" }}>
          {!imgErr ? (
            <img
              src={fav.imageUrl}
              alt={fav.titleEnglish || fav.title}
              onError={() => setImgErr(true)}
              className="absolute inset-0 w-full h-full object-cover
                         transition-transform duration-500 group-hover:scale-105"
            />
          ) : (
            <div
              className="absolute inset-0 flex flex-col items-center justify-center gap-2"
              style={{ background: "rgba(99,102,241,.10)" }}
            >
              <Tv size={28} style={{ color: "rgba(99,102,241,.40)" }} />
              <span className="text-[10px]" style={{ color: "rgba(148,163,184,.40)" }}>
                No image
              </span>
            </div>
          )}
        </div>

        {/* gradient overlay */}
        <div
          className="absolute inset-0 pointer-events-none"
          style={{
            background:
              "linear-gradient(to top,rgba(8,8,20,.95) 0%,rgba(8,8,20,.40) 40%,transparent 70%)",
          }}
        />

        {/* score badge */}
        {sc && (
          <div
            className="absolute top-2 left-2 flex items-center gap-1 px-1.5 py-0.5 rounded-lg"
            style={{
              background: "rgba(0,0,0,.75)",
              border:     `1px solid ${scoreColor(sc)}44`,
              backdropFilter: "blur(6px)",
            }}
          >
            <Star size={9} style={{ color: scoreColor(sc), fill: scoreColor(sc) }} />
            <span className="text-[10px] font-black" style={{ color: scoreColor(sc) }}>
              {sc.toFixed(1)}
            </span>
          </div>
        )}

        {/* type badge */}
        {fav.type && (
          <div
            className="absolute top-2 right-2 px-1.5 py-0.5 rounded-lg text-[9px] font-bold uppercase"
            style={{
              background:     "rgba(0,0,0,.72)",
              color:          "rgba(165,180,252,.85)",
              border:         "1px solid rgba(99,102,241,.22)",
              backdropFilter: "blur(6px)",
            }}
          >
            {fav.type}
          </div>
        )}

        {/* remove button — appears on hover */}
        <div
          className="absolute bottom-2 right-2 opacity-0 group-hover:opacity-100
                     transition-opacity duration-200"
        >
          <RemoveBtn onClick={() => onRemove(fav.animeId)} />
        </div>
      </Link>

      {/* ── info ── */}
      <div className="flex flex-col gap-2 p-3 flex-1">
        <Link to={`/anime/${fav.animeId}`}>
          <h3
            className="text-sm font-bold leading-tight line-clamp-2 transition-colors"
            style={{ color: "#fff" }}
            onMouseEnter={e => { e.currentTarget.style.color = "#a5b4fc"; }}
            onMouseLeave={e => { e.currentTarget.style.color = "#fff";    }}
          >
            {fav.titleEnglish || fav.title}
          </h3>
        </Link>

        {/* genres */}
        {fav.genres?.length > 0 && (
          <div className="flex flex-wrap gap-1">
            {fav.genres.slice(0, 3).map((g) => (
              <GenrePill key={g} label={g} />
            ))}
          </div>
        )}

        {/* meta row */}
        <div className="flex items-center justify-between mt-auto pt-1">
          <div className="flex items-center gap-2">
            {/* status dot */}
            <span
              className="text-[9px] font-bold px-1.5 py-0.5 rounded-md"
              style={{ background: st.bg, color: st.color }}
            >
              {fav.status?.includes("Airing") && !fav.status.includes("Finished")
                ? "Airing"
                : fav.status?.includes("Finished")
                ? "Finished"
                : fav.status?.includes("Not")
                ? "Upcoming"
                : fav.type ?? "—"}
            </span>
            {fav.episodes && (
              <span className="text-[9px]" style={{ color: "rgba(148,163,184,.45)" }}>
                {fav.episodes} eps
              </span>
            )}
          </div>

          {/* always-visible remove on mobile */}
          <div className="block sm:hidden">
            <RemoveBtn onClick={() => onRemove(fav.animeId)} size={12} />
          </div>
        </div>
      </div>
    </motion.div>
  );
};

/* ══════════════════════════════════════════════════════════
   LIST ROW
══════════════════════════════════════════════════════════ */
const ListRow = ({ fav, index, onRemove }) => {
  const [imgErr, setImgErr] = useState(false);
  const sc = fav.score;
  const st = statusColor(fav.status);

  return (
    <motion.div
      layout
      initial={{ opacity: 0, x: -16 }}
      animate={{ opacity: 1,  x: 0  }}
      exit={{   opacity: 0,  x:  16 }}
      transition={{ delay: index * 0.03 }}
      className="group flex items-center gap-4 p-3 rounded-2xl transition-all"
      style={{
        background: "rgba(14,14,28,.90)",
        border:     "1px solid rgba(255,255,255,.06)",
      }}
      whileHover={{
        background: "rgba(99,102,241,.07)",
        borderColor: "rgba(99,102,241,.18)",
        transition: { duration: 0.18 },
      }}
    >
      {/* thumbnail */}
      <Link to={`/anime/${fav.animeId}`} className="flex-shrink-0">
        <div
          className="rounded-xl overflow-hidden"
          style={{ width: 52, height: 72 }}
        >
          {!imgErr ? (
            <img
              src={fav.imageUrl}
              alt={fav.titleEnglish || fav.title}
              onError={() => setImgErr(true)}
              className="w-full h-full object-cover transition-transform duration-300
                         group-hover:scale-105"
            />
          ) : (
            <div
              className="w-full h-full flex items-center justify-center"
              style={{ background: "rgba(99,102,241,.10)" }}
            >
              <Tv size={16} style={{ color: "rgba(99,102,241,.35)" }} />
            </div>
          )}
        </div>
      </Link>

      {/* main info */}
      <div className="flex-1 min-w-0">
        <Link to={`/anime/${fav.animeId}`}>
          <h3
            className="text-sm font-bold truncate mb-1 transition-colors"
            style={{ color: "#fff" }}
            onMouseEnter={e => { e.currentTarget.style.color = "#a5b4fc"; }}
            onMouseLeave={e => { e.currentTarget.style.color = "#fff";    }}
          >
            {fav.titleEnglish || fav.title}
          </h3>
        </Link>

        <div className="flex items-center gap-2 flex-wrap">
          {/* score */}
          {sc && (
            <span
              className="flex items-center gap-0.5 text-[10px] font-black"
              style={{ color: scoreColor(sc) }}
            >
              <Star size={9} style={{ fill: scoreColor(sc) }} />
              {sc.toFixed(1)}
            </span>
          )}

          {/* type */}
          {fav.type && (
            <span
              className="text-[9px] font-bold uppercase px-1.5 py-0.5 rounded-md"
              style={{
                background: "rgba(99,102,241,.12)",
                border:     "1px solid rgba(99,102,241,.20)",
                color:      "rgba(165,180,252,.70)",
              }}
            >
              {fav.type}
            </span>
          )}

          {/* episodes */}
          {fav.episodes && (
            <span className="text-[10px]" style={{ color: "rgba(148,163,184,.45)" }}>
              {fav.episodes} eps
            </span>
          )}

          {/* status */}
          <span
            className="text-[9px] font-bold px-1.5 py-0.5 rounded-md"
            style={{ background: st.bg, color: st.color }}
          >
            {fav.status?.replace("Currently ", "") ?? "—"}
          </span>
        </div>

        {/* genres */}
        {fav.genres?.length > 0 && (
          <div className="flex gap-1 mt-1.5 flex-wrap">
            {fav.genres.slice(0, 4).map((g) => (
              <GenrePill key={g} label={g} />
            ))}
          </div>
        )}
      </div>

      {/* remove */}
      <div className="flex-shrink-0">
        <RemoveBtn onClick={() => onRemove(fav.animeId)} />
      </div>
    </motion.div>
  );
};

/* ══════════════════════════════════════════════════════════
   EMPTY STATE
══════════════════════════════════════════════════════════ */
const EmptyState = ({ filtered }) => (
  <motion.div
    initial={{ opacity: 0, y: 20 }}
    animate={{ opacity: 1, y: 0 }}
    className="flex flex-col items-center justify-center py-28 text-center"
  >
    <div
      className="w-20 h-20 rounded-3xl flex items-center justify-center mb-5"
      style={{
        background: "rgba(99,102,241,.10)",
        border:     "1px solid rgba(99,102,241,.18)",
      }}
    >
      {filtered
        ? <Search size={32} style={{ color: "rgba(99,102,241,.50)" }} />
        : <Heart  size={32} style={{ color: "rgba(99,102,241,.50)" }} />
      }
    </div>

    <h2 className="text-xl font-black text-white mb-2">
      {filtered ? "No matches found" : "Your list is empty"}
    </h2>
    <p className="text-sm mb-8" style={{ color: "rgba(148,163,184,.55)", maxWidth: 300 }}>
      {filtered
        ? "Try a different search term or clear the filter."
        : "Start exploring anime and save the ones you love."}
    </p>

    {!filtered && (
      <Link
        to="/search"
        className="flex items-center gap-2 px-6 py-3 rounded-2xl font-bold text-sm
                   text-white transition-all hover:scale-105 active:scale-95"
        style={{
          background: "linear-gradient(135deg,#6366f1,#8b5cf6)",
          boxShadow:  "0 4px 20px rgba(99,102,241,.40)",
        }}
      >
        <Sparkles size={15} /> Browse Anime <ArrowRight size={15} />
      </Link>
    )}
  </motion.div>
);

/* ══════════════════════════════════════════════════════════
   NOT LOGGED IN
══════════════════════════════════════════════════════════ */
const NotLoggedIn = () => (
  <div
    className="min-h-screen flex items-center justify-center px-4"
    style={{ background: "#0a0a14" }}
  >
    <motion.div
      initial={{ opacity: 0, y: 24 }}
      animate={{ opacity: 1, y: 0 }}
      className="flex flex-col items-center text-center max-w-sm"
    >
      {/* icon */}
      <div
        className="w-24 h-24 rounded-3xl flex items-center justify-center mb-6 relative"
        style={{
          background: "linear-gradient(135deg,rgba(236,72,153,.18),rgba(99,102,241,.18))",
          border:     "1px solid rgba(236,72,153,.25)",
          boxShadow:  "0 0 60px rgba(236,72,153,.12)",
        }}
      >
        <Heart size={38} style={{ color: "#f9a8d4" }} />
        <motion.div
          className="absolute -top-1 -right-1 w-5 h-5 rounded-full flex items-center justify-center"
          style={{ background: "#ec4899", boxShadow: "0 0 10px #ec4899" }}
          animate={{ scale: [1, 1.25, 1] }}
          transition={{ repeat: Infinity, duration: 1.8 }}
        >
          <span className="text-white font-black" style={{ fontSize: 9 }}>?</span>
        </motion.div>
      </div>

      <h2 className="text-2xl font-black text-white mb-2">
        Sign in to see your favourites
      </h2>
      <p className="text-sm mb-8" style={{ color: "rgba(148,163,184,.55)" }}>
        Save anime you love and access your personal list from any device.
      </p>

      <div className="flex gap-3">
        <Link
          to="/login"
          className="px-6 py-3 rounded-2xl font-bold text-sm text-white transition-all
                     hover:scale-105 active:scale-95"
          style={{
            background: "linear-gradient(135deg,#6366f1,#8b5cf6)",
            boxShadow:  "0 4px 20px rgba(99,102,241,.40)",
          }}
        >
          Sign In
        </Link>
        <Link
          to="/register"
          className="px-6 py-3 rounded-2xl font-bold text-sm transition-all hover:scale-105"
          style={{
            background: "rgba(255,255,255,.06)",
            border:     "1px solid rgba(255,255,255,.10)",
            color:      "rgba(255,255,255,.70)",
          }}
        >
          Register
        </Link>
      </div>
    </motion.div>
  </div>
);

/* ══════════════════════════════════════════════════════════
   STAT CARD
══════════════════════════════════════════════════════════ */
const StatCard = ({ icon, label, value, color }) => (
  <div
    className="flex items-center gap-3 px-4 py-3 rounded-2xl flex-1 min-w-[120px]"
    style={{
      background: "rgba(14,14,28,.90)",
      border:     "1px solid rgba(255,255,255,.07)",
    }}
  >
    <div
      className="w-9 h-9 rounded-xl flex items-center justify-center flex-shrink-0"
      style={{ background: `${color}18`, border: `1px solid ${color}28` }}
    >
      <span style={{ color }}>{icon}</span>
    </div>
    <div className="min-w-0">
      <p className="text-lg font-black text-white leading-tight">{value}</p>
      <p className="text-[10px] font-semibold uppercase tracking-widest"
         style={{ color: "rgba(148,163,184,.45)" }}>
        {label}
      </p>
    </div>
  </div>
);

/* ══════════════════════════════════════════════════════════
   SORT OPTIONS
══════════════════════════════════════════════════════════ */
const SORT_OPTIONS = [
  { value: "recent",  label: "Recently Added" },
  { value: "score",   label: "Highest Score"  },
  { value: "title",   label: "A → Z"          },
  { value: "episodes", label: "Most Episodes" },
];

/* ══════════════════════════════════════════════════════════
   FAVORITES PAGE
══════════════════════════════════════════════════════════ */
const Favorites = () => {
  const { user }                     = useAuth();
  const { favorites, removeFavorite, favLoading } = useFavorites();

  const [search,    setSearch]    = useState("");
  const [viewMode,  setViewMode]  = useState("grid");   // "grid" | "list"
  const [sortBy,    setSortBy]    = useState("recent");
  const [removing,  setRemoving]  = useState(null);      // animeId being removed

  if (!user) return <NotLoggedIn />;

  /* ── filter + sort ── */
  const filtered = favorites
    .filter((f) => {
      const q = search.toLowerCase();
      return (
        (f.titleEnglish || f.title)?.toLowerCase().includes(q) ||
        f.genres?.some((g) => g.toLowerCase().includes(q))
      );
    })
    .sort((a, b) => {
      if (sortBy === "score")    return (b.score ?? 0)    - (a.score ?? 0);
      if (sortBy === "title")    return (a.titleEnglish || a.title).localeCompare(b.titleEnglish || b.title);
      if (sortBy === "episodes") return (b.episodes ?? 0) - (a.episodes ?? 0);
      return 0; // "recent" → keep backend order
    });

  /* ── stats ── */
  const avgScore = favorites.length
    ? (favorites.reduce((s, f) => s + (f.score ?? 0), 0) / favorites.filter(f => f.score).length).toFixed(1)
    : "—";
  const totalEps = favorites.reduce((s, f) => s + (f.episodes ?? 0), 0);
  const airingCount = favorites.filter(f => f.status?.includes("Airing") && !f.status.includes("Finished")).length;

  /* ── remove with optimistic loading state ── */
  const handleRemove = async (animeId) => {
    setRemoving(animeId);
    try {
      await removeFavorite(animeId);
    } finally {
      setRemoving(null);
    }
  };

  return (
    <div
      className="min-h-screen relative"
      style={{ background: "#0a0a14" }}
    >
      {/* background glow */}
      <div className="fixed inset-0 pointer-events-none">
        <div style={{
          position: "absolute", top: 0, left: "30%",
          width: 600, height: 400,
          background: "radial-gradient(ellipse,rgba(99,102,241,.07) 0%,transparent 70%)",
          filter: "blur(60px)",
        }} />
      </div>

      <div className="relative z-10 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10">

        {/* ════ HEADER ════ */}
        <motion.div
          initial={{ opacity: 0, y: -16 }}
          animate={{ opacity: 1,  y: 0  }}
          className="mb-8"
        >
          {/* top row */}
          <div className="flex items-start justify-between gap-4 mb-6">
            <div className="flex items-center gap-4">
              <div
                className="w-12 h-12 rounded-2xl flex items-center justify-center flex-shrink-0"
                style={{
                  background: "linear-gradient(135deg,rgba(236,72,153,.25),rgba(99,102,241,.25))",
                  border:     "1px solid rgba(236,72,153,.30)",
                  boxShadow:  "0 0 24px rgba(236,72,153,.15)",
                }}
              >
                <Heart size={22} style={{ color: "#f9a8d4" }} />
              </div>
              <div>
                <h1
                  className="font-black text-white leading-tight"
                  style={{ fontSize: "clamp(22px,4vw,32px)", letterSpacing: "-0.03em" }}
                >
                  My Favourites
                </h1>
                <p className="text-sm" style={{ color: "rgba(148,163,184,.50)" }}>
                  {favorites.length} anime in your collection
                </p>
              </div>
            </div>

            {/* view toggle */}
            <div
              className="hidden sm:flex items-center p-1 rounded-xl gap-1"
              style={{
                background: "rgba(255,255,255,.04)",
                border:     "1px solid rgba(255,255,255,.08)",
              }}
            >
              {[
                { mode: "grid", icon: <Grid3X3 size={15} /> },
                { mode: "list", icon: <List    size={15} /> },
              ].map(({ mode, icon }) => (
                <button
                  key={mode}
                  onClick={() => setViewMode(mode)}
                  className="p-2 rounded-lg transition-all"
                  style={{
                    background: viewMode === mode ? "rgba(99,102,241,.22)"          : "transparent",
                    color:      viewMode === mode ? "#a5b4fc"                        : "rgba(148,163,184,.45)",
                    border:     viewMode === mode ? "1px solid rgba(99,102,241,.30)" : "1px solid transparent",
                  }}
                >
                  {icon}
                </button>
              ))}
            </div>
          </div>

          {/* stats row */}
          {favorites.length > 0 && (
            <motion.div
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0  }}
              transition={{ delay: 0.1 }}
              className="flex flex-wrap gap-3 mb-6"
            >
              <StatCard
                icon={<BookMarked size={16} />}
                label="Total"
                value={favorites.length}
                color="#a5b4fc"
              />
              <StatCard
                icon={<Star size={16} />}
                label="Avg Score"
                value={avgScore}
                color="#fbbf24"
              />
              <StatCard
                icon={<Tv size={16} />}
                label="Episodes"
                value={totalEps.toLocaleString()}
                color="#60a5fa"
              />
              <StatCard
                icon={<TrendingUp size={16} />}
                label="Airing Now"
                value={airingCount}
                color="#4ade80"
              />
            </motion.div>
          )}

          {/* search + sort bar */}
          {favorites.length > 0 && (
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 0.15 }}
              className="flex flex-col sm:flex-row gap-3"
            >
              {/* search */}
              <div
                className="flex items-center gap-2.5 px-3.5 rounded-2xl flex-1"
                style={{
                  background: "rgba(255,255,255,.04)",
                  border:     "1px solid rgba(255,255,255,.08)",
                  height:     44,
                }}
              >
                <Search size={14} style={{ color: "rgba(148,163,184,.40)", flexShrink: 0 }} />
                <input
                  type="text"
                  value={search}
                  onChange={(e) => setSearch(e.target.value)}
                  placeholder="Search your favourites…"
                  className="flex-1 bg-transparent outline-none text-sm text-white min-w-0"
                  style={{ "::placeholder": { color: "rgba(148,163,184,.30)" } }}
                />
                <AnimatePresence>
                  {search && (
                    <motion.button
                      initial={{ opacity: 0, scale: 0.7 }}
                      animate={{ opacity: 1, scale: 1    }}
                      exit={{   opacity: 0, scale: 0.7   }}
                      onClick={() => setSearch("")}
                      className="flex-shrink-0 w-5 h-5 rounded-full flex items-center justify-center"
                      style={{ background: "rgba(255,255,255,.10)" }}
                    >
                      <X size={10} className="text-white" />
                    </motion.button>
                  )}
                </AnimatePresence>
              </div>

              {/* sort */}
              <div className="flex items-center gap-2">
                <SortAsc size={14} style={{ color: "rgba(148,163,184,.40)", flexShrink: 0 }} />
                <select
                  value={sortBy}
                  onChange={(e) => setSortBy(e.target.value)}
                  className="rounded-2xl text-sm font-semibold outline-none cursor-pointer px-3"
                  style={{
                    background: "rgba(255,255,255,.04)",
                    border:     "1px solid rgba(255,255,255,.08)",
                    color:      "rgba(255,255,255,.70)",
                    height:     44,
                  }}
                >
                  {SORT_OPTIONS.map((o) => (
                    <option key={o.value} value={o.value}
                            style={{ background: "#0f0f1a" }}>
                      {o.label}
                    </option>
                  ))}
                </select>
              </div>
            </motion.div>
          )}
        </motion.div>

        {/* ════ CONTENT ════ */}
        {favLoading ? (
          /* skeleton */
          <div className={
            viewMode === "grid"
              ? "grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-4"
              : "flex flex-col gap-3"
          }>
            {Array.from({ length: 10 }).map((_, i) => (
              <div
                key={i}
                className="rounded-2xl overflow-hidden"
                style={{
                  background: "rgba(255,255,255,.03)",
                  border:     "1px solid rgba(255,255,255,.06)",
                  height:     viewMode === "grid" ? 280 : 88,
                  animation:  "pulse 1.8s ease-in-out infinite",
                }}
              />
            ))}
            <style>{`@keyframes pulse{0%,100%{opacity:.4}50%{opacity:.8}}`}</style>
          </div>
        ) : filtered.length === 0 ? (
          <EmptyState filtered={search.length > 0} />
        ) : viewMode === "grid" ? (
          <motion.div
            layout
            className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-4"
          >
            <AnimatePresence mode="popLayout">
              {filtered.map((fav, i) => (
                <GridCard
                  key={fav._id ?? fav.animeId}
                  fav={{ ...fav, _removing: removing === fav.animeId }}
                  index={i}
                  onRemove={handleRemove}
                />
              ))}
            </AnimatePresence>
          </motion.div>
        ) : (
          <motion.div layout className="flex flex-col gap-2.5">
            <AnimatePresence mode="popLayout">
              {filtered.map((fav, i) => (
                <ListRow
                  key={fav._id ?? fav.animeId}
                  fav={fav}
                  index={i}
                  onRemove={handleRemove}
                />
              ))}
            </AnimatePresence>
          </motion.div>
        )}

        {/* result count when filtering */}
        {search && filtered.length > 0 && (
          <motion.p
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            className="text-center text-xs mt-6"
            style={{ color: "rgba(148,163,184,.38)" }}
          >
            Showing {filtered.length} of {favorites.length} favourites
          </motion.p>
        )}
      </div>
    </div>
  );
};

export default Favorites;