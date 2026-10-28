import { useState } from "react";
import type { Meta, StoryObj } from "@storybook/nextjs-vite";
import { expect, fireEvent, fn, userEvent, waitFor, within } from "storybook/test";
import { estimateCapabilitiesByRole as roles } from "../estimate-preview.data";
import { estimateButton } from "../estimate-ui";
import { EstimateDecisionDialog, type EstimateDecisionDialogProps } from "./estimate-decision-dialog";
import { estimateDecisionDialogData as c, estimateDecisionFixture as estimate, estimateDecisionCorrectionFixture as correction } from "./estimate-decision-dialog.data";
import { initialEstimateDecisionValues, type EstimateDecisionValues } from "./estimate-decision-dialog.preview";

const today = "2026-10-22";
const value: EstimateDecisionValues = { ...initialEstimateDecisionValues(estimate, today), channel: "phone", note: c.stories.note };
const correctionValue: EstimateDecisionValues = { ...initialEstimateDecisionValues(correction, today), outcome: "accepted", reason: c.stories.correctionReason };
const confirm = fn(async () => {});
const change = fn();
const reload = fn(async () => {});
const correctionArgs = { estimate: correction, mode: "correct" as const, canCorrectDecision: true, value: correctionValue };

function DecisionPreview(args: EstimateDecisionDialogProps) {
  const [open, setOpen] = useState(args.open);
  const [current, setCurrent] = useState(args.value);
  const [requested, setRequested] = useState(false);
  return <div className="grid justify-items-start gap-4">
    <button type="button" className={estimateButton} onClick={() => setOpen(true)}>{c.stories.open}</button>
    <EstimateDecisionDialog {...args} open={open} value={current}
      onChange={(next) => { setCurrent(next); args.onChange(next); }}
      onClose={() => { setOpen(false); args.onClose(); }}
      onConfirm={args.onConfirm ? async (request) => { await args.onConfirm?.(request); setRequested(true); } : undefined} />
    {requested && <p role="status">{c.stories.requested}</p>}
  </div>;
}
function ChangedPreview(args: EstimateDecisionDialogProps & { change: "read" | "version" }) {
  const [current, setCurrent] = useState(args.value);
  const [changed, setChanged] = useState(false);
  return <EstimateDecisionDialog {...args}
    estimate={changed && args.change === "version" ? { ...args.estimate, version: args.estimate.version + 1 } : args.estimate}
    capabilities={changed && args.change === "read" ? { ...args.capabilities, read: false } : args.capabilities}
    value={current} onChange={(next) => { args.onChange(next); setCurrent(next); setChanged(true); }} />;
}
function ReloadPreview(args: EstimateDecisionDialogProps) {
  const [record, setRecord] = useState(args.estimate);
  const [current, setCurrent] = useState(args.value);
  const [conflict, setConflict] = useState(true);
  return <EstimateDecisionDialog {...args} estimate={record} value={current} onChange={setCurrent}
    error={conflict ? { kind: "conflict", message: c.stories.conflict } : undefined}
    onReload={async () => {
      await reload();
      const next = { ...record, version: record.version + 1 };
      setRecord(next); setCurrent({ ...current, expectedVersion: next.version }); setConflict(false);
    }} />;
}

