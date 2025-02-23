import { json } from '@tanstack/start';
import { createAPIFileRoute } from '@tanstack/start/api';
import { getCookie } from '@tanstack/start/server';

export const APIRoute = createAPIFileRoute('/api/auth/github/callback')({
  GET: ({ request }) => {
    const url = new URL(request.url);

    const error = url.searchParams.get('error');

    if (error) {
      return new Response(null, {
        status: 302,
        headers: { Location: '/login?auth_prompt=access_denied' },
      });
    }

    const code = url.searchParams.get('code');
    const state = url.searchParams.get('state');
    const cookieState = getCookie('github_oauth_state');

    if (!code || !state || !cookieState || state !== cookieState) {
      return new Response(null, { status: 400 });
    }

    return json({ code, state, cookieState });
  },
});
