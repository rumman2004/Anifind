export const getAudioLanguages = (anime) => {
  const languages = ["Japanese"]; // Default
  if (anime?.title_english) languages.push("English");
  return languages;
};

export const truncateText = (text, maxLength = 120) => {
  if (!text) return "No description available.";
  return text.length > maxLength ? text.substring(0, maxLength) + "..." : text;
};

export const formatScore = (score) => {
  return score ? score.toFixed(1) : "N/A";
};

export const getStatusColor = (status) => {
  const map = {
    "Currently Airing": "text-green-400",
    "Finished Airing": "text-blue-400",
    "Not yet aired": "text-yellow-400",
  };
  return map[status] || "text-gray-400";
};