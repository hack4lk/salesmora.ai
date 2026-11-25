import type { WorkflowBookingEmail } from '../notifications/workflow-booking';
import { emailBrandData as brand } from './email-brand.data';
const escape=(value:string)=>value.replace(/[&<>"']/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]!));
export function renderWorkflowBookingEmail(mail:Omit<WorkflowBookingEmail,'to'>&{baseURL:string}) {
  const origin=new URL(mail.baseURL);if(!['https:','http:'].includes(origin.protocol))throw Error('Invalid origin.');
  const url=new URL(`/jobs/${encodeURIComponent(mail.jobId)}?workspace=${encodeURIComponent(mail.workspaceId)}`,origin.origin).href;
  const subject=mail.event==='booked'?`${mail.jobNumber} was booked`:`${mail.jobNumber} needs scheduling`;
  return {subject,text:`${subject}\n\n${mail.description}\n\nOpen job\n${url}`,html:`<!doctype html><html lang="en"><head><meta charset="utf-8"><title>${escape(subject)}</title></head><body style="background:${brand.canvas};color:${brand.ink};font-family:${brand.font};padding:24px"><main style="max-width:600px;margin:auto;background:${brand.paper};padding:24px;border-radius:16px"><h1 style="font-size:24px">${escape(subject)}</h1><p>${escape(mail.description)}</p><p><a href="${escape(url)}">Open job</a></p></main></body></html>`};
}
