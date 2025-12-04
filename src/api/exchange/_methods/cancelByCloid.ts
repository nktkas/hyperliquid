import * as v from "@valibot/valibot";

// ============================================================
// API Schemas
// ============================================================

import { Address, Hex, UnsignedInteger } from "../../_schemas.ts";
import { Nonce, Signature } from "./_base/schemas.ts";
import { CancelResponse } from "./cancel.ts";

/**
 * Cancel order(s) by cloid.
 * @see https://hyperliquid.gitbook.io/hyperliquid-docs/for-developers/api/exchange-endpoint#cancel-order-s-by-cloid
 */
export const CancelByCloidRequest = /* @__PURE__ */ (() => {
  return v.pipe(
    v.object({
      /** Action to perform. */
      action: v.pipe(
        v.object({
          /** Type of action. */
          type: v.pipe(
            v.literal("cancelByCloid"),
            v.description("Type of action."),
          ),
          /** Orders to cancel. */
          cancels: v.pipe(
            v.array(
              v.object({
                /** Asset ID. */
                asset: v.pipe(
                  UnsignedInteger,
                  v.description("Asset ID."),
                ),
                /** Client Order ID. */
                cloid: v.pipe(
                  v.pipe(Hex, v.length(34)),
                  v.description("Client Order ID."),
                ),
              }),
            ),
            v.description("Orders to cancel."),
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
    v.description("Cancel order(s) by cloid."),
  );
})();
export type CancelByCloidRequest = v.InferOutput<typeof CancelByCloidRequest>;

/**
 * Response for order cancellation by cloid.
 * @see https://hyperliquid.gitbook.io/hyperliquid-docs/for-developers/api/exchange-endpoint#cancel-order-s-by-cloid
 */
export const CancelByCloidResponse = /* @__PURE__ */ (() => {
  return v.pipe(
    CancelResponse,
    v.description("Response for order cancellation by cloid."),
  );
})();
export type CancelByCloidResponse = v.InferOutput<typeof CancelByCloidResponse>;

// ============================================================
// Execution Logic
// ============================================================

import { type ExchangeConfig, executeL1Action, type ExtractRequestOptions } from "./_base/execute.ts";
import type { ExcludeErrorResponse } from "./_base/errors.ts";

/** Schema for user-provided action parameters (excludes system fields). */
const CancelByCloidParameters = /* @__PURE__ */ (() => {
  return v.omit(
    v.object(CancelByCloidRequest.entries.action.entries),
    ["type"],
  );
})();
/** Action parameters for the {@linkcode cancelByCloid} function. */
export type CancelByCloidParameters = v.InferInput<typeof CancelByCloidParameters>;

/** Request options for the {@linkcode cancelByCloid} function. */
export type CancelByCloidOptions = ExtractRequestOptions<v.InferInput<typeof CancelByCloidRequest>>;

/** Successful variant of {@linkcode CancelByCloidResponse} without errors. */
export type CancelByCloidSuccessResponse = ExcludeErrorResponse<CancelByCloidResponse>;

/**
 * Cancel order(s) by cloid.
 *
 * @param config - General configuration for Exchange API requests.
 * @param params - Parameters specific to the API request.
 * @param opts - Request execution options.
 *
 * @returns Successful variant of {@link CancelResponse} without error statuses.
 *
 * @throws {ValiError} When the request parameters fail validation (before sending).
 * @throws {TransportError} When the transport layer throws an error.
 * @throws {ApiRequestError} When the API returns an unsuccessful response.
 *
 * @example
 * ```ts
 * import { HttpTransport } from "@nktkas/hyperliquid";
 * import { cancelByCloid } from "@nktkas/hyperliquid/api/exchange";
 * import { privateKeyToAccount } from "npm:viem/accounts";
 *
 * const wallet = privateKeyToAccount("0x..."); // viem or ethers
 * const transport = new HttpTransport(); // or `WebSocketTransport`
 *
 * const data = await cancelByCloid(
 *   { transport, wallet },
 *   {
 *     cancels: [
 *       { asset: 0, cloid: "0x..." },
 *     ],
 *   },
 * );
 * ```
 *
 * @see https://hyperliquid.gitbook.io/hyperliquid-docs/for-developers/api/exchange-endpoint#cancel-order-s-by-cloid
 */
export function cancelByCloid(
  config: ExchangeConfig,
  params: CancelByCloidParameters,
  opts?: CancelByCloidOptions,
): Promise<CancelByCloidSuccessResponse> {
  const action = v.parse(CancelByCloidParameters, params);
  return executeL1Action(config, { type: "cancelByCloid", ...action }, opts);
}
