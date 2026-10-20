import {fn,expect,within,userEvent} from 'storybook/test';
import type {Meta,StoryObj} from '@storybook/nextjs-vite';
import {JobRowMenu} from './job-row-menu';
import * as f from '../job-preview.data';

const meta={title:'Jobs/JobRowMenu',component:JobRowMenu,args:{job:f.jobFixtures[2],onAction:fn()},parameters:{layout:'fullscreen'},
decorators:[Story=><main className="min-h-screen bg-canvas p-4 sm:p-8"><h1 className="mb-6 mt-0 text-xl font-semibold text-ink">{f.jobPreviewData.workspace}</h1><Story/></main>],
} satisfies Meta<typeof JobRowMenu>;
export default meta;type Story=StoryObj<typeof meta>;
export const Default:Story={};
export const ReadOnly:Story={args:{job:{...f.jobFixtures[2],capabilities:f.jobReadOnlyCapabilities}}};
export const Closed:Story={args:{job:f.jobFixtures[6]}};
export const OpenMenu:Story={play:async({canvasElement})=>{const c=within(canvasElement);await userEvent.click(c.getByRole('button'));await expect(within(canvasElement.ownerDocument.body).getByRole('menu')).toBeVisible();}};
