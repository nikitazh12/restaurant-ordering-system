import { useAsync } from '@shared/lib/hooks';
import { categoryApi } from '@entities/category';

export function useCategories() {
  const { data, isLoading, error } = useAsync(
    () => categoryApi.getCategories(),
    []
  );

  return {
    categories: data ?? [],
    isLoading,
    error,
  };
}