const meta = {
  title: "Estimates/EstimateDecisionDialog",
  component: EstimateDecisionDialog,
  args: {
    open: true, mode: "record", estimate, capabilities: roles.owner, today, timezone: "America/New_York",
    value, onChange: change, onClose: fn(), onConfirm: confirm,
  },
  render: (args) => <DecisionPreview {...args} />,
  decorators: [(Story) => <main className="mx-auto min-h-screen w-full max-w-6xl bg-canvas p-4 sm:p-8">
    <p className="m-0 mb-6 text-sm leading-6 text-muted">{c.stories.notice}</p><Story />
  </main>],
} satisfies Meta<typeof EstimateDecisionDialog>;
export default meta;
type Story = StoryObj<typeof meta>;
function body(element: HTMLElement) { return within(element.ownerDocument.body); }
async function dialog(element: HTMLElement) {
  const root = await body(element).findByRole("alertdialog");
  await waitFor(async () => {
    await expect(root).toBeVisible();
    await expect(root.parentElement).toHaveStyle({ opacity: "1" });
  });
  return within(root);
}
async function blocked(element: HTMLElement, message: string, correctionMode = false) {
  const canvas = await dialog(element);
  await expect(canvas.getByRole("button", { name: correctionMode ? c.confirmCorrection : c.confirm })).toBeDisabled();
  await expect(canvas.getByText(message)).toBeVisible();
}
function expectedRequest(mode: "record" | "correct" = "record") {
  const current = mode === "record" ? value : correctionValue;
  const common = { estimateId: current.estimateId, expectedVersion: current.expectedVersion, outcome: current.outcome,
    decisionDate: current.decisionDate, channel: current.channel, note: current.note };
  return mode === "correct" ? { ...common, mode, reason: current.reason } : { ...common, mode };
}

