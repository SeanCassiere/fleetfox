import { z } from 'zod';

// Define server-only schema
const serverEnvSchema = z.object({
  NODE_ENV: z.string().optional().default('development'),
});

// Define client schema
const viteEnvSchema = z.object({
  MODE: z.string().optional().default('development'),
  SSR: z.boolean().optional().default(false),
});

export const DEPLOY_URL =
  process.env.CONTEXT === 'production'
    ? process.env.URL
    : process.env.CONTEXT === 'deploy-preview'
      ? process.env.DEPLOY_PRIME_URL
      : 'https://localhost:3000';

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
