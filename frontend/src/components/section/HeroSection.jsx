import { useState, useEffect, useRef, useCallback } from "react";
import { Link } from "react-router-dom";
import { motion, AnimatePresence, useMotionValue } from "framer-motion";
import {
  Play, Plus, Star, ChevronLeft, ChevronRight,
  Volume2, VolumeX, Info,
} from "lucide-react";
import { animeService } from "../../services/animeService";
import { truncateText, getAudioLanguages } from "../../utils/helpers";

const AUTO_MS     = 6000;
const FETCH_COUNT = 10;
const wrap        = (i, len) => ((i % len) + len) % len;

/* ══════════════════════════════════════════════════════════
   BOTTOM SHELF THUMBNAIL
══════════════════════════════════════════════════════════ */
const ShelfCard = ({ anime, isActive, onClick, index }) => {
  const [err, setErr] = useState(false);

  return (
    <motion.div
      onClick={onClick}
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: index * 0.05, duration: 0.35 }}
      whileHover={{ scale: 1.06, y: -4 }}
      className="relative flex-shrink-0 cursor-pointer"
      style={{ width: "clamp(80px,9vw,130px)" }}
    >
      <div
        className="relative rounded-xl overflow-hidden transition-all duration-200"
        style={{
          aspectRatio:  "4/5",
          border:       isActive
            ? "2px solid rgba(255,255,255,.85)"
            : "2px solid transparent",
          boxShadow:    isActive
            ? "0 0 0 1px rgba(255,255,255,.3), 0 8px 32px rgba(0,0,0,.7)"
            : "0 4px 16px rgba(0,0,0,.5)",
        }}
      >
        {!err ? (
          <img
            src={anime.images?.jpg?.large_image_url || anime.images?.jpg?.image_url}
            alt={anime.title}
            className="w-full h-full object-cover"
            draggable={false}
            onError={() => setErr(true)}
          />
        ) : (
          <div className="w-full h-full bg-[#1a1a2e] flex items-center justify-center">
            <span className="text-slate-600 text-xs">?</span>
          </div>
        )}
        {/* hover overlay */}
        <div className="absolute inset-0 bg-black/0 hover:bg-black/20 transition-colors" />
      </div>
    </motion.div>
  );
};

