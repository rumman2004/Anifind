 import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
  Tv, Database, Zap, Shield, Heart,
  ChevronDown, Github, Globe,
  Star, Search, BookMarked, Bell, Users,
  Lock, RefreshCw, AlertTriangle, CheckCircle,
  Mail, MessageCircle, FileText, Layers, BarChart2,
  Sparkles, ArrowRight, Info, ShieldCheck, BadgeCheck,
  Scale, Eye, Server, Clock, Wifi, XCircle,
  HelpCircle, Cpu, TriangleAlert,
} from "lucide-react";
import logo from "../assets/logo.png";
/* ══════════════════════════════════════════════════════════
   DATA
══════════════════════════════════════════════════════════ */
const FEATURES = [
  { icon: <Search size={18} />,     color: "#a5b4fc", title: "Advanced Search",       desc: "Filter by genre, type, score, season, year range, rating and sort order simultaneously." },
  { icon: <Star size={18} />,       color: "#fbbf24", title: "Top Rated Anime",        desc: "Browse the all-time highest-scored anime with dual grid and list views, including medal ranks." },
  { icon: <BookMarked size={18} />, color: "#4ade80", title: "Favourites System",      desc: "Save any anime to your personal favourites list — synced to your account across devices." },
  { icon: <Layers size={18} />,     color: "#f9a8d4", title: "Browse by Genre",        desc: "41 genres with lazy-loaded rows, staggered fetching, and per-genre colour theming." },
  { icon: <Sparkles size={18} />,   color: "#fb923c", title: "Smart Suggestions",     desc: "Instant search suggestions with keyboard navigation, score badges and airing status dots." },
  { icon: <BarChart2 size={18} />,  color: "#67e8f9", title: "Detailed Anime Pages",  desc: "Full anime detail pages with characters, staff, episodes, reviews, statistics and relations." },
  { icon: <Bell size={18} />,       color: "#c4b5fd", title: "Season Tracking",       desc: "Currently airing and upcoming seasonal anime updated in real time via Jikan." },
  { icon: <Users size={18} />,      color: "#86efac", title: "User Accounts",         desc: "Sign up, log in, and manage your profile. Favourites are private and account-bound." },
];

const API_DETAILS = [
  { label: "API Name",    value: "Jikan REST API",            note: "" },
  { label: "Version",     value: "v4",                        note: "" },
  { label: "Base URL",    value: "https://api.jikan.moe/v4",  note: "All requests are queued through an internal service layer" },
  { label: "Rate Limit",  value: "3 req / sec · 60 req / min", note: "Our queue enforces ≥1 s between requests with exponential back-off on 429" },
  { label: "Cache TTL",   value: "5 minutes",                  note: "In-memory LRU cache (200-entry cap) prevents redundant calls" },
  { label: "Max Retries", value: "5 (on 429 & 5xx)",           note: "Retry delay doubles each time: 2 s → 4 s → 8 s → 16 s → 32 s" },
  { label: "Data Source", value: "MyAnimeList (unofficial)",   note: "Jikan scrapes MAL — we are not affiliated with MyAnimeList" },
  { label: "Images",      value: "MyAnimeList CDN",            note: "Image availability depends on MAL CDN uptime; we do not host images" },
];

