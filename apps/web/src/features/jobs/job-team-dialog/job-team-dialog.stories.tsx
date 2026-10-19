import {fn,expect,within,userEvent} from 'storybook/test';
import type {Meta,StoryObj} from '@storybook/nextjs-vite';
import {JobTeamDialog} from './job-team-dialog';
import * as f from '../job-preview.data';

const meta={title:'Jobs/JobTeamDialog',component:JobTeamDialog,args:{open:true,job:f.jobFixtures[2],members:f.jobMembers,onClose:fn(),onConfirm:fn()},parameters:{layout:'fullscreen'},
decorators:[Story=><main className="min-h-screen bg-canvas p-4 sm:p-8"><h1 className="mb-6 mt-0 text-xl font-semibold text-ink">{f.jobPreviewData.workspace}</h1><Story/></main>],
} satisfies Meta<typeof JobTeamDialog>;
export default meta;type Story=StoryObj<typeof meta>;
export const Default:Story={};
export const Unassigned:Story={args:{job:f.jobFixtures[4]}};
export const ReadOnly:Story={args:{job:{...f.jobFixtures[2],capabilities:f.jobReadOnlyCapabilities}}};
export const Conflict:Story={args:{error:f.jobStoryData.conflict,conflict:true,onReload:fn()}};
export const Reassign:Story={play:async({canvasElement,args})=>{const b=within(canvasElement.ownerDocument.body);await userEvent.selectOptions(b.getByLabelText('Primary owner'),'morgan');await expect(b.queryByLabelText('Sam Rivera')).not.toBeInTheDocument();await userEvent.click(b.getByRole('button',{name:'Save team'}));await expect(args.onConfirm).toHaveBeenCalledWith({primaryOwnerId:'morgan',teamUserIds:['alex']});}};
