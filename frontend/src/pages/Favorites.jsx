// src/pages/Favorites.jsx
import { useState, useMemo } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Heart, Trash2, Star, ArrowRight, Search, LayoutGrid, LayoutList, Sparkles, Tv, Film, BookMarked, TrendingUp, X } from "lucide-react";
import { Link } from "react-router-dom";
import { useFavorites } from "../context/FavoritesContext";
import { useAuth } from "../context/AuthContext";
import ScrollRope from "../components/ui/ScrollRope";

const ACCENT = "#f9a8d4";
const isMovie = (fav) => (fav.type ?? "").toLowerCase() === "movie";

const scoreColor = (s) => !s ? "#94a3b8" : s >= 8.5 ? "#fbbf24" : s >= 7.5 ? "#a3e635" : s >= 6.5 ? "#60a5fa" : "#94a3b8";
const statusLabel = (status) => {
  if (!status) return "—";
  if (status.includes("Airing") && !status.includes("Finished")) return "Airing";
  if (status.includes("Finished")) return "Finished";
  if (status.includes("Not")) return "Upcoming";
  return status;
};
const statusColor = (status) => {
  if (status?.includes("Airing") && !status.includes("Finished")) return "#4ade80";
  if (status?.includes("Finished")) return "#60a5fa";
  if (status?.includes("Not")) return "#fbbf24";
  return "rgba(148,163,184,.7)";
};

const TABS = [
  { id: "all", label: "All", icon: BookMarked },
  { id: "series", label: "Series", icon: Tv },
  { id: "movies", label: "Movies", icon: Film },
];
const SORTS = [["recent", "Recently added"], ["score", "Highest score"], ["title", "A \u2192 Z"], ["episodes", "Most episodes"]];

const RemoveBtn = ({ onClick, size = 13 }) => (
  <button onClick={(e) => { e.preventDefault(); e.stopPropagation(); onClick(); }} aria-label="Remove favourite"
    className="w-8 h-8 rounded-lg grid place-items-center text-rose-300 bg-rose-500/12 border border-rose-400/20 hover:bg-rose-500/22 transition-colors">
    <Trash2 size={size} />
  </button>
);

const GenrePill = ({ label }) => (
  <span className="text-[10px] font-semibold px-1.5 py-0.5 rounded-md flex-shrink-0 text-indigo-300/80" style={{ background: "rgba(99,102,241,.1)", border: "1px solid rgba(99,102,241,.2)" }}>{label}</span>
);

const GridCard = ({ fav, index, onRemove }) => {
  const sc = fav.score;
  return (
    <motion.div layout initial={{ opacity: 0, y: 14 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -8 }} transition={{ delay: Math.min(index * 0.02, 0.3) }}
      className="group flex flex-col rounded-xl overflow-hidden" style={{ background: "var(--bg-card, rgba(16,16,32,.85))", border: "1px solid var(--border-subtle, rgba(255,255,255,.07))" }}>
      <Link to={`/anime/${fav.animeId}`} className="relative block overflow-hidden" style={{ paddingBottom: "140%" }}>
        <img src={fav.imageUrl} alt={fav.titleEnglish || fav.title} loading="lazy"
          className="absolute inset-0 w-full h-full object-cover transition-transform duration-300 group-hover:scale-105" />
        <div className="absolute inset-0 pointer-events-none" style={{ background: "linear-gradient(to top,rgba(8,8,20,.9),transparent 55%)" }} />
        {sc && (
          <span className="absolute top-2 left-2 inline-flex items-center gap-1 px-1.5 py-0.5 rounded-md text-[11px] font-bold backdrop-blur-md" style={{ background: "rgba(0,0,0,.7)", color: scoreColor(sc) }}>
            <Star size={9} fill={scoreColor(sc)} stroke={scoreColor(sc)} />{sc.toFixed(1)}
          </span>
        )}
        {fav.type && (
          <span className="absolute top-2 right-2 px-1.5 py-0.5 rounded-md text-[9px] font-bold uppercase backdrop-blur-md" style={{ background: "rgba(0,0,0,.65)", color: isMovie(fav) ? "#fbbf24" : "#a5b4fc" }}>{fav.type}</span>
        )}
        <span className="absolute bottom-2 right-2 opacity-0 group-hover:opacity-100 transition-opacity"><RemoveBtn onClick={() => onRemove(fav.animeId)} /></span>
      </Link>
      <div className="flex flex-col gap-2 p-3 flex-1">
        <Link to={`/anime/${fav.animeId}`}>
          <h3 className="text-sm font-bold leading-tight line-clamp-2 transition-colors" style={{ color: "var(--text-heading, #fff)" }}>{fav.titleEnglish || fav.title}</h3>
        </Link>
        {fav.genres?.length > 0 && <div className="flex flex-wrap gap-1">{fav.genres.slice(0, 3).map((g) => <GenrePill key={g} label={g} />)}</div>}
        <div className="flex items-center justify-between mt-auto pt-1">
          <span className="text-[10px] font-bold" style={{ color: statusColor(fav.status) }}>{statusLabel(fav.status)}</span>
          {fav.episodes && <span className="text-[10px]" style={{ color: "var(--text-subtle, #64748b)" }}>{fav.episodes} eps</span>}
        </div>
      </div>
    </motion.div>
  );
};

