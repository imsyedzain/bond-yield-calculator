export const YTM_CALCULATION = {
  DEFAULT_TOLERANCE: 0.0001,
  MAX_ITERATIONS: 100,
  LOWER_BOUND: 0,
  UPPER_BOUND: 0.5,
} as const;

export const DECIMAL_PRECISION = {
  YIELD: 4,

  CURRENCY: 2,
} as const;


export const BOND_THRESHOLDS = {
  
  PAR_TOLERANCE: 0.0001,
} as const;


export const PAYMENT_FREQUENCY = {
  ANNUAL: {
    PAYMENTS_PER_YEAR: 1,
    MONTHS_PER_PERIOD: 12,
  },
  SEMI_ANNUAL: {
    PAYMENTS_PER_YEAR: 2,
    MONTHS_PER_PERIOD: 6,
  },
} as const;

export const VALIDATION_LIMITS = {
  MIN_PERCENTAGE: 0,

  MAX_PERCENTAGE: 100,

  MIN_POSITIVE_VALUE: 0,
} as const;


export const ERROR_MESSAGES = {
  INVALID_FACE_VALUE: 'Face value must be a positive number',
  INVALID_COUPON_RATE: 'Coupon rate must be between 0 and 100',
  INVALID_MARKET_PRICE: 'Market price must be a positive number',
  INVALID_YEARS: 'Years to maturity must be a positive number',
  INVALID_FREQUENCY: 'Coupon frequency must be annual or semi-annual',
  INVALID_SETTLEMENT_DATE: 'Settlement date must be in ISO format (YYYY-MM-DD)',
  YTM_NO_CONVERGENCE: 'YTM calculation did not converge within maximum iterations',
} as const;
