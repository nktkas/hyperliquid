/**
 * Shared error types for Hyperliquid API responses.
 * @module
 */

import { HyperliquidError } from "../_base.ts";

/** Thrown when the API returns an error response. */
export class ApiRequestError extends HyperliquidError {
  /** Raw API response that contains the error. */
  readonly response: unknown;

  /**
   * @param response Raw API response that contains the error.
   * @param message Human-readable error message extracted from the response.
   */
  constructor(response: unknown, message?: string) {
    super(message ?? "An unknown error occurred while processing an API request. See `response` for more details.");
    this.name = "ApiRequestError";
    this.response = response;
  }
}
