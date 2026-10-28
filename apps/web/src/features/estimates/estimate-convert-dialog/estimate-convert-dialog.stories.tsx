import { useState } from "react";
import type { Meta, StoryObj } from "@storybook/nextjs-vite";
import { expect, fireEvent, fn, userEvent, waitFor, within } from "storybook/test";
import { estimateCapabilitiesByRole as roles } from "../estimate-preview.data";
import { estimateButton } from "../estimate-ui";
import { copy as jobCopy } from "../../jobs/job-create-dialog/job-create-dialog.data";
import { copy as dialogCopy } from "../../jobs/job-dialog/job-dialog.data";
import { EstimateConvertDialog, type EstimateConvertDialogProps } from "./estimate-convert-dialog";
import { estimateConvertDialogData as c, estimateConversionFixture as estimate } from "./estimate-convert-dialog.data";
import { initialEstimateConversionReview, type EstimateConversionCustomer, type EstimateConversionJobRef } from "./estimate-convert-dialog.preview";

const customer: EstimateConversionCustomer = { state: "ready", id: estimate.customerId!, name: c.stories.customer };
const members = [{ id: "sam", name: c.stories.member, role: "owner" as const }, { id: "taylor", name: c.stories.secondMember, role: "office" as const }];
const review = initialEstimateConversionReview(estimate, customer);
const confirm = fn(async () => {});
const reload = fn(async () => {});
const resolveCustomer = fn(async () => {});
const jobRef: EstimateConversionJobRef = { id: "22222222-2222-4222-8222-222222222222", number: "J-1208", canOpen: true };

function ConversionPreview(args: EstimateConvertDialogProps) {
  const [open, setOpen] = useState(args.open);
  const [requested, setRequested] = useState(false);
  return <div className="grid justify-items-start gap-4">
    <button type="button" className={estimateButton} onClick={() => setOpen(true)}>{c.stories.open}</button>
    <EstimateConvertDialog {...args} open={open} onClose={() => { setOpen(false); args.onClose(); }}
      onConfirm={args.onConfirm ? async (request) => { await args.onConfirm?.(request); setRequested(true); } : undefined} />
    {requested && <p role="status">{c.stories.requested}</p>}
  </div>;
}
function ResolvePreview(args: EstimateConvertDialogProps) {
  const [resolved, setResolved] = useState(false);
  const next = resolved ? { ...estimate, version: estimate.version + 1 } : { ...estimate, customerId: null };
  const currentCustomer: EstimateConversionCustomer = resolved ? customer : { state: "missing" };
  return <ConversionPreview {...args} estimate={next} customer={currentCustomer} review={initialEstimateConversionReview(next, currentCustomer)}
    onResolveCustomer={async () => { await resolveCustomer(); setResolved(true); }} />;
}
function ReloadPreview(args: EstimateConvertDialogProps) {
  const [current, setCurrent] = useState(estimate);
  const [conflict, setConflict] = useState(true);
  return <ConversionPreview {...args} estimate={current} review={initialEstimateConversionReview(current, customer)}
    error={conflict ? { kind: "conflict", message: c.stories.conflict } : undefined}
    onReload={async () => { await reload(); setCurrent({ ...current, version: current.version + 1 }); setConflict(false); }} />;
}
function ChangedPreview(args: EstimateConvertDialogProps & { change: "read" | "customer" | "create" | "version" | "converted" }) {
  const [changed, setChanged] = useState(false);
  const current = changed && args.change === "version" ? { ...args.estimate, version: args.estimate.version + 1 }
    : changed && args.change === "converted" ? { ...args.estimate, convertedJob: jobRef } : args.estimate;
  return <EstimateConvertDialog {...args} estimate={current}
    capabilities={changed && args.change === "read" ? { ...args.capabilities, read: false } : args.capabilities}
    customer={changed && args.change === "customer" ? { state: "unavailable" } : args.customer}
    canCreateJob={changed && args.change === "create" ? false : args.canCreateJob}
    onConfirm={async (request) => { await args.onConfirm?.(request); setChanged(true); }} />;
}
const meta = {
  title: "Estimates/EstimateConvertDialog",
  component: EstimateConvertDialog,
  args: {
    open: true, estimate, capabilities: roles.owner, canCreateJob: true, canScheduleCreation: true,
    customer, members, review, onConfirm: confirm, onClose: fn(),
  },
  render: (args) => <ConversionPreview {...args} />,
  decorators: [(Story) => <main className="mx-auto min-h-screen w-full max-w-6xl bg-canvas p-4 sm:p-8">
    <p className="m-0 mb-6 text-sm leading-6 text-muted">{c.stories.notice}</p><Story />
  </main>],
} satisfies Meta<typeof EstimateConvertDialog>;
export default meta;
type Story = StoryObj<typeof meta>;
function body(element: HTMLElement) { return within(element.ownerDocument.body); }
async function dialog(element: HTMLElement) {
  const root = await body(element).findByRole("dialog");
  await waitFor(async () => {
    await expect(root).toBeVisible();
    await expect(root.parentElement).toHaveStyle({ opacity: "1" });
  });
  return within(root);
}
async function blocker(element: HTMLElement, message: string) {
  const root = await body(element).findByRole("alertdialog");
  await waitFor(async () => {
    await expect(root).toBeVisible();
    await expect(root.parentElement).toHaveStyle({ opacity: "1" });
  });
  const canvas = within(root);
  await expect(canvas.getByText(message)).toBeVisible();
  await expect(canvas.queryByRole("button", { name: c.confirm })).not.toBeInTheDocument();
  return canvas;
}
const expectedRequest = {
  estimateId: estimate.id, expectedVersion: estimate.version,
  expectedLeadVersion: estimate.sourceLeadVersion,
  expectedCustomerVersion: estimate.customerVersion,
  snapshotHash: estimate.snapshotHash, sourceLeadId: estimate.parentId,
  job: {
    customerId: estimate.customerId, title: estimate.name, service: estimate.service,
    location: estimate.serviceAddress, description: estimate.scope, primaryOwnerId: null, teamUserIds: [],
    scheduledDate: null, arrivalWindow: null, completionDeadline: null,
  },
};

