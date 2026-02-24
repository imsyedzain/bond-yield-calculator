/**
 * Yield to Maturity (YTM) Calculator using the Bisection Method
 *
 * This module provides an isolated implementation of YTM calculation that can be
 * easily swapped with alternative algorithms (e.g., Newton-Raphson, Secant method).
 */

/**
 * Configuration for YTM calculation
 */
export interface YTMConfig {
  /** Convergence tolerance for price difference (default: 0.0001) */
  tolerance?: number;
  /** Maximum number of iterations to prevent infinite loops (default: 100) */
  maxIterations?: number;
  /** Initial lower bound for YTM search (default: 0) */
  lowerBound?: number;
  /** Initial upper bound for YTM search (default: 0.5 = 50% per period) */
  upperBound?: number;
}

/**
 * Parameters for bond price calculation
 */
export interface BondParams {
  /** Current market price of the bond */
  marketPrice: number;
  /** Face value (par value) of the bond */
  faceValue: number;
  /** Coupon payment per period */
  couponPayment: number;
  /** Total number of payment periods */
  totalPeriods: number;
  /** Number of payment periods per year (1 for annual, 2 for semi-annual) */
  paymentsPerYear: number;
}

/**
 * Result of YTM calculation
 */
export interface YTMResult {
  /** Calculated Yield to Maturity as annualized percentage */
  ytm: number;
  /** Number of iterations performed */
  iterations: number;
  /** Whether the algorithm converged within tolerance */
  converged: boolean;
  /** Final price difference from target */
  finalError: number;
}

/**
 * Calculate Yield to Maturity using the Bisection Method
 *
 * MATHEMATICAL BACKGROUND:
 * ------------------------
 * YTM is the discount rate that makes the present value of all future cash flows
 * equal to the current market price of the bond.
 *
 * Bond Pricing Formula:
 *   P = Σ(C / (1 + r)^t) + F / (1 + r)^n
 *
 * Where:
 *   P = Market Price (known)
 *   C = Coupon Payment (known)
 *   F = Face Value (known)
 *   r = Yield per period (unknown - what we're solving for)
 *   t = Period number (1, 2, 3, ..., n)
 *   n = Total number of periods (known)
 *
 * BISECTION METHOD:
 * -----------------
 * Since the equation cannot be solved algebraically, we use numerical methods.
 * The bisection method works by:
 *
 * 1. Start with two bounds where we know the solution lies between
 * 2. Calculate the midpoint
 * 3. Determine which half contains the solution
 * 4. Replace the appropriate bound with the midpoint
 * 5. Repeat until convergence
 *
 * KEY INSIGHT: Bond price and yield have an inverse relationship:
 *   - If YTM increases → Bond price decreases
 *   - If YTM decreases → Bond price increases
 *
 * CONVERGENCE:
 * ------------
 * The method converges when:
 *   |Calculated Price - Market Price| < Tolerance
 *
 * Time Complexity: O(log n) where n is the required precision
 * Typical convergence: 6-12 iterations for financial applications
 *
 * ADVANTAGES:
 * -----------
 * - Simple to implement and understand
 * - Guaranteed convergence (if solution exists in bounds)
 * - No derivative calculation required
 * - Robust and stable
 *
 * DISADVANTAGES:
 * --------------
 * - Slower than Newton-Raphson (linear vs quadratic convergence)
 * - Requires knowing bounds in advance
 * - Cannot handle multiple roots (not an issue for YTM)
 *
 * @param params - Bond parameters
 * @param config - Configuration options
 * @returns YTM result with annualized percentage
 */
