// src/pages/SearchPage.jsx
import { useState, useEffect, useCallback, useRef } from "react";
import { Link, useSearchParams } from "react-router-dom";
import { motion, AnimatePresence } from "framer-motion";
import {
  Search, SlidersHorizontal, X, LayoutGrid, LayoutList, ChevronDown,
  Sparkles, Tag, ArrowUpDown, Calendar, Star, Tv, Globe, Flame,
} from "lucide-react";
import { animeService } from "../services/animeService";
import { useDebounce } from "../hooks/useDebounce";
import AnimeCard from "../components/anime/AnimeCard";
import ScrollRope from "../components/ui/ScrollRope";

const ACCENT = "#a5b4fc";
const PAGE_SIZE = 24;

const ALL_GENRES = [
  { name: "Action", id: 1 }, { name: "Adventure", id: 2 }, { name: "Cars", id: 3 },
  { name: "Comedy", id: 4 }, { name: "Dementia", id: 5 }, { name: "Demons", id: 6 },
  { name: "Drama", id: 8 }, { name: "Ecchi", id: 9 }, { name: "Fantasy", id: 10 },
  { name: "Game", id: 11 }, { name: "Harem", id: 35 }, { name: "Historical", id: 13 },
  { name: "Horror", id: 14 }, { name: "Isekai", id: 62 }, { name: "Josei", id: 43 },
  { name: "Kids", id: 15 }, { name: "Magic", id: 16 }, { name: "Martial Arts", id: 17 },
  { name: "Mecha", id: 18 }, { name: "Military", id: 38 }, { name: "Music", id: 19 },
  { name: "Mystery", id: 7 }, { name: "Parody", id: 20 }, { name: "Police", id: 39 },
  { name: "Psychological", id: 40 }, { name: "Romance", id: 22 }, { name: "Samurai", id: 21 },
  { name: "School", id: 23 }, { name: "Sci-Fi", id: 24 }, { name: "Seinen", id: 42 },
  { name: "Shoujo", id: 25 }, { name: "Shoujo Ai", id: 26 }, { name: "Shounen", id: 27 },
  { name: "Shounen Ai", id: 28 }, { name: "Slice of Life", id: 36 }, { name: "Space", id: 29 },
  { name: "Sports", id: 30 }, { name: "Super Power", id: 31 }, { name: "Supernatural", id: 37 },
  { name: "Thriller", id: 41 }, { name: "Vampire", id: 32 },
];
const TYPES = ["TV", "Movie", "OVA", "ONA", "Special"];
const STATUSES = [["Airing", "airing"], ["Finished", "complete"], ["Upcoming", "upcoming"]];
const RATINGS = [["All ages", "g"], ["PG", "pg"], ["PG-13", "pg13"], ["R 17+", "r17"]];
const SCORES = ["9", "8", "7", "6"];
const SEASONS_LIST = ["winter", "spring", "summer", "fall"];
const SORTS = [["Default", ""], ["Score", "score"], ["Popularity", "popularity"], ["Rank", "rank"], ["Title", "title"], ["Newest", "start_date"]];
const TAG_COLORS = { genres: "#a5b4fc", type: "#60a5fa", status: "#4ade80", min_score: "#fbbf24", season: "#f9a8d4", rating: "#fb923c", order_by: "#c4b5fd", start_date: "#67e8f9", end_date: "#67e8f9" };

const EMPTY_FILTERS = {
  type: "", status: "", order_by: "", rating: "", min_score: "", season: "", start_date: "", end_date: "", genres: "",
};

const Chip = ({ active, onClick, children, color = ACCENT }) => (
  <button onClick={onClick} aria-pressed={active}
    className="px-2.5 py-1.5 rounded-lg text-xs font-semibold whitespace-nowrap transition-colors select-none"
    style={{
      background: active ? `${color}22` : "var(--nav-btn-bg, rgba(255,255,255,.04))",
      border: `1px solid ${active ? `${color}55` : "var(--border-subtle, rgba(255,255,255,.08))"}`,
      color: active ? color : "var(--text-muted, rgba(255,255,255,.55))",
    }}>
    {children}
  </button>
);

