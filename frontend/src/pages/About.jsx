import { useState, useEffect } from "react";
import {
  motion, AnimatePresence, MotionConfig,
  useMotionValue, useSpring, useTransform,
} from "framer-motion";
import {
  Database, Zap, Heart, ChevronDown, Github, Globe, Star, Search,
  BookMarked, Bell, Users, Lock, RefreshCw, AlertTriangle, Mail,
  FileText, Layers, BarChart2, Sparkles, Info, ShieldCheck, BadgeCheck,
  Scale, Eye, Server, Clock, Wifi, TriangleAlert, Monitor, Cpu,
} from "lucide-react";
import logo from "../assets/logo.png";
import { JIKAN_BASE_URL } from "../utils/constants.js";

/* ── page tokens ─────────────────────────────────────────── */
const FOCUS = "focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-emerald-600 dark:focus-visible:outline-indigo-400";

/* ── data ───────────────────────────────────────────────── */
const SECTIONS = [
  { id: "overview",    label: "Overview" },
  { id: "features",    label: "Features" },
  { id: "data",        label: "Data source" },
  { id: "reliability", label: "Reliability" },
  { id: "trust",       label: "Trust" },
  { id: "faq",         label: "FAQ" },
  { id: "contact",     label: "Contact" },
];

const GLANCE = [
  ["Anime titles",     "40,000+"],
  ["Genres",           "41"],
  ["Data provider",    "Tenrai API"],
  ["Schema support",   "Jikan v4 / MAL"],
  ["Pricing",          "100% Free"],
  ["Ads & trackers",   "Zero"],
  ["Cache freshness",  "5 min TTL"],
];

const FEATURES = [
  { icon: Search,     title: "Advanced search",     desc: "Filter by genre, media type, user score, season, year, rating and sorting simultaneously." },
  { icon: Star,       title: "Top rated",           desc: "All-time highest rated anime series and films in responsive grid or list view with medal badges." },
  { icon: BookMarked, title: "Favourites list",     desc: "Save anime titles to a private cloud list tied securely to your account." },
  { icon: Layers,     title: "Browse by genre",     desc: "Explore all 41 anime genres with row-by-row deferred loading." },
  { icon: Sparkles,   title: "Instant search",      desc: "Live search suggestions with score badges, English/Romaji titles, and airing status." },
  { icon: BarChart2,  title: "Comprehensive info",  desc: "Detailed views with character rosters, staff, episode guides, trailers, and studio links." },
  { icon: Bell,       title: "Seasonal schedules",  desc: "Currently airing and upcoming seasonal anime, fetched live via high-speed edge CDN." },
  { icon: Users,      title: "User accounts",       desc: "Secure authentication, custom avatar letters, and saved preference management." },
];

const API_DETAILS = [
  { label: "Data Provider",   value: "Tenrai Anime API", note: "High-throughput, resilient successor to legacy public Jikan endpoints." },
  { label: "Schema Version",  value: "v1 (Jikan v4 & MyAnimeList compatible)", note: "Full drop-in schema compatibility ensures rock-solid data integrity." },
  { label: "Base Endpoint",   value: JIKAN_BASE_URL, note: "Every request routes through AniFind's unified service and retry layer." },
  { label: "Rate Limit",      value: "High-capacity edge CDN with 1 s queue pacing", note: "Internal request queue serialises calls to prevent dropped requests." },
  { label: "Caching Layer",   value: "5 min TTL, 200-entry in-memory LRU cache", note: "Eliminates redundant calls and provides instant back/forward navigation." },
  { label: "Retry Policy",    value: "Exponential back-off up to 5 attempts", note: "Recovers automatically from 429 throttling and temporary network drops." },
  { label: "Data Origin",     value: "MyAnimeList Community Database", note: "Cleanly aggregated and indexed for fast querying. Unaffiliated with MyAnimeList." },
  { label: "Image CDN",       value: "MyAnimeList CDN & Image Delivery Network", note: "High-resolution posters and artwork loaded straight from origin CDNs." },
];

const BACKOFF = [2, 4, 8, 16, 32];

