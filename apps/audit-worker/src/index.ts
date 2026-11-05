import { createDatabase } from '@salesmora/data/database';
import { AuditPreparationError, prepareAdminAuditArchive } from '@salesmora/data/admin-audit-preparation';
import { auditWorkerConfiguration } from './config';

async function main() {
  const config = auditWorkerConfiguration(process.env, process.argv.slice(2));
  const db = createDatabase(config.databaseURL);
  try {
    const result = await prepareAdminAuditArchive(db, config.ledgerId);
    console.log(JSON.stringify({
      event: 'audit.preparation', state: result.state, jobId: result.jobId,
      ...(result.state === 'prepared' ? { attempt: result.attempt, checkpointSHA256: result.archive.checkpointSHA256 } : {}),
      copied: false, externallyVerified: false,
    }));
  } finally {
    await db.destroy();
  }
}

void main().catch((error: unknown) => {
  console.error(JSON.stringify({
    event: 'audit.preparation_failed',
    code: error instanceof AuditPreparationError ? error.code : 'configuration_or_database_failure',
  }));
  process.exitCode = 1;
});
