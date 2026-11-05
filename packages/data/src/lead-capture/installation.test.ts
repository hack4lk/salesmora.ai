import { expect, it } from 'vitest';
import { captureInstallation } from './installation';
const publication = { publicKey: 'a'.repeat(64), configurationVersion: 7 }, source = { id: '00000000-0000-4000-8000-000000000001', name: '<Untrusted name>', status: 'active', block: 'none', scheduledAt: null, timezone: null };
it('projects persisted keys and approved version without executable source content', () => {
  const result = captureInstallation('https://forms.salesmora.ai', publication, source);
  expect(result.version).toBe(7); expect(result.hostedUrl).toBe(`https://forms.salesmora.ai/f/${publication.publicKey}`); expect(result.embeds[1].code).toContain(`data-public-key="${publication.publicKey}"`); expect(JSON.stringify(result.embeds)).not.toContain(source.name);
  expect(captureInstallation('https://forms.salesmora.ai', publication, { ...source, block: 'workspace' }).status).toBe('blocked');
  for (const origin of ['https://user:secret@evil.test', 'https://forms.salesmora.ai/path', 'javascript:alert(1)', 'http://public.test']) expect(() => captureInstallation(origin, publication, source)).toThrow();
  expect(() => captureInstallation('https://forms.salesmora.ai', { ...publication, publicKey: '"><script>' }, source)).toThrow();
});
