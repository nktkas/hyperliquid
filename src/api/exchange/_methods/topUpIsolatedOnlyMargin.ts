import * as v from "@valibot/valibot";

// ============================================================
// API Schemas
// ============================================================

import { Address, Hex, UnsignedDecimal, UnsignedInteger } from "../../_schemas.ts";

/**
 * Top up isolated margin by targeting a specific leverage.
 * @see https://hyperliquid.gitbook.io/hyperliquid-docs/for-developers/api/exchange-endpoint#update-isolated-margin
 */
export const TopUpIsolatedOnlyMarginRequest = /* @__PURE__ */ (() => {
  return v.object({
    /** Action to perform. */
    action: v.object({
      /** Type of action. */
      type: v.literal("topUpIsolatedOnlyMargin"),
      /** Asset ID. */
      asset: UnsignedInteger,
      /** Target leverage (float string). */
      leverage: UnsignedDecimal,
    }),
    /** Nonce (timestamp in ms) used to prevent replay attacks. */
    nonce: UnsignedInteger,
    /** ECDSA signature components. */
    signature: v.object({
      /** First 32-byte component. */
      r: v.pipe(Hex, v.length(66)),
      /** Second 32-byte component. */
      s: v.pipe(Hex, v.length(66)),
      /** Recovery identifier. */
      v: v.picklist([27, 28]),
    }),
    /** Vault address (for vault trading). */
    vaultAddress: v.optional(Address),
    /** Expiration time of the action. */
    expiresAfter: v.optional(UnsignedInteger),
  });
})();
export type TopUpIsolatedOnlyMarginRequest = v.InferOutput<typeof TopUpIsolatedOnlyMarginRequest>;

/**
 * Successful response without specific data or error response.
 * @see https://hyperliquid.gitbook.io/hyperliquid-docs/for-developers/api/exchange-endpoint#update-isolated-margin
 */
export type TopUpIsolatedOnlyMarginResponse =
  | {
    /** Successful status. */
    status: "ok";
    /** Response details. */
    response: {
      /** Type of response. */
      type: "default";
    };
  }
  | {
    /** Error status. */
    status: "err";
    /** Error message. */
    response: string;
  };

// ============================================================
// Execution Logic
// ============================================================

import { parse } from "../../../_base.ts";
import type { ExcludeErrorResponse } from "./_base/errors.ts";
import { type ExchangeConfig, executeL1Action, type ExtractRequestOptions } from "./_base/execute.ts";

/** Schema for action fields (excludes request-level system fields). */
const TopUpIsolatedOnlyMarginActionSchema = /* @__PURE__ */ (() => {
  return v.object(TopUpIsolatedOnlyMarginRequest.entries.action.entries);
})();

/** Action parameters for the {@linkcode topUpIsolatedOnlyMargin} function. */
export type TopUpIsolatedOnlyMarginParameters = Omit<v.InferInput<typeof TopUpIsolatedOnlyMarginActionSchema>, "type">;

/** Request options for the {@linkcode topUpIsolatedOnlyMargin} function. */
export type TopUpIsolatedOnlyMarginOptions = ExtractRequestOptions<v.InferInput<typeof TopUpIsolatedOnlyMarginRequest>>;

/** Successful variant of {@linkcode TopUpIsolatedOnlyMarginResponse} without errors. */
export type TopUpIsolatedOnlyMarginSuccessResponse = ExcludeErrorResponse<TopUpIsolatedOnlyMarginResponse>;

/**
 * Top up isolated margin by targeting a specific leverage.
 *
 * Signing: L1 Action.
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
 * import { topUpIsolatedOnlyMargin } from "@nktkas/hyperliquid/api/exchange";
 * import { privateKeyToAccount } from "npm:viem/accounts";
 *
 * const wallet = privateKeyToAccount("0x..."); // viem or ethers
 * const transport = new HttpTransport(); // or `WebSocketTransport`
 *
 * await topUpIsolatedOnlyMargin({ transport, wallet }, {
 *   asset: 0,
 *   leverage: "0.5",
 * });
 * ```
 *
 * @see https://hyperliquid.gitbook.io/hyperliquid-docs/for-developers/api/exchange-endpoint#update-isolated-margin
 */
export function topUpIsolatedOnlyMargin(
  config: ExchangeConfig,
  params: TopUpIsolatedOnlyMarginParameters,
  opts?: TopUpIsolatedOnlyMarginOptions,
): Promise<TopUpIsolatedOnlyMarginSuccessResponse> {
  const action = parse(TopUpIsolatedOnlyMarginActionSchema, { type: "topUpIsolatedOnlyMargin", ...params });
  return executeL1Action(config, action, opts);
}
