import { businessProfileStepData as copy } from './business-profile-step.data';

export type BusinessType = typeof copy.types[number]['value'];
export interface BusinessProfileValues { businessName: string; businessType: BusinessType | '' }
export type BusinessProfileErrors = Partial<Record<keyof BusinessProfileValues, string>>;
export function validateBusinessProfile(values: BusinessProfileValues): BusinessProfileErrors {
  const errors: BusinessProfileErrors = {};
  if (!values.businessName.trim()) errors.businessName = copy.errors.name;
  if (values.businessName.trim().length > 100) errors.businessName = copy.errors.nameLength;
  if (!copy.types.some((type) => type.value === values.businessType)) errors.businessType = copy.errors.type;
  return errors;
}
