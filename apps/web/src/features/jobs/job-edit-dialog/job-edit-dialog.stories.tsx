import {fn} from 'storybook/test';
import type {Meta,StoryObj} from '@storybook/nextjs-vite';
import {JobEditDialog} from './job-edit-dialog';
import * as f from '../job-preview.data';

const meta={title:'Jobs/JobEditDialog',component:JobEditDialog,args:{open:true,job:f.jobFixtures[2],onClose:fn(),onConfirm:fn()},parameters:{layout:'fullscreen'},
decorators:[Story=><main className="min-h-screen bg-canvas p-4 sm:p-8"><h1 className="mb-6 mt-0 text-xl font-semibold text-ink">{f.jobPreviewData.workspace}</h1><Story/></main>],
} satisfies Meta<typeof JobEditDialog>;
export default meta;type Story=StoryObj<typeof meta>;
export const Default:Story={};
export const ReadOnly:Story={args:{job:{...f.jobFixtures[2],capabilities:f.jobReadOnlyCapabilities}}};
export const Conflict:Story={args:{error:f.jobStoryData.conflict,conflict:true,onReload:fn()}};
export const Saving:Story={args:{pending:true}};
