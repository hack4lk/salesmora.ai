import {fn} from 'storybook/test';
import type {Meta,StoryObj} from '@storybook/nextjs-vite';
import {JobsTable} from './jobs-table';
import * as f from '../job-preview.data';

const meta={title:'Jobs/JobsTable',component:JobsTable,args:{rows:f.jobFixtures,today:f.jobToday,onOpen:fn(),onAction:fn(),sort:{column:'number',direction:'asc'},onSort:fn()},parameters:{layout:'fullscreen'},
decorators:[Story=><main className="min-h-screen bg-canvas p-4 sm:p-8"><h1 className="mb-6 mt-0 text-xl font-semibold text-ink">{f.jobPreviewData.workspace}</h1><Story/></main>],
} satisfies Meta<typeof JobsTable>;
export default meta;type Story=StoryObj<typeof meta>;
export const Default:Story={};
export const ReadOnly:Story={args:{rows:f.jobFixtures.map(j=>({...j,capabilities:f.jobReadOnlyCapabilities}))}};
export const Loading:Story={args:{state:'loading'}};
export const Error:Story={args:{state:'error',onRetry:fn()}};
export const LongContent:Story={args:{rows:[{...f.jobFixtures[2],title:f.jobPreviewData.longTitle,customerName:f.jobPreviewData.longCustomer}]}};
