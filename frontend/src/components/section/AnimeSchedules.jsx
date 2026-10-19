// src/components/section/AnimeSchedules.jsx
import { useState, useEffect, useCallback, useRef } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Link } from "react-router-dom";
import { Clock, Star, RefreshCw, Tv, Radio, LayoutGrid, LayoutList, Zap } from "lucide-react";
import { animeService } from "../../services/animeService";
import ScrollRope from "../ui/ScrollRope";

const ACCENT = "#a5b4fc";

const DAYS = [
  { key: "monday", label: "Mon", full: "Monday" }, { key: "tuesday", label: "Tue", full: "Tuesday" },
  { key: "wednesday", label: "Wed", full: "Wednesday" }, { key: "thursday", label: "Thu", full: "Thursday" },
  { key: "friday", label: "Fri", full: "Friday" }, { key: "saturday", label: "Sat", full: "Saturday" },
  { key: "sunday", label: "Sun", full: "Sunday" },
];
const getTodayKey = () => { const d = new Date().getDay(); return DAYS[d === 0 ? 6 : d - 1].key; };
const parseJSTTime = (str) => str?.match(/(\d{1,2}:\d{2})/)?.[1] ?? null;
const jstToLocal = (hhmm) => {
  if (!hhmm) return null;
  try {
    const [h, m] = hhmm.split(":").map(Number);
    const now = new Date();
    const utc = new Date(Date.UTC(now.getFullYear(), now.getMonth(), now.getDate(), h - 9, m));
    return utc.toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" });
  } catch { return hhmm; }
};

const fetchAllPagesForDay = async (dayKey) => {
  const first = await animeService.getSchedulePage(dayKey, 1);
  const lastPage = first?.pagination?.last_visible_page ?? 1;
  let allItems = [...(first?.data ?? [])];
  if (lastPage > 1) {
    for (let pg = 2; pg <= lastPage; pg++) {
      try {
        const res = await animeService.getSchedulePage(dayKey, pg);
        allItems = [...allItems, ...(res?.data ?? [])];
      } catch { break; }
    }
  }
  const sorted = [...allItems].sort((a, b) => (parseJSTTime(a.broadcast?.string) ?? "99:99").localeCompare(parseJSTTime(b.broadcast?.string) ?? "99:99"));
  const seen = new Set();
  return sorted.filter((a) => (seen.has(a.mal_id) ? false : (seen.add(a.mal_id), true)));
};

const Skeleton = () => (
  <div className="space-y-2">
    <div className="w-full rounded-xl animate-pulse bg-white/5" style={{ aspectRatio: "2/3" }} />
    <div className="h-2.5 w-4/5 rounded-full animate-pulse bg-white/5" />
    <div className="h-2 w-1/2 rounded-full animate-pulse bg-white/[.03]" />
  </div>
);
const ListSkeleton = () => (
  <div className="flex items-center gap-3 p-3 rounded-xl animate-pulse" style={{ background: "rgba(255,255,255,.03)" }}>
    <div className="w-11 h-15 rounded-lg bg-white/5 flex-shrink-0" style={{ height: 60 }} />
    <div className="flex-1 space-y-2"><div className="h-2.5 w-3/5 rounded-full bg-white/5" /><div className="h-2 w-2/5 rounded-full bg-white/[.03]" /></div>
  </div>
);

