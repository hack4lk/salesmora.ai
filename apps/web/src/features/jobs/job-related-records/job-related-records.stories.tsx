import {fn} from 'storybook/test';
import type {Meta,StoryObj} from '@storybook/nextjs-vite';
import {JobRelatedRecords} from './job-related-records';
import * as f from '../job-preview.data';

const meta={title:'Jobs/JobRelatedRecords',component:JobRelatedRecords,args:{records:[{id:'customer',kind:'customer',label:f.jobFixtures[2].customerName,canOpen:true},{id:'lead',kind:'lead',label:'LD-0042',canOpen:true}],onOpen:fn()},parameters:{layout:'fullscreen'},
decorators:[Story=><main className="min-h-screen bg-canvas p-4 sm:p-8"><h1 className="mb-6 mt-0 text-xl font-semibold text-ink">{f.jobPreviewData.workspace}</h1><Story/></main>],
} satisfies Meta<typeof JobRelatedRecords>;
export default meta;type Story=StoryObj<typeof meta>;
export const Default:Story={};
export const FieldLimited:Story={args:{records:[{id:'customer',kind:'customer',label:f.jobFixtures[2].customerName,canOpen:false}]}};
export const FollowOnWork:Story={args:{records:[{id:'origin',kind:'origin',label:f.jobFixtures[0].title,canOpen:true},{id:'follow',kind:'followOn',label:f.jobFixtures[1].title,canOpen:true}]}};