const FLOW = [
  { icon: Monitor,  title: "Your browser",    desc: "Search query or page visit" },
  { icon: Zap,      title: "LRU cache",       desc: "5 min TTL, 200 in-memory entries" },
  { icon: Clock,    title: "Request queue",   desc: "1 s pacing & in-flight dedup" },
  { icon: Globe,    title: "Tenrai API CDN",  desc: "High-speed edge with auto-retry" },
  { icon: Database, title: "MyAnimeList",     desc: "Master anime database origin" },
];

const RELIABILITY = [
  { icon: RefreshCw,     title: "Request queue",       desc: "Calls are paced at least 1 s apart to avoid rate spikes and browser stalls." },
  { icon: Zap,           title: "5-minute LRU cache",  desc: "Repeated views and instant search results return immediately from memory." },
  { icon: AlertTriangle, title: "Automatic back-off",  desc: "Exponential retry back-off handles 429 throttling and network hiccups gracefully." },
  { icon: Wifi,          title: "Isolated errors",     desc: "Every section has localized error boundaries with individual reload buttons." },
  { icon: Clock,         title: "Staggered loading",   desc: "Genre rows and media shelves load progressively to prevent bandwidth congestion." },
  { icon: Server,        title: "In-flight dedup",     desc: "Identical concurrent queries share a single pending Promise to conserve bandwidth." },
];

const STATUS = {
  verified: { icon: BadgeCheck,    color: "#22c55e", label: "Verified" },
  warning:  { icon: TriangleAlert, color: "#f59e0b", label: "Note" },
  info:     { icon: Info,          color: "#3b82f6", label: "Info" },
};

const TRUST = [
  { group: "Data accuracy", icon: Database, items: [
    ["verified", "All metadata (titles, synopsis, ratings, episodes, genres, rankings) is sourced from MyAnimeList via Tenrai's high-performance API."],
    ["verified", "Scores and global rankings reflect community votes, synced through Tenrai's edge cache."],
    ["verified", "Episode status, airing dates, and broadcast times are refreshed dynamically."],
    ["warning",  "Accuracy reflects upstream MyAnimeList records. Upstream discrepancies appear here as well and cannot be altered by AniFind."],
  ]},
  { group: "Images & media", icon: Eye, items: [
    ["verified", "Posters and banners load directly from official MyAnimeList CDNs. AniFind does not host or re-encode media."],
    ["warning",  "Cover images may display themes aligned with the series' official age rating (e.g. Ecchi or R 17+)."],
    ["info",     "A missing image indicates an asset relocated or pruned upstream on MyAnimeList."],
  ]},
  { group: "Affiliation", icon: Scale, items: [
    ["warning", "AniFind is an independent fan project not affiliated with, endorsed by, or sponsored by MyAnimeList LLC or Jikan."],
    ["warning", "All anime titles, artwork, character names, and franchise materials are copyright to their respective creators and studios."],
    ["info",    "Built purely as a free discovery and tracking tool utilizing open, public anime APIs."],
  ]},
  { group: "User privacy", icon: Users, items: [
    ["verified", "AniFind contains zero analytics trackers, telemetry scripts, or advertisement networks."],
    ["verified", "Saved favourites are strictly private to the signed-in user account."],
    ["info",     "Account credentials (email and bcrypt-hashed password) are stored securely in MongoDB Atlas."],
  ]},
  { group: "Age ratings", icon: ShieldCheck, items: [
    ["verified", "Standard ratings are preserved verbatim: G, PG, PG-13, R-17+ and R+."],
    ["warning",  "Mature titles (R-17+) can be discovered via filter controls. Parental discretion is advised."],
    ["info",     "AniFind does not enforce an age gate; users and guardians are encouraged to use rating filters appropriately."],
  ]},
  { group: "Takedowns & contact", icon: FileText, items: [
    ["info",     "AniFind hosts no copyrighted video or artwork. Media inquiries should be addressed to the respective upstream hosts."],
    ["info",     "For platform inquiries, bug reports, or DMCA concerns, email us directly. We respond promptly."],
    ["verified", "We cooperate fully and promptly with legitimate rights holders."],
  ]},
];

