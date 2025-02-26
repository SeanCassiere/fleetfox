import * as arctic from 'arctic';
import { createMiddleware, createServerFn } from '@tanstack/react-start';
import { getCookie, setCookie } from '@tanstack/react-start/server';
import {
  APP_COOKIES,
  getSessionAndAccount,
  githubOAuth,
  githubScopes,
} from '~/lib/auth';
import { env } from '~/lib/env';
import { getWorkspacesForAccount } from '~/lib/db/workspace';

export const githubLoginServerFn = createServerFn({ method: 'POST' }).handler(
  async () => {
    const state = arctic.generateState();
    const authorizationUrl = githubOAuth.createAuthorizationURL(
      state,
      githubScopes,
    );
    setCookie(APP_COOKIES.auth_githubOauthState, state, {
      path: '/',
      secure: env.VITE_WEB_MODE !== 'development',
      httpOnly: true,
      maxAge: 60 * 10 /* 10 minutes */,
    });

    return new Response(null, {
      status: 302,
      headers: { Location: authorizationUrl.href },
    });
  },
);

export const userServerMiddleware = createMiddleware().server(
  async ({ next }) => {
    const sessionId = getCookie(APP_COOKIES.auth_sessionId);

    let returnResult: Awaited<ReturnType<typeof getSessionAndAccount>> = null;
    let workspaces: Awaited<ReturnType<typeof getWorkspacesForAccount>> = [];

    if (sessionId) {
      const result = await getSessionAndAccount(sessionId);
      returnResult = result;
    }

    if (returnResult?.account) {
      workspaces = await getWorkspacesForAccount(returnResult.account.id);
    }

    const res = await next({
      context: {
        account: returnResult?.account || null,
        session: returnResult?.session || null,
        workspaces: workspaces,
      },
    });
    return res;
  },
);

export const checkAuthServerFn = createServerFn()
  .middleware([userServerMiddleware])
  .handler(async ({ context }) => {
    const { session, account } = context;

    // if (!session) {
    //   const request = getWebRequest();
    //   const existingOrigin = getCookie('auth_redirect_href');

    //   let origin =
    //     existingOrigin && !existingOrigin.includes('/login')
    //       ? existingOrigin
    //       : '/app/';

    //   if (request) {
    //     const extractedOrigin =
    //       request.headers.get('origin') || request.headers.get('referer');
    //     origin =
    //       extractedOrigin && !extractedOrigin.includes('/login')
    //         ? extractedOrigin
    //         : origin;
    //   }

    //   setCookie('auth_redirect_href', origin, {
    //     expires: new Date(Date.now() + 10 * 60 * 1000), // 10 mins
    //   });
    // } else {
    //   setCookie('auth_redirect_href', '', { maxAge: 0, expires: new Date(0) });
    // }

    return {
      status: session ? 'proceed' : 'login',
      account,
    };
  });

export const getAvailableWorkspacesServerFn = createServerFn()
  .middleware([userServerMiddleware])
  .handler(({ context }) => {
    return context.workspaces;
  });

export const getSavedWorkspaceServerFn = createServerFn()
  .middleware([userServerMiddleware])
  .handler(() => {
    const savedWorkspace = getCookie(APP_COOKIES.app_currentWorkspace);
    return savedWorkspace;
  });
