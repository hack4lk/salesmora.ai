import { describe, expect, it } from 'vitest';
import { validCapturePublication as valid, type CapturePublication } from './capture-publication-instructions.validation';
const publication: CapturePublication = { id: 'source', version: 1, name: 'Form', status: 'active', hostedUrl: 'https://forms.salesmora.example/f/source', embeds: [{ method: 'iframe', code: '<iframe title="Form"></iframe>' }] };
describe('public installation details', () => {
  it('accepts immutable publication details for supported availability states', () => {
    for (const status of ['active', 'paused', 'archived', 'blocked'] as const) expect(valid({ ...publication, status })).toBe(true);
    expect(valid({ ...publication, id: '' })).toBe(false); expect(valid({ ...publication, version: 0 })).toBe(false);
  });
  it('rejects unsafe link schemes, credentials and malformed URLs', () => {
    for (const hostedUrl of ['javascript:alert(1)', 'data:text/html,form', 'http://forms.example/f', 'https://user:secret@example.com', '/relative']) expect(valid({ ...publication, hostedUrl })).toBe(false);
  });
  it('requires distinct supported nonempty embed artifacts', () => {
    expect(valid({ ...publication, embeds: [] })).toBe(false); expect(valid({ ...publication, embeds: [...publication.embeds, ...publication.embeds] })).toBe(false);
    expect(valid({ ...publication, embeds: [{ method: 'iframe', code: ' ' }] })).toBe(false); expect(valid({ ...publication, embeds: [{ method: 'iframe', code: 'x'.repeat(20001) }] })).toBe(false);
  });
  it('requires an absolute scheduled instant and valid business timezone', () => {
    expect(valid({ ...publication, status: 'scheduled', scheduledAt: '2026-10-30T13:00:00Z', timezone: 'America/New_York' })).toBe(true);
    for (const change of [{}, { scheduledAt: '2026-10-30T09:00', timezone: 'America/New_York' }, { scheduledAt: '2026-10-30T13:00Z', timezone: 'invalid' }]) expect(valid({ ...publication, status: 'scheduled', ...change })).toBe(false);
  });
});
