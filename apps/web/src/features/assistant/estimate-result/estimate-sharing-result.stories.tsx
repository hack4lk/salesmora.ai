import type { Meta, StoryObj } from "@storybook/nextjs-vite";
import { useState, type ComponentProps } from "react";
import { expect, fn, userEvent, within } from "storybook/test";
import type { EstimateShareChatView } from "@salesmora/contracts";
import { ConnectedEstimateSharing } from "./estimate-sharing-result";
import { estimateSharingFixture, estimateSharingWorkspaceId } from "./estimate-sharing.fixtures";
import { estimateSharingData as c } from "./estimate-sharing-client";

function mockReview(initial: EstimateShareChatView, fail = false) {
  const original = globalThis.fetch;
  let view = structuredClone(initial);
  globalThis.fetch = fn(async (_input, options) => {
    if (options?.method === "POST") {
      if (fail) return Response.json({ error: c.unavailable }, { status: 409 });
      const body = JSON.parse(String(options.body));
      if (body.decision === "open") return Response.json({ view, href: `/estimates/${view.ticket.estimate.id}?workspace=${estimateSharingWorkspaceId}` });
      view = structuredClone(view);
      view.ticket.state = body.decision === "confirm" ? "confirmed" : "cancelled";
      if (body.decision === "confirm") view.receipt = {
        estimateId: view.ticket.estimate.id, version: view.ticket.estimate.version + 1,
        snapshotHash: view.ticket.snapshotHash, status: view.ticket.actionType === "estimate.publish" ? "published" : "sent",
      };
    } else if (options?.method === "PATCH") {
      view = structuredClone(view);
      view.ticket.id = "10000000-0000-4000-8000-000000000006";
      view.ticket.inputHash = "d".repeat(64);
      view.review.recipientEmail = JSON.parse(String(options.body)).recipientEmail;
    }
    return Response.json({ view });
  });
  return () => { globalThis.fetch = original; };
}
const meta = {
  title: "Assistant/ConnectedEstimateSharing",
  component: ConnectedEstimateSharing,
  args: { ticket: estimateSharingFixture().ticket, workspaceId: estimateSharingWorkspaceId, onRefresh: fn(async () => {}), onNavigate: fn() },
  beforeEach: () => mockReview(estimateSharingFixture()),
  decorators: [(Story) => <main className="mx-auto w-full max-w-4xl bg-canvas p-4"><Story /></main>],
} satisfies Meta<typeof ConnectedEstimateSharing>;
export default meta;
type Story = StoryObj<typeof meta>;
export const Send: Story = {
  play: async ({ canvasElement }) => {
    await expect(await within(canvasElement).findByRole("button", { name: "Confirm and send" })).toBeEnabled();
    await expect(within(canvasElement).getAllByText("jordan.lee@example.com")[0]).toBeVisible();
  },
};
export const SendConfirmation: Story = {
  play: async ({ canvasElement, args }) => {
    const canvas = within(canvasElement);
    await userEvent.click(await canvas.findByRole("button", { name: "Confirm and send" }));
    await expect(await canvas.findByText(c.queued)).toBeVisible();
    await userEvent.click(canvas.getByRole("button", { name: c.open }));
    await expect(args.onNavigate).toHaveBeenCalledWith(`/estimates/${args.ticket.estimate.id}?workspace=${estimateSharingWorkspaceId}`);
  },
};
export const Cancellation: Story = {
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement);
    await userEvent.click(await canvas.findByRole("button", { name: c.cancel }));
    await expect(await canvas.findByText(c.cancelled)).toBeVisible();
  },
};
export const PublishReview: Story = {
  args: { ticket: estimateSharingFixture("estimate.publish").ticket },
  beforeEach: () => mockReview(estimateSharingFixture("estimate.publish")),
  play: async ({ canvasElement }) => {
    await userEvent.click(await within(canvasElement).findByRole("button", { name: c.review["estimate.publish"] }));
    const dialog = within(document.body).getByRole("alertdialog");
    await expect(within(dialog).getByRole("button", { name: "Confirm and publish" })).toBeEnabled();
  },
};
export const PublicationConfirmation: Story = {
  ...PublishReview,
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement);
    await userEvent.click(await canvas.findByRole("button", { name: c.review["estimate.publish"] }));
    await userEvent.click(within(within(document.body).getByRole("alertdialog")).getByRole("button", { name: "Confirm and publish" }));
    await expect(await canvas.findByText(c.published)).toBeVisible();
  },
};
export const ResendReview: Story = {
  args: { ticket: estimateSharingFixture("estimate.resend").ticket },
  beforeEach: () => mockReview(estimateSharingFixture("estimate.resend")),
  play: async ({ canvasElement }) => {
    await userEvent.click(await within(canvasElement).findByRole("button", { name: c.review["estimate.resend"] }));
    await expect(within(within(document.body).getByRole("alertdialog")).getByRole("button", { name: "Confirm resend" })).toBeEnabled();
  },
};
export const RecipientRefresh: Story = {
  ...ResendReview,
  play: async ({ canvasElement }) => {
    await userEvent.click(await within(canvasElement).findByRole("button", { name: c.review["estimate.resend"] }));
    const dialog = () => within(within(document.body).getByRole("alertdialog"));
    await userEvent.clear(dialog().getByRole("textbox", { name: /Delivery email/ }));
    await userEvent.type(dialog().getByRole("textbox", { name: /Delivery email/ }), "updated@example.test");
    await expect(dialog().getByRole("button", { name: "Review updated recipient" })).toBeEnabled();
    await userEvent.click(dialog().getByRole("button", { name: "Review updated recipient" }));
    await expect(await within(canvasElement).findByText(c.refreshed)).toBeInTheDocument();
    await expect(dialog().getByRole("button", { name: "Confirm resend" })).toBeEnabled();
    await expect(globalThis.fetch).not.toHaveBeenCalledWith(expect.anything(), expect.objectContaining({ method: "POST" }));
  },
};
export const RevisionReview: Story = {
  args: { ticket: estimateSharingFixture("estimate.send", true).ticket },
  beforeEach: () => mockReview(estimateSharingFixture("estimate.send", true)),
  play: async ({ canvasElement }) => {
    await userEvent.click(await within(canvasElement).findByRole("button", { name: c.review["estimate.send"] }));
    const dialog = within(within(document.body).getByRole("alertdialog"));
    await expect(dialog.getByRole("button", { name: "Confirm and send" })).toBeDisabled();
    await userEvent.click(dialog.getByRole("checkbox"));
    await expect(dialog.getByRole("button", { name: "Confirm and send" })).toBeEnabled();
  },
};
export const OperationFailure: Story = {
  beforeEach: () => mockReview(estimateSharingFixture(), true),
  play: async ({ canvasElement, args }) => {
    const canvas = within(canvasElement);
    await userEvent.click(await canvas.findByRole("button", { name: "Confirm and send" }));
    await expect(await canvas.findByText(c.unavailable)).toBeVisible();
    await expect(args.onNavigate).not.toHaveBeenCalled();
    await expect(canvas.queryByText("jordan.lee@example.com")).not.toBeInTheDocument();
  },
};
export const Disabled: Story = {
  args: { disabled: true },
  play: async ({ canvasElement }) => {
    await expect(within(canvasElement).queryByText("jordan.lee@example.com")).not.toBeInTheDocument();
    await expect(globalThis.fetch).not.toHaveBeenCalled();
  },
};
export const Expired: Story = {
  beforeEach: () => { const view = estimateSharingFixture(); view.ticket.state = "expired"; return mockReview(view); },
  play: async ({ canvasElement }) => {
    await expect(await within(canvasElement).findByText(c.expired)).toBeVisible();
    await expect(within(canvasElement).queryByRole("button", { name: "Confirm and send" })).not.toBeInTheDocument();
  },
};
export const MismatchedReview: Story = {
  beforeEach: () => { const view = estimateSharingFixture(); view.ticket.inputHash = "e".repeat(64); return mockReview(view); },
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement);
    await expect(await canvas.findByText(c.error)).toBeVisible();
    await expect(canvas.queryByRole("button", { name: "Confirm and send" })).not.toBeInTheDocument();
    await expect(canvas.queryByText("jordan.lee@example.com")).not.toBeInTheDocument();
  },
};
let releaseConfirmation: (() => void) | undefined;
function LateSharingHost(args: ComponentProps<typeof ConnectedEstimateSharing>) {
  const [disabled, setDisabled] = useState(false);
  return <div className="grid gap-3 print:hidden">
    <button type="button" onClick={() => setDisabled(true)}>Disable this host</button>
    <button type="button" onClick={() => releaseConfirmation?.()}>Release previous response</button>
    <ConnectedEstimateSharing {...args} disabled={disabled} />
  </div>;
}
export const LateConfirmation: Story = {
  render: args => <LateSharingHost {...args} />,
  beforeEach: () => {
    const original = globalThis.fetch;
    releaseConfirmation = undefined;
    globalThis.fetch = fn(async (_input, options) => {
      const view = estimateSharingFixture();
      if (options?.method === "POST") {
        return new Promise<Response>(resolve => {
          releaseConfirmation = () => {
            view.ticket.state = "confirmed";
            view.receipt = { estimateId: view.ticket.estimate.id, version: 4, snapshotHash: view.ticket.snapshotHash, status: "sent" };
            resolve(Response.json({ view }));
          };
        });
      }
      return Response.json({ view });
    });
    return () => { globalThis.fetch = original; releaseConfirmation = undefined; };
  },
  play: async ({ canvasElement, args }) => {
    const canvas = within(canvasElement);
    await userEvent.click(await canvas.findByRole("button", { name: "Confirm and send" }));
    await userEvent.click(canvas.getByRole("button", { name: "Disable this host" }));
    await userEvent.click(canvas.getByRole("button", { name: "Release previous response" }));
    await expect(args.onRefresh).not.toHaveBeenCalled();
    await expect(args.onNavigate).not.toHaveBeenCalled();
    await expect(canvas.queryByText(c.queued)).not.toBeInTheDocument();
  },
};
