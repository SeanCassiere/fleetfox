import { defineConfig } from '@tanstack/start/config';
import tsConfigPaths from 'vite-tsconfig-paths';
import { node } from 'unenv';

export default defineConfig({
  vite: {
    plugins: [
      tsConfigPaths({
        projects: ['./tsconfig.json'],
      }),
    ],
  },
  react: {
    babel: {
      plugins: [['babel-plugin-react-compiler', { target: '19' }]],
    },
  },
  server: {
    unenv: node,
  },
});
