import { create } from 'zustand';

export interface Toast {
  id: string;
  title?: string;
  description?: string;
  variant?: 'success' | 'error' | 'info' | 'warning';
  duration?: number;
}

interface ToastState {
  toasts: Toast[];
  addToast: (toast: Omit<Toast, 'id'>) => void;
  removeToast: (id: string) => void;
}

export const toast = create<ToastState>((set) => ({
  toasts: [],

  addToast: (toastData) => {
    const id = Math.random().toString(36).substr(2, 9);
    const newToast: Toast = { id, ...toastData };

    set((state) => ({ toasts: [...state.toasts, newToast] }));

    // Auto-remove after duration
    if (toastData.duration !== 0) {
      setTimeout(() => {
        set((state) => ({
          toasts: state.toasts.filter((t) => t.id !== id),
        }));
      }, toastData.duration || 3000);
    }
  },

  removeToast: (id) => {
    set((state) => ({
      toasts: state.toasts.filter((t) => t.id !== id),
    }));
  },
}));

// Export a function for easier usage
export const useToast = () => {
  const { addToast, removeToast, toasts } = toast();
  return { addToast, removeToast, toasts };
};
