// Navbar.jsx
import { useState, useRef, useEffect, useCallback } from "react";
import { Link, useNavigate, useLocation } from "react-router-dom";
import { motion, AnimatePresence } from "framer-motion";
import {
  Search, Heart, User, Menu, X,
  LogOut, ChevronDown, Tv, Film, Baby, Home,
  Info, Compass, Star, TrendingUp, ChevronRight,
} from "lucide-react";
import { useAuth }      from "../../context/AuthContext";
import { useFavorites } from "../../context/FavoritesContext";
import { animeService } from "../../services/animeService";
import { useDebounce }  from "../../hooks/useDebounce";
import logo             from "../../assets/logo.png"; // ← import

/* ══════════════════════════════════════════════════════════
   NAV LINKS
══════════════════════════════════════════════════════════ */
const NAV_LINKS = [
  { to: "/",       label: "Home",    icon: <Home    size={14} /> },
  { to: "/movies", label: "Movies",  icon: <Film    size={14} /> },
  { to: "/series", label: "Series",  icon: <Tv      size={14} /> },
  { to: "/kids",   label: "Kids",    icon: <Baby    size={14} /> },
  { to: "/search", label: "Explore", icon: <Compass size={14} /> },
  { to: "/about",  label: "About",   icon: <Info    size={14} /> },
];

const scoreColor = (s) =>
  !s       ? "rgba(148,163,184,.5)" :
  s >= 8.5 ? "#fbbf24" :
  s >= 7.5 ? "#a3e635" :
  s >= 6.5 ? "#60a5fa" :
             "rgba(148,163,184,.6)";

/* ══════════════════════════════════════════════════════════
   LOGO — isolated component so it stays DRY
   Used in the main bar + mobile menu header
══════════════════════════════════════════════════════════ */
const NavLogo = ({ size = 32 }) => (
  <Link to="/" className="flex items-center gap-2.5 flex-shrink-0 group">
    {/* image wrapper — glow + hover tilt */}
    <div
      className="overflow-hidden rounded-xl flex-shrink-0 transition-all duration-300
                 group-hover:scale-110 group-hover:rotate-3"
      style={{
        width:     size,
        height:    size,
        boxShadow: "0 0 18px rgba(99,102,241,.50)",
        border:    "1.5px solid rgba(99,102,241,.35)",
      }}
    >
      <img
        src={logo}
        alt="AniFind logo"
        className="w-full h-full object-cover"
        draggable={false}
      />
    </div>

    {/* wordmark */}
    <span
      className="font-black text-white tracking-tight transition-opacity duration-200
                 group-hover:opacity-90"
      style={{ fontSize: size * 0.53 }}
    >
      Ani<span style={{ color: "#a5b4fc" }}>Find</span>
    </span>
  </Link>
);

/* ══════════════════════════════════════════════════════════
   USER AVATAR
══════════════════════════════════════════════════════════ */
const UserAvatar = ({ user, size = 28, radius = 10, className = "" }) => {
  const [imgErr, setImgErr] = useState(false);
  const initial  = user?.username?.[0]?.toUpperCase() ?? "U";
  const fontSize = Math.max(size * 0.38, 10);

  useEffect(() => { setImgErr(false); }, [user?.avatar]);

  if (user?.avatar && !imgErr) {
    return (
      <div
        className={`flex-shrink-0 overflow-hidden ${className}`}
        style={{
          width:        size,
          height:       size,
          borderRadius: radius,
          border:       "1.5px solid rgba(99,102,241,.40)",
          boxShadow:    "0 0 0 2px rgba(99,102,241,.15)",
        }}
      >
        <img
          src={user.avatar}
          alt={user.username}
          onError={() => setImgErr(true)}
          className="w-full h-full object-cover"
          draggable={false}
        />
      </div>
    );
  }

  return (
    <div
      className={`flex-shrink-0 flex items-center justify-center font-black text-white ${className}`}
      style={{
        width:        size,
        height:       size,
        borderRadius: radius,
        fontSize,
        background:   "linear-gradient(135deg,#6366f1,#8b5cf6)",
        boxShadow:    "0 0 0 2px rgba(99,102,241,.35)",
      }}
    >
      {initial}
    </div>
  );
};

