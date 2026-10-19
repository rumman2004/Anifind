import { motion } from "framer-motion";
import { Volume2 } from "lucide-react";

const AUDIO_CONFIG = {
  Japanese: { color: "248,113,113", flag: "🇯🇵", full: "Japanese (Original)" },
  English: { color: "96,165,250", flag: "🇺🇸", full: "English Dub" },
  French: { color: "129,140,248", flag: "🇫🇷", full: "French Dub" },
  German: { color: "250,204,21", flag: "🇩🇪", full: "German Dub" },
  Spanish: { color: "251,146,60", flag: "🇪🇸", full: "Spanish Dub" },
  Portuguese: { color: "74,222,128", flag: "🇧🇷", full: "Portuguese Dub" },
  Other: { color: "148,163,184", flag: "🌐", full: "Other Language" },
};

const SIZES = {
  sm: "gap-1.5 px-2.5 py-1 text-[11px]",
  md: "gap-2 px-3 py-1.5 text-xs",
};

/**
 * Props
 *  - language  key of AUDIO_CONFIG (falls back to "Other")
 *  - showFull  show the long label ("English Dub")
 *  - index     used to stagger the entrance animation
 *  - size      "sm" | "md"
 */
const AudioBadge = ({ language, showFull = false, index = 0, size = "md" }) => {
  const config = AUDIO_CONFIG[language] || AUDIO_CONFIG.Other;
  const { color } = config;

  return (
    <motion.span
      initial={{ opacity: 0, scale: 0.9 }}
      animate={{ opacity: 1, scale: 1 }}
      transition={{ delay: index * 0.06, type: "spring", stiffness: 320, damping: 24 }}
      title={config.full}
      className={`inline-flex items-center rounded-full border font-medium select-none whitespace-nowrap ${SIZES[size] ?? SIZES.md}`}
      style={{
        background: `rgba(${color},.10)`,
        borderColor: `rgba(${color},.30)`,
        color: `rgb(${color})`,
      }}
    >
      <span className="leading-none" aria-hidden>
        {config.flag}
      </span>
      <span>{showFull ? config.full : language}</span>
      {language === "Japanese" && <Volume2 size={11} className="opacity-60" aria-label="Original audio" />}
    </motion.span>
  );
};

export default AudioBadge;