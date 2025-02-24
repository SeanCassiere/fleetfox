import { redirect } from '@tanstack/react-router';
import { createMiddleware, createServerFn } from '@tanstack/start';
import { getCookie, setCookie } from '@tanstack/start/server';
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
