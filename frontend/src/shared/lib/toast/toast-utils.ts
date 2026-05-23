import { toast } from './toast';

type ToastType = 'success' | 'error' | 'info' | 'warning';

export interface ToastOptions {
  duration?: number;
}

export const showToast = (
  message: string,
  type: ToastType = 'info',
  options?: ToastOptions
) => {
  toast.getState().addToast({
    title: type.charAt(0).toUpperCase() + type.slice(1),
    description: message,
    variant: type,
    duration: options?.duration || 3000,
  });
};

export const showSuccessToast = (message: string, options?: ToastOptions) => {
  showToast(message, 'success', options);
};

export const showErrorToast = (message: string, options?: ToastOptions) => {
  showToast(message, 'error', options);
};

export const showInfoToast = (message: string, options?: ToastOptions) => {
  showToast(message, 'info', options);
};

export const showWarningToast = (message: string, options?: ToastOptions) => {
  showToast(message, 'warning', options);
};
