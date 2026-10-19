export const helpArticleData = {
  eyebrow: 'SalesMora help', back: 'Back to workspace', contents: 'On this page',
  description: 'Current product guidance. Your workspace permissions determine what you can access.',
  stories: { title: 'Understand the lead pipeline', sections: [
    { anchor: 'pipeline-stages', heading: 'Pipeline stages', text: 'The current lead stages are New, Contacted, Estimate sent and In progress. A stage records progress; choosing Estimate sent does not send an estimate.' },
    { anchor: 'counts-and-visibility', heading: 'Counts and visibility', text: 'Home shows pipeline counts for your selected workspace. Field teammates see only leads assigned to them. Individual widgets follow your current permissions.' },
    { anchor: 'current-records', heading: 'Current records', text: 'Help explains product behavior. Live lead counts come from authorized database queries, rather than help articles.' },
  ] },
} as const;
