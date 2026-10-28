import { useState } from "react";
import type { EstimateEditorSeed } from "@salesmora/data";
import type { Meta, StoryObj } from "@storybook/nextjs-vite";
import { expect, fn, userEvent, waitFor, within } from "storybook/test";
import { estimateEditorInitialValues } from "./estimate-editor-page.data";
import { EstimateEditorForm, type EstimateEditorFormProps } from "./estimate-editor-form";
import { EstimateArchiveDialog } from "../estimate-archive-dialog/estimate-archive-dialog";
import { initialEstimateArchiveReview } from "../estimate-archive-dialog/estimate-archive-dialog.preview";
import { EstimatePreviewPaper } from "../estimate-preview-paper/estimate-preview-paper";
import { estimatePaperSnapshotFixture } from "../estimate-preview-paper/estimate-preview-paper.data";
import { estimatePaymentOptionData as payment } from "../estimate-payment-option/estimate-payment-option.data";
import { EstimateHistoryTimeline } from "../estimate-history-timeline/estimate-history-timeline";
import { estimateHistoryFixtures } from "../estimate-history-timeline/estimate-history-timeline.data";
import { EstimateStatusPanel } from "../estimate-status-panel/estimate-status-panel";
import { estimateCapabilitiesByRole as roles } from "../estimate-preview.data";
import { EstimateRevisionsPanel } from "../estimate-revisions-panel/estimate-revisions-panel";
import { estimateRevisionFixtures } from "../estimate-revisions-panel/estimate-revisions-panel.data";

const seed: EstimateEditorSeed = {
  workspaceId: "a0d6b18b-6aec-4f7d-a0be-e0de8bf648b1",
  timezone: "America/New_York",
  today: "2026-10-22",
  paperBusiness: {
    name: "Harbor Home Services",
    address: "245 Atlantic Avenue, Brooklyn, NY 11201",
    phone: "(718) 555-0148",
    email: "estimates@example.com",
    licenseLine: "",
    logoPath: null,
    requireServiceAddress: true,
  },
  parent: {
    type: "lead",
    id: "44444444-4444-4444-8444-444444444444",
    number: "LD-1048",
    name: "Kitchen remodel",
    status: "Qualified",
    service: "Kitchen remodel",
    customer: { id: "11111111-1111-4111-8111-111111111111", name: "Jordan Lee" },
    contactName: "Jordan Lee",
    recipientEmail: "jordan.lee@example.com",
    serviceAddress: "18 Maple Street, Brooklyn, NY 11201",
    href: "#lead",
  },
  existingEstimates: [],
  estimate: null,
  members: [{ id: "member-alex", name: "Alex Morgan" }],
  paymentPresets: [],
  defaults: {
    taxRate: "8.875",
    validUntil: "2026-11-21",
    message: "Thank you for the opportunity.",
    termsNote: "",
    deposit: { type: "none" },
  },
  capabilities: {
    void: true,
    archive: true,
    read: true,
    create: true,
    update: true,
    delete: true,
    assignOwner: true,
    browseMaterials: false,
    viewMaterialPrices: false,
  },
};

const meta = {
  title: "Estimates/ConnectedEditorForm",
  component: EstimateEditorForm,
  parameters: { layout: "fullscreen" },
  decorators: [(Story) => <main className="mx-auto w-full max-w-6xl p-4 sm:p-8"><Story /></main>],
  args: {
    seed,
    values: estimateEditorInitialValues(true),
    dirty: true,
    onChange: fn(),
    onSave: fn(),
    onPreview: fn(),
    onNavigate: fn(),
    onDuplicate: fn(),
    onDelete: fn(),
  },
} satisfies Meta<typeof EstimateEditorForm>;

export default meta;
type Story = StoryObj<typeof meta>;

