import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import type { User, LoginCredentials, RegisterCredentials } from './types';
import { userApi } from '../api/user-api';

interface AuthState {
  user: User | null;
  accessToken: string | null;
  isAuthenticated: boolean;
  isLoading: boolean;
  isInitialized: boolean;
  login: (credentials: LoginCredentials) => Promise<void>;
  register: (credentials: RegisterCredentials) => Promise<void>;
  logout: () => void;
  clearAuth: () => void;
  initialize: () => void;
}

export const useAuthStore = create<AuthState>()(
  persist(
    (set, get) => ({
      user: null,
      accessToken: null,
      isAuthenticated: false,
      isLoading: true,
      isInitialized: false,

      initialize: () => {
        set({ isLoading: false, isInitialized: true });
      },

      login: async (credentials) => {
        try {
          const response = await userApi.login(credentials);
          set({
            accessToken: response.access_token,
            isAuthenticated: true,
            isLoading: false,
            isInitialized: true,
          });
        } catch (error) {
          set({ isLoading: false, isInitialized: true });
          throw error;
        }
      },

      register: async (credentials) => {
        try {
          await userApi.register(credentials);
          const tokenResponse = await userApi.login(credentials as LoginCredentials);
          set({
            accessToken: tokenResponse.access_token,
            isAuthenticated: true,
            isLoading: false,
            isInitialized: true,
          });
        } catch (error) {
          set({ isLoading: false, isInitialized: true });
          throw error;
        }
      },

      logout: () => {
        get().clearAuth();
      },

      clearAuth: () => {
        set({
          user: null,
          accessToken: null,
          isAuthenticated: false,
          isLoading: false,
          isInitialized: true,
        });
      },
    }),
    {
      name: 'auth-storage',
      partialize: (state) => ({
        user: state.user,
        accessToken: state.accessToken,
        isAuthenticated: state.isAuthenticated,
        isInitialized: state.isInitialized,
      }),
    }
  )
);
