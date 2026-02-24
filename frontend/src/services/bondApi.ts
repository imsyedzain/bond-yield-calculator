/**
 * Bond Calculator API Client
 *
 * Handles communication with the NestJS backend.
 * Implements comprehensive error handling for different failure scenarios.
 *
 * Interview Note: This demonstrates proper API client design:
 * - Typed requests and responses
 * - Comprehensive error handling
 * - Clear separation of error types
 * - Timeout handling
 * - Network vs API error distinction
 */

import type {
  BondCalculationRequest,
  BondCalculationResult,
} from '../types/bond.types';

/**
 * API Configuration
 */
const API_CONFIG = {
  /** Base URL for backend API */
  BASE_URL: import.meta.env.VITE_API_BASE_URL || 'http://localhost:3000',

  /** Request timeout in milliseconds */
  TIMEOUT_MS: 10000,

  /** Content type for JSON requests */
  CONTENT_TYPE: 'application/json',
} as const;

/**
 * Custom error class for API errors
 *
 * Provides additional context beyond standard Error.
 */
export class ApiError extends Error {
  constructor(
    message: string,
    public statusCode?: number,
    public details?: unknown,
  ) {
    super(message);
    this.name = 'ApiError';

    // Maintains proper stack trace for where error was thrown (V8 only)
    if (typeof (Error as any).captureStackTrace === 'function') {
      (Error as any).captureStackTrace(this, ApiError);
    }
  }
}

/**
 * Custom error class for network errors
 *
 * Thrown when network request fails (offline, timeout, etc.)
 */
export class NetworkError extends Error {
  constructor(message: string, public originalError?: Error) {
    super(message);
    this.name = 'NetworkError';

    if (typeof (Error as any).captureStackTrace === 'function') {
      (Error as any).captureStackTrace(this, NetworkError);
    }
  }
}

/**
 * Custom error class for validation errors
 *
 * Thrown when server returns 400 Bad Request (validation failure)
 */
export class ValidationError extends ApiError {
  constructor(message: string, public validationErrors?: Record<string, string[]>) {
    super(message, 400, validationErrors);
    this.name = 'ValidationError';

    if (typeof (Error as any).captureStackTrace === 'function') {
      (Error as any).captureStackTrace(this, ValidationError);
    }
  }
}

/**
 * Create an AbortController with timeout
 *
 * Automatically aborts request after specified timeout.
 *
 * @param timeoutMs - Timeout in milliseconds
 * @returns AbortController that will abort after timeout
 */
function createTimeoutController(timeoutMs: number): AbortController {
  const controller = new AbortController();

  setTimeout(() => {
    controller.abort();
  }, timeoutMs);

  return controller;
}

/**
 * Parse error response from API
 *
 * Attempts to extract error message from various response formats.
 *
 * @param response - Failed HTTP response
 * @returns Error message string
 */
async function parseErrorResponse(response: Response): Promise<string> {
  try {
    const contentType = response.headers.get('content-type');

    // Try to parse as JSON
    if (contentType?.includes('application/json')) {
      const errorData = await response.json();

      // NestJS error format
      if (errorData.message) {
        return Array.isArray(errorData.message)
          ? errorData.message.join(', ')
          : errorData.message;
      }

      // Generic error format
      if (errorData.error) {
        return errorData.error;
      }
    }

    // Fall back to text
    const errorText = await response.text();
    return errorText || `HTTP ${response.status}: ${response.statusText}`;
  } catch {
    // If we can't parse the error, return generic message
    return `HTTP ${response.status}: ${response.statusText}`;
  }
}

/**
 * Calculate bond metrics via API
 *
 * Sends bond parameters to backend and returns calculated metrics.
 *
 * Error Handling:
 * - NetworkError: Network issues, timeout, offline
 * - ValidationError: Invalid input data (400)
 * - ApiError: Server errors (500), other HTTP errors
 *
 * @param data - Bond calculation parameters
 * @returns Promise resolving to bond calculation results
 * @throws {NetworkError} Network request failed
 * @throws {ValidationError} Input validation failed (400)
 * @throws {ApiError} Server returned error response
 *
 * @example
 * try {
 *   const result = await calculateBond({
 *     faceValue: 1000,
 *     annualCouponRate: 5,
 *     marketPrice: 950,
 *     yearsToMaturity: 10,
 *     couponFrequency: 'semi-annual'
 *   });
 *   console.log('YTM:', result.yieldToMaturity);
 * } catch (error) {
 *   if (error instanceof ValidationError) {
 *     // Handle validation errors
 *   } else if (error instanceof NetworkError) {
 *     // Handle network errors
 *   } else {
 *     // Handle other errors
 *   }
 * }
 */
export async function calculateBond(
  data: BondCalculationRequest,
): Promise<BondCalculationResult> {
  // Create abort controller with timeout
  const controller = createTimeoutController(API_CONFIG.TIMEOUT_MS);

  try {
    // Make API request
    const response = await fetch(`${API_CONFIG.BASE_URL}/bond/calculate`, {
      method: 'POST',
      headers: {
        'Content-Type': API_CONFIG.CONTENT_TYPE,
      },
      body: JSON.stringify(data),
      signal: controller.signal,
    });

    // Handle successful response
    if (response.ok) {
      return await response.json();
    }

    // Handle error responses
    const errorMessage = await parseErrorResponse(response);

    // Validation error (400 Bad Request)
    if (response.status === 400) {
      throw new ValidationError(errorMessage);
    }

    // Other API errors (500, 404, etc.)
    throw new ApiError(errorMessage, response.status);
  } catch (error) {
    // Handle network-level errors
    if (error instanceof TypeError) {
      // Network request failed (offline, CORS, etc.)
      throw new NetworkError(
        'Unable to connect to server. Please check your internet connection.',
        error,
      );
    }

    if (error instanceof DOMException && error.name === 'AbortError') {
      // Request timed out
      throw new NetworkError(
        `Request timed out after ${API_CONFIG.TIMEOUT_MS / 1000} seconds. Please try again.`,
      );
    }

    // Re-throw custom errors (ValidationError, ApiError)
    if (error instanceof ApiError || error instanceof NetworkError) {
      throw error;
    }

    // Unknown error
    throw new ApiError(
      error instanceof Error ? error.message : 'An unexpected error occurred',
    );
  }
}

/**
 * Check if API is reachable
 *
 * Useful for health checks and connection testing.
 *
 * @returns Promise resolving to true if API is reachable, false otherwise
 */
export async function checkApiHealth(): Promise<boolean> {
  try {
    const controller = createTimeoutController(5000); // 5 second timeout

    const response = await fetch(`${API_CONFIG.BASE_URL}/health`, {
      method: 'GET',
      signal: controller.signal,
    });

    return response.ok;
  } catch {
    return false;
  }
}
