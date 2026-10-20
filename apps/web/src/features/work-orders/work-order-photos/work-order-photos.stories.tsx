import {useState,type ComponentProps} from 'react';
import {fn,expect,userEvent} from 'storybook/test';
import type {Meta,StoryObj} from '@storybook/nextjs-vite';
import {WorkOrderPhotos} from './work-order-photos';
import {crewCapabilities,officeCapabilities,readOnlyCapabilities,workOrderPhotoFixtures} from '../work-order-preview.data';

const {mixed,empty}=workOrderPhotoFixtures;
const Stateful=(args:ComponentProps<typeof WorkOrderPhotos>)=>{
 const [photos,setPhotos]=useState(args.photos);
 return <WorkOrderPhotos {...args} photos={photos}
  onAdd={cat=>{args.onAdd(cat);setPhotos(p=>[...p,{id:`new-${p.length+1}`,name:`${cat}-${p.length+1}.jpg`,kind:cat==='other'?'document':'image',category:cat,caption:'',uploader:'Sam Rivera',uploadedAt:'2026-10-19T13:00:00',state:'ready',thumbnailUrl:null,canRemove:true}])}}
  onRemove={id=>{args.onRemove(id);setPhotos(p=>p.filter(x=>x.id!==id))}}/>;
};
const meta={title:'Work Orders/WorkOrderPhotos',component:WorkOrderPhotos,render:args=><Stateful {...args}/>,
 args:{status:'in-progress',photos:mixed,capabilities:officeCapabilities,onAdd:fn(),onOpen:fn(),onRemove:fn()},
 decorators:[Story=><main className="min-h-screen bg-canvas p-4 sm:p-8"><div className="mx-auto max-w-3xl"><Story/></div></main>],
 parameters:{layout:'fullscreen'}} satisfies Meta<typeof WorkOrderPhotos>;
export default meta;type Story=StoryObj<typeof meta>;
export const InProgress:Story={play:async({canvas,args})=>{
 await userEvent.click(canvas.getByRole('button',{name:'Open utility-room-before.jpg'}));
 await expect(args.onOpen).toHaveBeenCalled();
 await userEvent.click(canvas.getByRole('button',{name:'Add after photo'}));
 await expect(args.onAdd).toHaveBeenCalledWith('after');
 await expect(canvas.getByText('after-6.jpg')).toBeVisible();
 await userEvent.click(canvas.getByRole('button',{name:'Remove gas-valve-before.jpg'}));
 await expect(args.onRemove).toHaveBeenCalledWith('p2');}};
export const CrewView:Story={args:{capabilities:crewCapabilities}};
export const Issued:Story={args:{status:'issued',photos:empty}};
export const DraftEmpty:Story={args:{status:'draft',photos:empty}};
export const EmptyReadOnly:Story={args:{photos:empty,capabilities:readOnlyCapabilities}};
export const Completed:Story={args:{status:'completed'}};
export const Canceled:Story={args:{status:'canceled'}};
export const ReadOnly:Story={args:{capabilities:readOnlyCapabilities}};