const CONTENT_VERIFICATION = [
  {
    group: "Data Origin & Accuracy",
    icon: <Database size={16} />,
    color: "#4ade80",
    items: [
      { status: "verified", text: "All anime metadata (titles, scores, episode counts, genres, synopses) originates exclusively from MyAnimeList via the Jikan REST API. We do not create, modify, or fabricate any content." },
      { status: "verified", text: "Scores and rankings reflect real-time MAL community votes. Our 5-minute cache means displayed values are at most 5 minutes behind the live data." },
      { status: "verified", text: "Episode counts, air dates and status (Airing / Finished / Upcoming) are fetched directly from Jikan and updated on every cache refresh." },
      { status: "warning",  text: "Data accuracy is contingent on MyAnimeList's own records. Errors or omissions in MAL data will be reflected here — AniFind cannot correct upstream inaccuracies." },
    ],
  },
  {
    group: "Images & Media",
    icon: <Eye size={16} />,
    color: "#60a5fa",
    items: [
      { status: "verified", text: "All images are served directly from the MyAnimeList CDN (cdn.myanimelist.net). AniFind does not host, store, re-upload, or modify any images." },
      { status: "verified", text: "Image URLs are provided by the Jikan API and point to the original MAL asset. If an image is removed from MAL it will no longer display on AniFind." },
      { status: "warning",  text: "Some images may depict mature themes consistent with their MAL content rating. Ecchi or R 17+ content images are served as provided by MAL." },
      { status: "info",     text: "If you encounter a broken image, it indicates the asset has been removed or moved on the MyAnimeList CDN — not a bug in AniFind." },
    ],
  },
  {
    group: "Affiliation & Trademarks",
    icon: <Scale size={16} />,
    color: "#fbbf24",
    items: [
      { status: "warning",  text: "AniFind is not affiliated with, endorsed by, sponsored by, or in any way officially connected to MyAnimeList LLC or any of its parent or sister companies." },
      { status: "warning",  text: "AniFind is not affiliated with the Jikan project beyond using its public REST API under its open-source licence." },
      { status: "warning",  text: "All anime titles, character names, logos, and artwork are trademarks or copyrights of their respective creators, studios, and distributors." },
      { status: "info",     text: "AniFind is a fan-built discovery tool. No content is reproduced for commercial gain. All data access is read-only via a public, rate-limited API." },
    ],
  },
  {
    group: "User-Generated Content",
    icon: <Users size={16} />,
    color: "#c4b5fd",
    items: [
      { status: "verified", text: "AniFind does not allow users to submit, upload, or publish any content publicly. There are no reviews, comments, or forums on this platform." },
      { status: "verified", text: "Favourites lists are strictly private and visible only to the authenticated account holder. No user data is ever displayed publicly." },
      { status: "info",     text: "User account information (email, hashed password) is stored securely in MongoDB Atlas and is never shared with or sold to third parties." },
    ],
  },
  {
    group: "Content Ratings & Suitability",
    icon: <ShieldCheck size={16} />,
    color: "#fb923c",
    items: [
      { status: "verified", text: "AniFind surfaces Jikan's content rating classifications: G (All ages), PG, PG-13, R (17+), and R+ (Mild nudity). These map directly to MAL ratings." },
      { status: "warning",  text: "Content rated R 17+ or higher is accessible via search filters. Parental guidance is strongly advised for younger users." },
      { status: "info",     text: "AniFind does not implement age-gate verification. Responsibility for age-appropriate usage lies with the user and their guardian." },
    ],
  },
  {
    group: "DMCA & Takedowns",
    icon: <FileText size={16} />,
    color: "#f9a8d4",
    items: [
      { status: "info",     text: "Since AniFind does not host any media, DMCA takedown requests should be directed to MyAnimeList for images and to Jikan for metadata." },
      { status: "info",     text: "If you believe specific content displayed on AniFind violates applicable law or your rights, contact us at the email below and we will respond within 5 business days." },
      { status: "verified", text: "We are committed to cooperating fully with any legitimate legal request related to content displayed through our platform." },
    ],
  },
];

const RELIABILITY = [
  {
    icon: <RefreshCw size={16} />,
    color: "#a5b4fc",
    title: "Request Queue",
    desc:  "All API calls are serialised with ≥1 s spacing. Simultaneous identical requests resolve to the same in-flight Promise — zero duplicate network calls.",
  },
  {
    icon: <Zap size={16} />,
    color: "#fbbf24",
    title: "5-Minute Cache",
    desc:  "Every response is cached in-memory (200-entry LRU cap). Repeat page visits feel instant; the network is only hit when the TTL expires.",
  },
  {
    icon: <AlertTriangle size={16} />,
    color: "#fb923c",
    title: "Auto Retry",
    desc:  "HTTP 429 and 5xx errors trigger exponential back-off: 2 s → 4 s → 8 s → 16 s → 32 s, up to 5 attempts before surfacing an error state.",
  },
  {
    icon: <Wifi size={16} />,
    color: "#4ade80",
    title: "Graceful Errors",
    desc:  "Every data section has its own error boundary with a retry button. A failure in one genre row never affects other rows or page sections.",
  },
  {
    icon: <Clock size={16} />,
    color: "#67e8f9",
    title: "Staggered Loading",
    desc:  "Genre rows load progressively with a 1-second stagger between each request, keeping well within Jikan's rate window at all times.",
  },
  {
    icon: <Server size={16} />,
    color: "#f9a8d4",
    title: "In-flight Dedup",
    desc:  "A shared in-flight Map ensures two simultaneous callers for the same resource share one Promise — no race conditions, no double billing.",
  },
];

