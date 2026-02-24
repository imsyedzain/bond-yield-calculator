/**
 * Main App Component
 *
 * Orchestrates the bond calculator application.
 * Separates business logic (hook) from UI components.
 */

import type { CSSProperties } from 'react';
import { useBondCalculation } from './hooks/useBondCalculation';
import { BondForm } from './components/BondForm';
import { ResultsSummary } from './components/ResultsSummary';
import { CashflowTable } from './components/CashflowTable';
import { Alert } from './components/ui/Alert';
import { Loading } from './components/ui/Loading';

function App(): JSX.Element {
  // Business logic separated in custom hook
  const { result, loading, error, calculate } = useBondCalculation();

  return (
    <div style={styles.container}>
      <header style={styles.header}>
        <h1 style={styles.title}>Bond Calculator</h1>
        <p style={styles.subtitle}>
          Calculate yield to maturity, current yield, and cashflow schedules
        </p>
      </header>

      <main style={styles.main}>
        <div style={styles.formSection}>
          <BondForm onSubmit={calculate} loading={loading} />
        </div>

        <div style={styles.resultsSection}>
          {/* Error State */}
          {error && <Alert variant="error">{error}</Alert>}

          {/* Loading State */}
          {loading && <Loading message="Calculating bond metrics..." />}

          {/* Results */}
          {result && !loading && (
            <>
              <ResultsSummary result={result} />
              <div style={styles.spacer} />
              <CashflowTable cashflows={result.cashflowSchedule} />
            </>
          )}

          {/* Empty State */}
          {!result && !loading && !error && (
            <div style={styles.emptyState}>
              <p style={styles.emptyText}>
                Enter bond parameters and click Calculate to see results
              </p>
            </div>
          )}
        </div>
      </main>
    </div>
  );
}

const styles: { [key: string]: CSSProperties } = {
  container: {
    minHeight: '100vh',
    backgroundColor: '#f5f5f5',
  },
  header: {
    backgroundColor: '#fff',
    padding: '2rem',
    textAlign: 'center',
    boxShadow: '0 2px 4px rgba(0, 0, 0, 0.1)',
  },
  title: {
    margin: 0,
    fontSize: '2rem',
    fontWeight: '700',
    color: '#333',
  },
  subtitle: {
    margin: '0.5rem 0 0 0',
    fontSize: '1rem',
    color: '#6c757d',
  },
  main: {
    maxWidth: '1200px',
    margin: '0 auto',
    padding: '2rem',
  },
  formSection: {
    marginBottom: '2rem',
  },
  resultsSection: {
    display: 'flex',
    flexDirection: 'column',
    gap: '1.5rem',
  },
  spacer: {
    height: '1rem',
  },
  emptyState: {
    textAlign: 'center',
    padding: '4rem 2rem',
    backgroundColor: '#fff',
    borderRadius: '8px',
    border: '2px dashed #ddd',
  },
  emptyText: {
    color: '#6c757d',
    fontSize: '1rem',
  },
};

export default App;
