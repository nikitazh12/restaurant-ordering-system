export interface CartItem {
  id: number;
  user_id: number;
  menu_item_id: number;
  quantity: number;
}

export interface CartItemCreate {
  menu_item_id: number;
  quantity: number;
}

export interface CartItemUpdate {
  quantity: number;
}
