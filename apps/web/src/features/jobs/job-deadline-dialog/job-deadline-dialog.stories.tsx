import {fn,expect,within,userEvent} from 'storybook/test';
import type {Meta,StoryObj} from '@storybook/nextjs-vite';
import {JobDeadlineDialog} from './job-deadline-dialog';
import * as f from '../job-preview.data';

const meta={title:'Jobs/JobDeadlineDialog',component:JobDeadlineDialog,args:{open:true,job:f.jobFixtures[2],today:f.jobToday,onClose:fn(),onConfirm:fn()},parameters:{layout:'fullscreen'},
decorators:[Story=><main className="min-h-screen bg-canvas p-4 sm:p-8"><h1 className="mb-6 mt-0 text-xl font-semibold text-ink">{f.jobPreviewData.workspace}</h1><Story/></main>],
} satisfies Meta<typeof JobDeadlineDialog>;
export default meta;type Story=StoryObj<typeof meta>;
export const Default:Story={};
export const Unset:Story={args:{job:{...f.jobFixtures[2],completionDeadline:null}}};
export const Overdue:Story={args:{job:f.jobFixtures[3]}};
export const ReadOnly:Story={args:{job:{...f.jobFixtures[2],capabilities:f.jobReadOnlyCapabilities}}};
export const Saving:Story={args:{pending:true}};
export const RemoveDeadline:Story={play:async({canvasElement,args})=>{const b=within(canvasElement.ownerDocument.body);await userEvent.click(b.getByRole('button',{name:'Remove deadline'}));await userEvent.click(b.getByRole('button',{name:'Save deadline'}));await expect(args.onConfirm).toHaveBeenCalledWith(null);}};
