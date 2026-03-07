import { Filter, SlidersHorizontal } from "lucide-react";

const TYPES = ["TV", "Movie", "OVA", "ONA", "Special"];
const STATUSES = ["airing", "complete", "upcoming"];
const RATINGS = ["g", "pg", "pg13", "r17"];
const SORT_OPTIONS = [
  { label: "Score", value: "score" },
  { label: "Popularity", value: "popularity" },
  { label: "Rank", value: "rank" },
  { label: "Title", value: "title" },
];

const SearchFilters = ({ filters, onChange }) => {
  const handle = (key, value) => {
    onChange({ ...filters, [key]: filters[key] === value ? "" : value });
  };

  return (
    <div className="bg-[#1a1a2e] border border-white/10 rounded-2xl p-5">
      <div className="flex items-center gap-2 mb-5">
        <SlidersHorizontal size={18} className="text-indigo-400" />
        <h3 className="text-white font-semibold">Filters</h3>
      </div>

      {/* Type */}
      <div className="mb-5">
        <p className="text-slate-400 text-xs uppercase tracking-wider mb-2">Type</p>
        <div className="flex flex-wrap gap-2">
          {TYPES.map((t) => (
            <button
              key={t}
              onClick={() => handle("type", t)}
              className={`px-3 py-1.5 text-xs rounded-lg border transition-colors ${
                filters.type === t
                  ? "bg-indigo-600 border-indigo-600 text-white"
                  : "border-white/10 text-slate-400 hover:border-indigo-500/40 hover:text-white"
              }`}
            >
              {t}
            </button>
          ))}
        </div>
      </div>

      {/* Status */}
      <div className="mb-5">
        <p className="text-slate-400 text-xs uppercase tracking-wider mb-2">Status</p>
        <div className="flex flex-wrap gap-2">
          {STATUSES.map((s) => (
            <button
              key={s}
              onClick={() => handle("status", s)}
              className={`px-3 py-1.5 text-xs rounded-lg border capitalize transition-colors ${
                filters.status === s
                  ? "bg-indigo-600 border-indigo-600 text-white"
                  : "border-white/10 text-slate-400 hover:border-indigo-500/40 hover:text-white"
              }`}
            >
              {s}
            </button>
          ))}
        </div>
      </div>

      {/* Sort */}
      <div>
        <p className="text-slate-400 text-xs uppercase tracking-wider mb-2">Sort By</p>
        <div className="flex flex-wrap gap-2">
          {SORT_OPTIONS.map((opt) => (
            <button
              key={opt.value}
              onClick={() => handle("order_by", opt.value)}
              className={`px-3 py-1.5 text-xs rounded-lg border transition-colors ${
                filters.order_by === opt.value
                  ? "bg-indigo-600 border-indigo-600 text-white"
                  : "border-white/10 text-slate-400 hover:border-indigo-500/40 hover:text-white"
              }`}
            >
              {opt.label}
            </button>
          ))}
        </div>
      </div>
    </div>
  );
};

export default SearchFilters;