export type CaptureEmbedMethod = 'iframe' | 'javascript';
export type CapturePublication = {
  id: string; version: number; name: string; hostedUrl: string;
  status: 'active' | 'paused' | 'scheduled' | 'archived' | 'blocked';
  /** Server-issued public installation artifacts, displayed as text and never executed here. */
  embeds: readonly { method: CaptureEmbedMethod; code: string }[];
  scheduledAt?: string; timezone?: string;
};
export function validCapturePublication(publication: CapturePublication): boolean {
  try {
    const url = new URL(publication.hostedUrl);
    if (!(url.protocol === 'https:' || url.protocol === 'http:' && ['localhost', '127.0.0.1'].includes(url.hostname)) || url.username || url.password) return false;
    if (!publication.id || !publication.name.trim() || !Number.isSafeInteger(publication.version) || publication.version < 1) return false;
    if (!['active', 'paused', 'scheduled', 'archived', 'blocked'].includes(publication.status)) return false;
    if (!publication.embeds.length || publication.embeds.length > 2 || new Set(publication.embeds.map(embed => embed.method)).size !== publication.embeds.length) return false;
    if (publication.embeds.some(embed => !['iframe', 'javascript'].includes(embed.method) || !embed.code.trim() || embed.code.length > 20000)) return false;
    if (publication.status === 'scheduled') {
      if (!publication.scheduledAt || !/(Z|[+-]\d{2}:\d{2})$/.test(publication.scheduledAt) || !Number.isFinite(Date.parse(publication.scheduledAt)) || !publication.timezone) return false;
      new Intl.DateTimeFormat('en-US', { timeZone: publication.timezone }).format(new Date(publication.scheduledAt));
    }
    return true;
  } catch { return false; }
}