async function openActions(canvasElement: HTMLElement) {
  await userEvent.click(within(canvasElement).getByRole("button", { name: /^Actions for / }));
  const menu = within(canvasElement.ownerDocument.body);
  await waitFor(() => expect(menu.getByRole("menu")).toBeVisible());
  return within(menu.getByRole("menu"));
}

export const NewDraft: Story = {
  play: async ({ canvasElement, args }) => {
    const canvas = within(canvasElement);
    await expect(canvas.getByRole("heading", { name: "Estimate" })).toBeVisible();
    await expect(canvas.getByText("LD-1048")).toBeVisible();
    await expect(canvas.getByRole("status")).toHaveTextContent("Unsaved changes");
    await expect(canvas.queryByRole("button", { name: /^Actions for / })).not.toBeInTheDocument();
    await userEvent.click(canvas.getByRole("button", { name: "Save draft" }));
    await expect(args.onSave).toHaveBeenCalledOnce();
  },
};

const savedDraftSeed: EstimateEditorSeed = {
  ...seed,
  estimate: {
    id: "55555555-5555-4555-8555-555555555555",
    number: "EST-2048",
    revision: 1,
    status: "draft",
    archived: false,
    version: 1,
    updatedAt: "Oct 23, 2026",
    sharing: "never-shared",
    parent: seed.parent!,
    values: {
      details: {
        name: "Kitchen remodel estimate",
        recipientName: "Jordan Lee",
        recipientEmail: "jordan.lee@example.com",
        serviceAddress: "18 Maple Street, Brooklyn, NY 11201",
        ownerId: "member-alex",
      },
      items: [],
      totals: { discount: { type: "none" }, taxRate: "8.875" },
      terms: {
        message: "Thank you for the opportunity.",
        validUntil: "2026-11-21",
        paymentTerms: "",
        termsNote: "",
        deposit: { type: "none" },
      },
      scope: "",
      internalNotes: "",
    },
  },
};

export const SavedDraftPreview: Story = {
  args: { seed: savedDraftSeed, dirty: false, onPreview: fn() },
  play: async ({ canvasElement, args }) => {
    const canvas = within(canvasElement);
    await expect(canvas.queryByRole("button", { name: "Preview" })).not.toBeInTheDocument();
    const menu = await openActions(canvasElement);
    const preview = menu.getByRole("menuitem", { name: "Preview" });
    await expect(preview).toBeEnabled();
    await userEvent.click(preview);
    await expect(args.onPreview).toHaveBeenCalledOnce();
    await waitFor(() => expect(within(canvasElement.ownerDocument.body).queryByRole("menu")).not.toBeInTheDocument());
    await expect(canvas.getByRole("button", { name: /^Actions for / })).toHaveFocus();
  },
};

export const SaveChangesBeforePreview: Story = {
  args: { seed: savedDraftSeed, dirty: true, onPreview: fn() },
  play: async ({ canvasElement, args }) => {
    const menu = await openActions(canvasElement);
    const preview = menu.getByRole("menuitem", { name: "Preview" });
    await expect(preview).toHaveAttribute("aria-disabled", "true");
    await expect(preview).toHaveAttribute(
      "title",
      "Save changes before previewing the Draft.",
    );
    await expect(menu.getByRole("menuitem", { name: "Duplicate" })).toHaveAttribute("aria-disabled", "true");
    await expect(args.onPreview).not.toHaveBeenCalled();
  },
};

export const SharingActions: Story = {
  args: { seed: savedDraftSeed, dirty: false, onSend: fn(), onPublish: fn() },
  play: async ({ canvasElement, args }) => {
    const canvas = within(canvasElement);
    await userEvent.click(canvas.getByRole("button", { name: "Review send" }));
    await expect(args.onSend).toHaveBeenCalledOnce();
    await userEvent.click(canvas.getByRole("button", { name: "Publish link" }));
    await expect(args.onPublish).toHaveBeenCalledOnce();
  },
};

