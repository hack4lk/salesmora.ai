import { useState } from 'react';
import type { Meta, StoryObj } from '@storybook/nextjs-vite';
import { expect, fn, userEvent, within } from 'storybook/test';
import { PlanChangeDialog } from './plan-change-dialog';
import { PlanChange } from '../plan-change/plan-change';
import { planChangeData as copy } from '../plan-change/plan-change.data';
import { planChangeDialogData as dialogCopy } from './plan-change-dialog.data';
function Preview({mode='plan',initialOpen=false}:{mode?:'plan'|'cancel';initialOpen?:boolean}) {
 const[open,setOpen]=useState(initialOpen);
 return <main className="min-h-screen p-6"><button type="button" className="min-h-11 cursor-pointer rounded-xl bg-primary px-4 py-3 font-semibold text-white focus-visible:focus-ring" onClick={()=>setOpen(true)}>{mode==='cancel'?dialogCopy.cancelTitle:dialogCopy.planTitle}</button><PlanChangeDialog open={open} mode={mode} onClose={()=>setOpen(false)}><PlanChange mode={mode} currentPlan="standard" quote={mode==='cancel'?{id:'b0000000-0000-4000-8000-000000000001',plan:'free',kind:'free',amountDue:0,currency:'usd',effectiveAt:copy.sampleDate,expiresAt:'2099-01-01T00:00:00.000Z'}:undefined} onPreview={()=>{}} onConfirm={()=>{}} onRefresh={()=>{}} onBack={()=>{}} onClose={()=>setOpen(false)}/></PlanChangeDialog></main>;
}
const meta={title:'Billing/PlanChangeDialog',component:PlanChangeDialog,parameters:{layout:'fullscreen'},args:{open:false,onClose:fn(),children:null},render:()=> <Preview/>} satisfies Meta<typeof PlanChangeDialog>;
export default meta;type Story=StoryObj<typeof meta>;
export const Default:Story={play:async({canvasElement})=>{const body=within(canvasElement.ownerDocument.body),trigger=within(canvasElement).getByRole('button',{name:dialogCopy.planTitle});await userEvent.click(trigger);const dialog=body.getByRole('dialog',{name:dialogCopy.planTitle});await expect(dialog).toBeVisible();await userEvent.keyboard('{Escape}');await expect(trigger).toHaveFocus();}};
export const Cancellation:Story={render:()=> <Preview mode="cancel"/>};

export const OpenPlanSelection:Story={render:()=> <Preview initialOpen/>};
export const OpenCancellation:Story={render:()=> <Preview mode="cancel" initialOpen/>};
