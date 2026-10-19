// src/components/anime/TrailerModal.jsx
import { useEffect, useRef } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { X, ExternalLink, Play } from "lucide-react";

const YT_EMBED = (id) =>
  `https://www.youtube.com/embed/${id}?autoplay=1&rel=0&modestbranding=1`;

/** Builds an embeddable URL from whatever Jikan provides. */
const getEmbedUrl = (trailer) => {
  if (!trailer) return null;

  if (trailer.youtube_id) return YT_EMBED(trailer.youtube_id);

  if (trailer.embed_url) {
    if (trailer.embed_url.includes("autoplay")) return trailer.embed_url;
    return `${trailer.embed_url}${trailer.embed_url.includes("?") ? "&" : "?"}autoplay=1`;
  }

  if (trailer.url) {
    const match = trailer.url.match(/(?:youtube\.com\/watch\?v=|youtu\.be\/)([^&\s]+)/);
    if (match?.[1]) return YT_EMBED(match[1]);
  }
  return null;
};

const TrailerModal = ({ isOpen, onClose, trailer, title }) => {
  const closeRef = useRef(null);
  const onCloseRef = useRef(onClose);
  onCloseRef.current = onClose; // so inline onClose callbacks don't re-run the effect

  /* lock scroll, close on Esc, focus the close button */
  useEffect(() => {
    if (!isOpen) return;

    const prevOverflow = document.body.style.overflow;
    document.body.style.overflow = "hidden";

    const onKey = (e) => {
      if (e.key === "Escape") onCloseRef.current?.();
    };
    document.addEventListener("keydown", onKey);
    closeRef.current?.focus();

    return () => {
      document.removeEventListener("keydown", onKey);
      document.body.style.overflow = prevOverflow;
    };
  }, [isOpen]);

  const embedUrl = getEmbedUrl(trailer);
  const thumbUrl =
    trailer?.images?.maximum_image_url ||
    trailer?.images?.large_image_url ||
    trailer?.images?.medium_image_url;
  const heading = title ?? "Anime trailer";

  return (
    <AnimatePresence>
      {isOpen && (
        <motion.div
          className="fixed inset-0 z-[200] flex items-center justify-center p-3 sm:p-6"
          role="dialog"
          aria-modal="true"
          aria-label={`${heading} trailer`}
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          transition={{ duration: 0.2 }}
          style={{ background: "rgba(0,0,0,.88)", backdropFilter: "blur(12px)" }}
          onClick={onClose}
        >
          <motion.div
            className="relative flex flex-col overflow-hidden"
            /* as wide as possible, but never so wide that the 16:9 player overflows the screen height */
            style={{
              width: "min(1180px, 100%, calc((100dvh - 150px) * 16 / 9))",
              minWidth: "min(100%, 320px)",
              background: "#0a0a14",
              border: "1px solid rgba(255,255,255,.10)",
              borderRadius: 20,
              boxShadow: "0 40px 120px rgba(0,0,0,.85)",
            }}
            initial={{ scale: 0.94, opacity: 0, y: 20 }}
            animate={{ scale: 1, opacity: 1, y: 0 }}
            exit={{ scale: 0.94, opacity: 0, y: 20 }}
            transition={{ type: "spring", stiffness: 300, damping: 28 }}
            onClick={(e) => e.stopPropagation()}
          >
            {/* ── header ── */}
            <div
              className="flex items-center justify-between gap-3 px-4 sm:px-5 py-3"
              style={{ borderBottom: "1px solid rgba(255,255,255,.07)" }}
            >
              <div className="flex items-center gap-3 min-w-0">
                <span
                  className="w-8 h-8 rounded-lg flex items-center justify-center flex-shrink-0"
                  style={{ background: "#dc2626" }}
                >
                  <Play size={14} className="text-white fill-white ml-0.5" />
                </span>
                <div className="min-w-0">
                  <h3
                    className="text-white font-semibold leading-tight truncate"
                    style={{ fontSize: "clamp(13px,2.4vw,15px)" }}
                  >
                    {heading}
                  </h3>
                  <p className="text-xs text-slate-500 mt-0.5">Official trailer · YouTube</p>
                </div>
              </div>

              <div className="flex items-center gap-2 flex-shrink-0">
                {trailer?.url && (
                  <a
                    href={trailer.url}
                    target="_blank"
                    rel="noreferrer"
                    className="hidden sm:inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-medium transition-colors hover:bg-white/10"
                    style={{
                      background: "rgba(255,255,255,.07)",
                      border: "1px solid rgba(255,255,255,.12)",
                      color: "rgba(255,255,255,.7)",
                    }}
                  >
                    <ExternalLink size={12} />
                    Open in YouTube
                  </a>
                )}
                <button
                  ref={closeRef}
                  onClick={onClose}
                  aria-label="Close trailer"
                  className="w-9 h-9 rounded-lg flex items-center justify-center transition-colors hover:bg-white/10 focus:outline-none focus-visible:ring-2 focus-visible:ring-indigo-400"
                  style={{
                    background: "rgba(255,255,255,.07)",
                    border: "1px solid rgba(255,255,255,.12)",
                  }}
                >
                  <X size={16} className="text-slate-300" />
                </button>
              </div>
            </div>

            {/* ── player ── */}
            <div className="relative w-full bg-black" style={{ aspectRatio: "16 / 9" }}>
              {embedUrl ? (
                <>
                  {/* spinner shows until the iframe paints over it */}
                  <div className="absolute inset-0 flex items-center justify-center">
                    <span className="w-8 h-8 rounded-full border-2 border-white/15 border-t-white/70 animate-spin" />
                  </div>
                  <iframe
                    key={embedUrl} /* remount = fresh autoplay */
                    src={embedUrl}
                    title={`${heading} trailer`}
                    className="absolute inset-0 w-full h-full"
                    allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                    allowFullScreen
                    referrerPolicy="strict-origin-when-cross-origin"
                    style={{ border: "none" }}
                  />
                </>
              ) : (
                <div className="absolute inset-0 flex flex-col items-center justify-center gap-5 px-4 text-center">
                  {thumbUrl && (
                    <img
                      src={thumbUrl}
                      alt=""
                      className="absolute inset-0 w-full h-full object-cover opacity-30"
                    />
                  )}
                  <div className="relative z-10 flex flex-col items-center gap-4">
                    <span
                      className="w-16 h-16 rounded-full flex items-center justify-center shadow-2xl"
                      style={{ background: "rgba(220,38,38,.9)" }}
                    >
                      <Play size={28} className="text-white fill-white ml-1" />
                    </span>
                    <p className="text-white font-semibold text-sm sm:text-base">
                      This trailer can't be embedded
                    </p>
                    {trailer?.url && (
                      <a
                        href={trailer.url}
                        target="_blank"
                        rel="noreferrer"
                        className="inline-flex items-center gap-2 px-5 py-2.5 rounded-xl text-sm font-semibold text-white transition-all hover:brightness-110"
                        style={{ background: "#dc2626" }}
                      >
                        <ExternalLink size={14} />
                        Watch on YouTube
                      </a>
                    )}
                  </div>
                </div>
              )}
            </div>

            {/* ── footer ── */}
            <div
              className="flex items-center justify-between gap-3 px-4 sm:px-5 py-2.5"
              style={{ borderTop: "1px solid rgba(255,255,255,.06)" }}
            >
              <p className="text-xs text-slate-500">
                <span className="hidden sm:inline">
                  Press{" "}
                  <kbd
                    className="px-1.5 py-0.5 rounded text-[10px] font-mono"
                    style={{
                      background: "rgba(255,255,255,.07)",
                      border: "1px solid rgba(255,255,255,.12)",
                      color: "rgba(255,255,255,.5)",
                    }}
                  >
                    Esc
                  </kbd>{" "}
                  or click outside to close
                </span>
                <span className="sm:hidden">Tap outside to close</span>
              </p>
              {trailer?.url && (
                <a
                  href={trailer.url}
                  target="_blank"
                  rel="noreferrer"
                  className="sm:hidden inline-flex items-center gap-1 text-xs text-slate-400"
                >
                  <ExternalLink size={11} />
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