import { describe, expect, it } from 'vitest';
import { estimateSharingAvailable } from './rollout';

describe('estimate sharing rollout', () => {
  it.each(['http://localhost:3000', 'http://127.0.0.1:3002', 'http://[::1]:3000'])('retains local sharing: %s', origin => {
    expect(estimateSharingAvailable(origin)).toBe(true);
  });
  it('requires both an explicit switch and the staging environment for external HTTPS', () => {
    const origin = 'https://web-staging.example.test';
    expect(estimateSharingAvailable(origin, { environment: 'staging', enabled: true })).toBe(true);
    for (const rollout of [{}, { environment: 'staging' }, { environment: 'production', enabled: true }, { enabled: true }]) {
      expect(estimateSharingAvailable(origin, rollout)).toBe(false);
    }
  });
  it.each(['', 'invalid', 'http://staging.example.test', 'ftp://localhost', 'https://user:pw@staging.example.test', 'https://staging.example.test/path', 'https://staging.example.test/?key=private', 'https://staging.example.test/#private'])('fails closed for invalid origins: %s', origin => {
    expect(estimateSharingAvailable(origin, { environment: 'staging', enabled: true })).toBe(false);
  });
});