export const Review: Story = {
  play: async ({ canvasElement }) => {
    const canvas = await dialog(canvasElement);
    await expect(canvas.getByRole("heading", { name: c.title })).toBeVisible();
    await expect(canvas.getByRole("button", { name: c.confirm })).toBeEnabled();
    await expect(canvas.getByText(c.amountHint)).toBeVisible();
    await expect(canvas.getByText(c.effects)).toBeVisible();
    await expect(canvas.getByText(customer.name)).toBeVisible();
    await expect(canvas.getByText(estimate.scope, { normalizer: (text) => text })).toBeVisible();
    await expect(canvas.queryByRole("textbox")).not.toBeInTheDocument();
  },
};
export const Interactive: Story = { args: { open: false } };
export const ConfirmRequestOnly: Story = {
  play: async ({ canvasElement, args }) => {
    const canvas = await dialog(canvasElement);
    await userEvent.click(canvas.getByRole("button", { name: c.confirm }));
    await expect(confirm).toHaveBeenCalledTimes(1);
    await expect(confirm).toHaveBeenCalledWith(expectedRequest);
    await expect(args.onClose).not.toHaveBeenCalled();
    await expect(canvas.getByRole("button", { name: c.confirm })).toBeEnabled();
    await expect(body(canvasElement).getByRole("status", { hidden: true })).toHaveTextContent(c.stories.requested);
  },
};
export const EditAndReview: Story = {
  play: async ({ canvasElement }) => {
    const canvas = await dialog(canvasElement);
    await userEvent.click(canvas.getByRole("button", { name: jobCopy.edit }));
    const edit = await dialog(canvasElement);
    await expect(edit.getByRole("combobox", { name: jobCopy.customer })).toBeDisabled();
    await expect(edit.queryByRole("option", { name: jobCopy.newCustomer })).not.toBeInTheDocument();
    fireEvent.change(edit.getByRole("textbox", { name: jobCopy.job }), { target: { value: c.stories.longTitle } });
    await userEvent.selectOptions(edit.getByRole("combobox", { name: jobCopy.owner }), "sam");
    await userEvent.click(edit.getByText(jobCopy.optional, { exact: true }));
    fireEvent.change(edit.getByRole("textbox", { name: jobCopy.descriptionLabel }), { target: { value: c.stories.literal } });
    await userEvent.click(edit.getByRole("checkbox", { name: c.stories.secondMember }));
    await userEvent.click(edit.getByRole("button", { name: jobCopy.review }));
    const reviewed = await dialog(canvasElement);
    await expect(reviewed.getByText(c.stories.literal, { normalizer: (text) => text })).toBeVisible();
    await expect(confirm).not.toHaveBeenCalled();
    await userEvent.click(reviewed.getByRole("button", { name: c.confirm }));
    await expect(confirm).toHaveBeenCalledWith({
      ...expectedRequest, job: { ...expectedRequest.job, title: c.stories.longTitle, primaryOwnerId: "sam", teamUserIds: ["taylor"], description: c.stories.literal },
    });
  },
};
export const NoSchedulingPermission: Story = {
  args: { canScheduleCreation: false },
  play: async ({ canvasElement }) => {
    const canvas = await dialog(canvasElement);
    await expect(canvas.getByRole("button", { name: c.confirm })).toBeEnabled();
    await userEvent.click(canvas.getByRole("button", { name: jobCopy.edit }));
    const edit = await dialog(canvasElement);
    await userEvent.click(edit.getByText(jobCopy.optional, { exact: true }));
    await expect(edit.getByLabelText(jobCopy.scheduled)).toBeDisabled();
    await expect(edit.getByLabelText(jobCopy.window)).toBeDisabled();
    await expect(edit.getByLabelText(jobCopy.deadline)).toBeDisabled();
  },
};
export const ScheduledReview: Story = {
  args: { review: { ...review, job: { ...review.job, scheduledDate: "2026-11-01", arrivalWindow: "08:00-10:00", completionDeadline: "2026-11-08" } } },
  play: async ({ canvasElement }) => {
    const canvas = await dialog(canvasElement);
    await expect(canvas.getByText("08:00-10:00")).toBeVisible();
    await userEvent.click(canvas.getByRole("button", { name: c.confirm }));
    await expect(confirm).toHaveBeenCalledWith({
      ...expectedRequest, job: { ...expectedRequest.job, scheduledDate: "2026-11-01", arrivalWindow: "08:00-10:00", completionDeadline: "2026-11-08" },
    });
  },
};
export const ForbiddenDates: Story = {
  args: { canScheduleCreation: false, review: { ...review, job: { ...review.job, scheduledDate: "2026-11-01" } } },
  play: async ({ canvasElement }) => {
    const canvas = await dialog(canvasElement);
    await expect(canvas.getByText(c.errors.schedule)).toBeVisible();
    await expect(canvas.getByRole("button", { name: c.confirm })).toBeDisabled();
  },
};
export const InvalidDates: Story = {
  args: { review: { ...review, job: { ...review.job, scheduledDate: "2026-02-30" } } },
  play: async ({ canvasElement }) => {
    const canvas = await dialog(canvasElement);
    await expect(canvas.getByText(c.errors.dates)).toBeVisible();
    await expect(canvas.getByRole("button", { name: c.confirm })).toBeDisabled();
  },
};
export const LongScopeRequiresEdit: Story = {
  args: { review: { ...review, job: { ...review.job, description: "x".repeat(5000) } } },
  play: async ({ canvasElement }) => {
    const canvas = await dialog(canvasElement);
    await expect(canvas.getByRole("button", { name: c.confirm })).toBeDisabled();
    await expect(canvas.getByText(c.errors.description)).toBeVisible();
    await userEvent.click(canvas.getByRole("button", { name: jobCopy.edit }));
    const edit = await dialog(canvasElement);
    await userEvent.click(edit.getByText(jobCopy.optional, { exact: true }));
    const input = edit.getByRole("textbox", { name: jobCopy.descriptionLabel });
    await expect(input).toHaveValue("x".repeat(5000));
    fireEvent.change(input, { target: { value: estimate.scope } });
    await userEvent.click(edit.getByRole("button", { name: jobCopy.review }));
    await expect((await dialog(canvasElement)).getByRole("button", { name: c.confirm })).toBeEnabled();
  },
};
export const InvalidOwner: Story = {
  args: { review: { ...review, job: { ...review.job, primaryOwnerId: "unavailable-member" } } },
  play: async ({ canvasElement }) => {
    const canvas = await dialog(canvasElement);
    await expect(canvas.getByText(c.errors.members)).toBeVisible();
    await expect(canvas.getByRole("button", { name: c.confirm })).toBeDisabled();
  },
};
export const CustomerLocked: Story = {
  play: async ({ canvasElement }) => {
    const canvas = await dialog(canvasElement);
    await userEvent.click(canvas.getByRole("button", { name: jobCopy.edit }));
    const edit = await dialog(canvasElement);
    const select = edit.getByRole("combobox", { name: jobCopy.customer });
    fireEvent.change(select, { target: { value: "new" } });
    await expect(select).toHaveValue(customer.id);
    await expect(edit.queryByRole("textbox", { name: jobCopy.name })).not.toBeInTheDocument();
  },
};
const missingEstimate = { ...estimate, customerId: null };
const missingReview = initialEstimateConversionReview(missingEstimate, { state: "missing" });
export const MissingCustomer: Story = {
  args: { estimate: missingEstimate, customer: { state: "missing" }, review: missingReview, onResolveCustomer: resolveCustomer },
  play: async ({ canvasElement }) => {
    const canvas = await blocker(canvasElement, c.customerMissing);
    await expect(canvas.getByText(c.customerBoundary)).toBeVisible();
    await userEvent.click(canvas.getByRole("button", { name: c.resolveCustomer }));
    await expect(resolveCustomer).toHaveBeenCalledTimes(1);
    await expect(confirm).not.toHaveBeenCalled();
  },
};
export const CustomerResolvedByHost: Story = {
  render: (args) => <ResolvePreview {...args} />,
  play: async ({ canvasElement }) => {
    await userEvent.click((await blocker(canvasElement, c.customerMissing)).getByRole("button", { name: c.resolveCustomer }));
    const canvas = await dialog(canvasElement);
    await expect(canvas.getByText(customer.name)).toBeVisible();
    await expect(canvas.getByRole("button", { name: c.confirm })).toBeEnabled();
    await expect(confirm).not.toHaveBeenCalled();
    await userEvent.click(canvas.getByRole("button", { name: c.confirm }));
    await expect(confirm).toHaveBeenCalledWith({ ...expectedRequest, expectedVersion: estimate.version + 1 });
  },
};
export const CustomerResolveUnavailable: Story = {
  args: { ...MissingCustomer.args, onResolveCustomer: undefined },
  play: async ({ canvasElement }) => { await expect((await blocker(canvasElement, c.customerMissing)).getByText(c.resolveUnavailable)).toBeVisible(); },
};
export const CustomerResolveFailed: Story = {
  args: { ...MissingCustomer.args, onResolveCustomer: fn(async () => { throw new Error(c.stories.rejection); }) },
  play: async ({ canvasElement }) => {
    const canvas = await blocker(canvasElement, c.customerMissing);
    await userEvent.click(canvas.getByRole("button", { name: c.resolveCustomer }));
    await expect(canvas.getByText(c.resolveFailed)).toBeVisible();
    await expect(confirm).not.toHaveBeenCalled();
  },
};
const heldResolve = fn(() => new Promise<void>(() => {}));
export const CustomerResolvePending: Story = {
  args: { ...MissingCustomer.args, onResolveCustomer: heldResolve },
  play: async ({ canvasElement, args }) => {
    const canvas = await blocker(canvasElement, c.customerMissing);
    await userEvent.dblClick(canvas.getByRole("button", { name: c.resolveCustomer }));
    await expect(heldResolve).toHaveBeenCalledTimes(1);
    for (const button of canvas.getAllByRole("button")) await expect(button).toBeDisabled();
    await userEvent.keyboard("{Escape}");
    await expect(args.onClose).not.toHaveBeenCalled();
  },
};
export const NoCustomerAccess: Story = {
  args: { customer: { state: "unavailable" } },
  play: async ({ canvasElement }) => {
    const canvas = await blocker(canvasElement, c.errors.customerAccess);
    await expect(canvas.queryByText(customer.name)).not.toBeInTheDocument();
    await expect(canvas.queryByRole("button", { name: c.resolveCustomer })).not.toBeInTheDocument();
  },
};
export const CustomerMismatch: Story = {
  args: { customer: { state: "ready", id: "33333333-3333-4333-8333-333333333333", name: c.stories.longCustomer } },
  play: async ({ canvasElement }) => { await blocker(canvasElement, c.errors.customerMismatch); },
};
export const NoJobCreatePermission: Story = {
  args: { canCreateJob: false },
  play: async ({ canvasElement }) => { await blocker(canvasElement, c.errors.create); },
};
export const NoEstimateMutationPermissionNeeded: Story = {
  args: { capabilities: { ...roles.owner, create: false, update: false, send: false, decide: false } }, play: Review.play,
};
export const NoReadAccess: Story = {
  args: { capabilities: { ...roles.owner, read: false }, error: { kind: "error", message: c.stories.failure } },
  play: async ({ canvasElement }) => {
    const canvas = await blocker(canvasElement, c.errors.read);
    for (const text of [c.stories.name, customer.name, c.stories.failure, c.amountHint])
      await expect(canvas.queryByText(text)).not.toBeInTheDocument();
    await expect(canvas.queryByRole("link")).not.toBeInTheDocument();
    await expect(canvas.queryByRole("textbox")).not.toBeInTheDocument();
  },
};
export const JobLinked: Story = {
  args: { estimate: { ...estimate, parentType: "job", parentId: jobRef.id }, parentJob: jobRef },
  play: async ({ canvasElement }) => {
    const canvas = await blocker(canvasElement, c.parentJob);
    await expect(canvas.getByRole("link", { name: c.openJob(jobRef.number) })).toHaveAttribute("href", `/jobs/${jobRef.id}`);
    await expect(canvas.queryByText(c.converted)).not.toBeInTheDocument();
    await expect(confirm).not.toHaveBeenCalled();
  },
};
export const JobLinkedNoJobAccess: Story = {
  args: { ...JobLinked.args, parentJob: { ...jobRef, canOpen: false } },
  play: async ({ canvasElement }) => {
    const canvas = await blocker(canvasElement, c.parentJob);
    await expect(canvas.getByText(c.jobUnavailable)).toBeVisible();
    await expect(canvas.queryByRole("link")).not.toBeInTheDocument();
  },
};
export const WrongParentJobReference: Story = {
  args: { ...JobLinked.args, parentJob: { ...jobRef, id: "33333333-3333-4333-8333-333333333333" } },
  play: async ({ canvasElement }) => {
    const canvas = await blocker(canvasElement, c.parentJob);
    await expect(canvas.getByText(c.jobUnavailable)).toBeVisible();
    await expect(canvas.queryByRole("link")).not.toBeInTheDocument();
  },
};
export const AlreadyConverted: Story = {
  args: { estimate: { ...estimate, convertedJob: jobRef } },
  play: async ({ canvasElement }) => {
    const canvas = await blocker(canvasElement, c.converted);
    await expect(canvas.getByRole("link", { name: c.openJob(jobRef.number) })).toHaveAttribute("href", `/jobs/${jobRef.id}`);
  },
};
export const ConvertedNoJobAccess: Story = {
  args: { estimate: { ...estimate, convertedJob: { ...jobRef, canOpen: false } } },
  play: async ({ canvasElement }) => { await expect((await blocker(canvasElement, c.converted)).queryByRole("link")).not.toBeInTheDocument(); },
};
export const Archived: Story = {
  args: { estimate: { ...estimate, archived: true } },
  play: async ({ canvasElement }) => { await blocker(canvasElement, c.errors.archived); },
};
export const Declined: Story = {
  args: { estimate: { ...estimate, status: "declined" } },
  play: async ({ canvasElement }) => { await blocker(canvasElement, c.errors.status); },
};
export const MissingAmount: Story = {
  args: { estimate: { ...estimate, totalCents: null } },
  play: async ({ canvasElement }) => { await blocker(canvasElement, c.errors.total); },
};
export const ZeroAmount: Story = { args: { estimate: { ...estimate, totalCents: 0 } }, play: Review.play };
export const MaximumAmount: Story = { args: { estimate: { ...estimate, totalCents: 2_000_000_000 } }, play: Review.play };
export const StaleVersion: Story = {
  args: { estimate: { ...estimate, version: estimate.version + 1 }, onReload: reload },
  play: async ({ canvasElement }) => {
    const canvas = await dialog(canvasElement);
    await expect(canvas.getByText(c.errors.binding)).toBeVisible();
    await expect(canvas.getByRole("button", { name: c.confirm })).toBeDisabled();
    await userEvent.click(canvas.getByRole("button", { name: dialogCopy.reload }));
    await expect(reload).toHaveBeenCalledTimes(1);
    await expect(canvas.getByRole("button", { name: c.confirm })).toBeDisabled();
  },
};
export const StaleSnapshot: Story = {
  args: { estimate: { ...estimate, snapshotHash: "different-hash" } },
  play: async ({ canvasElement }) => {
    const canvas = await dialog(canvasElement);
    await expect(canvas.getByText(c.errors.binding)).toBeVisible();
    await expect(canvas.getByRole("button", { name: c.confirm })).toBeDisabled();
  },
};
export const Conflict: Story = {
  args: { error: { kind: "conflict", message: c.stories.conflict }, onReload: reload },
  play: async ({ canvasElement }) => {
    const canvas = await dialog(canvasElement);
    await expect(canvas.getByRole("button", { name: c.confirm })).toBeDisabled();
    await expect(canvas.getByRole("alert")).toHaveTextContent(c.stories.conflict);
    await expect(canvas.getByText(estimate.scope, { normalizer: (text) => text })).toBeVisible();
  },
};
export const ReloadAndReview: Story = {
  render: (args) => <ReloadPreview {...args} />,
  play: async ({ canvasElement }) => {
    await userEvent.click((await dialog(canvasElement)).getByRole("button", { name: dialogCopy.reload }));
    const canvas = await dialog(canvasElement);
    await expect(reload).toHaveBeenCalledTimes(1);
    await expect(canvas.getByRole("button", { name: c.confirm })).toBeEnabled();
    await userEvent.click(canvas.getByRole("button", { name: c.confirm }));
    await expect(confirm).toHaveBeenCalledWith({ ...expectedRequest, expectedVersion: estimate.version + 1 });
  },
};
export const ReloadPreservesJobEdits: Story = {
  render: (args) => <ReloadPreview {...args} />,
  play: async ({ canvasElement }) => {
    await userEvent.click((await dialog(canvasElement)).getByRole("button", { name: jobCopy.edit }));
    const edit = await dialog(canvasElement);
    fireEvent.change(edit.getByRole("textbox", { name: jobCopy.job }), { target: { value: c.stories.longTitle } });
    await userEvent.click(edit.getByRole("button", { name: dialogCopy.reload }));
    const reloaded = await dialog(canvasElement);
    await expect(reloaded.getByRole("textbox", { name: jobCopy.job })).toHaveValue(c.stories.longTitle);
    await expect(reloaded.getByText(c.reloaded)).toBeVisible();
    await userEvent.click(reloaded.getByRole("button", { name: jobCopy.review }));
    await userEvent.click((await dialog(canvasElement)).getByRole("button", { name: c.confirm }));
    await expect(confirm).toHaveBeenCalledWith({
      ...expectedRequest, expectedVersion: estimate.version + 1, job: { ...expectedRequest.job, title: c.stories.longTitle },
    });
  },
};
export const ReloadFailed: Story = {
  args: { error: { kind: "conflict", message: c.stories.conflict }, onReload: fn(async () => { throw new Error(c.stories.rejection); }) },
  play: async ({ canvasElement }) => {
    const canvas = await dialog(canvasElement);
    await userEvent.click(canvas.getByRole("button", { name: dialogCopy.reload }));
    await expect(canvas.getByText(c.reloadFailed)).toBeVisible();
    await expect(canvas.getByRole("button", { name: c.confirm })).toBeDisabled();
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
    await expect(canvas.getByText(estimate.scope, { normalizer: (text) => text })).toBeVisible();
    await userEvent.click(canvas.getByRole("button", { name: c.confirm }));
    await expect(retry).toHaveBeenCalledTimes(2);
    await expect(canvas.queryByRole("alert")).not.toBeInTheDocument();
  },
};
export const Pending: Story = {
  args: { pending: true },
  play: async ({ canvasElement, args }) => {
    const canvas = await dialog(canvasElement);
    for (const button of canvas.getAllByRole("button")) { await expect(button).toBeDisabled(); fireEvent.click(button); }
    await userEvent.keyboard("{Escape}");
    await expect(args.onClose).not.toHaveBeenCalled();
    await expect(confirm).not.toHaveBeenCalled();
  },
};
const heldConfirm = fn(() => new Promise<void>(() => {}));
export const DoubleClickGuard: Story = {
  args: { onConfirm: heldConfirm },
  play: async ({ canvasElement }) => {
    await userEvent.dblClick((await dialog(canvasElement)).getByRole("button", { name: c.confirm }));
    await expect(heldConfirm).toHaveBeenCalledTimes(1);
  },
};
export const NotConnected: Story = {
  args: { onConfirm: undefined },
  play: async ({ canvasElement }) => {
    const canvas = await dialog(canvasElement);
    await expect(canvas.getByText(c.noHandler)).toBeVisible();
    await expect(canvas.getByRole("button", { name: c.confirm })).toBeDisabled();
  },
};
export const Cancel: Story = {
  play: async ({ canvasElement, args }) => {
    await userEvent.click((await dialog(canvasElement)).getByRole("button", { name: dialogCopy.cancel }));
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
export const AccessRevoked: Story = {
  args: { error: { kind: "error", message: c.stories.failure } },
  render: (args) => <ChangedPreview {...args} change="read" />,
  play: async ({ canvasElement }) => {
    await userEvent.click((await dialog(canvasElement)).getByRole("button", { name: c.confirm }));
    const canvas = await blocker(canvasElement, c.errors.read);
    await expect(canvas.queryByText(c.stories.name)).not.toBeInTheDocument();
    await expect(canvas.queryByText(c.stories.failure)).not.toBeInTheDocument();
  },
};
export const CustomerAccessRevoked: Story = {
  render: (args) => <ChangedPreview {...args} change="customer" />,
  play: async ({ canvasElement }) => {
    await userEvent.click((await dialog(canvasElement)).getByRole("button", { name: c.confirm }));
    await expect((await blocker(canvasElement, c.errors.customerAccess)).queryByText(customer.name)).not.toBeInTheDocument();
  },
};
export const CreatePermissionRevoked: Story = {
  render: (args) => <ChangedPreview {...args} change="create" />,
  play: async ({ canvasElement }) => {
    await userEvent.click((await dialog(canvasElement)).getByRole("button", { name: c.confirm }));
    await blocker(canvasElement, c.errors.create);
  },
};
export const RecordChanged: Story = {
  render: (args) => <ChangedPreview {...args} change="version" />,
  play: async ({ canvasElement }) => {
    const canvas = await dialog(canvasElement);
    await userEvent.click(canvas.getByRole("button", { name: jobCopy.edit }));
    fireEvent.change((await dialog(canvasElement)).getByRole("textbox", { name: jobCopy.job }), { target: { value: c.stories.longTitle } });
    await userEvent.click((await dialog(canvasElement)).getByRole("button", { name: jobCopy.review }));
    await userEvent.click((await dialog(canvasElement)).getByRole("button", { name: c.confirm }));
    const updated = await dialog(canvasElement);
    await expect(updated.getByText(c.errors.binding)).toBeVisible();
    await expect(updated.getByText(c.stories.longTitle, { exact: true })).toBeVisible();
    await expect(updated.getByRole("button", { name: c.confirm })).toBeDisabled();
  },
};
export const HostConfirmsConvertedJob: Story = {
  render: (args) => <ChangedPreview {...args} change="converted" />,
  play: async ({ canvasElement }) => {
    await userEvent.click((await dialog(canvasElement)).getByRole("button", { name: c.confirm }));
    const canvas = await blocker(canvasElement, c.converted);
    await expect(canvas.getByRole("link", { name: c.openJob(jobRef.number) })).toBeVisible();
    await expect(confirm).toHaveBeenCalledTimes(1);
  },
};
export const Admin: Story = { args: { capabilities: roles.admin }, play: Review.play };
export const Office: Story = { args: { capabilities: roles.office }, play: Review.play };
export const FieldLeadUnavailable: Story = {
  args: { capabilities: { ...roles.field, read: false }, canCreateJob: false }, play: NoReadAccess.play,
};
export const LongContent: Story = {
  args: {
    customer: { ...customer, name: c.stories.longCustomer },
    review: { ...review, job: { ...review.job, title: c.stories.longTitle, description: c.stories.scope.repeat(30) } },
  },
  play: async ({ canvasElement }) => { await expect((await dialog(canvasElement)).getByRole("button", { name: c.confirm })).toBeEnabled(); },
};
export const LiteralText: Story = {
  args: { review: { ...review, job: { ...review.job, description: c.stories.literal } } },
  play: async ({ canvasElement }) => {
    const canvas = await dialog(canvasElement);
    await expect(canvas.getByText(c.stories.literal, { normalizer: (text) => text })).toBeVisible();
    await expect(body(canvasElement).getByRole("dialog").querySelector("script")).toBeNull();
  },
};
export const Keyboard: Story = {
  play: async ({ canvasElement }) => {
    const canvas = await dialog(canvasElement);
    await userEvent.click(canvas.getByRole("button", { name: dialogCopy.cancel }));
    await userEvent.tab({ shift: true });
    await userEvent.click(body(canvasElement).getByRole("button", { name: c.stories.open }));
    const reopened = await dialog(canvasElement);
    reopened.getByRole("button", { name: c.confirm }).focus();
    await userEvent.keyboard("{Enter}");
    await expect(confirm).toHaveBeenCalledTimes(1);
  },
};
export const Phone: Story = { globals: { viewport: { value: "phone", isRotated: false } }, args: LongContent.args, play: LongContent.play };
