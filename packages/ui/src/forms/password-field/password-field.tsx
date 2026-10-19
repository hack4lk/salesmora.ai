'use client';

import { useId, useState } from 'react';
import MuiTextField from '@mui/material/TextField';
import InputAdornment from '@mui/material/InputAdornment';
import IconButton from '@mui/material/IconButton';
import { Visibility, VisibilityOff } from '../../icons';
import type { TextFieldProps } from '../text-field/text-field';
import { fieldClasses } from '../field-classes';
import { passwordFieldData } from './password-field.data';

export type PasswordFieldProps = Omit<TextFieldProps, 'type' | 'autoComplete' | 'slots' | 'slotProps'> & {
  autoComplete: 'current-password' | 'new-password';
};

/** Visibility is local UI state; values and validation belong to the form. */
export function PasswordField({
  id,
  label,
  autoComplete,
  required = false,
  disabled = false,
  fullWidth = true,
  size = 'small',
  className,
  ...props
}: PasswordFieldProps) {
  const generatedId = useId();
  const inputId = id ?? generatedId;
  const [visible, setVisible] = useState(false);

  return (
    <MuiTextField
      {...props}
      id={inputId}
      label={required ? label : passwordFieldData.optionalLabel(label)}
      type={visible ? 'text' : 'password'}
      autoComplete={autoComplete}
      variant="outlined"
      required={required}
      disabled={disabled}
      fullWidth={fullWidth}
      size={size}
      slotProps={{
        input: {
          endAdornment: (
            <InputAdornment position="end">
              <IconButton
                type="button"
                aria-label={passwordFieldData.toggleLabel(visible, label)}
                aria-pressed={visible}
                aria-controls={inputId}
                disabled={disabled}
                onMouseDown={(event) => event.preventDefault()}
                onClick={() => setVisible((current) => !current)}
                className="size-11 text-muted disabled:text-disabled"
              >
                {visible ? <VisibilityOff /> : <Visibility />}
              </IconButton>
            </InputAdornment>
          ),
        },
      }}
      className={[fieldClasses, '[&_.MuiOutlinedInput-root]:pr-1', className].filter(Boolean).join(' ')}
    />
  );
}
