import { describe, expect, it } from "vitest";
import { estimateDetailsCardData as copy } from "./estimate-details-card.data";
import { validateEstimateDetails } from "./estimate-details-card.validation";

const value = copy.stories.value;

describe("Estimate details presentation validation", () => {
  it("accepts populated details without mutating the input", () => {
    const input = { ...value, recipientEmail: " Jordan.Lee@example.com " };
    expect(validateEstimateDetails(input)).toEqual({});
    expect(input.recipientEmail).toBe(" Jordan.Lee@example.com ");
  });

  it.each(["", "   ", "E".repeat(121)])("rejects an invalid estimate name (%s)", (name) => {
    expect(validateEstimateDetails({ ...value, name }).name).toBe(copy.errors.name);
  });

  it("allows exactly 120 characters and rejects trailing whitespace beyond the limit", () => {
    expect(validateEstimateDetails({ ...value, name: "E".repeat(120) }).name).toBeUndefined();
    expect(validateEstimateDetails({ ...value, name: `${"E".repeat(120)} ` }).name).toBe(copy.errors.name);
  });

  it("permits missing recipient and address on a draft", () => {
    expect(validateEstimateDetails({ ...value, recipientName: "", recipientEmail: "", serviceAddress: "" })).toEqual({});
  });

  it.each(["not-an-email", "name@", "a b@example.com", `${"a".repeat(250)}@example.com`])(
    "rejects invalid nonempty email even on a draft (%s)", (recipientEmail) => {
      expect(validateEstimateDetails({ ...value, recipientEmail }).recipientEmail).toBe(copy.errors.recipientEmail);
    },
  );

  it("requires recipient name and email to send", () => {
    expect(validateEstimateDetails(
      { ...value, recipientName: " ", recipientEmail: "" },
      { purpose: "send" },
    )).toEqual({ recipientName: copy.errors.recipientName, recipientEmail: copy.errors.recipientEmail });
  });

  it("requires address for sending only when the workspace requires it", () => {
    const noAddress = { ...value, serviceAddress: " " };
    expect(validateEstimateDetails(noAddress, { purpose: "send" })).toEqual({});
    expect(validateEstimateDetails(noAddress, { purpose: "send", requireServiceAddress: true }))
      .toEqual({ serviceAddress: copy.errors.serviceAddress });
    expect(validateEstimateDetails(noAddress, { purpose: "draft", requireServiceAddress: true })).toEqual({});
  });

  it("allows Drafts without an assigned prepared-by teammate", () => {
    expect(validateEstimateDetails({ ...value, ownerId: " " })).toEqual({});
  });
});
