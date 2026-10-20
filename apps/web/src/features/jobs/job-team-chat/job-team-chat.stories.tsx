import {fn,expect,within,userEvent} from 'storybook/test';
import type {Meta,StoryObj} from '@storybook/nextjs-vite';
import {JobTeamChat} from './job-team-chat';
import * as f from '../job-preview.data';

const meta={title:'Jobs/JobTeamChat',component:JobTeamChat,args:{messages:f.jobMessages,currentUserId:'ava',onSend:fn()},parameters:{layout:'fullscreen'},
decorators:[Story=><main className="min-h-screen bg-canvas p-4 sm:p-8"><h1 className="mb-6 mt-0 text-xl font-semibold text-ink">{f.jobPreviewData.workspace}</h1><Story/></main>],
} satisfies Meta<typeof JobTeamChat>;
export default meta;type Story=StoryObj<typeof meta>;
export const Default:Story={};
export const Empty:Story={args:{messages:[]}};
export const Closed:Story={args:{closed:true}};
export const ReadOnly:Story={args:{canSend:false}};
export const Thinking:Story={args:{thinking:true}};
export const FailedSend:Story={args:{onSend:fn(async()=>{throw Error('fixture');})},play:async({canvasElement})=>{const c=within(canvasElement);await userEvent.type(c.getByLabelText('Message the job team'),f.jobStoryData.note);await userEvent.click(c.getByRole('button',{name:'Send'}));await expect(c.getByRole('alert')).toBeVisible();await expect(c.getByLabelText('Message the job team')).toHaveValue(f.jobStoryData.note);}};
