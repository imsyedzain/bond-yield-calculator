/**
 * Reusable Card Component
 */

import type { ReactNode, CSSProperties } from 'react';

interface CardProps {
  children: ReactNode;
  title?: string;
  style?: CSSProperties;
}

export function Card({ children, title, style }: CardProps): JSX.Element {
  return (
    <div style={{ ...styles.card, ...style }}>
      {title && <h2 style={styles.cardTitle}>{title}</h2>}
      {children}
    </div>
  );
}

const styles: { [key: string]: CSSProperties } = {
  card: {
    backgroundColor: '#ffffff',
    borderRadius: '8px',
    padding: '1.5rem',
    boxShadow: '0 2px 4px rgba(0, 0, 0, 0.1)',
    border: '1px solid #e0e0e0',
  },
  cardTitle: {
    marginTop: 0,
    marginBottom: '1rem',
    fontSize: '1.25rem',
    fontWeight: '600',
    color: '#333',
  },
};
