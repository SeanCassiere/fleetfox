export async function serverPolyfill() {
  if (!globalThis.crypto) {
    const { Crypto } = await import('@peculiar/webcrypto');
    globalThis.crypto = new Crypto();
  }
}
