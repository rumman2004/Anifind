import { useEffect, useState, useRef, useCallback } from "react";
import { useParams, useNavigate, Link } from "react-router-dom";
import {
  motion,
  AnimatePresence,
  useScroll,
  useSpring,
  useTransform,
} from "framer-motion";
import {
  Star, Heart, Play, ArrowLeft, Tv, Calendar, Clock,
  Users, Globe, Award, BookOpen, ExternalLink,
  Volume2, TrendingUp, ChevronLeft, ChevronRight,
  Layers, Shuffle, GitBranch, Sparkles, Info,
} from "lucide-react";
import { animeService } from "../services/animeService";
import { useAuth } from "../context/AuthContext";
import { useFavorites } from "../context/FavoritesContext";
import { getAudioLanguages } from "../utils/helpers";
import TrailerModal from "../components/anime/TrailerModal";
import EpisodeInfo from "../components/anime/EpisodeInfo";

/* ══════════════════════════════════════════════════════════
   DESIGN TOKENS
   Tip: set --navbar-height on :root if you have a fixed top
   navbar, so the sticky section nav sits underneath it.
══════════════════════════════════════════════════════════ */
const BG = "var(--bg-main, #0a0a14)";
const SURFACE = "var(--bg-card, rgba(255,255,255,.035))";
const BORDER = "1px solid var(--border-subtle, rgba(255,255,255,.08))";
const MUTED = "var(--text-muted, rgba(148,163,184,.62))";
const DIM = "var(--text-subtle, rgba(148,163,184,.42))";
const ACCENT = "var(--accent-glow, #a5b4fc)";
const NAV_OFFSET = "var(--navbar-height, 0px)";
const GRADIENT = "linear-gradient(90deg,#6366f1,#a855f7,#ec4899)";
const PAGE_X = "px-4 sm:px-6 lg:px-10 2xl:px-16";

const SECTIONS = [
  { id: "overview", label: "Overview", icon: Info },
  { id: "episodes", label: "Episodes", icon: Tv },
  { id: "characters", label: "Characters", icon: Users },
  { id: "related", label: "Related", icon: GitBranch },
  { id: "details", label: "Details", icon: BookOpen },
];
const SECTION_IDS = SECTIONS.map((s) => s.id);

/* ══════════════════════════════════════════════════════════
   HOOKS
══════════════════════════════════════════════════════════ */
/** Highlights whichever section is crossing the upper-middle of the viewport. */
const useScrollSpy = (ids) => {
  const [active, setActive] = useState(ids[0]);

  useEffect(() => {
    const els = ids.map((i) => document.getElementById(i)).filter(Boolean);
    if (!els.length) return;

    const io = new IntersectionObserver(
      (entries) => {
        entries.forEach((e) => {
          if (e.isIntersecting) setActive(e.target.id);
        });
      },
      { rootMargin: "-30% 0px -60% 0px" }
    );
    els.forEach((el) => io.observe(el));

    const onScroll = () => {
      const atBottom =
        window.innerHeight + window.scrollY >= document.documentElement.scrollHeight - 6;
      if (atBottom) setActive(ids[ids.length - 1]);
    };
    window.addEventListener("scroll", onScroll, { passive: true });

    return () => {
      io.disconnect();
      window.removeEventListener("scroll", onScroll);
    };
  }, [ids]);

  return active;
};

/* ══════════════════════════════════════════════════════════
   SMALL PRIMITIVES
══════════════════════════════════════════════════════════ */
const PILL_STYLES = {
  default: {
    background: "var(--nav-link-active-bg, rgba(255,255,255,.06))",
    border: "1px solid var(--border-medium, rgba(255,255,255,.11))",
    color: "var(--text-heading, #fff)",
  },
  indigo: {
    background: "rgba(99,102,241,.14)",
    border: "1px solid rgba(99,102,241,.30)",
    color: "var(--color-primary, #a5b4fc)",
  },
  green: {
    background: "rgba(34,197,94,.12)",
    border: "1px solid rgba(34,197,94,.28)",
    color: "var(--color-secondary, #4ade80)",
  },
  yellow: {
    background: "rgba(234,179,8,.12)",
    border: "1px solid rgba(234,179,8,.28)",
    color: "var(--text-heading, #fde047)",
  },
  pink: {
    background: "rgba(236,72,153,.12)",
    border: "1px solid rgba(236,72,153,.28)",
    color: "#db2777",
  },
};

const Pill = ({ children, color = "default" }) => (
  <span
    className="inline-flex items-center px-2.5 py-1 rounded-full text-[11px] sm:text-xs font-medium"
    style={PILL_STYLES[color] ?? PILL_STYLES.default}
  >
    {children}
  </span>
);

const Label = ({ children }) => (
  <p
    className="text-[10px] sm:text-[11px] uppercase tracking-[.16em] font-semibold mb-2.5"
    style={{ color: DIM }}
  >
    {children}
  </p>
);

const Card = ({ title, icon: Icon, children, className = "", style }) => (
  <div
    className={`rounded-2xl p-4 sm:p-5 ${className}`}
    style={{ background: SURFACE, border: BORDER, ...style }}
  >
    {title && (
      <div className="flex items-center gap-2 mb-3">
        {Icon && <Icon size={13} style={{ color: "#818cf8" }} />}
        <p
          className="text-[10px] sm:text-[11px] uppercase tracking-[.16em] font-semibold"
          style={{ color: MUTED }}
        >
          {title}
        </p>
      </div>
    )}
    {children}
  </div>
);

const FactRow = ({ icon, label, value }) =>
  value ? (
    <div className="flex items-start justify-between gap-4 py-2.5 border-t first:border-t-0 first:pt-0 last:pb-0" style={{ borderColor: "var(--border-subtle, rgba(255,255,255,0.06))" }}>
      <span
        className="flex items-center gap-2 text-[11px] uppercase tracking-wider font-semibold flex-shrink-0"
        style={{ color: DIM }}
      >
        {icon}
        {label}
      </span>
      <span className="text-xs sm:text-[13px] font-medium text-right break-words" style={{ color: "var(--text-heading, #fff)" }}>
        {value}
      </span>
    </div>
  ) : null;

