import { useState } from "react";
import type { Meta, StoryObj } from "@storybook/nextjs-vite";
import { expect, fireEvent, fn, userEvent, waitFor, within } from "storybook/test";
import { estimateButton } from "../estimate-ui";
import { EstimatePreviewPaper } from "./estimate-preview-paper";
import { estimatePaperDraftFixture, estimatePaperFixture as d, estimatePaperSnapshotFixture as snapshot, estimatePreviewPaperData as c } from "./estimate-preview-paper.data";
import type { EstimatePaperContent } from "./estimate-preview-paper.preview";

const meta = {
  title: "Estimates/EstimatePreviewPaper",
  component: EstimatePreviewPaper,
  parameters: { layout: "fullscreen" },
  args: { source: estimatePaperDraftFixture, onPrint: fn() },
  decorators: [(Story) => <main className="min-h-screen min-w-0 bg-canvas p-4 sm:p-8 print:min-h-0 print:bg-paper print:p-0">
    <p className="mx-auto mb-6 mt-0 max-w-letter text-sm leading-6 text-muted print:hidden">{c.stories.notice}</p>
    <Story />
  </main>],
} satisfies Meta<typeof EstimatePreviewPaper>;
export default meta;
type Story = StoryObj<typeof meta>;
const draft = (patch: Partial<EstimatePaperContent>) => ({ source: { state: "draft" as const, content: { ...d, ...patch } } });

