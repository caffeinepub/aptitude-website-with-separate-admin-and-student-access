import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { useActor } from './useActor';
import { useInternetIdentity } from './useInternetIdentity';

export function useCheckAdminExists() {
  const { actor, isFetching: actorFetching } = useActor();
  const { identity } = useInternetIdentity();

  return useQuery<boolean>({
    queryKey: ['adminExists'],
    queryFn: async () => {
      if (!actor) throw new Error('Actor not available');
      // Try to check if caller is admin - if no admin exists, this will return false
      // We use this as a proxy to determine if ANY admin exists
      try {
        return await actor.isCallerAdmin();
      } catch (error) {
        // If there's an error, assume no admin exists yet
        return false;
      }
    },
    enabled: !!actor && !actorFetching && !!identity,
    retry: false,
  });
}

export function useClaimInitialAdmin() {
  const { actor } = useActor();
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({ adminToken, userProvidedToken }: { adminToken: string; userProvidedToken: string }) => {
      if (!actor) throw new Error('Actor not available');
      return actor.bootstrap_admin_role(adminToken, userProvidedToken);
    },
    onSuccess: () => {
      // Invalidate role queries to refetch the updated role
      queryClient.invalidateQueries({ queryKey: ['callerRole'] });
      queryClient.invalidateQueries({ queryKey: ['adminExists'] });
    },
  });
}
