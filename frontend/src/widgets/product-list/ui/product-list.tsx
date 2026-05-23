import type { MenuItem } from '@entities/menu-item';
import { ProductCard } from '@shared/ui';
import { Skeleton } from '@shared/ui';

interface ProductListProps {
  items: MenuItem[];
  isLoading?: boolean;
  onProductClick?: (id: number) => void;
}

export function ProductList({ 
  items, 
  isLoading = false,
  onProductClick 
}: ProductListProps) {
  if (isLoading) {
    return (
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
        {Array.from({ length: 8 }).map((_, i) => (
          <div key={i} className="bg-white dark:bg-gray-800 rounded-xl shadow-md overflow-hidden border border-gray-100 dark:border-gray-700">
            <Skeleton height="200px" />
            <div className="p-4 space-y-3">
              <Skeleton height="24px" width="80%" />
              <Skeleton height="16px" width="90%" />
              <Skeleton height="16px" width="60%" />
              <div className="flex justify-between">
                <Skeleton height="24px" width="30%" />
                <Skeleton height="24px" width="25%" />
              </div>
            </div>
          </div>
        ))}
      </div>
    );
  }

  if (items.length === 0) {
    return (
      <div className="text-center py-16">
        <svg className="w-20 h-20 mx-auto text-gray-300 dark:text-gray-600 mb-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M20 13V6a2 2 0 00-2-2H6a2 2 0 00-2 2v7m16 0v5a2 2 0 01-2 2H6a2 2 0 01-2-2v-5m16 0h-2.586a1 1 0 00-.707.293l-2.414 2.414a1 1 0 01-.707.293h-3.172a1 1 0 01-.707-.293l-2.414-2.414A1 1 0 006.586 13H4" />
        </svg>
        <h3 className="text-xl font-semibold text-gray-900 dark:text-white mb-2">
          No products found
        </h3>
        <p className="text-gray-600 dark:text-gray-400">
          Try adjusting your search or filter criteria
        </p>
      </div>
    );
  }

  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
      {items.map((item) => (
        <ProductCard 
          key={item.id} 
          item={item} 
          onClick={onProductClick}
        />
      ))}
    </div>
  );
}
