import * as v from "@valibot/valibot";

// ============================================================
// API Schemas
// ============================================================

import { Address, UnsignedInteger } from "../../_schemas.ts";
import { type ErrorResponse, SignatureSchema, type SuccessResponse } from "./_base/commonSchemas.ts";

/**
 * Update cross or isolated leverage on a coin.
 * @see https://hyperliquid.gitbook.io/hyperliquid-docs/for-developers/api/exchange-endpoint#update-leverage
 */
export const UpdateLeverageRequest = /* @__PURE__ */ (() => {
  return v.object({
    /** Action to perform. */
    action: v.object({
      /** Type of action. */
      type: v.literal("updateLeverage"),
      /** Asset ID. */
      asset: UnsignedInteger,
      /** `true` for cross leverage, `false` for isolated leverage. */
      isCross: v.boolean(),
      /** New leverage value. */
      leverage: v.pipe(UnsignedInteger, v.minValue(1)),
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
export type UpdateLeverageRequest = v.InferOutput<typeof UpdateLeverageRequest>;

/**
 * Successful response without specific data or error response.
 * @see https://hyperliquid.gitbook.io/hyperliquid-docs/for-developers/api/exchange-endpoint#update-leverage
 */
export type UpdateLeverageResponse = SuccessResponse | ErrorResponse;

// ============================================================
// Execution Logic
// ============================================================

import { parse } from "../../../_base.ts";
import type { ExcludeErrorResponse } from "./_base/errors.ts";
import { type ExchangeConfig, executeL1Action, type ExtractRequestOptions } from "./_base/execute.ts";

/** Schema for user-provided action parameters (excludes system fields). */
const UpdateLeverageParameters = /* @__PURE__ */ (() => {
  return v.omit(
    v.object(UpdateLeverageRequest.entries.action.entries),
    ["type"],
  );
})();

/** Action parameters for the {@linkcode updateLeverage} function. */
export type UpdateLeverageParameters = v.InferInput<typeof UpdateLeverageParameters>;

/** Request options for the {@linkcode updateLeverage} function. */
export type UpdateLeverageOptions = ExtractRequestOptions<v.InferInput<typeof UpdateLeverageRequest>>;

/** Successful variant of {@linkcode UpdateLeverageResponse} without errors. */
export type UpdateLeverageSuccessResponse = ExcludeErrorResponse<UpdateLeverageResponse>;

/**
 * Update cross or isolated leverage on a coin.
 *
 * @param config General configuration for Exchange API requests.
 * @param params Parameters specific to the API request.
 * @param opts Request execution options.
 * @return Successful response without specific data.
 *
 * @throws {ValidationError} When the request parameters fail validation (before sending).
 * @throws {TransportError} When the transport layer throws an error.
 * @throws {ApiRequestError} When the API returns an unsuccessful response.
 *
 * @example
 * ```ts
 * import { HttpTransport } from "@nktkas/hyperliquid";
 * import { updateLeverage } from "@nktkas/hyperliquid/api/exchange";
 * import { privateKeyToAccount } from "npm:viem/accounts";
 *
 * const wallet = privateKeyToAccount("0x..."); // viem or ethers
 * const transport = new HttpTransport(); // or `WebSocketTransport`
 *
 * await updateLeverage(
 *   { transport, wallet },
 *   { asset: 0, isCross: true, leverage: 5 },
 * );
 * ```
 *
 * @see https://hyperliquid.gitbook.io/hyperliquid-docs/for-developers/api/exchange-endpoint#update-leverage
 */
export function updateLeverage(
  config: ExchangeConfig,
  params: UpdateLeverageParameters,
  opts?: UpdateLeverageOptions,
): Promise<UpdateLeverageSuccessResponse> {
  const action = parse(UpdateLeverageParameters, params);
  return executeL1Action(config, { type: "updateLeverage", ...action }, opts);
}
