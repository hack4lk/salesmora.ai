'use client';
import {useId,useState} from 'react';
import Menu from '@mui/material/Menu';import MenuItem from '@mui/material/MenuItem';
import {MoreHorizOutlined} from '@salesmora/ui';
import type {JobView,JobAction} from '../job-preview.types';
import {copy} from './job-row-menu.data';
export function JobRowMenu({job,onAction,disabled=false}:{job:JobView;onAction:(action:JobAction)=>void;disabled?:boolean}){
 const id=useId(),[anchor,setAnchor]=useState<HTMLElement|null>(null),closed=['completed','canceled'].includes(job.status),c=job.capabilities;
 const actions:JobAction[]=['open'];
 if(closed?c.reopen:c.status||c.complete||c.cancel)actions.push('status');
 if(!closed&&c.schedule)actions.push('schedule','deadline');if(!closed&&c.assign)actions.push('team');if(!closed&&c.note)actions.push('note');if(!closed&&c.edit)actions.push('edit');
 return <><button type="button" disabled={disabled} aria-label={copy.label(job.title)} aria-haspopup="menu" aria-controls={anchor?id:undefined} aria-expanded={!!anchor} onClick={e=>setAnchor(e.currentTarget)} className="flex size-11 shrink-0 cursor-pointer items-center justify-center rounded-xl text-muted hover:bg-canvas focus-visible:focus-ring disabled:opacity-50"><MoreHorizOutlined aria-hidden="true"/></button><Menu id={id} anchorEl={anchor} open={!!anchor} onClose={()=>setAnchor(null)}>{actions.map(action=><MenuItem key={action} onClick={()=>{setAnchor(null);onAction(action);}}>{copy[action]}</MenuItem>)}</Menu></>;
}
