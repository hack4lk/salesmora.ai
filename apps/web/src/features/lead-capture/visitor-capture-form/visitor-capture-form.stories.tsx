import { useState } from 'react';
import type { Meta, StoryObj } from '@storybook/nextjs-vite';
import { expect, fireEvent, fn, userEvent, waitFor, within } from 'storybook/test';
import { VisitorCaptureForm, type VisitorCaptureFormProps, type VisitorCaptureResult } from './visitor-capture-form';
import { visitorCaptureFormData as copy } from './visitor-capture-form.data';
import type { VisitorCaptureDefinition, VisitorCaptureValues } from './visitor-capture-form.validation';
import { standardCaptureFieldTypes, type CaptureFormField, type CaptureStandardField } from '../capture-form-field-editor/capture-form-field-editor.validation';

const fields: CaptureFormField[] = (['name', 'email', 'phone', 'service', 'details', 'address'] as CaptureStandardField[]).map(key => ({ id: key, key, label: copy.stories.names[key], type: standardCaptureFieldTypes[key], required: key === 'name' || key === 'service', options: [] }));
const definition: VisitorCaptureDefinition = { id: 'public-form-preview', version: 1, businessName: copy.stories.business, title: copy.stories.title, intro: copy.stories.intro,
  fields, contactRequired: true, businessEmail: copy.stories.businessEmail, businessPhone: copy.stories.businessPhone, unavailableMessage: copy.stories.unavailable,
  privacy: { label: copy.stories.privacy, href: copy.stories.privacyHref } };