export const SaveBeforeSharing: Story = {
  args: { seed: savedDraftSeed, dirty: true, onSend: fn(), onPublish: fn() },
  play: async ({ canvasElement, args }) => {
    const canvas = within(canvasElement);
    await expect(canvas.getByRole("button", { name: "Review send" })).toBeDisabled();
    await expect(canvas.getByRole("button", { name: "Publish link" })).toBeDisabled();
    await expect(args.onSend).not.toHaveBeenCalled();
    await expect(args.onPublish).not.toHaveBeenCalled();
  },
};

export const SharingPermissionDenied: Story = {
  args: { seed: savedDraftSeed, dirty: false },
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement);
    await expect(canvas.queryByRole("button", { name: "Review send" })).not.toBeInTheDocument();
    await expect(canvas.queryByRole("button", { name: "Publish link" })).not.toBeInTheDocument();
  },
};

const sharedSeed: EstimateEditorSeed = {
  ...savedDraftSeed,
  estimate: { ...savedDraftSeed.estimate!, status: "sent", sharing: "shared" },
  capabilities: { ...seed.capabilities, update: false, delete: false },
};
const lifecycleCapabilities = { ...roles.owner, update: false, decide: false, archive: false, send: false };
const sharedHistory = estimateHistoryFixtures.filter(event => event.kind !== "decision-recorded");
export const SharedLifecycle: Story = {
  args: {
    seed: sharedSeed, values: estimateEditorInitialValues(false), dirty: false, onVoid: fn(),
    statusPanel: <EstimateStatusPanel status="sent" parentType="lead" capabilities={lifecycleCapabilities} />,
    history: <EstimateHistoryTimeline events={sharedHistory} total={sharedHistory.length}
      timezone={seed.timezone} canRead />,
  },
  play: async ({ canvasElement, args }) => {
    const canvas = within(canvasElement);
    await expect(canvas.getByRole("heading", { name: "Estimate status", level: 2 })).toBeVisible();
    await expect(canvas.getByRole("heading", { name: "Estimate history" })).toBeVisible();
    await expect(canvas.queryByRole("button", { name: "Mark accepted" })).not.toBeInTheDocument();
    await expect(canvas.queryByRole("button", { name: "Preview" })).not.toBeInTheDocument();
    await expect(canvas.queryByRole("button", { name: "Duplicate" })).not.toBeInTheDocument();
    await expect(canvas.queryByRole("button", { name: "Void estimate" })).not.toBeInTheDocument();
    const menu = await openActions(canvasElement);
    await expect(menu.getAllByRole("menuitem")).toHaveLength(3);
    await expect(menu.getByRole("menuitem", { name: "Preview" })).toBeEnabled();
    await expect(menu.getByRole("menuitem", { name: "Duplicate" })).toBeEnabled();
    await userEvent.click(menu.getByRole("menuitem", { name: "Void estimate" }));
    await expect(args.onVoid).toHaveBeenCalledOnce();
  },
};
export const DecisionActions: Story = {
  args: {
    ...SharedLifecycle.args,
    statusPanel: <EstimateStatusPanel status="sent" parentType="lead"
      capabilities={{ ...lifecycleCapabilities, decide: true }} onAction={fn()} />,
  },
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement);
    await expect(canvas.getByRole("button", { name: "Mark accepted" })).toBeEnabled();
    await expect(canvas.getByRole("button", { name: "Mark declined" })).toBeEnabled();
    await expect(canvas.getByRole("button", { name: /^Actions for / })).toBeEnabled();
  },
};

export const RevisionActionsAndHistory: Story = {
  args: {
    ...SharedLifecycle.args, onRevise: fn(),
    revisions: <EstimateRevisionsPanel number="EST-2048" currentEstimateId="revision-2"
      revisions={estimateRevisionFixtures} total={3} canRead />,
  },
  play: async ({ canvasElement, args }) => {
    const canvas = within(canvasElement);
    await expect(canvas.getByRole("heading", { name: "Revision history" })).toBeVisible();
    const menu = await openActions(canvasElement);
    await expect(menu.getByRole("menuitem", { name: "Create revision" })).toBeEnabled();
    await userEvent.click(menu.getByRole("menuitem", { name: "Create revision" }));
    await expect(args.onRevise).toHaveBeenCalledOnce();
  },
};

