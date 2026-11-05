import { describe, expect, it } from 'vitest';
import { captureDuplicateIssue as issue, captureDuplicateName as suggested, validCaptureDuplicateName as validName, type CaptureDuplicateSource } from './capture-duplicate-dialog.validation';
const source: CaptureDuplicateSource = { id: 'source', version: 2, name: 'Website', type: 'website', status: 'active', canDuplicate: true, readiness: 'ready', configuration: { kind: 'approved', version: 3, summary: [{ label: 'Fields', value: 'Name, email' }] } };
describe('draft source duplication', () => {
  it('allows all existing source states with a current copy capability', () => {
    for (const status of ['draft', 'active', 'paused', 'scheduled', 'archived'] as const) expect(issue({ ...source, status })).toBeNull();
    expect(issue({ ...source, canDuplicate: false })).toBe('forbidden');
  });
  it('requires current source and configuration identities', () => {
    expect(issue({ ...source, version: 0 })).toBe('invalid'); expect(issue({ ...source, id: '' })).toBe('invalid');
    expect(issue({ ...source, configuration: { ...source.configuration, version: 0 } })).toBe('invalid'); expect(issue({ ...source, configuration: { ...source.configuration, summary: [] } })).toBe('invalid');
  });
  it('blocks unresolved draft creation access without depending on publication capacity', () => {
    expect(issue({ ...source, readiness: 'checking' })).toBe('checking'); expect(issue({ ...source, readiness: 'blocked' })).toBe('blocked');
  });
  it('validates a nonempty name within the existing 80-character limit', () => {
    expect(validName('  ')).toBe(false); expect(validName('x'.repeat(81))).toBe(false); expect(validName('x'.repeat(80))).toBe(true);
  });
  it('suggests a bounded copy name without cutting Unicode characters', () => {
    expect(suggested(' Website ')).toBe('Website (copy)');
    const name = suggested('😀'.repeat(60)); expect(validName(name)).toBe(true); expect(name.endsWith(' (copy)')).toBe(true); expect(name).not.toMatch(/[\uD800-\uDBFF](?![\uDC00-\uDFFF])/);
  });
});
