/**
 * Error types and utilities for Exchange API responses.
 * @module
 */

import { ApiRequestError } from "../../../_errors.ts";

export { ApiRequestError };

// ============================================================
// Detection (duck-typed)
// ============================================================

/** True if `value` has an `error` field of type string. */
function hasErrorField(value: unknown): value is { error: string } {
  return typeof value === "object" && value !== null &&
    "error" in value && typeof value.error === "string";
}

/** Top-level error shape. */
type TopLevelError = { status: "err"; response: string };

/** True if `r` matches `{ status: "err", response: string }`. */
function isTopLevelError(r: unknown): r is TopLevelError {
  return typeof r === "object" && r !== null &&
    "status" in r && r.status === "err";
}

/** Bulk error shape with array of statuses. */
type BulkError = { response: { type: string; data: { statuses: unknown[] } } };

/** True if `r` matches `{ response: { type, data: { statuses: [{ error }, ...] } } }` (any error in array). */
function isBulkError(r: unknown): r is BulkError {
  if (typeof r !== "object" || r === null) return false;
  const response = (r as { response?: { type?: unknown; data?: { statuses?: unknown[] } } }).response;
  if (typeof response?.type !== "string") return false;
  const statuses = response.data?.statuses;
  return Array.isArray(statuses) && statuses.some(hasErrorField);
}

/** Single error shape with one status. */
type SingleError = { response: { data: { status: { error: string } } } };

/** True if `r` matches `{ response: { data: { status: { error } } } }`. */
function isSingleError(r: unknown): r is SingleError {
  if (typeof r !== "object" || r === null) return false;
  const status = (r as { response?: { data?: { status?: unknown } } }).response?.data?.status;
  return hasErrorField(status);
}

/** True if `r` matches any of the three Hyperliquid error response shapes. */
export function isErrorResponse(r: unknown): r is TopLevelError | BulkError | SingleError {
  return isTopLevelError(r) || isBulkError(r) || isSingleError(r);
}

// ============================================================
// Extraction
// ============================================================

/** Extract a human-readable error message from an error response, or `undefined` if none. */
function getErrorMessage(r: unknown): string | undefined {
  if (isTopLevelError(r)) {
    return r.response;
  }
  if (isBulkError(r)) {
    const prefix = r.response.type;
    const errors = r.response.data.statuses.flatMap((s, i) => hasErrorField(s) ? [`${prefix} ${i}: ${s.error}`] : []);
    if (errors.length > 0) return errors.join(", ");
  }
  if (isSingleError(r)) {
    return r.response.data.status.error;
  }
  return undefined;
}

// ============================================================
// Assertion
// ============================================================

/**
 * Throws {@linkcode ApiRequestError} if the response is an error; otherwise returns void.
 *
 * @param response Raw API response to validate.
 *
 * @throws {ApiRequestError} If the response contains an error.
 */
export function assertSuccessResponse(response: unknown): void {
  if (isErrorResponse(response)) {
    throw new ApiRequestError(response, getErrorMessage(response));
  }
}

// ============================================================
// Type-Level Error Filtering
// ============================================================

/** Flatten an intersection type for cleaner IDE display. */
// deno-lint-ignore ban-types
type Prettify<T> = { [K in keyof T]: T[K] } & {};

/** Filter out `{ status: "err" }` top-level error shape. */
type ExcludeTopLevelError<T> = T extends { status: "err" } ? never : T;

/** Filter out error variants from `response.data.statuses[]` array. */
type ExcludeBulkError<T> = T extends { response: { data: { statuses: ReadonlyArray<infer S> } } }
  ? Exclude<S, { error: unknown }> extends never ? never
  : Prettify<
    Omit<T, "response"> & {
      response: Prettify<Omit<T["response"], "data"> & { data: { statuses: Array<Exclude<S, { error: unknown }>> } }>;
    }
  >
  : T;

/** Filter out error variant from `response.data.status` single status. */
type ExcludeSingleError<T> = T extends { response: { data: { status: infer S } } }
  ? S extends { error: unknown } ? never
  : Prettify<
    Omit<T, "response"> & {
      response: Prettify<Omit<T["response"], "data"> & { data: { status: Exclude<S, { error: unknown }> } }>;
    }
  >
  : T;

/** Exclude all three Hyperliquid error response shapes from `T`. */
export type ExcludeErrorResponse<T> = ExcludeTopLevelError<ExcludeBulkError<ExcludeSingleError<T>>>;
