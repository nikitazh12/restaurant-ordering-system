import type { Category } from '@entities/category';

interface CategoryFilterProps {
  categories: Category[];
  selectedCategory?: string;
  onSelectCategory: (category?: string) => void;
}

export function CategoryFilter({ 
  categories, 
  selectedCategory, 
  onSelectCategory 
}: CategoryFilterProps) {
  return (
    <div className="flex flex-wrap gap-2 mb-6">
      <button
        onClick={() => onSelectCategory(undefined)}
        className={`px-4 py-2 rounded-full text-sm font-medium transition-all duration-200 ${
          !selectedCategory
            ? 'bg-purple-600 text-white shadow-md'
            : 'bg-gray-100 dark:bg-gray-700 text-gray-700 dark:text-gray-300 hover:bg-gray-200 dark:hover:bg-gray-600'
        }`}
      >
        All
      </button>
      {categories.map((category) => (
        <button
          key={category.id}
          onClick={() => onSelectCategory(category.name)}
          className={`px-4 py-2 rounded-full text-sm font-medium transition-all duration-200 ${
            selectedCategory === category.name
              ? 'bg-purple-600 text-white shadow-md'
              : 'bg-gray-100 dark:bg-gray-700 text-gray-700 dark:text-gray-300 hover:bg-gray-200 dark:hover:bg-gray-600'
          }`}
        >
          {category.name}
        </button>
      ))}
    </div>
  );
}
