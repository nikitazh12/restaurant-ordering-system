import { useAsync } from '@shared/lib/hooks';
import { menuItemApi, type MenuQueryParams } from '@entities/menu-item';

export function useMenuItems(params?: MenuQueryParams) {
  const { data, isLoading, error } = useAsync(
    () => menuItemApi.getMenuItems(params),
    [params?.category, params?.search]
  );

  return {
    menuItems: data ?? [],
    isLoading,
    error,
  };
}
