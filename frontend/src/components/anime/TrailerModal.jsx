import { useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { X, ExternalLink, Play } from "lucide-react";

const TrailerModal = ({ isOpen, onClose, trailer, title }) => {
  // Close on Escape key
  useEffect(() => {
    const handleKey = (e) => {
      if (e.key === "Escape") onClose();
    };
    if (isOpen) {
      document.addEventListener("keydown", handleKey);
      document.body.style.overflow = "hidden";
    }
    return () => {
      document.removeEventListener("keydown", handleKey);
      document.body.style.overflow = "";
    };
  }, [isOpen, onClose]);

  // Build an embeddable YouTube URL from the trailer data
  const getEmbedUrl = () => {
    if (!trailer) return null;

    // Jikan provides youtube_id directly
    if (trailer.youtube_id) {
      return `https://www.youtube.com/embed/${trailer.youtube_id}?autoplay=1&rel=0&modestbranding=1`;
    }

    // Fallback: parse youtube_id from embed_url
    if (trailer.embed_url) {
      return trailer.embed_url.includes("autoplay")
        ? trailer.embed_url
        : `${trailer.embed_url}?autoplay=1`;
    }

    // Fallback: parse from full URL
    if (trailer.url) {
      const match = trailer.url.match(
        /(?:youtube\.com\/watch\?v=|youtu\.be\/)([^&\s]+)/
      );
      if (match) {
        return `https://www.youtube.com/embed/${match[1]}?autoplay=1&rel=0`;
      }
    }

    return null;
  };

  const embedUrl = getEmbedUrl();

  return (
    <AnimatePresence>
      {isOpen && (
        <motion.div
          className="fixed inset-0 z-50 flex items-center justify-center p-4"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
        >
          {/* Backdrop */}
          <motion.div
            className="absolute inset-0 bg-black/85 backdrop-blur-md"
            onClick={onClose}
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
          />

          {/* Modal */}
          <motion.div
            className="relative w-full max-w-4xl z-10"
            initial={{ scale: 0.9, opacity: 0, y: 20 }}
            animate={{ scale: 1, opacity: 1, y: 0 }}
            exit={{ scale: 0.9, opacity: 0, y: 20 }}
            transition={{ type: "spring", damping: 25, stiffness: 300 }}
          >
            {/* Header */}
            <div className="flex items-center justify-between mb-3">
              <div className="flex items-center gap-2">
                <div className="w-7 h-7 bg-red-600 rounded-lg flex items-center justify-center">
                  <Play size={14} className="text-white ml-0.5" />
                </div>
                <div>
                  <h3 className="text-white font-semibold text-sm leading-tight line-clamp-1">
                    {title}
                  </h3>
                  <p className="text-slate-400 text-xs">Official Trailer</p>
                </div>
              </div>
              <div className="flex items-center gap-2">
                {trailer?.url && (
                  <a
                    href={trailer.url}
                    target="_blank"
                    rel="noreferrer"
                    className="flex items-center gap-1.5 px-3 py-1.5 bg-white/10 hover:bg-white/20 text-slate-300 hover:text-white rounded-lg text-xs transition-colors"
                  >
                    <ExternalLink size={12} />
                    Open in YouTube
                  </a>
                )}
                <button
                  onClick={onClose}
                  className="p-2 bg-white/10 hover:bg-white/20 text-slate-300 hover:text-white rounded-lg transition-colors"
                >
                  <X size={18} />
                </button>
              </div>
            </div>

            {/* Video Container */}
            <div className="relative w-full bg-black rounded-2xl overflow-hidden border border-white/10 shadow-2xl">
              {embedUrl ? (
                <div className="aspect-video">
                  <iframe
                    src={embedUrl}
                    title={`${title} Trailer`}
                    className="w-full h-full"
                    allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                    allowFullScreen
                    frameBorder="0"
                  />
                </div>
              ) : (
                /* Fallback when embed isn't possible */
                <div className="aspect-video flex flex-col items-center justify-center gap-5 bg-[#0f0f1a]">
                  {/* Trailer thumbnail */}
                  {trailer?.images?.maximum_image_url && (
                    <img
                      src={trailer.images.maximum_image_url}
                      alt="Trailer thumbnail"
                      className="absolute inset-0 w-full h-full object-cover opacity-40"
                    />
                  )}
                  <div className="relative z-10 flex flex-col items-center gap-4">
                    <div className="w-16 h-16 bg-red-600/90 rounded-full flex items-center justify-center shadow-lg">
                      <Play size={28} className="text-white ml-1" />
                    </div>
                    <p className="text-white font-medium">
                      Watch on YouTube
                    </p>
                    {trailer?.url && (
                      <a
                        href={trailer.url}
                        target="_blank"
                        rel="noreferrer"
                        className="flex items-center gap-2 px-5 py-2.5 bg-red-600 hover:bg-red-700 text-white rounded-xl text-sm font-medium transition-colors"
                      >
                        <ExternalLink size={15} />
                        Open Trailer
                      </a>
                    )}
                  </div>
                </div>
              )}
            </div>

            {/* Footer hint */}
            <p className="text-center text-slate-600 text-xs mt-3">
              Press ESC or click outside to close
            </p>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
};

export default TrailerModal;