import { create } from 'zustand';
import { cartApi } from '../api/cart-api';
import type { CartItem } from './types';

interface CartState {
  items: CartItem[];
  isLoading: boolean;
  isInitialized: boolean;
  loadCart: () => Promise<void>;
  addItem: (item: { menu_item_id: number; quantity?: number }) => Promise<void>;
  removeItem: (itemId: number) => Promise<void>;
  updateQuantity: (itemId: number, quantity: number) => Promise<void>;
  clearCart: () => Promise<void>;
  clearCartStateOnly: () => void;
  getTotalItems: () => number;
  getTotalPrice: () => number;
  getItemsForOrder: () => { menu_item_id: number; quantity: number }[];
}

export const useCartStore = create<CartState>((set, get) => ({
  items: [],
  isLoading: false,
  isInitialized: false,

  loadCart: async () => {
    set({ isLoading: true });
    try {
      const items = await cartApi.getCart();
      set({ items, isLoading: false, isInitialized: true });
    } catch (error) {
      console.error('Failed to load cart:', error);
      set({ isLoading: false, isInitialized: true, items: [] });
    }
  },

  addItem: async (item) => {
    try {
      const quantity = item.quantity || 1;
      const result = await cartApi.addToCart({ menu_item_id: item.menu_item_id, quantity });
      set((state) => {
        const existingIndex = state.items.findIndex(
          (i) => i.id === result.id
        );
        if (existingIndex >= 0) {
          const newItems = [...state.items];
          newItems[existingIndex] = result;
          return { items: newItems };
        }
        return { items: [...state.items, result] };
      });
    } catch (error) {
      console.error('Failed to add item to cart:', error);
      throw error;
    }
  },

  removeItem: async (itemId) => {
    try {
      await cartApi.removeFromCart(itemId);
      set((state) => ({
        items: state.items.filter((i) => i.id !== itemId),
      }));
    } catch (error) {
      console.error('Failed to remove item from cart:', error);
      throw error;
    }
  },

  updateQuantity: async (itemId, quantity) => {
    if (quantity <= 0) {
      await get().removeItem(itemId);
      return;
    }
    try {
      const result = await cartApi.updateCartItem(itemId, { quantity });
      set((state) => ({
        items: state.items.map((i) => (i.id === itemId ? result : i)),
      }));
    } catch (error) {
      console.error('Failed to update cart item:', error);
      throw error;
    }
  },

  clearCart: async () => {
    try {
      await cartApi.clearCart();
      set({ items: [] });
    } catch (error) {
      console.error('Failed to clear cart:', error);
      throw error;
    }
  },

  clearCartStateOnly: () => {
    // Clear cart state only without API call (used after successful checkout)
    set({ items: [] });
  },

  getTotalItems: () => {
    return get().items.reduce((sum, item) => sum + item.quantity, 0);
  },

  getTotalPrice: () => {
    return get().items.reduce(
      (sum, item) => sum + (item.price || 0) * item.quantity,
      0
    );
  },

  getItemsForOrder: () => {
    return get().items.map((item) => ({
      menu_item_id: item.menu_item_id,
      quantity: item.quantity,
    }));
  },
}));
