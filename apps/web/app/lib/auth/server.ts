import { redirect } from '@tanstack/react-router';
import { createMiddleware, createServerFn } from '@tanstack/start';
import { getCookie, getWebRequest, setCookie } from '@tanstack/start/server';
import { deleteSession, getSessionAndAccount } from '~/lib/auth';

export const userServerMiddleware = createMiddleware().server(
  async ({ next }) => {
    const sessionId = getCookie('auth_session_id');

    let returnResult: Awaited<ReturnType<typeof getSessionAndAccount>> = null;

    if (sessionId) {
      const result = await getSessionAndAccount(sessionId);

      returnResult = result;
    }

    const res = await next({
      context: {
        account: returnResult?.account || null,
        session: returnResult?.session || null,
      },
    });
    return res;
  },
);

export const checkAuthServerFn = createServerFn()
  .middleware([userServerMiddleware])
  .handler(async ({ context }) => {
    const { session, account } = context;

    if (!session) {
      const request = getWebRequest();
      const existingOrigin = getCookie('auth_redirect_href');

      let origin =
        existingOrigin && !existingOrigin.includes('/login')
          ? existingOrigin
          : '/app/';

      if (request) {
        const extractedOrigin =
          request.headers.get('origin') || request.headers.get('referer');
        origin =
          extractedOrigin && !extractedOrigin.includes('/login')
            ? extractedOrigin
            : origin;
      }

      setCookie('auth_redirect_href', origin, {
        expires: new Date(Date.now() + 10 * 60 * 1000), // 10 mins
      });
    } else {
      setCookie('auth_redirect_href', '', { maxAge: 0, expires: new Date(0) });
    }

    return {
      status: session ? 'proceed' : 'login',
      account,
    };
  });

export const logoutServerFn = createServerFn()
  .middleware([userServerMiddleware])
  .handler(async ({ context }) => {
    if (!context.session) {
      throw redirect({ to: '/' });
    }

    deleteSession(context.session.id);
    setCookie('auth_session_id', '', { maxAge: 0, expires: new Date(0) });

    throw redirect({ to: '/' });
  });
