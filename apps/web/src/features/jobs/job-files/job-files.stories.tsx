import {fn} from 'storybook/test';
import type {Meta,StoryObj} from '@storybook/nextjs-vite';
import {JobFiles} from './job-files';
import * as f from '../job-preview.data';

const meta={title:'Jobs/JobFiles',component:JobFiles,args:{files:f.jobFiles,onAdd:fn(),onOpen:fn(),onDownload:fn(),onRemove:fn(),onEdit:fn()},parameters:{layout:'fullscreen'},
decorators:[Story=><main className="min-h-screen bg-canvas p-4 sm:p-8"><h1 className="mb-6 mt-0 text-xl font-semibold text-ink">{f.jobPreviewData.workspace}</h1><Story/></main>],
} satisfies Meta<typeof JobFiles>;
export default meta;type Story=StoryObj<typeof meta>;
export const Default:Story={};
export const Empty:Story={args:{files:[]}};
export const ReadOnly:Story={args:{canUpload:false,files:f.jobFiles.map(file=>({...file,canRemove:false}))}};
export const StorageWarning:Story={args:{storageUsed:850000000}};
export const AtQuota:Story={args:{storageUsed:1000000000}};
export const Processing:Story={args:{files:[{...f.jobFiles[0],state:'scanning'},{...f.jobFiles[1],state:'failed'}]}};
export const Removed:Story={args:{files:[{...f.jobFiles[0],state:'removed'}]}};
