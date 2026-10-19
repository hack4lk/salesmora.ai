'use client';
import {useId,type ReactNode,type MouseEvent,type KeyboardEvent} from 'react';
import Checkbox from '@mui/material/Checkbox';
import ArrowUpward from '@mui/icons-material/ArrowUpward';
import ArrowDownward from '@mui/icons-material/ArrowDownward';
import {dataTableData as copy} from './data-table.data';

export interface DataTableColumn<Row>{
  id:string;label:string;render:(row:Row)=>ReactNode;sortable?:boolean;
}
export interface DataTableProps<Row>{
  caption:string;columns:readonly DataTableColumn<Row>[];rows:readonly Row[];
  getRowId:(row:Row)=>string;getRowLabel:(row:Row)=>string;
  sort?:{column:string;direction:'asc'|'desc'};
  onSort?:(column:string,direction:'asc'|'desc')=>void;
  selectedIds?:readonly string[];onSelectionChange?:(ids:string[])=>void;
  onRowOpen?:(row:Row)=>void;
  renderCard?:(row:Row)=>ReactNode;
  state?:'ready'|'loading'|'error';emptyMessage?:string;errorMessage?:string;onRetry?:()=>void;
}
const interactive='a,button,input,select,textarea,[role="button"],[role="checkbox"]';
const action='inline-flex min-h-11 cursor-pointer items-center justify-center rounded-xl border border-line bg-paper px-4 py-2 text-sm font-semibold text-primary hover:bg-canvas focus-visible:focus-ring';
/** Controlled presentation primitive. Authorization, filtering, sorting and pagination belong to its consumer. */
export function DataTable<Row>({caption,columns,rows,getRowId,getRowLabel,sort,onSort,selectedIds=[],onSelectionChange,onRowOpen,renderCard,state='ready',emptyMessage=copy.empty,errorMessage=copy.error,onRetry}:DataTableProps<Row>){
  const id=useId(),selected=new Set(selectedIds),selectable=!!onSelectionChange;
  const selectedOnPage=rows.filter(row=>selected.has(getRowId(row))).length;
  const all=rows.length>0&&selectedOnPage===rows.length,some=selectedOnPage>0&&!all;
  function selectOne(row:Row,checked:boolean){const next=new Set(selected);if(checked)next.add(getRowId(row));else next.delete(getRowId(row));onSelectionChange?.([...next]);}
  function selectPage(checked:boolean){const next=new Set(selected);for(const row of rows){if(checked)next.add(getRowId(row));else next.delete(getRowId(row));}onSelectionChange?.([...next]);}
  function open(event:MouseEvent|KeyboardEvent,row:Row){
    if((event.target as HTMLElement).closest(interactive))return;
    if('key'in event){if(event.key!=='Enter'&&event.key!==' ')return;event.preventDefault();}
    onRowOpen?.(row);
  }
  const checkbox=(row:Row)=><Checkbox checked={selected.has(getRowId(row))} onChange={(_event,checked)=>selectOne(row,checked)} slotProps={{input:{'aria-label':copy.selectRow(getRowLabel(row))}}} className="text-muted [&.Mui-checked]:text-primary [&.Mui-focusVisible]:focus-ring"/>;
  return <section aria-label={caption} aria-busy={state==='loading'} className="min-w-0 overflow-hidden rounded-2xl border border-line bg-paper text-ink">
    {state==='loading'?<div role="status" className="grid gap-4 p-6"><span className="text-sm text-muted">{copy.loading}</span>{[0,1,2,3].map(key=><div key={key} aria-hidden="true" className="h-12 rounded-xl bg-canvas motion-safe:animate-pulse"/>)}</div>
    :state==='error'?<div className="grid justify-items-start gap-4 p-6"><p role="alert" className="m-0 text-sm text-error">{errorMessage}</p>{onRetry&&<button type="button" className={action} onClick={onRetry}>{copy.retry}</button>}</div>
    :rows.length===0?<p role="status" className="m-0 p-6 text-sm leading-6 text-muted">{emptyMessage}</p>:<>
      {onRowOpen&&<p id={`${id}-keyboard`} className="sr-only">{copy.keyboard}</p>}
      <div className="hidden max-h-96 overflow-auto md:block">
        <table className="w-full border-collapse text-left text-sm">
          <caption className="sr-only">{caption}</caption>
          <thead className="sticky top-0 z-10 bg-canvas"><tr>
            {selectable&&<th scope="col" className="w-12 p-2"><Checkbox checked={all} indeterminate={some} onChange={(_event,checked)=>selectPage(checked)} slotProps={{input:{'aria-label':copy.selectPage,'aria-checked':some?'mixed':all}}} className="text-muted [&.Mui-checked]:text-primary [&.MuiCheckbox-indeterminate]:text-primary [&.Mui-focusVisible]:focus-ring"/></th>}
            {columns.map(column=>{const active=sort?.column===column.id,direction=active&&sort.direction==='asc'?'desc':'asc';return <th key={column.id} scope="col" aria-sort={active?(sort.direction==='asc'?'ascending':'descending'):undefined} className="px-4 py-3 font-semibold text-muted">{column.sortable&&onSort?<button type="button" aria-label={copy.sort(column.label,direction)} onClick={()=>onSort(column.id,direction)} className="inline-flex min-h-11 cursor-pointer items-center gap-2 rounded-lg text-left hover:text-primary focus-visible:focus-ring">{column.label}{active&&(sort.direction==='asc'?<ArrowUpward className="text-base"/>:<ArrowDownward className="text-base"/>)}</button>:column.label}</th>;})}
          </tr></thead>
          <tbody>{rows.map(row=><tr key={getRowId(row)} tabIndex={onRowOpen?0:undefined} aria-describedby={onRowOpen?`${id}-keyboard`:undefined} aria-selected={selectable?selected.has(getRowId(row)):undefined} onClick={event=>open(event,row)} onKeyDown={event=>open(event,row)} className={`border-t border-line focus-visible:focus-ring ${onRowOpen?'cursor-pointer hover:bg-canvas':''} ${selected.has(getRowId(row))?'bg-canvas':''}`}>
            {selectable&&<td className="p-2">{checkbox(row)}</td>}{columns.map(column=><td key={column.id} className="px-4 py-4 align-middle wrap-anywhere">{column.render(row)}</td>)}
          </tr>)}</tbody>
        </table>
      </div>
      <div className="grid divide-y divide-line md:hidden">
        {selectable&&<div className="flex items-center gap-2 bg-canvas px-4 py-2"><Checkbox checked={all} indeterminate={some} onChange={(_event,checked)=>selectPage(checked)} slotProps={{input:{'aria-label':copy.selectPage,'aria-checked':some?'mixed':all}}} className="text-muted [&.Mui-checked]:text-primary [&.MuiCheckbox-indeterminate]:text-primary [&.Mui-focusVisible]:focus-ring"/><span className="text-sm text-muted">{copy.selectPage}</span></div>}
        {rows.map(row=><article key={getRowId(row)} aria-label={getRowLabel(row)} tabIndex={onRowOpen?0:undefined} aria-describedby={onRowOpen?`${id}-keyboard`:undefined} onClick={event=>open(event,row)} onKeyDown={event=>open(event,row)} className={`grid min-w-0 gap-4 p-4 focus-visible:focus-ring ${onRowOpen?'cursor-pointer hover:bg-canvas':''} ${selected.has(getRowId(row))?'bg-canvas':''}`}>
          {selectable&&<div>{checkbox(row)}</div>}
          {renderCard?renderCard(row):<dl className="m-0 grid min-w-0 gap-3">{columns.map(column=><div key={column.id}><dt className="text-xs font-semibold text-muted">{column.label}</dt><dd className="m-0 mt-1 text-sm wrap-anywhere">{column.render(row)}</dd></div>)}</dl>}
          {onRowOpen&&<button type="button" aria-label={copy.openRow(getRowLabel(row))} className={action} onClick={()=>onRowOpen(row)}>{copy.open}</button>}
        </article>)}
      </div>
    </>}
  </section>;
}