function ArchiveComposition(args: EstimateEditorFormProps) {
  const [mode, setMode] = useState<"archive" | "restore" | null>(null);
  const record = args.seed.estimate!;
  const estimate = { ...record, name: record.values.details.name, recipientName: record.values.details.recipientName };
  return <>
    <EstimateEditorForm {...args}
      onArchive={() => { args.onArchive?.(); setMode("archive"); }}
      onRestore={() => { args.onRestore?.(); setMode("restore"); }} />
    {mode && <EstimateArchiveDialog open estimate={estimate} mode={mode}
      review={initialEstimateArchiveReview(estimate, mode)} capabilities={{ ...roles.owner, archive: args.seed.capabilities.archive }}
      onClose={() => setMode(null)} onConfirm={async () => { setMode(null); }} />}
  </>;
}

export const ArchiveFromActions: Story = {
  args: {
    ...SharedLifecycle.args, onArchive: fn(),
    seed: { ...sharedSeed, estimate: { ...sharedSeed.estimate!, status: "declined", version: 3 } },
    statusPanel: <EstimateStatusPanel status="declined" capabilities={lifecycleCapabilities} />,
  },
  render: args => <ArchiveComposition {...args} />,
  play: async ({ canvasElement, args }) => {
    const menu = await openActions(canvasElement);
    await userEvent.click(menu.getByRole("menuitem", { name: "Archive estimate" }));
    await expect(args.onArchive).toHaveBeenCalledOnce();
    const body = within(canvasElement.ownerDocument.body);
    const dialog = within(await body.findByRole("alertdialog"));
    await waitFor(() => expect(dialog.getByText("Kitchen remodel estimate")).toBeVisible());
    await expect(dialog.getByRole("button", { name: "Archive estimate" })).toBeEnabled();
    await userEvent.click(dialog.getByRole("button", { name: "Cancel" }));
    await waitFor(() => expect(body.queryByRole("alertdialog")).not.toBeInTheDocument());
    await expect(within(canvasElement).getByRole("button", { name: /^Actions for / })).toHaveFocus();
  },
};
export const RestoreFromActions: Story = {
  args: {
    ...ArchiveFromActions.args, onRestore: fn(),
    seed: { ...sharedSeed, estimate: { ...sharedSeed.estimate!, status: "declined", archived: true, version: 4 } },
    statusPanel: <EstimateStatusPanel status="declined" archived capabilities={lifecycleCapabilities} />,
  },
  render: ArchiveFromActions.render,
  play: async ({ canvasElement, args }) => {
    const menu = await openActions(canvasElement);
    await expect(menu.queryByRole("menuitem", { name: "Archive estimate" })).not.toBeInTheDocument();
    await userEvent.click(menu.getByRole("menuitem", { name: "Restore estimate" }));
    await expect(args.onRestore).toHaveBeenCalledOnce();
    const dialog = within(await within(canvasElement.ownerDocument.body).findByRole("alertdialog"));
    await expect(dialog.getByRole("button", { name: "Restore estimate" })).toBeEnabled();
    await waitFor(() => expect(dialog.getByText("List visibility still follows the current filters and revision rules. Restoring does not renew expired, withdrawn or replaced customer links.")).toBeVisible());
  },
};
export const ArchivePermissionDenied: Story = {
  args: {
    ...ArchiveFromActions.args,
    seed: { ...sharedSeed, capabilities: { ...sharedSeed.capabilities, archive: false },
      estimate: { ...sharedSeed.estimate!, status: "declined" } },
  },
  play: async ({ canvasElement }) => {
    const menu = await openActions(canvasElement);
    await expect(menu.queryByRole("menuitem", { name: "Archive estimate" })).not.toBeInTheDocument();
  },
};
export const ArchiveActiveRecordBlocked: Story = {
  args: { ...SharedLifecycle.args, onArchive: fn(), onRestore: fn() },
  play: async ({ canvasElement }) => {
    const menu = await openActions(canvasElement);
    await expect(menu.queryByRole("menuitem", { name: "Archive estimate" })).not.toBeInTheDocument();
    await expect(menu.queryByRole("menuitem", { name: "Restore estimate" })).not.toBeInTheDocument();
  },
};
export const ArchiveConflictingRecordBlocked: Story = {
  args: { ...ArchiveFromActions.args, conflict: true },
  play: async ({ canvasElement }) => {
    const menu = await openActions(canvasElement);
    await expect(menu.getByRole("menuitem", { name: "Archive estimate" })).toHaveAttribute("aria-disabled", "true");
  },
};
export const CorrectableDecision: Story = {
  args: {
    ...SharedLifecycle.args,
    seed: { ...sharedSeed, estimate: { ...sharedSeed.estimate!, status: "declined", version: 3 } },
    statusPanel: <EstimateStatusPanel status="declined" parentType="lead"
      capabilities={{ ...lifecycleCapabilities, decide: true }} canCorrectDecision
      convertedJob={{ number: "J-1208", href: "/jobs/job-1208" }}
      decision={{ outcome: "declined", decisionDate: "2026-10-23", channel: "phone", note: "Staff decision note" }}
      onAction={fn()} />,
  },
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement);
    await expect(canvas.getByRole("button", { name: "Correct decision" })).toBeEnabled();
    await expect(canvas.getByText("Staff decision note")).toBeVisible();
    await expect(canvas.getByRole("link", { name: "J-1208" })).toBeVisible();
    await expect(canvas.getByText("Job unchanged:", { exact: false })).toBeVisible();
  },
};
export const WithdrawnLifecycle: Story = {
  args: {
    ...SharedLifecycle.args,
    seed: { ...sharedSeed, estimate: { ...sharedSeed.estimate!, status: "void", version: 3 } },
    statusPanel: <EstimateStatusPanel status="void" capabilities={lifecycleCapabilities} />,
    history: <EstimateHistoryTimeline events={[{
      id: "void-event", kind: "voided", createdAt: "2026-10-24T19:00:00Z",
      source: { type: "ui", actorName: "Alex Morgan" }, reason: "The customer requested a different scope.",
      changes: [{ kind: "status", before: "sent", after: "void" }],
    }, ...sharedHistory]} total={4} timezone={seed.timezone} canRead />,
  },
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement);
    await expect(canvas.getByText("This estimate was withdrawn. Its customer link is no longer available.")).toBeVisible();
    await expect(canvas.getByText("The customer requested a different scope.")).toBeVisible();
    await expect(canvas.queryByRole("button", { name: "Void estimate" })).not.toBeInTheDocument();
    const menu = await openActions(canvasElement);
    await expect(menu.queryByRole("menuitem", { name: "Void estimate" })).not.toBeInTheDocument();
  },
};
export const WithdrawalPermissionDenied: Story = {
  args: { ...SharedLifecycle.args, seed: { ...sharedSeed, capabilities: { ...sharedSeed.capabilities, void: false } } },
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement);
    await expect(canvas.getByRole("heading", { name: "Estimate history" })).toBeVisible();
    await expect(canvas.queryByRole("button", { name: "Void estimate" })).not.toBeInTheDocument();
    const menu = await openActions(canvasElement);
    await expect(menu.queryByRole("menuitem", { name: "Void estimate" })).not.toBeInTheDocument();
  },
};

