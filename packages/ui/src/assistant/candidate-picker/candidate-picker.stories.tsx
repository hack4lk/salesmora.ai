import type { Meta, StoryObj } from "@storybook/react";
import { expect, fn, userEvent, within } from "storybook/test";
import { CandidatePicker } from "./candidate-picker";
import { candidatePickerData as copy } from "./candidate-picker.data";
import { customerDraftFixtures as fixtures } from "../customer-draft-card/customer-draft-card.data";
const candidates = [fixtures.customer, fixtures.other].map((customer, i) => ({
  id: `customer-${i}`,
  name: customer.name,
  detail: customer.number,
}));
const meta = {
  title: "Assistant/CandidatePicker",
  component: CandidatePicker,
  args: { kind: "customer", candidates, onChoose: fn() },
  decorators: [
    (Story) => (
      <main className="mx-auto min-h-screen w-full max-w-3xl bg-canvas p-4">
        <p className="text-sm text-muted">{fixtures.notice}</p>
        <Story />
      </main>
    ),
  ],
} satisfies Meta<typeof CandidatePicker>;
export default meta;
type Story = StoryObj<typeof meta>;
export const Default: Story = {};
export const Five: Story = {
  args: {
    candidates: Array.from({ length: 5 }, (_, i) => ({
      ...candidates[0],
      id: `candidate-${i}`,
      detail: `CU-${2040 + i}`,
    })),
  },
};
export const Teammates: Story = {
  args: {
    kind: "member",
    candidates: [
      { id: "sam-1", name: fixtures.member, detail: fixtures.memberDetail },
      { id: "sam-2", name: fixtures.member, detail: fixtures.customerDetail },
    ],
  },
};
export const Empty: Story = { args: { candidates: [] } };
export const PermissionLost: Story = { args: { disabled: true } };
export const Choose: Story = {
  play: async ({ canvasElement, args }) => {
    const c = within(canvasElement),
      button = c.getByRole("button", { name: copy.choose });
    await expect(button).toBeDisabled();
    await userEvent.click(c.getAllByRole("radio")[1]);
    await userEvent.click(button);
    await expect(args.onChoose).toHaveBeenCalledWith(candidates[1].id);
  },
};