const FAQS = [
  { q: "Is AniFind free to use?",                     a: "Yes, 100% free with no paywalls or premium tiers. Creating an account is completely optional and only needed to save favourites across devices." },
  { q: "Where does the anime data come from?",        a: "Data originates from the MyAnimeList database and is delivered through Tenrai API — a high-availability, Jikan v4-compatible REST provider with global edge caching." },
  { q: "Why did the API provider change to Tenrai?",  a: "Legacy public Jikan endpoints suffered from severe connection timeouts and rate restrictions. Tenrai provides a robust drop-in replacement with enhanced uptime and lower latency." },
  { q: "Why are some searches momentarily delayed?",   a: "To prevent upstream rate limits and conserve network performance, our client queue paces requests 1 second apart and automatically retries with exponential back-off." },
  { q: "Are my saved favourites private?",            a: "Yes. Your favourites are stored securely in our database under your unique account and are never public or shared." },
  { q: "Which genres can I explore?",                 a: "All 41 official anime genres, from Action, Adventure, and Sci-Fi to Slice of Life, Fantasy, and Supernatural." },
  { q: "Does AniFind work smoothly on mobile?",       a: "Yes. Every page, card, search modal, and navigation element is fully responsive from small 320 px screens up to 4K displays." },
  { q: "Are there any advertisements or tracking?",   a: "None. No banner ads, no popups, no Google Analytics, and no third-party tracking cookies whatsoever." },
  { q: "How is user authentication secured?",         a: "Passwords are salted and hashed using bcrypt (12 rounds). Authentication tokens are signed JWTs stored in secure HTTP-only cookies validated on every protected action." },
  { q: "What happens if the upstream API is down?",   a: "Each view has isolated error handling with one-click retry buttons, and our 5-minute client-side LRU cache continues serving previously loaded anime seamlessly." },
];

const LINKS = [
  { icon: Github, label: "Source code",       desc: "Explore, star, or contribute to AniFind on GitHub.",  href: "https://github.com/rumman2004/Anifind", external: true },
  { icon: Globe,  label: "Tenrai Anime API",  desc: "High-performance CDN anime API powering our queries.", href: "https://api.tenrai.org/v1",            external: true },
  { icon: Mail,   label: "Email developer",   desc: "Reach out with questions, bugs, or feature ideas.",    href: "mailto:rumman.ahmed.work+query@gmail.com" },
];

