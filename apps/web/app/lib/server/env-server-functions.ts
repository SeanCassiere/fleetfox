// Server functions to surgically fetch server environment variables.

import { createServerFn } from '@tanstack/start';
import { env } from '~/lib/utils/env';

/**
 * Fetch the `MODE` environment variable.
 */
export const getModeServerFn = createServerFn({ method: 'GET' }).handler(() => {
  return env.VITE_WEB_MODE;
});
