import { json } from '@tanstack/react-start';
import { createAPIFileRoute } from '@tanstack/react-start/api';

export const APIRoute = createAPIFileRoute('/api/check-crypto')({
  GET: () => {
    const cryptoAvailable = !!globalThis.crypto;
    return json({ cryptoAvailable });
  },
});
