import { passwordResetEmailData as copy } from './password-reset.data';

function escapeHtml(value: string) {
  return value.replace(/[&<>"']/g, (character) => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' })[character]!);
}

/** Email clients require table layout and inline CSS; app components use Tailwind. */
export function renderPasswordResetEmail(url: string) {
  const link = escapeHtml(url);
  return {
    subject: copy.subject,
    text: [copy.brand, copy.heading, copy.introduction, copy.action, url, copy.expiry, copy.ignore].join('\n\n'),
    html: `<!doctype html><html lang="en"><head><meta charset="utf-8"><meta name="viewport" content="width=device-width, initial-scale=1"><title>${copy.subject}</title></head>
<body style="margin:0;background:#F4F8FC;color:#23384D;font-family:Arial,sans-serif;line-height:1.5">
<table role="presentation" width="100%" cellspacing="0" cellpadding="0"><tr><td align="center" style="padding:32px 16px">
<table role="presentation" width="100%" cellspacing="0" cellpadding="0" style="max-width:560px;background:#FFFFFF;border:1px solid #E2EAF1;border-radius:16px"><tr><td style="padding:32px">
<p style="margin:0 0 24px;color:#3B6FA5;font-size:20px;font-weight:bold">${copy.brand}</p>
<h1 style="margin:0 0 16px;font-size:28px">${copy.heading}</h1><p>${copy.introduction}</p>
<p style="margin:28px 0"><a href="${link}" style="display:inline-block;padding:12px 24px;background:#3B6FA5;color:#FFFFFF;border-radius:8px;font-weight:bold;text-decoration:none">${copy.action}</a></p>
<p>${copy.expiry}</p><p style="color:#52677B">${copy.ignore}</p><p>${copy.fallback}</p><p style="overflow-wrap:anywhere;word-break:break-all"><a href="${link}" style="color:#3B6FA5">${link}</a></p>
</td></tr></table></td></tr></table></body></html>`,
  };
}
