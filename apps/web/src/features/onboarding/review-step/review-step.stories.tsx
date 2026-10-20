import type { Meta, StoryObj } from '@storybook/nextjs-vite';
import { expect, fn, userEvent, within } from 'storybook/test';
import { ReviewStep, type ReviewStepProps } from './review-step';
import { reviewStepData as copy } from './review-step.data';
import { SessionOwnerPreview } from '../team-step/session-owner-preview';
import { ServicesTeamPreview } from '../services-area-step/services-team-preview';
import { businessProfileStepData as businessCopy } from '../business-profile-step/business-profile-step.data';
import { servicesAreaStepData as servicesCopy } from '../services-area-step/services-area-step.data';
import { teamStepData as teamCopy } from '../team-step/team-step.data';
import { onboardingStepFrameData as frame } from '../onboarding-step-frame/onboarding-step-frame.data';
const draft: Pick<ReviewStepProps, 'business' | 'services' | 'team' | 'ownerEmail'> = {
  business: { businessName: businessCopy.stories.name, businessType: 'plumbing' },
  services: { services: ['repairs', 'drain-cleaning'], postalCode: servicesCopy.stories.postal, serviceRange: '25-miles' },
  ownerEmail: teamCopy.stories.owner,
  team: { invitations: [{ id: 'alex', email: teamCopy.stories.email, role: 'office' }, { id: 'jordan', email: teamCopy.stories.second, role: 'admin' }] },
};
const meta = {
  title: 'Onboarding/ReviewStep', component: ReviewStep,
  args: { ...draft, onEdit: fn(), onBack: fn(), onCreate: fn() },
  parameters: { layout: 'fullscreen' },
  decorators: [(Story) => <main className="mx-auto grid w-full max-w-2xl gap-6 p-4 sm:p-8"><header><h1 className="m-0 text-heading font-semibold text-ink">{copy.stories.title}</h1><p className="mb-0 mt-2 text-sm leading-6 text-muted">{copy.stories.notice}</p><a href={copy.stories.appHref} target="_blank" rel="noreferrer" className="mt-2 inline-flex min-h-11 items-center rounded-lg text-sm font-semibold text-primary underline focus-visible:focus-ring">{copy.stories.appLink}</a></header><Story /></main>],
} satisfies Meta<typeof ReviewStep>;
export default meta;
type Story = StoryObj<typeof meta>;
export const Default: Story = { render: args => <SessionOwnerPreview>{ownerEmail => <ServicesTeamPreview values={args.services} onChange={() => {}} onContinue={() => {}} onBack={args.onBack} ownerEmail={ownerEmail} initialStep="review" businessArgs={{ values: args.business, onChange: () => {}, onContinue: () => {} }} teamArgs={{ ownerEmail, values: args.team, onChange: () => {}, onContinue: () => {}, onBack: () => {}, onSkip: () => {} }} />}</SessionOwnerPreview> };
export const Filled: Story = { play: async ({ canvasElement }) => {
  const c = within(canvasElement);
  await expect(c.getByText(draft.business.businessName)).toBeVisible();
  await expect(c.getByText('Plumbing', { exact: true })).toBeVisible();
  await expect(c.getByRole('list', { name: copy.services })).toHaveTextContent('Drain cleaning');
  await expect(c.getByText('Within 25 miles')).toBeVisible();
  await expect(c.getByText(draft.ownerEmail)).toBeVisible();
  await expect(c.getByRole('list', { name: copy.invitations })).toHaveTextContent(teamCopy.stories.second);
  await expect(c.getByText(copy.delivery)).toBeVisible();
} };
export const SoloAndOptionalArea: Story = { args: { team: { invitations: [] }, services: { ...draft.services, postalCode: '', serviceRange: '' } }, play: async ({ canvasElement, args }) => {
  const c = within(canvasElement);
  await expect(c.getByText(copy.noInvitations)).toBeVisible();
  await expect(c.getAllByText(copy.notProvided)).toHaveLength(2);
  await userEvent.click(c.getByRole('button', { name: frame.create }));
  await expect(args.onCreate).toHaveBeenCalledTimes(1);
} };
export const EditAndBack: Story = { play: async ({ canvasElement, args }) => {
  const c = within(canvasElement);
  for (const section of ['business', 'services', 'team'] as const) {
    await userEvent.click(c.getByRole('button', { name: copy.edit[section] }));
    await expect(args.onEdit).toHaveBeenLastCalledWith(section);
  }
  await userEvent.click(c.getByRole('button', { name: frame.back }));
  await expect(args.onBack).toHaveBeenCalledTimes(1);
  await expect(args.onCreate).not.toHaveBeenCalled();
} };
export const ExplicitCreate: Story = { play: async ({ canvasElement, args }) => {
  await expect(args.onCreate).not.toHaveBeenCalled();
  await userEvent.click(within(canvasElement).getByRole('button', { name: frame.create }));
  await expect(args.onCreate).toHaveBeenCalledTimes(1);
} };
export const IncompleteBusiness: Story = { args: { business: { businessName: '', businessType: '' } }, play: async ({ canvasElement, args }) => {
  const c = within(canvasElement);
  await userEvent.click(c.getByRole('button', { name: frame.create }));
  await expect(c.getByRole('alert')).toHaveTextContent(copy.incomplete);
  await expect(c.getByRole('button', { name: copy.edit.business })).toHaveFocus();
  await expect(args.onCreate).not.toHaveBeenCalled();
} };
export const IncompleteServices: Story = { args: { services: { ...draft.services, services: [] } }, play: async ({ canvasElement, args }) => {
  const c = within(canvasElement);
  await userEvent.click(c.getByRole('button', { name: frame.create }));
  await expect(c.getByRole('button', { name: copy.edit.services })).toHaveFocus();
  await expect(args.onCreate).not.toHaveBeenCalled();
} };
export const InvalidInvitation: Story = { args: { team: { invitations: [{ ...draft.team.invitations[0], email: draft.ownerEmail }] } }, play: async ({ canvasElement, args }) => {
  const c = within(canvasElement);
  await userEvent.click(c.getByRole('button', { name: frame.create }));
  await expect(c.getByRole('button', { name: copy.edit.team })).toHaveFocus();
  await expect(args.onCreate).not.toHaveBeenCalled();
} };
export const Pending: Story = { args: { pending: true }, play: async ({ canvasElement, args }) => {
  const c = within(canvasElement);
  for (const button of c.getAllByRole('button')) await expect(button).toBeDisabled();
  await expect(c.getByRole('form')).toHaveAttribute('aria-busy', 'true');
  await expect(args.onCreate).not.toHaveBeenCalled();
} };
export const CreateError: Story = { args: { error: copy.stories.failure }, play: async ({ canvasElement, args }) => {
  const c = within(canvasElement);
  await expect(c.getByRole('alert')).toHaveTextContent(copy.stories.failure);
  await expect(c.getByText(draft.business.businessName)).toBeVisible();
  await userEvent.click(c.getByRole('button', { name: frame.create }));
  await expect(args.onCreate).toHaveBeenCalledTimes(1);
} };
function FlowPreview() {
  return <ServicesTeamPreview values={draft.services} onChange={() => {}} onContinue={() => {}} onBack={() => {}} ownerEmail={draft.ownerEmail} initialStep="team" teamArgs={{ ownerEmail: draft.ownerEmail, values: draft.team, onChange: () => {}, onContinue: () => {}, onBack: () => {}, onSkip: () => {} }} />;
}
export const EditRoundTrip: Story = { render: () => <FlowPreview />, play: async ({ canvasElement }) => {
  const c = within(canvasElement);
  await userEvent.click(c.getByRole('button', { name: frame.continue }));
  await expect(c.getByRole('heading', { name: frame.steps.review.title })).toHaveFocus();
  await userEvent.click(c.getByRole('button', { name: copy.edit.business }));
  await userEvent.clear(c.getByRole('textbox'));
  await userEvent.type(c.getByRole('textbox'), copy.stories.longName);
  await userEvent.click(c.getByRole('button', { name: frame.continue }));
  await expect(c.getByText(copy.stories.longName)).toBeVisible();
  await userEvent.click(c.getByRole('button', { name: copy.edit.services }));
  await userEvent.clear(c.getByRole('textbox'));
  await userEvent.type(c.getByRole('textbox'), copy.stories.longPostal);
  await userEvent.click(c.getByRole('button', { name: frame.continue }));
  await expect(c.getByText(copy.stories.longPostal)).toBeVisible();
  await userEvent.click(c.getByRole('button', { name: copy.edit.team }));
  await expect(c.getAllByRole('textbox')[0]).toHaveValue(teamCopy.stories.email);
  await userEvent.selectOptions(c.getAllByRole('combobox', { name: teamCopy.role })[0], 'admin');
  await userEvent.click(c.getByRole('button', { name: frame.continue }));
  await expect(c.getByText(copy.stories.longName)).toBeVisible();
  await expect(c.getByText(copy.stories.longPostal)).toBeVisible();
  await expect(c.getByRole('list', { name: copy.invitations })).toHaveTextContent(teamCopy.stories.email);
  await userEvent.click(c.getByRole('button', { name: frame.create }));
  await expect(c.getByRole('status')).toHaveTextContent(copy.stories.complete);
} };
export const SkipPreservesDraft: Story = { render: () => <FlowPreview />, play: async ({ canvasElement }) => {
  const c = within(canvasElement);
  await userEvent.click(c.getByRole('button', { name: frame.skipTeam }));
  await expect(c.getByText(copy.noInvitations)).toBeVisible();
  await expect(c.queryByRole('list', { name: copy.invitations })).not.toBeInTheDocument();
  await userEvent.click(c.getByRole('button', { name: frame.back }));
  await expect(c.getAllByRole('textbox')[0]).toHaveValue(teamCopy.stories.email);
  await userEvent.click(c.getByRole('button', { name: frame.continue }));
  await expect(c.getByRole('list', { name: copy.invitations })).toHaveTextContent(teamCopy.stories.email);
} };
export const Mobile: Story = { args: { business: { ...draft.business, businessName: copy.stories.longName }, services: { ...draft.services, services: ['water-heater-installation', 'air-conditioning-installation', 'gutter-installation-cleaning'] } }, globals: { viewport: { value: 'phone', isRotated: false } } };
