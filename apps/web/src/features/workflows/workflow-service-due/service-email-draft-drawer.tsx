'use client';
import {useId,useRef,useState} from 'react';
import {SideDrawer,FormFeedback} from '@salesmora/ui';
import {jobButton,jobInput,jobLabel,jobPrimary} from '../../jobs/job-ui';
import {previewServiceEmail,serviceEmailFields,validServiceEmail} from './service-email-template';
import type {ServiceDueCustomer,ServiceEmailTemplate,ServiceEmailText} from './workflow-service-due.types';
export type ServiceEmailDraftDrawerProps={
 fields?:readonly (typeof serviceEmailFields)[number][];
 company?:{version:number;phone:string;email:string};canConfigureCompany?:boolean;canGenerate?:boolean;onSaveCompany?:(input:{expectedVersion:number;phone:string;email:string})=>Promise<void>;
 open:boolean;service:{id:string;name:string};template:ServiceEmailTemplate;sample?:ServiceDueCustomer;canDraft:boolean;conflict?:boolean;
 onClose:()=>void;onReload:()=>void;
 onGenerate:(input:{serviceId:string;templateVersion:number;request:string;current:ServiceEmailText})=>Promise<ServiceEmailText>;
 onSave:(input:{serviceId:string;templateId:string;expectedVersion:number;text:ServiceEmailText})=>Promise<void>;
};
export function ServiceEmailDraftDrawer(props:ServiceEmailDraftDrawerProps){return <EmailEditor key={`${props.service.id}:${props.template.id}:${props.template.version}`} {...props}/>;}
function EmailEditor({fields=serviceEmailFields,company,canConfigureCompany,canGenerate=true,onSaveCompany,open,service,template,sample,canDraft,conflict,onClose,onReload,onGenerate,onSave}:ServiceEmailDraftDrawerProps){
 const id=useId(),lock=useRef(false),messageField=useRef<HTMLTextAreaElement>(null);
 const [text,setText]=useState<ServiceEmailText>({subject:template.subject,body:template.body}),[request,setRequest]=useState(''),[busy,setBusy]=useState<'drafting'|'saving'>(),[error,setError]=useState(''),[reply,setReply]=useState('');
 const allowed=canDraft&&!conflict&&!busy,changed=text.subject!==template.subject||text.body!==template.body,valid=validServiceEmail(text);
 const preview=sample?previewServiceEmail(text,service.name,sample,company):undefined;
 async function generate(){if(!allowed||!canGenerate||!request.trim()||lock.current)return;lock.current=true;setBusy('drafting');setError('');
  try{const next=await onGenerate({serviceId:service.id,templateVersion:template.version,request:request.trim(),current:text});if(!validServiceEmail(next))throw Error('invalid draft');setText(next);setReply('Draft updated. Review the subject and message below.');setRequest('');}
  catch{setError('The assistant could not prepare this draft. Your message is still here; try again.');}finally{lock.current=false;setBusy(undefined);}
 }
 async function save(){if(!allowed||!valid||lock.current)return;lock.current=true;setBusy('saving');setError('');try{await onSave({serviceId:service.id,templateId:template.id,expectedVersion:template.version,text:{subject:text.subject.trim(),body:text.body.trim()}});onClose();}catch{setError('The draft could not be saved. Your edits are still here.');}finally{lock.current=false;setBusy(undefined);}}
 return <SideDrawer open={open} title="Prepare service email" description={`${service.name} · draft once, personalize for each customer.`} busy={!!busy} onClose={onClose}
  footer={<div className="flex flex-wrap justify-end gap-3"><button type="button" className={jobButton} disabled={!!busy} onClick={onClose}>Cancel</button><button type="button" className={jobPrimary} disabled={!allowed||!valid||!changed} onClick={()=>void save()}>Save draft</button></div>}>
  <div className="grid min-w-0 gap-5">
   {company&&onSaveCompany&&<CompanyContacts key={company.version} company={company} allowed={!!canConfigureCompany&&!busy} onSave={onSaveCompany}/>}
   {!canDraft&&<p role="status" className="m-0 text-sm text-muted">You can view this draft, but you don’t have permission to change it.</p>}
   {conflict&&<div className="grid justify-items-start gap-2"><FormFeedback kind="error" message="This draft changed. Reload the latest version before saving."/><button type="button" className={jobButton} disabled={!!busy} onClick={onReload}>Reload draft</button></div>}
   {error&&<FormFeedback kind="error" message={error}/>}
   {!canGenerate&&<p className="m-0 text-sm text-muted">Assistant drafting is unavailable. You can edit the email directly.</p>}
   <form onSubmit={event=>{event.preventDefault();void generate();}} className="grid gap-3 rounded-xl border border-assistant-border bg-assistant-user p-4 text-assistant-foreground">
    <label htmlFor={`${id}-request`} className="text-sm font-semibold">Work with the assistant</label>
    <textarea id={`${id}-request`} rows={3} maxLength={2000} disabled={!allowed||!canGenerate||!!company&&(!company.phone||!company.email)} value={request} placeholder="Write a friendly reminder. Ask customers to call the company or email its contact address."
     className="w-full min-w-0 rounded-lg border border-assistant-border bg-assistant-surface p-3 text-base text-assistant-foreground placeholder:text-assistant-muted focus-visible:focus-ring disabled:opacity-60" onChange={event=>setRequest(event.target.value)}/>
    {reply&&<p role="status" className="m-0 text-sm">{reply}</p>}
    <button type="submit" disabled={!allowed||!canGenerate||!request.trim()||!!company&&(!company.phone||!company.email)} className={`${jobPrimary} justify-self-end`}>{busy==='drafting'?'Drafting…':'Update draft'}</button>
   </form>
   <label className={jobLabel}>Subject<input className={jobInput} maxLength={200} disabled={!allowed} value={text.subject} onChange={event=>setText({...text,subject:event.target.value})}/></label>
   <label className={jobLabel}>Message<textarea ref={messageField} rows={7} maxLength={8000} className={jobInput} disabled={!allowed} value={text.body} onChange={event=>setText({...text,body:event.target.value})}/></label>
   <div><p className="mb-2 mt-0 text-xs text-muted">Add a customer detail</p><div className="flex flex-wrap gap-2">{fields.map(field=><button key={field} type="button" className="min-h-11 cursor-pointer rounded-lg border border-line px-3 text-xs font-semibold text-primary focus-visible:focus-ring disabled:opacity-50" disabled={!allowed} onClick={()=>{
    const start=messageField.current?.selectionStart??text.body.length,end=messageField.current?.selectionEnd??start,next=text.body.slice(0,start)+`{${field}}`+text.body.slice(end);if(next.length>8000)return;setText({...text,body:next});requestAnimationFrame(()=>{messageField.current?.focus();messageField.current?.setSelectionRange(start+field.length+2,start+field.length+2);});
   }}>{field}</button>)}</div></div>
   {!valid&&text.subject&&text.body&&<p role="alert" className="m-0 text-sm text-error">Use a short subject and only the customer details listed above.</p>}
   {preview&&<section aria-label="Sample email" className="grid gap-2 rounded-xl border border-line bg-canvas p-4"><h3 className="m-0 text-sm font-semibold">Sample preview · {sample!.name}</h3><p className="m-0 text-sm font-semibold wrap-anywhere">{preview.subject}</p><p className="m-0 whitespace-pre-wrap text-sm leading-6 wrap-anywhere">{preview.body}</p></section>}
   <p className="m-0 text-xs leading-5 text-muted">Saving a draft sends nothing. You’ll choose customers and review their emails before sending.</p>
  </div>
 </SideDrawer>;
}

