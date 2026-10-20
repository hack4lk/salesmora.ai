import {fn,expect,within,userEvent} from 'storybook/test';
import type {Meta,StoryObj} from '@storybook/nextjs-vite';
import {JobAttachmentDialog} from './job-attachment-dialog';
import * as f from '../job-preview.data';

const meta={title:'Jobs/JobAttachmentDialog',component:JobAttachmentDialog,args:{open:true,onClose:fn(),onConfirm:fn()},parameters:{layout:'fullscreen'},
decorators:[Story=><main className="min-h-screen bg-canvas p-4 sm:p-8"><h1 className="mb-6 mt-0 text-xl font-semibold text-ink">{f.jobPreviewData.workspace}</h1><Story/></main>],
} satisfies Meta<typeof JobAttachmentDialog>;
export default meta;type Story=StoryObj<typeof meta>;
export const Default:Story={};
export const Uploading:Story={args:{pending:true,progress:45}};
export const Error:Story={args:{error:f.jobStoryData.failure}};
export const SelectedFile:Story={play:async({canvasElement})=>{const b=within(canvasElement.ownerDocument.body);await userEvent.upload(b.getByLabelText('Choose files'),new File(['fictional'],f.jobFiles[0].name,{type:'application/pdf'}));await expect(b.getByRole('button',{name:'Upload reviewed files'})).toBeEnabled();}};
export const OverQuota:Story={args:{remainingBytes:1},play:async({canvasElement})=>{const b=within(canvasElement.ownerDocument.body);await userEvent.upload(b.getByLabelText('Choose files'),new File(['fictional'],f.jobFiles[0].name,{type:'application/pdf'}));await expect(b.getByRole('alert')).toBeVisible();await expect(b.getByRole('button',{name:'Upload reviewed files'})).toBeDisabled();}};
