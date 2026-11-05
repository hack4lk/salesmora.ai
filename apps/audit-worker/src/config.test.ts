import { describe, expect, it } from 'vitest';
import { auditWorkerConfiguration, auditVerifierConfiguration } from './config';

const env = {
  ADMIN_AUDIT_DATABASE_URL: 'postgresql://salesmora_audit_worker:fictional-password@127.0.0.1:55432/salesmora_test',
  ADMIN_AUDIT_LEDGER_ID: '00000000-0000-4000-8000-000000000001',
};

describe('isolated preparation worker configuration', () => {
  it('accepts only explicit dedicated local test configuration', () => {
    expect(auditWorkerConfiguration(env, [])).toEqual({
      databaseURL: env.ADMIN_AUDIT_DATABASE_URL, ledgerId: env.ADMIN_AUDIT_LEDGER_ID,
    });
    expect(auditWorkerConfiguration({ ...env, ADMIN_AUDIT_LEDGER_ID: 'AAAAAAAA-AAAA-4AAA-8AAA-AAAAAAAAAAAA' }, []).ledgerId)
      .toBe('aaaaaaaa-aaaa-4aaa-8aaa-aaaaaaaaaaaa');
  });
  it('never falls back to customer/admin credentials or unsafe targets', () => {
    for (const value of [
      undefined, '', 'not-a-url', env.ADMIN_AUDIT_DATABASE_URL.replace('salesmora_audit_worker:', 'salesmora_admin_app:'),
      env.ADMIN_AUDIT_DATABASE_URL.replace('127.0.0.1', 'database.example'),
      env.ADMIN_AUDIT_DATABASE_URL.replace('/salesmora_test', '/salesmora'),
      `${env.ADMIN_AUDIT_DATABASE_URL}?user=owner`, `${env.ADMIN_AUDIT_DATABASE_URL}?options=-crole=owner`,
      `${env.ADMIN_AUDIT_DATABASE_URL}#secret`,
    ]) expect(() => auditWorkerConfiguration({
      ...env, DATABASE_URL: env.ADMIN_AUDIT_DATABASE_URL, ADMIN_AUDIT_DATABASE_URL: value,
    }, [])).toThrow();
    expect(() => auditWorkerConfiguration({ ...env, NODE_ENV: 'production' }, [])).toThrow('restricted');
    expect(() => auditWorkerConfiguration({ ...env, ADMIN_AUDIT_LEDGER_ID: 'random' }, [])).toThrow('stable');
    expect(() => auditWorkerConfiguration(env, ['--test'])).toThrow('arguments');
  });
  it('requires a separate verifier identity and explicit private state directory', () => {
    const verifierEnv = {
      ...env,
      ADMIN_AUDIT_VERIFIER_DATABASE_URL: env.ADMIN_AUDIT_DATABASE_URL.replace('salesmora_audit_worker', 'salesmora_audit_verifier'),
      ADMIN_AUDIT_VERIFIER_STATE_DIRECTORY: '/fictional/private/verifier',
    };
    expect(auditVerifierConfiguration(verifierEnv).directory).toBe('/fictional/private/verifier');
    expect(() => auditVerifierConfiguration({ ...verifierEnv, ADMIN_AUDIT_VERIFIER_DATABASE_URL: env.ADMIN_AUDIT_DATABASE_URL }))
      .toThrow('dedicated role');
    expect(() => auditVerifierConfiguration({ ...verifierEnv, ADMIN_AUDIT_VERIFIER_STATE_DIRECTORY: undefined })).toThrow('Private');
    expect(() => auditVerifierConfiguration({ ...verifierEnv, NODE_ENV: 'production' })).toThrow('restricted');
  });
});
