/**
 * Form Validation Utilities
 *
 * Pure validation functions with no UI dependencies.
 * Easy to test and reuse across different forms.
 *
 * Interview Note: These are pure functions that:
 * - Take primitive inputs (strings, numbers)
 * - Return predictable outputs (no side effects)
 * - Are easily testable in isolation
 * - Can be reused across different components
 */

/**
 * Validation Constants
 *
 * Centralized validation rules for consistency.
 */
export const VALIDATION_RULES = {
  /** Minimum percentage value (inclusive) */
  MIN_PERCENTAGE: 0,

  /** Maximum percentage value (inclusive) */
  MAX_PERCENTAGE: 100,

  /** Regex pattern for ISO date format (YYYY-MM-DD) */
  ISO_DATE_PATTERN: /^\d{4}-\d{2}-\d{2}$/,
} as const;

/**
 * Result of a validation check
 *
 * @property isValid - Whether the validation passed
 * @property error - Optional error message if validation failed
 */
export interface ValidationResult {
  isValid: boolean;
  error?: string;
}

/**
 * Helper: Check if a string value is empty
 *
 * @param value - String to check
 * @returns true if value is null, undefined, or whitespace-only
 */
function isEmpty(value: string): boolean {
  return !value || value.trim() === '';
}

/**
 * Helper: Validate that a value is a valid number
 *
 * @param value - String to parse
 * @param fieldName - Name of field for error messages
 * @returns ValidationResult with success or error
 */
function validateNumericFormat(
  value: string,
  fieldName: string,
): ValidationResult {
  if (isEmpty(value)) {
    return {
      isValid: false,
      error: `${fieldName} is required`,
    };
  }

  const parsedNumber = parseFloat(value);

  if (isNaN(parsedNumber)) {
    return {
      isValid: false,
      error: `${fieldName} must be a valid number`,
    };
  }

  return { isValid: true };
}

/**
 * Validate a positive number field (> 0)
 *
 * Use cases: face value, market price, years to maturity
 *
 * @param value - String input from form
 * @param fieldName - Display name for error messages
 * @returns ValidationResult indicating success or specific error
 *
 * @example
 * validatePositiveNumber('1000', 'Face value')
 * // → { isValid: true }
 *
 * validatePositiveNumber('-100', 'Face value')
 * // → { isValid: false, error: 'Face value must be greater than zero' }
 */
export function validatePositiveNumber(
  value: string,
  fieldName: string,
): ValidationResult {
  // First check if it's a valid number
  const formatValidation = validateNumericFormat(value, fieldName);
  if (!formatValidation.isValid) {
    return formatValidation;
  }

  // Then check if it's positive
  const parsedNumber = parseFloat(value);
  if (parsedNumber <= 0) {
    return {
      isValid: false,
      error: `${fieldName} must be greater than zero`,
    };
  }

  return { isValid: true };
}

/**
 * Validate a percentage field (0-100 inclusive)
 *
 * Use cases: annual coupon rate
 *
 * @param value - String input from form
 * @param fieldName - Display name for error messages
 * @returns ValidationResult indicating success or specific error
 *
 * @example
 * validatePercentage('5.5', 'Coupon rate')
 * // → { isValid: true }
 *
 * validatePercentage('150', 'Coupon rate')
 * // → { isValid: false, error: 'Coupon rate must be between 0 and 100' }
 */
export function validatePercentage(
  value: string,
  fieldName: string,
): ValidationResult {
  // First check if it's a valid number
  const formatValidation = validateNumericFormat(value, fieldName);
  if (!formatValidation.isValid) {
    return formatValidation;
  }

  // Then check if it's within percentage range
  const parsedNumber = parseFloat(value);
  const { MIN_PERCENTAGE, MAX_PERCENTAGE } = VALIDATION_RULES;

  if (parsedNumber < MIN_PERCENTAGE || parsedNumber > MAX_PERCENTAGE) {
    return {
      isValid: false,
      error: `${fieldName} must be between ${MIN_PERCENTAGE} and ${MAX_PERCENTAGE}`,
    };
  }

  return { isValid: true };
}

/**
 * Validate optional ISO date field (YYYY-MM-DD)
 *
 * Use cases: settlement date
 *
 * This validator allows empty values (optional field).
 * If provided, the date must be in ISO format and represent a valid calendar date.
 *
 * @param value - String input from form
 * @returns ValidationResult indicating success or specific error
 *
 * @example
 * validateDate('')
 * // → { isValid: true } (empty is valid)
 *
 * validateDate('2024-01-15')
 * // → { isValid: true }
 *
 * validateDate('2024-13-45')
 * // → { isValid: false, error: 'Invalid date' }
 *
 * validateDate('01/15/2024')
 * // → { isValid: false, error: 'Date must be in format YYYY-MM-DD' }
 */
