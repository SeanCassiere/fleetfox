import { createFileRoute, redirect } from '@tanstack/react-router';
import { createServerFn, useServerFn } from '@tanstack/react-start';
import { setCookie } from '@tanstack/react-start/server';
import { z } from 'zod';
import { Button } from '~/components/ui/button';
import { APP_COOKIES } from '~/lib/auth';
import {
  getAvailableWorkspacesServerFn,
  userServerMiddleware,
} from '~/lib/auth/server';
import { env } from '~/lib/env';

export const Route = createFileRoute('/app/workspace/select')({
  component: RouteComponent,
  loader: async () => {
    const workspaces = await getAvailableWorkspacesServerFn();
    if (workspaces.length === 0) {
      throw redirect({ to: '/app/workspace/create' });
    }
    return { workspaces };
  },
});

const setCurrentWorkspaceServerFn = createServerFn({ method: 'POST' })
  .middleware([userServerMiddleware])
  .validator(z.string())
  .handler(({ context, data }) => {
    const workspaces = context.workspaces;

    const found = workspaces.find((w) => w.workspace === data);
    if (!found) {
      throw new Error('Workspace not found');
    }

    setCookie(APP_COOKIES.app_currentWorkspace, data, {
      path: '/',
      httpOnly: true,
      secure: env.VITE_WEB_MODE !== 'development',
      sameSite: 'lax',
    });

    throw redirect({
      to: '/app/$workspace',
      params: { workspace: data },
    });
  });

function RouteComponent() {
  const workspaces = Route.useLoaderData({ select: (s) => s.workspaces });
  const setCurrentWorkspace = useServerFn(setCurrentWorkspaceServerFn);
  return (
    <div className="p-4 grid gap-4">
      <h2>Select a workspace</h2>
      <div className="grid grid-cols-1 gap-2 lg:grid-cols-4">
        {workspaces.map((w) => (
          <div key={w.workspace}>
            <Button
              className="p-2 w-full"
              onClick={() => {
                setCurrentWorkspace({ data: w.workspace });
              }}
            >
              Select {w.workspace}
            </Button>
          </div>
        ))}
      </div>
    </div>
  );
}
