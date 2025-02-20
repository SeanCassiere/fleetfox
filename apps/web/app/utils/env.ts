import { z } from 'zod';

// Define server-only schema
const serverEnvSchema = z.object({
  NODE_ENV: z.string().optional().default('development'),
});

// Define client schema
const viteEnvSchema = z.object({
  PUBLIC_DEPLOY_URL: z.string().optional().default('http://localhost:3000'),
  SSR: z.boolean().optional().default(false),
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
