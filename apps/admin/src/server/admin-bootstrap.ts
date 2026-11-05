import { createDatabase } from '@salesmora/data/database';
import { createBootstrapSuperAdminInvitation } from '@salesmora/data/admin-invitations';
import { getAdminAuthConfiguration } from './auth-config';

const args = process.argv.slice(2);
const [email, ...remainingArguments] = args[0] === '--' ? args.slice(1) : args;
if (!email || remainingArguments.length > 0) {
  throw new Error('Usage: pnpm admin:bootstrap -- <staff-email@karpukcreative.com>');
}

const configuration = getAdminAuthConfiguration();
const database = createDatabase(configuration.databaseUrl);

try {
  const invitation = await createBootstrapSuperAdminInvitation(database, { email });
  const url = new URL('/enroll', configuration.baseURL);
  url.searchParams.set('token', invitation.token);
  console.log(url.href);
} finally {
  await database.destroy();
}