const GridCard = ({ anime, index, isToday }) => {
  const img = anime.images?.jpg?.large_image_url || anime.images?.jpg?.image_url;
  const title = anime.title_english || anime.title;
  const localTime = jstToLocal(parseJSTTime(anime.broadcast?.string));
  const eps = anime.aired_episodes ?? anime.episodes ?? null;
  return (
    <Link to={`/anime/${anime.mal_id}`}
      className="group block rounded-xl overflow-hidden transition-colors"
      style={{ background: "var(--card-bg, rgba(255,255,255,.025))", border: `1px solid ${isToday ? "var(--color-primary, rgba(165,180,252,.4))" : "var(--border-subtle, rgba(255,255,255,.07))"}` }}>
      <div className="relative" style={{ aspectRatio: "2/3" }}>
        <img src={img} alt={title} loading="lazy" className="w-full h-full object-cover transition-transform duration-300 group-hover:scale-105" />
        <div className="absolute inset-0 pointer-events-none" style={{ background: "linear-gradient(to top,rgba(10,10,20,.82),transparent 55%)" }} />
        {localTime && (
          <span className="absolute top-2 left-2 inline-flex items-center gap-1 px-1.5 py-0.5 rounded-md text-[10px] font-bold backdrop-blur-md" style={{ background: "rgba(0,0,0,.7)", color: ACCENT }}>
            <Clock size={9} />{localTime}
          </span>
        )}
        {anime.airing && (
          <span className="absolute top-2 right-2 inline-flex items-center gap-1 px-1.5 py-0.5 rounded-md text-[9px] font-bold backdrop-blur-md text-emerald-300" style={{ background: "rgba(74,222,128,.18)" }}>
            <span className="w-1.5 h-1.5 rounded-full bg-emerald-400" style={{ boxShadow: "0 0 4px #4ade80" }} />LIVE
          </span>
        )}
        {anime.score && (
          <span className="absolute bottom-2 right-2 inline-flex items-center gap-1 px-1.5 py-0.5 rounded-md text-[10px] font-bold backdrop-blur-md text-white" style={{ background: "rgba(0,0,0,.7)" }}>
            <Star size={9} fill="#fbbf24" stroke="#fbbf24" />{anime.score.toFixed(1)}
          </span>
        )}
        {eps !== null && (
          <span className="absolute bottom-2 left-2 px-1.5 py-0.5 rounded-md text-[10px] font-bold backdrop-blur-md text-emerald-300" style={{ background: "rgba(0,0,0,.7)" }}>
            {anime.aired_episodes !== null && anime.aired_episodes !== undefined ? `EP ${eps}` : `${eps} eps`}
          </span>
        )}
      </div>
      <div className="p-2.5">
        <p className="font-semibold leading-snug line-clamp-2 text-[12px] transition-colors" style={{ color: "var(--text-heading, #fff)" }}>{title}</p>
        {anime.genres?.[0] && <span className="mt-1.5 inline-block text-[10px]" style={{ color: "var(--color-primary, #a5b4fc)" }}>{anime.genres[0].name}</span>}
      </div>
    </Link>
  );
};

const ListRow = ({ anime, index, isToday }) => {
  const img = anime.images?.jpg?.large_image_url || anime.images?.jpg?.image_url;
  const title = anime.title_english || anime.title;
  const localTime = jstToLocal(parseJSTTime(anime.broadcast?.string));
  const eps = anime.aired_episodes ?? anime.episodes ?? null;
  return (
    <Link to={`/anime/${anime.mal_id}`}
      className="group flex items-center gap-4 p-3 rounded-xl transition-colors hover:bg-white/[.05]"
      style={{ background: "var(--card-bg, rgba(255,255,255,.025))", border: `1px solid ${isToday ? "var(--color-primary, rgba(165,180,252,.4))" : "var(--border-subtle, rgba(255,255,255,.06))"}` }}>
      <span className="w-7 text-center text-xs font-bold tabular-nums" style={{ color: index < 3 ? "#fbbf24" : "var(--text-subtle, rgba(255,255,255,.3))" }}>{index + 1}</span>
      <img src={img} alt="" loading="lazy" className="w-12 h-16 rounded-lg object-cover flex-shrink-0" />
      <div className="flex-1 min-w-0">
        <p className="font-semibold text-sm truncate transition-colors" style={{ color: "var(--text-heading, #fff)" }}>{title}</p>
        <div className="flex items-center gap-2 mt-1 text-[11px] flex-wrap" style={{ color: "var(--text-muted, #94a3b8)" }}>
          {localTime && <span className="inline-flex items-center gap-1" style={{ color: "var(--color-primary, #a5b4fc)" }}><Clock size={9} />{localTime}</span>}
          {eps !== null && <span className="inline-flex items-center gap-1"><Tv size={9} />{eps} eps</span>}
          {anime.airing && <span className="inline-flex items-center gap-1 text-emerald-400 font-bold"><span className="w-1.5 h-1.5 rounded-full bg-emerald-400" />Airing</span>}
          {anime.genres?.slice(0, 2).map((g) => <span key={g.mal_id} style={{ color: "var(--color-primary, #a5b4fc)", opacity: 0.8 }}>{g.name}</span>)}
        </div>
      </div>
      {anime.score && <span className="inline-flex items-center gap-1 text-sm font-bold tabular-nums flex-shrink-0" style={{ color: "var(--text-heading, #fff)" }}><Star size={11} fill="#fbbf24" stroke="#fbbf24" />{anime.score.toFixed(1)}</span>}
    </Link>
  );
};

