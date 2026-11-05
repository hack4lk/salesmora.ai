import { useRef, useState } from 'react';
import type { Meta, StoryObj } from '@storybook/nextjs-vite';
import { expect, fn, userEvent, within } from 'storybook/test';
import { WebsiteCaptureBrief, type WebsiteCaptureBriefProps, type WebsiteFieldSuggestion } from './website-capture-brief';
import { websiteCaptureBriefData as copy } from './website-capture-brief.data';

const fields: WebsiteFieldSuggestion['fields'] = [
  { id: 'name', label: copy.stories.names.name, type: 'short_text', requirement: 'required', reason: copy.stories.reasons.name },
  { id: 'email', label: copy.stories.names.email, type: 'email', requirement: 'contact', reason: copy.stories.reasons.email },
  { id: 'phone', label: copy.stories.names.phone, type: 'phone', requirement: 'contact', reason: copy.stories.reasons.phone },
  { id: 'service', label: copy.stories.names.service, type: 'short_text', requirement: 'required', reason: copy.stories.reasons.service },
  { id: 'details', label: copy.stories.names.details, type: 'long_text', requirement: 'optional', reason: copy.stories.reasons.details },
  { id: 'address', label: copy.stories.names.address, type: 'address', requirement: 'optional', reason: copy.stories.reasons.address },
];
const suggestion: WebsiteFieldSuggestion = { id: 'preview-initial', brief: copy.stories.brief, fields };
function Preview(args: WebsiteCaptureBriefProps) {
  const [brief, setBrief] = useState(args.brief);
  const [proposed, setProposed] = useState(args.suggestion);
  const [accepted, setAccepted] = useState(args.acceptedSuggestionId);
  const sequence = useRef(0);
  return <main className="min-h-screen bg-canvas p-4 text-ink sm:p-8"><h1 className="m-0 text-heading font-semibold">{copy.stories.title}</h1><p className="mb-6 mt-2 text-sm text-muted">{copy.stories.description}</p>
    <WebsiteCaptureBrief {...args} brief={brief} suggestion={proposed} acceptedSuggestionId={accepted}
      onBriefChange={value => { args.onBriefChange(value); setBrief(value); }}
      onSuggest={value => { args.onSuggest(value); setProposed({ id: `preview-${++sequence.current}`, brief: value, fields }); }}
      onUseFields={value => { args.onUseFields(value); setAccepted(value.id); }} />
  </main>;
}
const meta = {
  title: 'Lead Capture/WebsiteCaptureBrief', component: WebsiteCaptureBrief, parameters: { layout: 'fullscreen' }, render: args => <Preview {...args} />,
  args: { brief: copy.stories.brief, context: { businessName: copy.stories.business, services: copy.stories.services, serviceArea: copy.stories.area }, suggestion, canRead: true, canEdit: true, onBriefChange: fn(), onSuggest: fn(), onUseFields: fn() },
} satisfies Meta<typeof WebsiteCaptureBrief>;
export default meta;
type Story = StoryObj<typeof meta>;
export const Default: Story = {};
export const Empty: Story = { args: { brief: '', suggestion: undefined }, play: async ({ canvasElement }) => {
  await expect(within(canvasElement).getByRole('button', { name: copy.suggest })).toBeDisabled();
} };
export const SuggestFields: Story = { args: { suggestion: undefined }, play: async ({ canvasElement, args }) => {
  const c = within(canvasElement);
  await userEvent.click(c.getByRole('button', { name: copy.suggest }));
  await expect(args.onSuggest).toHaveBeenCalledWith(copy.stories.brief);
  await expect(c.getByRole('heading', { name: copy.stories.names.name })).toBeVisible();
  await expect(args.onUseFields).not.toHaveBeenCalled();
} };
export const AcceptFields: Story = { play: async ({ canvasElement, args }) => {
  const c = within(canvasElement);
  await userEvent.click(c.getByRole('button', { name: copy.use }));
  await expect(args.onUseFields).toHaveBeenCalledWith(suggestion);
  await expect(c.getByRole('button', { name: copy.selected })).toBeDisabled();
  await expect(c.getByRole('status')).toHaveTextContent(copy.accepted);
} };
export const StaleSuggestions: Story = { play: async ({ canvasElement, args }) => {
  const c = within(canvasElement), input = c.getByRole('textbox');
  await userEvent.clear(input); await userEvent.type(input, copy.stories.revised);
  await expect(args.onBriefChange).toHaveBeenLastCalledWith(copy.stories.revised);
  await expect(c.getByRole('button', { name: copy.use })).toBeDisabled();
  await expect(c.getByRole('status')).toHaveTextContent(copy.stale);
  await userEvent.click(c.getByRole('button', { name: copy.suggest }));
  await expect(c.getByRole('button', { name: copy.use })).toBeEnabled();
} };
export const Accepted: Story = { args: { acceptedSuggestionId: suggestion.id } };
export const Pending: Story = { args: { pending: true }, play: async ({ canvasElement, args }) => {
  const c = within(canvasElement);
  await expect(c.getByRole('textbox')).toBeDisabled();
  for (const button of c.getAllByRole('button')) await expect(button).toBeDisabled();
  await userEvent.click(c.getByRole('button', { name: copy.use }));
  await expect(args.onUseFields).not.toHaveBeenCalled();
} };
export const Error: Story = { args: { error: copy.stories.error }, play: async ({ canvasElement }) => {
  const c = within(canvasElement);
  await expect(c.getByRole('alert')).toHaveTextContent(copy.stories.error);
  await expect(c.getByRole('textbox')).toHaveValue(copy.stories.brief);
  await expect(c.getByRole('button', { name: copy.use })).toBeDisabled();
  await expect(c.getByRole('button', { name: copy.suggest })).toBeEnabled();
} };
export const ReadOnly: Story = { args: { canEdit: false }, play: async ({ canvasElement }) => {
  const c = within(canvasElement);
  await expect(c.getByRole('textbox')).toBeDisabled();
  await expect(c.queryByRole('button')).not.toBeInTheDocument();
} };
export const PermissionDenied: Story = { args: { canRead: false }, play: async ({ canvasElement }) => {
  const c = within(canvasElement);
  await expect(c.getByRole('alert')).toHaveTextContent(copy.forbidden);
  await expect(c.queryByRole('textbox')).not.toBeInTheDocument();
  await expect(c.queryByText(copy.stories.business)).not.toBeInTheDocument();
} };
export const NoBusinessContext: Story = { args: { context: undefined } };
export const ValidationError: Story = { args: { brief: '', suggestion: undefined, briefError: copy.stories.briefError } };
export const LongContent: Story = { args: { context: { businessName: copy.stories.longBusiness, services: copy.stories.services, serviceArea: copy.stories.longArea } } };
export const Narrow: Story = { globals: { viewport: { value: 'phone', isRotated: false } } };

export const SuggestionsUnavailable: Story = { args: { canSuggest: false }, play: async ({ canvasElement, args }) => { const c = within(canvasElement); await expect(c.getByRole('button', { name: copy.suggest })).toBeDisabled(); await expect(args.onSuggest).not.toHaveBeenCalled(); } };
