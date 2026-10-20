'use client';
import {useRef,useState} from 'react';
import type {WorkOrderStatus} from '@salesmora/contracts';
import type {WorkOrderCapabilities,WorkOrderCompletion,WorkOrderCompletionInput,WorkOrderFollowUp} from '../work-order-preview.types';
import {woButton,woInput,woLabel,woPanel,woPrimary} from '../work-order-ui';
import {copy,summaryLimit} from './work-order-signoff.data';
const when=(iso:string)=>new Date(iso).toLocaleString('en-US',{month:'short',day:'numeric',hour:'numeric',minute:'2-digit'});
export type WorkOrderSignoffProps={status:WorkOrderStatus;completion:WorkOrderCompletion|null;openRequiredTasks:number;signoffRequired:boolean;canOverride:boolean;capabilities:Pick<WorkOrderCapabilities,'complete'|'reopen'>;onComplete:(input:WorkOrderCompletionInput)=>void;onReopen:()=>void};
function SignaturePad({onInk,onClear}:{onInk:(dataUrl:string|null)=>void;onClear:()=>void}){
 const ref=useRef<HTMLCanvasElement>(null);const drawing=useRef(false);const [inked,setInked]=useState(false);
 const point=(e:React.PointerEvent<HTMLCanvasElement>)=>{const c=ref.current!,r=c.getBoundingClientRect();return {x:(e.clientX-r.left)*c.width/r.width,y:(e.clientY-r.top)*c.height/r.height}};
 const down=(e:React.PointerEvent<HTMLCanvasElement>)=>{const ctx=ref.current!.getContext('2d')!;const p=point(e);e.currentTarget.setPointerCapture(e.pointerId);drawing.current=true;ctx.lineWidth=3;ctx.lineCap='round';ctx.strokeStyle='#17263b';ctx.beginPath();ctx.moveTo(p.x,p.y)};
 const move=(e:React.PointerEvent<HTMLCanvasElement>)=>{if(!drawing.current)return;const ctx=ref.current!.getContext('2d')!;const p=point(e);ctx.lineTo(p.x,p.y);ctx.stroke()};
 const up=()=>{if(!drawing.current)return;drawing.current=false;setInked(true);onInk(ref.current!.toDataURL('image/png'))};
 const clear=()=>{const c=ref.current!;c.getContext('2d')!.clearRect(0,0,c.width,c.height);setInked(false);onClear()};
 return <div className="grid gap-2"><canvas ref={ref} width={600} height={200} role="img" aria-label={copy.signatureCanvas} className="h-40 w-full touch-none rounded-xl border border-line bg-paper" onPointerDown={down} onPointerMove={move} onPointerUp={up} onPointerCancel={up}/>
  <div className="flex flex-wrap items-center justify-between gap-2"><span className="text-xs text-muted">{copy.signatureHint}</span><button type="button" className={woButton} disabled={!inked} onClick={clear}>{copy.clear}</button></div></div>;
}
export function WorkOrderSignoff({status,completion,openRequiredTasks,signoffRequired,canOverride,capabilities:c,onComplete,onReopen}:WorkOrderSignoffProps){
 const [summary,setSummary]=useState('');const [followUp,setFollowUp]=useState<WorkOrderFollowUp>('none');const [followUpNote,setFollowUpNote]=useState('');
 const [signer,setSigner]=useState('');const [signature,setSignature]=useState<string|null>(null);const [reason,setReason]=useState('');
 const blockedByTasks=openRequiredTasks>0&&!canOverride,needsReason=openRequiredTasks>0&&canOverride;
 const ready=summary.trim()&&!blockedByTasks&&(!needsReason||reason.trim())&&(!signoffRequired||(signer.trim()&&signature))&&(followUp==='none'||followUpNote.trim());
 const submit=(e:React.FormEvent)=>{e.preventDefault();if(!ready)return;onComplete({summary:summary.trim(),followUp,followUpNote:followUp==='none'?'':followUpNote.trim(),signerName:signer.trim(),signatureDataUrl:signature,overrideReason:needsReason?reason.trim():''})};
 const head=<header className="mb-4"><h2 id="wo-signoff-title" className="m-0 text-lg font-semibold">{copy.title}</h2></header>;
 if(status==='completed'&&completion)return <section className={woPanel} aria-labelledby="wo-signoff-title">{head}
  <div className="grid gap-4"><p className="m-0 whitespace-pre-wrap text-base leading-6 wrap-anywhere">{completion.summary}</p>
   <p className="m-0 text-sm text-muted">{copy.completedBy(completion.completedByName,when(completion.completedAt))}</p>
   {completion.overrideReason&&<p className="m-0 rounded-xl border border-line bg-canvas p-3 text-sm font-semibold wrap-anywhere">{copy.overrideShown(completion.overrideReason)}</p>}
   {completion.followUp!=='none'&&<div><h3 className="m-0 mb-1 text-sm font-semibold">{copy.followUpShown}: {copy.followUpOptions[completion.followUp]}</h3><p className="m-0 text-base wrap-anywhere">{completion.followUpNote}</p></div>}
   <div className="border-t border-line pt-4">{completion.signerName&&completion.signedAt?<><div className="grid h-24 place-items-center rounded-xl border border-line bg-paper">{completion.signatureUrl?<img src={completion.signatureUrl} alt={copy.signatureAlt(completion.signerName)} className="max-h-full"/>:<span className="text-xs font-semibold text-muted">{copy.signatureOnFile}</span>}</div><p className="mb-0 mt-2 text-sm text-muted">{copy.signedBy(completion.signerName,when(completion.signedAt))}</p></>:<p className="m-0 text-sm text-muted">{copy.notSigned}</p>}</div>
   {c.reopen&&<div className="flex justify-end"><button type="button" className={woButton} onClick={onReopen}>{copy.reopen}</button></div>}</div></section>;
 const note=status==='canceled'?copy.canceled:status==='draft'?copy.draftNote:status==='issued'?copy.notReady:!c.complete?copy.noPermission:null;
 if(note)return <section className={woPanel} aria-labelledby="wo-signoff-title">{head}<p className="m-0 text-sm text-muted">{note}</p>{c.reopen&&status==='canceled'&&<div className="mt-4 flex justify-end"><button type="button" className={woButton} onClick={onReopen}>{copy.reopen}</button></div>}</section>;
 return <section className={woPanel} aria-labelledby="wo-signoff-title">{head}
  <form className="grid gap-4" onSubmit={submit}>
   {openRequiredTasks>0&&<p role="alert" className="m-0 rounded-xl border border-error p-3 text-sm font-semibold text-error">{copy.requiredOpen(openRequiredTasks)} {blockedByTasks?copy.blocked:''}</p>}
   {needsReason&&<label className={woLabel}>{copy.override}<textarea className={`${woInput} min-h-20 resize-y`} rows={2} value={reason} placeholder={copy.overridePlaceholder} onChange={e=>setReason(e.target.value)}/></label>}
   <div className="grid gap-1"><label className={woLabel}>{copy.summary}<textarea className={`${woInput} min-h-24 resize-y`} rows={4} maxLength={summaryLimit} value={summary} placeholder={copy.summaryPlaceholder} aria-describedby="wo-summary-count" onChange={e=>setSummary(e.target.value)}/></label><span id="wo-summary-count" className="text-xs text-muted">{copy.counter(summary.length,summaryLimit)}</span></div>
   <label className={woLabel}>{copy.followUp}<select className={woInput} value={followUp} onChange={e=>setFollowUp(e.target.value as WorkOrderFollowUp)}>{(Object.keys(copy.followUpOptions) as WorkOrderFollowUp[]).map(k=><option key={k} value={k}>{copy.followUpOptions[k]}</option>)}</select></label>
   {followUp!=='none'&&<label className={woLabel}>{copy.followUpNote}<textarea className={`${woInput} min-h-20 resize-y`} rows={2} value={followUpNote} placeholder={copy.followUpNotePlaceholder} onChange={e=>setFollowUpNote(e.target.value)}/></label>}
   {signoffRequired&&<div className="grid gap-3 border-t border-line pt-4"><label className={woLabel}>{copy.signer}<input className={woInput} value={signer} placeholder={copy.signerPlaceholder} onChange={e=>setSigner(e.target.value)}/></label>
    <div className="grid gap-2"><span className="text-sm font-semibold text-ink">{copy.signature}</span><SignaturePad onInk={setSignature} onClear={()=>setSignature(null)}/></div><p className="m-0 text-xs text-muted">{copy.privacy}</p></div>}
   <div className="flex flex-wrap items-center justify-between gap-3">{signoffRequired?<span className="text-xs text-muted">{copy.signoffRequired}</span>:<span/>}<button type="submit" className={woPrimary} disabled={!ready}>{copy.complete}</button></div>
  </form></section>;
}