const FAQS = [
  { q: "Is AniFind free to use?",               a: "Yes — AniFind is completely free. Creating an account is optional but required to save favourites." },
  { q: "How up-to-date is the anime data?",      a: "Data comes from the Jikan API which scrapes MyAnimeList. Scores, episode counts and airing status update whenever Jikan refreshes. Our local cache is valid for 5 minutes, so data is at most 5 minutes stale." },
  { q: "Why do some searches return slowly?",    a: "Jikan enforces a rate limit of 3 requests per second. AniFind queues all requests with at least 1 second between each. If you hit a 429 error the service automatically retries with exponential back-off — you may see a short delay." },
  { q: "Are my favourites stored privately?",    a: "Yes. Favourites are stored in MongoDB Atlas under your user account and are never publicly visible. Only you can see your list when logged in." },
  { q: "What genres are supported?",             a: "AniFind supports all 41 Jikan-recognised genres: Action, Adventure, Cars, Comedy, Dementia, Demons, Drama, Ecchi, Fantasy, Game, Harem, Historical, Horror, Isekai, Josei, Kids, Magic, Martial Arts, Mecha, Military, Music, Mystery, Parody, Police, Psychological, Romance, Samurai, School, Sci-Fi, Seinen, Shoujo, Shoujo Ai, Shounen, Shounen Ai, Slice of Life, Space, Sports, Super Power, Supernatural, Thriller, and Vampire." },
  { q: "Can I use AniFind on mobile?",           a: "Absolutely. The entire interface is fully responsive — search, filters, genre rows, detail pages and favourites all adapt to any screen size from 320 px upward." },
  { q: "Does AniFind use any tracking or ads?",  a: "No. AniFind contains no advertisements, no third-party analytics trackers, and no telemetry. The only external service called is the Jikan API." },
  { q: "How is authentication handled?",         a: "Passwords are hashed with bcrypt (12 salt rounds) before storage. On login the server issues a signed JWT stored in an HTTP-only cookie. All protected routes validate this token server-side." },
  { q: "Is the source code available?",          a: "Yes — the project is open source. You can find the repository linked in the Contact section below." },
  { q: "What happens if Jikan is down?",         a: "AniFind will show per-section error states with retry buttons. Cached data (up to 5 minutes old) is still served where available, so recently visited pages degrade gracefully." },
];

/* ══════════════════════════════════════════════════════════
   STATUS ICON
══════════════════════════════════════════════════════════ */
const STATUS_CONFIG = {
  verified: { icon: <BadgeCheck size={14} />, color: "#4ade80",  label: "Verified"  },
  warning:  { icon: <TriangleAlert size={14} />, color: "#fbbf24", label: "Note"     },
  info:     { icon: <Info size={14} />,         color: "#60a5fa",  label: "Info"     },
  error:    { icon: <XCircle size={14} />,      color: "#f87171",  label: "Error"    },
};

const StatusIcon = ({ status }) => {
  const cfg = STATUS_CONFIG[status] ?? STATUS_CONFIG.info;
  return (
    <span className="flex-shrink-0 mt-0.5" style={{ color: cfg.color }}>
      {cfg.icon}
    </span>
  );
};

