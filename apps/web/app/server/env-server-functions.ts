// Server functions to surgically fetch server environment variables.

import { createServerFn } from '@tanstack/react-start';
import { env } from '~/lib/env';

/**
 * Fetch the `MODE` environment variable.
 */
export const getModeServerFn = createServerFn({ method: 'GET' }).handler(() => {
  return env.VITE_WEB_MODE;
});
