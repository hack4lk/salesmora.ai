import {fn} from 'storybook/test';
import type {Meta,StoryObj} from '@storybook/nextjs-vite';
import {JobsEmptyState} from './jobs-empty-state';
import * as f from '../job-preview.data';

const meta={title:'Jobs/JobsEmptyState',component:JobsEmptyState,args:{onCreate:fn(),onClear:fn(),onRetry:fn()},parameters:{layout:'fullscreen'},
decorators:[Story=><main className="min-h-screen bg-canvas p-4 sm:p-8"><h1 className="mb-6 mt-0 text-xl font-semibold text-ink">{f.jobPreviewData.workspace}</h1><Story/></main>],
} satisfies Meta<typeof JobsEmptyState>;
export default meta;type Story=StoryObj<typeof meta>;
export const Default:Story={};
export const NoResults:Story={args:{kind:'filtered'}};
export const Closed:Story={args:{kind:'closed'}};
export const Loading:Story={args:{kind:'loading'}};
export const Error:Story={args:{kind:'error'}};
export const Field:Story={args:{canCreate:false}};