/* ── scroll rope navigation indicator ──────────────────── */
const Rope = () => {
  const raw    = useMotionValue(0);
  const smooth = useSpring(raw, { stiffness: 140, damping: 26, mass: 0.4 });
  const head   = useTransform(smooth, v => `${v * 100}%`);
  const [active, setActive] = useState(0);

  useEffect(() => {
    const update = () => {
      const els = SECTIONS.map(s => document.getElementById(s.id));
      if (els.some(e => !e)) return;
      const tops = [
        ...els.map(e => e.getBoundingClientRect().top + window.scrollY),
        document.documentElement.scrollHeight,
      ];
      const y = window.scrollY + window.innerHeight * 0.35;
      let i = 0;
      while (i < SECTIONS.length - 1 && y >= tops[i + 1]) i++;
      const t = Math.min(1, Math.max(0, (y - tops[i]) / (tops[i + 1] - tops[i])));
      raw.set(Math.min(1, (i + t) / (SECTIONS.length - 1)));
      setActive(i);
    };
    update();
    window.addEventListener("scroll", update, { passive: true });
    window.addEventListener("resize", update);
    return () => {
      window.removeEventListener("scroll", update);
      window.removeEventListener("resize", update);
    };
  }, [raw]);

  const go = id => document.getElementById(id)?.scrollIntoView({ behavior: "smooth" });

  return (
    <nav aria-label="Page sections"
         className="fixed left-1 xl:left-5 top-1/2 -translate-y-1/2 z-40 h-[50vh] w-3 pointer-events-none">
      <div className="absolute left-[5px] top-0 bottom-0 w-px" style={{ background: "var(--border-subtle)" }} />
      <motion.div
        className="absolute left-[4px] top-0 bottom-0 w-[3px] rounded-full origin-top"
        style={{ scaleY: smooth, background: "var(--btn-primary-bg, var(--color-primary))" }}
      />
      <motion.span
        className="absolute left-0 w-2.5 h-2.5 -mt-[5px] rounded-full pointer-events-none"
        style={{
          top: head,
          background: "var(--color-primary)",
          boxShadow: "0 0 14px 3px var(--logo-glow, rgba(99,102,241,.6))"
        }}
      />
      {SECTIONS.map((s, i) => {
        const reached = i <= active;
        return (
          <button
            key={s.id}
            onClick={() => go(s.id)}
            aria-label={s.label}
            aria-current={i === active ? "true" : undefined}
            className={`group pointer-events-auto absolute left-0 flex items-center rounded-full ${FOCUS}`}
            style={{ top: `${(i / (SECTIONS.length - 1)) * 100}%`, transform: "translateY(-50%)" }}
          >
            <span
              className="block w-[11px] h-[11px] rounded-full transition-colors duration-300"
              style={{
                background: reached ? "var(--color-primary)" : "var(--bg-main)",
                border: `2px solid ${reached ? "var(--color-primary)" : "var(--border-medium)"}`,
              }}
            />
            <span
              className={`hidden xl:block ml-3 px-2.5 py-1 rounded-lg text-[11px] font-semibold whitespace-nowrap shadow-md transition-opacity ${
                i === active ? "opacity-100" : "opacity-0 group-hover:opacity-100 group-focus-visible:opacity-100"
              }`}
              style={{
                background: "var(--bg-surface)",
                border: "1px solid var(--border-medium)",
                color: "var(--text-main)"
              }}
            >
              {s.label}
            </span>
          </button>
        );
      })}
    </nav>
  );
};

/* ── layout atoms ───────────────────────────────────────── */
const Inner = ({ children, className = "" }) => (
  <div className={`mx-auto w-full max-w-[1600px] px-5 sm:px-8 lg:px-12 ${className}`}>{children}</div>
);

const Section = ({ id, children }) => (
  <section id={id} className="py-16 sm:py-24" style={{ borderTop: "1px solid var(--border-subtle)" }}>
    <Inner>{children}</Inner>
  </section>
);

const Heading = ({ title, sub }) => (
  <div className="mb-10 sm:mb-14 flex flex-col gap-3 lg:flex-row lg:items-end lg:justify-between">
    <h2 className="font-extrabold"
        style={{
          fontSize: "clamp(26px,3.6vw,42px)",
          letterSpacing: "-0.03em",
          lineHeight: 1.1,
          color: "var(--text-heading)"
        }}>
      {title}
    </h2>
    {sub && <p className="text-sm sm:text-base max-w-xl" style={{ color: "var(--text-muted)" }}>{sub}</p>}
  </div>
);

/* A grid whose 1px gaps show the hairline border colour between cells */
const RuledGrid = ({ cols, children }) => (
  <div className={`grid gap-px rounded-2xl overflow-hidden ${cols}`}
       style={{ background: "var(--border-subtle)", border: "1px solid var(--border-subtle)" }}>
    {children}
  </div>
);

/* ── back-off graph ─────────────────────────────────────── */
const BackoffChart = () => (
  <div className="rounded-2xl p-5 sm:p-6 h-full flex flex-col justify-between"
       style={{ border: "1px solid var(--border-subtle)", background: "var(--bg-card)" }}>
    <div>
      <h3 className="font-bold text-base" style={{ color: "var(--text-heading)" }}>Retry back-off curve</h3>
      <p className="text-sm mt-1" style={{ color: "var(--text-muted)" }}>
        Request spacing doubles after each failed response. Worst-case total wait: 62 s.
      </p>
    </div>
    <div className="mt-8 flex items-end gap-3 h-[176px]">
      {BACKOFF.map((d, i) => (
        <div key={d} className="flex-1 flex flex-col items-center justify-end gap-2">
          <span className="text-xs font-bold tabular-nums" style={{ color: "var(--text-heading)" }}>{d} s</span>
          <motion.div
            className="w-full rounded-t-md"
            initial={{ height: 0 }}
            whileInView={{ height: (d / 32) * 136 }}
            viewport={{ once: true, margin: "-40px" }}
            transition={{ duration: 0.7, delay: i * 0.1, ease: "easeOut" }}
            style={{
              background: "linear-gradient(to top, var(--nav-link-active-bg, rgba(99,102,241,.2)), var(--color-primary, #818cf8))"
            }}
          />
        </div>
      ))}
    </div>
    <div className="flex gap-3 mt-3 pt-3" style={{ borderTop: "1px solid var(--border-subtle)" }}>
      {BACKOFF.map((d, i) => (
        <span key={d} className="flex-1 text-center text-[11px] font-medium" style={{ color: "var(--text-subtle)" }}>
          Retry {i + 1}
        </span>
      ))}
    </div>
  </div>
);