export const DuplicateFromActions: Story = {
  args: { ...SharedLifecycle.args, onDuplicate: fn() },
  play: async ({ canvasElement, args }) => {
    const menu = await openActions(canvasElement);
    await userEvent.click(menu.getByRole("menuitem", { name: "Duplicate" }));
    await expect(args.onDuplicate).toHaveBeenCalledOnce();
  },
};

export const ReadOnlyActions: Story = {
  args: {
    ...SharedLifecycle.args,
    seed: { ...sharedSeed, capabilities: { ...sharedSeed.capabilities, create: false, void: false } },
  },
  play: async ({ canvasElement }) => {
    const menu = await openActions(canvasElement);
    await expect(menu.getAllByRole("menuitem")).toHaveLength(1);
    await expect(menu.getByRole("menuitem", { name: "Preview" })).toBeEnabled();
  },
};

export const PendingActions: Story = {
  args: { ...SharedLifecycle.args, pending: true },
  play: async ({ canvasElement }) => {
    await expect(within(canvasElement).getByRole("button", { name: /^Actions for / })).toBeDisabled();
  },
};

export const ConflictingActions: Story = {
  args: { ...SharedLifecycle.args, conflict: true },
  play: async ({ canvasElement }) => {
    const menu = await openActions(canvasElement);
    for (const item of menu.getAllByRole("menuitem")) await expect(item).toHaveAttribute("aria-disabled", "true");
  },
};

