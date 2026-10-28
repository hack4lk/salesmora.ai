import { useState } from "react";
import type { Meta, StoryObj } from "@storybook/nextjs-vite";
import { expect, fireEvent, fn, userEvent, within } from "storybook/test";
import { leadSchema } from "@salesmora/contracts";
import { FormFeedback, MoneyText, TextField } from "@salesmora/ui";
import { EstimateDetailsCard } from "../estimate-details-card/estimate-details-card";
import { estimateEditorInitialValues } from "../estimate-editor-page/estimate-editor-page.data";
import { estimateEditorPaper } from "../estimate-editor-page/estimate-editor-page.preview";
import { reviewEstimateEditorDraftValues } from "../estimate-editor-page/estimate-editor-validation";
import { EstimateItemsEditor } from "../estimate-items-editor/estimate-items-editor";
import { EstimatePaymentOption } from "../estimate-payment-option/estimate-payment-option";
import { estimatePaymentOptionData as paymentCopy } from "../estimate-payment-option/estimate-payment-option.data";
import { reviewEstimatePaymentLink } from "../estimate-payment-option/estimate-payment-option.validation";
import { EstimatePreviewPaper } from "../estimate-preview-paper/estimate-preview-paper";
import { estimatePaperFixture, estimatePaperSnapshotFixture } from "../estimate-preview-paper/estimate-preview-paper.data";
import { reviewEstimatePaper } from "../estimate-preview-paper/estimate-preview-paper.preview";
import { estimatePreviewData } from "../estimate-preview.data";
import { EstimateScopeCard } from "../estimate-scope-card/estimate-scope-card";
import { EstimateTermsCard } from "../estimate-terms-card/estimate-terms-card";
import { EstimateTotals } from "../estimate-totals/estimate-totals";
import { estimateButton, estimatePanel } from "../estimate-ui";
import { EstimateCreationFlow } from "./estimate-creation-flow";
import { estimateCreationFlowData as c, type EstimateCreationStep } from "./estimate-creation-flow.data";

type PreviewRequest = "save" | "send" | "publish";
type PreviewProps = {
  initialStep?: EstimateCreationStep;
  initialPaymentLink?: string;
  empty?: boolean;
  canSend?: boolean;
  pending?: boolean;
  sendBehavior?: "request" | "error" | "pending";
  onRequest: (request: PreviewRequest) => void;
};

