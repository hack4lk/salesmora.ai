import {fn} from 'storybook/test';
import type {Meta,StoryObj} from '@storybook/nextjs-vite';
import {expect,userEvent} from 'storybook/test';
import {WorkOrderHeader} from './work-order-header';
import * as f from '../work-order-preview.data';

const [draft,issued,inProgress,overdue,completed,canceled]=f.workOrderFixtures;
const meta={title:'Work Orders/WorkOrderHeader',component:WorkOrderHeader,args:{workOrder:inProgress,onBack:fn(),onAction:fn(),onOpenJob:fn()},parameters:{layout:'fullscreen'},
decorators:[Story=><main className="min-h-screen bg-canvas p-4 sm:p-8"><h1 className="mb-6 mt-0 text-xl font-semibold text-ink">{f.workOrderPreviewData.workspace}</h1><Story/></main>],
} satisfies Meta<typeof WorkOrderHeader>;
export default meta;type Story=StoryObj<typeof meta>;
export const InProgress:Story={play:async({canvas,args})=>{await userEvent.click(canvas.getByRole('button',{name:'Complete work order'}));await expect(args.onAction).toHaveBeenCalledWith('complete');await userEvent.click(canvas.getByRole('button',{name:/Open job/}));await expect(args.onOpenJob).toHaveBeenCalledWith('job-1040');}};
export const Draft:Story={args:{workOrder:draft}};
export const Issued:Story={args:{workOrder:issued}};
export const Overdue:Story={args:{workOrder:overdue}};
export const Completed:Story={args:{workOrder:completed}};
export const Canceled:Story={args:{workOrder:canceled}};
export const CrewView:Story={args:{workOrder:{...issued,capabilities:f.crewCapabilities}}};
export const ReadOnly:Story={args:{workOrder:{...inProgress,capabilities:f.readOnlyCapabilities}}};
export const LongTitle:Story={args:{workOrder:{...inProgress,title:f.workOrderPreviewData.longTitle}}};
