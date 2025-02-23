import { drizzle } from 'drizzle-orm/libsql';
import * as schema from './schema';
import { createDbId } from './create-db-id';
import { env } from '~/lib/utils/env';

export { schema as tables, createDbId as createId };

export const db = drizzle({
  connection: {
    url: env.WEB_TURSO_DATABASE_URL,
    authToken: env.WEB_TURSO_AUTH_TOKEN,
  },
  schema,
});
