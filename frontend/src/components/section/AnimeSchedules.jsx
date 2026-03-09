// AnimeSchedules.jsx
import { useState, useEffect, useCallback, useRef } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Link } from "react-router-dom";
import {
  CalendarDays, Clock, Star, RefreshCw,
  Tv, Radio, LayoutGrid, LayoutList, Zap,
} from "lucide-react";
import { animeService } from "../../services/animeService";

/* ══════════════════════════════════════════════════════════
   CONSTANTS
══════════════════════════════════════════════════════════ */
const DAYS = [
  { key: "monday",    label: "Mon", full: "Monday"    },
  { key: "tuesday",   label: "Tue", full: "Tuesday"   },
  { key: "wednesday", label: "Wed", full: "Wednesday" },
  { key: "thursday",  label: "Thu", full: "Thursday"  },
  { key: "friday",    label: "Fri", full: "Friday"    },
  { key: "saturday",  label: "Sat", full: "Saturday"  },
  { key: "sunday",    label: "Sun", full: "Sunday"    },
];

const getTodayKey = () => {
  const jsDay = new Date().getDay();          // 0 = Sun
  const idx   = jsDay === 0 ? 6 : jsDay - 1; // Mon = 0 … Sun = 6
  return DAYS[idx].key;
};

/* "Sundays at 23:00 (JST)"  →  "23:00" */
const parseJSTTime = (str) => {
  if (!str) return null;
  const m = str.match(/(\d{1,2}:\d{2})/);
  return m ? m[1] : null;
};

/* JST "HH:MM"  →  viewer's local time string */
const jstToLocal = (hhmm) => {
  if (!hhmm) return null;
  try {
    const [h, m] = hhmm.split(":").map(Number);
    const now    = new Date();
    const utc    = new Date(
      Date.UTC(now.getFullYear(), now.getMonth(), now.getDate(), h - 9, m)
    );
    return utc.toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" });
  } catch {
    return hhmm;
  }
};

/* ══════════════════════════════════════════════════════════
   FETCH ALL PAGES FOR ONE DAY
   Uses the new getSchedulePage(day, page) method so every
   page goes through the service queue + cache correctly.
══════════════════════════════════════════════════════════ */
const fetchAllPagesForDay = async (dayKey) => {
  /* page 1 — discover total pages */
  const first     = await animeService.getSchedulePage(dayKey, 1);
  const lastPage  = first?.pagination?.last_visible_page ?? 1;
  let   allItems  = [...(first?.data ?? [])];

  /* pages 2 … N — sequential to respect the 1 req/s queue */
  if (lastPage > 1) {
    for (let pg = 2; pg <= lastPage; pg++) {
      try {
        const res   = await animeService.getSchedulePage(dayKey, pg);
        const items = res?.data ?? [];
        allItems    = [...allItems, ...items];
      } catch {
        /* skip failed extra pages — first page is enough for display */
        break;
      }
    }
  }

  /* sort by JST air time, deduplicate */
  const sorted = [...allItems].sort((a, b) => {
    const ta = parseJSTTime(a.broadcast?.string) ?? "99:99";
    const tb = parseJSTTime(b.broadcast?.string) ?? "99:99";
    return ta.localeCompare(tb);
  });

  const seen  = new Set();
  return sorted.filter(a => {
    if (seen.has(a.mal_id)) return false;
    seen.add(a.mal_id);
    return true;
  });
};

/* ══════════════════════════════════════════════════════════
   SKELETONS
══════════════════════════════════════════════════════════ */
const CardSkeleton = ({ index }) => (
  <motion.div
    initial={{ opacity: 0 }}
    animate={{ opacity: 1 }}
    transition={{ delay: index * 0.025 }}
    className="rounded-2xl overflow-hidden animate-pulse"
    style={{
      background: "rgba(255,255,255,.04)",
      border:     "1px solid rgba(255,255,255,.07)",
    }}
  >
    <div style={{ aspectRatio: "2/3", background: "rgba(255,255,255,.07)" }} />
    <div className="p-2.5 space-y-2">
      <div className="h-2.5 rounded-full"
           style={{ width: "80%", background: "rgba(255,255,255,.06)" }} />
      <div className="h-2 rounded-full"
           style={{ width: "55%", background: "rgba(255,255,255,.04)" }} />
      <div className="h-2 rounded-full"
           style={{ width: "40%", background: "rgba(255,255,255,.04)" }} />
    </div>
  </motion.div>
);

