import { useEffect, useState, useRef, useCallback } from "react";
import { useParams, useNavigate, Link } from "react-router-dom";
import { motion, AnimatePresence } from "framer-motion";
import {
  Star, Heart, Play, ArrowLeft, Tv, Calendar, Clock,
  Users, Globe, Award, BookOpen, ExternalLink,
  Volume2, TrendingUp, X, ChevronLeft, ChevronRight,
  Layers, Shuffle, GitBranch, Sparkles, Info,
} from "lucide-react";
import { animeService } from "../services/animeService";
import { useAuth } from "../context/AuthContext";
import { useFavorites } from "../context/FavoritesContext";
import { getAudioLanguages } from "../utils/helpers";

/* ══════════════════════════════════════════════════════════
   DESIGN TOKENS
══════════════════════════════════════════════════════════ */
const BG        = "#0a0a14";
const CARD_BG   = "rgba(255,255,255,.04)";
const CARD_BR   = "1px solid rgba(255,255,255,.07)";
const MUTED     = "rgba(148,163,184,.55)";
const MUTED_LO  = "rgba(148,163,184,.38)";
const INDIGO    = "#a5b4fc";

/* ══════════════════════════════════════════════════════════
   PILL
══════════════════════════════════════════════════════════ */
const PILL_STYLES = {
  default: { background:"rgba(255,255,255,.07)", border:"1px solid rgba(255,255,255,.12)", color:"rgba(255,255,255,.70)" },
  indigo:  { background:"rgba(99,102,241,.15)",  border:"1px solid rgba(99,102,241,.30)",  color:INDIGO },
  green:   { background:"rgba(34,197,94,.12)",   border:"1px solid rgba(34,197,94,.28)",   color:"#86efac" },
  yellow:  { background:"rgba(234,179,8,.12)",   border:"1px solid rgba(234,179,8,.28)",   color:"#fde047" },
  pink:    { background:"rgba(236,72,153,.12)",  border:"1px solid rgba(236,72,153,.28)",  color:"#f9a8d4" },
  blue:    { background:"rgba(59,130,246,.12)",  border:"1px solid rgba(59,130,246,.28)",  color:"#93c5fd" },
  orange:  { background:"rgba(249,115,22,.12)",  border:"1px solid rgba(249,115,22,.28)",  color:"#fdba74" },
};

const Pill = ({ children, color = "default" }) => (
  <span
    className="inline-flex items-center px-2.5 py-0.5 sm:px-3 sm:py-1 rounded-full text-[11px] sm:text-xs font-medium"
    style={PILL_STYLES[color] ?? PILL_STYLES.default}
  >
    {children}
  </span>
);

/* ══════════════════════════════════════════════════════════
   STAT CARD
══════════════════════════════════════════════════════════ */
const StatCard = ({ icon, label, value }) => (
  <div
    className="flex flex-col gap-1 p-3 sm:p-4 rounded-xl sm:rounded-2xl"
    style={{ background: CARD_BG, border: CARD_BR }}
  >
    <div className="flex items-center gap-1.5 sm:gap-2" style={{ color: MUTED }}>
      <span className="flex-shrink-0">{icon}</span>
      <span className="text-[10px] sm:text-xs uppercase tracking-wider font-medium truncate">{label}</span>
    </div>
    <p className="text-white font-semibold text-xs sm:text-sm leading-snug break-words">{value ?? "—"}</p>
  </div>
);

/* ══════════════════════════════════════════════════════════
   SECTION LABEL
══════════════════════════════════════════════════════════ */
const SectionLabel = ({ children }) => (
  <p
    className="text-[10px] sm:text-xs uppercase tracking-widest font-semibold mb-2 sm:mb-3"
    style={{ color: MUTED_LO }}
  >
    {children}
  </p>
);

/* ══════════════════════════════════════════════════════════
   TRAILER MODAL
══════════════════════════════════════════════════════════ */
const TrailerModal = ({ url, onClose }) => {
  const embedUrl = url
    ?.replace("watch?v=", "embed/")
    .replace("youtu.be/", "www.youtube.com/embed/");

  useEffect(() => {
    const h = (e) => { if (e.key === "Escape") onClose(); };
    document.addEventListener("keydown", h);
    /* lock body scroll */
    document.body.style.overflow = "hidden";
    return () => {
      document.removeEventListener("keydown", h);
      document.body.style.overflow = "";
    };
  }, [onClose]);

  return (
    <motion.div
      className="fixed inset-0 z-[200] flex items-center justify-center p-3 sm:p-6"
      initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
      onClick={onClose}
      style={{ background: "rgba(0,0,0,.92)", backdropFilter: "blur(16px)" }}
    >
      <motion.div
        initial={{ scale: 0.88, opacity: 0 }}
        animate={{ scale: 1,    opacity: 1 }}
        exit={{   scale: 0.88, opacity: 0 }}
        transition={{ type: "spring", stiffness: 280, damping: 26 }}
        onClick={e => e.stopPropagation()}
        className="relative w-full rounded-xl sm:rounded-2xl overflow-hidden"
        style={{ maxWidth: 900, background: "#000", border: "1px solid rgba(255,255,255,.1)" }}
      >
        <button
          onClick={onClose}
          className="absolute top-2 right-2 sm:top-3 sm:right-3 z-10 w-8 h-8 sm:w-9 sm:h-9 rounded-full flex items-center justify-center"
          style={{ background: "rgba(0,0,0,.75)", border: "1px solid rgba(255,255,255,.15)" }}
        >
          <X size={14} className="text-white" />
        </button>
        <div style={{ aspectRatio: "16/9" }}>
          <iframe
            src={`${embedUrl}?autoplay=1`}
            className="w-full h-full"
            allow="autoplay; fullscreen"
            allowFullScreen
            title="Anime Trailer"
          />
        </div>
      </motion.div>
    </motion.div>
  );
};

