import {fn,expect,within,userEvent} from 'storybook/test';
import type {Meta,StoryObj} from '@storybook/nextjs-vite';
import {JobNoteComposer} from './job-note-composer';
import * as f from '../job-preview.data';

const meta={title:'Jobs/JobNoteComposer',component:JobNoteComposer,args:{onSave:fn()},parameters:{layout:'fullscreen'},
decorators:[Story=><main className="min-h-screen bg-canvas p-4 sm:p-8"><h1 className="mb-6 mt-0 text-xl font-semibold text-ink">{f.jobPreviewData.workspace}</h1><Story/></main>],
} satisfies Meta<typeof JobNoteComposer>;
export default meta;type Story=StoryObj<typeof meta>;
export const Default:Story={};
export const Closed:Story={args:{closed:true}};
export const ReadOnly:Story={args:{canAdd:false}};
export const FailedSave:Story={args:{onSave:fn(async()=>{throw Error('fixture');})},play:async({canvasElement})=>{const c=within(canvasElement);await userEvent.type(c.getByLabelText('Note for the job history'),f.jobStoryData.note);await userEvent.click(c.getByRole('button',{name:'Add note'}));await expect(c.getByRole('alert')).toBeVisible();await expect(c.getByLabelText('Note for the job history')).toHaveValue(f.jobStoryData.note);}};
export const AddNote:Story={play:async({canvasElement,args})=>{const c=within(canvasElement);await userEvent.type(c.getByLabelText('Note for the job history'),f.jobStoryData.note);await userEvent.click(c.getByRole('button',{name:'Add note'}));await expect(args.onSave).toHaveBeenCalledWith(f.jobStoryData.note);await expect(c.getByLabelText('Note for the job history')).toHaveValue('');}};

export const WithAttachments:Story={args:{attachments:[{id:f.jobFiles[0].id,name:f.jobFiles[0].name}],onAttach:fn(),onRemoveAttachment:fn()}};
export const AttachmentsProcessing:Story={args:{attachments:[{id:f.jobFiles[0].id,name:f.jobFiles[0].name,pending:true}],onAttach:fn()}};
