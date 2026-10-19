import { businessTypes } from '@salesmora/contracts';

export const businessProfileStepData = {
  name: 'Business name',
  namePlaceholder: 'e.g. Northstar Plumbing',
  type: 'Business type',
  chooseType: 'Select a service business type',
  errors: {
    name: 'Enter your business name to continue.',
    nameLength: 'Use a business name of 100 characters or fewer.',
    type: 'Choose a business type to continue.',
  },
  types: businessTypes,
  stories: {
    title: 'Set up your workspace',
    notice: 'Component preview. Details stay in this preview; no workspace is created.',
    name: 'Northstar Plumbing',
    spacedName: '  Northstar Plumbing  ',
  },
} as const;
