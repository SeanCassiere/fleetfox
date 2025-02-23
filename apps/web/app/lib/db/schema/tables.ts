import { sql } from 'drizzle-orm';
import {
  sqliteTable,
  text,
  primaryKey,
  integer,
} from 'drizzle-orm/sqlite-core';

export const tenants = sqliteTable('tenant', {
  id: text().primaryKey(),
  workspace: text().notNull().unique(),
  createdAt: text('created_at')
    .notNull()
    .default(sql`(CURRENT_TIMESTAMP)`),
  updatedAt: text('updated_at')
    .notNull()
    .default(sql`(CURRENT_TIMESTAMP)`)
    .$onUpdate(() => sql`(CURRENT_TIMESTAMP)`),
});

export const accounts = sqliteTable('account', {
  id: text().primaryKey(),
  name: text(),
  email: text().notNull().unique(),
  emailVerified: integer('email_verified', { mode: 'boolean' }).notNull(),
  avatarUrl: text('avatar_url'),
  password: text(),
  createdAt: text('created_at')
    .notNull()
    .default(sql`(CURRENT_TIMESTAMP)`),
  updatedAt: text('updated_at')
    .notNull()
    .default(sql`(CURRENT_TIMESTAMP)`)
    .$onUpdate(() => sql`(CURRENT_TIMESTAMP)`),
});

export const accountToTenant = sqliteTable(
  'account_to_tenant',
  {
    tenantId: text('tenant_id')
      .notNull()
      .references(() => tenants.id, {
        onDelete: 'cascade',
        onUpdate: 'cascade',
      }),
    accountId: text('account_id')
      .notNull()
      .references(() => accounts.id, {
        onDelete: 'cascade',
        onUpdate: 'cascade',
      }),
    createdAt: text('created_at')
      .notNull()
      .default(sql`(CURRENT_TIMESTAMP)`),
  },
  (table) => [
    primaryKey({
      name: 'tenant_account_ck',
      columns: [table.tenantId, table.accountId],
    }),
  ],
);

export const oauthConnections = sqliteTable(
  'oauth_connection',
  {
    accountId: text('account_id')
      .notNull()
      .references(() => accounts.id, {
        onDelete: 'cascade',
        onUpdate: 'cascade',
      }),
    provider: text().notNull(),
    providerId: text('provider_id').notNull(),
    avatarUrl: text('avatar_url'),
    createdAt: text('created_at')
      .notNull()
      .default(sql`(CURRENT_TIMESTAMP)`),
    updatedAt: text('updated_at')
      .notNull()
      .default(sql`(CURRENT_TIMESTAMP)`)
      .$onUpdate(() => sql`(CURRENT_TIMESTAMP)`),
  },
  (table) => [
    primaryKey({
      name: 'oauth_connection_ck',
      columns: [table.accountId, table.provider],
    }),
  ],
);
