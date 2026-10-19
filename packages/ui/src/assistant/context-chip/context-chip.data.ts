export const contextChipData = {
  using: (label: string) => `Using ${label}`,
  clear: (label: string) => `Clear assistant context: Using ${label}`,
  stories: {
    title: 'Assistant context',
    description: 'A removable label for the lead or list filters supplied to the assistant. These previews do not send data or change access permissions.',
    heading: 'Context for your next message',
    helper: 'Clear this context to ask a question without carrying the selected lead or filters into your next message.',
    record: 'LD-1048 · Jordan Lee', filters: 'current filters',
    longRecord: 'LD-1048 · Jordan Alexandra Lee and the Willow Street household — kitchen, utility room and exterior renovation inquiry',
    escapedRecord: 'LD-1048 · Renée 李 <customer details>',
    composer: 'Message to the assistant', placeholder: 'Ask about this lead…',
    cleared: 'Context cleared in this preview.',
  },
};
