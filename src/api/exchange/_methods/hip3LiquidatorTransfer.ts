import * as v from "@valibot/valibot";

// ============================================================
// API Schemas
// ============================================================

import { Hex, UnsignedInteger } from "../../_schemas.ts";

/**
 * Deposit into or withdraw from the HIP-3 DEX backstop liquidator.
 * @see https://hyperliquid.gitbook.io/hyperliquid-docs/for-developers/api/exchange-endpoint#hip-3-backstop-liquidator-transfer
 */
export const Hip3LiquidatorTransferRequest = /* @__PURE__ */ (() => {
  return v.object({
    /** Action to perform. */
    action: v.object({
      /** Type of action. */
      type: v.literal("hip3LiquidatorTransfer"),
      /** Name of the HIP-3 DEX. */
      dex: v.string(),
      /** Amount in quote-token 1e-6 units (must be a multiple of 1000 quote tokens, i.e. 1_000_000_000). */
      ntl: UnsignedInteger,
      /** `true` for deposit, `false` for withdrawal. */
      isDeposit: v.boolean(),
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
    /** Expiration time of the action. */
    expiresAfter: v.optional(UnsignedInteger),
  });
})();
export type Hip3LiquidatorTransferRequest = v.InferOutput<typeof Hip3LiquidatorTransferRequest>;

/**
 * Successful response without specific data or error response.
 * @see https://hyperliquid.gitbook.io/hyperliquid-docs/for-developers/api/exchange-endpoint#hip-3-backstop-liquidator-transfer
 */
export type Hip3LiquidatorTransferResponse =
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
import { canonicalize } from "../../../signing/mod.ts";
import {
  type ExchangeConfig,
  type ExcludeErrorResponse,
  executeL1Action,
  type ExtractRequestOptions,
} from "./_base/mod.ts";

/** Schema for action fields (excludes request-level system fields). */
const Hip3LiquidatorTransferActionSchema = /* @__PURE__ */ (() => {
  return v.object(Hip3LiquidatorTransferRequest.entries.action.entries);
})();

/** Action parameters for the {@linkcode hip3LiquidatorTransfer} function. */
export type Hip3LiquidatorTransferParameters = Omit<v.InferInput<typeof Hip3LiquidatorTransferActionSchema>, "type">;

/** Request options for the {@linkcode hip3LiquidatorTransfer} function. */
export type Hip3LiquidatorTransferOptions = ExtractRequestOptions<v.InferInput<typeof Hip3LiquidatorTransferRequest>>;

/** Successful variant of {@linkcode Hip3LiquidatorTransferResponse} without errors. */
export type Hip3LiquidatorTransferSuccessResponse = ExcludeErrorResponse<Hip3LiquidatorTransferResponse>;

/**
 * Deposit into or withdraw from the HIP-3 DEX backstop liquidator.
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
 * import { hip3LiquidatorTransfer } from "@nktkas/hyperliquid/api/exchange";
 * import { privateKeyToAccount } from "npm:viem/accounts";
 *
 * const wallet = privateKeyToAccount("0x..."); // viem or ethers
 * const transport = new HttpTransport(); // or `WebSocketTransport`
 *
 * await hip3LiquidatorTransfer({ transport, wallet }, {
 *   dex: "test",
 *   ntl: 1_000_000_000, // 1000 quote tokens (1e-6 units)
 *   isDeposit: true,
 * });
 * ```
 *
 * @see https://hyperliquid.gitbook.io/hyperliquid-docs/for-developers/api/exchange-endpoint#hip-3-backstop-liquidator-transfer
 */
export function hip3LiquidatorTransfer(
  config: ExchangeConfig,
  params: Hip3LiquidatorTransferParameters,
  opts?: Hip3LiquidatorTransferOptions,
): Promise<Hip3LiquidatorTransferSuccessResponse> {
  const action = canonicalize(
    Hip3LiquidatorTransferActionSchema,
    parse(Hip3LiquidatorTransferActionSchema, { type: "hip3LiquidatorTransfer", ...params }),
  );
  return executeL1Action(config, action, opts);
}
