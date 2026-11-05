import { emailBrandData as brand } from './email-brand.data';

function escapeHtml(value: string) {
  return value.replace(/[&<>"']/g, character => ({
    '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;',
  })[character]!);
}

export function renderWorkspaceExportReadyEmail(input: {
  baseURL: string;
  requestId: string;
  workspaceName: string;
  expiresAt: Date | string;
}) {
  const origin = new URL(input.baseURL);
  if (!['https:', 'http:'].includes(origin.protocol) ||
      (origin.protocol === 'http:' && !['localhost', '127.0.0.1', '[::1]'].includes(origin.hostname))) {
    throw new Error('Workspace export email origin must use HTTPS except for localhost.');
  }
  if (!/^[0-9a-f]{8}-[0-9a-f]{4}-[1-8][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i.test(input.requestId) ||
      !input.workspaceName.trim() || input.workspaceName.length > 256) {
    throw new Error('Workspace export email details are invalid.');
  }
  const expiresAt = new Date(input.expiresAt);
  if (!Number.isFinite(expiresAt.getTime())) throw new Error('Workspace export expiry is invalid.');
  const url = new URL(`/workspace-exports/${input.requestId}`, origin.origin);
  const date = expiresAt.toLocaleString('en-US', { dateStyle: 'medium', timeStyle: 'short', timeZone: 'UTC' }) + ' UTC';
  const subject = 'Your workspace data export is ready';
  const heading = 'Your workspace export is ready';
  const action = 'Sign in to download';
  const workspace = escapeHtml(input.workspaceName);
  const link = escapeHtml(url.href);
  const text = [
    'SalesMora.ai',
    heading,
    `The requested export for ${input.workspaceName} is ready.`,
    'Sign in to your SalesMora.ai account as the verified workspace Owner to download the encrypted ZIP. Uploaded file contents are not included.',
    `Download before ${date}.`,
    url.href,
    'If you did not expect this export, contact your workspace administrator.',
  ].join('\n\n');
  const html = `<!doctype html><html lang="en"><head><meta charset="utf-8"><meta name="viewport" content="width=device-width, initial-scale=1"><title>${escapeHtml(subject)}</title></head>
<body style="margin:0;background:${brand.canvas};color:${brand.ink};font-family:${brand.font};line-height:1.5">
<table role="presentation" width="100%" cellspacing="0" cellpadding="0"><tr><td align="center" style="padding:32px 16px">
<table role="presentation" width="100%" cellspacing="0" cellpadding="0" style="max-width:${brand.contentWidth}px;background:${brand.paper};border:1px solid ${brand.line};border-radius:16px"><tr><td style="padding:24px">
<p style="margin:0 0 24px;color:${brand.primary};font-weight:bold">SalesMora.ai</p>
<h1 style="margin:0 0 16px;font-size:28px;line-height:1.2">${escapeHtml(heading)}</h1>
<p style="margin:0 0 16px">The requested export for <strong>${workspace}</strong> is ready.</p>
<p style="margin:0 0 24px;color:${brand.muted}">Sign in to your SalesMora.ai account as the verified workspace Owner to download the encrypted ZIP. Uploaded file contents are not included.</p>
<p style="margin:0 0 24px"><a href="${link}" style="display:inline-block;padding:12px 24px;background:${brand.primary};color:${brand.paper};border-radius:8px;font-weight:bold;text-decoration:none">${action}</a></p>
<p style="margin:0 0 16px;font-weight:bold">Available until ${escapeHtml(date)}.</p>
<p style="margin:0;overflow-wrap:anywhere;word-break:break-all;font-size:14px"><a href="${link}" style="color:${brand.primary};word-break:break-all">${link}</a></p>
<p style="margin:24px 0 0;color:${brand.muted};font-size:14px">If you did not expect this export, contact your workspace administrator.</p>
</td></tr></table></td></tr></table></body></html>`;
  return { subject, text, html };
}
