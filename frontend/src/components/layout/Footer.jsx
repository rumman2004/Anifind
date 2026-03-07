// src/components/layout/Footer.jsx
import { Link } from "react-router-dom";
import { motion } from "framer-motion";
import {
  Github, Twitter, Heart, ExternalLink,
  Mail, Compass, Home, Info, Film, Tv, Baby,
  Star, TrendingUp, Calendar, BookMarked,
} from "lucide-react";
import logo from "../../assets/logo.png";

/* ══════════════════════════════════════════════════════════
   DATA
══════════════════════════════════════════════════════════ */
const EXPLORE_LINKS = [
  { to: "/",       label: "Home",        icon: <Home      size={12} /> },
  { to: "/movies", label: "Movies",      icon: <Film      size={12} /> },
  { to: "/series", label: "Series",      icon: <Tv        size={12} /> },
  { to: "/kids",   label: "Kids",        icon: <Baby      size={12} /> },
  { to: "/search", label: "Explore",     icon: <Compass   size={12} /> },
  { to: "/about",  label: "About",       icon: <Info      size={12} /> },
];

const DISCOVER_LINKS = [
  { to: "/search?sort=score",    label: "Top Rated",      icon: <Star        size={12} /> },
  { to: "/search?sort=trending", label: "Trending Now",   icon: <TrendingUp  size={12} /> },
  { to: "/search?season=now",    label: "This Season",    icon: <Calendar    size={12} /> },
  { to: "/favorites",            label: "My Favourites",  icon: <BookMarked  size={12} /> },
];

const SOCIAL_LINKS = [
  { href: "https://github.com/rumman2004/AniFind",  icon: <Github   size={15} />, label: "GitHub"   },
  { href: "https://twitter.com/rumman_tw11", icon: <Twitter  size={15} />, label: "Twitter"  },
  { href: "mailto:rumman.ahmed.work+query@gmail.com", icon: <Mail size={15} />, label: "Email"   },
];

/* ══════════════════════════════════════════════════════════
   ATOMS
══════════════════════════════════════════════════════════ */
const FooterLink = ({ to, icon, label }) => (
  <Link
    to={to}
    className="group flex items-center gap-2 text-sm transition-all duration-200"
    style={{ color: "rgba(148,163,184,.55)" }}
    onMouseEnter={e => { e.currentTarget.style.color = "#a5b4fc"; }}
    onMouseLeave={e => { e.currentTarget.style.color = "rgba(148,163,184,.55)"; }}
  >
    <span
      className="flex-shrink-0 transition-colors duration-200"
      style={{ color: "rgba(99,102,241,.40)" }}
    >
      {icon}
    </span>
    <span className="transition-all duration-200 group-hover:translate-x-0.5">
      {label}
    </span>
  </Link>
);

const SocialBtn = ({ href, icon, label }) => (
  <a
    href={href}
    target="_blank"
    rel="noreferrer"
    aria-label={label}
    className="flex items-center justify-center w-9 h-9 rounded-xl transition-all
               duration-200 hover:scale-110 active:scale-95"
    style={{
      background: "rgba(255,255,255,.05)",
      border:     "1px solid rgba(255,255,255,.08)",
      color:      "rgba(148,163,184,.55)",
    }}
    onMouseEnter={e => {
      e.currentTarget.style.background = "rgba(99,102,241,.18)";
      e.currentTarget.style.borderColor = "rgba(99,102,241,.35)";
      e.currentTarget.style.color = "#a5b4fc";
    }}
    onMouseLeave={e => {
      e.currentTarget.style.background = "rgba(255,255,255,.05)";
      e.currentTarget.style.borderColor = "rgba(255,255,255,.08)";
      e.currentTarget.style.color = "rgba(148,163,184,.55)";
    }}
  >
    {icon}
  </a>
);

const ColTitle = ({ children }) => (
  <h4
    className="text-xs font-black uppercase tracking-widest mb-4"
    style={{ color: "rgba(165,180,252,.60)" }}
  >
    {children}
  </h4>
);

