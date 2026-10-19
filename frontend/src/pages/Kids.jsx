// src/pages/Kids.jsx
import { useState, useEffect, useRef, useMemo } from "react";
import { Link } from "react-router-dom";
import { motion, AnimatePresence } from "framer-motion";
import { Baby, Star, ChevronRight, RefreshCw, LayoutGrid, LayoutList, Sparkles, Shield, Clock } from "lucide-react";
import { animeService } from "../services/animeService";
import AnimeCard from "../components/anime/AnimeCard";
import ScrollRope from "../components/ui/ScrollRope";

const ACCENT = "#fbbf24";
const PAGE_SIZE = 24;

/* MAL genre ids: 15 Kids · 2 Adventure · 4 Comedy · 10 Fantasy · 30 Sports */
const CATEGORIES = [
  { key: "all",       label: "All Kids",  emoji: "🌟", color: "#fbbf24", params: { genres: "15", min_score: "5" } },
  { key: "toprated",  label: "Top Rated", emoji: "⭐", color: "#fb923c", params: { genres: "15", min_score: "7.5" } },
  { key: "adventure", label: "Adventure", emoji: "🗺️", color: "#4ade80", params: { genres: "15,2", min_score: "5" } },
  { key: "comedy",    label: "Comedy",    emoji: "😄", color: "#f9a8d4", params: { genres: "15,4", min_score: "5" } },
  { key: "magic",     label: "Magic",     emoji: "🪄", color: "#c4b5fd", params: { genres: "15,10", min_score: "5" } },
  { key: "sports",    label: "Sports",    emoji: "⚽", color: "#67e8f9", params: { genres: "15,30", min_score: "5" } },
];
const AGE_GROUPS = [["All ages", ""], ["G", "g"], ["PG", "pg"]];
const FUN_FACTS = [
  "Japan produces roughly 60% of the world's animated content.",
  "Doraemon has been airing continuously since 1973.",
  "Spirited Away won the Academy Award for Best Animated Feature.",
  "Pokémon is the highest-grossing media franchise of all time.",
];

const FunFact = () => {
  const [i, setI] = useState(0);
  useEffect(() => { const t = setInterval(() => setI((n) => (n + 1) % FUN_FACTS.length), 5000); return () => clearInterval(t); }, []);
  return (
    <AnimatePresence mode="wait">
      <motion.p key={i} initial={{ opacity: 0, y: 4 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -4 }} transition={{ duration: 0.3 }}
        className="text-xs sm:text-sm text-slate-400">{FUN_FACTS[i]}</motion.p>
    </AnimatePresence>
  );
};

const Skeleton = () => (
  <div className="space-y-2">
    <div className="w-full rounded-xl animate-pulse" style={{ aspectRatio: "2/3", background: "var(--border-subtle, rgba(255,255,255,.05))" }} />
    <div className="h-2.5 w-4/5 rounded-full animate-pulse" style={{ background: "var(--border-subtle, rgba(255,255,255,.05))" }} />
    <div className="h-2 w-1/2 rounded-full animate-pulse" style={{ background: "var(--border-subtle, rgba(255,255,255,.03))" }} />
  </div>
);

const ListSkeleton = () => (
  <div className="flex items-center gap-4 p-3 rounded-xl animate-pulse" style={{ background: "var(--bg-card, rgba(255,255,255,.025))", border: "1px solid var(--border-subtle, rgba(255,255,255,.06))" }}>
    <div className="w-8 h-4 rounded bg-white/5" />
    <div className="w-12 h-16 rounded-lg bg-white/5 flex-shrink-0" />
    <div className="flex-1 space-y-2">
      <div className="h-4 w-3/5 rounded bg-white/5" />
      <div className="h-3 w-2/5 rounded bg-white/[.03]" />
    </div>
  </div>
);

