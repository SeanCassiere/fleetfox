import 'dotenv/config';
import { defineConfig } from 'drizzle-kit';

export default defineConfig({
  out: './drizzle',
  schema: './app/lib/db/schema.ts',
  dialect: 'turso',
  dbCredentials: {
    url: process.env.WEB_TURSO_DATABASE_URL!,
    authToken: process.env.WEB_TURSO_AUTH_TOKEN,
  },
});
