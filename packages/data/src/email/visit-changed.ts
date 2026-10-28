import { calendarScheduleSchema, workOrderIdSchema, type CalendarSchedule } from '@salesmora/contracts';
import { emailBrandData as brand } from './email-brand.data';
import { visitChangedEmailData as copy } from './visit-changed.data';
export type VisitChangedEmailInput = {
  baseURL: string; workspaceId: string; workspaceName: string; actorName: string;
  event: keyof typeof copy.headings; before: CalendarSchedule; after: CalendarSchedule; timezone: string;
  /** Recipient-authorized projection only. The renderer does not choose recipients or grant access. */
  records: readonly { type: 'job' | 'work_order'; id: string; number: string; title: string }[];
};
const escapeHtml = (value: string) => value.replace(/[&<>"']/g, character => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' })[character]!);
const date = (value: string) => new Intl.DateTimeFormat('en-US', { month: 'short', day: 'numeric', year: 'numeric', timeZone: 'UTC' }).format(new Date(`${value}T12:00:00Z`));
const windowLabel = (value: string) => value.split('-').map(part => {
  const [hour, minute] = part.split(':').map(Number);
  return `${hour % 12 || 12}${minute ? `:${String(minute).padStart(2, '0')}` : ''} ${hour < 12 ? 'AM' : 'PM'}`;
}).join(' – ');
/** Same branded table/inline-CSS format as existing transactional emails; no tracking or remote fonts. */
export function renderVisitChangedEmail(input: VisitChangedEmailInput, logoSrc: string = copy.logoCid) {
  const workspaceId = workOrderIdSchema.parse(input.workspaceId), origin = new URL(input.baseURL);
  if (!['http:', 'https:'].includes(origin.protocol) || origin.username || origin.password) throw new Error('Visit links require an HTTP or HTTPS app origin.');
  if (!Object.hasOwn(copy.headings, input.event) || input.records.length < 1 || input.records.length > 100) throw new Error('Invalid visit notification.');
  new Intl.DateTimeFormat('en-US', { timeZone: input.timezone }).format();
  const before = calendarScheduleSchema.parse(input.before), after = calendarScheduleSchema.parse(input.after);
  if ((input.event === 'cleared' && after.scheduledDate) || (['scheduled', 'rescheduled', 'joined'].includes(input.event) && !after.scheduledDate)) throw new Error('Invalid visit event schedule.');
  const seen = new Set<string>();
  for (const record of input.records) {
    workOrderIdSchema.parse(record.id);
    if (!['job', 'work_order'].includes(record.type) || !(record.type === 'job' ? /^J-\d+$/ : /^WO-\d+$/).test(record.number) || seen.has(`${record.type}:${record.id}`)) throw new Error('Invalid visit record.');
    seen.add(`${record.type}:${record.id}`);
  }
  const primary = input.records[0];
  const url = new URL(`/${primary.type === 'job' ? 'jobs' : 'work-orders'}/${primary.id}`, origin.origin);
  url.searchParams.set('workspace', workspaceId);
  const preferences = new URL('/settings/notifications', origin.origin); preferences.searchParams.set('workspace', workspaceId);
  const heading = copy.headings[input.event], explanation = copy.explanations[input.event];
  const subject = copy.subject(input.workspaceName, heading).replace(/[\r\n]+/g, ' ');
  const introduction = copy.introduction(input.actorName, input.workspaceName), action = primary.type === 'job' ? copy.viewJob : copy.viewWorkOrder;
  const schedule = (value: CalendarSchedule) => value.scheduledDate ? `${date(value.scheduledDate)} · ${value.arrivalWindow ? windowLabel(value.arrivalWindow) : copy.noWindow}` : copy.noDate;
  const fields = [[copy.before, schedule(before)], [copy.after, schedule(after)], [copy.timezone, input.timezone]];
  const records = input.records.map(record => `${record.number} · ${record.title}`), link = escapeHtml(url.href);
  return {
    subject,
    text: [copy.brand, heading, introduction, explanation, ...fields.map(([label, value]) => `${label}: ${value}`), copy.records, ...records,
      action, url.href, copy.access, copy.reason, copy.preferences, preferences.href, copy.fallback, url.href].join('\n\n'),
    html: `<!doctype html><html lang="en"><head><meta charset="utf-8"><meta name="viewport" content="width=device-width, initial-scale=1"><title>${escapeHtml(subject)}</title></head>
<body style="margin:0;background:${brand.canvas};color:${brand.ink};font-family:${brand.font};line-height:1.5;overflow-wrap:anywhere">
<div style="display:none;max-height:0;overflow:hidden;mso-hide:all">${escapeHtml(explanation)}</div>
<table role="presentation" width="100%" cellspacing="0" cellpadding="0"><tr><td align="center" style="padding:32px 16px">
<table role="presentation" width="100%" cellspacing="0" cellpadding="0" style="table-layout:fixed;max-width:${brand.contentWidth}px;background:${brand.paper};border:1px solid ${brand.line};border-radius:16px"><tr><td style="padding:24px"><div role="main">
<img src="${escapeHtml(logoSrc)}" alt="${copy.brand}" width="${brand.logoWidth}" height="${brand.logoHeight}" style="display:block;width:${brand.logoWidth}px;max-width:100%;height:auto;margin:0 0 24px">
<h1 style="margin:0 0 16px;font-size:28px;line-height:1.2">${escapeHtml(heading)}</h1><p style="margin:0 0 16px">${escapeHtml(introduction)}</p><p style="margin:0 0 24px;color:${brand.muted}">${escapeHtml(explanation)}</p>
<table role="presentation" width="100%" cellspacing="0" cellpadding="0" style="table-layout:fixed;margin:0 0 24px;background:${brand.canvas};border:1px solid ${brand.line};border-radius:8px"><tr><td style="padding:16px">
${fields.map(([label, value]) => `<p style="margin:0 0 4px;font-size:14px;color:${brand.muted}">${escapeHtml(label)}</p><p style="margin:0 0 16px;font-weight:bold;overflow-wrap:anywhere;word-break:break-word">${escapeHtml(value)}</p>`).join('')}
</td></tr></table><h2 style="margin:0 0 12px;font-size:18px">${copy.records}</h2><ul style="margin:0 0 24px;padding-left:20px">${records.map(record => `<li style="margin:0 0 8px;overflow-wrap:anywhere;word-break:break-word">${escapeHtml(record)}</li>`).join('')}</ul>
<table role="presentation" cellspacing="0" cellpadding="0" style="margin:0 0 24px"><tr><td bgcolor="${brand.primary}" style="border-radius:8px"><a href="${link}" style="display:inline-block;padding:12px 24px;background:${brand.primary};color:${brand.paper};border:1px solid ${brand.primary};border-radius:8px;font-weight:bold;text-decoration:none">${action}</a></td></tr></table>
<p style="margin:0 0 16px;color:${brand.muted};font-size:14px">${copy.access}</p><p style="margin:0 0 16px;color:${brand.muted};font-size:14px">${copy.reason}</p><p style="margin:0 0 24px;font-size:14px"><a href="${escapeHtml(preferences.href)}" style="color:${brand.primary}">${copy.preferences}</a></p>
<hr style="border:0;border-top:1px solid ${brand.line};margin:0 0 24px"><p style="margin:0 0 12px;color:${brand.muted};font-size:14px">${copy.fallback}</p><p style="margin:0;overflow-wrap:anywhere;word-break:break-all;font-size:14px"><a href="${link}" style="color:${brand.primary};word-break:break-all">${link}</a></p>
</div></td></tr></table></td></tr></table></body></html>`,
  };
}
