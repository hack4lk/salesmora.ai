import { describe, expect, it } from 'vitest';
import { runAuditCopyRehearsal, runAuditVerifierRehearsal } from './publication';
import type { AuditArchiveReader, AuditArchiveWriter, AuditArchiveLockReader } from '@salesmora/data/admin-audit-delivery';

const target = { accountId: 'a'.repeat(32), bucket: 'audit-fictional-only', jurisdiction: 'default' as const };
const reader: AuditArchiveReader = { target, async get() { throw new Error('Must not request storage.'); } };
const writer: AuditArchiveWriter = { target, async create() { throw new Error('Must not request storage.'); } };
const locks: AuditArchiveLockReader = { target, async rules() { throw new Error('Must not request storage.'); } };

describe('publication runtime gates', () => {
  it('refuses delivery/verifier invocation without explicit fictional-storage mode', async () => {
    await expect(runAuditCopyRehearsal({}, { writer, reader, locks })).rejects.toThrow('not enabled');
    await expect(runAuditVerifierRehearsal({}, { reader, locks })).rejects.toThrow('not enabled');
  });
  it('refuses missing and production DB configuration before opening resources', async () => {
    await expect(runAuditVerifierRehearsal({ ADMIN_AUDIT_REHEARSAL: 'fictional-storage' }, { reader, locks }))
      .rejects.toThrow('DATABASE_URL');
    await expect(runAuditCopyRehearsal({
      ADMIN_AUDIT_REHEARSAL: 'fictional-storage', NODE_ENV: 'production',
      ADMIN_AUDIT_DATABASE_URL: 'postgres://salesmora_audit_worker:fictional@localhost/audit_test',
      ADMIN_AUDIT_LEDGER_ID: '00000000-0000-4000-8000-000000000001',
    }, { writer, reader, locks })).rejects.toThrow('restricted');
  });
});
