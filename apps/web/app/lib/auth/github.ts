import * as arctic from 'arctic';
import { env } from '~/lib/utils/env';

export const githubOAuth = new arctic.GitHub(
  env.WEB_GITHUB_CLIENT_ID,
  env.WEB_GITHUB_CLIENT_SECRET,
  env.VITE_WEB_DEPLOY_URL + '/api/auth/github/callback',
);

export const githubScopes = ['user:email', 'read:user'];