/* ══════════════════════════════════════════════════════════
   SUGGESTION ITEM
══════════════════════════════════════════════════════════ */
const SuggestionItem = ({ anime, selected, onSelect, onHover, index }) => {
  const ref   = useRef(null);
  const img   = anime.images?.jpg?.large_image_url || anime.images?.jpg?.image_url;
  const title = anime.title_english || anime.title;
  const sc    = anime.score;

  useEffect(() => {
    if (selected) ref.current?.scrollIntoView({ block: "nearest", behavior: "smooth" });
  }, [selected]);

  return (
    <motion.li
      ref={ref}
      initial={{ opacity: 0, x: -8 }}
      animate={{ opacity: 1,  x: 0  }}
      transition={{ delay: index * 0.025, duration: 0.18 }}
    >
      <button
        onMouseDown={(e) => { e.preventDefault(); onSelect(anime); }}
        onMouseEnter={() => onHover(index)}
        className="w-full flex items-center gap-3 px-3.5 py-2.5 text-left transition-all duration-150"
        style={{
          background: selected ? "rgba(99,102,241,.12)" : "transparent",
          borderLeft: selected ? "2px solid rgba(99,102,241,.55)" : "2px solid transparent",
        }}
      >
        <div
          className="flex-shrink-0 rounded-xl overflow-hidden"
          style={{
            width:     36,
            height:    50,
            background: "rgba(255,255,255,.06)",
            border:     "1px solid rgba(255,255,255,.08)",
            boxShadow:  selected ? "0 0 0 2px rgba(99,102,241,.30)" : "none",
          }}
        >
          {img ? (
            <img
              src={img} alt={title}
              className="w-full h-full object-cover"
              style={{ transform: selected ? "scale(1.06)" : "scale(1)", transition: "transform .3s" }}
            />
          ) : (
            <div className="w-full h-full flex items-center justify-center">
              <Tv size={13} style={{ color: "rgba(148,163,184,.30)" }} />
            </div>
          )}
        </div>

        <div className="flex-1 min-w-0">
          <p
            className="text-sm font-semibold leading-tight truncate transition-colors"
            style={{ color: selected ? "#a5b4fc" : "#fff" }}
          >
            {title}
          </p>
          {anime.title_english && anime.title !== anime.title_english && (
            <p className="text-[10px] truncate mt-0.5"
               style={{ color: "rgba(148,163,184,.38)" }}>
              {anime.title}
            </p>
          )}
          <div className="flex items-center gap-1.5 mt-1 flex-wrap">
            {sc && (
              <span className="flex items-center gap-0.5 text-[10px] font-bold"
                    style={{ color: scoreColor(sc) }}>
                <Star size={8} style={{ fill: scoreColor(sc) }} />
                {sc.toFixed(1)}
              </span>
            )}
            {anime.type && (
              <span className="text-[9px] font-bold uppercase px-1.5 py-0.5 rounded-md"
                    style={{
                      background: "rgba(99,102,241,.12)",
                      border:     "1px solid rgba(99,102,241,.20)",
                      color:      "rgba(165,180,252,.70)",
                    }}>
                {anime.type}
              </span>
            )}
            {anime.episodes && (
              <span className="text-[9px]" style={{ color: "rgba(148,163,184,.38)" }}>
                {anime.episodes} eps
              </span>
            )}
            {anime.year && (
              <span className="text-[9px]" style={{ color: "rgba(148,163,184,.30)" }}>
                {anime.year}
              </span>
            )}
            {anime.status === "Currently Airing" && (
              <span className="w-1.5 h-1.5 rounded-full flex-shrink-0"
                    style={{ background: "#4ade80", boxShadow: "0 0 4px #4ade80" }} />
            )}
          </div>
        </div>

        <ChevronRight
          size={11}
          className="flex-shrink-0 transition-all"
          style={{
            color:     selected ? "rgba(99,102,241,.70)" : "rgba(148,163,184,.20)",
            transform: selected ? "translateX(2px)"      : "translateX(0)",
          }}
        />
      </button>
    </motion.li>
  );
};