const ListRow = ({ fav, index, onRemove }) => {
  const sc = fav.score;
  return (
    <motion.div layout initial={{ opacity: 0, x: -12 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: 12 }} transition={{ delay: Math.min(index * 0.02, 0.3) }}
      className="group flex items-center gap-4 p-3 rounded-xl transition-colors hover:bg-white/[.04]" style={{ background: "var(--bg-card, rgba(16,16,32,.7))", border: "1px solid var(--border-subtle, rgba(255,255,255,.06))" }}>
      <Link to={`/anime/${fav.animeId}`} className="flex-shrink-0"><img src={fav.imageUrl} alt="" loading="lazy" className="w-12 h-16 rounded-lg object-cover" /></Link>
      <div className="flex-1 min-w-0">
        <Link to={`/anime/${fav.animeId}`}><h3 className="text-sm font-bold truncate mb-1 transition-colors" style={{ color: "var(--text-heading, #fff)" }}>{fav.titleEnglish || fav.title}</h3></Link>
        <div className="flex items-center gap-2 flex-wrap text-[11px]">
          {sc && <span className="inline-flex items-center gap-1 font-bold" style={{ color: scoreColor(sc) }}><Star size={9} fill={scoreColor(sc)} />{sc.toFixed(1)}</span>}
          {fav.type && <span className="font-bold uppercase" style={{ color: isMovie(fav) ? "#fbbf24" : "#a5b4fc" }}>{fav.type}</span>}
          {fav.episodes && <span style={{ color: "var(--text-subtle, #64748b)" }}>{fav.episodes} eps</span>}
          <span className="font-bold" style={{ color: statusColor(fav.status) }}>{statusLabel(fav.status)}</span>
        </div>
      </div>
      <RemoveBtn onClick={() => onRemove(fav.animeId)} />
    </motion.div>
  );
};

const SectionDivider = ({ icon: Icon, label, count, color }) => (
  <div className="flex items-center gap-3 mb-4">
    <span className="w-7 h-7 rounded-lg grid place-items-center" style={{ background: `${color}16`, border: `1px solid ${color}28`, color }}><Icon size={14} /></span>
    <span className="font-bold text-sm" style={{ color: "var(--text-heading, #fff)" }}>{label}</span>
    <span className="text-[10px] font-bold px-2 py-0.5 rounded-full" style={{ background: `${color}16`, color }}>{count}</span>
    <div className="flex-1 h-px" style={{ background: `linear-gradient(to right, ${color}30, transparent)` }} />
  </div>
);

