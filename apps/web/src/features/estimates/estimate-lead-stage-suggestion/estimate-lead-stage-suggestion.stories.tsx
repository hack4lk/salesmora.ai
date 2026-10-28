import { useState } from "react";
import type { Meta, StoryObj } from "@storybook/nextjs-vite";
import { expect, fireEvent, fn, userEvent, waitFor, within } from "storybook/test";
import { MoveStageDialog, type MoveStageDialogProps, type MoveStageRequest, type MoveStageValue } from "../../leads/move-stage-dialog/move-stage-dialog";
import { moveStageDialogData as moveCopy } from "../../leads/move-stage-dialog/move-stage-dialog.data";
import { getEstimateLeadStageTarget } from "../estimate-lead-suggestions";
import { estimateButton } from "../estimate-ui";
import { EstimateLeadStageSuggestion, type EstimateLeadStageSuggestionProps } from "./estimate-lead-stage-suggestion";
import { estimateLeadStageSuggestionData as c } from "./estimate-lead-stage-suggestion.data";

type PreviewProps = EstimateLeadStageSuggestionProps & {
  onConfirm: (request: MoveStageRequest) => void | Promise<void>;
  reviewError?: MoveStageDialogProps["error"];
  failConfirmation?: boolean;
  startOpen?: boolean;
  revokeAccess?: boolean;
};

function Preview({
  onConfirm, reviewError, failConfirmation = false, startOpen = false, revokeAccess = false, ...args
}: PreviewProps) {
  const [open, setOpen] = useState(startOpen);
  const [dismissed, setDismissed] = useState(false);
  const [saved, setSaved] = useState(false);
  const [revoked, setRevoked] = useState(false);
  const [error, setError] = useState(reviewError);
  const [value, setValue] = useState<MoveStageValue>({
    to: getEstimateLeadStageTarget(args) ?? "estimate-sent", reason: "",
  });
  const canRead = args.canRead && !revoked;
  return <div className="grid min-w-0 gap-4">
    {!dismissed && !saved && <EstimateLeadStageSuggestion {...args} canRead={canRead}
      onReview={args.onReview ? (target) => {
        args.onReview?.(target);
        setValue({ to: target, reason: "" });
        setOpen(true);
      } : undefined}
      onDismiss={args.onDismiss ? () => { args.onDismiss?.(); setDismissed(true); } : undefined} />}
    {args.lead && canRead && <MoveStageDialog open={open} lead={args.lead} value={value}
      allowedStages={getEstimateLeadStageTarget(args) ? [getEstimateLeadStageTarget(args)!] : []}
      pending={args.pending} error={error} onChange={setValue} onClose={() => setOpen(false)}
      onReload={args.onReload ? () => { args.onReload?.(); setError(undefined); } : undefined}
      onConfirm={async (request) => {
        await onConfirm(request);
        if (failConfirmation) { setError({ kind: "error", message: c.stories.failure }); return; }
        setOpen(false);
        setSaved(true);
      }} />}
    {saved && !revoked && <p role="status" className="m-0 text-sm leading-6 text-muted">{c.stories.success}</p>}
    {dismissed && !revoked && <p role="status" className="m-0 text-sm leading-6 text-muted">{c.stories.dismissed}</p>}
    {revokeAccess && !revoked && <button type="button" className={estimateButton}
      onClick={() => setRevoked(true)}>{c.stories.revoke}</button>}
  </div>;
}

const meta = {
  title: "Estimates/EstimateLeadStageSuggestion",
  component: Preview,
  args: {
    estimate: c.stories.estimate, lead: c.stories.lead, parentType: "lead",
    status: "sent", event: { kind: "send" }, canRead: true,
    onReview: fn(), onDismiss: fn(), onReload: fn(), onConfirm: fn(),
  },
  decorators: [(Story) => <main className="mx-auto min-h-screen w-full max-w-lg bg-canvas p-4 sm:p-8">
    <p className="m-0 mb-6 text-sm leading-6 text-muted">{c.stories.notice}</p>
    <Story />
  </main>],
} satisfies Meta<typeof Preview>;
export default meta;
type Story = StoryObj<typeof meta>;
const declined = {
  status: "declined", event: { kind: "decision", outcome: "declined", previousOutcome: null },
} as const;

