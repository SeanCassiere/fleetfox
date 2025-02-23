import { sqliteTable, text, primaryKey } from 'drizzle-orm/sqlite-core';

export const tenants = sqliteTable('tenant', {
  id: text().primaryKey(),
});

export const accounts = sqliteTable('account', {
  id: text().primaryKey(),
});

export const tenantAccounts = sqliteTable(
  'account_to_tenant',
  {
    tenantId: text('tenant_id'),
    accountId: text('account_id'),
  },
  (table) => [
    primaryKey({
      name: 'tenantAccountCk',
      columns: [table.tenantId, table.accountId],
    }),
  ],
);
