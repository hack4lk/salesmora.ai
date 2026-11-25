import type {ServiceDueCustomer,ServiceEmailText} from '@salesmora/contracts';
export const serviceEmailFields=['First name','Service','Last completed','Due date','Company phone','Company email'] as const;
export function validServiceEmail(text:ServiceEmailText){return !!text.subject.trim()&&text.subject.trim().length<=200&&!/[\r\n]/.test(text.subject)&&!!text.body.trim()&&text.body.length<=8000&&!/[{}]/.test((text.subject+'\n'+text.body).replace(/\{([^{}]*)\}/g,(token,key:string)=>serviceEmailFields.some(field=>field===key)?'':token));}
export function previewServiceEmail(text:ServiceEmailText,service:string,customer:ServiceDueCustomer,company?:{phone:string;email:string}):ServiceEmailText{
 const date=(v:string)=>new Intl.DateTimeFormat('en-US',{month:'short',day:'numeric',year:'numeric',timeZone:'UTC'}).format(new Date(v+'T12:00:00Z'));
 const fields:Record<string,string>={'First name':customer.firstName?.trim()||'there',Service:service,'Last completed':date(customer.completedDate),'Due date':date(customer.dueDate),'Company phone':company?.phone||'{Company phone}','Company email':company?.email||'{Company email}'};
 const merge=(v:string)=>v.replace(/\{([^{}]*)\}/g,(token,key:string)=>fields[key]??token);return {subject:merge(text.subject),body:merge(text.body)};
}
