/// <reference types="vinxi/types/server" />
import {
  createStartHandler,
  defaultStreamHandler,
} from '@tanstack/react-start/server';
import { getRouterManifest } from '@tanstack/react-start/router-manifest';

import { createRouter } from './router';
import { serverPolyfill } from './lib/server/polyfill';

export default createStartHandler({
  createRouter,
  getRouterManifest,
})(async (args) => {
  await serverPolyfill();
  return defaultStreamHandler(args);
});