function FlowPreview({
  initialStep = "details", initialPaymentLink = paymentCopy.stories.link, empty = false,
  canSend = true, pending = false, sendBehavior = "request", onRequest,
}: PreviewProps) {
  const [step, setStep] = useState(initialStep);
  const [values, setValues] = useState(() => ({
    ...estimateEditorInitialValues(empty), internalNotes: c.stories.privateNotes,
  }));
  const [paymentLink, setPaymentLink] = useState(initialPaymentLink);
  const [email, setEmail] = useState(estimatePaperFixture.recipientEmail);
  const [subject, setSubject] = useState<string>(c.stories.subjectValue);
  const [showErrors, setShowErrors] = useState(false);
  const [notice, setNotice] = useState("");
  const [error, setError] = useState("");
  const [sending, setSending] = useState(false);
  const [sendAccess, setSendAccess] = useState(canSend);
  const busy = pending || sending;
  const review = reviewEstimateEditorDraftValues(values, estimatePreviewData.members, { today: c.stories.reviewDate });
  const content = estimateEditorPaper({ ...values, paymentLink }, {
    number: estimatePaperFixture.number, revision: 1, business: estimatePaperFixture.business,
    preparedBy: c.stories.member, relatedRecord: estimatePaperFixture.relatedRecord,
  });
  const source = { state: "draft" as const, content };
  const ready = review.valid && !reviewEstimatePaper(source).issues.length &&
    reviewEstimatePaymentLink(paymentLink).state !== "invalid";
  const emailValid = !!email.trim() && leadSchema.shape.email.safeParse(email).success;
  const subjectValid = !!subject.trim() && subject.trim().length <= 300 && !/[\r\n]/.test(subject);

  function move(next: EstimateCreationStep) {
    setNotice(""); setError(""); setShowErrors(false); setStep(next);
  }
  function continueFlow() {
    if (!ready) { setShowErrors(true); setError(c.stories.blocked); return; }
    move(step === "details" ? "review" : "send");
  }
  function requestSend() {
    if (!sendAccess || busy) return;
    setShowErrors(true); setNotice(""); setError("");
    if (!ready) { setError(c.stories.blocked); return; }
    if (!emailValid) { setError(c.stories.invalidEmail); return; }
    if (!subjectValid) { setError(c.stories.invalidSubject); return; }
    onRequest("send");
    if (sendBehavior === "pending") setSending(true);
    else if (sendBehavior === "error") setError(c.stories.sendError);
    else setNotice(c.stories.confirmation);
  }

  return <main className="mx-auto grid min-h-screen w-full max-w-6xl gap-6 p-4 text-ink sm:p-8 print:min-h-0 print:p-0">
    <header className="grid gap-2 print:hidden">
      <p className="m-0 text-sm text-muted">{c.stories.notice}</p>
      <h1 className="m-0 text-heading font-semibold">{c.stories.title}</h1>
    </header>
    <EstimateCreationFlow step={step} pending={busy} notice={notice} error={error}
      continueDisabled={step === "review" && !ready} onContinue={continueFlow}
      onBack={() => move(step === "send" ? "review" : "details")}
      onSaveDraft={() => { onRequest("save"); setNotice(c.stories.saved); }}
      onSend={sendAccess ? requestSend : undefined}
      onPublish={sendAccess ? () => { onRequest("publish"); setNotice(c.stories.publication); } : undefined}
      publishDisabled={!ready} sendDisabled={!ready}>
      {step === "details" ? <div className="grid min-w-0 gap-6 print:hidden">
        <div className="grid min-w-0 items-start gap-6 lg:grid-cols-2">
          <EstimateDetailsCard value={values.details} number={null} members={estimatePreviewData.members}
            canEdit canAssignOwner pending={busy} errors={showErrors ? review.details : undefined}
            onChange={details => setValues({ ...values, details })} />
          <div className="grid min-w-0 gap-6">
            <EstimatePaymentOption value={paymentLink} canEdit pending={busy} showErrors={showErrors} onChange={setPaymentLink} />
            <EstimateScopeCard value={values.scope} canEdit pending={busy}
              onChange={scope => setValues({ ...values, scope })} />
          </div>
        </div>
        <EstimateItemsEditor items={values.items} canEdit pending={busy} showErrors={showErrors}
          onChange={items => setValues({ ...values, items })} />
        <div className="grid min-w-0 items-start gap-6 lg:grid-cols-2">
          <EstimateTotals items={values.items} value={values.totals} deposit={values.terms.deposit}
            canEdit pending={busy} onChange={totals => setValues({ ...values, totals })} />
          <EstimateTermsCard value={values.terms} timezone={c.stories.timezone} calculation={review.calculation}
            canEdit pending={busy} errors={showErrors ? review.terms : undefined}
            onChange={terms => setValues({ ...values, terms })} />
        </div>
      </div> : step === "review" ? <div className="grid min-w-0 gap-4">
        <div className="mx-auto grid w-full max-w-letter gap-4">
          <div className="print:hidden"><button type="button" className={estimateButton}
            onClick={() => setNotice(c.stories.printNotice)}>{c.stories.print}</button></div>
          <EstimatePreviewPaper source={source} showPrintControl={false} />
        </div>
      </div> : <div className="grid min-w-0 items-start gap-6 print:hidden lg:grid-cols-2">
        <section aria-label={c.stories.delivery} className={`${estimatePanel} grid min-w-0 gap-5`}>
          <TextField name="deliveryEmail" type="email" label={c.stories.email} required value={email}
            disabled={busy} error={showErrors && !emailValid}
            helperText={showErrors && !emailValid ? c.stories.invalidEmail : c.stories.emailHint}
            onChange={event => setEmail(event.target.value)}
            slotProps={{ input: { className: "has-focus-visible:focus-ring" }, htmlInput: { maxLength: 254 } }} />
          <TextField name="subject" label={c.stories.subject} required value={subject}
            disabled={busy} error={showErrors && !subjectValid}
            helperText={showErrors && !subjectValid ? c.stories.invalidSubject : undefined}
            onChange={event => setSubject(event.target.value)}
            slotProps={{ input: { className: "has-focus-visible:focus-ring" }, htmlInput: { maxLength: 300 } }} />
          <p className="m-0 text-sm leading-6 text-muted">{c.stories.sendHint}</p>
          {!sendAccess && <FormFeedback kind="error" message={c.stories.noSendPermission} />}
        </section>
        <div className="grid min-w-0 gap-4">
          <section aria-label={c.stories.summary} className={`${estimatePanel} grid min-w-0 gap-4`}>
            <h3 className="m-0 text-lg font-semibold">{c.stories.summary}</h3>
            <p className="m-0 wrap-anywhere">{content.name}</p>
            <dl className="m-0 grid gap-3 text-sm">
              <div><dt className="text-muted">{c.stories.recipient}</dt><dd className="m-0 font-semibold">{content.recipientName}</dd></div>
              <div><dt className="text-muted">{c.stories.total}</dt><dd className="m-0 font-semibold"><MoneyText cents={review.calculation.totalCents} /></dd></div>
              <div><dt className="text-muted">{c.stories.validUntil}</dt><dd className="m-0">{content.validUntil}</dd></div>
            </dl>
          </section>
        </div>
      </div>}
    </EstimateCreationFlow>
    {step === "send" && <div className="print:hidden"><button type="button" className={estimateButton} disabled={busy}
      onClick={() => setSendAccess(false)}>{c.stories.removeAccess}</button></div>}
  </main>;
}

