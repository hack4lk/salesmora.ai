'use client';
import Autocomplete from '@mui/material/Autocomplete';
import MuiTextField from '@mui/material/TextField';
import { fieldClasses } from '@salesmora/ui';
import type { WorkspaceService } from '../service-types';
import { servicePickerData as copy } from './service-picker.data';

export type ServicePickerProps = {
  services: readonly Pick<WorkspaceService, 'id' | 'name' | 'status'>[];
  value: string | null;
  /** Retains an unmatched historical value visibly until the user explicitly replaces it. */
  legacyValue?: string;
  /** Editing may keep an existing archived reference; creation must select an active service. */
  allowRetainedValue?: boolean;
  disabled?: boolean; required?: boolean; error?: string; label?: string;
  onChange: (serviceId: string | null) => void;
};

/** Search/selection only. The host supplies cached workspace choices; typing never creates a service. */
export function ServicePicker({ services, value, legacyValue, allowRetainedValue = false, disabled = false, required = false, error, label = copy.label, onChange }: ServicePickerProps) {
  const current = services.find(service => service.id === value);
  const retained = current ?? (value || legacyValue ? { id: value ?? '__previous_service__', name: legacyValue || copy.unavailable(value!), status: 'archived' as const } : null);
  const options = services.filter(service => service.status === 'active');
  const unavailable = !!retained && (!current || current.status === 'archived');
  const help = error || (unavailable ? (!current ? copy.legacyHelp : !allowRetainedValue ? copy.unavailableHelp : undefined) : !options.length ? copy.emptyHelp : undefined);
  return <Autocomplete options={options} value={retained} size="small" fullWidth disablePortal disabled={disabled}
    getOptionLabel={option => option.status === 'archived' && current?.id === option.id ? copy.archived(option.name) : option.name}
    isOptionEqualToValue={(option, selected) => option.id === selected.id}
    noOptionsText={copy.empty} onChange={(_, next) => onChange(next?.id ?? null)}
    renderInput={params => <MuiTextField {...params} label={label} placeholder={copy.placeholder} required={required}
      error={!!error || unavailable && !allowRetainedValue} helperText={help} className={fieldClasses} />}
  />;
}
