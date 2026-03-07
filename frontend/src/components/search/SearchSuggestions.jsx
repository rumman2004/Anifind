// SearchSuggestions.jsx
import { useRef, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Star, Tv, Search, TrendingUp, ChevronRight } from "lucide-react";

/* ── score colour helper ── */
const scoreColor = (s) =>
  !s       ? "rgba(148,163,184,.5)" :
  s >= 8.5 ? "#fbbf24" :
  s >= 7.5 ? "#a3e635" :
  s >= 6.5 ? "#60a5fa" :
             "rgba(148,163,184,.6)";

/* ── status dot ── */
const StatusDot = ({ status }) => {
  if (status !== "Currently Airing") return null;
  return (
    <span
      className="w-1.5 h-1.5 rounded-full flex-shrink-0"
      style={{ background: "#4ade80", boxShadow: "0 0 4px #4ade80" }}
    />
  );
};

/* ══════════════════════════════════════════════════════════
   SUGGESTION ITEM
══════════════════════════════════════════════════════════ */
const SuggestionItem = ({ anime, selected, onSelect, onHover, index }) => {
  const ref     = useRef(null);
  const img     = anime.images?.jpg?.large_image_url || anime.images?.jpg?.image_url;
  const title   = anime.title_english || anime.title;
  const sc      = anime.score;

  /* scroll selected item into view */
  useEffect(() => {
    if (selected) ref.current?.scrollIntoView({ block: "nearest", behavior: "smooth" });
  }, [selected]);

  return (
    <motion.li
      ref={ref}
      initial={{ opacity: 0, x: -8 }}
      animate={{ opacity: 1, x: 0 }}
      transition={{ delay: index * 0.03, duration: 0.2 }}
    >
      <button
        onMouseDown={(e) => { e.preventDefault(); onSelect(anime); }}
        onMouseEnter={() => onHover(index)}
        className="w-full flex items-center gap-3 px-3.5 py-2.5 text-left
                   transition-all duration-150 group relative"
        style={{
          background: selected ? "rgba(99,102,241,.12)" : "transparent",
          borderLeft: selected
            ? "2px solid rgba(99,102,241,.55)"
            : "2px solid transparent",
        }}
      >
        {/* thumbnail */}
        <div
          className="flex-shrink-0 rounded-xl overflow-hidden"
          style={{
            width: 38, height: 52,
            background: "rgba(255,255,255,.06)",
            border: "1px solid rgba(255,255,255,.08)",
            boxShadow: selected ? "0 0 0 2px rgba(99,102,241,.30)" : "none",
          }}
        >
          {img ? (
            <img
              src={img} alt={title}
              className="w-full h-full object-cover transition-transform duration-300"
              style={{ transform: selected ? "scale(1.05)" : "scale(1)" }}
            />
          ) : (
            <div className="w-full h-full flex items-center justify-center">
              <Tv size={14} style={{ color: "rgba(148,163,184,.30)" }} />
            </div>
          )}
        </div>

        {/* text */}
        <div className="flex-1 min-w-0">
          <p
            className="text-sm font-semibold leading-tight truncate transition-colors duration-150"
            style={{ color: selected ? "#a5b4fc" : "#fff" }}
          >
            {title}
          </p>

          {/* original title (if differs) */}
          {anime.title_english && anime.title !== anime.title_english && (
            <p className="text-[10px] truncate mt-0.5" style={{ color: "rgba(148,163,184,.38)" }}>
              {anime.title}
            </p>
          )}

          {/* meta row */}
          <div className="flex items-center gap-1.5 mt-1 flex-wrap">
            {/* score */}
            {sc && (
              <span
                className="flex items-center gap-0.5 text-[10px] font-bold"
                style={{ color: scoreColor(sc) }}
              >
                <Star size={8} style={{ fill: scoreColor(sc) }} />
                {sc.toFixed(1)}
              </span>
            )}

            {/* type badge */}
            {anime.type && (
              <span
                className="text-[9px] font-bold uppercase px-1.5 py-0.5 rounded-md"
                style={{
                  background: "rgba(99,102,241,.12)",
                  border: "1px solid rgba(99,102,241,.20)",
                  color: "rgba(165,180,252,.70)",
                }}
              >
                {anime.type}
              </span>
            )}

            {/* episodes */}
            {anime.episodes && (
              <span className="text-[9px]" style={{ color: "rgba(148,163,184,.38)" }}>
                {anime.episodes} eps
              </span>
            )}

            {/* year */}
            {anime.year && (
              <span className="text-[9px]" style={{ color: "rgba(148,163,184,.30)" }}>
                {anime.year}
              </span>
            )}

            {/* airing dot */}
            <StatusDot status={anime.status} />
          </div>
        </div>

        {/* chevron */}
        <ChevronRight
          size={12}
          className="flex-shrink-0 transition-all duration-150"
          style={{
            color: selected ? "rgba(99,102,241,.70)" : "rgba(148,163,184,.20)",
            transform: selected ? "translateX(2px)" : "translateX(0)",
          }}
        />
      </button>
    </motion.li>
  );
};

