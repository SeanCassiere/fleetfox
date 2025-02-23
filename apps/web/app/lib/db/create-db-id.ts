import { createId } from '@paralleldrive/cuid2';
import { env } from '~/lib/utils/env';

const dbPrefixes = {
  account: 'acc',
  tenant: 'ten',
} as const;

const dbEnv = {
  live: '',
  dev: 'dev',
};

/**
 * Returns a unique database ID
 * @param key_prefix
 * @param key_env
 * @returns
 * @example
 * ```ts
 * createDbId("account", "live");
 * //=> "acc_01B1E5Z5KQZ
 * ```
 */
export const createDbId = (
  key_prefix: keyof typeof dbPrefixes,
  key_env: keyof typeof dbEnv = env.MODE === 'production' ? 'live' : 'dev',
) => {
  return [dbEnv[key_env], dbPrefixes[key_prefix], createId()]
    .filter(Boolean)
    .join('_');
};