const ListSkeleton = ({ index }) => (
  <motion.div
    initial={{ opacity: 0 }}
    animate={{ opacity: 1 }}
    transition={{ delay: index * 0.02 }}
    className="flex items-center gap-3 p-3 rounded-2xl animate-pulse"
    style={{
      background: "rgba(255,255,255,.03)",
      border:     "1px solid rgba(255,255,255,.06)",
    }}
  >
    <div className="flex-shrink-0 rounded-xl"
         style={{ width: 46, height: 62, background: "rgba(255,255,255,.07)" }} />
    <div className="flex-1 space-y-2">
      <div className="h-2.5 rounded-full"
           style={{ width: "65%", background: "rgba(255,255,255,.06)" }} />
      <div className="h-2 rounded-full"
           style={{ width: "40%", background: "rgba(255,255,255,.04)" }} />
      <div className="h-2 rounded-full"
           style={{ width: "30%", background: "rgba(255,255,255,.04)" }} />
    </div>
    <div className="h-5 w-12 rounded-lg"
         style={{ background: "rgba(255,255,255,.05)" }} />
  </motion.div>
);

/* ══════════════════════════════════════════════════════════
   GRID CARD
══════════════════════════════════════════════════════════ */
const AnimeGridCard = ({ anime, index, isToday }) => {
  const [hov, setHov] = useState(false);
  const img       = anime.images?.jpg?.large_image_url
                 || anime.images?.jpg?.image_url;
  const title     = anime.title_english || anime.title;
  const localTime = jstToLocal(parseJSTTime(anime.broadcast?.string));
  const totalEps  = anime.episodes      ?? null;
  const airedEps  = anime.aired_episodes ?? null;

  return (
    <motion.div
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: Math.min(index * 0.028, 0.7) }}
    >
      <Link
        to={`/anime/${anime.mal_id}`}
        onMouseEnter={() => setHov(true)}
        onMouseLeave={() => setHov(false)}
        className="block rounded-2xl overflow-hidden transition-all duration-300"
        style={{
          background: hov ? "rgba(255,255,255,.07)" : "rgba(255,255,255,.03)",
          border: `1px solid ${
            hov
              ? isToday ? "rgba(99,102,241,.50)" : "rgba(255,255,255,.20)"
              : isToday ? "rgba(99,102,241,.18)" : "rgba(255,255,255,.07)"
          }`,
          transform: hov ? "translateY(-4px)" : "translateY(0)",
          boxShadow: hov
            ? isToday
              ? "0 14px 36px rgba(99,102,241,.20)"
              : "0 14px 28px rgba(0,0,0,.40)"
            : "none",
        }}
      >
        {/* poster */}
        <div className="relative overflow-hidden" style={{ aspectRatio: "2/3" }}>
          <img
            src={img}
            alt={title}
            className="w-full h-full object-cover transition-transform duration-500"
            style={{ transform: hov ? "scale(1.07)" : "scale(1)" }}
            loading="lazy"
          />

          {/* dark gradient */}
          <div
            className="absolute inset-0 pointer-events-none"
            style={{
              background:
                "linear-gradient(to top,rgba(10,10,20,.82) 0%,transparent 52%)",
            }}
          />

          {/* air time — top left */}
          {localTime && (
            <div
              className="absolute top-2 left-2 flex items-center gap-1
                         px-1.5 py-0.5 rounded-lg backdrop-blur-md"
              style={{
                background: "rgba(0,0,0,.68)",
                border:     "1px solid rgba(165,180,252,.25)",
              }}
            >
              <Clock size={9} style={{ color: "#a5b4fc" }} />
              <span className="text-[9px] font-bold text-white">{localTime}</span>
            </div>
          )}

          {/* airing — top right */}
          {anime.airing && (
            <div
              className="absolute top-2 right-2 flex items-center gap-1
                         px-1.5 py-0.5 rounded-lg backdrop-blur-md"
              style={{
                background: "rgba(74,222,128,.18)",
                border:     "1px solid rgba(74,222,128,.32)",
              }}
            >
              <span
                className="w-1.5 h-1.5 rounded-full bg-green-400"
                style={{ boxShadow: "0 0 4px #4ade80" }}
              />
              <span className="text-[9px] font-bold" style={{ color: "#4ade80" }}>
                LIVE
              </span>
            </div>
          )}

          {/* score — bottom right */}
          {anime.score && (
            <div
              className="absolute bottom-2 right-2 flex items-center gap-1
                         px-1.5 py-0.5 rounded-lg backdrop-blur-md"
              style={{
                background: "rgba(0,0,0,.68)",
                border:     "1px solid rgba(251,191,36,.28)",
              }}
            >
              <Star size={9} style={{ color: "#fbbf24", fill: "#fbbf24" }} />
              <span className="text-[9px] font-black text-white">
                {anime.score.toFixed(1)}
              </span>
            </div>
          )}

          {/* episode — bottom left */}
          {(airedEps !== null || totalEps !== null) && (
            <div
              className="absolute bottom-2 left-2 px-1.5 py-0.5 rounded-lg backdrop-blur-md"
              style={{
                background: "rgba(0,0,0,.68)",
                border:     "1px solid rgba(74,222,128,.22)",
              }}
            >
              <span className="text-[9px] font-bold" style={{ color: "#4ade80" }}>
                {airedEps !== null ? `EP ${airedEps}` : `${totalEps} eps`}
              </span>
            </div>
          )}
        </div>

        {/* info */}
        <div className="p-2.5">
          <p
            className="font-bold line-clamp-2 leading-snug mb-1.5
                       transition-colors duration-200"
            style={{ fontSize: 11, color: hov ? "#a5b4fc" : "#e2e8f0" }}
          >
            {title}
          </p>
          <div className="flex items-center gap-1.5 flex-wrap">
            {anime.genres?.slice(0, 1).map(g => (
              <span
                key={g.mal_id}
                className="text-[8px] font-semibold px-1.5 py-0.5 rounded-md"
                style={{
                  background: "rgba(99,102,241,.10)",
                  border:     "1px solid rgba(99,102,241,.18)",
                  color:      "rgba(165,180,252,.70)",
                }}
              >
                {g.name}
              </span>
            ))}
            {anime.type && (
              <span
                className="text-[8px] font-semibold px-1.5 py-0.5 rounded-md"
                style={{
                  background: "rgba(255,255,255,.05)",
                  border:     "1px solid rgba(255,255,255,.08)",
                  color:      "rgba(148,163,184,.55)",
                }}
              >
                {anime.type}
              </span>
            )}
          </div>
        </div>
      </Link>
    </motion.div>
  );
};

