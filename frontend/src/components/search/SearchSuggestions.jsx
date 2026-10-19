// SearchSuggestions.jsx
import { useRef, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Star, Tv, Search, TrendingUp, ChevronRight } from "lucide-react";

/* ── tokens ── */
const ACCENT = "var(--accent-glow, #a5b4fc)";
const DIM = "var(--text-subtle, rgba(148,163,184,.42))";

/* ── helpers ── */
const scoreColor = (s) =>
  !s ? "rgba(148,163,184,.5)"
  : s >= 8.5 ? "#fbbf24"
  : s >= 7.5 ? "#a3e635"
  : s >= 6.5 ? "#60a5fa"
  : "rgba(148,163,184,.6)";

const escapeRe = (s) => s.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");

/** Bolds the part of the title that matches the query. */
const Highlight = ({ text, query }) => {
  const q = query?.trim();
  if (!q) return text;
  const parts = text.split(new RegExp(`(${escapeRe(q)})`, "ig"));
  return parts.map((p, i) =>
    i % 2 === 1 ? (
      <mark key={i} style={{ background: "transparent", color: "var(--text-link, #c7d2fe)", fontWeight: 800 }}>
        {p}
      </mark>
    ) : (
      <span key={i}>{p}</span>
    )
  );
};

const Kbd = ({ children }) => (
  <kbd
    className="px-1.5 py-0.5 rounded text-[9px] font-semibold"
    style={{
      background: "var(--nav-btn-bg, rgba(255,255,255,.07))",
      border: "1px solid var(--border-subtle, rgba(255,255,255,.10))",
      color: "var(--text-muted, rgba(148,163,184,.7))",
    }}
  >
    {children}
  </kbd>
);

/* ══════════════════════════════════════════════════════════
   SUGGESTION ITEM
══════════════════════════════════════════════════════════ */
const SuggestionItem = ({ anime, selected, onSelect, onHover, index, query }) => {
  const ref = useRef(null);
  const img = anime.images?.jpg?.large_image_url || anime.images?.jpg?.image_url;
  const title = anime.title_english || anime.title;
  const sc = anime.score;

  useEffect(() => {
    if (selected) ref.current?.scrollIntoView({ block: "nearest" });
  }, [selected]);

  return (
    <motion.li
      ref={ref}
      role="option"
      aria-selected={selected}
      initial={{ opacity: 0, x: -6 }}
      animate={{ opacity: 1, x: 0 }}
      transition={{ delay: Math.min(index * 0.025, 0.2), duration: 0.18 }}
    >
      <button
        type="button"
        onMouseDown={(e) => {
          e.preventDefault();
          onSelect(anime);
        }}
        onMouseEnter={() => onHover(index)}
        className="w-full flex items-center gap-3 px-3.5 py-2.5 text-left transition-colors duration-150"
        style={{
          background: selected ? "var(--nav-link-active-bg, rgba(99,102,241,.13))" : "transparent",
          borderLeft: selected ? "2px solid var(--accent-glow, rgba(129,140,248,.8))" : "2px solid transparent",
        }}
      >
        {/* thumbnail */}
        <div
          className="flex-shrink-0 rounded-lg overflow-hidden"
          style={{
            width: 40,
            height: 56,
            background: "var(--nav-btn-bg, rgba(255,255,255,.06))",
            border: "1px solid var(--border-subtle, rgba(255,255,255,.08))",
          }}
        >
          {img ? (
            <img
              src={img}
              alt=""
              loading="lazy"
              className="w-full h-full object-cover transition-transform duration-300"
              style={{ transform: selected ? "scale(1.06)" : "scale(1)" }}
            />
          ) : (
            <div className="w-full h-full flex items-center justify-center">
              <Tv size={14} style={{ color: "var(--text-subtle, rgba(148,163,184,.3))" }} />
            </div>
          )}
        </div>

        {/* text */}
        <div className="flex-1 min-w-0">
          <p
            className="text-sm font-semibold leading-tight truncate transition-colors duration-150"
            style={{ color: selected ? ACCENT : "var(--text-heading, #fff)" }}
          >
            <Highlight text={title} query={query} />
          </p>

          {anime.title_english && anime.title !== anime.title_english && (
            <p className="text-[10px] truncate mt-0.5" style={{ color: DIM }}>
              {anime.title}
            </p>
          )}

          <div className="flex items-center gap-2 mt-1.5 flex-wrap">
            {sc && (
              <span
                className="flex items-center gap-0.5 text-[10px] font-bold"
                style={{ color: scoreColor(sc) }}
              >
                <Star size={9} style={{ fill: scoreColor(sc) }} />
                {sc.toFixed(1)}
              </span>
            )}

            {anime.type && (
              <span
                className="text-[9px] font-bold uppercase px-1.5 py-0.5 rounded-md"
                style={{
                  background: "rgba(99,102,241,.12)",
                  border: "1px solid rgba(99,102,241,.20)",
                  color: "rgba(165,180,252,.75)",
                }}
              >
                {anime.type}
              </span>
            )}

            {anime.episodes && (
              <span className="text-[10px]" style={{ color: DIM }}>
                {anime.episodes} eps
              </span>
            )}

            {anime.year && (
              <span className="text-[10px]" style={{ color: "rgba(148,163,184,.32)" }}>
                {anime.year}
              </span>
            )}

            {anime.status === "Currently Airing" && (
              <span
                className="flex items-center gap-1 text-[9px] font-semibold"
                style={{ color: "#4ade80" }}
              >
                <span
                  className="w-1.5 h-1.5 rounded-full"
                  style={{ background: "#4ade80", boxShadow: "0 0 4px #4ade80" }}
                />
                Airing
              </span>
            )}
          </div>
        </div>

        <ChevronRight
          size={13}
          className="flex-shrink-0 transition-all duration-150"
          style={{
            color: selected ? "rgba(129,140,248,.85)" : "rgba(148,163,184,.2)",
            transform: selected ? "translateX(2px)" : "translateX(0)",
          }}
        />
      </button>
    </motion.li>
  );
};

