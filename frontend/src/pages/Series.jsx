// src/pages/Series.jsx
import { useState, useEffect, useRef, useMemo } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Link } from "react-router-dom";
import {
  Tv, Star, ChevronRight, RefreshCw, SlidersHorizontal, LayoutGrid, LayoutList,
  Flame, Sparkles, Calendar, Radio, X,
} from "lucide-react";
import { animeService } from "../services/animeService";
import AnimeCard from "../components/anime/AnimeCard";
import ScrollRope from "../components/ui/ScrollRope";

const ACCENT = "#a5b4fc";
const PAGE_SIZE = 24;

const TABS = [
  { key: "all",      label: "All",      icon: Tv,        params: { type: "TV", order_by: "popularity", sort: "desc" } },
  { key: "top",      label: "Top Rated",icon: Star,       params: { type: "TV", order_by: "score", sort: "desc" } },
  { key: "airing",   label: "Airing",   icon: Radio,      params: { type: "TV", status: "airing", order_by: "score", sort: "desc" } },
  { key: "trending", label: "Trending", icon: Flame,      params: { type: "TV", order_by: "members", sort: "desc" } },
  { key: "upcoming", label: "Upcoming", icon: Calendar,   params: { type: "TV", status: "upcoming", order_by: "start_date", sort: "asc" } },
  { key: "ova",      label: "OVA / ONA",icon: Sparkles,   params: { order_by: "score", sort: "desc" } },
];
const SORTS = [["Popularity","popularity"],["Score","score"],["Newest","start_date"],["Episodes","episodes"],["Title","title"]];
const SCORES = ["9","8","7","6"];
const SEASONS = [["Any",""],["Winter","winter"],["Spring","spring"],["Summer","summer"],["Fall","fall"]];
const DEFAULTS = { sort: "popularity", score: "", season: "" };

const Chip = ({ active, onClick, children }) => (
  <button onClick={onClick} aria-pressed={active}
    className="px-3 py-1.5 rounded-lg text-xs font-semibold whitespace-nowrap transition-colors focus-visible:outline focus-visible:outline-2 focus-visible:outline-indigo-400"
    style={{
      background: active ? "var(--nav-link-active-bg, rgba(165,180,252,.16))" : "var(--nav-btn-bg, rgba(255,255,255,.04))",
      border: `1px solid ${active ? "var(--border-accent, rgba(165,180,252,.5))" : "var(--border-subtle, rgba(255,255,255,.08))"}`,
      color: active ? "var(--color-primary, #a5b4fc)" : "var(--text-muted, rgba(255,255,255,.65))",
    }}>
    {children}
  </button>
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
      className="group flex items-center gap-4 p-3 rounded-xl transition-colors hover:bg-white/[.06] focus-visible:outline focus-visible:outline-2 focus-visible:outline-indigo-400"
      style={{ background: "var(--bg-card, rgba(255,255,255,.025))", border: "1px solid var(--border-subtle, rgba(255,255,255,.06))" }}>
      <span className="w-8 text-center text-xs font-bold tabular-nums" style={{ color: index < 3 ? "var(--color-primary, #a5b4fc)" : "var(--text-subtle, rgba(255,255,255,.3))" }}>{index + 1}</span>
      <img src={img} alt="" loading="lazy" className="w-12 h-16 rounded-lg object-cover flex-shrink-0" />
      <div className="flex-1 min-w-0">
        <p className="font-semibold text-sm sm:text-[15px] truncate transition-colors" style={{ color: "var(--text-heading, #fff)" }}>{title}</p>
        <div className="flex items-center gap-3 mt-1 text-[11px] flex-wrap" style={{ color: "var(--text-muted, #94a3b8)" }}>
          {anime.episodes && <span>{anime.episodes} eps</span>}
          {anime.status === "Currently Airing" && (
            <span className="inline-flex items-center gap-1 font-bold text-emerald-400">
              <span className="w-1.5 h-1.5 rounded-full bg-emerald-400" style={{ boxShadow: "0 0 4px #4ade80" }} />Airing
            </span>
          )}
          {anime.genres?.slice(0, 2).map((g) => <span key={g.mal_id} style={{ color: "var(--color-primary, #a5b4fc)", opacity: 0.8 }}>{g.name}</span>)}
        </div>
      </div>
      {anime.score && (
        <span className="inline-flex items-center gap-1 text-sm font-bold tabular-nums" style={{ color: "var(--text-heading, #fff)" }}>
          <Star size={12} fill="#fbbf24" stroke="#fbbf24" />{anime.score.toFixed(1)}
        </span>
      )}
    </Link>
  );
};

