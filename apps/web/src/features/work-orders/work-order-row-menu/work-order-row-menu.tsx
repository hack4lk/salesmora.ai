'use client';
import {useId,useState} from 'react';
import Menu from '@mui/material/Menu';import MenuItem from '@mui/material/MenuItem';
import {MoreHorizOutlined} from '@salesmora/ui';
import type {WorkOrderListAction,WorkOrderView} from '../work-order-preview.types';
import {allowedTransitions} from '../work-order-transitions';
import {copy} from './work-order-row-menu.data';

export function WorkOrderRowMenu({row,disabled=false,onAction}:{row:WorkOrderView;disabled?:boolean;onAction:(a:WorkOrderListAction)=>void}){
 const id=useId(),[anchor,setAnchor]=useState<HTMLElement|null>(null),c=row.capabilities,open=!['completed','canceled'].includes(row.status);
 const actions:WorkOrderListAction[]=['open'];
 if(allowedTransitions(row).length>0)actions.push('status');
 if(c.print)actions.push('print');if(c.duplicate)actions.push('duplicate');
 if(c.cancel&&open&&!row.archived&&!actions.includes('status'))actions.push('cancel');
 if(c.archive&&!open&&!row.archived)actions.push('archive');
 if(c.remove&&row.status==='draft'&&!row.archived)actions.push('delete');
 return <><button type="button" disabled={disabled} aria-label={copy.label(row.title)} aria-haspopup="menu" aria-controls={anchor?id:undefined} aria-expanded={!!anchor} onClick={e=>setAnchor(e.currentTarget)} className="flex size-11 shrink-0 cursor-pointer items-center justify-center rounded-xl text-muted hover:bg-canvas focus-visible:focus-ring disabled:opacity-50"><MoreHorizOutlined aria-hidden="true"/></button><Menu id={id} anchorEl={anchor} open={!!anchor} onClose={()=>setAnchor(null)}>{actions.map(a=><MenuItem key={a} onClick={()=>{setAnchor(null);onAction(a);}}>{copy[a]}</MenuItem>)}</Menu></>;
}
