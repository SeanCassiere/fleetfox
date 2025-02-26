import { createFileRoute, Link, redirect } from '@tanstack/react-router';
import { createServerFn } from '@tanstack/react-start';
import {
  getCookie,
  getWebRequest,
  setCookie,
} from '@tanstack/react-start/server';
import { z } from 'zod';
import { Alert, AlertDescription } from '~/components/ui/alert';
import { Button } from '~/components/ui/button';
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '~/components/ui/card';
import { Input } from '~/components/ui/input';
import { Label } from '~/components/ui/label';
import {
  APP_COOKIES,
  createSessionId,
  setSession,
  verifyLogin,
} from '~/lib/auth';
import { checkAuthServerFn, githubLoginServerFn } from '~/lib/auth/server';
import { getModeServerFn } from '~/server/env-server-functions';
import { cn, seo } from '~/lib/utils';
import { env } from '~/lib/env';
import { getWorkspacesForAccount } from '~/lib/db/workspace';
import { getRedirectUrlForWorkspace } from '~/lib/auth/workspace';
import { GithubIcon, GalleryVerticalEndIcon } from '~/components/icons';

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

const credentialsEmailLoginServerFn = createServerFn({ method: 'POST' })
  .validator((input: unknown) => {
    if (!(input instanceof FormData)) {
      throw new Error('Input must be a FormData instance');
    }
    const email = input.get('email');
    const password = input.get('password');
    if (typeof email !== 'string' || typeof password !== 'string') {
      throw new Error('Invalid input');
    }

    return { email, password };
  })
  .handler(async ({ data }) => {
    const request = getWebRequest();

    if (!request) {
      throw new Error('No request');
    }

    const account = await verifyLogin(data.email, data.password);

    if (!account) {
      return new Response(null, {
        status: 302,
        headers: { Location: '/login?auth_prompt=access_denied' },
      });
    }

    const headers = new Headers(request.headers);

    const workspaces = await getWorkspacesForAccount(account.id);
    const { redirectPath, workspace: currentWorkspace } =
      getRedirectUrlForWorkspace(
        workspaces,
        getCookie(APP_COOKIES.app_currentWorkspace),
      );

    const sessionId = createSessionId();

    setSession(
      {
        id: sessionId,
        accountId: account.id,
        expiresAt: new Date(Date.now() + 1000 * 60 * 60 * 24 * 30), // 30 days
      },
      headers.get('user-agent'),
    );

    setCookie(APP_COOKIES.auth_sessionId, sessionId, {
      path: '/',
      httpOnly: true,
      secure: env.VITE_WEB_MODE !== 'development',
      sameSite: 'lax',
      expires: new Date(Date.now() + 1000 * 60 * 60 * 24 * 30), // 30 days
    });

    if (typeof currentWorkspace === 'string' && currentWorkspace.length) {
      setCookie(APP_COOKIES.app_currentWorkspace, currentWorkspace, {
        path: '/',
        httpOnly: true,
        secure: env.VITE_WEB_MODE !== 'development',
        sameSite: 'lax',
        expires: new Date(Date.now() + 1000 * 60 * 60 * 24 * 90), // 90 days
      });
    }

    return new Response(null, {
      status: 302,
      headers: { Location: redirectPath },
    });
  });

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
  head: () => ({
    meta: seo({ title: 'Login | Fleetfox' }),
  }),
});

function RouteComponent() {
  const authOptions = Route.useLoaderData({ select: (s) => s.options });
  const search = Route.useSearch();

  return (
    <div className="flex min-h-svh flex-col items-center justify-center gap-6 bg-muted p-6 md:p-10">
      <div className="flex w-full max-w-sm flex-col gap-6">
        <Link
          to="/"
          className="flex items-center gap-2 self-center font-medium"
        >
          <div className="flex h-6 w-6 items-center justify-center rounded-md bg-primary text-primary-foreground">
            <GalleryVerticalEndIcon className="size-4" />
          </div>
          Acme Inc.
        </Link>
        <div className={cn('flex flex-col gap-6')}>
          <Card>
            <CardHeader className="text-center">
              <CardTitle className="text-xl">Welcome back</CardTitle>
              <CardDescription>Login with an existing account</CardDescription>
            </CardHeader>
            <CardContent>
              <div>
                {search.auth_prompt &&
                search.auth_prompt === 'access_denied' ? (
                  <Alert className="mb-4">
                    <AlertDescription>
                      ⚠️ You did not grant access during login flow.
                    </AlertDescription>
                  </Alert>
                ) : null}
                <div className="grid gap-6">
                  <div className="flex flex-col gap-4">
                    {authOptions.includes('github') ? (
                      <form method="POST" action={githubLoginServerFn.url}>
                        <Button variant="outline" className="w-full">
                          <GithubIcon className="size-4 fill-primary" />
                          Login with GItHub
                        </Button>
                      </form>
                    ) : null}
                  </div>
                  {authOptions.includes('credentials:email') ? (
                    <>
                      <div className="relative text-center text-sm after:absolute after:inset-0 after:top-1/2 after:z-0 after:flex after:items-center after:border-t after:border-border">
                        <span className="relative z-10 bg-background px-2 text-muted-foreground">
                          Or continue with
                        </span>
                      </div>
                      <form
                        className="grid gap-6"
                        method="POST"
                        action={credentialsEmailLoginServerFn.url}
                        encType="multipart/form-data"
                      >
                        <div className="grid gap-2">
                          <Label htmlFor="email">Email</Label>
                          <Input
                            id="email"
                            name="email"
                            type="email"
                            placeholder="m@example.com"
                            required
                          />
                        </div>
                        <div className="grid gap-2">
                          <div className="flex items-center">
                            <Label htmlFor="password">Password</Label>
                            <a
                              href="#"
                              className="ml-auto text-sm underline-offset-4 hover:underline"
                            >
                              Forgot your password?
                            </a>
                          </div>
                          <Input
                            id="password"
                            name="password"
                            type="password"
                            required
                          />
                        </div>
                        <Button type="submit" className="w-full">
                          Login
                        </Button>
                      </form>
                    </>
                  ) : null}
                </div>
              </div>
            </CardContent>
          </Card>
          <div className="text-balance text-center text-xs text-muted-foreground [&_a]:underline [&_a]:underline-offset-4 [&_a]:hover:text-primary  ">
            By clicking continue, you agree to our{' '}
            <a href="#">Terms of Service</a> and <a href="#">Privacy Policy</a>.
          </div>
        </div>
      </div>
    </div>
  );
}
