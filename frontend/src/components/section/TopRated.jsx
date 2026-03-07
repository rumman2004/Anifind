import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { motion, AnimatePresence } from "framer-motion";
import { Star, Trophy, TrendingUp, Crown, ChevronRight, LayoutGrid, List } from "lucide-react";
import { animeService } from "../../services/animeService";
import AnimeCard from "./AnimeCard";

/* ══════════════════════════════════════════════════════════
   SKELETON
══════════════════════════════════════════════════════════ */
const Pulse = ({ className, style }) => (
  <div
    className={`animate-pulse rounded-xl ${className}`}
    style={{ background: "rgba(255,255,255,.06)", ...style }}
  />
);

const CardSkeleton = () => (
  <div className="flex flex-col gap-2.5">
    <Pulse style={{ aspectRatio: "2/3", width: "100%" }} />
    <Pulse style={{ height: 12, width: "80%" }} />
    <Pulse style={{ height: 10, width: "50%" }} />
    <Pulse style={{ height: 10, width: "35%" }} />
  </div>
);

const RowSkeleton = () => (
  <div
    className="flex items-center gap-3 p-3 rounded-2xl"
    style={{ background: "rgba(255,255,255,.03)", border: "1px solid rgba(255,255,255,.06)" }}
  >
    <Pulse style={{ width: 36, height: 36, borderRadius: 10, flexShrink: 0 }} />
    <Pulse style={{ width: 40, height: 54, borderRadius: 10, flexShrink: 0 }} />
    <div className="flex-1 flex flex-col gap-2">
      <Pulse style={{ height: 12, width: "70%" }} />
      <Pulse style={{ height: 10, width: "40%" }} />
    </div>
    <Pulse style={{ width: 32, height: 18, borderRadius: 6, flexShrink: 0 }} />
  </div>
);

/* ══════════════════════════════════════════════════════════
   MEDAL CONFIG
══════════════════════════════════════════════════════════ */
const MEDAL = {
  0: {
    ring:  "rgba(251,191,36,1)",
    glow:  "rgba(251,191,36,.50)",
    bg:    "linear-gradient(135deg,#f59e0b,#d97706)",
    text:  "#fbbf24",
    badge: "rgba(251,191,36,.14)",
    bdr:   "rgba(251,191,36,.30)",
    icon:  <Crown size={9} className="fill-current" />,
  },
  1: {
    ring:  "rgba(148,163,184,1)",
    glow:  "rgba(148,163,184,.35)",
    bg:    "linear-gradient(135deg,#94a3b8,#64748b)",
    text:  "#cbd5e1",
    badge: "rgba(148,163,184,.12)",
    bdr:   "rgba(148,163,184,.28)",
    icon:  null,
  },
  2: {
    ring:  "rgba(180,120,60,1)",
    glow:  "rgba(180,120,60,.38)",
    bg:    "linear-gradient(135deg,#b47c3c,#92612e)",
    text:  "#d4a76a",
    badge: "rgba(180,120,60,.12)",
    bdr:   "rgba(180,120,60,.28)",
    icon:  null,
  },
};

const getMedal = (i) => MEDAL[i] ?? {
  ring:  "rgba(99,102,241,.65)",
  glow:  "rgba(99,102,241,.22)",
  bg:    "linear-gradient(135deg,#6366f1,#4f46e5)",
  text:  "#a5b4fc",
  badge: "rgba(99,102,241,.12)",
  bdr:   "rgba(99,102,241,.25)",
  icon:  null,
};

/* ══════════════════════════════════════════════════════════
   RANK BADGE  (overlaid on top of AnimeCard)
══════════════════════════════════════════════════════════ */
const RankBadge = ({ index }) => {
  const m = getMedal(index);
  return (
    <div
      className="absolute -top-2 -left-2 z-20 flex items-center gap-1 px-2 py-1 rounded-lg font-black shadow-lg"
      style={{
        background: m.bg,
        color: "#fff",
        fontSize: index < 3 ? 12 : 10,
        boxShadow: `0 2px 12px ${m.glow}`,
        letterSpacing: "-0.02em",
        border: "2px solid rgba(10,10,20,.6)",
      }}
    >
      {m.icon && <span className="flex-shrink-0">{m.icon}</span>}
      #{index + 1}
    </div>
  );
};

