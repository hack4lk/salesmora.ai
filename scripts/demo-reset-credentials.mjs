import { constants, closeSync, fchmodSync, fstatSync, openSync, readFileSync, writeSync } from 'node:fs';
import { randomBytes } from 'node:crypto';
import { parseEnv } from 'node:util';

export const demoPasswordKeys = [
  'DEMO_OWNER_PASSWORD',
  'DEMO_ADMIN_PASSWORD',
  'DEMO_OFFICE_PASSWORD',
  'DEMO_FIELD_PASSWORD',
  'DEMO_FREE_OWNER_PASSWORD',
  'DEMO_STANDARD_OWNER_PASSWORD',
];

export function prepareDemoCredentials(path) {
  const fd = openSync(path, constants.O_RDWR | constants.O_NOFOLLOW);
  try {
    const stat = fstatSync(fd);
    if (!stat.isFile() || (process.getuid && stat.uid !== process.getuid())) {
      throw new Error('The local environment file must be a regular file owned by the current user.');
    }
    const content = readFileSync(fd, 'utf8');
    const parsed = parseEnv(content);
    const credentials = {};
    const missing = [];
    for (const key of demoPasswordKeys) {
      const definitions = content.match(new RegExp(`^[ \\t]*(?:export[ \\t]+)?${key}[ \\t]*=`, 'gm')) ?? [];
      if (definitions.length > 1) throw new Error(`${key} is defined more than once in .env.local.`);
      if (definitions.length === 0) {
        credentials[key] = randomBytes(32).toString('base64url');
        missing.push(key);
      } else {
        const password = parsed[key];
        if (typeof password !== 'string' || password.length < 8 || password.length > 128 ||
            /[\r\n]/.test(password)) {
          throw new Error(`${key} must contain a password of 8 to 128 characters on one line.`);
        }
        credentials[key] = password;
      }
    }
    fchmodSync(fd, 0o600);
    if (missing.length) {
      const lines = missing.map(key => `${key}=${credentials[key]}`).join('\n');
      const addition = `${content && !content.endsWith('\n') ? '\n' : ''}${lines}\n`;
      const buffer = Buffer.from(addition);
      if (writeSync(fd, buffer, 0, buffer.length, stat.size) !== buffer.length) {
        throw new Error('Unable to write all demo credentials to .env.local.');
      }
    }
    return credentials;
  } finally {
    closeSync(fd);
  }
}
