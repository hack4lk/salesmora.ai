import {fn,expect,within,userEvent} from 'storybook/test';
import type {Meta,StoryObj} from '@storybook/nextjs-vite';
import {JobScheduleDialog} from './job-schedule-dialog';
import * as f from '../job-preview.data';

const meta={title:'Jobs/JobScheduleDialog',component:JobScheduleDialog,args:{open:true,job:f.jobFixtures[0],today:f.jobToday,onClose:fn(),onConfirm:fn()},parameters:{layout:'fullscreen'},
decorators:[Story=><main className="min-h-screen bg-canvas p-4 sm:p-8"><h1 className="mb-6 mt-0 text-xl font-semibold text-ink">{f.jobPreviewData.workspace}</h1><Story/></main>],
} satisfies Meta<typeof JobScheduleDialog>;
export default meta;type Story=StoryObj<typeof meta>;
export const Default:Story={};
export const Reschedule:Story={args:{job:f.jobFixtures[1]}};
export const Warnings:Story={args:{job:{...f.jobFixtures[1],scheduledDate:'2026-10-15',completionDeadline:'2026-10-14'},warnings:[f.jobStoryData.overlap,f.jobStoryData.overload]}};
export const ReadOnly:Story={args:{job:{...f.jobFixtures[2],capabilities:f.jobReadOnlyCapabilities}}};
export const Conflict:Story={args:{error:f.jobStoryData.conflict,conflict:true,onReload:fn()}};
export const Saving:Story={args:{pending:true}};
export const ClearSchedule:Story={args:{job:f.jobFixtures[1]},play:async({canvasElement,args})=>{const b=within(canvasElement.ownerDocument.body);await userEvent.click(b.getByRole('button',{name:'Clear schedule'}));await userEvent.click(b.getByRole('button',{name:'Confirm clear schedule'}));await expect(args.onConfirm).toHaveBeenCalledWith({scheduledDate:null,arrivalWindow:null});}};
