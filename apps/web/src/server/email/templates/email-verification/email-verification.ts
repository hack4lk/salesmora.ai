import { emailBrandData as brand } from '../email-brand.data';
import { emailVerificationEmailData as copy } from './email-verification.data';
function escapeHtml(value: string) {
  return value.replace(/[&<>"']/g, character => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' })[character]!);
}
/** Inline CSS and presentation tables follow the existing email template convention. */
export function renderEmailVerificationEmail(url: string, logoSrc: string = copy.logoCid) {
  const parsed = new URL(url);
  if (!['https:', 'http:'].includes(parsed.protocol)) throw new Error('Verification links must use HTTP or HTTPS.');
  const link = escapeHtml(parsed.href);
  return {
    subject: copy.subject,
    text: [copy.brand, copy.heading, copy.introduction, copy.purpose, copy.action, parsed.href, copy.expiry, copy.ignore, copy.fallback, parsed.href].join('\n\n'),
    html: `<!doctype html><html lang="en"><head><meta charset="utf-8"><meta name="viewport" content="width=device-width, initial-scale=1"><title>${copy.subject}</title></head>
<body style="margin:0;background:${brand.canvas};color:${brand.ink};font-family:${brand.font};line-height:1.5">
<div style="display:none;max-height:0;overflow:hidden;mso-hide:all">${copy.preheader}</div>
<table role="presentation" width="100%" cellspacing="0" cellpadding="0"><tr><td align="center" style="padding:32px 16px">
<table role="presentation" width="100%" cellspacing="0" cellpadding="0" style="max-width:${brand.contentWidth}px;background:${brand.paper};border:1px solid ${brand.line};border-radius:16px"><tr><td style="padding:24px">
<img src="${escapeHtml(logoSrc)}" alt="${copy.brand}" width="${brand.logoWidth}" height="${brand.logoHeight}" style="display:block;width:${brand.logoWidth}px;max-width:100%;height:auto;margin:0 0 24px">
<h1 style="margin:0 0 16px;font-size:28px;line-height:1.2">${copy.heading}</h1>
<p style="margin:0 0 16px">${copy.introduction}</p><p style="margin:0 0 24px;color:${brand.muted}">${copy.purpose}</p>
<table role="presentation" cellspacing="0" cellpadding="0" style="margin:0 0 24px"><tr><td bgcolor="${brand.primary}" style="border-radius:8px"><a href="${link}" style="display:inline-block;padding:12px 24px;background:${brand.primary};color:${brand.paper};border:1px solid ${brand.primary};border-radius:8px;font-weight:bold;text-decoration:none">${copy.action}</a></td></tr></table>
<p style="margin:0 0 16px;font-weight:bold">${copy.expiry}</p><p style="margin:0 0 24px;color:${brand.muted}">${copy.ignore}</p>
<hr style="border:0;border-top:1px solid ${brand.line};margin:0 0 24px">
<p style="margin:0 0 12px;color:${brand.muted};font-size:14px">${copy.fallback}</p><p style="margin:0;overflow-wrap:anywhere;word-break:break-all;font-size:14px"><a href="${link}" style="color:${brand.primary};word-break:break-all">${link}</a></p>
</td></tr></table></td></tr></table></body></html>`,
  };
}
