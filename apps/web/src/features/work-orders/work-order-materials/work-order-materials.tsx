'use client';
import {useState} from 'react';
import type {WorkOrderStatus} from '@salesmora/contracts';
import {materialStatuses,type MaterialCatalogEntry,type WorkOrderCapabilities,type WorkOrderMaterial,type WorkOrderMaterialAccess,type WorkOrderMaterialStatus} from '../work-order-preview.types';
import {woButton,woInput,woLabel,woPanel} from '../work-order-ui';
import {copy} from './work-order-materials.data';
const money=(cents:number)=>new Intl.NumberFormat('en-US',{style:'currency',currency:'USD'}).format(cents/100);
const toCents=(v:string)=>{const n=Number(v);return v.trim()!==''&&Number.isFinite(n)&&n>=0?Math.round(n*100):null};
export type WorkOrderMaterialInput={catalogId:string|null;name:string;quantity:number;unit:string;note:string;customerPriceCents:number|null;costCents:number|null};
export type WorkOrderMaterialsProps={status:WorkOrderStatus;materials:WorkOrderMaterial[];catalog:MaterialCatalogEntry[];access:WorkOrderMaterialAccess;capabilities:Pick<WorkOrderCapabilities,'update'|'progress'>;onAdd:(item:WorkOrderMaterialInput)=>void;onRemove:(id:string)=>void;onChangeStatus:(id:string,status:WorkOrderMaterialStatus)=>void;onChangePrice:(id:string,cents:number|null)=>void};
export function WorkOrderMaterials({status,materials,catalog,access,capabilities:c,onAdd,onRemove,onChangeStatus,onChangePrice}:WorkOrderMaterialsProps){
 const [catalogId,setCatalogId]=useState('');const [name,setName]=useState('');const [quantity,setQuantity]=useState('1');const [unit,setUnit]=useState(copy.units[0]);const [note,setNote]=useState('');const [price,setPrice]=useState('');
 const closed=status==='completed'||status==='canceled',draft=status==='draft';
 const canEdit=c.update&&!closed,canMark=c.progress&&(status==='issued'||status==='in-progress');
 const used=materials.filter(m=>m.status==='used').length;
 const msg=closed?copy.locked:draft?(canEdit?copy.draftHint:null):!canMark&&!canEdit?copy.noProgress:null;
 const qty=Number(quantity),valid=!!name.trim()&&Number.isFinite(qty)&&qty>0;
 const entry=catalog.find(e=>e.id===catalogId)??null;
 const pick=(id:string)=>{setCatalogId(id);const e=catalog.find(x=>x.id===id);if(e){setName(e.name);setUnit(e.unit);setPrice((e.priceCents/100).toFixed(2))}else setPrice('')};
 const reset=()=>{setCatalogId('');setName('');setQuantity('1');setNote('');setPrice('');setUnit(copy.units[0])};
 const submit=(e:React.FormEvent)=>{e.preventDefault();if(!valid)return;onAdd({catalogId:entry?.id??null,name:name.trim(),quantity:qty,unit,note:note.trim(),customerPriceCents:access.prices?toCents(price):null,costCents:entry&&access.costs?entry.costCents:null});reset()};
 const total=materials.reduce((s,m)=>s+(m.customerPriceCents??0)*m.quantity,0);
 const totalCost=materials.reduce((s,m)=>s+(m.costCents??0)*m.quantity,0);
 return <section className={woPanel} aria-labelledby="wo-materials-title"><header className="mb-1 flex flex-wrap items-center justify-between gap-3"><h2 id="wo-materials-title" className="m-0 text-lg font-semibold">{copy.title}</h2>{materials.length>0&&<span className="text-sm font-semibold text-muted">{copy.summary(used,materials.length)}</span>}</header>
  <p className="mb-4 mt-0 text-sm text-muted">{access.prices?copy.priceNote:copy.note}</p>
  {materials.length===0?<p className="m-0 text-sm text-muted">{canEdit?copy.emptyEdit:copy.empty}</p>:
   <ul className="m-0 grid list-none gap-2 p-0">{materials.map(m=><li key={m.id} className="grid min-w-0 gap-3 rounded-xl border border-line bg-paper p-3 sm:grid-cols-[1fr_auto] sm:items-center">
    <div className="min-w-0"><p className="m-0 text-base font-semibold text-ink wrap-anywhere">{m.name}{!m.catalogId&&access.prices&&<span className="ml-2 text-xs font-normal text-muted">{copy.customItem}</span>}</p><p className="m-0 mt-1 text-sm text-muted">{m.quantity} {m.unit}{m.note&&<span className="wrap-anywhere"> · {m.note}</span>}</p>
     {access.prices&&<div className="mt-2 flex flex-wrap items-center gap-x-4 gap-y-1 text-sm">
      {canEdit?<label className="flex items-center gap-2 text-xs font-semibold text-muted">{copy.price}<input type="number" min="0" step="0.01" inputMode="decimal" aria-label={copy.priceLabel(m.name)} className="min-h-11 w-28 rounded-xl border border-line bg-paper px-3 py-2 text-base font-normal text-ink focus-visible:focus-ring" defaultValue={m.customerPriceCents==null?'':(m.customerPriceCents/100).toFixed(2)} onBlur={e=>onChangePrice(m.id,toCents(e.target.value))}/></label>:<span className="text-muted">{m.customerPriceCents==null?copy.noPrice:`${money(m.customerPriceCents)} ${m.unit}`}</span>}
      {m.customerPriceCents!=null&&<span className="font-semibold text-ink">{copy.lineTotal(money(m.customerPriceCents*m.quantity))}</span>}
      {access.costs&&m.costCents!=null&&<span className="text-xs text-muted">{copy.cost(money(m.costCents*m.quantity))}{m.customerPriceCents!=null&&m.customerPriceCents>0&&` · ${copy.margin(Math.round((m.customerPriceCents-m.costCents)/m.customerPriceCents*100))}`}</span>}</div>}</div>
    <div className="flex min-w-0 items-center gap-2 sm:w-56">{canMark||canEdit?<select aria-label={copy.statusLabel(m.name)} className={`${woInput} min-w-0 flex-1`} value={m.status} onChange={e=>onChangeStatus(m.id,e.target.value as WorkOrderMaterialStatus)}>{materialStatuses.map(s=><option key={s} value={s}>{copy.statuses[s]}</option>)}</select>:<span className="text-sm font-semibold text-ink">{copy.statuses[m.status]}</span>}
    {canEdit&&<button type="button" className={woButton} aria-label={copy.remove(m.name)} onClick={()=>onRemove(m.id)}>×</button>}</div>
   </li>)}</ul>}
  {access.prices&&materials.length>0&&<dl className="mb-0 mt-4 grid gap-1 border-t border-line pt-3 text-sm"><div className="flex justify-between gap-3"><dt className="text-muted">{copy.total}</dt><dd className="m-0 font-semibold text-ink">{money(total)}</dd></div>{access.costs&&<div className="flex justify-between gap-3"><dt className="text-muted">{copy.totalCost}</dt><dd className="m-0 text-muted">{money(totalCost)}</dd></div>}</dl>}
  {canEdit&&<form className="mt-4 grid gap-3 sm:grid-cols-[1fr_6rem_7rem] sm:items-end" onSubmit={submit}>
   <label className={`${woLabel} sm:col-span-3`}>{copy.catalog}<select className={woInput} value={catalogId} onChange={e=>pick(e.target.value)}><option value="">{copy.custom}</option>{catalog.map(e=><option key={e.id} value={e.id}>{e.name} · {e.sku}</option>)}</select></label>
   <label className={woLabel}>{copy.name}<input className={woInput} value={name} placeholder={copy.namePlaceholder} onChange={e=>{setName(e.target.value);if(catalogId)setCatalogId('')}}/></label>
   <label className={woLabel}>{copy.quantity}<input className={woInput} type="number" min="0" step="any" inputMode="decimal" value={quantity} onChange={e=>setQuantity(e.target.value)}/></label>
   <label className={woLabel}>{copy.unit}<select className={woInput} value={unit} onChange={e=>setUnit(e.target.value)}>{[...new Set([...copy.units,unit])].map(u=><option key={u}>{u}</option>)}</select></label>
   {access.prices&&<label className={woLabel}>{copy.price}<input className={woInput} type="number" min="0" step="0.01" inputMode="decimal" value={price} onChange={e=>setPrice(e.target.value)}/></label>}
   <label className={`${woLabel} ${access.prices?'':'sm:col-span-2'}`}>{copy.notePlaceholder}<input className={woInput} value={note} onChange={e=>setNote(e.target.value)}/></label>
   <button type="submit" className={woButton} disabled={!valid}>{copy.add}</button></form>}
  {msg&&<p className="mb-0 mt-4 text-xs leading-5 text-muted">{msg}</p>}</section>;
}
