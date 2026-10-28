import { useState } from "react";
import type { Meta, StoryObj } from "@storybook/nextjs-vite";
import { expect, fireEvent, fn, mocked, userEvent, waitFor, within } from "storybook/test";
import { estimateBusinessProfileFixture as record, estimateBusinessProfileEmptyFixture as empty, estimateBusinessProfileFormData as form } from "../../estimates/estimate-business-profile-form/estimate-business-profile-form.data";
import { initialEstimateBusinessProfileDraft } from "../../estimates/estimate-business-profile-form/estimate-business-profile-form.preview";
import type { EstimateBusinessProfileFormProps } from "../../estimates/estimate-business-profile-form/estimate-business-profile-form";
import { estimatePreviewPaperData as paper } from "../../estimates/estimate-preview-paper/estimate-preview-paper.data";
import { EstimateSettingsPage, type EstimateSettingsPageProps } from "./estimate-settings-page";
import { estimateSettingsPageData as c } from "./estimate-settings-page.data";

const initial = initialEstimateBusinessProfileDraft(record);
const edited = { ...initial, profile: { ...initial.profile, name: form.stories.renamed } };
function SettingsPreview({ commit = false, rebind = false, ...args }: EstimateSettingsPageProps & { commit?: boolean; rebind?: boolean }) {
  const props = args.businessProfile;
  const [source, setSource] = useState(props.source), [value, setValue] = useState(props.value);
  const [saved, setSaved] = useState(props.saved), [conflict, setConflict] = useState(props.conflict);
  const [notice, setNotice] = useState(""), [navigation, setNavigation] = useState("");
  return <main className="mx-auto min-h-screen w-full max-w-4xl bg-canvas p-4 sm:p-8" onClick={(event) => {
    if (event.target instanceof Element && event.target.closest("a")) { event.preventDefault(); setNavigation(c.stories.navigation); }
  }}>
    <p className="mb-6 mt-0 text-sm leading-6 text-muted">{c.stories.notice}</p>
    <EstimateSettingsPage {...args} businessProfile={{ ...props, source, value, saved, conflict,
      onChange: props.onChange ? (next) => { setValue(next); setSaved(false); setNotice(""); props.onChange?.(next); } : undefined,
      onDiscard: props.onDiscard ? () => {
        if (source.state === "ready") setValue(initialEstimateBusinessProfileDraft(source.record));
        setSaved(false); setNotice(""); props.onDiscard?.();
      } : undefined,
      onSave: props.onSave ? async (request) => {
        await props.onSave?.(request);
        if (commit && source.state === "ready") {
          const next = { ...source.record, version: source.record.version + 1, profile: request.profile };
          setSource({ state: "ready", record: next }); setValue(initialEstimateBusinessProfileDraft(next)); setSaved(true); setNotice(c.stories.saved);
        } else setNotice(c.stories.request);
      } : undefined,
      onReload: props.onReload ? async () => {
        await props.onReload?.();
        if (rebind) {
          const next = { ...record, version: record.version + 1 };
          setSource({ state: "ready", record: next }); setValue(initialEstimateBusinessProfileDraft(next)); setConflict(false); setSaved(false); setNotice("");
        } else setNotice(c.stories.reload);
      } : undefined,
    }} />
    {notice && <p role="status" className="mt-4 text-sm text-muted">{notice}</p>}
    {navigation && <p role="status" className="mt-4 text-sm text-muted">{navigation}</p>}
  </main>;
}
const businessProfile: EstimateBusinessProfileFormProps = {
  source: { state: "ready", record }, value: initial, role: "owner", canRead: true, canManage: true,
  timezone: "America/New_York", onChange: fn(), onSave: fn(), onDiscard: fn(), onReload: fn(),
  onUploadLogo: fn(async () => ({ logoPath: form.stories.logoPath })),
};
const meta = {
  title: "Settings/EstimateSettingsPage", component: EstimateSettingsPage,
  parameters: { layout: "fullscreen" },
  args: { workspaceName: c.stories.workspace, settingsHref: c.stories.settingsHref, businessProfile },
  render: (args) => <SettingsPreview {...args} />,
} satisfies Meta<typeof EstimateSettingsPage>;
export default meta;
type Story = StoryObj<typeof meta>;
const profile = (patch: Partial<EstimateBusinessProfileFormProps>) => ({ businessProfile: { ...businessProfile, ...patch } });

