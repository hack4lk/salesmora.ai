import { leadDetailQuerySchema, leadStages, type LeadReadRecord } from '@salesmora/contracts';
import { emailBrandData as brand } from './email-brand.data';
import { leadAssignedEmailData as copy } from './lead-assigned.data';
export interface LeadAssignedEmailInput {
  baseURL: string; workspaceId: string; leadId: string; workspaceName: string; assignerName: string;
  leadNumber: string; leadName: string; service: string; stage: LeadReadRecord['stage'];
}
const escapeHtml = (value: string) => value.replace(/[&<>"']/g, character => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' })[character]!);
/** Branded email uses presentation tables/inline CSS, matching the existing email templates. */
export function renderLeadAssignedEmail(input: LeadAssignedEmailInput, logoSrc: string = copy.logoCid) {
  const { workspaceId, leadId } = leadDetailQuerySchema.parse({ workspaceId: input.workspaceId, leadId: input.leadId });
  const origin = new URL(input.baseURL);
  if (!['http:', 'https:'].includes(origin.protocol) || origin.username || origin.password) throw new Error('Assignment links require an HTTP or HTTPS app origin.');
  if (!leadStages.includes(input.stage) || !/^LD-\d+$/.test(input.leadNumber)) throw new Error('Invalid lead identity or stage.');
  const url = new URL(`/leads/${leadId}`, origin.origin); url.searchParams.set('workspace', workspaceId);
  const subject = copy.subject(input.workspaceName.replace(/[\r\n]+/g, ' '), input.leadNumber);
  const introduction = copy.introduction(input.assignerName, input.workspaceName), link = escapeHtml(url.href);
  const fields = [[copy.lead, input.leadNumber], [copy.customer, input.leadName], [copy.service, input.service], [copy.stage, copy.stages[input.stage]]];
  return {
    subject,
    text: [copy.brand, copy.heading, introduction, ...fields.map(([label, value]) => `${label}: ${value}`), copy.purpose, copy.action, url.href, copy.access, copy.reason, copy.fallback, url.href].join('\n\n'),
    html: `<!doctype html><html lang="en"><head><meta charset="utf-8"><meta name="viewport" content="width=device-width, initial-scale=1"><title>${escapeHtml(subject)}</title></head>
<body style="margin:0;background:${brand.canvas};color:${brand.ink};font-family:${brand.font};line-height:1.5;overflow-wrap:anywhere">
<div style="display:none;max-height:0;overflow:hidden;mso-hide:all">${copy.preheader}</div>
<table role="presentation" width="100%" cellspacing="0" cellpadding="0"><tr><td align="center" style="padding:32px 16px">
<table role="presentation" width="100%" cellspacing="0" cellpadding="0" style="table-layout:fixed;max-width:${brand.contentWidth}px;background:${brand.paper};border:1px solid ${brand.line};border-radius:16px"><tr><td style="padding:24px">
<div role="main">
<img src="${escapeHtml(logoSrc)}" alt="${copy.brand}" width="${brand.logoWidth}" height="${brand.logoHeight}" style="display:block;width:${brand.logoWidth}px;max-width:100%;height:auto;margin:0 0 24px">
<h1 style="margin:0 0 16px;font-size:28px;line-height:1.2">${copy.heading}</h1>
<p style="margin:0 0 24px">${escapeHtml(introduction)}</p>
<table role="presentation" width="100%" cellspacing="0" cellpadding="0" style="table-layout:fixed;margin:0 0 24px;background:${brand.canvas};border:1px solid ${brand.line};border-radius:8px"><tr><td style="padding:16px">
${fields.map(([label, value]) => `<p style="margin:0 0 4px;font-size:14px;color:${brand.muted}">${escapeHtml(label)}</p><p style="margin:0 0 16px;font-weight:bold;overflow-wrap:anywhere;word-break:break-word">${escapeHtml(value)}</p>`).join('')}
</td></tr></table>
<p style="margin:0 0 24px;color:${brand.muted}">${copy.purpose}</p>
<table role="presentation" cellspacing="0" cellpadding="0" style="margin:0 0 24px"><tr><td bgcolor="${brand.primary}" style="border-radius:8px"><a href="${link}" style="display:inline-block;padding:12px 24px;background:${brand.primary};color:${brand.paper};border:1px solid ${brand.primary};border-radius:8px;font-weight:bold;text-decoration:none">${copy.action}</a></td></tr></table>
<p style="margin:0 0 16px;color:${brand.muted};font-size:14px">${copy.access}</p><p style="margin:0 0 24px;color:${brand.muted};font-size:14px">${copy.reason}</p>
<hr style="border:0;border-top:1px solid ${brand.line};margin:0 0 24px">
<p style="margin:0 0 12px;color:${brand.muted};font-size:14px">${copy.fallback}</p><p style="margin:0;overflow-wrap:anywhere;word-break:break-all;font-size:14px"><a href="${link}" style="color:${brand.primary};word-break:break-all">${link}</a></p>
</div></td></tr></table></td></tr></table></body></html>`,
  };
}
