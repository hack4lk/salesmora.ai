import type { Meta, StoryObj } from '@storybook/nextjs-vite';
import { expect, fn, userEvent, within } from 'storybook/test';
import { ReportResult } from './report-result';
import { reportResultData as copy } from './report-result.data';
import { reportAssistantExamples as examples } from './report-result.fixtures';

const meta = {
  title: 'Assistant/ReportResult', component: ReportResult, tags: ['autodocs'],
  parameters: { layout: 'fullscreen', docs: { description: { component: 'Canonical read-only report-result presentation. ConnectedReportResult and ConnectedReportConversation stories exercise this same card through the real assistant with mocked protected APIs. No model or live workspace reads occur in stories.' } } },
  args: { result: examples.overview.result, onOpenReport: fn() },
  decorators: [Story => <div className="mx-auto w-full max-w-2xl p-4 sm:p-8"><Story /></div>],
} satisfies Meta<typeof ReportResult>;
export default meta;
type Story = StoryObj<typeof meta>;

export const Default: Story = { play: async ({ canvasElement, args }) => {
  const c = within(canvasElement);
  expect(c.getByRole('group', { name: 'Selected-period results' })).toHaveTextContent('12');
  expect(c.getByRole('group', { name: 'Current operations' })).toHaveTextContent('Current snapshot');
  expect(c.getAllByText(/Retrieved:/)).toHaveLength(2);
  const open = c.getByRole('button', { name: copy.open });
  open.focus(); await userEvent.keyboard('{Enter}');
  expect(args.onOpenReport).toHaveBeenCalledWith(examples.overview.result.id);
} };
export const CurrentAssignedScope: Story = { args: { result: examples.jobs.result }, play: async ({ canvasElement }) => {
  const c = within(canvasElement);
  expect(c.getByText(copy.current)).toBeVisible();
  expect(c.getByText('Assigned to me / authorized Job scope')).toBeVisible();
  expect(c.queryByText(/Selected period:/)).not.toBeInTheDocument();
} };
export const MissingMoneyAndPartialCoverage: Story = {
  args: { result: { ...examples.financial.result,
    sections: [{ ...examples.financial.result.sections[0]!, metrics: [
      { id: 'amount', label: 'Accepted pre-tax value', value: { kind: 'unavailable', reason: 'Current estimate-price access does not permit this amount.' } },
    ] }, { id: 'costs', label: 'Current recorded material costs', scopeLabel: 'Authorized workspace Work Order cost scope',
      basisLabel: 'Current snapshot / non-archived issued and in-progress Work Orders',
      asOf: '2026-11-09T15:00:01.000Z', metrics: [
      { id: 'cost', label: 'Known recorded material costs', value: { kind: 'incomplete', displayValue: '$140.00', coverageLabel: '2 of 3 lines have recorded costs; missing costs are not zero.' } },
    ] }], coverage: ['Amounts can be unavailable or incomplete independently. Missing costs are not treated as zero.'] } },
  play: async ({ canvasElement }) => {
    const c = within(canvasElement);
    expect(c.getByText('Unavailable')).toBeVisible();
    expect(c.getByText(/missing costs are not zero/)).toBeVisible();
    expect(c.queryByText('$12,000.00')).not.toBeInTheDocument();
  },
};
export const Empty: Story = { args: { result: { ...examples.leads.result,
  sections: [{ ...examples.leads.result.sections[0]!, metrics: [{ id: 'intake', label: 'Leads created', value: { kind: 'count', value: 0 } }] }],
  coverage: ['No authorized Leads were created in the selected period. This does not imply a permission denial.'] } },
  play: async ({ canvasElement }) => { expect(within(canvasElement).getByText('0')).toBeVisible(); },
};
export const Loading: Story = { args: { state: 'loading' }, play: async ({ canvasElement }) => {
  const c = within(canvasElement);
  expect(c.getByRole('status')).toHaveTextContent(copy.states.loading);
  expect(c.queryByText('12')).not.toBeInTheDocument();
  expect(c.queryByRole('button')).not.toBeInTheDocument();
} };
export const AccessChanged: Story = { args: { state: 'unavailable' }, play: async ({ canvasElement }) => {
  const c = within(canvasElement);
  expect(c.getByRole('status')).toHaveTextContent(copy.states.unavailable);
  expect(c.queryByText('12')).not.toBeInTheDocument();
  expect(c.queryByRole('button')).not.toBeInTheDocument();
} };
export const ReadError: Story = { args: { state: 'error' }, play: async ({ canvasElement }) => {
  const c = within(canvasElement);
  expect(c.getByRole('status')).toHaveTextContent(copy.states.error);
  expect(c.queryByRole('button')).not.toBeInTheDocument();
} };
export const StaleHistory: Story = { ...AccessChanged, args: { state: 'stale' }, play: async ({ canvasElement }) => {
  const c = within(canvasElement);
  expect(c.getByRole('status')).toHaveTextContent(copy.states.stale);
  expect(c.queryByText('12')).not.toBeInTheDocument();
  expect(c.queryByRole('button')).not.toBeInTheDocument();
} };
export const InvalidResult: Story = { args: { result: { ...examples.overview.result, timezone: 'Invalid/Timezone' } },
  play: async ({ canvasElement }) => {
    const c = within(canvasElement);
    expect(c.getByRole('status')).toHaveTextContent(copy.states.error);
    expect(c.queryByRole('button')).not.toBeInTheDocument();
  },
};
export const Disabled: Story = { args: { disabled: true }, play: async ({ canvasElement, args }) => {
  const button = within(canvasElement).getByRole('button', { name: copy.open });
  expect(button).toBeDisabled(); await userEvent.click(button);
  expect(args.onOpenReport).not.toHaveBeenCalled();
} };
export const LongContent: Story = { args: { result: { ...examples.team.result,
  filterLabels: ['Current member: Very-long-authorized-member-label-'.repeat(8)],
  sections: [{ ...examples.team.result.sections[0]!, scopeLabel: 'Authorized-assigned-scope-'.repeat(10) }] } } };
