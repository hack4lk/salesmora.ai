import type { Meta, StoryObj } from "@storybook/nextjs-vite";
import Link from "next/link";
import { expect, within, fn, userEvent } from "storybook/test";
import { EstimateDraftProposalEditor } from "./estimate-draft-editor";
import { estimateDraftViewFixture, estimateDraftWorkspaceId, estimateDraftEditorSeed } from "./estimate-draft.fixtures";
import { estimateDraftConnectedData as c } from "./estimate-draft-client";
import { estimateEditorRouteData as editorCopy } from "../../estimates/estimate-editor-page/estimate-editor-route.data";

const meta = {
  title: "Assistant/EstimateDraftProposalEditor",
  component: EstimateDraftProposalEditor,
  args: { initial: estimateDraftViewFixture(), seed: estimateDraftEditorSeed, workspaceId: estimateDraftWorkspaceId },
  beforeEach: ({ args }) => {
    const fetch = globalThis.fetch;
    globalThis.fetch = fn(async () => Response.json({ view: args.initial }));
    return () => { globalThis.fetch = fetch; };
  },
  decorators: [(Story) => <div className="mx-auto w-full max-w-6xl p-4"><Story /></div>],
} satisfies Meta<typeof EstimateDraftProposalEditor>;
export default meta;
type Story = StoryObj<typeof meta>;
export const Unsaved: Story = {
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement);
    await expect(canvas.getByRole("heading", { name: c.editorTitle })).toBeVisible();
    await expect(canvas.getByRole("button", { name: c.refresh })).toBeEnabled();
    await expect(canvas.queryByRole("button", { name: "Save Draft" })).not.toBeInTheDocument();
    await expect(canvas.queryByLabelText("Internal notes")).not.toBeInTheDocument();
  },
};
export const RefreshedReview: Story = {
  args: { initialReviewed: true },
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement);
    await expect(canvas.getByRole("button", { name: "Confirm Draft creation" })).toBeEnabled();
    await expect(canvas.queryByRole("textbox")).not.toBeInTheDocument();
  },
};
export const DirtyNavigation: Story = {
  render: args => <><Link href="/estimates">Return to estimates</Link><EstimateDraftProposalEditor {...args} /></>,
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement);
    await userEvent.type(canvas.getByRole("textbox", { name: c.name }), " updated");
    await userEvent.click(canvas.getByRole("link", { name: "Return to estimates" }));
    const dialog = within(canvasElement.ownerDocument.body).getByRole("dialog", { name: editorCopy.leaveTitle });
    await expect(dialog).toBeVisible();
    await userEvent.click(within(dialog).getByRole("button", { name: editorCopy.stay }));
    await expect(canvas.getByRole("textbox", { name: c.name })).toHaveValue("Repair estimate updated");
  },
};