const AnimeSchedules = () => {
  const todayKey = getTodayKey();
  const [activeDay, setActiveDay] = useState(todayKey);
  const [schedule, setSchedule] = useState({});
  const [dayCounts, setDayCounts] = useState({});
  const [loadedDays, setLoadedDays] = useState(new Set());
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(false);
  const [view, setView] = useState("grid");
  const fetchingRef = useRef(new Set());

  const fetchDay = useCallback(async (dayKey, showLoader = true) => {
    if (fetchingRef.current.has(dayKey)) return;
    fetchingRef.current.add(dayKey);
    if (showLoader) setLoading(true);
    setError(false);
    try {
      const items = await fetchAllPagesForDay(dayKey);
      setSchedule((p) => ({ ...p, [dayKey]: items }));
      setDayCounts((p) => ({ ...p, [dayKey]: items.length }));
      setLoadedDays((p) => new Set([...p, dayKey]));
    } catch (err) {
      if (!err?.cancelled) setError(true);
    } finally {
      setLoading(false);
      fetchingRef.current.delete(dayKey);
    }
  }, []);

  useEffect(() => {
    if (loadedDays.has(activeDay)) { setLoading(false); return; }
    fetchDay(activeDay, true);
  }, [activeDay, fetchDay, loadedDays]);

  useEffect(() => {
    if (!loadedDays.has(activeDay)) return;
    const idx = DAYS.findIndex((d) => d.key === activeDay);
    [DAYS[(idx + 6) % 7].key, DAYS[(idx + 1) % 7].key].forEach((k) => { if (!loadedDays.has(k)) fetchDay(k, false); });
  }, [activeDay, loadedDays, fetchDay]);

  const refreshActiveDay = useCallback(() => {
    animeService.invalidateSchedule(activeDay);
    fetchingRef.current.delete(activeDay);
    setSchedule((p) => { const n = { ...p }; delete n[activeDay]; return n; });
    setLoadedDays((p) => { const s = new Set(p); s.delete(activeDay); return s; });
    setError(false);
  }, [activeDay]);

  const activeData = schedule[activeDay] ?? [];
  const activeDayObj = DAYS.find((d) => d.key === activeDay);
  const GRID = "grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-6 2xl:grid-cols-8 gap-4";

  return (
    <div className="w-full" style={{ background: "var(--bg-main, #0a0a14)" }}>
      <header className="w-full border-b" style={{ borderColor: "var(--border-subtle, rgba(255,255,255,.05))", background: "linear-gradient(180deg,rgba(99,102,241,.06),transparent)" }}>
        <div className="w-full max-w-[1920px] mx-auto px-4 sm:px-8 xl:px-14 py-8 sm:py-12 flex flex-col sm:flex-row sm:items-end justify-between gap-5">
          <div>
            <div className="flex items-center gap-2.5">
              <h1 className="font-extrabold tracking-tight" style={{ fontSize: "clamp(28px,4.5vw,48px)", lineHeight: 1.05, color: "var(--text-heading, #fff)" }}>Anime Schedule</h1>
              <span className="inline-flex items-center gap-1 text-[11px] font-bold px-2 py-1 rounded-full text-emerald-400" style={{ background: "rgba(74,222,128,.14)", border: "1px solid rgba(74,222,128,.3)" }}>
                <Radio size={9} />Live
              </span>
            </div>
            <p className="mt-2 text-sm sm:text-base max-w-xl" style={{ color: "var(--text-muted, #94a3b8)" }}>Weekly broadcast schedule, converted to your local timezone.</p>
          </div>
          <div className="hidden sm:flex p-1 rounded-xl gap-1" style={{ background: "var(--nav-btn-bg, rgba(255,255,255,.05))", border: "1px solid var(--border-subtle, rgba(255,255,255,.1))" }} role="group" aria-label="Layout">
            {[["grid", LayoutGrid], ["list", LayoutList]].map(([k, I]) => (
              <button key={k} onClick={() => setView(k)} aria-label={`${k} view`} aria-pressed={view === k}
                className="w-9 h-9 rounded-lg grid place-items-center transition-colors"
                style={{ background: view === k ? "var(--nav-link-active-bg, rgba(165,180,252,.2))" : "transparent", color: view === k ? "var(--color-primary, #a5b4fc)" : "var(--text-muted, rgba(255,255,255,.4))" }}>
                <I size={15} />
              </button>
            ))}
          </div>
        </div>
      </header>

      <div className="sticky top-0 z-30 w-full backdrop-blur-xl border-b" style={{ background: "var(--nav-bg, rgba(10,10,20,.85))", borderColor: "var(--border-subtle, rgba(255,255,255,.05))" }}>
        <div className="w-full max-w-[1920px] mx-auto px-4 sm:px-8 xl:px-14 py-3 flex items-center gap-2">
          <nav className="flex-1 flex gap-1.5 overflow-x-auto" style={{ scrollbarWidth: "none" }} aria-label="Day of week">
            {DAYS.map((day) => {
              const on = activeDay === day.key;
              const today = todayKey === day.key;
              return (
                <button key={day.key} onClick={() => setActiveDay(day.key)} aria-current={on}
                  className="relative flex items-center gap-1.5 px-3.5 py-2 rounded-lg text-xs font-bold whitespace-nowrap transition-colors flex-shrink-0"
                  style={{
                    background: on ? "var(--nav-link-active-bg, rgba(165,180,252,.16))" : today ? "var(--nav-btn-bg, rgba(165,180,252,.06))" : "transparent",
                    color: on ? "var(--color-primary, #a5b4fc)" : today ? "var(--color-primary, rgba(165,180,252,.7))" : "var(--text-muted, rgba(255,255,255,.5))",
                    border: `1px solid ${on ? "var(--border-accent, rgba(165,180,252,.45))" : "transparent"}`,
                  }}>
                  {today && <span className="w-1.5 h-1.5 rounded-full bg-emerald-400" style={{ boxShadow: "0 0 5px #4ade80" }} />}
                  {day.label}
                  {dayCounts[day.key] != null && <span className="text-[10px] font-bold opacity-60">{dayCounts[day.key]}</span>}
                </button>
              );
            })}
          </nav>
          {activeDay !== todayKey && (
            <button onClick={() => setActiveDay(todayKey)} className="inline-flex items-center gap-1.5 px-3 py-2 rounded-lg text-xs font-bold text-emerald-400 flex-shrink-0" style={{ background: "rgba(74,222,128,.12)", border: "1px solid rgba(74,222,128,.25)" }}>
              <Zap size={11} />Today
            </button>
          )}
          <button onClick={refreshActiveDay} aria-label="Refresh" className="w-9 h-9 rounded-lg grid place-items-center flex-shrink-0" style={{ color: "var(--text-muted, #94a3b8)", background: "var(--nav-btn-bg, rgba(255,255,255,.05))", border: "1px solid var(--border-subtle, rgba(255,255,255,.1))" }}>
            <RefreshCw size={14} />
          </button>
        </div>
      </div>

      <main className="w-full max-w-[1920px] mx-auto px-4 sm:px-8 xl:px-14 py-6 sm:py-8">
        {!loading && !error && (
          <p className="text-sm text-slate-400 mb-5">
            <span className="font-bold text-white">{activeDayObj?.full}</span>{activeDay === todayKey && <span className="text-emerald-400"> · today</span>}
            {activeData.length > 0 && <span> · <span className="tabular-nums font-bold text-white">{activeData.length}</span> titles</span>}
          </p>
        )}

        {loading && (
          <div className={view === "grid" ? GRID : "grid gap-2"}>
            {Array.from({ length: view === "grid" ? 18 : 10 }).map((_, i) => view === "grid" ? <Skeleton key={i} /> : <ListSkeleton key={i} />)}
          </div>
        )}

        {error && !loading && (
          <div className="py-24 text-center">
            <p className="text-lg font-bold text-white">Couldn't load the {activeDayObj?.full} schedule</p>
            <p className="text-sm text-slate-400 mt-1">Jikan may be rate-limiting — wait a moment, then retry.</p>
            <button onClick={refreshActiveDay} className="mt-5 inline-flex items-center gap-2 px-5 py-2.5 rounded-lg text-sm font-semibold text-black" style={{ background: ACCENT }}>
              <RefreshCw size={14} />Retry
            </button>
          </div>
        )}

        {!loading && !error && activeData.length === 0 && (
          <div className="py-24 text-center">
            <p className="text-lg font-bold text-white">No schedule for {activeDayObj?.full}</p>
            <p className="text-sm text-slate-400 mt-1">Nothing is listed for this day yet.</p>
            <button onClick={() => setActiveDay(todayKey)} className="mt-5 inline-flex items-center gap-2 px-5 py-2.5 rounded-lg text-sm font-semibold text-black" style={{ background: ACCENT }}>
              <Zap size={14} />Jump to today
            </button>
          </div>
        )}

        {!loading && !error && activeData.length > 0 && (
          <>
            {view === "grid" ? (
              <div className={GRID}>{activeData.map((a, i) => <GridCard key={`${a.mal_id}-${i}`} anime={a} index={i} isToday={activeDay === todayKey} />)}</div>
            ) : (
              <div className="grid gap-2 xl:grid-cols-2">{activeData.map((a, i) => <ListRow key={`${a.mal_id}-${i}`} anime={a} index={i} isToday={activeDay === todayKey} />)}</div>
            )}
            <p className="flex items-center justify-center gap-2 mt-10 py-3 text-[11px] text-slate-500">
              <Clock size={11} />Air times shown in your local timezone · Powered by Jikan / MyAnimeList
            </p>
          </>
        )}
      </main>
    </div>
  );
};

export default AnimeSchedules;