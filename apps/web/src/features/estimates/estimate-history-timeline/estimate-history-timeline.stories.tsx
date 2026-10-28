import { useState } from "react";
import type { Meta, StoryObj } from "@storybook/nextjs-vite";
import { expect, fireEvent, fn, userEvent, within } from "storybook/test";
import { estimateButton } from "../estimate-ui";
import { EstimateHistoryTimeline, type EstimateHistoryTimelineProps } from "./estimate-history-timeline";
import { estimateHistoryEventExamples, estimateHistoryFixtures as events, estimateHistoryTimelineData as c } from "./estimate-history-timeline.data";
import type { EstimateHistoryEvent } from "./estimate-history-timeline.preview";

function HistoryPreview({ revokeAccess = false, ...args }: EstimateHistoryTimelineProps & { revokeAccess?: boolean }) {
  const [revoked, setRevoked] = useState(false);
  return <div className="grid min-w-0 gap-4">
    <EstimateHistoryTimeline {...args} canRead={!revoked && args.canRead} />
    {revokeAccess && !revoked && <button type="button" className={estimateButton} onClick={() => setRevoked(true)}>{c.stories.revoke}</button>}
  </div>;
}

function PagedHistoryPreview({ failFirst = false, ...args }: EstimateHistoryTimelineProps & { failFirst?: boolean }) {
  const [complete, setComplete] = useState(false);
  const [failed, setFailed] = useState(false);
  return <EstimateHistoryTimeline {...args} events={complete ? events : events.slice(0, 2)} total={events.length}
    error={failed ? c.stories.error : undefined}
    onLoadMore={() => {
      args.onLoadMore?.();
      if (failFirst) setFailed(true);
      else setComplete(true);
    }}
    onRetry={() => {
      args.onRetry?.();
      setFailed(false);
      setComplete(true);
    }} />;
}

const meta = {
  title: "Estimates/EstimateHistoryTimeline",
  component: EstimateHistoryTimeline,
  args: { events, total: events.length, timezone: c.stories.timezone, canRead: true },
  render: (args) => <HistoryPreview {...args} />,
  decorators: [(Story) => <main className="mx-auto min-h-screen w-full max-w-lg bg-canvas p-4 sm:p-8">
    <p className="mb-6 mt-0 text-sm leading-6 text-muted">{c.stories.notice}</p>
    <Story />
  </main>],
} satisfies Meta<typeof EstimateHistoryTimeline>;
export default meta;
type Story = StoryObj<typeof meta>;

function list(element: HTMLElement) { return within(within(element).getByRole("list", { name: c.title })); }
async function expectHidden(element: HTMLElement) {
  const canvas = within(element);
  await expect(canvas.queryByRole("list")).not.toBeInTheDocument();
  await expect(canvas.getByText(c.unavailable)).toBeVisible();
  await expect(canvas.queryByRole("button")).not.toBeInTheDocument();
  await expect(canvas.queryByText(c.stories.error)).not.toBeInTheDocument();
  await expect(canvas.queryByText(c.timezoneUnavailable)).not.toBeInTheDocument();
}