const empty: VisitorCaptureValues = { answers: {}, consent: false, website: '' };
const filled: VisitorCaptureValues = { ...empty, answers: { name: copy.stories.name, email: copy.stories.email, service: copy.stories.service } };
const consentDefinition: VisitorCaptureDefinition = { ...definition, consent: { id: 'request-contact', version: 1, label: copy.stories.consent, required: true } };
const custom: CaptureFormField[] = [
  { id: 'window', key: 'custom', type: 'dropdown', label: copy.stories.names.window, required: true, options: copy.stories.choices.map((label, index) => ({ id: `window-${index}`, label })) },
  { id: 'interests', key: 'custom', type: 'checkboxes', label: copy.stories.names.interests, required: true, options: copy.stories.interests.map((label, index) => ({ id: `interest-${index}`, label })) },
  { id: 'date', key: 'custom', type: 'date', label: copy.stories.names.date, required: true, options: [] },
];
function Preview(args: VisitorCaptureFormProps) {
  const [value, setValue] = useState(args.value);
  return <main className="min-h-screen bg-canvas p-4 sm:p-8"><VisitorCaptureForm {...args} value={value} onChange={next => { args.onChange(next); setValue(next); }} /></main>;
}
const meta = {
  title: 'Lead Capture/VisitorCaptureForm', component: VisitorCaptureForm, parameters: { layout: 'fullscreen' }, render: args => <Preview {...args} />,
  args: { definition, value: empty, availability: 'active', onChange: fn(), onSubmit: fn<VisitorCaptureFormProps['onSubmit']>(async () => ({ ok: true })) },
} satisfies Meta<typeof VisitorCaptureForm>;
export default meta;
type Story = StoryObj<typeof meta>;
export const Default: Story = {};
export const DeliveryUnavailable: Story = { args: { submissionAvailable: false, value: filled }, play: async ({ canvasElement, args }) => { const c = within(canvasElement); await expect(c.getByText(copy.deliveryUnavailable)).toBeVisible(); fireEvent.submit(c.getByRole('button', { name: copy.submit }).closest('form')!); await expect(args.onSubmit).not.toHaveBeenCalled(); await expect(c.getByRole('button', { name: copy.submit })).toBeDisabled(); } };
export const PhoneOnly: Story = { args: { value: { ...filled, answers: { name: copy.stories.name, phone: copy.stories.phone, service: copy.stories.service } } }, play: async ({ canvasElement, args }) => {
  await userEvent.click(within(canvasElement).getByRole('button', { name: copy.submit }));
  await expect(args.onSubmit).toHaveBeenCalledTimes(1);
} };
export const SuccessfulSubmit: Story = { args: { value: filled }, play: async ({ canvasElement, args }) => {
  const c = within(canvasElement);
  await userEvent.click(c.getByRole('button', { name: copy.submit }));
  await expect(args.onSubmit).toHaveBeenCalledWith(expect.objectContaining({ definitionId: definition.id, definitionVersion: 1, answers: expect.objectContaining(filled.answers), consent: null, website: '', idempotencyKey: expect.any(String) }));
  await expect(await c.findByRole('status')).toHaveTextContent(copy.thanks);
  await expect(c.queryByRole('button')).not.toBeInTheDocument();
  await waitFor(async () => { await expect(c.getByRole('status').parentElement).toHaveFocus(); });
} };
export const Submitting: Story = { args: { value: filled, onSubmit: fn<VisitorCaptureFormProps['onSubmit']>(() => new Promise<VisitorCaptureResult>(() => {})) }, play: async ({ canvasElement, args }) => {
  const c = within(canvasElement);
  await userEvent.click(c.getByRole('button', { name: copy.submit }));
  await expect(c.getByRole('button', { name: copy.pending })).toBeDisabled();
  for (const input of c.getAllByRole('textbox')) await expect(input).toBeDisabled();
  fireEvent.submit(c.getByRole('button', { name: copy.pending }).closest('form')!);
  await expect(args.onSubmit).toHaveBeenCalledTimes(1);
  await expect(c.queryByText(copy.received)).not.toBeInTheDocument();
} };
export const NetworkError: Story = { args: { value: filled, onSubmit: fn<VisitorCaptureFormProps['onSubmit']>(async () => { throw new Error('preview'); }) }, play: async ({ canvasElement }) => {
  const c = within(canvasElement);
  await userEvent.click(c.getByRole('button', { name: copy.submit }));
  await expect(await c.findByRole('alert')).toHaveTextContent(copy.uncertain);
  await expect(c.getByRole('textbox', { name: copy.stories.names.name })).toHaveValue(copy.stories.name);
} };
export const ServerFieldError: Story = { args: { value: filled, onSubmit: fn<VisitorCaptureFormProps['onSubmit']>(async () => ({ ok: false, fieldErrors: { service: copy.stories.fieldError } })) }, play: async ({ canvasElement }) => {
  const c = within(canvasElement);
  await userEvent.click(c.getByRole('button', { name: copy.submit }));
  await expect(await c.findByText(copy.stories.fieldError)).toBeVisible();
  await expect(c.getByRole('textbox', { name: copy.stories.names.service })).toHaveFocus();
} };
export const RetrySameRequest: Story = { args: { value: filled }, play: async ({ canvasElement, args }) => {
  const c = within(canvasElement);
  args.onSubmit.mockResolvedValueOnce({ ok: false });
  await userEvent.click(c.getByRole('button', { name: copy.submit }));
  await expect(await c.findByRole('alert')).toBeVisible();
  await userEvent.click(c.getByRole('button', { name: copy.submit }));
  await expect(args.onSubmit).toHaveBeenCalledTimes(2);
  await expect(args.onSubmit.mock.calls[0][0].idempotencyKey).toBe(args.onSubmit.mock.calls[1][0].idempotencyKey);
} };
export const RequiredFields: Story = { play: async ({ canvasElement, args }) => {
  const c = within(canvasElement);
  await userEvent.click(c.getByRole('button', { name: copy.submit }));
  await expect(args.onSubmit).not.toHaveBeenCalled();
  await expect(c.getByRole('textbox', { name: copy.stories.names.name })).toHaveFocus();
  await expect(c.getAllByText(copy.contact)).toHaveLength(2);
} };
export const InvalidEmail: Story = { args: { value: { ...filled, answers: { ...filled.answers, email: copy.stories.invalidEmail } } }, play: async ({ canvasElement, args }) => {
  const c = within(canvasElement);
  await userEvent.click(c.getByRole('button', { name: copy.submit }));
  await expect(c.getByText(copy.email)).toBeVisible(); await expect(args.onSubmit).not.toHaveBeenCalled();
} };
export const AllFieldTypes: Story = { args: { definition: { ...definition, fields: [...fields, ...custom] } } };
export const CustomFieldSubmission: Story = { args: { definition: { ...definition, fields: [...fields, ...custom] }, value: filled }, play: async ({ canvasElement, args }) => {
  const c = within(canvasElement);
  await userEvent.selectOptions(c.getByRole('combobox', { name: copy.stories.names.window }), 'window-0');
  await userEvent.click(c.getByRole('checkbox', { name: copy.stories.interests[0] }));
  await userEvent.type(c.getByLabelText(new RegExp(copy.stories.names.date)), '2026-11-02');
  await userEvent.click(c.getByRole('button', { name: copy.submit }));
  await expect(args.onSubmit).toHaveBeenCalledWith(expect.objectContaining({ answers: expect.objectContaining({ window: 'window-0', interests: ['interest-0'], date: '2026-11-02' }) }));
} };
export const PrivacyAndConsent: Story = { args: { definition: consentDefinition }, play: async ({ canvasElement }) => {
  const c = within(canvasElement), link = c.getByRole('link', { name: copy.stories.privacy });
  await expect(link).toHaveAttribute('href', copy.stories.privacyHref);
  await expect(link).toHaveAttribute('rel', 'noopener noreferrer');
} };
export const ConsentRequired: Story = { args: { definition: consentDefinition, value: filled }, play: async ({ canvasElement, args }) => {
  const c = within(canvasElement);
  await userEvent.click(c.getByRole('button', { name: copy.submit }));
  await expect(c.getByText(copy.consent)).toBeVisible(); await expect(args.onSubmit).not.toHaveBeenCalled();
  await userEvent.click(c.getByRole('checkbox', { name: copy.stories.consent }));
  await userEvent.click(c.getByRole('button', { name: copy.submit }));
  await expect(args.onSubmit).toHaveBeenCalledWith(expect.objectContaining({ consent: { id: 'request-contact', version: 1, accepted: true } }));
} };
export const Paused: Story = { args: { availability: 'paused' }, play: async ({ canvasElement }) => {
  const c = within(canvasElement);
  await expect(c.getByRole('status')).toHaveTextContent(copy.stories.unavailable);
  await expect(c.getByText(copy.stories.businessPhone)).toBeVisible();
  await expect(c.queryByRole('button')).not.toBeInTheDocument();
} };
export const ServerUnavailable: Story = { args: { value: filled, onSubmit: fn<VisitorCaptureFormProps['onSubmit']>(async () => ({ ok: false, unavailable: true })) }, play: async ({ canvasElement }) => {
  const c = within(canvasElement);
  await userEvent.click(c.getByRole('button', { name: copy.submit }));
  await expect(await c.findByRole('status')).toHaveTextContent(copy.stories.unavailable);
  await expect(c.queryByRole('button')).not.toBeInTheDocument();
} };
export const InvalidConfiguration: Story = { args: { definition: { ...definition, privacy: { label: copy.stories.privacy, href: 'javascript:alert(1)' } } }, play: async ({ canvasElement }) => {
  const c = within(canvasElement);
  await expect(c.queryByRole('link')).not.toBeInTheDocument(); await expect(c.queryByRole('button')).not.toBeInTheDocument();
} };
export const LongCopy: Story = { args: { definition: { ...definition, title: copy.stories.longTitle } } };
export const Narrow: Story = { args: { definition: { ...consentDefinition, fields: [...fields, ...custom] } }, globals: { viewport: { value: 'phone', isRotated: false } } };