export function calculateYTM(
  params: BondParams,
  config: YTMConfig = {},
): YTMResult {
  // Extract configuration with defaults
  const {
    tolerance = 0.0001,
    maxIterations = 100,
    lowerBound = 0,
    upperBound = 0.5,
  } = config;

  const {
    marketPrice,
    faceValue,
    couponPayment,
    totalPeriods,
    paymentsPerYear,
  } = params;

  // Initialize bounds for bisection search
  // Lower bound: 0% yield (bond never has negative yield in normal markets)
  // Upper bound: 50% per period (reasonable maximum for even distressed bonds)
  let low = lowerBound;
  let high = upperBound;

  let iteration = 0;
  let converged = false;
  let finalError = 0;
  let ytmPerPeriod = 0;

  // Bisection loop
  while (iteration < maxIterations) {
    // Calculate midpoint - our current YTM estimate
    ytmPerPeriod = (low + high) / 2;

    // Calculate what the bond price would be at this YTM
    const calculatedPrice = calculateBondPrice(
      faceValue,
      couponPayment,
      ytmPerPeriod,
      totalPeriods,
    );

    // Calculate error (difference between calculated and actual market price)
    const priceDifference = calculatedPrice - marketPrice;
    finalError = Math.abs(priceDifference);

    // Check convergence: Have we found a YTM that prices the bond correctly?
    if (finalError < tolerance) {
      converged = true;
      break;
    }

    // Decide which half of the search space to keep
    //
    // LOGIC:
    // If calculated price > market price:
    //   → YTM is too LOW (bond is overpriced at this rate)
    //   → Need HIGHER YTM to reduce present value
    //   → Move lower bound UP
    //
    // If calculated price < market price:
    //   → YTM is too HIGH (bond is underpriced at this rate)
    //   → Need LOWER YTM to increase present value
    //   → Move upper bound DOWN
    if (priceDifference > 0) {
      // Calculated price too high → YTM too low → increase lower bound
      low = ytmPerPeriod;
    } else {
      // Calculated price too low → YTM too high → decrease upper bound
      high = ytmPerPeriod;
    }

    iteration++;
  }

  // If we exit the loop without converging, use the best estimate we have
  if (!converged) {
    ytmPerPeriod = (low + high) / 2;
  }

  // Convert period rate to annualized percentage
  // Example: If semi-annual YTM per period is 2.5%, annualized is 2.5% × 2 = 5%
  const annualizedYTM = ytmPerPeriod * paymentsPerYear * 100;

  return {
    ytm: annualizedYTM,
    iterations: iteration,
    converged,
    finalError,
  };
}

/**
 * Calculate the theoretical price of a bond given a yield rate
 *
 * This is the core bond pricing formula:
 *   Price = PV(Coupons) + PV(Face Value)
 *
 * Where:
 *   PV(Coupons) = Σ[C / (1 + r)^t] for t = 1 to n
 *   PV(Face Value) = F / (1 + r)^n
 *
 * FINANCIAL INTERPRETATION:
 * -------------------------
 * The bond price is the sum of:
 * 1. Present value of all future coupon payments
 * 2. Present value of the face value received at maturity
 *
 * Each cash flow is discounted by the yield rate to reflect time value of money.
 * Higher yield = lower present value (cash flows worth less today)
 *
 * @param faceValue - Par value of the bond
 * @param couponPayment - Payment per period
 * @param yieldPerPeriod - Discount rate per period (as decimal, not percentage)
 * @param totalPeriods - Number of periods until maturity
 * @returns Calculated bond price
 */
function calculateBondPrice(
  faceValue: number,
  couponPayment: number,
  yieldPerPeriod: number,
  totalPeriods: number,
): number {
  let presentValue = 0;

  // Calculate present value of all coupon payments
  // Each payment is discounted by (1 + r)^t where t is the period number
  for (let period = 1; period <= totalPeriods; period++) {
    const discountFactor = Math.pow(1 + yieldPerPeriod, period);
    presentValue += couponPayment / discountFactor;
  }

  // Add present value of face value (principal repayment at maturity)
  const faceValueDiscountFactor = Math.pow(1 + yieldPerPeriod, totalPeriods);
  presentValue += faceValue / faceValueDiscountFactor;

  return presentValue;
}

/**
 * Alternative YTM calculation interface for easy algorithm swapping
 *
 * This function signature can be preserved when switching to Newton-Raphson
 * or other numerical methods. Just replace the implementation inside.
 */
export type YTMCalculator = (
  params: BondParams,
  config?: YTMConfig,
) => YTMResult;

/**
 * Default YTM calculator (currently using bisection method)
 *
 * To switch to Newton-Raphson:
 * 1. Implement calculateYTMNewtonRaphson with same signature
 * 2. Change this export to point to the new function
 * 3. No changes needed in consuming code
 */
export const defaultYTMCalculator: YTMCalculator = calculateYTM;
