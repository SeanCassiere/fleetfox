import { encodeBase32 } from '@oslojs/encoding';
import { eq, lt } from 'drizzle-orm';
import { getDbEnvKey, joinDbId, dbPrefixes } from '../db/create-db-id';
import { db, tables } from '~/lib/db';

function generateIdFromEntropySize(size: number): string {
  if (size % 5 !== 0) {
    throw new TypeError("Argument 'size' must be a multiple of 5");
  }
  const bytes = new Uint8Array(size);
  crypto.getRandomValues(bytes);
  return encodeBase32(bytes).toLowerCase();
}

export function createSessionId(): string {
  return joinDbId(
    getDbEnvKey(),
    dbPrefixes.session,
    generateIdFromEntropySize(25),
  );
}

export type DatabaseAccount = typeof tables.accounts.$inferSelect;
export type DatabaseSession = typeof tables.sessions.$inferSelect;

export async function getSessionAndAccount(
  sessionId: string,
): Promise<[DatabaseSession, DatabaseAccount] | null> {
  const result = await db.query.sessions.findFirst({
    where(fields, operators) {
      return operators.eq(fields.id, sessionId);
    },
    with: { account: true },
  });

  if (!result) {
    return null;
  }

  const { account, ...session } = result;
  return [session, account];
}

export async function getAccountSessions(
  accountId: string,
): Promise<Array<DatabaseSession>> {
  return await db.query.sessions.findMany({
    where(fields, operators) {
      return operators.eq(fields.accountId, accountId);
    },
  });
}

export async function setSession(
  session: Pick<DatabaseSession, 'id' | 'accountId' | 'expiresAt'>,
): Promise<void> {
  await db.insert(tables.sessions).values({
    id: session.id,
    accountId: session.accountId,
    expiresAt: session.expiresAt,
  });
}

export async function updateSessionExpiration(
  sessionId: string,
  expiresAt: Date,
): Promise<void> {
  await db
    .update(tables.sessions)
    .set({ expiresAt })
    .where(eq(tables.sessions.id, sessionId));
}

export async function deleteSession(sessionId: string): Promise<void> {
  await db.delete(tables.sessions).where(eq(tables.sessions.id, sessionId));
}

export async function deleteAccountSessions(accountId: string): Promise<void> {
  await db
    .delete(tables.sessions)
    .where(eq(tables.sessions.accountId, accountId));
}

export async function deleteExpiredSessions(): Promise<void> {
  await db
    .delete(tables.sessions)
    .where(lt(tables.sessions.expiresAt, new Date()));
}