/* ══════════════════════════════════════════════════════════
   ANIME ROW CARD
══════════════════════════════════════════════════════════ */
const AnimeRowCard = ({ item, index }) => {
  const [err, setErr] = useState(false);
  const img = item?.images?.jpg?.large_image_url || item?.images?.jpg?.image_url;

  const relBg = {
    Sequel:       "rgba(99,102,241,.85)",
    Prequel:      "rgba(59,130,246,.85)",
    "Spin-off":   "rgba(249,115,22,.85)",
    "Side story": "rgba(234,179,8,.85)",
  }[item?.relation] ?? "rgba(99,102,241,.75)";

  return (
    <motion.div
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: Math.min(index * 0.03, 0.35), duration: 0.25 }}
      className="flex-shrink-0 group"
      style={{ width: "clamp(100px, 30vw, 145px)" }}
    >
      <Link to={`/anime/${item.mal_id}`}>
        <div
          className="relative rounded-lg sm:rounded-xl overflow-hidden mb-1.5 sm:mb-2"
          style={{ aspectRatio: "3/4", border: "1px solid rgba(255,255,255,.07)" }}
        >
          {!err && img ? (
            <img
              src={img}
              alt={item.title ?? ""}
              className="w-full h-full object-cover transition-transform duration-400 group-hover:scale-105"
              onError={() => setErr(true)}
            />
          ) : (
            <div className="w-full h-full flex items-center justify-center" style={{ background: CARD_BG }}>
              <Tv size={20} style={{ color: MUTED_LO }} />
            </div>
          )}

          {/* hover play */}
          <div className="absolute inset-0 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity duration-200"
               style={{ background: "rgba(0,0,0,.38)" }}>
            <div className="w-8 h-8 sm:w-10 sm:h-10 rounded-full flex items-center justify-center"
                 style={{ background: "rgba(99,102,241,.9)" }}>
              <Play size={12} className="text-white fill-white ml-0.5" />
            </div>
          </div>

          {/* score */}
          {item.score && (
            <div
              className="absolute top-1.5 left-1.5 flex items-center gap-0.5 px-1.5 py-0.5 rounded"
              style={{ background: "rgba(0,0,0,.78)", backdropFilter: "blur(4px)" }}
            >
              <Star size={8} className="text-yellow-400 fill-yellow-400" />
              <span className="text-white font-bold" style={{ fontSize: 9 }}>{item.score.toFixed(1)}</span>
            </div>
          )}

          {/* relation badge */}
          {item.relation && (
            <div className="absolute bottom-0 left-0 right-0 px-1.5 pb-1.5">
              <span
                className="block text-center font-bold uppercase rounded"
                style={{ background: relBg, color: "#fff", fontSize: 8, padding: "2px 4px" }}
              >
                {item.relation}
              </span>
            </div>
          )}
        </div>

        <p className="text-white font-semibold line-clamp-2 leading-tight group-hover:text-indigo-300 transition-colors"
           style={{ fontSize: "clamp(10px,2.5vw,12px)" }}>
          {item.title_english || item.title}
        </p>
        {item.year && (
          <p className="mt-0.5" style={{ fontSize: 10, color: MUTED_LO }}>{item.year}</p>
        )}
      </Link>
    </motion.div>
  );
};

/* ══════════════════════════════════════════════════════════
   ANIME ROW  (horizontal scroll)
══════════════════════════════════════════════════════════ */
const AnimeRow = ({ items, title, icon: Icon, badge, emptyMsg }) => {
  const rowRef              = useRef(null);
  const [canLeft,  setCanLeft]  = useState(false);
  const [canRight, setCanRight] = useState(false);

  const checkScroll = useCallback(() => {
    const el = rowRef.current;
    if (!el) return;
    setCanLeft(el.scrollLeft > 8);
    setCanRight(el.scrollLeft < el.scrollWidth - el.clientWidth - 8);
  }, []);

  useEffect(() => {
    checkScroll();
    const el = rowRef.current;
    el?.addEventListener("scroll", checkScroll, { passive: true });
    return () => el?.removeEventListener("scroll", checkScroll);
  }, [items, checkScroll]);

  const scroll = (dir) => rowRef.current?.scrollBy({ left: dir * 280, behavior: "smooth" });

  if (!items?.length && !emptyMsg) return null;

  return (
    <div>
      {/* header */}
      <div className="flex items-center justify-between mb-3 sm:mb-4">
        <div className="flex items-center gap-2 min-w-0">
          {Icon && <Icon size={14} className="flex-shrink-0" style={{ color: "rgba(99,102,241,.85)" }} />}
          <h3 className="text-white font-bold text-sm sm:text-base truncate">{title}</h3>
          {badge && (
            <span
              className="flex-shrink-0 text-[9px] sm:text-[10px] font-bold px-1.5 sm:px-2 py-0.5 rounded-full"
              style={{ background: "rgba(99,102,241,.18)", color: INDIGO, border: "1px solid rgba(99,102,241,.28)" }}
            >
              {badge}
            </span>
          )}
        </div>
        <div className="flex gap-1 flex-shrink-0 ml-2">
          {[{ dir: -1, Icon: ChevronLeft, can: canLeft }, { dir: 1, Icon: ChevronRight, can: canRight }].map(({ dir, Icon: Ic, can }) => (
            <button
              key={dir}
              onClick={() => scroll(dir)}
              disabled={!can}
              className="w-7 h-7 sm:w-8 sm:h-8 rounded-full flex items-center justify-center transition-all"
              style={{
                background: can ? "rgba(255,255,255,.10)" : "rgba(255,255,255,.03)",
                border: "1px solid rgba(255,255,255,.10)",
                color: can ? "#fff" : "rgba(255,255,255,.18)",
              }}
            >
              <Ic size={12} />
            </button>
          ))}
        </div>
      </div>

      {!items?.length ? (
        <p className="text-xs sm:text-sm py-4" style={{ color: MUTED_LO }}>{emptyMsg}</p>
      ) : (
        <div
          ref={rowRef}
          className="flex gap-2 sm:gap-3 overflow-x-auto pb-1"
          style={{ scrollbarWidth: "none", msOverflowStyle: "none" }}
        >
          {items.map((item, i) => (
            <AnimeRowCard key={`${item.mal_id}-${i}`} item={item} index={i} />
          ))}
        </div>
      )}
    </div>
  );
};

