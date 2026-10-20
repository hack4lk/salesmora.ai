import type {Meta,StoryObj} from '@storybook/nextjs-vite';
import {expect,within} from 'storybook/test';
import {AccountLayout} from '@salesmora/ui';
import {CheckoutHandoff} from './checkout-handoff';
import {checkoutHandoffData as copy} from './checkout-handoff.data';
const meta={title:'Billing/CheckoutHandoff',component:CheckoutHandoff,args:{paymentPreview:<div className="rounded-xl border border-line bg-canvas p-8 text-center text-muted">{copy.preview}</div>,workspaceId:'00000000-0000-4000-8000-000000000000',plan:'standard'},parameters:{layout:'fullscreen',docs:{description:{component:'Layout preview only; action buttons require an authenticated app session.'}}},decorators:[Story=><AccountLayout title={copy.title} description={copy.description}><Story/></AccountLayout>]} satisfies Meta<typeof CheckoutHandoff>;
export default meta;type Story=StoryObj<typeof meta>;
export const Default:Story={play:async({canvasElement})=>{const c=within(canvasElement);await expect(c.getByText(copy.preview)).toBeVisible();await expect(c.queryByRole('button',{name:copy.check})).not.toBeInTheDocument();await expect(c.queryByRole('link',{name:/verification/i})).not.toBeInTheDocument();}};
export const Unavailable:Story={args:{paymentPreview:undefined}};

export const ReturningFromCheckout:Story={args:{hasCheckout:true}};
