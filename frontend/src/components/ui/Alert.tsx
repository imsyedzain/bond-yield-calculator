/**
 * Reusable Alert Component
 */

import type { CSSProperties, ReactNode } from 'react';

interface AlertProps {
  children: ReactNode;
  variant?: 'error' | 'success' | 'info' | 'warning';
}

export function Alert({ children, variant = 'info' }: AlertProps): JSX.Element {
  return (
    <div style={{ ...styles.alert, ...styles[variant] }}>
      {children}
    </div>
  );
}

const styles: { [key: string]: CSSProperties } = {
  alert: {
    padding: '1rem',
    borderRadius: '4px',
    marginBottom: '1rem',
    fontSize: '0.875rem',
  },
  error: {
    backgroundColor: '#f8d7da',
    color: '#721c24',
    border: '1px solid #f5c6cb',
  },
  success: {
    backgroundColor: '#d4edda',
    color: '#155724',
    border: '1px solid #c3e6cb',
  },
  info: {
    backgroundColor: '#d1ecf1',
    color: '#0c5460',
    border: '1px solid #bee5eb',
  },
  warning: {
    backgroundColor: '#fff3cd',
    color: '#856404',
    border: '1px solid #ffeaa7',
  },
};
