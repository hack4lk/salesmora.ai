import type { Meta, StoryObj } from "@storybook/nextjs-vite";
import { expect, within } from "storybook/test";
import { estimatePaperDraftFixture, estimatePaperSnapshotFixture } from "../estimate-preview-paper/estimate-preview-paper.data";
import { EstimateDraftPreviewPage } from "./estimate-draft-preview-page";

const meta = {
  title: "Estimates/ConnectedDraftPreviewPage",
  component: EstimateDraftPreviewPage,
  args: {
    source: estimatePaperDraftFixture,
    backHref: "/estimates/fictional-estimate",
  },
} satisfies Meta<typeof EstimateDraftPreviewPage>;

export default meta;
type Story = StoryObj<typeof meta>;

export const SavedDraft: Story = {
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement);
    await expect(canvas.getByRole("heading", { name: "Estimate preview" })).toBeVisible();
    await expect(canvas.getByText("DRAFT")).toBeVisible();
    await expect(canvas.getByRole("link", { name: "Back to edit" })).toHaveAttribute(
      "href",
      "/estimates/fictional-estimate",
    );
    await expect(canvas.queryByText("STAFF_ONLY_SENTINEL_DO_NOT_PRINT")).not.toBeInTheDocument();
  },
};

export const FrozenSnapshot: Story = {
  args: { source: estimatePaperSnapshotFixture },
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement);
    await expect(canvas.getByRole("link", { name: "Back to estimate" })).toBeVisible();
    await expect(canvas.getByRole("button", { name: /^Print$/ })).toBeEnabled();
    await expect(canvas.queryByText("DRAFT")).not.toBeInTheDocument();
    await expect(canvas.getByText(/Review the frozen customer paper/)).toBeVisible();
  },
};
