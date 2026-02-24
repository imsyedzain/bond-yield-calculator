/**
 * Date Utility Functions for Bond Cashflow Calculations
 *
 * This module provides deterministic date calculations for bond payment schedules.
 * All functions are pure and do not depend on system time unless explicitly provided.
 */

/**
 * Payment frequency types
 */
export type PaymentFrequency = 'annual' | 'semi-annual';

/**
 * Add months to a date
 *
 * This function adds a specified number of months to a date while handling
 * edge cases like month-end dates and leap years correctly.
 *
 * EXAMPLES:
 * - addMonths('2024-01-31', 1) → '2024-02-29' (leap year, end of Feb)
 * - addMonths('2024-01-15', 6) → '2024-07-15' (simple case)
 * - addMonths('2024-01-31', 12) → '2025-01-31' (year rollover)
 *
 * @param dateString - ISO date string (YYYY-MM-DD)
 * @param months - Number of months to add
 * @returns ISO date string (YYYY-MM-DD)
 */
export function addMonths(dateString: string, months: number): string {
  const date = new Date(dateString + 'T00:00:00Z'); // Parse as UTC to avoid timezone issues

  // Get current day of month (important for month-end handling)
  const day = date.getUTCDate();

  // Add months
  date.setUTCMonth(date.getUTCMonth() + months);

  // Handle month-end edge case
  // If we started on day 31 and land in a month with fewer days,
  // JavaScript automatically rolls over to the next month
  // We need to handle this by setting to the last day of the target month
  if (date.getUTCDate() !== day) {
    // We rolled over, so set to last day of previous month
    date.setUTCDate(0); // Day 0 = last day of previous month
  }

  return formatDateISO(date);
}

/**
 * Calculate payment dates for a bond
 *
 * This function generates all payment dates for a bond given:
 * - A settlement/start date
 * - Payment frequency
 * - Number of periods
 *
 * LOGIC:
 * - For annual payments: payments occur every 12 months
 * - For semi-annual payments: payments occur every 6 months
 *
 * EXAMPLE (Semi-Annual):
 * - Start: 2024-01-15
 * - Periods: 4 (2 years × 2)
 * - Dates: 2024-07-15, 2025-01-15, 2025-07-15, 2026-01-15
 *
 * @param settlementDate - Date when bond is purchased (YYYY-MM-DD)
 * @param frequency - Payment frequency
 * @param totalPeriods - Total number of payment periods
 * @returns Array of payment dates (ISO strings)
 */
export function calculatePaymentDates(
  settlementDate: string,
  frequency: PaymentFrequency,
  totalPeriods: number,
): string[] {
  // Determine months between payments
  const monthsPerPeriod = frequency === 'annual' ? 12 : 6;

  const paymentDates: string[] = [];

  // Generate each payment date
  for (let period = 1; period <= totalPeriods; period++) {
    const monthsToAdd = period * monthsPerPeriod;
    const paymentDate = addMonths(settlementDate, monthsToAdd);
    paymentDates.push(paymentDate);
  }

  return paymentDates;
}

/**
 * Get the current date as ISO string (YYYY-MM-DD)
 *
 * This function exists to centralize "today" logic, making it easy to
 * mock in tests or override for deterministic behavior.
 *
 * @returns Current date as ISO string
 */
export function getCurrentDate(): string {
  const now = new Date();
  return formatDateISO(now);
}

/**
 * Format a Date object as ISO date string (YYYY-MM-DD)
 *
 * This ensures consistent date formatting throughout the application.
 * Uses UTC to avoid timezone-related issues.
 *
 * @param date - Date object to format
 * @returns ISO date string (YYYY-MM-DD)
 */
export function formatDateISO(date: Date): string {
  const year = date.getUTCFullYear();
  const month = String(date.getUTCMonth() + 1).padStart(2, '0');
  const day = String(date.getUTCDate()).padStart(2, '0');

  return `${year}-${month}-${day}`;
}

/**
 * Parse ISO date string to Date object
 *
 * Parses as UTC to avoid timezone issues.
 *
 * @param dateString - ISO date string (YYYY-MM-DD)
 * @returns Date object (UTC)
 */
export function parseISODate(dateString: string): Date {
  return new Date(dateString + 'T00:00:00Z');
}

/**
 * Calculate the number of days between two dates
 *
 * Useful for accrued interest calculations or day count conventions.
 *
 * @param fromDate - Start date (YYYY-MM-DD)
 * @param toDate - End date (YYYY-MM-DD)
 * @returns Number of days (integer)
 */
export function daysBetween(fromDate: string, toDate: string): number {
  const from = parseISODate(fromDate);
  const to = parseISODate(toDate);

  const milliseconds = to.getTime() - from.getTime();
  const days = Math.floor(milliseconds / (1000 * 60 * 60 * 24));

  return days;
}

/**
 * Validate ISO date string format
 *
 * Checks if a string is a valid ISO date (YYYY-MM-DD).
 *
 * @param dateString - String to validate
 * @returns True if valid ISO date
 */
export function isValidISODate(dateString: string): boolean {
  // Check format with regex
  const isoDateRegex = /^\d{4}-\d{2}-\d{2}$/;
  if (!isoDateRegex.test(dateString)) {
    return false;
  }

  // Check if it's a valid date
  const date = parseISODate(dateString);
  return !isNaN(date.getTime());
}

/**
 * Get payment frequency as months per period
 *
 * @param frequency - Payment frequency
 * @returns Number of months between payments
 */
export function getMonthsPerPeriod(frequency: PaymentFrequency): number {
  return frequency === 'annual' ? 12 : 6;
}

/**
 * Get payment frequency as payments per year
 *
 * @param frequency - Payment frequency
 * @returns Number of payments per year
 */
export function getPaymentsPerYear(frequency: PaymentFrequency): number {
  return frequency === 'annual' ? 1 : 2;
}
