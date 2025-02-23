import {
  sqliteTable,
  text,
  primaryKey,
  integer,
} from 'drizzle-orm/sqlite-core';

export const tenants = sqliteTable('tenant', {
  id: text().primaryKey(),
  workspace: text().notNull().unique(),
  createdAt: integer('created_at', { mode: 'timestamp_ms' })
    .notNull()
    .$defaultFn(() => new Date()),
  updatedAt: integer('updated_at', { mode: 'timestamp_ms' })
    .notNull()
    .$defaultFn(() => new Date())
    .$onUpdateFn(() => new Date()),
});

export const accounts = sqliteTable('account', {
  id: text().primaryKey(),
  name: text(),
  email: text().notNull().unique(),
  emailVerified: integer('email_verified', { mode: 'boolean' }).notNull(),
  avatarUrl: text('avatar_url'),
  password: text(),
  createdAt: integer('created_at', { mode: 'timestamp_ms' })
    .notNull()
    .$defaultFn(() => new Date()),
  updatedAt: integer('updated_at', { mode: 'timestamp_ms' })
    .notNull()
    .$defaultFn(() => new Date())
    .$onUpdateFn(() => new Date()),
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
    createdAt: integer('created_at', { mode: 'timestamp_ms' })
      .notNull()
      .$defaultFn(() => new Date()),
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
    createdAt: integer('created_at', { mode: 'timestamp_ms' })
      .notNull()
      .$defaultFn(() => new Date()),
    updatedAt: integer('updated_at', { mode: 'timestamp_ms' })
      .notNull()
      .$defaultFn(() => new Date())
      .$onUpdateFn(() => new Date()),
  },
  (table) => [
    primaryKey({
      name: 'oauth_connection_ck',
      columns: [table.accountId, table.provider],
    }),
  ],
);

export const sessions = sqliteTable('session', {
  id: text().primaryKey(),
  accountId: text('account_id')
    .notNull()
    .references(() => accounts.id, {
      onDelete: 'cascade',
      onUpdate: 'cascade',
    }),
  expiresAt: integer('created_at', { mode: 'timestamp_ms' }).notNull(),
  createdAt: integer('created_at', { mode: 'timestamp_ms' })
    .notNull()
    .$defaultFn(() => new Date()),
  updatedAt: integer('updated_at', { mode: 'timestamp_ms' })
    .notNull()
    .$defaultFn(() => new Date())
    .$onUpdateFn(() => new Date()),
});
