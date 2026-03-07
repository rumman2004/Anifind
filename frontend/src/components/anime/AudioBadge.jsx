import { motion } from "framer-motion";
import { Volume2 } from "lucide-react";

const AUDIO_CONFIG = {
  Japanese: {
    bg: "bg-red-500/10",
    border: "border-red-500/30",
    text: "text-red-300",
    dot: "bg-red-400",
    flag: "🇯🇵",
    full: "Japanese (Original)",
  },
  English: {
    bg: "bg-blue-500/10",
    border: "border-blue-500/30",
    text: "text-blue-300",
    dot: "bg-blue-400",
    flag: "🇺🇸",
    full: "English Dub",
  },
  French: {
    bg: "bg-indigo-500/10",
    border: "border-indigo-500/30",
    text: "text-indigo-300",
    dot: "bg-indigo-400",
    flag: "🇫🇷",
    full: "French Dub",
  },
  German: {
    bg: "bg-yellow-500/10",
    border: "border-yellow-500/30",
    text: "text-yellow-300",
    dot: "bg-yellow-400",
    flag: "🇩🇪",
    full: "German Dub",
  },
  Spanish: {
    bg: "bg-orange-500/10",
    border: "border-orange-500/30",
    text: "text-orange-300",
    dot: "bg-orange-400",
    flag: "🇪🇸",
    full: "Spanish Dub",
  },
  Portuguese: {
    bg: "bg-green-500/10",
    border: "border-green-500/30",
    text: "text-green-300",
    dot: "bg-green-400",
    flag: "🇧🇷",
    full: "Portuguese Dub",
  },
  Other: {
    bg: "bg-slate-500/10",
    border: "border-slate-500/30",
    text: "text-slate-300",
    dot: "bg-slate-400",
    flag: "🌐",
    full: "Other Language",
  },
};

const AudioBadge = ({ language, showFull = false, index = 0 }) => {
  const config = AUDIO_CONFIG[language] || AUDIO_CONFIG["Other"];

  return (
    <motion.div
      initial={{ opacity: 0, scale: 0.85 }}
      animate={{ opacity: 1, scale: 1 }}
      transition={{ delay: index * 0.08, type: "spring", stiffness: 300 }}
      className={`
        inline-flex items-center gap-2 px-3 py-1.5 rounded-full border
        ${config.bg} ${config.border} ${config.text}
        text-xs font-medium select-none
      `}
      title={config.full}
    >
      {/* Flag emoji */}
      <span className="text-sm leading-none">{config.flag}</span>

      {/* Dot indicator */}
      <span className={`w-1.5 h-1.5 rounded-full ${config.dot} flex-shrink-0`} />

      {/* Label */}
      <span>{showFull ? config.full : language}</span>

      {/* Volume icon for original (Japanese) */}
      {language === "Japanese" && (
        <Volume2 size={11} className="opacity-60" />
      )}
    </motion.div>
  );
};

export default AudioBadge;