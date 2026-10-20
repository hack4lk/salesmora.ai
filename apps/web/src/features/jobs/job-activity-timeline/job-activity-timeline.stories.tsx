import {fn} from 'storybook/test';
import type {Meta,StoryObj} from '@storybook/nextjs-vite';
import {JobActivityTimeline} from './job-activity-timeline';
import * as f from '../job-preview.data';

const meta={title:'Jobs/JobActivityTimeline',component:JobActivityTimeline,args:{entries:f.jobActivity,onMore:fn(),onRetry:fn()},parameters:{layout:'fullscreen'},
decorators:[Story=><main className="min-h-screen bg-canvas p-4 sm:p-8"><h1 className="mb-6 mt-0 text-xl font-semibold text-ink">{f.jobPreviewData.workspace}</h1><Story/></main>],
} satisfies Meta<typeof JobActivityTimeline>;
export default meta;type Story=StoryObj<typeof meta>;
export const Default:Story={};
export const Empty:Story={args:{entries:[]}};
export const OlderActivity:Story={args:{hasMore:true}};
export const Loading:Story={args:{state:'loading'}};
export const Error:Story={args:{state:'error'}};
