import { createFileRoute, Link, redirect } from '@tanstack/react-router';
import { createServerFn } from '@tanstack/react-start';
import {
  getCookie,
  getWebRequest,
  setCookie,
} from '@tanstack/react-start/server';
import { DynamicIcon } from 'lucide-react/dynamic';
import { z } from 'zod';
import type { SVGProps } from 'react';
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
            <DynamicIcon name="gallery-vertical-end" className="size-4" />
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
                          <Github className="size-4 fill-primary" />
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

const Github = (props: SVGProps<SVGSVGElement>) => (
  <svg
    viewBox="0 0 256 250"
    width="1em"
    height="1em"
    fill="#24292f"
    xmlns="http://www.w3.org/2000/svg"
    preserveAspectRatio="xMidYMid"
    {...props}
  >
    <path d="M128.001 0C57.317 0 0 57.307 0 128.001c0 56.554 36.676 104.535 87.535 121.46 6.397 1.185 8.746-2.777 8.746-6.158 0-3.052-.12-13.135-.174-23.83-35.61 7.742-43.124-15.103-43.124-15.103-5.823-14.795-14.213-18.73-14.213-18.73-11.613-7.944.876-7.78.876-7.78 12.853.902 19.621 13.19 19.621 13.19 11.417 19.568 29.945 13.911 37.249 10.64 1.149-8.272 4.466-13.92 8.127-17.116-28.431-3.236-58.318-14.212-58.318-63.258 0-13.975 5-25.394 13.188-34.358-1.329-3.224-5.71-16.242 1.24-33.874 0 0 10.749-3.44 35.21 13.121 10.21-2.836 21.16-4.258 32.038-4.307 10.878.049 21.837 1.47 32.066 4.307 24.431-16.56 35.165-13.12 35.165-13.12 6.967 17.63 2.584 30.65 1.255 33.873 8.207 8.964 13.173 20.383 13.173 34.358 0 49.163-29.944 59.988-58.447 63.157 4.591 3.972 8.682 11.762 8.682 23.704 0 17.126-.148 30.91-.148 35.126 0 3.407 2.304 7.398 8.792 6.14C219.37 232.5 256 184.537 256 128.002 256 57.307 198.691 0 128.001 0Zm-80.06 182.34c-.282.636-1.283.827-2.194.39-.929-.417-1.45-1.284-1.15-1.922.276-.655 1.279-.838 2.205-.399.93.418 1.46 1.293 1.139 1.931Zm6.296 5.618c-.61.566-1.804.303-2.614-.591-.837-.892-.994-2.086-.375-2.66.63-.566 1.787-.301 2.626.591.838.903 1 2.088.363 2.66Zm4.32 7.188c-.785.545-2.067.034-2.86-1.104-.784-1.138-.784-2.503.017-3.05.795-.547 2.058-.055 2.861 1.075.782 1.157.782 2.522-.019 3.08Zm7.304 8.325c-.701.774-2.196.566-3.29-.49-1.119-1.032-1.43-2.496-.726-3.27.71-.776 2.213-.558 3.315.49 1.11 1.03 1.45 2.505.701 3.27Zm9.442 2.81c-.31 1.003-1.75 1.459-3.199 1.033-1.448-.439-2.395-1.613-2.103-2.626.301-1.01 1.747-1.484 3.207-1.028 1.446.436 2.396 1.602 2.095 2.622Zm10.744 1.193c.036 1.055-1.193 1.93-2.715 1.95-1.53.034-2.769-.82-2.786-1.86 0-1.065 1.202-1.932 2.733-1.958 1.522-.03 2.768.818 2.768 1.868Zm10.555-.405c.182 1.03-.875 2.088-2.387 2.37-1.485.271-2.861-.365-3.05-1.386-.184-1.056.893-2.114 2.376-2.387 1.514-.263 2.868.356 3.061 1.403Z" />
  </svg>
);
