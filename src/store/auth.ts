import { create } from 'zustand';
import { persist, createJSONStorage } from 'zustand/middleware';
import AsyncStorage from '@react-native-async-storage/async-storage';
import type { User } from '../types';

interface AuthState {
  user: User | null;
  isAuthenticated: boolean;
  isLoading: boolean;

  setUser: (user: User | null) => void;
  signIn: (user: User) => void;
  signOut: () => void;
  updateProfile: (data: Partial<User>) => void;
  setLoading: (loading: boolean) => void;
}

export const useAuthStore = create<AuthState>()(
  persist(
    (set) => ({
      user: null,
      isAuthenticated: false,
      isLoading: false,

      setUser: (user) =>
        set({ user, isAuthenticated: user !== null }),

      signIn: (user) =>
        set({ user, isAuthenticated: true, isLoading: false }),

      signOut: () =>
        set({ user: null, isAuthenticated: false, isLoading: false }),

      updateProfile: (data) =>
        set((state) => ({
          user: state.user ? { ...state.user, ...data } : null,
        })),

      setLoading: (isLoading) => set({ isLoading }),
    }),
    {
      name: 'lumisalon-auth',
      storage: createJSONStorage(() => AsyncStorage),
      partialize: (state) => ({
        user: state.user,
        isAuthenticated: state.isAuthenticated,
      }),
    },
  ),
);