/* ══════════════════════════════════════════════════════════
   LIST ROW
══════════════════════════════════════════════════════════ */
const AnimeListRow = ({ anime, index, isToday }) => {
  const [hov, setHov] = useState(false);
  const img       = anime.images?.jpg?.large_image_url
                 || anime.images?.jpg?.image_url;
  const title     = anime.title_english || anime.title;
  const localTime = jstToLocal(parseJSTTime(anime.broadcast?.string));
  const totalEps  = anime.episodes      ?? null;
  const airedEps  = anime.aired_episodes ?? null;

  return (
    <motion.div
      initial={{ opacity: 0, y: 6 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: Math.min(index * 0.022, 0.55) }}
    >
      <Link
        to={`/anime/${anime.mal_id}`}
        onMouseEnter={() => setHov(true)}
        onMouseLeave={() => setHov(false)}
        className="flex items-center gap-3 p-3 rounded-2xl transition-all duration-200"
        style={{
          background: hov ? "rgba(255,255,255,.06)" : "rgba(255,255,255,.025)",
          border: `1px solid ${
            hov
              ? isToday ? "rgba(99,102,241,.38)" : "rgba(255,255,255,.16)"
              : isToday ? "rgba(99,102,241,.14)" : "rgba(255,255,255,.06)"
          }`,
          transform: hov ? "scale(1.008)" : "scale(1)",
        }}
      >
        {/* rank */}
        <span
          className="flex-shrink-0 w-6 text-center font-black"
          style={{
            fontSize: 10,
            color:
              index === 0 ? "#fbbf24" :
              index === 1 ? "#94a3b8" :
              index === 2 ? "#fb923c" :
              "rgba(148,163,184,.22)",
          }}
        >
          {index < 3 ? ["🥇","🥈","🥉"][index] : index + 1}
        </span>

        {/* thumb */}
        <div
          className="flex-shrink-0 rounded-xl overflow-hidden"
          style={{ width: 46, height: 62, border: "1px solid rgba(255,255,255,.08)" }}
        >
          <img
            src={img}
            alt={title}
            className="w-full h-full object-cover"
            style={{
              transform:  hov ? "scale(1.09)" : "scale(1)",
              transition: "transform .4s",
            }}
            loading="lazy"
          />
        </div>

        {/* info */}
        <div className="flex-1 min-w-0">
          <p
            className="font-bold line-clamp-1 mb-1 transition-colors duration-200"
            style={{
              fontSize: "clamp(11px,1.8vw,13px)",
              color: hov ? "#a5b4fc" : "#e2e8f0",
            }}
          >
            {title}
          </p>

          <div className="flex items-center gap-1.5 flex-wrap">
            {localTime && (
              <span
                className="flex items-center gap-1 text-[10px] font-semibold
                           px-1.5 py-0.5 rounded-lg"
                style={{
                  background: "rgba(99,102,241,.10)",
                  border:     "1px solid rgba(99,102,241,.22)",
                  color:      "#a5b4fc",
                }}
              >
                <Clock size={8} /> {localTime}
              </span>
            )}

            {(airedEps !== null || totalEps !== null) && (
              <span
                className="flex items-center gap-1 text-[10px] font-semibold
                           px-1.5 py-0.5 rounded-lg"
                style={{
                  background: "rgba(74,222,128,.08)",
                  border:     "1px solid rgba(74,222,128,.20)",
                  color:      "#4ade80",
                }}
              >
                <Tv size={8} />
                {airedEps !== null ? `EP ${airedEps}` : `${totalEps} eps`}
              </span>
            )}

            {anime.airing && (
              <span
                className="flex items-center gap-1 text-[9px] font-bold
                           px-1.5 py-0.5 rounded-full"
                style={{
                  background: "rgba(74,222,128,.10)",
                  border:     "1px solid rgba(74,222,128,.22)",
                  color:      "#4ade80",
                }}
              >
                <span
                  className="w-1.5 h-1.5 rounded-full bg-green-400"
                  style={{ boxShadow: "0 0 4px #4ade80" }}
                />
                Airing
              </span>
            )}

            {anime.genres?.slice(0, 2).map(g => (
              <span
                key={g.mal_id}
                className="text-[9px] font-semibold px-1.5 py-0.5 rounded-md"
                style={{
                  background: "rgba(99,102,241,.08)",
                  border:     "1px solid rgba(99,102,241,.15)",
                  color:      "rgba(165,180,252,.60)",
                }}
              >
                {g.name}
              </span>
            ))}
          </div>
        </div>

        {/* score + type */}
        <div className="flex-shrink-0 flex flex-col items-end gap-1.5">
          {anime.score ? (
            <div className="flex items-center gap-1">
              <Star size={10} style={{ color: "#fbbf24", fill: "#fbbf24" }} />
              <span className="font-black text-white" style={{ fontSize: 12 }}>
                {anime.score.toFixed(1)}
              </span>
            </div>
          ) : (
            <span className="text-[10px]" style={{ color: "rgba(148,163,184,.28)" }}>
              N/A
            </span>
          )}
          {anime.type && (
            <span
              className="text-[8px] font-bold px-1.5 py-0.5 rounded-md"
              style={{
                background: "rgba(255,255,255,.05)",
                border:     "1px solid rgba(255,255,255,.08)",
                color:      "rgba(148,163,184,.50)",
              }}
            >
              {anime.type}
            </span>
          )}
        </div>
      </Link>
    </motion.div>
  );
};

