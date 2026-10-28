import type { EstimateExportColumn } from "@salesmora/contracts";

export const estimateExportDialogData = {
  title: "Export estimates",
  description: "Review the scope and columns before downloading a CSV.",
  download: "Download CSV",
  choose: "CSV columns",
  forbidden: "You do not have permission to export estimates.",
  limit: (n: number) => `Narrow your filters to ${n.toLocaleString("en-US")} estimates or fewer.`,
  hint: "The server re-authorizes this export and escapes spreadsheet formulas. This preview does not download workspace data.",
  count: (n: number) => `${n.toLocaleString("en-US")} estimates in this export`,
  columns: {
    number: "Estimate number",
    revision: "Revision",
    name: "Name",
    status: "Status",
    customer: "Customer",
    parentType: "Parent type",
    parentId: "Parent ID",
    owner: "Owner",
    total: "Total",
    sentAt: "Sent date",
    validUntil: "Valid until",
    decidedAt: "Decided date",
    decisionChannel: "Decision channel",
  } satisfies Record<EstimateExportColumn, string>,
  all: "All active estimates",
  filtered: "Filtered estimates · Sent · Alex Morgan · Lead only",
} as const;
