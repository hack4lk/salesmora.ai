import {fn,expect,userEvent,within,fireEvent} from 'storybook/test';
import type {Meta,StoryObj} from '@storybook/nextjs-vite';
import {WorkOrderMoveDialog} from './work-order-move-dialog';
import {workOrderFixtures,readOnlyCapabilities} from '../work-order-preview.data';

const [draft,issued,progress]=[workOrderFixtures[0],workOrderFixtures[1],workOrderFixtures[2]];
const meta={title:'Work Orders/WorkOrderMoveDialog',component:WorkOrderMoveDialog,args:{open:true,workOrder:issued,onClose:fn(),onConfirm:fn()},
 decorators:[Story=><main className="min-h-screen bg-canvas p-6"><Story/></main>],
} satisfies Meta<typeof WorkOrderMoveDialog>;
export default meta;type Story=StoryObj<typeof meta>;
export const Default:Story={play:async({canvasElement,args})=>{
 const b=within(canvasElement.ownerDocument.body);
 await userEvent.click(await b.findByRole('button',{name:'Start work'}));
 await expect(args.onConfirm).toHaveBeenCalledWith('in-progress','');
}};
export const IssueDraftNoAssignee:Story={args:{workOrder:draft,to:'issued'}};
export const Complete:Story={args:{workOrder:progress,to:'completed'}};
export const CancelNeedsReason:Story={args:{workOrder:progress,to:'canceled'},play:async({canvasElement,args})=>{
 const b=within(canvasElement.ownerDocument.body),confirm=await b.findByRole('button',{name:'Cancel work order'});
 await expect(confirm).toBeDisabled();
 fireEvent.change(b.getByLabelText(/Reason for canceling/),{target:{value:'Customer rescheduled'}});
 await expect(confirm).toBeEnabled();
 await userEvent.click(confirm);
 await expect(args.onConfirm).toHaveBeenCalledWith('canceled','Customer rescheduled');
}};
export const Saving:Story={args:{pending:true}};
export const Error:Story={args:{error:'The status could not be changed. Try again.'}};
export const NoTransitions:Story={args:{workOrder:{...issued,capabilities:readOnlyCapabilities}}};
