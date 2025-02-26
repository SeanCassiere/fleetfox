import { createFileRoute, redirect } from '@tanstack/react-router';
import {
  getAvailableWorkspacesServerFn,
  getSavedWorkspaceServerFn,
} from '~/lib/auth/server';

export const Route = createFileRoute('/app/')({
  loader: async () => {
    const workspaces = await getAvailableWorkspacesServerFn();
    if (workspaces.length === 0) {
      throw redirect({ to: '/app/workspace/create' });
    }

    const savedWorkspace = await getSavedWorkspaceServerFn();
    if (savedWorkspace) {
      const found = workspaces.find((w) => w.workspace === savedWorkspace);
      if (found) {
        throw redirect({
          to: '/app/$workspace',
          params: { workspace: savedWorkspace },
        });
      }
    }

    throw redirect({ to: '/app/workspace/select' });
  },
});
