import {fn} from 'storybook/test';
import type {Meta,StoryObj} from '@storybook/nextjs-vite';
import {JobFileDescriptionDialog} from './job-file-description-dialog';
import * as f from '../job-preview.data';

const meta={title:'Jobs/JobFileDescriptionDialog',component:JobFileDescriptionDialog,args:{open:true,file:f.jobFiles[0],onClose:fn(),onConfirm:fn()},parameters:{layout:'fullscreen'},
decorators:[Story=><main className="min-h-screen bg-canvas p-4 sm:p-8"><h1 className="mb-6 mt-0 text-xl font-semibold text-ink">{f.jobPreviewData.workspace}</h1><Story/></main>],
} satisfies Meta<typeof JobFileDescriptionDialog>;
export default meta;type Story=StoryObj<typeof meta>;
export const Default:Story={};
export const Saving:Story={args:{pending:true}};
export const Error:Story={args:{error:f.jobStoryData.failure}};
