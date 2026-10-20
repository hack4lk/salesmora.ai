import type {WorkOrderPrintData} from '../work-order-preview.types';
import {woDate,woStamp} from '../work-order-ui';
import {copy} from './work-order-print-paper.data';
const Field=({label,children}:{label:string;children:React.ReactNode})=><div className="min-w-0"><dt className="text-xs font-semibold uppercase tracking-wide text-muted">{label}</dt><dd className="m-0 mt-0.5 text-sm text-ink wrap-anywhere">{children}</dd></div>;
const Heading=({children}:{children:React.ReactNode})=><h2 className="m-0 mb-2 border-b border-ink pb-1 text-sm font-bold uppercase tracking-wide text-ink">{children}</h2>;
export type WorkOrderPrintPaperProps={data:WorkOrderPrintData};
export function WorkOrderPrintPaper({data:d}:WorkOrderPrintPaperProps){
 const {instructions:i}=d;
 return <article aria-label={`${copy.title} ${d.number}`} className="mx-auto box-border w-full max-w-[8.5in] bg-paper p-[0.6in] text-ink print:m-0 print:max-w-none print:p-0 sm:min-h-[11in]">
  <header className="flex flex-wrap items-start justify-between gap-4 border-b-2 border-ink pb-3"><div className="min-w-0"><p className="m-0 text-lg font-bold wrap-anywhere">{d.businessName}</p><p className="m-0 text-sm text-muted">{d.businessPhone}</p></div>
   <div className="text-right"><p className="m-0 text-xs font-semibold uppercase tracking-wide text-muted">{copy.title}</p><p className="m-0 text-2xl font-bold">{d.number}</p></div></header>
  <h1 className="mb-3 mt-4 text-xl font-bold wrap-anywhere">{d.title}</h1>
  <dl className="m-0 grid grid-cols-2 gap-x-6 gap-y-3">
   <Field label={copy.customer}>{d.customerName}{d.customerPhone&&<><br/>{d.customerPhone}</>}</Field>
   <Field label={copy.address}>{d.address}</Field>
   <Field label={copy.scheduled}>{d.scheduledDate?`${woDate(d.scheduledDate)}${d.scheduledWindow?` · ${copy.window(d.scheduledWindow)}`:''}`:copy.notScheduled}</Field>
   <Field label={copy.assignee}>{d.assigneeName??copy.unassigned}{d.crewNames.length>0&&<><br/><span className="text-muted">{copy.crew}: </span>{d.crewNames.join(', ')}</>}</Field>
   {d.jobNumber&&<Field label={copy.job}>{d.jobNumber}</Field>}
  </dl>
  {i.safetyNotes.trim()&&<section className="mt-5 break-inside-avoid border-2 border-ink p-3"><h2 className="m-0 mb-1 text-sm font-bold uppercase tracking-wide">{copy.safety}</h2><p className="m-0 whitespace-pre-wrap text-sm leading-5 wrap-anywhere">{i.safetyNotes}</p></section>}
  {i.instructions.trim()&&<section className="mt-5 break-inside-avoid"><Heading>{copy.scope}</Heading><p className="m-0 whitespace-pre-wrap text-sm leading-5 wrap-anywhere">{i.instructions}</p></section>}
  {i.accessNotes.trim()&&<section className="mt-5 break-inside-avoid"><Heading>{copy.access}</Heading><p className="m-0 whitespace-pre-wrap text-sm leading-5 wrap-anywhere">{i.accessNotes}</p></section>}
  <section className="mt-5"><Heading>{copy.tasks}</Heading>{d.tasks.length===0?<p className="m-0 text-sm text-muted">{copy.noTasks}</p>:<ul className="m-0 grid list-none gap-2 p-0">{d.tasks.map(t=><li key={t.id} className="flex min-w-0 break-inside-avoid items-start gap-3 text-sm"><span aria-hidden="true" className="mt-0.5 grid size-4 shrink-0 place-items-center border-2 border-ink text-xs font-bold leading-none">{t.done?'✓':''}</span><span className="min-w-0 wrap-anywhere">{t.label}{t.required&&<span className="ml-2 text-xs font-semibold uppercase text-muted">{copy.required}</span>}</span></li>)}</ul>}</section>
  <section className="mt-5 break-inside-avoid"><Heading>{copy.materials}</Heading>{d.materials.length===0?<p className="m-0 text-sm text-muted">{copy.noMaterials}</p>:<table className="w-full border-collapse text-left text-sm"><thead><tr className="border-b border-line"><th scope="col" className="py-1 pr-3 font-semibold">{copy.item}</th><th scope="col" className="w-24 py-1 pr-3 font-semibold">{copy.qty}</th><th scope="col" className="py-1 font-semibold">{copy.notes}</th></tr></thead><tbody>{d.materials.map(m=><tr key={m.id} className="border-b border-line align-top"><td className="py-1.5 pr-3 wrap-anywhere">{m.name}</td><td className="py-1.5 pr-3">{m.quantity} {m.unit}</td><td className="py-1.5 text-muted wrap-anywhere">{m.note}</td></tr>)}</tbody></table>}</section>
  <section className="mt-5 break-inside-avoid"><Heading>{copy.crewNotes}</Heading><div aria-hidden="true" className="grid gap-6 pt-4">{[0,1,2,3].map(n=><div key={n} className="border-b border-line"/>)}</div></section>
  {d.signoff?<section className="mt-6 break-inside-avoid"><Heading>{copy.workDone}</Heading><p className="m-0 whitespace-pre-wrap text-sm leading-5 wrap-anywhere">{d.signoff.summary}</p>
   <div className="mt-4 grid grid-cols-2 gap-x-8"><div><div className="grid h-14 items-end border-b border-ink text-sm">{d.signoff.completedByName}</div><p className="m-0 mt-1 text-xs text-muted">{copy.completedBy} · {woStamp(d.signoff.completedAt)}</p></div>
   <div><div className="grid h-14 items-end border-b border-ink">{d.signoff.signatureUrl&&<img src={d.signoff.signatureUrl} alt={copy.signatureAlt(d.signoff.signerName??'')} className="h-14 max-w-full object-contain object-left"/>}</div><p className="m-0 mt-1 text-xs text-muted">{d.signoff.signerName?`${copy.customerSignature} · ${d.signoff.signerName}${d.signoff.signedAt?` · ${woStamp(d.signoff.signedAt)}`:''}`:copy.noSignature}</p></div></div></section>
  :<section className="mt-6 grid break-inside-avoid grid-cols-2 gap-x-8 gap-y-8"><div><div aria-hidden="true" className="h-10 border-b border-ink"/><p className="m-0 mt-1 text-xs text-muted">{copy.completedBy} · {copy.date}</p></div><div><div aria-hidden="true" className="h-10 border-b border-ink"/><p className="m-0 mt-1 text-xs text-muted">{copy.customerSignature} · {copy.printedName}</p></div></section>}
  <footer className="mt-6 flex flex-wrap justify-between gap-2 border-t border-line pt-2 text-xs text-muted"><span>{copy.internal}</span><span>{copy.printed(woStamp(d.printedAt))}</span></footer></article>;
}
