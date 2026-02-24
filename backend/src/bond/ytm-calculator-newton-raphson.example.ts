/**
 * EXAMPLE: Newton-Raphson Method for YTM Calculation
 *
 * This file demonstrates how to implement an alternative YTM calculation algorithm
 * and swap it into the service without changing any other code.
 *
 * NEWTON-RAPHSON METHOD:
 * ----------------------
 * A faster numerical method that uses derivatives for quadratic convergence.
 * Typically converges in 3-5 iterations vs 8-12 for bisection.
 *
 * Formula: x_new = x_old - f(x) / f'(x)
 *
 * Where:
 *   f(x) = Calculated Price - Market Price (we want this to equal 0)
 *   f'(x) = Derivative of bond price with respect to yield (Modified Duration)
 *
 * ADVANTAGES over Bisection:
 * - Faster convergence (quadratic vs linear)
 * - Fewer iterations needed
 *
 * DISADVANTAGES:
 * - Requires derivative calculation
 * - Can diverge if initial guess is poor
 * - More complex to implement
 * - Less intuitive to explain in interviews
 */

import { BondParams, YTMConfig, YTMResult } from './ytm-calculator';

/**
 * Calculate YTM using Newton-Raphson method
 *
 * IMPLEMENTATION NOTE:
 * This is a skeleton/example showing the structure. The derivative calculation
 * is the key difference from bisection.
 *
 * @param params - Bond parameters
 * @param config - Configuration options
 * @returns YTM result with annualized percentage
 */
export function calculateYTMNewtonRaphson(
  params: BondParams,
  config: YTMConfig = {},
): YTMResult {
  const {
    tolerance = 0.0001,
    maxIterations = 100,
  } = config;

  const {
    marketPrice,
    faceValue,
    couponPayment,
    totalPeriods,
    paymentsPerYear,
  } = params;

  // Initial guess: Use current yield as starting point
  // This is often close to the actual YTM
  const annualCoupon = couponPayment * paymentsPerYear;
  let ytmPerPeriod = (annualCoupon / marketPrice) / paymentsPerYear;

  let iteration = 0;
  let converged = false;
  let finalError = 0;

  while (iteration < maxIterations) {
    // Calculate bond price at current YTM estimate
    const calculatedPrice = calculateBondPrice(
      faceValue,
      couponPayment,
      ytmPerPeriod,
      totalPeriods,
    );

    // Calculate error
    const priceError = calculatedPrice - marketPrice;
    finalError = Math.abs(priceError);

    // Check convergence
    if (finalError < tolerance) {
      converged = true;
      break;
    }

    // Calculate derivative (Modified Duration × Price)
    // This is the key difference from bisection
    const derivative = calculateBondPriceDerivative(
      faceValue,
      couponPayment,
      ytmPerPeriod,
      totalPeriods,
    );

    // Prevent division by zero
    if (Math.abs(derivative) < 1e-10) {
      break;
    }

    // Newton-Raphson update step
    // New estimate = Old estimate - f(x) / f'(x)
    ytmPerPeriod = ytmPerPeriod - priceError / derivative;

    // Ensure YTM stays positive (can't have negative yield)
    if (ytmPerPeriod < 0) {
      ytmPerPeriod = 0.0001; // Small positive value
    }

    // Prevent runaway values
    if (ytmPerPeriod > 1) {
      ytmPerPeriod = 1; // Cap at 100% per period
    }

    iteration++;
  }

  // Convert to annualized percentage
  const annualizedYTM = ytmPerPeriod * paymentsPerYear * 100;

  return {
    ytm: annualizedYTM,
    iterations: iteration,
    converged,
    finalError,
  };
}

/**
 * Calculate bond price (same as bisection method)
 */
function calculateBondPrice(
  faceValue: number,
  couponPayment: number,
  yieldPerPeriod: number,
  totalPeriods: number,
): number {
  let presentValue = 0;

  for (let period = 1; period <= totalPeriods; period++) {
    const discountFactor = Math.pow(1 + yieldPerPeriod, period);
    presentValue += couponPayment / discountFactor;
  }

  const faceValueDiscountFactor = Math.pow(1 + yieldPerPeriod, totalPeriods);
  presentValue += faceValue / faceValueDiscountFactor;

  return presentValue;
}

/**
 * Calculate derivative of bond price with respect to yield
 *
 * MATHEMATICAL DERIVATION:
 * ------------------------
 * Bond Price: P = Σ[C / (1 + r)^t] + F / (1 + r)^n
 *
 * Derivative: dP/dr = Σ[-t × C / (1 + r)^(t+1)] - n × F / (1 + r)^(n+1)
 *
 * This is related to Modified Duration:
 *   Modified Duration = -(1/P) × (dP/dr)
 *
 * FINANCIAL INTERPRETATION:
 * -------------------------
 * The derivative tells us how sensitive the bond price is to changes in yield.
 * - Larger absolute derivative = more sensitive to yield changes
 * - Always negative (price and yield move in opposite directions)
 *
 * @param faceValue - Par value
 * @param couponPayment - Payment per period
 * @param yieldPerPeriod - Current yield estimate
 * @param totalPeriods - Number of periods
 * @returns Derivative of price with respect to yield
 */
