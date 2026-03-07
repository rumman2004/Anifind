import { useState } from "react";
import { Link } from "react-router-dom";
import { motion, AnimatePresence } from "framer-motion";
import { Heart, Star, Play, Tv, Plus, Check } from "lucide-react";
import { useFavorites } from "../../context/FavoritesContext";
import { useAuth } from "../../context/AuthContext";
import { truncateText, formatScore } from "../../utils/helpers";

/* ══════════════════════════════════════════════════════════
   DESIGN TOKENS
══════════════════════════════════════════════════════════ */
const CARD_BG     = "#0f0f1c";
const CARD_BG_2   = "#13132a";
const INDIGO      = "#a5b4fc";
const INDIGO_DARK = "rgba(99,102,241,.85)";

/* ══════════════════════════════════════════════════════════
   STATUS CONFIG
══════════════════════════════════════════════════════════ */
const STATUS_CFG = {
  "Currently Airing": { dot: "#4ade80", label: "Airing",   color: "#4ade80" },
  "Finished Airing":  { dot: null,      label: "Finished", color: "rgba(148,163,184,.55)" },
  "Not yet aired":    { dot: "#fb923c", label: "Upcoming", color: "#fb923c" },
};

const getStatus = (s) => STATUS_CFG[s] ?? { dot: null, label: s, color: "rgba(148,163,184,.45)" };

/* ══════════════════════════════════════════════════════════
   SCORE COLOUR
══════════════════════════════════════════════════════════ */
const scoreColor = (s) =>
  !s       ? "rgba(148,163,184,.5)" :
  s >= 8.5 ? "#fbbf24" :
  s >= 7.5 ? "#a3e635" :
  s >= 6.5 ? "#60a5fa" :
             "rgba(148,163,184,.6)";

