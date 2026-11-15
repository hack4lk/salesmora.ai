import { describe, expect, it } from 'vitest';
import { proposalStorageAuthoritySchema } from './proposal-storage-authority';

describe('proposal storage release contract', () => {
  it.each(['legacy', 'canonical'])('accepts supported %s authority', store => {
    expect(proposalStorageAuthoritySchema.parse({ id: 1, store, contractVersion: 1 }).store).toBe(store);
  });
  it.each([
    undefined, null, {}, { id: 2, store: 'canonical', contractVersion: 1 },
    { id: 1, store: 'canonical', contractVersion: 2 }, { id: 1, store: 'canonical' },
    { id: 1, store: 'unknown', contractVersion: 1 },
  ])('rejects missing, malformed or unsupported authority without a legacy default (%j)', row => {
    expect(() => proposalStorageAuthoritySchema.parse(row)).toThrow();
  });
});
