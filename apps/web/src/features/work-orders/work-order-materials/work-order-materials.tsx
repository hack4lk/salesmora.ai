'use client';
import {useState} from 'react';
import type {WorkOrderStatus} from '@salesmora/contracts';
import {materialStatuses,type WorkOrderCapabilities,type WorkOrderMaterial,type WorkOrderMaterialAccess,type WorkOrderMaterialStatus} from '../work-order-preview.types';
import {woButton,woInput,woPanel} from '../work-order-ui';
import {MaterialThumb} from '../../materials/material-thumb/material-thumb';
import type {MaterialPickerOption} from '../../materials/material-picker/material-picker';
import {WorkOrderAddMaterialDialog,type WorkOrderAddMaterialDialogProps} from '../work-order-add-material-dialog/work-order-add-material-dialog';
import {copy} from './work-order-materials.data';
const money=(cents:number)=>new Intl.NumberFormat('en-US',{style:'currency',currency:'USD'}).format(cents/100);
const toCents=(v:string)=>{const n=Number(v);return v.trim()!==''&&Number.isFinite(n)&&n>=0?Math.round(n*100):null};
export type WorkOrderMaterialInput={catalogId:string|null;name:string;quantity:number;unit:string;note:string;customerPriceCents:number|null;costCents:number|null};
export type WorkOrderMaterialsProps={status:WorkOrderStatus;materials:WorkOrderMaterial[];searchCatalog:(query:string,signal:AbortSignal)=>Promise<MaterialPickerOption[]>;access:WorkOrderMaterialAccess;capabilities:Pick<WorkOrderCapabilities,'update'|'progress'>;newMaterial?:WorkOrderAddMaterialDialogProps['newMaterial'];onAdd:(item:WorkOrderMaterialInput)=>void;onRemove:(id:string)=>void;onChangeStatus:(id:string,status:WorkOrderMaterialStatus)=>void;onChangePrice:(id:string,cents:number|null)=>void};
export function WorkOrderMaterials({status,materials,searchCatalog,newMaterial,access,capabilities:c,onAdd,onRemove,onChangeStatus,onChangePrice}:WorkOrderMaterialsProps){
 const [adding,setAdding]=useState(false);
 const closed=status==='completed'||status==='canceled',draft=status==='draft';
 const canEdit=c.update&&!closed,canMark=c.progress&&(status==='issued'||status==='in-progress');
 const used=materials.filter(m=>m.status==='used').length;
 const msg=closed?copy.locked:draft?(canEdit?copy.draftHint:null):!canMark&&!canEdit?copy.noProgress:null;
 const total=materials.reduce((s,m)=>s+(m.customerPriceCents??0)*m.quantity,0);
 const totalCost=materials.reduce((s,m)=>s+(m.costCents??0)*m.quantity,0);
 return <section className={woPanel} aria-labelledby="wo-materials-title"><header className="mb-1 flex flex-wrap items-center justify-between gap-3"><h2 id="wo-materials-title" className="m-0 text-lg font-semibold">{copy.title}</h2>{materials.length>0&&<span className="text-sm font-semibold text-muted">{copy.summary(used,materials.length)}</span>}</header>
  <p className="mb-4 mt-0 text-sm text-muted">{access.prices?copy.priceNote:copy.note}</p>
  {materials.length===0?<p className="m-0 text-sm text-muted">{canEdit?copy.emptyEdit:copy.empty}</p>:
   <ul className="m-0 grid list-none gap-2 p-0">{materials.map(m=><li key={m.id} className="grid min-w-0 gap-3 rounded-xl border border-line bg-paper p-3 sm:grid-cols-[1fr_auto] sm:items-center">
    <div className="flex min-w-0 items-start gap-3"><MaterialThumb name={m.name} imageUrl={m.imageUrl}/><div className="min-w-0"><p className="m-0 text-base font-semibold text-ink wrap-anywhere">{m.name}{!m.catalogId&&access.prices&&<span className="ml-2 text-xs font-normal text-muted">{copy.customItem}</span>}</p><p className="m-0 mt-1 text-sm text-muted">{m.quantity} {m.unit}{m.note&&<span className="wrap-anywhere"> · {m.note}</span>}</p>
     {access.prices&&<div className="mt-2 flex flex-wrap items-center gap-x-4 gap-y-1 text-sm">
      {canEdit?<label className="flex items-center gap-2 text-xs font-semibold text-muted">{copy.price}<input type="number" min="0" step="0.01" inputMode="decimal" aria-label={copy.priceLabel(m.name)} className="min-h-11 w-28 rounded-xl border border-line bg-paper px-3 py-2 text-base font-normal text-ink focus-visible:focus-ring" defaultValue={m.customerPriceCents==null?'':(m.customerPriceCents/100).toFixed(2)} onBlur={e=>onChangePrice(m.id,toCents(e.target.value))}/></label>:<span className="text-muted">{m.customerPriceCents==null?copy.noPrice:`${money(m.customerPriceCents)} ${m.unit}`}</span>}
      {m.customerPriceCents!=null&&<span className="font-semibold text-ink">{copy.lineTotal(money(m.customerPriceCents*m.quantity))}</span>}
      {access.costs&&m.costCents!=null&&<span className="text-xs text-muted">{copy.cost(money(m.costCents*m.quantity))}{m.customerPriceCents!=null&&m.customerPriceCents>0&&` · ${copy.margin(Math.round((m.customerPriceCents-m.costCents)/m.customerPriceCents*100))}`}</span>}</div>}</div></div>
    <div className="flex min-w-0 items-center gap-2 sm:w-56">{canMark||canEdit?<select aria-label={copy.statusLabel(m.name)} className={`${woInput} min-w-0 flex-1`} value={m.status} onChange={e=>onChangeStatus(m.id,e.target.value as WorkOrderMaterialStatus)}>{materialStatuses.map(s=><option key={s} value={s}>{copy.statuses[s]}</option>)}</select>:<span className="text-sm font-semibold text-ink">{copy.statuses[m.status]}</span>}
    {canEdit&&<button type="button" className={woButton} aria-label={copy.remove(m.name)} onClick={()=>onRemove(m.id)}>×</button>}</div>
   </li>)}</ul>}
  {access.prices&&materials.length>0&&<dl className="mb-0 mt-4 grid gap-1 border-t border-line pt-3 text-sm"><div className="flex justify-between gap-3"><dt className="text-muted">{copy.total}</dt><dd className="m-0 font-semibold text-ink">{money(total)}</dd></div>{access.costs&&<div className="flex justify-between gap-3"><dt className="text-muted">{copy.totalCost}</dt><dd className="m-0 text-muted">{money(totalCost)}</dd></div>}</dl>}
  {canEdit&&<div className="mt-4"><button type="button" className={woButton} onClick={()=>setAdding(true)}>{copy.addMaterial}</button></div>}
  {canEdit&&<WorkOrderAddMaterialDialog open={adding} search={searchCatalog} showPrices={access.prices} onClose={()=>setAdding(false)}
   newMaterial={newMaterial&&{propose:newMaterial.propose,onStart:()=>{setAdding(false);newMaterial.onStart()}}}
   onSubmit={line=>{onAdd({...line,costCents:null});setAdding(false)}}/>}
  {msg&&<p className="mb-0 mt-4 text-xs leading-5 text-muted">{msg}</p>}</section>;
}