/* ══════════════════════════════════════════════════════════
   RANK GLOW RING  (border highlight for top 3)
══════════════════════════════════════════════════════════ */
const RankRing = ({ index }) => {
  const m = getMedal(index);
  if (index > 2) return null;
  return (
    <div
      className="absolute inset-0 rounded-2xl pointer-events-none z-10"
      style={{
        boxShadow: `0 0 0 2px ${m.ring}, 0 8px 32px ${m.glow}`,
      }}
    />
  );
};

/* ══════════════════════════════════════════════════════════
   LIST ROW
══════════════════════════════════════════════════════════ */
const TopAnimeRow = ({ anime, index }) => {
  const [imgErr, setImgErr] = useState(false);
  const [hovered, setHovered] = useState(false);
  const m     = getMedal(index);
  const title = anime.title_english || anime.title;
  const img   = anime.images?.jpg?.large_image_url || anime.images?.jpg?.image_url;

  return (
    <motion.div
      initial={{ opacity: 0, x: -14 }}
      animate={{ opacity: 1, x: 0 }}
      transition={{ delay: Math.min(index * 0.05, 0.45), duration: 0.32 }}
    >
      <Link
        to={`/anime/${anime.mal_id}`}
        onMouseEnter={() => setHovered(true)}
        onMouseLeave={() => setHovered(false)}
        className="flex items-center gap-3 p-3 sm:p-3.5 rounded-2xl transition-all duration-250 active:scale-[.99]"
        style={{
          background: hovered ? "rgba(255,255,255,.07)" : "rgba(255,255,255,.04)",
          border: `1px solid ${hovered ? m.bdr : "rgba(255,255,255,.07)"}`,
          transform: hovered ? "scale(1.012)" : "scale(1)",
        }}
      >
        {/* rank pill */}
        <div
          className="flex-shrink-0 w-8 h-8 sm:w-9 sm:h-9 rounded-xl flex items-center justify-center font-black text-white"
          style={{
            background: m.bg,
            fontSize: "clamp(11px,2vw,14px)",
            boxShadow: `0 2px 10px ${m.glow}`,
          }}
        >
          {m.icon ?? (index + 1)}
        </div>

        {/* thumbnail */}
        <div
          className="flex-shrink-0 rounded-xl overflow-hidden"
          style={{ width: 42, height: 56, border: "1px solid rgba(255,255,255,.08)" }}
        >
          {!imgErr ? (
            <img
              src={img}
              alt={title}
              className="w-full h-full object-cover transition-transform duration-400"
              style={{ transform: hovered ? "scale(1.08)" : "scale(1)" }}
              onError={() => setImgErr(true)}
            />
          ) : (
            <div
              className="w-full h-full flex items-center justify-center text-2xl"
              style={{ background: "rgba(255,255,255,.04)" }}
            >
              🎬
            </div>
          )}
        </div>

        {/* text */}
        <div className="flex-1 min-w-0">
          <p
            className="font-bold line-clamp-1 transition-colors duration-200"
            style={{
              fontSize: "clamp(11px,2vw,13px)",
              color: hovered ? "#a5b4fc" : "#fff",
            }}
          >
            {title}
          </p>
          <div className="flex items-center gap-2 mt-0.5 flex-wrap">
            {anime.type && (
              <span
                className="uppercase font-bold"
                style={{ fontSize: 9, color: "rgba(148,163,184,.48)" }}
              >
                {anime.type}
              </span>
            )}
            {anime.episodes && (
              <span style={{ fontSize: 9, color: "rgba(148,163,184,.38)" }}>
                {anime.episodes} eps
              </span>
            )}
            {anime.year && (
              <span style={{ fontSize: 9, color: "rgba(148,163,184,.30)" }}>
                {anime.year}
              </span>
            )}
          </div>
        </div>

        {/* score */}
        {anime.score && (
          <div className="flex-shrink-0 flex items-center gap-1">
            <Star size={10} className="text-yellow-400 fill-yellow-400" />
            <span className="text-white font-bold" style={{ fontSize: 12 }}>
              {anime.score.toFixed(1)}
            </span>
          </div>
        )}

        <ChevronRight
          size={13}
          className="flex-shrink-0 transition-transform duration-200"
          style={{
            color: "rgba(148,163,184,.28)",
            transform: hovered ? "translateX(2px)" : "translateX(0)",
          }}
        />
      </Link>
    </motion.div>
  );
};

