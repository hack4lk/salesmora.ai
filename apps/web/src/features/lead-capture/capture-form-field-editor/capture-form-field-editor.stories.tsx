import { useState } from 'react';
import type { Meta, StoryObj } from '@storybook/nextjs-vite';
import { expect, fn, userEvent, within } from 'storybook/test';
import { CaptureFormFieldEditor, type CaptureFormFieldEditorProps } from './capture-form-field-editor';
import { captureFormFieldEditorData as copy } from './capture-form-field-editor.data';
import { standardCaptureFieldTypes, type CaptureFormField, type CaptureFormFieldEditorValue, type CaptureStandardField } from './capture-form-field-editor.validation';

const fields: CaptureFormField[] = (Object.keys(copy.standards) as CaptureStandardField[]).map(key => ({ id: key, key, label: copy.standards[key], type: standardCaptureFieldTypes[key], required: key === 'name' || key === 'service', options: [] }));
const value: CaptureFormFieldEditorValue = { fields, contactRequired: true };
const choice: CaptureFormField = { id: 'custom-choice', key: 'custom', label: copy.stories.customLabel, type: 'dropdown', required: false, options: [{ id: 'morning', label: copy.stories.optionA }, { id: 'afternoon', label: copy.stories.optionB }] };
const group = (c: ReturnType<typeof within>, index: number) => within(c.getByRole('group', { name: copy.field(index) }));
function Preview(args: CaptureFormFieldEditorProps) {
  const [draft, setDraft] = useState(args.value);
  return <main className="min-h-screen bg-canvas p-4 text-ink sm:p-8"><h1 className="m-0 text-heading font-semibold">{copy.stories.title}</h1><p className="mb-6 mt-2 text-sm text-muted">{copy.stories.description}</p>
    <CaptureFormFieldEditor {...args} value={draft} onChange={next => { args.onChange(next); setDraft(next); }} />
  </main>;
}
const meta = {
  title: 'Lead Capture/CaptureFormFieldEditor', component: CaptureFormFieldEditor, parameters: { layout: 'fullscreen' }, render: args => <Preview {...args} />,
  args: { value, canRead: true, canEdit: true, onChange: fn() },
} satisfies Meta<typeof CaptureFormFieldEditor>;
export default meta;
type Story = StoryObj<typeof meta>;
export const Default: Story = {};
export const EditLabel: Story = { args: { value: { fields: [fields[0]], contactRequired: false } }, play: async ({ canvasElement, args }) => {
  const c = within(canvasElement), label = group(c, 1).getByRole('textbox', { name: copy.fieldLabel });
  await userEvent.clear(label); await userEvent.type(label, copy.stories.customLabel);
  await expect(args.onChange).toHaveBeenLastCalledWith({ fields: [{ ...fields[0], label: copy.stories.customLabel }], contactRequired: false });
} };
export const Reorder: Story = { args: { value: { fields: fields.slice(0, 2), contactRequired: true } }, play: async ({ canvasElement, args }) => {
  const c = within(canvasElement);
  await userEvent.click(c.getByRole('button', { name: copy.action(copy.down, copy.field(1)) }));
  await expect(args.onChange).toHaveBeenLastCalledWith({ fields: [fields[1], fields[0]], contactRequired: true });
  await expect(group(c, 2).getByRole('textbox', { name: copy.fieldLabel })).toHaveFocus();
} };
export const RemoveAndRestore: Story = { args: { value: { fields: fields.slice(0, 2), contactRequired: true } }, play: async ({ canvasElement, args }) => {
  const c = within(canvasElement);
  await userEvent.click(c.getByRole('button', { name: copy.action(copy.remove, copy.field(1)) }));
  await expect(group(c, 1).getByRole('textbox', { name: copy.fieldLabel })).toHaveFocus();
  await userEvent.selectOptions(c.getByLabelText(copy.addType), 'standard:name');
  await userEvent.click(c.getByRole('button', { name: copy.add }));
  await expect(group(c, 2).getByRole('textbox', { name: copy.fieldLabel })).toHaveValue(copy.standards.name);
  await expect(group(c, 2).getByRole('textbox', { name: copy.fieldLabel })).toHaveFocus();
  const saved = args.onChange.mock.calls.at(-1)?.[0];
  await expect(saved.fields[0].id).toBe('email');
  await expect(saved.fields[1].id).not.toBe('name');
} };
export const CustomTypes: Story = { args: { value: { fields: [], contactRequired: false } }, play: async ({ canvasElement, args }) => {
  const c = within(canvasElement);
  for (const type of ['short_text', 'long_text', 'dropdown', 'checkboxes', 'date']) {
    await userEvent.selectOptions(c.getByLabelText(copy.addType), `custom:${type}`);
    await userEvent.click(c.getByRole('button', { name: copy.add }));
    await expect(args.onChange.mock.calls.at(-1)?.[0].fields.at(-1)?.type).toBe(type);
  }
} };
export const ChoiceOptions: Story = { args: { value: { fields: [choice], contactRequired: false } }, play: async ({ canvasElement, args }) => {
  const c = within(canvasElement), first = group(c, 1).getAllByRole('textbox', { name: copy.option })[0];
  await userEvent.clear(first); await userEvent.type(first, copy.stories.optionB);
  await expect(args.onChange.mock.calls.at(-1)?.[0].fields[0].options[0].id).toBe('morning');
  await userEvent.click(c.getByRole('button', { name: copy.action(copy.removeOption, copy.choice(1)) }));
  await expect(args.onChange.mock.calls.at(-1)?.[0].fields[0].options).toEqual([choice.options[1]]);
  await userEvent.click(c.getByRole('button', { name: copy.addOption }));
  await expect(args.onChange.mock.calls.at(-1)?.[0].fields[0].options).toHaveLength(2);
} };
export const Requirements: Story = { args: { value: { fields: fields.slice(0, 2), contactRequired: true } }, play: async ({ canvasElement, args }) => {
  const c = within(canvasElement);
  await userEvent.click(group(c, 1).getByRole('checkbox', { name: copy.required }));
  await expect(args.onChange.mock.calls.at(-1)?.[0].fields[0].required).toBe(false);
  await userEvent.click(c.getByRole('checkbox', { name: copy.contact }));
  await expect(args.onChange.mock.calls.at(-1)?.[0].contactRequired).toBe(false);
} };
export const LeadFieldTypes: Story = { play: async ({ canvasElement, args }) => {
  const c = within(canvasElement);
  const nameType = group(c, 1).getByRole('combobox', { name: copy.type });
  await expect(nameType).toBeEnabled();
  await userEvent.selectOptions(nameType, 'long_text');
  await expect(args.onChange.mock.calls.at(-1)?.[0].fields[0]).toMatchObject({ id: 'name', key: 'name', type: 'long_text' });
  await userEvent.selectOptions(group(c, 4).getByRole('combobox', { name: copy.type }), 'dropdown');
  await expect(args.onChange.mock.calls.at(-1)?.[0].fields[3]).toMatchObject({ id: 'service', key: 'service', type: 'dropdown' });
  await expect(group(c, 2).getByRole('combobox', { name: copy.type })).toBeEnabled();
  await expect(group(c, 2).getByRole('option', { name: copy.types.email })).toBeInTheDocument();
} };
export const Invalid: Story = { args: { showErrors: true, value: { fields: [{ ...choice, label: '', options: [{ id: 'one', label: copy.stories.optionA }, { id: 'two', label: copy.stories.duplicate }] }], contactRequired: true } }, play: async ({ canvasElement }) => {
  const c = within(canvasElement);
  await expect(c.getByRole('alert')).toHaveTextContent(copy.errors.contact);
  await expect(c.getByRole('alert')).toHaveTextContent(copy.errors.duplicateOption);
  await expect(group(c, 1).getByRole('textbox', { name: copy.fieldLabel })).toHaveAttribute('aria-invalid', 'true');
} };
export const Empty: Story = { args: { value: { fields: [], contactRequired: false } } };
export const Pending: Story = { args: { value: { fields: [choice], contactRequired: false }, pending: true }, play: async ({ canvasElement, args }) => {
  const c = within(canvasElement);
  for (const item of [...c.getAllByRole('button'), ...c.getAllByRole('textbox'), ...c.getAllByRole('combobox'), ...c.getAllByRole('checkbox')]) await expect(item).toBeDisabled();
  await userEvent.click(c.getByRole('button', { name: copy.addOption }));
  await expect(args.onChange).not.toHaveBeenCalled();
} };
export const ReadOnly: Story = { args: { value: { fields: [choice], contactRequired: false }, canEdit: false }, play: async ({ canvasElement }) => {
  const c = within(canvasElement);
  await expect(c.queryByRole('button')).not.toBeInTheDocument();
  for (const item of c.getAllByRole('textbox')) await expect(item).toBeDisabled();
} };
export const PermissionDenied: Story = { args: { canRead: false }, play: async ({ canvasElement }) => {
  const c = within(canvasElement); await expect(c.getByRole('alert')).toHaveTextContent(copy.forbidden);
  await expect(c.queryByRole('textbox')).not.toBeInTheDocument();
} };
export const FieldLimit: Story = { args: { value: { fields: Array.from({ length: 50 }, (_, index) => ({ ...choice, id: `custom-${index}`, type: 'short_text', options: [] })), contactRequired: false } }, play: async ({ canvasElement }) => {
  await expect(within(canvasElement).getByRole('button', { name: copy.add })).toBeDisabled();
} };
export const LongContent: Story = { args: { value: { fields: [{ ...choice, label: copy.stories.longLabel }], contactRequired: false } } };
export const Narrow: Story = { args: { value: { fields: [fields[0], choice], contactRequired: false } }, globals: { viewport: { value: 'phone', isRotated: false } } };
