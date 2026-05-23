export interface CartItem {
  id: number;
  user_id: number;
  menu_item_id: number;
  quantity: number;
  name?: string;
  price?: number;
  image?: string;
}

export interface CartState {
  items: CartItem[];
  isLoading: boolean;
  loadCart: () => Promise<void>;
  addItem: (item: { menu_item_id: number; quantity?: number }) => Promise<void>;
  removeItem: (itemId: number) => Promise<void>;
  updateQuantity: (itemId: number, quantity: number) => Promise<void>;
  clearCart: () => Promise<void>;
  getTotalItems: () => number;
  getTotalPrice: () => number;
  getItemsForOrder: () => { menu_item_id: number; quantity: number }[];
}
