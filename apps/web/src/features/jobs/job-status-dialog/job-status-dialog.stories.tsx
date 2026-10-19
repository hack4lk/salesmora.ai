import {fn,expect,within,userEvent} from 'storybook/test';
import type {Meta,StoryObj} from '@storybook/nextjs-vite';
import {JobStatusDialog} from './job-status-dialog';
import * as f from '../job-preview.data';

const meta={title:'Jobs/JobStatusDialog',component:JobStatusDialog,args:{open:true,job:f.jobFixtures[2],initialTo:'waiting',onClose:fn(),onConfirm:fn(),onSchedule:fn()},parameters:{layout:'fullscreen'},
decorators:[Story=><main className="min-h-screen bg-canvas p-4 sm:p-8"><h1 className="mb-6 mt-0 text-xl font-semibold text-ink">{f.jobPreviewData.workspace}</h1><Story/></main>],
} satisfies Meta<typeof JobStatusDialog>;
export default meta;type Story=StoryObj<typeof meta>;
export const Default:Story={};
export const Complete:Story={args:{initialTo:'completed'}};
export const Cancel:Story={args:{initialTo:'canceled'}};
export const Reopen:Story={args:{job:f.jobFixtures[6],initialTo:'in-progress'}};
export const NeedsWorkDate:Story={args:{job:f.jobFixtures[0],initialTo:'scheduled'}};
export const ReadOnly:Story={args:{job:{...f.jobFixtures[2],capabilities:f.jobReadOnlyCapabilities}}};
export const Conflict:Story={args:{error:f.jobStoryData.conflict,conflict:true,onReload:fn()}};
export const Saving:Story={args:{pending:true}};
export const ReviewCancellation:Story={args:{initialTo:'canceled'},play:async({canvasElement,args})=>{const b=within(canvasElement.ownerDocument.body);await expect(b.getByRole('button',{name:'Confirm change'})).toBeDisabled();await userEvent.selectOptions(b.getByLabelText('Cancellation reason'),'duplicate');await userEvent.type(b.getByLabelText('Note · optional'),f.jobStoryData.note);await userEvent.click(b.getByRole('button',{name:'Confirm change'}));await expect(args.onConfirm).toHaveBeenCalledWith(expect.objectContaining({to:'canceled',cancellationReason:'duplicate',confirmed:true}));}};
