import { useServerFn, createServerFn } from '@tanstack/start';
import { createFileRoute, redirect } from '@tanstack/react-router';
import { setCookie, getEvent, getCookie } from '@tanstack/start/server';
import * as arctic from 'arctic';
import { z } from 'zod';
import { Button } from '~/components/ui/button';
import { githubOAuth, githubScopes } from '~/lib/auth';
import { env } from '~/lib/utils/env';
import { getModeServerFn } from '~/lib/server/env-server-functions';

const getAuthOptionsServerFn = createServerFn({ method: 'GET' }).handler(
  async () => {
    const event = getEvent();

    const userAgent = event.headers.get('user-agent');

    const sessionId = getCookie('auth_session_id');

    console.log('session-id', sessionId);
    console.log('user-agent', userAgent);

    const mode = await getModeServerFn();
    return {
      mode,
      options:
        mode === 'deploy-preview'
          ? ['github', 'email:credentials']
          : ['github'],
    };
  },
);

export const Route = createFileRoute('/login/')({
  component: RouteComponent,
  loader: () => getAuthOptionsServerFn(),
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
  );
}
