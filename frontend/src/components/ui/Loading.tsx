/**
 * Reusable Loading Component
 */

import type { CSSProperties } from 'react';

interface LoadingProps {
  message?: string;
}

export function Loading({ message = 'Calculating...' }: LoadingProps): JSX.Element {
  return (
    <div style={styles.container}>
      <div style={styles.spinner}></div>
      <p style={styles.message}>{message}</p>
    </div>
  );
}

const styles: { [key: string]: CSSProperties } = {
  container: {
    display: 'flex',
    flexDirection: 'column',
    alignItems: 'center',
    justifyContent: 'center',
    padding: '2rem',
  },
  spinner: {
    width: '40px',
    height: '40px',
    border: '4px solid #f3f3f3',
    borderTop: '4px solid #007bff',
    borderRadius: '50%',
    animation: 'spin 1s linear infinite',
  },
  message: {
    marginTop: '1rem',
    color: '#6c757d',
    fontSize: '0.875rem',
  },
};
