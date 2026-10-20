import {fn} from 'storybook/test';
import type {Meta,StoryObj} from '@storybook/nextjs-vite';
import {JobCard} from './job-card';
import * as f from '../job-preview.data';

const meta={title:'Jobs/JobCard',component:JobCard,args:{job:f.jobFixtures[2],today:f.jobToday,onOpen:fn(),onAction:fn()},parameters:{layout:'fullscreen'},
decorators:[Story=><main className="min-h-screen bg-canvas p-4 sm:p-8"><h1 className="mb-6 mt-0 text-xl font-semibold text-ink">{f.jobPreviewData.workspace}</h1><Story/></main>],
} satisfies Meta<typeof JobCard>;
export default meta;type Story=StoryObj<typeof meta>;
export const Default:Story={};
export const NeedsScheduling:Story={args:{job:f.jobFixtures[0]}};
export const Waiting:Story={args:{job:f.jobFixtures[3]}};
export const Unassigned:Story={args:{job:f.jobFixtures[4]}};
export const Completed:Story={args:{job:f.jobFixtures[6]}};
export const LongContent:Story={args:{job:{...f.jobFixtures[2],title:f.jobPreviewData.longTitle,customerName:f.jobPreviewData.longCustomer}}};
export const ReadOnly:Story={args:{job:{...f.jobFixtures[2],capabilities:f.jobReadOnlyCapabilities}}};
