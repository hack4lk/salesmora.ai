import {fn} from 'storybook/test';
import type {Meta,StoryObj} from '@storybook/nextjs-vite';
import {JobTeamCard} from './job-team-card';
import * as f from '../job-preview.data';

const meta={title:'Jobs/JobTeamCard',component:JobTeamCard,args:{job:f.jobFixtures[2],onManage:fn()},parameters:{layout:'fullscreen'},
decorators:[Story=><main className="min-h-screen bg-canvas p-4 sm:p-8"><h1 className="mb-6 mt-0 text-xl font-semibold text-ink">{f.jobPreviewData.workspace}</h1><Story/></main>],
} satisfies Meta<typeof JobTeamCard>;
export default meta;type Story=StoryObj<typeof meta>;
export const Default:Story={};
export const Unassigned:Story={args:{job:f.jobFixtures[4]}};
export const ReadOnly:Story={args:{job:{...f.jobFixtures[2],capabilities:f.jobReadOnlyCapabilities}}};