export const Draft: Story = {
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement), article = within(canvas.getByRole("article"));
    await expect(article.getByText(c.draft, { exact: true })).toBeVisible();
    await expect(article.getByText("$969.17")).toBeVisible();
    await expect(article.getByText("$242.29")).toBeVisible();
    await expect(article.getByText("$726.88")).toBeVisible();
    await expect(article.getByText(c.signature)).toBeVisible();
    await expect(article.queryByText("Not a contract or invoice.", { exact: true })).not.toBeInTheDocument();
    await expect(canvas.getByRole("button", { name: c.print })).toBeEnabled();
  },
};
export const FrozenSnapshot: Story = {
  args: { source: snapshot },
  play: async ({ canvasElement }) => {
    const article = within(within(canvasElement).getByRole("article"));
    await expect(article.queryByText(c.draft, { exact: true })).not.toBeInTheDocument();
    await expect(article.getByText(d.business.name)).toBeVisible();
    await expect(article.getByText("$969.17")).toBeVisible();
    await expect(article.getByText(c.tax("8.875"))).toBeVisible();
    await expect(article.queryByRole("button")).not.toBeInTheDocument();
    await expect(article.queryByRole("textbox")).not.toBeInTheDocument();
  },
};
export const EmbeddedPaper: Story = {
  args: { source: snapshot, showPrintControl: false },
  play: async ({ canvasElement }) => {
    await expect(within(canvasElement).queryByRole("button")).not.toBeInTheDocument();
    await expect(within(canvasElement).getByRole("article")).toBeVisible();
  },
};
export const PrintRequest: Story = {
  play: async ({ canvasElement, args }) => {
    await userEvent.click(within(canvasElement).getByRole("button", { name: c.print }));
    await expect(args.onPrint).toHaveBeenCalledTimes(1);
    await expect(within(canvasElement).getByRole("article")).toBeVisible();
  },
};
export const PrintKeyboard: Story = {
  play: async ({ canvasElement, args }) => {
    const button = within(canvasElement).getByRole("button", { name: c.print });
    await userEvent.tab();
    await expect(button).toHaveFocus();
    await expect(getComputedStyle(button).outlineWidth).toBe("3px");
    await userEvent.keyboard("{Enter}");
    await expect(args.onPrint).toHaveBeenCalledTimes(1);
  },
};
export const PrintFailure: Story = {
  play: async ({ canvasElement, args }) => {
    if (!args.onPrint) throw new Error("Expected the local print mock.");
    args.onPrint.mockRejectedValueOnce(new Error(c.stories.printError));
    const canvas = within(canvasElement);
    await userEvent.click(canvas.getByRole("button", { name: c.print }));
    await expect(canvas.getByText(c.printFailed)).toBeVisible();
    await expect(canvas.getByRole("button", { name: c.print })).toBeEnabled();
    await userEvent.click(canvas.getByRole("button", { name: c.print }));
    await expect(args.onPrint).toHaveBeenCalledTimes(2);
    await expect(canvas.queryByText(c.printFailed)).not.toBeInTheDocument();
  },
};
export const PrintPending: Story = {
  args: { onPrint: fn(() => new Promise<void>(() => {})) },
  play: async ({ canvasElement, args }) => {
    const canvas = within(canvasElement);
    await userEvent.click(canvas.getByRole("button", { name: c.print }));
    await expect(canvas.getByRole("button", { name: c.printing })).toBeDisabled();
    await userEvent.click(canvas.getByRole("button", { name: c.printing }));
    await expect(args.onPrint).toHaveBeenCalledTimes(1);
  },
};
export const NativeBrowserPrint: Story = { args: { source: snapshot, onPrint: undefined } };
export const IncompleteDraft: Story = {
  args: draft({ number: "", recipientName: "", recipientEmail: "", serviceAddress: "", validUntil: "", items: [{ ...d.items[0], quantity: "", unitPrice: "" }] }),
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement);
    await expect(canvas.getByText(c.draftIncomplete, { exact: true })).toBeVisible();
    await expect(canvas.getByText(c.incompleteHint)).toBeVisible();
    await expect(canvas.queryByText("$0.00")).not.toBeInTheDocument();
    await expect(canvas.getByRole("button", { name: c.print })).toBeEnabled();
  },
};
export const EmptyItems: Story = {
  args: draft({ items: [] }),
  play: async ({ canvasElement }) => {
    await expect(within(canvasElement).getByText(c.noItems)).toBeVisible();
    await expect(within(canvasElement).queryByText("$0.00")).not.toBeInTheDocument();
  },
};
export const InvalidDeposit: Story = {
  args: draft({ deposit: { type: "percent", value: "101" } }),
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement);
    await expect(canvas.getByText("$969.17")).toBeVisible();
    await expect(canvas.queryByText("$242.29")).not.toBeInTheDocument();
    await expect(canvas.getByText(c.draftIncomplete, { exact: true })).toBeVisible();
  },
};
export const InvalidTax: Story = { args: draft({ taxRate: "bad" }) };
export const InvalidDiscount: Story = { args: draft({ discount: { type: "amount", value: "99999" } }) };
export const InvalidQuantity: Story = { args: draft({ items: [{ ...d.items[0], quantity: "1e3" }] }) };
export const OptionalAddressAndEmail: Story = {
  args: { source: { ...snapshot, content: { ...d, recipientEmail: "", serviceAddress: "", business: { ...d.business, requireServiceAddress: false } } } },
};
export const IncludedFree: Story = { args: draft({ items: [d.items[2]], discount: { type: "none" }, taxRate: "0", deposit: { type: "none" } }) };
export const MaximumMoney: Story = {
  args: draft({ items: [{ ...d.items[0], quantity: "10", unitPrice: "1000000", taxable: true }], discount: { type: "none" }, taxRate: "100", deposit: { type: "percent", value: "25" } }),
  play: async ({ canvasElement }) => {
    await expect(within(canvasElement).getByText("$20,000,000.00")).toBeVisible();
  },
};
export const MaximumQuantity: Story = {
  args: draft({ items: [{ ...d.items[2], quantity: "999999999.999" }], discount: { type: "none" }, taxRate: "0", deposit: { type: "none" } }),
};
export const LongItems: Story = {
  args: draft({ items: Array.from({ length: 100 }, (_, index) => ({ ...d.items[0], description: c.stories.longItem(index + 1), quantity: "1", unitPrice: "25.29" })) }),
  play: async ({ canvasElement }) => {
    const article = within(within(canvasElement).getByRole("article"));
    await expect(article.getAllByText(c.stories.longItem(100)).length).toBe(2);
  },
};
export const LongText: Story = {
  args: draft({
    name: c.stories.longName, recipientName: c.stories.longCustomer,
    scope: c.stories.longParagraph.repeat(50).slice(0, 5000),
    message: c.stories.longParagraph.repeat(20).slice(0, 2000),
    termsNote: c.stories.longParagraph.repeat(50).slice(0, 5000),
    paymentTerms: c.stories.longParagraph.repeat(4).slice(0, 500),
  }),
};
export const UnbrokenText: Story = {
  args: draft({ recipientName: "X".repeat(120), items: [{ ...d.items[0], description: "W".repeat(200), unit: "L".repeat(40) }], scope: "S".repeat(5000) }),
};
export const LiteralText: Story = {
  args: draft({ scope: c.stories.literal }),
  play: async ({ canvasElement }) => {
    await expect(within(canvasElement).getByText(c.stories.literal.replace("\n", " "))).toBeVisible();
    await expect(canvasElement.querySelector("article script")).toBeNull();
  },
};
export const PrivacyBoundary: Story = {
  args: { source: { ...snapshot, content: Object.assign({}, d, { internalNotes: c.stories.private, decisionReason: c.stories.private, ownerId: c.stories.private, shareToken: c.stories.private, history: [c.stories.private] }) } },
  play: async ({ canvasElement }) => {
    await expect(canvasElement).not.toHaveTextContent(c.stories.private);
    await expect(canvasElement.querySelectorAll("a, input, textarea, [data-token]")).toHaveLength(0);
  },
};
export const CurrentProfileDoesNotChangeSnapshot: Story = {
  args: { source: snapshot },
  render: function CurrentProfilePreview(args) {
    const [current, setCurrent] = useState({ business: d.business.name, price: d.items[0].unitPrice, logoPath: args.source.state === "snapshot" ? args.source.content.business.logoPath : d.business.logoPath });
    return <><div className="mb-4 print:hidden"><button type="button" className={estimateButton} onClick={() => setCurrent({ business: c.stories.changedBusiness, price: "999", logoPath: null })}>{c.stories.changeCurrent}</button>
      <p>{current.business} - {current.price} - {current.logoPath ?? c.stories.noCurrentLogo}</p>
      {current.business !== d.business.name && <p role="status">{c.stories.currentChanged}</p>}</div><EstimatePreviewPaper {...args} /></>;
  },
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement);
    await userEvent.click(canvas.getByRole("button", { name: c.stories.changeCurrent }));
    await expect(canvas.getByRole("status")).toHaveTextContent(c.stories.currentChanged);
    await expect(within(canvas.getByRole("article")).getByText(d.business.name)).toBeVisible();
    await expect(within(canvas.getByRole("article")).queryByText(c.stories.changedBusiness)).not.toBeInTheDocument();
    await expect(canvas.getByText("$969.17")).toBeVisible();
  },
};
export const WithLogo: Story = {
  args: draft({ business: { ...d.business, name: c.stories.demoLogoBusiness, logoPath: "/branding/salesmora-logo.svg" } }),
  play: async ({ canvasElement }) => {
    const image = within(canvasElement).getByRole("img", { name: c.logo(c.stories.demoLogoBusiness) });
    await expect(image).toBeVisible();
    await expect(image).toHaveProperty("src", new URL("/branding/salesmora-logo.svg", canvasElement.ownerDocument.baseURI).href);
    await expect(image).toHaveAttribute("loading", "eager");
    await waitFor(() => expect(image instanceof HTMLImageElement && image.complete && image.naturalWidth > 0).toBe(true));
  },
};
export const NoLogo: Story = {
  play: async ({ canvasElement }) => {
    await expect(within(canvasElement).queryByRole("img")).not.toBeInTheDocument();
    await expect(canvasElement.querySelector('article header [aria-hidden="true"]')).toHaveTextContent(d.business.name[0]);
  },
};
export const BrokenLogo: Story = {
  args: WithLogo.args,
  play: async (context) => {
    if (WithLogo.play) await WithLogo.play(context);
    const canvas = within(context.canvasElement);
    fireEvent.error(canvas.getByRole("img"));
    await expect(canvas.queryByRole("img")).not.toBeInTheDocument();
    await expect(context.canvasElement.querySelector('article header [aria-hidden="true"]')).toHaveTextContent(c.stories.demoLogoBusiness[0]);
    await expect(canvas.getByRole("button", { name: c.print })).toBeEnabled();
  },
};
export const LogoChangesWhileOpen: Story = {
  render: function LogoChangesPreview(args) {
    const [logoPath, setLogoPath] = useState<string | null>(null);
    return <><div className="mb-4 flex flex-wrap gap-3 print:hidden">
      <button type="button" className={estimateButton} onClick={() => setLogoPath("/branding/salesmora-logo.svg")}>{c.stories.useLogo}</button>
      <button type="button" className={estimateButton} onClick={() => setLogoPath(null)}>{c.stories.removeLogo}</button>
    </div><EstimatePreviewPaper {...args} source={{ state: "draft", content: { ...d, business: { ...d.business, logoPath } } }} /></>;
  },
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement);
    await userEvent.click(canvas.getByRole("button", { name: c.stories.useLogo }));
    const image = canvas.getByRole("img");
    await waitFor(() => expect(image instanceof HTMLImageElement && image.complete && image.naturalWidth > 0).toBe(true));
    fireEvent.error(image);
    await expect(canvas.queryByRole("img")).not.toBeInTheDocument();
    await userEvent.click(canvas.getByRole("button", { name: c.stories.removeLogo }));
    await userEvent.click(canvas.getByRole("button", { name: c.stories.useLogo }));
    await waitFor(() => {
      const replacement = canvas.getByRole("img");
      expect(replacement instanceof HTMLImageElement && replacement.complete && replacement.naturalWidth > 0).toBe(true);
    });
  },
};
export const CapturedLogoUnchanged: Story = {
  args: { source: { ...snapshot, content: { ...d, business: { ...d.business, logoPath: "/branding/salesmora-logo.svg" } } } },
  render: CurrentProfileDoesNotChangeSnapshot.render,
  play: async (context) => {
    if (CurrentProfileDoesNotChangeSnapshot.play) await CurrentProfileDoesNotChangeSnapshot.play(context);
    const image = within(context.canvasElement).getByRole("img");
    await expect(image).toHaveProperty("src", new URL("/branding/salesmora-logo.svg", context.canvasElement.ownerDocument.baseURI).href);
    await waitFor(() => expect(image instanceof HTMLImageElement && image.complete && image.naturalWidth > 0).toBe(true));
  },
};
export const RemoteLogoBlocked: Story = {
  args: draft({ business: { ...d.business, logoPath: "https://example.com/logo.png" } }),
  play: async ({ canvasElement }) => {
    await expect(within(canvasElement).queryByRole("img")).not.toBeInTheDocument();
    await expect(within(canvasElement).getByText(c.issues.logo)).toBeVisible();
  },
};
export const Loading: Story = {
  args: { source: { state: "loading" } },
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement);
    await expect(canvas.getByRole("status")).toHaveTextContent(c.loading);
    await expect(canvas.getByRole("button", { name: c.print })).toBeDisabled();
    await expect(canvas.queryByRole("article")).not.toBeInTheDocument();
  },
};
export const Unavailable: Story = { args: { source: { state: "unavailable" } }, play: blocked };
export const SnapshotError: Story = { args: { source: { state: "error" } }, play: blocked };
export const InvalidSnapshot: Story = { args: { source: { ...snapshot, amounts: { ...snapshot.amounts, totalCents: 1 } } }, play: blocked };
export const IncompleteSnapshot: Story = { args: { source: { ...snapshot, content: { ...d, recipientName: "" } } }, play: blocked };
async function blocked({ canvasElement }: { canvasElement: HTMLElement }) {
  const canvas = within(canvasElement);
  await expect(canvas.getByRole("button", { name: c.print })).toBeDisabled();
  await expect(canvas.queryByRole("article")).not.toBeInTheDocument();
}
export const Mobile: Story = { args: { source: snapshot }, globals: { viewport: { value: "mobile1", isRotated: false } } };
export const Tablet: Story = { args: { source: snapshot }, globals: { viewport: { value: "tablet", isRotated: false } } };
