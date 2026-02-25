/**
 * Error types and utilities for Exchange API responses.
 * @module
 */

import { HyperliquidError } from "../../../../_base.ts";

// ============================================================
// Type Utilities
// ============================================================

// deno-lint-ignore ban-types
type Prettify<T> = { [K in keyof T]: T[K] } & {};

/** Exclude error variants from response type. */
export type ExcludeErrorResponse<T> = T extends { status: "err" } ? never // with error status
  : T extends { response: { data: { statuses: ReadonlyArray<infer S> } } } // with multiple statuses
    ? Exclude<S, { error: unknown }> extends never ? never
    : Prettify<
      Omit<T, "response"> & {
        response: Prettify<Omit<T["response"], "data"> & { data: { statuses: Array<Exclude<S, { error: unknown }>> } }>;
      }
    >
  : T extends { response: { data: { status: infer S } } } // with single status
    ? S extends { error: unknown } ? never
    : Prettify<
      Omit<T, "response"> & {
        response: Prettify<Omit<T["response"], "data"> & { data: { status: Exclude<S, { error: unknown }> } }>;
      }
    >
  : T;

// ============================================================
// Error Classes
// ============================================================

/** Thrown when Exchange API returns an error response. */
export class ApiRequestError extends HyperliquidError {
  readonly response: unknown;

  /**
   * @param response Raw API response that contains the error
   */
  constructor(response: unknown) {
    const message = extractErrorMessage(response) ||
      "An unknown error occurred while processing an API request. See `response` for more details.";
    super(message);
    this.name = "ApiRequestError";
    this.response = response;
  }
}

// ============================================================
// Error Detection (Duck Typing)
// ============================================================

/** Check if value has an error property. */
function hasError(value: unknown): value is { error: string } {
  return typeof value === "object" && value !== null &&
    "error" in value && typeof value.error === "string";
}

/** Check if response has error status. */
function hasErrorStatus(response: unknown): response is { status: "err"; response: string } {
  return typeof response === "object" && response !== null &&
    "status" in response && response.status === "err";
}

/** Check if response has statuses array with errors. */
function hasStatusesWithErrors(response: unknown): boolean {
  if (typeof response !== "object" || response === null) return false;
  const r = response as { response?: { data?: { statuses?: unknown[] } } };
  const statuses = r.response?.data?.statuses;
  return Array.isArray(statuses) && statuses.some(hasError);
}

/** Check if response has single status with error. */
function hasSingleStatusWithError(response: unknown): boolean {
  if (typeof response !== "object" || response === null) return false;
  const r = response as { response?: { data?: { status?: unknown } } };
  return hasError(r.response?.data?.status);
}

/** Extract error message from response using duck typing. */
function extractErrorMessage(response: unknown): string | undefined {
  if (hasErrorStatus(response)) {
    return response.response;
  }

  const r = response as { response?: { data?: { statuses?: unknown[]; status?: unknown } } };

  if (Array.isArray(r.response?.data?.statuses)) {
    const errors = r.response.data.statuses.reduce<string[]>((acc, status, index) => {
      if (hasError(status)) acc.push(`Order ${index}: ${status.error}`);
      return acc;
    }, []);
    if (errors.length > 0) return errors.join(", ");
  }

  if (hasError(r.response?.data?.status)) {
    return r.response.data.status.error;
  }

  return undefined;
}

// ============================================================
// Assertions
// ============================================================

/**
 * Assert that response is successful, throw ApiRequestError otherwise.
 *
 * @param response Raw API response to validate
 *
 * @throws {ApiRequestError} If the response contains an error
 */
export function assertSuccessResponse(response: unknown): void {
  if (hasErrorStatus(response) || hasStatusesWithErrors(response) || hasSingleStatusWithError(response)) {
    throw new ApiRequestError(response);
  }
}
