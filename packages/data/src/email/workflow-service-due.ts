import {z} from 'zod';
import {serviceEmailTextSchema} from '@salesmora/contracts';
import {appOrigin,brandedWorkflowEmail} from './branded-workflow';
export function renderServiceDueEmail(input:{baseURL:string;workspaceId:string;workflowId:string;service:string;count:number;annual?:boolean},logoSrc='cid:salesmora-logo'){
 const origin=appOrigin(input.baseURL),workspaceId=z.uuid().parse(input.workspaceId),workflowId=z.uuid().parse(input.workflowId),count=z.number().int().positive().max(100000).parse(input.count),service=z.string().trim().min(1).max(200).parse(input.service);
 const link=new URL(`/workflows/services/${workflowId}`,origin);link.searchParams.set('workspace',workspaceId);const preferences=new URL('/settings/notifications',origin);preferences.searchParams.set('workspace',workspaceId);
 return brandedWorkflowEmail({subject:input.annual?`Review ${service} customers`:`${count} ${count===1?'customer is':'customers are'} due for ${service}`,body:'Review the customer list and choose who to contact. Customer emails are sent only after you review and confirm them.',action:{label:'Review customers',url:link.href},footerLabel:'Notification preferences',footerURL:preferences.href},logoSrc);
}
export function renderServiceOutreachEmail(input:{baseURL:string;subject:string;body:string;unsubscribeToken:string},logoSrc='cid:salesmora-logo'){
 const origin=appOrigin(input.baseURL),text=serviceEmailTextSchema.parse({subject:input.subject,body:input.body}),token=z.string().regex(/^[A-Za-z0-9_-]{43}$/).parse(input.unsubscribeToken),unsubscribe=new URL('/service-reminders/unsubscribe',origin);unsubscribe.searchParams.set('token',token);
 return brandedWorkflowEmail({...text,footerLabel:'Unsubscribe from service reminders',footerURL:unsubscribe.href},logoSrc);
}
