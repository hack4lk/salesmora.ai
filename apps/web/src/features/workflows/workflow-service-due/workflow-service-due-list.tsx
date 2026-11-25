'use client';
import {useId,useRef,useState} from 'react';
import Menu from '@mui/material/Menu';
import MenuItem from '@mui/material/MenuItem';
import {DataTable,Pagination,FormFeedback,StatusBadge,MoreHorizOutlined,type PaginationProps} from '@salesmora/ui';
import {JobDialog} from '../../jobs/job-dialog/job-dialog';
import {jobButton,jobDate,jobInput,jobLabel,jobPrimary} from '../../jobs/job-ui';
import {serviceEmailFields,validServiceEmail} from './service-email-template';
import {ServiceEmailDraftDrawer,type ServiceEmailDraftDrawerProps} from './service-email-draft-drawer';
import {ServiceEmailSendDialog,type ServiceEmailSendDialogProps} from './service-email-send-dialog';
import type {ServiceDueCustomer,ServiceEmailResult,ServiceEmailSendReview,ServiceEmailTemplate} from './workflow-service-due.types';
export type WorkflowServiceDueListProps={
 /** Annual-review presentation only; the host supplies occurrence-scoped customers. */
 reviewDate?:string;
 company?:ServiceEmailDraftDrawerProps['company'];canConfigureCompany?:boolean;canGenerate?:boolean;onSaveCompany?:ServiceEmailDraftDrawerProps['onSaveCompany'];initializing?:boolean;
 service:{id:string;name:string};workflowName:string;rows:readonly ServiceDueCustomer[];today:string;
 pagination:PaginationProps;state?:'ready'|'loading'|'error';canRead:boolean;canManage:boolean;canEmail:boolean;paused?:boolean;
 template:ServiceEmailTemplate;templateConflict?:boolean;onRetry:()=>void;onReloadTemplate:()=>void;onBack:()=>void;
 onOpenCustomer:(row:ServiceDueCustomer)=>void;onOpenJob:(row:ServiceDueCustomer)=>void;onOpenExistingJob?:(row:ServiceDueCustomer)=>void;
 onResolve:(input:{cycleId:string;expectedVersion:number;action:'dismiss'|'snooze';date?:string})=>Promise<void>;
 onGenerate:ServiceEmailDraftDrawerProps['onGenerate'];onSaveTemplate:ServiceEmailDraftDrawerProps['onSave'];
 onPrepareEmails:(input:{cycles:{id:string;version:number}[];templateId:string;templateVersion:number})=>Promise<ServiceEmailSendReview>;
 onReviseEmails:ServiceEmailSendDialogProps['onRevise'];onSendEmails:(input:{reviewId:string;revision:string})=>Promise<readonly ServiceEmailResult[]>;
};
const labels:Record<ServiceDueCustomer['status'],string>={due:'Due',work_open:'Work already open',snoozed:'Reminder postponed',dismissed:'Dismissed',queued:'Email queued',sent:'Email sent',failed:'Email failed'};
function DueActions({row,annual,disabled,onOpenCustomer,onOpenJob,onResolve,onEmail,canEmail,onOpenExistingJob}:{row:ServiceDueCustomer;annual?:boolean;disabled:boolean;canEmail:boolean;onOpenCustomer:()=>void;onOpenJob:()=>void;onOpenExistingJob?:()=>void;onResolve:(action:'dismiss'|'snooze')=>void;onEmail:()=>void}){
 const [anchor,setAnchor]=useState<HTMLElement|null>(null),id=useId();
 const select=(action:()=>void)=>{setAnchor(null);action();};
 return <><button type="button" className="flex size-11 shrink-0 cursor-pointer items-center justify-center rounded-xl border border-line bg-paper text-primary hover:bg-canvas focus-visible:focus-ring" aria-label={`Actions for ${row.name}`} aria-haspopup="menu" aria-expanded={!!anchor} aria-controls={anchor?id:undefined} onClick={event=>setAnchor(event.currentTarget)}><MoreHorizOutlined aria-hidden="true"/></button>
  <Menu id={id} anchorEl={anchor} open={!!anchor} onClose={()=>setAnchor(null)}>
   <MenuItem onClick={()=>select(onOpenCustomer)}>Open customer</MenuItem>{onOpenExistingJob&&<MenuItem onClick={()=>select(onOpenExistingJob)}>Open existing job</MenuItem>}<MenuItem onClick={()=>select(onOpenJob)}>Open source job</MenuItem>
   <MenuItem disabled={disabled||!canEmail||!!row.exclusion||!row.email||!['due','failed'].includes(row.status)} onClick={()=>select(onEmail)}>Review email</MenuItem>
   <MenuItem disabled={disabled||!['due','failed','snoozed'].includes(row.status)} onClick={()=>select(()=>onResolve('snooze'))}>Remind me later</MenuItem>
   <MenuItem disabled={disabled||!['due','failed','snoozed'].includes(row.status)} onClick={()=>select(()=>onResolve('dismiss'))}>{annual?'Dismiss this review':'Dismiss this cycle'}</MenuItem>
  </Menu></>;
}
/** Canonical due list and host composition. Stories mock callbacks; no messages are sent by this component. */
export function WorkflowServiceDueList(props:WorkflowServiceDueListProps){return <DueList key={`${props.service.id}:${props.reviewDate??'due'}`} {...props}/>;}
function DueList(props:WorkflowServiceDueListProps){
 const {service,rows,template,canRead,canManage,canEmail,paused,state='ready',pagination}=props;
 const [selected,setSelected]=useState<string[]>([]),[drafting,setDrafting]=useState(false),[review,setReview]=useState<ServiceEmailSendReview>(),[busy,setBusy]=useState(false),[error,setError]=useState('');
 const [resolution,setResolution]=useState<{row:ServiceDueCustomer;action:'dismiss'|'snooze'}>(),[date,setDate]=useState(''),lock=useRef(false);
 const actionable=canRead&&canManage&&!paused&&state==='ready'&&!busy&&!(props.reviewDate&&props.initializing);
 const eligible=(row:ServiceDueCustomer)=>canEmail&&!row.exclusion&&!!row.email&&['due','failed'].includes(row.status);
 // Selection is limited to this page and current cycle revisions; hidden/stale rows never join a send review.
 const selection=rows.filter(row=>selected.includes(`${row.id}:${row.version}`)&&eligible(row));
 const keys=selection.map(row=>`${row.id}:${row.version}`),all=rows.some(eligible)&&rows.filter(eligible).every(row=>keys.includes(`${row.id}:${row.version}`));
 async function prepare(chosen:readonly ServiceDueCustomer[]){if(!actionable||!canEmail||!chosen.length||!validServiceEmail(template)||lock.current)return;lock.current=true;setBusy(true);setError('');
  try{const next=await props.onPrepareEmails({cycles:chosen.map(row=>({id:row.id,version:row.version})),templateId:template.id,templateVersion:template.version});setReview(next);}
  catch{setError('The email review could not be prepared. Your selection is still here.');}finally{lock.current=false;setBusy(false);}
 }
 const controls=(row:ServiceDueCustomer)=><DueActions row={row} annual={!!props.reviewDate} disabled={!actionable} canEmail={canEmail&&validServiceEmail(template)} onOpenExistingJob={row.activeJob&&props.onOpenExistingJob?()=>props.onOpenExistingJob!(row):undefined} onOpenCustomer={()=>props.onOpenCustomer(row)} onOpenJob={()=>props.onOpenJob(row)} onEmail={()=>void prepare([row])} onResolve={action=>{setResolution({row:structuredClone(row),action});setDate('');}}/>;
 const status=(row:ServiceDueCustomer)=><div className="grid justify-items-start gap-1"><StatusBadge label={props.reviewDate&&row.status==='due'?'To review':labels[row.status]} tone={row.status==='sent'?'success':row.status==='failed'?'warning':'neutral'}/>{row.exclusion&&<span className="text-xs text-muted wrap-anywhere">{row.exclusion}</span>}</div>;
 const checkbox=(row:ServiceDueCustomer)=><input type="checkbox" aria-label={`Select ${row.name}`} className="size-5 cursor-pointer accent-primary disabled:cursor-not-allowed" checked={keys.includes(`${row.id}:${row.version}`)} disabled={!actionable||!eligible(row)} onChange={event=>setSelected(current=>event.target.checked?[...new Set([...current,`${row.id}:${row.version}`])]:current.filter(key=>key!==`${row.id}:${row.version}`))}/>;
 const currentResolution=resolution&&rows.find(row=>row.id===resolution.row.id&&row.version===resolution.row.version);
 return <div className="grid min-w-0 gap-5 text-ink"><button type="button" className={`${jobButton} justify-self-start`} disabled={busy} onClick={props.onBack}>Back to workflows</button>
  <header><h1 className="m-0 text-2xl font-semibold">{service.name} {props.reviewDate?'review':'reminders'}</h1><p className="mb-0 mt-2 text-sm text-muted">{props.workflowName}{props.reviewDate?` · ${jobDate(props.reviewDate)}`:''}</p></header>
  {!canRead?<p role="status">You no longer have access to these reminders.</p>:<>
   {props.initializing&&<p role="status" className="m-0 text-sm text-muted">{props.reviewDate?'Preparing this annual review. Customers will appear when it is ready.':'Checking existing completed jobs. Customers will appear as the review progresses.'}</p>}
   {paused&&<p role="status" className="m-0 rounded-xl border border-line bg-canvas p-4 text-sm">This workflow is paused. Resume it to manage reminders or send emails.</p>}
   {!canEmail&&<p role="status" className="m-0 text-sm text-muted">Customer email isn’t available with your current access or setup. You can still review the reminder list.</p>}
   {error&&<FormFeedback kind="error" message={error}/>}
   <section aria-label="Service email" className="flex min-w-0 flex-wrap items-center justify-between gap-4 rounded-2xl border border-line bg-paper p-5"><div className="min-w-0"><h2 className="m-0 text-base font-semibold">Customer email</h2><p className="mb-0 mt-1 text-sm text-muted">Draft with the assistant, then choose customers and review before sending.</p></div>
    <button type="button" className={jobPrimary} disabled={!actionable||!canEmail} onClick={()=>setDrafting(true)}>Prepare service email</button></section>
   {!validServiceEmail(template)&&<p role="status" className="m-0 text-sm text-muted">Prepare and save a service email before reviewing recipients.</p>}
   <div className="flex flex-wrap items-center justify-between gap-3"><label className="flex min-h-11 cursor-pointer items-center gap-2 text-sm"><input type="checkbox" checked={all} disabled={!actionable||!canEmail||!rows.some(eligible)} className="size-5 accent-primary" onChange={event=>setSelected(event.target.checked?rows.filter(eligible).map(row=>`${row.id}:${row.version}`):[])}/>Select eligible on this page</label>
    <div className="flex flex-wrap items-center gap-3"><button type="button" className={jobButton} disabled={busy||pagination.disabled} onClick={props.onRetry}>Refresh list</button><button type="button" className={jobPrimary} disabled={!actionable||!selection.length||!validServiceEmail(template)} onClick={()=>void prepare(selection)}>Review emails{selection.length?` (${selection.length})`:''}</button></div></div>
   <DataTable caption={props.reviewDate?"Customers to review":"Customers due for service"} rows={rows} getRowId={row=>row.id} getRowLabel={row=>row.name} constrainHeight={false} state={props.reviewDate&&props.initializing?'loading':state} onRetry={props.onRetry} emptyMessage={props.reviewDate?"No customers to review for this date.":"No customers are due for this service right now."} selectedIds={selection.map(row=>row.id)}
    columns={[{id:'select',label:'Select',compact:true,render:checkbox},{id:'customer',label:'Customer',render:row=><button type="button" className="min-h-11 cursor-pointer text-left text-sm font-semibold text-primary focus-visible:focus-ring" onClick={()=>props.onOpenCustomer(row)}>{row.name}</button>},{id:'completed',label:'Last marked completed',render:row=>jobDate(row.completedDate)},...(props.reviewDate?[]:[{id:'due',label:'Due date',render:(row:ServiceDueCustomer)=>jobDate(row.dueDate)}]),{id:'status',label:'Status',render:status},{id:'actions',label:'Actions',compact:true,render:controls}]}
    renderCard={row=><div className="grid min-w-0 gap-3"><div className="flex items-center justify-between gap-3"><label className="flex min-h-11 items-center gap-3 font-semibold">{checkbox(row)}{row.name}</label>{controls(row)}</div><p className="m-0 text-sm text-muted">Marked completed {jobDate(row.completedDate)}{!props.reviewDate&&<> · Due {jobDate(row.dueDate)}</>}</p>{status(row)}</div>}/>
   <Pagination {...pagination} onPageChange={page=>{setSelected([]);pagination.onPageChange(page);}} onPageSizeChange={size=>{setSelected([]);pagination.onPageSizeChange(size);}}/>
   <p className="m-0 text-xs text-muted">{props.reviewDate?'Review past service before contacting customers. Sending email does not book work.':'Service dates use when a job was marked completed. Sending a reminder does not book or complete work.'}</p>
  </>}
  {canRead&&drafting&&<ServiceEmailDraftDrawer fields={props.reviewDate?serviceEmailFields.filter(field=>field!=='Due date'):undefined} company={props.company} canConfigureCompany={props.canConfigureCompany} canGenerate={props.canGenerate} onSaveCompany={props.onSaveCompany} open service={service} template={template} sample={rows.find(eligible)} canDraft={actionable&&canEmail} conflict={props.templateConflict} onReload={props.onReloadTemplate} onClose={()=>setDrafting(false)} onGenerate={props.onGenerate} onSave={props.onSaveTemplate}/>}
  {canRead&&review&&<ServiceEmailSendDialog open review={review} canSend={actionable&&canEmail} stale={props.templateConflict||review.templateVersion!==template.version||review.messages.some(message=>!rows.some(row=>row.id===message.cycleId&&row.version===message.cycleVersion&&row.customerId===message.customerId&&row.email===message.to&&eligible(row)))}
   onConfigureCompany={actionable&&props.canConfigureCompany&&props.company&&props.onSaveCompany?()=>{setReview(undefined);setDrafting(true);}:undefined} onClose={()=>setReview(undefined)} onReload={()=>{const chosen=rows.filter(row=>review.messages.some(message=>message.cycleId===row.id)&&eligible(row));setReview(undefined);if(chosen.length)void prepare(chosen);else setError('No eligible customers remain. Review the latest list.');}} onRevise={props.onReviseEmails} onSend={props.onSendEmails}/>}
  {canRead&&resolution&&<JobDialog open title={resolution.action==='dismiss'?'Dismiss this reminder?':'Remind me later'} description={resolution.row.name} confirmLabel={resolution.action==='dismiss'?props.reviewDate?'Dismiss this review':'Dismiss this cycle':'Save reminder'} confirmDisabled={!actionable||!currentResolution||!['due','failed','snoozed'].includes(currentResolution.status)||resolution.action==='snooze'&&(!/^\d{4}-\d{2}-\d{2}$/.test(date)||date<=props.today)}
   error={!currentResolution?'This reminder changed. Close and review the latest list.':undefined} onClose={()=>setResolution(undefined)} onSubmit={()=>props.onResolve({cycleId:resolution.row.id,expectedVersion:resolution.row.version,action:resolution.action,...(resolution.action==='snooze'?{date}:{})})}>
   {resolution.action==='snooze'?<label className={jobLabel}>Remind me on<input type="date" className={jobInput} value={date} min={props.today} onChange={event=>setDate(event.target.value)}/></label>:<p className="m-0 text-sm">{props.reviewDate?"This dismisses this year’s review only. Next year’s review is unchanged.":'This reminder stays dismissed until a new service completion starts another cycle.'}</p>}
  </JobDialog>}
 </div>;
}
