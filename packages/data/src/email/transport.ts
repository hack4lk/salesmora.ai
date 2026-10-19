import nodemailer from 'nodemailer';

export type EmailMessage = {
  to: string;
  subject: string;
  text: string;
  html: string;
  idempotencyKey?: string;
  attachments?: { filename: string; content: Buffer; contentType: string; cid: string; contentDisposition: 'inline' }[];
};

const localTransport = nodemailer.createTransport({
  host: '127.0.0.1', port: 11025, secure: false, ignoreTLS: true,
  connectionTimeout: 5000, greetingTimeout: 5000, socketTimeout: 10000,
});

function emailConfiguration(baseURL: string) {
  const url = new URL(baseURL);
  const local = ['127.0.0.1', 'localhost', '[::1]'].includes(url.hostname);
  const provider = process.env.EMAIL_PROVIDER ?? 'mailpit';
  if (provider === 'mailpit' && local) return { provider: 'mailpit' as const, from: 'SalesMora.ai <no-reply@salesmora.test>' };
  if (provider !== 'resend' || local || url.protocol !== 'https:') throw new Error('Email transport is not configured for this app origin.');
  const key = process.env.RESEND_API_KEY;
  const from = process.env.EMAIL_FROM;
  if (!key || !from || /[\r\n]/.test(from) || !/^[^<>]*<[^\s<>@]+@[^\s<>@]+\.[^\s<>@]+>$/.test(from)) {
    throw new Error('Email provider credentials or sender are missing or invalid.');
  }
  return { provider: 'resend' as const, from, key };
}

/** Check configuration for every reset request, including unknown accounts. */
export async function verifyEmailDelivery(baseURL: string) {
  const config = emailConfiguration(baseURL);
  if (config.provider === 'mailpit') await localTransport.verify();
}

export async function sendEmail(message: EmailMessage, baseURL: string) {
  const config = emailConfiguration(baseURL);
  if (config.provider === 'mailpit') {
    const { idempotencyKey, ...payload } = message;
    await localTransport.sendMail({ ...payload, ...(idempotencyKey ? { messageId: `<${idempotencyKey}@salesmora.test>` } : {}), from: config.from });
    return;
  }
  // Durable assignment retries supply a stable provider idempotency key; ordinary mail callers do not retry here.
  // Never surface provider bodies, recipients, credentials or token-bearing links.
  try {
    const options = {
      method: 'POST',
      headers: { Authorization: `Bearer ${config.key}`, 'Content-Type': 'application/json', ...(message.idempotencyKey ? { 'Idempotency-Key': message.idempotencyKey } : {}) },
      body: JSON.stringify({ subject: message.subject, text: message.text, html: message.html, from: config.from, to: [message.to],
        attachments: message.attachments?.map(attachment => ({
          filename: attachment.filename, content: attachment.content.toString('base64'),
          content_type: attachment.contentType, content_id: attachment.cid,
        })),
      }),
      signal: AbortSignal.timeout(10_000),
      cache: 'no-store' as const,
    };
    const response = await fetch('https://api.resend.com/emails', options);
    if (!response.ok) throw new Error('Email provider rejected delivery.');
    const result: unknown = await response.json();
    if (!result || typeof result !== 'object' || !('id' in result) || typeof result.id !== 'string' || !result.id) throw new Error('Invalid email provider response.');
  } catch {
    throw new Error('Email delivery is temporarily unavailable.');
  }
}
