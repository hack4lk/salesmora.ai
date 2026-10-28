import { jobIdSchema, jobStatusSchema, type JobStatus } from '@salesmora/contracts';
import { emailBrandData as brand } from './email-brand.data';
import { jobStatusChangedEmailData as copy } from './job-status-changed.data';

export type JobStatusChangedEmailInput = {
  baseURL: string; workspaceId: string; workspaceName: string; actorName: string;
  /** Only a recipient-authorized Job projection; the renderer does not choose recipients or grant access. */
  job: { id: string; number: string; title: string };
  before: JobStatus; after: JobStatus;
};
const escapeHtml = (value: string) => value.replace(/[&<>"']/g, character => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' })[character]!);

/** Approved email layout, with HTML and plain text. No external I/O or mutation. */
export function renderJobStatusChangedEmail(input: JobStatusChangedEmailInput, logoSrc: string = copy.logoCid) {
  const workspaceId = jobIdSchema.parse(input.workspaceId), jobId = jobIdSchema.parse(input.job.id);
  const origin = new URL(input.baseURL);
  if (!['http:', 'https:'].includes(origin.protocol) || origin.username || origin.password) throw new Error('Job links require an HTTP or HTTPS app origin.');
  if (!/^J-\d+$/.test(input.job.number) || !input.job.title.trim() || input.job.title.length > 200) throw new Error('Invalid Job content.');
  const before = jobStatusSchema.parse(input.before), after = jobStatusSchema.parse(input.after);
  const closed = (status: JobStatus) => status === 'completed' || status === 'canceled';
  if (before === after || (closed(before) && closed(after))) throw new Error('Invalid Job status change.');
  const event = closed(before) ? 'reopened' : after === 'completed' ? 'completed' : after === 'canceled' ? 'canceled' : 'changed';
  const heading = copy.headings[event], introduction = copy.introduction(input.actorName, input.workspaceName);
  const subject = copy.subject(input.workspaceName, input.job.number, heading).replace(/[\r\n]+/g, ' ');
  const url = new URL(`/jobs/${jobId}`, origin.origin);
  url.searchParams.set('workspace', workspaceId);
  const preferences = new URL('/settings/notifications', origin.origin);
  preferences.searchParams.set('workspace', workspaceId);
  const fields = [[copy.job, `${input.job.number} · ${input.job.title}`], [copy.before, copy.statusLabels[before]], [copy.after, copy.statusLabels[after]], [copy.updatedBy, input.actorName || copy.teammate]];
  const link = escapeHtml(url.href);
  return {
    subject,
    text: [copy.brand, heading, introduction, ...fields.map(([label, value]) => `${label}: ${value}`),
      copy.action, url.href, copy.access, copy.reason, copy.preferences, preferences.href, copy.fallback, url.href].join('\n\n'),
    html: `<!doctype html><html lang="en"><head><meta charset="utf-8"><meta name="viewport" content="width=device-width, initial-scale=1"><title>${escapeHtml(subject)}</title></head>
<body style="margin:0;background:${brand.canvas};color:${brand.ink};font-family:${brand.font};line-height:1.5;overflow-wrap:anywhere">
<div style="display:none;max-height:0;overflow:hidden;mso-hide:all">${escapeHtml(introduction)}</div>
<table role="presentation" width="100%" cellspacing="0" cellpadding="0"><tr><td align="center" style="padding:32px 16px">
<table role="presentation" width="100%" cellspacing="0" cellpadding="0" style="table-layout:fixed;max-width:${brand.contentWidth}px;background:${brand.paper};border:1px solid ${brand.line};border-radius:16px"><tr><td style="padding:24px"><div role="main">
<img src="${escapeHtml(logoSrc)}" alt="${copy.brand}" width="${brand.logoWidth}" height="${brand.logoHeight}" style="display:block;width:${brand.logoWidth}px;max-width:100%;height:auto;margin:0 0 24px">
<h1 style="margin:0 0 16px;font-size:28px;line-height:1.2">${escapeHtml(heading)}</h1><p style="margin:0 0 16px">${escapeHtml(introduction)}</p>
<table role="presentation" width="100%" cellspacing="0" cellpadding="0" style="table-layout:fixed;margin:0 0 24px;background:${brand.canvas};border:1px solid ${brand.line};border-radius:8px"><tr><td style="padding:16px">
${fields.map(([label, value]) => `<p style="margin:0 0 4px;font-size:14px;color:${brand.muted}">${escapeHtml(label)}</p><p style="margin:0 0 16px;font-weight:bold;overflow-wrap:anywhere;word-break:break-word">${escapeHtml(value)}</p>`).join('')}
</td></tr></table>
<table role="presentation" cellspacing="0" cellpadding="0" style="margin:0 0 24px"><tr><td bgcolor="${brand.primary}" style="border-radius:8px"><a href="${link}" style="display:inline-block;padding:12px 24px;background:${brand.primary};color:${brand.paper};border:1px solid ${brand.primary};border-radius:8px;font-weight:bold;text-decoration:none">${copy.action}</a></td></tr></table>
<p style="margin:0 0 16px;color:${brand.muted};font-size:14px">${copy.access}</p><p style="margin:0 0 16px;color:${brand.muted};font-size:14px">${copy.reason}</p><p style="margin:0 0 24px;font-size:14px"><a href="${escapeHtml(preferences.href)}" style="color:${brand.primary}">${copy.preferences}</a></p>
<hr style="border:0;border-top:1px solid ${brand.line};margin:0 0 24px"><p style="margin:0 0 12px;color:${brand.muted};font-size:14px">${copy.fallback}</p><p style="margin:0;overflow-wrap:anywhere;word-break:break-all;font-size:14px"><a href="${link}" style="color:${brand.primary};word-break:break-all">${link}</a></p>
</div></td></tr></table></td></tr></table></body></html>`,
  };
}