/* ── request flow ───────────────────────────────────────── */
const Flow = () => (
  <div className="relative grid gap-5 md:grid-cols-5 mb-12 sm:mb-16">
    <motion.div
      aria-hidden
      className="hidden md:block absolute top-[26px] left-[10%] right-[10%] h-px origin-left"
      initial={{ scaleX: 0 }}
      whileInView={{ scaleX: 1 }}
      viewport={{ once: true, margin: "-80px" }}
      transition={{ duration: 1.2, ease: "easeInOut" }}
      style={{ background: "var(--accent-gradient, linear-gradient(to right, #6366f1, #c4b5fd))" }}
    />
    {FLOW.map(({ icon: Icon, title, desc }, i) => (
      <div key={title} className="relative flex md:flex-col items-center gap-4 md:gap-3 md:text-center">
        <div className="relative z-10 grid place-items-center w-[52px] h-[52px] rounded-full shrink-0 shadow-sm"
             style={{
               background: "var(--bg-surface)",
               border: `1px solid ${i === 0 || i === FLOW.length - 1 ? "var(--border-subtle)" : "var(--border-accent)"}`,
               color: "var(--color-primary)"
             }}>
          <Icon size={20} />
        </div>
        <div>
          <p className="font-semibold text-sm" style={{ color: "var(--text-heading)" }}>{title}</p>
          <p className="text-xs mt-0.5" style={{ color: "var(--text-subtle)" }}>{desc}</p>
        </div>
      </div>
    ))}
  </div>
);

/* ── trust tabs ─────────────────────────────────────────── */
const Trust = () => {
  const [tab, setTab] = useState(0);
  const g = TRUST[tab];

  return (
    <div className="grid gap-5 lg:grid-cols-[280px_1fr]">
      <div role="tablist" aria-label="Content policies"
           className="flex lg:flex-col gap-2 overflow-x-auto pb-1 lg:pb-0 -mx-5 px-5 sm:mx-0 sm:px-0">
        {TRUST.map((x, i) => {
          const on = i === tab;
          const Icon = x.icon;
          return (
            <button
              key={x.group}
              role="tab"
              aria-selected={on}
              onClick={() => setTab(i)}
              className={`shrink-0 flex items-center gap-3 px-4 py-3 rounded-xl text-sm font-semibold text-left whitespace-nowrap transition-colors ${FOCUS}`}
              style={{
                background: on ? "var(--nav-link-active-bg, rgba(99,102,241,.12))" : "var(--bg-card, transparent)",
                border: `1px solid ${on ? "var(--border-accent, rgba(99,102,241,.4))" : "var(--border-subtle)"}`,
                color: on ? "var(--text-heading)" : "var(--text-muted)",
              }}
            >
              <Icon size={16} style={{ color: on ? "var(--color-primary)" : "currentColor" }} />
              {x.group}
            </button>
          );
        })}
      </div>

      <div className="rounded-2xl p-5 sm:p-8 min-h-[340px]"
           style={{ border: "1px solid var(--border-subtle)", background: "var(--bg-card)" }}>
        <AnimatePresence mode="wait">
          <motion.div
            key={tab}
            role="tabpanel"
            initial={{ opacity: 0, y: 6 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.18 }}
          >
            <h3 className="font-bold text-lg mb-5" style={{ color: "var(--text-heading)" }}>{g.group}</h3>
            <ul className="divide-y" style={{ borderColor: "var(--border-subtle)" }}>
              {g.items.map(([status, text], i) => {
                const cfg = STATUS[status];
                const Icon = cfg.icon;
                return (
                  <li key={i} className="flex gap-3 py-4 first:pt-0 last:pb-0" style={{ borderTopColor: "var(--border-subtle)" }}>
                    <Icon size={18} className="shrink-0 mt-0.5" style={{ color: cfg.color }} />
                    <div className="min-w-0">
                      <span className="text-xs font-bold uppercase tracking-wider" style={{ color: cfg.color }}>{cfg.label}</span>
                      <p className="text-sm leading-relaxed mt-0.5" style={{ color: "var(--text-main)" }}>{text}</p>
                    </div>
                  </li>
                );
              })}
            </ul>
          </motion.div>
        </AnimatePresence>
      </div>
    </div>
  );
};

