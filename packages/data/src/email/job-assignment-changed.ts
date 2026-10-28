import { jobIdSchema } from '@salesmora/contracts';
import { emailBrandData as brand } from './email-brand.data';
import { jobAssignmentChangedEmailData as copy } from './job-assignment-changed.data';

type CommonInput = { baseURL: string; workspaceId: string; workspaceName: string; actorName: string };
export type JobAssignmentChangedEmailInput = CommonInput & (
  /** Current recipient-authorized projection, never a raw Job row or team roster. */
  { access: 'current'; change: 'primary' | 'team' | 'updated' | 'removed'; job: { id: string; number: string; title: string } } |
  /** Final removal projection: title, record ID and actor are never rendered. */
  { access: 'ended'; change: 'removed'; job: { number: string } }
);
const escapeHtml = (value: string) => value.replace(/[&<>"']/g, character => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' })[character]!);

/** Approved email layout, with HTML and plain text. No external I/O or mutation. */
export function renderJobAssignmentChangedEmail(input: JobAssignmentChangedEmailInput, logoSrc: string = copy.logoCid) {
  const workspaceId = jobIdSchema.parse(input.workspaceId);
  if (!['current', 'ended'].includes(input.access) || !Object.hasOwn(copy.headings, input.change)) throw new Error('Invalid assignment notification.');
  const origin = new URL(input.baseURL);
  if (!['http:', 'https:'].includes(origin.protocol) || origin.username || origin.password) throw new Error('Job links require an HTTP or HTTPS app origin.');
  if (!/^J-\d+$/.test(input.job.number)) throw new Error('Invalid Job number.');
  let jobId: string | undefined;
  if (input.access === 'current') {
    jobId = jobIdSchema.parse(input.job.id);
    if (!input.job.title.trim() || input.job.title.length > 200) throw new Error('Invalid Job content.');
  } else if (input.change !== 'removed' || Object.keys(input.job).some(key => key !== 'number')) {
    throw new Error('Final removal notices require only the Job number.');
  }
  const ended = input.access === 'ended';
  const heading = copy.headings[input.change];
  const introduction = ended ? copy.removedIntroduction(input.workspaceName) : copy.introduction(input.actorName, input.workspaceName);
  const subject = copy.subject(input.workspaceName, input.job.number, heading).replace(/[\r\n]+/g, ' ');
  const url = new URL(jobId ? `/jobs/${jobId}` : '/home', origin.origin);
  url.searchParams.set('workspace', workspaceId);
  const preferences = new URL('/settings/notifications', origin.origin);
  preferences.searchParams.set('workspace', workspaceId);
  const fields = input.access === 'ended' ? [[copy.job, input.job.number]] : [
    [copy.job, `${input.job.number} · ${input.job.title}`], [copy.update, copy.updates[input.change]], [copy.updatedBy, input.actorName || copy.teammate],
  ];
  const action = ended ? copy.removedAction : copy.action;
  const access = ended ? copy.endedAccess : copy.access, reason = ended ? copy.endedReason : copy.reason;
  const link = escapeHtml(url.href);
  return {
    subject,
    text: [copy.brand, heading, introduction, ...fields.map(([label, value]) => `${label}: ${value}`),
      action, url.href, access, reason, copy.preferences, preferences.href, copy.fallback, url.href].join('\n\n'),
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
<table role="presentation" cellspacing="0" cellpadding="0" style="margin:0 0 24px"><tr><td bgcolor="${brand.primary}" style="border-radius:8px"><a href="${link}" style="display:inline-block;padding:12px 24px;background:${brand.primary};color:${brand.paper};border:1px solid ${brand.primary};border-radius:8px;font-weight:bold;text-decoration:none">${action}</a></td></tr></table>
<p style="margin:0 0 16px;color:${brand.muted};font-size:14px">${access}</p><p style="margin:0 0 16px;color:${brand.muted};font-size:14px">${reason}</p><p style="margin:0 0 24px;font-size:14px"><a href="${escapeHtml(preferences.href)}" style="color:${brand.primary}">${copy.preferences}</a></p>
<hr style="border:0;border-top:1px solid ${brand.line};margin:0 0 24px"><p style="margin:0 0 12px;color:${brand.muted};font-size:14px">${copy.fallback}</p><p style="margin:0;overflow-wrap:anywhere;word-break:break-all;font-size:14px"><a href="${link}" style="color:${brand.primary};word-break:break-all">${link}</a></p>
</div></td></tr></table></td></tr></table></body></html>`,
  };
}