/* ══════════════════════════════════════════════════════════
   DAY TAB
══════════════════════════════════════════════════════════ */
const DayTab = ({ day, active, isToday, count, onClick }) => (
  <button
    onClick={onClick}
    className="relative flex flex-col items-center gap-0.5 px-3 py-2.5 rounded-2xl
               transition-all hover:scale-105 active:scale-95 flex-shrink-0"
    style={{
      minWidth:  56,
      background: active
        ? isToday ? "rgba(99,102,241,.24)" : "rgba(255,255,255,.10)"
        : isToday ? "rgba(99,102,241,.08)" : "rgba(255,255,255,.04)",
      border: active
        ? isToday ? "1px solid rgba(99,102,241,.48)" : "1px solid rgba(255,255,255,.22)"
        : isToday ? "1px solid rgba(99,102,241,.22)" : "1px solid rgba(255,255,255,.07)",
      boxShadow: active && isToday ? "0 0 22px rgba(99,102,241,.22)" : "none",
    }}
  >
    {isToday && (
      <span
        className="absolute -top-1 -right-1 w-2 h-2 rounded-full"
        style={{ background: "#4ade80", boxShadow: "0 0 6px #4ade80" }}
      />
    )}

    <span
      className="text-xs font-black"
      style={{
        color: active
          ? isToday ? "#a5b4fc" : "#fff"
          : isToday ? "rgba(165,180,252,.65)" : "rgba(255,255,255,.42)",
      }}
    >
      {day.label}
    </span>

    {count !== null ? (
      <span
        className="text-[8px] font-bold px-1.5 py-0.5 rounded-full"
        style={{
          background: active
            ? isToday ? "rgba(99,102,241,.32)" : "rgba(255,255,255,.14)"
            : "rgba(255,255,255,.06)",
          color: active
            ? isToday ? "#a5b4fc" : "rgba(255,255,255,.82)"
            : "rgba(148,163,184,.38)",
        }}
      >
        {count}
      </span>
    ) : (
      <span className="text-[8px] opacity-0 select-none">0</span>
    )}
  </button>
);

