/**
 * Custom Hook: useBondCalculation
 *
 * Encapsulates all business logic for bond calculations.
 * Separates concerns: API calls, state management, error handling.
 */

import { useState } from 'react';
import { calculateBond } from '../services/bondApi';
import type {
  BondCalculationRequest,
  BondCalculationResult,
} from '../types/bond.types';

export interface UseBondCalculationResult {
  result: BondCalculationResult | null;
  loading: boolean;
  error: string | null;
  calculate: (request: BondCalculationRequest) => Promise<void>;
  reset: () => void;
}

export function useBondCalculation(): UseBondCalculationResult {
  const [result, setResult] = useState<BondCalculationResult | null>(null);
  const [loading, setLoading] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);

  const calculate = async (request: BondCalculationRequest): Promise<void> => {
    // Reset previous state
    setError(null);
    setResult(null);
    setLoading(true);

    try {
      const data = await calculateBond(request);
      setResult(data);
    } catch (err) {
      // Handle different error types
      if (err instanceof Error) {
        setError(err.message);
      } else {
        setError('An unexpected error occurred');
      }
    } finally {
      setLoading(false);
    }
  };

  const reset = (): void => {
    setResult(null);
    setError(null);
    setLoading(false);
  };

  return {
    result,
    loading,
    error,
    calculate,
    reset,
  };
}
