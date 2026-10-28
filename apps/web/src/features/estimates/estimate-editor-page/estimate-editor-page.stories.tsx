import { useState } from "react";
import type { Meta, StoryObj } from "@storybook/nextjs-vite";
import { expect, fireEvent, fn, userEvent, waitFor, within } from "storybook/test";
import { copy as pickerCopy, pickerOptions } from "../../materials/material-picker/material-picker.data";
import { estimateArchiveDialogData as archiveCopy } from "../estimate-archive-dialog/estimate-archive-dialog.data";
import { estimateConvertDialogData as conversionCopy } from "../estimate-convert-dialog/estimate-convert-dialog.data";
import { estimateDecisionDialogData as decisionCopy } from "../estimate-decision-dialog/estimate-decision-dialog.data";
import { estimateDeleteDraftDialogData as deleteCopy } from "../estimate-delete-draft-dialog/estimate-delete-draft-dialog.data";
import { estimateDeliveryCardData as deliveryCopy } from "../estimate-delivery-card/estimate-delivery-card.data";
import { estimateDetailsCardData as detailsCopy } from "../estimate-details-card/estimate-details-card.data";
import { estimateItemsEditorData as itemsCopy } from "../estimate-items-editor/estimate-items-editor.data";
import { estimatePreviewPaperData as paperCopy } from "../estimate-preview-paper/estimate-preview-paper.data";
import { estimatePublishDialogData as publishCopy } from "../estimate-publish-dialog/estimate-publish-dialog.data";
import { estimateRowMenuData as menuCopy } from "../estimate-row-menu/estimate-row-menu.data";
import { estimateSendDialogData as sendCopy } from "../estimate-send-dialog/estimate-send-dialog.data";
import { estimateStatusPanelData as statusCopy } from "../estimate-status-panel/estimate-status-panel.data";
import { estimateVoidDialogData as voidCopy } from "../estimate-void-dialog/estimate-void-dialog.data";
import { estimateButton } from "../estimate-ui";
import { EstimateEditorPagePreview, type EstimateEditorPagePreviewProps } from "./estimate-editor-page";
import { estimateEditorPageData as c, estimateEditorSnapshot } from "./estimate-editor-page.data";

const meta = {
  title: "Estimates/EstimateEditorPage",
  component: EstimateEditorPagePreview,
  parameters: { layout: "fullscreen" },
  args: { onRequest: fn() },
} satisfies Meta<typeof EstimateEditorPagePreview>;
export default meta;
type Story = StoryObj<typeof meta>;

async function editName(canvasElement: HTMLElement) {
  fireEvent.change(within(canvasElement).getByRole("textbox", { name: /^Estimate name/ }), { target: { value: c.stories.editedName } });
}
async function openMenu(canvasElement: HTMLElement, action: keyof typeof menuCopy.actions) {
  await userEvent.click(within(canvasElement).getByRole("button", { name: menuCopy.label(c.stories.name) }));
  await userEvent.click(within(canvasElement.ownerDocument.body).getByRole("menuitem", { name: menuCopy.actions[action] }));
}
function reviewDialog(canvasElement: HTMLElement) {
  return within(within(canvasElement.ownerDocument.body).getByRole("alertdialog"));
}
async function assertNoRequest(args: EstimateEditorPagePreviewProps) {
  await expect(args.onRequest).not.toHaveBeenCalled();
}

