import { json } from '@tanstack/start';
import { createAPIFileRoute } from '@tanstack/start/api';
import { env } from '~/lib/utils/env';

export const APIRoute = createAPIFileRoute('/api/test-secret-key')({
  GET: () => {
    const SECRET_VALUE = env.WEB_DB_URL;
    return json({ SECRET_VALUE });
  },
});
