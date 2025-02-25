import { createAPIFileRoute } from '@tanstack/start/api';
import { getCookie, setCookie } from '@tanstack/start/server';
import { deleteSession, getSessionAndAccount } from '~/lib/auth';

export const APIRoute = createAPIFileRoute('/api/auth/logout')({
  GET: async () => {
    const sessionId = getCookie('auth_session_id');

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
    setCookie('auth_session_id', '', { maxAge: 0, expires: new Date(0) });
    setCookie('auth_redirect_href', '', { maxAge: 0, expires: new Date(0) });

    return new Response(null, {
      status: 302,
      headers: { Location: '/' },
    });
  },
});
