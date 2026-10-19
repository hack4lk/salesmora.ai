'use client';

import { useId } from 'react';
import MuiTextField, { type TextFieldProps as MuiTextFieldProps } from '@mui/material/TextField';
import { fieldClasses } from '../field-classes';
import { textFieldData } from './text-field.data';

export type TextFieldProps = Omit<
  MuiTextFieldProps,
  'label' | 'type' | 'variant' | 'select' | 'multiline' | 'sx' | 'style'
> & {
  label: string;
  type?: 'text' | 'email';
};

/** Branded single-line field. The owning form supplies validation and errors. */
export function TextField({
  id,
  label,
  type = 'text',
  required = false,
  fullWidth = true,
  size = 'small',
  className,
  ...props
}: TextFieldProps) {
  const generatedId = useId();

  return (
    <MuiTextField
      {...props}
      id={id ?? generatedId}
      label={required ? label : textFieldData.optionalLabel(label)}
      type={type}
      variant="outlined"
      required={required}
      fullWidth={fullWidth}
      size={size}
      className={[fieldClasses, className].filter(Boolean).join(' ')}
    />
  );
}