const GRID = "grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-6 2xl:grid-cols-8 gap-4";

const Series = () => {
  const [tab, setTab] = useState("all");
  const [f, setF] = useState(DEFAULTS);
  const [series, setSeries] = useState([]);
  const [page, setPage] = useState(1);
  const [hasMore, setHasMore] = useState(true);
  const [loading, setLoading] = useState(true);
  const [loadingMore, setLoadingMore] = useState(false);
  const [error, setError] = useState(false);
  const [view, setView] = useState("grid");
  const [panel, setPanel] = useState(false);
  const reqId = useRef(0);

  const changed = useMemo(() => Object.keys(DEFAULTS).filter((k) => f[k] !== DEFAULTS[k]).length, [f]);

  const load = async (pg, append) => {
    const id = ++reqId.current;
    append ? setLoadingMore(true) : setLoading(true);
    setError(false);
    try {
      if (tab === "ova") {
        const [ovaRes, onaRes] = await Promise.all([
          animeService.searchAnime("", { type: "OVA", order_by: "score", sort: "desc", limit: 12, page: pg }),
          animeService.searchAnime("", { type: "ONA", order_by: "score", sort: "desc", limit: 12, page: pg }),
        ]);
        if (id !== reqId.current) return;
        const merged = [...(ovaRes.data ?? []), ...(onaRes.data ?? [])].sort((a, b) => (b.score ?? 0) - (a.score ?? 0));
        setHasMore(merged.length >= 20);
        setSeries((p) => (append ? [...p, ...merged] : merged));
        setPage(pg);
        return;
      }
      const base = TABS.find((t) => t.key === tab).params;
      const params = {
        ...base, limit: PAGE_SIZE, page: pg,
        ...(f.sort && { order_by: f.sort }),
        ...(f.score && { min_score: f.score }),
        ...(f.season && { season: f.season }),
      };
      const res = await animeService.searchAnime("", params);
      if (id !== reqId.current) return;
      const items = res.data ?? [];
      setHasMore(items.length === PAGE_SIZE);
      setSeries((p) => (append ? [...p, ...items] : items));
      setPage(pg);
    } catch {
      if (id === reqId.current) setError(true);
    } finally {
      if (id === reqId.current) { setLoading(false); setLoadingMore(false); }
    }
  };

  useEffect(() => { load(1, false); /* eslint-disable-next-line */ }, [tab, f]);

  const switchTab = (k) => { if (k !== tab) { setF(DEFAULTS); setPanel(false); setTab(k); } };
  const set = (k, v) => setF((p) => ({ ...p, [k]: v }));
  const tabLabel = TABS.find((t) => t.key === tab).label;

  return (
    <div className="min-h-screen w-full" style={{ background: "var(--bg-main, #0a0a14)" }}>
      <ScrollRope color={ACCENT} />

      <header className="w-full border-b" style={{ borderColor: "var(--border-subtle, rgba(255,255,255,.05))", background: "linear-gradient(180deg,rgba(99,102,241,.06),transparent)" }}>
        <div className="w-full max-w-[1920px] mx-auto px-4 sm:px-8 xl:px-14 py-8 sm:py-12 flex flex-col sm:flex-row sm:items-end justify-between gap-5">
          <div>
            <h1 className="font-extrabold tracking-tight" style={{ fontSize: "clamp(28px,4.5vw,48px)", lineHeight: 1.05, color: "var(--text-heading, #fff)" }}>Anime Series</h1>
            <p className="mt-2 text-sm sm:text-base max-w-xl" style={{ color: "var(--text-muted, #94a3b8)" }}>
              TV series, OVAs and ONAs — from long-running classics to this season's new releases.
            </p>
          </div>
          <div className="hidden sm:flex p-1 rounded-xl gap-1" style={{ background: "var(--nav-btn-bg, rgba(255,255,255,.05))", border: "1px solid var(--border-subtle, rgba(255,255,255,.1))" }} role="group" aria-label="Layout">
            {[["grid", LayoutGrid], ["list", LayoutList]].map(([k, I]) => (
              <button key={k} onClick={() => setView(k)} aria-label={`${k} view`} aria-pressed={view === k}
                className="w-9 h-9 rounded-lg grid place-items-center transition-colors"
                style={{ background: view === k ? "rgba(165,180,252,.2)" : "transparent", color: view === k ? ACCENT : "var(--text-muted, rgba(255,255,255,.4))" }}>
                <I size={15} />
              </button>
            ))}
          </div>
        </div>
      </header>

      <div className="sticky top-0 z-30 w-full backdrop-blur-xl border-b" style={{ background: "var(--nav-bg, rgba(10,10,20,.85))", borderColor: "var(--border-subtle, rgba(255,255,255,.05))" }}>
        <div className="w-full max-w-[1920px] mx-auto px-4 sm:px-8 xl:px-14 py-3 flex items-center gap-3">
          <nav className="flex-1 flex gap-2 overflow-x-auto" style={{ scrollbarWidth: "none" }} aria-label="Series categories">
            {TABS.map(({ key, label, icon: I }) => {
              const on = tab === key;
              return (
                <button key={key} onClick={() => switchTab(key)} aria-current={on}
                  className="flex items-center gap-1.5 px-3.5 py-2 rounded-lg text-xs sm:text-[13px] font-semibold whitespace-nowrap transition-colors"
                  style={{
                    background: on ? "var(--nav-link-active-bg, rgba(165,180,252,.16))" : "transparent",
                    color: on ? ACCENT : "var(--text-muted, rgba(255,255,255,.55))",
                    border: `1px solid ${on ? "var(--border-accent, rgba(165,180,252,.45))" : "transparent"}`,
                  }}>
                  <I size={13} />{label}
                </button>
              );
            })}
          </nav>
          <button onClick={() => setPanel((p) => !p)} aria-expanded={panel}
            className="flex items-center gap-2 px-3.5 py-2 rounded-lg text-xs sm:text-[13px] font-semibold border transition-colors"
            style={{
              background: panel ? "var(--nav-link-active-bg, rgba(165,180,252,.16))" : "var(--nav-btn-bg, rgba(255,255,255,.04))",
              borderColor: panel ? "var(--border-accent, rgba(165,180,252,.45))" : "var(--border-subtle, rgba(255,255,255,.1))",
              color: panel ? ACCENT : "var(--text-muted, rgba(255,255,255,.7))",
            }}>
            <SlidersHorizontal size={13} /> Filters
            {changed > 0 && <span className="w-4 h-4 rounded-full text-[10px] font-bold grid place-items-center text-black" style={{ background: ACCENT }}>{changed}</span>}
          </button>
        </div>

        <AnimatePresence>
          {panel && (
            <motion.div initial={{ height: 0, opacity: 0 }} animate={{ height: "auto", opacity: 1 }} exit={{ height: 0, opacity: 0 }}
                        transition={{ duration: 0.2 }} className="overflow-hidden border-t" style={{ borderColor: "var(--border-subtle, rgba(255,255,255,.05))" }}>
              <div className="w-full max-w-[1920px] mx-auto px-4 sm:px-8 xl:px-14 py-4 grid gap-5 sm:grid-cols-2 lg:grid-cols-[2fr_1fr_1fr_auto] items-start">
                <fieldset><legend className="text-xs mb-2" style={{ color: "var(--text-muted, #94a3b8)" }}>Sort by</legend>
                  <div className="flex flex-wrap gap-1.5">{SORTS.map(([l, v]) => <Chip key={v} active={f.sort === v} onClick={() => set("sort", v)}>{l}</Chip>)}</div>
                </fieldset>
                <fieldset><legend className="text-xs mb-2" style={{ color: "var(--text-muted, #94a3b8)" }}>Minimum score</legend>
                  <div className="flex flex-wrap gap-1.5">{SCORES.map((s) => <Chip key={s} active={f.score === s} onClick={() => set("score", f.score === s ? "" : s)}>{s}+</Chip>)}</div>
                </fieldset>
                {tab !== "ova" && (
                  <fieldset><legend className="text-xs mb-2" style={{ color: "var(--text-muted, #94a3b8)" }}>Season</legend>
                    <div className="flex flex-wrap gap-1.5">{SEASONS.map(([l, v]) => <Chip key={v} active={f.season === v} onClick={() => set("season", v)}>{l}</Chip>)}</div>
                  </fieldset>
                )}
                {changed > 0 && (
                  <button onClick={() => setF(DEFAULTS)} className="inline-flex items-center gap-1.5 text-xs font-semibold text-rose-300 hover:text-rose-200 self-end">
                    <X size={12} /> Reset filters
                  </button>
                )}
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </div>

      <main className="w-full max-w-[1920px] mx-auto px-4 sm:px-8 xl:px-14 py-6 sm:py-8">
        {!loading && !error && series.length > 0 && (
          <div className="flex items-center justify-between mb-5">
            <p className="text-sm" style={{ color: "var(--text-muted, #94a3b8)" }}><span className="font-bold tabular-nums" style={{ color: "var(--text-heading, #fff)" }}>{series.length}</span> {tabLabel.toLowerCase()} series</p>
            <div className="sm:hidden flex p-1 rounded-lg gap-1" style={{ background: "var(--nav-btn-bg, rgba(255,255,255,.05))", border: "1px solid var(--border-subtle, rgba(255,255,255,.1))" }}>
              {[["grid", LayoutGrid], ["list", LayoutList]].map(([k, I]) => (
                <button key={k} onClick={() => setView(k)} aria-label={`${k} view`}
                  className="w-8 h-8 rounded-md grid place-items-center"
                  style={{ background: view === k ? "rgba(165,180,252,.2)" : "transparent", color: view === k ? ACCENT : "var(--text-muted, rgba(255,255,255,.4))" }}>
                  <I size={14} />
                </button>
              ))}
            </div>
          </div>
        )}

        {loading && <div className={GRID}>{Array.from({ length: PAGE_SIZE }).map((_, i) => <Skeleton key={i} />)}</div>}

        {error && !loading && (
          <div className="py-24 text-center">
            <p className="text-lg font-bold text-white">Couldn't load series</p>
            <p className="text-sm text-slate-400 mt-1">Check your connection, then try again.</p>
            <button onClick={() => load(1, false)} className="mt-5 inline-flex items-center gap-2 px-5 py-2.5 rounded-lg text-sm font-semibold text-black" style={{ background: ACCENT }}>
              <RefreshCw size={14} /> Retry
            </button>
          </div>
        )}

        {!loading && !error && series.length === 0 && (
          <div className="py-24 text-center">
            <p className="text-lg font-bold text-white">No {tabLabel.toLowerCase()} series match</p>
            <p className="text-sm text-slate-400 mt-1">Loosen the filters or pick another category.</p>
            {changed > 0 && <button onClick={() => setF(DEFAULTS)} className="mt-5 px-5 py-2.5 rounded-lg text-sm font-semibold text-black" style={{ background: ACCENT }}>Clear filters</button>}
          </div>
        )}

        {!loading && !error && series.length > 0 && (
          <>
            {view === "grid" ? (
              <div className={GRID}>{series.map((s, i) => <AnimeCard key={`${s.mal_id}-${i}`} anime={s} index={i % PAGE_SIZE} />)}</div>
            ) : (
              <div className="grid gap-2 xl:grid-cols-2">{series.map((s, i) => <ListRow key={`${s.mal_id}-${i}`} anime={s} index={i} />)}</div>
            )}
            {hasMore && (
              <div className="flex justify-center mt-10">
                <button onClick={() => load(page + 1, true)} disabled={loadingMore}
                  className="inline-flex items-center gap-2 px-7 py-3 rounded-xl text-sm font-bold border transition-colors hover:bg-indigo-400/10 disabled:opacity-60"
                  style={{ color: ACCENT, borderColor: "rgba(165,180,252,.4)" }}>
                  {loadingMore ? <><RefreshCw size={14} className="animate-spin" /> Loading</> : <>Load more <ChevronRight size={14} /></>}
                </button>
              </div>
            )}
          </>
        )}
      </main>
    </div>
  );
};

export default Series;