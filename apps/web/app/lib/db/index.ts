import { drizzle } from 'drizzle-orm/libsql';
import * as schema from './schema';
import { env } from '~/lib/utils/env';

export const db = drizzle({
  connection: {
    url: env.WEB_TURSO_DATABASE_URL,
    authToken: env.WEB_TURSO_AUTH_TOKEN,
  },
  schema,
});
