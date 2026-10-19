import { useState } from "react";
import { SlidersHorizontal, ChevronDown, RotateCcw } from "lucide-react";

const GROUPS = [
  {
    key: "type",
    label: "Type",
    options: ["TV", "Movie", "OVA", "ONA", "Special"].map((t) => ({ label: t, value: t })),
  },
  {
    key: "status",
    label: "Status",
    options: [
      { label: "Airing", value: "airing" },
      { label: "Completed", value: "complete" },
      { label: "Upcoming", value: "upcoming" },
    ],
  },
  {
    key: "rating",
    label: "Age rating",
    options: [
      { label: "G", value: "g" },
      { label: "PG", value: "pg" },
      { label: "PG-13", value: "pg13" },
      { label: "R-17+", value: "r17" },
    ],
  },
  {
    key: "order_by",
    label: "Sort by",
    options: [
      { label: "Score", value: "score" },
      { label: "Popularity", value: "popularity" },
      { label: "Rank", value: "rank" },
      { label: "Title", value: "title" },
    ],
  },
];

/**
 * Props
 *  - filters     current filter object
 *  - onChange    called with the next filter object
 *  - horizontal  lay groups out in a row on large screens (for a full-width bar)
 */
const SearchFilters = ({ filters = {}, onChange, horizontal = false }) => {
  const [open, setOpen] = useState(false); // mobile collapse only

  const activeCount = GROUPS.filter((g) => filters[g.key]).length;

  const toggle = (key, value) =>
    onChange({ ...filters, [key]: filters[key] === value ? "" : value });

  const clearAll = () =>
    onChange({ ...filters, ...Object.fromEntries(GROUPS.map((g) => [g.key, ""])) });

  return (
    <div
      className="w-full rounded-2xl"
      style={{ background: "rgba(255,255,255,.035)", border: "1px solid rgba(255,255,255,.08)" }}
    >
      {/* header */}
      <div className="flex items-center justify-between gap-3 px-4 sm:px-5 py-3.5">
        <button
          type="button"
          onClick={() => setOpen((o) => !o)}
          aria-expanded={open}
          className="flex items-center gap-2.5 min-w-0 lg:cursor-default"
        >
          <SlidersHorizontal size={16} className="text-indigo-400 flex-shrink-0" />
          <h3 className="text-white font-semibold text-sm">Filters</h3>
          {activeCount > 0 && (
            <span
              className="text-[10px] font-bold px-2 py-0.5 rounded-full"
              style={{ background: "rgba(99,102,241,.22)", color: "#c7d2fe" }}
            >
              {activeCount}
            </span>
          )}
          <ChevronDown
            size={15}
            className={`text-slate-500 transition-transform lg:hidden ${open ? "rotate-180" : ""}`}
          />
        </button>

        {activeCount > 0 && (
          <button
            type="button"
            onClick={clearAll}
            className="flex items-center gap-1.5 text-xs font-medium text-slate-400 hover:text-white transition-colors"
          >
            <RotateCcw size={12} /> Clear all
          </button>
        )}
      </div>

      {/* body */}
      <div
        className={`${open ? "block" : "hidden"} lg:block px-4 sm:px-5 pb-5 pt-1 border-t border-white/[0.06]`}
      >
        <div
          className={`grid gap-5 pt-4 grid-cols-1 sm:grid-cols-2 ${
            horizontal ? "lg:grid-cols-4" : "lg:grid-cols-1"
          }`}
        >
          {GROUPS.map((group) => (
            <fieldset key={group.key} className="min-w-0">
              <legend className="text-slate-500 text-[11px] uppercase tracking-[.14em] font-semibold mb-2.5">
                {group.label}
              </legend>
              <div className="flex flex-wrap gap-2">
                {group.options.map((opt) => {
                  const active = filters[group.key] === opt.value;
                  return (
                    <button
                      key={opt.value}
                      type="button"
                      aria-pressed={active}
                      onClick={() => toggle(group.key, opt.value)}
                      className={`px-3 py-1.5 text-xs font-medium rounded-lg border transition-all active:scale-95 ${
                        active
                          ? "bg-indigo-500/20 border-indigo-400/50 text-indigo-200 shadow-[0_0_0_1px_rgba(129,140,248,.15)]"
                          : "bg-white/[0.03] border-white/10 text-slate-400 hover:border-indigo-400/40 hover:text-white"
                      }`}
                    >
                      {opt.label}
                    </button>
                  );
                })}
              </div>
            </fieldset>
          ))}
        </div>
      </div>
    </div>
  );
};

export default SearchFilters;