/* ══════════════════════════════════════════════════════════
   MAIN PAGE
══════════════════════════════════════════════════════════ */
const AnimeSchedules = () => {
  const todayKey = getTodayKey();

  const [activeDay,  setActiveDay]  = useState(todayKey);
  const [schedule,   setSchedule]   = useState({});
  const [dayCounts,  setDayCounts]  = useState({});
  const [loadedDays, setLoadedDays] = useState(new Set());
  const [loading,    setLoading]    = useState(true);
  const [error,      setError]      = useState(false);
  const [viewMode,   setViewMode]   = useState("grid");

  const fetchingRef = useRef(new Set());

  /* ── fetch one day ── */
  const fetchDay = useCallback(async (dayKey, showLoader = true) => {
    if (fetchingRef.current.has(dayKey)) return;
    fetchingRef.current.add(dayKey);

    if (showLoader) setLoading(true);
    setError(false);

    try {
      const items = await fetchAllPagesForDay(dayKey);

      setSchedule(prev  => ({ ...prev,  [dayKey]: items }));
      setDayCounts(prev => ({ ...prev,  [dayKey]: items.length }));
      setLoadedDays(prev => new Set([...prev, dayKey]));
    } catch (err) {
      if (!err?.cancelled) setError(true);
    } finally {
      setLoading(false);
      fetchingRef.current.delete(dayKey);
    }
  }, []);

  /* ── load active day ── */
  useEffect(() => {
    if (loadedDays.has(activeDay)) {
      setLoading(false);
      return;
    }
    fetchDay(activeDay, true);
  }, [activeDay, fetchDay, loadedDays]);

  /* ── prefetch adjacent days silently ── */
  useEffect(() => {
    if (!loadedDays.has(activeDay)) return;
    const idx  = DAYS.findIndex(d => d.key === activeDay);
    const prev = DAYS[(idx + 6) % 7].key;
    const next = DAYS[(idx + 1) % 7].key;
    [prev, next].forEach(k => {
      if (!loadedDays.has(k)) fetchDay(k, false);
    });
  }, [activeDay, loadedDays, fetchDay]);

  /* ── hard refresh for active day ── */
  const refreshActiveDay = useCallback(() => {
    animeService.invalidateSchedule(activeDay);
    fetchingRef.current.delete(activeDay);
    setSchedule(prev => { const n = { ...prev }; delete n[activeDay]; return n; });
    setLoadedDays(prev => { const s = new Set(prev); s.delete(activeDay); return s; });
    setError(false);
  }, [activeDay]);

  const activeData   = schedule[activeDay] ?? [];
  const activeDayObj = DAYS.find(d => d.key === activeDay);

  /* ══════════════════════════════════════════════════════
     RENDER
  ══════════════════════════════════════════════════════ */
  return (
    <div className="min-h-screen" style={{ background: "#0a0a14" }}>
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 sm:py-12">

        {/* ════ HERO ════ */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="relative overflow-hidden rounded-3xl mb-8 sm:mb-10 p-6 sm:p-10"
          style={{
            background: "linear-gradient(135deg,rgba(99,102,241,.14),rgba(168,85,247,.07),rgba(10,10,20,0))",
            border:     "1px solid rgba(99,102,241,.20)",
          }}
        >
          <div className="absolute -top-16 -right-16 w-72 h-72 rounded-full pointer-events-none"
               style={{ background: "rgba(99,102,241,.07)", filter: "blur(70px)" }} />
          <div className="absolute -bottom-16 -left-16 w-64 h-64 rounded-full pointer-events-none"
               style={{ background: "rgba(168,85,247,.05)", filter: "blur(60px)" }} />

          <div className="relative z-10 flex flex-col sm:flex-row sm:items-center gap-4">
            {/* icon */}
            <div
              className="w-14 h-14 sm:w-16 sm:h-16 rounded-2xl flex items-center
                         justify-center flex-shrink-0"
              style={{
                background: "linear-gradient(135deg,rgba(99,102,241,.28),rgba(99,102,241,.12))",
                border:     "1px solid rgba(99,102,241,.38)",
                boxShadow:  "0 0 32px rgba(99,102,241,.22)",
              }}
            >
              <CalendarDays size={28} style={{ color: "#a5b4fc" }} />
            </div>

            {/* text */}
            <div className="flex-1">
              <div className="flex items-center gap-2 mb-1">
                <h1
                  className="font-black text-white"
                  style={{ fontSize: "clamp(22px,5vw,40px)", letterSpacing: "-0.03em" }}
                >
                  Anime Schedule
                </h1>
                <span
                  className="flex items-center gap-1 text-[10px] font-black uppercase
                             px-2 py-0.5 rounded-full"
                  style={{
                    background: "rgba(74,222,128,.16)",
                    color:       "#4ade80",
                    border:      "1px solid rgba(74,222,128,.28)",
                  }}
                >
                  <Radio size={9} /> Live
                </span>
              </div>
              <p className="text-sm" style={{ color: "rgba(148,163,184,.55)" }}>
                Weekly broadcast schedule — air times converted to your local timezone.
              </p>
            </div>

            {/* controls */}
            <div className="flex items-center gap-3 flex-shrink-0">
              {activeDay !== todayKey && (
                <button
                  onClick={() => setActiveDay(todayKey)}
                  className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs
                             font-bold transition-all hover:scale-105 active:scale-95"
                  style={{
                    background: "rgba(74,222,128,.12)",
                    border:     "1px solid rgba(74,222,128,.25)",
                    color:      "#4ade80",
                  }}
                >
                  <Zap size={11} /> Today
                </button>
              )}

              {/* view toggle desktop */}
              <div
                className="hidden sm:flex items-center p-1 rounded-xl gap-0.5"
                style={{ background: "rgba(255,255,255,.05)", border: "1px solid rgba(255,255,255,.08)" }}
              >
                {[{ k: "grid", I: LayoutGrid }, { k: "list", I: LayoutList }].map(({ k, I }) => (
                  <button
                    key={k}
                    onClick={() => setViewMode(k)}
                    className="w-8 h-8 rounded-lg flex items-center justify-center transition-all"
                    style={{
                      background: viewMode === k ? "rgba(99,102,241,.28)"          : "transparent",
                      color:      viewMode === k ? "#a5b4fc"                        : "rgba(255,255,255,.30)",
                      border:     viewMode === k ? "1px solid rgba(99,102,241,.28)" : "1px solid transparent",
                    }}
                  >
                    <I size={13} />
                  </button>
                ))}
              </div>
            </div>
          </div>

          {/* stat strip */}
          <div
            className="relative z-10 grid grid-cols-3 gap-3 mt-6 pt-5"
            style={{ borderTop: "1px solid rgba(255,255,255,.06)" }}
          >
            {[
              { label: "Today",   value: DAYS.find(d => d.key === todayKey)?.full ?? "—", color: "#4ade80"  },
              { label: "Viewing", value: activeDayObj?.full ?? "—",                        color: "#a5b4fc"  },
              { label: "Titles",  value: dayCounts[activeDay] ?? "…",                      color: "#fbbf24"  },
            ].map(s => (
              <div key={s.label} className="text-center">
                <p className="text-[9px] uppercase tracking-widest font-bold mb-0.5"
                   style={{ color: "rgba(148,163,184,.40)" }}>
                  {s.label}
                </p>
                <p className="font-black text-sm sm:text-base" style={{ color: s.color }}>
                  {s.value}
                </p>
              </div>
            ))}
          </div>
        </motion.div>

        {/* ════ DAY TABS ════ */}
        <motion.div
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
          className="mb-6 sm:mb-8"
        >
          <div
            className="flex items-center gap-2 overflow-x-auto pb-2"
            style={{ scrollbarWidth: "none" }}
          >
            {DAYS.map(day => (
              <DayTab
                key={day.key}
                day={day}
                active={activeDay  === day.key}
                isToday={todayKey  === day.key}
                count={dayCounts[day.key] ?? null}
                onClick={() => setActiveDay(day.key)}
              />
            ))}

            {/* view toggle mobile */}
            <div
              className="flex sm:hidden items-center p-1 rounded-xl gap-0.5
                         ml-auto flex-shrink-0"
              style={{ background: "rgba(255,255,255,.05)", border: "1px solid rgba(255,255,255,.08)" }}
            >
              {[{ k: "grid", I: LayoutGrid }, { k: "list", I: LayoutList }].map(({ k, I }) => (
                <button
                  key={k}
                  onClick={() => setViewMode(k)}
                  className="w-7 h-7 rounded-lg flex items-center justify-center transition-all"
                  style={{
                    background: viewMode === k ? "rgba(99,102,241,.28)" : "transparent",
                    color:      viewMode === k ? "#a5b4fc"               : "rgba(255,255,255,.30)",
                  }}
                >
                  <I size={12} />
                </button>
              ))}
            </div>
          </div>
        </motion.div>

        {/* ════ DAY BANNER ════ */}
        <AnimatePresence mode="wait">
          <motion.div
            key={activeDay}
            initial={{ opacity: 0, x: -10 }}
            animate={{ opacity: 1,  x: 0  }}
            exit={{   opacity: 0,  x: 10  }}
            transition={{ duration: 0.22 }}
            className="flex items-center justify-between mb-5 p-3 sm:p-4 rounded-2xl"
            style={{
              background: activeDay === todayKey
                ? "rgba(99,102,241,.10)" : "rgba(255,255,255,.03)",
              border: `1px solid ${
                activeDay === todayKey
                  ? "rgba(99,102,241,.24)" : "rgba(255,255,255,.07)"
              }`,
            }}
          >
            <div className="flex items-center gap-3">
              <CalendarDays
                size={16}
                style={{ color: activeDay === todayKey ? "#a5b4fc" : "rgba(148,163,184,.45)" }}
              />
              <div>
                <p
                  className="font-black text-sm sm:text-base"
                  style={{ color: activeDay === todayKey ? "#a5b4fc" : "#e2e8f0" }}
                >
                  {activeDayObj?.full}
                  {activeDay === todayKey && (
                    <span
                      className="ml-2 text-[9px] font-black uppercase
                                 px-1.5 py-0.5 rounded-full align-middle"
                      style={{
                        background: "rgba(74,222,128,.16)",
                        color:       "#4ade80",
                        border:      "1px solid rgba(74,222,128,.25)",
                      }}
                    >
                      Today
                    </span>
                  )}
                </p>
                {!loading && activeData.length > 0 && (
                  <p className="text-[10px]" style={{ color: "rgba(148,163,184,.42)" }}>
                    {activeData.length} titles airing this day
                  </p>
                )}
              </div>
            </div>

            {/* refresh */}
            <button
              onClick={refreshActiveDay}
              className="w-8 h-8 rounded-xl flex items-center justify-center
                         transition-all hover:scale-110 active:scale-95"
              style={{ background: "rgba(255,255,255,.05)", border: "1px solid rgba(255,255,255,.08)" }}
              title="Refresh"
            >
              <RefreshCw size={13} style={{ color: "rgba(148,163,184,.50)" }} />
            </button>
          </motion.div>
        </AnimatePresence>

        {/* ════ CONTENT ════ */}
        <AnimatePresence mode="wait">

          {/* loading */}
          {loading && (
            <motion.div key="loading" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}>
              {viewMode === "grid" ? (
                <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4
                                lg:grid-cols-5 xl:grid-cols-6 gap-3 sm:gap-4">
                  {Array.from({ length: 18 }).map((_, i) => <CardSkeleton key={i} index={i} />)}
                </div>
              ) : (
                <div className="flex flex-col gap-2">
                  {Array.from({ length: 12 }).map((_, i) => <ListSkeleton key={i} index={i} />)}
                </div>
              )}
            </motion.div>
          )}

          {/* error */}
          {error && !loading && (
            <motion.div
              key="error"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              className="flex flex-col items-center gap-4 py-24 text-center"
            >
              <div
                className="w-16 h-16 rounded-2xl flex items-center justify-center mb-2"
                style={{ background: "rgba(239,68,68,.10)", border: "1px solid rgba(239,68,68,.20)" }}
              >
                <CalendarDays size={28} style={{ color: "rgba(239,68,68,.60)" }} />
              </div>
              <p className="font-bold text-white text-lg">
                Failed to load {activeDayObj?.full} schedule
              </p>
              <p className="text-sm" style={{ color: "rgba(148,163,184,.50)" }}>
                Jikan may be rate-limiting. Wait a moment then retry.
              </p>
              <button
                onClick={() => { setError(false); refreshActiveDay(); }}
                className="flex items-center gap-2 px-5 py-2.5 rounded-xl text-sm
                           font-semibold transition-all hover:scale-105 active:scale-95 mt-2"
                style={{ background: "rgba(99,102,241,.15)", color: "#a5b4fc", border: "1px solid rgba(99,102,241,.25)" }}
              >
                <RefreshCw size={13} /> Retry
              </button>
            </motion.div>
          )}

          {/* results */}
          {!loading && !error && activeData.length > 0 && (
            <motion.div
              key={`results-${activeDay}`}
              initial={{ opacity: 0, y: 8 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{   opacity: 0       }}
              transition={{ duration: 0.25 }}
            >
              {viewMode === "grid" ? (
                <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4
                                lg:grid-cols-5 xl:grid-cols-6 gap-3 sm:gap-4">
                  {activeData.map((a, i) => (
                    <AnimeGridCard
                      key={`${a.mal_id}-${i}`}
                      anime={a}
                      index={i}
                      isToday={activeDay === todayKey}
                    />
                  ))}
                </div>
              ) : (
                <div className="flex flex-col gap-2">
                  {activeData.map((a, i) => (
                    <AnimeListRow
                      key={`${a.mal_id}-${i}`}
                      anime={a}
                      index={i}
                      isToday={activeDay === todayKey}
                    />
                  ))}
                </div>
              )}

              {/* footer */}
              <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ delay: 0.5 }}
                className="flex items-center justify-center gap-2 mt-8 py-3 rounded-2xl"
                style={{ background: "rgba(255,255,255,.02)", border: "1px solid rgba(255,255,255,.05)" }}
              >
                <Clock size={11} style={{ color: "rgba(148,163,184,.32)" }} />
                <p className="text-[10px]" style={{ color: "rgba(148,163,184,.38)" }}>
                  Air times shown in your local timezone · Powered by Jikan / MyAnimeList
                </p>
              </motion.div>
            </motion.div>
          )}

          {/* empty */}
          {!loading && !error && activeData.length === 0 && (
            <motion.div
              key="empty"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              className="flex flex-col items-center gap-4 py-24 text-center"
            >
              <div
                className="w-16 h-16 rounded-2xl flex items-center justify-center mb-2"
                style={{ background: "rgba(99,102,241,.08)", border: "1px solid rgba(99,102,241,.16)" }}
              >
                <CalendarDays size={28} style={{ color: "rgba(99,102,241,.40)" }} />
              </div>
              <p className="font-bold text-white text-lg">
                No schedule for {activeDayObj?.full}
              </p>
              <p className="text-sm" style={{ color: "rgba(148,163,184,.45)" }}>
                No anime are listed for this day, or data hasn't loaded yet.
              </p>
              <button
                onClick={() => setActiveDay(todayKey)}
                className="flex items-center gap-2 px-5 py-2.5 rounded-xl text-sm
                           font-semibold transition-all hover:scale-105 active:scale-95 mt-2"
                style={{ background: "rgba(99,102,241,.12)", border: "1px solid rgba(99,102,241,.22)", color: "#a5b4fc" }}
              >
                <Zap size={13} /> Jump to Today
              </button>
            </motion.div>
          )}

        </AnimatePresence>
      </div>
    </div>
  );
};

export default AnimeSchedules;