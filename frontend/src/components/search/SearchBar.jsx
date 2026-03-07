// SearchBar.jsx
import { useState, useEffect, useRef, useCallback } from "react";
import { useNavigate } from "react-router-dom";
import { motion, AnimatePresence } from "framer-motion";
import { Search, X, ArrowRight } from "lucide-react";
import { useDebounce } from "../../hooks/useDebounce";
import { animeService } from "../../services/animeService";
import SearchSuggestions from "./SearchSuggestions";

const SearchBar = ({ autoFocus = false, onSearch, placeholder, className = "" }) => {
  const [query,              setQuery]              = useState("");
  const [suggestions,        setSuggestions]        = useState([]);
  const [showSuggestions,    setShowSuggestions]    = useState(false);
  const [loadingSuggestions, setLoadingSuggestions] = useState(false);
  const [isFocused,          setIsFocused]          = useState(false);
  const [selectedIndex,      setSelectedIndex]      = useState(-1);  // keyboard nav

  const debouncedQuery = useDebounce(query, 380);
  const navigate       = useNavigate();
  const inputRef       = useRef(null);
  const containerRef   = useRef(null);
  const abortRef       = useRef(null);   // cancel stale requests

  /* ── auto-focus ── */
  useEffect(() => {
    if (autoFocus) {
      const t = setTimeout(() => inputRef.current?.focus(), 60);
      return () => clearTimeout(t);
    }
  }, [autoFocus]);

  /* ── fetch suggestions ── */
  const fetchSuggestions = useCallback(async (q) => {
    /* cancel previous */
    abortRef.current?.abort();
    const controller  = new AbortController();
    abortRef.current  = controller;

    if (q.trim().length < 2) {
      setSuggestions([]);
      setShowSuggestions(false);
      setLoadingSuggestions(false);
      return;
    }

    setLoadingSuggestions(true);
    try {
      const data = await animeService.getSearchSuggestions(q);
      if (controller.signal.aborted) return;
      const items = data?.data ?? [];
      setSuggestions(items);
      setShowSuggestions(items.length > 0 || true); // show "no results" too
      setSelectedIndex(-1);
    } catch (err) {
      if (err?.cancelled || controller.signal.aborted) return;
      setSuggestions([]);
    } finally {
      if (!controller.signal.aborted) setLoadingSuggestions(false);
    }
  }, []);

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

  /* ── keyboard navigation ── */
  const handleKeyDown = (e) => {
    if (!showSuggestions || suggestions.length === 0) return;

    if (e.key === "ArrowDown") {
      e.preventDefault();
      setSelectedIndex(i => Math.min(i + 1, suggestions.length - 1));
    } else if (e.key === "ArrowUp") {
      e.preventDefault();
      setSelectedIndex(i => Math.max(i - 1, -1));
    } else if (e.key === "Escape") {
      setShowSuggestions(false);
      setSelectedIndex(-1);
      inputRef.current?.blur();
    } else if (e.key === "Enter" && selectedIndex >= 0) {
      e.preventDefault();
      handleSuggestionClick(suggestions[selectedIndex]);
    }
  };

  /* ── submit (navigate to search page) ── */
  const handleSearch = (e) => {
    e?.preventDefault();
    const q = query.trim();
    if (!q) return;
    setShowSuggestions(false);
    setSelectedIndex(-1);
    navigate(`/search?q=${encodeURIComponent(q)}`);
    onSearch?.();
  };

  /* ── suggestion click (navigate to detail page) ── */
  const handleSuggestionClick = (anime) => {
    setQuery("");
    setSuggestions([]);
    setShowSuggestions(false);
    setSelectedIndex(-1);
    navigate(`/anime/${anime.mal_id}`);
    onSearch?.();
  };

  /* ── clear ── */
  const handleClear = () => {
    setQuery("");
    setSuggestions([]);
    setShowSuggestions(false);
    setSelectedIndex(-1);
    abortRef.current?.abort();
    inputRef.current?.focus();
  };

  const isOpen = showSuggestions && query.trim().length >= 2;

  return (
    <div ref={containerRef} className={`relative w-full ${className}`}>
      <form onSubmit={handleSearch} className="relative" autoComplete="off">

        {/* search icon */}
        <div
          className="absolute left-3.5 top-1/2 -translate-y-1/2 pointer-events-none
                     flex items-center justify-center transition-all duration-200"
        >
          <Search
            size={16}
            style={{
              color: isFocused
                ? "rgba(99,102,241,.85)"
                : "rgba(148,163,184,.45)",
              transition: "color .2s",
            }}
          />
        </div>

        {/* input */}
        <input
          ref={inputRef}
          type="text"
          value={query}
          onChange={e => setQuery(e.target.value)}
          onFocus={() => {
            setIsFocused(true);
            if (query.trim().length >= 2) setShowSuggestions(true);
          }}
          onBlur={() => setIsFocused(false)}
          onKeyDown={handleKeyDown}
          placeholder={placeholder ?? "Search anime by title…"}
          className="w-full text-sm text-white outline-none"
          style={{
            background:    "rgba(255,255,255,.05)",
            border:        isFocused
              ? "1px solid rgba(99,102,241,.50)"
              : "1px solid rgba(255,255,255,.09)",
            borderRadius:  isOpen ? "16px 16px 0 0" : 16,
            padding:       "11px 40px 11px 40px",
            boxShadow:     isFocused
              ? "0 0 0 3px rgba(99,102,241,.10), 0 4px 24px rgba(0,0,0,.30)"
              : "0 2px 12px rgba(0,0,0,.20)",
            transition:    "border-color .2s, box-shadow .2s, border-radius .15s",
            caretColor:    "#a5b4fc",
          }}
        />

        {/* loading spinner OR clear button */}
        <div className="absolute right-3 top-1/2 -translate-y-1/2 flex items-center gap-1.5">
          <AnimatePresence mode="wait">
            {loadingSuggestions ? (
              <motion.div
                key="spinner"
                initial={{ opacity: 0, scale: 0.7 }}
                animate={{ opacity: 1, scale: 1 }}
                exit={{ opacity: 0, scale: 0.7 }}
                className="w-4 h-4 rounded-full border-2 border-transparent"
                style={{
                  borderTopColor: "#a5b4fc",
                  animation: "spin 0.7s linear infinite",
                }}
              />
            ) : query ? (
              <motion.button
                key="clear"
                type="button"
                initial={{ opacity: 0, scale: 0.7 }}
                animate={{ opacity: 1, scale: 1 }}
                exit={{ opacity: 0, scale: 0.7 }}
                onClick={handleClear}
                className="w-5 h-5 rounded-full flex items-center justify-center
                           transition-all hover:scale-110 active:scale-90"
                style={{
                  background: "rgba(255,255,255,.12)",
                  border: "1px solid rgba(255,255,255,.10)",
                }}
              >
                <X size={10} style={{ color: "rgba(255,255,255,.70)" }} />
              </motion.button>
            ) : null}
          </AnimatePresence>

          {/* submit arrow (visible on focus) */}
          <AnimatePresence>
            {query.trim() && (
              <motion.button
                type="submit"
                initial={{ opacity: 0, x: 6 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: 6 }}
                className="w-6 h-6 rounded-lg flex items-center justify-center
                           transition-all hover:scale-110 active:scale-90"
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

      {/* suggestions dropdown */}
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

      {/* spin keyframe */}
      <style>{`@keyframes spin { to { transform: rotate(360deg); } }`}</style>
    </div>
  );
};

export default SearchBar;