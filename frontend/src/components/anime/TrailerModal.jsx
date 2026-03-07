// src/components/anime/TrailerModal.jsx
import { useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { X, ExternalLink, Play } from "lucide-react";

const TrailerModal = ({ isOpen, onClose, trailer, title }) => {

  /* ── lock scroll + ESC to close ── */
  useEffect(() => {
    if (!isOpen) return;
    const handleKey = (e) => { if (e.key === "Escape") onClose(); };
    document.addEventListener("keydown", handleKey);
    document.body.style.overflow = "hidden";
    return () => {
      document.removeEventListener("keydown", handleKey);
      document.body.style.overflow = "";
    };
  }, [isOpen, onClose]);

  /* ── build embed URL from whatever Jikan gives us ── */
  const getEmbedUrl = () => {
    if (!trailer) return null;

    if (trailer.youtube_id) {
      return `https://www.youtube.com/embed/${trailer.youtube_id}?autoplay=1&rel=0&modestbranding=1`;
    }
    if (trailer.embed_url) {
      return trailer.embed_url.includes("autoplay")
        ? trailer.embed_url
        : `${trailer.embed_url}&autoplay=1`;
    }
    if (trailer.url) {
      const match = trailer.url.match(
        /(?:youtube\.com\/watch\?v=|youtu\.be\/)([^&\s]+)/
      );
      if (match?.[1]) {
        return `https://www.youtube.com/embed/${match[1]}?autoplay=1&rel=0&modestbranding=1`;
      }
    }
    return null;
  };

  const embedUrl  = getEmbedUrl();
  const thumbUrl  = trailer?.images?.maximum_image_url
                 || trailer?.images?.large_image_url
                 || trailer?.images?.medium_image_url;

  return (
    <AnimatePresence>
      {isOpen && (
        <motion.div
          className="fixed inset-0 z-[200] flex items-center justify-center p-3 sm:p-6"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          style={{ background: "rgba(0,0,0,0.88)", backdropFilter: "blur(12px)" }}
          onClick={onClose}
        >
          {/* Modal card */}
          <motion.div
            className="relative w-full z-10"
            style={{
              maxWidth: 920,
              background: "#0a0a14",
              border: "1px solid rgba(255,255,255,0.10)",
              borderRadius: 20,
              boxShadow: "0 40px 120px rgba(0,0,0,0.85)",
              overflow: "hidden",
            }}
            initial={{ scale: 0.90, opacity: 0, y: 24 }}
            animate={{ scale: 1,    opacity: 1, y: 0  }}
            exit={{    scale: 0.90, opacity: 0, y: 24 }}
            transition={{ type: "spring", stiffness: 300, damping: 28 }}
            onClick={(e) => e.stopPropagation()}
          >

            {/* ── Header ── */}
            <div
              className="flex items-center justify-between px-4 py-3"
              style={{ borderBottom: "1px solid rgba(255,255,255,0.07)" }}
            >
              <div className="flex items-center gap-2.5 min-w-0">
                <div
                  className="w-7 h-7 rounded-lg flex items-center justify-center flex-shrink-0"
                  style={{ background: "#dc2626" }}
                >
                  <Play size={13} className="text-white fill-white ml-0.5" />
                </div>
                <div className="min-w-0">
                  <h3
                    className="text-white font-semibold leading-tight line-clamp-1"
                    style={{ fontSize: "clamp(12px,2.5vw,14px)" }}
                  >
                    {title ?? "Anime Trailer"}
                  </h3>
                  <p className="text-slate-500 text-xs">Official Trailer · YouTube</p>
                </div>
              </div>

              <div className="flex items-center gap-2 flex-shrink-0 ml-3">
                {trailer?.url && (
                  <a
                    href={trailer.url}
                    target="_blank"
                    rel="noreferrer"
                    className="hidden sm:flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs transition-all hover:scale-105"
                    style={{
                      background: "rgba(255,255,255,0.07)",
                      border: "1px solid rgba(255,255,255,0.12)",
                      color: "rgba(255,255,255,0.65)",
                    }}
                  >
                    <ExternalLink size={11} />
                    Open in YouTube
                  </a>
                )}
                <button
                  onClick={onClose}
                  className="w-8 h-8 rounded-lg flex items-center justify-center transition-all hover:scale-110"
                  style={{
                    background: "rgba(255,255,255,0.07)",
                    border: "1px solid rgba(255,255,255,0.12)",
                  }}
                >
                  <X size={15} className="text-slate-300" />
                </button>
              </div>
            </div>

            {/* ── Video area ── */}
            <div className="relative w-full bg-black" style={{ aspectRatio: "16/9" }}>
              {embedUrl ? (
                <iframe
                  key={embedUrl}          /* remount = fresh autoplay */
                  src={embedUrl}
                  title={`${title ?? "Anime"} Trailer`}
                  className="absolute inset-0 w-full h-full"
                  allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                  allowFullScreen
                  style={{ border: "none" }}   /* ✅ not frameBorder */
                />
              ) : (
                /* ── no embed available — show thumbnail + open link ── */
                <div className="absolute inset-0 flex flex-col items-center justify-center gap-5">
                  {thumbUrl && (
                    <img
                      src={thumbUrl}
                      alt="Trailer thumbnail"
                      className="absolute inset-0 w-full h-full object-cover opacity-35"
                    />
                  )}
                  <div className="relative z-10 flex flex-col items-center gap-4">
                    <div
                      className="w-16 h-16 rounded-full flex items-center justify-center shadow-2xl"
                      style={{ background: "rgba(220,38,38,0.90)" }}
                    >
                      <Play size={28} className="text-white fill-white ml-1" />
                    </div>
                    <p className="text-white font-semibold text-sm">
                      Trailer can't be embedded
                    </p>
                    {trailer?.url && (
                      <a
                        href={trailer.url}
                        target="_blank"
                        rel="noreferrer"
                        className="flex items-center gap-2 px-5 py-2.5 rounded-xl text-sm font-semibold transition-all hover:scale-105"
                        style={{ background: "#dc2626", color: "#fff" }}
                      >
                        <ExternalLink size={14} />
                        Watch on YouTube
                      </a>
                    )}
                  </div>
                </div>
              )}
            </div>

            {/* ── Footer hint ── */}
            <div
              className="px-4 py-2.5 flex items-center justify-between"
              style={{ borderTop: "1px solid rgba(255,255,255,0.05)" }}
            >
              <p className="text-xs" style={{ color: "rgba(148,163,184,0.35)" }}>
                Press <kbd
                  className="px-1.5 py-0.5 rounded text-[10px] font-mono"
                  style={{ background: "rgba(255,255,255,0.07)", border: "1px solid rgba(255,255,255,0.12)", color: "rgba(255,255,255,0.45)" }}
                >ESC</kbd> or click outside to close
              </p>
              {trailer?.url && (
                <a
                  href={trailer.url}
                  target="_blank"
                  rel="noreferrer"
                  className="sm:hidden flex items-center gap-1 text-xs"
                  style={{ color: "rgba(148,163,184,0.55)" }}
                >
                  <ExternalLink size={10} />
                  YouTube
                </a>
              )}
            </div>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
};

export default TrailerModal;