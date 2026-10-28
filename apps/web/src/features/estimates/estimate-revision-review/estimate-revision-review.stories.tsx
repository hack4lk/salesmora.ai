import { useState } from "react";
import type { Meta, StoryObj } from "@storybook/nextjs-vite";
import { expect, fn, userEvent, within } from "storybook/test";
import { estimateButton, estimatePrimary } from "../estimate-ui";
import { EstimateRevisionReview, type EstimateRevisionReviewProps } from "./estimate-revision-review";
import { estimateRevisionReviewData as c, estimateRevisionReviewFixture as fixture } from "./estimate-revision-review.data";
import { reviewEstimateRevisionSharing, type EstimateRevisionReviewInput } from "./estimate-revision-review.preview";

function ReviewExample(props: EstimateRevisionReviewProps) {
  const [input, setInput] = useState<EstimateRevisionReviewInput>(props);
  const [confirmed, setConfirmed] = useState(false);
  const review = reviewEstimateRevisionSharing(input);
  return <div className="grid min-w-0 gap-4">
    <EstimateRevisionReview {...input} pending={props.pending} onChange={value => {
      if (props.pending) return;
      setConfirmed(false);
      setInput({ ...input, value });
      props.onChange(value);
    }} />
    <button type="button" className={estimatePrimary} disabled={props.pending || !review.confirmation}
      onClick={() => { if (review.confirmation) setConfirmed(true); }}>{c.stories.confirm}</button>
    {confirmed && <p role="status" className="m-0 text-sm">{c.stories.confirmed}</p>}
    <div className="flex flex-wrap gap-3 print:hidden">
      <button type="button" className={estimateButton} disabled={props.pending} onClick={() => {
        setConfirmed(false);
        setInput({
          ...input, estimate: { ...input.estimate, version: input.estimate.version + 1, totalCents: 124793 },
          preview: { state: "ready", estimateId: input.estimate.id, version: input.estimate.version + 1, snapshotHash: "b".repeat(64) },
        });
      }}>{c.stories.changePaper}</button>
      <button type="button" className={estimateButton} disabled={props.pending} onClick={() => {
        setConfirmed(false);
        setInput({ ...input, revision: { ...input.revision, sourceVersion: input.revision.sourceVersion + 1 } });
      }}>{c.stories.changeSource}</button>
      <button type="button" className={estimateButton} disabled={props.pending} onClick={() => {
        setConfirmed(false);
        setInput({ ...input, canRead: false });
      }}>{c.stories.revoke}</button>
    </div>
  </div>;
}

const meta = {
  title: "Estimates/EstimateRevisionReview",
  component: EstimateRevisionReview,
  args: { ...fixture, onChange: fn() },
  render: ReviewExample,
  decorators: [(Story) => <main className="mx-auto min-h-screen w-full max-w-2xl bg-canvas p-4 sm:p-8">
    <p className="m-0 mb-6 text-sm leading-6 text-muted">{c.stories.notice}</p>
    <Story />
  </main>],
} satisfies Meta<typeof EstimateRevisionReview>;
export default meta;
type Story = StoryObj<typeof meta>;

export const CarriedPaymentLink: Story = {
  play: async ({ canvasElement, args }) => {
    const canvas = within(canvasElement), confirm = canvas.getByRole("button", { name: c.stories.confirm });
    await expect(confirm).toBeDisabled();
    await userEvent.click(canvas.getByRole("checkbox", { name: c.acknowledge }));
    await expect(args.onChange).toHaveBeenCalledWith(expect.objectContaining({ paymentLinkReviewed: true, sourceVersion: 2 }));
    await expect(confirm).toBeEnabled();
    await userEvent.click(confirm);
    await expect(canvas.getByRole("status")).toHaveTextContent(c.stories.confirmed);
    await userEvent.click(canvas.getByRole("checkbox"));
    await expect(confirm).toBeDisabled();
  },
};
export const NoPaymentLink: Story = {
  args: { paymentLink: "", revision: { ...fixture.revision, requiresPaymentLinkReview: false } },
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement);
    await expect(canvas.queryByRole("checkbox")).not.toBeInTheDocument();
    await expect(canvas.getByText(c.noCarriedLink)).toBeVisible();
    await expect(canvas.getByRole("button", { name: c.stories.confirm })).toBeEnabled();
  },
};
export const ChangedPaymentLink: Story = {
  args: { paymentLink: "https://payments.example.test/new-revision", revision: { ...fixture.revision, requiresPaymentLinkReview: false } },
  play: NoPaymentLink.play,
};
export const ChangedDraftNeedsNewReview: Story = {
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement), checkbox = canvas.getByRole("checkbox");
    await userEvent.click(checkbox);
    await expect(canvas.getByRole("button", { name: c.stories.confirm })).toBeEnabled();
    await userEvent.click(canvas.getByRole("button", { name: c.stories.changePaper }));
    await expect(checkbox).not.toBeChecked();
    await expect(canvas.getByRole("button", { name: c.stories.confirm })).toBeDisabled();
    await userEvent.click(checkbox);
    await expect(canvas.getByRole("button", { name: c.stories.confirm })).toBeEnabled();
  },
};
export const ChangedSourceNeedsNewReview: Story = {
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement);
    await userEvent.click(canvas.getByRole("checkbox"));
    await userEvent.click(canvas.getByRole("button", { name: c.stories.changeSource }));
    await expect(canvas.getByRole("checkbox")).not.toBeChecked();
    await expect(canvas.getByRole("button", { name: c.stories.confirm })).toBeDisabled();
  },
};
export const AccessLost: Story = {
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement);
    await userEvent.click(canvas.getByRole("checkbox"));
    await userEvent.click(canvas.getByRole("button", { name: c.stories.revoke }));
    await expect(canvas.getByText(c.unavailable)).toBeVisible();
    await expect(canvas.queryByRole("checkbox")).not.toBeInTheDocument();
    await expect(canvas.queryByText(c.stories.paymentLink)).not.toBeInTheDocument();
    await expect(canvas.queryByText(c.replacement(c.stories.number, 1, 2))).not.toBeInTheDocument();
    await expect(canvas.getByRole("button", { name: c.stories.confirm })).toBeDisabled();
  },
};
export const Pending: Story = {
  args: { pending: true },
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement);
    await expect(canvas.getByRole("checkbox")).toBeDisabled();
    await expect(canvas.getByRole("button", { name: c.stories.confirm })).toBeDisabled();
  },
};
export const AccessDenied: Story = { args: { canRead: false } };
export const PermissionLost: Story = { args: { canSend: false } };
export const SourceAccepted: Story = { args: { revision: { ...fixture.revision, sourceStatus: "accepted" } } };
export const StalePreview: Story = { args: { preview: { state: "stale" } } };
export const ExpiredSource: Story = { args: { revision: { ...fixture.revision, sourceStatus: "expired" } } };
export const LongNumberAndLink: Story = {
  args: {
    estimate: { ...fixture.estimate, number: "EST-1234567890123456789012345678901234567890" },
    paymentLink: `https://payments.example.test/${"checkout/".repeat(24)}revision-2`,
  },
};
export const KeyboardNavigation: Story = {
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement), checkbox = canvas.getByRole("checkbox");
    await userEvent.tab();
    await expect(checkbox).toHaveFocus();
    await userEvent.keyboard(" ");
    await expect(checkbox).toBeChecked();
    await userEvent.tab();
    await expect(canvas.getByRole("button", { name: c.stories.confirm })).toHaveFocus();
  },
};
