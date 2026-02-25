import * as v from "@valibot/valibot";

// ============================================================
// API Schemas
// ============================================================

import { UnsignedInteger } from "../../_schemas.ts";
import { type ErrorResponse, SignatureSchema, type SuccessResponse } from "./_base/commonSchemas.ts";

/**
 * Reserve additional rate-limited actions for a fee.
 * @see https://hyperliquid.gitbook.io/hyperliquid-docs/for-developers/api/exchange-endpoint#reserve-additional-actions
 */
export const ReserveRequestWeightRequest = /* @__PURE__ */ (() => {
  return v.object({
    /** Action to perform. */
    action: v.object({
      /** Type of action. */
      type: v.literal("reserveRequestWeight"),
      /** Amount of request weight to reserve. */
      weight: v.pipe(UnsignedInteger, v.maxValue(1844674407370955)), // Truncated max uint64 / 1000
    }),
    /** Nonce (timestamp in ms) used to prevent replay attacks. */
    nonce: UnsignedInteger,
    /** ECDSA signature components. */
    signature: SignatureSchema,
    /** Expiration time of the action. */
    expiresAfter: v.optional(UnsignedInteger),
  });
})();
export type ReserveRequestWeightRequest = v.InferOutput<typeof ReserveRequestWeightRequest>;

/**
 * Successful response without specific data or error response.
 * @see https://hyperliquid.gitbook.io/hyperliquid-docs/for-developers/api/exchange-endpoint#reserve-additional-actions
 */
export type ReserveRequestWeightResponse = SuccessResponse | ErrorResponse;

// ============================================================
// Execution Logic
// ============================================================

import type { ExcludeErrorResponse } from "./_base/errors.ts";
import { type ExchangeConfig, executeL1Action, type ExtractRequestOptions } from "./_base/execute.ts";

/** Schema for user-provided action parameters (excludes system fields). */
const ReserveRequestWeightParameters = /* @__PURE__ */ (() => {
  return v.omit(
    v.object(ReserveRequestWeightRequest.entries.action.entries),
    ["type"],
  );
})();

/** Action parameters for the {@linkcode reserveRequestWeight} function. */
export type ReserveRequestWeightParameters = v.InferInput<typeof ReserveRequestWeightParameters>;

/** Request options for the {@linkcode reserveRequestWeight} function. */
export type ReserveRequestWeightOptions = ExtractRequestOptions<v.InferInput<typeof ReserveRequestWeightRequest>>;

/** Successful variant of {@linkcode ReserveRequestWeightResponse} without errors. */
export type ReserveRequestWeightSuccessResponse = ExcludeErrorResponse<ReserveRequestWeightResponse>;

/**
 * Reserve additional rate-limited actions for a fee.
 *
 * @param config General configuration for Exchange API requests.
 * @param params Parameters specific to the API request.
 * @param opts Request execution options.
 * @return Successful response without specific data.
 *
 * @throws {ValiError} When the request parameters fail validation (before sending).
 * @throws {TransportError} When the transport layer throws an error.
 * @throws {ApiRequestError} When the API returns an unsuccessful response.
 *
 * @example
 * ```ts
 * import { HttpTransport } from "@nktkas/hyperliquid";
 * import { reserveRequestWeight } from "@nktkas/hyperliquid/api/exchange";
 * import { privateKeyToAccount } from "npm:viem/accounts";
 *
 * const wallet = privateKeyToAccount("0x..."); // viem or ethers
 * const transport = new HttpTransport(); // or `WebSocketTransport`
 *
 * await reserveRequestWeight(
 *   { transport, wallet },
 *   { weight: 10 },
 * );
 * ```
 *
 * @see https://hyperliquid.gitbook.io/hyperliquid-docs/for-developers/api/exchange-endpoint#reserve-additional-actions
 */
export function reserveRequestWeight(
  config: ExchangeConfig,
  params: ReserveRequestWeightParameters,
  opts?: ReserveRequestWeightOptions,
): Promise<ReserveRequestWeightSuccessResponse> {
  const action = v.parse(ReserveRequestWeightParameters, params);
  return executeL1Action(config, { type: "reserveRequestWeight", ...action }, opts);
}
