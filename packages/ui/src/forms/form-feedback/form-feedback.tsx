'use client';

import { useId } from 'react';
import Alert from '@mui/material/Alert';
import { CheckCircleOutlined, ErrorOutlined } from '../../icons';
import { formFeedbackData as copy } from './form-feedback.data';

export interface FormFeedbackProps {
  kind: 'error' | 'success';
  message: string;
  title?: string;
}

/** Render when the form has feedback; request state and recovery belong to the form. */
export function FormFeedback({ kind, message, title = copy.titles[kind] }: FormFeedbackProps) {
  const headingId = useId();
  const messageId = useId();

  return (
    <Alert
      severity={kind}
      variant="outlined"
      role={kind === 'error' ? 'alert' : 'status'}
      aria-live={kind === 'error' ? 'assertive' : 'polite'}
      aria-atomic="true"
      aria-labelledby={headingId}
      aria-describedby={messageId}
      iconMapping={{ error: <ErrorOutlined />, success: <CheckCircleOutlined /> }}
      className={[
        'w-full min-w-0 rounded-xl bg-paper p-4 text-ink',
        '[&_.MuiAlert-message]:min-w-0 [&_.MuiAlert-message]:py-0 [&_.MuiAlert-icon]:py-0',
        kind === 'error' ? 'border-error [&_.MuiAlert-icon]:text-error' : 'border-success [&_.MuiAlert-icon]:text-success',
      ].join(' ')}
    >
      <p id={headingId} className="text-base leading-6 font-semibold wrap-anywhere">{title}</p>
      <p id={messageId} className="mt-1 text-sm leading-6 wrap-anywhere">{message}</p>
    </Alert>
  );
}
