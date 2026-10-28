import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';

vi.mock('server-only', () => ({}));
const smtp = vi.hoisted(() => ({ verify: vi.fn(), sendMail: vi.fn() }));
vi.mock('nodemailer', () => ({ default: { createTransport: () => smtp } }));
import { sendEmail, verifyEmailDelivery } from './transport';

const origin = 'https://web-staging-cc17.up.railway.app';
const message = { to: 'test@example.com', subject: 'Test', text: 'Private link', html: '<p>Private link</p>' };
const request = vi.fn();
beforeEach(() => {
  vi.stubEnv('EMAIL_PROVIDER', 'resend');
  vi.stubEnv('EMAIL_FROM', 'SalesMora Staging <no-reply@staging.mail.salesmora.ai>');
  vi.stubEnv('RESEND_API_KEY', 'fictional-test-key');
  vi.stubGlobal('fetch', request);
  smtp.sendMail.mockResolvedValue({ messageId: '<fictional-id@salesmora.test>' });
  request.mockResolvedValue(new Response(JSON.stringify({ id: 'fictional-id' })));
});
afterEach(() => { vi.unstubAllEnvs(); vi.unstubAllGlobals(); vi.clearAllMocks(); });

describe('email transport boundaries', () => {
  it('preserves local SMTP and refuses remote SMTP origins', async () => {
    vi.stubEnv('EMAIL_PROVIDER', 'mailpit');
    await verifyEmailDelivery('http://127.0.0.1:3000');
    await sendEmail(message, 'http://127.0.0.1:3000');
    expect(smtp.verify).toHaveBeenCalledOnce();
    expect(smtp.sendMail).toHaveBeenCalledWith(expect.objectContaining({ from: 'SalesMora.ai <no-reply@salesmora.test>' }));
    await expect(sendEmail(message, origin)).rejects.toThrow('not configured');
    expect(request).not.toHaveBeenCalled();
  });
  it('rejects local provider sends, plaintext origins and missing credentials', async () => {
    await expect(sendEmail(message, 'http://127.0.0.1:3000')).rejects.toThrow('not configured');
    await expect(sendEmail(message, 'http://staging.example.com')).rejects.toThrow('not configured');
    vi.stubEnv('RESEND_API_KEY', '');
    await expect(verifyEmailDelivery(origin)).rejects.toThrow('missing or invalid');
    expect(request).not.toHaveBeenCalled();
  });
  it('serializes inline CID attachments and sends to the fixed HTTPS endpoint', async () => {
    await sendEmail({ ...message, attachments: [{ filename: 'logo.png', content: Buffer.from('logo'), contentType: 'image/png', cid: 'salesmora-logo', contentDisposition: 'inline' }] }, origin);
    const [url, options] = request.mock.calls[0];
    expect(url).toBe('https://api.resend.com/emails');
    expect(JSON.parse(options.body)).toMatchObject({ to: [message.to], attachments: [{ content: Buffer.from('logo').toString('base64'), content_id: 'salesmora-logo', content_type: 'image/png' }] });
    expect(options.cache).toBe('no-store');
    expect(options.signal).toBeInstanceOf(AbortSignal);
  });
  it('does not contact the provider when checking configuration for password reset', async () => {
    await verifyEmailDelivery(origin);
    expect(request).not.toHaveBeenCalled();
  });
  it.each(['rejection', 'network', 'invalid response'])('hides provider details and never retries on %s', async failure => {
    if (failure === 'rejection') request.mockResolvedValue(new Response('private provider detail', { status: 403 }));
    if (failure === 'network') request.mockRejectedValue(new Error('secret credentials'));
    if (failure === 'invalid response') request.mockResolvedValue(new Response('{}'));
    await expect(sendEmail(message, origin)).rejects.toThrow('Email delivery is temporarily unavailable.');
    expect(request).toHaveBeenCalledOnce();
  });
});
