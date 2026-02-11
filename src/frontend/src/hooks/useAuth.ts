import { useInternetIdentity } from './useInternetIdentity';
import { useQueryClient } from '@tanstack/react-query';
import { useCallback } from 'react';

export function useAuth() {
  const { identity, login, clear, loginStatus } = useInternetIdentity();
  const queryClient = useQueryClient();

  const isAuthenticated = !!identity;
  const principal = identity?.getPrincipal().toString();

  const logout = useCallback(async () => {
    await clear();
    queryClient.clear();
  }, [clear, queryClient]);

  return {
    isAuthenticated,
    principal,
    identity,
    login,
    logout,
    loginStatus,
    isLoggingIn: loginStatus === 'logging-in',
    isLoginError: loginStatus === 'loginError',
    isLoginSuccess: loginStatus === 'success',
  };
}
