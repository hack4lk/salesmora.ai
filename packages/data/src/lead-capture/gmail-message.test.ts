import { describe, expect, it } from 'vitest';
import { CaptureGmailMessageError, gmailMessageMetadata, gmailMessageExample } from './gmail-message';
const encode = (value: string | Buffer) => Buffer.from(value).toString('base64url');
const plain = (body = 'Name: Alex\nEmail: alex@example.test') => ({ id: 'mail1', internalDate: '1793793600000', payload: { mimeType: 'text/plain', headers: [{ name: 'Subject', value: '=?UTF-8?B?V2F0ZXIgaGVhdGVy?=' }, { name: 'From', value: 'Alex <alex@example.test>' }], body: { data: encode(body) } } });
describe('Gmail message text boundary', () => {
  it('decodes encoded headers and preserves plain text evidence', () => {
    const raw = plain(); expect(gmailMessageMetadata(raw).subject).toBe('Water heater');
    expect(gmailMessageExample(raw).body).toBe('Name: Alex\nEmail: alex@example.test');
    expect(gmailMessageMetadata(raw)).not.toHaveProperty('body');
  });
  it('prefers plain multipart alternatives and ignores attachment content', () => {
    const raw = plain(); const text = raw.payload;
    const value = { ...raw, payload: { ...text, mimeType: 'multipart/mixed', body: undefined, parts: [{ mimeType: 'multipart/alternative', parts: [text, { mimeType: 'text/html', body: { data: encode('<b>Wrong alternative</b>') } }] }, { mimeType: 'text/plain', filename: 'private.txt', body: { data: encode('Do not include attachment') } }] } };
    expect(gmailMessageExample(value).body).toBe('Name: Alex\nEmail: alex@example.test');
  });
  it('converts HTML to inert text without image URLs or scripts', () => {
    const raw = plain(); raw.payload.mimeType = 'text/html'; raw.payload.body.data = encode('<p>Alex &amp; Pat</p><img src="https://example.test/track"><script>steal()</script><style>hidden</style><a href="https://evil.test">Contact</a>');
    const result = gmailMessageExample(raw).body;
    expect(result).toContain('Alex & Pat'); expect(result).toContain('Contact'); expect(result).not.toMatch(/track|steal|hidden|evil|<p>/);
  });
  it('decodes a supported non-UTF charset after Gmail transfer decoding', () => {
    const raw = plain(); raw.payload.headers.push({ name: 'Content-Type', value: 'text/plain; charset=iso-8859-1' });
    raw.payload.body.data = encode(Buffer.from([99, 97, 102, 233]));
    expect(gmailMessageExample(raw).body).toBe('café');
  });
  it.each(['', 'x'.repeat(20001), 'bad\u0000text'])('rejects empty, oversized and NUL text', body => {
    expect(() => gmailMessageExample(plain(body))).toThrow(CaptureGmailMessageError);
  });
  it('rejects invalid base64 and unsupported charsets without exposing input', () => {
    const raw = plain(); raw.payload.body.data = 'not%base64'; expect(() => gmailMessageExample(raw)).toThrow(CaptureGmailMessageError);
    raw.payload.body.data = encode('text'); raw.payload.headers.push({ name: 'Content-Type', value: 'text/plain; charset=not-a-real-charset' });
    expect(() => gmailMessageExample(raw)).toThrow(CaptureGmailMessageError);
  });
  it('does not request externally stored text/attachment bodies', () => {
    const raw = plain(); expect(() => gmailMessageExample({ ...raw, payload: { ...raw.payload, body: { attachmentId: 'attachment-only' } } })).toThrow(CaptureGmailMessageError);
  });
  it('rejects excessive nesting and ambiguous headers', () => {
    const raw = plain(); let payload: unknown = raw.payload;
    for (let i = 0; i < 12; i++) payload = { mimeType: 'multipart/mixed', parts: [payload] };
    expect(() => gmailMessageExample({ ...raw, payload })).toThrow(CaptureGmailMessageError);
    raw.payload.headers.push({ name: 'subject', value: 'Duplicate' }); expect(() => gmailMessageMetadata(raw)).toThrow(CaptureGmailMessageError);
  });
});
