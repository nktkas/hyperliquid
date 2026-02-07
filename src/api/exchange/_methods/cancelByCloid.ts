import * as v from "@valibot/valibot";

// ============================================================
// API Schemas
// ============================================================

import { Address, Cloid, UnsignedInteger } from "../../_schemas.ts";
import { SignatureSchema } from "./_base/commonSchemas.ts";
import type { CancelResponse } from "./cancel.ts";

/**
 * Cancel order(s) by cloid.
 * @see https://hyperliquid.gitbook.io/hyperliquid-docs/for-developers/api/exchange-endpoint#cancel-order-s-by-cloid
 */
export const CancelByCloidRequest = /* @__PURE__ */ (() => {
  return v.object({
    /** Action to perform. */
    action: v.object({
      /** Type of action. */
      type: v.literal("cancelByCloid"),
      /** Orders to cancel by asset and client order ID. */
      cancels: v.array(
        v.object({
          /** Asset ID. */
          asset: UnsignedInteger,
          /** Client Order ID. */
          cloid: Cloid,
        }),
      ),
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
export type CancelByCloidRequest = v.InferOutput<typeof CancelByCloidRequest>;

/**
 * Response for order cancellation by cloid.
 * @see https://hyperliquid.gitbook.io/hyperliquid-docs/for-developers/api/exchange-endpoint#cancel-order-s-by-cloid
 */
export type CancelByCloidResponse = CancelResponse;

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
