/**
 * Results Summary Component
 *
 * Displays bond calculation results in clean summary cards.
 * Separates presentation from data logic.
 */

import type { CSSProperties } from 'react';
import { Card } from './ui/Card';
import { formatCurrency, formatPercentage } from '../utils/validation';
import type { BondCalculationResult, PremiumDiscountType } from '../types/bond.types';

interface ResultsSummaryProps {
  result: BondCalculationResult;
}

export function ResultsSummary({ result }: ResultsSummaryProps): JSX.Element {
  return (
    <Card title="Bond Analysis Results">
      <div style={styles.grid}>
        <SummaryCard
          label="Current Yield"
          value={formatPercentage(result.currentYield, 4)}
          description="Annual coupon payment divided by market price"
        />

        <SummaryCard
          label="Yield to Maturity (YTM)"
          value={formatPercentage(result.yieldToMaturity, 4)}
          description="Total return if held to maturity"
          highlight
        />

        <SummaryCard
          label="Total Interest Earned"
          value={formatCurrency(result.totalInterestEarned)}
          description="Sum of all coupon payments"
        />

        <SummaryCard
          label="Bond Status"
          value={result.premiumOrDiscount.toUpperCase()}
          description={getBondStatusDescription(result.premiumOrDiscount)}
          color={getBondStatusColor(result.premiumOrDiscount)}
        />
      </div>
    </Card>
  );
}

interface SummaryCardProps {
  label: string;
  value: string;
  description: string;
  highlight?: boolean;
  color?: string;
}

function SummaryCard({
  label,
  value,
  description,
  highlight = false,
  color,
}: SummaryCardProps): JSX.Element {
  return (
    <div
      style={{
        ...styles.summaryCard,
        ...(highlight ? styles.highlightCard : {}),
      }}
    >
      <div style={styles.cardLabel}>{label}</div>
      <div
        style={{
          ...styles.cardValue,
          ...(color ? { color } : {}),
        }}
      >
        {value}
      </div>
      <div style={styles.cardDescription}>{description}</div>
    </div>
  );
}

function getBondStatusDescription(status: PremiumDiscountType): string {
  switch (status) {
    case 'premium':
      return 'Trading above face value';
    case 'discount':
      return 'Trading below face value';
    case 'par':
      return 'Trading at face value';
  }
}

function getBondStatusColor(status: PremiumDiscountType): string {
  switch (status) {
    case 'premium':
      return '#28a745';
    case 'discount':
      return '#dc3545';
    case 'par':
      return '#6c757d';
  }
}

const styles: { [key: string]: CSSProperties } = {
  grid: {
    display: 'grid',
    gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))',
    gap: '1rem',
  },
  summaryCard: {
    padding: '1rem',
    backgroundColor: '#f8f9fa',
    borderRadius: '8px',
    border: '1px solid #e0e0e0',
  },
  highlightCard: {
    backgroundColor: '#e7f3ff',
    border: '2px solid #007bff',
  },
  cardLabel: {
    fontSize: '0.875rem',
    fontWeight: '600',
    color: '#6c757d',
    marginBottom: '0.5rem',
  },
  cardValue: {
    fontSize: '1.5rem',
    fontWeight: '700',
    color: '#007bff',
    marginBottom: '0.5rem',
  },
  cardDescription: {
    fontSize: '0.75rem',
    color: '#6c757d',
  },
};
