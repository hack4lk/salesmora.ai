import { useState } from "react";
import type { Meta, StoryObj } from "@storybook/nextjs-vite";
import { calculateEstimateTotals } from "@salesmora/domain";
import { expect, fireEvent, fn, mocked, userEvent, waitFor, within } from "storybook/test";
import { estimatePaperAmounts, type EstimatePaperContent } from "../estimate-preview-paper/estimate-preview-paper.preview";
import { estimatePaperFixture as d, estimatePaperSnapshotFixture as snapshot, estimatePreviewPaperData as paper } from "../estimate-preview-paper/estimate-preview-paper.data";
import { estimateButton } from "../estimate-ui";
import { PublicEstimateView, type PublicEstimateViewProps } from "./public-estimate-view";
import { publicEstimateViewData as c } from "./public-estimate-view.data";
import type { PublicEstimateSource } from "./public-estimate-view.preview";
import { estimatePaymentOptionData as payment } from "../estimate-payment-option/estimate-payment-option.data";

const ready = { state: "ready", snapshot } as const;
const meta = {
  title: "Estimates/PublicEstimateView",
  component: PublicEstimateView,
  parameters: { layout: "fullscreen" },
  args: { source: ready, onPrint: fn() },
} satisfies Meta<typeof PublicEstimateView>;
export default meta;
type Story = StoryObj<typeof meta>;
function captured(content: EstimatePaperContent): PublicEstimateSource {
  const amounts = estimatePaperAmounts(calculateEstimateTotals(content));
  if (!amounts) throw new Error("Invalid public estimate fixture.");
  return { state: "ready", snapshot: { ...snapshot, content, amounts } };
}
async function messageOnly({ canvasElement }: { canvasElement: HTMLElement }) {
  const canvas = within(canvasElement);
  await expect(canvas.queryByRole("article")).not.toBeInTheDocument();
  await expect(canvas.queryByRole("button", { name: paper.print })).not.toBeInTheDocument();
  await expect(canvas.queryByText(d.business.name)).not.toBeInTheDocument();
  await expect(canvas.queryByText(d.recipientName)).not.toBeInTheDocument();
  await expect(canvas.queryByText("$969.17")).not.toBeInTheDocument();
  await expect(canvasElement.querySelectorAll("a, input, textarea, form, nav")).toHaveLength(0);
}
export const Sent: Story = {
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement);
    await expect(canvas.getByRole("region", { name: c.region })).toBeVisible();
    await expect(canvas.getByRole("article")).toBeVisible();
    await expect(canvas.getByText("$969.17")).toBeVisible();
    await expect(canvas.getByText(c.guidance)).toBeVisible();
    await expect(canvas.queryByText(paper.draft, { exact: true })).not.toBeInTheDocument();
    await expect(canvasElement.querySelectorAll("a, input, textarea, form, nav")).toHaveLength(0);
    await expect(canvas.getAllByRole("button")).toHaveLength(1);
  },
};
export const PublishedWithoutEmail: Story = {
  args: { source: captured({ ...d, recipientEmail: "" }) },
  play: Sent.play,
};
export const NativeBrowserPrint: Story = { args: { onPrint: undefined } };
export const WithPayment: Story = {
  args: { source: captured({ ...d, paymentLink: payment.stories.link }) },
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement);
    const article = within(canvas.getByRole("article"));
    await expect(article.queryByText("The business has provided an external payment option for this estimate.")).not.toBeInTheDocument();
    await expect(article.getByRole("link", { name: `${payment.action} — ${payment.external}` })).toHaveAttribute("href", payment.stories.link);
    await expect(article.getByText(payment.stories.link, { exact: true })).toBeVisible();
  },
};
export const UnsafePaymentWithheld: Story = {
  args: { source: captured({ ...d, paymentLink: payment.stories.unsafeLink }) }, play: messageOnly,
};
export const WithLogo: Story = {
  args: { source: captured({ ...d, business: { ...d.business, logoPath: "/branding/salesmora-logo.svg" } }) },
  play: async ({ canvasElement }) => {
    const image = within(canvasElement).getByRole("img", { name: paper.logo(d.business.name) });
    await waitFor(() => expect(image instanceof HTMLImageElement && image.complete && image.naturalWidth > 0).toBe(true));
  },
};
export const BrokenLogo: Story = {
  args: WithLogo.args,
  play: async (context) => {
    if (WithLogo.play) await WithLogo.play(context);
    const canvas = within(context.canvasElement);
    fireEvent.error(canvas.getByRole("img"));
    await expect(canvas.queryByRole("img")).not.toBeInTheDocument();
    await expect(context.canvasElement.querySelector('article header [aria-hidden="true"]')).toHaveTextContent(d.business.name[0]);
    await expect(canvas.getByRole("button", { name: paper.print })).toBeEnabled();
  },
};
export const PrintRequest: Story = {
  play: async ({ canvasElement, args }) => {
    await userEvent.click(within(canvasElement).getByRole("button", { name: paper.print }));
    await expect(args.onPrint).toHaveBeenCalledTimes(1);
    await expect(within(canvasElement).getByRole("article")).toBeVisible();
  },
};
export const PrintFailure: Story = {
  play: async ({ canvasElement, args }) => {
    if (!args.onPrint) throw new Error("Expected a local print mock.");
    args.onPrint.mockRejectedValueOnce(new Error(c.stories.private));
    const canvas = within(canvasElement);
    await userEvent.click(canvas.getByRole("button", { name: paper.print }));
    await expect(canvas.getByText(paper.printFailed)).toBeVisible();
    await expect(canvasElement).not.toHaveTextContent(c.stories.private);
  },
};
export const PrintKeyboard: Story = {
  play: async ({ canvasElement, args }) => {
    const button = within(canvasElement).getByRole("button", { name: paper.print });
    await userEvent.tab();
    await expect(button).toHaveFocus();
    await expect(getComputedStyle(button).outlineWidth).toBe("3px");
    await userEvent.keyboard("{Enter}");
    await expect(args.onPrint).toHaveBeenCalledTimes(1);
  },
};
export const Loading: Story = {
  args: { source: { state: "loading" } },
  play: async (context) => {
    await messageOnly(context);
    await expect(within(context.canvasElement).getByRole("status")).toHaveTextContent(c.loading);
  },
};
export const Expired: Story = { args: { source: { state: "expired" } }, play: messageOnly };
export const Revoked: Story = { args: { source: { state: "revoked" } }, play: messageOnly };
export const Withdrawn: Story = { args: { source: { state: "withdrawn" } }, play: messageOnly };
export const Replaced: Story = { args: { source: { state: "replaced" } }, play: messageOnly };
export const NotFound: Story = { args: { source: { state: "not-found" } }, play: messageOnly };
export const RateLimited: Story = {
  args: { source: { state: "rate-limited" }, onReload: fn() },
  play: async (context) => {
    await messageOnly(context);
    await expect(within(context.canvasElement).queryByRole("button")).not.toBeInTheDocument();
    await expect(context.args.onReload).not.toHaveBeenCalled();
  },
};
export const LoadError: Story = { args: { source: { state: "error" } }, play: messageOnly };
export const SnapshotUnavailable: Story = { args: { source: { state: "unavailable" } }, play: messageOnly };
export const InvalidSnapshot: Story = {
  args: { source: { state: "ready", snapshot: { ...snapshot, amounts: { ...snapshot.amounts, totalCents: 1 } } } },
  play: async (context) => {
    await messageOnly(context);
    await expect(within(context.canvasElement).getByRole("heading", { name: c.states.unavailable.title })).toBeVisible();
    await expect(context.canvasElement).not.toHaveTextContent(paper.invalidSnapshot);
  },
};
export const ReloadRequestOnly: Story = {
  args: { source: { state: "error" }, onReload: fn() },
  play: async (context) => {
    const canvas = within(context.canvasElement);
    await userEvent.click(canvas.getByRole("button", { name: c.retry }));
    await expect(context.args.onReload).toHaveBeenCalledTimes(1);
    await expect(canvas.getByRole("heading", { name: c.states.error.title })).toBeVisible();
    await messageOnly(context);
  },
};
export const ReloadFailure: Story = {
  args: { source: { state: "error" }, onReload: fn() },
  play: async (context) => {
    if (!context.args.onReload) throw new Error("Expected a local reload mock.");
    mocked(context.args.onReload).mockRejectedValueOnce(new Error(c.stories.reloadError));
    const canvas = within(context.canvasElement);
    await userEvent.click(canvas.getByRole("button", { name: c.retry }));
    await expect(canvas.getByText(c.reloadFailed)).toBeVisible();
    await expect(context.canvasElement).not.toHaveTextContent(c.stories.reloadError);
    await userEvent.click(canvas.getByRole("button", { name: c.retry }));
    await expect(context.args.onReload).toHaveBeenCalledTimes(2);
    await expect(canvas.queryByText(c.reloadFailed)).not.toBeInTheDocument();
    await messageOnly(context);
  },
};
export const ReloadPending: Story = {
  args: { source: { state: "error" }, onReload: fn(() => new Promise<void>(() => {})) },
  play: async ({ canvasElement, args }) => {
    const canvas = within(canvasElement);
    await userEvent.click(canvas.getByRole("button", { name: c.retry }));
    await expect(canvas.getByRole("button", { name: c.reloading })).toBeDisabled();
    await userEvent.click(canvas.getByRole("button", { name: c.reloading }));
    await expect(args.onReload).toHaveBeenCalledTimes(1);
  },
};
function ReloadPreview(args: PublicEstimateViewProps) {
  const [source, setSource] = useState(args.source);
  return <PublicEstimateView {...args} source={source} onReload={async () => {
    await args.onReload?.();
    setSource(ready);
  }} />;
}
export const ReloadCurrentSnapshot: Story = {
  args: { source: { state: "error" }, onReload: fn() },
  render: (args) => <ReloadPreview {...args} />,
  play: async ({ canvasElement, args }) => {
    await userEvent.click(within(canvasElement).getByRole("button", { name: c.retry }));
    await expect(args.onReload).toHaveBeenCalledTimes(1);
    await expect(within(canvasElement).getByRole("article")).toBeVisible();
  },
};
function AvailabilityPreview({ next, ...args }: PublicEstimateViewProps & { next: "expired" | "revoked" | "replaced" | "loading" }) {
  const [source, setSource] = useState(args.source);
  const labels = { expired: c.stories.changeExpired, revoked: c.stories.changeRevoked, replaced: c.stories.changeReplaced, loading: c.stories.changeLoading };
  return <><div className="p-4 print:hidden"><button type="button" className={estimateButton} onClick={() => setSource({ state: next })}>{labels[next]}</button></div>
    <PublicEstimateView {...args} source={source} /></>;
}
export const ExpiresWhileOpen: Story = {
  render: (args) => <AvailabilityPreview {...args} next="expired" />,
  play: async (context) => {
    await userEvent.click(within(context.canvasElement).getByRole("button", { name: c.stories.changeExpired }));
    await messageOnly(context);
    await expect(within(context.canvasElement).getByRole("heading", { name: c.states.expired.title })).toBeVisible();
  },
};
export const RevokedWhileOpen: Story = {
  render: (args) => <AvailabilityPreview {...args} next="revoked" />,
  play: async (context) => {
    await userEvent.click(within(context.canvasElement).getByRole("button", { name: c.stories.changeRevoked }));
    await messageOnly(context);
  },
};
export const ReplacedWhileOpen: Story = {
  render: (args) => <AvailabilityPreview {...args} next="replaced" />,
  play: async (context) => {
    await userEvent.click(within(context.canvasElement).getByRole("button", { name: c.stories.changeReplaced }));
    await messageOnly(context);
  },
};
export const LoadingWithStaleSnapshot: Story = {
  args: { source: Object.assign({ state: "loading" as const }, { snapshot }) },
  play: Loading.play,
};
export const PrivacyBoundary: Story = {
  args: { source: { state: "ready", snapshot: { ...snapshot, content: Object.assign({}, d, {
    internalNotes: c.stories.private, decisionReason: c.stories.private, ownerId: c.stories.private, shareToken: c.stories.private,
  }) } } },
  play: async ({ canvasElement }) => {
    await expect(canvasElement).not.toHaveTextContent(c.stories.private);
    await expect(canvasElement.innerHTML).not.toContain(c.stories.private);
    await expect(canvasElement.querySelectorAll("a, input, textarea, form, nav")).toHaveLength(0);
  },
};
export const PrivacyMetadata: Story = {
  play: async ({ canvasElement }) => {
    const head = canvasElement.ownerDocument.head;
    await expect(head.querySelector('meta[name="robots"]')).toHaveAttribute("content", "noindex, nofollow");
    await expect(head.querySelector('meta[name="referrer"]')).toHaveAttribute("content", "no-referrer");
  },
};
export const LongContent: Story = {
  args: { source: captured({ ...d, business: { ...d.business, name: c.stories.longBusiness }, name: c.stories.longName,
    scope: c.stories.longText.repeat(50).slice(0, 5000), message: c.stories.longText.repeat(20).slice(0, 2000),
    termsNote: c.stories.longText.repeat(50).slice(0, 5000), paymentTerms: c.stories.longText.repeat(5).slice(0, 500) }) },
};
export const OneHundredItems: Story = {
  args: { source: captured({ ...d, items: Array.from({ length: 100 }, (_, index) => ({ ...d.items[0], description: c.stories.longItem(index), quantity: "1", unitPrice: "25.29" })) }) },
};
export const MaximumMoney: Story = {
  args: { source: captured({ ...d, items: [{ ...d.items[0], quantity: "10", unitPrice: "1000000", taxable: true }], discount: { type: "none" }, taxRate: "100" }) },
};
export const Mobile: Story = { globals: { viewport: { value: "mobile1", isRotated: false } } };
export const Tablet: Story = { globals: { viewport: { value: "tablet", isRotated: false } } };
