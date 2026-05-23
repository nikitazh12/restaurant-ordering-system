import { useState, useEffect } from 'react';
import { useSearchParams } from 'react-router-dom';
import { useCategories } from '@entities/category';
import { useMenuItems } from '@entities/menu-item';
import { CategoryFilter } from '@widgets/category-filter';
import { SearchWidget } from '@widgets/search';
import { ProductList } from '@widgets/product-list';

export function CatalogPage() {
  const [searchParams, setSearchParams] = useSearchParams();
  const [selectedCategory, setSelectedCategory] = useState<string | undefined>(
    searchParams.get('category') || undefined
  );
  const [searchQuery, setSearchQuery] = useState(searchParams.get('search') || '');

  const { categories, isLoading: categoriesLoading } = useCategories();
  const { menuItems, isLoading: productsLoading, error } = useMenuItems({
    category: selectedCategory,
    search: searchQuery || undefined,
  });

  useEffect(() => {
    const params = new URLSearchParams();
    if (selectedCategory) params.set('category', selectedCategory);
    if (searchQuery) params.set('search', searchQuery);
    setSearchParams(params);
  }, [selectedCategory, searchQuery, setSearchParams]);

  const handleSelectCategory = (category?: string) => {
    setSelectedCategory(category);
  };

  const handleSearch = (query: string) => {
    setSearchQuery(query);
  };

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-gray-900 dark:text-white mb-2">
          Catalog
        </h1>
        <p className="text-gray-600 dark:text-gray-400">
          Browse our complete collection of products
        </p>
      </div>

      <div className="flex flex-col md:flex-row md:items-center gap-4 mb-8">
        <SearchWidget 
          onSearch={handleSearch} 
          placeholder="Search products..." 
        />
      </div>

      <div className="mb-8">
        {categoriesLoading ? (
          <div className="flex flex-wrap gap-2 mb-6">
            {Array.from({ length: 5 }).map((_, i) => (
              <div
                key={i}
                className="bg-gray-200 dark:bg-gray-700 rounded-full h-10 w-24 animate-pulse"
              />
            ))}
          </div>
        ) : (
          <CategoryFilter
            categories={categories}
            selectedCategory={selectedCategory}
            onSelectCategory={handleSelectCategory}
          />
        )}
      </div>

      {error && (
        <div className="bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-xl p-4 mb-6">
          <div className="flex items-center gap-3">
            <svg className="w-5 h-5 text-red-600 dark:text-red-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
            <p className="text-red-800 dark:text-red-200">{error}</p>
          </div>
        </div>
      )}

      <ProductList 
        items={menuItems} 
        isLoading={productsLoading}
        onProductClick={(id: number) => console.log('Product clicked:', id)}
      />
    </div>
  );
}