const EmptyState = ({ filtered, tab }) => (
  <div className="flex flex-col items-center text-center py-24">
    <span className="w-16 h-16 rounded-2xl grid place-items-center mb-5" style={{ background: "rgba(249,168,212,.1)", border: "1px solid rgba(249,168,212,.2)" }}>
      {filtered ? <Search size={26} style={{ color: ACCENT }} /> : tab === "movies" ? <Film size={26} style={{ color: "#fbbf24" }} /> : <Tv size={26} style={{ color: ACCENT }} />}
    </span>
    <h2 className="text-lg font-bold mb-1.5" style={{ color: "var(--text-heading, #fff)" }}>{filtered ? "No matches found" : tab === "movies" ? "No movies saved yet" : tab === "series" ? "No series saved yet" : "No favourites yet"}</h2>
    <p className="text-sm mb-6 max-w-xs" style={{ color: "var(--text-muted, #94a3b8)" }}>{filtered ? "Try a different search term or clear the filter." : "Find anime you love and save them here."}</p>
    {!filtered && <Link to="/search" className="inline-flex items-center gap-2 px-5 py-2.5 rounded-lg font-bold text-sm text-white" style={{ background: "#6366f1" }}><Sparkles size={14} />Browse anime<ArrowRight size={14} /></Link>}
  </div>
);

const Stat = ({ icon: Icon, label, value, color }) => (
  <div className="rounded-xl p-4" style={{ background: `${color}10`, border: `1px solid ${color}25` }}>
    <div className="flex items-center gap-2 text-xs" style={{ color: "var(--text-muted, #94a3b8)" }}><Icon size={13} style={{ color }} />{label}</div>
    <p className="mt-1 text-xl font-extrabold tabular-nums" style={{ color: "var(--text-heading, #fff)" }}>{value}</p>
  </div>
);

