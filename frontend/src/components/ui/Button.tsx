/**
 * Reusable Button Component
 */

import type { CSSProperties, MouseEvent, ReactNode } from 'react';

interface ButtonProps {
  children: ReactNode;
  onClick?: (e: MouseEvent<HTMLButtonElement>) => void;
  type?: 'button' | 'submit' | 'reset';
  variant?: 'primary' | 'secondary' | 'danger';
  disabled?: boolean;
  fullWidth?: boolean;
}

export function Button({
  children,
  onClick,
  type = 'button',
  variant = 'primary',
  disabled = false,
  fullWidth = false,
}: ButtonProps): JSX.Element {
  const buttonStyle: CSSProperties = {
    ...styles.button,
    ...styles[variant],
    ...(fullWidth ? styles.fullWidth : {}),
    ...(disabled ? styles.disabled : {}),
  };

  return (
    <button
      type={type}
      onClick={onClick}
      disabled={disabled}
      style={buttonStyle}
    >
      {children}
    </button>
  );
}

const styles: { [key: string]: CSSProperties } = {
  button: {
    padding: '0.75rem 1.5rem',
    fontSize: '1rem',
    fontWeight: '600',
    border: 'none',
    borderRadius: '4px',
    cursor: 'pointer',
    transition: 'all 0.2s',
  },
  primary: {
    backgroundColor: '#007bff',
    color: '#fff',
  },
  secondary: {
    backgroundColor: '#6c757d',
    color: '#fff',
  },
  danger: {
    backgroundColor: '#dc3545',
    color: '#fff',
  },
  disabled: {
    opacity: 0.6,
    cursor: 'not-allowed',
  },
  fullWidth: {
    width: '100%',
  },
};
