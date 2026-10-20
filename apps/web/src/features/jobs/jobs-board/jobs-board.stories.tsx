import {fn} from 'storybook/test';
import type {Meta,StoryObj} from '@storybook/nextjs-vite';
import {JobsBoard} from './jobs-board';
import * as f from '../job-preview.data';

const meta={title:'Jobs/JobsBoard',component:JobsBoard,args:{rows:f.jobFixtures,today:f.jobToday,onOpen:fn(),onAction:fn(),onRequestMove:fn()},parameters:{layout:'fullscreen'},
decorators:[Story=><main className="min-h-screen bg-canvas p-4 sm:p-8"><h1 className="mb-6 mt-0 text-xl font-semibold text-ink">{f.jobPreviewData.workspace}</h1><Story/></main>],
} satisfies Meta<typeof JobsBoard>;
export default meta;type Story=StoryObj<typeof meta>;
export const Default:Story={};
export const Empty:Story={args:{rows:[]}};
export const Closed:Story={args:{closed:true}};
export const ReadOnly:Story={args:{rows:f.jobFixtures.map(j=>({...j,capabilities:f.jobReadOnlyCapabilities})),onRequestMove:undefined}};
export const ManyJobs:Story={args:{rows:Array.from({length:20},(_,i)=>({...f.jobFixtures[i%6],id:`card-${i}`,number:`J-${2000+i}`}))}};
export const Pending:Story={args:{pendingId:f.jobFixtures[0].id}};