export const Owner: Story = {
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement);
    await expect(canvas.getByRole("heading", { level: 1, name: c.title })).toBeVisible();
    await expect(canvas.getByRole("link", { name: c.back })).toHaveAttribute("href", c.stories.settingsHref);
    await expect(canvas.getByRole("region", { name: form.title })).toBeVisible();
    await expect(canvas.getByRole("button", { name: form.save })).toBeDisabled();
    await expect(canvas.getByText(form.identityComplete)).toBeVisible();
    await expect(canvasElement.querySelectorAll("form")).toHaveLength(1);
  },
};
export const Admin: Story = { args: profile({ role: "admin" }), play: Owner.play };
export const EmptyIdentity: Story = {
  args: profile({ source: { state: "ready", record: { ...record, profile: empty } }, value: { ...initial, profile: empty } }),
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement);
    await expect(canvas.getByText(form.identityIncomplete)).toBeVisible();
    await expect(canvas.getByRole("textbox", { name: form.validForDays })).toHaveValue("30");
  },
};
export const IncompleteSave: Story = {
  args: profile({ value: { ...initial, profile: { ...empty, name: form.stories.renamed } } }),
  play: async ({ canvasElement, args }) => {
    const canvas = within(canvasElement);
    await userEvent.click(canvas.getByRole("button", { name: form.save }));
    await expect(args.businessProfile.onSave).toHaveBeenCalledWith({ ...initial, profile: { ...empty, name: form.stories.renamed } });
    await expect(canvas.getByText(form.identityIncomplete)).toBeVisible();
    await expect(canvas.queryByText(form.saved)).not.toBeInTheDocument();
  },
};
export const EditAndRequestSave: Story = {
  play: async ({ canvasElement, args }) => {
    const canvas = within(canvasElement);
    fireEvent.change(canvas.getByRole("textbox", { name: form.fields.name.label }), { target: { value: form.stories.renamed } });
    await userEvent.click(canvas.getByRole("button", { name: form.save }));
    await expect(args.businessProfile.onSave).toHaveBeenCalledWith(edited);
    await expect(canvas.getByText(c.stories.request)).toBeVisible();
    await expect(canvas.getByText(form.dirty)).toBeVisible();
    await expect(canvas.queryByText(form.saved)).not.toBeInTheDocument();
  },
};
export const HostSaved: Story = {
  args: profile({ value: edited }), render: (args) => <SettingsPreview {...args} commit />,
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement);
    await userEvent.click(canvas.getByRole("button", { name: form.save }));
    await expect(canvas.getByText(form.saved)).toBeVisible();
    await expect(canvas.getByRole("button", { name: form.save })).toBeDisabled();
  },
};
export const Discard: Story = {
  args: profile({ value: edited }),
  play: async ({ canvasElement, args }) => {
    const canvas = within(canvasElement);
    await userEvent.click(canvas.getByRole("button", { name: form.discard }));
    await expect(args.businessProfile.onDiscard).toHaveBeenCalledTimes(1);
    await expect(canvas.getByRole("textbox", { name: form.fields.name.label })).toHaveValue(record.profile.name);
    await expect(canvas.getByRole("button", { name: form.save })).toBeDisabled();
  },
};
export const InvalidDefaults: Story = {
  args: profile({ value: { ...edited, profile: { ...edited.profile, validForDays: "0", taxRate: "101" } } }),
  play: async ({ canvasElement, args }) => {
    const canvas = within(canvasElement);
    await userEvent.click(canvas.getByRole("button", { name: form.save }));
    await expect(canvas.getByRole("textbox", { name: form.validForDays })).toHaveFocus();
    await expect(canvas.getByText(form.errors.days)).toBeVisible();
    await expect(args.businessProfile.onSave).not.toHaveBeenCalled();
  },
};
export const SaveFailure: Story = {
  args: profile({ value: edited }),
  play: async ({ canvasElement, args }) => {
    if (!args.businessProfile.onSave) throw new Error("Expected the save mock.");
    mocked(args.businessProfile.onSave).mockRejectedValueOnce(new Error(form.stories.private));
    const canvas = within(canvasElement);
    await userEvent.click(canvas.getByRole("button", { name: form.save }));
    await expect(canvas.getByText(form.errors.save)).toBeVisible();
    await expect(canvas.getByRole("textbox", { name: form.fields.name.label })).toHaveValue(form.stories.renamed);
    await expect(canvasElement).not.toHaveTextContent(form.stories.private);
  },
};
export const SavePending: Story = {
  args: profile({ value: edited, onSave: fn(() => new Promise<void>(() => {})) }),
  play: async ({ canvasElement, args }) => {
    const canvas = within(canvasElement);
    await userEvent.click(canvas.getByRole("button", { name: form.save }));
    await expect(canvas.getByRole("button", { name: form.saving })).toBeDisabled();
    await expect(canvas.getByRole("button", { name: form.discard })).toBeDisabled();
    await expect(args.businessProfile.onSave).toHaveBeenCalledTimes(1);
  },
};
export const WithLogo: Story = {
  args: profile({
    source: { state: "ready", record: { ...record, profile: { ...record.profile, logoPath: form.stories.logoPath } } },
    value: { ...initial, profile: { ...initial.profile, logoPath: form.stories.logoPath } },
  }),
  play: async ({ canvasElement }) => {
    const image = within(canvasElement).getByRole("img", { name: paper.logo(record.profile.name) });
    await waitFor(() => expect(image instanceof HTMLImageElement && image.complete && image.naturalWidth > 0).toBe(true));
  },
};
export const UploadAndRemoveLogo: Story = {
  play: async ({ canvasElement, args }) => {
    const response = await fetch(form.stories.logoPath);
    if (!response.ok) throw new Error("Expected a local logo fixture.");
    const file = new File([await response.arrayBuffer()], "logo.png", { type: "image/png" });
    const canvas = within(canvasElement);
    await userEvent.upload(canvas.getByLabelText(form.logoFile), file);
    await waitFor(() => expect(args.businessProfile.onUploadLogo).toHaveBeenCalledWith({ workspaceId: record.workspaceId, expectedVersion: record.version, file }));
    await waitFor(() => expect(canvas.getByRole("img")).toBeVisible());
    await expect(canvas.getByRole("button", { name: form.save })).toBeEnabled();
    await userEvent.click(canvas.getByRole("button", { name: form.removeLogo }));
    await expect(canvas.queryByRole("img")).not.toBeInTheDocument();
    await expect(canvas.getByRole("button", { name: form.uploadLogo })).toHaveFocus();
    await expect(canvas.getByRole("button", { name: form.save })).toBeDisabled();
    await expect(args.businessProfile.onSave).not.toHaveBeenCalled();
  },
};
export const BrokenLogo: Story = {
  args: WithLogo.args,
  play: async (context) => {
    if (WithLogo.play) await WithLogo.play(context);
    const canvas = within(context.canvasElement);
    fireEvent.error(canvas.getByRole("img"));
    await expect(canvas.getByText(form.errors.logoLoad)).toBeVisible();
    await expect(canvas.queryByRole("img")).not.toBeInTheDocument();
  },
};
export const Conflict: Story = {
  args: profile({ value: edited, conflict: true }),
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement);
    await expect(canvas.getByText(form.errors.conflict)).toBeVisible();
    await expect(canvas.getByRole("textbox", { name: form.fields.name.label })).toBeDisabled();
    await expect(canvas.queryByRole("button", { name: form.save })).not.toBeInTheDocument();
  },
};
export const ReloadCurrentVersion: Story = {
  args: profile({ value: edited, conflict: true }), render: (args) => <SettingsPreview {...args} rebind />,
  play: async ({ canvasElement, args }) => {
    const canvas = within(canvasElement);
    await userEvent.click(canvas.getByRole("button", { name: form.reload }));
    await expect(args.businessProfile.onReload).toHaveBeenCalledTimes(1);
    await expect(canvas.getByRole("textbox", { name: form.fields.name.label })).toBeEnabled();
    await expect(canvas.queryByText(form.errors.conflict)).not.toBeInTheDocument();
    await expect(canvas.getByRole("button", { name: form.save })).toBeDisabled();
  },
};
export const ReloadRequestOnly: Story = {
  args: profile({ conflict: true }),
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement);
    await userEvent.click(canvas.getByRole("button", { name: form.reload }));
    await expect(canvas.getByText(c.stories.reload)).toBeVisible();
    await expect(canvas.getByText(form.errors.conflict)).toBeVisible();
  },
};
async function readOnly({ canvasElement }: { canvasElement: HTMLElement }) {
  const canvas = within(canvasElement);
  await expect(canvas.getByText(form.readOnly)).toBeVisible();
  await expect(canvas.getByRole("textbox", { name: form.fields.name.label })).toBeDisabled();
  await expect(canvas.queryByRole("button", { name: form.save })).not.toBeInTheDocument();
  await expect(canvas.queryByLabelText(form.logoFile)).not.toBeInTheDocument();
}
export const OfficeReadOnly: Story = { args: profile({ role: "office" }), play: readOnly };
export const FieldReadOnly: Story = { args: profile({ role: "field" }), play: readOnly };
export const OwnerWithoutGrant: Story = { args: profile({ canManage: false }), play: readOnly };
async function noFields({ canvasElement }: { canvasElement: HTMLElement }) {
  const canvas = within(canvasElement);
  await expect(canvas.queryByRole("textbox")).not.toBeInTheDocument();
  await expect(canvas.queryByRole("img")).not.toBeInTheDocument();
  await expect(canvas.queryByLabelText(form.logoFile)).not.toBeInTheDocument();
  await expect(canvasElement).not.toHaveTextContent(record.profile.email);
}
export const NoReadAccess: Story = {
  args: { workspaceName: form.stories.private, ...profile({ canRead: false }) },
  play: async (context) => {
    await noFields(context);
    await expect(context.canvasElement).not.toHaveTextContent(form.stories.private);
    await expect(within(context.canvasElement).getByText(form.cannotRead)).toBeVisible();
  },
};
export const Loading: Story = { args: profile({ source: { state: "loading" } }), play: noFields };
export const LoadError: Story = { args: profile({ source: { state: "error" } }), play: noFields };
export const Unavailable: Story = { args: profile({ source: { state: "unavailable" } }), play: noFields };
export const SaveNotConnected: Story = { args: profile({ value: edited, onSave: undefined }) };
export const UploadNotConnected: Story = { args: profile({ onUploadLogo: undefined }) };
export const NoBackNavigation: Story = {
  args: { settingsHref: undefined },
  play: async ({ canvasElement }) => {
    await expect(within(canvasElement).queryByRole("link")).not.toBeInTheDocument();
    await expect(within(canvasElement).getByText(c.navigationUnavailable)).toBeVisible();
  },
};
export const BackNavigationRequest: Story = {
  args: profile({ value: edited }),
  play: async ({ canvasElement, args }) => {
    const canvas = within(canvasElement);
    await userEvent.click(canvas.getByRole("link", { name: c.back }));
    await expect(canvas.getByText(c.stories.navigation)).toBeVisible();
    await expect(canvas.getByRole("textbox", { name: form.fields.name.label })).toHaveValue(form.stories.renamed);
    await expect(args.businessProfile.onDiscard).not.toHaveBeenCalled();
    await expect(args.businessProfile.onSave).not.toHaveBeenCalled();
  },
};
export const LongContent: Story = {
  args: { workspaceName: "W".repeat(200), ...profile({ value: { ...initial, profile: { ...initial.profile,
    name: "N".repeat(200), address: "A".repeat(500), message: "M".repeat(2000), termsNote: "T".repeat(5000),
    paymentPresets: Array.from({ length: 10 }, (_, index) => ({ id: String(index), label: "P".repeat(80), text: "C".repeat(500) })),
  } } }) },
};
export const Keyboard: Story = {
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement), back = canvas.getByRole("link", { name: c.back });
    await userEvent.tab(); await expect(back).toHaveFocus();
    await expect(getComputedStyle(back).outlineWidth).toBe("3px");
    await userEvent.tab();
    await expect(canvas.getByRole("textbox", { name: form.fields.name.label })).toHaveFocus();
  },
};
export const Mobile: Story = { globals: { viewport: { value: "mobile1", isRotated: false } } };
export const Tablet: Story = { globals: { viewport: { value: "tablet", isRotated: false } } };
