// src/context/FavoritesContext.jsx
import { createContext, useContext, useState, useEffect, useCallback } from "react";
import { backendAPI } from "../services/api";
import { useAuth }    from "./AuthContext";

const FavoritesContext = createContext(null);

export const FavoritesProvider = ({ children }) => {
  const [favorites, setFavorites] = useState([]);
  const [favLoading, setFavLoading] = useState(false);
  const { user } = useAuth();

  const fetchFavorites = useCallback(async () => {
    if (!user) return;
    setFavLoading(true);
    try {
      const res = await backendAPI.get("/favorites");
      setFavorites(res.data);
    } catch {
      setFavorites([]);
    } finally {
      setFavLoading(false);
    }
  }, [user]);

  /* re-fetch whenever the logged-in user changes */
  useEffect(() => {
    if (user) fetchFavorites();
    else      setFavorites([]);
  }, [user, fetchFavorites]);

  const addFavorite = async (anime) => {
    const payload = {
      animeId:      anime.mal_id,
      title:        anime.title,
      titleEnglish: anime.title_english,
      imageUrl:     anime.images?.jpg?.large_image_url
                 || anime.images?.jpg?.image_url,
      score:        anime.score,
      episodes:     anime.episodes,
      status:       anime.status,
      genres:       anime.genres?.map((g) => g.name) ?? [],
      type:         anime.type,
      year:         anime.year,
    };
    try {
      const res = await backendAPI.post("/favorites", payload);
      setFavorites((prev) => [res.data, ...prev]);
    } catch (err) {
      throw new Error(err.response?.data?.message ?? "Failed to add favourite");
    }
  };

  const removeFavorite = async (animeId) => {
    try {
      await backendAPI.delete(`/favorites/${animeId}`);
      setFavorites((prev) => prev.filter((f) => f.animeId !== animeId));
    } catch (err) {
      throw new Error(err.response?.data?.message ?? "Failed to remove favourite");
    }
  };

  const isFavorite = (animeId) =>
    favorites.some((f) => f.animeId === animeId);

  return (
    <FavoritesContext.Provider
      value={{ favorites, favLoading, addFavorite, removeFavorite, isFavorite, fetchFavorites }}
    >
      {children}
    </FavoritesContext.Provider>
  );
};

export const useFavorites = () => {
  const ctx = useContext(FavoritesContext);
  if (!ctx) throw new Error("useFavorites must be used within FavoritesProvider");
  return ctx;
};