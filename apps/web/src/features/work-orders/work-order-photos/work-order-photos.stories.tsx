import {useState,type ComponentProps} from 'react';
import {fn,expect,userEvent} from 'storybook/test';
import type {Meta,StoryObj} from '@storybook/nextjs-vite';
import {WorkOrderPhotos} from './work-order-photos';
import {crewCapabilities,officeCapabilities,readOnlyCapabilities,workOrderPhotoFixtures} from '../work-order-preview.data';

const {mixed,empty}=workOrderPhotoFixtures;
const Stateful=(args:ComponentProps<typeof WorkOrderPhotos>)=>{
 const [photos,setPhotos]=useState(args.photos);
 return <WorkOrderPhotos {...args} photos={photos}
  onPhotosChange={()=>{setPhotos(p=>[...p,{id:`new-${p.length+1}`,name:`photo-${p.length+1}.jpg`,kind:'image',category:'before',caption:'',uploader:'Sam Rivera',uploadedAt:'2026-10-19T13:00:00',state:'ready',thumbnailUrl:null,canRemove:true}])}}/>;
};
const meta={title:'Work Orders/WorkOrderPhotos',component:WorkOrderPhotos,render:args=><Stateful {...args}/>,
 args:{status:'in-progress',photos:mixed,workspaceId:'demo-workspace',workOrderId:'demo-order',capabilities:officeCapabilities},
 decorators:[Story=><main className="min-h-screen bg-canvas p-4 sm:p-8"><div className="mx-auto max-w-3xl"><Story/></div></main>],
 parameters:{layout:'fullscreen'}} satisfies Meta<typeof WorkOrderPhotos>;
export default meta;type Story=StoryObj<typeof meta>;
export const InProgress:Story={args:{status:'in-progress',photos:mixed,onPhotosChange:fn()},play:async({canvas})=>{
 await userEvent.click(canvas.getByRole('button',{name:/Add before photo/i}));
 await expect(canvas.queryByRole('dialog')).toBeVisible();}};
export const CrewView:Story={args:{capabilities:crewCapabilities,onPhotosChange:fn()}};
export const Issued:Story={args:{status:'issued',photos:empty,onPhotosChange:fn()}};
export const DraftEmpty:Story={args:{status:'draft',photos:empty,onPhotosChange:fn()}};
export const EmptyReadOnly:Story={args:{photos:empty,capabilities:readOnlyCapabilities,onPhotosChange:fn()}};
export const Completed:Story={args:{status:'completed',onPhotosChange:fn()}};
export const Canceled:Story={args:{status:'canceled',onPhotosChange:fn()}};
export const ReadOnly:Story={args:{capabilities:readOnlyCapabilities,onPhotosChange:fn()}};
