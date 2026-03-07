import Favorite from "../models/Favorite.js";

export const getFavorites = async (req, res) => {
  try {
    const favorites = await Favorite.find({ user: req.user._id }).sort({
      createdAt: -1,
    });
    res.json(favorites);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

export const addFavorite = async (req, res) => {
  try {
    const { animeId, title, titleEnglish, imageUrl, score, episodes, status, genres, type } = req.body;
    const exists = await Favorite.findOne({ user: req.user._id, animeId });
    if (exists) {
      return res.status(400).json({ message: "Already in favorites" });
    }
    const favorite = await Favorite.create({
      user: req.user._id,
      animeId, title, titleEnglish, imageUrl, score, episodes, status, genres, type,
    });
    res.status(201).json(favorite);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

export const removeFavorite = async (req, res) => {
  try {
    const favorite = await Favorite.findOneAndDelete({
      user: req.user._id,
      animeId: req.params.animeId,
    });
    if (!favorite) {
      return res.status(404).json({ message: "Favorite not found" });
    }
    res.json({ message: "Removed from favorites" });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};