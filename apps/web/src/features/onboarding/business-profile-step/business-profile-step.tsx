'use client';

import { useId, useRef, useState } from 'react';
import MuiTextField from '@mui/material/TextField';
import { TextField, fieldClasses } from '@salesmora/ui';
import { OnboardingStepFrame } from '../onboarding-step-frame/onboarding-step-frame';
import { businessProfileStepData as copy } from './business-profile-step.data';
import { validateBusinessProfile, type BusinessProfileValues } from './business-profile-step.validation';

export type { BusinessProfileValues, BusinessType } from './business-profile-step.validation';
export interface BusinessProfileStepProps {
  values: BusinessProfileValues;
  onChange: (values: BusinessProfileValues) => void;
  onContinue: (values: BusinessProfileValues) => void;
  pending?: boolean;
}

/** The parent retains draft values between steps; this step validates before continuing. */
export function BusinessProfileStep({ values, onChange, onContinue, pending = false }: BusinessProfileStepProps) {
  const id = useId();
  const nameRef = useRef<HTMLInputElement>(null);
  const typeRef = useRef<HTMLSelectElement>(null);
  const [attempted, setAttempted] = useState(false);
  const errors = attempted ? validateBusinessProfile(values) : {};

  function proceed() {
    if (pending) return;
    setAttempted(true);
    const nextErrors = validateBusinessProfile(values);
    if (nextErrors.businessName) { nameRef.current?.focus(); return; }
    if (nextErrors.businessType) { typeRef.current?.focus(); return; }
    onContinue({ ...values, businessName: values.businessName.trim() });
  }

  return <OnboardingStepFrame activeStep="business" onContinue={proceed} onBack={() => {}} pending={pending}>
    <div className="grid min-w-0 gap-6">
      <TextField id={`${id}-name`} inputRef={nameRef} name="businessName" label={copy.name} placeholder={copy.namePlaceholder} autoComplete="organization" required disabled={pending} value={values.businessName} onChange={(event) => onChange({ ...values, businessName: event.target.value })} error={!!errors.businessName} helperText={errors.businessName} />
      <MuiTextField id={`${id}-type`} inputRef={typeRef} name="businessType" label={copy.type} select slotProps={{ select: { native: true }, inputLabel: { shrink: true } }} variant="outlined" size="small" fullWidth required disabled={pending} value={values.businessType} onChange={(event) => onChange({ ...values, businessType: event.target.value as BusinessProfileValues['businessType'] })} error={!!errors.businessType} helperText={errors.businessType} className={fieldClasses}>
        <option value="">{copy.chooseType}</option>
        {copy.types.map((type) => <option key={type.value} value={type.value}>{type.label}</option>)}
      </MuiTextField>
    </div>
  </OnboardingStepFrame>;
}
