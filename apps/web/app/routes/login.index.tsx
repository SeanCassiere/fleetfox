import { useServerFn, createServerFn } from '@tanstack/start';
import { createFileRoute, redirect } from '@tanstack/react-router';
import { setCookie } from '@tanstack/start/server';
import * as arctic from 'arctic';
import { z } from 'zod';
import { Button } from '~/components/ui/button';
import { githubOAuth, githubScopes } from '~/lib/auth';
import { env } from '~/lib/utils/env';
import { getModeServerFn } from '~/lib/server/env-server-functions';
import { checkAuthServerFn } from '~/lib/auth/server';

const getAuthOptionsServerFn = createServerFn({ method: 'GET' }).handler(
  async () => {
    const mode = await getModeServerFn();
    return {
      mode,
      options: [
        'github',
        env.WEB_SHOW_AUTH_EMAIL_CREDENTIALS === '1' && 'credentials:email',
      ].filter(Boolean),
    };
  },
);

export const Route = createFileRoute('/login/')({
  component: RouteComponent,
  loader: async () => {
    const auth = await checkAuthServerFn();
    if (auth.status === 'proceed') {
      throw redirect({ to: '/app' });
    }

    const res = await getAuthOptionsServerFn();
    return res;
  },
  validateSearch: z.object({
    auth_prompt: z.string().optional(),
  }),
});

const githubLoginServerFn = createServerFn({ method: 'POST' }).handler(() => {
  const state = arctic.generateState();
  const authorizationUrl = githubOAuth.createAuthorizationURL(
    state,
    githubScopes,
  );
  setCookie('auth_github_oauth_state', state, {
    path: '/',
    secure: env.MODE !== 'development',
    httpOnly: true,
    maxAge: 60 * 10 /* 10 minutes */,
  });

  throw redirect({ href: authorizationUrl.href });
});

function RouteComponent() {
  const envMode = Route.useLoaderData({ select: (s) => s.mode });
  const authOptions = Route.useLoaderData({ select: (s) => s.options });
  const search = Route.useSearch();
  const githubLoginFn = useServerFn(githubLoginServerFn);

  return (
    <div className="p-2 grid gap-4">
      <div>Hello "/login/"!</div>
      {search.auth_prompt && search.auth_prompt === 'access_denied' ? (
        <div className="p-2 bg-amber-200 rounded-md">
          <p>User did not grant access during login.</p>
        </div>
      ) : null}
      {envMode === 'deploy-preview' || envMode === 'development' ? (
        <div>
          <code>{JSON.stringify(authOptions)}</code>
        </div>
      ) : null}
      <div>
        {authOptions.includes('github') ? (
          <Button
            onClick={() => {
              githubLoginFn();
            }}
          >
            Login with GitHub
          </Button>
        ) : null}
      </div>
    </div>
  );
}