export const Ready: Story = {
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement), items = list(canvasElement).getAllByRole("listitem");
    await expect(items).toHaveLength(4);
    await expect(items.map((item) => within(item).getByRole("heading").textContent)).toEqual(events.map((event) => c.events[event.kind]));
    await expect(canvas.getByText(c.loaded(4, 4))).toBeVisible();
    await expect(canvas.queryByRole("button")).not.toBeInTheDocument();
    await expect(within(items[2]).getByText("$842.60")).toBeVisible();
    await expect(within(items[2]).getByText("$947.93")).toBeVisible();
  },
};
export const NewestFirst: Story = { args: { events: [...events].reverse() }, play: Ready.play };
export const Empty: Story = {
  args: { events: [], total: 0 },
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement);
    await expect(canvas.getByText(c.empty)).toBeVisible();
    await expect(canvas.queryByRole("list")).not.toBeInTheDocument();
    await expect(canvas.getByText(c.loaded(0, 0))).toBeVisible();
  },
};
export const InitialLoading: Story = {
  args: { events: [], total: 0, loading: true },
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement);
    await expect(canvas.getByRole("status")).toHaveTextContent(c.loading);
    await expect(canvas.queryByText(c.empty)).not.toBeInTheDocument();
    await expect(canvas.queryByText(c.loaded(0, 0))).not.toBeInTheDocument();
  },
};
export const InitialError: Story = {
  args: { events: [], total: 0, error: c.stories.error, onRetry: fn() },
  play: async ({ canvasElement, args }) => {
    const canvas = within(canvasElement);
    await expect(canvas.getByRole("alert")).toHaveTextContent(c.stories.error);
    await expect(canvas.queryByText(c.empty)).not.toBeInTheDocument();
    await userEvent.click(canvas.getByRole("button", { name: c.retry }));
    await expect(args.onRetry).toHaveBeenCalledTimes(1);
  },
};
export const ErrorWithoutRetry: Story = {
  args: { events: [], total: 0, error: c.stories.error },
  play: async ({ canvasElement }) => {
    await expect(within(canvasElement).getByRole("alert")).toBeVisible();
    await expect(within(canvasElement).queryByRole("button")).not.toBeInTheDocument();
  },
};
export const PartialHistory: Story = {
  args: { events: events.slice(0, 2), total: 4, onLoadMore: fn() },
  play: async ({ canvasElement, args }) => {
    const canvas = within(canvasElement);
    await expect(canvas.getByText(c.loaded(2, 4))).toBeVisible();
    await userEvent.click(canvas.getByRole("button", { name: c.older }));
    await expect(args.onLoadMore).toHaveBeenCalledTimes(1);
    await expect(list(canvasElement).getAllByRole("listitem")).toHaveLength(2);
  },
};
export const PagingAppendsEvents: Story = {
  args: { onLoadMore: fn() },
  render: (args) => <PagedHistoryPreview {...args} />,
  play: async ({ canvasElement, args }) => {
    const canvas = within(canvasElement);
    await expect(list(canvasElement).getAllByRole("listitem")).toHaveLength(2);
    await userEvent.click(canvas.getByRole("button", { name: c.older }));
    await expect(args.onLoadMore).toHaveBeenCalledTimes(1);
    await expect(list(canvasElement).getAllByRole("listitem").map((item) => within(item).getByRole("heading").textContent))
      .toEqual(events.map((event) => c.events[event.kind]));
    await expect(canvas.getByRole("status")).toHaveTextContent(c.loaded(4, 4));
    await expect(canvas.queryByRole("button")).not.toBeInTheDocument();
  },
};
export const RetryRecoversHistory: Story = {
  args: { onLoadMore: fn(), onRetry: fn() },
  render: (args) => <PagedHistoryPreview {...args} failFirst />,
  play: async ({ canvasElement, args }) => {
    const canvas = within(canvasElement);
    await userEvent.click(canvas.getByRole("button", { name: c.older }));
    await expect(args.onLoadMore).toHaveBeenCalledTimes(1);
    await expect(list(canvasElement).getAllByRole("listitem")).toHaveLength(2);
    await expect(canvas.getByRole("alert")).toHaveTextContent(c.stories.error);
    await userEvent.click(canvas.getByRole("button", { name: c.retry }));
    await expect(args.onRetry).toHaveBeenCalledTimes(1);
    await expect(list(canvasElement).getAllByRole("listitem")).toHaveLength(4);
    await expect(canvas.getByRole("status")).toHaveTextContent(c.loaded(4, 4));
    await expect(canvas.queryByRole("alert")).not.toBeInTheDocument();
    await expect(canvas.queryByRole("button")).not.toBeInTheDocument();
  },
};
export const LoadingOlder: Story = {
  args: { events: events.slice(0, 2), total: 4, loading: true, onLoadMore: fn() },
  play: async ({ canvasElement, args }) => {
    const button = within(canvasElement).getByRole("button", { name: c.older });
    await expect(button).toBeDisabled();
    fireEvent.click(button);
    await expect(args.onLoadMore).not.toHaveBeenCalled();
    await expect(list(canvasElement).getAllByRole("listitem")).toHaveLength(2);
    await expect(within(canvasElement).getByRole("status")).toHaveTextContent(c.loading);
  },
};
export const OlderErrorRetainsHistory: Story = {
  args: { events: events.slice(0, 2), total: 4, error: c.stories.error, onLoadMore: fn(), onRetry: fn() },
  play: async ({ canvasElement, args }) => {
    const canvas = within(canvasElement);
    await expect(list(canvasElement).getAllByRole("listitem")).toHaveLength(2);
    await expect(canvas.getByText(c.stale)).toBeVisible();
    await expect(canvas.queryByRole("button", { name: c.older })).not.toBeInTheDocument();
    await userEvent.click(canvas.getByRole("button", { name: c.retry }));
    await expect(args.onRetry).toHaveBeenCalledTimes(1);
    await expect(args.onLoadMore).not.toHaveBeenCalled();
  },
};
export const RetryingOlder: Story = {
  args: { events: events.slice(0, 2), total: 4, error: c.stories.error, loading: true, onRetry: fn() },
  play: async ({ canvasElement, args }) => {
    const button = within(canvasElement).getByRole("button", { name: c.retry });
    await expect(button).toBeDisabled();
    fireEvent.click(button);
    await expect(args.onRetry).not.toHaveBeenCalled();
    await expect(list(canvasElement).getAllByRole("listitem")).toHaveLength(2);
  },
};
export const PagingNotConnected: Story = {
  args: { events: events.slice(0, 2), total: 4 },
  play: async ({ canvasElement }) => {
    await expect(within(canvasElement).getByText(c.moreUnavailable)).toBeVisible();
    await expect(within(canvasElement).queryByRole("button")).not.toBeInTheDocument();
  },
};
export const NoReadAccess: Story = {
  args: { canRead: false, error: c.stories.error, timezone: "Invalid/Workspace", onLoadMore: fn(), onRetry: fn(), total: 10 },
  play: async ({ canvasElement, args }) => {
    await expectHidden(canvasElement);
    await expect(args.onLoadMore).not.toHaveBeenCalled();
    await expect(args.onRetry).not.toHaveBeenCalled();
  },
};
export const AccessNotGranted: Story = { args: { canRead: undefined }, play: async ({ canvasElement }) => { await expectHidden(canvasElement); } };
export const AccessRevoked: Story = {
  args: { total: 10, onLoadMore: fn() },
  render: (args) => <HistoryPreview {...args} revokeAccess />,
  play: async ({ canvasElement, args }) => {
    await userEvent.click(within(canvasElement).getByRole("button", { name: c.stories.revoke }));
    await expectHidden(canvasElement);
    await expect(args.onLoadMore).not.toHaveBeenCalled();
  },
};
export const AllEventKinds: Story = {
  args: { events: estimateHistoryEventExamples, total: estimateHistoryEventExamples.length },
  play: async ({ canvasElement }) => {
    const items = list(canvasElement).getAllByRole("listitem");
    await expect(items).toHaveLength(estimateHistoryEventExamples.length);
    for (const event of estimateHistoryEventExamples) await expect(within(canvasElement).getByRole("heading", { name: c.events[event.kind] })).toBeVisible();
  },
};
export const WorkerAndFormerActors: Story = {
  args: { events: [
    { ...events[0], source: { type: "ui", actorName: null } },
    { ...events[1], source: { type: "chat", actorName: " " } },
    { ...events[2], source: { type: "worker" } },
  ], total: 3 },
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement);
    await expect(canvas.getAllByText(c.former)).toHaveLength(2);
    await expect(canvas.getByText(c.system, { exact: true })).toBeVisible();
    await expect(canvas.getByText(c.sources.chat)).toBeVisible();
    await expect(canvas.getByText(c.sources.worker)).toBeVisible();
  },
};
export const PrivateFieldsAreSummarized: Story = {
  args: { events: [{
    ...events[2], changes: (["recipientName", "recipientEmail", "serviceAddress", "internalNotes", "scope", "message", "paymentTerms", "termsNote"] as const)
      .map((field) => ({ kind: "field" as const, field, before: c.stories.secret, after: c.stories.secret })),
  }], total: 1 },
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement);
    await expect(canvas.queryByText(c.stories.secret)).not.toBeInTheDocument();
    await expect(canvas.getByText(c.fields.internalNotes)).toBeVisible();
    await expect(canvas.getByText(c.fields.recipientEmail)).toBeVisible();
    await expect(canvas.getAllByText(`${c.changed}:`)).toHaveLength(8);
  },
};
const corrected: EstimateHistoryEvent = {
  ...events[0], kind: "decision-corrected", decisionDate: "2026-10-22", channel: "email",
  reason: c.stories.longReason, note: c.stories.literalNote,
  changes: [{ kind: "status", before: "accepted", after: "declined" }],
};
export const CorrectionWithLiteralNote: Story = {
  args: { events: [corrected], total: 1 },
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement);
    await expect(canvas.getByText(c.correctionReason)).toBeVisible();
    await expect(canvas.getByText(c.decisionNote)).toBeVisible();
    await expect(canvas.getByText((_, element) => element?.textContent === c.stories.literalNote)).toBeVisible();
    await expect(canvasElement.querySelector("script")).toBeNull();
    await expect(canvas.getByText("Oct 22, 2026")).toBeVisible();
  },
};
export const DecisionWithoutNote: Story = {
  args: { events: [{ ...corrected, kind: "decision-recorded", note: "" }], total: 1 },
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement);
    await expect(canvas.queryByText(c.decisionNote)).not.toBeInTheDocument();
    await expect(canvas.queryByText(c.correctionReason)).not.toBeInTheDocument();
  },
};
export const ZeroAndUnavailableTotals: Story = {
  args: { events: [{ ...events[2], changes: [
    { kind: "total", beforeCents: 94793, afterCents: 0 },
    { kind: "total", beforeCents: 0, afterCents: null },
  ] }], total: 1 },
  play: async ({ canvasElement }) => {
    await expect(within(canvasElement).getAllByText("$0.00")).toHaveLength(2);
    await expect(within(canvasElement).getByText("—", { exact: true })).toBeVisible();
  },
};
export const WorkspacePreviousDay: Story = {
  args: { events: [{ ...events[1], createdAt: "2026-10-22T01:30:00Z" }], total: 1 },
  play: async ({ canvasElement }) => { await expect(within(canvasElement).getByText("Oct 21, 2026, 9:30 PM EDT")).toBeVisible(); },
};
export const DaylightSavingOverlap: Story = {
  args: { events: [
    { ...events[1], id: "before-dst", createdAt: "2026-11-01T05:30:00Z" },
    { ...events[1], id: "after-dst", createdAt: "2026-11-01T06:30:00Z" },
  ], total: 2 },
  play: async ({ canvasElement }) => {
    const items = list(canvasElement).getAllByRole("listitem");
    await expect(within(items[0]).getByText("Nov 1, 2026, 1:30 AM EST")).toBeVisible();
    await expect(within(items[1]).getByText("Nov 1, 2026, 1:30 AM EDT")).toBeVisible();
  },
};
export const InvalidTimezone: Story = {
  args: { timezone: "Invalid/Workspace" },
  play: async ({ canvasElement }) => {
    await expect(within(canvasElement).getByRole("alert")).toHaveTextContent(c.timezoneUnavailable);
    await expect(within(canvasElement).getAllByText(c.dateUnavailable)).toHaveLength(4);
    await expect(canvasElement.querySelector("time")).toBeNull();
  },
};
export const InvalidTimestamp: Story = {
  args: { events: [{ ...events[0], createdAt: "2026-02-30T00:00:00Z" }, events[1]], total: 2 },
  play: async ({ canvasElement }) => {
    const items = list(canvasElement).getAllByRole("listitem");
    await expect(within(items[1]).getByText(c.dateUnavailable)).toBeVisible();
    await expect(canvasElement.querySelectorAll("time")).toHaveLength(1);
  },
};
export const InvalidDecisionDate: Story = {
  args: { events: [{ ...corrected, decisionDate: "2026-02-30" }], total: 1 },
  play: async ({ canvasElement }) => { await expect(within(canvasElement).getByText(c.decisionDateUnavailable)).toBeVisible(); },
};
export const LongContent: Story = {
  args: { events: [{ ...corrected, source: { type: "chat", actorName: c.stories.longActor }, reason: `${c.stories.longReason}\n${c.stories.longActor.repeat(3)}` }], total: 1 },
  play: CorrectionWithLiteralNote.play,
};
export const KeyboardPaging: Story = {
  args: { events: events.slice(0, 2), total: 4, onLoadMore: fn() },
  play: async ({ canvasElement, args }) => {
    const button = within(canvasElement).getByRole("button", { name: c.older });
    await userEvent.tab();
    await expect(button).toHaveFocus();
    await expect(button).toHaveClass("focus-visible:focus-ring");
    await userEvent.keyboard("{Enter}");
    await expect(args.onLoadMore).toHaveBeenCalledTimes(1);
  },
};
export const Phone: Story = { globals: { viewport: { value: "phone", isRotated: false } }, args: LongContent.args, play: LongContent.play };
export const PaperExcluded: Story = {
  play: async ({ canvasElement }) => { await expect(within(canvasElement).getByRole("region", { name: c.title })).toHaveClass("print:hidden"); },
};
