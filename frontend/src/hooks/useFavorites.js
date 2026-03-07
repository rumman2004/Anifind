import { useContext } from "react";
import { FavoritesContext } from "../context/FavoritesContext";

/**
 * Custom hook to consume FavoritesContext.
 * Provides: favorites, addFavorite, removeFavorite, isFavorite, fetchFavorites
 *
 * Usage:
 *   const { favorites, addFavorite, isFavorite } = useFavorites();
 */
export const useFavorites = () => {
  const context = useContext(FavoritesContext);
  if (!context) {
    throw new Error("useFavorites must be used within a <FavoritesProvider>");
  }
  return context;
};