const StatCard = ({ icon, label, value }) => (
  <div
    className="flex flex-col gap-1.5 p-3 sm:p-4 rounded-xl"
    style={{ background: SURFACE, border: BORDER }}
  >
    <div className="flex items-center gap-1.5" style={{ color: DIM }}>
      {icon}
      <span className="text-[10px] sm:text-[11px] uppercase tracking-wider font-semibold truncate">
        {label}
      </span>
    </div>
    <p className="font-semibold text-sm leading-snug break-words" style={{ color: "var(--text-heading, #fff)" }}>{value ?? "—"}</p>
  </div>
);

const EmptyState = ({ icon, text }) => (
  <div
    className="py-10 sm:py-14 flex flex-col items-center gap-3 rounded-2xl"
    style={{ color: DIM, border: "1px dashed rgba(255,255,255,.09)" }}
  >
    <div className="opacity-40">{icon}</div>
    <p className="text-xs sm:text-sm">{text}</p>
  </div>
);

const Expandable = ({ text, limit = 520, style }) => {
  const [open, setOpen] = useState(false);
  const long = text.length > limit;
  return (
    <div>
      <p className="leading-relaxed whitespace-pre-line" style={style}>
        {open || !long ? text : `${text.slice(0, limit).trimEnd()}…`}
      </p>
      {long && (
        <button
          onClick={() => setOpen((o) => !o)}
          className="mt-2 text-xs font-semibold transition-colors hover:text-white"
          style={{ color: ACCENT }}
        >
          {open ? "Show less" : "Read more"}
        </button>
      )}
    </div>
  );
};

/* ══════════════════════════════════════════════════════════
   SCORE RING (animates when scrolled into view)
══════════════════════════════════════════════════════════ */
const ScoreRing = ({ score, size = 128 }) => {
  const r = 52;
  const c = 2 * Math.PI * r;
  return (
    <div className="relative flex-shrink-0" style={{ width: size, height: size }}>
      <svg viewBox="0 0 120 120" className="w-full h-full -rotate-90">
        <defs>
          <linearGradient id="ring-grad" x1="0" y1="0" x2="1" y2="1">
            <stop offset="0%" stopColor="#6366f1" />
            <stop offset="100%" stopColor="#ec4899" />
          </linearGradient>
        </defs>
        <circle cx="60" cy="60" r={r} fill="none" stroke="rgba(255,255,255,.07)" strokeWidth="8" />
        <motion.circle
          cx="60"
          cy="60"
          r={r}
          fill="none"
          stroke="url(#ring-grad)"
          strokeWidth="8"
          strokeLinecap="round"
          strokeDasharray={c}
          initial={{ strokeDashoffset: c }}
          whileInView={{ strokeDashoffset: c * (1 - score / 10) }}
          viewport={{ once: true, amount: 0.6 }}
          transition={{ duration: 1.3, ease: "easeOut" }}
        />
      </svg>
      <div className="absolute inset-0 flex flex-col items-center justify-center">
        <span className="font-black leading-none" style={{ fontSize: size * 0.24, color: "var(--text-heading, #fff)" }}>
          {score.toFixed(2)}
        </span>
        <span className="text-[10px] mt-1" style={{ color: DIM }}>
          out of 10
        </span>
      </div>
    </div>
  );
};

const Metric = ({ label, value }) => (
  <div className="min-w-0">
    <dt className="text-[10px] uppercase tracking-wider font-semibold" style={{ color: DIM }}>
      {label}
    </dt>
    <dd className="font-bold text-sm sm:text-base truncate" style={{ color: "var(--text-heading, #fff)" }}>{value ?? "—"}</dd>
  </div>
);

const CommunityCard = ({ anime }) => (
  <Card title="Community score" icon={TrendingUp}>
    <div className="flex items-center gap-5">
      <ScoreRing score={anime.score} />
      <dl className="grid grid-cols-2 gap-x-5 gap-y-3 flex-1 min-w-0">
        <Metric label="Rank" value={anime.rank ? `#${anime.rank.toLocaleString()}` : null} />
        <Metric
          label="Popularity"
          value={anime.popularity ? `#${anime.popularity.toLocaleString()}` : null}
        />
        <Metric label="Members" value={anime.members?.toLocaleString()} />
        <Metric label="Favorites" value={anime.favorites?.toLocaleString()} />
      </dl>
    </div>

    <div className="mt-5">
      <div className="h-1.5 rounded-full overflow-hidden" style={{ background: "rgba(255,255,255,.07)" }}>
        <motion.div
          className="h-full rounded-full"
          style={{ background: GRADIENT }}
          initial={{ width: 0 }}
          whileInView={{ width: `${(anime.score / 10) * 100}%` }}
          viewport={{ once: true, amount: 0.6 }}
          transition={{ duration: 1.2, ease: "easeOut" }}
        />
      </div>
      <div className="flex justify-between mt-1.5 text-[10px]" style={{ color: DIM }}>
        <span>0</span>
        <span>{anime.scored_by ? `${anime.scored_by.toLocaleString()} votes` : ""}</span>
        <span>10</span>
      </div>
    </div>
  </Card>
);

/* ══════════════════════════════════════════════════════════
   ANIME ROW (horizontal scroller)
══════════════════════════════════════════════════════════ */
const RELATION_COLORS = {
  Sequel: "rgba(99,102,241,.9)",
  Prequel: "rgba(59,130,246,.9)",
  "Spin-off": "rgba(249,115,22,.9)",
  "Side story": "rgba(234,179,8,.9)",
};