const meta = {
  title: "Estimates/EstimateCreationFlow",
  component: FlowPreview, parameters: { layout: "fullscreen" },
  args: { onRequest: fn() },
} satisfies Meta<typeof FlowPreview>;
export default meta;
type Story = StoryObj<typeof meta>;

export const Details: Story = {
  play: async ({ canvasElement }) => {
    const progress = within(canvasElement).getByRole("navigation", { name: c.progress });
    for (const item of within(progress).getAllByRole("listitem")) {
      const [number, label] = item.children;
      const numberBounds = number.getBoundingClientRect();
      const labelBounds = label.getBoundingClientRect();
      await expect(labelBounds.left).toBeGreaterThan(numberBounds.right);
      await expect(Math.abs((numberBounds.top + numberBounds.height / 2) -
        (labelBounds.top + labelBounds.height / 2))).toBeLessThan(1);
    }
  },
};
export const Review: Story = {
  args: { initialStep: "review" },
  play: async context => {
    await Details.play?.(context);
    const canvas = within(context.canvasElement);
    await userEvent.click(canvas.getByRole("button", { name: c.stories.print }));
    await expect(canvas.getByText(c.stories.printNotice)).toBeVisible();
    await expect(context.args.onRequest).not.toHaveBeenCalled();
  },
};
export const Send: Story = {
  args: { initialStep: "send" },
  play: async context => {
    await Details.play?.(context);
    await expect(within(context.canvasElement).queryByRole("link", { name: `${paymentCopy.action} — ${paymentCopy.external}` })).not.toBeInTheDocument();
  },
};
export const Interactive: Story = {
  play: async ({ canvasElement, args }) => {
    const canvas = within(canvasElement);
    const progress = canvas.getByRole("navigation", { name: c.progress });
    await expect(progress.querySelector('[aria-current="step"]')).toHaveTextContent(c.steps.details.label);
    await userEvent.click(canvas.getByRole("button", { name: c.continue.details }));
    await expect(canvas.getByRole("heading", { name: c.steps.review.title })).toHaveFocus();
    await expect(progress.querySelector('[aria-current="step"]')).toHaveTextContent(c.steps.review.label);
    await expect(canvas.getByRole("link", { name: `${paymentCopy.action} — ${paymentCopy.external}` })).toBeVisible();
    await expect(canvas.queryByText(c.stories.privateNotes)).not.toBeInTheDocument();
    await userEvent.click(canvas.getByRole("button", { name: c.continue.review }));
    await expect(canvas.getByRole("heading", { name: c.steps.send.title })).toHaveFocus();
    await expect(progress.querySelector('[aria-current="step"]')).toHaveTextContent(c.steps.send.label);
    await expect(canvas.queryByRole("link", { name: `${paymentCopy.action} — ${paymentCopy.external}` })).not.toBeInTheDocument();
    await expect(args.onRequest).not.toHaveBeenCalled();
    await userEvent.click(canvas.getByRole("button", { name: c.send }));
    await expect(args.onRequest).toHaveBeenCalledOnce();
    await expect(args.onRequest).toHaveBeenCalledWith("send");
    await expect(canvas.getByText(c.stories.confirmation)).toBeVisible();
  },
};
export const EditsRequireFreshReview: Story = {
  args: { initialStep: "send" },
  play: async ({ canvasElement, args }) => {
    const canvas = within(canvasElement);
    await userEvent.click(canvas.getByRole("button", { name: c.back.send }));
    await userEvent.click(canvas.getByRole("button", { name: c.back.review }));
    fireEvent.change(canvas.getByRole("textbox", { name: /^Estimate name/ }), { target: { value: c.stories.editedName } });
    fireEvent.change(canvas.getByRole("textbox", { name: paymentCopy.field }), { target: { value: "" } });
    await userEvent.click(canvas.getByRole("button", { name: c.continue.details }));
    await expect(canvas.getByRole("heading", { level: 1, name: c.stories.editedName })).toBeVisible();
    await expect(canvas.queryByRole("heading", { name: paymentCopy.title })).not.toBeInTheDocument();
    await expect(canvas.queryByRole("button", { name: c.send })).not.toBeInTheDocument();
    await expect(args.onRequest).not.toHaveBeenCalled();
  },
};
export const MissingDetails: Story = {
  args: { empty: true },
  play: async ({ canvasElement, args }) => {
    const canvas = within(canvasElement);
    await userEvent.click(canvas.getByRole("button", { name: c.continue.details }));
    await expect(canvas.getByText(c.stories.blocked)).toBeVisible();
    await expect(canvas.getByRole("heading", { name: c.steps.details.title })).toBeVisible();
    await expect(args.onRequest).not.toHaveBeenCalled();
  },
};
export const InvalidPaymentLink: Story = {
  args: { initialPaymentLink: paymentCopy.stories.unsafeLink },
  play: async ({ canvasElement, args }) => {
    const canvas = within(canvasElement);
    await userEvent.click(canvas.getByRole("button", { name: c.continue.details }));
    await expect(canvas.getByRole("textbox", { name: paymentCopy.field })).toHaveAttribute("aria-invalid", "true");
    await expect(canvas.getByText(paymentCopy.invalid)).toBeVisible();
    await expect(canvas.getByRole("textbox", { name: paymentCopy.field })).toHaveFocus();
    await expect(args.onRequest).not.toHaveBeenCalled();
  },
};
export const NoPaymentLink: Story = { args: { initialStep: "review", initialPaymentLink: "" } };
export const SendPermissionDenied: Story = {
  args: { initialStep: "send", canSend: false },
  play: async ({ canvasElement, args }) => {
    const canvas = within(canvasElement);
    await expect(canvas.getByText(c.stories.noSendPermission)).toBeVisible();
    await expect(canvas.queryByRole("button", { name: c.send })).not.toBeInTheDocument();
    await expect(canvas.queryByRole("button", { name: c.publish })).not.toBeInTheDocument();
    await expect(args.onRequest).not.toHaveBeenCalled();
  },
};
export const PermissionRemoved: Story = {
  args: { initialStep: "send" },
  play: async ({ canvasElement, args }) => {
    const canvas = within(canvasElement);
    await userEvent.click(canvas.getByRole("button", { name: c.stories.removeAccess }));
    await expect(canvas.queryByRole("button", { name: c.send })).not.toBeInTheDocument();
    await expect(args.onRequest).not.toHaveBeenCalled();
  },
};
export const PublishWithoutEmail: Story = {
  args: { initialStep: "send" },
  play: async ({ canvasElement, args }) => {
    const canvas = within(canvasElement);
    fireEvent.change(canvas.getByRole("textbox", { name: new RegExp(c.stories.email) }), { target: { value: "" } });
    await userEvent.click(canvas.getByRole("button", { name: c.publish }));
    await expect(args.onRequest).toHaveBeenCalledOnce();
    await expect(args.onRequest).toHaveBeenCalledWith("publish");
    await expect(canvas.getByText(c.stories.publication)).toBeVisible();
  },
};
export const Pending: Story = {
  args: { initialStep: "send", sendBehavior: "pending" },
  play: async ({ canvasElement, args }) => {
    const canvas = within(canvasElement);
    await userEvent.click(canvas.getByRole("button", { name: c.send }));
    await expect(canvas.getByRole("button", { name: c.pending })).toBeDisabled();
    await expect(canvas.getByRole("button", { name: c.back.send })).toBeDisabled();
    await expect(canvas.getByRole("textbox", { name: new RegExp(c.stories.email) })).toBeDisabled();
    await expect(args.onRequest).toHaveBeenCalledOnce();
    await expect(args.onRequest).toHaveBeenCalledWith("send");
  },
};
export const SendFailure: Story = {
  args: { initialStep: "send", sendBehavior: "error" },
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement);
    await userEvent.click(canvas.getByRole("button", { name: c.send }));
    await expect(canvas.getByText(c.stories.sendError)).toBeVisible();
    await expect(canvas.getByRole("textbox", { name: new RegExp(c.stories.email) })).toHaveValue(estimatePaperFixture.recipientEmail);
    await expect(canvas.queryByRole("link", { name: `${paymentCopy.action} — ${paymentCopy.external}` })).not.toBeInTheDocument();
    await userEvent.click(canvas.getByRole("button", { name: c.back.send }));
    await expect(canvas.getByRole("link", { name: `${paymentCopy.action} — ${paymentCopy.external}` })).toHaveAttribute("href", paymentCopy.stories.link);
  },
};
export const MobileDetails: Story = {
  globals: { viewport: { value: "phone", isRotated: false } }, play: Details.play,
};
export const MobileReview: Story = {
  args: { initialStep: "review" }, globals: { viewport: { value: "phone", isRotated: false } }, play: Details.play,
};
export const CustomerPaymentPreview: Story = {
  render: () => <main className="min-h-screen bg-canvas p-4 text-ink sm:p-8 print:min-h-0 print:bg-paper print:p-0">
    <p className="mx-auto mb-4 max-w-letter text-sm text-muted print:hidden">{c.stories.notice}</p>
    <div className="mx-auto grid max-w-letter gap-4">
      <EstimatePreviewPaper source={{
        ...estimatePaperSnapshotFixture,
        content: { ...estimatePaperSnapshotFixture.content, paymentLink: paymentCopy.stories.link },
      }} showPrintControl={false} />
    </div>
  </main>,
};
