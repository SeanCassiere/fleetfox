import { createAPIFileRoute } from '@tanstack/react-start/api';
import { getCookie, setCookie } from '@tanstack/react-start/server';
import { APP_COOKIES, deleteSession, getSessionAndAccount } from '~/lib/auth';

export const APIRoute = createAPIFileRoute('/api/auth/logout')({
  GET: async () => {
    const sessionId = getCookie(APP_COOKIES.auth_sessionId);

    let sessionAndAccount: Awaited<ReturnType<typeof getSessionAndAccount>> =
      null;

    if (sessionId) {
      const result = await getSessionAndAccount(sessionId);
      sessionAndAccount = result;
    }

    if (!sessionAndAccount) {
      return new Response(null, {
        status: 302,
        headers: { Location: '/' },
      });
    }

    await deleteSession(sessionAndAccount.session.id);
    setCookie(APP_COOKIES.auth_sessionId, '', {
      maxAge: 0,
      expires: new Date(0),
    });

    return new Response(null, {
      status: 302,
      headers: { Location: '/' },
    });
  },
});
