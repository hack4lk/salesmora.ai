import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
const smtp = vi.hoisted(() => ({ sendMail: vi.fn() }));
vi.mock('nodemailer', () => ({ default: { createTransport: () => smtp } }));
import { estimateEmailDeliveryAvailable, sendEstimateEmail } from './transport';

const origin = 'https://staging.example.test';
const mail = {
  to: 'fixture@example.test', subject: 'Fixture estimate', text: 'Fictional estimate', html: '<p>Fixture</p>',
  replyTo: 'business@example.test', idempotencyKey: 'estimate-delivery-12345678-1234-1234-1234-123456789abc',
  attachments: [{ filename: 'logo.png', content: Buffer.from('fixture'), contentType: 'image/png', cid: 'salesmora-logo', contentDisposition: 'inline' as const }],
};
const fetcher = vi.fn();
beforeEach(() => {
  vi.useFakeTimers(); vi.setSystemTime(new Date('2026-10-28T12:00:00Z'));
  vi.stubEnv('RAILWAY_ENVIRONMENT_NAME', 'staging'); vi.stubEnv('ESTIMATE_EMAIL_ENABLED', 'true');
  vi.stubEnv('EMAIL_PROVIDER', 'resend'); vi.stubEnv('EMAIL_FROM', 'SalesMora Staging <no-reply@example.test>');
  vi.stubEnv('RESEND_API_KEY', 'fictional-key');
  vi.stubGlobal('fetch', fetcher);
  fetcher.mockResolvedValue(new Response(JSON.stringify({ id: 'fictional-receipt' })));
});
afterEach(() => { vi.useRealTimers(); vi.clearAllMocks(); vi.unstubAllEnvs(); vi.unstubAllGlobals(); });

describe('staging Estimate delivery', () => {
  it('uses the shared HTTPS transport, stable key, reply-to and inline logo without Mailpit IO', async () => {
    expect(estimateEmailDeliveryAvailable(origin)).toBe(true);
    expect(await sendEstimateEmail(mail, origin, new Date())).toEqual({ providerMessageId: 'fictional-receipt' });
    const [url, options] = fetcher.mock.calls[0];
    expect(url).toBe('https://api.resend.com/emails');
    expect(options.headers).toMatchObject({ 'Idempotency-Key': mail.idempotencyKey });
    expect(JSON.parse(options.body)).toMatchObject({ to: [mail.to], reply_to: mail.replyTo,
      attachments: [{ filename: 'logo.png', content_id: 'salesmora-logo', content: Buffer.from('fixture').toString('base64') }] });
    expect(JSON.parse(options.body)).not.toHaveProperty('queuedAt');
    expect(smtp.sendMail).not.toHaveBeenCalled();
  });
  it.each(['production', 'development', ''])('refuses non-staging external delivery in %s even with the flag on', async environment => {
    vi.stubEnv('RAILWAY_ENVIRONMENT_NAME', environment);
    expect(estimateEmailDeliveryAvailable(origin)).toBe(false);
    await expect(sendEstimateEmail(mail, origin, new Date())).rejects.toThrow('not configured');
    expect(fetcher).not.toHaveBeenCalled();
  });
  it.each(['ESTIMATE_EMAIL_ENABLED', 'RESEND_API_KEY', 'EMAIL_FROM'])('fails closed without %s', async key => {
    vi.stubEnv(key, '');
    expect(estimateEmailDeliveryAvailable(origin)).toBe(false);
    await expect(sendEstimateEmail(mail, origin, new Date())).rejects.toThrow('not configured');
    expect(fetcher).not.toHaveBeenCalled();
  });
  it.each(['invalid', '2026-10-28T12:00:01Z', '2026-10-27T13:00:00Z', '2026-10-26T12:00:00Z'])('refuses invalid or stale delivery times without sending: %s', async queuedAt => {
    await expect(sendEstimateEmail(mail, origin, queuedAt)).rejects.toThrow('window expired');
    expect(fetcher).not.toHaveBeenCalled();
  });
  it('requires a stable delivery ID and masks provider failures', async () => {
    await expect(sendEstimateEmail({ ...mail, idempotencyKey: 'unstable' }, origin, new Date())).rejects.toThrow('stable delivery key');
    expect(fetcher).not.toHaveBeenCalled();
    fetcher.mockRejectedValue(new Error('PRIVATE provider recipient and credential'));
    await expect(sendEstimateEmail(mail, origin, new Date())).rejects.toThrow('Email delivery is temporarily unavailable.');
  });
  it('retains Mailpit receipt recovery locally without the staging switch', async () => {
    vi.stubEnv('EMAIL_PROVIDER', 'mailpit'); vi.stubEnv('ESTIMATE_EMAIL_ENABLED', 'false');
    fetcher.mockResolvedValue(new Response(JSON.stringify({ messages_count: 0, messages: [] })));
    smtp.sendMail.mockResolvedValue({ messageId: 'fixture-local-receipt' });
    expect(await sendEstimateEmail(mail, 'http://127.0.0.1:3000', new Date())).toEqual({ providerMessageId: 'fixture-local-receipt' });
    expect(fetcher.mock.calls[0][0].origin).toBe('http://127.0.0.1:18025');
    expect(smtp.sendMail).toHaveBeenCalledOnce();
  });
});
