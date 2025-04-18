import { createAPIFileRoute } from '@tanstack/react-start/api';
import {
  getCookie,
  setCookie,
  deleteCookie,
} from '@tanstack/react-start/server';
import * as arctic from 'arctic';
import { and, eq } from 'drizzle-orm';
import { z } from 'zod';
import { APP_COOKIES, githubOAuth } from '~/lib/auth';
import { createSessionId, deleteSession, setSession } from '~/lib/auth/session';
import { getRedirectUrlForWorkspace } from '~/lib/auth/workspace';
import { createId, db, tables } from '~/lib/db';
import { getWorkspacesForAccount } from '~/lib/db/workspace';
import { env } from '~/lib/env';

const githubProfileSchema = z.object({
  id: z.coerce.string(),
  login: z.string(),
  name: z.string().nullable(),
  avatar_url: z.string().nullable(),
});

const githubEmailsSchema = z.array(
  z.object({
    email: z.string(),
    primary: z.boolean(),
    verified: z.boolean(),
  }),
);

export const APIRoute = createAPIFileRoute('/api/auth/github/callback')({
  GET: async ({ request }) => {
    const url = new URL(request.url);
    const headers = new Headers(request.headers);

    const error = url.searchParams.get('error');

    if (error) {
      return new Response(null, {
        status: 302,
        headers: { Location: '/login?auth_prompt=access_denied' },
      });
    }

    const code = url.searchParams.get('code');
    const state = url.searchParams.get('state');
    const cookieState = getCookie(APP_COOKIES.auth_githubOauthState);

    if (!code || !state || !cookieState || state !== cookieState) {
      return new Response(null, { status: 400 });
    }

    let access_token: string;

    try {
      const tokens = await githubOAuth.validateAuthorizationCode(code);
      access_token = tokens.accessToken();
    } catch (error) {
      console.error(error);

      if (error instanceof arctic.OAuth2RequestError) {
        return new Response(null, {
          status: 302,
          headers: { Location: '/login?auth_prompt=oauth_request_error' },
        });
      }

      if (error instanceof arctic.ArcticFetchError) {
        return new Response(null, {
          status: 302,
          headers: { Location: '/login?auth_prompt=oauth_fetch_error' },
        });
      }

      return new Response(null, {
        status: 302,
        headers: { Location: '/login?auth_prompt=oauth_request_failed' },
      });
    }

    let githubProfile: z.infer<typeof githubProfileSchema>;
    let githubEmail: { email: string; verified: boolean } | null = null;

    try {
      const [fetchedProfile, fetchedEmails] = await Promise.all([
        // fetch user profile - https://docs.github.com/en/rest/users/users?apiVersion=2022-11-28#get-the-authenticated-user
        fetch('https://api.github.com/user', {
          headers: {
            Authorization: `Bearer ${access_token}`,
            'X-GitHub-Api-Version': '2022-11-28',
          },
        }).then((r) => r.json()),
        // fetch user emails - https://docs.github.com/en/rest/users/emails?apiVersion=2022-11-28#list-email-addresses-for-the-authenticated-user
        fetch('https://api.github.com/user/emails', {
          headers: {
            Authorization: `Bearer ${access_token}`,
            'X-GitHub-Api-Version': '2022-11-28',
          },
        }).then((r) => r.json()),
      ]);

      const profile = githubProfileSchema.parse(fetchedProfile);
      githubProfile = profile;

      const emails = githubEmailsSchema.parse(fetchedEmails);
      githubEmail =
        emails.find((email) => email.primary && email.verified) ||
        emails.find((email) => email.primary) ||
        null;
    } catch (error) {
      console.error(error);
      return new Response(null, {
        status: 302,
        headers: { Location: '/login?auth_prompt=authentication_failed' },
      });
    }

    if (!githubEmail) {
      return new Response(null, {
        status: 302,
        headers: { Location: '/login?auth_prompt=email_unavailable' },
      });
    }

    const parsedUser = {
      ...githubProfile,
      email: githubEmail.email,
      emailVerified: githubEmail.verified,
    };

    let redirectHref: string;
    let accessibleWorkspace: string | undefined;
    let accountId: string;

    try {
      // Check if the account already exists
      const existingAccount = await getAccount(parsedUser.email);

      if (existingAccount) {
        accountId = existingAccount.id;
        // Check if existing oauth account exists, if so, exit early.
        const oauthAccounts = await getOauthConnections(existingAccount.id);
        const existingGithubOauthAccount = oauthAccounts.find(
          (c) => c.provider === 'github',
        );

        if (!existingGithubOauthAccount) {
          // create an oauth account for this user
          await db.transaction(async (tx) => {
            await tx.insert(tables.oauthConnections).values({
              accountId: existingAccount.id,
              provider: 'github',
              providerId: parsedUser.id,
              avatarUrl: parsedUser.avatar_url,
            });

            // if the account does not have an avatar url, update it
            if (existingAccount.avatarUrl === null) {
              await tx
                .update(tables.accounts)
                .set({ avatarUrl: parsedUser.avatar_url })
                .where(eq(tables.accounts.id, existingAccount.id));
            }
          });
        } else {
          // update the avatar url
          if (
            existingGithubOauthAccount.avatarUrl !== parsedUser.avatar_url ||
            existingAccount.avatarUrl === null
          ) {
            const shouldUpdateAccountAvatarUrl =
              existingAccount.avatarUrl === null
                ? true
                : existingGithubOauthAccount.avatarUrl !== null &&
                  existingGithubOauthAccount.avatarUrl !==
                    parsedUser.avatar_url;

            await db.transaction(async (tx) => {
              await tx
                .update(tables.oauthConnections)
                .set({ avatarUrl: parsedUser.avatar_url })
                .where(
                  and(
                    eq(tables.oauthConnections.providerId, parsedUser.id),
                    eq(tables.oauthConnections.provider, 'github'),
                  ),
                );

              if (shouldUpdateAccountAvatarUrl) {
                await tx
                  .update(tables.accounts)
                  .set({ avatarUrl: parsedUser.avatar_url })
                  .where(eq(tables.accounts.id, existingAccount.id));
              }
            });
          }
        }

        const workspaces = await getWorkspacesForAccount(existingAccount.id);
        const { redirectPath, workspace } = getRedirectUrlForWorkspace(
          workspaces,
          getCookie(APP_COOKIES.app_currentWorkspace),
        );

        redirectHref = redirectPath;
        accessibleWorkspace = workspace;
      } else {
        // If account does not exist, write to the database
        const dbAccountId = createId('account');
        const dbTenantId = createId('tenant');

        accountId = dbAccountId;

        await db.transaction(async (tx) => {
          // create tenant
          await tx
            .insert(tables.tenants)
            .values({ id: dbTenantId, workspace: dbTenantId });

          // create account
          await tx.insert(tables.accounts).values({
            id: dbAccountId,
            name: parsedUser.name || parsedUser.login,
            email: parsedUser.email.toLowerCase(),
            emailVerified: parsedUser.emailVerified,
            avatarUrl: parsedUser.avatar_url,
          });

          // create link to tenant
          await tx.insert(tables.accountToTenant).values({
            accountId: dbAccountId,
            tenantId: dbTenantId,
          });

          // create oauth account
          await tx.insert(tables.oauthConnections).values({
            accountId: dbAccountId,
            provider: 'github',
            providerId: parsedUser.id,
            avatarUrl: parsedUser.avatar_url,
          });
        });

        const { redirectPath } = getRedirectUrlForWorkspace(
          [
            // user only has a single workspace at this point, so just manually add it into the array
            {
              id: dbTenantId,
              workspace: dbTenantId,
            },
          ],
          dbTenantId,
        );
        redirectHref = redirectPath;
        accessibleWorkspace = dbTenantId;
      }
    } catch (error) {
      console.error(error);
      return new Response(null, {
        status: 302,
        headers: { Location: '/login?auth_prompt=authentication_failed' },
      });
    }

    try {
      const sessionId = createSessionId();

      const currentSession = getCookie(APP_COOKIES.auth_sessionId);
      if (currentSession) {
        await deleteSession(currentSession);
      }

      setSession(
        {
          id: sessionId,
          accountId: accountId,
          expiresAt: new Date(Date.now() + 1000 * 60 * 60 * 24 * 30), // 30 days
        },
        headers.get('user-agent'),
      );

      setCookie(APP_COOKIES.auth_sessionId, sessionId, {
        path: '/',
        httpOnly: true,
        secure: env.VITE_WEB_MODE !== 'development',
        sameSite: 'lax',
        expires: new Date(Date.now() + 1000 * 60 * 60 * 24 * 30), // 30 days
      });
      if (
        typeof accessibleWorkspace === 'string' &&
        accessibleWorkspace.length
      ) {
        setCookie(APP_COOKIES.app_currentWorkspace, accessibleWorkspace, {
          path: '/',
          httpOnly: true,
          secure: env.VITE_WEB_MODE !== 'development',
          sameSite: 'lax',
          expires: new Date(Date.now() + 1000 * 60 * 60 * 24 * 90), // 90 days
        });
      }

      deleteCookie(APP_COOKIES.auth_githubOauthState);

      return new Response(null, {
        status: 302,
        headers: { Location: redirectHref },
      });
    } catch (error) {
      console.error(error);
      return new Response(null, {
        status: 302,
        headers: { Location: '/login?auth_prompt=authentication_failed' },
      });
    }
  },
});

function getAccount(email: string) {
  return db.query.accounts.findFirst({
    where(fields, operators) {
      return operators.eq(fields.email, email.toLowerCase());
    },
  });
}

function getOauthConnections(accountId: string) {
  return db.query.oauthConnections.findMany({
    where(fields, operators) {
      return operators.eq(fields.accountId, accountId);
    },
  });
}
