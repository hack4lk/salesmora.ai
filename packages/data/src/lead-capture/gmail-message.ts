import libmime from 'libmime';
import iconv from 'iconv-lite';
import { convert } from 'html-to-text';
import { z } from 'zod';

export class CaptureGmailMessageError extends Error {
  constructor() { super('This message cannot be used as a text example. Choose another message.'); }
}
const header = z.object({ name: z.string().max(200), value: z.string().max(8192) });
export type GmailPart = { mimeType?: string; filename?: string; headers?: z.infer<typeof header>[]; body?: { data?: string; attachmentId?: string; size?: number }; parts?: GmailPart[] };
const part: z.ZodType<GmailPart> = z.lazy(() => z.object({ mimeType: z.string().max(200).optional(), filename: z.string().max(1000).optional(), headers: z.array(header).max(100).optional(), body: z.object({ data: z.string().max(300000).optional(), attachmentId: z.string().max(500).optional(), size: z.number().int().nonnegative().optional() }).optional(), parts: z.array(part).max(50).optional() }));
const message = z.object({ id: z.string().regex(/^[A-Za-z0-9_-]{1,200}$/), internalDate: z.string().regex(/^\d{1,16}$/), payload: part });
function headerValue(payload: GmailPart, name: string) {
  const matches = (payload.headers ?? []).filter(row => row.name.toLowerCase() === name);
  if (matches.length > 1) throw new CaptureGmailMessageError();
  return matches[0]?.value ?? '';
}
export function gmailMessageMetadata(raw: unknown) {
  try {
    const value = message.parse(raw), date = new Date(Number(value.internalDate));
    const subject = libmime.decodeWords(headerValue(value.payload, 'subject')), sender = libmime.decodeWords(headerValue(value.payload, 'from'));
    if (subject.length > 500 || sender.length > 500) throw Error();
    return { id: value.id, subject, sender, receivedAt: date.toISOString() };
  } catch { throw new CaptureGmailMessageError(); }
}
/** Gmail already decodes MIME transfer encodings into base64url data. Never decode them twice. */
export function gmailMessageExample(raw: unknown) {
  try {
    const value = message.parse(raw), metadata = gmailMessageMetadata(raw);
    let nodes = 0, bytes = 0;
    const walk = (node: GmailPart, depth: number): { plain: string[]; html: string[] } => {
      if (++nodes > 50 || depth > 10) throw Error();
      const disposition = headerValue(node, 'content-disposition');
      if (node.filename || /^\s*attachment\b/i.test(disposition) || node.body?.attachmentId) return { plain: [], html: [] };
      const mime = node.mimeType?.toLowerCase();
      if (mime?.startsWith('multipart/')) {
        const children = (node.parts ?? []).map(child => walk(child, depth + 1));
        if (mime === 'multipart/alternative') {
          const plain = children.find(child => child.plain.length)?.plain ?? [];
          return { plain, html: plain.length ? [] : children.find(child => child.html.length)?.html ?? [] };
        }
        return { plain: children.flatMap(child => child.plain), html: children.flatMap(child => child.html) };
      }
      if (!['text/plain', 'text/html'].includes(mime ?? '') || !node.body?.data) return { plain: [], html: [] };
      const encoded = node.body.data;
      if (!/^[A-Za-z0-9_-]*={0,2}$/.test(encoded)) throw Error();
      const buffer = Buffer.from(encoded, 'base64url'); bytes += buffer.length;
      if (bytes > 200000 || buffer.toString('base64url') !== encoded.replace(/=+$/, '')) throw Error();
      const contentType = libmime.parseHeaderValue(headerValue(node, 'content-type') || mime!);
      const charset = contentType.params.charset || 'utf-8';
      if (!iconv.encodingExists(charset)) throw Error();
      const text = iconv.decode(buffer, charset);
      return mime === 'text/plain' ? { plain: [text], html: [] } : { plain: [], html: [text] };
    };
    const content = walk(value.payload, 0);
    const body = content.plain.length ? content.plain.join('\n\n') : convert(content.html.join('\n'), { wordwrap: false, limits: { maxInputLength: 200000, maxDepth: 20, maxChildNodes: 10000 }, selectors: [{ selector: 'img', format: 'skip' }, { selector: 'a', options: { ignoreHref: true } }, { selector: 'script', format: 'skip' }, { selector: 'style', format: 'skip' }] });
    if (!body.trim() || body.length > 20000 || body.includes('\u0000')) throw Error();
    return { ...metadata, body };
  } catch { throw new CaptureGmailMessageError(); }
}
