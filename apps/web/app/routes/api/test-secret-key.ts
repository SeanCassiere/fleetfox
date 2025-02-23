import { json } from '@tanstack/start';
import { createAPIFileRoute } from '@tanstack/start/api';

import { db } from '~/lib/db';

export const APIRoute = createAPIFileRoute('/api/test-secret-key')({
  GET: async () => {
    const accounts = await db.query.accounts.findMany();
    return json({ accounts });
  },
});
