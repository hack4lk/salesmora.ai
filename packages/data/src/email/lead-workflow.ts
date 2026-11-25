import { brandedWorkflowEmail, appOrigin } from './branded-workflow';
import { leadDetailQuerySchema } from "@salesmora/contracts";
import { emailBrandData as brand } from "./email-brand.data";
import { leadWorkflowEmailData as copy } from "./lead-workflow.data";
export type LeadWorkflowEmailInput = { baseURL: string; workspaceId: string; leadId: string; leadNumber: string; leadName: string; businessDays?:number };

const escapeHtml = (value: string) => value.replace(/[&<>"']/g, character => ({
  "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;",
})[character]!);

export function renderLeadWorkflowEmail(
  input: LeadWorkflowEmailInput,
  logoSrc: string = copy.logoCid,
) {
  if(input.businessDays!==undefined){if(!Number.isInteger(input.businessDays)||input.businessDays<1||input.businessDays>30)throw Error('Invalid reminder delay.');const ids=leadDetailQuerySchema.parse({workspaceId:input.workspaceId,leadId:input.leadId}),url=new URL(`/leads/${ids.leadId}`,appOrigin(input.baseURL));url.searchParams.set('workspace',ids.workspaceId);const prefs=new URL('/settings/notifications',appOrigin(input.baseURL));prefs.searchParams.set('workspace',ids.workspaceId);return brandedWorkflowEmail({subject:'Assigned lead needs attention',body:`${input.leadNumber} · ${input.leadName}\n\nNo recorded activity for ${input.businessDays} business ${input.businessDays===1?'day':'days'}.`,action:{label:'Open lead',url:url.href},footerLabel:'Notification preferences',footerURL:prefs.href},logoSrc);}
  const { workspaceId, leadId } = leadDetailQuerySchema.parse({ workspaceId: input.workspaceId, leadId: input.leadId });
  if (!/^LD-\d{4,}$/.test(input.leadNumber) || !input.leadName.trim() || input.leadName.length > 200) {
    throw new Error("Invalid lead reminder content.");
  }
  const origin = new URL(input.baseURL);
  if (!["http:", "https:"].includes(origin.protocol) || origin.username || origin.password) {
    throw new Error("Lead reminder links require an HTTP or HTTPS app origin.");
  }
  const link = new URL(`/leads/${leadId}`, origin.origin);
  link.searchParams.set("workspace", workspaceId);
  const preferences = new URL("/settings/notifications", origin.origin);
  preferences.searchParams.set("workspace", workspaceId);
  const heading = copy.heading;
  const values = [
    [copy.leadNumber, input.leadNumber],
    [copy.name, input.leadName],
  ] as const;
  const subject = copy.subject(heading);
  const safeLink = escapeHtml(link.href);
  const safeSubject = escapeHtml(subject);

  return {
    subject,
    text: [
      copy.brand, heading,
      ...values.map(([label, value]) => `${label}: ${value}`),
      copy.view, link.href, copy.access, copy.preferences, preferences.href,
      copy.fallback, link.href,
    ].join("\n\n"),
    html: `<!doctype html><html lang="en"><head><meta charset="utf-8"><meta name="viewport" content="width=device-width, initial-scale=1"><title>${safeSubject}</title></head>
<body style="margin:0;background:${brand.canvas};color:${brand.ink};font-family:${brand.font};line-height:1.5;overflow-wrap:anywhere">
<table role="presentation" width="100%" cellspacing="0" cellpadding="0"><tr><td align="center" style="padding:32px 16px">
<table role="presentation" width="100%" cellspacing="0" cellpadding="0" style="table-layout:fixed;max-width:${brand.contentWidth}px;background:${brand.paper};border:1px solid ${brand.line};border-radius:16px"><tr><td style="padding:24px"><div role="main">
<img src="${escapeHtml(logoSrc)}" alt="${copy.brand}" width="${brand.logoWidth}" height="${brand.logoHeight}" style="display:block;width:${brand.logoWidth}px;max-width:100%;height:auto;margin:0 0 24px">
<h1 style="margin:0 0 24px;font-size:28px;line-height:1.2">${escapeHtml(heading)}</h1>
<table role="presentation" width="100%" cellspacing="0" cellpadding="0" style="table-layout:fixed;margin:0 0 24px;background:${brand.canvas};border:1px solid ${brand.line};border-radius:8px"><tr><td style="padding:16px">
${values.map(([label, value]) => `<p style="margin:0 0 4px;font-size:14px;color:${brand.muted}">${escapeHtml(label)}</p><p style="margin:0 0 16px;font-weight:bold;overflow-wrap:anywhere;word-break:break-word">${escapeHtml(value)}</p>`).join("")}
</td></tr></table>
<table role="presentation" cellspacing="0" cellpadding="0" style="margin:0 0 24px"><tr><td bgcolor="${brand.primary}" style="border-radius:8px"><a href="${safeLink}" style="display:inline-block;padding:12px 24px;background:${brand.primary};color:${brand.paper};border:1px solid ${brand.primary};border-radius:8px;font-weight:bold;text-decoration:none">${copy.view}</a></td></tr></table>
<p style="margin:0 0 16px;color:${brand.muted};font-size:14px">${copy.access}</p><p style="margin:0 0 24px;font-size:14px"><a href="${escapeHtml(preferences.href)}" style="color:${brand.primary}">${copy.preferences}</a></p>
<hr style="border:0;border-top:1px solid ${brand.line};margin:0 0 24px"><p style="margin:0 0 12px;color:${brand.muted};font-size:14px">${copy.fallback}</p><p style="margin:0;overflow-wrap:anywhere;word-break:break-all;font-size:14px"><a href="${safeLink}" style="color:${brand.primary};word-break:break-all">${safeLink}</a></p>
</div></td></tr></table></td></tr></table></body></html>`,
  };
}
