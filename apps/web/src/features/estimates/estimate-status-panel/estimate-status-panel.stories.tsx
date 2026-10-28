import { useState } from "react";
import type { Meta, StoryObj } from "@storybook/nextjs-vite";
import { expect, fireEvent, fn, userEvent, within } from "storybook/test";
import type { EstimateStatusAction } from "../estimate-actions";
import { estimateCapabilitiesByRole as roles } from "../estimate-preview.data";
import { estimateStatusBadgeData } from "../estimate-status-badge/estimate-status-badge.data";
import { estimateButton } from "../estimate-ui";
import { EstimateStatusPanel, type EstimateStatusPanelProps } from "./estimate-status-panel";
import { estimateStatusPanelData as c } from "./estimate-status-panel.data";

function StatusPreview({ revokeAccess = false, ...args }: EstimateStatusPanelProps & { revokeAccess?: boolean }) {
  const [requested, setRequested] = useState<EstimateStatusAction>();
  const [revoked, setRevoked] = useState(false);
  return <div className="grid min-w-0 gap-4">
    <EstimateStatusPanel {...args} capabilities={revoked ? { ...args.capabilities, read: false } : args.capabilities}
      onAction={args.onAction ? (action) => {
        setRequested(action);
        args.onAction?.(action);
      } : undefined} />
    {requested && !revoked && <p role="status" className="m-0 text-sm leading-6 text-muted">{c.stories.requested(c.actions[requested])}</p>}
    {revokeAccess && !revoked && <button type="button" className={estimateButton} onClick={() => setRevoked(true)}>{c.stories.revoke}</button>}
  </div>;
}

const meta = {
  title: "Estimates/EstimateStatusPanel",
  component: EstimateStatusPanel,
  args: {
    status: "draft",
    capabilities: roles.owner,
    canCorrectDecision: true,
    canConvertToJob: true,
    parentType: "lead",
    onAction: fn(),
  },
  render: (args) => <StatusPreview {...args} />,
  decorators: [(Story) => (
    <main className="mx-auto min-h-screen w-full max-w-md bg-canvas p-4 sm:p-8">
      <p className="mb-6 mt-0 text-sm leading-6 text-muted">{c.stories.notice}</p>
      <Story />
    </main>
  )],
} satisfies Meta<typeof EstimateStatusPanel>;
export default meta;
type Story = StoryObj<typeof meta>;

async function expectActions(element: HTMLElement, actions: readonly EstimateStatusAction[]) {
  const canvas = within(element);
  const group = canvas.queryByRole("group", { name: c.actionsLabel });
  if (actions.length) {
    await expect(group).not.toBeNull();
    if (group) {
      const buttons = within(group).getAllByRole("button");
      await expect(buttons.map((button) => button.textContent)).toEqual(actions.map((action) => c.actions[action]));
    }
  } else {
    await expect(group).not.toBeInTheDocument();
  }
}