const FilterSection = ({ icon: Icon, label, children, defaultOpen = true }) => {
  const [open, setOpen] = useState(defaultOpen);
  return (
    <div className="border-b pb-4 last:border-0 last:pb-0" style={{ borderColor: "var(--border-subtle, rgba(255,255,255,.05))" }}>
      <button onClick={() => setOpen((o) => !o)} className="flex items-center justify-between w-full mb-2.5">
        <span className="flex items-center gap-2 text-xs font-bold" style={{ color: "var(--text-muted, #94a3b8)" }}>
          {Icon && <Icon size={12} />}{label}
        </span>
        <ChevronDown size={13} className="transition-transform" style={{ color: "var(--text-subtle, #64748b)", transform: open ? "rotate(180deg)" : "none" }} />
      </button>
      <AnimatePresence initial={false}>
        {open && (
          <motion.div initial={{ height: 0, opacity: 0 }} animate={{ height: "auto", opacity: 1 }} exit={{ height: 0, opacity: 0 }}
                      transition={{ duration: 0.18 }} className="overflow-hidden">
            {children}
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
};

const FilterPanel = ({ filters, onChange, onClear, onClose }) => {
  const [genreSearch, setGenreSearch] = useState("");
  const set = (key, val) => onChange({ ...filters, [key]: filters[key] === val ? "" : val });
  const setGenre = (id) => onChange({ ...filters, genres: filters.genres === String(id) ? "" : String(id) });
  const activeCount = Object.values(filters).filter(Boolean).length;
  const filteredGenres = ALL_GENRES.filter((g) => g.name.toLowerCase().includes(genreSearch.toLowerCase()));

  return (
    <div className="flex flex-col h-full rounded-2xl overflow-hidden" style={{ background: "var(--bg-card, rgba(16,16,32,.92))", border: "1px solid var(--border-subtle, rgba(255,255,255,.08))" }}>
      <div className="flex items-center justify-between px-4 py-3.5 border-b flex-shrink-0" style={{ borderColor: "var(--border-subtle, rgba(255,255,255,.05))" }}>
        <div className="flex items-center gap-2">
          <span className="font-bold text-sm" style={{ color: "var(--text-heading, #fff)" }}>Filters</span>
          {activeCount > 0 && <span className="text-[10px] font-black px-1.5 py-0.5 rounded-full" style={{ background: `${ACCENT}30`, color: ACCENT }}>{activeCount}</span>}
        </div>
        <div className="flex items-center gap-2">
          {activeCount > 0 && <button onClick={onClear} className="text-[11px] font-semibold px-2.5 py-1 rounded-lg text-rose-300 bg-rose-500/10 border border-rose-400/20">Clear all</button>}
          {onClose && <button onClick={onClose} aria-label="Close filters" className="w-7 h-7 rounded-lg grid place-items-center lg:hidden" style={{ background: "var(--nav-btn-bg, rgba(255,255,255,.05))", color: "var(--text-muted, #cbd5e1)" }}><X size={13} /></button>}
        </div>
      </div>

      <div className="flex-1 overflow-y-auto px-4 py-4 space-y-4">
        <FilterSection icon={Tv} label="Type">
          <div className="flex flex-wrap gap-1.5">{TYPES.map((t) => <Chip key={t} active={filters.type === t} onClick={() => set("type", t)}>{t}</Chip>)}</div>
        </FilterSection>
        <FilterSection icon={Globe} label="Status">
          <div className="flex flex-wrap gap-1.5">{STATUSES.map(([l, v]) => <Chip key={v} active={filters.status === v} onClick={() => set("status", v)} color="#4ade80">{l}</Chip>)}</div>
        </FilterSection>
        <FilterSection icon={Star} label="Minimum score">
          <div className="flex flex-wrap gap-1.5">{SCORES.map((s) => <Chip key={s} active={filters.min_score === s} onClick={() => set("min_score", s)} color="#fbbf24">{s}+</Chip>)}</div>
        </FilterSection>
        <FilterSection icon={Calendar} label="Season">
          <div className="flex flex-wrap gap-1.5">{SEASONS_LIST.map((s) => <Chip key={s} active={filters.season === s} onClick={() => set("season", s)} color="#f9a8d4">{s[0].toUpperCase() + s.slice(1)}</Chip>)}</div>
        </FilterSection>
        <FilterSection label="Rating">
          <div className="flex flex-wrap gap-1.5">{RATINGS.map(([l, v]) => <Chip key={v} active={filters.rating === v} onClick={() => set("rating", v)} color="#fb923c">{l}</Chip>)}</div>
        </FilterSection>
        <FilterSection icon={Calendar} label="Year range">
          <div className="grid grid-cols-2 gap-2">
            {[["start_date", "From"], ["end_date", "To"]].map(([key, ph]) => (
              <div key={key}>
                <p className="text-[10px] mb-1" style={{ color: "var(--text-subtle, #64748b)" }}>{ph}</p>
                <input type="number" min={1960} max={new Date().getFullYear() + 2} value={filters[key] || ""}
                  onChange={(e) => onChange({ ...filters, [key]: e.target.value })} placeholder="YYYY"
                  className="w-full rounded-lg px-3 py-2 text-xs outline-none focus:border-indigo-400"
                  style={{ background: "var(--nav-btn-bg, rgba(255,255,255,.04))", border: "1px solid var(--border-subtle, rgba(255,255,255,.1))", color: "var(--text-heading, #fff)" }} />
              </div>
            ))}
          </div>
        </FilterSection>
        <FilterSection icon={ArrowUpDown} label="Sort by">
          <div className="flex flex-wrap gap-1.5">{SORTS.map(([l, v]) => <Chip key={v} active={filters.order_by === v} onClick={() => set("order_by", v)}>{l}</Chip>)}</div>
        </FilterSection>
        <FilterSection icon={Tag} label="Genre" defaultOpen={false}>
          <div className="relative mb-2">
            <Search size={11} className="absolute left-2.5 top-1/2 -translate-y-1/2 pointer-events-none" style={{ color: "var(--text-subtle, #64748b)" }} />
            <input value={genreSearch} onChange={(e) => setGenreSearch(e.target.value)} placeholder="Filter genres"
              className="w-full rounded-lg pl-7 pr-3 py-1.5 text-xs outline-none"
              style={{ background: "var(--nav-btn-bg, rgba(255,255,255,.04))", border: "1px solid var(--border-subtle, rgba(255,255,255,.1))", color: "var(--text-heading, #fff)" }} />
          </div>
          <div className="flex flex-wrap gap-1.5 max-h-44 overflow-y-auto pr-0.5">
            {filteredGenres.map((g) => <Chip key={g.id} active={filters.genres === String(g.id)} onClick={() => setGenre(g.id)}>{g.name}</Chip>)}
            {filteredGenres.length === 0 && <p className="text-xs py-2" style={{ color: "var(--text-subtle, #64748b)" }}>No genres match &quot;{genreSearch}&quot;</p>}
          </div>
        </FilterSection>
      </div>
    </div>
  );
};

const MobileFilterDrawer = ({ open, onClose, filters, onChange, onClear }) => (
  <AnimatePresence>
    {open && (
      <>
        <motion.div className="fixed inset-0 z-40 bg-black/70 backdrop-blur-sm" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} onClick={onClose} />
        <motion.div className="fixed inset-y-0 left-0 z-50 w-80 max-w-[88vw]" initial={{ x: "-100%" }} animate={{ x: 0 }} exit={{ x: "-100%" }} transition={{ type: "spring", stiffness: 300, damping: 30 }}>
          <FilterPanel filters={filters} onChange={onChange} onClear={onClear} onClose={onClose} />
        </motion.div>
      </>
    )}
  </AnimatePresence>
);

const Skeleton = () => (
  <div className="space-y-2">
    <div className="w-full rounded-xl animate-pulse" style={{ aspectRatio: "2/3", background: "var(--border-subtle, rgba(255,255,255,.05))" }} />
    <div className="h-2.5 w-4/5 rounded-full animate-pulse" style={{ background: "var(--border-subtle, rgba(255,255,255,.05))" }} />
    <div className="h-2 w-1/2 rounded-full animate-pulse" style={{ background: "var(--border-subtle, rgba(255,255,255,.03))" }} />
  </div>
);

const ListRow = ({ anime, index }) => {
  const img = anime.images?.jpg?.large_image_url || anime.images?.jpg?.image_url;
  const title = anime.title_english || anime.title;
  return (
    <Link to={`/anime/${anime.mal_id}`}
      className="group flex items-center gap-4 p-3 rounded-xl transition-colors hover:bg-white/[.06]"
      style={{ background: "var(--bg-card, rgba(255,255,255,.025))", border: "1px solid var(--border-subtle, rgba(255,255,255,.06))" }}>
      <span className="w-7 text-center text-xs font-bold tabular-nums" style={{ color: index < 3 ? ACCENT : "var(--text-subtle, rgba(255,255,255,.3))" }}>{index + 1}</span>
      <img src={img} alt="" loading="lazy" className="w-11 h-15 rounded-lg object-cover flex-shrink-0" style={{ height: 60 }} />
      <div className="flex-1 min-w-0">
        <p className="font-semibold text-sm truncate transition-colors" style={{ color: "var(--text-heading, #fff)" }}>{title}</p>
        <div className="flex items-center gap-2 mt-1 text-[11px] flex-wrap" style={{ color: "var(--text-muted, #94a3b8)" }}>
          {anime.type && <span className="uppercase font-bold">{anime.type}</span>}
          {anime.episodes && <span>{anime.episodes} eps</span>}
          {anime.genres?.slice(0, 2).map((g) => <span key={g.mal_id} style={{ color: "var(--color-primary, #a5b4fc)", opacity: 0.8 }}>{g.name}</span>)}
        </div>
      </div>
      {anime.status === "Currently Airing" && <span className="w-2 h-2 rounded-full bg-emerald-400 flex-shrink-0" style={{ boxShadow: "0 0 6px #4ade80" }} />}
      {anime.score && <span className="inline-flex items-center gap-1 text-sm font-bold tabular-nums flex-shrink-0" style={{ color: "var(--text-heading, #fff)" }}><Star size={11} fill="#fbbf24" stroke="#fbbf24" />{anime.score.toFixed(1)}</span>}
    </Link>
  );
};

const ActiveTags = ({ filters, onChange }) => {
  const activeGenre = filters.genres ? ALL_GENRES.find((g) => String(g.id) === filters.genres) : null;
  const tags = [
    activeGenre && { key: "genres", label: activeGenre.name },
    filters.type && { key: "type", label: filters.type },
    filters.status && { key: "status", label: filters.status },
    filters.min_score && { key: "min_score", label: `Score ${filters.min_score}+` },
    filters.season && { key: "season", label: filters.season },
    filters.rating && { key: "rating", label: filters.rating.toUpperCase() },
    filters.order_by && { key: "order_by", label: `Sort: ${filters.order_by}` },
    filters.start_date && { key: "start_date", label: `From ${filters.start_date}` },
    filters.end_date && { key: "end_date", label: `To ${filters.end_date}` },
  ].filter(Boolean);
  if (!tags.length) return null;
  return (
    <div className="flex flex-wrap gap-1.5 mb-5">
      {tags.map((t) => {
        const c = TAG_COLORS[t.key] ?? ACCENT;
        return (
          <span key={t.key} className="inline-flex items-center gap-1 px-2.5 py-1 rounded-lg text-xs font-semibold" style={{ background: `${c}18`, border: `1px solid ${c}38`, color: c }}>
            {t.label}
            <button onClick={() => onChange({ ...filters, [t.key]: "" })} aria-label={`Remove ${t.label}`} className="hover:opacity-60"><X size={10} /></button>
          </span>
        );
      })}
    </div>
  );
};

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
    type: searchParams.get("type") || "", status: searchParams.get("status") || "",
    order_by: searchParams.get("sort") || "", rating: searchParams.get("rating") || "",
    min_score: searchParams.get("min_score") || "", season: searchParams.get("season") || "",
    start_date: searchParams.get("start_date") || "", end_date: searchParams.get("end_date") || "",
    genres: searchParams.get("genres") || "",
  });

  const debouncedQuery = useDebounce(query, 600);
  const activeFilterCount = Object.values(filters).filter(Boolean).length;
  const activeGenre = filters.genres ? ALL_GENRES.find((g) => String(g.id) === filters.genres) : null;

  const fetchResults = useCallback(async (q, f) => {
    const hasInput = q.trim() || Object.values(f).some(Boolean);
    setLoading(true);
    try {
      if (!hasInput) {
        const data = await animeService.getTopAnime(1, PAGE_SIZE);
        const items = data.data || [];
        setResults(items); setResultCount(items.length); setHasSearched(false); setIsDefaultMode(true);
        setSearchParams({}, { replace: true });
        return;
      }
      setHasSearched(true); setIsDefaultMode(false);
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
      setResults(items); setResultCount(items.length);
      const urlParams = {};
      if (q) urlParams.q = q;
      Object.entries(f).forEach(([k, v]) => { if (v) urlParams[k] = v; });
      setSearchParams(urlParams, { replace: true });
    } finally { setLoading(false); }
  }, [setSearchParams]);

  useEffect(() => { fetchResults(debouncedQuery, filters); }, [debouncedQuery, filters, fetchResults]);

  const didMount = useRef(false);
  useEffect(() => {
    if (didMount.current) return;
    didMount.current = true;
    const hasParams = ["genres","q","type","status","rating","min_score","season","start_date","end_date"].some((k) => searchParams.get(k));
    if (hasParams) { fetchResults(query, filters); if (searchParams.get("genres")) setShowFilters(true); }
    else fetchResults("", EMPTY_FILTERS);
    // eslint-disable-next-line
  }, []);

  const clearFilters = () => setFilters(EMPTY_FILTERS);
  const pageTitle = activeGenre ? `${activeGenre.name} Anime` : query ? `Results for "${query}"` : isDefaultMode ? "Top Anime" : "Browse Anime";

  return (
    <div className="min-h-screen w-full" style={{ background: "var(--bg-main, #0a0a14)" }}>
      <ScrollRope color={ACCENT} />
      <MobileFilterDrawer open={drawerOpen} onClose={() => setDrawerOpen(false)} filters={filters} onChange={setFilters} onClear={clearFilters} />

      <header className="w-full border-b" style={{ borderColor: "var(--border-subtle, rgba(255,255,255,.05))", background: "linear-gradient(180deg,rgba(99,102,241,.06),transparent)" }}>
        <div className="w-full max-w-[1920px] mx-auto px-4 sm:px-8 xl:px-14 py-8 sm:py-12">
          <p className="inline-flex items-center gap-1.5 text-xs font-bold mb-1" style={{ color: "var(--color-primary, #a5b4fc)" }}><Sparkles size={13} />Discover</p>
          <h1 className="font-extrabold tracking-tight" style={{ fontSize: "clamp(26px,4.5vw,46px)", lineHeight: 1.05, color: "var(--text-heading, #fff)" }}>{pageTitle}</h1>
          {!loading && <p className="mt-2 text-sm" style={{ color: "var(--text-muted, #94a3b8)" }}>{resultCount.toLocaleString()} anime found{activeGenre ? ` in ${activeGenre.name}` : ""}</p>}
        </div>
      </header>

      <div className="sticky top-0 z-30 w-full backdrop-blur-xl border-b" style={{ background: "var(--nav-bg, rgba(10,10,20,.85))", borderColor: "var(--border-subtle, rgba(255,255,255,.05))" }}>
        <div className="w-full max-w-[1920px] mx-auto px-4 sm:px-8 xl:px-14 py-3 flex items-center gap-2 sm:gap-3">
          <div className="relative flex-1">
            <Search size={15} className="absolute left-3.5 top-1/2 -translate-y-1/2 pointer-events-none" style={{ color: "var(--text-subtle, #64748b)" }} />
            <input type="text" value={query} onChange={(e) => setQuery(e.target.value)} placeholder="Search anime by title"
              className="w-full rounded-xl pl-10 pr-9 py-2.5 text-sm outline-none focus:border-indigo-400 transition-colors"
              style={{ background: "var(--nav-btn-bg, rgba(255,255,255,.05))", border: "1px solid var(--border-subtle, rgba(255,255,255,.1))", color: "var(--text-heading, #fff)" }} />
            <AnimatePresence>
              {query && (
                <motion.button initial={{ opacity: 0, scale: 0.7 }} animate={{ opacity: 1, scale: 1 }} exit={{ opacity: 0, scale: 0.7 }}
                  onClick={() => setQuery("")} aria-label="Clear search" className="absolute right-3 top-1/2 -translate-y-1/2 w-5 h-5 rounded-full grid place-items-center"
                  style={{ background: "var(--nav-btn-bg, rgba(255,255,255,.1))", color: "var(--text-heading, #fff)" }}>
                  <X size={11} />
                </motion.button>
              )}
            </AnimatePresence>
          </div>
          <button onClick={() => setShowFilters((f) => !f)} aria-expanded={showFilters}
            className="hidden lg:flex items-center gap-2 px-3.5 py-2.5 rounded-xl text-[13px] font-semibold border transition-colors flex-shrink-0"
            style={{
              background: showFilters ? "var(--nav-link-active-bg, rgba(165,180,252,.16))" : "var(--nav-btn-bg, rgba(255,255,255,.05))",
              borderColor: showFilters ? "var(--border-accent, rgba(165,180,252,.45))" : "var(--border-subtle, rgba(255,255,255,.1))",
              color: showFilters ? ACCENT : "var(--text-muted, rgba(255,255,255,.65))",
            }}>
            <SlidersHorizontal size={14} />Filters
            {activeFilterCount > 0 && <span className="text-[10px] font-black px-1.5 py-0.5 rounded-full text-black" style={{ background: ACCENT }}>{activeFilterCount}</span>}
          </button>
          <button onClick={() => setDrawerOpen(true)}
            className="lg:hidden flex items-center gap-1.5 px-3 py-2.5 rounded-xl text-[13px] font-semibold border flex-shrink-0"
            style={{
              background: activeFilterCount > 0 ? "var(--nav-link-active-bg, rgba(165,180,252,.16))" : "var(--nav-btn-bg, rgba(255,255,255,.05))",
              borderColor: activeFilterCount > 0 ? "var(--border-accent, rgba(165,180,252,.45))" : "var(--border-subtle, rgba(255,255,255,.1))",
              color: activeFilterCount > 0 ? ACCENT : "var(--text-muted, rgba(255,255,255,.65))",
            }}>
            <SlidersHorizontal size={14} />
            {activeFilterCount > 0 && <span className="text-[10px] font-black px-1.5 py-0.5 rounded-full text-black" style={{ background: ACCENT }}>{activeFilterCount}</span>}
          </button>
          <div className="hidden sm:flex p-1 rounded-xl gap-1 flex-shrink-0" style={{ background: "var(--nav-btn-bg, rgba(255,255,255,.05))", border: "1px solid var(--border-subtle, rgba(255,255,255,.1))" }} role="group" aria-label="Layout">
            {[["grid", LayoutGrid], ["list", LayoutList]].map(([k, I]) => (
              <button key={k} onClick={() => setViewMode(k)} aria-label={`${k} view`} aria-pressed={viewMode === k}
                className="w-9 h-9 rounded-lg grid place-items-center transition-colors"
                style={{ background: viewMode === k ? "rgba(165,180,252,.2)" : "transparent", color: viewMode === k ? ACCENT : "var(--text-muted, rgba(255,255,255,.4))" }}>
                <I size={15} />
              </button>
            ))}
          </div>
        </div>
      </div>

      <main className="w-full max-w-[1920px] mx-auto px-4 sm:px-8 xl:px-14 py-6 sm:py-8">
        <ActiveTags filters={filters} onChange={setFilters} />
        {!query.trim() && activeFilterCount === 0 && !loading && results.length > 0 && (
          <div className="flex items-center gap-2 mb-5 px-3.5 py-2 rounded-xl" style={{ background: "rgba(251,191,36,.08)", border: "1px solid rgba(251,191,36,.18)" }}>
            <Flame size={13} style={{ color: "#fbbf24" }} /><span className="text-xs font-semibold text-amber-300">Showing top anime by default</span>
          </div>
        )}

        <div className="flex gap-6 items-start">
          <AnimatePresence>
            {showFilters && (
              <motion.div key="sidebar" initial={{ opacity: 0, width: 0 }} animate={{ opacity: 1, width: 272 }} exit={{ opacity: 0, width: 0 }}
                transition={{ duration: 0.22 }} className="hidden lg:block flex-shrink-0 overflow-hidden">
                <div style={{ width: 272 }} className="lg:sticky lg:top-20"><FilterPanel filters={filters} onChange={setFilters} onClear={clearFilters} /></div>
              </motion.div>
            )}
          </AnimatePresence>

          <div className="flex-1 min-w-0">
            {loading && (
              <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-4 xl:grid-cols-5 2xl:grid-cols-6 gap-4">
                {Array.from({ length: PAGE_SIZE }).map((_, i) => <Skeleton key={i} />)}
              </div>
            )}

            {!loading && results.length > 0 && (
              viewMode === "grid" ? (
                <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-4 xl:grid-cols-5 2xl:grid-cols-6 gap-4">
                  {results.map((a, i) => <AnimeCard key={a.mal_id} anime={a} index={i} />)}
                </div>
              ) : (
                <div className="grid gap-2 xl:grid-cols-2">{results.map((a, i) => <ListRow key={a.mal_id} anime={a} index={i} />)}</div>
              )
            )}

            {!loading && results.length === 0 && (
              <div className="py-24 text-center">
                <p className="text-lg font-bold" style={{ color: "var(--text-heading, #fff)" }}>{hasSearched ? "No results found" : "Find your next anime"}</p>
                <p className="text-sm mt-1 max-w-sm mx-auto" style={{ color: "var(--text-muted, #94a3b8)" }}>
                  {hasSearched
                    ? query ? `Nothing matched "${query}". Try different keywords or fewer filters.` : "Nothing matched your filters. Try removing some."
                    : "Browse the most popular anime below, or start typing to search by title."}
                </p>
              </div>
            )}
          </div>
        </div>
      </main>
    </div>
  );
};

export default SearchPage;