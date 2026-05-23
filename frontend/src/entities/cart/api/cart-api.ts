import { apiClient } from '@shared/api';
import type { CartItem, CartItemCreate, CartItemUpdate } from './types';

export const cartApi = {
  async getCart(): Promise<CartItem[]> {
    const response = await apiClient.get<CartItem[]>('/cart');
    return response.data;
  },

  async addToCart(data: CartItemCreate): Promise<CartItem> {
    const response = await apiClient.post<CartItem>('/cart', data);
    return response.data;
  },

  async updateCartItem(itemId: number, data: CartItemUpdate): Promise<CartItem> {
    const response = await apiClient.put<CartItem>(`/cart/${itemId}`, data);
    return response.data;
  },

  async removeFromCart(itemId: number): Promise<void> {
    await apiClient.delete(`/cart/${itemId}`);
  },

  async clearCart(): Promise<void> {
    await apiClient.delete('/cart');
  },
};
