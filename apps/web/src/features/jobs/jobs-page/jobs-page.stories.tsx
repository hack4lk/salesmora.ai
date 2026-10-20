import {expect,within,userEvent,waitFor} from 'storybook/test';
import type {Meta,StoryObj} from '@storybook/nextjs-vite';
import {JobsPagePreview} from './jobs-page';
import * as f from '../job-preview.data';

const meta={title:'Jobs/JobsPage',component:JobsPagePreview,args:{},parameters:{layout:'fullscreen'},
} satisfies Meta<typeof JobsPagePreview>;
export default meta;type Story=StoryObj<typeof meta>;
export const Default:Story={};

export const Table:Story={args:{initialView:'table'}};
export const Detail:Story={args:{initialDetail:true}};
export const Field:Story={args:{role:'field'}};
export const FieldDetail:Story={args:{role:'field',initialDetail:true}};
export const Office:Story={args:{role:'office'}};
export const ReadOnly:Story={args:{role:'readOnly'}};
export const ReadOnlyDetail:Story={args:{role:'readOnly',initialDetail:true}};
export const ClosedJobs:Story={args:{initialClosed:true}};
export const ClosedDetail:Story={args:{initialDetail:true,initialJobIndex:6}};
export const Empty:Story={args:{empty:true}};
export const NoResults:Story={args:{filteredEmpty:true}};
export const Loading:Story={args:{state:'loading'}};
export const Error:Story={args:{state:'error'}};
export const ManyJobs:Story={args:{many:true,initialView:'table'}};
export const Create:Story={args:{initialOverlay:'create'}};
export const Peek:Story={args:{initialOverlay:'peek'}};
export const Schedule:Story={args:{initialOverlay:'schedule'}};
export const StatusReview:Story={args:{initialOverlay:'status',initialTarget:'waiting'}};
export const Team:Story={args:{initialDetail:true,initialOverlay:'team'}};
export const Files:Story={args:{initialDetail:true,initialOverlay:'attachment'}};
export const RemoveFile:Story={args:{initialDetail:true,initialOverlay:'delete-file'}};
export const AssistantReview:Story={args:{initialDetail:true,initialOverlay:'assistant'}};
export const SearchAndClear:Story={play:async({canvasElement})=>{const c=within(canvasElement);await userEvent.type(c.getByRole('searchbox'),f.jobPreviewData.missing);await expect(c.getByRole('heading',{name:'No jobs match your filters'})).toBeVisible();await userEvent.click(c.getByRole('button',{name:'Clear filters'}));await expect(c.getByRole('heading',{name:'No jobs match your filters'})).not.toBeInTheDocument();}};
export const ChangeStatus:Story={play:async({canvasElement})=>{const c=within(canvasElement),b=within(canvasElement.ownerDocument.body);await userEvent.click(c.getByRole('button',{name:'Move J-1040'}));await userEvent.selectOptions(b.getByLabelText('New status'),'waiting');await userEvent.selectOptions(b.getByLabelText('Waiting reason'),'materials');await userEvent.click(b.getByRole('button',{name:'Confirm change'}));await waitFor(()=>expect(b.queryByRole('dialog')).not.toBeInTheDocument());await expect(c.getByRole('region',{name:'Jobs status board'})).toBeVisible();}};
export const AddProgressNote:Story={args:{initialDetail:true},play:async({canvasElement})=>{const c=within(canvasElement);await userEvent.type(c.getByLabelText('Note for the job history'),f.jobStoryData.note);await userEvent.click(c.getByRole('button',{name:'Add note'}));await expect(c.getByText(f.jobStoryData.note,{exact:true})).toBeVisible();}};

export const DragReview:Story={};

export const AssistantCreate:Story={args:{initialOverlay:'assistant-create'}};
