import {fn} from 'storybook/test';
import type {Meta,StoryObj} from '@storybook/nextjs-vite';
import {JobPeekDrawer} from './job-peek-drawer';
import * as f from '../job-preview.data';

const meta={title:'Jobs/JobPeekDrawer',component:JobPeekDrawer,args:{open:true,job:f.jobFixtures[2],today:f.jobToday,onClose:fn(),onOpen:fn(),onAction:fn()},parameters:{layout:'fullscreen'},
decorators:[Story=><main className="min-h-screen bg-canvas p-4 sm:p-8"><h1 className="mb-6 mt-0 text-xl font-semibold text-ink">{f.jobPreviewData.workspace}</h1><Story/></main>],
} satisfies Meta<typeof JobPeekDrawer>;
export default meta;type Story=StoryObj<typeof meta>;
export const Default:Story={};
export const ReadOnly:Story={args:{job:{...f.jobFixtures[2],capabilities:f.jobReadOnlyCapabilities}}};