export function CompanyContacts({company,allowed,onSave}:{company:{version:number;phone:string;email:string};allowed:boolean;onSave:(input:{expectedVersion:number;phone:string;email:string})=>Promise<void>}){
 const [phone,setPhone]=useState(company.phone),[email,setEmail]=useState(company.email),[busy,setBusy]=useState(false),[failed,setFailed]=useState(false),lock=useRef(false);
 return <section aria-label="Company contact details" className="grid gap-3 rounded-xl border border-line p-4"><h3 className="m-0 text-sm font-semibold">Company contact details</h3><p className="m-0 text-xs text-muted">Customers will be asked to call or email these details.</p><label className={jobLabel}>Company phone<input type="tel" className={jobInput} maxLength={100} disabled={!allowed||busy} value={phone} onChange={event=>setPhone(event.target.value)}/></label><label className={jobLabel}>Company email<input type="email" className={jobInput} maxLength={254} disabled={!allowed||busy} value={email} onChange={event=>setEmail(event.target.value)}/></label>{failed&&<p role="alert" className="m-0 text-sm text-error">Contact details could not be saved. Reload the latest values and try again.</p>}<button type="button" className={jobButton} disabled={!allowed||busy||!phone.trim()||!/^\S+@\S+\.\S+$/.test(email)||phone===company.phone&&email===company.email} onClick={async()=>{if(lock.current)return;lock.current=true;setBusy(true);setFailed(false);try{await onSave({expectedVersion:company.version,phone:phone.trim(),email:email.trim()});}catch{setFailed(true);}finally{lock.current=false;setBusy(false);}}}>{busy?'Saving…':'Save contact details'}</button></section>;
}
