'use client';
import {useEffect,useRef,useState} from 'react';
import {JobDialog} from '../../jobs/job-dialog/job-dialog';
import {jobButton,jobInput,jobLabel} from '../../jobs/job-ui';
import {StatusBadge} from '@salesmora/ui';
import type {ServiceEmailMessage,ServiceEmailResult,ServiceEmailSendReview} from './workflow-service-due.types';
export type ServiceEmailSendDialogProps={
 open:boolean;review:ServiceEmailSendReview;canSend:boolean;stale?:boolean;onClose:()=>void;onReload:()=>void;onConfigureCompany?:()=>void;
 onRevise:(input:{reviewId:string;revision:string;messages:ServiceEmailMessage[]})=>Promise<ServiceEmailSendReview>;
 onSend:(input:{reviewId:string;revision:string})=>Promise<readonly ServiceEmailResult[]>;
};
export function ServiceEmailSendDialog(props:ServiceEmailSendDialogProps){return <SendReview key={`${props.review.id}:${props.review.revision}`} {...props}/>;}
function SendReview({open,review:initial,canSend,stale,onClose,onReload,onConfigureCompany,onRevise,onSend}:ServiceEmailSendDialogProps){
 const [review,setReview]=useState(initial),[index,setIndex]=useState(0),[editing,setEditing]=useState(false),[messages,setMessages]=useState([...initial.messages]);
 const [results,setResults]=useState<readonly ServiceEmailResult[]>(),[error,setError]=useState(''),[pending,setPending]=useState(false),lock=useRef(false);
 const [expired,setExpired]=useState(()=>!Number.isFinite(Date.parse(initial.expiresAt))||Date.parse(initial.expiresAt)<=Date.now());
 useEffect(()=>{if(expired)return;let timer:ReturnType<typeof setTimeout>;const check=()=>{const delay=Date.parse(review.expiresAt)-Date.now();if(!Number.isFinite(delay)||delay<=0)setExpired(true);else timer=setTimeout(check,Math.min(delay,2_147_483_647));};check();return()=>clearTimeout(timer);},[review.expiresAt,expired]);
 const valid=messages.length>0&&messages.every(message=>!!message.subject.trim()&&message.subject.length<=200&&!/[\r\n]/.test(message.subject)&&!!message.body.trim()&&message.body.length<=8000);
 const allowed=canSend&&review.senderReady&&!stale&&!expired&&!pending&&!results;
 const current=messages[index];
 return <JobDialog open={open} title={results?'Email results':'Review customer emails'} description={results?'Sending status for this reviewed group.':'Each customer receives a separate email. Review the recipients and wording before sending.'}
  confirmLabel={results?'Done':editing?'Review changes':!messages.length?'No emails to send':`Send ${messages.length} ${messages.length===1?'email':'emails'}`} pending={pending}
  confirmDisabled={!results&&(!allowed||!valid)} error={results?undefined:error||(stale?'The draft or recipients changed. Refresh this review before sending.':expired?'This review expired. Refresh it before sending.':undefined)}
  closeOnSubmit={false} onClose={onClose} onSubmit={async()=>{
   if(results){onClose();return;}if(!allowed||!valid||lock.current||Date.parse(review.expiresAt)<=Date.now())return;
   lock.current=true;setPending(true);setError('');
   try{
    if(editing){const next=await onRevise({reviewId:review.id,revision:review.revision,messages});setReview(next);setMessages([...next.messages]);setIndex(0);setEditing(false);}
    else{const next=await onSend({reviewId:review.id,revision:review.revision});if(next.length!==messages.length||new Set(next.map(item=>item.cycleId)).size!==messages.length||next.some(item=>!messages.some(message=>message.cycleId===item.cycleId)))throw Error('Unconfirmed results');setResults(next);}
   }catch{setError(editing?'Changes could not be reviewed. Your edits are still here.':'The send could not be confirmed. Try again using this same review.');}
   finally{lock.current=false;setPending(false);}
  }}>
  {results?<><ul className="m-0 grid list-none gap-3 p-0">{results.map(item=><li key={item.cycleId} className="flex min-w-0 flex-wrap items-center justify-between gap-3"><span className="text-sm wrap-anywhere">{item.name}</span><StatusBadge label={item.status==='queued'?'Queued':item.status==='sent'?'Sent':'Failed'} tone={item.status==='failed'?'warning':item.status==='sent'?'success':'neutral'}/></li>)}</ul><p className="m-0 text-xs leading-5 text-muted">Sent means accepted by the email provider. It does not confirm delivery, reading or a reply.</p></>:<>
   <dl className="m-0 grid gap-2 rounded-xl border border-line bg-canvas p-3 text-sm"><div><dt className="font-semibold text-muted">From</dt><dd className="m-0 wrap-anywhere">{review.from}</dd></div><div><dt className="font-semibold text-muted">Company email</dt><dd className="m-0 wrap-anywhere">{review.replyTo}</dd></div></dl>
   {!review.senderReady&&<p role="status" className="m-0 text-sm text-error">{review.from==='Email sender unavailable'?'The email sender is unavailable. Ask your administrator to configure email delivery.':onConfigureCompany?<>Company contact details are missing. <button type="button" disabled={pending} className="cursor-pointer rounded-sm bg-transparent p-0 font-semibold text-primary underline underline-offset-2 focus-visible:focus-ring disabled:cursor-not-allowed disabled:opacity-50" onClick={onConfigureCompany}>Set company phone and email</button> before sending.</>:'Ask a workspace administrator to save the company phone and email before sending.'}</p>}
   {!canSend&&<p role="status" className="m-0 text-sm text-muted">You don’t have permission to send customer emails.</p>}
   {(stale||expired)&&<button type="button" className={jobButton} disabled={pending} onClick={onReload}>Refresh review</button>}
   {review.excluded.length>0&&<section aria-label="Excluded customers" className="rounded-xl border border-line p-3"><h3 className="m-0 text-sm font-semibold">Not included · {review.excluded.length}</h3><ul className="mb-0 mt-2 grid gap-2 pl-5 text-sm text-muted">{review.excluded.map((person,i)=><li key={i} className="wrap-anywhere">{person.name} · {person.reason}</li>)}</ul></section>}
   {current?<>
    <label className={jobLabel}>Recipient<select className={jobInput} value={index} disabled={pending} onChange={event=>setIndex(Number(event.target.value))}>{messages.map((message,i)=><option key={message.cycleId} value={i}>{message.name} · {message.to}</option>)}</select></label>
    {editing?<><label className={jobLabel}>Subject<input className={jobInput} maxLength={200} value={current.subject} disabled={!allowed} onChange={event=>setMessages(values=>values.map((message,i)=>i===index?{...message,subject:event.target.value}:message))}/></label>
     <label className={jobLabel}>Message<textarea className={jobInput} rows={7} maxLength={8000} value={current.body} disabled={!allowed} onChange={event=>setMessages(values=>values.map((message,i)=>i===index?{...message,body:event.target.value}:message))}/></label></>:<section aria-label="Personalized email" className="grid min-w-0 gap-3 rounded-xl border border-line p-4"><h3 className="m-0 text-base font-semibold wrap-anywhere">{current.subject}</h3><p className="m-0 whitespace-pre-wrap text-sm leading-6 wrap-anywhere">{current.body}</p></section>}
    {!editing&&<button type="button" className={`${jobButton} justify-self-start`} disabled={!allowed} onClick={()=>setEditing(true)}>Edit this email</button>}
   </>:<p role="status" className="m-0 text-sm">No eligible customers remain in this selection.</p>}
   <p className="m-0 text-xs text-muted">An unsubscribe link will be included in each email. No appointment is booked by sending.</p>
  </>}
 </JobDialog>;
}
