import { json } from '@tanstack/start';
import { createAPIFileRoute } from '@tanstack/start/api';
import { DEPLOY_URL } from '~/utils/env';

export const APIRoute = createAPIFileRoute('/api/test-secret-key')({
  GET: () => {
    const secretKey = DEPLOY_URL;
    return json({ secretKey });
  },
});