const ListRow = ({ anime, index }) => {
  const img = anime.images?.jpg?.large_image_url || anime.images?.jpg?.image_url;
  const title = anime.title_english || anime.title;
  return (
    <Link to={`/anime/${anime.mal_id}`}
      className="group flex items-center gap-4 p-3 rounded-xl transition-colors hover:bg-white/[.06] focus-visible:outline focus-visible:outline-2 focus-visible:outline-amber-400"
      style={{ background: "var(--bg-card, rgba(255,255,255,.025))", border: "1px solid var(--border-subtle, rgba(255,255,255,.06))" }}>
      <span className="w-8 text-center text-xs font-bold tabular-nums"
            style={{ color: index < 3 ? ACCENT : "var(--text-subtle, rgba(255,255,255,.3))" }}>{index + 1}</span>
      <img src={img} alt="" loading="lazy" className="w-12 h-16 rounded-lg object-cover flex-shrink-0" />
      <div className="flex-1 min-w-0">
        <p className="font-semibold text-sm sm:text-[15px] truncate transition-colors" style={{ color: "var(--text-heading, #fff)" }}>{title}</p>
        <div className="flex items-center gap-3 mt-1 text-[11px] flex-wrap" style={{ color: "var(--text-muted, #94a3b8)" }}>
          {anime.duration && <span className="inline-flex items-center gap-1"><Clock size={10} />{anime.duration}</span>}
          {anime.year && <span>{anime.year}</span>}
          {anime.genres?.slice(0, 2).map((g) => <span key={g.mal_id} style={{ color: "var(--color-primary, #f5b83d)", opacity: 0.85 }}>{g.name}</span>)}
        </div>
      </div>
      {anime.score && (
        <span className="inline-flex items-center gap-1 text-sm font-bold tabular-nums" style={{ color: "var(--text-heading, #fff)" }}>
          <Star size={12} fill={ACCENT} stroke={ACCENT} />{anime.score.toFixed(1)}
        </span>
      )}
    </Link>
  );
};

const GRID = "grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-6 2xl:grid-cols-8 gap-4";

