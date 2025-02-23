import { z } from 'zod';

// Define server-only schema
const serverEnvSchema = z.object({
  MODE: z
    .enum(['development', 'production', 'deploy-preview'])
    .optional()
    .default('development'),
  NODE_ENV: z.string().optional().default('development'),
  WEB_TURSO_DATABASE_URL: z.string(),
  WEB_TURSO_AUTH_TOKEN: z.string().optional().default('CHANGE_ME'),
  WEB_GITHUB_CLIENT_ID: z.string(),
  WEB_GITHUB_CLIENT_SECRET: z.string(),
});

// Define client schema
const viteEnvSchema = z.object({
  SSR: z.boolean().optional().default(false),
  VITE_WEB_DEPLOY_URL: z.string(),
});

// Validate and parse environment variables
const parsedServerEnv = import.meta.env.SSR
  ? serverEnvSchema.parse(process.env)
  : {};
const parsedClientEnv = viteEnvSchema.parse(import.meta.env);

type ParsedServerEnv = z.infer<typeof serverEnvSchema>;
type ParsedClientEnv = z.infer<typeof viteEnvSchema>;
type ParsedEnv = ParsedServerEnv & ParsedClientEnv;

// Merge parsed environments, with server env hidden from client
export const env = new Proxy(
  import.meta.env.SSR
    ? { ...parsedClientEnv, ...parsedServerEnv }
    : parsedClientEnv,
  {
    get(target, prop) {
      if (prop in parsedServerEnv && typeof window !== 'undefined') {
        throw new Error(
          `Access to server-only environment variable '${String(prop)}' from client code is not allowed.`,
        );
      }
      return prop in parsedServerEnv
        ? parsedServerEnv[prop as keyof typeof parsedServerEnv]
        : target[prop as keyof typeof parsedClientEnv];
    },
  },
) as ParsedEnv;
