import {fn,expect,within,userEvent} from 'storybook/test';
import type {Meta,StoryObj} from '@storybook/nextjs-vite';
import {JobCreateDialog} from './job-create-dialog';
import * as f from '../job-preview.data';

const meta={title:'Jobs/JobCreateDialog',component:JobCreateDialog,args:{open:true,members:f.jobMembers,customers:f.jobFixtures.map(j=>({id:j.customerId!,name:j.customerName})),onClose:fn(),onConfirm:fn()},parameters:{layout:'fullscreen'},
decorators:[Story=><main className="min-h-screen bg-canvas p-4 sm:p-8"><h1 className="mb-6 mt-0 text-xl font-semibold text-ink">{f.jobPreviewData.workspace}</h1><Story/></main>],
} satisfies Meta<typeof JobCreateDialog>;
export default meta;type Story=StoryObj<typeof meta>;
export const Default:Story={};
export const Review:Story={args:{initialCustomer:f.jobFixtures[0].customerId!,initialReview:true,initialValues:{title:f.jobFixtures[0].title,primaryOwnerId:f.jobFixtures[0].primaryOwnerId}}};
export const Saving:Story={args:{initialCustomer:f.jobFixtures[0].customerId!,initialReview:true,initialValues:{title:f.jobFixtures[0].title,primaryOwnerId:f.jobFixtures[0].primaryOwnerId},pending:true}};
export const Error:Story={args:{error:f.jobStoryData.failure}};
export const CreateExistingCustomer:Story={play:async({canvasElement,args})=>{const b=within(canvasElement.ownerDocument.body);await userEvent.selectOptions(b.getByLabelText('Customer'),f.jobFixtures[0].customerId!);await userEvent.type(b.getByLabelText('Job title'),f.jobPreviewData.newJob);await userEvent.selectOptions(b.getByLabelText('Primary owner'),'sam');await userEvent.click(b.getByRole('button',{name:'Review job'}));await expect(b.getByRole('heading',{name:'Review new job'})).toBeVisible();await expect(args.onConfirm).not.toHaveBeenCalled();await userEvent.click(b.getByRole('button',{name:'Confirm and create'}));await expect(args.onConfirm).toHaveBeenCalledWith(expect.objectContaining({customerId:f.jobFixtures[0].customerId,title:f.jobPreviewData.newJob,primaryOwnerId:'sam'}));}};
export const NewCustomer:Story={play:async({canvasElement})=>{const b=within(canvasElement.ownerDocument.body);await userEvent.selectOptions(b.getByLabelText('Customer'),'new');await userEvent.type(b.getByLabelText('Customer name'),f.jobFixtures[0].customerName);await expect(b.getByLabelText('Email · optional')).toBeVisible();}};

export const DuplicateCustomer:Story={args:{matches:[{id:f.jobFixtures[0].customerId!,name:f.jobFixtures[0].customerName,number:'CU-0001',reason:'name'}]},play:async({canvasElement})=>{const b=within(canvasElement.ownerDocument.body);await userEvent.selectOptions(b.getByLabelText('Customer'),'new');await userEvent.type(b.getByLabelText('Customer name'),f.jobFixtures[0].customerName);await expect(b.getByRole('button',{name:'Use existing CU-0001'})).toBeVisible();}};

export const InvalidPhone:Story={play:async({canvasElement})=>{const b=within(canvasElement.ownerDocument.body);await userEvent.selectOptions(b.getByLabelText('Customer'),'new');await userEvent.type(b.getByLabelText('Phone · optional'),'abc1234567');await expect(b.getByRole('alert')).toBeVisible();await expect(b.getByRole('button',{name:'Review job'})).toBeDisabled();}};
