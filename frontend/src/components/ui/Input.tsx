/**
 * Reusable Input Component with validation support
 */

import type { CSSProperties, ChangeEvent } from 'react';

interface InputProps {
  id: string;
  label: string;
  type?: 'text' | 'number' | 'date';
  value: string;
  onChange: (value: string) => void;
  error?: string;
  required?: boolean;
  placeholder?: string;
  helpText?: string;
  min?: string;
  max?: string;
  step?: string;
}

export function Input({
  id,
  label,
  type = 'text',
  value,
  onChange,
  error,
  required = false,
  placeholder,
  helpText,
  min,
  max,
  step,
}: InputProps): JSX.Element {
  const handleChange = (e: ChangeEvent<HTMLInputElement>): void => {
    onChange(e.target.value);
  };

  return (
    <div style={styles.inputGroup}>
      <label htmlFor={id} style={styles.label}>
        {label}
        {required && <span style={styles.required}> *</span>}
      </label>
      <input
        id={id}
        type={type}
        value={value}
        onChange={handleChange}
        placeholder={placeholder}
        min={min}
        max={max}
        step={step}
        style={{
          ...styles.input,
          ...(error ? styles.inputError : {}),
        }}
        aria-invalid={!!error}
        aria-describedby={error ? `${id}-error` : helpText ? `${id}-help` : undefined}
      />
      {error && (
        <span id={`${id}-error`} style={styles.errorText}>
          {error}
        </span>
      )}
      {helpText && !error && (
        <span id={`${id}-help`} style={styles.helpText}>
          {helpText}
        </span>
      )}
    </div>
  );
}

const styles: { [key: string]: CSSProperties } = {
  inputGroup: {
    display: 'flex',
    flexDirection: 'column',
    gap: '0.5rem',
    marginBottom: '1rem',
  },
  label: {
    fontWeight: '600',
    fontSize: '0.875rem',
    color: '#333',
  },
  required: {
    color: '#dc3545',
  },
  input: {
    padding: '0.75rem',
    fontSize: '1rem',
    border: '2px solid #ddd',
    borderRadius: '4px',
    outline: 'none',
    transition: 'border-color 0.2s',
  },
  inputError: {
    borderColor: '#dc3545',
  },
  errorText: {
    fontSize: '0.875rem',
    color: '#dc3545',
    marginTop: '-0.25rem',
  },
  helpText: {
    fontSize: '0.875rem',
    color: '#6c757d',
    marginTop: '-0.25rem',
  },
};
