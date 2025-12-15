import * as v from "@valibot/valibot";

// ============================================================
// API Schemas
// ============================================================

import { UnsignedInteger } from "../../_schemas.ts";
import { ErrorResponse, SignatureSchema, SuccessResponse } from "./_base/commonSchemas.ts";

/**
 * Reserve additional rate-limited actions for a fee.
 * @see https://hyperliquid.gitbook.io/hyperliquid-docs/for-developers/api/exchange-endpoint#reserve-additional-actions
 */
export const ReserveRequestWeightRequest = /* @__PURE__ */ (() => {
  return v.pipe(
    v.object({
      /** Action to perform. */
      action: v.pipe(
        v.object({
          /** Type of action. */
          type: v.pipe(
            v.literal("reserveRequestWeight"),
            v.description("Type of action."),
          ),
          /** Amount of request weight to reserve. */
          weight: v.pipe(
            UnsignedInteger,
            v.maxValue(1844674407370955), // truncated max uint64 / 1000
            v.description("Amount of request weight to reserve."),
          ),
        }),
        v.description("Action to perform."),
      ),
      /** Nonce (timestamp in ms) used to prevent replay attacks. */
      nonce: v.pipe(
        UnsignedInteger,
        v.description("Nonce (timestamp in ms) used to prevent replay attacks."),
      ),
      /** ECDSA signature components. */
      signature: v.pipe(
        SignatureSchema,
        v.description("ECDSA signature components."),
      ),
      /** Expiration time of the action. */
      expiresAfter: v.pipe(
        v.optional(UnsignedInteger),
        v.description("Expiration time of the action."),
      ),
    }),
    v.description("Reserve additional rate-limited actions for a fee."),
  );
})();
export type ReserveRequestWeightRequest = v.InferOutput<typeof ReserveRequestWeightRequest>;

/**
 * Successful response without specific data or error response.
 * @see https://hyperliquid.gitbook.io/hyperliquid-docs/for-developers/api/exchange-endpoint#reserve-additional-actions
 */
export const ReserveRequestWeightResponse = /* @__PURE__ */ (() => {
  return v.pipe(
    v.union([SuccessResponse, ErrorResponse]),
    v.description("Successful response without specific data or error response."),
  );
})();
export type ReserveRequestWeightResponse = v.InferOutput<typeof ReserveRequestWeightResponse>;

// ============================================================
// Execution Logic
// ============================================================

import { type ExchangeConfig, executeL1Action, type ExtractRequestOptions } from "./_base/execute.ts";
import type { ExcludeErrorResponse } from "./_base/errors.ts";

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
 * @param config - General configuration for Exchange API requests.
 * @param params - Parameters specific to the API request.
 * @param opts - Request execution options.
 *
 * @returns Successful response without specific data.
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
