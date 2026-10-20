export const customersMetricsData = {
  title: "Customer overview",
  description:
    "Workspace totals exclude archived customers and stay the same when you filter the list.",
  customers: { label: "Customers", description: "In this workspace" },
  leads: {
    label: "With open leads",
    description: "Customers with active opportunities",
  },
  jobs: {
    label: "With active jobs",
    description: "Customers with current work",
    unavailable: "Available when the Jobs module is connected.",
  },
  errorTitle: "Totals unavailable",
  error: "Customer totals could not be loaded.",
  retry: "Retry totals",
  stories: {
    title: "Customers metrics",
    description:
      "Fictional workspace totals using the shared MetricCard. No customer data is loaded; retry is mocked.",
    future:
      "Future-module preview: job totals are supplied only when Jobs is available.",
  },
} as const;
