import { json } from '@tanstack/start';
import { createAPIFileRoute } from '@tanstack/start/api';
import { env } from '~/utils/env';

export const APIRoute = createAPIFileRoute('/api/test-secret-key')({
  GET: () => {
    const secretKey = env.PUBLIC_DEPLOY_URL;
    return json({ secretKey });
  },
});
