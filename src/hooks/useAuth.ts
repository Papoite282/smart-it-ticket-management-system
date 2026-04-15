import { useEffect } from 'react';
import { useMutation } from '@tanstack/react-query';
import { authService } from '../services/authService';
import { getRoleCapabilities, hasRequiredRole } from '../services/permissionService';
import { useAuthStore } from '../store/authStore';
import { LoginCredentials, UserRole } from '../types/auth';

export function useAuth() {
  const { user, token, hydrated, setSession, hydrate, clearSession } = useAuthStore();

  useEffect(() => {
    if (!hydrated) {
      hydrate();
    }
  }, [hydrate, hydrated]);

  const loginMutation = useMutation({
    mutationFn: (credentials: LoginCredentials) => authService.login(credentials),
    onSuccess: (session) => {
      setSession(session);
    },
  });

  const logoutMutation = useMutation({
    mutationFn: () => authService.logout(),
    onSuccess: () => {
      clearSession();
    },
  });

  function hasRole(requiredRole: UserRole) {
    return hasRequiredRole(user?.role, requiredRole);
  }

  return {
    user,
    token,
    hydrated,
    isAuthenticated: Boolean(user && token),
    login: loginMutation.mutateAsync,
    logout: logoutMutation.mutateAsync,
    loginError: loginMutation.error,
    isLoggingIn: loginMutation.isPending,
    isLoggingOut: logoutMutation.isPending,
    hasRole,
    ...getRoleCapabilities(user?.role),
    demoUsers: authService.getDemoUsers(),
  };
}