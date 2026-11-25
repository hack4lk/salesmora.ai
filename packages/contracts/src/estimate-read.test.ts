import { expect, it } from "vitest";
import { estimateSharingReviewSchema } from "./estimate-read";
import { estimateFrozenSnapshotSchema } from "./estimate-sharing";

const id = "00000000-0000-4000-8000-000000000001";
const snapshot = {
  formatVersion: 1,
  content: {
    number: "EST-0001", revision: 1, name: "Fixture",
    business: { name: "Fixture", address: "", phone: "", email: "", licenseLine: "", logoPath: `/api/settings/estimates/logo/${id}`, requireServiceAddress: false },
    recipientName: "Fixture", recipientEmail: "", serviceAddress: "", estimateDate: "2026-11-18", validUntil: "",
    preparedBy: "Fixture", relatedRecord: "", scope: "", message: "", paymentTerms: "", termsNote: "",
    items: [{ description: "Fixture", quantity: "1", unitPrice: "1.00", taxable: false, included: false, unit: "" }],
    discount: { type: "none" }, taxRate: "0", deposit: { type: "none" },
  },
  amounts: { lineAmountsCents: [100], subtotalCents: 100, discountCents: 0, taxCents: 0, totalCents: 100, depositCents: 0, balanceCents: 100 },
};
const paper = { state: "snapshot", estimateId: id, version: 2, snapshotHash: "a".repeat(64), content: snapshot.content, amounts: snapshot.amounts };
function staffPaper(logoPath: string | null) {
  return { ...paper, content: { ...paper.content, business: { ...paper.content.business, logoPath } } };
}
it("reads the authorized estimate logo path used by frozen staff paper", () => {
  expect(estimateSharingReviewSchema.shape.paper.safeParse(staffPaper(`/api/estimates/${id}/logo`)).success).toBe(true);
  expect(estimateSharingReviewSchema.shape.paper.safeParse(staffPaper(null)).success).toBe(true);
});
it("keeps draft and stored snapshot logo paths separate from staff read URLs", () => {
  expect(estimateFrozenSnapshotSchema.safeParse(snapshot).success).toBe(true);
  expect(estimateSharingReviewSchema.shape.draftPaper.safeParse(paper).success).toBe(true);
  expect(estimateFrozenSnapshotSchema.safeParse({ ...snapshot, content: staffPaper(`/api/estimates/${id}/logo`).content }).success).toBe(false);
});
it("rejects unsafe or unrelated logo paths in the staff response", () => {
  for (const path of ["https://example.test/logo.png", "javascript:alert(1)", "/api/estimates/invalid/logo", "/api/estimates/00000000-0000-4000-8000-000000000002/logo", `/api/estimates/${id}/logo?token=secret`]) {
    expect(estimateSharingReviewSchema.shape.paper.safeParse(staffPaper(path)).success).toBe(false);
  }
});
