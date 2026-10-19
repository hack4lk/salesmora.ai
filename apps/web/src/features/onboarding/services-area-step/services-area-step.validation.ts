import { servicesAreaStepData as copy } from './services-area-step.data';
export type ServiceChoice = typeof copy.serviceOptions[number]['value'];
export type ServiceRange = typeof copy.ranges[number]['value'];
export interface ServicesAreaValues { services: ServiceChoice[]; postalCode: string; serviceRange: ServiceRange | '' }
export type ServicesAreaErrors = Partial<Record<'services' | 'serviceRange' | 'postalCode', string>>;
export function validateServicesArea(values: ServicesAreaValues): ServicesAreaErrors {
  const errors: ServicesAreaErrors = {};
  if (!values.services.length || values.services.some((value) => !copy.serviceOptions.some((option) => option.value === value))) errors.services = copy.errors.services;
  if (values.serviceRange && !copy.ranges.some((range) => range.value === values.serviceRange)) errors.serviceRange = copy.errors.range;
  if (values.postalCode.trim().length > 100) errors.postalCode = copy.errors.postal;
  return errors;
}
