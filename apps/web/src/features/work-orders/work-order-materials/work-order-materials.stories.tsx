import {useState,type ComponentProps} from 'react';
import {fn,expect,userEvent,within} from 'storybook/test';
import type {Meta,StoryObj} from '@storybook/nextjs-vite';
import {WorkOrderMaterials} from './work-order-materials';
import {crewCapabilities,materialAccess,materialCatalogFixtures,officeCapabilities,readOnlyCapabilities,workOrderMaterialFixtures} from '../work-order-preview.data';

const Stateful=(args:ComponentProps<typeof WorkOrderMaterials>)=>{
 const [materials,setMaterials]=useState(args.materials);
 return <WorkOrderMaterials {...args} materials={materials}
  onAdd={item=>{args.onAdd(item);setMaterials(ms=>[...ms,{...item,id:`new-${ms.length+1}`,status:'needed'}])}}
  onRemove={id=>{args.onRemove(id);setMaterials(ms=>ms.filter(m=>m.id!==id))}}
  onChangeStatus={(id,status)=>{args.onChangeStatus(id,status);setMaterials(ms=>ms.map(m=>m.id===id?{...m,status}:m))}}
  onChangePrice={(id,cents)=>{args.onChangePrice(id,cents);setMaterials(ms=>ms.map(m=>m.id===id?{...m,customerPriceCents:cents}:m))}}/>;
};
const crewMaterials=workOrderMaterialFixtures.map(m=>({...m,customerPriceCents:null,costCents:null}));
const meta={title:'Work Orders/WorkOrderMaterials',component:WorkOrderMaterials,render:args=><Stateful {...args}/>,
 args:{status:'in-progress',materials:workOrderMaterialFixtures,catalog:materialCatalogFixtures,access:materialAccess.office,capabilities:officeCapabilities,onAdd:fn(),onRemove:fn(),onChangeStatus:fn(),onChangePrice:fn()},
 decorators:[Story=><main className="min-h-screen bg-canvas p-4 sm:p-8"><div className="mx-auto max-w-3xl"><Story/></div></main>],
 parameters:{layout:'fullscreen'}} satisfies Meta<typeof WorkOrderMaterials>;
export default meta;type Story=StoryObj<typeof meta>;
export const OfficeWithPrices:Story={play:async({canvasElement,args})=>{
 const c=within(canvasElement);
 await userEvent.selectOptions(c.getByLabelText('Status: Custom wall bracket'),'used');
 await expect(args.onChangeStatus).toHaveBeenCalledWith('m4','used');
 await userEvent.selectOptions(c.getByLabelText('From catalog'),'c4');
 await userEvent.click(c.getByRole('button',{name:'Add item'}));
 await expect(args.onAdd).toHaveBeenCalledWith(expect.objectContaining({catalogId:'c4',name:'Expansion tank',customerPriceCents:6800,costCents:null}));
 await expect(c.queryByText(/margin/)).toBeNull();}};
export const OwnerWithCosts:Story={args:{access:materialAccess.owner}};
export const CrewEditing:Story={args:{access:materialAccess.crew,materials:crewMaterials,capabilities:crewCapabilities},play:async({canvasElement})=>{const c=within(canvasElement);await expect(c.queryByText(/\$/)).toBeNull();await expect(c.queryByLabelText('From catalog')).toBeNull();}};
export const Issued:Story={args:{status:'issued',materials:workOrderMaterialFixtures.map(m=>({...m,status:m.status==='used'?'on-hand':m.status}))}};
export const Draft:Story={args:{status:'draft'}};
export const Empty:Story={args:{materials:[]}};
export const EmptyReadOnly:Story={args:{materials:[],capabilities:readOnlyCapabilities,access:materialAccess.crew}};
export const Completed:Story={args:{status:'completed',materials:workOrderMaterialFixtures.map(m=>({...m,status:'used'}))}};
export const Canceled:Story={args:{status:'canceled'}};
export const ReadOnly:Story={args:{capabilities:readOnlyCapabilities,access:materialAccess.crew,materials:crewMaterials}};