const Kids = () => {
  const [cat, setCat] = useState("all");
  const [age, setAge] = useState("");
  const [anime, setAnime] = useState([]);
  const [page, setPage] = useState(1);
  const [hasMore, setHasMore] = useState(true);
  const [loading, setLoading] = useState(true);
  const [loadingMore, setLoadingMore] = useState(false);
  const [error, setError] = useState(false);
  const [view, setView] = useState("grid");
  const reqId = useRef(0);
  const active = CATEGORIES.find((c) => c.key === cat);

  const load = async (pg, append) => {
    const id = ++reqId.current;
    append ? setLoadingMore(true) : setLoading(true);
    setError(false);
    try {
      const params = { ...active.params, order_by: "score", sort: "desc", limit: PAGE_SIZE, page: pg, ...(age && { rating: age }) };
      const res = await animeService.searchAnime("", params);
      if (id !== reqId.current) return;
      const items = res.data ?? [];
      setHasMore(items.length === PAGE_SIZE);
      setAnime((p) => (append ? [...p, ...items] : items));
      setPage(pg);
    } catch {
      if (id === reqId.current) setError(true);
    } finally {
      if (id === reqId.current) { setLoading(false); setLoadingMore(false); }
    }
  };

  useEffect(() => { load(1, false); /* eslint-disable-next-line */ }, [cat, age]);

  const switchCat = (k) => { if (k !== cat) { setAge(""); setCat(k); } };

  /* genre mix of the currently loaded set, as a simple horizontal bar read */
  const genreMix = useMemo(() => {
    const counts = {};
    anime.forEach((a) => a.genres?.forEach((g) => { counts[g.name] = (counts[g.name] || 0) + 1; }));
    return Object.entries(counts).sort((a, b) => b[1] - a[1]).slice(0, 6);
  }, [anime]);
  const maxCount = Math.max(1, ...genreMix.map(([, n]) => n));

  return (
    <div className="min-h-screen w-full" style={{ background: "var(--bg-main, #0a0a14)" }}>
      <ScrollRope color={ACCENT} />

      <header className="w-full border-b" style={{ borderColor: "var(--border-subtle, rgba(255,255,255,.05))", background: "linear-gradient(180deg,rgba(251,191,36,.06),transparent)" }}>
        <div className="w-full max-w-[1920px] mx-auto px-4 sm:px-8 xl:px-14 py-8 sm:py-12">
          <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-5">
            <div>
              <div className="flex items-center gap-2.5">
                <h1 className="font-extrabold tracking-tight" style={{ fontSize: "clamp(28px,4.5vw,48px)", lineHeight: 1.05, color: "var(--text-heading, #fff)" }}>Kids Anime</h1>
                <span className="text-[11px] font-bold px-2 py-1 rounded-full text-emerald-400" style={{ background: "rgba(74,222,128,.14)", border: "1px solid rgba(74,222,128,.3)" }}>
                  Family safe
                </span>
              </div>
              <p className="mt-2 text-sm sm:text-base max-w-xl" style={{ color: "var(--text-muted, #94a3b8)" }}>Age-appropriate picks for younger viewers — adventure, comedy, magic and sports.</p>
            </div>
            <div className="hidden sm:flex p-1 rounded-xl gap-1" style={{ background: "var(--nav-btn-bg, rgba(255,255,255,.05))", border: "1px solid var(--border-subtle, rgba(255,255,255,.1))" }} role="group" aria-label="Layout">
              {[["grid", LayoutGrid], ["list", LayoutList]].map(([k, I]) => (
                <button key={k} onClick={() => setView(k)} aria-label={`${k} view`} aria-pressed={view === k}
                  className="w-9 h-9 rounded-lg grid place-items-center transition-colors"
                  style={{ background: view === k ? "rgba(251,191,36,.2)" : "transparent", color: view === k ? ACCENT : "var(--text-muted, rgba(255,255,255,.4))" }}>
                  <I size={15} />
                </button>
              ))}
            </div>
          </div>
          <div className="mt-5 flex items-center gap-2 px-4 py-2.5 rounded-xl" style={{ background: "var(--bg-card, rgba(255,255,255,.03))", border: "1px solid var(--border-subtle, rgba(255,255,255,.06))" }}>
            <Sparkles size={13} style={{ color: ACCENT }} />
            <FunFact />
          </div>
        </div>
      </header>

      <div className="w-full max-w-[1920px] mx-auto px-4 sm:px-8 xl:px-14 py-6">
        <p className="text-xs font-bold uppercase tracking-wider mb-3" style={{ color: "var(--text-subtle, #64748b)" }}>Browse by category</p>
        <div className="grid grid-cols-3 sm:grid-cols-6 gap-3">
          {CATEGORIES.map((c) => {
            const on = cat === c.key;
            return (
              <button key={c.key} onClick={() => switchCat(c.key)} aria-pressed={on}
                className="flex flex-col items-center gap-1.5 py-4 rounded-xl transition-colors"
                style={{ background: on ? `${c.color}18` : "var(--bg-card, rgba(255,255,255,.03))", border: `1px solid ${on ? `${c.color}55` : "var(--border-subtle, rgba(255,255,255,.07))"}` }}>
                <span className="text-2xl leading-none">{c.emoji}</span>
                <span className="text-xs font-bold" style={{ color: on ? c.color : "var(--text-muted, rgba(255,255,255,.55))" }}>{c.label}</span>
              </button>
            );
          })}
        </div>

        <div className="flex flex-wrap items-center gap-2 mt-5">
          <span className="inline-flex items-center gap-1.5 text-xs font-bold" style={{ color: "var(--text-muted, #94a3b8)" }}><Shield size={13} className="text-emerald-400" />Age rating</span>
          {AGE_GROUPS.map(([l, v]) => (
            <button key={v} onClick={() => setAge((p) => (p === v ? "" : v))} aria-pressed={age === v}
              className="px-3 py-1.5 rounded-lg text-xs font-semibold transition-colors"
              style={{
                background: age === v ? "rgba(74,222,128,.16)" : "var(--bg-card, rgba(255,255,255,.04))",
                border: `1px solid ${age === v ? "rgba(74,222,128,.4)" : "var(--border-subtle, rgba(255,255,255,.08))"}`,
                color: age === v ? "#4ade80" : "var(--text-muted, rgba(255,255,255,.6))",
              }}>{l}</button>
          ))}
          <div className="sm:hidden flex p-1 rounded-lg gap-1 ml-auto" style={{ background: "var(--nav-btn-bg, rgba(255,255,255,.05))", border: "1px solid var(--border-subtle, rgba(255,255,255,.1))" }}>
            {[["grid", LayoutGrid], ["list", LayoutList]].map(([k, I]) => (
              <button key={k} onClick={() => setView(k)} aria-label={`${k} view`}
                className="w-8 h-8 rounded-md grid place-items-center"
                style={{ background: view === k ? "rgba(251,191,36,.2)" : "transparent", color: view === k ? ACCENT : "var(--text-muted, rgba(255,255,255,.4))" }}>
                <I size={14} />
              </button>
            ))}
          </div>
        </div>
      </div>

      <main className="w-full max-w-[1920px] mx-auto px-4 sm:px-8 xl:px-14 pb-8 sm:pb-10 grid gap-6 xl:grid-cols-[1fr_280px] items-start">
        <div>
          {!loading && !error && anime.length > 0 && (
            <p className="text-sm mb-5" style={{ color: "var(--text-muted, #94a3b8)" }}>
              <span className="font-bold tabular-nums" style={{ color: "var(--text-heading, #fff)" }}>{anime.length}</span> titles in <span style={{ color: active.color }}>{active.label}</span>
            </p>
          )}

          {loading && (
            view === "grid" ? (
              <div className={GRID}>{Array.from({ length: PAGE_SIZE }).map((_, i) => <Skeleton key={i} />)}</div>
            ) : (
              <div className="space-y-2">{Array.from({ length: 12 }).map((_, i) => <ListSkeleton key={i} />)}</div>
            )
          )}

          {error && !loading && (
            <div className="py-24 text-center">
              <p className="text-lg font-bold" style={{ color: "var(--text-heading, #fff)" }}>Couldn't load anime</p>
              <p className="text-sm mt-1" style={{ color: "var(--text-muted, #94a3b8)" }}>Check your connection, then try again.</p>
              <button onClick={() => load(1, false)} className="mt-5 inline-flex items-center gap-2 px-5 py-2.5 rounded-lg text-sm font-semibold text-black" style={{ background: ACCENT }}>
                <RefreshCw size={14} /> Retry
              </button>
            </div>
          )}

          {!loading && !error && anime.length === 0 && (
            <div className="py-24 text-center">
              <p className="text-lg font-bold" style={{ color: "var(--text-heading, #fff)" }}>No titles match</p>
              <p className="text-sm mt-1" style={{ color: "var(--text-muted, #94a3b8)" }}>Try a different category or remove the age filter.</p>
              {age && <button onClick={() => setAge("")} className="mt-5 px-5 py-2.5 rounded-lg text-sm font-semibold text-black" style={{ background: ACCENT }}>Clear age filter</button>}
            </div>
          )}

          {!loading && !error && anime.length > 0 && (
            <>
              {view === "grid" ? (
                <div className={GRID}>{anime.map((a, i) => <AnimeCard key={`${a.mal_id}-${i}`} anime={a} index={i % PAGE_SIZE} />)}</div>
              ) : (
                <div className="space-y-2">{anime.map((a, i) => <ListRow key={`${a.mal_id}-${i}`} anime={a} index={i} />)}</div>
              )}
              {hasMore && (
                <div className="flex justify-center mt-10">
                  <button onClick={() => load(page + 1, true)} disabled={loadingMore}
                    className="inline-flex items-center gap-2 px-7 py-3 rounded-xl text-sm font-bold border transition-colors hover:bg-amber-400/10 disabled:opacity-60"
                    style={{ color: ACCENT, borderColor: "rgba(251,191,36,.4)" }}>
                    {loadingMore ? <><RefreshCw size={14} className="animate-spin" /> Loading</> : <>Discover more <ChevronRight size={14} /></>}
                  </button>
                </div>
              )}
            </>
          )}
        </div>

        {/* genre mix — sticky side panel on wide screens */}
        <aside className="xl:sticky xl:top-6 rounded-2xl p-5" style={{ background: "var(--bg-card, rgba(16,16,32,.85))", border: "1px solid var(--border-subtle, rgba(255,255,255,.07))" }}>
          <h2 className="text-sm font-bold mb-1" style={{ color: "var(--text-heading, #fff)" }}>Genre mix</h2>
          <p className="text-xs mb-4" style={{ color: "var(--text-muted, #94a3b8)" }}>Across the {anime.length || 0} loaded titles.</p>
          {genreMix.length === 0 ? (
            <p className="text-xs" style={{ color: "var(--text-subtle, #64748b)" }}>Nothing to show yet.</p>
          ) : (
            <div className="space-y-2.5">
              {genreMix.map(([name, n]) => (
                <div key={name}>
                  <div className="flex justify-between text-xs mb-1"><span style={{ color: "var(--text-main, #cbd5e1)" }}>{name}</span><span style={{ color: "var(--text-muted, #94a3b8)" }} className="tabular-nums">{n}</span></div>
                  <div className="h-1.5 rounded-full overflow-hidden" style={{ background: "var(--border-subtle, rgba(255,255,255,.05))" }}>
                    <motion.div className="h-full rounded-full" style={{ background: active.color }}
                      initial={{ width: 0 }} animate={{ width: `${(n / maxCount) * 100}%` }} transition={{ duration: 0.5 }} />
                  </div>
                </div>
              ))}
            </div>
          )}
        </aside>
      </main>
    </div>
  );
};

export default Kids;