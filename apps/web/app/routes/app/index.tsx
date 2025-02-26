import { createFileRoute, redirect } from '@tanstack/react-router';
import { getAvailableWorkspacesServerFn } from '~/lib/auth/server';

export const Route = createFileRoute('/app/')({
  loader: async () => {
    const workspaces = await getAvailableWorkspacesServerFn();

    if (workspaces.length === 0) {
      throw redirect({ to: '/app/create-workspace' });
    }

    const workspace = workspaces[0].workspace;
    throw redirect({ to: '/app/$workspace', params: { workspace } });
  },
});
