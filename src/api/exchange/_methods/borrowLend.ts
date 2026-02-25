import * as v from "@valibot/valibot";

// ============================================================
// API Schemas
// ============================================================

import { Address, UnsignedDecimal, UnsignedInteger } from "../../_schemas.ts";
import { type ErrorResponse, SignatureSchema, type SuccessResponse } from "./_base/commonSchemas.ts";

/**
 * Borrow or lend assets.
 * @see null
 */
export const BorrowLendRequest = /* @__PURE__ */ (() => {
  return v.object({
    /** Action to perform. */
    action: v.object({
      /** Type of action. */
      type: v.literal("borrowLend"),
      /** Operation type. */
      operation: v.picklist(["supply", "withdraw", "repay", "borrow"]),
      /** Token ID. */
      token: UnsignedInteger,
      /** Amount to supply/withdraw (null = full). */
      amount: v.nullable(UnsignedDecimal),
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
export type BorrowLendRequest = v.InferOutput<typeof BorrowLendRequest>;

/**
 * Successful response without specific data or error response.
 * @see null
 */
export type BorrowLendResponse = SuccessResponse | ErrorResponse;

// ============================================================
// Execution Logic
// ============================================================

import type { ExcludeErrorResponse } from "./_base/errors.ts";
import { type ExchangeConfig, executeL1Action, type ExtractRequestOptions } from "./_base/execute.ts";

/** Schema for user-provided action parameters (excludes system fields). */
const BorrowLendParameters = /* @__PURE__ */ (() => {
  return v.omit(
    v.object(BorrowLendRequest.entries.action.entries),
    ["type"],
  );
})();

/** Action parameters for the {@linkcode borrowLend} function. */
export type BorrowLendParameters = v.InferInput<typeof BorrowLendParameters>;

/** Request options for the {@linkcode borrowLend} function. */
export type BorrowLendOptions = ExtractRequestOptions<v.InferInput<typeof BorrowLendRequest>>;

/** Successful variant of {@linkcode BorrowLendResponse} without errors. */
export type BorrowLendSuccessResponse = ExcludeErrorResponse<BorrowLendResponse>;

/**
 * Borrow or lend assets.
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
 * import { borrowLend } from "@nktkas/hyperliquid/api/exchange";
 * import { privateKeyToAccount } from "npm:viem/accounts";
 *
 * const wallet = privateKeyToAccount("0x..."); // viem or ethers
 * const transport = new HttpTransport(); // or `WebSocketTransport`
 *
 * await borrowLend(
 *   { transport, wallet },
 *   { operation: "supply", token: 0, amount: "20" },
 * );
 * ```
 *
 * @see null
 */
export function borrowLend(
  config: ExchangeConfig,
  params: BorrowLendParameters,
  opts?: BorrowLendOptions,
): Promise<BorrowLendSuccessResponse> {
  const action = v.parse(BorrowLendParameters, params);
  return executeL1Action(config, { type: "borrowLend", ...action }, opts);
}
