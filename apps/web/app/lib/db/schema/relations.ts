import { relations } from 'drizzle-orm';
import * as tables from './tables';

export const tenants_relations = relations(tables.tenants, ({ many }) => ({
  tenantToAccounts: many(tables.accountToTenant),
}));

export const accounts_relations = relations(tables.accounts, ({ many }) => ({
  accountToTenants: many(tables.accountToTenant),
  oauthConnections: many(tables.oauthConnections),
  sessions: many(tables.sessions),
}));

export const accountToTenant_relations = relations(
  tables.accountToTenant,
  ({ one }) => ({
    account: one(tables.accounts, {
      fields: [tables.accountToTenant.accountId],
      references: [tables.accounts.id],
    }),
    tenant: one(tables.tenants, {
      fields: [tables.accountToTenant.tenantId],
      references: [tables.tenants.id],
    }),
  }),
);

export const oauthConnections_relations = relations(
  tables.oauthConnections,
  ({ one }) => ({
    account: one(tables.accounts, {
      fields: [tables.oauthConnections.accountId],
      references: [tables.accounts.id],
    }),
  }),
);

export const session_relations = relations(tables.sessions, ({ one }) => ({
  account: one(tables.accounts, {
    fields: [tables.sessions.accountId],
    references: [tables.accounts.id],
  }),
}));
