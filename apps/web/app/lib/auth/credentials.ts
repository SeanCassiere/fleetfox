import crypto from 'node:crypto';
import { db } from '../db';

export async function hashPassword(password: string) {
  return new Promise<string>((resolve, reject) => {
    // generate random 16 bytes long salt
    const salt = crypto.randomBytes(16).toString('hex');

    crypto.scrypt(password, salt, 64, (err, derivedKey) => {
      if (err) reject(err);
      resolve(salt + ':' + derivedKey.toString('hex'));
    });
  });
}

export async function verifyPassword(attempt: string, hash: string) {
  return new Promise<boolean>((resolve, reject) => {
    const [salt, key] = hash.split(':');
    crypto.scrypt(attempt, salt, 64, (err, derivedKey) => {
      if (err) reject(err);
      resolve(key == derivedKey.toString('hex'));
    });
  });
}

export async function verifyLogin(email: string, password: string) {
  const account = await db.query.accounts.findFirst({
    where(fields, operators) {
      return operators.and(operators.eq(fields.email, email.toLowerCase()));
    },
  });
  if (!account) {
    // account creation with tenant
    return null;
  }

  if (!account.password) {
    return null;
  }

  const matchPasswords = await verifyPassword(password, account.password);
  if (!matchPasswords) {
    return null;
  }

  return { id: account.id, name: account.name, email: account.email };
}
