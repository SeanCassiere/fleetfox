import crypto from 'node:crypto';

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