/** Explicit simulation of a host-mounted challenge. No provider script, token or network call is used. */
function SecurityPreview(args: VisitorCaptureFormProps) {
  const [protection, setProtection] = useState(args.protection), [value, setValue] = useState(args.value);
  return <main className="min-h-screen bg-canvas p-4 sm:p-8"><p className="mx-auto mb-5 max-w-2xl text-sm leading-6 text-muted">{copy.stories.challengeNotice}</p><VisitorCaptureForm {...args} protection={protection} value={value} onChange={next => { args.onChange(next); setValue(next); }}
    onSubmit={async request => { try { return await args.onSubmit(request); } catch (error) { setProtection({ kind: 'challenge', status: 'expired' }); throw error; } }}
    onRetryChallenge={() => { args.onRetryChallenge?.(); setProtection({ kind: 'challenge', status: 'required' }); }}
    challengeContent={protection?.kind === 'challenge' && protection.status === 'required' ? <button type="button" className="min-h-11 max-w-full rounded-xl border border-line bg-paper px-4 py-2 text-sm font-semibold text-primary wrap-anywhere focus-visible:focus-ring" onClick={() => setProtection({ kind: 'challenge', status: 'verified', token: 'fictional-preview-token' })}>{copy.stories.challengeComplete}</button> : undefined} /></main>;
}
export const ChallengeRequired: Story = { render: args => <SecurityPreview {...args} />, args: { value: filled, protection: { kind: 'challenge', status: 'required' } }, play: async ({ canvasElement, args }) => {
  const c = within(canvasElement); await expect(c.getByRole('button', { name: copy.submit })).toBeDisabled();
  fireEvent.submit(c.getByRole('button', { name: copy.submit }).closest('form')!); await expect(args.onSubmit).not.toHaveBeenCalled();
  await expect(c.getByRole('textbox', { name: copy.stories.names.name })).toHaveValue(copy.stories.name);
} };
export const ChallengeThenSubmit: Story = { ...ChallengeRequired, play: async ({ canvasElement, args }) => {
  const c = within(canvasElement); await userEvent.click(c.getByRole('button', { name: copy.stories.challengeComplete })); await expect(c.getByText(copy.challengeVerified)).toBeVisible();
  await userEvent.click(c.getByRole('button', { name: copy.submit })); await expect(args.onSubmit).toHaveBeenCalledWith(expect.objectContaining({ challengeToken: 'fictional-preview-token', answers: expect.objectContaining(filled.answers) })); await expect(c.getByText(copy.received)).toBeVisible();
} };
export const ChallengeVerifying: Story = { args: { value: filled, protection: { kind: 'challenge', status: 'verifying' } } };
export const ChallengeExpired: Story = { render: args => <SecurityPreview {...args} />, args: { value: filled, protection: { kind: 'challenge', status: 'expired' }, onRetryChallenge: fn() }, play: async ({ canvasElement, args }) => {
  const c = within(canvasElement); await expect(c.getByRole('button', { name: copy.submit })).toBeDisabled(); await expect(c.getByRole('alert')).toHaveTextContent(copy.challengeExpired);
  await userEvent.click(c.getByRole('button', { name: copy.retryChallenge })); await expect(args.onRetryChallenge).toHaveBeenCalledOnce(); await expect(c.getByText(copy.challengeRequired)).toBeVisible(); await expect(c.getByRole('textbox', { name: copy.stories.names.name })).toHaveValue(copy.stories.name);
} };
export const ChallengeError: Story = { ...ChallengeExpired, args: { value: filled, protection: { kind: 'challenge', status: 'error' }, onRetryChallenge: fn() }, play: async ({ canvasElement }) => { const c = within(canvasElement); await expect(c.getByRole('alert')).toHaveTextContent(copy.challengeError); await expect(c.getByRole('button', { name: copy.submit })).toBeDisabled(); } };
export const MissingChallengeToken: Story = { args: { value: filled, protection: { kind: 'challenge', status: 'verified', token: '' } }, play: async ({ canvasElement, args }) => { const c = within(canvasElement); await expect(c.getByRole('button', { name: copy.submit })).toBeDisabled(); fireEvent.submit(c.getByRole('button', { name: copy.submit }).closest('form')!); await expect(args.onSubmit).not.toHaveBeenCalled(); } };
export const RateLimited: Story = { args: { value: filled, protection: { kind: 'rate-limited', retryAt: '2099-01-01T00:00:00Z' } }, play: async ({ canvasElement, args }) => {
  const c = within(canvasElement); await expect(c.getByText(copy.rateLimited)).toBeVisible(); await expect(c.getByRole('button', { name: copy.submit })).toBeDisabled(); fireEvent.submit(c.getByRole('button', { name: copy.submit }).closest('form')!); await expect(args.onSubmit).not.toHaveBeenCalled();
} };
export const RateLimitElapsed: Story = { args: { value: filled, protection: { kind: 'rate-limited', retryAt: '2026-01-01T00:00:00Z' } }, play: async ({ canvasElement }) => { const c = within(canvasElement); await expect(c.getByText(copy.rateReady)).toBeVisible(); await expect(c.getByRole('button', { name: copy.submit })).toBeEnabled(); } };
export const UncertainResponseAndRetry: Story = { args: { value: filled }, play: async ({ canvasElement, args }) => {
  const c = within(canvasElement); args.onSubmit.mockRejectedValueOnce(new Error('Lost response')); await userEvent.click(c.getByRole('button', { name: copy.submit }));
  await expect(await c.findByRole('alert')).toHaveTextContent(copy.uncertain); await expect(c.getByRole('textbox', { name: copy.stories.names.name })).toBeDisabled(); await expect(c.queryByText(copy.received)).not.toBeInTheDocument();
  await userEvent.click(c.getByRole('button', { name: copy.retryRequest })); await expect(args.onSubmit).toHaveBeenCalledTimes(2); await expect(args.onSubmit.mock.calls[0][0]).toEqual(args.onSubmit.mock.calls[1][0]); await expect(c.getByText(copy.received)).toBeVisible();
} };
export const ChallengeRefreshKeepsRequest: Story = { render: args => <SecurityPreview {...args} />, args: { value: filled, protection: { kind: 'challenge', status: 'verified', token: 'first-preview-token' }, onRetryChallenge: fn() }, play: async ({ canvasElement, args }) => {
  const c = within(canvasElement); args.onSubmit.mockRejectedValueOnce(new Error('Lost response')); await userEvent.click(c.getByRole('button', { name: copy.submit }));
  await expect(await c.findByText(copy.uncertain)).toBeVisible(); await expect(c.getByRole('button', { name: copy.retryRequest })).toBeDisabled();
  await userEvent.click(c.getByRole('button', { name: copy.retryChallenge })); await userEvent.click(c.getByRole('button', { name: copy.stories.challengeComplete })); await userEvent.click(c.getByRole('button', { name: copy.retryRequest }));
  const first = args.onSubmit.mock.calls[0][0], second = args.onSubmit.mock.calls[1][0]; await expect(first.idempotencyKey).toBe(second.idempotencyKey); await expect(first.answers).toEqual(second.answers);
  await expect(first.challengeToken).toBe('first-preview-token'); await expect(second.challengeToken).toBe('fictional-preview-token'); await expect(c.getByText(copy.received)).toBeVisible();
} };
