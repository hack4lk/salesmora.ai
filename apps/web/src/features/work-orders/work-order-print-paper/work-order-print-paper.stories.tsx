import type {Meta,StoryObj} from '@storybook/nextjs-vite';
import {expect} from 'storybook/test';
import {WorkOrderPrintPaper} from './work-order-print-paper';
import {workOrderInstructionFixtures,workOrderPrintFixture} from '../work-order-preview.data';

const meta={title:'Work Orders/WorkOrderPrintPaper',component:WorkOrderPrintPaper,args:{data:workOrderPrintFixture},
 decorators:[Story=><main className="min-h-screen bg-canvas p-4 sm:p-8"><div className="mx-auto max-w-[8.5in] border border-line shadow-sm"><Story/></div></main>],
 parameters:{layout:'fullscreen'}} satisfies Meta<typeof WorkOrderPrintPaper>;
export default meta;type Story=StoryObj<typeof meta>;
export const Full:Story={play:async({canvas})=>{await expect(canvas.queryByText(/\$/)).toBeNull();await expect(canvas.getByRole('heading',{name:'Safety notes'})).toBeVisible();}};
export const Minimal:Story={args:{data:{...workOrderPrintFixture,jobNumber:null,customerPhone:null,assigneeName:null,crewNames:[],scheduledDate:null,scheduledWindow:null,instructions:workOrderInstructionFixtures.empty,tasks:[],materials:[]}}};
export const SafetyOnly:Story={args:{data:{...workOrderPrintFixture,instructions:workOrderInstructionFixtures.safetyOnly}}};
export const LongContent:Story={args:{data:{...workOrderPrintFixture,title:'Full kitchen demolition, rough-in inspection, cabinet install and countertop template visit',tasks:Array.from({length:18},(_,n)=>({id:`x${n}`,label:`Task ${n+1}: complete the step and photograph the result for the file`,required:n%3===0,done:false}))}}};
export const Signed:Story={args:{data:{...workOrderPrintFixture,status:'completed',tasks:workOrderPrintFixture.tasks.map(t=>({...t,done:true})),signoff:{summary:'Replaced the 40-gallon water heater and pressure tested. No leaks found.',completedByName:'Sam Rivera',completedAt:'2026-10-19T11:55:00Z',signerName:'Priya Shah',signedAt:'2026-10-19T11:52:00Z',signatureUrl:null}}},play:async({canvas})=>{await expect(canvas.getByText(/Customer signature · Priya Shah/)).toBeVisible();}};
export const CompletedUnsigned:Story={args:{data:{...workOrderPrintFixture,status:'completed',signoff:{summary:'Done.',completedByName:'Sam Rivera',completedAt:'2026-10-19T11:55:00Z',signerName:null,signedAt:null,signatureUrl:null}}}};
export const MidJobProgress:Story={args:{data:{...workOrderPrintFixture,status:'in-progress',tasks:workOrderPrintFixture.tasks.map((t,n)=>({...t,done:n<2}))}}};
