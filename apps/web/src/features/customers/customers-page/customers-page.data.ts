import { customerPreviewData } from "../customer-preview.data";
export const customersPageData = {
  ...customerPreviewData,
  workspace: "SalesMora preview",
  userEmail: "ava.morgan@example.com",
  missingSearch: "No matching person",
  phone: "Phone",
  newPhone: "(212) 555-0188",
  filteredScope: "Customers matching the current filters",
  exportPreview: "CSV preview reviewed. No workspace download was requested.",
  assistantBadge: "Storybook demo",
  assistantText: "Here is a sample customer update for review.",
  assistantMock:
    "This is a design preview. Customer chat tools are not connected yet.",
  assistantFixture: {
    name: "Taylor Brooks",
    email: "taylor.brooks@example.com",
    phone: "(212) 555-0172",
  },
};
