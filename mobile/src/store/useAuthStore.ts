import { create } from 'zustand';
import { persist, createJSONStorage } from 'zustand/middleware';
import AsyncStorage from '@react-native-async-storage/async-storage';

interface AuthState {
  token: string | null;
  userId: string | null;
  email: string | null;
  name: string | null;
  isAuthenticated: boolean;

  setAuth: (data: {
    token: string;
    userId: string;
    email: string;
    name: string;
  }) => void;

  clearAuth: () => void;
}

export const useAuthStore = create<AuthState>()(
  persist(
    (set) => ({
      token: null,
      userId: null,
      email: null,
      name: null,
      isAuthenticated: false,

      setAuth: ({ token, userId, email, name }) =>
        set({
          token,
          userId,
          email,
          name,
          isAuthenticated: true,
        }),

      clearAuth: () =>
        set({
          token: null,
          userId: null,
          email: null,
          name: null,
          isAuthenticated: false,
        }),
    }),
    {
      name: 'auth-store',
      storage: createJSONStorage(() => AsyncStorage),
    }
  )
);