export const Accept: Story = {
  play: async ({ canvasElement }) => {
    const canvas = await dialog(canvasElement);
    await expect(canvas.getByRole("combobox", { name: c.outcome })).toHaveValue("accepted");
    await expect(canvas.getByRole("button", { name: c.confirm })).toBeEnabled();
    await expect(canvas.getByText(c.effects)).toBeVisible();
    await expect(canvas.getByText(c.acceptedEffect)).toBeVisible();
    await expect(canvas.queryByRole("textbox", { name: c.reason })).not.toBeInTheDocument();
    await waitFor(() => expect(canvas.getByRole("button", { name: c.cancel })).toHaveFocus());
  },
};
export const Decline: Story = {
  args: { value: { ...value, outcome: "declined", note: c.stories.declineNote } },
  play: async ({ canvasElement }) => {
    const canvas = await dialog(canvasElement);
    await expect(canvas.getByRole("combobox", { name: c.outcome })).toHaveValue("declined");
    await expect(canvas.getByText(c.declinedEffect)).toBeVisible();
    await expect(canvas.getByRole("button", { name: c.confirm })).toBeEnabled();
  },
};
export const Published: Story = { args: { estimate: { ...estimate, status: "published" } }, play: Accept.play };
export const ConfirmRequestOnly: Story = {
  play: async ({ canvasElement }) => {
    const canvas = await dialog(canvasElement);
    await userEvent.click(canvas.getByRole("button", { name: c.confirm }));
    await expect(confirm).toHaveBeenCalledTimes(1);
    await expect(confirm).toHaveBeenCalledWith(expectedRequest());
    await expect(canvas.getByRole("button", { name: c.confirm })).toBeEnabled();
    await expect(body(canvasElement).getByRole("alertdialog")).toBeVisible();
    await expect(body(canvasElement).getByRole("status", { hidden: true })).toHaveTextContent(c.stories.requested);
  },
};
export const ConfirmDecline: Story = {
  args: Decline.args,
  play: async ({ canvasElement }) => {
    await userEvent.click((await dialog(canvasElement)).getByRole("button", { name: c.confirm }));
    await expect(confirm).toHaveBeenCalledTimes(1);
    await expect(confirm).toHaveBeenCalledWith({ ...expectedRequest(), outcome: "declined", note: c.stories.declineNote });
  },
};
export const Interactive: Story = {
  args: { open: false, value: initialEstimateDecisionValues(estimate, today) },
};
export const Correction: Story = {
  args: correctionArgs,
  play: async ({ canvasElement }) => {
    const canvas = await dialog(canvasElement);
    await expect(canvas.getByRole("region", { name: c.current })).toHaveTextContent(c.stories.declineNote);
    await expect(canvas.getByRole("combobox", { name: c.outcome })).toHaveValue("accepted");
    await expect(canvas.getByRole("textbox", { name: new RegExp(c.reason) })).toHaveValue(c.stories.correctionReason);
    await expect(canvas.getByRole("button", { name: c.confirmCorrection })).toBeEnabled();
  },
};
export const CorrectionWithConvertedJob: Story = {
  args: {
    ...correctionArgs,
    convertedJob: { number: "J-1208", href: "/jobs/job-1208" },
  },
  play: async ({ canvasElement }) => {
    const canvas = await dialog(canvasElement);
    await expect(canvas.getByRole("link", { name: "J-1208" })).toHaveAttribute("href", "/jobs/job-1208");
    await expect(canvas.getByText(c.jobUnchanged)).toBeVisible();
    await expect(canvas.getByRole("button", { name: c.confirmCorrection })).toBeEnabled();
  },
};
export const ConfirmCorrection: Story = {
  args: correctionArgs,
  play: async ({ canvasElement }) => {
    const canvas = await dialog(canvasElement);
    await userEvent.click(canvas.getByRole("button", { name: c.confirmCorrection }));
    await expect(confirm).toHaveBeenCalledTimes(1);
    await expect(confirm).toHaveBeenCalledWith(expectedRequest("correct"));
    await expect(canvas.getByRole("region", { name: c.current })).toHaveTextContent(c.stories.declineNote);
  },
};
export const CorrectAcceptedToDeclined: Story = {
  args: {
    ...correctionArgs,
    estimate: { ...correction, status: "accepted", decision: { outcome: "accepted", decisionDate: "2026-10-21", channel: "phone", note: c.stories.note } },
    value: { ...correctionValue, outcome: "declined", note: c.stories.note },
  },
  play: async ({ canvasElement }) => {
    const canvas = await dialog(canvasElement);
    await expect(canvas.getByRole("region", { name: c.current })).toHaveTextContent(c.stories.note);
    await expect(canvas.getByRole("combobox", { name: c.outcome })).toHaveValue("declined");
    await userEvent.click(canvas.getByRole("button", { name: c.confirmCorrection }));
    await expect(confirm).toHaveBeenCalledWith({ ...expectedRequest("correct"), outcome: "declined", note: c.stories.note });
  },
};
export const SameOutcomeCorrection: Story = {
  args: { ...correctionArgs, value: { ...correctionValue, outcome: "declined", channel: "email" } },
  play: async ({ canvasElement }) => {
    await userEvent.click((await dialog(canvasElement)).getByRole("button", { name: c.confirmCorrection }));
    await expect(confirm).toHaveBeenCalledWith({ ...expectedRequest("correct"), outcome: "declined", channel: "email" });
  },
};
export const MissingReason: Story = {
  args: { ...correctionArgs, value: { ...correctionValue, reason: "" } },
  play: async ({ canvasElement }) => { await blocked(canvasElement, c.errors.reason, true); },
};
export const MissingChannel: Story = {
  args: { value: { ...value, channel: "" } },
  play: async ({ canvasElement }) => {
    await blocked(canvasElement, c.errors.channel);
    const canvas = await dialog(canvasElement);
    await userEvent.selectOptions(canvas.getByRole("combobox", { name: c.channel }), "email");
    await expect(change).toHaveBeenCalledWith({ ...value, channel: "email" });
    await expect(canvas.getByRole("button", { name: c.confirm })).toBeEnabled();
  },
};
export const EditFields: Story = {
  play: async ({ canvasElement }) => {
    const canvas = await dialog(canvasElement);
    await userEvent.selectOptions(canvas.getByRole("combobox", { name: c.outcome }), "declined");
    fireEvent.change(canvas.getByLabelText(c.date, { exact: true }), { target: { value: "2026-10-20" } });
    await userEvent.selectOptions(canvas.getByRole("combobox", { name: c.channel }), "other");
    fireEvent.change(canvas.getByRole("textbox", { name: c.note }), { target: { value: c.stories.declineNote } });
    await userEvent.click(canvas.getByRole("button", { name: c.confirm }));
    await expect(confirm).toHaveBeenCalledWith({
      ...expectedRequest(), outcome: "declined", decisionDate: "2026-10-20", channel: "other", note: c.stories.declineNote,
    });
  },
};
export const Today: Story = {
  play: async ({ canvasElement }) => {
    const canvas = await dialog(canvasElement);
    await expect(canvas.getByLabelText(c.date, { exact: true })).toHaveValue(today);
    await expect(canvas.getByLabelText(c.date, { exact: true })).toHaveAttribute("max", today);
    await expect(canvas.getByRole("button", { name: c.confirm })).toBeEnabled();
  },
};
export const PastDate: Story = {
  args: { value: { ...value, decisionDate: "2026-10-20" } },
  play: async ({ canvasElement }) => { await expect((await dialog(canvasElement)).getByRole("button", { name: c.confirm })).toBeEnabled(); },
};
export const FutureDate: Story = {
  args: { value: { ...value, decisionDate: "2026-10-23" } },
  play: async ({ canvasElement }) => { await blocked(canvasElement, c.errors.future); },
};
export const FutureCorrectionDate: Story = {
  args: { ...correctionArgs, value: { ...correctionValue, decisionDate: "2026-10-23" } },
  play: async ({ canvasElement }) => { await blocked(canvasElement, c.errors.future, true); },
};
export const MissingDate: Story = {
  args: { value: { ...value, decisionDate: "" } },
  play: async ({ canvasElement }) => { await blocked(canvasElement, c.errors.date); },
};
export const MissingToday: Story = {
  args: { today: "" }, play: async ({ canvasElement }) => { await blocked(canvasElement, c.errors.today); },
};
export const InvalidTimezone: Story = {
  args: { timezone: "not-a-timezone" }, play: async ({ canvasElement }) => { await blocked(canvasElement, c.errors.timezone); },
};
export const NoteLimit: Story = {
  args: { value: { ...value, note: "x".repeat(500) } },
  play: async ({ canvasElement }) => {
    const canvas = await dialog(canvasElement);
    await expect(canvas.getByRole("textbox", { name: c.note })).toHaveAttribute("maxlength", "500");
    await expect(canvas.getByRole("button", { name: c.confirm })).toBeEnabled();
  },
};
export const OverLimitNote: Story = {
  args: { value: { ...value, note: "x".repeat(501) } },
  play: async ({ canvasElement }) => { await blocked(canvasElement, c.errors.note); },
};
export const OverLimitReason: Story = {
  args: { ...correctionArgs, value: { ...correctionValue, reason: "x".repeat(501) } },
  play: async ({ canvasElement }) => { await blocked(canvasElement, c.errors.reason, true); },
};
export const NoDecisionPermission: Story = {
  args: { capabilities: { ...roles.owner, decide: false } },
  play: async ({ canvasElement }) => { await blocked(canvasElement, c.errors.permission); },
};
export const NoSendPermissionNeeded: Story = {
  args: { capabilities: { ...roles.owner, send: false, update: false } }, play: Accept.play,
};
export const NoCorrectionGrant: Story = {
  args: { ...correctionArgs, canCorrectDecision: false },
  play: async ({ canvasElement }) => { await blocked(canvasElement, c.errors.correctionPermission, true); },
};
export const FieldCannotCorrect: Story = {
  args: { ...correctionArgs, capabilities: roles.field, canCorrectDecision: false },
  play: NoCorrectionGrant.play,
};
export const NoReadAccess: Story = {
  args: { ...correctionArgs, capabilities: { ...roles.owner, read: false }, error: { kind: "conflict", message: c.stories.conflict } },
  play: async ({ canvasElement }) => {
    const canvas = await dialog(canvasElement);
    await blocked(canvasElement, c.errors.read, true);
    for (const text of [c.stories.name, c.stories.declineNote, c.stories.correctionReason, c.stories.conflict])
      await expect(canvas.queryByText(text)).not.toBeInTheDocument();
    await expect(canvas.queryByRole("textbox")).not.toBeInTheDocument();
    await expect(canvas.queryByRole("combobox")).not.toBeInTheDocument();
  },
};
export const Archived: Story = {
  args: { estimate: { ...estimate, archived: true } },
  play: async ({ canvasElement }) => { await blocked(canvasElement, c.errors.archived); },
};
export const ArchivedCorrection: Story = {
  args: { ...correctionArgs, estimate: { ...correction, archived: true } },
  play: async ({ canvasElement }) => { await blocked(canvasElement, c.errors.archived, true); },
};
export const Draft: Story = {
  args: { estimate: { ...estimate, status: "draft" } },
  play: async ({ canvasElement }) => { await blocked(canvasElement, c.errors.status); },
};
export const Expired: Story = {
  args: { estimate: { ...estimate, status: "expired" } }, play: Draft.play,
};
export const WrongVersion: Story = {
  args: { estimate: { ...estimate, version: estimate.version + 1 } },
  play: async ({ canvasElement }) => { await blocked(canvasElement, c.errors.binding); },
};
export const MissingPreviousDecision: Story = {
  args: { ...correctionArgs, estimate: { ...correction, decision: null } },
  play: async ({ canvasElement }) => { await blocked(canvasElement, c.errors.previous, true); },
};
export const WrongPreviousDecision: Story = {
  args: { ...correctionArgs, estimate: { ...correction, status: "accepted" } },
  play: MissingPreviousDecision.play,
};
export const ZeroTotal: Story = { args: { estimate: { ...estimate, totalCents: 0 } }, play: Accept.play };
export const MaximumTotal: Story = { args: { estimate: { ...estimate, totalCents: 2_000_000_000 } }, play: Accept.play };
export const MissingTotal: Story = {
  args: { estimate: { ...estimate, totalCents: null } },
  play: async ({ canvasElement }) => { await blocked(canvasElement, c.errors.total); },
};
export const Conflict: Story = {
  args: { error: { kind: "conflict", message: c.stories.conflict }, onReload: reload },
  play: async ({ canvasElement }) => {
    const canvas = await dialog(canvasElement);
    await blocked(canvasElement, c.stories.conflict);
    await expect(canvas.getByRole("textbox", { name: c.note })).toHaveValue(value.note);
    await expect(canvas.getByRole("textbox", { name: c.note })).toBeDisabled();
    await userEvent.click(canvas.getByRole("button", { name: c.reload }));
    await expect(reload).toHaveBeenCalledTimes(1);
    await expect(canvas.getByRole("button", { name: c.confirm })).toBeDisabled();
  },
};
export const ReloadAndReview: Story = {
  render: (args) => <ReloadPreview {...args} />,
  play: async ({ canvasElement }) => {
    const canvas = await dialog(canvasElement);
    await userEvent.click(canvas.getByRole("button", { name: c.reload }));
    await expect(reload).toHaveBeenCalledTimes(1);
    await expect(canvas.getByRole("button", { name: c.confirm })).toBeEnabled();
    await expect(canvas.getByRole("textbox", { name: c.note })).toHaveValue(value.note);
    await userEvent.click(canvas.getByRole("button", { name: c.confirm }));
    await expect(confirm).toHaveBeenCalledWith({ ...expectedRequest(), expectedVersion: estimate.version + 1 });
  },
};
export const ReloadFailed: Story = {
  args: { error: { kind: "conflict", message: c.stories.conflict }, onReload: fn(async () => { throw new Error(c.stories.rejection); }) },
  play: async ({ canvasElement }) => {
    const canvas = await dialog(canvasElement);
    await userEvent.click(canvas.getByRole("button", { name: c.reload }));
    await blocked(canvasElement, c.reloadFailed);
    await expect(canvas.getByRole("textbox", { name: c.note })).toHaveValue(value.note);
  },
};
const heldReload = fn(() => new Promise<void>(() => {}));
export const ReloadDoubleClickGuard: Story = {
  args: { error: { kind: "conflict", message: c.stories.conflict }, onReload: heldReload },
  play: async ({ canvasElement, args }) => {
    const canvas = await dialog(canvasElement);
    await userEvent.dblClick(canvas.getByRole("button", { name: c.reload }));
    await expect(heldReload).toHaveBeenCalledTimes(1);
    await userEvent.keyboard("{Escape}");
    await expect(args.onClose).not.toHaveBeenCalled();
    await expect(confirm).not.toHaveBeenCalled();
    await expect(canvas.getByRole("textbox", { name: c.note })).toHaveValue(value.note);
  },
};
export const ServerError: Story = {
  args: { error: { kind: "error", message: c.stories.failure } },
  play: async ({ canvasElement }) => {
    const canvas = await dialog(canvasElement);
    await expect(canvas.getByRole("alert")).toHaveTextContent(c.stories.failure);
    await expect(canvas.getByRole("button", { name: c.confirm })).toBeEnabled();
  },
};
const retry = fn(async () => {});
export const RejectAndRetry: Story = {
  args: { onConfirm: retry },
  play: async ({ canvasElement }) => {
    retry.mockRejectedValueOnce(new Error(c.stories.rejection));
    const canvas = await dialog(canvasElement);
    await userEvent.click(canvas.getByRole("button", { name: c.confirm }));
    await waitFor(() => expect(canvas.getByRole("alert")).toBeVisible());
    await expect(canvas.getByRole("textbox", { name: c.note })).toHaveValue(value.note);
    await userEvent.click(canvas.getByRole("button", { name: c.confirm }));
    await expect(retry).toHaveBeenCalledTimes(2);
    await expect(canvas.queryByRole("alert")).not.toBeInTheDocument();
  },
};
export const Pending: Story = {
  args: { pending: true },
  play: async ({ canvasElement, args }) => {
    const canvas = await dialog(canvasElement);
    for (const control of [...canvas.getAllByRole("button"), ...canvas.getAllByRole("textbox"), ...canvas.getAllByRole("combobox")])
      await expect(control).toBeDisabled();
    fireEvent.change(canvas.getByRole("textbox", { name: c.note }), { target: { value: c.stories.literal } });
    for (const button of canvas.getAllByRole("button")) fireEvent.click(button);
    await userEvent.keyboard("{Escape}");
    await expect(change).not.toHaveBeenCalled();
    await expect(confirm).not.toHaveBeenCalled();
    await expect(args.onClose).not.toHaveBeenCalled();
  },
};
export const CorrectionPending: Story = { args: { ...correctionArgs, pending: true }, play: Pending.play };
const heldConfirm = fn(() => new Promise<void>(() => {}));
export const DoubleClickGuard: Story = {
  args: { onConfirm: heldConfirm },
  play: async ({ canvasElement }) => {
    await userEvent.dblClick((await dialog(canvasElement)).getByRole("button", { name: c.confirm }));
    await expect(heldConfirm).toHaveBeenCalledTimes(1);
    await expect((await dialog(canvasElement)).getByRole("status")).toHaveTextContent(c.pending);
  },
};
export const NotConnected: Story = {
  args: { onConfirm: undefined }, play: async ({ canvasElement }) => { await blocked(canvasElement, c.noHandler); },
};
export const Cancel: Story = {
  play: async ({ canvasElement, args }) => {
    await userEvent.click((await dialog(canvasElement)).getByRole("button", { name: c.cancel }));
    await expect(args.onClose).toHaveBeenCalledTimes(1);
    await expect(confirm).not.toHaveBeenCalled();
  },
};
export const Escape: Story = {
  play: async ({ canvasElement, args }) => {
    await dialog(canvasElement); await userEvent.keyboard("{Escape}");
    await expect(args.onClose).toHaveBeenCalledTimes(1);
    await expect(confirm).not.toHaveBeenCalled();
  },
};
export const DateEnterDoesNotSubmit: Story = {
  play: async ({ canvasElement }) => {
    const canvas = await dialog(canvasElement);
    const date = canvas.getByLabelText(c.date, { exact: true });
    await userEvent.click(date);
    await userEvent.keyboard("{Enter}");
    await expect(confirm).not.toHaveBeenCalled();
    await expect(canvas.getByRole("button", { name: c.confirm })).toBeEnabled();
  },
};
export const Keyboard: Story = {
  play: async ({ canvasElement }) => {
    const canvas = await dialog(canvasElement);
    await waitFor(() => expect(canvas.getByRole("button", { name: c.cancel })).toHaveFocus());
    await userEvent.tab(); await expect(canvas.getByRole("button", { name: c.confirm })).toHaveFocus();
    await userEvent.keyboard("{Enter}"); await expect(confirm).toHaveBeenCalledTimes(1);
  },
};
export const AccessRevoked: Story = {
  render: (args) => <ChangedPreview {...args} change="read" />,
  play: async ({ canvasElement }) => {
    const canvas = await dialog(canvasElement);
    fireEvent.change(canvas.getByRole("textbox", { name: c.note }), { target: { value: c.stories.literal } });
    await blocked(canvasElement, c.errors.read);
    await expect(canvas.queryByText(c.stories.name)).not.toBeInTheDocument();
    await expect(canvas.queryByRole("textbox")).not.toBeInTheDocument();
  },
};
export const CorrectionAccessRevoked: Story = {
  args: { ...correctionArgs, error: { kind: "error", message: c.stories.failure } },
  render: (args) => <ChangedPreview {...args} change="read" />,
  play: async ({ canvasElement }) => {
    const canvas = await dialog(canvasElement);
    fireEvent.change(canvas.getByRole("textbox", { name: new RegExp(c.reason) }), { target: { value: c.stories.literal } });
    await blocked(canvasElement, c.errors.read, true);
    for (const text of [c.stories.declineNote, c.stories.correctionReason, c.stories.failure])
      await expect(canvas.queryByText(text)).not.toBeInTheDocument();
  },
};
export const RecordChanged: Story = {
  render: (args) => <ChangedPreview {...args} change="version" />,
  play: async ({ canvasElement }) => {
    const canvas = await dialog(canvasElement);
    fireEvent.change(canvas.getByRole("textbox", { name: c.note }), { target: { value: c.stories.literal } });
    await blocked(canvasElement, c.errors.binding);
    await expect(canvas.getByRole("textbox", { name: c.note })).toHaveValue(c.stories.literal);
    await expect(canvas.getByRole("textbox", { name: c.note })).toBeDisabled();
    await expect(confirm).not.toHaveBeenCalled();
  },
};
export const Admin: Story = { args: { capabilities: roles.admin }, play: Accept.play };
export const Office: Story = { args: { capabilities: roles.office }, play: Accept.play };
export const FieldAssignedJob: Story = { args: { capabilities: roles.field }, play: Accept.play };
export const OfficeCorrection: Story = { args: { ...correctionArgs, capabilities: roles.office }, play: Correction.play };
export const LongContent: Story = {
  args: {
    ...correctionArgs, estimate: { ...correction, name: c.stories.longName, recipientName: c.stories.longCustomer },
    value: { ...correctionValue, reason: c.stories.longReason },
  }, play: async ({ canvasElement }) => { await expect((await dialog(canvasElement)).getByRole("button", { name: c.confirmCorrection })).toBeEnabled(); },
};
export const LiteralText: Story = {
  args: {
    ...correctionArgs, estimate: { ...correction, decision: { outcome: "declined", decisionDate: "2026-10-21", channel: "phone", note: c.stories.literal } },
    value: { ...correctionValue, reason: c.stories.literal },
  },
  play: async ({ canvasElement }) => {
    const canvas = await dialog(canvasElement);
    await expect(canvas.getByRole("region", { name: c.current })).toHaveTextContent("<script>not executable</script>");
    await expect(canvas.getByRole("textbox", { name: new RegExp(c.reason) })).toHaveValue(c.stories.literal);
    await expect(body(canvasElement).getByRole("alertdialog").querySelector("script")).toBeNull();
  },
};
export const Phone: Story = { globals: { viewport: { value: "phone", isRotated: false } }, args: LongContent.args, play: LongContent.play };
