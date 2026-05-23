export interface Favorite {
  id: number;
  user_id: number;
  menu_item_id: number;
}

export interface FavoriteCreate {
  menu_item_id: number;
}

export interface FavoriteItem extends Favorite {
  menuItem?: import('@entities/menu-item/model/types').MenuItem;
}
