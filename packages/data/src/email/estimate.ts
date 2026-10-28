import { estimateEmailInputSchema, type EstimateEmailInput } from "@salesmora/contracts";
import { emailBrandData as brand } from "./email-brand.data";
import { estimateEmailData as copy } from "./estimate.data";

export type { EstimateEmailInput } from "@salesmora/contracts";
const escapeHtml = (value: string) => value.replace(/[&<>"']/g, char =>
  ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;" })[char]!,
);

export function renderEstimateEmail(raw: EstimateEmailInput, logoSrc: string = copy.logoCid) {
  const input = estimateEmailInputSchema.parse(raw);
  const origin = new URL(input.baseURL);
  if (!["http:", "https:"].includes(origin.protocol) || origin.username || origin.password) {
    throw new Error("Estimate email links require an HTTP or HTTPS app origin.");
  }
  const url = new URL(`/e/${input.token}`, origin.origin).href;
  const fields = [
    [copy.number, input.number], [copy.name, input.name],
    [copy.total, new Intl.NumberFormat("en-US", { style: "currency", currency: "USD" }).format(input.totalCents / 100)],
    [copy.validUntil, new Intl.DateTimeFormat("en-US", { timeZone: "UTC", dateStyle: "long" })
      .format(new Date(`${input.validUntil}T12:00:00Z`))],
  ];
  const greeting = copy.greeting(input.recipientName), introduction = copy.introduction(input.businessName);
  return {
    subject: input.subject, replyTo: input.replyTo,
    text: [
      input.businessName, copy.heading, greeting, introduction, ...fields.map(([label, value]) => `${label}: ${value}`),
      copy.action, url, copy.reply, copy.privacy, copy.boundary,
      ...(input.paymentLink ? [`${copy.payment.action} - ${copy.payment.link}: ${input.paymentLink}`] : []),
      `${copy.attribution} ${copy.learnMore}: ${copy.learnMoreURL}`,
    ].join("\n\n"),
    html: `<!doctype html><html lang="en"><head><meta charset="utf-8"><meta name="viewport" content="width=device-width, initial-scale=1"><title>${escapeHtml(input.subject)}</title></head>
<body style="margin:0;background:${brand.canvas};color:${brand.ink};font-family:${brand.font};line-height:1.5">
<table role="presentation" width="100%" cellspacing="0" cellpadding="0"><tr><td align="center" style="padding:32px 16px">
<table role="presentation" width="100%" cellspacing="0" cellpadding="0" style="max-width:${brand.contentWidth}px;background:${brand.paper};border:1px solid ${brand.line};border-radius:16px"><tr><td style="padding:24px">
<img src="${escapeHtml(logoSrc)}" alt="SalesMora.ai" width="${brand.logoWidth}" height="${brand.logoHeight}" style="display:block;max-width:100%;height:auto;margin:0 0 24px">
<h1 style="margin:0 0 16px;font-size:28px">${copy.heading}</h1><p>${escapeHtml(greeting)}</p><p>${escapeHtml(introduction)}</p>
${fields.map(([label, value]) => `<p style="margin:16px 0 4px;color:${brand.muted};font-size:14px">${label}</p><p style="margin:0;font-weight:bold;overflow-wrap:anywhere">${escapeHtml(value)}</p>`).join("")}
${input.paymentLink ? `<div style="margin:24px 0;padding:16px;border:1px solid ${brand.line};border-radius:8px"><table role="presentation" width="100%" cellspacing="0" cellpadding="0" style="table-layout:fixed"><tr><td width="116" style="vertical-align:middle;padding-right:16px;box-sizing:border-box"><a href="${escapeHtml(input.paymentLink)}" target="_blank" rel="noopener noreferrer" referrerpolicy="no-referrer" style="display:inline-block;padding:12px 16px;background:${brand.primary};color:${brand.paper};border-radius:8px;text-decoration:none;font-weight:bold;white-space:nowrap">${copy.payment.action}</a></td><td style="vertical-align:middle;font-size:14px;overflow-wrap:anywhere;word-break:break-all">${copy.payment.link}: <a href="${escapeHtml(input.paymentLink)}" target="_blank" rel="noopener noreferrer" referrerpolicy="no-referrer" style="color:${brand.primary}">${escapeHtml(input.paymentLink)}</a></td></tr></table></div>` : ""}
<p style="margin:24px 0"><a href="${escapeHtml(url)}" style="display:inline-block;padding:12px 24px;background:${brand.primary};color:${brand.paper};border-radius:8px;text-decoration:none;font-weight:bold">${copy.action}</a></p>
<p>${copy.reply}</p><p style="color:${brand.muted};font-size:14px">${copy.privacy}</p><p style="color:${brand.muted};font-size:14px">${copy.boundary}</p>
<hr style="border:0;border-top:1px solid ${brand.line}"><p style="font-size:14px">${copy.fallback}</p><p style="overflow-wrap:anywhere;word-break:break-all;font-size:14px"><a href="${escapeHtml(url)}" style="color:${brand.primary}">${escapeHtml(url)}</a></p>
<p style="margin:24px 0 0;border-top:1px solid ${brand.line};padding-top:16px;color:${brand.muted};font-size:12px">${copy.attribution} <a href="${copy.learnMoreURL}" target="_blank" rel="noopener noreferrer" referrerpolicy="no-referrer" style="color:${brand.primary}">${copy.learnMore}</a></p>
</td></tr></table></td></tr></table></body></html>`,
  };
}
