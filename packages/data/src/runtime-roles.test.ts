import { describe, expect, it, vi } from 'vitest';
import type { Knex } from 'knex';
import { assertRuntimeDatabaseRole, databaseRoleProblems, type DatabaseRoleFacts } from './runtime-roles';

const runtime: DatabaseRoleFacts = { user: 'salesmora_web', superuser: false, databaseOwner: false, canCreateInPublic: false };
const owner: DatabaseRoleFacts = { user: 'salesmora', superuser: true, databaseOwner: true, canCreateInPublic: true };
const database = (facts: DatabaseRoleFacts) => ({ raw: vi.fn(async () => ({ rows: [facts] })) }) as unknown as Knex;

describe('database role self-check', () => {
  it('accepts a least-privilege runtime role', () => {
    expect(databaseRoleProblems(runtime)).toEqual([]);
  });

  it('lists every owner-level privilege', () => {
    expect(databaseRoleProblems(owner)).toEqual(['is a superuser', 'owns the database', 'can create objects in the public schema']);
    expect(databaseRoleProblems({ ...runtime, canCreateInPublic: true })).toEqual(['can create objects in the public schema']);
  });

  it('warns without enforcement and never prints connection details', async () => {
    const warn = vi.spyOn(console, 'warn').mockImplementation(() => {});
    await expect(assertRuntimeDatabaseRole(database(owner), 'Web', {})).resolves.toEqual(owner);
    expect(warn).toHaveBeenCalledWith(expect.stringContaining('Web database role "salesmora" is a superuser'));
    expect(warn.mock.calls[0][0]).not.toMatch(/postgres(ql)?:\/\//);
    warn.mockRestore();
  });

  it('refuses owner-level roles when enforced', async () => {
    await expect(assertRuntimeDatabaseRole(database(owner), 'Worker', { DATABASE_ROLE_ENFORCED: 'true' })).rejects.toThrow('Worker database role "salesmora" is a superuser');
    await expect(assertRuntimeDatabaseRole(database(runtime), 'Worker', { DATABASE_ROLE_ENFORCED: 'true' })).resolves.toEqual(runtime);
  });
});
