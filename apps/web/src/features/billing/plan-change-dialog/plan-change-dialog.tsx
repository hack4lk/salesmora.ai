'use client';
import type { ReactNode } from 'react';
import Dialog from '@mui/material/Dialog';
import { planChangeDialogData as copy } from './plan-change-dialog.data';

/** Keep focus inside billing until Stripe takes over the compact payment step. */
export function PlanChangeDialog({open,mode='plan',busy=false,paymentActive=false,onClose,onClosed,children}:{open:boolean;mode?:'plan'|'cancel';busy?:boolean;paymentActive?:boolean;onClose:()=>void;onClosed?:()=>void;children:ReactNode}) {
  return <Dialog className="z-50" open={open} maxWidth={mode==='cancel'||paymentActive?'sm':'lg'} fullWidth scroll="paper"
    disableEnforceFocus={paymentActive}
    onClose={(_event,reason)=>{if(!busy&&!paymentActive&&reason!=='backdropClick')onClose();}}
    slotProps={{transition:{onExited:()=>onClosed?.()},backdrop:{className:'bg-ink/50'},paper:{'aria-label':mode==='cancel'?copy.cancelTitle:copy.planTitle,className:'m-4 min-w-0 rounded-2xl bg-paper text-ink sm:m-8'}}}>
    {children}
  </Dialog>;
}