/* ══════════════════════════════════════════════════════════
   HERO SECTION
══════════════════════════════════════════════════════════ */
const HeroSection = () => {
  const [list,    setList]    = useState([]);
  const [current, setCurrent] = useState(0);
  const [loading, setLoading] = useState(true);
  const [paused,  setPaused]  = useState(false);
  const [muted,   setMuted]   = useState(true);
  const [imgErr,  setImgErr]  = useState(false);

  const timerRef   = useRef(null);
  const shelfRef   = useRef(null);
  const dragX      = useMotionValue(0);

  /* ── fetch ── */
  useEffect(() => {
    (async () => {
      try {
        const res   = await animeService.getSeasonNow();
        const items = (res.data || [])
          .filter(a => a.images?.jpg?.large_image_url || a.images?.jpg?.image_url)
          .sort((a, b) => (b.score ?? 0) - (a.score ?? 0))
          .slice(0, FETCH_COUNT);
        if (items.length >= 4) { setList(items); return; }
        throw new Error("few");
      } catch {
        try {
          const r2 = await animeService.getTopAnime();
          setList(r2.data.slice(0, FETCH_COUNT));
        } catch { /**/ }
      } finally {
        setLoading(false);
      }
    })();
  }, []);

  /* Reset image error when current changes */
  useEffect(() => { setImgErr(false); }, [current]);

  /* ── auto-advance ── */
  const resetTimer = useCallback(() => {
    clearInterval(timerRef.current);
    timerRef.current = setInterval(() => {
      if (!paused) setCurrent(c => wrap(c + 1, list.length));
    }, AUTO_MS);
  }, [paused, list.length]);

  useEffect(() => {
    if (!list.length) return;
    resetTimer();
    return () => clearInterval(timerRef.current);
  }, [list.length, paused, resetTimer]);

  const goTo = useCallback((idx) => {
    setCurrent(wrap(idx, list.length));
    resetTimer();
  }, [list.length, resetTimer]);

  const prev = () => goTo(current - 1);
  const next = () => goTo(current + 1);

  /* keyboard */
  useEffect(() => {
    const h = (e) => {
      if (e.key === "ArrowLeft")  prev();
      if (e.key === "ArrowRight") next();
    };
    window.addEventListener("keydown", h);
    return () => window.removeEventListener("keydown", h);
  }, [current, list.length]);

  /* drag to navigate */
  const onDragEnd = (_, info) => {
    if (info.offset.x < -50)     next();
    else if (info.offset.x > 50) prev();
    dragX.set(0);
  };

  /* ── loading ── */
  if (loading) return (
    <div
      className="w-full flex flex-col items-center justify-center"
      style={{ height: "100svh", background: "#0a0a14" }}
    >
      <motion.div
        animate={{ rotate: 360 }}
        transition={{ duration: 1.1, repeat: Infinity, ease: "linear" }}
        className="w-12 h-12 border-4 border-indigo-500/20 border-t-indigo-400 rounded-full mb-4"
      />
      <p className="text-white/30 text-xs tracking-widest uppercase">
        Loading
      </p>
    </div>
  );

  if (!list.length) return null;

  const anime     = list[current];
  const audioLangs = getAudioLanguages(anime);

  /* best quality image */
  const heroBg =
    anime.images?.jpg?.large_image_url ||
    anime.images?.jpg?.image_url;

  /* label: "A [studio] Original · [rating] · [year]" */
  const studio   = anime.studios?.[0]?.name ?? "Original";
  const rating   = anime.rating?.replace(" - ", " ") ?? "";
  const metaLine = [studio, rating, anime.year].filter(Boolean).join("  ·  ");

  return (
    <section
      className="relative w-full overflow-hidden"
      style={{ height: "100svh", minHeight: 500, background: "#0a0a14" }}
      onMouseEnter={() => setPaused(true)}
      onMouseLeave={() => setPaused(false)}
    >

      {/* ════════════════════════════════════════
          FULL-BLEED BACKGROUND
      ════════════════════════════════════════ */}
      <AnimatePresence mode="wait">
        <motion.div
          key={`bg-${current}`}
          className="absolute inset-0"
          style={{ zIndex: 0 }}
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{   opacity: 0 }}
          transition={{ duration: 0.7 }}
        >
          {!imgErr ? (
            <img
              src={heroBg}
              alt=""
              aria-hidden
              className="w-full h-full object-cover object-center"
              style={{ transform: "scale(1.03)" }}
              onError={() => setImgErr(true)}
            />
          ) : (
            <div className="w-full h-full bg-gradient-to-br from-indigo-950 to-[#0a0a14]" />
          )}
        </motion.div>
      </AnimatePresence>

      {/* ── gradient overlays (match reference: dark left + bottom) ── */}
      <div className="absolute inset-0 pointer-events-none" style={{ zIndex: 1 }}>
        {/* Left fade — where text sits */}
        <div style={{
          position: "absolute", inset: 0,
          background: "linear-gradient(to right, rgba(10,10,20,.96) 0%, rgba(10,10,20,.70) 35%, rgba(10,10,20,.15) 60%, transparent 100%)",
        }} />
        {/* Bottom fade — for shelf */}
        <div style={{
          position: "absolute", inset: 0,
          background: "linear-gradient(to top, rgba(10,10,20,1) 0%, rgba(10,10,20,.85) 18%, rgba(10,10,20,.3) 35%, transparent 60%)",
        }} />
        {/* Top fade — for nav */}
        <div style={{
          position: "absolute", inset: 0,
          background: "linear-gradient(to bottom, rgba(10,10,20,.6) 0%, transparent 25%)",
        }} />
      </div>

      {/* ── drag catcher ── */}
      <motion.div
        className="absolute inset-0"
        style={{ zIndex: 5, cursor: "grab" }}
        drag="x"
        dragConstraints={{ left: 0, right: 0 }}
        dragElastic={0.05}
        style={{ x: dragX, zIndex: 5 }}
        onDragEnd={onDragEnd}
      />

      {/* ════════════════════════════════════════
          LEFT CONTENT  (title + meta + buttons)
      ════════════════════════════════════════ */}
      <div
        className="absolute inset-0 flex flex-col justify-center"
        style={{ zIndex: 10 }}
      >
        <div className="w-full px-6 sm:px-10 lg:px-16" style={{ paddingTop: 80 }}>
          <AnimatePresence mode="wait">
            <motion.div
              key={`content-${current}`}
              initial={{ opacity: 0, x: -24 }}
              animate={{ opacity: 1, x: 0  }}
              exit={{   opacity: 0, x: -16 }}
              transition={{ duration: 0.45, ease: "easeOut" }}
              style={{ maxWidth: "min(560px, 55vw)" }}
            >
              {/* Studio / original label */}
              <p
                className="text-lg font-semibold uppercase tracking-widest mb-2"
                style={{ color: "rgba(99,102,241,.9)" }}
              >
                {studio} Original
              </p>

              {/* ── TITLE — large, bold, left-aligned ── */}
              <h1
                className="font-black text-white leading-none mb-3"
                style={{
                  fontSize:        "clamp(25px, 2.2vw, 48px)",
                  textShadow:      "0 2px 20px rgba(0,0,0,.5)",
                  letterSpacing:   "-0.02em",
                }}
              >
                {(anime.title_english || anime.title).toUpperCase()}
              </h1>

              {/* meta line: score · rating · year */}
              <div className="flex flex-wrap items-center gap-3 mb-2">
                <div className="flex items-center gap-1.5">
                  <Star
                    size={13}
                    className="text-yellow-400 fill-yellow-400"
                  />
                  <span className="text-yellow-300 text-sm font-bold">
                    {anime.score?.toFixed(1) ?? "N/A"}
                  </span>
                  <span className="text-white/40 text-xs">Match</span>
                </div>

                {rating && (
                  <span
                    className="text-xs font-bold px-2 py-0.5 border rounded"
                    style={{
                      borderColor: "rgba(255,255,255,.30)",
                      color:       "rgba(255,255,255,.70)",
                    }}
                  >
                    {rating.split(" ")[0]}
                  </span>
                )}

                {anime.year && (
                  <span className="text-white/60 text-sm">{anime.year}</span>
                )}

                {anime.episodes && (
                  <span className="text-white/60 text-sm">
                    {anime.episodes} Episodes
                  </span>
                )}

                {anime.status === "Currently Airing" && (
                  <span className="flex items-center gap-1 text-green-400 text-xs font-medium">
                    <span className="w-1.5 h-1.5 rounded-full bg-green-400 animate-pulse" />
                    Airing
                  </span>
                )}
              </div>

              {/* Synopsis */}
              <p
                className="leading-relaxed mb-3 hidden sm:block"
                style={{
                  color:    "rgba(255,255,255,.72)",
                  fontSize: "clamp(12px, 1.3vw, 15px)",
                }}
              >
                {truncateText(anime.synopsis, 160)}
              </p>

              {/* ── Action buttons (Play + More Info) ── */}
              <div className="flex flex-wrap items-center gap-3">
                {/* PLAY — solid white like reference */}
                <Link
                  to={`/anime/${anime.mal_id}`}
                  className="flex items-center gap-2.5 font-bold rounded-lg transition-all hover:scale-105 active:scale-95"
                  style={{
                    background: "#ffffff",
                    color:      "#0a0a14",
                    padding:    "clamp(9px,1.2vw,13px) clamp(18px,2.5vw,32px)",
                    fontSize:   "clamp(13px,1.2vw,16px)",
                    boxShadow:  "0 4px 24px rgba(255,255,255,.2)",
                  }}
                >
                  <Play size={18} className="fill-current" />
                  Play
                </Link>

                {/* MORE INFO — translucent */}
                <Link
                  to={`/anime/${anime.mal_id}`}
                  className="flex items-center gap-2.5 font-semibold rounded-lg transition-all hover:scale-105 active:scale-95"
                  style={{
                    background: "rgba(109,109,110,0.7)",
                    color:      "#ffffff",
                    padding:    "clamp(9px,1.2vw,13px) clamp(18px,2.5vw,32px)",
                    fontSize:   "clamp(13px,1.2vw,16px)",
                    backdropFilter: "blur(4px)",
                  }}
                >
                  <Info size={18} />
                  More Info
                </Link>
              </div>

              {/* audio languages */}
              <div className="flex flex-wrap gap-1.5 mt-4">
                {audioLangs.map(lang => (
                  <span
                    key={lang}
                    className="flex items-center gap-1 px-2 py-0.5 rounded text-[10px]"
                    style={{
                      background: "rgba(255,255,255,.08)",
                      border:     "1px solid rgba(255,255,255,.12)",
                      color:      "rgba(255,255,255,.55)",
                    }}
                  >
                    <Volume2 size={8} />
                    {lang}
                  </span>
                ))}
              </div>
            </motion.div>
          </AnimatePresence>
        </div>
      </div>

      {/* ════════════════════════════════════════
          MUTE BUTTON + PREV/NEXT (right side)
      ════════════════════════════════════════ */}
      <div
        className="absolute right-6 sm:right-10 lg:right-16 flex flex-col items-end gap-3"
        style={{
          zIndex: 20,
          bottom: "clamp(160px, 22vw, 220px)",
        }}
      >
        {/* mute toggle */}
        <button
          onClick={() => setMuted(m => !m)}
          className="w-9 h-9 rounded-full flex items-center justify-center transition-all hover:scale-110"
          style={{
            background: "rgba(255,255,255,.12)",
            border:     "1.5px solid rgba(255,255,255,.35)",
            backdropFilter: "blur(8px)",
          }}
        >
          {muted
            ? <VolumeX size={15} className="text-white" />
            : <Volume2 size={15} className="text-white" />}
        </button>

        {/* rating badge */}
        {rating && (
          <div
            className="px-5 py-1 mb-15 text-xs font-bold text-white"
            style={{
              background:  "rgba(109,109,110,.6)",
              borderLeft:  "3px solid rgba(255,255,255,.5)",
              backdropFilter: "blur(4px)",
            }}
          >
            {rating.split(" ")[0]}
          </div>
        )}
      </div>

      {/* ════════════════════════════════════════
          BOTTOM: "MY LIST" shelf
      ════════════════════════════════════════ */}
      <div
        className="absolute bottom-0 left-0 right-0"
        style={{ zIndex: 20 }}
      >
        <div className="px-6 sm:px-10 lg:px-16 pb-8">

          {/* shelf header */}
          <div className="flex items-center justify-between mb-2">
            <h3
              className="text-sm font-bold uppercase tracking-widest"
              style={{ color: "rgba(255,255,255,.55)" }}
            >
              My List
            </h3>

            {/* prev/next */}
            <div className="flex items-center gap-2">
              <button
                onClick={prev}
                className="w-8 h-8 rounded-full flex items-center justify-center text-white transition-all hover:scale-110"
                style={{
                  background:  "rgba(255,255,255,.12)",
                  border:      "1px solid rgba(255,255,255,.20)",
                  backdropFilter: "blur(8px)",
                }}
              >
                <ChevronLeft size={15} />
              </button>
              <button
                onClick={next}
                className="w-8 h-8 rounded-full flex items-center justify-center text-white transition-all hover:scale-110"
                style={{
                  background:  "rgba(255,255,255,.12)",
                  border:      "1px solid rgba(255,255,255,.20)",
                  backdropFilter: "blur(8px)",
                }}
              >
                <ChevronRight size={15} />
              </button>
            </div>
          </div>

          {/* shelf scroll row */}
          <div
            ref={shelfRef}
            className="flex gap-3 overflow-x-auto"
            style={{ scrollbarWidth: "none", msOverflowStyle: "none" }}
          >
            {list.map((item, i) => (
              <ShelfCard
                key={item.mal_id}
                anime={item}
                index={i}
                isActive={i === current}
                onClick={() => goTo(i)}
              />
            ))}

            {/* + add more card */}
            <Link
              to="/search"
              className="flex-shrink-0 rounded-xl flex flex-col items-center justify-center gap-2 transition-all hover:scale-105"
              style={{
                width:       "clamp(80px,9vw,130px)",
                aspectRatio: "4/5",
                background:  "rgba(255,255,255,.07)",
                border:      "2px dashed rgba(255,255,255,.18)",
              }}
            >
              <Plus size={20} className="text-white/40" />
              <span className="text-white/30 text-[10px] font-medium">Browse</span>
            </Link>
          </div>

          {/* progress dots */}
          <div className="flex items-center gap-1.5 mt-4">
            {list.map((_, i) => (
              <button
                key={i}
                onClick={() => goTo(i)}
                className="rounded-full transition-all duration-300"
                style={{
                  width:      i === current ? 20 : 5,
                  height:     5,
                  background: i === current
                    ? "rgba(255,255,255,.85)"
                    : "rgba(255,255,255,.22)",
                }}
              />
            ))}

            {/* auto-play progress */}
            <div
              className="ml-3 rounded-full overflow-hidden"
              style={{ width: 60, height: 2, background: "rgba(255,255,255,.10)" }}
            >
              {!paused && (
                <motion.div
                  key={current}
                  className="h-full rounded-full origin-left"
                  style={{ background: "rgba(255,255,255,.50)" }}
                  initial={{ scaleX: 0 }}
                  animate={{ scaleX: 1 }}
                  transition={{ duration: AUTO_MS / 1000, ease: "linear" }}
                />
              )}
            </div>
          </div>
        </div>
      </div>
    </section>
  );
};

export default HeroSection;