import { useState } from "react";
import type { Meta, StoryObj } from "@storybook/nextjs-vite";
import { expect, fireEvent, fn, mocked, userEvent, waitFor, within } from "storybook/test";
import { EstimatePreviewPaper } from "../estimate-preview-paper/estimate-preview-paper";
import { estimatePaperFixture, estimatePreviewPaperData as paper } from "../estimate-preview-paper/estimate-preview-paper.data";
import { estimateButton } from "../estimate-ui";
import { EstimateBusinessProfileForm, type EstimateBusinessProfileFormProps } from "./estimate-business-profile-form";
import { estimateBusinessProfileFormData as c, estimateBusinessProfileFixture as record, estimateBusinessProfileEmptyFixture as blankProfile } from "./estimate-business-profile-form.data";
import {
  initialEstimateBusinessProfileDraft, type EstimateBusinessProfile,
} from "./estimate-business-profile-form.preview";

const initial = initialEstimateBusinessProfileDraft(record);
const edited = { ...initial, profile: { ...initial.profile, name: c.stories.renamed } };
function ProfilePreview({
  commit = false, rebind = false, showEstimate = false, ...args
}: EstimateBusinessProfileFormProps & { commit?: boolean; rebind?: boolean; showEstimate?: boolean }) {
  const [source, setSource] = useState(args.source);
  const [value, setValue] = useState(args.value);
  const [saved, setSaved] = useState(args.saved);
  const [conflict, setConflict] = useState(args.conflict);
  const [notice, setNotice] = useState("");
  return <>
    <EstimateBusinessProfileForm {...args} source={source} value={value} saved={saved} conflict={conflict}
      onChange={args.onChange ? (next) => { setValue(next); setSaved(false); setNotice(""); args.onChange?.(next); } : undefined}
      onDiscard={args.onDiscard ? () => {
        if (source.state === "ready") setValue(initialEstimateBusinessProfileDraft(source.record));
        setSaved(false); setNotice(""); args.onDiscard?.();
      } : undefined}
      onSave={args.onSave ? async (request) => {
        await args.onSave?.(request);
        if (commit && source.state === "ready") {
          const next = { ...source.record, version: source.record.version + 1, profile: request.profile };
          setSource({ state: "ready", record: next }); setValue(initialEstimateBusinessProfileDraft(next)); setSaved(true); setNotice(c.stories.saved);
        } else setNotice(c.stories.request);
      } : undefined}
      onReload={args.onReload ? async () => {
        await args.onReload?.();
        if (rebind) {
          const next = { ...record, version: record.version + 1 };
          setSource({ state: "ready", record: next }); setValue(initialEstimateBusinessProfileDraft(next)); setConflict(false); setSaved(false); setNotice("");
        } else setNotice(c.stories.reload);
      } : undefined} />
    {notice && <p role="status" className="mt-4 text-sm text-muted">{notice}</p>}
    {showEstimate && <section className="mt-8 min-w-0">
      <h2 className="text-lg font-semibold">{c.stories.logoEstimate}</h2>
      <p className="text-sm text-muted">{c.stories.logoNotice}</p>
      <EstimatePreviewPaper showPrintControl={false} source={{ state: "draft", content: { ...estimatePaperFixture,
        business: { ...estimatePaperFixture.business, ...value.profile } } }} />
    </section>}
  </>;
}
const meta = {
  title: "Estimates/EstimateBusinessProfileForm",
  component: EstimateBusinessProfileForm,
  args: {
    source: { state: "ready", record }, value: initial, role: "owner", canRead: true, canManage: true,
    timezone: "America/New_York", onChange: fn(), onSave: fn(), onDiscard: fn(), onReload: fn(),
    onUploadLogo: fn<NonNullable<EstimateBusinessProfileFormProps["onUploadLogo"]>>(async () => ({ logoPath: c.stories.logoPath })),
  },
  render: (args) => <ProfilePreview {...args} />,
  decorators: [(Story) => <main className="mx-auto min-h-screen w-full max-w-4xl bg-canvas p-4 sm:p-8">
    <p className="mb-6 mt-0 text-sm leading-6 text-muted">{c.stories.notice}</p><Story />
  </main>],
} satisfies Meta<typeof EstimateBusinessProfileForm>;
export default meta;
type Story = StoryObj<typeof meta>;
const draft = (patch: Partial<EstimateBusinessProfile>) => ({ value: { ...initial, profile: { ...initial.profile, ...patch } } });
const logoProfile = { ...record.profile, logoPath: c.stories.alternateLogoPath };
const withLogo = { source: { state: "ready" as const, record: { ...record, profile: logoProfile } }, value: { ...initial, profile: logoProfile } };
async function selectLogo(canvasElement: HTMLElement) {
  const response = await fetch(c.stories.logoPath);
  if (!response.ok) throw new Error("Expected the local logo fixture.");
  const file = new File([await response.arrayBuffer()], "sample-logo.png", { type: "image/png" });
  await userEvent.upload(within(canvasElement).getByLabelText(c.logoFile), file);
  return file;
}
async function expectLoadedLogo(canvasElement: HTMLElement, path: string) {
  const image = within(canvasElement).getByRole("img", { name: paper.logo(record.profile.name) });
  await expect(image).toHaveProperty("src", new URL(path, canvasElement.ownerDocument.baseURI).href);
  await waitFor(() => expect(image instanceof HTMLImageElement && image.complete && image.naturalWidth > 0).toBe(true));
}
export const Owner: Story = {
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement);
    await expect(canvas.getByRole("textbox", { name: c.fields.name.label })).toHaveValue(record.profile.name);
    await expect(canvas.getByRole("button", { name: c.save })).toBeDisabled();
    await expect(canvas.getByText(c.identityComplete)).toBeVisible();
    await expect(canvas.queryByRole("textbox", { name: c.prefix })).not.toBeInTheDocument();
    await expect(canvas.queryByRole("spinbutton", { name: c.nextNumber })).not.toBeInTheDocument();
    await expect(canvas.getByText(c.logoHint)).toBeVisible();
    await expect(canvas.getByRole("button", { name: c.uploadLogo })).toBeEnabled();
    await expect(canvas.getByLabelText(c.logoFile)).toHaveAttribute("accept", "image/png,image/jpeg,image/webp");
  },
};
export const Admin: Story = { args: { role: "admin" }, play: Owner.play };
export const ExistingLogo: Story = {
  args: withLogo,
  play: async ({ canvasElement }) => {
    await expectLoadedLogo(canvasElement, c.stories.alternateLogoPath);
    await expect(within(canvasElement).getByRole("button", { name: c.replaceLogo })).toBeEnabled();
    await expect(within(canvasElement).getByRole("button", { name: c.save })).toBeDisabled();
  },
};
export const UploadLogo: Story = {
  play: async ({ canvasElement, args }) => {
    const file = await selectLogo(canvasElement), canvas = within(canvasElement);
    await waitFor(() => expect(args.onUploadLogo).toHaveBeenCalledWith({ workspaceId: record.workspaceId, expectedVersion: record.version, file }));
    await waitFor(() => expect(canvas.getByText(c.logoReady)).toBeVisible());
    await expectLoadedLogo(canvasElement, c.stories.logoPath);
    await expect(args.onSave).not.toHaveBeenCalled();
    await userEvent.click(canvas.getByRole("button", { name: c.save }));
    await expect(args.onSave).toHaveBeenCalledWith({ ...initial, profile: { ...initial.profile, logoPath: c.stories.logoPath } });
    await expect(canvas.queryByText(c.saved)).not.toBeInTheDocument();
  },
};
export const ReplaceLogo: Story = { args: withLogo, play: UploadLogo.play };
export const RemoveLogo: Story = {
  args: withLogo,
  play: async ({ canvasElement, args }) => {
    const canvas = within(canvasElement);
    await userEvent.click(canvas.getByRole("button", { name: c.removeLogo }));
    await expect(canvas.queryByRole("img")).not.toBeInTheDocument();
    await expect(canvas.getByRole("button", { name: c.uploadLogo })).toHaveFocus();
    await expect(canvas.getByText(c.logoRemoved)).toBeVisible();
    await userEvent.click(canvas.getByRole("button", { name: c.save }));
    await expect(args.onSave).toHaveBeenCalledWith(initial);
    await expect(args.onUploadLogo).not.toHaveBeenCalled();
  },
};
export const DiscardLogo: Story = {
  args: withLogo,
  play: async ({ canvasElement, args }) => {
    await selectLogo(canvasElement);
    const canvas = within(canvasElement);
    await waitFor(() => expect(canvas.getByText(c.logoReady)).toBeVisible());
    await userEvent.click(canvas.getByRole("button", { name: c.discard }));
    await expectLoadedLogo(canvasElement, c.stories.alternateLogoPath);
    await expect(canvas.getByRole("button", { name: c.save })).toBeDisabled();
    await expect(args.onSave).not.toHaveBeenCalled();
  },
};
export const RemoveWithoutUpload: Story = {
  args: { ...withLogo, onUploadLogo: undefined },
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement);
    await userEvent.click(canvas.getByRole("button", { name: c.removeLogo }));
    await expect(canvas.getByRole("textbox", { name: c.fields.name.label })).toHaveFocus();
    await expect(canvas.getByRole("button", { name: c.save })).toBeEnabled();
    await expect(canvas.queryByRole("img")).not.toBeInTheDocument();
  },
};
export const BrokenLogo: Story = {
  args: withLogo,
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement);
    await expectLoadedLogo(canvasElement, c.stories.alternateLogoPath);
    fireEvent.error(canvas.getByRole("img"));
    await expect(canvas.getByText(c.errors.logoLoad)).toBeVisible();
    await expect(canvas.queryByRole("img")).not.toBeInTheDocument();
    await expect(canvas.getByRole("button", { name: c.replaceLogo })).toBeEnabled();
  },
};
export const UploadNotConnected: Story = {
  args: { onUploadLogo: undefined },
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement);
    await expect(canvas.getByRole("button", { name: c.uploadLogo })).toBeDisabled();
    await expect(canvas.getByText(c.noLogoUpload)).toBeVisible();
  },
};
export const CancelLogoSelection: Story = {
  play: async ({ canvasElement, args }) => {
    fireEvent.change(within(canvasElement).getByLabelText(c.logoFile), { target: { files: [] } });
    await expect(args.onUploadLogo).not.toHaveBeenCalled();
    await expect(args.onChange).not.toHaveBeenCalled();
    await expect(within(canvasElement).getByRole("button", { name: c.uploadLogo })).toBeEnabled();
  },
};
export const UploadFailure: Story = {
  args: withLogo,
  play: async ({ canvasElement, args }) => {
    if (!args.onUploadLogo) throw new Error("Expected an upload mock.");
    mocked(args.onUploadLogo).mockRejectedValueOnce(new Error(c.stories.private));
    const canvas = within(canvasElement);
    await selectLogo(canvasElement);
    await waitFor(() => expect(canvas.getByText(c.errors.logoUpload)).toBeVisible());
    await expectLoadedLogo(canvasElement, c.stories.alternateLogoPath);
    await expect(canvas.getByRole("button", { name: c.save })).toBeDisabled();
    await expect(canvasElement).not.toHaveTextContent(c.stories.private);
    await selectLogo(canvasElement);
    await waitFor(() => expect(canvas.getByText(c.logoReady)).toBeVisible());
    await expect(args.onUploadLogo).toHaveBeenCalledTimes(2);
  },
};
export const UploadPending: Story = {
  args: { ...withLogo, onUploadLogo: fn<NonNullable<EstimateBusinessProfileFormProps["onUploadLogo"]>>(() => new Promise<{ logoPath: string }>(() => {})) },
  play: async ({ canvasElement, args }) => {
    const canvas = within(canvasElement);
    const file = await selectLogo(canvasElement);
    await waitFor(() => expect(args.onUploadLogo).toHaveBeenCalledTimes(1));
    await expect(canvas.getByText(c.uploadingLogo)).toBeVisible();
    for (const name of [c.replaceLogo, c.removeLogo, c.save, c.discard]) await expect(canvas.getByRole("button", { name })).toBeDisabled();
    fireEvent.change(canvas.getByLabelText(c.logoFile), { target: { files: [file] } });
    await expect(args.onUploadLogo).toHaveBeenCalledTimes(1);
    await expect(args.onChange).not.toHaveBeenCalled();
  },
};
async function invalidLogo(canvasElement: HTMLElement, file: File, error: string, args: EstimateBusinessProfileFormProps) {
  const canvas = within(canvasElement);
  fireEvent.change(canvas.getByLabelText(c.logoFile), { target: { files: [file] } });
  await waitFor(() => expect(canvas.getByText(error)).toBeVisible());
  await expect(args.onUploadLogo).not.toHaveBeenCalled();
  await expect(args.onChange).not.toHaveBeenCalled();
}
export const UnsupportedLogo: Story = {
  play: async ({ canvasElement, args }) => invalidLogo(canvasElement, new File(["<svg></svg>"], "logo.svg", { type: "image/svg+xml" }), c.errors.logoType, args),
};
export const OversizedLogo: Story = {
  play: async ({ canvasElement, args }) => invalidLogo(canvasElement, new File([new Uint8Array(2 * 1024 * 1024 + 1)], "logo.png", { type: "image/png" }), c.errors.logoSize, args),
};
export const CorruptLogo: Story = {
  play: async ({ canvasElement, args }) => invalidLogo(canvasElement, new File([new Uint8Array([137, 80, 78, 71, 13, 10, 26, 10])], "logo.png", { type: "image/png" }), c.errors.logoImage, args),
};
export const EmptyLogo: Story = {
  play: async ({ canvasElement, args }) => invalidLogo(canvasElement, new File([], "logo.png", { type: "image/png" }), c.errors.logoSize, args),
};
export const DisguisedLogo: Story = {
  play: async ({ canvasElement, args }) => invalidLogo(canvasElement, new File(["<svg></svg>"], "logo.png", { type: "image/png" }), c.errors.logoImage, args),
};
export const InvalidUploadResult: Story = {
  args: { onUploadLogo: fn<NonNullable<EstimateBusinessProfileFormProps["onUploadLogo"]>>(async () => ({ logoPath: "https://example.com/private-logo.png" })) },
  play: async ({ canvasElement, args }) => {
    await selectLogo(canvasElement);
    await waitFor(() => expect(within(canvasElement).getByText(c.errors.logoPath)).toBeVisible());
    await expect(args.onChange).not.toHaveBeenCalled();
    await expect(canvasElement.querySelector("img")).toBeNull();
  },
};
export const LogoOnEstimate: Story = {
  render: (args) => <ProfilePreview {...args} showEstimate />,
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement), article = within(canvas.getByRole("article"));
    await expect(article.queryByRole("img")).not.toBeInTheDocument();
    await selectLogo(canvasElement);
    await waitFor(() => expect(article.getByRole("img")).toHaveProperty("src", new URL(c.stories.logoPath, canvasElement.ownerDocument.baseURI).href));
    await userEvent.click(canvas.getByRole("button", { name: c.removeLogo }));
    await expect(article.queryByRole("img")).not.toBeInTheDocument();
    await expect(article.getByText(record.profile.name)).toBeVisible();
  },
};
export const EmptyIdentity: Story = {
  args: { source: { state: "ready", record: { ...record, profile: blankProfile } }, value: { ...initial, profile: blankProfile } },
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement);
    await expect(canvas.getByText(c.identityIncomplete)).toBeVisible();
    await expect(canvas.getByRole("textbox", { name: c.validForDays })).toHaveValue("30");
    await expect(canvas.getByRole("textbox", { name: c.taxRate })).toHaveValue("0");
    await expect(canvas.getByRole("button", { name: c.save })).toBeDisabled();
  },
};
export const SaveIncompleteIdentity: Story = {
  args: draft({ name: c.stories.renamed, address: "", phone: "", email: "" }),
  play: async ({ canvasElement, args }) => {
    const canvas = within(canvasElement);
    await userEvent.click(canvas.getByRole("button", { name: c.save }));
    await expect(args.onSave).toHaveBeenCalledWith({ workspaceId: record.workspaceId, expectedVersion: record.version, profile: { ...initial.profile, name: c.stories.renamed, address: "", phone: "", email: "" } });
    await expect(canvas.getByText(c.identityIncomplete)).toBeVisible();
    await expect(canvas.queryByText(c.saved)).not.toBeInTheDocument();
  },
};
export const RequestOnly: Story = {
  args: { value: edited },
  play: async ({ canvasElement, args }) => {
    const canvas = within(canvasElement);
    await userEvent.click(canvas.getByRole("button", { name: c.save }));
    await expect(args.onSave).toHaveBeenCalledTimes(1);
    await expect(canvas.getByText(c.stories.request)).toBeVisible();
    await expect(canvas.getByText(c.dirty)).toBeVisible();
    await expect(canvas.queryByText(c.saved)).not.toBeInTheDocument();
    await expect(canvas.getByRole("button", { name: c.save })).toBeEnabled();
  },
};
export const HostSaved: Story = {
  args: { value: edited }, render: (args) => <ProfilePreview {...args} commit />,
  play: async ({ canvasElement, args }) => {
    const canvas = within(canvasElement);
    await userEvent.click(canvas.getByRole("button", { name: c.save }));
    await expect(canvas.getByText(c.saved)).toBeVisible();
    await expect(canvas.getByRole("button", { name: c.save })).toBeDisabled();
    await expect(args.onSave).toHaveBeenCalledWith(edited);
  },
};
export const Discard: Story = {
  args: { value: edited },
  play: async ({ canvasElement, args }) => {
    const canvas = within(canvasElement);
    await userEvent.click(canvas.getByRole("button", { name: c.discard }));
    await expect(args.onDiscard).toHaveBeenCalledTimes(1);
    await expect(canvas.getByRole("textbox", { name: c.fields.name.label })).toHaveValue(record.profile.name);
    await expect(canvas.getByRole("button", { name: c.save })).toBeDisabled();
  },
};
export const SaveFailure: Story = {
  args: { value: edited },
  play: async ({ canvasElement, args }) => {
    if (!args.onSave) throw new Error("Expected save mock.");
    mocked(args.onSave).mockRejectedValueOnce(new Error(c.stories.private));
    const canvas = within(canvasElement);
    await userEvent.click(canvas.getByRole("button", { name: c.save }));
    await expect(canvas.getByText(c.errors.save)).toBeVisible();
    await expect(canvas.getByRole("textbox", { name: c.fields.name.label })).toHaveValue(c.stories.renamed);
    await expect(canvasElement).not.toHaveTextContent(c.stories.private);
    await userEvent.click(canvas.getByRole("button", { name: c.save }));
    await expect(args.onSave).toHaveBeenCalledTimes(2);
    await expect(canvas.queryByText(c.errors.save)).not.toBeInTheDocument();
  },
};
export const SavePending: Story = {
  args: { value: edited, onSave: fn(() => new Promise<void>(() => {})) },
  play: async ({ canvasElement, args }) => {
    const canvas = within(canvasElement);
    await userEvent.click(canvas.getByRole("button", { name: c.save }));
    await expect(canvas.getByRole("button", { name: c.saving })).toBeDisabled();
    await expect(canvas.getByRole("button", { name: c.discard })).toBeDisabled();
    await expect(canvas.getByRole("textbox", { name: c.fields.name.label })).toBeDisabled();
    await userEvent.click(canvas.getByRole("button", { name: c.saving }));
    await expect(args.onSave).toHaveBeenCalledTimes(1);
  },
};
export const ExternalPending: Story = { args: { value: edited, pending: true } };
export const InvalidEmail: Story = {
  args: draft({ email: "invalid" }),
  play: async ({ canvasElement, args }) => {
    const canvas = within(canvasElement);
    await userEvent.click(canvas.getByRole("button", { name: c.save }));
    await expect(canvas.getByRole("textbox", { name: c.fields.email.label })).toHaveFocus();
    await expect(canvas.getByText(c.errors.email)).toBeVisible();
    await expect(args.onSave).not.toHaveBeenCalled();
  },
};
export const InvalidDefaults: Story = {
  args: draft({ validForDays: "", taxRate: "100.001", deposit: { type: "percent", value: "101" } }),
  play: async ({ canvasElement, args }) => {
    const canvas = within(canvasElement);
    await userEvent.click(canvas.getByRole("button", { name: c.save }));
    await expect(canvas.getByRole("textbox", { name: c.validForDays })).toHaveFocus();
    await expect(canvas.getByText(c.errors.days)).toBeVisible();
    await expect(canvas.getByText(c.errors.tax)).toBeVisible();
    await expect(canvas.getByText(c.errors.deposit)).toBeVisible();
    await expect(args.onSave).not.toHaveBeenCalled();
  },
};
export const FixInvalidTax: Story = {
  args: draft({ taxRate: "8.8751" }),
  play: async ({ canvasElement, args }) => {
    const canvas = within(canvasElement), tax = canvas.getByRole("textbox", { name: c.taxRate });
    await userEvent.click(canvas.getByRole("button", { name: c.save }));
    await expect(tax).toHaveFocus();
    fireEvent.change(tax, { target: { value: "9.125" } });
    await userEvent.click(canvas.getByRole("button", { name: c.save }));
    await expect(args.onSave).toHaveBeenCalledWith({ ...initial, profile: { ...initial.profile, taxRate: "9.125" } });
  },
};
export const NoDeposit: Story = { args: draft({ deposit: { type: "none" } }) };
export const FixedDeposit: Story = { args: draft({ deposit: { type: "amount", value: "100.29" } }) };
export const ImpossibleFixedDeposit: Story = {
  args: draft({ deposit: { type: "amount", value: "20000000.01" } }),
  play: async ({ canvasElement, args }) => {
    const canvas = within(canvasElement);
    await userEvent.click(canvas.getByRole("button", { name: c.save }));
    await expect(canvas.getByRole("textbox", { name: c.depositAmount })).toHaveFocus();
    await expect(canvas.getByText(c.errors.deposit)).toBeVisible();
    await expect(args.onSave).not.toHaveBeenCalled();
  },
};
export const ChangeDepositType: Story = {
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement), type = canvas.getByRole("combobox", { name: c.depositType });
    await userEvent.selectOptions(type, "amount");
    await expect(canvas.getByRole("textbox", { name: c.depositAmount })).toHaveValue("");
    await userEvent.selectOptions(type, "none");
    await expect(canvas.queryByRole("textbox", { name: c.depositAmount })).not.toBeInTheDocument();
    await expect(canvas.queryByRole("textbox", { name: c.depositPercent })).not.toBeInTheDocument();
  },
};
export const ServiceAddressRule: Story = {
  play: async ({ canvasElement, args }) => {
    await userEvent.click(within(canvasElement).getByRole("checkbox", { name: c.addressRequired }));
    await expect(args.onChange).toHaveBeenCalledWith({ ...initial, profile: { ...initial.profile, requireServiceAddress: false } });
  },
};
export const AddEditRemovePreset: Story = {
  play: async ({ canvasElement, args }) => {
    const canvas = within(canvasElement);
    await userEvent.click(canvas.getByRole("button", { name: c.addPreset }));
    const label = canvas.getAllByRole("textbox", { name: c.presetLabel })[2];
    await expect(label).toHaveFocus();
    fireEvent.change(label, { target: { value: c.stories.customPreset } });
    fireEvent.change(canvas.getAllByRole("textbox", { name: c.presetText })[2], { target: { value: c.stories.customWording } });
    await userEvent.click(canvas.getByRole("button", { name: c.save }));
    await expect(args.onSave).toHaveBeenCalledWith({
      ...initial, profile: { ...initial.profile, paymentPresets: [...initial.profile.paymentPresets, { id: expect.any(String), label: c.stories.customPreset, text: c.stories.customWording }] },
    });
    await userEvent.click(canvas.getByRole("button", { name: c.removePreset(2) }));
    await expect(canvas.getByRole("button", { name: c.addPreset })).toHaveFocus();
    await expect(canvas.getAllByRole("textbox", { name: c.presetLabel })).toHaveLength(2);
    await expect(canvas.getByRole("button", { name: c.save })).toBeDisabled();
  },
};
export const EmptyPresets: Story = { args: draft({ paymentPresets: [] }) };
export const MaximumPresets: Story = {
  args: draft({ paymentPresets: Array.from({ length: 10 }, (_, index) => ({ id: `preset-${index}`, label: c.stories.customPreset, text: c.stories.customWording })) }),
  play: async ({ canvasElement }) => {
    await expect(within(canvasElement).getByRole("button", { name: c.addPreset })).toBeDisabled();
    await expect(within(canvasElement).getAllByRole("textbox", { name: c.presetLabel })).toHaveLength(10);
  },
};
export const InvalidPreset: Story = {
  args: draft({ paymentPresets: [{ id: "empty", label: "", text: " " }] }),
  play: async ({ canvasElement, args }) => {
    const canvas = within(canvasElement);
    await userEvent.click(canvas.getByRole("button", { name: c.save }));
    await expect(canvas.getByRole("textbox", { name: c.presetLabel })).toHaveFocus();
    await expect(canvas.getByText(c.errors.presetLabel)).toBeVisible();
    await expect(canvas.getByText(c.errors.presetText)).toBeVisible();
    await expect(args.onSave).not.toHaveBeenCalled();
  },
};
export const TextLimits: Story = {
  play: async ({ canvasElement, args }) => {
    const canvas = within(canvasElement);
    const terms = canvas.getByRole("textbox", { name: c.optional(c.fields.termsNote.label) });
    await expect(terms).toHaveAttribute("maxlength", "5000");
    fireEvent.change(terms, { target: { value: "T".repeat(5001) } });
    await userEvent.click(canvas.getByRole("button", { name: c.save }));
    await expect(terms).toHaveFocus();
    await expect(terms).toHaveValue("T".repeat(5001));
    await expect(args.onSave).not.toHaveBeenCalled();
    fireEvent.change(terms, { target: { value: "T".repeat(5000) } });
    await userEvent.click(canvas.getByRole("button", { name: c.save }));
    await expect(args.onSave).toHaveBeenCalledTimes(1);
  },
};
export const LiteralText: Story = {
  args: draft({ message: c.stories.literal, termsNote: c.stories.literal }),
  play: async ({ canvasElement }) => {
    await expect(within(canvasElement).getByRole("textbox", { name: c.optional(c.fields.message.label) })).toHaveValue(c.stories.literal);
    await expect(canvasElement.querySelector("form script")).toBeNull();
  },
};
export const LongContent: Story = {
  args: draft({
    name: "W".repeat(200), address: "A".repeat(500), phone: "5".repeat(100), licenseLine: "L".repeat(200),
    message: "M".repeat(2000), termsNote: "T".repeat(5000),
    paymentPresets: Array.from({ length: 10 }, (_, index) => ({ id: String(index), label: "P".repeat(80), text: "C".repeat(500) })),
  }),
};
export const OfficeReadOnly: Story = { args: { role: "office", canManage: true }, play: readOnly };
export const FieldReadOnly: Story = { args: { role: "field", canManage: true }, play: readOnly };
export const OwnerWithoutGrant: Story = { args: { role: "owner", canManage: false }, play: readOnly };
async function readOnly({ canvasElement }: { canvasElement: HTMLElement }) {
  const canvas = within(canvasElement);
  await expect(canvas.getByText(c.readOnly)).toBeVisible();
  await expect(canvas.getByRole("textbox", { name: c.fields.name.label })).toBeDisabled();
  await expect(canvas.queryByRole("button", { name: c.save })).not.toBeInTheDocument();
  await expect(canvas.queryByRole("button", { name: c.addPreset })).not.toBeInTheDocument();
  await expect(canvas.queryByRole("button", { name: c.uploadLogo })).not.toBeInTheDocument();
  await expect(canvas.queryByLabelText(c.logoFile)).not.toBeInTheDocument();
}
export const NoReadAccess: Story = {
  args: { ...withLogo, canRead: false, value: edited, conflict: true },
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement);
    await expect(canvas.getByText(c.cannotRead)).toBeVisible();
    await expect(canvas.queryByRole("textbox")).not.toBeInTheDocument();
    await expect(canvas.queryByRole("button")).not.toBeInTheDocument();
    await expect(canvasElement).not.toHaveTextContent(record.profile.name);
    await expect(canvasElement).not.toHaveTextContent(c.errors.conflict);
  },
};
export const Conflict: Story = { args: { value: edited, conflict: true }, play: blocked };
export const WrongWorkspace: Story = { args: { value: { ...edited, workspaceId: "other-workspace" } }, play: blocked };
export const WrongVersion: Story = { args: { value: { ...edited, expectedVersion: 3 } }, play: blocked };
async function blocked({ canvasElement }: { canvasElement: HTMLElement }) {
  const canvas = within(canvasElement);
  await expect(canvas.getByRole("textbox", { name: c.fields.name.label })).toBeDisabled();
  await expect(canvas.queryByRole("button", { name: c.save })).not.toBeInTheDocument();
  await expect(canvas.getByRole("button", { name: c.reload })).toBeEnabled();
}
export const ReloadWithoutRebind: Story = {
  args: { value: edited, conflict: true },
  play: async (context) => {
    const canvas = within(context.canvasElement);
    await userEvent.click(canvas.getByRole("button", { name: c.reload }));
    await expect(context.args.onReload).toHaveBeenCalledTimes(1);
    await expect(canvas.getByText(c.stories.reload)).toBeVisible();
    await expect(canvas.getByText(c.errors.conflict)).toBeVisible();
    await blocked(context);
  },
};
export const ReloadCurrentVersion: Story = {
  args: { value: edited, conflict: true }, render: (args) => <ProfilePreview {...args} rebind />,
  play: async ({ canvasElement, args }) => {
    const canvas = within(canvasElement);
    await userEvent.click(canvas.getByRole("button", { name: c.reload }));
    const name = canvas.getByRole("textbox", { name: c.fields.name.label });
    await expect(name).toBeEnabled();
    await expect(name).toHaveValue(record.profile.name);
    fireEvent.change(name, { target: { value: c.stories.renamed } });
    await userEvent.click(canvas.getByRole("button", { name: c.save }));
    await expect(args.onSave).toHaveBeenCalledWith({ ...edited, expectedVersion: 5 });
  },
};
export const ReloadFailure: Story = {
  args: { value: edited, conflict: true },
  play: async ({ canvasElement, args }) => {
    if (!args.onReload) throw new Error("Expected reload mock.");
    mocked(args.onReload).mockRejectedValueOnce(new Error(c.stories.private));
    const canvas = within(canvasElement);
    await userEvent.click(canvas.getByRole("button", { name: c.reload }));
    await expect(canvas.getByText(c.errors.reload)).toBeVisible();
    await expect(canvasElement).not.toHaveTextContent(c.stories.private);
    await expect(canvas.getByText(c.errors.conflict)).toBeVisible();
  },
};
export const ReloadPending: Story = {
  args: { conflict: true, onReload: fn(() => new Promise<void>(() => {})) },
  play: async ({ canvasElement, args }) => {
    const canvas = within(canvasElement);
    await userEvent.click(canvas.getByRole("button", { name: c.reload }));
    await expect(canvas.getByRole("button", { name: c.reloading })).toBeDisabled();
    await userEvent.click(canvas.getByRole("button", { name: c.reloading }));
    await expect(args.onReload).toHaveBeenCalledTimes(1);
  },
};
export const SaveNotConnected: Story = { args: { value: edited, onSave: undefined } };
export const ChangeNotConnected: Story = { args: { onChange: undefined } };
export const DiscardNotConnected: Story = { args: { value: edited, onDiscard: undefined } };
export const ReloadNotConnected: Story = { args: { conflict: true, onReload: undefined } };
export const Loading: Story = { args: { source: { state: "loading" } }, play: noFields };
export const LoadError: Story = { args: { source: { state: "error" } }, play: noFields };
export const Unavailable: Story = { args: { source: { state: "unavailable" } }, play: noFields };
async function noFields({ canvasElement }: { canvasElement: HTMLElement }) {
  await expect(within(canvasElement).queryByRole("textbox")).not.toBeInTheDocument();
  await expect(canvasElement).not.toHaveTextContent(record.profile.name);
}
export const TimezoneUnavailable: Story = { args: { timezone: "Invalid/Timezone" } };
function PermissionPreview({ mode, ...args }: EstimateBusinessProfileFormProps & { mode: "read" | "manage" | "version" | "workspace" }) {
  const [changed, setChanged] = useState(false);
  const label = mode === "read" ? c.stories.loseRead : mode === "manage" ? c.stories.loseManage : mode === "version" ? c.stories.changeVersion : c.stories.changeWorkspace;
  return <><button type="button" className={`${estimateButton} mb-4`} onClick={() => setChanged(true)}>{label}</button>
    <ProfilePreview {...args} canRead={mode === "read" && changed ? false : args.canRead}
      canManage={mode === "manage" && changed ? false : args.canManage}
      key={changed && (mode === "version" || mode === "workspace") ? "changed" : "initial"}
      source={changed && mode === "version" ? { state: "ready", record: { ...record, version: 5 } }
        : changed && mode === "workspace" ? { state: "ready", record: { ...record, workspaceId: "other-workspace" } } : args.source} />
  </>;
}
export const ReadAccessLost: Story = {
  args: { value: edited }, render: (args) => <PermissionPreview {...args} mode="read" />,
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement);
    await userEvent.click(canvas.getByRole("button", { name: c.stories.loseRead }));
    await expect(canvas.getByText(c.cannotRead)).toBeVisible();
    await expect(canvas.queryByRole("textbox")).not.toBeInTheDocument();
    await expect(canvasElement).not.toHaveTextContent(c.stories.renamed);
  },
};
export const ManageAccessLost: Story = {
  args: { value: edited }, render: (args) => <PermissionPreview {...args} mode="manage" />,
  play: async (context) => {
    await userEvent.click(within(context.canvasElement).getByRole("button", { name: c.stories.loseManage }));
    await readOnly(context);
  },
};
export const VersionChangesWhileEditing: Story = {
  args: { value: edited }, render: (args) => <PermissionPreview {...args} mode="version" />,
  play: async (context) => {
    await userEvent.click(within(context.canvasElement).getByRole("button", { name: c.stories.changeVersion }));
    await blocked(context);
    await expect(within(context.canvasElement).getByText(c.errors.binding)).toBeVisible();
  },
};
export const WorkspaceChangesWhileEditing: Story = {
  args: { value: edited }, render: (args) => <PermissionPreview {...args} mode="workspace" />,
  play: async (context) => {
    await userEvent.click(within(context.canvasElement).getByRole("button", { name: c.stories.changeWorkspace }));
    await blocked(context);
  },
};
async function uploadBoundaryCheck(
  { canvasElement, args }: { canvasElement: HTMLElement; args: EstimateBusinessProfileFormProps },
  mode: "read" | "manage" | "version" | "workspace" | "profile",
) {
  if (!args.onUploadLogo) throw new Error("Expected an upload mock.");
  let finish: ((result: { logoPath: string }) => void) | undefined;
  const result = new Promise<{ logoPath: string }>((resolve) => { finish = resolve; });
  mocked(args.onUploadLogo).mockReturnValueOnce(result);
  await selectLogo(canvasElement);
  await waitFor(() => expect(args.onUploadLogo).toHaveBeenCalledTimes(1));
  const canvas = within(canvasElement);
  const label = mode === "read" ? c.stories.loseRead : mode === "manage" ? c.stories.loseManage : mode === "version" ? c.stories.changeVersion : mode === "profile" ? c.stories.changeDuringUpload : c.stories.changeWorkspace;
  await userEvent.click(canvas.getByRole("button", { name: label }));
  if (!finish) throw new Error("Expected a pending upload.");
  finish({ logoPath: c.stories.logoPath });
  await result;
  await expect(args.onChange).not.toHaveBeenCalled();
  await expect(canvas.queryByRole("img")).not.toBeInTheDocument();
  if (mode === "profile") await waitFor(() => expect(canvas.getByText(c.errors.logoStale)).toBeVisible());
  else await expect(canvas.queryByLabelText(c.logoFile)).not.toBeInTheDocument();
}
export const UploadLosesReadAccess: Story = {
  render: (args) => <PermissionPreview {...args} mode="read" />,
  play: (context) => uploadBoundaryCheck(context, "read"),
};
export const UploadLosesManageAccess: Story = {
  render: (args) => <PermissionPreview {...args} mode="manage" />,
  play: (context) => uploadBoundaryCheck(context, "manage"),
};
export const UploadChangesWorkspace: Story = {
  render: (args) => <PermissionPreview {...args} mode="workspace" />,
  play: (context) => uploadBoundaryCheck(context, "workspace"),
};
export const UploadChangesVersion: Story = {
  render: (args) => <PermissionPreview {...args} mode="version" />,
  play: (context) => uploadBoundaryCheck(context, "version"),
};
export const SettingsChangeDuringUpload: Story = {
  render: function SettingsChangePreview(args) {
    const [value, setValue] = useState(args.value);
    return <><button type="button" className={`${estimateButton} mb-4`} onClick={() => setValue({ ...value, profile: { ...value.profile, name: c.stories.renamed } })}>{c.stories.changeDuringUpload}</button>
      <EstimateBusinessProfileForm {...args} value={value} onChange={(next) => { setValue(next); args.onChange?.(next); }} /></>;
  },
  play: (context) => uploadBoundaryCheck(context, "profile"),
};
export const Keyboard: Story = {
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement);
    await userEvent.tab();
    const name = canvas.getByRole("textbox", { name: c.fields.name.label });
    await expect(name).toHaveFocus();
    await expect(getComputedStyle(name).outlineWidth).toBe("3px");
    await userEvent.tab();
    await expect(canvas.getByRole("textbox", { name: c.fields.email.label })).toHaveFocus();
    await userEvent.tab({ shift: true });
    await expect(name).toHaveFocus();
  },
};
export const Mobile: Story = { globals: { viewport: { value: "mobile1", isRotated: false } } };
export const Tablet: Story = { globals: { viewport: { value: "tablet", isRotated: false } } };
