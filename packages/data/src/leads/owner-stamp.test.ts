import { expect, it } from 'vitest';
import { leadOwnerStamp } from './owner-stamp';
it('detects assignment, member visibility and active display-name changes without retaining the name', () => {
  const owner = { id: 'opaque-user', name: 'Private owner', former: false };
  expect(leadOwnerStamp(owner)).toMatch(/^[a-f0-9]{64}$/);
  for (const changed of [null, { ...owner, id: 'another' }, { ...owner, name: 'Renamed' }, { ...owner, former: true }]) expect(leadOwnerStamp(changed)).not.toBe(leadOwnerStamp(owner));
  expect(leadOwnerStamp({ ...owner, former: true })).toBe(leadOwnerStamp({ ...owner, former: true, name: 'Different private former name' }));
});
