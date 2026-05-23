import { apiClient } from '@shared/api';
import type { Category } from '../model/types';

export const categoryApi = {
  async getCategories(): Promise<Category[]> {
    const response = await apiClient.get<Category[]>('/categories');
    return response.data;
  },

  async getCategoryById(id: number): Promise<Category> {
    const response = await apiClient.get<Category>(`/categories/${id}`);
    return response.data;
  },
};
