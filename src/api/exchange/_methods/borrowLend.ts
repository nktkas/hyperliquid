import * as v from "@valibot/valibot";

// ============================================================
// API Schemas
// ============================================================

import { Address, Hex, UnsignedDecimal, UnsignedInteger } from "../../_schemas.ts";

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
export type BorrowLendRequest = v.InferOutput<typeof BorrowLendRequest>;

/**
 * Successful response without specific data or error response.
 * @see null
 */
export type BorrowLendResponse =
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
import type { ExcludeErrorResponse } from "./_base/errors.ts";
import { type ExchangeConfig, executeL1Action, type ExtractRequestOptions } from "./_base/execute.ts";

/** Schema for action fields (excludes request-level system fields). */
const BorrowLendActionSchema = /* @__PURE__ */ (() => {
  return v.object(BorrowLendRequest.entries.action.entries);
})();

/** Action parameters for the {@linkcode borrowLend} function. */
export type BorrowLendParameters = Omit<v.InferInput<typeof BorrowLendActionSchema>, "type">;

/** Request options for the {@linkcode borrowLend} function. */
export type BorrowLendOptions = ExtractRequestOptions<v.InferInput<typeof BorrowLendRequest>>;

/** Successful variant of {@linkcode BorrowLendResponse} without errors. */
export type BorrowLendSuccessResponse = ExcludeErrorResponse<BorrowLendResponse>;

/**
 * Borrow or lend assets.
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
 * import { borrowLend } from "@nktkas/hyperliquid/api/exchange";
 * import { privateKeyToAccount } from "npm:viem/accounts";
 *
 * const wallet = privateKeyToAccount("0x..."); // viem or ethers
 * const transport = new HttpTransport(); // or `WebSocketTransport`
 *
 * await borrowLend({ transport, wallet }, {
 *   operation: "supply",
 *   token: 0,
 *   amount: "20",
 * });
 * ```
 *
 * @see null
 */
export function borrowLend(
  config: ExchangeConfig,
  params: BorrowLendParameters,
  opts?: BorrowLendOptions,
): Promise<BorrowLendSuccessResponse> {
  const action = canonicalize(
    BorrowLendActionSchema,
    parse(BorrowLendActionSchema, { type: "borrowLend", ...params }),
  );
  return executeL1Action(config, action, opts);
}
