import * as v from "@valibot/valibot";

// ============================================================
// API Schemas
// ============================================================

import { Address, UnsignedInteger } from "../../_schemas.ts";
import { ErrorResponse, Nonce, Signature, SuccessResponse } from "./_base/schemas.ts";

/**
 * Update cross or isolated leverage on a coin.
 * @see https://hyperliquid.gitbook.io/hyperliquid-docs/for-developers/api/exchange-endpoint#update-leverage
 */
export const UpdateLeverageRequest = /* @__PURE__ */ (() => {
  return v.pipe(
    v.object({
      /** Action to perform. */
      action: v.pipe(
        v.object({
          /** Type of action. */
          type: v.pipe(
            v.literal("updateLeverage"),
            v.description("Type of action."),
          ),
          /** Asset ID. */
          asset: v.pipe(
            UnsignedInteger,
            v.description("Asset ID."),
          ),
          /** `true` for cross leverage, `false` for isolated leverage. */
          isCross: v.pipe(
            v.boolean(),
            v.description("`true` for cross leverage, `false` for isolated leverage."),
          ),
          /** New leverage value. */
          leverage: v.pipe(
            v.pipe(UnsignedInteger, v.minValue(1)),
            v.description("New leverage value."),
          ),
        }),
        v.description("Action to perform."),
      ),
      /** Nonce (timestamp in ms) used to prevent replay attacks. */
      nonce: Nonce,
      /** ECDSA signature components. */
      signature: Signature,
      /** Vault address (for vault trading). */
      vaultAddress: v.pipe(
        v.optional(Address),
        v.description("Vault address (for vault trading)."),
      ),
      /** Expiration time of the action. */
      expiresAfter: v.pipe(
        v.optional(UnsignedInteger),
        v.description("Expiration time of the action."),
      ),
    }),
    v.description("Update cross or isolated leverage on a coin."),
  );
})();
export type UpdateLeverageRequest = v.InferOutput<typeof UpdateLeverageRequest>;

/**
 * Successful response without specific data or error response.
 * @see https://hyperliquid.gitbook.io/hyperliquid-docs/for-developers/api/exchange-endpoint#update-leverage
 */
export const UpdateLeverageResponse = /* @__PURE__ */ (() => {
  return v.pipe(
    v.union([SuccessResponse, ErrorResponse]),
    v.description("Successful response without specific data or error response."),
  );
})();
export type UpdateLeverageResponse = v.InferOutput<typeof UpdateLeverageResponse>;

// ============================================================
// Execution Logic
// ============================================================

import { type ExchangeConfig, executeL1Action, type ExtractRequestOptions } from "./_base/execute.ts";
import type { ExcludeErrorResponse } from "./_base/errors.ts";

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
  const action = v.parse(UpdateLeverageParameters, params);
  return executeL1Action(config, { type: "updateLeverage", ...action }, opts);
}
