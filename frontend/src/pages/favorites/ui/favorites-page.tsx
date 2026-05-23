import { useCallback, useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useFavoriteStore } from '@entities/favorite/model/favorite-store';
import { useAuthStore } from '@entities/user/model/auth-store';
import { menuItemApi } from '@entities/menu-item/api/menu-item-api';
import type { MenuItem } from '@entities/menu-item/model/types';
import { useCartStore } from '@entities/cart/model/cart-store';
import { showToast } from '@shared/lib/toast';

interface FavoriteItemWithDetails {
  menu_item_id: number;
  menuItem?: MenuItem;
}

export function FavoritesPage() {
  const navigate = useNavigate();
  const isAuthenticated = useAuthStore((state) => state.isAuthenticated);
  const { favorites, isLoading, removeFavoriteFromState } = useFavoriteStore();
  const addItem = useCartStore((state) => state.addItem);
  const [favoriteItemsWithDetails, setFavoriteItemsWithDetails] = useState<FavoriteItemWithDetails[]>([]);
  const [isFetchingDetails, setIsFetchingDetails] = useState(false);

  useEffect(() => {
    if (!isAuthenticated) {
      navigate('/login');
      return;
    }
    // Favorites are already loaded globally in App.tsx, no need to reload
  }, [isAuthenticated, navigate]);

  // Fetch menu item details for each favorite - memoized to prevent re-fetching
  useEffect(() => {
    const fetchFavoriteItems = async () => {
      if (favorites.length === 0) {
        setFavoriteItemsWithDetails([]);
        return;
      }

      setIsFetchingDetails(true);
      try {
        const items = await Promise.all(
          favorites.map(async (menuItemId) => {
            try {
              const menuItem = await menuItemApi.getMenuItemById(menuItemId);
              return { menu_item_id: menuItemId, menuItem };
            } catch (error) {
              console.error(`Failed to fetch menu item ${menuItemId}:`, error);
              return { menu_item_id: menuItemId, menuItem: undefined };
            }
          })
        );
        setFavoriteItemsWithDetails(items);
      } catch (error) {
        console.error('Failed to fetch favorite items:', error);
      } finally {
        setIsFetchingDetails(false);
      }
    };

    fetchFavoriteItems();
  }, [favorites]);

  const handleRemoveFavorite = useCallback(async (menuItemId: number) => {
    // Optimistic update - remove from state immediately without skeleton or toast
    removeFavoriteFromState(menuItemId);
  }, [removeFavoriteFromState]);

  const handleAddToCart = useCallback(async (item: FavoriteItemWithDetails) => {
    try {
      await addItem({ menu_item_id: item.menu_item_id, quantity: 1 });
      showToast('Added to cart!', 'success');
    } catch (error) {
      console.error('Failed to add to cart:', error);
      showToast('Failed to add to cart', 'error');
    }
  }, [addItem]);

  if (!isAuthenticated) {
    return null;
  }

  const isLoadingState = isLoading || isFetchingDetails;
  const favoritesCount = favorites.length;

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-gray-900 dark:text-white mb-2">
          My Favorites
        </h1>
        <p className="text-gray-600 dark:text-gray-400">
          {favoritesCount} {favoritesCount === 1 ? 'item' : 'items'} in your favorites
        </p>
      </div>

      {isLoadingState ? (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
          {Array.from({ length: 8 }).map((_, i) => (
            <div
              key={i}
              className="bg-white dark:bg-gray-800 rounded-xl shadow-md overflow-hidden border border-gray-100 dark:border-gray-700"
            >
              <div className="aspect-[4/3] bg-gray-200 dark:bg-gray-700 animate-pulse" />
              <div className="p-4 space-y-3">
                <div className="h-6 bg-gray-200 dark:bg-gray-700 rounded w-3/4 animate-pulse" />
                <div className="h-4 bg-gray-200 dark:bg-gray-700 rounded w-90% animate-pulse" />
                <div className="flex justify-between">
                  <div className="h-6 bg-gray-200 dark:bg-gray-700 rounded w-1/4 animate-pulse" />
                  <div className="h-6 bg-gray-200 dark:bg-gray-700 rounded w-1/4 animate-pulse" />
                </div>
              </div>
            </div>
          ))}
        </div>
      ) : favoriteItemsWithDetails.length === 0 ? (
        <div className="text-center py-16">
          <svg
            className="w-20 h-20 mx-auto text-gray-300 dark:text-gray-600 mb-4"
            fill="none"
            stroke="currentColor"
            viewBox="0 0 24 24"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={1.5}
              d="M4.318 6.318a4.5 4.5 0 000 6.364L12 20.364l7.682-7.682a4.5 4.5 0 00-6.364-6.364L12 7.636l-1.318-1.318a4.5 4.5 0 00-6.364 0z"
            />
          </svg>
          <h3 className="text-xl font-semibold text-gray-900 dark:text-white mb-2">
            No favorites yet
          </h3>
          <p className="text-gray-600 dark:text-gray-400 mb-4">
            Start adding items to your favorites to see them here
          </p>
          <button
            onClick={() => navigate('/catalog')}
            className="bg-purple-600 hover:bg-purple-700 text-white px-6 py-2 rounded-lg font-medium transition-colors"
          >
            Browse Catalog
          </button>
        </div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
          {favoriteItemsWithDetails.map((item) => {
            
            return (
              <div
                key={item.menu_item_id}
                className="group bg-white dark:bg-gray-800 rounded-xl shadow-md hover:shadow-xl transition-all duration-300 overflow-hidden border border-gray-100 dark:border-gray-700"
              >
                <div className="aspect-[4/3] bg-gray-100 dark:bg-gray-700 overflow-hidden relative">
                  {item.menuItem?.image ? (
                    <img
                      src={item.menuItem.image}
                      alt={item.menuItem.name}
                      className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                      onError={(e) => {
                        const target = e.target as HTMLImageElement;
                        target.style.display = 'none';
                      }}
                    />
                  ) : (
                    <div className="w-full h-full flex items-center justify-center text-gray-400 dark:text-gray-500">
                      <svg className="w-16 h-16" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
                      </svg>
                    </div>
                  )}
                  
                  {/* Remove from favorites button */}
                  <button
                    onClick={() => handleRemoveFavorite(item.menu_item_id)}
                    className="absolute top-2 right-2 p-2 rounded-full bg-red-500 text-white hover:bg-red-600 transition-colors"
                    title="Remove from favorites"
                  >
                    <svg className="w-5 h-5" fill="currentColor" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4.318 6.318a4.5 4.5 0 000 6.364L12 20.364l7.682-7.682a4.5 4.5 0 00-6.364-6.364L12 7.636l-1.318-1.318a4.5 4.5 0 00-6.364 0z" />
                    </svg>
                  </button>
                </div>
                
                <div className="p-4">
                  <h3 className="font-semibold text-gray-900 dark:text-white text-lg line-clamp-1 mb-2">
                    {item.menuItem?.name || `Item #${item.menu_item_id}`}
                  </h3>
                  
                  {item.menuItem?.description && (
                    <p className="text-gray-600 dark:text-gray-400 text-sm mb-3 line-clamp-2">
                      {item.menuItem.description}
                    </p>
                  )}
                  
                  <div className="flex items-center justify-between">
                    <span className="text-xl font-bold text-purple-600 dark:text-purple-400">
                      ${item.menuItem?.price.toFixed(2) || '0.00'}
                    </span>
                    
                    {item.menuItem?.categories && item.menuItem.categories.length > 0 && (
                      <span className="text-xs text-gray-500 dark:text-gray-400 bg-gray-100 dark:bg-gray-700 px-2 py-1 rounded-full">
                        {item.menuItem.categories[0].name}
                      </span>
                    )}
                  </div>
                  
                  <button
                    onClick={() => handleAddToCart(item)}
                    className="w-full mt-4 py-2 px-4 bg-purple-600 hover:bg-purple-700 text-white rounded-lg font-medium transition-colors flex items-center justify-center gap-2"
                  >
                    <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 3h2l.4 2M7 13h10l4-8H5.4M7 13L5.4 5M7 13l-2.293 2.293c-.63.63-.184 1.707.707 1.707H17m0 0a2 2 0 100 4 2 2 0 000-4zm-8 2a2 2 0 11-4 0 2 2 0 014 0z" />
                    </svg>
                    Add to Cart
                  </button>
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}