const AnimeRowCard = ({ item, index }) => {
  const [err, setErr] = useState(false);
  const img = item?.images?.jpg?.large_image_url || item?.images?.jpg?.image_url;
  const relBg = RELATION_COLORS[item?.relation] ?? "rgba(99,102,241,.8)";

  return (
    <motion.div
      initial={{ opacity: 0, y: 10 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true, amount: 0.2 }}
      transition={{ delay: Math.min(index * 0.03, 0.3), duration: 0.25 }}
      className="flex-shrink-0 group"
      style={{ width: "clamp(104px, 30vw, 150px)" }}
    >
      <Link to={`/anime/${item.mal_id}`} className="block">
        <div
          className="relative rounded-xl overflow-hidden mb-2"
          style={{ aspectRatio: "3/4", border: BORDER }}
        >
          {!err && img ? (
            <img
              src={img}
              alt={item.title ?? ""}
              loading="lazy"
              className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-105"
              onError={() => setErr(true)}
            />
          ) : (
            <div className="w-full h-full flex items-center justify-center" style={{ background: SURFACE }}>
              <Tv size={20} style={{ color: DIM }} />
            </div>
          )}

          <div
            className="absolute inset-0 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity duration-200"
            style={{ background: "rgba(0,0,0,.4)" }}
          >
            <div
              className="w-9 h-9 rounded-full flex items-center justify-center"
              style={{ background: "rgba(99,102,241,.92)" }}
            >
              <Play size={12} className="text-white fill-white ml-0.5" />
            </div>
          </div>

          {item.score && (
            <div
              className="absolute top-1.5 left-1.5 flex items-center gap-0.5 px-1.5 py-0.5 rounded"
              style={{ background: "rgba(0,0,0,.78)", backdropFilter: "blur(4px)" }}
            >
              <Star size={8} className="text-yellow-400 fill-yellow-400" />
              <span className="text-white font-bold" style={{ fontSize: 9 }}>
                {item.score.toFixed(1)}
              </span>
            </div>
          )}

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

        <p
          className="font-semibold line-clamp-2 leading-tight group-hover:text-indigo-400 transition-colors"
          style={{ fontSize: "clamp(10px,2.5vw,12px)", color: "var(--text-heading, #fff)" }}
        >
          {item.title_english || item.title}
        </p>
        {item.year && (
          <p className="mt-0.5" style={{ fontSize: 10, color: DIM }}>
            {item.year}
          </p>
        )}
      </Link>
    </motion.div>
  );
};

const AnimeRow = ({ items, title, icon: Icon, badge }) => {
  const rowRef = useRef(null);
  const [canLeft, setCanLeft] = useState(false);
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
    window.addEventListener("resize", checkScroll);
    return () => {
      el?.removeEventListener("scroll", checkScroll);
      window.removeEventListener("resize", checkScroll);
    };
  }, [items, checkScroll]);

  if (!items?.length) return null;

  const scroll = (dir) => rowRef.current?.scrollBy({ left: dir * 320, behavior: "smooth" });

  return (
    <div>
      <div className="flex items-center justify-between mb-3">
        <div className="flex items-center gap-2 min-w-0">
          {Icon && <Icon size={14} className="flex-shrink-0" style={{ color: "#818cf8" }} />}
          <h3 className="font-bold text-sm sm:text-base truncate" style={{ color: "var(--text-heading, #fff)" }}>{title}</h3>
          {badge && (
            <span
              className="flex-shrink-0 text-[10px] font-bold px-2 py-0.5 rounded-full"
              style={{
                background: "rgba(99,102,241,.16)",
                color: ACCENT,
                border: "1px solid rgba(99,102,241,.28)",
              }}
            >
              {badge}
            </span>
          )}
        </div>

        <div className="flex gap-1.5 flex-shrink-0 ml-2">
          {[
            { dir: -1, Ic: ChevronLeft, can: canLeft, label: "Scroll left" },
            { dir: 1, Ic: ChevronRight, can: canRight, label: "Scroll right" },
          ].map(({ dir, Ic, can, label }) => (
            <button
              key={dir}
              aria-label={label}
              onClick={() => scroll(dir)}
              disabled={!can}
              className="w-8 h-8 rounded-full flex items-center justify-center transition-all duration-200"
              style={{
                background: can ? "var(--nav-btn-hover-bg, rgba(255,255,255,.10))" : "var(--nav-btn-bg, rgba(255,255,255,.03))",
                border: "1px solid var(--border-medium, rgba(255,255,255,.12))",
                color: can ? "var(--text-heading, #fff)" : "var(--text-muted, rgba(255,255,255,.3))",
                opacity: can ? 1 : 0.4,
                cursor: can ? "pointer" : "default",
              }}
            >
              <Ic size={14} />
            </button>
          ))}
        </div>
      </div>

      <div
        ref={rowRef}
        className="flex gap-2.5 sm:gap-3.5 overflow-x-auto pb-1"
        style={{ scrollbarWidth: "none", msOverflowStyle: "none" }}
      >
        {items.map((item, i) => (
          <AnimeRowCard key={`${item.mal_id}-${i}`} item={item} index={i} />
        ))}
      </div>
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
      className="flex items-center gap-3 p-3 sm:p-3.5 rounded-2xl group transition-all hover:bg-white/[0.06]"
      style={{ background: SURFACE, border: BORDER }}
    >
      {direction === "prev" && (
        <ChevronLeft size={15} className="flex-shrink-0" style={{ color: DIM }} />
      )}

      <div
        className="flex-shrink-0 rounded-lg overflow-hidden"
        style={{ width: 44, height: 60, border: BORDER }}
      >
        {!err && img ? (
          <img
            src={img}
            alt={item.title ?? ""}
            className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
            onError={() => setErr(true)}
          />
        ) : (
          <div className="w-full h-full flex items-center justify-center" style={{ background: SURFACE }}>
            <Tv size={12} style={{ color: DIM }} />
          </div>
        )}
      </div>

      <div className="flex-1 min-w-0">
        <p
          className="uppercase tracking-widest font-semibold mb-0.5"
          style={{ fontSize: 9, color: "#818cf8" }}
        >
          {label}
        </p>
        <p
          className="font-semibold line-clamp-2 leading-snug group-hover:text-indigo-400 transition-colors"
          style={{ fontSize: "clamp(12px,2.5vw,13px)", color: "var(--text-heading, #fff)" }}
        >
          {item.title_english || item.title}
        </p>
        {(item.season || item.year) && (
          <p className="capitalize mt-0.5" style={{ fontSize: 10, color: DIM }}>
            {[item.season, item.year].filter(Boolean).join(" ")}
          </p>
        )}
      </div>

      {direction === "next" && (
        <ChevronRight size={15} className="flex-shrink-0" style={{ color: DIM }} />
      )}
    </Link>
  );
};

