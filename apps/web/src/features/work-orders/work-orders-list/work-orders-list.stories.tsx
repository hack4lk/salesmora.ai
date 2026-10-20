'use client';
import {useState} from 'react';
import type {Meta,StoryObj} from '@storybook/nextjs-vite';
import {expect,fn,userEvent,within,waitFor} from 'storybook/test';
import {WorkOrdersList,type WorkOrdersListProps} from './work-orders-list';
import {defaultWorkOrderListFilters,defaultWorkOrderListSort,filterWorkOrders,sortWorkOrders} from './work-orders-list.filter';
import {WorkOrderMoveDialog} from '../work-order-move-dialog/work-order-move-dialog';
import {workOrderFixtures,workOrderListMany,workOrderMembers,workOrderPreviewData,crewCapabilities} from '../work-order-preview.data';
import type {WorkOrderListFilters,WorkOrderListSort,WorkOrderListView,WorkOrderView} from '../work-order-preview.types';

import type {WorkOrderStatus} from '@salesmora/contracts';
type Props=Partial<WorkOrdersListProps>&{initialView?:WorkOrderListView;data?:WorkOrderView[];initial?:Partial<WorkOrderListFilters>;initialPageSize?:number;me?:string};
function Stateful({initialView='table',data:initialData=workOrderFixtures,initial,initialPageSize=25,me,...rest}:Props){
 const [data,setData]=useState(initialData),[view,setView]=useState<WorkOrderListView>(initialView),[moving,setMoving]=useState<{w:WorkOrderView;to:WorkOrderStatus|null}|null>(null);
 const [filters,setFilters]=useState<WorkOrderListFilters>({...defaultWorkOrderListFilters,...initial});
 const [sort,setSort]=useState<WorkOrderListSort>(defaultWorkOrderListSort);
 const [page,setPage]=useState(1),[pageSize,setPageSize]=useState(initialPageSize),[last,setLast]=useState('');
 const matched=sortWorkOrders(filterWorkOrders(data,filters,me),sort),rows=view==='board'?matched:matched.slice((page-1)*pageSize,page*pageSize);
 const live=data.filter(w=>!w.archived);
 const metrics={issuedToday:live.filter(w=>w.status==='issued').length,inProgress:live.filter(w=>w.status==='in-progress').length,overdue:live.filter(w=>w.overdue).length,awaitingSignoff:live.filter(w=>w.status==='in-progress'&&w.tasksDone===w.tasksTotal).length};
 return <><WorkOrdersList rows={rows} total={matched.length} page={page} pageSize={pageSize} filters={filters} sort={sort} metrics={metrics} members={workOrderMembers} jobNumbers={[...new Set(data.map(w=>w.jobNumber))]}  canExport view={view} onView={setView} onRequestMove={(w,to)=>setMoving({w,to})}
  onFilters={f=>{setFilters(f);setPage(1);}} onSort={s=>{setSort(s);setPage(1);}} onPage={setPage} onPageSize={n=>{setPageSize(n);setPage(1);}} onOpen={w=>setLast(`open ${w.number}`)} onAction={(w,a)=>a==='status'?setMoving({w,to:null}):setLast(`${a} ${w.number}`)} onExport={()=>setLast('export')} {...rest}/>
  {moving&&<WorkOrderMoveDialog open workOrder={moving.w} to={moving.to} onClose={()=>setMoving(null)} onConfirm={(to,reason)=>{if(to!=='completed')setData(d=>d.map(x=>x.id===moving.w.id?{...x,status:to}:x));setLast(`${to} ${moving.w.number}${reason?` (${reason})`:''}`);}}/>}
  <p role="status" aria-label="Last action" className="mt-4 text-xs text-muted">{last}</p></>;
}
const meta={title:'Work Orders/WorkOrdersList',component:WorkOrdersList,parameters:{layout:'fullscreen'},
 decorators:[Story=><main className="min-h-screen bg-canvas p-4 sm:p-8"><h1 className="mb-6 mt-0 text-xl font-semibold text-ink">{workOrderPreviewData.workspace}</h1><Story/></main>],
} satisfies Meta<typeof WorkOrdersList>;
export default meta;type Story=StoryObj<typeof meta>;
const noop={onFilters:fn(),onSort:fn(),onPage:fn(),onPageSize:fn(),onOpen:fn(),onAction:fn(),onExport:fn()};
const staticArgs={rows:[],total:0,page:1,pageSize:25,filters:defaultWorkOrderListFilters,sort:defaultWorkOrderListSort,metrics:{issuedToday:0,inProgress:0,overdue:0,awaitingSignoff:0},members:workOrderMembers,jobNumbers:[],...noop};

