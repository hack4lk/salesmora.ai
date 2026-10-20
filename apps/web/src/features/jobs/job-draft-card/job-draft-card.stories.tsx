import {fn} from 'storybook/test';
import type {Meta,StoryObj} from '@storybook/nextjs-vite';
import {JobDraftCard} from './job-draft-card';
import * as f from '../job-preview.data';

const meta={title:'Jobs/JobDraftCard',component:JobDraftCard,args:{draft:f.jobDraftFixture,onConfirm:fn(),onCancel:fn()},parameters:{layout:'fullscreen'},
decorators:[Story=><main className="min-h-screen bg-canvas p-4 sm:p-8"><h1 className="mb-6 mt-0 text-xl font-semibold text-ink">{f.jobPreviewData.workspace}</h1><Story/></main>],
} satisfies Meta<typeof JobDraftCard>;
export default meta;type Story=StoryObj<typeof meta>;
export const Default:Story={};
export const Confirming:Story={args:{draft:{...f.jobDraftFixture,state:'confirming'}}};
export const Confirmed:Story={args:{draft:{...f.jobDraftFixture,state:'confirmed'}}};
export const Canceled:Story={args:{draft:{...f.jobDraftFixture,state:'canceled'}}};
export const Expired:Story={args:{draft:{...f.jobDraftFixture,state:'expired'}}};
export const Superseded:Story={args:{draft:{...f.jobDraftFixture,state:'superseded'}}};
export const Stale:Story={args:{draft:{...f.jobDraftFixture,state:'stale'}}};
export const Error:Story={args:{draft:{...f.jobDraftFixture,state:'error'}}};
export const ScheduleChange:Story={args:{draft:{...f.jobDraftFixture,changes:[{label:'Scheduled work date',before:'Oct 20, 2026',after:'Oct 23, 2026'},{label:'Arrival window',before:'09:00–11:00',after:'13:00–15:00'}],warnings:[f.jobStoryData.overlap]}}};
export const MultipleChanges:Story={args:{draft:{...f.jobDraftFixture,changes:[...f.jobDraftFixture.changes,{label:'Completion deadline',before:'Oct 23, 2026',after:'Oct 30, 2026'}]}}};

export const CreateJob:Story={args:{draft:f.jobCreateDraftFixture}};
