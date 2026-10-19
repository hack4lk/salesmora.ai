import {CandidatePicker} from '@salesmora/ui';
import {fn} from 'storybook/test';
import type {Meta,StoryObj} from '@storybook/nextjs-vite';
import {JobResultsCard} from './job-results-card';
import * as f from '../job-preview.data';

const meta={title:'Jobs/JobResultsCard',component:JobResultsCard,args:{records:f.jobFixtures.slice(0,3),total:24,onOpen:fn(),onOpenList:fn()},parameters:{layout:'fullscreen'},
decorators:[Story=><main className="min-h-screen bg-canvas p-4 sm:p-8"><h1 className="mb-6 mt-0 text-xl font-semibold text-ink">{f.jobPreviewData.workspace}</h1><Story/></main>],
} satisfies Meta<typeof JobResultsCard>;
export default meta;type Story=StoryObj<typeof meta>;
export const Default:Story={};
export const Empty:Story={args:{records:[],total:0}};
export const Details:Story={args:{mode:'details',records:[f.jobFixtures[2]],total:1}};
export const Activity:Story={args:{mode:'activity',records:[f.jobFixtures[2]],entries:f.jobActivity,total:3}};

export const CustomerChoices:Story={render:()=> <CandidatePicker kind="customer" candidates={f.jobFixtures.slice(0,2).map(j=>({id:j.customerId!,name:j.customerName,detail:j.location}))} onChoose={fn()}/>};
export const TeammateChoices:Story={render:()=> <CandidatePicker kind="member" candidates={f.jobMembers.map(m=>({id:m.id,name:m.name,detail:m.role}))} onChoose={fn()}/>};
