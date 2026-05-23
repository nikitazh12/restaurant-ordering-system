import { create } from 'zustand';

interface LoadingState {
  isLoading: boolean;
  error: string | null;
  setLoading: (loading: boolean) => void;
  setError: (error: string | null) => void;
  reset: () => void;
}

export const useLoadingStore = create<LoadingState>((set) => ({
  isLoading: false,
  error: null,
  setLoading: (loading) => set({ isLoading: loading }),
  setError: (error) => set({ error }),
  reset: () => set({ isLoading: false, error: null }),
}));