export const Draft: Story = {
  play: async ({ canvasElement }) => {
    await expectActions(canvasElement, ["send", "publish"]);
    await expect(within(canvasElement).getByText(c.descriptions.draft)).toBeVisible();
  },
};
export const Sent: Story = {
  args: { status: "sent" },
  play: async ({ canvasElement }) => {
    await expectActions(canvasElement, ["mark-accepted", "mark-declined", "revise"]);
    await expect(within(canvasElement).getByText(c.decisionHint)).toBeVisible();
  },
};
export const Published: Story = { args: { status: "published" }, play: Sent.play };
export const Accepted: Story = {
  args: { status: "accepted" },
  play: async ({ canvasElement }) => {
    await expectActions(canvasElement, ["convert", "correct-decision"]);
    await expect(within(canvasElement).getByText(c.correctionHint)).toBeVisible();
  },
};
export const AcceptedJobParent: Story = {
  args: { status: "accepted", parentType: "job", parentJob: c.stories.job },
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement);
    await expectActions(canvasElement, ["correct-decision"]);
    await expect(canvas.getByText(c.parentJobHint)).toBeVisible();
    await expect(canvas.getByRole("link", { name: c.openParentJob(c.stories.job.number) })).toHaveAttribute("href", c.stories.job.href);
    await expect(canvas.queryByText(c.convertedHint)).not.toBeInTheDocument();
    await expect(canvas.queryByText(c.conversionHint)).not.toBeInTheDocument();
  },
};
export const AcceptedJobParentNoJobAccess: Story = {
  args: { status: "accepted", parentType: "job", parentJob: { number: c.stories.job.number } },
  play: async ({ canvasElement }) => {
    await expectActions(canvasElement, ["correct-decision"]);
    await expect(within(canvasElement).queryByRole("link")).not.toBeInTheDocument();
  },
};
export const JobParentWithoutEstimateAccess: Story = {
  args: { status: "accepted", parentType: "job", parentJob: c.stories.job, capabilities: { ...roles.owner, read: false } },
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement);
    await expect(canvas.queryByRole("link")).not.toBeInTheDocument();
    await expect(canvas.queryByText(c.parentJobHint)).not.toBeInTheDocument();
    await expect(canvas.queryByText(c.stories.job.number)).not.toBeInTheDocument();
  },
};
export const Declined: Story = {
  args: { status: "declined" },
  play: async ({ canvasElement }) => { await expectActions(canvasElement, ["revise", "correct-decision"]); },
};
export const Expired: Story = {
  args: { status: "expired" },
  play: async ({ canvasElement }) => { await expectActions(canvasElement, ["revise"]); },
};
export const Superseded: Story = {
  args: { status: "superseded" },
  play: async ({ canvasElement }) => {
    await expectActions(canvasElement, []);
    await expect(within(canvasElement).getByText(c.noActions)).toBeVisible();
  },
};
export const Voided: Story = { args: { status: "void" }, play: Superseded.play };
export const RequestSend: Story = {
  play: async ({ canvasElement, args }) => {
    const canvas = within(canvasElement);
    await userEvent.click(canvas.getByRole("button", { name: c.actions.send }));
    await expect(args.onAction).toHaveBeenCalledWith("send");
    await expect(canvas.getByRole("status")).toHaveTextContent(c.stories.requested(c.actions.send));
    await expect(canvas.getByText(estimateStatusBadgeData.statuses.draft.label, { exact: true })).toBeVisible();
  },
};
export const RequestPublish: Story = {
  play: async ({ canvasElement, args }) => {
    await userEvent.click(within(canvasElement).getByRole("button", { name: c.actions.publish }));
    await expect(args.onAction).toHaveBeenCalledWith("publish");
  },
};
export const RequestAccepted: Story = {
  args: { status: "sent" },
  play: async ({ canvasElement, args }) => {
    const canvas = within(canvasElement);
    await userEvent.click(canvas.getByRole("button", { name: c.actions["mark-accepted"] }));
    await expect(args.onAction).toHaveBeenCalledWith("mark-accepted");
    await expect(canvas.getByText(estimateStatusBadgeData.statuses.sent.label, { exact: true })).toBeVisible();
    await expect(canvas.getByRole("status")).toHaveTextContent(c.stories.requested(c.actions["mark-accepted"]));
  },
};
export const RequestDeclined: Story = {
  args: { status: "published" },
  play: async ({ canvasElement, args }) => {
    await userEvent.click(within(canvasElement).getByRole("button", { name: c.actions["mark-declined"] }));
    await expect(args.onAction).toHaveBeenCalledWith("mark-declined");
  },
};
export const RequestRevision: Story = {
  args: { status: "expired" },
  play: async ({ canvasElement, args }) => {
    await userEvent.click(within(canvasElement).getByRole("button", { name: c.actions.revise }));
    await expect(args.onAction).toHaveBeenCalledWith("revise");
  },
};
export const RequestCorrection: Story = {
  args: { status: "accepted" },
  play: async ({ canvasElement, args }) => {
    await userEvent.click(within(canvasElement).getByRole("button", { name: c.actions["correct-decision"] }));
    await expect(args.onAction).toHaveBeenCalledWith("correct-decision");
  },
};
export const RequestConversion: Story = {
  args: { status: "accepted" },
  play: async ({ canvasElement, args }) => {
    await userEvent.click(within(canvasElement).getByRole("button", { name: c.actions.convert }));
    await expect(args.onAction).toHaveBeenCalledWith("convert");
  },
};
export const Admin: Story = { args: { status: "accepted", capabilities: roles.admin }, play: Accepted.play };
export const Office: Story = { args: { status: "declined", capabilities: roles.office }, play: Declined.play };
export const FieldAssignedJob: Story = {
  args: { status: "sent", capabilities: roles.field, canCorrectDecision: false, canConvertToJob: false }, play: Sent.play,
};
export const FieldCannotCorrect: Story = {
  args: { status: "accepted", capabilities: roles.field, canCorrectDecision: false, canConvertToJob: false },
  play: async ({ canvasElement }) => { await expectActions(canvasElement, []); },
};
export const ReadOnly: Story = {
  args: {
    status: "sent",
    capabilities: { read: true, create: false, update: false, send: false, decide: false, void: false, archive: false, delete: false, export: false },
    canCorrectDecision: false, canConvertToJob: false,
  },
  play: async ({ canvasElement }) => {
    await expectActions(canvasElement, []);
    await expect(within(canvasElement).getByText(c.noActions)).toBeVisible();
  },
};
export const NoSendPermission: Story = {
  args: { capabilities: { ...roles.owner, send: false } }, play: ReadOnly.play,
};
export const NoDecisionPermission: Story = {
  args: { status: "sent", capabilities: { ...roles.owner, decide: false } },
  play: async ({ canvasElement }) => { await expectActions(canvasElement, ["revise"]); },
};
export const NoRevisionPermission: Story = {
  args: { status: "sent", capabilities: { ...roles.owner, update: false } },
  play: async ({ canvasElement }) => { await expectActions(canvasElement, ["mark-accepted", "mark-declined"]); },
};
export const NoCorrectionGrant: Story = {
  args: { status: "accepted", canCorrectDecision: false },
  play: async ({ canvasElement }) => { await expectActions(canvasElement, ["convert"]); },
};
export const NoConversionGrant: Story = {
  args: { status: "accepted", canConvertToJob: false },
  play: async ({ canvasElement }) => { await expectActions(canvasElement, ["correct-decision"]); },
};
export const Archived: Story = {
  args: { status: "declined", archived: true },
  play: async ({ canvasElement }) => {
    await expectActions(canvasElement, []);
    await expect(within(canvasElement).getByText(c.archived)).toBeVisible();
    await expect(within(canvasElement).getByText(estimateStatusBadgeData.archived, { exact: true })).toBeVisible();
  },
};
export const AlreadyConverted: Story = {
  args: { status: "accepted", convertedJob: c.stories.job },
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement);
    await expectActions(canvasElement, ["correct-decision"]);
    await expect(canvas.getByRole("link", { name: c.stories.job.number })).toHaveAttribute("href", c.stories.job.href);
    await expect(canvas.getByText(c.convertedHint)).toBeVisible();
  },
};
export const ConvertedWithoutJobAccess: Story = {
  args: { status: "accepted", convertedJob: { number: c.stories.job.number } },
  play: async ({ canvasElement }) => {
    await expectActions(canvasElement, ["correct-decision"]);
    await expect(within(canvasElement).queryByRole("link")).not.toBeInTheDocument();
  },
};
export const Pending: Story = {
  args: { status: "sent", pending: true },
  play: async ({ canvasElement, args }) => {
    const canvas = within(canvasElement);
    for (const button of canvas.getAllByRole("button")) {
      await expect(button).toBeDisabled();
      fireEvent.click(button);
    }
    await expect(args.onAction).not.toHaveBeenCalled();
  },
};
export const FailedRequest: Story = {
  args: { status: "sent", error: c.stories.error },
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement);
    await expect(canvas.getByRole("alert")).toHaveTextContent(c.stories.error);
    await expectActions(canvasElement, ["mark-accepted", "mark-declined", "revise"]);
    await expect(canvas.getByText(estimateStatusBadgeData.statuses.sent.label, { exact: true })).toBeVisible();
  },
};
export const NoChangeHandler: Story = {
  args: { onAction: undefined },
  play: async ({ canvasElement }) => {
    await expectActions(canvasElement, []);
    await expect(within(canvasElement).getByText(c.noHandler)).toBeVisible();
  },
};
export const FieldUnassignedJob: Story = {
  args: {
    status: "accepted", capabilities: { ...roles.field, read: false }, convertedJob: c.stories.job, error: c.stories.error,
  },
  play: async ({ canvasElement, args }) => {
    const canvas = within(canvasElement);
    await expectActions(canvasElement, []);
    await expect(canvas.getByRole("status")).toHaveTextContent(c.unavailable);
    await expect(canvas.queryByText(c.descriptions.accepted)).not.toBeInTheDocument();
    await expect(canvas.queryByText(c.stories.job.number)).not.toBeInTheDocument();
    await expect(canvas.queryByRole("alert")).not.toBeInTheDocument();
    await expect(canvas.queryByRole("link")).not.toBeInTheDocument();
    await expect(args.onAction).not.toHaveBeenCalled();
  },
};
export const AccessRevoked: Story = {
  args: { status: "accepted", convertedJob: c.stories.job },
  render: (args) => <StatusPreview {...args} revokeAccess />,
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement);
    await userEvent.click(canvas.getByRole("button", { name: c.stories.revoke }));
    await expect(canvas.getByRole("status")).toHaveTextContent(c.unavailable);
    await expect(canvas.queryByRole("link")).not.toBeInTheDocument();
    await expect(canvas.queryByText(c.descriptions.accepted)).not.toBeInTheDocument();
  },
};
export const LongJobNumber: Story = {
  args: { status: "accepted", convertedJob: { number: c.stories.longJobNumber, href: c.stories.job.href }, error: c.stories.error },
};
export const KeyboardFocus: Story = {
  play: async ({ canvasElement, args }) => {
    const canvas = within(canvasElement);
    const send = canvas.getByRole("button", { name: c.actions.send });
    await userEvent.click(send);
    await userEvent.tab();
    const publish = canvas.getByRole("button", { name: c.actions.publish });
    await expect(publish).toHaveFocus();
    await userEvent.keyboard("{Enter}");
    await expect(args.onAction).toHaveBeenCalledWith("publish");
    await expect(publish).toHaveClass("focus-visible:focus-ring");
  },
};
export const Mobile: Story = { args: { status: "sent" }, globals: { viewport: { value: "phone", isRotated: false } } };