export const KeyboardActions: Story = {
  args: { ...SharedLifecycle.args },
  play: async ({ canvasElement }) => {
    const trigger = within(canvasElement).getByRole("button", { name: /^Actions for / });
    trigger.focus();
    await userEvent.keyboard("{Enter}");
    const menu = within(canvasElement.ownerDocument.body).getByRole("menu");
    await expect(within(menu).getByRole("menuitem", { name: "Preview" })).toHaveFocus();
    await userEvent.keyboard("{ArrowDown}");
    await expect(within(menu).getByRole("menuitem", { name: "Duplicate" })).toHaveFocus();
    await userEvent.keyboard("{Escape}");
    await waitFor(() => expect(trigger).toHaveFocus());
  },
};

export const ThreeStepDetails: Story = {
  args: {
    values: { ...estimateEditorInitialValues(false), paymentLink: payment.stories.link },
    creation: {
      step: "details", onBack: fn(), onContinue: fn(),
      review: <EstimatePreviewPaper source={estimatePaperSnapshotFixture} showPrintControl={false} />,
      send: null,
    },
  },
  play: async ({ canvasElement, args }) => {
    const canvas = within(canvasElement);
    await expect(canvas.getByRole("navigation", { name: "Estimate creation progress" })).toBeVisible();
    await expect(canvas.getByRole("textbox", { name: payment.field })).toHaveValue(payment.stories.link);
    await expect(canvas.queryByRole("button", { name: "Review send" })).not.toBeInTheDocument();
    await userEvent.click(canvas.getByRole("button", { name: "Continue to review" }));
    await expect(args.creation?.onContinue).toHaveBeenCalledOnce();
  },
};
export const ThreeStepReview: Story = {
  args: {
    seed: savedDraftSeed, dirty: false,
    creation: {
      step: "review", onBack: fn(), onContinue: fn(),
      review: <EstimatePreviewPaper source={{
        ...estimatePaperSnapshotFixture,
        content: { ...estimatePaperSnapshotFixture.content, paymentLink: payment.stories.link },
      }} showPrintControl={false} />,
      send: null,
    },
  },
  play: async ({ canvasElement, args }) => {
    const canvas = within(canvasElement);
    await expect(canvas.getByRole("article").querySelector("a")).toHaveAttribute("href", payment.stories.link);
    await expect(canvas.queryByRole("textbox")).not.toBeInTheDocument();
    await userEvent.click(canvas.getByRole("button", { name: "Confirm and continue" }));
    await expect(args.creation?.onContinue).toHaveBeenCalledOnce();
  },
};