/* ══════════════════════════════════════════════════════════
   SECTION (renders its node on the scroll rope)
══════════════════════════════════════════════════════════ */
const Section = ({ id, title, icon: Icon, count, reached, children }) => (
  <section
    id={id}
    className="relative"
    style={{ scrollMarginTop: `calc(${NAV_OFFSET} + 72px)` }}
  >
    {/* rope node */}
    <span
      aria-hidden
      className="hidden lg:block absolute rounded-full transition-all duration-500"
      style={{
        left: -41,
        top: 8,
        width: 15,
        height: 15,
        zIndex: 2,
        background: reached ? "linear-gradient(135deg,#6366f1,#ec4899)" : "var(--bg-main, #0a0a14)",
        border: reached ? "2px solid var(--bg-main, #0a0a14)" : "2px solid var(--border-subtle, rgba(255,255,255,.16))",
        boxShadow: reached
          ? "0 0 0 2px rgba(129,140,248,.45), 0 0 16px rgba(129,140,248,.55)"
          : "none",
      }}
    />

    <header className="flex items-center gap-3 mb-4 sm:mb-5">
      <div
        className="w-8 h-8 rounded-lg flex items-center justify-center flex-shrink-0"
        style={{ background: "rgba(99,102,241,.14)", border: "1px solid rgba(99,102,241,.26)" }}
      >
        <Icon size={14} style={{ color: ACCENT }} />
      </div>
      <h2 className="font-bold text-lg sm:text-xl tracking-tight" style={{ color: "var(--text-heading, #fff)" }}>{title}</h2>
      {count > 0 && (
        <span
          className="text-[10px] font-bold px-2 py-0.5 rounded-full"
          style={{ background: "rgba(99,102,241,.16)", color: ACCENT }}
        >
          {count}
        </span>
      )}
      <div className="flex-1 h-px" style={{ background: "var(--border-subtle, rgba(255,255,255,.07))" }} />
    </header>

    {children}
  </section>
);

/* ══════════════════════════════════════════════════════════
   BODY (rendered once the anime has loaded)
══════════════════════════════════════════════════════════ */
const RELATION_ICON = (t) =>
  t.includes("Sequel") ? ChevronRight : t.includes("Prequel") ? ChevronLeft : t.includes("Spin") ? Shuffle : GitBranch;

