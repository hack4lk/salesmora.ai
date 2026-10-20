import { useState } from "react";
import type { Meta, StoryObj } from "@storybook/react";
import { expect, fn, userEvent, within } from "storybook/test";
import {
  CustomerDraftCard,
  type CustomerDraftProposal,
} from "./customer-draft-card";
import {
  customerDraftCardData as copy,
  customerDraftFixtures as fixtures,
} from "./customer-draft-card.data";
const draft: CustomerDraftProposal = {
  id: "customer-proposal",
  action: "update",
  customer: fixtures.customer,
  changes: [fixtures.phone],
  state: "pending",
  expiresAt: new Date(Date.now() + 900000).toISOString(),
};
const meta = {
  title: "Assistant/CustomerDraftCard",
  component: CustomerDraftCard,
  args: { draft, onDecide: fn(async () => {}) },
  decorators: [
    (Story) => (
      <main className="mx-auto min-h-screen w-full max-w-3xl bg-canvas p-4 sm:p-8">
        <p className="mb-6 mt-0 text-sm text-muted">{fixtures.notice}</p>
        <Story />
      </main>
    ),
  ],
  render: function Preview(args) {
    const [state, setState] = useState(args.draft.state);
    return (
      <CustomerDraftCard
        {...args}
        draft={{ ...args.draft, state }}
        onDecide={async (proposal, decision, consent) => {
          if (consent) await args.onDecide!(proposal, decision, consent);
          else await args.onDecide!(proposal, decision);
          setState(decision === "confirm" ? "confirmed" : "canceled");
        }}
      />
    );
  },
} satisfies Meta<typeof CustomerDraftCard>;
export default meta;
type Story = StoryObj<typeof meta>;
export const Review: Story = {};
export const Create: Story = {
  args: { draft: { ...draft, action: "create", changes: [fixtures.name] } },
};
export const Archive: Story = {
  args: { draft: { ...draft, action: "archive", changes: [fixtures.archive] } },
};
export const Restore: Story = {
  args: { draft: { ...draft, action: "restore", changes: [fixtures.restore] } },
};
export const Delete: Story = {
  args: {
    draft: {
      ...draft,
      action: "delete",
      changes: [fixtures.delete],
      impact: fixtures.impact,
      unlinkLeadCount: 2,
    },
  },
};
export const Link: Story = {
  args: { draft: { ...draft, action: "link", changes: [fixtures.link] } },
};
export const Unlink: Story = {
  args: { draft: { ...draft, action: "unlink", changes: [fixtures.unlink] } },
};
export const Note: Story = {
  args: { draft: { ...draft, action: "note", changes: [fixtures.note] } },
};
export const Assignment: Story = {
  args: { draft: { ...draft, action: "assign", changes: [fixtures.owner] } },
};
export const Confirming: Story = {
  args: { draft: { ...draft, state: "confirming" } },
};
export const Confirmed: Story = {
  args: { draft: { ...draft, state: "confirmed" } },
};
export const Failed: Story = { args: { draft: { ...draft, state: "failed" } } };
export const Expired: Story = {
  args: { draft: { ...draft, expiresAt: "2020-01-01T00:00:00Z" } },
};
export const Superseded: Story = {
  args: { draft: { ...draft, state: "superseded" } },
};
export const Stale: Story = { args: { draft: { ...draft, state: "stale" } } };
export const PermissionLost: Story = { args: { disabled: true } };
export const Confirm: Story = {
  play: async ({ canvasElement, args }) => {
    const c = within(canvasElement);
    await userEvent.click(c.getByRole("button", { name: copy.confirm }));
    await expect(args.onDecide).toHaveBeenCalledWith(draft, "confirm");
    await expect(c.getByRole("status")).toHaveTextContent(
      copy.states.confirmed,
    );
  },
};
export const TypedDelete: Story = {
  ...Delete,
  play: async ({ canvasElement, args }) => {
    const c = within(canvasElement),
      button = c.getByRole("button", { name: copy.confirm });
    await expect(button).toBeDisabled();
    await userEvent.type(c.getByRole("textbox"), fixtures.customer.number);
    await expect(button).toBeDisabled();
    await userEvent.click(c.getByRole("checkbox"));
    await userEvent.click(button);
    await expect(args.onDecide).toHaveBeenCalledOnce();
  },
};
export const RequestFailure: Story = {
  args: {
    onDecide: fn(async () => {
      throw new Error("preview");
    }),
  },
  play: async ({ canvasElement }) => {
    const c = within(canvasElement);
    await userEvent.click(c.getByRole("button", { name: copy.confirm }));
    await expect(c.getByRole("alert")).toBeVisible();
    await expect(c.getByRole("button", { name: copy.confirm })).toBeEnabled();
  },
};

export const DeleteBlockedByJobs: Story = {
  args: {
    draft: {
      ...draft,
      action: "delete",
      changes: [fixtures.delete],
      activeJobCount: 1,
    },
  },
};