/* ══════════════════════════════════════════════════════════
   REUSABLE ATOMS
══════════════════════════════════════════════════════════ */
const SectionHeading = ({ icon: Icon, iconColor, label, title, subtitle }) => (
  <div className="flex flex-col items-center text-center gap-2 mb-8 sm:mb-12">
    <div
      className="w-10 h-10 sm:w-12 sm:h-12 rounded-2xl flex items-center justify-center mb-1"
      style={{
        background: `${iconColor}18`,
        border:     `1px solid ${iconColor}30`,
        boxShadow:  `0 0 24px ${iconColor}18`,
      }}
    >
      <Icon size={20} style={{ color: iconColor }} />
    </div>
    {label && (
      <span className="text-[10px] uppercase tracking-widest font-bold"
            style={{ color: `${iconColor}99` }}>
        {label}
      </span>
    )}
    <h2 className="font-black text-white"
        style={{ fontSize: "clamp(20px,4vw,30px)", letterSpacing: "-0.025em" }}>
      {title}
    </h2>
    {subtitle && (
      <p className="text-sm sm:text-base max-w-xl" style={{ color: "rgba(148,163,184,.55)" }}>
        {subtitle}
      </p>
    )}
  </div>
);

const Divider = ({ colorA = "rgba(99,102,241,.25)", colorB }) => (
  <div
    className="my-16 sm:my-24"
    style={{
      height: 1,
      background: colorB
        ? `linear-gradient(to right, transparent, ${colorA}, ${colorB}, transparent)`
        : `linear-gradient(to right, transparent, ${colorA}, transparent)`,
    }}
  />
);

/* ══════════════════════════════════════════════════════════
   FAQ ACCORDION
══════════════════════════════════════════════════════════ */
const FaqItem = ({ faq, index }) => {
  const [open, setOpen] = useState(false);
  return (
    <motion.div
      initial={{ opacity: 0, y: 12 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true }}
      transition={{ delay: index * 0.035 }}
      className="rounded-2xl overflow-hidden"
      style={{
        background:  open ? "rgba(99,102,241,.07)" : "rgba(255,255,255,.03)",
        border:      `1px solid ${open ? "rgba(99,102,241,.28)" : "rgba(255,255,255,.07)"}`,
        transition:  "background .2s, border-color .2s",
      }}
    >
      <button
        onClick={() => setOpen(o => !o)}
        className="w-full flex items-center justify-between gap-4 px-5 py-4 text-left"
      >
        <div className="flex items-center gap-2.5 min-w-0">
          <HelpCircle
            size={14}
            className="flex-shrink-0"
            style={{ color: open ? "#a5b4fc" : "rgba(148,163,184,.30)" }}
          />
          <span
            className="font-semibold text-sm sm:text-base leading-snug"
            style={{ color: open ? "#a5b4fc" : "#fff" }}
          >
            {faq.q}
          </span>
        </div>
        <motion.div
          animate={{ rotate: open ? 180 : 0 }}
          transition={{ duration: 0.2 }}
          className="flex-shrink-0"
        >
          <ChevronDown size={15} style={{ color: open ? "#a5b4fc" : "rgba(148,163,184,.35)" }} />
        </motion.div>
      </button>

      <AnimatePresence initial={false}>
        {open && (
          <motion.div
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: "auto", opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            transition={{ duration: 0.22 }}
            className="overflow-hidden"
          >
            <p className="px-5 pb-5 text-sm leading-relaxed pl-[2.6rem]"
               style={{ color: "rgba(148,163,184,.65)" }}>
              {faq.a}
            </p>
          </motion.div>
        )}
      </AnimatePresence>
    </motion.div>
  );
};

