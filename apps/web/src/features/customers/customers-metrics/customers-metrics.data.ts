export const customersMetricsData = {
  title: "Customer overview",
  customers: { label: "Customers", description: "In this workspace" },
  leads: {
    label: "With open leads",
    description: "Customers with active opportunities",
  },
  jobs: {
    label: "With active jobs",
    description: "Customers with current work",
    unavailable: "Active job totals are unavailable.",
  },
  errorTitle: "Totals unavailable",
  error: "Customer totals could not be loaded.",
  retry: "Retry totals",
  stories: {
    title: "Customers metrics",
    description:
      "Fictional workspace totals using the shared MetricCard. No customer data is loaded; retry is mocked.",
    future:
      "Job totals reflect the jobs you can view.",
  },
} as const;
