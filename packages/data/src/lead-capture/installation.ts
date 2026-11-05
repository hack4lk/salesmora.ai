import { captureInstallationSchema } from '@salesmora/contracts';
/** Internal projection: origin comes from validated server delivery policy, never request input. */
export function captureInstallation(origin: string, publication: { publicKey: string; configurationVersion: number }, source: { id: string; name: string; status: string; block: string; scheduledAt: Date | null; timezone: string | null }) {
  const url = new URL(origin);
  if (url.origin !== origin || url.username || url.password || !(url.protocol === 'https:' || url.protocol === 'http:' && ['localhost', '127.0.0.1'].includes(url.hostname)) || !/^[a-f0-9]{64}$/.test(publication.publicKey)) throw Error('Invalid installation origin or publication.');
  const attribute = (value: string) => value.replaceAll('&', '&amp;').replaceAll('"', '&quot;').replaceAll('<', '&lt;').replaceAll('>', '&gt;');
  const key = publication.publicKey;
  return captureInstallationSchema.parse({ id: source.id, version: publication.configurationVersion, name: source.name, hostedUrl: `${origin}/f/${key}`, status: source.block !== 'none' ? 'blocked' : source.status,
    embeds: [{ method: 'iframe', code: `<iframe src="${attribute(origin)}/embed/${key}" title="Service request form" width="100%" height="1000" style="border:0" referrerpolicy="no-referrer" loading="lazy"></iframe>` },
      { method: 'javascript', code: `<script async src="${attribute(origin)}/embed.js" data-public-key="${key}"></script>` }],
    ...(source.status === 'scheduled' ? { scheduledAt: source.scheduledAt?.toISOString(), timezone: source.timezone ?? undefined } : {}) });
}
