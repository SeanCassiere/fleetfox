import { json } from '@tanstack/start';
import { createAPIFileRoute } from '@tanstack/start/api';
import { getDeployURL } from '~/utils/env';

export const APIRoute = createAPIFileRoute('/api/test-secret-key')({
  GET: () => {
    const deployUrl = getDeployURL();
    return json({ deployUrl });
  },
});