/* ══════════════════════════════════════════════════════════
   ANIME CARD
══════════════════════════════════════════════════════════ */
const AnimeCard = ({ anime, index = 0 }) => {
  const { user }                                    = useAuth();
  const { isFavorite, addFavorite, removeFavorite } = useFavorites();

  const [imgError,  setImgError]  = useState(false);
  const [toggling,  setToggling]  = useState(false);
  const [hovered,   setHovered]   = useState(false);
  const [favAnim,   setFavAnim]   = useState(false);

  const favorited = isFavorite(anime.mal_id);
  const img       = anime.images?.jpg?.large_image_url || anime.images?.jpg?.image_url;
  const title     = anime.title_english || anime.title;
  const status    = getStatus(anime.status);
  const sc        = typeof anime.score === "number" ? anime.score : null;

  const handleFav = async (e) => {
    e.preventDefault();
    e.stopPropagation();
    if (!user || toggling) return;
    setToggling(true);
    setFavAnim(true);
    try {
      favorited ? await removeFavorite(anime.mal_id) : await addFavorite(anime);
    } finally {
      setToggling(false);
      setTimeout(() => setFavAnim(false), 600);
    }
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: Math.min(index * 0.05, 0.4), duration: 0.35, ease: "easeOut" }}
      onMouseEnter={() => setHovered(true)}
      onMouseLeave={() => setHovered(false)}
      className="group relative flex flex-col"
      style={{ willChange: "transform" }}
    >
      <Link to={`/anime/${anime.mal_id}`} className="block flex-1">

        {/* ── CARD SHELL ── */}
        <div
          className="relative flex flex-col h-full rounded-2xl overflow-hidden transition-all duration-350"
          style={{
            background: CARD_BG,
            border: hovered
              ? "1px solid rgba(99,102,241,.40)"
              : "1px solid rgba(255,255,255,.06)",
            boxShadow: hovered
              ? "0 20px 60px rgba(0,0,0,.60), 0 0 0 1px rgba(99,102,241,.20)"
              : "0 4px 20px rgba(0,0,0,.40)",
            transform: hovered ? "translateY(-5px) scale(1.012)" : "translateY(0) scale(1)",
          }}
        >

          {/* ════════════════ POSTER ════════════════ */}
          <div className="relative overflow-hidden" style={{ aspectRatio: "2/3" }}>

            {/* image */}
            {!imgError ? (
              <img
                src={img}
                alt={title}
                className="w-full h-full object-cover"
                style={{
                  transform: hovered ? "scale(1.08)" : "scale(1)",
                  transition: "transform .55s cubic-bezier(.4,0,.2,1)",
                }}
                onError={() => setImgError(true)}
                loading="lazy"
              />
            ) : (
              <div
                className="w-full h-full flex flex-col items-center justify-center gap-2"
                style={{ background: CARD_BG_2 }}
              >
                <Tv size={32} style={{ color: "rgba(148,163,184,.20)" }} />
                <p className="text-[10px]" style={{ color: "rgba(148,163,184,.25)" }}>No image</p>
              </div>
            )}

            {/* gradient overlays */}
            <div
              className="absolute inset-0 pointer-events-none"
              style={{
                background: "linear-gradient(to top, rgba(15,15,28,1) 0%, rgba(15,15,28,.50) 35%, transparent 70%)",
              }}
            />
            <div
              className="absolute inset-0 pointer-events-none transition-opacity duration-300"
              style={{
                background: "linear-gradient(to bottom, rgba(0,0,0,.30) 0%, transparent 35%)",
                opacity: hovered ? 1 : 0,
              }}
            />

            {/* ── TOP LEFT: score ── */}
            <div
              className="absolute top-2.5 left-2.5 flex items-center gap-1 px-2 py-1 rounded-lg"
              style={{
                background: "rgba(0,0,0,.72)",
                backdropFilter: "blur(6px)",
                border: "1px solid rgba(255,255,255,.08)",
              }}
            >
              <Star size={9} style={{ color: scoreColor(sc), fill: sc ? scoreColor(sc) : "none" }} />
              <span
                className="font-bold leading-none"
                style={{ fontSize: 11, color: sc ? scoreColor(sc) : "rgba(148,163,184,.5)" }}
              >
                {sc ? sc.toFixed(1) : "N/A"}
              </span>
            </div>

            {/* ── TOP RIGHT: favorite ── */}
            {user && (
              <button
                onClick={handleFav}
                disabled={toggling}
                className="absolute top-2.5 right-2.5 flex items-center justify-center rounded-xl transition-all duration-200 hover:scale-110 active:scale-90"
                style={{
                  width: 32,
                  height: 32,
                  background: favorited
                    ? "rgba(236,72,153,.25)"
                    : "rgba(0,0,0,.65)",
                  backdropFilter: "blur(6px)",
                  border: favorited
                    ? "1px solid rgba(236,72,153,.45)"
                    : "1px solid rgba(255,255,255,.10)",
                }}
                aria-label={favorited ? "Remove from favorites" : "Add to favorites"}
              >
                <AnimatePresence mode="wait">
                  <motion.span
                    key={favorited ? "fav" : "unfav"}
                    initial={{ scale: 0.5, opacity: 0 }}
                    animate={{ scale: 1, opacity: 1 }}
                    exit={{ scale: 0.5, opacity: 0 }}
                    transition={{ duration: 0.18 }}
                  >
                    {favorited ? (
                      <Heart size={13} style={{ color: "#ec4899", fill: "#ec4899" }} />
                    ) : (
                      <Heart size={13} style={{ color: "rgba(255,255,255,.70)" }} />
                    )}
                  </motion.span>
                </AnimatePresence>

                {/* ripple on click */}
                <AnimatePresence>
                  {favAnim && (
                    <motion.span
                      className="absolute inset-0 rounded-xl"
                      initial={{ opacity: 0.6, scale: 1 }}
                      animate={{ opacity: 0, scale: 2.2 }}
                      exit={{ opacity: 0 }}
                      transition={{ duration: 0.55 }}
                      style={{ background: "rgba(236,72,153,.35)", pointerEvents: "none" }}
                    />
                  )}
                </AnimatePresence>
              </button>
            )}

            {/* ── BOTTOM LEFT: type badge ── */}
            {anime.type && (
              <div
                className="absolute bottom-2.5 left-2.5 px-2 py-0.5 rounded-lg font-bold uppercase"
                style={{
                  background: "rgba(99,102,241,.22)",
                  border: "1px solid rgba(99,102,241,.35)",
                  color: INDIGO,
                  fontSize: 9,
                  backdropFilter: "blur(4px)",
                }}
              >
                {anime.type}
              </div>
            )}

            {/* ── HOVER CENTRE: play button ── */}
            <div
              className="absolute inset-0 flex items-center justify-center pointer-events-none"
              style={{
                opacity: hovered ? 1 : 0,
                transition: "opacity .25s ease",
              }}
            >
              <motion.div
                animate={{ scale: hovered ? 1 : 0.75 }}
                transition={{ type: "spring", stiffness: 320, damping: 22 }}
                className="flex items-center justify-center rounded-full"
                style={{
                  width: 44,
                  height: 44,
                  background: INDIGO_DARK,
                  boxShadow: "0 4px 24px rgba(99,102,241,.55)",
                }}
              >
                <Play size={17} className="text-white fill-white ml-0.5" />
              </motion.div>
            </div>

          </div>
          {/* ════════ END POSTER ════════ */}

          {/* ════════════════ INFO ════════════════ */}
          <div className="flex flex-col gap-1.5 p-3">

            {/* title */}
            <h3
              className="text-white font-bold leading-tight line-clamp-2 transition-colors duration-200"
              style={{
                fontSize: "clamp(11px,2.2vw,13px)",
                color: hovered ? INDIGO : "#fff",
              }}
            >
              {title}
            </h3>

            {/* original title (if different) */}
            {anime.title_english && anime.title !== anime.title_english && (
              <p
                className="line-clamp-1"
                style={{ fontSize: 10, color: "rgba(148,163,184,.40)" }}
              >
                {anime.title}
              </p>
            )}

            {/* meta row */}
            <div
              className="flex items-center gap-1.5 flex-wrap mt-0.5"
              style={{ fontSize: 10, color: "rgba(148,163,184,.55)" }}
            >
              {/* episodes */}
              {anime.episodes && (
                <span
                  className="flex items-center gap-1 px-1.5 py-0.5 rounded-md"
                  style={{ background: "rgba(255,255,255,.05)", border: "1px solid rgba(255,255,255,.07)" }}
                >
                  {anime.episodes} ep{anime.episodes !== 1 ? "s" : ""}
                </span>
              )}

              {/* status */}
              {anime.status && (
                <span className="flex items-center gap-1" style={{ color: status.color }}>
                  {status.dot && (
                    <span
                      className="w-1.5 h-1.5 rounded-full flex-shrink-0"
                      style={{
                        background: status.dot,
                        boxShadow: `0 0 4px ${status.dot}`,
                        ...(anime.status === "Currently Airing" ? { animation: "pulse 1.8s infinite" } : {}),
                      }}
                    />
                  )}
                  {status.label}
                </span>
              )}

              {/* year */}
              {anime.year && (
                <span style={{ color: "rgba(148,163,184,.40)" }}>
                  {anime.year}
                </span>
              )}
            </div>

            {/* genre pills (1–2 max) */}
            {anime.genres?.length > 0 && (
              <div className="flex flex-wrap gap-1 mt-0.5">
                {anime.genres.slice(0, 2).map(g => (
                  <span
                    key={g.mal_id}
                    className="px-1.5 py-0.5 rounded-md"
                    style={{
                      fontSize: 9,
                      background: "rgba(99,102,241,.10)",
                      border: "1px solid rgba(99,102,241,.20)",
                      color: "rgba(165,180,252,.70)",
                    }}
                  >
                    {g.name}
                  </span>
                ))}
                {anime.genres.length > 2 && (
                  <span
                    className="px-1.5 py-0.5 rounded-md"
                    style={{
                      fontSize: 9,
                      background: "rgba(255,255,255,.05)",
                      color: "rgba(148,163,184,.40)",
                    }}
                  >
                    +{anime.genres.length - 2}
                  </span>
                )}
              </div>
            )}

          </div>
          {/* ════════ END INFO ════════ */}

          {/* bottom accent line */}
          <div
            className="absolute bottom-0 left-0 right-0 h-0.5 rounded-b-2xl transition-all duration-400"
            style={{
              background: hovered
                ? "linear-gradient(to right, #6366f1, #a855f7)"
                : "transparent",
            }}
          />

        </div>
        {/* ── END CARD SHELL ── */}

      </Link>
    </motion.div>
  );
};

export default AnimeCard;