/* ══════════════════════════════════════════════════════════
   SUGGESTIONS DROPDOWN
══════════════════════════════════════════════════════════ */
const SuggestionsDropdown = ({
  visible, loading, suggestions, query,
  selectedIndex, onSelect, onSearchAll, onHoverIndex,
}) => (
  <AnimatePresence>
    {visible && (
      <motion.div
        initial={{ opacity: 0, y: -4, scaleY: 0.96 }}
        animate={{ opacity: 1, y: 0,  scaleY: 1    }}
        exit={{   opacity: 0, y: -4, scaleY: 0.96  }}
        transition={{ duration: 0.16, ease: "easeOut" }}
        className="absolute left-0 right-0 z-[100] overflow-hidden"
        style={{
          top:             "calc(100% + 4px)",
          background:      "rgba(10,10,22,.97)",
          border:          "1px solid rgba(99,102,241,.22)",
          borderRadius:    14,
          boxShadow:       "0 20px 60px rgba(0,0,0,.70),0 4px 20px rgba(99,102,241,.12)",
          transformOrigin: "top",
        }}
      >
        {loading && (
          <div className="flex items-center gap-2.5 px-4 py-4">
            <div className="w-4 h-4 rounded-full border-2 border-transparent flex-shrink-0"
                 style={{ borderTopColor: "#a5b4fc", animation: "spin .7s linear infinite" }} />
            <span className="text-xs" style={{ color: "rgba(148,163,184,.55)" }}>
              Searching for <span style={{ color: "#a5b4fc" }}>"{query}"</span>…
            </span>
          </div>
        )}

        {!loading && suggestions.length === 0 && (
          <div className="flex flex-col items-center gap-2 py-7 px-4">
            <Search size={22} style={{ color: "rgba(99,102,241,.30)" }} />
            <p className="text-xs text-center" style={{ color: "rgba(148,163,184,.50)" }}>
              No results for{" "}
              <span className="font-semibold" style={{ color: "rgba(165,180,252,.70)" }}>
                "{query}"
              </span>
            </p>
            <button
              onMouseDown={(e) => { e.preventDefault(); onSearchAll(); }}
              className="flex items-center gap-1.5 text-[10px] font-semibold
                         px-3 py-1.5 rounded-lg transition-all hover:scale-105 mt-1"
              style={{
                background: "rgba(99,102,241,.14)",
                color:      "#a5b4fc",
                border:     "1px solid rgba(99,102,241,.24)",
              }}
            >
              <Search size={9} /> Full search for "{query}"
            </button>
          </div>
        )}

        {!loading && suggestions.length > 0 && (
          <>
            <div className="flex items-center justify-between px-3.5 pt-2.5 pb-1.5"
                 style={{ borderBottom: "1px solid rgba(255,255,255,.05)" }}>
              <div className="flex items-center gap-1.5">
                <TrendingUp size={10} style={{ color: "rgba(99,102,241,.60)" }} />
                <span className="text-[9px] uppercase tracking-widest font-bold"
                      style={{ color: "rgba(148,163,184,.38)" }}>
                  Top matches
                </span>
              </div>
              <span className="text-[9px]" style={{ color: "rgba(148,163,184,.28)" }}>
                {suggestions.length} found
              </span>
            </div>

            <ul className="overflow-y-auto" style={{ maxHeight: 320, scrollbarWidth: "none" }}>
              {suggestions.map((anime, i) => (
                <SuggestionItem
                  key={anime.mal_id}
                  anime={anime}
                  index={i}
                  selected={i === selectedIndex}
                  onSelect={onSelect}
                  onHover={onHoverIndex}
                />
              ))}
            </ul>

            <button
              onMouseDown={(e) => { e.preventDefault(); onSearchAll(); }}
              className="w-full flex items-center justify-center gap-2 py-2.5 text-xs
                         font-semibold transition-all hover:brightness-125 group"
              style={{
                background: "rgba(99,102,241,.08)",
                borderTop:  "1px solid rgba(99,102,241,.14)",
                color:      "rgba(165,180,252,.70)",
              }}
            >
              <Search size={10} />
              See all results for{" "}
              <span className="font-black" style={{ color: "#a5b4fc" }}>"{query}"</span>
              <ChevronRight size={11} className="transition-transform group-hover:translate-x-0.5" />
            </button>
          </>
        )}

        <style>{`@keyframes spin { to { transform: rotate(360deg); } }`}</style>
      </motion.div>
    )}
  </AnimatePresence>
);

