import {fn} from 'storybook/test';
import type {Meta,StoryObj} from '@storybook/nextjs-vite';
import {JobDetailHeader} from './job-detail-header';
import * as f from '../job-preview.data';

const meta={title:'Jobs/JobDetailHeader',component:JobDetailHeader,args:{job:f.jobFixtures[2],onBack:fn(),onStatus:fn(),onSchedule:fn(),onAssistant:fn()},parameters:{layout:'fullscreen'},
decorators:[Story=><main className="min-h-screen bg-canvas p-4 sm:p-8"><h1 className="mb-6 mt-0 text-xl font-semibold text-ink">{f.jobPreviewData.workspace}</h1><Story/></main>],
} satisfies Meta<typeof JobDetailHeader>;
export default meta;type Story=StoryObj<typeof meta>;
export const Default:Story={};
export const Closed:Story={args:{job:f.jobFixtures[6]}};
export const ReadOnly:Story={args:{job:{...f.jobFixtures[2],capabilities:f.jobReadOnlyCapabilities}}};
export const LongTitle:Story={args:{job:{...f.jobFixtures[2],title:f.jobPreviewData.longTitle}}};