const DetailBody = ({ anime, characters, related, recs, prevSeason, nextSeason, sidesLoaded }) => {
  const navigate = useNavigate();
  const { user } = useAuth();
  const { isFavorite, addFavorite, removeFavorite } = useFavorites();

  const [favLoading, setFavLoading] = useState(false);
  const [showTrailer, setShowTrailer] = useState(false);
  const [imgErr, setImgErr] = useState(false);

  /* scroll-driven values */
  const contentRef = useRef(null);
  const { scrollYProgress: pageRaw } = useScroll();
  const pageBar = useSpring(pageRaw, { stiffness: 140, damping: 30, restDelta: 0.001 });
  const { scrollYProgress: ropeRaw } = useScroll({
    target: contentRef,
    offset: ["start 0.55", "end 0.55"],
  });
  const rope = useSpring(ropeRaw, { stiffness: 120, damping: 28, restDelta: 0.001 });
  const headTop = useTransform(rope, (v) => `${v * 100}%`);

  const active = useScrollSpy(SECTION_IDS);
  const activeIdx = SECTION_IDS.indexOf(active);
  const reached = (id) => SECTION_IDS.indexOf(id) <= activeIdx;

  const goTo = (id) =>
    document.getElementById(id)?.scrollIntoView({ behavior: "smooth", block: "start" });

  const favorited = isFavorite(anime.mal_id);
  const audioLangs = getAudioLanguages(anime);
  const poster = anime.images?.jpg?.large_image_url || anime.images?.jpg?.image_url;
  const title = anime.title_english || anime.title;
  const hasTrailer = anime.trailer?.youtube_id || anime.trailer?.embed_url || anime.trailer?.url;

  const handleFavorite = async () => {
    if (!user) return navigate("/login");
    setFavLoading(true);
    try {
      if (favorited) await removeFavorite(anime.mal_id);
      else await addFavorite(anime);
    } finally {
      setFavLoading(false);
    }
  };

  const relatedByType = related.reduce((acc, item) => {
    (acc[item.relation] ||= []).push(item);
    return acc;
  }, {});

  const counts = { characters: characters.length, related: related.length + recs.length };

  return (
    <div className="min-h-screen w-full" style={{ background: BG }}>
      {/* page scroll progress */}
      <motion.div
        aria-hidden
        className="fixed left-0 right-0 h-[2px] z-50 origin-left"
        style={{ top: NAV_OFFSET, scaleX: pageBar, background: GRADIENT }}
      />

      {/* ─────────── HERO ─────────── */}
      <div
        className="relative w-full overflow-hidden"
        style={{ height: "clamp(260px, 42vw, 520px)" }}
      >
        <AnimatePresence mode="wait">
          <motion.img
            key={`hero-${anime.mal_id}`}
            src={imgErr ? "" : poster}
            alt=""
            aria-hidden
            className="absolute inset-0 w-full h-full object-cover object-top"
            style={{ filter: "blur(4px)", transform: "scale(1.08)" }}
            initial={{ opacity: 0 }}
            animate={{ opacity: 0.9 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.55 }}
            onError={() => setImgErr(true)}
          />
        </AnimatePresence>

        <div
          className="absolute inset-0"
          style={{
            background: [
              "linear-gradient(to right, rgba(10,10,20,.96) 0%, rgba(10,10,20,.6) 45%, rgba(10,10,20,.15) 75%, transparent 100%)",
              "linear-gradient(to top, rgba(10,10,20,1) 0%, rgba(10,10,20,.65) 32%, transparent 68%)",
              "linear-gradient(to bottom, rgba(10,10,20,.6) 0%, transparent 30%)",
            ].join(","),
          }}
        />

        <div className={`absolute top-4 sm:top-6 left-0 ${PAGE_X}`} style={{ zIndex: 20 }}>
          <button
            onClick={() => navigate(-1)}
            className="inline-flex items-center gap-1.5 text-xs sm:text-sm font-medium px-3 py-1.5 rounded-lg transition-all hover:bg-white/10 active:scale-95"
            style={{
              color: "rgba(255,255,255,.7)",
              background: "rgba(255,255,255,.07)",
              border: "1px solid rgba(255,255,255,.12)",
              backdropFilter: "blur(6px)",
            }}
          >
            <ArrowLeft size={13} /> Back
          </button>
        </div>

        <div className={`absolute bottom-0 left-0 right-0 ${PAGE_X} pb-6 sm:pb-9`} style={{ zIndex: 20 }}>
          <div className="flex flex-wrap gap-1.5 mb-2.5">
            {anime.genres?.slice(0, 4).map((g) => (
              <Pill key={g.mal_id} color="indigo">
                {g.name}
              </Pill>
            ))}
            {anime.status === "Currently Airing" && (
              <Pill color="green">
                <span className="w-1.5 h-1.5 rounded-full bg-green-400 animate-pulse mr-1.5 inline-block" />
                Airing
              </Pill>
            )}
          </div>

          <h1
            className="font-black text-white leading-[1.05] mb-1.5"
            style={{
              fontSize: "clamp(24px, 4.4vw, 56px)",
              letterSpacing: "-0.025em",
              textShadow: "0 2px 24px rgba(0,0,0,.55)",
              maxWidth: "min(900px, 92vw)",
            }}
          >
            {title}
          </h1>

          {anime.title_english && anime.title !== anime.title_english && (
            <p className="mb-3 font-medium" style={{ color: "rgba(255,255,255,.4)", fontSize: "clamp(12px,1.6vw,15px)" }}>
              {anime.title}
            </p>
          )}

          <div className="flex flex-wrap items-center gap-x-3 gap-y-2 text-xs sm:text-sm" style={{ color: "rgba(255,255,255,.5)" }}>
            {anime.score && (
              <span className="flex items-center gap-1">
                <Star size={14} className="text-yellow-400 fill-yellow-400" />
                <span className="text-yellow-300 font-bold text-sm sm:text-base">{anime.score.toFixed(1)}</span>
              </span>
            )}
            {anime.year && <span>{anime.year}</span>}
            {anime.type && <Pill color="indigo">{anime.type}</Pill>}
            {anime.episodes && <span>{anime.episodes} eps</span>}
            {anime.duration && <span className="hidden sm:inline">{anime.duration}</span>}
          </div>
        </div>
      </div>

      {/* ─────────── STICKY SECTION NAV ─────────── */}
      <nav
        className="sticky z-40 w-full transition-colors duration-300"
        style={{
          top: NAV_OFFSET,
          background: "var(--nav-bg, rgba(10,10,20,.82))",
          backdropFilter: "blur(14px)",
          borderBottom: BORDER,
        }}
      >
        <div className={`w-full ${PAGE_X} flex items-center justify-between gap-6`}>
          <div className="flex items-center overflow-x-auto -mx-2 sm:mx-0" style={{ scrollbarWidth: "none" }}>
            {SECTIONS.map(({ id, label, icon: Icon }) => {
              const on = active === id;
              const count = counts[id];
              return (
                <button
                  key={id}
                  onClick={() => goTo(id)}
                  className="relative flex items-center gap-1.5 px-3 sm:px-4 py-3.5 text-xs sm:text-sm font-semibold whitespace-nowrap transition-colors"
                  style={{ color: on ? "var(--text-heading, #fff)" : "var(--text-muted, rgba(255,255,255,.42))" }}
                >
                  <Icon size={13} className="hidden sm:block" />
                  {label}
                  {count > 0 && (
                    <span
                      className="font-bold rounded-full leading-none"
                      style={{
                        fontSize: 9,
                        padding: "2px 5px",
                        background: "rgba(99,102,241,.25)",
                        color: ACCENT,
                      }}
                    >
                      {count}
                    </span>
                  )}
                  {on && (
                    <motion.span
                      layoutId="nav-underline"
                      className="absolute left-3 right-3 -bottom-px h-0.5 rounded-full"
                      style={{ background: GRADIENT }}
                      transition={{ type: "spring", stiffness: 420, damping: 34 }}
                    />
                  )}
                </button>
              );
            })}
          </div>
          <p className="hidden lg:block text-xs font-semibold truncate max-w-[32%]" style={{ color: "var(--text-muted, rgba(255,255,255,.45))" }}>
            {title}
          </p>
        </div>
      </nav>

      {/* ─────────── MAIN GRID ─────────── */}
      <main className={`w-full ${PAGE_X} py-8 sm:py-10 lg:py-12`}>
        <div className="grid grid-cols-1 xl:grid-cols-[288px_minmax(0,1fr)] 2xl:grid-cols-[320px_minmax(0,1fr)] gap-8 xl:gap-12">
          {/* ═══ SIDEBAR ═══ */}
          <aside
            className="xl:self-start xl:sticky xl:overflow-y-auto"
            style={{
              top: `calc(${NAV_OFFSET} + 72px)`,
              maxHeight: `calc(100vh - ${NAV_OFFSET} - 90px)`,
              scrollbarWidth: "none",
            }}
          >
            <div className="flex flex-row xl:flex-col gap-4 sm:gap-5 mb-4 sm:mb-5">
              <motion.div
                initial={{ opacity: 0, y: 14 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.06 }}
                className="flex-shrink-0 xl:w-full"
                style={{ width: "clamp(116px, 28vw, 200px)" }}
              >
                <div
                  className="relative rounded-2xl overflow-hidden"
                  style={{
                    aspectRatio: "3/4",
                    boxShadow: "0 18px 60px rgba(0,0,0,.6), 0 0 0 1px rgba(255,255,255,.08)",
                  }}
                >
                  <img
                    src={poster}
                    alt={anime.title}
                    className="w-full h-full object-cover"
                    onError={(e) => {
                      e.target.style.display = "none";
                    }}
                  />
                </div>
              </motion.div>

              <motion.div
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.12 }}
                className="flex flex-col gap-2.5 flex-1 xl:flex-none justify-center xl:justify-start"
              >
                <button
                  onClick={handleFavorite}
                  disabled={favLoading}
                  className="w-full flex items-center justify-center gap-2 py-3 rounded-xl font-semibold transition-all hover:brightness-110 active:scale-[.98] disabled:opacity-55"
                  style={{
                    fontSize: "clamp(12px,2.5vw,13px)",
                    ...(favorited
                      ? {
                          background: "linear-gradient(135deg,#ec4899,#f43f5e)",
                          color: "#fff",
                          boxShadow: "0 6px 20px rgba(236,72,153,.28)",
                        }
                      : {
                          background: "var(--nav-btn-bg, rgba(255,255,255,.07))",
                          border: "1px solid var(--border-subtle, rgba(255,255,255,.14))",
                          color: "var(--text-heading, rgba(255,255,255,.85))",
                        }),
                  }}
                >
                  <Heart size={14} className={favorited ? "fill-white" : ""} />
                  {favLoading ? "Saving…" : favorited ? "In Favorites" : "Add to Favorites"}
                </button>

                {hasTrailer && (
                  <button
                    onClick={() => setShowTrailer(true)}
                    className="w-full flex items-center justify-center gap-2 py-3 rounded-xl font-semibold transition-all hover:brightness-125 active:scale-[.98]"
                    style={{
                      fontSize: "clamp(12px,2.5vw,13px)",
                      background: "rgba(99,102,241,.16)",
                      border: "1px solid rgba(99,102,241,.3)",
                      color: ACCENT,
                    }}
                  >
                    <Play size={13} className="fill-current" /> Watch Trailer
                  </button>
                )}
              </motion.div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-1 gap-3 sm:gap-4">
              <Card title="Quick facts" icon={Info}>
                <FactRow icon={<Tv size={11} />} label="Type" value={anime.type} />
                <FactRow
                  icon={<Layers size={11} />}
                  label="Episodes"
                  value={anime.episodes ? `${anime.episodes}` : null}
                />
                <FactRow icon={<Globe size={11} />} label="Status" value={anime.status} />
                <FactRow icon={<Clock size={11} />} label="Duration" value={anime.duration} />
                <FactRow icon={<Award size={11} />} label="Rating" value={anime.rating} />
              </Card>

              {audioLangs.length > 0 && (
                <Card title="Audio" icon={Volume2}>
                  <div className="flex flex-wrap gap-1.5">
                    {audioLangs.map((l) => (
                      <Pill key={l}>{l}</Pill>
                    ))}
                  </div>
                </Card>
              )}

              {anime.streaming?.length > 0 && (
                <Card title="Where to watch" icon={Play} className="sm:col-span-2 xl:col-span-1">
                  <div className="flex flex-col gap-1.5">
                    {anime.streaming.map((s) => (
                      <a
                        key={s.name}
                        href={s.url}
                        target="_blank"
                        rel="noreferrer"
                        className="flex items-center justify-between px-3 py-2.5 rounded-xl text-xs sm:text-[13px] transition-all hover:opacity-80"
                        style={{
                          background: "var(--nav-link-active-bg, rgba(255,255,255,.04))",
                          border: "1px solid var(--border-subtle, rgba(255,255,255,.07))",
                          color: "var(--text-heading, #fff)",
                        }}
                      >
                        {s.name}
                        <ExternalLink size={11} style={{ color: "var(--text-muted, #94a3b8)" }} />
                      </a>
                    ))}
                  </div>
                </Card>
              )}
            </div>
          </aside>

          {/* ═══ CONTENT WITH SCROLL ROPE ═══ */}
          <div ref={contentRef} className="relative min-w-0 lg:pl-12">
            {/* rope */}
            <div aria-hidden className="hidden lg:block absolute left-0 top-0 bottom-0 w-[30px] pointer-events-none">
              <div
                className="absolute top-0 bottom-0"
                style={{ left: 14, width: 1, background: "var(--border-subtle, rgba(255,255,255,.09))" }}
              />
              <motion.div
                className="absolute top-0 bottom-0 origin-top rounded-full"
                style={{
                  left: 13.5,
                  width: 2,
                  scaleY: rope,
                  background: "linear-gradient(to bottom,#6366f1,#a855f7,#ec4899)",
                  boxShadow: "0 0 12px rgba(129,140,248,.55)",
                }}
              />
              <motion.div
                className="absolute rounded-full"
                style={{
                  left: 8,
                  top: headTop,
                  width: 12,
                  height: 12,
                  marginTop: -6,
                  background: "#fff",
                  boxShadow: "0 0 0 3px rgba(129,140,248,.35), 0 0 18px rgba(236,72,153,.7)",
                }}
              />
            </div>

            <div className="space-y-14 sm:space-y-16">
              {/* ── OVERVIEW ── */}
              <Section id="overview" title="Overview" icon={Info} reached={reached("overview")}>
                <div className="grid gap-8 2xl:grid-cols-[minmax(0,1fr)_340px]">
                  <div className="space-y-7 min-w-0">
                    <div>
                      <Label>Synopsis</Label>
                      <Expandable
                        text={anime.synopsis ?? "No synopsis available."}
                        style={{ color: "var(--text-main, rgba(203,213,225,.80))", fontSize: "clamp(13px,1.6vw,15px)" }}
                      />
                    </div>

                    <div>
                      <Label>Genres & themes</Label>
                      <div className="flex flex-wrap gap-1.5 sm:gap-2">
                        {anime.genres?.map((g) => (
                          <Pill key={g.mal_id} color="indigo">
                            {g.name}
                          </Pill>
                        ))}
                        {anime.themes?.map((t) => (
                          <Pill key={t.mal_id}>{t.name}</Pill>
                        ))}
                        {anime.demographics?.map((d) => (
                          <Pill key={d.mal_id} color="pink">
                            {d.name}
                          </Pill>
                        ))}
                      </div>
                    </div>

                    {(anime.studios?.length > 0 || anime.producers?.length > 0) && (
                      <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
                        {anime.studios?.length > 0 && (
                          <div>
                            <Label>Studios</Label>
                            <div className="flex flex-wrap gap-1.5">
                              {anime.studios.map((s) => (
                                <Pill key={s.mal_id} color="yellow">
                                  {s.name}
                                </Pill>
                              ))}
                            </div>
                          </div>
                        )}
                        {anime.producers?.length > 0 && (
                          <div>
                            <Label>Producers</Label>
                            <div className="flex flex-wrap gap-1.5">
                              {anime.producers.slice(0, 5).map((p) => (
                                <Pill key={p.mal_id}>{p.name}</Pill>
                              ))}
                            </div>
                          </div>
                        )}
                      </div>
                    )}

                    {anime.background && (
                      <div>
                        <Label>Background</Label>
                        <Expandable
                          text={anime.background}
                          limit={360}
                          style={{ color: MUTED, fontSize: "clamp(12px,1.5vw,14px)" }}
                        />
                      </div>
                    )}
                  </div>

                  {anime.score && (
                    <div className="2xl:sticky 2xl:self-start" style={{ top: `calc(${NAV_OFFSET} + 72px)` }}>
                      <CommunityCard anime={anime} />
                    </div>
                  )}
                </div>

                {(prevSeason || nextSeason) && (
                  <div className="mt-8">
                    <Label>Season navigation</Label>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                      {prevSeason && <SeasonCard item={prevSeason} label="← Previous season" direction="prev" />}
                      {nextSeason && <SeasonCard item={nextSeason} label="Next season →" direction="next" />}
                    </div>
                  </div>
                )}
              </Section>

              {/* ── EPISODES ── */}
              <Section id="episodes" title="Episodes" icon={Tv} reached={reached("episodes")}>
                <EpisodeInfo anime={anime} />
              </Section>

              {/* ── CHARACTERS ── */}
              <Section
                id="characters"
                title="Characters"
                icon={Users}
                count={characters.length}
                reached={reached("characters")}
              >
                {characters.length === 0 ? (
                  sidesLoaded ? (
                    <EmptyState icon={<Users size={28} />} text="No character data available." />
                  ) : (
                    <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 xl:grid-cols-5 2xl:grid-cols-8 gap-3">
                      {Array.from({ length: 8 }).map((_, i) => (
                        <div
                          key={i}
                          className="rounded-2xl animate-pulse"
                          style={{ aspectRatio: "3/4.6", background: SURFACE, border: BORDER }}
                        />
                      ))}
                    </div>
                  )
                ) : (
                  <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 xl:grid-cols-5 2xl:grid-cols-8 gap-3 sm:gap-4">
                    {characters.map(({ character, role, voice_actors }, i) => {
                      const va =
                        voice_actors?.find((v) => v.language === "Japanese") ?? voice_actors?.[0];
                      return (
                        <motion.div
                          key={character.mal_id}
                          initial={{ opacity: 0, y: 12 }}
                          whileInView={{ opacity: 1, y: 0 }}
                          viewport={{ once: true, amount: 0.15 }}
                          transition={{ delay: Math.min((i % 8) * 0.04, 0.3) }}
                          className="rounded-2xl overflow-hidden group"
                          style={{ background: SURFACE, border: BORDER }}
                        >
                          <div className="relative overflow-hidden" style={{ aspectRatio: "3/4" }}>
                            <img
                              src={character.images?.jpg?.image_url}
                              alt={character.name}
                              loading="lazy"
                              className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-105"
                              onError={(e) => {
                                e.target.style.display = "none";
                              }}
                            />
                            {role === "Main" && (
                              <div
                                className="absolute top-2 left-2 px-1.5 py-0.5 rounded uppercase font-bold"
                                style={{ background: "rgba(99,102,241,.9)", color: "#fff", fontSize: 8 }}
                              >
                                Main
                              </div>
                            )}
                          </div>
                          <div className="p-2.5 sm:p-3">
                            <p
                              className="font-semibold line-clamp-1"
                              style={{ fontSize: "clamp(11px,2.4vw,13px)", color: "var(--text-heading, #fff)" }}
                            >
                              {character.name}
                            </p>
                            <p className="mt-0.5" style={{ fontSize: 10, color: role === "Main" ? ACCENT : DIM }}>
                              {role}
                            </p>
                            {va && (
                              <p className="mt-1 line-clamp-1" style={{ fontSize: 10, color: "rgba(148,163,184,.4)" }}>
                                VA · {va.person.name}
                              </p>
                            )}
                          </div>
                        </motion.div>
                      );
                    })}
                  </div>
                )}
              </Section>

              {/* ── RELATED ── */}
              <Section
                id="related"
                title="Related"
                icon={GitBranch}
                count={counts.related}
                reached={reached("related")}
              >
                <div className="space-y-9">
                  {Object.keys(relatedByType).length === 0 && recs.length === 0 ? (
                    <EmptyState
                      icon={<GitBranch size={26} />}
                      text={sidesLoaded ? "No related anime found." : "Loading related titles…"}
                    />
                  ) : (
                    <>
                      {Object.entries(relatedByType).map(([type, items]) => (
                        <AnimeRow
                          key={type}
                          items={items}
                          title={type}
                          icon={RELATION_ICON(type)}
                          badge={`${items.length} ${items.length === 1 ? "entry" : "entries"}`}
                        />
                      ))}
                      <AnimeRow
                        items={recs}
                        title="You might also like"
                        icon={Sparkles}
                        badge="Community picks"
                      />
                    </>
                  )}
                </div>
              </Section>

              {/* ── DETAILS ── */}
              <Section id="details" title="Details" icon={BookOpen} reached={reached("details")}>
                <div className="space-y-7">
                  <div className="grid grid-cols-2 md:grid-cols-3 xl:grid-cols-4 gap-2.5 sm:gap-3">
                    <StatCard icon={<Calendar size={12} />} label="Aired" value={anime.aired?.string} />
                    <StatCard icon={<BookOpen size={12} />} label="Source" value={anime.source} />
                    <StatCard
                      icon={<Star size={12} />}
                      label="Score"
                      value={anime.score ? `${anime.score.toFixed(2)} / 10` : "N/A"}
                    />
                    <StatCard
                      icon={<TrendingUp size={12} />}
                      label="Rank"
                      value={anime.rank ? `#${anime.rank.toLocaleString()}` : "N/A"}
                    />
                    <StatCard
                      icon={<Sparkles size={12} />}
                      label="Popularity"
                      value={anime.popularity ? `#${anime.popularity.toLocaleString()}` : "N/A"}
                    />
                    <StatCard icon={<Users size={12} />} label="Members" value={anime.members?.toLocaleString()} />
                    <StatCard icon={<Award size={12} />} label="Favorites" value={anime.favorites?.toLocaleString()} />
                    <StatCard icon={<Info size={12} />} label="Rating" value={anime.rating} />
                  </div>

                  <div className="grid gap-6 2xl:grid-cols-2">
                    {anime.titles?.length > 0 && (
                      <Card title="All titles" icon={Globe}>
                        <div>
                          {anime.titles.map(({ type, title: t }, i) => (
                            <div
                              key={`${type}-${i}`}
                              className="flex flex-col sm:flex-row sm:items-baseline gap-0.5 sm:gap-4 py-2 border-t border-white/[0.06] first:border-t-0 first:pt-0 last:pb-0"
                            >
                              <span
                                className="flex-shrink-0 uppercase tracking-wide font-semibold sm:w-24"
                                style={{ fontSize: 10, color: DIM }}
                              >
                                {type}
                              </span>
                              <span className="text-xs sm:text-sm break-words" style={{ color: "rgba(255,255,255,.75)" }}>
                                {t}
                              </span>
                            </div>
                          ))}
                        </div>
                      </Card>
                    )}

                    {anime.external?.length > 0 && (
                      <Card title="External links" icon={ExternalLink} className="self-start">
                        <div className="flex flex-wrap gap-2">
                          {anime.external.map((link) => (
                            <a
                              key={link.name}
                              href={link.url}
                              target="_blank"
                              rel="noreferrer"
                              className="flex items-center gap-1.5 px-3.5 py-2 rounded-xl text-xs sm:text-[13px] transition-all hover:opacity-80"
                              style={{
                                background: "var(--nav-link-active-bg, rgba(255,255,255,.05))",
                                border: "1px solid var(--border-subtle, rgba(255,255,255,.09))",
                                color: "var(--text-heading, #fff)",
                              }}
                            >
                              {link.name}
                              <ExternalLink size={10} style={{ color: "var(--text-muted, #94a3b8)" }} />
                            </a>
                          ))}
                        </div>
                      </Card>
                    )}
                  </div>
                </div>
              </Section>
            </div>
          </div>
        </div>
      </main>

      <TrailerModal
        isOpen={showTrailer}
        onClose={() => setShowTrailer(false)}
        trailer={anime.trailer}
        title={title}
      />
    </div>
  );
};

