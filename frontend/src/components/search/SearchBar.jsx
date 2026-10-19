// SearchBar.jsx
import { useState, useEffect, useRef, useCallback } from "react";
import { useNavigate } from "react-router-dom";
import { motion, AnimatePresence } from "framer-motion";
import { Search, X, ArrowRight } from "lucide-react";
import { useDebounce } from "../../hooks/useDebounce";
import { animeService } from "../../services/animeService";
import SearchSuggestions from "./SearchSuggestions";

/**
 * Props
 *  - autoFocus   focus the input on mount
 *  - onSearch    called after navigating (e.g. to close a mobile drawer)
 *  - placeholder input placeholder
 *  - className   extra wrapper classes
 *  - hotkey      press "/" anywhere to focus (enable on ONE instance only)
 */
const SearchBar = ({
  autoFocus = false,
  onSearch,
  placeholder,
  className = "",
  hotkey = false,
}) => {
  const [query, setQuery] = useState("");
  const [suggestions, setSuggestions] = useState([]);
  const [showSuggestions, setShowSuggestions] = useState(false);
  const [loadingSuggestions, setLoadingSuggestions] = useState(false);
  const [isFocused, setIsFocused] = useState(false);
  const [selectedIndex, setSelectedIndex] = useState(-1);

  const debouncedQuery = useDebounce(query, 380);
  const navigate = useNavigate();
  const inputRef = useRef(null);
  const containerRef = useRef(null);
  const abortRef = useRef(null);

  /* ── reset helper ── */
  const resetDropdown = useCallback(() => {
    setSuggestions([]);
    setShowSuggestions(false);
    setSelectedIndex(-1);
    setLoadingSuggestions(false);
  }, []);

  /* ── auto-focus ── */
  useEffect(() => {
    if (!autoFocus) return;
    const t = setTimeout(() => inputRef.current?.focus(), 60);
    return () => clearTimeout(t);
  }, [autoFocus]);

  /* ── "/" hotkey ── */
  useEffect(() => {
    if (!hotkey) return;
    const onKey = (e) => {
      const tag = e.target?.tagName;
      const typing = tag === "INPUT" || tag === "TEXTAREA" || e.target?.isContentEditable;
      if (e.key === "/" && !typing && !e.metaKey && !e.ctrlKey && !e.altKey) {
        e.preventDefault();
        inputRef.current?.focus();
      }
    };
    document.addEventListener("keydown", onKey);
    return () => document.removeEventListener("keydown", onKey);
  }, [hotkey]);

  /* ── fetch suggestions ── */
  const fetchSuggestions = useCallback(
    async (q) => {
      abortRef.current?.abort();
      const controller = new AbortController();
      abortRef.current = controller;

      if (q.trim().length < 2) {
        resetDropdown();
        return;
      }

      setLoadingSuggestions(true);
      try {
        const data = await animeService.getSearchSuggestions(q);
        if (controller.signal.aborted) return;
        setSuggestions(data?.data ?? []);
        setShowSuggestions(true); // also shows the "no results" state
        setSelectedIndex(-1);
      } catch (err) {
        if (err?.cancelled || controller.signal.aborted) return;
        setSuggestions([]);
      } finally {
        if (!controller.signal.aborted) setLoadingSuggestions(false);
      }
    },
    [resetDropdown]
  );

  useEffect(() => {
    fetchSuggestions(debouncedQuery);
  }, [debouncedQuery, fetchSuggestions]);

  /* ── close on outside click ── */
  useEffect(() => {
    const handler = (e) => {
      if (!containerRef.current?.contains(e.target)) {
        setShowSuggestions(false);
        setSelectedIndex(-1);
      }
    };
    document.addEventListener("mousedown", handler);
    return () => document.removeEventListener("mousedown", handler);
  }, []);

  /* ── actions ── */
  const handleSuggestionClick = (anime) => {
    setQuery("");
    resetDropdown();
    navigate(`/anime/${anime.mal_id}`);
    onSearch?.();
  };

  const handleSearch = (e) => {
    e?.preventDefault();
    const q = query.trim();
    if (!q) return;
    abortRef.current?.abort();
    resetDropdown();
    navigate(`/search?q=${encodeURIComponent(q)}`);
    onSearch?.();
  };

  const handleClear = () => {
    setQuery("");
    abortRef.current?.abort();
    resetDropdown();
    inputRef.current?.focus();
  };

  /* ── keyboard navigation ── */
  const handleKeyDown = (e) => {
    if (e.key === "Escape") {
      setShowSuggestions(false);
      setSelectedIndex(-1);
      inputRef.current?.blur();
      return;
    }
    if (!showSuggestions || suggestions.length === 0) return;

    if (e.key === "ArrowDown") {
      e.preventDefault();
      setSelectedIndex((i) => Math.min(i + 1, suggestions.length - 1));
    } else if (e.key === "ArrowUp") {
      e.preventDefault();
      setSelectedIndex((i) => Math.max(i - 1, -1));
    } else if (e.key === "Enter" && selectedIndex >= 0) {
      e.preventDefault();
      handleSuggestionClick(suggestions[selectedIndex]);
    }
  };

  const isOpen = showSuggestions && query.trim().length >= 2;

  return (
    <div ref={containerRef} className={`relative w-full ${className}`}>
      <form onSubmit={handleSearch} className="relative" autoComplete="off" role="search">
        {/* search icon */}
        <div className="absolute left-3.5 top-1/2 -translate-y-1/2 pointer-events-none flex items-center">
          <Search
            size={16}
            style={{
              color: isFocused ? "rgba(129,140,248,.9)" : "rgba(148,163,184,.45)",
              transition: "color .2s",
            }}
          />
        </div>

        {/* input */}
        <input
          ref={inputRef}
          type="text"
          role="combobox"
          aria-expanded={isOpen}
          aria-autocomplete="list"
          aria-label="Search anime"
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          onFocus={() => {
            setIsFocused(true);
            if (query.trim().length >= 2 && suggestions.length > 0) setShowSuggestions(true);
          }}
          onBlur={() => setIsFocused(false)}
          onKeyDown={handleKeyDown}
          placeholder={placeholder ?? "Search anime by title…"}
          className="w-full text-sm text-white outline-none placeholder:text-slate-500"
          style={{
            background: "rgba(255,255,255,.05)",
            border: isFocused ? "1px solid rgba(99,102,241,.55)" : "1px solid rgba(255,255,255,.09)",
            borderRadius: isOpen ? "16px 16px 0 0" : 16,
            padding: "12px 76px 12px 42px",
            boxShadow: isFocused
              ? "0 0 0 3px rgba(99,102,241,.12), 0 4px 24px rgba(0,0,0,.30)"
              : "0 2px 12px rgba(0,0,0,.20)",
            transition: "border-color .2s, box-shadow .2s, border-radius .15s",
            caretColor: "#a5b4fc",
          }}
        />

        {/* right controls */}
        <div className="absolute right-3 top-1/2 -translate-y-1/2 flex items-center gap-1.5">
          {/* hotkey hint */}
          {hotkey && !query && !isFocused && (
            <kbd
              className="hidden sm:inline-flex items-center justify-center w-5 h-5 rounded-md text-[10px] font-semibold"
              style={{
                background: "rgba(255,255,255,.07)",
                border: "1px solid rgba(255,255,255,.10)",
                color: "rgba(148,163,184,.65)",
              }}
            >
              /
            </kbd>
          )}

          <AnimatePresence mode="wait">
            {loadingSuggestions ? (
              <motion.div
                key="spinner"
                initial={{ opacity: 0, scale: 0.7 }}
                animate={{ opacity: 1, scale: 1 }}
                exit={{ opacity: 0, scale: 0.7 }}
                className="w-4 h-4 rounded-full border-2 border-transparent animate-spin"
                style={{ borderTopColor: "#a5b4fc" }}
              />
            ) : query ? (
              <motion.button
                key="clear"
                type="button"
                aria-label="Clear search"
                initial={{ opacity: 0, scale: 0.7 }}
                animate={{ opacity: 1, scale: 1 }}
                exit={{ opacity: 0, scale: 0.7 }}
                onClick={handleClear}
                className="w-5 h-5 rounded-full flex items-center justify-center transition-all hover:scale-110 active:scale-90"
                style={{
                  background: "rgba(255,255,255,.12)",
                  border: "1px solid rgba(255,255,255,.10)",
                }}
              >
                <X size={10} style={{ color: "rgba(255,255,255,.75)" }} />
              </motion.button>
            ) : null}
          </AnimatePresence>

          <AnimatePresence>
            {query.trim() && (
              <motion.button
                type="submit"
                aria-label="Search"
                initial={{ opacity: 0, x: 6 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: 6 }}
                className="w-6 h-6 rounded-lg flex items-center justify-center transition-all hover:scale-110 active:scale-90"
                style={{
                  background: "rgba(99,102,241,.30)",
                  border: "1px solid rgba(99,102,241,.40)",
                }}
              >
                <ArrowRight size={11} style={{ color: "#a5b4fc" }} />
              </motion.button>
            )}
          </AnimatePresence>
        </div>
      </form>

      <SearchSuggestions
        suggestions={suggestions}
        loading={loadingSuggestions}
        visible={isOpen}
        onSelect={handleSuggestionClick}
        onSearchAll={handleSearch}
        query={query}
        selectedIndex={selectedIndex}
        onHoverIndex={setSelectedIndex}
      />
    </div>
  );
};

export default SearchBar;