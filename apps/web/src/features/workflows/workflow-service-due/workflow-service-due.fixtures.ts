import type {ServiceDueCustomer,ServiceEmailTemplate,ServiceEmailSendReview} from './workflow-service-due.types';
import {previewServiceEmail} from './service-email-template';
export const dueService={id:'gutter-cleaning',name:'Gutter cleaning'};
export const dueTemplate:ServiceEmailTemplate={id:'template-1',version:1,subject:'Time for your next {Service}?',body:'Hi {First name},\n\nYour next {Service} is due around {Due date}. To arrange a visit, call our office at (555) 010-0142 or email office@example.test.\n\nThank you,\nThe service team'};
export const dueCustomers:ServiceDueCustomer[]=[
 {id:'cycle-1',version:1,customerId:'customer-1',name:'Skyler Grant',firstName:'Skyler',email:'skyler@example.test',completedDate:'2026-05-22',dueDate:'2026-11-22',jobId:'job-1',jobNumber:'J-0012',status:'due'},
 {id:'cycle-2',version:1,customerId:'customer-2',name:'Jordan Lee',firstName:'Jordan',email:'jordan@example.test',completedDate:'2026-05-20',dueDate:'2026-11-20',jobId:'job-2',jobNumber:'J-0013',status:'due'},
 {id:'cycle-3',version:1,customerId:'customer-3',name:'Taylor Morgan',firstName:'Taylor',email:'taylor@example.test',completedDate:'2026-05-18',dueDate:'2026-11-18',jobId:'job-3',jobNumber:'J-0014',status:'due',exclusion:'Unsubscribed from service reminders'},
 {id:'cycle-4',version:1,customerId:'customer-4',name:'Avery Chen',firstName:'Avery',email:null,completedDate:'2026-05-18',dueDate:'2026-11-18',jobId:'job-4',jobNumber:'J-0015',status:'due',exclusion:'No email address'},
 {id:'cycle-5',version:1,customerId:'customer-5',name:'Riley Brooks',firstName:'Riley',email:'riley@example.test',completedDate:'2026-05-12',dueDate:'2026-11-12',jobId:'job-5',jobNumber:'J-0016',status:'work_open',activeJob:{id:'job-6',number:'J-0017'},exclusion:'Matching work is already open'},
];
export function dueEmailReview(rows:readonly ServiceDueCustomer[]=dueCustomers.slice(0,2),template=dueTemplate):ServiceEmailSendReview{
 return {id:'review-1',revision:'review-v1',expiresAt:'2099-11-22T16:00:00Z',templateId:template.id,templateVersion:template.version,from:'SalesMora service reminders <service@example.test>',replyTo:'office@example.test',senderReady:true,excluded:[],
  messages:rows.filter(row=>!!row.email).map(row=>({cycleId:row.id,cycleVersion:row.version,customerId:row.customerId,name:row.name,to:row.email!,...previewServiceEmail(template,dueService.name,row)}))};
}
