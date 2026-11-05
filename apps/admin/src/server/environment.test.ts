import { describe, expect, it } from 'vitest';
import { getAdminEnvironment } from './environment';

describe('admin environment', () => {
  it('uses local only outside production when no deployment environment is configured', () => {
    expect(getAdminEnvironment(undefined, 'development')).toBe('local');
    expect(getAdminEnvironment(undefined, 'test')).toBe('local');
  });

  it.each(['staging', 'production'] as const)('uses the configured %s environment', environment => {
    expect(getAdminEnvironment(environment, 'production')).toBe(environment);
  });

  it('requires an explicit staging or production badge in production', () => {
    expect(() => getAdminEnvironment(undefined, 'production')).toThrow(/ADMIN_ENVIRONMENT/);
    expect(() => getAdminEnvironment('local', 'production')).toThrow(/ADMIN_ENVIRONMENT/);
  });

  it('rejects unknown environments instead of showing a misleading badge', () => {
    expect(() => getAdminEnvironment('preview', 'development')).toThrow(/ADMIN_ENVIRONMENT/);
  });
});
