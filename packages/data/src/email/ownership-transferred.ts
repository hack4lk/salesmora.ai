import { emailBrandData as brand } from './email-brand.data';
import { ownershipTransferredEmailData as copy } from './ownership-transferred.data';
export type OwnershipNoticeRecipient = 'new_owner' | 'previous_owner';
export interface OwnershipTransferredEmailInput { recipient: OwnershipNoticeRecipient; workspaceName: string; newOwnerName: string; previousOwnerName: string }
const escapeHtml = (value: string) => value.replace(/[&<>"']/g, character => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' })[character]!);
/** Notice to both people after a staff ownership transfer. Never includes the staff-entered reason or any link into the app. */
export function renderOwnershipTransferredEmail(input: OwnershipTransferredEmailInput, logoSrc: string = copy.logoCid) {
  const variant = input.recipient === 'new_owner' ? copy.newOwner : copy.previousOwner;
  const subject = variant.subject(input.workspaceName.replace(/[\r\n]+/g, ' '));
  const introduction = input.recipient === 'new_owner'
    ? copy.newOwner.introduction(input.workspaceName, input.previousOwnerName)
    : copy.previousOwner.introduction(input.workspaceName, input.newOwnerName);
  return {
    subject,
    text: [copy.brand, variant.heading, introduction, variant.detail, copy.contact, variant.reason].join('\n\n'),
    html: `<!doctype html><html lang="en"><head><meta charset="utf-8"><meta name="viewport" content="width=device-width, initial-scale=1"><title>${escapeHtml(subject)}</title></head>
<body style="margin:0;background:${brand.canvas};color:${brand.ink};font-family:${brand.font};line-height:1.5;overflow-wrap:anywhere">
<div style="display:none;max-height:0;overflow:hidden;mso-hide:all">${variant.preheader}</div>
<table role="presentation" width="100%" cellspacing="0" cellpadding="0"><tr><td align="center" style="padding:32px 16px">
<table role="presentation" width="100%" cellspacing="0" cellpadding="0" style="table-layout:fixed;max-width:${brand.contentWidth}px;background:${brand.paper};border:1px solid ${brand.line};border-radius:16px"><tr><td style="padding:24px">
<div role="main">
<img src="${escapeHtml(logoSrc)}" alt="${copy.brand}" width="${brand.logoWidth}" height="${brand.logoHeight}" style="display:block;width:${brand.logoWidth}px;max-width:100%;height:auto;margin:0 0 24px">
<h1 style="margin:0 0 16px;font-size:28px;line-height:1.2">${variant.heading}</h1>
<p style="margin:0 0 16px">${escapeHtml(introduction)}</p>
<p style="margin:0 0 16px">${variant.detail}</p>
<p style="margin:0 0 24px;font-weight:bold">${copy.contact}</p>
<hr style="border:0;border-top:1px solid ${brand.line};margin:0 0 24px">
<p style="margin:0;color:${brand.muted};font-size:14px">${variant.reason}</p>
</div></td></tr></table></td></tr></table></body></html>`,
  };
}
