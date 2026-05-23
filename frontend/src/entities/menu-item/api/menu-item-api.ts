import { apiClient } from '@shared/api';
import type { MenuItem } from '../model/types';

export interface MenuQueryParams {
  category?: string;
  search?: string;
}

export const menuItemApi = {
  async getMenuItems(params?: MenuQueryParams): Promise<MenuItem[]> {
    const response = await apiClient.get<MenuItem[]>('/menu', { params });
    return response.data;
  },

  async getMenuItemById(id: number): Promise<MenuItem> {
    const response = await apiClient.get<MenuItem>(`/menu/${id}`);
    return response.data;
  },
};