/* ══════════════════════════════════════════════════════════
   NAVBAR SEARCH
══════════════════════════════════════════════════════════ */
const NavbarSearch = ({ onClose }) => {
  const navigate  = useNavigate();
  const inputRef  = useRef(null);
  const wrapRef   = useRef(null);

  const [query,         setQuery]         = useState("");
  const [suggestions,   setSuggestions]   = useState([]);
  const [sugLoading,    setSugLoading]    = useState(false);
  const [dropVisible,   setDropVisible]   = useState(false);
  const [selectedIndex, setSelectedIndex] = useState(-1);
  const [focused,       setFocused]       = useState(false);

  const debouncedQuery = useDebounce(query, 380);

  useEffect(() => { inputRef.current?.focus(); }, []);

  useEffect(() => {
    if (debouncedQuery.trim().length < 2) {
      setSuggestions([]); setDropVisible(false); setSugLoading(false);
      return;
    }
    let cancelled = false;
    setSugLoading(true); setDropVisible(true); setSelectedIndex(-1);

    animeService.searchAnime(debouncedQuery, { limit: 8 })
      .then((data) => { if (!cancelled) { setSuggestions(data.data ?? []); setSugLoading(false); } })
      .catch(()    => { if (!cancelled) setSugLoading(false); });

    return () => { cancelled = true; };
  }, [debouncedQuery]);

  const handleSelect = useCallback((anime) => {
    setDropVisible(false); setQuery(""); onClose();
    navigate(`/anime/${anime.mal_id}`);
  }, [navigate, onClose]);

  const handleSearchAll = useCallback(() => {
    if (!query.trim()) return;
    setDropVisible(false); onClose();
    navigate(`/search?q=${encodeURIComponent(query.trim())}`);
  }, [query, navigate, onClose]);

  const handleKeyDown = useCallback((e) => {
    if (!dropVisible) return;
    switch (e.key) {
      case "ArrowDown": e.preventDefault(); setSelectedIndex((p) => Math.min(p + 1, suggestions.length - 1)); break;
      case "ArrowUp":   e.preventDefault(); setSelectedIndex((p) => Math.max(p - 1, -1)); break;
      case "Enter":
        e.preventDefault();
        selectedIndex >= 0 && suggestions[selectedIndex]
          ? handleSelect(suggestions[selectedIndex])
          : handleSearchAll();
        break;
      case "Escape": setDropVisible(false); onClose(); break;
      default: break;
    }
  }, [dropVisible, selectedIndex, suggestions, handleSelect, handleSearchAll, onClose]);

  useEffect(() => {
    const h = (e) => { if (wrapRef.current && !wrapRef.current.contains(e.target)) setDropVisible(false); };
    document.addEventListener("mousedown", h);
    return () => document.removeEventListener("mousedown", h);
  }, []);

  return (
    <div ref={wrapRef} className="relative w-full">
      <div
        className="flex items-center gap-2 px-3.5 py-2.5 transition-all"
        style={{
          background:   "rgba(255,255,255,.06)",
          border:       `1px solid ${focused ? "rgba(99,102,241,.50)" : "rgba(255,255,255,.10)"}`,
          boxShadow:    focused ? "0 0 0 3px rgba(99,102,241,.10)" : "none",
          transition:   "border-color .2s, box-shadow .2s",
          borderRadius: dropVisible ? "16px 16px 0 0" : "16px",
        }}
      >
        <Search size={15} style={{ color: "rgba(148,163,184,.50)", flexShrink: 0 }} />
        <input
          ref={inputRef}
          type="text"
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          onKeyDown={handleKeyDown}
          onFocus={() => { setFocused(true); if (query.trim().length >= 2) setDropVisible(true); }}
          onBlur={() => setFocused(false)}
          placeholder="Search anime, movies, series…"
          className="flex-1 bg-transparent outline-none text-sm text-white placeholder:text-white/30 min-w-0"
        />
        <AnimatePresence>
          {query && (
            <motion.button
              initial={{ opacity: 0, scale: 0.7 }}
              animate={{ opacity: 1, scale: 1    }}
              exit={{   opacity: 0, scale: 0.7   }}
              onClick={() => { setQuery(""); setSuggestions([]); setDropVisible(false); inputRef.current?.focus(); }}
              className="flex-shrink-0 w-5 h-5 rounded-full flex items-center justify-center
                         transition-all hover:scale-110"
              style={{ background: "rgba(255,255,255,.10)" }}
            >
              <X size={10} className="text-white" />
            </motion.button>
          )}
        </AnimatePresence>
        <button
          onClick={handleSearchAll}
          className="flex-shrink-0 flex items-center gap-1 px-2.5 py-1 rounded-lg text-xs
                     font-semibold transition-all hover:scale-105 active:scale-95"
          style={{
            background: "rgba(99,102,241,.22)",
            color:      "#a5b4fc",
            border:     "1px solid rgba(99,102,241,.30)",
          }}
        >
          <Search size={10} /> Search
        </button>
      </div>

      <SuggestionsDropdown
        visible={dropVisible && query.trim().length >= 2}
        loading={sugLoading}
        suggestions={suggestions}
        query={query}
        selectedIndex={selectedIndex}
        onSelect={handleSelect}
        onSearchAll={handleSearchAll}
        onHoverIndex={setSelectedIndex}
      />
    </div>
  );
};