/* ── faq ────────────────────────────────────────────────── */
const Faq = ({ q, a }) => {
  const [open, setOpen] = useState(false);
  return (
    <div style={{ borderBottom: "1px solid var(--border-subtle)" }}>
      <button
        onClick={() => setOpen(o => !o)}
        aria-expanded={open}
        className={`w-full flex items-center justify-between gap-4 py-4 text-left transition-colors ${FOCUS}`}
      >
        <span className="font-semibold text-sm sm:text-base"
              style={{ color: open ? "var(--color-primary)" : "var(--text-heading)" }}>
          {q}
        </span>
        <ChevronDown size={16} className="shrink-0 transition-transform duration-200"
                     style={{ transform: open ? "rotate(180deg)" : "none", color: "var(--text-muted)" }} />
      </button>
      <AnimatePresence initial={false}>
        {open && (
          <motion.div
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: "auto", opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            transition={{ duration: 0.2 }}
            className="overflow-hidden"
          >
            <p className="pb-4 pr-8 text-sm leading-relaxed" style={{ color: "var(--text-muted)" }}>{a}</p>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
};

/* ── page ───────────────────────────────────────────────── */
const About = () => {
  const go = id => document.getElementById(id)?.scrollIntoView({ behavior: "smooth" });
  const half = Math.ceil(FAQS.length / 2);

  return (
    <MotionConfig reducedMotion="user">
      <main className="min-h-screen xl:pl-20 transition-colors duration-300"
            style={{ background: "var(--bg-main)", color: "var(--text-main)" }}>
        <Rope />

        {/* Overview Hero */}
        <section id="overview" className="relative overflow-hidden pt-20 pb-16 sm:pt-28 sm:pb-24">
          <div aria-hidden className="absolute inset-0 pointer-events-none"
               style={{
                 background: "radial-gradient(ellipse 55% 50% at 15% 0%, var(--glow-radial, rgba(99,102,241,.16)), transparent 70%)"
               }} />
          <Inner className="relative grid gap-12 lg:grid-cols-[1.2fr_1fr] lg:gap-20 items-center">
            <div>
              <img src={logo} alt="AniFind logo" className="h-14 w-auto object-contain mb-6 drop-shadow-md" />
              <h1 className="font-extrabold"
                  style={{
                    fontSize: "clamp(36px,6vw,72px)",
                    letterSpacing: "-0.035em",
                    lineHeight: 1.03,
                    color: "var(--text-heading)"
                  }}>
                Find, track and save the anime you love.
              </h1>
              <p className="mt-6 text-base sm:text-lg leading-relaxed max-w-xl" style={{ color: "var(--text-muted)" }}>
                Search 40,000+ titles, browse 41 genres, follow the current season, and
                maintain your private favourites list. Powered by high-speed Tenrai CDN data with real-time edge caching.
              </p>
              <div className="mt-8 flex flex-wrap gap-3">
                <button onClick={() => go("features")}
                        className={`px-5 py-3 rounded-xl text-sm font-semibold transition-all hover:scale-105 active:scale-95 ${FOCUS}`}
                        style={{
                          background: "var(--btn-primary-bg)",
                          color: "var(--btn-primary-text)",
                          boxShadow: "var(--btn-primary-glow)"
                        }}>
                  See features
                </button>
                <a href="https://github.com/rumman2004/Anifind" target="_blank" rel="noreferrer"
                   className={`inline-flex items-center gap-2 px-5 py-3 rounded-xl text-sm font-semibold transition-all hover:scale-105 active:scale-95 ${FOCUS}`}
                   style={{
                     background: "var(--nav-btn-bg)",
                     border: "1px solid var(--border-medium)",
                     color: "var(--text-main)"
                   }}>
                  <Github size={16} /> View on GitHub
                </a>
              </div>
            </div>

            <dl className="rounded-2xl overflow-hidden shadow-sm"
                style={{ border: "1px solid var(--border-subtle)", background: "var(--bg-card)" }}>
              {GLANCE.map(([label, value], i) => (
                <div key={label} className="flex items-baseline justify-between gap-4 px-6 py-4 sm:py-5"
                     style={{ borderTop: i ? "1px solid var(--border-subtle)" : "none" }}>
                  <dt className="text-sm font-medium" style={{ color: "var(--text-muted)" }}>{label}</dt>
                  <dd className="text-xl sm:text-2xl font-bold tabular-nums" style={{ color: "var(--text-heading)", letterSpacing: "-0.02em" }}>
                    {value}
                  </dd>
                </div>
              ))}
            </dl>
          </Inner>
        </section>

        {/* Features */}
        <Section id="features">
          <Heading title="What you can do" sub="Everything for discovering, tracking and organising anime in one unified workspace." />
          <RuledGrid cols="sm:grid-cols-2 lg:grid-cols-4">
            {FEATURES.map(({ icon: Icon, title, desc }) => (
              <div
                key={title}
                className="p-6 sm:p-7 transition-colors"
                style={{ background: "var(--bg-card)" }}
                onMouseEnter={e => e.currentTarget.style.background = "var(--bg-card-hover)"}
                onMouseLeave={e => e.currentTarget.style.background = "var(--bg-card)"}
              >
                <Icon size={20} style={{ color: "var(--color-primary)" }} />
                <h3 className="font-bold mt-4 mb-1.5" style={{ color: "var(--text-heading)" }}>{title}</h3>
                <p className="text-sm leading-relaxed" style={{ color: "var(--text-muted)" }}>{desc}</p>
              </div>
            ))}
          </RuledGrid>
        </Section>

        {/* Data source */}
        <Section id="data">
          <Heading title="Powered by Tenrai & MyAnimeList"
                   sub="All data is provided by the high-throughput Tenrai REST API, serving comprehensive MyAnimeList records with edge CDN caching." />
          <div className="grid gap-6 lg:grid-cols-5">
            <dl className="lg:col-span-3 rounded-2xl overflow-hidden shadow-sm"
                style={{ border: "1px solid var(--border-subtle)", background: "var(--bg-card)" }}>
              {API_DETAILS.map((r, i) => (
                <div key={r.label} className="grid gap-1 sm:grid-cols-[160px_1fr] sm:gap-6 px-5 py-4 transition-colors"
                     style={{ borderTop: i ? "1px solid var(--border-subtle)" : "none" }}>
                  <dt className="text-sm font-medium" style={{ color: "var(--text-muted)" }}>{r.label}</dt>
                  <dd className="min-w-0">
                    <span className="text-sm font-semibold break-words" style={{ color: "var(--text-heading)" }}>{r.value}</span>
                    {r.note && <p className="text-xs mt-1" style={{ color: "var(--text-subtle)" }}>{r.note}</p>}
                  </dd>
                </div>
              ))}
            </dl>
            <div className="lg:col-span-2"><BackoffChart /></div>
          </div>
        </Section>

        {/* Reliability */}
        <Section id="reliability">
          <Heading title="Engineered for speed & stability"
                   sub="Every request passes through an in-memory cache and a concurrency queue before reaching the API." />
          <Flow />
          <RuledGrid cols="sm:grid-cols-2 lg:grid-cols-3">
            {RELIABILITY.map(({ icon: Icon, title, desc }) => (
              <div
                key={title}
                className="flex gap-4 p-6 transition-colors"
                style={{ background: "var(--bg-card)" }}
                onMouseEnter={e => e.currentTarget.style.background = "var(--bg-card-hover)"}
                onMouseLeave={e => e.currentTarget.style.background = "var(--bg-card)"}
              >
                <Icon size={18} className="shrink-0 mt-0.5" style={{ color: "var(--color-primary)" }} />
                <div>
                  <h3 className="font-bold text-sm mb-1" style={{ color: "var(--text-heading)" }}>{title}</h3>
                  <p className="text-sm leading-relaxed" style={{ color: "var(--text-muted)" }}>{desc}</p>
                </div>
              </div>
            ))}
          </RuledGrid>
        </Section>

        {/* Trust */}
        <Section id="trust">
          <Heading title="Content & privacy standards"
                   sub="What we verify, what we disclaim, and what you should know." />
          <Trust />
          <div className="mt-5 flex gap-4 rounded-2xl p-5 sm:p-6"
               style={{
                 background: "var(--nav-link-active-bg, rgba(96,165,250,.06))",
                 border: "1px solid var(--border-accent, rgba(96,165,250,.2))"
               }}>
            <Lock size={18} className="shrink-0 mt-0.5" style={{ color: "var(--color-primary)" }} />
            <p className="text-sm leading-relaxed" style={{ color: "var(--text-main)" }}>
              <span className="font-bold" style={{ color: "var(--text-heading)" }}>Security & Encryption:</span>{" "}
              Passwords are hashed with bcrypt (12 salt rounds). Sessions rely on signed JWTs in
              HTTP-only, secure cookies. Zero third-party trackers, ad networks, or telemetry scripts are loaded, and user
              data is never rented, shared, or sold.
            </p>
          </div>
        </Section>

        {/* FAQ */}
        <Section id="faq">
          <Heading title="Frequently asked questions" />
          <div className="grid gap-x-12 lg:grid-cols-2 items-start">
            {[FAQS.slice(0, half), FAQS.slice(half)].map((col, c) => (
              <div key={c} style={{ borderTop: "1px solid var(--border-subtle)" }}>
                {col.map(f => <Faq key={f.q} {...f} />)}
              </div>
            ))}
          </div>
        </Section>

        {/* Contact */}
        <Section id="contact">
          <Heading title="Contact & resources" />
          <RuledGrid cols="md:grid-cols-3">
            {LINKS.map(({ icon: Icon, label, desc, href, external }) => (
              <a key={label} href={href}
                 {...(external && { target: "_blank", rel: "noreferrer" })}
                 className={`group p-6 sm:p-8 transition-colors no-underline ${FOCUS}`}
                 style={{ background: "var(--bg-card)" }}
                 onMouseEnter={e => e.currentTarget.style.background = "var(--bg-card-hover)"}
                 onMouseLeave={e => e.currentTarget.style.background = "var(--bg-card)"}
              >
                <Icon size={22} style={{ color: "var(--color-primary)" }} />
                <p className="font-bold mt-5 mb-1" style={{ color: "var(--text-heading)" }}>{label}</p>
                <p className="text-sm" style={{ color: "var(--text-muted)" }}>{desc}</p>
              </a>
            ))}
          </RuledGrid>

          <div className="mt-16 text-center">
            <p className="inline-flex items-center gap-1.5 text-sm font-medium" style={{ color: "var(--text-muted)" }}>
              <Heart size={14} style={{ color: "var(--color-secondary, #ec4899)", fill: "var(--color-secondary, #ec4899)" }} />
              Built with love for the anime community
            </p>
            <p className="mt-2 text-xs max-w-xl mx-auto" style={{ color: "var(--text-subtle)" }}>
              AniFind is not affiliated with MyAnimeList, Tenrai, Jikan, or any anime studio.
              All trademarks and copyrighted materials belong to their respective owners.
            </p>
          </div>
        </Section>
      </main>
    </MotionConfig>
  );
};

export default About;