import { motion } from "framer-motion";
import {
  Tv, PlayCircle, Calendar, Clock, ChevronRight, Film,
} from "lucide-react";

const EpisodeInfo = ({ anime }) => {
  if (!anime) return null;

  const hasSeasonData = anime.season || anime.year;
  const hasAiredData = anime.aired?.from || anime.aired?.to;

  const formatDate = (dateStr) => {
    if (!dateStr) return "Unknown";
    try {
      return new Date(dateStr).toLocaleDateString("en-US", {
        year: "numeric",
        month: "long",
        day: "numeric",
      });
    } catch {
      return "Unknown";
    }
  };

  const getEpisodeProgress = () => {
    if (!anime.episodes) return null;
    // For currently airing, estimate from aired info
    if (anime.status === "Currently Airing") {
      return { current: "Ongoing", total: anime.episodes };
    }
    return { current: anime.episodes, total: anime.episodes };
  };

  const progress = getEpisodeProgress();

  const cards = [
    {
      icon: <Film size={18} className="text-indigo-400" />,
      label: "Total Episodes",
      value: anime.episodes ? `${anime.episodes} Episodes` : "Unknown",
      sub: anime.type === "Movie" ? "Feature Film" : anime.type,
    },
    {
      icon: <Tv size={18} className="text-purple-400" />,
      label: "Season",
      value:
        anime.season
          ? `${anime.season.charAt(0).toUpperCase() + anime.season.slice(1)} ${anime.year || ""}`
          : anime.year
          ? String(anime.year)
          : "Unknown",
      sub: hasSeasonData ? "Original Air Season" : "Season data unavailable",
    },
    {
      icon: <Clock size={18} className="text-cyan-400" />,
      label: "Episode Duration",
      value: anime.duration || "Unknown",
      sub: "Per episode",
    },
    {
      icon: <PlayCircle size={18} className="text-green-400" />,
      label: "Broadcast",
      value: anime.broadcast?.string || "Unknown",
      sub: anime.broadcast?.timezone || "",
    },
  ];

  return (
    <div className="bg-[#1a1a2e] border border-white/5 rounded-2xl p-5 space-y-5">
      {/* Section Header */}
      <h3 className="text-white font-semibold flex items-center gap-2">
        <Tv size={16} className="text-indigo-400" />
        Episodes & Seasons
      </h3>

      {/* Episode Cards Grid */}
      <div className="grid grid-cols-2 gap-3">
        {cards.map(({ icon, label, value, sub }, i) => (
          <motion.div
            key={label}
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: i * 0.07 }}
            className="bg-[#0f0f1a] border border-white/5 rounded-xl p-3.5"
          >
            <div className="flex items-center gap-2 mb-2">
              {icon}
              <span className="text-slate-400 text-xs">{label}</span>
            </div>
            <p className="text-white font-semibold text-sm leading-tight">{value}</p>
            {sub && (
              <p className="text-slate-500 text-xs mt-0.5 truncate">{sub}</p>
            )}
          </motion.div>
        ))}
      </div>

      {/* Airing Dates */}
      {hasAiredData && (
        <div className="bg-[#0f0f1a] border border-white/5 rounded-xl p-4">
          <p className="text-slate-400 text-xs uppercase tracking-wider mb-3 flex items-center gap-2">
            <Calendar size={13} />
            Airing Period
          </p>
          <div className="flex items-center gap-3">
            <div className="flex-1">
              <p className="text-slate-500 text-xs mb-0.5">Started</p>
              <p className="text-white text-sm font-medium">
                {formatDate(anime.aired?.from)}
              </p>
            </div>
            <ChevronRight size={16} className="text-slate-600 flex-shrink-0" />
            <div className="flex-1 text-right">
              <p className="text-slate-500 text-xs mb-0.5">Ended</p>
              <p
                className={`text-sm font-medium ${
                  anime.status === "Currently Airing"
                    ? "text-green-400"
                    : "text-white"
                }`}
              >
                {anime.status === "Currently Airing"
                  ? "Ongoing"
                  : formatDate(anime.aired?.to)}
              </p>
            </div>
          </div>

          {/* Airing bar visual for currently airing */}
          {anime.status === "Currently Airing" && (
            <div className="mt-3">
              <div className="flex items-center justify-between text-xs text-slate-500 mb-1">
                <span>Currently Airing</span>
              </div>
              <div className="h-1.5 bg-white/5 rounded-full overflow-hidden">
                <motion.div
                  className="h-full bg-green-500 rounded-full"
                  initial={{ width: "0%" }}
                  animate={{ width: "60%" }}
                  transition={{ duration: 1.2, ease: "easeOut", delay: 0.3 }}
                />
              </div>
            </div>
          )}
        </div>
      )}

      {/* Related Anime (if available) */}
      {anime.relations?.length > 0 && (
        <div>
          <p className="text-slate-400 text-xs uppercase tracking-wider mb-3">
            Related
          </p>
          <div className="space-y-2">
            {anime.relations.slice(0, 4).map((rel) => (
              <div
                key={rel.relation}
                className="flex items-start gap-2 bg-[#0f0f1a] border border-white/5 rounded-xl p-3"
              >
                <span className="text-xs text-indigo-400 font-medium bg-indigo-500/10 border border-indigo-500/20 rounded-md px-2 py-0.5 flex-shrink-0 mt-0.5">
                  {rel.relation}
                </span>
                <div className="flex flex-wrap gap-1">
                  {rel.entry?.slice(0, 2).map((entry) => (
                    <span key={entry.mal_id} className="text-slate-300 text-xs">
                      {entry.name}
                      {entry.type === "anime" && " (Anime)"}
                    </span>
                  ))}
                </div>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
};

export default EpisodeInfo;