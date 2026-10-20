'use client';
import {jobPanel,jobButton} from '../job-ui';import {copy} from './job-related-records.data';
export type JobRelatedRecord={id:string;kind:'customer'|'lead'|'origin'|'followOn';label:string;canOpen:boolean};
export function JobRelatedRecords({records,onOpen}:{records:JobRelatedRecord[];onOpen:(id:string,kind:JobRelatedRecord['kind'])=>void}){
 return <section className={jobPanel}><h2 className="mt-0 text-lg font-semibold">{copy.title}</h2><ul className="m-0 grid gap-4 p-0">{records.map(r=><li key={r.id} className="flex min-w-0 list-none flex-wrap items-center justify-between gap-3 border-b border-line pb-3 last:border-0"><div className="min-w-0"><p className="m-0 text-xs text-muted">{copy[r.kind]}</p><p className="my-1 text-sm font-semibold wrap-anywhere">{r.label}</p>{!r.canOpen&&<p className="m-0 text-xs text-muted">{copy.unavailable}</p>}</div>{r.canOpen&&<button className={jobButton} onClick={()=>onOpen(r.id,r.kind)} aria-label={`${copy.open}: ${r.label}`}>{copy.open}</button>}</li>)}</ul>{!records.some(r=>r.kind==='lead')&&<p className="mb-0 text-sm text-muted">{copy.none}</p>}</section>;
}
