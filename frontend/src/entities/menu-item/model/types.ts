import type { Category } from '@entities/category';

export interface MenuItem {
  id: number;
  name: string;
  description: string;
  price: number;
  categories: Category[];
  image?: string;
}
