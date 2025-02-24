import { defineConfig } from '@tanstack/start/config';
import tsConfigPaths from 'vite-tsconfig-paths';

export default defineConfig({
  vite: {
    plugins: [
      tsConfigPaths({
        projects: ['./tsconfig.json'],
      }),
    ],
    ssr: {
      // external: ['arctic'],
      noExternal: ['arctic'],
    },
  },
  server: {},
  react: {
    babel: {
      plugins: [['babel-plugin-react-compiler', { target: '19' }]],
    },
  },
});
