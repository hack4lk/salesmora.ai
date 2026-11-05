import { createDatabase } from '@salesmora/data/database';
import { createAuditBaselineStore } from '@salesmora/data/admin-audit-baseline';
import { copyNextAdminAuditArchive, verifyNextAdminAuditArchive } from '@salesmora/data/admin-audit-publication';
import type { AuditArchiveReader, AuditArchiveWriter, AuditArchiveLockReader } from '@salesmora/data/admin-audit-delivery';
import { auditWorkerConfiguration, auditVerifierConfiguration } from './config';

export async function runAuditCopyRehearsal(
  env: NodeJS.ProcessEnv,
  capabilities: { writer: AuditArchiveWriter; reader: AuditArchiveReader; locks: AuditArchiveLockReader },
) {
  if (env.ADMIN_AUDIT_REHEARSAL !== 'fictional-storage') {
    throw new Error('Delivery runtime is not enabled; only explicit fictional-storage rehearsal is available.');
  }
  const config = auditWorkerConfiguration(env, []);
  const db = createDatabase(config.databaseURL);
  try {
    return await copyNextAdminAuditArchive(db, config.ledgerId, capabilities.writer, capabilities.reader, capabilities.locks);
  } finally { await db.destroy(); }
}

export async function runAuditVerifierRehearsal(
  env: NodeJS.ProcessEnv,
  capabilities: { reader: AuditArchiveReader; locks: AuditArchiveLockReader },
) {
  if (env.ADMIN_AUDIT_REHEARSAL !== 'fictional-storage') {
    throw new Error('Verifier runtime is not enabled; only explicit fictional-storage rehearsal is available.');
  }
  const config = auditVerifierConfiguration(env);
  const baseline = await createAuditBaselineStore(config.directory);
  const db = createDatabase(config.databaseURL);
  try {
    return await verifyNextAdminAuditArchive(db, config.ledgerId, capabilities.reader, capabilities.locks, baseline);
  } finally { await db.destroy(); }
}
