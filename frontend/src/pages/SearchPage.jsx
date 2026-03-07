import { useState, useEffect, useCallback, useRef } from "react";
import { Link, useSearchParams } from "react-router-dom";
import { motion, AnimatePresence } from "framer-motion";
import {
  Search, SlidersHorizontal, X, Filter,
  LayoutGrid, LayoutList, ChevronDown, Sparkles,
  Tag, ArrowUpDown, Calendar, Star, Tv, Globe,
  Flame,
} from "lucide-react";
import { animeService } from "../services/animeService";
import { useDebounce } from "../hooks/useDebounce";
import AnimeCard from "../components/section/AnimeCard";

/* ══════════════════════════════════════════════════════════
   CONSTANTS
══════════════════════════════════════════════════════════ */
const ALL_GENRES = [
  { name: "Action", id: 1 }, { name: "Adventure", id: 2 },
  { name: "Cars", id: 3 }, { name: "Comedy", id: 4 },
  { name: "Dementia", id: 5 }, { name: "Demons", id: 6 },
  { name: "Drama", id: 8 }, { name: "Ecchi", id: 9 },
  { name: "Fantasy", id: 10 }, { name: "Game", id: 11 },
  { name: "Harem", id: 35 }, { name: "Historical", id: 13 },
  { name: "Horror", id: 14 }, { name: "Isekai", id: 62 },
  { name: "Josei", id: 43 }, { name: "Kids", id: 15 },
  { name: "Magic", id: 16 }, { name: "Martial Arts", id: 17 },
  { name: "Mecha", id: 18 }, { name: "Military", id: 38 },
  { name: "Music", id: 19 }, { name: "Mystery", id: 7 },
  { name: "Parody", id: 20 }, { name: "Police", id: 39 },
  { name: "Psychological", id: 40 }, { name: "Romance", id: 22 },
  { name: "Samurai", id: 21 }, { name: "School", id: 23 },
  { name: "Sci-Fi", id: 24 }, { name: "Seinen", id: 42 },
  { name: "Shoujo", id: 25 }, { name: "Shoujo Ai", id: 26 },
  { name: "Shounen", id: 27 }, { name: "Shounen Ai", id: 28 },
  { name: "Slice of Life", id: 36 }, { name: "Space", id: 29 },
  { name: "Sports", id: 30 }, { name: "Super Power", id: 31 },
  { name: "Supernatural", id: 37 }, { name: "Thriller", id: 41 },
  { name: "Vampire", id: 32 },
];

const TYPES = ["TV", "Movie", "OVA", "ONA", "Special"];
const STATUSES = [
  { label: "Airing", value: "airing" },
  { label: "Finished", value: "complete" },
  { label: "Upcoming", value: "upcoming" },
];
const RATINGS = [
  { label: "All ages", value: "g" },
  { label: "PG", value: "pg" },
  { label: "PG-13", value: "pg13" },
  { label: "R 17+", value: "r17" },
];
const SCORES = ["9+", "8+", "7+", "6+"];
const SEASONS_LIST = ["winter", "spring", "summer", "fall"];
const SORT_OPTIONS = [
  { label: "Default", value: "" },
  { label: "Score", value: "score" },
  { label: "Popularity", value: "popularity" },
  { label: "Rank", value: "rank" },
  { label: "Title", value: "title" },
  { label: "Newest", value: "start_date" },
];

const EMPTY_FILTERS = {
  type: "",
  status: "",
  order_by: "",
  rating: "",
  min_score: "",
  season: "",
  start_date: "",
  end_date: "",
  genres: "",
};

/* ══════════════════════════════════════════════════════════
   UI ATOMS
══════════════════════════════════════════════════════════ */
const Chip = ({ active, onClick, children, color }) => (
  <button
    onClick={onClick}
    className="px-2.5 py-1 rounded-lg text-xs font-semibold transition-all hover:scale-105 active:scale-95 whitespace-nowrap select-none"
    style={{
      background: active
        ? color ? `${color}28` : "rgba(99,102,241,.28)"
        : "rgba(255,255,255,.04)",
      border: active
        ? `1px solid ${color ? color.replace("1)", ".5)") : "rgba(99,102,241,.45)"}`
        : "1px solid rgba(255,255,255,.08)",
      color: active ? color ?? "#a5b4fc" : "rgba(255,255,255,.50)",
    }}
  >
    {children}
  </button>
);

