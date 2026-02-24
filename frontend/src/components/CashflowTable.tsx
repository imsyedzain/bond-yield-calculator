/**
 * Cashflow Table Component
 *
 * Displays the bond cashflow schedule in a responsive table.
 * Separates data presentation from business logic.
 */

import type { CSSProperties } from 'react';
import { Card } from './ui/Card';
import { formatCurrency } from '../utils/validation';
import type { CashflowEntry } from '../types/bond.types';

interface CashflowTableProps {
  cashflows: CashflowEntry[];
}

export function CashflowTable({ cashflows }: CashflowTableProps): JSX.Element {
  return (
    <Card title="Cashflow Schedule">
      <div style={styles.tableContainer}>
        <table style={styles.table}>
          <thead>
            <tr style={styles.headerRow}>
              <th style={styles.headerCell}>Period</th>
              <th style={styles.headerCell}>Date</th>
              <th style={styles.headerCell}>Coupon</th>
              <th style={styles.headerCell}>Principal</th>
              <th style={styles.headerCell}>Total</th>
              <th style={styles.headerCell}>Cumulative Interest</th>
              <th style={styles.headerCell}>Remaining Principal</th>
            </tr>
          </thead>
          <tbody>
            {cashflows.map((entry) => (
              <CashflowRow key={entry.period} entry={entry} />
            ))}
          </tbody>
        </table>
      </div>
    </Card>
  );
}

interface CashflowRowProps {
  entry: CashflowEntry;
}

function CashflowRow({ entry }: CashflowRowProps): JSX.Element {
  const isMaturity = entry.principalPayment > 0;

  return (
    <tr style={isMaturity ? styles.maturityRow : styles.row}>
      <td style={styles.cell}>{entry.period}</td>
      <td style={styles.cell}>{entry.date}</td>
      <td style={styles.cell}>{formatCurrency(entry.couponPayment)}</td>
      <td style={styles.cell}>
        {entry.principalPayment > 0
          ? formatCurrency(entry.principalPayment)
          : '-'}
      </td>
      <td style={styles.totalCell}>{formatCurrency(entry.totalPayment)}</td>
      <td style={styles.cell}>{formatCurrency(entry.cumulativeInterest)}</td>
      <td style={styles.cell}>
        {entry.remainingPrincipal > 0
          ? formatCurrency(entry.remainingPrincipal)
          : '$0.00'}
      </td>
    </tr>
  );
}

const styles: { [key: string]: CSSProperties } = {
  tableContainer: {
    overflowX: 'auto',
    marginTop: '1rem',
  },
  table: {
    width: '100%',
    borderCollapse: 'collapse',
    fontSize: '0.875rem',
  },
  headerRow: {
    backgroundColor: '#007bff',
    color: '#fff',
  },
  headerCell: {
    padding: '0.75rem',
    textAlign: 'left',
    fontWeight: '600',
    whiteSpace: 'nowrap',
  },
  row: {
    borderBottom: '1px solid #e0e0e0',
  },
  maturityRow: {
    borderBottom: '1px solid #e0e0e0',
    backgroundColor: '#fff3cd',
  },
  cell: {
    padding: '0.75rem',
    textAlign: 'left',
  },
  totalCell: {
    padding: '0.75rem',
    textAlign: 'left',
    fontWeight: '700',
    color: '#007bff',
  },
};
