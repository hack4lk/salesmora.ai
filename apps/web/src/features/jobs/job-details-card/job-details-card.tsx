'use client';
import type {JobView} from '../job-preview.types';import {jobPanel,jobButton} from '../job-ui';import {copy} from './job-details-card.data';
export function JobDetailsCard({job,onEdit}:{job:JobView;onEdit?:()=>void}){
 return <section className={jobPanel}><header className="mb-4 flex flex-wrap items-center justify-between gap-3"><h2 className="m-0 text-lg font-semibold">{copy.title}</h2>{job.capabilities.edit&&!['completed','canceled'].includes(job.status)&&onEdit&&<button type="button" className={jobButton} onClick={onEdit}>{copy.edit}</button>}</header><dl className="m-0 grid min-w-0 gap-4">{(['service','location','description','nextStep'] as const).filter(key=>key!=='nextStep'||job[key]).map(key=><div key={key}><dt className="text-sm font-semibold text-muted">{key==='nextStep'?copy.next:copy[key]}</dt><dd className="mb-0 ml-0 mt-1 whitespace-pre-wrap text-sm leading-6 wrap-anywhere">{job[key]||copy.none}</dd></div>)}</dl></section>;
}
