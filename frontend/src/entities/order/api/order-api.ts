import { apiClient } from '@shared/api';
import type { Order, OrderCreate } from './types';

export const orderApi = {
  async createOrder(data: OrderCreate): Promise<Order> {
    const response = await apiClient.post<Order>('/orders', data);
    return response.data;
  },

  async createOrderFromCart(): Promise<Order> {
    const response = await apiClient.post<Order>('/orders/from-cart');
    return response.data;
  },

  async getOrders(): Promise<Order[]> {
    const response = await apiClient.get<Order[]>('/orders');
    return response.data;
  },

  async getOrderById(id: number): Promise<Order> {
    const response = await apiClient.get<Order>(`/orders/${id}`);
    return response.data;
  },

  async updateOrderStatus(id: number, status: string): Promise<Order> {
    const response = await apiClient.patch<Order>(`/orders/${id}/status`, { status });
    return response.data;
  },
};