function body(element: HTMLElement) { return within(element.ownerDocument.body); }
async function openReview(element: HTMLElement, label: string = c.review["estimate-sent"]) {
  await userEvent.click(within(element).getByRole("button", { name: label }));
  return body(element);
}
async function noReview(element: HTMLElement) {
  const canvas = within(element);
  await expect(canvas.queryByRole("button", { name: /Review move/ })).not.toBeInTheDocument();
  await expect(canvas.queryByText(c.stories.lead.name, { exact: false })).not.toBeInTheDocument();
  await expect(canvas.queryByText(c.estimate(c.stories.estimate.number, c.stories.estimate.revision))).not.toBeInTheDocument();
}

export const AfterSend: Story = {
  play: async ({ canvasElement, args }) => {
    const canvas = within(canvasElement);
    await expect(canvas.getByText(c.descriptions["estimate-sent"])).toBeVisible();
    await expect(canvas.getByText(c.effects)).toBeVisible();
    await expect(canvas.getByRole("button", { name: c.review["estimate-sent"] })).toBeEnabled();
    await expect(args.onReview).not.toHaveBeenCalled();
    await expect(args.onConfirm).not.toHaveBeenCalled();
  },
};
export const AfterDecline: Story = {
  args: declined,
  play: async ({ canvasElement, args }) => {
    const canvas = within(canvasElement);
    await expect(canvas.getByText(c.descriptions.lost)).toBeVisible();
    await expect(canvas.getByRole("button", { name: c.dismiss.lost })).toBeEnabled();
    await expect(args.onConfirm).not.toHaveBeenCalled();
  },
};
export const ReviewSent: Story = {
  play: async ({ canvasElement, args }) => {
    const page = await openReview(canvasElement);
    await expect(page.getByRole("combobox", { name: moveCopy.stage })).toHaveValue("estimate-sent");
    await expect(page.getByRole("alertdialog")).toBeVisible();
    await expect(args.onReview).toHaveBeenCalledWith("estimate-sent");
    await expect(args.onConfirm).not.toHaveBeenCalled();
  },
};
export const ConfirmSent: Story = {
  play: async ({ canvasElement, args }) => {
    const page = await openReview(canvasElement);
    await userEvent.click(page.getByRole("button", { name: moveCopy.confirm }));
    await waitFor(() => expect(args.onConfirm).toHaveBeenCalledWith({
      lead: args.lead, to: "estimate-sent", reason: undefined,
    }));
    await expect(page.getByText(c.stories.success)).toBeVisible();
  },
};
export const ConfirmLost: Story = {
  args: declined,
  play: async ({ canvasElement, args }) => {
    const page = await openReview(canvasElement, c.review.lost);
    await expect(page.getByRole("combobox", { name: moveCopy.stage })).toHaveValue("lost");
    await userEvent.type(page.getByRole("textbox", { name: moveCopy.reason }), c.stories.reason);
    await userEvent.click(page.getByRole("button", { name: moveCopy.confirm }));
    await waitFor(() => expect(args.onConfirm).toHaveBeenCalledWith({
      lead: args.lead, to: "lost", reason: c.stories.reason,
    }));
    await expect(page.getByText(c.stories.success)).toBeVisible();
  },
};
export const KeepOpen: Story = {
  args: declined,
  play: async ({ canvasElement, args }) => {
    await userEvent.click(within(canvasElement).getByRole("button", { name: c.dismiss.lost }));
    await expect(within(canvasElement).getByRole("status")).toHaveTextContent(c.stories.dismissed);
    await expect(args.onDismiss).toHaveBeenCalledTimes(1);
    await expect(args.onReview).not.toHaveBeenCalled();
    await expect(args.onConfirm).not.toHaveBeenCalled();
    await expect(body(canvasElement).queryByRole("alertdialog")).not.toBeInTheDocument();
  },
};
export const NotNow: Story = {
  play: async ({ canvasElement, args }) => {
    await userEvent.click(within(canvasElement).getByRole("button", { name: c.dismiss["estimate-sent"] }));
    await expect(args.onDismiss).toHaveBeenCalledTimes(1);
    await expect(args.onConfirm).not.toHaveBeenCalled();
  },
};
export const CancelReview: Story = {
  args: declined,
  play: async ({ canvasElement, args }) => {
    const page = await openReview(canvasElement, c.review.lost);
    await userEvent.click(page.getByRole("button", { name: moveCopy.cancel }));
    await waitFor(() => expect(page.queryByRole("alertdialog")).not.toBeInTheDocument());
    await expect(within(canvasElement).getByRole("button", { name: c.review.lost })).toBeVisible();
    await expect(args.onDismiss).not.toHaveBeenCalled();
    await expect(args.onConfirm).not.toHaveBeenCalled();
  },
};
export const KeyboardReview: Story = {
  play: async ({ canvasElement, args }) => {
    within(canvasElement).getByRole("button", { name: c.review["estimate-sent"] }).focus();
    await userEvent.keyboard("{Enter}");
    await expect(body(canvasElement).getByRole("alertdialog")).toBeVisible();
    await userEvent.keyboard("{Escape}");
    await waitFor(() => expect(body(canvasElement).queryByRole("alertdialog")).not.toBeInTheDocument());
    await expect(within(canvasElement).getByRole("button", { name: c.review["estimate-sent"] })).toHaveFocus();
    await expect(args.onConfirm).not.toHaveBeenCalled();
  },
};
export const Pending: Story = {
  args: { pending: true },
  play: async ({ canvasElement, args }) => {
    for (const button of within(canvasElement).getAllByRole("button")) {
      await expect(button).toBeDisabled();
      fireEvent.click(button);
    }
    await expect(args.onReview).not.toHaveBeenCalled();
    await expect(args.onDismiss).not.toHaveBeenCalled();
  },
};
export const PendingConfirmation: Story = {
  args: { startOpen: true },
  play: async ({ canvasElement, args }) => {
    const page = body(canvasElement);
    let finish!: () => void;
    args.onConfirm.mockImplementationOnce(() => new Promise<void>(resolve => { finish = resolve; }));
    await userEvent.click(page.getByRole("button", { name: moveCopy.confirm }));
    await expect(page.getByRole("combobox")).toBeDisabled();
    await expect(page.getByRole("button", { name: moveCopy.cancel })).toBeDisabled();
    fireEvent.submit(page.getByRole("alertdialog").querySelector("form")!);
    await userEvent.keyboard("{Escape}");
    await expect(page.getByRole("alertdialog")).toBeVisible();
    await expect(args.onConfirm).toHaveBeenCalledTimes(1);
    finish();
    await waitFor(() => expect(page.queryByRole("alertdialog")).not.toBeInTheDocument());
  },
};
export const FailedConfirmation: Story = {
  args: { failConfirmation: true },
  play: async ({ canvasElement, args }) => {
    const page = await openReview(canvasElement);
    await userEvent.click(page.getByRole("button", { name: moveCopy.confirm }));
    await expect(page.getByText(c.stories.failure)).toBeVisible();
    await expect(page.getByRole("button", { name: moveCopy.confirm })).toBeEnabled();
    await expect(page.queryByText(c.stories.success)).not.toBeInTheDocument();
    await userEvent.click(page.getByRole("button", { name: moveCopy.confirm }));
    await expect(args.onConfirm).toHaveBeenCalledTimes(2);
  },
};
export const ChangedContext: Story = {
  args: { reviewError: { kind: "conflict", message: c.stories.conflict } },
  play: async ({ canvasElement, args }) => {
    const page = await openReview(canvasElement);
    await expect(page.getByRole("button", { name: moveCopy.confirm })).toBeDisabled();
    await expect(page.getByText(c.stories.conflict)).toBeVisible();
    await userEvent.click(page.getByRole("button", { name: moveCopy.reload }));
    await expect(args.onReload).toHaveBeenCalledTimes(1);
    await expect(page.getByRole("button", { name: moveCopy.confirm })).toBeEnabled();
    await expect(args.onConfirm).not.toHaveBeenCalled();
  },
};
export const Loading: Story = {
  args: { state: "loading" },
  play: async ({ canvasElement }) => {
    await noReview(canvasElement);
    await expect(within(canvasElement).getByRole("status")).toHaveTextContent(c.loading);
  },
};
export const ReadErrorAndReload: Story = {
  args: { state: "error", error: c.stories.failure },
  play: async ({ canvasElement, args }) => {
    await noReview(canvasElement);
    await expect(within(canvasElement).getByRole("alert")).toHaveTextContent(c.stories.failure);
    await userEvent.click(within(canvasElement).getByRole("button", { name: c.retry }));
    await expect(args.onReload).toHaveBeenCalledTimes(1);
    await expect(args.onConfirm).not.toHaveBeenCalled();
  },
};
export const ReadErrorWithoutReload: Story = {
  args: { state: "error", onReload: undefined },
  play: async ({ canvasElement }) => {
    await noReview(canvasElement);
    await expect(within(canvasElement).getByRole("alert")).toHaveTextContent(c.error);
    await expect(within(canvasElement).queryByRole("button")).not.toBeInTheDocument();
  },
};
export const NoReadAccess: Story = {
  args: { canRead: false },
  play: async ({ canvasElement }) => {
    await noReview(canvasElement);
    await expect(within(canvasElement).getByRole("status")).toHaveTextContent(c.unavailable);
  },
};
export const AccessLost: Story = {
  args: { revokeAccess: true },
  play: async ({ canvasElement, args }) => {
    const page = await openReview(canvasElement);
    fireEvent.click(within(canvasElement).getByText(c.stories.revoke));
    await waitFor(() => expect(page.queryByRole("alertdialog")).not.toBeInTheDocument());
    await noReview(canvasElement);
    await expect(within(canvasElement).getByRole("status")).toHaveTextContent(c.unavailable);
    await expect(args.onConfirm).not.toHaveBeenCalled();
  },
};
export const NoMovePermission: Story = {
  args: { lead: { ...c.stories.lead, canMove: false } },
  play: async ({ canvasElement }) => {
    await noReview(canvasElement);
    await expect(within(canvasElement).getByRole("status")).toHaveTextContent(c.forbidden);
  },
};
export const ArchivedLead: Story = {
  args: { lead: { ...c.stories.lead, archived: true } },
  play: async ({ canvasElement }) => {
    await noReview(canvasElement);
    await expect(within(canvasElement).getByRole("status")).toHaveTextContent(c.archived);
  },
};
export const ArchivedEstimate: Story = { ...ArchivedLead, args: { archived: true } };
export const WonLead: Story = {
  args: { ...declined, lead: { ...c.stories.lead, stage: "won" } },
  play: async ({ canvasElement }) => {
    await noReview(canvasElement);
    await expect(within(canvasElement).getByRole("status")).toHaveTextContent(c.noSuggestion);
  },
};
export const LostLead: Story = { ...WonLead, args: { ...declined, lead: { ...c.stories.lead, stage: "lost" } } };
export const AlreadyEstimateSent: Story = { ...WonLead, args: { lead: { ...c.stories.lead, stage: "estimate-sent" } } };
export const JobWithSourceLead: Story = { ...WonLead, args: { parentType: "job" } };
export const Published: Story = { ...WonLead, args: { status: "published", event: { kind: "publish" } } };
export const Resent: Story = { ...WonLead, args: { event: { kind: "resend" } } };
export const DeclinedMetadataCorrection: Story = {
  ...WonLead, args: { ...declined, event: { kind: "decision", outcome: "declined", previousOutcome: "declined" } },
};
export const CorrectedToDeclined: Story = {
  ...AfterDecline, args: { ...declined, event: { kind: "decision", outcome: "declined", previousOutcome: "accepted" } },
};
export const ReviewUnavailable: Story = {
  args: { onReview: undefined },
  play: async ({ canvasElement }) => {
    await expect(within(canvasElement).getByText(c.notConnected)).toBeVisible();
    await expect(within(canvasElement).queryByRole("button", { name: /Review move/ })).not.toBeInTheDocument();
  },
};
export const LongContent: Story = {
  args: { ...declined, lead: { ...c.stories.lead, name: c.stories.longName } },
  play: async ({ canvasElement }) => {
    await expect(within(canvasElement).getByText(c.stories.longName, { exact: false })).toBeVisible();
    await openReview(canvasElement, c.review.lost);
    await expect(body(canvasElement).getByRole("alertdialog")).toBeVisible();
  },
};
export const LiteralText: Story = {
  args: { lead: { ...c.stories.lead, name: "<img src=x onerror=alert(1)>" } },
  play: async ({ canvasElement }) => {
    await expect(within(canvasElement).getByText("<img src=x onerror=alert(1)>", { exact: false })).toBeVisible();
    await expect(canvasElement.querySelector("img")).toBeNull();
  },
};
