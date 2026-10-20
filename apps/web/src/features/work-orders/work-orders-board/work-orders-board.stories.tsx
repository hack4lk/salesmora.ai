'use client';
import {useState} from 'react';
import {fn,expect,within,waitFor,fireEvent} from 'storybook/test';
import type {Meta,StoryObj} from '@storybook/nextjs-vite';
import {WorkOrdersBoard,type WorkOrdersBoardProps} from './work-orders-board';
import {workOrderFixtures,workOrderListMany,workOrderPreviewData,readOnlyCapabilities} from '../work-order-preview.data';
import type {WorkOrderView} from '../work-order-preview.types';

function Stateful({rows:initial,...rest}:Partial<WorkOrdersBoardProps>){
 const [rows,setRows]=useState<WorkOrderView[]>(initial??workOrderFixtures);
 return <WorkOrdersBoard rows={rows} onOpen={fn()} onAction={fn()} onRequestMove={(w,to)=>setRows(r=>r.map(x=>x.id===w.id?{...x,status:to}:x))} {...rest}/>;
}
const meta={title:'Work Orders/WorkOrdersBoard',component:WorkOrdersBoard,args:{rows:workOrderFixtures,onOpen:fn(),onAction:fn(),onRequestMove:fn()},parameters:{layout:'fullscreen'},
 decorators:[Story=><main className="min-h-screen bg-canvas p-4 sm:p-8"><h1 className="mb-6 mt-0 text-xl font-semibold text-ink">{workOrderPreviewData.workspace}</h1><Story/></main>],
} satisfies Meta<typeof WorkOrdersBoard>;
export default meta;type Story=StoryObj<typeof meta>;
export const Default:Story={render:()=> <Stateful/>,play:async({canvasElement})=>{
 const c=within(canvasElement),card=c.getByRole('article',{name:/WO-1012/}),col=canvasElement.querySelector('[data-work-order-status="in-progress"]') as HTMLElement;
 const dt=new DataTransfer();
 fireEvent.dragStart(card,{dataTransfer:dt});fireEvent.dragOver(col,{dataTransfer:dt});fireEvent.drop(col,{dataTransfer:dt});
 await waitFor(()=>expect(within(col).getByRole('article',{name:/WO-1012/})).toBeVisible());
}};
export const InvalidDropIgnored:Story={render:()=> <Stateful/>,play:async({canvasElement})=>{
 const c=within(canvasElement),card=c.getByRole('article',{name:/WO-1013/}),col=canvasElement.querySelector('[data-work-order-status="completed"]') as HTMLElement,dt=new DataTransfer();
 fireEvent.dragStart(card,{dataTransfer:dt});fireEvent.dragOver(col,{dataTransfer:dt});fireEvent.drop(col,{dataTransfer:dt});
 await expect(within(canvasElement.querySelector('[data-work-order-status="draft"]') as HTMLElement).getByRole('article',{name:/WO-1013/})).toBeVisible();
}};
export const Empty:Story={args:{rows:[]}};
export const ReadOnly:Story={args:{rows:workOrderFixtures.map(w=>({...w,capabilities:readOnlyCapabilities})),onRequestMove:undefined}};
export const ManyWorkOrders:Story={args:{rows:workOrderListMany.filter(w=>!w.archived)}};
export const Pending:Story={args:{pendingId:workOrderFixtures[0].id}};
