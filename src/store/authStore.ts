import { create } from 'zustand';
import { authService } from '../services/authService';
import { AuthSession, AuthUser } from '../types/auth';

interface AuthState {
  user: AuthUser | null;
  token: string | null;
  hydrated: boolean;
  setSession: (session: AuthSession | null) => void;
  hydrate: () => Promise<void>;
  clearSession: () => void;
}

export const useAuthStore = create<AuthState>((set) => ({
  user: null,
  token: null,
  hydrated: false,
  setSession: (session) =>
    set({
      user: session?.user ?? null,
      token: session?.token ?? null,
      hydrated: true,
    }),
  hydrate: async () => {
    const session = await authService.restoreSession();
    set({
      user: session?.user ?? null,
      token: session?.token ?? null,
      hydrated: true,
    });
  },
  clearSession: () => set({ user: null, token: null, hydrated: true }),
}));