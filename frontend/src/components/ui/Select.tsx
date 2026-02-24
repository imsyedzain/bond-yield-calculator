/**
 * Reusable Select Component
 */

import type { CSSProperties, ChangeEvent } from 'react';

interface SelectOption {
  value: string;
  label: string;
}

interface SelectProps {
  id: string;
  label: string;
  value: string;
  onChange: (value: string) => void;
  options: SelectOption[];
  required?: boolean;
}

export function Select({
  id,
  label,
  value,
  onChange,
  options,
  required = false,
}: SelectProps): JSX.Element {
  const handleChange = (e: ChangeEvent<HTMLSelectElement>): void => {
    onChange(e.target.value);
  };

  return (
    <div style={styles.selectGroup}>
      <label htmlFor={id} style={styles.label}>
        {label}
        {required && <span style={styles.required}> *</span>}
      </label>
      <select
        id={id}
        value={value}
        onChange={handleChange}
        style={styles.select}
        required={required}
      >
        {options.map((option) => (
          <option key={option.value} value={option.value}>
            {option.label}
          </option>
        ))}
      </select>
    </div>
  );
}

const styles: { [key: string]: CSSProperties } = {
  selectGroup: {
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
  select: {
    padding: '0.75rem',
    fontSize: '1rem',
    border: '2px solid #ddd',
    borderRadius: '4px',
    outline: 'none',
    backgroundColor: '#fff',
    cursor: 'pointer',
  },
};
