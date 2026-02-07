import * as v from "@valibot/valibot";

// ============================================================
// API Schemas
// ============================================================

import { Address, Integer, UnsignedInteger } from "../../_schemas.ts";
import { type ErrorResponse, SignatureSchema, type SuccessResponse } from "./_base/commonSchemas.ts";

/**
 * Add or remove margin from isolated position.
 * @see https://hyperliquid.gitbook.io/hyperliquid-docs/for-developers/api/exchange-endpoint#update-isolated-margin
 */
export const UpdateIsolatedMarginRequest = /* @__PURE__ */ (() => {
  return v.object({
    /** Action to perform. */
    action: v.object({
      /** Type of action. */
      type: v.literal("updateIsolatedMargin"),
      /** Asset ID. */
      asset: UnsignedInteger,
      /** Position side (`true` for long, `false` for short). */
      isBuy: v.boolean(),
      /** Amount to adjust (float * 1e6). */
      ntli: Integer,
    }),
    /** Nonce (timestamp in ms) used to prevent replay attacks. */
    nonce: UnsignedInteger,
    /** ECDSA signature components. */
    signature: SignatureSchema,
    /** Vault address (for vault trading). */
    vaultAddress: v.optional(Address),
    /** Expiration time of the action. */
    expiresAfter: v.optional(UnsignedInteger),
  });
})();
export type UpdateIsolatedMarginRequest = v.InferOutput<typeof UpdateIsolatedMarginRequest>;

/**
 * Successful response without specific data or error response.
 * @see https://hyperliquid.gitbook.io/hyperliquid-docs/for-developers/api/exchange-endpoint#update-isolated-margin
 */
export type UpdateIsolatedMarginResponse = SuccessResponse | ErrorResponse;

// ============================================================
// Execution Logic
// ============================================================

import { type ExchangeConfig, executeL1Action, type ExtractRequestOptions } from "./_base/execute.ts";
import type { ExcludeErrorResponse } from "./_base/errors.ts";

/** Schema for user-provided action parameters (excludes system fields). */
const UpdateIsolatedMarginParameters = /* @__PURE__ */ (() => {
  return v.omit(
    v.object(UpdateIsolatedMarginRequest.entries.action.entries),
    ["type"],
  );
})();
/** Action parameters for the {@linkcode updateIsolatedMargin} function. */
export type UpdateIsolatedMarginParameters = v.InferInput<typeof UpdateIsolatedMarginParameters>;

/** Request options for the {@linkcode updateIsolatedMargin} function. */
export type UpdateIsolatedMarginOptions = ExtractRequestOptions<v.InferInput<typeof UpdateIsolatedMarginRequest>>;

/** Successful variant of {@linkcode UpdateIsolatedMarginResponse} without errors. */
export type UpdateIsolatedMarginSuccessResponse = ExcludeErrorResponse<UpdateIsolatedMarginResponse>;

/**
 * Add or remove margin from isolated position.
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
 * import { updateIsolatedMargin } from "@nktkas/hyperliquid/api/exchange";
 * import { privateKeyToAccount } from "npm:viem/accounts";
 *
 * const wallet = privateKeyToAccount("0x..."); // viem or ethers
 * const transport = new HttpTransport(); // or `WebSocketTransport`
 *
 * await updateIsolatedMargin(
 *   { transport, wallet },
 *   { asset: 0, isBuy: true, ntli: 1 * 1e6 },
 * );
 * ```
 *
 * @see https://hyperliquid.gitbook.io/hyperliquid-docs/for-developers/api/exchange-endpoint#update-isolated-margin
 */
export function updateIsolatedMargin(
  config: ExchangeConfig,
  params: UpdateIsolatedMarginParameters,
  opts?: UpdateIsolatedMarginOptions,
): Promise<UpdateIsolatedMarginSuccessResponse> {
  const action = v.parse(UpdateIsolatedMarginParameters, params);
  return executeL1Action(config, { type: "updateIsolatedMargin", ...action }, opts);
}