/* ══════════════════════════════════════════════════════════
   FOOTER
══════════════════════════════════════════════════════════ */
const Footer = () => {
  const year = new Date().getFullYear();

  return (
    <footer
      className="relative w-full overflow-hidden"
      style={{
        background:  "#08080f",
        borderTop:   "1px solid rgba(255,255,255,.06)",
        marginTop:   80,
      }}
    >
      {/* ── background glow ── */}
      <div className="absolute inset-0 pointer-events-none">
        <div style={{
          position:   "absolute",
          bottom:     "-60px",
          left:       "10%",
          width:      500,
          height:     300,
          background: "radial-gradient(ellipse,rgba(99,102,241,.07) 0%,transparent 70%)",
          filter:     "blur(60px)",
        }} />
        <div style={{
          position:   "absolute",
          bottom:     "-40px",
          right:      "15%",
          width:      300,
          height:     200,
          background: "radial-gradient(ellipse,rgba(139,92,246,.05) 0%,transparent 70%)",
          filter:     "blur(50px)",
        }} />
      </div>

      {/* ── top accent line ── */}
      <div
        className="w-full h-px"
        style={{
          background: "linear-gradient(90deg,transparent 0%,rgba(99,102,241,.40) 30%,rgba(139,92,246,.40) 60%,transparent 100%)",
        }}
      />

      <div className="relative z-10 w-full px-4 sm:px-8 lg:px-14 xl:px-20">

        {/* ════ MAIN GRID ════ */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-10 lg:gap-8 pt-14 pb-10">

          {/* ── COL 1: BRAND ── */}
          <motion.div
            initial={{ opacity: 0, y: 16 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.45 }}
            className="lg:col-span-1"
          >
            {/* logo */}
            <Link to="/" className="inline-flex items-center gap-2.5 mb-4 group">
              <div
                className="w-9 h-9 rounded-xl overflow-hidden flex items-center justify-center
                           transition-all duration-300 group-hover:scale-110 group-hover:rotate-3"
                style={{
                  boxShadow: "0 0 20px rgba(99,102,241,.40)",
                  border:    "1px solid rgba(99,102,241,.30)",
                }}
              >
                <img
                  src={logo}
                  alt="AniFind logo"
                  className="w-full h-full object-cover"
                />
              </div>
              <span className="text-lg font-black text-white tracking-tight">
                Ani<span style={{ color: "#a5b4fc" }}>Find</span>
              </span>
            </Link>

            <p
              className="text-sm leading-relaxed mb-5"
              style={{ color: "rgba(148,163,184,.50)", maxWidth: 240 }}
            >
              Your ultimate anime discovery platform. Find, explore and track
              the anime you love.
            </p>

            {/* social icons */}
            <div className="flex items-center gap-2">
              {SOCIAL_LINKS.map((s) => (
                <SocialBtn key={s.label} {...s} />
              ))}
            </div>

            {/* powered by */}
            <div
              className="inline-flex items-center gap-2 mt-5 px-3 py-1.5 rounded-xl"
              style={{
                background: "rgba(255,255,255,.03)",
                border:     "1px solid rgba(255,255,255,.07)",
              }}
            >
              <span className="text-[10px]" style={{ color: "rgba(148,163,184,.38)" }}>
                Powered by
              </span>
              <a
                href="https://jikan.moe"
                target="_blank"
                rel="noreferrer"
                className="flex items-center gap-1 text-[11px] font-bold transition-colors hover:text-indigo-300"
                style={{ color: "#a5b4fc" }}
              >
                Jikan API
                <ExternalLink size={9} />
              </a>
            </div>
          </motion.div>

          {/* ── COL 2: EXPLORE ── */}
          <motion.div
            initial={{ opacity: 0, y: 16 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.45, delay: 0.08 }}
          >
            <ColTitle>Explore</ColTitle>
            <ul className="space-y-3">
              {EXPLORE_LINKS.map((l) => (
                <li key={l.to}>
                  <FooterLink {...l} />
                </li>
              ))}
            </ul>
          </motion.div>

          {/* ── COL 3: DISCOVER ── */}
          <motion.div
            initial={{ opacity: 0, y: 16 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.45, delay: 0.14 }}
          >
            <ColTitle>Discover</ColTitle>
            <ul className="space-y-3">
              {DISCOVER_LINKS.map((l) => (
                <li key={l.to}>
                  <FooterLink {...l} />
                </li>
              ))}
            </ul>
          </motion.div>

          {/* ── COL 4: ABOUT / DATA SOURCE ── */}
          <motion.div
            initial={{ opacity: 0, y: 16 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.45, delay: 0.20 }}
          >
            <ColTitle>Data Source</ColTitle>
            <p className="text-sm leading-relaxed mb-4"
               style={{ color: "rgba(148,163,184,.50)" }}>
              All anime data is provided by the{" "}
              <a
                href="https://jikan.moe"
                target="_blank"
                rel="noreferrer"
                className="font-semibold transition-colors hover:text-indigo-300"
                style={{ color: "#a5b4fc" }}
              >
                Jikan REST API
              </a>
              {" "}— an unofficial open-source MyAnimeList API.
            </p>

            {/* MAL badge */}
            <a
              href="https://myanimelist.net"
              target="_blank"
              rel="noreferrer"
              className="inline-flex items-center gap-2 px-3.5 py-2 rounded-xl text-xs
                         font-semibold transition-all duration-200 hover:scale-105"
              style={{
                background: "rgba(99,102,241,.10)",
                border:     "1px solid rgba(99,102,241,.22)",
                color:      "#a5b4fc",
              }}
            >
              <ExternalLink size={11} />
              MyAnimeList
            </a>

            {/* newsletter / stay updated teaser */}
            <div
              className="mt-5 p-3.5 rounded-2xl"
              style={{
                background: "rgba(99,102,241,.07)",
                border:     "1px solid rgba(99,102,241,.15)",
              }}
            >
              <p className="text-[11px] font-bold text-white mb-0.5">
                Stay up to date
              </p>
              <p className="text-[10px] mb-2.5"
                 style={{ color: "rgba(148,163,184,.45)" }}>
                Follow us for new features &amp; anime drops.
              </p>
              <div className="flex gap-1.5">
                {SOCIAL_LINKS.slice(0, 2).map((s) => (
                  <SocialBtn key={s.label} {...s} />
                ))}
              </div>
            </div>
          </motion.div>
        </div>

        {/* ════ DIVIDER ════ */}
        <div
          className="w-full h-px"
          style={{
            background: "linear-gradient(90deg,transparent,rgba(255,255,255,.07),transparent)",
          }}
        />

        {/* ════ BOTTOM BAR ════ */}
        <motion.div
          initial={{ opacity: 0 }}
          whileInView={{ opacity: 1 }}
          viewport={{ once: true }}
          transition={{ duration: 0.5, delay: 0.25 }}
          className="flex flex-col sm:flex-row items-center justify-between
                     gap-3 py-5"
        >
          {/* copyright */}
          <p className="text-xs" style={{ color: "rgba(148,163,184,.35)" }}>
            © {year} AniFind. All rights reserved.
          </p>

          
          {/* legal links */}
          <div className="flex items-center gap-4">
            {[
              { label: "Privacy Policy", to: "/privacy" },
              { label: "Terms of Use",   to: "/terms"   },
            ].map(({ label, to }) => (
              <Link
                key={to}
                to={to}
                className="text-xs transition-colors duration-200"
                style={{ color: "rgba(148,163,184,.30)" }}
                onMouseEnter={e => { e.currentTarget.style.color = "#a5b4fc"; }}
                onMouseLeave={e => { e.currentTarget.style.color = "rgba(148,163,184,.30)"; }}
              >
                {label}
              </Link>
            ))}
          </div>
        </motion.div>
      </div>
    </footer>
  );
};

export default Footer;