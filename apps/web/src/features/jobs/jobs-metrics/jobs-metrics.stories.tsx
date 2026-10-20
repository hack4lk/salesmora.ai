import type {Meta,StoryObj} from '@storybook/nextjs-vite';
import {JobsMetrics} from './jobs-metrics';
import * as f from '../job-preview.data';

const meta={title:'Jobs/JobsMetrics',component:JobsMetrics,args:{active:6,overdue:1,waiting:1,unassigned:1},parameters:{layout:'fullscreen'},
decorators:[Story=><main className="min-h-screen bg-canvas p-4 sm:p-8"><h1 className="mb-6 mt-0 text-xl font-semibold text-ink">{f.jobPreviewData.workspace}</h1><Story/></main>],
} satisfies Meta<typeof JobsMetrics>;
export default meta;type Story=StoryObj<typeof meta>;
export const Default:Story={};
export const Empty:Story={args:{active:0,overdue:0,waiting:0,unassigned:0}};

export const Loading:Story={args:{state:'loading'}};
export const Error:Story={args:{state:'error'}};