/* ══════════════════════════════════════════════════════════
   CONTENT VERIFICATION GROUP
══════════════════════════════════════════════════════════ */
const VerificationGroup = ({ group: g, index }) => {
  const [open, setOpen] = useState(index === 0);

  return (
    <motion.div
      initial={{ opacity: 0, y: 14 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true }}
      transition={{ delay: index * 0.05 }}
      className="rounded-2xl overflow-hidden"
      style={{
        background: "rgba(255,255,255,.025)",
        border: `1px solid ${open ? `${g.color}30` : "rgba(255,255,255,.07)"}`,
        transition: "border-color .25s",
      }}
    >
      {/* group header */}
      <button
        onClick={() => setOpen(o => !o)}
        className="w-full flex items-center justify-between gap-3 px-5 py-4"
      >
        <div className="flex items-center gap-3 min-w-0">
          <div
            className="w-8 h-8 rounded-xl flex items-center justify-center flex-shrink-0"
            style={{
              background: `${g.color}14`,
              border:     `1px solid ${g.color}28`,
              color:       g.color,
            }}
          >
            {g.icon}
          </div>
          <span className="font-bold text-sm sm:text-base text-white truncate">
            {g.group}
          </span>
          <span
            className="text-[9px] font-black uppercase px-1.5 py-0.5 rounded-full flex-shrink-0"
            style={{
              background: `${g.color}12`,
              color:       g.color,
              border:     `1px solid ${g.color}25`,
            }}
          >
            {g.items.length} items
          </span>
        </div>
        <motion.div
          animate={{ rotate: open ? 180 : 0 }}
          transition={{ duration: 0.2 }}
          className="flex-shrink-0"
        >
          <ChevronDown size={15} style={{ color: open ? g.color : "rgba(148,163,184,.35)" }} />
        </motion.div>
      </button>

      {/* items */}
      <AnimatePresence initial={false}>
        {open && (
          <motion.div
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: "auto", opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            transition={{ duration: 0.25 }}
            className="overflow-hidden"
          >
            <div
              className="px-5 pb-5 space-y-3"
              style={{ borderTop: "1px solid rgba(255,255,255,.06)" }}
            >
              <div className="pt-4 space-y-3">
                {g.items.map((item, i) => {
                  const cfg = STATUS_CONFIG[item.status];
                  return (
                    <motion.div
                      key={i}
                      initial={{ opacity: 0, x: -8 }}
                      animate={{ opacity: 1, x: 0 }}
                      transition={{ delay: i * 0.04 }}
                      className="flex items-start gap-3 p-3 rounded-xl"
                      style={{
                        background: `${cfg.color}08`,
                        border:     `1px solid ${cfg.color}18`,
                      }}
                    >
                      <StatusIcon status={item.status} />
                      <div className="flex-1 min-w-0">
                        <span
                          className="text-[9px] font-black uppercase tracking-wider mr-2"
                          style={{ color: cfg.color }}
                        >
                          {cfg.label}
                        </span>
                        <p className="text-xs sm:text-sm leading-relaxed mt-0.5"
                           style={{ color: "rgba(148,163,184,.68)" }}>
                          {item.text}
                        </p>
                      </div>
                    </motion.div>
                  );
                })}
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </motion.div>
  );
};

/* ══════════════════════════════════════════════════════════
   ABOUT PAGE
══════════════════════════════════════════════════════════ */
const About = () => (
  <div className="min-h-screen" style={{ background: "#0a0a14" }}>
    <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 py-12 sm:py-20">

      {/* ════ HERO ════ */}
      <motion.div
        initial={{ opacity: 0, y: 24 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
        className="text-center mb-16 sm:mb-24"
      >
        {/* logo */}
        <div className="flex justify-center mb-6">
          <div
            className="w-20 h-20 sm:w-24 sm:h-24 rounded-3xl flex items-center justify-center relative"
            style={{
            background: "linear-gradient(135deg,rgba(99,102,241,.30),rgba(168,85,247,.20))",
            border:     "1px solid rgba(99,102,241,.35)",
            boxShadow:  "0 0 60px rgba(99,102,241,.25),0 0 120px rgba(99,102,241,.10)",
            }}
          >
            <img src={logo} alt="AniFind Logo" className="w-19 h-19 object-contain rounded-2xl" />
            <motion.div
              className="absolute w-3 h-3 rounded-full"
              style={{
                background: "linear-gradient(135deg,#fbbf24,#f59e0b)",
                top: -4, right: -4,
                boxShadow:  "0 0 8px rgba(251,191,36,.7)",
              }}
              animate={{ scale: [1, 1.3, 1] }}
              transition={{ repeat: Infinity, duration: 2, ease: "easeInOut" }}
            />
          </div>
        </div>

        <div className="flex items-center justify-center gap-2 mb-3">
          <span
            className="text-[10px] uppercase tracking-widest font-bold px-2.5 py-1 rounded-full"
            style={{
              background: "rgba(99,102,241,.14)",
              color:       "#a5b4fc",
              border:      "1px solid rgba(99,102,241,.28)",
            }}
          >
            Open Source · Free · No Ads
          </span>
        </div>

        <h1
          className="font-black text-white mb-4"
          style={{ fontSize: "clamp(32px,7vw,60px)", letterSpacing: "-0.03em", lineHeight: 1.05 }}
        >
          About{" "}
          <span style={{
            background:            "linear-gradient(135deg,#a5b4fc,#818cf8,#c4b5fd)",
            WebkitBackgroundClip:  "text",
            WebkitTextFillColor:   "transparent",
          }}>
            AniFind
          </span>
        </h1>

        <p
          className="text-base sm:text-lg leading-relaxed mx-auto mb-8"
          style={{ color: "rgba(148,163,184,.62)", maxWidth: 560 }}
        >
          AniFind is your ultimate anime discovery platform — search 40 000+ titles,
          explore by genre, track what's airing this season, and save your favourites,
          all from one beautifully designed interface.
        </p>

        {/* stat pills */}
        <div className="flex flex-wrap items-center justify-center gap-3">
          {[
            { label: "40 000+ Anime", color: "#a5b4fc" },
            { label: "41 Genres",     color: "#4ade80" },
            { label: "Free Forever",  color: "#fbbf24" },
            { label: "No Ads Ever",   color: "#f9a8d4" },
            { label: "Open Source",   color: "#67e8f9" },
          ].map(({ label, color }) => (
            <span
              key={label}
              className="text-xs font-bold px-3 py-1.5 rounded-full"
              style={{ background: `${color}12`, color, border: `1px solid ${color}28` }}
            >
              {label}
            </span>
          ))}
        </div>
      </motion.div>

      {/* ════ FEATURES ════ */}
      <SectionHeading
        icon={Sparkles}
        iconColor="rgba(251,191,36,1)"
        label="What AniFind offers"
        title="Everything you need"
        subtitle="A complete toolkit for discovering, tracking and organising your anime life."
      />

      <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 sm:gap-4">
        {FEATURES.map((f, i) => (
          <motion.div
            key={f.title}
            initial={{ opacity: 0, y: 16 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ delay: i * 0.05 }}
            className="flex items-start gap-4 p-4 sm:p-5 rounded-2xl transition-all duration-200 hover:scale-[1.02]"
            style={{ background: "rgba(255,255,255,.03)", border: "1px solid rgba(255,255,255,.07)" }}
            onMouseEnter={e => (e.currentTarget.style.borderColor = `${f.color}35`)}
            onMouseLeave={e => (e.currentTarget.style.borderColor = "rgba(255,255,255,.07)")}
          >
            <div
              className="w-9 h-9 sm:w-10 sm:h-10 rounded-xl flex items-center justify-center flex-shrink-0"
              style={{ background: `${f.color}14`, border: `1px solid ${f.color}28`, color: f.color }}
            >
              {f.icon}
            </div>
            <div className="min-w-0">
              <h3 className="font-bold text-white text-sm sm:text-base mb-0.5">{f.title}</h3>
              <p className="text-xs sm:text-sm leading-relaxed" style={{ color: "rgba(148,163,184,.55)" }}>
                {f.desc}
              </p>
            </div>
          </motion.div>
        ))}
      </div>

      <Divider />

      {/* ════ API DETAILS ════ */}
      <SectionHeading
        icon={Globe}
        iconColor="rgba(34,197,94,1)"
        label="Data source"
        title="Jikan API Details"
        subtitle="All anime data is sourced from the Jikan REST API — an open-source, unofficial MyAnimeList scraper."
      />

      <motion.div
        initial={{ opacity: 0, y: 16 }}
        whileInView={{ opacity: 1, y: 0 }}
        viewport={{ once: true }}
        className="rounded-2xl overflow-hidden mb-6"
        style={{ border: "1px solid rgba(255,255,255,.08)" }}
      >
        {API_DETAILS.map((row, i) => (
          <div
            key={row.label}
            className="flex flex-col sm:flex-row sm:items-start gap-1 sm:gap-6 px-5 py-4"
            style={{
              background:   i % 2 === 0 ? "rgba(255,255,255,.025)" : "rgba(255,255,255,.015)",
              borderBottom: i < API_DETAILS.length - 1 ? "1px solid rgba(255,255,255,.05)" : "none",
            }}
          >
            <span
              className="text-xs font-bold uppercase tracking-wider flex-shrink-0 sm:w-36"
              style={{ color: "rgba(148,163,184,.45)" }}
            >
              {row.label}
            </span>
            <div className="flex-1 min-w-0">
              <span className="text-sm font-semibold text-white">{row.value}</span>
              {row.note && (
                <p className="text-xs mt-0.5" style={{ color: "rgba(148,163,184,.42)" }}>
                  {row.note}
                </p>
              )}
            </div>
          </div>
        ))}
      </motion.div>

      {/* reliability cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3 sm:gap-4">
        {RELIABILITY.map((c, i) => (
          <motion.div
            key={c.title}
            initial={{ opacity: 0, y: 12 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ delay: i * 0.06 }}
            className="flex items-start gap-3 p-4 rounded-2xl transition-all duration-200 hover:scale-[1.02]"
            style={{ background: `${c.color}07`, border: `1px solid ${c.color}18` }}
          >
            <div
              className="w-8 h-8 rounded-lg flex items-center justify-center flex-shrink-0 mt-0.5"
              style={{ background: `${c.color}14`, color: c.color, border: `1px solid ${c.color}25` }}
            >
              {c.icon}
            </div>
            <div>
              <p className="text-sm font-bold text-white mb-0.5">{c.title}</p>
              <p className="text-xs leading-relaxed" style={{ color: "rgba(148,163,184,.52)" }}>
                {c.desc}
              </p>
            </div>
          </motion.div>
        ))}
      </div>

      <Divider colorA="rgba(34,197,94,.20)" colorB="rgba(99,102,241,.20)" />

      {/* ════ CONTENT VERIFICATION ════ */}
      <SectionHeading
        icon={ShieldCheck}
        iconColor="rgba(74,222,128,1)"
        label="Transparency & Trust"
        title="Content Verification"
        subtitle="A full, honest breakdown of every content-related policy — what we verify, what we disclaim, and what you should know."
      />

      {/* legend */}
      <motion.div
        initial={{ opacity: 0, y: 8 }}
        whileInView={{ opacity: 1, y: 0 }}
        viewport={{ once: true }}
        className="flex flex-wrap items-center justify-center gap-3 mb-6"
      >
        {Object.entries(STATUS_CONFIG).map(([key, cfg]) => (
          <span
            key={key}
            className="flex items-center gap-1.5 text-xs font-semibold px-2.5 py-1 rounded-full"
            style={{
              background: `${cfg.color}10`,
              color:       cfg.color,
              border:     `1px solid ${cfg.color}22`,
            }}
          >
            {cfg.icon} {cfg.label}
          </span>
        ))}
      </motion.div>

      <div className="space-y-3">
        {CONTENT_VERIFICATION.map((group, i) => (
          <VerificationGroup key={group.group} group={group} index={i} />
        ))}
      </div>

      {/* security note */}
      <motion.div
        initial={{ opacity: 0, y: 12 }}
        whileInView={{ opacity: 1, y: 0 }}
        viewport={{ once: true }}
        className="mt-4 flex items-start gap-4 p-5 rounded-2xl"
        style={{
          background: "rgba(59,130,246,.07)",
          border:     "1px solid rgba(59,130,246,.18)",
        }}
      >
        <div
          className="w-9 h-9 rounded-xl flex items-center justify-center flex-shrink-0"
          style={{ background: "rgba(59,130,246,.14)", border: "1px solid rgba(59,130,246,.25)" }}
        >
          <Lock size={16} style={{ color: "#60a5fa" }} />
        </div>
        <div>
          <p className="text-sm font-bold text-white mb-0.5">Security & Privacy</p>
          <p className="text-xs sm:text-sm leading-relaxed" style={{ color: "rgba(148,163,184,.58)" }}>
            Passwords are hashed with bcrypt (12 salt rounds) — plaintext passwords are never stored.
            Sessions use signed JWTs in HTTP-only cookies (XSS-safe). No third-party analytics,
            ad networks, or telemetry scripts are loaded. AniFind does not sell, rent, or share
            any user data with any third party, ever.
          </p>
        </div>
      </motion.div>

      <Divider colorA="rgba(74,222,128,.20)" colorB="rgba(168,85,247,.20)" />

      {/* ════ FAQ ════ */}
      <SectionHeading
        icon={MessageCircle}
        iconColor="rgba(168,85,247,1)"
        label="Got questions?"
        title="Frequently Asked"
        subtitle="Everything you might want to know about AniFind — answered honestly."
      />

      <div className="space-y-2.5">
        {FAQS.map((faq, i) => (
          <FaqItem key={i} faq={faq} index={i} />
        ))}
      </div>

      <Divider colorA="rgba(168,85,247,.20)" colorB="rgba(236,72,153,.20)" />

      {/* ════ CONTACT ════ */}
      <SectionHeading
        icon={Mail}
        iconColor="rgba(236,72,153,1)"
        label="Get in touch"
        title="Contact & Links"
      />

      <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 sm:gap-4 mb-12">
        {[
          {
            icon:  <Github size={20} />,
            color: "#e2e8f0",
            glow:  "rgba(226,232,240,.12)",
            label: "Source Code",
            desc:  "Browse, fork or contribute on GitHub",
            href:  "https://github.com/rumman2004/Anifind",
            cta:   "View on GitHub",
          },
          {
            icon:  <Globe size={20} />,
            color: "#4ade80",
            glow:  "rgba(74,222,128,.12)",
            label: "Jikan API",
            desc:  "Official Jikan documentation",
            href:  "https://docs.api.jikan.moe",
            cta:   "API Docs",
          },
          {
            icon:  <Mail size={20} />,
            color: "#f9a8d4",
            glow:  "rgba(249,168,212,.12)",
            label: "Contact",
            desc:  "Questions, bugs or content concerns",
            href:  "mailto:rumman.ahmed.work+query@gmail.com",
            cta:   "Send Email",
          },
        ].map((link, i) => (
          <motion.a
            key={link.label}
            href={link.href}
            target="_blank"
            rel="noreferrer"
            initial={{ opacity: 0, y: 12 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ delay: i * 0.08 }}
            className="flex flex-col items-center gap-3 p-5 sm:p-6 rounded-2xl text-center
                       transition-all duration-200 hover:scale-[1.03] active:scale-[.98] group"
            style={{
              background:    "rgba(255,255,255,.03)",
              border:        "1px solid rgba(255,255,255,.08)",
              textDecoration:"none",
            }}
            onMouseEnter={e => (e.currentTarget.style.borderColor = `${link.color}35`)}
            onMouseLeave={e => (e.currentTarget.style.borderColor = "rgba(255,255,255,.08)")}
          >
            <div
              className="w-11 h-11 rounded-2xl flex items-center justify-center transition-all
                         duration-200 group-hover:scale-110"
              style={{ background: link.glow, border: `1px solid ${link.color}25`, color: link.color }}
            >
              {link.icon}
            </div>
            <div>
              <p className="font-bold text-white text-sm mb-0.5">{link.label}</p>
              <p className="text-xs" style={{ color: "rgba(148,163,184,.50)" }}>{link.desc}</p>
            </div>
            <span
              className="flex items-center gap-1 text-xs font-semibold mt-auto
                         transition-all group-hover:gap-2"
              style={{ color: link.color }}
            >
              {link.cta} <ArrowRight size={11} />
            </span>
          </motion.a>
        ))}
      </div>

      {/* footer note */}
      <motion.div
        initial={{ opacity: 0 }}
        whileInView={{ opacity: 1 }}
        viewport={{ once: true }}
        className="text-center"
      >
        <div className="flex items-center justify-center gap-1.5 mb-2">
          <Heart size={13} style={{ color: "#ec4899", fill: "#ec4899" }} />
          <p className="text-xs font-semibold" style={{ color: "rgba(148,163,184,.45)" }}>
            Built with love for the anime community
          </p>
        </div>
        <p className="text-[10px]" style={{ color: "rgba(148,163,184,.28)" }}>
          AniFind is not affiliated with MyAnimeList, Jikan, or any anime studio.
          All trademarks belong to their respective owners.
        </p>
      </motion.div>

    </div>
  </div>
);

export default About;