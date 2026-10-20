import {fn} from 'storybook/test';
import type {Meta,StoryObj} from '@storybook/nextjs-vite';
import {JobsToolbar} from './jobs-toolbar';
import * as f from '../job-preview.data';
import {defaultJobFilters} from './jobs-toolbar';
const meta={title:'Jobs/JobsToolbar',component:JobsToolbar,args:{value:defaultJobFilters,members:f.jobMembers,customers:f.jobFixtures.map(j=>j.customerName),services:['Plumbing','Home improvement'],count:6,view:'board',onChange:fn(),onView:fn()},parameters:{layout:'fullscreen'},
decorators:[Story=><main className="min-h-screen bg-canvas p-4 sm:p-8"><h1 className="mb-6 mt-0 text-xl font-semibold text-ink">{f.jobPreviewData.workspace}</h1><Story/></main>],
} satisfies Meta<typeof JobsToolbar>;
export default meta;type Story=StoryObj<typeof meta>;
export const Default:Story={};
export const Field:Story={args:{field:true,value:{...defaultJobFilters,mine:true}}};
export const Filtered:Story={args:{value:{...defaultJobFilters,status:'waiting',deadline:'overdue'}}};
export const Closed:Story={args:{value:{...defaultJobFilters,closed:true},view:'table'}};
