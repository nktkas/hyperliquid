import * as v from "@valibot/valibot";

// ============================================================
// API Schemas
// ============================================================

import { Address, UnsignedInteger } from "../../_schemas.ts";
import { SignatureSchema } from "./_base/commonSchemas.ts";

/**
 * Cancel a TWAP order.
 * @see https://hyperliquid.gitbook.io/hyperliquid-docs/for-developers/api/exchange-endpoint#cancel-a-twap-order
 */
export const TwapCancelRequest = /* @__PURE__ */ (() => {
  return v.object({
    /** Action to perform. */
    action: v.object({
      /** Type of action. */
      type: v.literal("twapCancel"),
      /** Asset ID. */
      a: UnsignedInteger,
      /** Twap ID. */
      t: UnsignedInteger,
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
export type TwapCancelRequest = v.InferOutput<typeof TwapCancelRequest>;

/**
 * Response for canceling a TWAP order.
 * @see https://hyperliquid.gitbook.io/hyperliquid-docs/for-developers/api/exchange-endpoint#cancel-a-twap-order
 */
export type TwapCancelResponse = {
  /** Successful status. */
  status: "ok";
  /** Response details. */
  response: {
    /** Type of response. */
    type: "twapCancel";
    /** Specific data. */
    data: {
      /** Status of the operation or error message. */
      status: string | {
        /** Error message. */
        error: string;
      };
    };
  };
};

// ============================================================
// Execution Logic
// ============================================================

import { type ExchangeConfig, executeL1Action, type ExtractRequestOptions } from "./_base/execute.ts";
import type { ExcludeErrorResponse } from "./_base/errors.ts";

/** Schema for user-provided action parameters (excludes system fields). */
const TwapCancelParameters = /* @__PURE__ */ (() => {
  return v.omit(
    v.object(TwapCancelRequest.entries.action.entries),
    ["type"],
  );
})();
/** Action parameters for the {@linkcode twapCancel} function. */
export type TwapCancelParameters = v.InferInput<typeof TwapCancelParameters>;

/** Request options for the {@linkcode twapCancel} function. */
export type TwapCancelOptions = ExtractRequestOptions<v.InferInput<typeof TwapCancelRequest>>;

/** Successful variant of {@linkcode TwapCancelResponse} without errors. */
export type TwapCancelSuccessResponse = ExcludeErrorResponse<TwapCancelResponse>;

/**
 * Cancel a TWAP order.
 *
 * @param config - General configuration for Exchange API requests.
 * @param params - Parameters specific to the API request.
 * @param opts - Request execution options.
 *
 * @returns Successful variant of {@link TwapCancelResponse} without error status.
 *
 * @throws {ValiError} When the request parameters fail validation (before sending).
 * @throws {TransportError} When the transport layer throws an error.
 * @throws {ApiRequestError} When the API returns an unsuccessful response.
 *
 * @example
 * ```ts
 * import { HttpTransport } from "@nktkas/hyperliquid";
 * import { twapCancel } from "@nktkas/hyperliquid/api/exchange";
 * import { privateKeyToAccount } from "npm:viem/accounts";
 *
 * const wallet = privateKeyToAccount("0x..."); // viem or ethers
 * const transport = new HttpTransport(); // or `WebSocketTransport`
 *
 * const data = await twapCancel(
 *   { transport, wallet },
 *   { a: 0, t: 1 },
 * );
 * ```
 *
 * @see https://hyperliquid.gitbook.io/hyperliquid-docs/for-developers/api/exchange-endpoint#cancel-a-twap-order
 */
export function twapCancel(
  config: ExchangeConfig,
  params: TwapCancelParameters,
  opts?: TwapCancelOptions,
): Promise<TwapCancelSuccessResponse> {
  const action = v.parse(TwapCancelParameters, params);
  return executeL1Action(config, { type: "twapCancel", ...action }, opts);
}