/* ── loading skeleton row ── */
const SkeletonRow = () => (
  <div className="flex items-center gap-3 px-3.5 py-2.5 animate-pulse">
    <div className="rounded-lg flex-shrink-0" style={{ width: 40, height: 56, background: "rgba(255,255,255,.06)" }} />
    <div className="flex-1 space-y-2">
      <div className="h-3 rounded" style={{ width: "62%", background: "rgba(255,255,255,.08)" }} />
      <div className="h-2 rounded" style={{ width: "38%", background: "rgba(255,255,255,.05)" }} />
    </div>
  </div>
);

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
          initial={{ opacity: 0, y: -4, scaleY: 0.97 }}
          animate={{ opacity: 1, y: 0, scaleY: 1 }}
          exit={{ opacity: 0, y: -4, scaleY: 0.97 }}
          transition={{ duration: 0.16, ease: "easeOut" }}
          className="absolute left-0 right-0 z-50 overflow-hidden"
          style={{
            top: "100%",
            background: "var(--nav-dropdown-bg, rgba(10,10,22,.98))",
            backdropFilter: "blur(12px)",
            border: "1px solid var(--border-subtle, rgba(99,102,241,.22))",
            borderTop: "none",
            borderRadius: "0 0 16px 16px",
            boxShadow: "0 18px 48px rgba(0,0,0,.25), 0 4px 16px rgba(99,102,241,.10)",
            transformOrigin: "top",
          }}
        >
          {/* loading (first fetch) */}
          {loading && suggestions.length === 0 && (
            <div>
              <div className="flex items-center gap-2 px-3.5 pt-3 pb-1.5">
                <div
                  className="w-3.5 h-3.5 rounded-full border-2 border-transparent animate-spin"
                  style={{ borderTopColor: ACCENT }}
                />
                <span className="text-[11px]" style={{ color: "var(--text-muted, rgba(148,163,184,.55))" }}>
                  Searching for <span style={{ color: ACCENT }}>"{query}"</span>…
                </span>
              </div>
              <SkeletonRow />
              <SkeletonRow />
              <SkeletonRow />
            </div>
          )}

          {/* no results */}
          {!loading && suggestions.length === 0 && (
            <div className="flex flex-col items-center gap-2 py-8 px-4">
              <Search size={22} style={{ color: "rgba(99,102,241,.35)" }} />
              <p className="text-xs text-center" style={{ color: "var(--text-muted, rgba(148,163,184,.55))" }}>
                No results for{" "}
                <span className="font-semibold" style={{ color: "var(--text-link, rgba(165,180,252,.8))" }}>
                  "{query}"
                </span>
              </p>
              <button
                type="button"
                onMouseDown={(e) => {
                  e.preventDefault();
                  onSearchAll();
                }}
                className="flex items-center gap-1.5 text-[11px] font-semibold px-3 py-1.5 rounded-lg transition-all hover:brightness-125 mt-1"
                style={{
                  background: "var(--nav-btn-bg, rgba(99,102,241,.14))",
                  color: ACCENT,
                  border: "1px solid var(--border-subtle, rgba(99,102,241,.24))",
                }}
              >
                <Search size={10} /> Full search for "{query}"
              </button>
            </div>
          )}

          {/* results */}
          {suggestions.length > 0 && (
            <>
              <div
                className="flex items-center justify-between px-3.5 pt-2.5 pb-2"
                style={{ borderBottom: "1px solid var(--border-subtle, rgba(255,255,255,.05))" }}
              >
                <div className="flex items-center gap-1.5">
                  <TrendingUp size={10} style={{ color: "var(--accent-glow, rgba(129,140,248,.7))" }} />
                  <span className="text-[9px] uppercase tracking-widest font-bold" style={{ color: DIM }}>
                    Top matches
                  </span>
                </div>
                <span className="text-[10px]" style={{ color: "var(--text-subtle, rgba(148,163,184,.35))" }}>
                  {suggestions.length} found
                </span>
              </div>

              <ul
                role="listbox"
                className="overflow-y-auto"
                style={{ maxHeight: "min(360px, 55vh)", scrollbarWidth: "none" }}
              >
                {suggestions.map((anime, i) => (
                  <SuggestionItem
                    key={anime.mal_id}
                    anime={anime}
                    index={i}
                    query={query}
                    selected={i === selectedIndex}
                    onSelect={onSelect}
                    onHover={onHoverIndex}
                  />
                ))}
              </ul>

              {/* footer */}
              <button
                type="button"
                onMouseDown={(e) => {
                  e.preventDefault();
                  onSearchAll();
                }}
                className="w-full flex items-center justify-between gap-2 px-3.5 py-2.5 text-xs font-semibold transition-all hover:brightness-125 group"
                style={{
                  background: "var(--nav-link-active-bg, rgba(99,102,241,.08))",
                  borderTop: "1px solid var(--border-subtle, rgba(99,102,241,.14))",
                  color: "var(--text-link, rgba(165,180,252,.75))",
                }}
              >
                <span className="flex items-center gap-2 min-w-0">
                  <Search size={11} className="flex-shrink-0" />
                  <span className="truncate">
                    See all results for <span className="font-black" style={{ color: ACCENT }}>"{query}"</span>
                  </span>
                  <ChevronRight
                    size={12}
                    className="flex-shrink-0 transition-transform duration-200 group-hover:translate-x-0.5"
                  />
                </span>

                <span className="hidden sm:flex items-center gap-1.5 flex-shrink-0">
                  <Kbd>↑↓</Kbd>
                  <Kbd>↵</Kbd>
                  <Kbd>esc</Kbd>
                </span>
              </button>
            </>
          )}
        </motion.div>
      )}
    </AnimatePresence>
  );
};

export default SearchSuggestions;