const FilterSection = ({ icon: Icon, label, children }) => {
  const [open, setOpen] = useState(true);

  return (
    <div className="border-b pb-4" style={{ borderColor: "rgba(255,255,255,.06)" }}>
      <button
        onClick={() => setOpen((o) => !o)}
        className="flex items-center justify-between w-full mb-3 group"
      >
        <div className="flex items-center gap-2">
          {Icon && <Icon size={12} style={{ color: "rgba(99,102,241,.75)" }} />}
          <span
            className="text-[10px] uppercase tracking-widest font-bold"
            style={{ color: "rgba(148,163,184,.50)" }}
          >
            {label}
          </span>
        </div>
        <ChevronDown
          size={12}
          style={{
            color: "rgba(148,163,184,.35)",
            transform: open ? "rotate(180deg)" : "rotate(0deg)",
            transition: "transform .2s",
          }}
        />
      </button>

      <AnimatePresence initial={false}>
        {open && (
          <motion.div
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: "auto", opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            transition={{ duration: 0.2 }}
            className="overflow-hidden"
          >
            {children}
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
};

/* ══════════════════════════════════════════════════════════
   FILTER PANEL
══════════════════════════════════════════════════════════ */
const FilterPanel = ({ filters, onChange, onClear, onClose }) => {
  const set = (key, val) =>
    onChange({ ...filters, [key]: filters[key] === val ? "" : val });

  const setGenre = (id) =>
    onChange({ ...filters, genres: filters.genres === String(id) ? "" : String(id) });

  const activeCount = Object.values(filters).filter(Boolean).length;
  const [genreSearch, setGenreSearch] = useState("");

  const filteredGenres = ALL_GENRES.filter((g) =>
    g.name.toLowerCase().includes(genreSearch.toLowerCase())
  );

  return (
    <div
      className="flex flex-col h-full rounded-2xl overflow-hidden"
      style={{
        background: "rgba(10,10,22,.98)",
        border: "1px solid rgba(255,255,255,.08)",
      }}
    >
      <div
        className="flex items-center justify-between px-4 py-3.5 flex-shrink-0"
        style={{ borderBottom: "1px solid rgba(255,255,255,.07)" }}
      >
        <div className="flex items-center gap-2">
          <div
            className="w-6 h-6 rounded-lg flex items-center justify-center"
            style={{
              background: "rgba(99,102,241,.18)",
              border: "1px solid rgba(99,102,241,.28)",
            }}
          >
            <Filter size={11} style={{ color: "#a5b4fc" }} />
          </div>
          <span className="text-sm font-bold text-white">Filters</span>
          {activeCount > 0 && (
            <span
              className="text-[9px] font-black px-1.5 py-0.5 rounded-full"
              style={{
                background: "rgba(99,102,241,.25)",
                color: "#a5b4fc",
                border: "1px solid rgba(99,102,241,.38)",
              }}
            >
              {activeCount}
            </span>
          )}
        </div>

        <div className="flex items-center gap-2">
          {activeCount > 0 && (
            <button
              onClick={onClear}
              className="text-[10px] font-semibold px-2.5 py-1 rounded-lg transition-all hover:scale-105"
              style={{
                background: "rgba(239,68,68,.10)",
                color: "rgba(252,165,165,.80)",
                border: "1px solid rgba(239,68,68,.20)",
              }}
            >
              Clear all
            </button>
          )}
          {onClose && (
            <button
              onClick={onClose}
              className="w-6 h-6 rounded-lg flex items-center justify-center transition-all hover:scale-110 lg:hidden"
              style={{
                background: "rgba(255,255,255,.06)",
                border: "1px solid rgba(255,255,255,.10)",
              }}
            >
              <X size={12} style={{ color: "rgba(255,255,255,.55)" }} />
            </button>
          )}
        </div>
      </div>

      <div
        className="flex-1 overflow-y-auto px-4 py-4 space-y-4"
        style={{ scrollbarWidth: "thin", scrollbarColor: "rgba(99,102,241,.3) transparent" }}
      >
        <FilterSection icon={Tv} label="Type">
          <div className="flex flex-wrap gap-1.5">
            {TYPES.map((t) => (
              <Chip key={t} active={filters.type === t} onClick={() => set("type", t)}>
                {t}
              </Chip>
            ))}
          </div>
        </FilterSection>

        <FilterSection icon={Globe} label="Status">
          <div className="flex flex-wrap gap-1.5">
            {STATUSES.map((s) => (
              <Chip
                key={s.value}
                active={filters.status === s.value}
                onClick={() => set("status", s.value)}
              >
                {s.label}
              </Chip>
            ))}
          </div>
        </FilterSection>

        <FilterSection icon={Star} label="Min Score">
          <div className="flex flex-wrap gap-1.5">
            {SCORES.map((s) => (
              <Chip
                key={s}
                active={filters.min_score === s.replace("+", "")}
                onClick={() => set("min_score", s.replace("+", ""))}
                color="rgba(251,191,36,1)"
              >
                ⭐ {s}
              </Chip>
            ))}
          </div>
        </FilterSection>

        <FilterSection icon={Calendar} label="Season">
          <div className="flex flex-wrap gap-1.5">
            {SEASONS_LIST.map((s) => (
              <Chip key={s} active={filters.season === s} onClick={() => set("season", s)}>
                {s.charAt(0).toUpperCase() + s.slice(1)}
              </Chip>
            ))}
          </div>
        </FilterSection>

        <FilterSection label="Rating">
          <div className="flex flex-wrap gap-1.5">
            {RATINGS.map((r) => (
              <Chip key={r.value} active={filters.rating === r.value} onClick={() => set("rating", r.value)}>
                {r.label}
              </Chip>
            ))}
          </div>
        </FilterSection>

        <FilterSection icon={Calendar} label="Year Range">
          <div className="grid grid-cols-2 gap-2">
            {[["start_date", "From"], ["end_date", "To"]].map(([key, ph]) => (
              <div key={key}>
                <p
                  className="text-[9px] font-semibold mb-1 uppercase tracking-wider"
                  style={{ color: "rgba(148,163,184,.38)" }}
                >
                  {ph}
                </p>
                <input
                  type="number"
                  min={1960}
                  max={new Date().getFullYear() + 2}
                  value={filters[key] || ""}
                  onChange={(e) => onChange({ ...filters, [key]: e.target.value })}
                  placeholder="YYYY"
                  className="w-full rounded-xl px-3 py-2 text-xs text-white outline-none"
                  style={{
                    background: "rgba(255,255,255,.05)",
                    border: "1px solid rgba(255,255,255,.09)",
                    WebkitAppearance: "none",
                  }}
                />
              </div>
            ))}
          </div>
        </FilterSection>

        <FilterSection icon={ArrowUpDown} label="Sort By">
          <div className="flex flex-wrap gap-1.5">
            {SORT_OPTIONS.map((opt) => (
              <Chip
                key={opt.value}
                active={filters.order_by === opt.value}
                onClick={() => set("order_by", opt.value)}
              >
                {opt.label}
              </Chip>
            ))}
          </div>
        </FilterSection>

        <FilterSection icon={Tag} label="Genre">
          <div className="relative mb-2">
            <Search
              size={10}
              className="absolute left-2.5 top-1/2 -translate-y-1/2"
              style={{ color: "rgba(148,163,184,.4)" }}
            />
            <input
              value={genreSearch}
              onChange={(e) => setGenreSearch(e.target.value)}
              placeholder="Filter genres…"
              className="w-full rounded-lg pl-7 pr-3 py-1.5 text-xs text-white outline-none"
              style={{
                background: "rgba(255,255,255,.05)",
                border: "1px solid rgba(255,255,255,.08)",
              }}
            />
          </div>

          <div
            className="flex flex-wrap gap-1.5 overflow-y-auto pr-0.5"
            style={{ maxHeight: 180, scrollbarWidth: "thin" }}
          >
            {filteredGenres.map((g) => (
              <Chip
                key={g.id}
                active={filters.genres === String(g.id)}
                onClick={() => setGenre(g.id)}
                color="rgba(99,102,241,1)"
              >
                {g.name}
              </Chip>
            ))}
            {filteredGenres.length === 0 && (
              <p className="text-xs py-2" style={{ color: "rgba(148,163,184,.38)" }}>
                No genres match "{genreSearch}"
              </p>
            )}
          </div>
        </FilterSection>
      </div>
    </div>
  );
};

/* ══════════════════════════════════════════════════════════
   MOBILE FILTER DRAWER
══════════════════════════════════════════════════════════ */
const MobileFilterDrawer = ({ open, onClose, filters, onChange, onClear }) => (
  <AnimatePresence>
    {open && (
      <>
        <motion.div
          className="fixed inset-0 z-40"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          style={{ background: "rgba(0,0,0,.72)", backdropFilter: "blur(8px)" }}
          onClick={onClose}
        />
        <motion.div
          className="fixed inset-y-0 left-0 z-50 w-80 max-w-[90vw] flex flex-col"
          initial={{ x: "-100%" }}
          animate={{ x: 0 }}
          exit={{ x: "-100%" }}
          transition={{ type: "spring", stiffness: 300, damping: 30 }}
        >
          <FilterPanel filters={filters} onChange={onChange} onClear={onClear} onClose={onClose} />
        </motion.div>
      </>
    )}
  </AnimatePresence>
);

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
      <div className="h-2.5 rounded-full animate-pulse" style={{ width: "80%", background: "rgba(255,255,255,.05)" }} />
      <div className="h-2 rounded-full animate-pulse" style={{ width: "55%", background: "rgba(255,255,255,.04)" }} />
    </div>
  </motion.div>
);

const ActiveTags = ({ filters, onChange }) => {
  const tags = [];
  const activeGenre = filters.genres
    ? ALL_GENRES.find((g) => String(g.id) === filters.genres)
    : null;

  if (activeGenre) tags.push({ key: "genres", label: activeGenre.name, color: "#a5b4fc" });
  if (filters.type) tags.push({ key: "type", label: filters.type, color: "#60a5fa" });
  if (filters.status) tags.push({ key: "status", label: filters.status, color: "#4ade80" });
  if (filters.min_score) tags.push({ key: "min_score", label: `Score ${filters.min_score}+`, color: "#fbbf24" });
  if (filters.season) tags.push({ key: "season", label: filters.season, color: "#f9a8d4" });
  if (filters.rating) tags.push({ key: "rating", label: filters.rating.toUpperCase(), color: "#fb923c" });
  if (filters.order_by) tags.push({ key: "order_by", label: `Sort: ${filters.order_by}`, color: "#c4b5fd" });
  if (filters.start_date) tags.push({ key: "start_date", label: `From ${filters.start_date}`, color: "#67e8f9" });
  if (filters.end_date) tags.push({ key: "end_date", label: `To ${filters.end_date}`, color: "#67e8f9" });

  if (!tags.length) return null;

  return (
    <motion.div
      initial={{ opacity: 0, y: -6 }}
      animate={{ opacity: 1, y: 0 }}
      className="flex flex-wrap gap-1.5 mb-4 sm:mb-5"
    >
      {tags.map((t) => (
        <span
          key={t.key}
          className="flex items-center gap-1 px-2.5 py-1 rounded-lg text-xs font-semibold"
          style={{
            background: `${t.color}14`,
            border: `1px solid ${t.color}35`,
            color: t.color,
          }}
        >
          {t.label}
          <button
            onClick={() => onChange({ ...filters, [t.key]: "" })}
            className="ml-0.5 transition-opacity hover:opacity-60"
          >
            <X size={10} />
          </button>
        </span>
      ))}
    </motion.div>
  );
};

const EmptyState = ({ searched, query }) => (
  <motion.div
    initial={{ opacity: 0, y: 12 }}
    animate={{ opacity: 1, y: 0 }}
    className="flex flex-col items-center justify-center py-20 sm:py-28 gap-5 text-center"
  >
    <div
      className="w-20 h-20 rounded-3xl flex items-center justify-center"
      style={{
        background: "rgba(99,102,241,.10)",
        border: "1px solid rgba(99,102,241,.20)",
        boxShadow: "0 0 40px rgba(99,102,241,.10)",
      }}
    >
      {searched
        ? <X size={32} style={{ color: "rgba(99,102,241,.55)" }} />
        : <Sparkles size={32} style={{ color: "rgba(99,102,241,.55)" }} />
      }
    </div>

    <div>
      <p className="font-black text-white mb-2" style={{ fontSize: "clamp(16px,2.5vw,22px)" }}>
        {searched ? "No results found" : "Find your next anime"}
      </p>
      <p className="text-sm leading-relaxed" style={{ color: "rgba(148,163,184,.50)", maxWidth: 360 }}>
        {searched
          ? query
            ? `No anime matched "${query}". Try different keywords or adjust your filters.`
            : "No anime matched your filters. Try removing some to broaden your search."
          : "Browse the most popular anime below or start typing to search by title."
        }
      </p>
    </div>
  </motion.div>
);

/* default hero badge */
const DefaultBrowseBanner = () => (
  <motion.div
    initial={{ opacity: 0, y: -6 }}
    animate={{ opacity: 1, y: 0 }}
    className="flex items-center gap-2 mb-4 sm:mb-5 px-3 py-2 rounded-xl"
    style={{
      background: "rgba(251,191,36,.08)",
      border: "1px solid rgba(251,191,36,.18)",
    }}
  >
    <Flame size={13} style={{ color: "#fbbf24" }} />
    <span className="text-xs font-semibold" style={{ color: "#fbbf24" }}>
      Showing top anime by default
    </span>
  </motion.div>
);

/* ══════════════════════════════════════════════════════════
   SEARCH PAGE
══════════════════════════════════════════════════════════ */
const SearchPage = () => {
  const [searchParams, setSearchParams] = useSearchParams();

  const [query, setQuery] = useState(searchParams.get("q") || "");
  const [results, setResults] = useState([]);
  const [loading, setLoading] = useState(false);
  const [hasSearched, setHasSearched] = useState(false);
  const [showFilters, setShowFilters] = useState(false);
  const [drawerOpen, setDrawerOpen] = useState(false);
  const [viewMode, setViewMode] = useState("grid");
  const [resultCount, setResultCount] = useState(0);
  const [isDefaultMode, setIsDefaultMode] = useState(false);

  const [filters, setFilters] = useState({
    type: searchParams.get("type") || "",
    status: searchParams.get("status") || "",
    order_by: searchParams.get("sort") || "",
    rating: searchParams.get("rating") || "",
    min_score: searchParams.get("min_score") || "",
    season: searchParams.get("season") || "",
    start_date: searchParams.get("start_date") || "",
    end_date: searchParams.get("end_date") || "",
    genres: searchParams.get("genres") || "",
  });

  const debouncedQuery = useDebounce(query, 600);
  const activeFilterCount = Object.values(filters).filter(Boolean).length;
  const activeGenre = filters.genres
    ? ALL_GENRES.find((g) => String(g.id) === filters.genres)
    : null;

  const fetchResults = useCallback(async (q, f) => {
    const hasInput = q.trim() || Object.values(f).some(Boolean);

    setLoading(true);

    try {
      if (!hasInput) {
        const data = await animeService.getTopAnime(1, 24);
        const items = data.data || [];
        setResults(items);
        setResultCount(items.length);
        setHasSearched(false);
        setIsDefaultMode(true);
        setSearchParams({}, { replace: true });
        return;
      }

      setHasSearched(true);
      setIsDefaultMode(false);

      const apiParams = {};
      if (f.type) apiParams.type = f.type;
      if (f.status) apiParams.status = f.status;
      if (f.order_by) apiParams.order_by = f.order_by;
      if (f.rating) apiParams.rating = f.rating;
      if (f.min_score) apiParams.min_score = f.min_score;
      if (f.season) apiParams.season = f.season;
      if (f.start_date) apiParams.start_date = `${f.start_date}-01-01`;
      if (f.end_date) apiParams.end_date = `${f.end_date}-12-31`;
      if (f.genres) apiParams.genres = f.genres;

      const data = await animeService.searchAnime(q, apiParams);
      const items = data.data || [];
      setResults(items);
      setResultCount(items.length);

      const urlParams = {};
      if (q) urlParams.q = q;
      Object.entries(f).forEach(([k, v]) => {
        if (v) urlParams[k] = v;
      });
      setSearchParams(urlParams, { replace: true });
    } finally {
      setLoading(false);
    }
  }, [setSearchParams]);

  useEffect(() => {
    fetchResults(debouncedQuery, filters);
  }, [debouncedQuery, filters, fetchResults]);

  const didMount = useRef(false);
  useEffect(() => {
    if (didMount.current) return;
    didMount.current = true;

    const hasParams =
      searchParams.get("genres") ||
      searchParams.get("q") ||
      searchParams.get("type") ||
      searchParams.get("status") ||
      searchParams.get("rating") ||
      searchParams.get("min_score") ||
      searchParams.get("season") ||
      searchParams.get("start_date") ||
      searchParams.get("end_date");

    if (hasParams) {
      fetchResults(query, filters);
      if (searchParams.get("genres")) setShowFilters(true);
    } else {
      fetchResults("", EMPTY_FILTERS);
    }
  }, []); // eslint-disable-line

  const clearFilters = () => setFilters(EMPTY_FILTERS);

  const pageTitle = activeGenre
    ? `${activeGenre.name} Anime`
    : query
    ? `Results for "${query}"`
    : isDefaultMode
    ? "Top Anime"
    : "Browse Anime";

  return (
    <div className="min-h-screen" style={{ background: "#0a0a14" }}>
      <MobileFilterDrawer
        open={drawerOpen}
        onClose={() => setDrawerOpen(false)}
        filters={filters}
        onChange={setFilters}
        onClear={clearFilters}
      />

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6 sm:py-10">
        <motion.div
          initial={{ opacity: 0, y: 16 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.4 }}
          className="mb-6 sm:mb-9"
        >
          <div className="flex items-center gap-2 mb-1.5">
            <Sparkles size={14} style={{ color: "rgba(99,102,241,.75)" }} />
            <span
              className="text-[10px] uppercase tracking-widest font-bold"
              style={{ color: "rgba(99,102,241,.65)" }}
            >
              Discover
            </span>
          </div>

          <h1
            className="font-black text-white leading-none"
            style={{ fontSize: "clamp(24px,5vw,44px)", letterSpacing: "-0.03em" }}
          >
            {pageTitle}
          </h1>

          {!loading && (
            <motion.p
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              className="mt-2 text-xs sm:text-sm"
              style={{ color: "rgba(148,163,184,.45)" }}
            >
              {resultCount.toLocaleString()} anime found
              {activeGenre ? ` in ${activeGenre.name}` : ""}
            </motion.p>
          )}
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.08 }}
          className="flex items-center gap-2 sm:gap-3 mb-3 sm:mb-4"
        >
          <div className="relative flex-1">
            <Search
              size={15}
              className="absolute left-3.5 top-1/2 -translate-y-1/2 pointer-events-none"
              style={{ color: "rgba(148,163,184,.50)" }}
            />
            <input
              type="text"
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              placeholder="Search anime by title…"
              className="w-full rounded-2xl pl-10 pr-9 text-sm text-white outline-none"
              style={{
                background: "rgba(255,255,255,.05)",
                border: "1px solid rgba(255,255,255,.09)",
                padding: "11px 36px 11px 40px",
                transition: "border-color .2s, box-shadow .2s",
              }}
              onFocus={(e) => {
                e.target.style.borderColor = "rgba(99,102,241,.50)";
                e.target.style.boxShadow = "0 0 0 3px rgba(99,102,241,.10)";
              }}
              onBlur={(e) => {
                e.target.style.borderColor = "rgba(255,255,255,.09)";
                e.target.style.boxShadow = "none";
              }}
            />
            <AnimatePresence>
              {query && (
                <motion.button
                  initial={{ opacity: 0, scale: 0.7 }}
                  animate={{ opacity: 1, scale: 1 }}
                  exit={{ opacity: 0, scale: 0.7 }}
                  onClick={() => setQuery("")}
                  className="absolute right-3 top-1/2 -translate-y-1/2 w-5 h-5 rounded-full flex items-center justify-center transition-all hover:scale-110"
                  style={{ background: "rgba(255,255,255,.10)" }}
                >
                  <X size={11} className="text-white" />
                </motion.button>
              )}
            </AnimatePresence>
          </div>

          <button
            onClick={() => setShowFilters((f) => !f)}
            className="hidden lg:flex items-center gap-2 rounded-2xl font-semibold transition-all hover:scale-105 active:scale-95 flex-shrink-0"
            style={{
              padding: "11px 16px",
              fontSize: 13,
              background: showFilters ? "rgba(99,102,241,.25)" : "rgba(255,255,255,.05)",
              color: showFilters ? "#a5b4fc" : "rgba(255,255,255,.55)",
              border: showFilters ? "1px solid rgba(99,102,241,.40)" : "1px solid rgba(255,255,255,.09)",
            }}
          >
            <SlidersHorizontal size={14} />
            Filters
            {activeFilterCount > 0 && (
              <span
                className="font-black rounded-full"
                style={{
                  fontSize: 9,
                  padding: "2px 6px",
                  background: "rgba(99,102,241,.40)",
                  color: "#a5b4fc",
                  border: "1px solid rgba(99,102,241,.50)",
                }}
              >
                {activeFilterCount}
              </span>
            )}
          </button>

          <button
            onClick={() => setDrawerOpen(true)}
            className="lg:hidden flex items-center gap-1.5 rounded-2xl font-semibold transition-all hover:scale-105 active:scale-95 flex-shrink-0"
            style={{
              padding: "11px 14px",
              fontSize: 13,
              background: activeFilterCount > 0 ? "rgba(99,102,241,.25)" : "rgba(255,255,255,.05)",
              color: activeFilterCount > 0 ? "#a5b4fc" : "rgba(255,255,255,.55)",
              border: activeFilterCount > 0 ? "1px solid rgba(99,102,241,.40)" : "1px solid rgba(255,255,255,.09)",
            }}
          >
            <SlidersHorizontal size={14} />
            <span className="sm:inline hidden">Filters</span>
            {activeFilterCount > 0 && (
              <span
                className="font-black rounded-full"
                style={{
                  fontSize: 9,
                  padding: "2px 6px",
                  background: "rgba(99,102,241,.40)",
                  color: "#a5b4fc",
                }}
              >
                {activeFilterCount}
              </span>
            )}
          </button>

          <div
            className="hidden sm:flex items-center p-1 rounded-xl gap-0.5 flex-shrink-0"
            style={{
              background: "rgba(255,255,255,.05)",
              border: "1px solid rgba(255,255,255,.08)",
            }}
          >
            {[
              { key: "grid", Icon: LayoutGrid },
              { key: "list", Icon: LayoutList },
            ].map(({ key, Icon }) => (
              <button
                key={key}
                onClick={() => setViewMode(key)}
                className="w-8 h-8 rounded-lg flex items-center justify-center transition-all"
                style={{
                  background: viewMode === key ? "rgba(99,102,241,.30)" : "transparent",
                  color: viewMode === key ? "#a5b4fc" : "rgba(255,255,255,.30)",
                  border: viewMode === key ? "1px solid rgba(99,102,241,.28)" : "1px solid transparent",
                }}
              >
                <Icon size={13} />
              </button>
            ))}
          </div>
        </motion.div>

        <ActiveTags filters={filters} onChange={setFilters} />
        {!query.trim() && activeFilterCount === 0 && !loading && results.length > 0 && <DefaultBrowseBanner />}

        <div className="flex gap-5 lg:gap-6 items-start">
          <AnimatePresence>
            {showFilters && (
              <motion.div
                key="sidebar"
                initial={{ opacity: 0, width: 0 }}
                animate={{ opacity: 1, width: 256 }}
                exit={{ opacity: 0, width: 0 }}
                transition={{ duration: 0.28, ease: "easeInOut" }}
                className="hidden lg:block flex-shrink-0 overflow-hidden"
                style={{ minWidth: showFilters ? 256 : 0 }}
              >
                <div style={{ width: 256 }}>
                  <FilterPanel filters={filters} onChange={setFilters} onClear={clearFilters} />
                </div>
              </motion.div>
            )}
          </AnimatePresence>

          <div className="flex-1 min-w-0">
            <AnimatePresence mode="wait">
              {loading && (
                <motion.div
                  key="loading"
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  exit={{ opacity: 0 }}
                  className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-4 xl:grid-cols-5 gap-3 sm:gap-4"
                >
                  {Array.from({ length: 10 }).map((_, i) => (
                    <CardSkeleton key={i} index={i} />
                  ))}
                </motion.div>
              )}

              {!loading && results.length > 0 && (
                <motion.div
                  key="results"
                  initial={{ opacity: 0, y: 8 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0 }}
                  transition={{ duration: 0.28 }}
                >
                  {viewMode === "grid" ? (
                    <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-4 xl:grid-cols-5 gap-3 sm:gap-4">
                      {results.map((anime, i) => (
                        <AnimeCard key={anime.mal_id} anime={anime} index={i} />
                      ))}
                    </div>
                  ) : (
                    <div className="flex flex-col gap-2 sm:gap-2.5">
                      {results.map((anime, i) => (
                        <ListRow key={anime.mal_id} anime={anime} index={i} />
                      ))}
                    </div>
                  )}
                </motion.div>
              )}

              {!loading && results.length === 0 && (
                <motion.div
                  key="empty"
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  exit={{ opacity: 0 }}
                >
                  <EmptyState searched={hasSearched} query={query} />
                </motion.div>
              )}
            </AnimatePresence>
          </div>
        </div>
      </div>
    </div>
  );
};

