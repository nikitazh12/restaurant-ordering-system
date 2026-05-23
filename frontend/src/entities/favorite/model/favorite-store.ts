import { create } from 'zustand';
import { favoriteApi } from '../api/favorite-api';

interface FavoriteState {
  favorites: number[]; // store menu_item_ids for quick lookup
  isLoading: boolean;
  isInitialized: boolean;
  loadFavorites: () => Promise<void>;
  toggleFavorite: (menuItemId: number) => Promise<boolean>; // returns true if added, false if removed
  removeFavoriteFromState: (menuItemId: number) => void; // remove from state only (for direct delete)
  isFavorite: (menuItemId: number) => boolean;
  clearFavorites: () => void;
}

export const useFavoriteStore = create<FavoriteState>((set, get) => ({
  favorites: [],
  isLoading: false,
  isInitialized: false,

  loadFavorites: async () => {
    set({ isLoading: true });
    try {
      const favorites = await favoriteApi.getFavorites();
      set({
        favorites: favorites.map((f) => f.menu_item_id),
        isLoading: false,
        isInitialized: true,
      });
    } catch (error) {
      console.error('Failed to load favorites:', error);
      set({ isLoading: false, isInitialized: true });
      throw error;
    }
  },

  toggleFavorite: async (menuItemId: number) => {
    const isCurrentlyFavorite = get().favorites.includes(menuItemId);

    // Optimistic update
    set((state) => ({
      favorites: isCurrentlyFavorite
        ? state.favorites.filter((id) => id !== menuItemId)
        : [...state.favorites, menuItemId],
    }));

    try {
      if (isCurrentlyFavorite) {
        await favoriteApi.removeFavorite(menuItemId);
        return false;
      } else {
        await favoriteApi.addFavorite({ menu_item_id: menuItemId });
        return true;
      }
    } catch (error) {
      // Rollback on error
      set((state) => ({
        favorites: isCurrentlyFavorite
          ? [...state.favorites, menuItemId]
          : state.favorites.filter((id) => id !== menuItemId),
      }));
      throw error;
    }
  },

  removeFavoriteFromState: (menuItemId: number) => {
    set((state) => ({
      favorites: state.favorites.filter((id) => id !== menuItemId),
    }));
  },

  isFavorite: (menuItemId: number) => {
    return get().favorites.includes(menuItemId);
  },

  clearFavorites: () => {
    set({ favorites: [] });
  },
}));
