import { db } from '~/lib/db';

/**
 * Get all workspaces that an account has access to.
 * @param accountId The account ID to get workspaces for.
 * @returns An array of workspaces that the account has access to.
 */
export async function getWorkspacesForAccount(accountId: string) {
  const connections = await db.query.accountToTenant.findMany({
    where(fields, operators) {
      return operators.eq(fields.accountId, accountId);
    },
    with: {
      tenant: {
        columns: {
          id: true,
          workspace: true,
        },
      },
    },
  });

  return connections.map((connection) => {
    return { id: connection.tenant.id, workspace: connection.tenant.workspace };
  });
}
