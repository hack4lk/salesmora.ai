export const ganttLegendData = {
  label: 'Status legend',
  items: [
    { id: 'on-track', label: 'On-Track', swatchClass: 'bg-success' },
    { id: 'at-risk', label: 'At-Risk', swatchClass: 'bg-warning' },
    { id: 'delayed', label: 'Delayed', swatchClass: 'bg-error' },
    { id: 'work-order', label: 'Work Order', swatchClass: 'bg-seafoam' },
    { id: 'completed', label: 'Completed', swatchClass: 'bg-success opacity-40' },
  ],
  stories: {
    heading: 'Gantt legend',
    description: 'Component preview · Colors used for job and work order bars',
  },
} as const;