/* ══════════════════════════════════════════════════════════
   MAIN COMPONENT
══════════════════════════════════════════════════════════ */
const SearchSuggestions = ({
  suggestions,
  loading,
  visible,
  onSelect,
  onSearchAll,
  query,
  selectedIndex,
  onHoverIndex,
}) => {
  return (
    <AnimatePresence>
      {visible && (
        <motion.div
          initial={{ opacity: 0, y: -4, scaleY: 0.96 }}
          animate={{ opacity: 1, y: 0,  scaleY: 1    }}
          exit={{ opacity: 0,  y: -4, scaleY: 0.96  }}
          transition={{ duration: 0.18, ease: "easeOut" }}
          className="absolute left-0 right-0 z-50 overflow-hidden"
          style={{
            top: "100%",
            background: "rgba(10,10,22,.97)",
            border: "1px solid rgba(99,102,241,.20)",
            borderTop: "none",
            borderRadius: "0 0 16px 16px",
            boxShadow: "0 16px 48px rgba(0,0,0,.60), 0 4px 16px rgba(99,102,241,.10)",
            transformOrigin: "top",
          }}
        >
          {/* ── loading ── */}
          {loading && (
            <div className="flex items-center gap-2.5 px-4 py-4">
              <div
                className="w-4 h-4 rounded-full border-2 border-transparent flex-shrink-0"
                style={{
                  borderTopColor: "#a5b4fc",
                  animation: "spin 0.7s linear infinite",
                }}
              />
              <span className="text-xs" style={{ color: "rgba(148,163,184,.55)" }}>
                Searching for <span style={{ color: "#a5b4fc" }}>"{query}"</span>…
              </span>
            </div>
          )}

          {/* ── no results ── */}
          {!loading && suggestions.length === 0 && (
            <div className="flex flex-col items-center gap-2 py-8 px-4">
              <Search size={22} style={{ color: "rgba(99,102,241,.30)" }} />
              <p className="text-xs text-center" style={{ color: "rgba(148,163,184,.50)" }}>
                No results for{" "}
                <span className="font-semibold" style={{ color: "rgba(165,180,252,.70)" }}>
                  "{query}"
                </span>
              </p>
              <button
                onMouseDown={(e) => { e.preventDefault(); onSearchAll(); }}
                className="flex items-center gap-1.5 text-[10px] font-semibold px-3 py-1.5
                           rounded-lg transition-all hover:scale-105 mt-1"
                style={{
                  background: "rgba(99,102,241,.14)",
                  color: "#a5b4fc",
                  border: "1px solid rgba(99,102,241,.24)",
                }}
              >
                <Search size={9} /> Full search for "{query}"
              </button>
            </div>
          )}

          {/* ── results ── */}
          {!loading && suggestions.length > 0 && (
            <>
              {/* header */}
              <div
                className="flex items-center justify-between px-3.5 pt-2.5 pb-1.5"
                style={{ borderBottom: "1px solid rgba(255,255,255,.05)" }}
              >
                <div className="flex items-center gap-1.5">
                  <TrendingUp size={10} style={{ color: "rgba(99,102,241,.60)" }} />
                  <span
                    className="text-[9px] uppercase tracking-widest font-bold"
                    style={{ color: "rgba(148,163,184,.38)" }}
                  >
                    Top matches
                  </span>
                </div>
                <span className="text-[9px]" style={{ color: "rgba(148,163,184,.30)" }}>
                  {suggestions.length} found
                </span>
              </div>

              {/* list */}
              <ul className="overflow-y-auto" style={{ maxHeight: 340, scrollbarWidth: "none" }}>
                {suggestions.map((anime, i) => (
                  <SuggestionItem
                    key={anime.mal_id}
                    anime={anime}
                    index={i}
                    selected={i === selectedIndex}
                    onSelect={onSelect}
                    onHover={onHoverIndex}
                  />
                ))}
              </ul>

              {/* footer — "see all results" */}
              <button
                onMouseDown={(e) => { e.preventDefault(); onSearchAll(); }}
                className="w-full flex items-center justify-center gap-2 py-2.5 text-xs font-semibold
                           transition-all hover:brightness-125 group"
                style={{
                  background: "rgba(99,102,241,.08)",
                  borderTop: "1px solid rgba(99,102,241,.14)",
                  color: "rgba(165,180,252,.70)",
                }}
              >
                <Search size={11} />
                See all results for{" "}
                <span className="font-black" style={{ color: "#a5b4fc" }}>"{query}"</span>
                <ChevronRight
                  size={12}
                  className="transition-transform duration-200 group-hover:translate-x-0.5"
                />
              </button>
            </>
          )}

          <style>{`@keyframes spin { to { transform: rotate(360deg); } }`}</style>
        </motion.div>
      )}
    </AnimatePresence>
  );
};

export default SearchSuggestions;