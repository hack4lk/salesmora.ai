'use client';
import { useId, useRef, useState } from 'react';
import Autocomplete, { createFilterOptions } from '@mui/material/Autocomplete';
import MuiTextField from '@mui/material/TextField';
import { TextField, fieldClasses } from '@salesmora/ui';
import { OnboardingStepFrame } from '../onboarding-step-frame/onboarding-step-frame';
import { servicesAreaStepData as copy } from './services-area-step.data';
import { validateServicesArea, type ServicesAreaValues } from './services-area-step.validation';
export type { ServicesAreaValues, ServiceChoice, ServiceRange } from './services-area-step.validation';
export interface ServicesAreaStepProps {
  values: ServicesAreaValues;
  onChange: (values: ServicesAreaValues) => void;
  onContinue: (values: ServicesAreaValues) => void;
  onBack: () => void;
  pending?: boolean;
}

/** Controlled draft fields; the parent retains values and owns persistence. */
export function ServicesAreaStep({ values, onChange, onContinue, onBack, pending = false }: ServicesAreaStepProps) {
  const id = useId();
  const firstService = useRef<HTMLInputElement>(null);
  const postalRef = useRef<HTMLInputElement>(null);
  const rangeRef = useRef<HTMLSelectElement>(null);
  const [attempted, setAttempted] = useState(false);
  const errors = attempted ? validateServicesArea(values) : {};
  const selected = copy.serviceOptions.filter((option) => values.services.includes(option.value));
  function proceed() {
    if (pending) return;
    setAttempted(true);
    const nextErrors = validateServicesArea(values);
    if (nextErrors.services) { firstService.current?.focus(); return; }
    if (nextErrors.postalCode) { postalRef.current?.focus(); return; }
    if (nextErrors.serviceRange) { rangeRef.current?.focus(); return; }
    onContinue({ ...values, postalCode: values.postalCode.trim(), services: copy.serviceOptions.filter((option) => values.services.includes(option.value)).map((option) => option.value) });
  }
  return <OnboardingStepFrame activeStep="services" onBack={onBack} onContinue={proceed} pending={pending}>
    <div className="grid min-w-0 gap-6">
      <div className="grid min-w-0 gap-3">
        <Autocomplete multiple size="small" disablePortal disableCloseOnSelect options={copy.serviceOptions} value={selected} disabled={pending}
          id={`${id}-services`} groupBy={(option) => option.category} getOptionLabel={(option) => option.label}
          isOptionEqualToValue={(option, value) => option.value === value.value}
          filterOptions={createFilterOptions({ stringify: (option: typeof copy.serviceOptions[number]) => `${option.label} ${option.category}` })}
          onChange={(_, next) => onChange({ ...values, services: next.map((option) => option.value) })}
          renderGroup={(params) => <li key={params.key} role="presentation"><div role="group" aria-label={params.group}><div aria-hidden="true" className="bg-canvas px-4 py-2 text-sm font-semibold text-muted">{params.group}</div><ul role="presentation" className="m-0 list-none p-0">{params.children}</ul></div></li>}
          renderValue={() => null} clearText={copy.clear} openText={copy.open} closeText={copy.close} noOptionsText={copy.noOptions}
          renderOption={(props, option, { selected: checked }) => {
            const { key, ...optionProps } = props;
            return <li key={key} {...optionProps}><span aria-hidden="true" className={`mr-3 grid size-5 shrink-0 place-items-center rounded border text-sm ${checked ? 'border-primary bg-primary text-paper' : 'border-line bg-paper'}`}>{checked ? '✓' : ''}</span><span className="min-w-0 whitespace-normal wrap-anywhere">{option.label}</span></li>;
          }}
          renderInput={(params) => <MuiTextField {...params} size="small" inputRef={firstService} label={copy.services} placeholder={copy.searchPlaceholder} required error={!!errors.services} helperText={errors.services ?? copy.servicesHelp} className={fieldClasses} />}
        />
        <p role="status" className="m-0 text-sm text-muted">{copy.selectionCount(selected.length)}</p>
        {selected.length > 0 && <ul aria-label={copy.selected} className="m-0 flex list-none flex-wrap gap-2 p-0">
          {selected.map((option) => <li key={option.value} className="inline-flex min-w-0 max-w-full items-center gap-1 rounded-full border border-line bg-canvas pl-3">
            <span className="min-w-0 text-sm text-ink wrap-anywhere">{option.label}</span>
            <button type="button" disabled={pending} aria-label={copy.removeLabel(option.label)} onClick={() => { onChange({ ...values, services: values.services.filter((service) => service !== option.value) }); firstService.current?.focus(); }} className="grid size-11 shrink-0 place-items-center rounded-full text-xl text-primary hover:bg-line disabled:text-muted focus-visible:focus-ring"><span aria-hidden="true">{copy.removeIcon}</span></button>
          </li>)}
        </ul>}
      </div>
      <div className="grid min-w-0 gap-6 sm:grid-cols-2">
        <TextField inputRef={postalRef} error={!!errors.postalCode} helperText={errors.postalCode} id={`${id}-postal`} name="postalCode" label={copy.postalCode} placeholder={copy.postalPlaceholder} autoComplete="postal-code" disabled={pending} value={values.postalCode} onChange={(event) => onChange({ ...values, postalCode: event.target.value })} />
        <MuiTextField id={`${id}-range`} inputRef={rangeRef} name="serviceRange" label={copy.range} select slotProps={{ select: { native: true }, inputLabel: { shrink: true } }} variant="outlined" size="small" fullWidth disabled={pending} value={values.serviceRange} onChange={(event) => onChange({ ...values, serviceRange: event.target.value as ServicesAreaValues['serviceRange'] })} error={!!errors.serviceRange} helperText={errors.serviceRange} className={fieldClasses}>
          <option value="">{copy.chooseRange}</option>
          {copy.ranges.map((range) => <option key={range.value} value={range.value}>{range.label}</option>)}
        </MuiTextField>
      </div>
      <p className="m-0 text-sm leading-6 text-muted">{copy.areaHelp}</p>
    </div>
  </OnboardingStepFrame>;
}
