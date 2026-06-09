/**
 * Error detection for Explorer API responses.
 * @module
 */

import { ApiRequestError } from "../../../_errors.ts";

export { ApiRequestError };

/** True if `r` matches the explorer error response shape `{ "type": "error", "message": "..." }`. */
function isErrorResponse(r: unknown): r is { type: "error"; message?: unknown } {
  return typeof r === "object" && r !== null &&
    "type" in r && r.type === "error";
}

/**
 * Throws {@linkcode ApiRequestError} if the response is an error; otherwise returns void.
 *
 * @param response Raw API response to validate.
 *
 * @throws {ApiRequestError} If the response contains an error.
 */
export function assertSuccessResponse(response: unknown): void {
  if (isErrorResponse(response)) {
    throw new ApiRequestError(response, typeof response.message === "string" ? response.message : undefined);
  }
}
