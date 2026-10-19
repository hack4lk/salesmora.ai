import {fn,expect,userEvent} from 'storybook/test';
import type {Meta,StoryObj} from '@storybook/nextjs-vite';
import {JobWorkOrdersCard} from './job-work-orders-card';
import {jobWorkOrderFixtures} from '../work-order-preview.data';

const meta={title:'Work Orders/JobWorkOrdersCard',component:JobWorkOrdersCard,
 args:{workOrders:jobWorkOrderFixtures.mixed,canCreate:true,onOpen:fn(),onAdd:fn()},
 decorators:[Story=><main className="min-h-screen bg-canvas p-4 sm:p-8"><div className="mx-auto max-w-md"><Story/></div></main>],
 parameters:{layout:'fullscreen'}} satisfies Meta<typeof JobWorkOrdersCard>;
export default meta;type Story=StoryObj<typeof meta>;
export const Mixed:Story={play:async({canvas,args})=>{
 await userEvent.click(canvas.getByRole('button',{name:'Open WO-1012: Kitchen demo and cabinet install'}));
 await expect(args.onOpen).toHaveBeenCalledWith('wo-1012');
 await userEvent.click(canvas.getByRole('button',{name:'Add work order'}));
 await expect(args.onAdd).toHaveBeenCalled();}};
export const Single:Story={args:{workOrders:jobWorkOrderFixtures.single}};
export const AllCompleted:Story={args:{workOrders:jobWorkOrderFixtures.allDone}};
export const Empty:Story={args:{workOrders:[]}};
export const EmptyReadOnly:Story={args:{workOrders:[],canCreate:false}};
export const ReadOnly:Story={args:{canCreate:false}};
export const JobClosed:Story={args:{workOrders:jobWorkOrderFixtures.allDone,jobClosed:true}};