export function validateDate(value: string): ValidationResult {
  // Empty is valid (optional field)
  if (isEmpty(value)) {
    return { isValid: true };
  }

  // Check format matches ISO pattern
  const { ISO_DATE_PATTERN } = VALIDATION_RULES;
  if (!ISO_DATE_PATTERN.test(value)) {
    return {
      isValid: false,
      error: 'Date must be in format YYYY-MM-DD',
    };
  }

  // Check if it's a valid calendar date
  const parsedDate = new Date(value);
  if (isNaN(parsedDate.getTime())) {
    return {
      isValid: false,
      error: 'Invalid date',
    };
  }

  return { isValid: true };
}

/**
 * Bond form input data (string format from controlled components)
 *
 * All numeric fields are strings because they come from HTML input elements.
 * They will be validated and converted to numbers before API submission.
 */
export interface BondFormData {
  /** Face value / par value of the bond */
  faceValue: string;

  /** Annual coupon rate as a percentage (0-100) */
  annualCouponRate: string;

  /** Current market price of the bond */
  marketPrice: string;

  /** Years remaining until bond maturity */
  yearsToMaturity: string;

  /** How often coupons are paid */
  couponFrequency: 'annual' | 'semi-annual';

  /** Optional settlement date in ISO format */
  settlementDate: string;
}

/**
 * Validation errors for bond form fields
 *
 * Each field is optional - only populated if validation fails.
 */
export interface BondFormErrors {
  faceValue?: string;
  annualCouponRate?: string;
  marketPrice?: string;
  yearsToMaturity?: string;
  settlementDate?: string;
}

/**
 * Result of validating the entire bond form
 */
export interface BondFormValidation {
  /** Whether all fields passed validation */
  isValid: boolean;

  /** Map of field names to error messages (only for failed validations) */
  errors: BondFormErrors;
}

/**
 * Validate all bond form fields
 *
 * Runs validation on each field independently and collects all errors.
 * Returns a single validation result with all field errors.
 *
 * Interview Note: This demonstrates the "Composite Validator" pattern:
 * - Each field has its own validation function
 * - This function orchestrates all field validations
 * - Errors are collected in a single object
 * - All validations run (doesn't short-circuit on first error)
 *
 * @param data - Form data to validate
 * @returns Validation result with isValid flag and error map
 *
 * @example
 * const { isValid, errors } = validateBondForm(formData);
 * if (!isValid) {
 *   // errors = { faceValue: 'Face value is required', ... }
 *   setFormErrors(errors);
 * }
 */
export function validateBondForm(data: BondFormData): BondFormValidation {
  const errors: BondFormErrors = {};

  // Validate face value (required positive number)
  const faceValueValidation = validatePositiveNumber(data.faceValue, 'Face value');
  if (!faceValueValidation.isValid) {
    errors.faceValue = faceValueValidation.error;
  }

  // Validate annual coupon rate (required percentage 0-100)
  const couponRateValidation = validatePercentage(
    data.annualCouponRate,
    'Annual coupon rate',
  );
  if (!couponRateValidation.isValid) {
    errors.annualCouponRate = couponRateValidation.error;
  }

  // Validate market price (required positive number)
  const marketPriceValidation = validatePositiveNumber(
    data.marketPrice,
    'Market price',
  );
  if (!marketPriceValidation.isValid) {
    errors.marketPrice = marketPriceValidation.error;
  }

  // Validate years to maturity (required positive number)
  const yearsValidation = validatePositiveNumber(
    data.yearsToMaturity,
    'Years to maturity',
  );
  if (!yearsValidation.isValid) {
    errors.yearsToMaturity = yearsValidation.error;
  }

  // Validate settlement date (optional ISO date)
  const dateValidation = validateDate(data.settlementDate);
  if (!dateValidation.isValid) {
    errors.settlementDate = dateValidation.error;
  }

  // Form is valid only if there are no errors
  return {
    isValid: Object.keys(errors).length === 0,
    errors,
  };
}

/**
 * Format number as USD currency
 *
 * Uses Intl.NumberFormat for proper localization.
 * Always shows 2 decimal places.
 *
 * @param value - Numeric value to format
 * @returns Formatted currency string (e.g., "$1,234.56")
 *
 * @example
 * formatCurrency(1234.56)
 * // → "$1,234.56"
 *
 * formatCurrency(1000000)
 * // → "$1,000,000.00"
 */
export function formatCurrency(value: number): string {
  return new Intl.NumberFormat('en-US', {
    style: 'currency',
    currency: 'USD',
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  }).format(value);
}

/**
 * Format number as percentage
 *
 * @param value - Numeric value (e.g., 5.25 for 5.25%)
 * @param decimals - Number of decimal places (default: 2)
 * @returns Formatted percentage string (e.g., "5.25%")
 *
 * @example
 * formatPercentage(5.25)
 * // → "5.25%"
 *
 * formatPercentage(5.12345, 4)
 * // → "5.1235%"
 */
export function formatPercentage(value: number, decimals: number = 2): string {
  return value.toFixed(decimals) + '%';
}