/* ══════════════════════════════════════════════════════════
   LIST ROW
══════════════════════════════════════════════════════════ */
const ListRow = ({ anime, index }) => {
  const [imgErr, setImgErr] = useState(false);
  const [hov, setHov] = useState(false);

  const img = anime.images?.jpg?.large_image_url || anime.images?.jpg?.image_url;
  const title = anime.title_english || anime.title;

  return (
    <motion.div
      initial={{ opacity: 0, y: 8 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: Math.min(index * 0.025, 0.4) }}
    >
      <Link
        to={`/anime/${anime.mal_id}`}
        onMouseEnter={() => setHov(true)}
        onMouseLeave={() => setHov(false)}
        className="flex items-center gap-3 sm:gap-4 p-3 sm:p-3.5 rounded-2xl transition-all duration-200"
        style={{
          background: hov ? "rgba(255,255,255,.06)" : "rgba(255,255,255,.03)",
          border: `1px solid ${hov ? "rgba(99,102,241,.28)" : "rgba(255,255,255,.07)"}`,
          transform: hov ? "scale(1.008)" : "scale(1)",
        }}
      >
        <span
          className="flex-shrink-0 font-black text-center"
          style={{
            width: 24,
            fontSize: 11,
            color: index < 3 ? "#fbbf24" : "rgba(148,163,184,.30)",
          }}
        >
          {index + 1}
        </span>

        <div
          className="flex-shrink-0 rounded-xl overflow-hidden"
          style={{ width: 44, height: 58, border: "1px solid rgba(255,255,255,.08)" }}
        >
          {!imgErr ? (
            <img
              src={img}
              alt={title}
              className="w-full h-full object-cover"
              style={{
                transform: hov ? "scale(1.08)" : "scale(1)",
                transition: "transform .4s",
              }}
              onError={() => setImgErr(true)}
            />
          ) : (
            <div
              className="w-full h-full flex items-center justify-center text-xl"
              style={{ background: "rgba(255,255,255,.04)" }}
            >
              🎬
            </div>
          )}
        </div>

        <div className="flex-1 min-w-0">
          <p
            className="font-bold line-clamp-1 transition-colors duration-200"
            style={{ fontSize: "clamp(12px,2vw,14px)", color: hov ? "#a5b4fc" : "#fff" }}
          >
            {title}
          </p>
          <div className="flex items-center gap-2 mt-0.5 flex-wrap">
            {anime.type && (
              <span className="text-[10px] font-bold uppercase" style={{ color: "rgba(148,163,184,.42)" }}>
                {anime.type}
              </span>
            )}
            {anime.episodes && (
              <span className="text-[10px]" style={{ color: "rgba(148,163,184,.35)" }}>
                {anime.episodes} eps
              </span>
            )}
            {anime.genres?.slice(0, 2).map((g) => (
              <span
                key={g.mal_id}
                className="text-[9px] font-semibold px-1.5 py-0.5 rounded-md"
                style={{
                  background: "rgba(99,102,241,.10)",
                  border: "1px solid rgba(99,102,241,.18)",
                  color: "rgba(165,180,252,.65)",
                }}
              >
                {g.name}
              </span>
            ))}
          </div>
        </div>

        {anime.score && (
          <div className="flex-shrink-0 flex items-center gap-1">
            <Star size={10} className="text-yellow-400 fill-yellow-400" />
            <span className="font-bold text-white" style={{ fontSize: 12 }}>
              {anime.score.toFixed(1)}
            </span>
          </div>
        )}

        {anime.status === "Currently Airing" && (
          <span
            className="flex-shrink-0 w-2 h-2 rounded-full"
            style={{ background: "#4ade80", boxShadow: "0 0 6px #4ade80" }}
          />
        )}
      </Link>
    </motion.div>
  );
};

export default SearchPage;