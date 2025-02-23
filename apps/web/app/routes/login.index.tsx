import { useServerFn, createServerFn } from '@tanstack/start';
import { createFileRoute, redirect } from '@tanstack/react-router';
import { setCookie } from '@tanstack/start/server';
import * as arctic from 'arctic';
import { z } from 'zod';
import { Button } from '~/components/ui/button';
import { githubOAuth, githubScopes } from '~/lib/auth';
import { env } from '~/lib/utils/env';

const getAuthOptionsServerFn = createServerFn({ method: 'GET' }).handler(() => {
  const mode = env.MODE;
  return { mode, options: ['github'] };
});

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
  setCookie('github_oauth_state', state, {
    path: '/',
    secure: env.MODE === 'production',
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
