import { createFileRoute, redirect } from '@tanstack/react-router';
import { createServerFn } from '@tanstack/react-start';
import { z } from 'zod';
import { userServerMiddleware } from '~/lib/auth/server';

const getWorkspaceServerFn = createServerFn()
  .middleware([userServerMiddleware])
  .validator(z.string())
  .handler(({ context: { workspaces }, data }) => {
    const found = workspaces.find((w) => w.workspace === data);
    if (!found) {
      throw redirect({ to: '/app/workspace/select' });
    }
    return { workspace: found };
  });

export const Route = createFileRoute('/app/$workspace')({
  beforeLoad: ({ params }) => getWorkspaceServerFn({ data: params.workspace }),
  preloadStaleTime: 30_000,
});