/* ══════════════════════════════════════════════════════════
   PAGE (data loading only)
══════════════════════════════════════════════════════════ */
const AnimeDetail = () => {
  const { id } = useParams();
  const navigate = useNavigate();

  const [anime, setAnime] = useState(null);
  const [characters, setChars] = useState([]);
  const [related, setRelated] = useState([]);
  const [recs, setRecs] = useState([]);
  const [prevSeason, setPrev] = useState(null);
  const [nextSeason, setNext] = useState(null);
  const [loading, setLoading] = useState(true);
  const [sidesLoaded, setSidesLoaded] = useState(false);
  const [error, setError] = useState(null);

  useEffect(() => {
    let cancelled = false;

    setAnime(null);
    setError(null);
    setLoading(true);
    setRelated([]);
    setRecs([]);
    setPrev(null);
    setNext(null);
    setChars([]);
    setSidesLoaded(false);

    window.scrollTo({ top: 0, behavior: "instant" });

    // Spaced out to stay under the API rate limit
    const delay = (ms) => new Promise((r) => setTimeout(r, ms));

    animeService
      .getAnimeById(id)
      .then(async (data) => {
        if (cancelled) return;

        const a = data.data;
        setAnime(a);
        setLoading(false);

        const relatedEntries = [];
        let prevEntry = null;
        let nextEntry = null;

        a.relations?.forEach((rel) => {
          const isNext = ["Sequel", "Next season"].includes(rel.relation);
          const isPrev = ["Prequel", "Previous season"].includes(rel.relation);
          const isIgnored = ["Character", "Other"].includes(rel.relation);

          rel.entry
            ?.filter((e) => e.type === "anime")
            .forEach((e) => {
              if (isPrev && !prevEntry) prevEntry = e;
              if (isNext && !nextEntry) nextEntry = e;
              if (!isIgnored) relatedEntries.push({ ...e, relation: rel.relation });
            });
        });

        setRelated(relatedEntries);

        try {
          const ch = await animeService.getAnimeCharacters(id);
          if (!cancelled) setChars(ch.data?.slice(0, 16) ?? []);
        } catch {}

        await delay(900);
        if (cancelled) return;

        try {
          const rc = await animeService.getAnimeRecommendations(id);
          if (!cancelled) setRecs(rc.data?.slice(0, 20).map((r) => r.entry) ?? []);
        } catch {}

        await delay(900);
        if (cancelled) return;

        if (prevEntry?.mal_id) {
          try {
            const p = await animeService.getAnimeById(prevEntry.mal_id);
            if (!cancelled) setPrev(p.data);
          } catch {
            if (!cancelled) setPrev(prevEntry);
          }
        }

        await delay(900);
        if (cancelled) return;

        if (nextEntry?.mal_id) {
          try {
            const n = await animeService.getAnimeById(nextEntry.mal_id);
            if (!cancelled) setNext(n.data);
          } catch {
            if (!cancelled) setNext(nextEntry);
          }
        }

        if (!cancelled) setSidesLoaded(true);
      })
      .catch(() => {
        if (!cancelled) {
          setError("Failed to load anime details.");
          setLoading(false);
        }
      });

    return () => {
      cancelled = true;
    };
  }, [id]);

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center" style={{ background: BG }}>
        <div className="flex flex-col items-center gap-4">
          <motion.div
            animate={{ rotate: 360 }}
            transition={{ duration: 1.1, repeat: Infinity, ease: "linear" }}
            className="w-11 h-11 border-4 border-indigo-500/20 border-t-indigo-400 rounded-full"
          />
          <p className="text-[10px] sm:text-xs tracking-widest uppercase" style={{ color: DIM }}>
            Loading
          </p>
        </div>
      </div>
    );
  }

  if (error || !anime) {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center gap-4 px-4" style={{ background: BG }}>
        <Info size={32} style={{ color: DIM }} className="opacity-50" />
        <p className="text-sm text-center" style={{ color: MUTED }}>
          {error ?? "Anime not found."}
        </p>
        <button
          onClick={() => navigate(-1)}
          className="flex items-center gap-2 text-sm font-medium px-4 py-2 rounded-xl transition-all hover:brightness-125"
          style={{
            background: "rgba(99,102,241,.18)",
            color: ACCENT,
            border: "1px solid rgba(99,102,241,.28)",
          }}
        >
          <ArrowLeft size={14} /> Go Back
        </button>
      </div>
    );
  }

  return (
    <DetailBody
      key={anime.mal_id}
      anime={anime}
      characters={characters}
      related={related}
      recs={recs}
      prevSeason={prevSeason}
      nextSeason={nextSeason}
      sidesLoaded={sidesLoaded}
    />
  );
};

export default AnimeDetail;