/* ══════════════════════════════════════════════════════════
   SEASON CARD
══════════════════════════════════════════════════════════ */
const SeasonCard = ({ item, label, direction }) => {
  const [err, setErr] = useState(false);
  if (!item) return null;
  const img = item.images?.jpg?.large_image_url || item.images?.jpg?.image_url;

  return (
    <Link
      to={`/anime/${item.mal_id}`}
      className="flex items-center gap-2.5 sm:gap-3 p-3 sm:p-3.5 rounded-xl sm:rounded-2xl group transition-all hover:scale-[1.015] active:scale-[.99]"
      style={{ background: CARD_BG, border: "1px solid rgba(255,255,255,.08)" }}
    >
      {direction === "prev" && (
        <ChevronLeft size={14} className="flex-shrink-0" style={{ color: MUTED_LO }} />
      )}

      <div
        className="flex-shrink-0 rounded-lg overflow-hidden"
        style={{ width: 42, height: 56, border: "1px solid rgba(255,255,255,.08)" }}
      >
        {!err && img ? (
          <img
            src={img} alt={item.title ?? ""}
            className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-400"
            onError={() => setErr(true)}
          />
        ) : (
          <div className="w-full h-full flex items-center justify-center" style={{ background: "rgba(255,255,255,.05)" }}>
            <Tv size={12} style={{ color: MUTED_LO }} />
          </div>
        )}
      </div>

      <div className="flex-1 min-w-0">
        <p className="uppercase tracking-widest font-semibold mb-0.5"
           style={{ fontSize: 9, color: "rgba(99,102,241,.78)" }}>
          {label}
        </p>
        <p className="text-white font-semibold line-clamp-2 leading-snug group-hover:text-indigo-300 transition-colors"
           style={{ fontSize: "clamp(11px,2.5vw,13px)" }}>
          {item.title_english || item.title}
        </p>
        {(item.season || item.year) && (
          <p className="capitalize mt-0.5" style={{ fontSize: 10, color: MUTED_LO }}>
            {[item.season, item.year].filter(Boolean).join(" ")}
          </p>
        )}
      </div>

      {direction === "next" && (
        <ChevronRight size={14} className="flex-shrink-0" style={{ color: MUTED_LO }} />
      )}
    </Link>
  );
};

/* ══════════════════════════════════════════════════════════
   EMPTY STATE
══════════════════════════════════════════════════════════ */
const EmptyState = ({ icon, text }) => (
  <div className="py-12 sm:py-16 flex flex-col items-center gap-3" style={{ color: MUTED_LO }}>
    <div className="opacity-30">{icon}</div>
    <p className="text-xs sm:text-sm">{text}</p>
  </div>
);

