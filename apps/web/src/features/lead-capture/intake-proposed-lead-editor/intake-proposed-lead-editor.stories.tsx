import { useState } from 'react';
import type { Meta, StoryObj } from '@storybook/nextjs-vite';
import { expect, fn, userEvent, within } from 'storybook/test';
import { IntakeProposedLeadEditor, type IntakeProposedLeadEditorProps } from './intake-proposed-lead-editor';
import { intakeProposedLeadEditorData as copy } from './intake-proposed-lead-editor.data';
import { standardCaptureFieldTypes, type CaptureFormFieldEditorValue, type CaptureFormField, type CaptureStandardField } from '../capture-form-field-editor/capture-form-field-editor.validation';
const fields: CaptureFormField[] = (['name', 'email', 'phone', 'service', 'details', 'address'] as CaptureStandardField[]).map(key => ({ id: key, key, label: copy.stories.labels[key], type: standardCaptureFieldTypes[key], required: key === 'name' || key === 'service', options: [] }));
const definition: CaptureFormFieldEditorValue = { fields, contactRequired: true };
const answers = { name: copy.stories.name, email: copy.stories.email, service: copy.stories.service };
const custom: CaptureFormField[] = [
  { id: 'timing', key: 'custom', label: copy.stories.labels.timing, type: 'dropdown', required: true, options: copy.stories.choices.map((label, i) => ({ id: `timing-${i}`, label })) },
  { id: 'interests', key: 'custom', label: copy.stories.labels.interests, type: 'checkboxes', required: true, options: copy.stories.interests.map((label, i) => ({ id: `interest-${i}`, label })) },
  { id: 'date', key: 'custom', label: copy.stories.labels.date, type: 'date', required: false, options: [] },
];
function Preview(args: IntakeProposedLeadEditorProps) {
  const [value, setValue] = useState(args.value);
  return <main className="min-h-screen bg-canvas p-4 text-ink sm:p-8"><p className="mb-6 mt-0 text-sm text-muted">{copy.stories.description}</p><div className="mx-auto max-w-3xl"><IntakeProposedLeadEditor {...args} value={value} onChange={next => { args.onChange(next); setValue(next); }} /></div></main>;
}
const meta = {
  title: 'Lead Capture/IntakeProposedLeadEditor', component: IntakeProposedLeadEditor, parameters: { layout: 'fullscreen' }, render: args => <Preview {...args} />,
  args: { record: { id: 'intake-item', version: 1, resolved: false }, definition, originalAnswers: answers, value: answers, uncertainFieldIds: ['service'], canRead: true, canEdit: true, onChange: fn(), onRetry: fn() },
} satisfies Meta<typeof IntakeProposedLeadEditor>;
export default meta;
type Story = StoryObj<typeof meta>;
export const Default: Story = {};
export const CorrectValue: Story = { play: async ({ canvasElement, args }) => {
  const c = within(canvasElement); const service = c.getByRole('textbox', { name: copy.stories.labels.service }); await userEvent.clear(service); await userEvent.type(service, copy.stories.corrected);
  await expect(args.onChange).toHaveBeenLastCalledWith({ ...answers, service: copy.stories.corrected }); await expect(c.getByText(copy.edited, { exact: true })).toBeVisible(); await expect(c.getByText(copy.uncertain, { exact: true })).toBeVisible(); await expect(args.originalAnswers.service).toBe(copy.stories.service);
} };
export const MissingRequired: Story = { args: { value: {}, originalAnswers: {}, showErrors: true }, play: async ({ canvasElement }) => { const c = within(canvasElement); await expect(c.getByRole('alert')).toHaveTextContent(copy.errors); await expect(c.getByRole('textbox', { name: copy.stories.labels.name })).toHaveAttribute('aria-invalid', 'true'); } };
export const CorrectRequired: Story = { args: { value: {}, originalAnswers: {}, showErrors: true }, play: async ({ canvasElement }) => {
  const c = within(canvasElement); await userEvent.type(c.getByRole('textbox', { name: copy.stories.labels.name }), copy.stories.name); await userEvent.type(c.getByRole('textbox', { name: copy.optional(copy.stories.labels.email) }), copy.stories.email); await userEvent.type(c.getByRole('textbox', { name: copy.stories.labels.service }), copy.stories.service); await expect(c.queryByRole('alert')).not.toBeInTheDocument();
} };
export const PhoneOnly: Story = { args: { value: { name: answers.name, service: answers.service, phone: copy.stories.phone }, showErrors: true }, play: async ({ canvasElement }) => { await expect(within(canvasElement).queryByRole('alert')).not.toBeInTheDocument(); } };
export const InvalidEmail: Story = { args: { value: { ...answers, email: 'invalid' }, showErrors: true }, play: async ({ canvasElement }) => { await expect(within(canvasElement).getByRole('textbox', { name: copy.optional(copy.stories.labels.email) })).toHaveAttribute('aria-invalid', 'true'); } };
export const CustomFields: Story = { args: { definition: { ...definition, fields: [...fields, ...custom] }, showErrors: true }, play: async ({ canvasElement, args }) => {
  const c = within(canvasElement); await userEvent.selectOptions(c.getByRole('combobox', { name: copy.stories.labels.timing }), 'timing-0'); await userEvent.click(c.getByRole('checkbox', { name: copy.stories.interests[0] })); await expect(args.onChange).toHaveBeenLastCalledWith({ ...answers, timing: 'timing-0', interests: ['interest-0'] }); await expect(c.queryByRole('alert')).not.toBeInTheDocument();
} };
export const ReadOnly: Story = { args: { canEdit: false }, play: async ({ canvasElement, args }) => { const c = within(canvasElement); const name = c.getByRole('textbox', { name: copy.stories.labels.name }); await expect(name).toHaveAttribute('readonly'); await userEvent.type(name, 'x'); await expect(args.onChange).not.toHaveBeenCalled(); } };
export const Resolved: Story = { args: { record: { id: 'resolved-item', version: 2, resolved: true } }, play: async ({ canvasElement }) => { const c = within(canvasElement); await expect(c.getByRole('status')).toHaveTextContent(copy.resolved); await expect(c.getByRole('textbox', { name: copy.stories.labels.name })).toHaveAttribute('readonly'); } };
export const Pending: Story = { args: { pending: true, definition: { ...definition, fields: [...fields, ...custom] } }, play: async ({ canvasElement, args }) => { const c = within(canvasElement); for (const input of [...c.getAllByRole('textbox'), ...c.getAllByRole('combobox'), ...c.getAllByRole('checkbox')]) await expect(input).toBeDisabled(); await expect(args.onChange).not.toHaveBeenCalled(); } };
export const Loading: Story = { args: { state: 'loading' }, play: async ({ canvasElement }) => { const c = within(canvasElement); await expect(c.getByRole('status')).toHaveAttribute('aria-busy', 'true'); await expect(c.queryByRole('textbox')).not.toBeInTheDocument(); } };
export const Error: Story = { args: { state: 'error', value: { ...answers, service: copy.stories.corrected } }, play: async ({ canvasElement, args }) => { const c = within(canvasElement); await expect(c.getByRole('alert')).toHaveTextContent(copy.error); await userEvent.click(c.getByRole('button', { name: copy.retry })); await expect(args.onRetry).toHaveBeenCalledTimes(1); await expect(args.value.service).toBe(copy.stories.corrected); } };
export const PermissionDenied: Story = { args: { canRead: false }, play: async ({ canvasElement }) => { const c = within(canvasElement); await expect(c.getByRole('alert')).toHaveTextContent(copy.denied); await expect(c.queryByRole('textbox')).not.toBeInTheDocument(); await expect(c.queryByText(answers.name)).not.toBeInTheDocument(); } };
export const InvalidDefinition: Story = { args: { definition: { ...definition, fields: fields.filter(field => field.key !== 'name') } }, play: async ({ canvasElement }) => { const c = within(canvasElement); await expect(c.getByRole('alert')).toHaveTextContent(copy.invalid); await expect(c.queryByRole('textbox')).not.toBeInTheDocument(); } };
export const LongContent: Story = { args: { value: { ...answers, details: copy.stories.long.repeat(10) }, definition: { ...definition, fields: fields.map(field => ({ ...field, label: field.key === 'details' ? copy.stories.long.slice(0, 60) : field.label })) } } };
