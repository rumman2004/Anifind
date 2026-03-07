import { useState } from "react";
import { motion } from "framer-motion";
import { Link } from "react-router-dom";
import {
  Star, Heart, Play, ExternalLink, Calendar, Clock,
  Tv, Users, Award, BookOpen, Globe, ChevronDown, ChevronUp,
} from "lucide-react";
import { useAuth } from "../../context/AuthContext";
import { useFavorites } from "../../context/FavoritesContext";
import { getAudioLanguages, formatScore, getStatusColor, truncateText } from "../../utils/helpers";
import Badge from "../ui/Badge";
import Button from "../ui/Button";
import AudioBadge from "./AudioBadge";
import EpisodeInfo from "./EpisodeInfo";
import TrailerModal from "./TrailerModal";

const AnimeDetailCard = ({ anime }) => {
  const { user } = useAuth();
  const { isFavorite, addFavorite, removeFavorite } = useFavorites();
  const [favLoading, setFavLoading] = useState(false);
  const [showTrailer, setShowTrailer] = useState(false);
  const [synopsisExpanded, setSynopsisExpanded] = useState(false);
  const [imgError, setImgError] = useState(false);

  const favorited = isFavorite(anime.mal_id);
  const audioLangs = getAudioLanguages(anime);

  const handleFavorite = async () => {
    if (!user) return;
    setFavLoading(true);
    try {
      favorited ? await removeFavorite(anime.mal_id) : await addFavorite(anime);
    } finally {
      setFavLoading(false);
    }
  };

  const synopsis = anime.synopsis || "No synopsis available for this anime.";
  const shouldTruncate = synopsis.length > 300;

  const metaItems = [
    {
      icon: <Tv size={15} />,
      label: "Type",
      value: anime.type,
    },
    {
      icon: <Calendar size={15} />,
      label: "Year",
      value: anime.year || "Unknown",
    },
    {
      icon: <Award size={15} />,
      label: "Rank",
      value: anime.rank ? `#${anime.rank}` : "N/A",
    },
    {
      icon: <Users size={15} />,
      label: "Members",
      value: anime.members ? anime.members.toLocaleString() : "N/A",
    },
    {
      icon: <Globe size={15} />,
      label: "Rating",
      value: anime.rating || "N/A",
    },
    {
      icon: <BookOpen size={15} />,
      label: "Source",
      value: anime.source || "N/A",
    },
    {
      icon: <Clock size={15} />,
      label: "Duration",
      value: anime.duration || "N/A",
    },
    {
      icon: <Calendar size={15} />,
      label: "Season",
      value:
        anime.season && anime.year
          ? `${anime.season.charAt(0).toUpperCase() + anime.season.slice(1)} ${anime.year}`
          : "N/A",
    },
  ];

  return (
    <>
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Left Column — Poster & Quick Info */}
        <div className="lg:col-span-1 space-y-5">
          {/* Poster */}
          <motion.div
            initial={{ opacity: 0, scale: 0.97 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ duration: 0.4 }}
            className="relative rounded-2xl overflow-hidden shadow-2xl border border-white/10 group"
          >
            {!imgError ? (
              <img
                src={
                  anime.images?.jpg?.large_image_url ||
                  anime.images?.jpg?.image_url
                }
                alt={anime.title}
                className="w-full object-cover"
                onError={() => setImgError(true)}
              />
            ) : (
              <div className="w-full aspect-[2/3] bg-[#1a1a2e] flex flex-col items-center justify-center gap-3">
                <Tv size={48} className="text-slate-600" />
                <p className="text-slate-500 text-sm">No image available</p>
              </div>
            )}

            {/* Score overlay */}
            <div className="absolute top-3 left-3 flex items-center gap-1.5 bg-black/80 backdrop-blur-sm rounded-full px-3 py-1.5">
              <Star size={13} className="text-yellow-400 fill-yellow-400" />
              <span className="text-white text-sm font-bold">
                {formatScore(anime.score)}
              </span>
              <span className="text-slate-400 text-xs">/ 10</span>
            </div>

            {/* Favorite button overlay */}
            {user && (
              <button
                onClick={handleFavorite}
                disabled={favLoading}
                className={`absolute top-3 right-3 p-2.5 rounded-full backdrop-blur-sm transition-all ${
                  favorited
                    ? "bg-pink-600/90 text-white"
                    : "bg-black/70 text-slate-300 hover:bg-pink-600/80 hover:text-white"
                }`}
              >
                <Heart size={16} className={favorited ? "fill-white" : ""} />
              </button>
            )}
          </motion.div>

          {/* Audio Badges */}
          <div className="bg-[#1a1a2e] border border-white/5 rounded-2xl p-4">
            <p className="text-slate-400 text-xs uppercase tracking-wider mb-3 flex items-center gap-2">
              🎧 Audio Available
            </p>
            <div className="flex flex-wrap gap-2">
              {audioLangs.map((lang) => (
                <AudioBadge key={lang} language={lang} />
              ))}
            </div>
          </div>

          {/* Meta Info Grid */}
          <div className="bg-[#1a1a2e] border border-white/5 rounded-2xl p-4 space-y-3">
            {metaItems.map(({ icon, label, value }) => (
              <div
                key={label}
                className="flex items-center justify-between text-sm"
              >
                <div className="flex items-center gap-2 text-slate-400">
                  {icon}
                  <span>{label}</span>
                </div>
                <span className="text-slate-200 font-medium text-right max-w-[55%] truncate">
                  {value}
                </span>
              </div>
            ))}
          </div>

          {/* External Links */}
          {anime.url && (
            <a
              href={anime.url}
              target="_blank"
              rel="noreferrer"
              className="flex items-center justify-center gap-2 w-full py-2.5 bg-[#1a1a2e] border border-white/10 hover:border-indigo-500/50 rounded-xl text-sm text-slate-300 hover:text-white transition-colors"
            >
              <ExternalLink size={14} />
              View on MyAnimeList
            </a>
          )}
        </div>

        {/* Right Column — Details */}
        <div className="lg:col-span-2 space-y-6">
          {/* Title Block */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.4, delay: 0.1 }}
          >
            <h1 className="text-3xl sm:text-4xl font-bold text-white leading-tight mb-1">
              {anime.title_english || anime.title}
            </h1>
            {anime.title_english && anime.title !== anime.title_english && (
              <p className="text-slate-400 text-lg mb-1">{anime.title}</p>
            )}
            {anime.title_japanese && (
              <p className="text-slate-500 text-sm">{anime.title_japanese}</p>
            )}
          </motion.div>

          {/* Status + Score Row */}
          <div className="flex flex-wrap items-center gap-3">
            <div className="flex items-center gap-2 bg-yellow-500/10 border border-yellow-500/20 rounded-xl px-4 py-2.5">
              <Star size={18} className="text-yellow-400 fill-yellow-400" />
              <span className="text-yellow-300 text-xl font-bold">
                {formatScore(anime.score)}
              </span>
              <span className="text-slate-400 text-sm">
                ({anime.scored_by?.toLocaleString() || "0"} users)
              </span>
            </div>
            <span
              className={`text-sm font-medium px-3 py-1.5 rounded-full border ${
                anime.status === "Currently Airing"
                  ? "bg-green-500/10 border-green-500/30 text-green-400"
                  : anime.status === "Finished Airing"
                  ? "bg-blue-500/10 border-blue-500/30 text-blue-400"
                  : "bg-yellow-500/10 border-yellow-500/30 text-yellow-400"
              }`}
            >
              {anime.status === "Currently Airing" && "● "}
              {anime.status}
            </span>
          </div>

          {/* Genres + Themes */}
          <div className="space-y-2">
            {anime.genres?.length > 0 && (
              <div className="flex flex-wrap gap-2">
                {anime.genres.map((g) => (
                  <Badge key={g.mal_id} variant="default">
                    {g.name}
                  </Badge>
                ))}
              </div>
            )}
            {anime.themes?.length > 0 && (
              <div className="flex flex-wrap gap-2">
                {anime.themes.map((t) => (
                  <Badge key={t.mal_id} variant="secondary">
                    {t.name}
                  </Badge>
                ))}
              </div>
            )}
            {anime.demographics?.length > 0 && (
              <div className="flex flex-wrap gap-2">
                {anime.demographics.map((d) => (
                  <Badge key={d.mal_id} variant="warning">
                    {d.name}
                  </Badge>
                ))}
              </div>
            )}
          </div>

          {/* Action Buttons */}
          <div className="flex flex-wrap gap-3">
            {user ? (
              <Button
                onClick={handleFavorite}
                disabled={favLoading}
                variant={favorited ? "danger" : "secondary"}
                size="lg"
              >
                <Heart size={17} className={favorited ? "fill-white" : ""} />
                {favLoading
                  ? "Saving..."
                  : favorited
                  ? "Remove from Favorites"
                  : "Add to Favorites"}
              </Button>
            ) : (
              <Link to="/login">
                <Button variant="secondary" size="lg">
                  <Heart size={17} />
                  Add to Favorites
                </Button>
              </Link>
            )}

            {anime.trailer?.url && (
              <Button
                variant="outline"
                size="lg"
                onClick={() => setShowTrailer(true)}
              >
                <Play size={17} />
                Watch Trailer
              </Button>
            )}
          </div>

          {/* Synopsis */}
          <div className="bg-[#1a1a2e] border border-white/5 rounded-2xl p-5">
            <h3 className="text-white font-semibold mb-3 flex items-center gap-2">
              <BookOpen size={16} className="text-indigo-400" />
              Synopsis
            </h3>
            <p className="text-slate-400 leading-relaxed text-sm">
              {shouldTruncate && !synopsisExpanded
                ? truncateText(synopsis, 300)
                : synopsis}
            </p>
            {shouldTruncate && (
              <button
                onClick={() => setSynopsisExpanded(!synopsisExpanded)}
                className="mt-3 flex items-center gap-1 text-indigo-400 hover:text-indigo-300 text-sm transition-colors"
              >
                {synopsisExpanded ? (
                  <>
                    Show Less <ChevronUp size={15} />
                  </>
                ) : (
                  <>
                    Read More <ChevronDown size={15} />
                  </>
                )}
              </button>
            )}
          </div>

          {/* Episode Info Component */}
          <EpisodeInfo anime={anime} />

          {/* Studios & Producers */}
          {(anime.studios?.length > 0 || anime.producers?.length > 0) && (
            <div className="bg-[#1a1a2e] border border-white/5 rounded-2xl p-5 space-y-4">
              {anime.studios?.length > 0 && (
                <div>
                  <p className="text-slate-400 text-xs uppercase tracking-wider mb-2">
                    Studios
                  </p>
                  <div className="flex flex-wrap gap-2">
                    {anime.studios.map((s) => (
                      <span
                        key={s.mal_id}
                        className="px-3 py-1.5 bg-indigo-500/10 border border-indigo-500/20 text-indigo-300 rounded-lg text-sm"
                      >
                        {s.name}
                      </span>
                    ))}
                  </div>
                </div>
              )}
              {anime.producers?.length > 0 && (
                <div>
                  <p className="text-slate-400 text-xs uppercase tracking-wider mb-2">
                    Producers
                  </p>
                  <div className="flex flex-wrap gap-2">
                    {anime.producers.map((p) => (
                      <span
                        key={p.mal_id}
                        className="px-3 py-1.5 bg-white/5 border border-white/10 text-slate-300 rounded-lg text-sm"
                      >
                        {p.name}
                      </span>
                    ))}
                  </div>
                </div>
              )}
            </div>
          )}

          {/* Streaming Links */}
          {anime.streaming?.length > 0 && (
            <div className="bg-[#1a1a2e] border border-white/5 rounded-2xl p-5">
              <h3 className="text-white font-semibold mb-3 flex items-center gap-2">
                <Play size={16} className="text-indigo-400" />
                Where to Watch
              </h3>
              <div className="flex flex-wrap gap-2">
                {anime.streaming.map((s) => (
                  <a
                    key={s.name}
                    href={s.url}
                    target="_blank"
                    rel="noreferrer"
                    className="flex items-center gap-2 px-4 py-2 bg-[#0f0f1a] border border-white/10 hover:border-indigo-500/40 hover:text-white text-slate-300 rounded-xl text-sm transition-colors"
                  >
                    <ExternalLink size={13} />
                    {s.name}
                  </a>
                ))}
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Trailer Modal */}
      <TrailerModal
        isOpen={showTrailer}
        onClose={() => setShowTrailer(false)}
        trailer={anime.trailer}
        title={anime.title_english || anime.title}
      />
    </>
  );
};

export default AnimeDetailCard;