const Favorites = () => {
  const { user } = useAuth();
  const { favorites, removeFavorite, favLoading } = useFavorites();
  const [search, setSearch] = useState("");
  const [view, setView] = useState("grid");
  const [sortBy, setSortBy] = useState("recent");
  const [tab, setTab] = useState("all");

  if (!user)
    return (
      <div className="min-h-screen grid place-items-center px-4" style={{ background: "var(--bg-main, #0a0a14)" }}>
        <div className="text-center max-w-sm">
          <Heart size={32} className="mx-auto mb-4" style={{ color: ACCENT }} />
          <h2 className="text-xl font-bold" style={{ color: "var(--text-heading, #fff)" }}>Sign in to see your favourites</h2>
          <p className="text-sm mt-1 mb-6" style={{ color: "var(--text-muted, #94a3b8)" }}>Save anime you love and access them from any device.</p>
          <div className="flex gap-3 justify-center">
            <Link to="/login" className="px-6 py-3 rounded-lg font-bold text-sm text-white" style={{ background: "#6366f1" }}>Sign in</Link>
            <Link to="/register" className="px-6 py-3 rounded-lg font-bold text-sm text-slate-300 bg-white/5 border border-white/10">Register</Link>
          </div>
        </div>
      </div>
    );

  const movies = favorites.filter(isMovie);
  const series = favorites.filter((f) => !isMovie(f));
  const counts = { all: favorites.length, movies: movies.length, series: series.length };
  const pool = tab === "movies" ? movies : tab === "series" ? series : favorites;

  const applySort = (list) => [...list].sort((a, b) => {
    if (sortBy === "score") return (b.score ?? 0) - (a.score ?? 0);
    if (sortBy === "title") return (a.titleEnglish || a.title).localeCompare(b.titleEnglish || b.title);
    if (sortBy === "episodes") return (b.episodes ?? 0) - (a.episodes ?? 0);
    return 0;
  });
  const applyFilter = (list) => list.filter((f) => {
    const q = search.toLowerCase();
    return (f.titleEnglish || f.title)?.toLowerCase().includes(q) || f.genres?.some((g) => g.toLowerCase().includes(q));
  });

  const filtered = applySort(applyFilter(pool));
  const filteredMovies = applySort(applyFilter(movies));
  const filteredSeries = applySort(applyFilter(series));

  const statPool = pool.filter((f) => f.score);
  const avgScore = statPool.length ? (statPool.reduce((s, f) => s + f.score, 0) / statPool.length).toFixed(1) : "—";
  const totalEps = pool.reduce((s, f) => s + (f.episodes ?? 0), 0);
  const airingCount = pool.filter((f) => f.status?.includes("Airing") && !f.status.includes("Finished")).length;

  const remove = (id) => removeFavorite(id);
  const GRID = "grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-6 2xl:grid-cols-8 gap-4";

  const renderGrid = (list) => (
    <motion.div layout className={GRID}><AnimatePresence mode="popLayout">{list.map((f, i) => <GridCard key={f._id ?? f.animeId} fav={f} index={i} onRemove={remove} />)}</AnimatePresence></motion.div>
  );
  const renderList = (list) => (
    <motion.div layout className="grid gap-2 xl:grid-cols-2"><AnimatePresence mode="popLayout">{list.map((f, i) => <ListRow key={f._id ?? f.animeId} fav={f} index={i} onRemove={remove} />)}</AnimatePresence></motion.div>
  );

  return (
    <div className="min-h-screen w-full transition-colors duration-300" style={{ background: "var(--bg-main, #0a0a14)" }}>
      <ScrollRope color={ACCENT} />

      <header className="w-full border-b" style={{ borderColor: "var(--border-subtle, rgba(255,255,255,.05))", background: "linear-gradient(180deg,rgba(249,168,212,.07),transparent)" }}>
        <div className="w-full max-w-[1920px] mx-auto px-4 sm:px-8 xl:px-14 py-8 sm:py-12 flex flex-col sm:flex-row sm:items-end justify-between gap-5">
          <div>
            <h1 className="font-extrabold tracking-tight" style={{ fontSize: "clamp(28px,4.5vw,48px)", lineHeight: 1.05, color: "var(--text-heading, #fff)" }}>My Favourites</h1>
            <p className="mt-2 text-sm sm:text-base" style={{ color: "var(--text-muted, #94a3b8)" }}>{favorites.length} anime in your collection.</p>
          </div>
          <div className="hidden sm:flex p-1 rounded-xl gap-1" style={{ background: "var(--nav-btn-bg, rgba(255,255,255,.05))", border: "1px solid var(--border-subtle, rgba(255,255,255,.1))" }} role="group" aria-label="Layout">
            {[["grid", LayoutGrid], ["list", LayoutList]].map(([k, I]) => (
              <button key={k} onClick={() => setView(k)} aria-label={`${k} view`} aria-pressed={view === k}
                className="w-9 h-9 rounded-lg grid place-items-center transition-colors"
                style={{ background: view === k ? "rgba(249,168,212,.2)" : "transparent", color: view === k ? ACCENT : "var(--text-muted, rgba(255,255,255,.4))" }}>
                <I size={15} />
              </button>
            ))}
          </div>
        </div>
      </header>

      <div className="w-full max-w-[1920px] mx-auto px-4 sm:px-8 xl:px-14 py-6 sm:py-8">
        {favorites.length > 0 && (
          <>
            <div className="flex gap-2 mb-6">
              {TABS.map(({ id, label, icon: I }) => {
                const on = tab === id;
                return (
                  <button key={id} onClick={() => setTab(id)} aria-pressed={on}
                    className="inline-flex items-center gap-1.5 px-3.5 py-2 rounded-lg text-xs font-semibold transition-colors"
                    style={{ background: on ? "rgba(249,168,212,.16)" : "var(--nav-btn-bg, rgba(255,255,255,.04))", border: `1px solid ${on ? "rgba(249,168,212,.45)" : "var(--border-subtle, rgba(255,255,255,.08))"}`, color: on ? ACCENT : "var(--text-muted, rgba(255,255,255,.6))" }}>
                    <I size={13} />{label}
                    <span className="text-[10px] font-bold px-1.5 rounded-full" style={{ background: on ? "rgba(249,168,212,.25)" : "var(--nav-btn-bg, rgba(255,255,255,.08))" }}>{counts[id]}</span>
                  </button>
                );
              })}
            </div>

            <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 mb-6">
              <Stat icon={BookMarked} label={tab === "all" ? "Total" : tab === "movies" ? "Movies" : "Series"} value={pool.length} color={ACCENT} />
              <Stat icon={Star} label="Avg score" value={avgScore} color="#fbbf24" />
              <Stat icon={Tv} label="Episodes" value={totalEps.toLocaleString()} color="#60a5fa" />
              <Stat icon={TrendingUp} label="Airing now" value={airingCount} color="#4ade80" />
            </div>

            <div className="flex flex-col sm:flex-row gap-3 mb-6">
              <div className="relative flex-1">
                <Search size={14} className="absolute left-3.5 top-1/2 -translate-y-1/2" style={{ color: "var(--text-muted, #94a3b8)" }} />
                <input value={search} onChange={(e) => setSearch(e.target.value)} placeholder={`Search ${tab === "all" ? "favourites" : tab}`}
                  className="w-full rounded-lg pl-9 pr-9 py-2.5 text-sm outline-none transition-colors"
                  style={{ background: "var(--nav-btn-bg, rgba(255,255,255,.04))", border: "1px solid var(--border-subtle, rgba(255,255,255,.1))", color: "var(--text-heading, #fff)" }} />
                {search && (
                  <button onClick={() => setSearch("")} aria-label="Clear search" className="absolute right-3 top-1/2 -translate-y-1/2 w-5 h-5 rounded-full grid place-items-center" style={{ background: "var(--nav-btn-bg, rgba(255,255,255,.1))" }}><X size={10} style={{ color: "var(--text-heading, #fff)" }} /></button>
                )}
              </div>
              <select value={sortBy} onChange={(e) => setSortBy(e.target.value)}
                className="rounded-lg text-sm font-semibold outline-none px-3 py-2.5 transition-colors"
                style={{ background: "var(--nav-btn-bg, rgba(255,255,255,.04))", border: "1px solid var(--border-subtle, rgba(255,255,255,.1))", color: "var(--text-heading, #cbd5e1)" }}>
                {SORTS.map(([v, l]) => <option key={v} value={v} style={{ background: "var(--bg-surface, #0f0f1a)", color: "var(--text-heading, #fff)" }}>{l}</option>)}
              </select>
            </div>
          </>
        )}

        {favLoading ? (
          <div className={view === "grid" ? GRID : "grid gap-2"}>
            {Array.from({ length: 10 }).map((_, i) => <div key={i} className="rounded-xl animate-pulse bg-white/[.04]" style={{ height: view === "grid" ? 260 : 80 }} />)}
          </div>
        ) : favorites.length === 0 ? (
          <EmptyState filtered={false} tab="all" />
        ) : tab === "all" ? (
          filteredMovies.length === 0 && filteredSeries.length === 0 ? (
            <EmptyState filtered={search.length > 0} tab="all" />
          ) : (
            <div className="space-y-10">
              {filteredMovies.length > 0 && <div><SectionDivider icon={Film} label="Movies" count={filteredMovies.length} color="#fbbf24" />{view === "grid" ? renderGrid(filteredMovies) : renderList(filteredMovies)}</div>}
              {filteredSeries.length > 0 && <div><SectionDivider icon={Tv} label="Series" count={filteredSeries.length} color="#60a5fa" />{view === "grid" ? renderGrid(filteredSeries) : renderList(filteredSeries)}</div>}
            </div>
          )
        ) : filtered.length === 0 ? (
          <EmptyState filtered={search.length > 0} tab={tab} />
        ) : view === "grid" ? renderGrid(filtered) : renderList(filtered)}

        {search && filtered.length > 0 && tab !== "all" && (
          <p className="text-center text-xs text-slate-500 mt-6">Showing {filtered.length} of {pool.length} {tab}</p>
        )}
      </div>
    </div>
  );
};

export default Favorites;