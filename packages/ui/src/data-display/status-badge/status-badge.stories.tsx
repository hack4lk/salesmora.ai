import type { Meta, StoryObj } from '@storybook/react';
import { expect, within } from 'storybook/test';
import { StatusBadge, type StatusBadgeTone } from './status-badge';
import { statusBadgeData as data } from './status-badge.data';

const copy = data.stories;
const stages: { label: string; tone: StatusBadgeTone }[] = [
  { label: copy.new, tone: 'neutral' },
  { label: copy.contacted, tone: 'info' },
  { label: copy.estimateSent, tone: 'warning' },
  { label: copy.won, tone: 'success' },
  { label: copy.lost, tone: 'error' },
];
const sources = [copy.website, copy.referral, copy.phone, copy.gmail, copy.other];
const meta = { title: 'Data display/StatusBadge', component: StatusBadge, parameters: { layout: 'fullscreen' },
  args: { label: copy.new, tone: 'neutral', dot: true },
  decorators: [Story => <main className="min-h-screen bg-canvas p-6 sm:p-8"><h1 className="m-0 text-heading font-semibold text-ink">{copy.title}</h1><p className="mb-6 mt-3 text-muted">{copy.description}</p><div className="rounded-2xl border border-line bg-paper p-6"><Story/></div></main>],
} satisfies Meta<typeof StatusBadge>;
export default meta;
type Story = StoryObj<typeof meta>;
export const Default: Story = {};
export const New: Story = {};
export const Contacted: Story = { args: stages[1] };
export const EstimateSent: Story = { args: stages[2] };
export const Won: Story = { args: stages[3] };
export const Lost: Story = { args: stages[4] };
export const Website: Story = { args: { label: copy.website, dot: false } };
export const Referral: Story = { args: { label: copy.referral, dot: false } };
export const Phone: Story = { args: { label: copy.phone, dot: false } };
export const Gmail: Story = { args: { label: copy.gmail, dot: false } };
export const Other: Story = { args: { label: copy.other, dot: false } };
export const AllStages: Story = { render: () => <section aria-label={copy.stagesTitle}><h2 className="mb-4 mt-0 text-xl font-semibold">{copy.stagesTitle}</h2><div className="flex flex-wrap gap-3">{stages.map(stage => <StatusBadge key={stage.label} {...stage} dot/>)}</div></section>,
  play: async ({ canvasElement }) => {
    const c = within(canvasElement);
    for (const stage of stages) await expect(c.getByText(stage.label, { exact: true })).toBeVisible();
    await expect(c.queryByRole('button')).not.toBeInTheDocument();
  },
};
export const AllSources: Story = { render: () => <section aria-label={copy.sourcesTitle}><h2 className="mb-4 mt-0 text-xl font-semibold">{copy.sourcesTitle}</h2><div className="flex flex-wrap gap-3">{sources.map(label => <StatusBadge key={label} label={label}/>)}</div></section> };
export const InContext: Story = { render: () => <section aria-label={copy.contextTitle}><h2 className="m-0 text-xl font-semibold">{copy.name}</h2><p className="mb-6 mt-1 text-muted">{copy.service}</p><dl className="m-0 flex flex-wrap gap-6"><div><dt className="mb-2 text-sm text-muted">{copy.stageLabel}</dt><dd className="m-0"><StatusBadge {...stages[2]} dot/></dd></div><div><dt className="mb-2 text-sm text-muted">{copy.sourceLabel}</dt><dd className="m-0"><StatusBadge label={copy.referral}/></dd></div></dl></section> };
export const LongLabel: Story = { args: { label: copy.longLabel, tone: 'warning' } };
export const Narrow: Story = { ...AllStages, parameters: { viewport: { value: 'mobile1' } } };
