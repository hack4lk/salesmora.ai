import { z } from "zod";
import { workflowBriefingSnapshotSchema, type WorkflowBriefingSnapshot } from "@salesmora/contracts";
import { emailBrandData as brand } from "./email-brand.data";
const escape = (value: string) => value.replace(/[&<>"']/g, character => ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;" })[character]!);
export function renderWorkflowBriefingEmail(input: { baseURL: string; workspaceId: string; briefingId: string; snapshot: WorkflowBriefingSnapshot }, logoSrc = "cid:salesmora-logo") {
  z.uuid().parse(input.workspaceId); z.uuid().parse(input.briefingId);
  const snapshot = workflowBriefingSnapshotSchema.parse(input.snapshot);
  const origin = new URL(input.baseURL);
  if (!["http:", "https:"].includes(origin.protocol) || origin.username || origin.password) throw new Error("Invalid app origin.");
  const link = new URL(`/workflows/briefings/${input.briefingId}?workspace=${input.workspaceId}`, origin.origin).href;
  const preferences = new URL(`/settings/notifications?workspace=${input.workspaceId}`, origin.origin).href;
  const values = [["Inactive leads", snapshot.counts.inactiveLeads], ["Estimates awaiting a decision", snapshot.counts.awaitingEstimates],
    ["Unscheduled jobs", snapshot.counts.unscheduledJobs], ["Jobs due soon", snapshot.counts.dueSoonJobs]] as const;
  const asOf = new Intl.DateTimeFormat("en-US", { dateStyle: "medium", timeStyle: "short", timeZone: snapshot.timezone }).format(new Date(snapshot.generatedAt));
  const note = `As of ${asOf} (${snapshot.timezone}). Counts can overlap. Report links show current data.`;
  const empty = values.every(([, value]) => value === 0) ? "No items in these four categories." : "";
  return { subject: "Your Monday briefing is ready",
    text: ["SalesMora", "Your Monday briefing", note, ...values.map(([label, value]) => `${label}: ${value}`), empty, "View briefing", link, "Email preferences", preferences].filter(Boolean).join("\n\n"),
    html: `<!doctype html><html lang="en"><head><meta charset="utf-8"><meta name="viewport" content="width=device-width,initial-scale=1"><title>Your Monday briefing</title></head>
<body style="margin:0;background:${brand.canvas};color:${brand.ink};font-family:${brand.font};line-height:1.5"><table role="presentation" width="100%"><tr><td align="center" style="padding:32px 16px"><table role="presentation" width="100%" style="max-width:${brand.contentWidth}px;background:${brand.paper};border:1px solid ${brand.line};border-radius:16px"><tr><td style="padding:24px"><img src="${escape(logoSrc)}" alt="SalesMora" width="${brand.logoWidth}" height="${brand.logoHeight}" style="max-width:100%;height:auto"><h1 style="font-size:28px">Your Monday briefing</h1><p style="color:${brand.muted}">${escape(note)}</p><table width="100%" style="border-collapse:collapse">${values.map(([label, value]) => `<tr><td style="padding:12px 0;border-bottom:1px solid ${brand.line}">${label}</td><td style="text-align:right;font-weight:bold;border-bottom:1px solid ${brand.line}">${value}</td></tr>`).join("")}</table>${empty ? `<p>${empty}</p>` : ""}<p style="margin:24px 0"><a href="${escape(link)}" style="display:inline-block;background:${brand.primary};color:${brand.paper};padding:12px 24px;border-radius:8px;text-decoration:none;font-weight:bold">View briefing</a></p><p><a href="${escape(preferences)}">Email preferences</a></p></td></tr></table></td></tr></table></body></html>` };
}