/* ══════════════════════════════════════════════════════════
   SECTION DIVIDER LABEL
══════════════════════════════════════════════════════════ */
const Divider = ({ label }) => (
  <div className="flex items-center gap-3 mb-4 sm:mb-5">
    <span
      className="h-px flex-1"
      style={{ background: "rgba(255,255,255,.07)" }}
    />
    <span
      className="text-[10px] sm:text-xs uppercase tracking-widest font-semibold px-2"
      style={{ color: "rgba(148,163,184,.38)" }}
    >
      {label}
    </span>
    <span
      className="h-px flex-1"
      style={{ background: "rgba(255,255,255,.07)" }}
    />
  </div>
);

/* ══════════════════════════════════════════════════════════
   MAIN COMPONENT
══════════════════════════════════════════════════════════ */
const TopRated = () => {
  const [topAnime, setTopAnime] = useState([]);
  const [loading,  setLoading]  = useState(true);
  const [view,     setView]     = useState("grid");

  useEffect(() => {
    animeService.getTopAnime()
      .then(data => setTopAnime(data.data?.slice(0, 10) ?? []))
      .finally(() => setLoading(false));
  }, []);

  /* ── view toggle options ── */
  const VIEWS = [
    { key: "grid", label: "Grid", Icon: LayoutGrid },
    { key: "list", label: "List", Icon: List },
  ];

  return (
    <section className="relative w-full py-14 sm:py-20">

      {/* top accent line */}
      <div
        className="absolute top-0 left-1/2 -translate-x-1/2 w-px"
        style={{
          height: 80,
          background: "linear-gradient(to bottom, transparent, rgba(99,102,241,.28), transparent)",
        }}
      />

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">

        {/* ════ HEADER ════ */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-8 sm:mb-12">

          {/* left — icon + title */}
          <div className="flex items-center gap-3 sm:gap-4">
            <div
              className="w-10 h-10 sm:w-12 sm:h-12 rounded-2xl flex items-center justify-center flex-shrink-0"
              style={{
                background: "linear-gradient(135deg,rgba(251,191,36,.22),rgba(251,191,36,.06))",
                border: "1px solid rgba(251,191,36,.28)",
                boxShadow: "0 0 28px rgba(251,191,36,.14)",
              }}
            >
              <Trophy
                size={20}
                className="text-yellow-400"
                style={{ filter: "drop-shadow(0 0 8px rgba(251,191,36,.65))" }}
              />
            </div>

            <div>
              <div className="flex items-center gap-2 flex-wrap">
                <h2
                  className="font-black text-white"
                  style={{ fontSize: "clamp(18px,3vw,26px)", letterSpacing: "-0.025em" }}
                >
                  Top Rated
                </h2>
                <span
                  className="text-[10px] font-bold px-2 py-0.5 rounded-full"
                  style={{
                    background: "rgba(251,191,36,.13)",
                    color: "#fbbf24",
                    border: "1px solid rgba(251,191,36,.28)",
                  }}
                >
                  All-time
                </span>
              </div>
              <p
                className="mt-0.5 text-xs sm:text-sm"
                style={{ color: "rgba(148,163,184,.52)" }}
              >
                Highest rated anime of all time
              </p>
            </div>
          </div>

          {/* right — toggle + link */}
          <div className="flex items-center gap-2 sm:gap-3">

            {/* view toggle */}
            <div
              className="flex items-center p-1 rounded-xl gap-0.5"
              style={{
                background: "rgba(255,255,255,.05)",
                border: "1px solid rgba(255,255,255,.08)",
              }}
            >
              {VIEWS.map(({ key, label, Icon }) => (
                <button
                  key={key}
                  onClick={() => setView(key)}
                  className="flex items-center gap-1.5 px-2.5 sm:px-3 py-1.5 rounded-lg text-xs font-semibold transition-all"
                  style={{
                    background: view === key ? "rgba(99,102,241,.32)" : "transparent",
                    color:      view === key ? "#a5b4fc"              : "rgba(255,255,255,.32)",
                    border:     view === key ? "1px solid rgba(99,102,241,.28)" : "1px solid transparent",
                  }}
                >
                  <Icon size={12} />
                  <span className="hidden sm:inline">{label}</span>
                </button>
              ))}
            </div>

            {/* view all — desktop */}
            <Link
              to="/search?sort=score"
              className="hidden sm:flex items-center gap-1.5 text-xs sm:text-sm font-semibold px-3 sm:px-4 py-2 rounded-xl transition-all hover:scale-105 active:scale-95"
              style={{
                background: "rgba(99,102,241,.14)",
                color: "#a5b4fc",
                border: "1px solid rgba(99,102,241,.26)",
              }}
            >
              View All <TrendingUp size={13} />
            </Link>
          </div>
        </div>

        {/* ════ CONTENT ════ */}
        {loading ? (
          /* skeletons */
          view === "grid" ? (
            <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-3 sm:gap-4 lg:gap-5">
              {Array.from({ length: 10 }).map((_, i) => <CardSkeleton key={i} />)}
            </div>
          ) : (
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 sm:gap-2.5">
              {Array.from({ length: 10 }).map((_, i) => <RowSkeleton key={i} />)}
            </div>
          )
        ) : (
          <AnimatePresence mode="wait">

            {/* ── GRID VIEW  (uses AnimeCard + rank overlay) ── */}
            {view === "grid" && (
              <motion.div
                key="grid"
                initial={{ opacity: 0, y: 6 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -4 }}
                transition={{ duration: 0.22 }}
              >
                {/* Top 5 */}
                <Divider label="Top 5" />
                <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-3 sm:gap-4 lg:gap-5 mb-6 sm:mb-8">
                  {topAnime.slice(0, 5).map((anime, i) => (
                    <div key={anime.mal_id} className="relative">
                      {/* rank badge on top of card */}
                      <RankBadge  index={i} />
                      <RankRing   index={i} />
                      <AnimeCard  anime={anime} index={i} />
                    </div>
                  ))}
                </div>

                {/* #6 – #10 */}
                {topAnime.length > 5 && (
                  <>
                    <Divider label="#6 – #10" />
                    <div
                      className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-3 sm:gap-4 lg:gap-5"
                      style={{ opacity: 0.85 }}
                    >
                      {topAnime.slice(5).map((anime, i) => (
                        <div key={anime.mal_id} className="relative">
                          <RankBadge index={i + 5} />
                          <AnimeCard anime={anime} index={i + 5} />
                        </div>
                      ))}
                    </div>
                  </>
                )}
              </motion.div>
            )}

            {/* ── LIST VIEW ── */}
            {view === "list" && (
              <motion.div
                key="list"
                initial={{ opacity: 0, y: 6 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -4 }}
                transition={{ duration: 0.22 }}
                className="grid grid-cols-1 sm:grid-cols-2 gap-2 sm:gap-2.5"
              >
                {topAnime.map((anime, i) => (
                  <TopAnimeRow key={anime.mal_id} anime={anime} index={i} />
                ))}
              </motion.div>
            )}

          </AnimatePresence>
        )}

        {/* view-all — mobile */}
        <div className="mt-8 flex justify-center sm:hidden">
          <Link
            to="/search?sort=score"
            className="flex items-center gap-2 text-sm font-semibold px-6 py-2.5 rounded-xl transition-all hover:scale-105 active:scale-95"
            style={{
              background: "rgba(99,102,241,.14)",
              color: "#a5b4fc",
              border: "1px solid rgba(99,102,241,.26)",
            }}
          >
            View All Rankings <TrendingUp size={14} />
          </Link>
        </div>

        {/* bottom decorative line */}
        <div
          className="mt-12 sm:mt-16"
          style={{
            height: 1,
            background: "linear-gradient(to right, transparent, rgba(99,102,241,.28), rgba(251,191,36,.18), transparent)",
          }}
        />
      </div>
    </section>
  );
};

export default TopRated;