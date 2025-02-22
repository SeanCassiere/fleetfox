import { reactConfig } from '@fleetfox/eslint-config/react';
import eslintPluginReactCompiler from 'eslint-plugin-react-compiler';

/** @type {import("eslint").Linter.Config} */
export default [
  ...reactConfig,
  {
    plugins: {
      'react-compiler': eslintPluginReactCompiler,
    },
  },
];
