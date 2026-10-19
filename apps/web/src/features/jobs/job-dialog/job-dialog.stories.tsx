import {fn} from 'storybook/test';
import type {Meta,StoryObj} from '@storybook/nextjs-vite';
import {JobDialog} from './job-dialog';
import * as f from '../job-preview.data';

const meta={title:'Jobs/JobDialog',component:JobDialog,args:{open:true,title:f.jobDraftFixture.title,description:f.jobDraftFixture.description,confirmLabel:f.jobStoryData.confirm,children:<p className="text-sm">{f.jobPreviewData.newJob}</p>,onClose:fn(),onSubmit:fn()},parameters:{layout:'fullscreen'},
decorators:[Story=><main className="min-h-screen bg-canvas p-4 sm:p-8"><h1 className="mb-6 mt-0 text-xl font-semibold text-ink">{f.jobPreviewData.workspace}</h1><Story/></main>],
} satisfies Meta<typeof JobDialog>;
export default meta;type Story=StoryObj<typeof meta>;
export const Default:Story={};
export const Saving:Story={args:{pending:true}};
export const Error:Story={args:{error:f.jobStoryData.conflict}};
