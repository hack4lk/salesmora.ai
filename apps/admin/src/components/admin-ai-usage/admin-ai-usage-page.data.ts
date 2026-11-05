export const adminAIUsagePageData = {
  title: 'AI usage',
  description: 'Platform usage is grouped from recorded calls. Prompts and provider payloads are never included.',
  periods: [
    { value: '7d', label: '7 days' },
    { value: '30d', label: '30 days' },
    { value: 'month', label: 'This month' },
  ],
  pricingNote: 'Estimated cost is calculated from the versioned model price catalog. It is unavailable until verified rates are configured and is not a provider invoice.',
  noPricing: 'No verified model pricing is configured. Token counts remain available; cost estimates are withheld.',
  incompleteEstimate: 'Some calls have unknown token usage or no matching price version, so a complete cost estimate is unavailable for this period.',
  featureLabels: {
    planning: 'Chat planning',
    answer: 'Chat answer',
    query_embedding: 'Knowledge search embedding',
    corpus_embedding: 'Knowledge ingestion embedding',
    evaluation_embedding: 'Knowledge evaluation embedding',
  } as Record<string, string>,
} as const;
