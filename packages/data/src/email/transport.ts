import nodemailer from 'nodemailer';
import { estimateSharingAvailable } from '@salesmora/domain';

export type EmailMessage = {
  to: string;
  subject: string;
  text: string;
  html: string;
  idempotencyKey?: string;
  replyTo?: string;
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
    const result = await localTransport.sendMail({ ...payload, ...(idempotencyKey ? { messageId: `<${idempotencyKey}@salesmora.test>` } : {}), from: config.from });
    if (typeof result.messageId !== 'string' || !result.messageId) throw new Error('Invalid SMTP delivery receipt.');
    return { providerMessageId: result.messageId };
  }
  // Durable assignment retries supply a stable provider idempotency key; ordinary mail callers do not retry here.
  // Never surface provider bodies, recipients, credentials or token-bearing links.
  try {
    const options = {
      method: 'POST',
      headers: { Authorization: `Bearer ${config.key}`, 'Content-Type': 'application/json', ...(message.idempotencyKey ? { 'Idempotency-Key': message.idempotencyKey } : {}) },
      body: JSON.stringify({ subject: message.subject, text: message.text, html: message.html, from: config.from, to: [message.to],
        ...(message.replyTo ? { reply_to: message.replyTo } : {}),
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
    return { providerMessageId: result.id };
  } catch {
    throw new Error('Email delivery is temporarily unavailable.');
  }
}

export function localEstimateEmailDeliveryAvailable(baseURL: string, provider = process.env.EMAIL_PROVIDER ?? 'mailpit') {
  if (!baseURL) return false;
  return provider === 'mailpit' && estimateSharingAvailable(baseURL);
}

export function estimateEmailDeliveryAvailable(baseURL: string) {
  if (!estimateSharingAvailable(baseURL, {
    environment: process.env.RAILWAY_ENVIRONMENT_NAME,
    enabled: process.env.ESTIMATE_EMAIL_ENABLED === 'true',
  })) return false;
  try { emailConfiguration(baseURL); return true; } catch { return false; }
}

/** Keep retries inside Resend's 24-hour idempotency retention, including crash recovery. */
export async function sendEstimateEmail(message: EmailMessage, baseURL: string, queuedAt: string | Date) {
  if (!estimateEmailDeliveryAvailable(baseURL) || !message.idempotencyKey ||
      !/^estimate-delivery-[0-9a-f-]{36}$/.test(message.idempotencyKey)) {
    throw new Error('Estimate email delivery is not configured or has no stable delivery key.');
  }
  if (localEstimateEmailDeliveryAvailable(baseURL)) return sendLocalEstimateEmail(message, baseURL);
  const age = Date.now() - new Date(queuedAt).getTime();
  if (!Number.isFinite(age) || age < 0 || age >= 23 * 60 * 60 * 1000) {
    throw new Error('Estimate delivery window expired. Review and resend the estimate.');
  }
  return sendEmail(message, baseURL);
}

/** Recover SMTP success after a DB rollback/crash instead of duplicating the same local delivery. */
export async function sendLocalEstimateEmail(message: EmailMessage, baseURL: string) {
  if (!localEstimateEmailDeliveryAvailable(baseURL) ||
      !message.idempotencyKey || !/^estimate-delivery-[0-9a-f-]{36}$/.test(message.idempotencyKey)) {
    throw new Error('Estimate email delivery requires local Mailpit and a stable delivery key.');
  }
  const messageId = `${message.idempotencyKey}@salesmora.test`;
  const url = new URL('http://127.0.0.1:18025/api/v1/search');
  url.searchParams.set('query', `message-id:${messageId}`);
  try {
    const options = { cache: 'no-store' as const, signal: AbortSignal.timeout(5000) };
    const response = await fetch(url, options);
    if (!response.ok) throw new Error('Mailpit lookup failed.');
    const result: unknown = await response.json();
    if (!result || typeof result !== 'object' || !('messages' in result) || !Array.isArray(result.messages) ||
        !('messages_count' in result) || !Number.isSafeInteger(result.messages_count) ||
        result.messages_count !== result.messages.length) {
      throw new Error('Invalid Mailpit lookup.');
    }
    for (const item of result.messages) {
      if (!item || typeof item !== 'object' || !('MessageID' in item) || typeof item.MessageID !== 'string') {
        throw new Error('Invalid Mailpit message receipt.');
      }
      if (item.MessageID.replace(/^<|>$/g, '') === messageId) return { providerMessageId: `<${messageId}>` };
    }
    if (result.messages.length) throw new Error('Ambiguous Mailpit message lookup.');
    return await sendEmail(message, baseURL);
  } catch {
    throw new Error('Local estimate email delivery is temporarily unavailable.');
  }
}
