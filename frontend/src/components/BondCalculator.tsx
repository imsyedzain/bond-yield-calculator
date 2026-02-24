import { useState, FormEvent } from 'react';
import { calculateBond } from '../services/bondApi';
import type { BondCalculationResult } from '../types/bond.types';

export function BondCalculator(): JSX.Element {
  const [faceValue, setFaceValue] = useState<string>('1000');
  const [annualCouponRate, setAnnualCouponRate] = useState<string>('5');
  const [marketPrice, setMarketPrice] = useState<string>('950');
  const [yearsToMaturity, setYearsToMaturity] = useState<string>('10');
  const [couponFrequency, setCouponFrequency] = useState<'annual' | 'semi-annual'>('semi-annual');
  const [settlementDate, setSettlementDate] = useState<string>('');
  const [result, setResult] = useState<BondCalculationResult | null>(null);
  const [error, setError] = useState<string>('');
  const [loading, setLoading] = useState<boolean>(false);

  const handleSubmit = async (e: FormEvent<HTMLFormElement>): Promise<void> => {
    e.preventDefault();
    setError('');
    setResult(null);
    setLoading(true);

    try {
      const data = await calculateBond({
        faceValue: parseFloat(faceValue),
        annualCouponRate: parseFloat(annualCouponRate),
        marketPrice: parseFloat(marketPrice),
        yearsToMaturity: parseFloat(yearsToMaturity),
        couponFrequency,
        settlementDate: settlementDate || undefined,
      });
      setResult(data);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'An error occurred');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div style={styles.container}>
      <h1 style={styles.title}>Bond Calculator</h1>

      <form onSubmit={handleSubmit} style={styles.form}>
        <div style={styles.inputGroup}>
          <label htmlFor="faceValue" style={styles.label}>
            Face Value ($)
          </label>
          <input
            id="faceValue"
            type="number"
            step="0.01"
            value={faceValue}
            onChange={(e) => setFaceValue(e.target.value)}
            required
            style={styles.input}
          />
        </div>

        <div style={styles.inputGroup}>
          <label htmlFor="annualCouponRate" style={styles.label}>
            Annual Coupon Rate (%)
          </label>
          <input
            id="annualCouponRate"
            type="number"
            step="0.01"
            min="0"
            max="100"
            value={annualCouponRate}
            onChange={(e) => setAnnualCouponRate(e.target.value)}
            required
            style={styles.input}
          />
        </div>

        <div style={styles.inputGroup}>
          <label htmlFor="marketPrice" style={styles.label}>
            Market Price ($)
          </label>
          <input
            id="marketPrice"
            type="number"
            step="0.01"
            value={marketPrice}
            onChange={(e) => setMarketPrice(e.target.value)}
            required
            style={styles.input}
          />
        </div>

        <div style={styles.inputGroup}>
          <label htmlFor="yearsToMaturity" style={styles.label}>
            Years to Maturity
          </label>
          <input
            id="yearsToMaturity"
            type="number"
            step="0.01"
            value={yearsToMaturity}
            onChange={(e) => setYearsToMaturity(e.target.value)}
            required
            style={styles.input}
          />
        </div>

        <div style={styles.inputGroup}>
          <label htmlFor="couponFrequency" style={styles.label}>
            Coupon Frequency
          </label>
          <select
            id="couponFrequency"
            value={couponFrequency}
            onChange={(e) => setCouponFrequency(e.target.value as 'annual' | 'semi-annual')}
            required
            style={styles.input}
          >
            <option value="annual">Annual</option>
            <option value="semi-annual">Semi-Annual</option>
          </select>
        </div>

        <div style={styles.inputGroup}>
          <label htmlFor="settlementDate" style={styles.label}>
            Settlement Date (optional)
          </label>
          <input
            id="settlementDate"
            type="date"
            value={settlementDate}
            onChange={(e) => setSettlementDate(e.target.value)}
            style={styles.input}
          />
          <small style={styles.helpText}>Leave empty to use today's date</small>
        </div>

        <button type="submit" disabled={loading} style={styles.button}>
          {loading ? 'Calculating...' : 'Calculate'}
        </button>
      </form>

      {error && <div style={styles.error}>{error}</div>}

      {result && (
        <div style={styles.result}>
          <h2 style={styles.resultTitle}>Bond Analysis Results</h2>

          <div style={styles.resultSection}>
            <h3 style={styles.sectionTitle}>Key Metrics</h3>
            <div style={styles.resultItem}>
              <span style={styles.resultLabel}>Current Yield:</span>
              <span style={styles.resultValue}>{result.currentYield.toFixed(4)}%</span>
            </div>
            <div style={styles.resultItem}>
              <span style={styles.resultLabel}>Yield to Maturity (YTM):</span>
              <span style={styles.resultValue}>{result.yieldToMaturity.toFixed(4)}%</span>
            </div>
            <div style={styles.resultItem}>
              <span style={styles.resultLabel}>Total Interest Earned:</span>
              <span style={styles.resultValue}>${result.totalInterestEarned.toFixed(2)}</span>
            </div>
            <div style={styles.resultItem}>
              <span style={styles.resultLabel}>Bond Status:</span>
              <span style={{
                ...styles.resultValue,
                color: result.premiumOrDiscount === 'premium' ? '#28a745' :
                       result.premiumOrDiscount === 'discount' ? '#dc3545' : '#6c757d'
              }}>
                {result.premiumOrDiscount.toUpperCase()}
              </span>
            </div>
          </div>

          <div style={styles.resultSection}>
            <h3 style={styles.sectionTitle}>Cashflow Schedule</h3>
            <div style={styles.tableContainer}>
              <table style={styles.table}>
                <thead>
                  <tr style={styles.tableHeaderRow}>
                    <th style={styles.tableHeader}>Period</th>
                    <th style={styles.tableHeader}>Date</th>
                    <th style={styles.tableHeader}>Coupon</th>
                    <th style={styles.tableHeader}>Principal</th>
                    <th style={styles.tableHeader}>Total</th>
                    <th style={styles.tableHeader}>Cumulative Interest</th>
                    <th style={styles.tableHeader}>Remaining Principal</th>
                  </tr>
                </thead>
                <tbody>
                  {result.cashflowSchedule.map((entry) => (
                    <tr key={entry.period} style={styles.tableRow}>
                      <td style={styles.tableCell}>{entry.period}</td>
                      <td style={styles.tableCell}>{entry.date}</td>
                      <td style={styles.tableCell}>${entry.couponPayment.toFixed(2)}</td>
                      <td style={styles.tableCell}>
                        {entry.principalPayment > 0 ? `$${entry.principalPayment.toFixed(2)}` : '-'}
                      </td>
                      <td style={styles.tableCellBold}>${entry.totalPayment.toFixed(2)}</td>
                      <td style={styles.tableCell}>${entry.cumulativeInterest.toFixed(2)}</td>
                      <td style={styles.tableCell}>
                        {entry.remainingPrincipal > 0 ? `$${entry.remainingPrincipal.toFixed(2)}` : '$0.00'}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

const styles: { [key: string]: React.CSSProperties } = {
  container: {
    maxWidth: '900px',
    margin: '0 auto',
    padding: '2rem',
    fontFamily: '-apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif',
  },
  title: {
    textAlign: 'center',
    color: '#333',
    marginBottom: '2rem',
  },
  form: {
    display: 'flex',
    flexDirection: 'column',
    gap: '1.5rem',
  },
  inputGroup: {
    display: 'flex',
    flexDirection: 'column',
    gap: '0.5rem',
  },
  label: {
    fontWeight: '600',
    color: '#555',
  },
  input: {
    padding: '0.75rem',
    fontSize: '1rem',
    border: '2px solid #ddd',
    borderRadius: '4px',
    outline: 'none',
  },
  helpText: {
    fontSize: '0.875rem',
    color: '#6c757d',
    marginTop: '-0.25rem',
  },
  button: {
    padding: '0.75rem 1.5rem',
    fontSize: '1rem',
    fontWeight: '600',
    color: '#fff',
    backgroundColor: '#007bff',
    border: 'none',
    borderRadius: '4px',
    cursor: 'pointer',
    marginTop: '1rem',
  },
  error: {
    marginTop: '1.5rem',
    padding: '1rem',
    backgroundColor: '#fee',
    color: '#c33',
    borderRadius: '4px',
    border: '1px solid #fcc',
  },
  result: {
    marginTop: '2rem',
    padding: '1.5rem',
    backgroundColor: '#f8f9fa',
    borderRadius: '8px',
    border: '1px solid #dee2e6',
  },
  resultTitle: {
    marginTop: '0',
    marginBottom: '1.5rem',
    color: '#333',
    fontSize: '1.5rem',
  },
  resultSection: {
    marginBottom: '2rem',
  },
  sectionTitle: {
    marginTop: '0',
    marginBottom: '1rem',
    color: '#555',
    fontSize: '1.1rem',
    fontWeight: '600',
  },
  resultItem: {
    display: 'flex',
    justifyContent: 'space-between',
    padding: '0.5rem 0',
    borderBottom: '1px solid #dee2e6',
  },
  resultLabel: {
    fontWeight: '600',
    color: '#555',
  },
  resultValue: {
    color: '#007bff',
    fontWeight: '700',
  },
  tableContainer: {
    overflowX: 'auto',
  },
  table: {
    width: '100%',
    borderCollapse: 'collapse',
    backgroundColor: '#fff',
    borderRadius: '4px',
  },
  tableHeaderRow: {
    backgroundColor: '#007bff',
    color: '#fff',
  },
  tableHeader: {
    padding: '0.75rem',
    textAlign: 'left',
    fontWeight: '600',
    borderBottom: '2px solid #0056b3',
  },
  tableRow: {
    borderBottom: '1px solid #dee2e6',
  },
  tableCell: {
    padding: '0.75rem',
    textAlign: 'left',
  },
  tableCellBold: {
    padding: '0.75rem',
    textAlign: 'left',
    fontWeight: '700',
    color: '#007bff',
  },
};
