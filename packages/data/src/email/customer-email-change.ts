import { emailBrandData as brand } from './email-brand.data';
import { customerEmailChangeData as copy } from './customer-email-change.data';

function escapeHtml(value: string) {
  return value.replace(/[&<>"']/g, character => ({
    '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;',
  })[character]!);
}

function emailShell(subject: string, preheader: string, heading: string, body: string) {
  return `<!doctype html><html lang="en"><head><meta charset="utf-8"><meta name="viewport" content="width=device-width, initial-scale=1"><title>${escapeHtml(subject)}</title></head>
<body style="margin:0;background:${brand.canvas};color:${brand.ink};font-family:${brand.font};line-height:1.5">
<div style="display:none;max-height:0;overflow:hidden;mso-hide:all">${escapeHtml(preheader)}</div>
<table role="presentation" width="100%" cellspacing="0" cellpadding="0"><tr><td align="center" style="padding:32px 16px">
<table role="presentation" width="100%" cellspacing="0" cellpadding="0" style="max-width:${brand.contentWidth}px;background:${brand.paper};border:1px solid ${brand.line};border-radius:16px"><tr><td style="padding:24px">
<p style="margin:0 0 24px;color:${brand.primary};font-weight:bold">${copy.brand}</p>
<h1 style="margin:0 0 16px;font-size:28px;line-height:1.2">${escapeHtml(heading)}</h1>
${body}</td></tr></table></td></tr></table></body></html>`;
}

export function renderCustomerEmailChangeVerificationEmail(url: string) {
  const parsed = new URL(url);
  if (!['https:', 'http:'].includes(parsed.protocol)) throw new Error('Verification links must use HTTP or HTTPS.');
  const link = escapeHtml(parsed.href);
  return {
    subject: copy.verificationSubject,
    text: [
      copy.brand, copy.verificationHeading, copy.verificationIntroduction, copy.verificationPurpose,
      copy.verificationAction, parsed.href, copy.verificationExpiry, copy.verificationIgnore,
    ].join('\n\n'),
    html: emailShell(copy.verificationSubject, copy.verificationPreheader, copy.verificationHeading,
      `<p style="margin:0 0 16px">${copy.verificationIntroduction}</p>
<p style="margin:0 0 24px;color:${brand.muted}">${copy.verificationPurpose}</p>
<p style="margin:0 0 24px"><a href="${link}" style="display:inline-block;padding:12px 24px;background:${brand.primary};color:${brand.paper};border-radius:8px;font-weight:bold;text-decoration:none">${copy.verificationAction}</a></p>
<p style="margin:0 0 16px;font-weight:bold">${copy.verificationExpiry}</p>
<p style="margin:0 0 24px;color:${brand.muted}">${copy.verificationIgnore}</p>
<hr style="border:0;border-top:1px solid ${brand.line};margin:0 0 24px">
<p style="margin:0 0 12px;color:${brand.muted};font-size:14px">${copy.verificationFallback}</p>
<p style="margin:0;overflow-wrap:anywhere;word-break:break-all;font-size:14px"><a href="${link}" style="color:${brand.primary};word-break:break-all">${link}</a></p>`),
  };
}

export function renderCustomerEmailChangeNotificationEmail() {
  return {
    subject: copy.notificationSubject,
    text: [
      copy.brand, copy.notificationHeading, copy.notificationIntroduction,
      copy.notificationCurrentAddress, copy.notificationIgnore,
    ].join('\n\n'),
    html: emailShell(copy.notificationSubject, copy.notificationPreheader, copy.notificationHeading,
      `<p style="margin:0 0 16px">${copy.notificationIntroduction}</p>
<p style="margin:0 0 16px;color:${brand.muted}">${copy.notificationCurrentAddress}</p>
<p style="margin:0">${copy.notificationIgnore}</p>`),
  };
}
