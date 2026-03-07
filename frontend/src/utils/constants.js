// src/utils/constants.js
/* ══════════════════════════════════════════════════════════
   ENV VALIDATION
   Crashes early with a clear message if a required var
   is missing, instead of a cryptic 404 later.
══════════════════════════════════════════════════════════ */
const required = (key) => {
  const val = import.meta.env[key];
  if (!val) {
    throw new Error(
      `[AniFind] Missing env variable: ${key}\n` +
      `Add it to your .env file and restart Vite.`
    );
  }
  return val;
};

/* ── API URLs ── */
export const API_BASE_URL   = required("VITE_API_BASE_URL");   // http://localhost:5000/api
export const JIKAN_BASE_URL = required("VITE_JIKAN_BASE_URL"); // https://api.jikan.moe/v4

/* ── Jikan has NO api key — it is free and public ──────────
   Rate limits:
     • 3 requests / second
     • 60 requests / minute
   The animeService queue already handles this.
─────────────────────────────────────────────────────────── */

/* ── Misc app constants ── */
export const ANIME_CATEGORIES = [
  { label: "Action",        value: "action"        },
  { label: "Romance",       value: "romance"        },
  { label: "Comedy",        value: "comedy"         },
  { label: "Horror",        value: "horror"         },
  { label: "Sci-Fi",        value: "sci-fi"         },
  { label: "Fantasy",       value: "fantasy"        },
  { label: "Sports",        value: "sports"         },
  { label: "Slice of Life", value: "slice-of-life"  },
];

export const AUDIO_LABELS = {
  Japanese: { color: "bg-red-500/20 text-red-300 border-red-500/30"   },
  English:  { color: "bg-blue-500/20 text-blue-300 border-blue-500/30" },
  Other:    { color: "bg-green-500/20 text-green-300 border-green-500/30" },
};

export const getAudioLanguages = (anime) => {
  const languages = ["Japanese"];
  if (anime?.title_english) languages.push("English");
  return languages;
};

export const truncateText = (text, maxLength = 120) => {
  if (!text) return "No description available.";
  return text.length > maxLength
    ? text.substring(0, maxLength) + "…"
    : text;
};

export const formatScore  = (score)  => (score  ? score.toFixed(1) : "N/A");
export const formatNumber = (n)      => (n      ? n.toLocaleString() : "N/A");

export const getStatusColor = (status) => {
  const map = {
    "Currently Airing": "text-green-400",
    "Finished Airing":  "text-blue-400",
    "Not yet aired":    "text-yellow-400",
  };
  return map[status] ?? "text-gray-400";
};