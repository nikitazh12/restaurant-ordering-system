import { apiClient } from '@shared/api';
import type { Favorite, FavoriteCreate } from './types';

export const favoriteApi = {
  async getFavorites(): Promise<Favorite[]> {
    const response = await apiClient.get<Favorite[]>('/favorites');
    return response.data;
  },

  async addFavorite(data: FavoriteCreate): Promise<Favorite> {
    const response = await apiClient.post<Favorite>('/favorites', data);
    return response.data;
  },

  async removeFavorite(itemId: number): Promise<void> {
    await apiClient.delete(`/favorites/${itemId}`);
  },
};
