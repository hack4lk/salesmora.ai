import {fn,expect,within,userEvent} from 'storybook/test';
import type {Meta,StoryObj} from '@storybook/nextjs-vite';
import {CreateWorkOrderDialog} from './create-work-order-dialog';
import {createWorkOrderJob,createWorkOrderSources,workOrderMembers} from '../work-order-preview.data';

const meta={title:'Work Orders/CreateWorkOrderDialog',component:CreateWorkOrderDialog,
 args:{open:true,job:createWorkOrderJob,members:workOrderMembers,sources:createWorkOrderSources,canCreate:true,onClose:fn(),onConfirm:fn()},
 decorators:[Story=><main className="min-h-screen bg-canvas p-4 sm:p-8"><Story/></main>],
 parameters:{layout:'fullscreen'}} satisfies Meta<typeof CreateWorkOrderDialog>;
export default meta;type Story=StoryObj<typeof meta>;
export const Default:Story={play:async({canvasElement,args})=>{
 const b=within(canvasElement.ownerDocument.body);
 await userEvent.selectOptions(b.getByLabelText('Start from'),'estimate:est-2041');
 await expect(await b.findByText(/Prices are not copied/)).toBeInTheDocument();
 await userEvent.click(b.getByRole('button',{name:'Create draft'}));
 await expect(args.onConfirm).toHaveBeenCalledWith({jobId:'job-1040',title:'Water heater replacement',assigneeId:'u1',source:{kind:'estimate',estimateId:'est-2041'}});}};
export const NoSources:Story={args:{sources:[]}};
export const JobWithoutOwner:Story={args:{job:{...createWorkOrderJob,ownerId:null}}};
export const Saving:Story={args:{pending:true}};
export const Error:Story={args:{error:'The work order could not be created. Try again.'}};
export const NoPermission:Story={args:{canCreate:false}};
export const JobClosed:Story={args:{jobClosed:true}};
