export type OrderStatus = 
  | 'pending'
  | 'confirmed'
  | 'preparing'
  | 'ready'
  | 'delivered'
  | 'cancelled';

export const orderStatusLabels: Record<OrderStatus, string> = {
  pending: 'Ожидает подтверждения',
  confirmed: 'Подтвержден',
  preparing: 'Готовится',
  ready: 'Готов',
  delivered: 'Доставлен',
  cancelled: 'Отменен',
};

export interface OrderItem {
  menu_item_id: number;
  quantity: number;
}

export interface OrderItemWithDetails extends OrderItem {
  id?: number;
  name?: string;
  price?: number;
  image?: string;
}

export interface Order {
  id: number;
  user_id: number;
  customer_name: string;
  phone: string;
  address: string;
  items: OrderItemWithDetails[];
  total: number;
  status: OrderStatus;
  created_at: string;
  updated_at?: string;
}

export interface OrderCreate {
  customer_name: string;
  phone: string;
  address: string;
  items: OrderItem[];
}
