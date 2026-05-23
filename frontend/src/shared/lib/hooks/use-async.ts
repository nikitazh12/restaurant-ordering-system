import { useEffect, useState } from 'react';

interface UseAsyncState<T> {
  data: T | null;
  isLoading: boolean;
  error: string | null;
}

export function useAsync<T>(
  asyncFn: () => Promise<T>,
  dependencies: unknown[] = []
): UseAsyncState<T> {
  const [state, setState] = useState<UseAsyncState<T>>({
    data: null,
    isLoading: true,
    error: null,
  });

  useEffect(() => {
    let isMounted = true;

    const execute = async () => {
      setState((prev) => ({ ...prev, isLoading: true, error: null }));
      try {
        const data = await asyncFn();
        if (isMounted) {
          setState({ data, isLoading: false, error: null });
        }
      } catch (err) {
        if (isMounted) {
          setState({
            data: null,
            isLoading: false,
            error: err instanceof Error ? err.message : 'An error occurred',
          });
        }
      }
    };

    execute();

    return () => {
      isMounted = false;
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, dependencies);

  return state;
}
