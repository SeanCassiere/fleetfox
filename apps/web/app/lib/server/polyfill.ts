import { env } from '~/lib/env';

const deployEnvs: Array<(typeof env)['VITE_WEB_MODE']> = [
  'production',
  'deploy-preview',
];

/**
 * Any polyfill that needs to be added to the server should be added here.
 */
export async function serverPolyfill() {
  if (globalThis.crypto && deployEnvs.includes(env.VITE_WEB_MODE)) {
    console.info('Server polyfill for crypto is not needed in production.');
  }
  if (!globalThis.crypto) {
    const { Crypto } = await import('@peculiar/webcrypto');
    globalThis.crypto = new Crypto();
  }
}
