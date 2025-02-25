/// <reference types="vinxi/types/server" />
import {
  createStartHandler,
  defaultStreamHandler,
} from '@tanstack/start/server';
import { getRouterManifest } from '@tanstack/start/router-manifest';

import { createRouter } from './router';
import { serverPolyfill } from './lib/server/polyfill';

export default createStartHandler({
  createRouter,
  getRouterManifest,
})(async (args) => {
  await serverPolyfill();
  return defaultStreamHandler(args);
});
