// src/components/section/AnimeDetailCard.jsx
import { useState } from "react";
import { motion } from "framer-motion";
import { Link } from "react-router-dom";
import {
  Star, Heart, Play, ExternalLink, Calendar, Clock, Tv, Users, Award,
  BookOpen, Globe, ChevronDown, ChevronUp,
} from "lucide-react";
import { useAuth } from "../../context/AuthContext";
import { useFavorites } from "../../context/FavoritesContext";
import { getAudioLanguages, formatScore, truncateText } from "../../utils/helpers";
import Badge from "../ui/Badge";
import Button from "../ui/Button";
import AudioBadge from "./AudioBadge";
import EpisodeInfo from "./EpisodeInfo";
import TrailerModal from "./TrailerModal";

const panel = "rounded-2xl p-5" ;
const panelStyle = { background: "rgba(16,16,32,.85)", border: "1px solid rgba(255,255,255,.07)" };

const statusStyle = (status) => {
  if (status === "Currently Airing") return { bg: "rgba(74,222,128,.1)", border: "rgba(74,222,128,.3)", color: "#4ade80" };
  if (status === "Finished Airing") return { bg: "rgba(96,165,250,.1)", border: "rgba(96,165,250,.3)", color: "#60a5fa" };
  return { bg: "rgba(251,191,36,.1)", border: "rgba(251,191,36,.3)", color: "#fbbf24" };
};

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
    try { favorited ? await removeFavorite(anime.mal_id) : await addFavorite(anime); }
    finally { setFavLoading(false); }
  };

  const synopsis = anime.synopsis || "No synopsis available for this anime.";
  const shouldTruncate = synopsis.length > 320;
  const st = statusStyle(anime.status);

  const metaItems = [
    { icon: <Tv size={14} />, label: "Type", value: anime.type ?? "—" },
    { icon: <Calendar size={14} />, label: "Year", value: anime.year || "Unknown" },
    { icon: <Award size={14} />, label: "Rank", value: anime.rank ? `#${anime.rank}` : "N/A" },
    { icon: <Users size={14} />, label: "Members", value: anime.members ? anime.members.toLocaleString() : "N/A" },
    { icon: <Globe size={14} />, label: "Rating", value: anime.rating || "N/A" },
    { icon: <BookOpen size={14} />, label: "Source", value: anime.source || "N/A" },
    { icon: <Clock size={14} />, label: "Duration", value: anime.duration || "N/A" },
    { icon: <Calendar size={14} />, label: "Season", value: anime.season && anime.year ? `${anime.season[0].toUpperCase()}${anime.season.slice(1)} ${anime.year}` : "N/A" },
  ];

  return (
    <>
      <div className="w-full max-w-[1600px] mx-auto grid grid-cols-1 lg:grid-cols-[360px_1fr] xl:grid-cols-[400px_1fr] gap-6 lg:gap-10 items-start">

        {/* left: poster + quick facts — sticks in view while the right column scrolls */}
        <div className="space-y-5 lg:sticky lg:top-6">
          <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ duration: 0.35 }}
            className="relative rounded-2xl overflow-hidden" style={{ border: "1px solid rgba(255,255,255,.1)" }}>
            {!imgError ? (
              <img src={anime.images?.jpg?.large_image_url || anime.images?.jpg?.image_url} alt={anime.title}
                className="w-full object-cover" style={{ aspectRatio: "2/3" }} onError={() => setImgError(true)} />
            ) : (
              <div className="w-full flex flex-col items-center justify-center gap-3" style={{ aspectRatio: "2/3", background: "rgba(16,16,32,.9)" }}>
                <Tv size={40} className="text-slate-600" /><p className="text-slate-500 text-sm">No image available</p>
              </div>
            )}
            <div className="absolute top-3 left-3 flex items-center gap-1.5 rounded-full px-3 py-1.5 backdrop-blur-md" style={{ background: "rgba(0,0,0,.75)" }}>
              <Star size={13} className="text-amber-400 fill-amber-400" />
              <span className="text-white text-sm font-bold">{formatScore(anime.score)}</span>
              <span className="text-slate-400 text-xs">/10</span>
            </div>
            {user && (
              <button onClick={handleFavorite} disabled={favLoading} aria-label={favorited ? "Remove from favourites" : "Add to favourites"}
                className="absolute top-3 right-3 w-10 h-10 rounded-full grid place-items-center backdrop-blur-md transition-colors"
                style={{ background: favorited ? "rgba(236,72,153,.9)" : "rgba(0,0,0,.7)", color: favorited ? "#fff" : "#cbd5e1" }}>
                <Heart size={16} className={favorited ? "fill-white" : ""} />
              </button>
            )}
          </motion.div>

          {audioLangs.length > 0 && (
            <div className={panel} style={panelStyle}>
              <p className="text-xs font-bold text-slate-400 mb-3">Audio available</p>
              <div className="flex flex-wrap gap-2">{audioLangs.map((lang) => <AudioBadge key={lang} language={lang} />)}</div>
            </div>
          )}

          <div className={panel} style={panelStyle}>
            <div className="space-y-3">
              {metaItems.map(({ icon, label, value }) => (
                <div key={label} className="flex items-center justify-between text-sm">
                  <span className="flex items-center gap-2 text-slate-400">{icon}{label}</span>
                  <span className="text-slate-200 font-medium text-right max-w-[55%] truncate">{value}</span>
                </div>
              ))}
            </div>
          </div>

          {anime.url && (
            <a href={anime.url} target="_blank" rel="noreferrer"
              className="flex items-center justify-center gap-2 w-full py-2.5 rounded-xl text-sm font-semibold text-slate-300 hover:text-white transition-colors"
              style={{ background: "rgba(16,16,32,.85)", border: "1px solid rgba(255,255,255,.1)" }}>
              <ExternalLink size={14} />View on MyAnimeList
            </a>
          )}
        </div>

        {/* right: details */}
        <div className="space-y-6 min-w-0">
          <motion.div initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.35, delay: 0.05 }}>
            <h1 className="font-extrabold text-white leading-tight" style={{ fontSize: "clamp(26px,4vw,42px)", letterSpacing: "-0.02em" }}>
              {anime.title_english || anime.title}
            </h1>
            {anime.title_english && anime.title !== anime.title_english && <p className="text-slate-400 text-lg mt-1">{anime.title}</p>}
            {anime.title_japanese && <p className="text-slate-500 text-sm mt-1">{anime.title_japanese}</p>}
          </motion.div>

          <div className="flex flex-wrap items-center gap-3">
            <div className="flex items-center gap-2 rounded-xl px-4 py-2.5" style={{ background: "rgba(251,191,36,.08)", border: "1px solid rgba(251,191,36,.2)" }}>
              <Star size={17} className="text-amber-400 fill-amber-400" />
              <span className="text-amber-300 text-lg font-bold">{formatScore(anime.score)}</span>
              <span className="text-slate-400 text-xs">({anime.scored_by?.toLocaleString() || "0"} users)</span>
            </div>
            {anime.status && (
              <span className="text-sm font-semibold px-3 py-1.5 rounded-full border" style={{ background: st.bg, borderColor: st.border, color: st.color }}>
                {anime.status === "Currently Airing" && "● "}{anime.status}
              </span>
            )}
          </div>

          {(anime.genres?.length > 0 || anime.themes?.length > 0 || anime.demographics?.length > 0) && (
            <div className="flex flex-wrap gap-2">
              {anime.genres?.map((g) => <Badge key={g.mal_id} variant="default">{g.name}</Badge>)}
              {anime.themes?.map((t) => <Badge key={t.mal_id} variant="secondary">{t.name}</Badge>)}
              {anime.demographics?.map((d) => <Badge key={d.mal_id} variant="warning">{d.name}</Badge>)}
            </div>
          )}

          <div className="flex flex-wrap gap-3">
            {user ? (
              <Button onClick={handleFavorite} disabled={favLoading} variant={favorited ? "danger" : "secondary"} size="lg">
                <Heart size={17} className={favorited ? "fill-white" : ""} />
                {favLoading ? "Saving..." : favorited ? "Remove from favourites" : "Add to favourites"}
              </Button>
            ) : (
              <Link to="/login"><Button variant="secondary" size="lg"><Heart size={17} />Add to favourites</Button></Link>
            )}
            {anime.trailer?.url && <Button variant="outline" size="lg" onClick={() => setShowTrailer(true)}><Play size={17} />Watch trailer</Button>}
          </div>

          <div className={panel} style={panelStyle}>
            <h3 className="text-white font-bold mb-3 flex items-center gap-2 text-sm"><BookOpen size={15} className="text-indigo-400" />Synopsis</h3>
            <p className="text-slate-400 leading-relaxed text-sm" style={{ maxWidth: "70ch" }}>
              {shouldTruncate && !synopsisExpanded ? truncateText(synopsis, 320) : synopsis}
            </p>
            {shouldTruncate && (
              <button onClick={() => setSynopsisExpanded((e) => !e)} className="mt-3 inline-flex items-center gap-1 text-indigo-400 hover:text-indigo-300 text-sm font-semibold transition-colors">
                {synopsisExpanded ? <>Show less<ChevronUp size={15} /></> : <>Read more<ChevronDown size={15} /></>}
              </button>
            )}
          </div>

          <EpisodeInfo anime={anime} />

          {(anime.studios?.length > 0 || anime.producers?.length > 0) && (
            <div className={`${panel} space-y-4`} style={panelStyle}>
              {anime.studios?.length > 0 && (
                <div>
                  <p className="text-xs font-bold text-slate-400 mb-2">Studios</p>
                  <div className="flex flex-wrap gap-2">{anime.studios.map((s) => <span key={s.mal_id} className="px-3 py-1.5 rounded-lg text-sm text-indigo-300" style={{ background: "rgba(99,102,241,.1)", border: "1px solid rgba(99,102,241,.2)" }}>{s.name}</span>)}</div>
                </div>
              )}
              {anime.producers?.length > 0 && (
                <div>
                  <p className="text-xs font-bold text-slate-400 mb-2">Producers</p>
                  <div className="flex flex-wrap gap-2">{anime.producers.map((p) => <span key={p.mal_id} className="px-3 py-1.5 rounded-lg text-sm text-slate-300 bg-white/5 border border-white/10">{p.name}</span>)}</div>
                </div>
              )}
            </div>
          )}

          {anime.streaming?.length > 0 && (
            <div className={panel} style={panelStyle}>
              <h3 className="text-white font-bold mb-3 flex items-center gap-2 text-sm"><Play size={15} className="text-indigo-400" />Where to watch</h3>
              <div className="flex flex-wrap gap-2">
                {anime.streaming.map((s) => (
                  <a key={s.name} href={s.url} target="_blank" rel="noreferrer"
                    className="flex items-center gap-2 px-4 py-2 rounded-xl text-sm text-slate-300 hover:text-white transition-colors"
                    style={{ background: "rgba(10,10,20,.9)", border: "1px solid rgba(255,255,255,.1)" }}>
                    <ExternalLink size={13} />{s.name}
                  </a>
                ))}
              </div>
            </div>
          )}
        </div>
      </div>

      <TrailerModal isOpen={showTrailer} onClose={() => setShowTrailer(false)} trailer={anime.trailer} title={anime.title_english || anime.title} />
    </>
  );
};

export default AnimeDetailCard;