/* ══════════════════════════════════════════════════════════
   NAVBAR
══════════════════════════════════════════════════════════ */
const Navbar = () => {
  const [menuOpen,   setMenuOpen]   = useState(false);
  const [searchOpen, setSearchOpen] = useState(false);
  const [dropOpen,   setDropOpen]   = useState(false);
  const [scrolled,   setScrolled]   = useState(false);

  const { user, logout } = useAuth();
  const { favorites }    = useFavorites();
  const navigate         = useNavigate();
  const location         = useLocation();
  const dropRef          = useRef(null);

  useEffect(() => {
    setMenuOpen(false); setSearchOpen(false); setDropOpen(false);
  }, [location.pathname]);

  useEffect(() => {
    const h = () => setScrolled(window.scrollY > 10);
    window.addEventListener("scroll", h, { passive: true });
    return () => window.removeEventListener("scroll", h);
  }, []);

  useEffect(() => {
    const h = (e) => { if (dropRef.current && !dropRef.current.contains(e.target)) setDropOpen(false); };
    document.addEventListener("mousedown", h);
    return () => document.removeEventListener("mousedown", h);
  }, []);

  useEffect(() => {
    const h = (e) => { if (e.key === "Escape") setSearchOpen(false); };
    document.addEventListener("keydown", h);
    return () => document.removeEventListener("keydown", h);
  }, []);

  const handleLogout = () => { logout(); navigate("/"); setDropOpen(false); };

  const isActive = (to) =>
    to === "/" ? location.pathname === "/" : location.pathname.startsWith(to);

  return (
    <nav
      className="fixed top-0 left-0 right-0 z-50 transition-all duration-300"
      style={{
        background:     scrolled
          ? "rgba(10,10,20,.94)"
          : "linear-gradient(to bottom,rgba(10,10,20,.82) 0%,transparent 100%)",
        backdropFilter: scrolled ? "blur(18px)" : "blur(0px)",
        borderBottom:   scrolled ? "1px solid rgba(255,255,255,.06)" : "none",
      }}
    >
      <div className="w-full px-4 sm:px-8 lg:px-14">
        <div className="flex items-center justify-between h-16">

          {/* ══ LEFT — logo + desktop links ══ */}
          <div className="flex items-center gap-6 xl:gap-8">

            {/* ── logo image ── */}
            <NavLogo size={32} />

            {/* desktop nav links */}
            <div className="hidden lg:flex items-center gap-0.5">
              {NAV_LINKS.map(({ to, label, icon }) => {
                const active = isActive(to);
                return (
                  <Link
                    key={to}
                    to={to}
                    className="relative flex items-center gap-1.5 px-3.5 py-2 rounded-xl
                               text-sm font-medium transition-all duration-200"
                    style={{
                      color:      active ? "#fff"                           : "rgba(255,255,255,.50)",
                      background: active ? "rgba(99,102,241,.15)"           : "transparent",
                      border:     active ? "1px solid rgba(99,102,241,.25)" : "1px solid transparent",
                    }}
                    onMouseEnter={e => {
                      if (!active) {
                        e.currentTarget.style.color      = "rgba(255,255,255,.90)";
                        e.currentTarget.style.background = "rgba(255,255,255,.06)";
                      }
                    }}
                    onMouseLeave={e => {
                      if (!active) {
                        e.currentTarget.style.color      = "rgba(255,255,255,.50)";
                        e.currentTarget.style.background = "transparent";
                      }
                    }}
                  >
                    <span style={{ color: active ? "#a5b4fc" : "inherit", opacity: active ? 1 : 0.6 }}>
                      {icon}
                    </span>
                    {label}
                    {active && (
                      <motion.div
                        layoutId="nav-pill"
                        className="absolute inset-0 rounded-xl pointer-events-none"
                        style={{ border: "1px solid rgba(99,102,241,.30)" }}
                        transition={{ type: "spring", stiffness: 380, damping: 30 }}
                      />
                    )}
                  </Link>
                );
              })}
            </div>
          </div>

          {/* ══ RIGHT ══ */}
          <div className="flex items-center gap-1 sm:gap-1.5">

            {/* Search toggle */}
            <button
              onClick={() => setSearchOpen((s) => !s)}
              className="p-2.5 rounded-xl transition-all hover:scale-105 active:scale-95"
              style={{
                background: searchOpen ? "rgba(99,102,241,.20)"          : "rgba(255,255,255,.06)",
                color:      searchOpen ? "#a5b4fc"                        : "rgba(255,255,255,.55)",
                border:     searchOpen ? "1px solid rgba(99,102,241,.30)" : "1px solid rgba(255,255,255,.08)",
              }}
              aria-label="Toggle search"
            >
              {searchOpen ? <X size={17} /> : <Search size={17} />}
            </button>

            {user ? (
              <>
                {/* Favourites */}
                <Link
                  to="/favorites"
                  className="relative p-2.5 rounded-xl transition-all hover:scale-105 active:scale-95"
                  style={{
                    background: location.pathname === "/favorites" ? "rgba(236,72,153,.18)" : "rgba(255,255,255,.06)",
                    color:      location.pathname === "/favorites" ? "#f9a8d4"              : "rgba(255,255,255,.55)",
                    border:     location.pathname === "/favorites"
                      ? "1px solid rgba(236,72,153,.28)" : "1px solid rgba(255,255,255,.08)",
                  }}
                  aria-label="Favourites"
                >
                  <Heart size={17} />
                  <AnimatePresence>
                    {favorites.length > 0 && (
                      <motion.span
                        initial={{ scale: 0 }} animate={{ scale: 1 }} exit={{ scale: 0 }}
                        className="absolute -top-0.5 -right-0.5 min-w-[16px] h-4 px-1
                                   flex items-center justify-center rounded-full text-white font-black"
                        style={{ fontSize: 8, background: "#ec4899", boxShadow: "0 0 8px rgba(236,72,153,.6)" }}
                      >
                        {favorites.length > 99 ? "99+" : favorites.length}
                      </motion.span>
                    )}
                  </AnimatePresence>
                </Link>

                {/* Avatar dropdown */}
                <div className="relative" ref={dropRef}>
                  <button
                    onClick={() => setDropOpen((d) => !d)}
                    className="flex items-center gap-2 pl-1 pr-2.5 py-1 rounded-xl
                               transition-all hover:scale-105 active:scale-95"
                    style={{
                      background: dropOpen ? "rgba(99,102,241,.15)"          : "rgba(255,255,255,.06)",
                      border:     dropOpen ? "1px solid rgba(99,102,241,.28)" : "1px solid rgba(255,255,255,.08)",
                    }}
                  >
                    <UserAvatar user={user} size={28} radius={8} />
                    <span
                      className="hidden sm:block text-xs font-semibold max-w-[72px] truncate"
                      style={{ color: "rgba(255,255,255,.75)" }}
                    >
                      {user.username}
                    </span>
                    <motion.div
                      animate={{ rotate: dropOpen ? 180 : 0 }}
                      transition={{ duration: 0.2 }}
                      className="hidden sm:block"
                    >
                      <ChevronDown size={12} style={{ color: "rgba(255,255,255,.38)" }} />
                    </motion.div>
                  </button>

                  <AnimatePresence>
                    {dropOpen && (
                      <motion.div
                        initial={{ opacity: 0, y: -8, scale: 0.95 }}
                        animate={{ opacity: 1, y: 0,  scale: 1    }}
                        exit={{   opacity: 0, y: -8, scale: 0.95  }}
                        transition={{ duration: 0.15, ease: "easeOut" }}
                        className="absolute right-0 mt-2.5 w-56 rounded-2xl overflow-hidden"
                        style={{
                          background:     "rgba(12,12,24,.97)",
                          border:         "1px solid rgba(255,255,255,.10)",
                          boxShadow:      "0 20px 56px rgba(0,0,0,.70),0 4px 16px rgba(99,102,241,.10)",
                          backdropFilter: "blur(24px)",
                        }}
                      >
                        {/* dropdown header */}
                        <div className="px-4 py-3"
                             style={{ borderBottom: "1px solid rgba(255,255,255,.07)" }}>
                          <div className="flex items-center gap-3">
                            <UserAvatar user={user} size={38} radius={10} />
                            <div className="min-w-0">
                              <p className="text-white text-sm font-bold leading-tight truncate">
                                {user.username}
                              </p>
                              <p className="text-xs truncate"
                                 style={{ color: "rgba(148,163,184,.45)" }}>
                                {user.email}
                              </p>
                            </div>
                          </div>
                        </div>

                        {/* links */}
                        <div className="py-1.5">
                          {[
                            { to: "/profile",   icon: <User    size={13} />, label: "Profile"       },
                            { to: "/favorites", icon: <Heart   size={13} />, label: "My Favourites",
                              badge: favorites.length > 0 ? favorites.length : null },
                            { to: "/search",    icon: <Compass size={13} />, label: "Explore"       },
                          ].map(({ to, icon, label, badge }) => (
                            <Link
                              key={to}
                              to={to}
                              onClick={() => setDropOpen(false)}
                              className="flex items-center gap-3 px-4 py-2.5 text-sm transition-all"
                              style={{ color: "rgba(255,255,255,.60)" }}
                              onMouseEnter={e => {
                                e.currentTarget.style.background = "rgba(255,255,255,.06)";
                                e.currentTarget.style.color      = "#fff";
                              }}
                              onMouseLeave={e => {
                                e.currentTarget.style.background = "transparent";
                                e.currentTarget.style.color      = "rgba(255,255,255,.60)";
                              }}
                            >
                              <span style={{ color: "rgba(99,102,241,.75)" }}>{icon}</span>
                              {label}
                              {badge && (
                                <span
                                  className="ml-auto text-[10px] font-black px-1.5 py-0.5 rounded-full"
                                  style={{
                                    background: "rgba(99,102,241,.22)",
                                    color:      "#a5b4fc",
                                    border:     "1px solid rgba(99,102,241,.30)",
                                  }}
                                >
                                  {badge}
                                </span>
                              )}
                            </Link>
                          ))}
                        </div>

                        <div style={{ borderTop: "1px solid rgba(255,255,255,.07)" }} />

                        <div className="py-1.5">
                          <button
                            onClick={handleLogout}
                            className="w-full flex items-center gap-3 px-4 py-2.5 text-sm transition-all"
                            style={{ color: "rgba(248,113,113,.75)" }}
                            onMouseEnter={e => {
                              e.currentTarget.style.background = "rgba(239,68,68,.08)";
                              e.currentTarget.style.color      = "#fca5a5";
                            }}
                            onMouseLeave={e => {
                              e.currentTarget.style.background = "transparent";
                              e.currentTarget.style.color      = "rgba(248,113,113,.75)";
                            }}
                          >
                            <LogOut size={13} /> Sign Out
                          </button>
                        </div>
                      </motion.div>
                    )}
                  </AnimatePresence>
                </div>
              </>
            ) : (
              <div className="hidden sm:flex items-center gap-2 ml-1">
                <Link
                  to="/login"
                  className="px-4 py-2 text-sm font-medium rounded-xl transition-all hover:scale-105"
                  style={{
                    color:      "rgba(255,255,255,.60)",
                    background: "rgba(255,255,255,.06)",
                    border:     "1px solid rgba(255,255,255,.08)",
                  }}
                >
                  Login
                </Link>
                <Link
                  to="/register"
                  className="px-5 py-2 text-sm font-bold text-white rounded-xl
                             transition-all hover:scale-105 active:scale-95"
                  style={{
                    background: "linear-gradient(135deg,#6366f1,#8b5cf6)",
                    boxShadow:  "0 4px 16px rgba(99,102,241,.35)",
                  }}
                >
                  Sign Up
                </Link>
              </div>
            )}

            {/* Mobile hamburger */}
            <button
              onClick={() => setMenuOpen((m) => !m)}
              className="lg:hidden p-2.5 rounded-xl transition-all hover:scale-105 active:scale-95"
              style={{
                background: menuOpen ? "rgba(99,102,241,.18)"          : "rgba(255,255,255,.06)",
                color:      menuOpen ? "#a5b4fc"                        : "rgba(255,255,255,.55)",
                border:     menuOpen ? "1px solid rgba(99,102,241,.28)" : "1px solid rgba(255,255,255,.08)",
              }}
              aria-label="Toggle menu"
            >
              <AnimatePresence mode="wait" initial={false}>
                <motion.div
                  key={menuOpen ? "x" : "menu"}
                  initial={{ rotate: -90, opacity: 0 }}
                  animate={{ rotate: 0,   opacity: 1 }}
                  exit={{   rotate:  90,  opacity: 0 }}
                  transition={{ duration: 0.15 }}
                >
                  {menuOpen ? <X size={17} /> : <Menu size={17} />}
                </motion.div>
              </AnimatePresence>
            </button>
          </div>
        </div>

        {/* ════ SEARCH PANEL ════ */}
        <AnimatePresence>
          {searchOpen && (
            <motion.div
              initial={{ opacity: 0, height: 0 }}
              animate={{ opacity: 1, height: "auto" }}
              exit={{   opacity: 0, height: 0      }}
              transition={{ duration: 0.22, ease: "easeOut" }}
              className="overflow-visible pb-3"
            >
              <div className="pt-2">
                <NavbarSearch onClose={() => setSearchOpen(false)} />
              </div>
            </motion.div>
          )}
        </AnimatePresence>

        {/* ════ MOBILE MENU ════ */}
        <AnimatePresence>
          {menuOpen && (
            <motion.div
              initial={{ opacity: 0, height: 0 }}
              animate={{ opacity: 1, height: "auto" }}
              exit={{   opacity: 0, height: 0      }}
              transition={{ duration: 0.25, ease: "easeOut" }}
              className="lg:hidden overflow-hidden pb-4"
              style={{ borderTop: "1px solid rgba(255,255,255,.07)" }}
            >
              <div className="flex flex-col gap-1 pt-3">

                {/* ── mobile logo (optional, nice touch) ── */}
                <div className="flex items-center justify-center py-1 mb-1">
                  <NavLogo size={26} />
                </div>

                {NAV_LINKS.map(({ to, label, icon }, i) => {
                  const active = isActive(to);
                  return (
                    <motion.div
                      key={to}
                      initial={{ opacity: 0, x: -12 }}
                      animate={{ opacity: 1, x: 0   }}
                      transition={{ delay: i * 0.04  }}
                    >
                      <Link
                        to={to}
                        className="flex items-center gap-3 px-4 py-3 rounded-xl text-sm
                                   font-medium transition-all"
                        style={{
                          background: active ? "rgba(99,102,241,.15)"          : "transparent",
                          color:      active ? "#a5b4fc"                        : "rgba(255,255,255,.55)",
                          border:     active ? "1px solid rgba(99,102,241,.22)" : "1px solid transparent",
                        }}
                      >
                        <span style={{ color: active ? "#a5b4fc" : "rgba(148,163,184,.40)" }}>
                          {icon}
                        </span>
                        {label}
                        {active && (
                          <span
                            className="ml-auto w-1.5 h-1.5 rounded-full"
                            style={{ background: "#a5b4fc", boxShadow: "0 0 6px #a5b4fc" }}
                          />
                        )}
                      </Link>
                    </motion.div>
                  );
                })}

                {!user && (
                  <motion.div
                    initial={{ opacity: 0 }} animate={{ opacity: 1 }}
                    transition={{ delay: NAV_LINKS.length * 0.04 }}
                    className="flex gap-2 mt-2 pt-3"
                    style={{ borderTop: "1px solid rgba(255,255,255,.07)" }}
                  >
                    <Link to="/login"
                      className="flex-1 py-2.5 text-sm text-center font-medium rounded-xl
                                 transition-all hover:scale-105"
                      style={{
                        color:      "rgba(255,255,255,.65)",
                        background: "rgba(255,255,255,.06)",
                        border:     "1px solid rgba(255,255,255,.10)",
                      }}>
                      Login
                    </Link>
                    <Link to="/register"
                      className="flex-1 py-2.5 text-sm text-center font-bold text-white
                                 rounded-xl transition-all hover:scale-105"
                      style={{ background: "linear-gradient(135deg,#6366f1,#8b5cf6)" }}>
                      Sign Up
                    </Link>
                  </motion.div>
                )}

                {user && (
                  <motion.div
                    initial={{ opacity: 0 }} animate={{ opacity: 1 }}
                    transition={{ delay: NAV_LINKS.length * 0.04 + 0.05 }}
                    className="mt-2 pt-3 flex items-center justify-between"
                    style={{ borderTop: "1px solid rgba(255,255,255,.07)" }}
                  >
                    <div className="flex items-center gap-3">
                      <UserAvatar user={user} size={36} radius={10} />
                      <div>
                        <p className="text-white text-sm font-bold leading-tight">
                          {user.username}
                        </p>
                        <p className="text-[10px] truncate max-w-[140px]"
                           style={{ color: "rgba(148,163,184,.42)" }}>
                          {user.email}
                        </p>
                      </div>
                    </div>
                    <button
                      onClick={handleLogout}
                      className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl
                                 text-xs font-semibold transition-all hover:scale-105"
                      style={{
                        background: "rgba(239,68,68,.10)",
                        color:      "#fca5a5",
                        border:     "1px solid rgba(239,68,68,.20)",
                      }}
                    >
                      <LogOut size={11} /> Sign Out
                    </button>
                  </motion.div>
                )}
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </nav>
  );
};

export default Navbar;