export const Draft: Story = {
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement);
    await expect(canvas.getByRole("heading", { level: 1, name: c.stories.name })).toBeVisible();
    await expect(canvas.getByRole("button", { name: c.save })).toBeDisabled();
    await expect(canvas.getByRole("button", { name: statusCopy.actions.send })).toBeEnabled();
    await expect(canvas.getAllByText("$969.17").length).toBeGreaterThan(0);
    await expect(canvas.getByRole("complementary", { name: c.rail })).toBeVisible();
  },
};
export const AdminDraft: Story = { args: { role: "admin" } };
export const NewFromLead: Story = {
  args: { scenario: "new-lead" },
  play: async ({ canvasElement, args }) => {
    const canvas = within(canvasElement);
    await expect(canvas.getByText(c.neverSaved)).toBeVisible();
    await editName(canvasElement);
    await userEvent.click(canvas.getByRole("button", { name: c.save }));
    await expect(args.onRequest).toHaveBeenCalledWith(expect.objectContaining({ type: "save", expectedVersion: 0 }));
    await expect(canvas.getByText(c.saveRequest)).toBeVisible();
    await expect(canvas.getByRole("button", { name: statusCopy.actions.publish })).toBeDisabled();
    await expect(canvas.getByText(c.neverSaved)).toBeVisible();
  },
};
export const NewFromJob: Story = { args: { scenario: "new-job", role: "office" } };
export const EditAndRequestSave: Story = {
  play: async ({ canvasElement, args }) => {
    const canvas = within(canvasElement);
    await editName(canvasElement);
    await expect(canvas.getByText(c.unsaved)).toBeVisible();
    await expect(canvas.getByRole("button", { name: statusCopy.actions.send })).toBeDisabled();
    await userEvent.click(canvas.getByRole("button", { name: c.save }));
    await expect(args.onRequest).toHaveBeenCalledWith(expect.objectContaining({
      type: "save", expectedVersion: 3, value: expect.objectContaining({ details: expect.objectContaining({ name: c.stories.editedName }) }),
    }));
    await expect(canvas.getByText(c.saveRequest)).toBeVisible();
    await expect(canvas.getByText(c.unsaved)).toBeVisible();
  },
};
export const SimulatedHostSave: Story = {
  args: { saveBehavior: "host-saved" },
  play: async ({ canvasElement, args }) => {
    const canvas = within(canvasElement);
    await editName(canvasElement);
    await userEvent.click(canvas.getByRole("button", { name: c.save }));
    await expect(canvas.getByText(c.saved)).toBeVisible();
    await expect(canvas.queryByText(c.unsaved)).not.toBeInTheDocument();
    await userEvent.click(canvas.getByRole("button", { name: statusCopy.actions.send }));
    const dialog = reviewDialog(canvasElement);
    await userEvent.click(dialog.getByRole("button", { name: sendCopy.confirm.send }));
    await expect(args.onRequest).toHaveBeenLastCalledWith({
      type: "send", request: {
        mode: "send", estimateId: estimateEditorSnapshot.estimateId, expectedVersion: 4, snapshotHash: "sample-editor-saved-v4",
        recipientEmail: estimateEditorSnapshot.content.recipientEmail, subject: c.subject(estimateEditorSnapshot.content.number),
      },
    });
    await expect(canvas.getByText(c.actionRequest)).toBeVisible();
    await expect(canvas.getByRole("button", { name: statusCopy.actions.send })).toBeEnabled();
  },
};
export const EmptyDraftCanSave: Story = {
  args: { emptyDraft: true, saveBehavior: "host-saved" },
  play: async ({ canvasElement, args }) => {
    const canvas = within(canvasElement);
    await editName(canvasElement);
    await userEvent.click(canvas.getByRole("button", { name: c.save }));
    await expect(canvas.getByText(c.saved)).toBeVisible();
    await expect(args.onRequest).toHaveBeenCalledWith(expect.objectContaining({
      type: "save", value: expect.objectContaining({ items: [], details: expect.objectContaining({ recipientName: "", recipientEmail: "" }), terms: expect.objectContaining({ validUntil: "" }) }),
    }));
    await userEvent.click(canvas.getByRole("button", { name: statusCopy.actions.send }));
    await expect(reviewDialog(canvasElement).getByRole("button", { name: sendCopy.confirm.send })).toBeDisabled();
  },
};
export const SaveFailureRetainsEdits: Story = {
  args: { saveBehavior: "error" },
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement);
    await editName(canvasElement);
    await userEvent.click(canvas.getByRole("button", { name: c.save }));
    await expect(canvas.getByText(c.saveError)).toBeVisible();
    await expect(canvas.getByRole("textbox", { name: /^Estimate name/ })).toHaveValue(c.stories.editedName);
    await expect(canvas.getByText(c.unsaved)).toBeVisible();
  },
};
export const ValidationErrors: Story = {
  args: { invalidDraft: true },
  play: async ({ canvasElement, args }) => {
    const canvas = within(canvasElement);
    await userEvent.click(canvas.getByRole("button", { name: c.save }));
    await expect(canvas.getByText(c.validation)).toBeVisible();
    await expect(canvas.getByRole("textbox", { name: /^Estimate name/ })).toHaveAttribute("aria-invalid", "true");
    await expect(canvas.getByRole("textbox", { name: new RegExp(detailsCopy.recipientEmail) })).toHaveValue(c.stories.invalidEmail);
    await assertNoRequest(args);
  },
};
export const IncompleteAddedLineBlocksSave: Story = {
  play: async ({ canvasElement, args }) => {
    const canvas = within(canvasElement);
    await userEvent.click(canvas.getByRole("button", { name: itemsCopy.add }));
    await userEvent.click(canvas.getByRole("button", { name: c.save }));
    await expect(canvas.getByText(c.validation)).toBeVisible();
    const line = within(canvas.getByRole("group", { name: itemsCopy.line(4) }));
    await expect(line.getByRole("textbox", { name: /^Description/ })).toHaveAttribute("aria-invalid", "true");
    await assertNoRequest(args);
  },
};
export const LiveTotals: Story = {
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement);
    const line = within(canvas.getByRole("group", { name: itemsCopy.line(1) }));
    fireEvent.change(line.getByRole("textbox", { name: itemsCopy.quantity }), { target: { value: "4" } });
    await expect(canvas.getAllByText("$1,147.30").length).toBeGreaterThan(0);
    await expect(canvas.getAllByText("$286.83").length).toBeGreaterThan(0);
    await expect(canvas.getByRole("button", { name: statusCopy.actions.publish })).toBeDisabled();
  },
};
export const MaterialsSelection: Story = {
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement);
    await userEvent.click(canvas.getByRole("button", { name: itemsCopy.addMaterial }));
    await userEvent.click(canvas.getByRole("combobox", { name: pickerCopy.label }));
    await userEvent.click(await canvas.findByRole("option", { name: new RegExp(pickerOptions[0].name) }));
    await expect(canvas.getByRole("group", { name: itemsCopy.line(4) })).toBeVisible();
    await expect(canvas.getByText(c.unsaved)).toBeVisible();
  },
};
export const NoCatalogAccess: Story = { args: { catalog: null } };
export const LongContent: Story = { args: { longContent: true } };
export const BusinessLogoPreview: Story = { args: { businessLogoPath: c.stories.logoPath, initialOverlay: "preview" } };
export const BrokenLogoPreview: Story = { args: { businessLogoPath: c.stories.brokenLogoPath, initialOverlay: "preview" } };
export const DraftPreview: Story = {
  play: async ({ canvasElement, args }) => {
    const canvas = within(canvasElement);
    await editName(canvasElement);
    await userEvent.click(canvas.getByRole("button", { name: c.preview }));
    await expect(canvas.getByRole("button", { name: c.closePreview })).toHaveFocus();
    const paper = canvas.getByRole("article");
    await expect(paper).toHaveTextContent(c.stories.editedName);
    await expect(paper).not.toHaveTextContent("STAFF_ONLY_EDITOR_SENTINEL");
    await expect(canvas.getByRole("textbox", { name: /^Estimate name/, hidden: true })).not.toBeVisible();
    await userEvent.click(canvas.getByRole("button", { name: c.closePreview }));
    await expect(canvas.getByRole("button", { name: c.preview })).toHaveFocus();
    await expect(canvas.getByRole("textbox", { name: /^Estimate name/ })).toHaveValue(c.stories.editedName);
    await assertNoRequest(args);
  },
};
export const IncompleteNewPreview: Story = { args: { scenario: "new-lead", initialOverlay: "preview" } };
export const MissingBusinessBlocksSend: Story = {
  args: { missingBusiness: true },
  play: async ({ canvasElement, args }) => {
    await userEvent.click(within(canvasElement).getByRole("button", { name: statusCopy.actions.send }));
    const dialog = reviewDialog(canvasElement);
    await waitFor(() => expect(dialog.getByText(paperCopy.issues.business)).toBeVisible());
    await expect(dialog.getByRole("button", { name: sendCopy.confirm.send })).toBeDisabled();
    await assertNoRequest(args);
  },
};
export const Sent: Story = { args: { scenario: "sent" } };
export const Published: Story = { args: { scenario: "published" } };
export const Accepted: Story = { args: { scenario: "accepted" } };
export const AcceptedFromJob: Story = {
  args: { scenario: "accepted", parentType: "job" },
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement);
    await expect(canvas.getByText(statusCopy.parentJobHint)).toBeVisible();
    await expect(canvas.queryByRole("button", { name: statusCopy.actions.convert })).not.toBeInTheDocument();
  },
};
export const AlreadyConverted: Story = {
  args: { scenario: "accepted", converted: true },
  play: async ({ canvasElement }) => {
    await expect(within(canvasElement).getByText(statusCopy.convertedHint)).toBeVisible();
    await expect(within(canvasElement).queryByRole("button", { name: statusCopy.actions.convert })).not.toBeInTheDocument();
  },
};
export const Declined: Story = { args: { scenario: "declined" } };
export const Expired: Story = { args: { scenario: "expired" } };
export const Superseded: Story = { args: { scenario: "superseded" } };
export const Void: Story = { args: { scenario: "void" } };
export const Archived: Story = { args: { scenario: "declined", archived: true } };
export const SnapshotIgnoresCurrentBusiness: Story = {
  args: { scenario: "sent", changedCurrentBusiness: true, initialOverlay: "preview" },
  play: async ({ canvasElement }) => {
    const paper = within(canvasElement).getByRole("article");
    await expect(paper).toHaveTextContent(estimateEditorSnapshot.content.business.name);
    await expect(paper).not.toHaveTextContent(c.stories.changedBusiness);
    await expect(paper).not.toHaveTextContent("STAFF_ONLY_EDITOR_SENTINEL");
    await expect(within(canvasElement).queryByText(paperCopy.draft)).not.toBeInTheDocument();
  },
};
export const MissingSnapshot: Story = {
  args: { scenario: "sent", missingSnapshot: true, initialOverlay: "preview" },
  play: async ({ canvasElement }) => {
    await expect(within(canvasElement).queryByRole("article")).not.toBeInTheDocument();
    await expect(within(canvasElement).getByRole("button", { name: paperCopy.print })).toBeDisabled();
  },
};
export const ReadOnlyDraft: Story = {
  args: { capabilities: { update: false } },
  play: async ({ canvasElement }) => {
    await expect(within(canvasElement).queryByRole("textbox", { name: /^Estimate name/ })).not.toBeInTheDocument();
    await expect(within(canvasElement).queryByRole("button", { name: c.save })).not.toBeInTheDocument();
  },
};
export const NoSendPermission: Story = {
  args: { capabilities: { send: false } },
  play: async ({ canvasElement }) => {
    await expect(within(canvasElement).queryByRole("button", { name: statusCopy.actions.send })).not.toBeInTheDocument();
    await expect(within(canvasElement).queryByRole("button", { name: statusCopy.actions.publish })).not.toBeInTheDocument();
  },
};
export const NoJobCreationGrant: Story = {
  args: { scenario: "accepted", canCreateJob: false },
  play: async ({ canvasElement }) => {
    await expect(within(canvasElement).queryByRole("button", { name: statusCopy.actions.convert })).not.toBeInTheDocument();
  },
};
export const NoDecisionCorrectionGrant: Story = {
  args: { scenario: "declined", canCorrectDecision: false },
  play: async ({ canvasElement }) => {
    await expect(within(canvasElement).queryByRole("button", { name: statusCopy.actions["correct-decision"] })).not.toBeInTheDocument();
  },
};
export const FieldAssignedJob: Story = {
  args: { role: "field", parentType: "job", catalog: null, capabilities: { void: true, archive: true, delete: true } },
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement);
    await expect(canvas.getByRole("textbox", { name: /^Estimate name/ })).toBeVisible();
    await expect(canvas.queryByRole("combobox", { name: detailsCopy.owner })).not.toBeInTheDocument();
    await openMenu(canvasElement, "duplicate");
    await expect(canvas.getByText(c.createDraftRequest)).toBeVisible();
  },
};
async function assertUnavailable(canvasElement: HTMLElement) {
  const canvas = within(canvasElement);
  await expect(canvas.queryByRole("textbox", { name: /^Estimate name/ })).not.toBeInTheDocument();
  await expect(canvas.queryByRole("button", { name: c.preview })).not.toBeInTheDocument();
  await expect(canvas.queryByText(c.stories.notes)).not.toBeInTheDocument();
  await expect(canvas.queryByText(estimateEditorSnapshot.content.recipientEmail)).not.toBeInTheDocument();
}
export const FieldUnassignedJob: Story = { args: { role: "field", parentType: "job", assignedJob: false }, play: async ({ canvasElement }) => assertUnavailable(canvasElement) };
export const FieldLeadUnavailable: Story = { args: { role: "field" }, play: async ({ canvasElement }) => assertUnavailable(canvasElement) };
export const NoReadAccess: Story = { args: { capabilities: { read: false } }, play: async ({ canvasElement }) => assertUnavailable(canvasElement) };
export const Loading: Story = { args: { state: "loading" }, play: async ({ canvasElement }) => assertUnavailable(canvasElement) };
export const LoadError: Story = { args: { state: "error" }, play: async ({ canvasElement }) => assertUnavailable(canvasElement) };
export const NotFound: Story = { args: { state: "not-found" }, play: async ({ canvasElement }) => assertUnavailable(canvasElement) };
export const VersionConflict: Story = {
  args: { conflict: true },
  play: async ({ canvasElement, args }) => {
    const canvas = within(canvasElement);
    await expect(canvas.getByText(c.conflict)).toBeVisible();
    await expect(canvas.getByRole("button", { name: c.save })).toBeDisabled();
    await userEvent.click(canvas.getByRole("button", { name: c.reload }));
    await expect(canvas.getByRole("textbox", { name: /^Estimate name/ })).toHaveValue(c.stories.reloadedName);
    await assertNoRequest(args);
    await userEvent.click(canvas.getByRole("button", { name: statusCopy.actions.send }));
    await userEvent.click(reviewDialog(canvasElement).getByRole("button", { name: sendCopy.confirm.send }));
    await expect(args.onRequest).toHaveBeenCalledWith({ type: "send", request: expect.objectContaining({ expectedVersion: 4, snapshotHash: "sample-editor-saved-v4" }) });
  },
};
export const ConflictPreservesEditsUntilDiscard: Story = {
  args: { conflict: true, invalidDraft: true },
  play: async ({ canvasElement, args }) => {
    const canvas = within(canvasElement);
    await expect(canvas.getByText(c.stories.invalidEmail)).toBeVisible();
    await userEvent.click(canvas.getByRole("button", { name: c.reload }));
    await userEvent.click(reviewDialog(canvasElement).getByRole("button", { name: c.stay }));
    await waitFor(() => expect(canvas.getByRole("button", { name: c.reload })).toBeVisible());
    await expect(canvas.getByText(c.stories.invalidEmail)).toBeVisible();
    await userEvent.click(canvas.getByRole("button", { name: c.reload }));
    await userEvent.click(reviewDialog(canvasElement).getByRole("button", { name: c.reloadConfirm }));
    await waitFor(() => expect(canvas.getByRole("textbox", { name: new RegExp(detailsCopy.recipientEmail) })).toHaveValue(estimateEditorSnapshot.content.recipientEmail));
    await assertNoRequest(args);
  },
};
export const Pending: Story = {
  args: { pending: true },
  play: async ({ canvasElement, args }) => {
    const canvas = within(canvasElement);
    await expect(canvas.getByRole("textbox", { name: /^Estimate name/ })).toBeDisabled();
    await expect(canvas.getByRole("button", { name: c.preview })).toBeDisabled();
    await assertNoRequest(args);
  },
};
export const UnsavedNavigation: Story = {
  play: async ({ canvasElement, args }) => {
    const canvas = within(canvasElement);
    await editName(canvasElement);
    await userEvent.click(canvas.getByRole("button", { name: c.back }));
    await userEvent.click(reviewDialog(canvasElement).getByRole("button", { name: c.stay }));
    await waitFor(() => expect(canvas.getByRole("textbox", { name: /^Estimate name/ })).toHaveValue(c.stories.editedName));
    await userEvent.click(canvas.getByRole("button", { name: c.back }));
    await userEvent.click(reviewDialog(canvasElement).getByRole("button", { name: c.discard }));
    await waitFor(() => expect(canvas.getByRole("textbox", { name: /^Estimate name/ })).toHaveValue(c.stories.name));
    await expect(canvas.queryByText(c.unsaved)).not.toBeInTheDocument();
    await assertNoRequest(args);
  },
};
export const LinkedRecordNavigationGuard: Story = {
  play: async ({ canvasElement, args }) => {
    const canvas = within(canvasElement);
    await editName(canvasElement);
    await userEvent.click(canvas.getByRole("link", { name: /^Open lead/ }));
    await userEvent.click(reviewDialog(canvasElement).getByRole("button", { name: c.stay }));
    await waitFor(() => expect(canvas.getByRole("textbox", { name: /^Estimate name/ })).toHaveValue(c.stories.editedName));
    await assertNoRequest(args);
  },
};
export const SendReview: Story = {
  play: async ({ canvasElement, args }) => {
    const canvas = within(canvasElement);
    await userEvent.click(canvas.getByRole("button", { name: statusCopy.actions.send }));
    const dialog = reviewDialog(canvasElement);
    await expect(dialog.getAllByText("$969.17", { selector: "span" }).length).toBeGreaterThan(0);
    await expect(dialog.getByRole("article")).not.toHaveTextContent("STAFF_ONLY_EDITOR_SENTINEL");
    await assertNoRequest(args);
    await userEvent.click(dialog.getByRole("button", { name: sendCopy.confirm.send }));
    await expect(args.onRequest).toHaveBeenCalledWith({
      type: "send", request: { mode: "send", estimateId: estimateEditorSnapshot.estimateId, expectedVersion: 3,
        snapshotHash: "sample-editor-saved-v3", recipientEmail: estimateEditorSnapshot.content.recipientEmail, subject: c.subject(estimateEditorSnapshot.content.number) },
    });
    await expect(canvas.getByText(c.actionRequest)).toBeVisible();
  },
};
export const CancelSend: Story = {
  play: async ({ canvasElement, args }) => {
    const canvas = within(canvasElement);
    const trigger = canvas.getByRole("button", { name: statusCopy.actions.send });
    await userEvent.click(trigger);
    await userEvent.click(reviewDialog(canvasElement).getByRole("button", { name: sendCopy.cancel }));
    await waitFor(() => expect(trigger).toHaveFocus());
    await assertNoRequest(args);
  },
};
export const PublishReview: Story = {
  play: async ({ canvasElement, args }) => {
    await userEvent.click(within(canvasElement).getByRole("button", { name: statusCopy.actions.publish }));
    const dialog = reviewDialog(canvasElement);
    await expect(dialog.getByRole("article")).not.toHaveTextContent("STAFF_ONLY_EDITOR_SENTINEL");
    await userEvent.click(dialog.getByRole("button", { name: publishCopy.confirm }));
    await expect(args.onRequest).toHaveBeenCalledWith({ type: "publish", request: expect.objectContaining({ estimateId: estimateEditorSnapshot.estimateId, expectedVersion: 3, snapshotHash: "sample-editor-saved-v3" }) });
  },
};
export const RecordAcceptance: Story = {
  args: { scenario: "sent" },
  play: async ({ canvasElement, args }) => {
    await userEvent.click(within(canvasElement).getByRole("button", { name: statusCopy.actions["mark-accepted"] }));
    const dialog = reviewDialog(canvasElement);
    await userEvent.selectOptions(dialog.getByRole("combobox", { name: decisionCopy.channel }), "phone");
    await userEvent.click(dialog.getByRole("button", { name: decisionCopy.confirm }));
    await expect(args.onRequest).toHaveBeenCalledWith({ type: "decision", request: { mode: "record", estimateId: estimateEditorSnapshot.estimateId, expectedVersion: 3, outcome: "accepted", decisionDate: c.today, channel: "phone", note: "" } });
    await expect(within(canvasElement).getByRole("button", { name: statusCopy.actions["mark-accepted"] })).toBeEnabled();
  },
};
export const RecordDecline: Story = {
  args: { scenario: "published" },
  play: async ({ canvasElement, args }) => {
    await userEvent.click(within(canvasElement).getByRole("button", { name: statusCopy.actions["mark-declined"] }));
    const dialog = reviewDialog(canvasElement);
    await userEvent.selectOptions(dialog.getByRole("combobox", { name: decisionCopy.channel }), "email");
    await userEvent.click(dialog.getByRole("button", { name: decisionCopy.confirm }));
    await expect(args.onRequest).toHaveBeenCalledWith({ type: "decision", request: expect.objectContaining({ mode: "record", outcome: "declined", channel: "email" }) });
  },
};
export const CorrectDecision: Story = {
  args: { scenario: "declined" },
  play: async ({ canvasElement, args }) => {
    await userEvent.click(within(canvasElement).getByRole("button", { name: statusCopy.actions["correct-decision"] }));
    const dialog = reviewDialog(canvasElement);
    await expect(dialog.getByRole("button", { name: decisionCopy.confirmCorrection })).toBeDisabled();
    fireEvent.change(dialog.getByRole("textbox", { name: new RegExp(decisionCopy.reason) }), { target: { value: decisionCopy.stories.correctionReason } });
    await userEvent.selectOptions(dialog.getByRole("combobox", { name: decisionCopy.outcome }), "accepted");
    await userEvent.click(dialog.getByRole("button", { name: decisionCopy.confirmCorrection }));
    await expect(args.onRequest).toHaveBeenCalledWith({ type: "decision", request: expect.objectContaining({ mode: "correct", outcome: "accepted", reason: decisionCopy.stories.correctionReason }) });
  },
};
export const ConversionReview: Story = {
  args: { scenario: "accepted" },
  play: async ({ canvasElement, args }) => {
    await userEvent.click(within(canvasElement).getByRole("button", { name: statusCopy.actions.convert }));
    const dialog = within(within(canvasElement.ownerDocument.body).getByRole("dialog", { name: conversionCopy.title }));
    await waitFor(() => expect(dialog.getByText(conversionCopy.amountHint)).toBeVisible());
    await userEvent.click(dialog.getByRole("button", { name: conversionCopy.confirm }));
    await expect(args.onRequest).toHaveBeenCalledWith({ type: "convert", request: expect.objectContaining({
      estimateId: estimateEditorSnapshot.estimateId, expectedVersion: 3, snapshotHash: estimateEditorSnapshot.snapshotHash,
      sourceLeadId: c.stories.leadId, job: expect.objectContaining({ customerId: c.stories.customerId, description: estimateEditorSnapshot.content.scope }),
    }) });
  },
};
export const VoidReview: Story = {
  args: { scenario: "sent" },
  play: async ({ canvasElement, args }) => {
    await openMenu(canvasElement, "void");
    const dialog = reviewDialog(canvasElement);
    fireEvent.change(dialog.getByRole("textbox", { name: new RegExp(voidCopy.reason) }), { target: { value: c.stories.voidReason } });
    await userEvent.click(dialog.getByRole("button", { name: voidCopy.confirm }));
    await expect(args.onRequest).toHaveBeenCalledWith({ type: "void", request: { estimateId: estimateEditorSnapshot.estimateId, expectedVersion: 3, reason: c.stories.voidReason } });
  },
};
export const ArchiveReview: Story = {
  args: { scenario: "declined" },
  play: async ({ canvasElement, args }) => {
    await openMenu(canvasElement, "archive");
    await userEvent.click(reviewDialog(canvasElement).getByRole("button", { name: archiveCopy.archive.confirm }));
    await expect(args.onRequest).toHaveBeenCalledWith({ type: "archive", request: { estimateId: estimateEditorSnapshot.estimateId, expectedVersion: 3, mode: "archive" } });
  },
};
export const RestoreReview: Story = {
  args: { scenario: "declined", archived: true },
  play: async ({ canvasElement, args }) => {
    await openMenu(canvasElement, "restore");
    await userEvent.click(reviewDialog(canvasElement).getByRole("button", { name: archiveCopy.restore.confirm }));
    await expect(args.onRequest).toHaveBeenCalledWith({ type: "archive", request: { estimateId: estimateEditorSnapshot.estimateId, expectedVersion: 3, mode: "restore" } });
  },
};
export const DeleteDraftReview: Story = {
  play: async ({ canvasElement, args }) => {
    await openMenu(canvasElement, "delete-draft");
    const dialog = reviewDialog(canvasElement);
    await expect(dialog.getByRole("button", { name: deleteCopy.confirm })).toBeDisabled();
    fireEvent.change(dialog.getByRole("textbox", { name: deleteCopy.type }), { target: { value: estimateEditorSnapshot.content.number } });
    await userEvent.click(dialog.getByRole("button", { name: deleteCopy.confirm }));
    await expect(args.onRequest).toHaveBeenCalledWith({ type: "delete-draft", request: { estimateId: estimateEditorSnapshot.estimateId, expectedVersion: 3, typedConfirmation: estimateEditorSnapshot.content.number } });
  },
};
export const ResendToCorrectedEmail: Story = {
  args: { scenario: "sent" },
  play: async ({ canvasElement, args }) => {
    await userEvent.click(within(canvasElement).getByRole("button", { name: deliveryCopy.actions["review-resend"] }));
    const dialog = reviewDialog(canvasElement);
    fireEvent.change(dialog.getByRole("textbox", { name: new RegExp(sendCopy.recipientEmail) }), { target: { value: c.stories.correctedEmail } });
    await userEvent.click(dialog.getByRole("button", { name: sendCopy.confirm.resend }));
    await expect(args.onRequest).toHaveBeenCalledWith({ type: "send", request: expect.objectContaining({ mode: "resend", recipientEmail: c.stories.correctedEmail, snapshotHash: estimateEditorSnapshot.snapshotHash }) });
    await expect(within(canvasElement).getAllByText(estimateEditorSnapshot.content.recipientEmail).length).toBeGreaterThan(0);
  },
};
function PermissionPreview(args: EstimateEditorPagePreviewProps) {
  const [read, setRead] = useState(true);
  return <><button type="button" className={`${estimateButton} print:hidden`} onClick={() => setRead(false)}>{c.stories.permissionLoss}</button>
    <EstimateEditorPagePreview {...args} capabilities={{ ...args.capabilities, read }} /></>;
}
export const AccessRevokedDuringReview: Story = {
  args: { scenario: "sent" }, render: (args) => <PermissionPreview {...args} />,
  play: async ({ canvasElement, args }) => {
    const canvas = within(canvasElement);
    await userEvent.click(canvas.getByRole("button", { name: statusCopy.actions["mark-accepted"] }));
    fireEvent.click(canvas.getByRole("button", { name: c.stories.permissionLoss, hidden: true }));
    await expect(within(canvasElement.ownerDocument.body).queryByRole("alertdialog")).not.toBeInTheDocument();
    await assertUnavailable(canvasElement);
    await assertNoRequest(args);
  },
};
export const AccessRevokedDuringPreview: Story = {
  args: { scenario: "sent", initialOverlay: "preview" }, render: (args) => <PermissionPreview {...args} />,
  play: async ({ canvasElement, args }) => {
    const canvas = within(canvasElement);
    await expect(canvas.getByRole("article")).toBeVisible();
    fireEvent.click(canvas.getByRole("button", { name: c.stories.permissionLoss }));
    await expect(canvas.queryByRole("article")).not.toBeInTheDocument();
    await assertUnavailable(canvasElement);
    await assertNoRequest(args);
  },
};
export const SharedAssistant: Story = { args: { initialOverlay: "assistant" } };