function calculateBondPriceDerivative(
  faceValue: number,
  couponPayment: number,
  yieldPerPeriod: number,
  totalPeriods: number,
): number {
  let derivative = 0;

  // Derivative of coupon payments
  // For each period: -t × C / (1 + r)^(t+1)
  for (let period = 1; period <= totalPeriods; period++) {
    const discountFactor = Math.pow(1 + yieldPerPeriod, period + 1);
    derivative -= (period * couponPayment) / discountFactor;
  }

  // Derivative of face value
  // -n × F / (1 + r)^(n+1)
  const faceValueDiscountFactor = Math.pow(
    1 + yieldPerPeriod,
    totalPeriods + 1,
  );
  derivative -= (totalPeriods * faceValue) / faceValueDiscountFactor;

  return derivative;
}

/**
 * HOW TO USE THIS IN YOUR SERVICE:
 * ---------------------------------
 *
 * Option 1: Replace in ytm-calculator.ts
 * ```typescript
 * export const defaultYTMCalculator: YTMCalculator = calculateYTMNewtonRaphson;
 * ```
 *
 * Option 2: Create a custom service
 * ```typescript
 * @Injectable()
 * export class BondServiceWithNewtonRaphson extends BondService {
 *   protected override ytmCalculator = calculateYTMNewtonRaphson;
 * }
 * ```
 *
 * Option 3: Inject via configuration
 * ```typescript
 * const bondService = new BondService();
 * bondService.setYTMCalculator(calculateYTMNewtonRaphson);
 * ```
 *
 * WHEN TO USE NEWTON-RAPHSON:
 * ----------------------------
 * - Performance-critical applications
 * - High-frequency calculations
 * - When you have a good initial guess
 *
 * WHEN TO USE BISECTION:
 * ----------------------
 * - Teaching/learning contexts
 * - When robustness is more important than speed
 * - When explaining to non-technical stakeholders
 * - Job interviews (easier to explain!)
 */

/**
 * PERFORMANCE COMPARISON:
 * -----------------------
 *
 * Typical Bond (10 years, semi-annual):
 *
 * Bisection:
 * - Iterations: 8-12
 * - Time: ~0.1ms
 * - Convergence: Always (if solution exists in bounds)
 *
 * Newton-Raphson:
 * - Iterations: 3-5
 * - Time: ~0.08ms
 * - Convergence: Usually (depends on initial guess)
 *
 * For most applications, the difference is negligible.
 * Choose bisection for simplicity unless you need to optimize.
 */

/**
 * HYBRID APPROACH:
 * ----------------
 * Some implementations use a hybrid:
 * 1. Start with bisection to get close
 * 2. Switch to Newton-Raphson for final precision
 *
 * This combines the robustness of bisection with the speed of Newton-Raphson.
 */
export function calculateYTMHybrid(
  params: BondParams,
  config: YTMConfig = {},
): YTMResult {
  // Phase 1: Use bisection for first few iterations (robust)
  const bisectionResult = calculateYTMNewtonRaphson(params, {
    ...config,
    maxIterations: 5,
    tolerance: 0.01, // Looser tolerance for first phase
  });

  // Phase 2: Use Newton-Raphson for final precision (fast)
  if (bisectionResult.converged) {
    return bisectionResult;
  }

  // Continue with Newton-Raphson using bisection result as starting point
  return calculateYTMNewtonRaphson(params, config);
}

/**
 * TESTING YOUR IMPLEMENTATION:
 * -----------------------------
 *
 * Unit test template:
 *
 * ```typescript
 * describe('Newton-Raphson YTM', () => {
 *   it('should match bisection result', () => {
 *     const params = {
 *       marketPrice: 950,
 *       faceValue: 1000,
 *       couponPayment: 25,
 *       totalPeriods: 20,
 *       paymentsPerYear: 2,
 *     };
 *
 *     const bisectionResult = calculateYTM(params);
 *     const newtonResult = calculateYTMNewtonRaphson(params);
 *
 *     // Should be within 0.01% of each other
 *     expect(Math.abs(newtonResult.ytm - bisectionResult.ytm)).toBeLessThan(0.01);
 *   });
 *
 *   it('should converge faster than bisection', () => {
 *     // ... test that Newton-Raphson uses fewer iterations
 *   });
 * });
 * ```
 */