/* ══════════════════════════════════════════════════════════
   MAIN PAGE
══════════════════════════════════════════════════════════ */
const AnimeDetail = () => {
  const { id }      = useParams();
  const navigate    = useNavigate();
  const { user }    = useAuth();
  const { isFavorite, addFavorite, removeFavorite } = useFavorites();

  const [anime,       setAnime]       = useState(null);
  const [characters,  setChars]       = useState([]);
  const [related,     setRelated]     = useState([]);
  const [recs,        setRecs]        = useState([]);
  const [prevSeason,  setPrev]        = useState(null);
  const [nextSeason,  setNext]        = useState(null);
  const [loading,     setLoading]     = useState(true);
  const [sidesLoaded, setSidesLoaded] = useState(false);
  const [error,       setError]       = useState(null);
  const [favLoading,  setFavLoading]  = useState(false);
  const [showTrailer, setShowTrailer] = useState(false);
  const [imgErr,      setImgErr]      = useState(false);
  const [activeTab,   setActiveTab]   = useState("overview");

  useEffect(() => {
    let cancelled = false;

    setAnime(null); setError(null); setLoading(true); setImgErr(false);
    setActiveTab("overview"); setRelated([]); setRecs([]);
    setPrev(null); setNext(null); setChars([]); setSidesLoaded(false);
    window.scrollTo({ top: 0, behavior: "instant" });

    const delay = (ms) => new Promise(r => setTimeout(r, ms));

    animeService.getAnimeById(id)
      .then(async (data) => {
        if (cancelled) return;
        const a = data.data;
        setAnime(a);
        setLoading(false);

        /* parse relations */
        const relatedEntries = [];
        let prevEntry = null, nextEntry = null;

        a.relations?.forEach(rel => {
          const isNext    = ["Sequel", "Next season"].includes(rel.relation);
          const isPrev    = ["Prequel", "Previous season"].includes(rel.relation);
          const isIgnored = ["Character", "Other"].includes(rel.relation);
          rel.entry?.filter(e => e.type === "anime").forEach(e => {
            if (isPrev && !prevEntry) prevEntry = e;
            if (isNext && !nextEntry) nextEntry = e;
            if (!isIgnored) relatedEntries.push({ ...e, relation: rel.relation });
          });
        });
        setRelated(relatedEntries);

        /* staggered side-loads */
        try {
          const ch = await animeService.getAnimeCharacters(id);
          if (!cancelled) setChars(ch.data?.slice(0, 16) ?? []);
        } catch { /**/ }

        await delay(900);
        if (cancelled) return;

        try {
          const rc = await animeService.getAnimeRecommendations(id);
          if (!cancelled) setRecs(rc.data?.slice(0, 20).map(r => r.entry) ?? []);
        } catch { /**/ }

        await delay(900);
        if (cancelled) return;

        if (prevEntry?.mal_id) {
          try {
            const p = await animeService.getAnimeById(prevEntry.mal_id);
            if (!cancelled) setPrev(p.data);
          } catch { if (!cancelled) setPrev(prevEntry); }
        }

        await delay(900);
        if (cancelled) return;

        if (nextEntry?.mal_id) {
          try {
            const n = await animeService.getAnimeById(nextEntry.mal_id);
            if (!cancelled) setNext(n.data);
          } catch { if (!cancelled) setNext(nextEntry); }
        }

        if (!cancelled) setSidesLoaded(true);
      })
      .catch(() => {
        if (!cancelled) { setError("Failed to load anime details."); setLoading(false); }
      });

    return () => { cancelled = true; };
  }, [id]);

  /* ── Loading ── */
  if (loading) return (
    <div className="min-h-screen flex items-center justify-center" style={{ background: BG }}>
      <div className="flex flex-col items-center gap-4">
        <motion.div
          animate={{ rotate: 360 }}
          transition={{ duration: 1.1, repeat: Infinity, ease: "linear" }}
          className="w-10 h-10 sm:w-12 sm:h-12 border-4 border-indigo-500/20 border-t-indigo-400 rounded-full"
        />
        <p className="text-[10px] sm:text-xs tracking-widest uppercase" style={{ color: MUTED_LO }}>
          Loading
        </p>
      </div>
    </div>
  );

  /* ── Error ── */
  if (error || !anime) return (
    <div className="min-h-screen flex flex-col items-center justify-center gap-4 px-4" style={{ background: BG }}>
      <Info size={32} style={{ color: MUTED_LO }} className="opacity-40" />
      <p className="text-sm text-center" style={{ color: MUTED }}>{error ?? "Anime not found."}</p>
      <button
        onClick={() => navigate(-1)}
        className="flex items-center gap-2 text-sm font-medium px-4 py-2 rounded-xl transition-all hover:scale-105"
        style={{ background: "rgba(99,102,241,.18)", color: INDIGO, border: "1px solid rgba(99,102,241,.28)" }}
      >
        <ArrowLeft size={14} /> Go Back
      </button>
    </div>
  );

  const favorited  = isFavorite(anime.mal_id);
  const audioLangs = getAudioLanguages(anime);
  const poster     = anime.images?.jpg?.large_image_url || anime.images?.jpg?.image_url;

  const handleFavorite = async () => {
    if (!user) return navigate("/login");
    setFavLoading(true);
    try {
      favorited ? await removeFavorite(anime.mal_id) : await addFavorite(anime);
    } finally { setFavLoading(false); }
  };

  const relatedByType = related.reduce((acc, item) => {
    if (!acc[item.relation]) acc[item.relation] = [];
    acc[item.relation].push(item);
    return acc;
  }, {});

  const TABS = ["overview", "characters", "related", "details"];

  const statsLeft = [
    { icon: <Star       size={13} />, label: "Score",     value: anime.score     ? `${anime.score.toFixed(2)} / 10` : "N/A" },
    { icon: <TrendingUp size={13} />, label: "Rank",      value: anime.rank      ? `#${anime.rank}` : "N/A" },
    { icon: <Users      size={13} />, label: "Members",   value: anime.members?.toLocaleString() },
    { icon: <Award      size={13} />, label: "Favorites", value: anime.favorites?.toLocaleString() },
  ];

  const statsRight = [
    { icon: <Tv       size={13} />, label: "Type",     value: anime.type },
    { icon: <Clock    size={13} />, label: "Episodes", value: anime.episodes ? `${anime.episodes} eps` : null },
    { icon: <Calendar size={13} />, label: "Aired",    value: anime.aired?.string },
    { icon: <Clock    size={13} />, label: "Duration", value: anime.duration },
    { icon: <Globe    size={13} />, label: "Status",   value: anime.status },
    { icon: <BookOpen size={13} />, label: "Season",   value: anime.season ? `${anime.season} ${anime.year ?? ""}`.trim() : null },
  ];

  const RELATION_ICON = (t) =>
    t.includes("Sequel")  ? ChevronRight :
    t.includes("Prequel") ? ChevronLeft  :
    t.includes("Spin")    ? Shuffle      : GitBranch;

  return (
    <div className="min-h-screen" style={{ background: BG }}>

      {/* ════════════════════════════════════════
          HERO  (full-bleed)
      ════════════════════════════════════════ */}
      <div
        className="relative w-full overflow-hidden"
        style={{ height: "clamp(240px, 48vw, 580px)" }}
      >
        <AnimatePresence mode="wait">
          <motion.img
            key={`hero-${id}`}
            src={imgErr ? "" : poster}
            alt="" aria-hidden
            className="absolute inset-0 w-full h-full object-cover object-top"
            style={{ filter: "blur(3px)", transform: "scale(1.07)" }}
            initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
            transition={{ duration: 0.55 }}
            onError={() => setImgErr(true)}
          />
        </AnimatePresence>

        {/* gradient: left + bottom + top */}
        <div className="absolute inset-0" style={{
          background: [
            "linear-gradient(to right,  rgba(10,10,20,.97) 0%, rgba(10,10,20,.55) 45%, rgba(10,10,20,.10) 70%, transparent 100%)",
            "linear-gradient(to top,    rgba(10,10,20,1)   0%, rgba(10,10,20,.60) 30%, transparent 65%)",
            "linear-gradient(to bottom, rgba(10,10,20,.60) 0%, transparent 28%)",
          ].join(","),
        }} />

        {/* back btn — top left */}
        <div className="absolute top-4 sm:top-6 left-0 px-4 sm:px-8 lg:px-14" style={{ zIndex: 20 }}>
          <button
            onClick={() => navigate(-1)}
            className="inline-flex items-center gap-1.5 text-xs sm:text-sm font-medium px-3 py-1.5 rounded-lg transition-all hover:scale-105 active:scale-95"
            style={{ color: "rgba(255,255,255,.55)", background: "rgba(255,255,255,.07)", border: "1px solid rgba(255,255,255,.12)" }}
          >
            <ArrowLeft size={13} /> Back
          </button>
        </div>

        {/* hero text — bottom left */}
        <div
          className="absolute bottom-0 left-0 right-0 px-4 sm:px-8 lg:px-14 pb-6 sm:pb-10"
          style={{ zIndex: 20 }}
        >
          {/* genre pills */}
          <div className="flex flex-wrap gap-1.5 sm:gap-2 mb-2 sm:mb-3">
            {anime.genres?.slice(0, 3).map(g => <Pill key={g.mal_id} color="indigo">{g.name}</Pill>)}
            {anime.status === "Currently Airing" && (
              <Pill color="green">
                <span className="w-1.5 h-1.5 rounded-full bg-green-400 animate-pulse mr-1 inline-block" />
                Airing
              </Pill>
            )}
          </div>

          {/* title */}
          <h1
            className="font-black text-white leading-none mb-1.5 sm:mb-2"
            style={{
              fontSize: "clamp(20px, 4.5vw, 60px)",
              letterSpacing: "-0.025em",
              textShadow: "0 2px 24px rgba(0,0,0,.55)",
              maxWidth: "min(680px, 75vw)",
            }}
          >
            {anime.title_english || anime.title}
          </h1>

          {anime.title_english && anime.title !== anime.title_english && (
            <p className="mb-2 sm:mb-3 font-medium" style={{ color: "rgba(255,255,255,.35)", fontSize: "clamp(12px,2vw,15px)" }}>
              {anime.title}
            </p>
          )}

          {/* meta row */}
          <div className="flex flex-wrap items-center gap-2 sm:gap-3">
            {anime.score && (
              <span className="flex items-center gap-1">
                <Star size={13} className="text-yellow-400 fill-yellow-400" />
                <span className="text-yellow-300 font-bold text-sm sm:text-base">{anime.score.toFixed(1)}</span>
                <span className="text-xs" style={{ color: "rgba(255,255,255,.28)" }}>/ 10</span>
              </span>
            )}
            {anime.year     && <span className="text-xs sm:text-sm" style={{ color: "rgba(255,255,255,.42)" }}>{anime.year}</span>}
            {anime.type     && <Pill color="indigo">{anime.type}</Pill>}
            {anime.episodes && <span className="text-xs sm:text-sm" style={{ color: "rgba(255,255,255,.42)" }}>{anime.episodes} eps</span>}
          </div>
        </div>
      </div>

      {/* ════════════════════════════════════════
          BODY
      ════════════════════════════════════════ */}
      <div className="w-full px-4 sm:px-6 lg:px-10 xl:px-14 py-6 sm:py-8">
        <div className="flex flex-col xl:flex-row gap-6 sm:gap-8 xl:gap-10">

          {/* ══════════════════════
              SIDEBAR
          ══════════════════════ */}
          <div className="xl:w-64 2xl:w-72 flex-shrink-0">

            {/* Poster + buttons (side-by-side on sm, stacked on xl) */}
            <div className="flex flex-row xl:flex-col gap-4 sm:gap-5 mb-5 sm:mb-6">

              {/* Poster */}
              <motion.div
                initial={{ opacity: 0, y: 14 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.08 }}
                className="flex-shrink-0"
                style={{ width: "clamp(110px, 28vw, 180px)" }}
              >
                <div
                  className="relative rounded-xl sm:rounded-2xl overflow-hidden"
                  style={{
                    aspectRatio: "3/4",
                    boxShadow: "0 16px 60px rgba(0,0,0,.65), 0 0 0 1px rgba(255,255,255,.07)",
                  }}
                >
                  <img
                    src={poster}
                    alt={anime.title}
                    className="w-full h-full object-cover"
                    onError={e => { e.target.style.display = "none"; }}
                  />
                  <div className="absolute inset-0 rounded-xl sm:rounded-2xl"
                       style={{ boxShadow: "inset 0 0 0 1px rgba(255,255,255,.09)" }} />
                </div>
              </motion.div>

              {/* Buttons (right of poster on mobile, below on xl) */}
              <motion.div
                initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.14 }}
                className="flex flex-col gap-2 sm:gap-2.5 flex-1 xl:flex-none justify-center xl:justify-start"
              >
                {/* Favorite */}
                <button
                  onClick={handleFavorite}
                  disabled={favLoading}
                  className="w-full flex items-center justify-center gap-2 py-2.5 sm:py-3 rounded-xl font-semibold transition-all hover:scale-[1.02] active:scale-[.98] disabled:opacity-55"
                  style={{
                    fontSize: "clamp(11px,2.5vw,13px)",
                    ...(favorited ? {
                      background: "linear-gradient(135deg,#ec4899,#f43f5e)",
                      color: "#fff",
                      boxShadow: "0 4px 18px rgba(236,72,153,.28)",
                    } : {
                      background: "rgba(255,255,255,.07)",
                      border: "1px solid rgba(255,255,255,.14)",
                      color: "rgba(255,255,255,.82)",
                    }),
                  }}
                >
                  <Heart size={14} className={favorited ? "fill-white" : ""} />
                  {favLoading ? "Saving…" : favorited ? "In Favorites" : "Add to Favorites"}
                </button>

                {/* Trailer */}
                {anime.trailer?.url && (
                  <button
                    onClick={() => setShowTrailer(true)}
                    className="w-full flex items-center justify-center gap-2 py-2.5 sm:py-3 rounded-xl font-semibold transition-all hover:scale-[1.02] active:scale-[.98]"
                    style={{
                      fontSize: "clamp(11px,2.5vw,13px)",
                      background: "rgba(99,102,241,.16)",
                      border: "1px solid rgba(99,102,241,.28)",
                      color: INDIGO,
                    }}
                  >
                    <Play size={13} className="fill-current" /> Watch Trailer
                  </button>
                )}

                {/* Streaming (mobile only — below buttons) */}
                {anime.streaming?.length > 0 && (
                  <div className="xl:hidden mt-1">
                    <p className="text-[10px] uppercase tracking-wider font-semibold mb-1.5" style={{ color: MUTED_LO }}>
                      Watch On
                    </p>
                    <div className="flex flex-wrap gap-1.5">
                      {anime.streaming.slice(0, 4).map(s => (
                        <a key={s.name} href={s.url} target="_blank" rel="noreferrer"
                          className="flex items-center gap-1 px-2.5 py-1 rounded-lg text-[11px] transition-all hover:scale-105"
                          style={{ background: "rgba(255,255,255,.06)", border: "1px solid rgba(255,255,255,.09)", color: "rgba(255,255,255,.70)" }}>
                          {s.name}
                          <ExternalLink size={9} style={{ color: MUTED_LO }} />
                        </a>
                      ))}
                    </div>
                  </div>
                )}
              </motion.div>
            </div>

            {/* Stats grid — 2 cols on mobile, 1 on xl */}
            <motion.div
              initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.18 }}
              className="grid grid-cols-2 xl:grid-cols-1 gap-2 sm:gap-2.5 mb-4 sm:mb-5"
            >
              {statsLeft.map(s => <StatCard key={s.label} {...s} />)}
            </motion.div>

            {/* Season navigator */}
            <AnimatePresence>
              {(prevSeason || nextSeason) && (
                <motion.div
                  initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0 }} transition={{ duration: 0.28 }}
                  className="rounded-xl sm:rounded-2xl p-3 sm:p-4 mb-4 sm:mb-5"
                  style={{ background: "rgba(255,255,255,.03)", border: "1px solid rgba(255,255,255,.07)" }}
                >
                  <div className="flex items-center gap-2 mb-2.5 sm:mb-3">
                    <Layers size={12} style={{ color: "rgba(99,102,241,.75)" }} />
                    <p className="text-[10px] sm:text-xs uppercase tracking-wider font-semibold" style={{ color: MUTED }}>
                      Seasons
                    </p>
                  </div>
                  <div className="flex flex-col gap-2">
                    {prevSeason && <SeasonCard item={prevSeason} label="← Previous" direction="prev" />}
                    {nextSeason && <SeasonCard item={nextSeason} label="Next →"      direction="next" />}
                  </div>
                </motion.div>
              )}
            </AnimatePresence>

            {/* Audio */}
            {audioLangs.length > 0 && (
              <motion.div
                initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.22 }}
                className="rounded-xl sm:rounded-2xl p-3 sm:p-4 mb-4 sm:mb-5"
                style={{ background: CARD_BG, border: CARD_BR }}
              >
                <p className="text-[10px] sm:text-xs uppercase tracking-wider font-semibold mb-2 sm:mb-3" style={{ color: MUTED }}>
                  <Volume2 size={10} className="inline mr-1.5 -mt-0.5" />Audio
                </p>
                <div className="flex flex-wrap gap-1.5">
                  {audioLangs.map(l => <Pill key={l}>{l}</Pill>)}
                </div>
              </motion.div>
            )}

            {/* Streaming — desktop only */}
            {anime.streaming?.length > 0 && (
              <motion.div
                initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.24 }}
                className="hidden xl:block rounded-2xl p-4"
                style={{ background: CARD_BG, border: CARD_BR }}
              >
                <p className="text-xs uppercase tracking-wider font-semibold mb-3" style={{ color: MUTED }}>
                  Where to Watch
                </p>
                <div className="flex flex-col gap-1.5">
                  {anime.streaming.map(s => (
                    <a key={s.name} href={s.url} target="_blank" rel="noreferrer"
                      className="flex items-center justify-between px-3 py-2.5 rounded-xl text-xs sm:text-sm transition-all hover:scale-[1.02]"
                      style={{ background: "rgba(255,255,255,.05)", border: "1px solid rgba(255,255,255,.07)", color: "rgba(255,255,255,.72)" }}>
                      {s.name}
                      <ExternalLink size={10} style={{ color: MUTED_LO }} />
                    </a>
                  ))}
                </div>
              </motion.div>
            )}
          </div>

          {/* ══════════════════════
              MAIN RIGHT
          ══════════════════════ */}
          <motion.div
            className="flex-1 min-w-0"
            initial={{ opacity: 0, y: 14 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.12 }}
          >
            {/* Tabs — scrollable on mobile */}
            <div className="mb-5 sm:mb-7 overflow-x-auto"
                 style={{ scrollbarWidth: "none", msOverflowStyle: "none" }}>
              <div
                className="flex items-center gap-0.5 sm:gap-1 p-1 rounded-xl w-fit"
                style={{ background: "rgba(255,255,255,.05)", border: "1px solid rgba(255,255,255,.08)" }}
              >
                {TABS.map(tab => {
                  const count =
                    tab === "related"     ? related.length :
                    tab === "characters"  ? characters.length : 0;
                  return (
                    <button
                      key={tab}
                      onClick={() => setActiveTab(tab)}
                      className="relative px-3 sm:px-4 py-1.5 sm:py-2 rounded-lg text-xs sm:text-sm font-semibold capitalize transition-all whitespace-nowrap flex items-center gap-1 sm:gap-1.5"
                      style={{ color: activeTab === tab ? "#fff" : "rgba(255,255,255,.35)" }}
                    >
                      {activeTab === tab && (
                        <motion.div
                          layoutId="tab-pill"
                          className="absolute inset-0 rounded-lg"
                          style={{ background: "rgba(99,102,241,.32)", border: "1px solid rgba(99,102,241,.28)" }}
                          transition={{ type: "spring", stiffness: 420, damping: 32 }}
                        />
                      )}
                      <span className="relative z-10">{tab}</span>
                      {count > 0 && (
                        <span
                          className="relative z-10 font-bold rounded-full leading-none"
                          style={{
                            fontSize: 8,
                            padding: "2px 5px",
                            background: "rgba(99,102,241,.28)",
                            color: INDIGO,
                          }}
                        >
                          {count}
                        </span>
                      )}
                    </button>
                  );
                })}
              </div>
            </div>

            {/* Tab panels */}
            <AnimatePresence mode="wait">

              {/* ── OVERVIEW ── */}
              {activeTab === "overview" && (
                <motion.div key="ov"
                  initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -5 }} transition={{ duration: 0.2 }}
                  className="space-y-6 sm:space-y-8"
                >
                  {/* Genres */}
                  <div>
                    <SectionLabel>Genres & Themes</SectionLabel>
                    <div className="flex flex-wrap gap-1.5 sm:gap-2">
                      {anime.genres?.map(g       => <Pill key={g.mal_id} color="indigo">{g.name}</Pill>)}
                      {anime.themes?.map(t       => <Pill key={t.mal_id}>{t.name}</Pill>)}
                      {anime.demographics?.map(d => <Pill key={d.mal_id} color="pink">{d.name}</Pill>)}
                    </div>
                  </div>

                  {/* Synopsis */}
                  <div>
                    <SectionLabel>Synopsis</SectionLabel>
                    <p
                      className="leading-relaxed"
                      style={{ color: "rgba(203,213,225,.75)", fontSize: "clamp(12px,2vw,15px)" }}
                    >
                      {anime.synopsis ?? "No synopsis available."}
                    </p>
                  </div>

                  {/* Background */}
                  {anime.background && (
                    <div>
                      <SectionLabel>Background</SectionLabel>
                      <p className="leading-relaxed" style={{ color: "rgba(148,163,184,.60)", fontSize: "clamp(12px,2vw,14px)" }}>
                        {anime.background}
                      </p>
                    </div>
                  )}

                  {/* Studios / Producers */}
                  {(anime.studios?.length > 0 || anime.producers?.length > 0) && (
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 sm:gap-6">
                      {anime.studios?.length > 0 && (
                        <div>
                          <SectionLabel>Studios</SectionLabel>
                          <div className="flex flex-wrap gap-1.5">
                            {anime.studios.map(s => <Pill key={s.mal_id} color="yellow">{s.name}</Pill>)}
                          </div>
                        </div>
                      )}
                      {anime.producers?.length > 0 && (
                        <div>
                          <SectionLabel>Producers</SectionLabel>
                          <div className="flex flex-wrap gap-1.5">
                            {anime.producers.slice(0, 5).map(p => <Pill key={p.mal_id}>{p.name}</Pill>)}
                          </div>
                        </div>
                      )}
                    </div>
                  )}

                  {/* Score bar */}
                  {anime.score && (
                    <div
                      className="rounded-xl sm:rounded-2xl p-4 sm:p-5"
                      style={{ background: "rgba(255,255,255,.03)", border: "1px solid rgba(255,255,255,.07)" }}
                    >
                      <div className="flex items-end justify-between mb-3 sm:mb-4">
                        <div>
                          <SectionLabel>Community Score</SectionLabel>
                          <p className="font-black text-white" style={{ fontSize: "clamp(28px,6vw,52px)" }}>
                            {anime.score.toFixed(2)}
                            <span className="text-base sm:text-xl font-normal ml-1.5" style={{ color: "rgba(255,255,255,.22)" }}>
                              /10
                            </span>
                          </p>
                        </div>
                        <p className="text-[10px] sm:text-xs pb-1" style={{ color: MUTED_LO }}>
                          {anime.scored_by?.toLocaleString()} votes
                        </p>
                      </div>
                      <div className="h-1.5 sm:h-2 rounded-full overflow-hidden" style={{ background: "rgba(255,255,255,.07)" }}>
                        <motion.div
                          className="h-full rounded-full"
                          style={{ background: "linear-gradient(to right,#6366f1,#a855f7)" }}
                          initial={{ width: 0 }}
                          animate={{ width: `${(anime.score / 10) * 100}%` }}
                          transition={{ duration: 1.2, delay: 0.25, ease: "easeOut" }}
                        />
                      </div>
                    </div>
                  )}

                  {/* Season nav */}
                  {(prevSeason || nextSeason) && (
                    <div>
                      <SectionLabel>Season Navigation</SectionLabel>
                      <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 sm:gap-3">
                        {prevSeason && <SeasonCard item={prevSeason} label="← Previous Season" direction="prev" />}
                        {nextSeason && <SeasonCard item={nextSeason} label="Next Season →"     direction="next" />}
                      </div>
                    </div>
                  )}

                  {/* Recs */}
                  {recs.length > 0 && (
                    <AnimeRow items={recs.slice(0, 14)} title="You Might Also Like" icon={Sparkles} badge="Recommended" />
                  )}
                </motion.div>
              )}

              {/* ── CHARACTERS ── */}
              {activeTab === "characters" && (
                <motion.div key="ch"
                  initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -5 }} transition={{ duration: 0.2 }}
                >
                  {characters.length === 0 ? (
                    <EmptyState
                      icon={<Users size={28} />}
                      text={sidesLoaded ? "No character data available." : "Loading characters…"}
                    />
                  ) : (
                    <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-2.5 sm:gap-3.5">
                      {characters.map(({ character, role, voice_actors }, i) => (
                        <motion.div
                          key={character.mal_id}
                          initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }}
                          transition={{ delay: Math.min(i * 0.03, 0.45) }}
                          className="rounded-xl sm:rounded-2xl overflow-hidden group"
                          style={{ background: CARD_BG, border: CARD_BR }}
                        >
                          <div className="relative overflow-hidden" style={{ aspectRatio: "3/4" }}>
                            <img
                              src={character.images?.jpg?.image_url}
                              alt={character.name}
                              className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-105"
                              onError={e => { e.target.style.display = "none"; }}
                            />
                            {role === "Main" && (
                              <div
                                className="absolute top-1.5 left-1.5 px-1.5 py-0.5 rounded uppercase font-bold"
                                style={{ background: "rgba(99,102,241,.85)", color: "#fff", fontSize: 8 }}
                              >
                                Main
                              </div>
                            )}
                          </div>
                          <div className="p-2 sm:p-2.5">
                            <p className="text-white font-semibold line-clamp-1"
                               style={{ fontSize: "clamp(10px,2.5vw,12px)" }}>
                              {character.name}
                            </p>
                            <p className="mt-0.5" style={{ fontSize: 10, color: role === "Main" ? INDIGO : MUTED_LO }}>
                              {role}
                            </p>
                            {voice_actors?.[0] && (
                              <p className="mt-0.5 line-clamp-1" style={{ fontSize: 9, color: "rgba(148,163,184,.35)" }}>
                                {voice_actors[0].person.name}
                              </p>
                            )}
                          </div>
                        </motion.div>
                      ))}
                    </div>
                  )}
                </motion.div>
              )}

              {/* ── RELATED ── */}
              {activeTab === "related" && (
                <motion.div key="rel"
                  initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -5 }} transition={{ duration: 0.2 }}
                  className="space-y-8 sm:space-y-10"
                >
                  {/* Season nav */}
                  {(prevSeason || nextSeason) && (
                    <div>
                      <div className="flex items-center gap-2 mb-3 sm:mb-4">
                        <Layers size={13} style={{ color: "rgba(99,102,241,.85)" }} />
                        <h3 className="text-white font-bold text-sm sm:text-base">Season Navigation</h3>
                      </div>
                      <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 sm:gap-3">
                        {prevSeason && <SeasonCard item={prevSeason} label="← Previous Season" direction="prev" />}
                        {nextSeason && <SeasonCard item={nextSeason} label="Next Season →"     direction="next" />}
                      </div>
                    </div>
                  )}

                  {/* Related by type */}
                  {Object.keys(relatedByType).length === 0 ? (
                    <EmptyState
                      icon={<GitBranch size={26} />}
                      text={sidesLoaded ? "No related anime found." : "Loading related…"}
                    />
                  ) : (
                    Object.entries(relatedByType).map(([type, items]) => (
                      <AnimeRow
                        key={type}
                        items={items}
                        title={type}
                        icon={RELATION_ICON(type)}
                        badge={`${items.length} ${items.length === 1 ? "entry" : "entries"}`}
                      />
                    ))
                  )}

                  {/* Recommendations */}
                  {recs.length > 0 && (
                    <AnimeRow items={recs} title="Recommendations" icon={Sparkles} badge="Community picks" />
                  )}
                </motion.div>
              )}

              {/* ── DETAILS ── */}
              {activeTab === "details" && (
                <motion.div key="dt"
                  initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -5 }} transition={{ duration: 0.2 }}
                  className="space-y-5 sm:space-y-6"
                >
                  {/* Stats grid */}
                  <div className="grid grid-cols-2 sm:grid-cols-3 gap-2 sm:gap-3">
                    {statsRight.filter(s => s.value).map(s => <StatCard key={s.label} {...s} />)}
                  </div>

                  {/* All Titles */}
                  {anime.titles?.length > 0 && (
                    <div
                      className="rounded-xl sm:rounded-2xl p-4 sm:p-5 space-y-2.5 sm:space-y-3"
                      style={{ background: "rgba(255,255,255,.03)", border: CARD_BR }}
                    >
                      <SectionLabel>All Titles</SectionLabel>
                      {anime.titles.map(({ type, title }) => (
                        <div key={type} className="flex flex-col sm:flex-row sm:items-baseline gap-0.5 sm:gap-4">
                          <span
                            className="flex-shrink-0 uppercase tracking-wide font-semibold"
                            style={{ fontSize: "clamp(9px,2vw,11px)", color: MUTED_LO, width: "6rem" }}
                          >
                            {type}
                          </span>
                          <span className="text-xs sm:text-sm" style={{ color: "rgba(255,255,255,.70)" }}>
                            {title}
                          </span>
                        </div>
                      ))}
                    </div>
                  )}

                  {/* External links */}
                  {anime.external?.length > 0 && (
                    <div>
                      <SectionLabel>External Links</SectionLabel>
                      <div className="flex flex-wrap gap-1.5 sm:gap-2">
                        {anime.external.map(link => (
                          <a
                            key={link.name}
                            href={link.url}
                            target="_blank"
                            rel="noreferrer"
                            className="flex items-center gap-1.5 px-3 sm:px-4 py-1.5 sm:py-2 rounded-lg sm:rounded-xl text-xs sm:text-sm transition-all hover:scale-105"
                            style={{ background: "rgba(255,255,255,.05)", border: "1px solid rgba(255,255,255,.09)", color: "rgba(255,255,255,.68)" }}
                          >
                            {link.name}
                            <ExternalLink size={9} style={{ color: MUTED_LO }} />
                          </a>
                        ))}
                      </div>
                    </div>
                  )}
                </motion.div>
              )}

            </AnimatePresence>
          </motion.div>
        </div>
      </div>

      {/* Trailer modal */}
      <AnimatePresence>
        {showTrailer && anime.trailer?.url && (
          <TrailerModal url={anime.trailer.url} onClose={() => setShowTrailer(false)} />
        )}
      </AnimatePresence>
    </div>
  );
};

export default AnimeDetail;