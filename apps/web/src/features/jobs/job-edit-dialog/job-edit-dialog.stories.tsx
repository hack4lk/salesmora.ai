import {expect,fn,userEvent,within} from 'storybook/test';
import type {Meta,StoryObj} from '@storybook/nextjs-vite';
import {JobEditDialog} from './job-edit-dialog';
import * as f from '../job-preview.data';

const meta={title:'Jobs/JobEditDialog',component:JobEditDialog,args:{open:true,job:f.jobFixtures[2],onClose:fn(),onConfirm:fn()},parameters:{layout:'fullscreen'},
decorators:[Story=><main className="min-h-screen bg-canvas p-4 sm:p-8"><h1 className="mb-6 mt-0 text-xl font-semibold text-ink">{f.jobPreviewData.workspace}</h1><Story/></main>],
} satisfies Meta<typeof JobEditDialog>;
export default meta;type Story=StoryObj<typeof meta>;
export const Default:Story={};
export const ReadOnly:Story={args:{job:{...f.jobFixtures[2],capabilities:f.jobReadOnlyCapabilities}}};
export const Conflict:Story={args:{error:f.jobStoryData.conflict,conflict:true,onReload:fn()}};
export const Saving:Story={args:{pending:true}};
export const JobZipCode: Story = { args: { postalCode: '10001' } };
export const MissingJobZipCode: Story = { args: { postalCode: '' }, play: async ({ canvasElement, args }) => {
  const d = within(within(canvasElement.ownerDocument.body).getByRole('dialog'));
  await expect(d.getByRole('button', { name: 'Save details' })).toBeDisabled();
  await userEvent.type(d.getByLabelText('Job ZIP code'), '00501-1234');
  await userEvent.click(d.getByRole('button', { name: 'Save details' }));
  await expect(args.onConfirm).toHaveBeenCalledWith(expect.objectContaining({ postalCode: '00501' }));
} };
export const InvalidJobZipCode: Story = { args: { postalCode: 'Manhattan' }, play: async ({ canvasElement }) => {
  const d = within(within(canvasElement.ownerDocument.body).getByRole('dialog'));
  await expect(d.getByText('Enter a 5-digit US ZIP code or ZIP+4.')).toBeVisible();
  await expect(d.getByRole('button', { name: 'Save details' })).toBeDisabled();
} };

const roofing = { id: '0215b37e-dcdb-40a5-871a-4fb911648e06', key: 'Roofing', name: 'Roofing', status: 'active' as const };
export const SelectService: Story = {
 args: { job: { ...f.jobFixtures[2], service: '', serviceId: null }, services: [roofing] },
 play: async ({ canvasElement, args }) => {
  const dialog = within(canvasElement.ownerDocument.body).getByRole('dialog');
  const d = within(dialog);
  await userEvent.click(d.getByRole('combobox', { name: 'Service type · optional' }));
  await userEvent.click(d.getByRole('option', { name: 'Roofing' }));
  await userEvent.click(d.getByRole('button', { name: 'Save details' }));
  await expect(args.onConfirm).toHaveBeenCalledWith(expect.objectContaining({ service: roofing.id }));
 },
};
export const ClearService: Story = {
 args: { job: { ...f.jobFixtures[2], service: 'Roofing', serviceId: roofing.id }, services: [roofing] },
 play: async ({ canvasElement, args }) => {
  const d = within(within(canvasElement.ownerDocument.body).getByRole('dialog'));
  await expect(d.getByRole('combobox', { name: 'Service type · optional' })).toHaveValue('Roofing');
  await userEvent.click(d.getByRole('button', { name: 'Clear' }));
  await userEvent.click(d.getByRole('button', { name: 'Save details' }));
  await expect(args.onConfirm).toHaveBeenCalledWith(expect.objectContaining({ service: '' }));
 },
};
export const ServiceReadOnly: Story = {
 args: { job: { ...f.jobFixtures[2], capabilities: f.jobReadOnlyCapabilities, service: 'Roofing', serviceId: roofing.id }, services: [roofing] },
 play: async ({ canvasElement }) => {
  const d = within(within(canvasElement.ownerDocument.body).getByRole('dialog'));
  await expect(d.getByRole('combobox', { name: 'Service type · optional' })).toBeDisabled();
  await expect(d.getByRole('button', { name: 'Save details' })).toBeDisabled();
 },
};
