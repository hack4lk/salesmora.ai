import { z } from "zod";
import { workflowVisitSnapshotSchema, type WorkflowVisitSnapshot } from "@salesmora/contracts";
import { emailBrandData as brand } from "./email-brand.data";
const escape = (value: string) => value.replace(/[&<>"']/g, c => ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;" })[c]!);
export function renderWorkflowVisitEmail(input: { baseURL: string; workspaceId: string; visitId: string; snapshot: WorkflowVisitSnapshot }, logoSrc = "cid:salesmora-logo") {
  z.uuid().parse(input.workspaceId); z.uuid().parse(input.visitId);
  const snapshot = workflowVisitSnapshotSchema.parse(input.snapshot), origin = new URL(input.baseURL);
  if (!["http:", "https:"].includes(origin.protocol) || origin.username || origin.password) throw Error("Invalid app origin.");
  const link = new URL("/calendar", origin.origin);
  link.search = new URLSearchParams({ workspace: input.workspaceId, date: snapshot.scheduledDate, visit: input.visitId }).toString();
  const preferences = new URL(`/settings/notifications?workspace=${input.workspaceId}`, origin.origin).href;
  const date = new Intl.DateTimeFormat("en-US", { dateStyle: "medium", timeZone: "UTC" }).format(new Date(`${snapshot.scheduledDate}T12:00:00Z`));
  const window = snapshot.arrivalWindow?.split("-").map(part => {
    const [h, m] = part.split(":").map(Number); return `${h % 12 || 12}${m ? `:${String(m).padStart(2, "0")}` : ""} ${h < 12 ? "AM" : "PM"}`;
  }).join("–");
  const schedule = [date, window, snapshot.timezone].filter(Boolean).join(" · ");
  const heading = snapshot.reason === "materials" ? "Materials need attention before a visit" : "A scheduled visit has no assignee", description = `${snapshot.title} · ${snapshot.customerName}`;
  return { subject: heading,
    text: ["SalesMora", heading, description, schedule, ...snapshot.recordLabels,
      ...(snapshot.totalRecords > snapshot.recordLabels.length ? [`${snapshot.totalRecords} linked records in this visit.`] : []),
      "Open visit", link.href, "Visit details may have changed since this reminder.", "Email preferences", preferences].join("\n\n"),
    html: `<!doctype html><html lang="en"><head><meta charset="utf-8"><meta name="viewport" content="width=device-width,initial-scale=1"><title>${heading}</title></head>
<body style="margin:0;background:${brand.canvas};color:${brand.ink};font-family:${brand.font};line-height:1.5;overflow-wrap:anywhere"><table role="presentation" width="100%"><tr><td align="center" style="padding:32px 16px"><table role="presentation" width="100%" style="table-layout:fixed;max-width:${brand.contentWidth}px;background:${brand.paper};border:1px solid ${brand.line};border-radius:16px"><tr><td style="padding:24px"><div role="main"><img src="${escape(logoSrc)}" alt="SalesMora" width="${brand.logoWidth}" height="${brand.logoHeight}" style="max-width:100%;height:auto"><h1 style="font-size:28px;line-height:1.2">${heading}</h1><p>${escape(description)}</p><p style="padding:16px;background:${brand.canvas};border:1px solid ${brand.line};border-radius:8px">${escape(schedule)}</p>${snapshot.reason === "materials" || snapshot.totalRecords > 1 ? `<ul>${snapshot.recordLabels.map(label => `<li>${escape(label)}</li>`).join("")}</ul>` : ""}${snapshot.totalRecords > snapshot.recordLabels.length ? `<p>${snapshot.totalRecords} linked records in this visit.</p>` : ""}<p style="margin:24px 0"><a href="${escape(link.href)}" style="display:inline-block;background:${brand.primary};color:${brand.paper};padding:12px 24px;border-radius:8px;text-decoration:none;font-weight:bold">Open visit</a></p><p style="font-size:14px;color:${brand.muted}">Visit details may have changed since this reminder.</p><p><a href="${escape(preferences)}">Email preferences</a></p></div></td></tr></table></td></tr></table></body></html>` };
}