export const Default:Story={args:staticArgs,render:()=> <Stateful/>,play:async({canvasElement})=>{
 const c=within(canvasElement);
 await expect(await c.findByText('6 work orders in this view')).toBeVisible();
 await userEvent.selectOptions(c.getByLabelText('Status'),'in-progress');
 await expect(await c.findByText('2 work orders in this view')).toBeVisible();
 await userEvent.click(c.getByRole('button',{name:/Clear all/}));
 await expect(await c.findByText('6 work orders in this view')).toBeVisible();
}};
export const ManyRows:Story={args:staticArgs,render:()=> <Stateful data={workOrderListMany} initialPageSize={25}/>};
export const FilteredByStatus:Story={args:staticArgs,render:()=> <Stateful initial={{status:'issued',assignee:'Sam Rivera'}}/>};
export const FieldMyWorkOrders:Story={args:staticArgs,render:()=> <Stateful field me="Sam Rivera" initial={{mine:true}} data={workOrderFixtures.map(w=>({...w,capabilities:crewCapabilities}))} canExport={false}/>};
export const Archived:Story={args:staticArgs,render:()=> <Stateful initial={{archived:true}} data={workOrderFixtures.map((w,i)=>({...w,archived:i>3}))}/>};
export const NoMatch:Story={args:staticArgs,render:()=> <Stateful initial={{search:'zzz'}}/>};
export const Empty:Story={args:staticArgs,render:()=> <Stateful data={[]}/>};
export const Exporting:Story={args:staticArgs,render:()=> <Stateful exporting/>};
export const Loading:Story={args:{...staticArgs,state:'loading'}};
export const ErrorState:Story={args:{...staticArgs,state:'error'}};
export const BoardView:Story={args:staticArgs,render:()=> <Stateful initialView="board"/>,play:async({canvasElement})=>{
 const c=within(canvasElement);
 await expect(await c.findByRole('region',{name:'Work orders status board'})).toBeVisible();
 await userEvent.click(c.getByRole('button',{name:'Table'}));
 await expect(await c.findByRole('table')).toBeVisible();
 await userEvent.click(c.getByRole('button',{name:'Board'}));
 await waitFor(()=>expect(c.getByRole('region',{name:'Work orders status board'})).toBeVisible());
}};
export const BoardManyRows:Story={args:staticArgs,render:()=> <Stateful initialView="board" data={workOrderListMany}/>};
export const BoardFiltered:Story={args:staticArgs,render:()=> <Stateful initialView="board" initial={{assignee:'Sam Rivera'}}/>};
export const BoardField:Story={args:staticArgs,render:()=> <Stateful initialView="board" field me="Sam Rivera" initial={{mine:true}} data={workOrderFixtures.map(w=>({...w,capabilities:crewCapabilities}))} canExport={false}/>};
export const BoardEmpty:Story={args:staticArgs,render:()=> <Stateful initialView="board" data={[]}/>};
export const BoardLoading:Story={args:{...staticArgs,view:'board',state:'loading'}};
export const BoardError:Story={args:{...staticArgs,view:'board',state:'error'}};
