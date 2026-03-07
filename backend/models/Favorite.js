import mongoose from "mongoose";

const favoriteSchema = new mongoose.Schema(
  {
    user: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },
    animeId: { type: Number, required: true },
    title: { type: String, required: true },
    titleEnglish: { type: String },
    imageUrl: { type: String },
    score: { type: Number },
    episodes: { type: Number },
    status: { type: String },
    genres: [{ type: String }],
    type: { type: String },
  },
  { timestamps: true }
);

// Prevent duplicate favorites per user
favoriteSchema.index({ user: 1, animeId: 1 }, { unique: true });

export default mongoose.model("Favorite", favoriteSchema);