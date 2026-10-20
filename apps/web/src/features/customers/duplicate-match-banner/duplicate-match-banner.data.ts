export const duplicateMatchBannerData = {
  title: "This customer may already exist",
  hint: "Review the match before creating another record. Records will not be merged.",
  reasons: {
    email: "Matching email address",
    phone: "Matching phone number",
    name: "Matching name",
  },
  use: "Use existing",
  useRecord: (n: string) => `Use existing ${n}`,
  anyway: "Create anyway",
};
