import {fn,expect,userEvent,within} from 'storybook/test';
import type {Meta,StoryObj} from '@storybook/nextjs-vite';
import {WorkOrderRowMenu} from './work-order-row-menu';
import {workOrderFixtures,crewCapabilities,readOnlyCapabilities} from '../work-order-preview.data';

const meta={title:'Work Orders/WorkOrderRowMenu',component:WorkOrderRowMenu,args:{row:workOrderFixtures[2],onAction:fn()},
 decorators:[Story=><main className="min-h-screen bg-canvas p-6"><Story/></main>],
} satisfies Meta<typeof WorkOrderRowMenu>;
export default meta;type Story=StoryObj<typeof meta>;
export const Default:Story={play:async({canvasElement,args})=>{
 const b=within(canvasElement.ownerDocument.body);
 await userEvent.click(b.getByRole('button',{name:/Actions for/}));
 await expect(await b.findByRole('menuitem',{name:'Change status'})).toBeInTheDocument();
 await userEvent.click(b.getByRole('menuitem',{name:'Change status'}));
 await expect(args.onAction).toHaveBeenCalledWith('status');
}};
export const Draft:Story={args:{row:workOrderFixtures[0]}};
export const Completed:Story={args:{row:workOrderFixtures[4]}};
export const Crew:Story={args:{row:{...workOrderFixtures[2],capabilities:crewCapabilities}}};
export const ReadOnly:Story={args:{row:{...workOrderFixtures[2],capabilities:readOnlyCapabilities}}};
export const Disabled:Story={args:{disabled:true}};
