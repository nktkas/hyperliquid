import * as v from "@valibot/valibot";

// ============================================================
// API Schemas
// ============================================================

import { Address, UnsignedDecimal, UnsignedInteger } from "../../_schemas.ts";
import { ErrorResponse, SignatureSchema, SuccessResponse } from "./_base/commonSchemas.ts";

/** Borrow or lend assets. */
export const BorrowLendRequest = /* @__PURE__ */ (() => {
  return v.pipe(
    v.object({
      /** Action to perform. */
      action: v.pipe(
        v.object({
          /** Type of action. */
          type: v.pipe(
            v.literal("borrowLend"),
            v.description("Type of action."),
          ),
          /** Operation type. */
          operation: v.pipe(
            v.picklist([
              "supply",
              "withdraw",
            ]),
            v.description("Operation type."),
          ),
          /** Token ID. */
          token: v.pipe(
            UnsignedInteger,
            v.description("Token ID."),
          ),
          /** Amount to supply/withdraw (null = full). */
          amount: v.pipe(
            v.nullable(UnsignedDecimal),
            v.description("Amount to supply/withdraw (null = full)."),
          ),
        }),
        v.description("Action to perform."),
      ),
      /** Nonce (timestamp in ms) used to prevent replay attacks. */
      nonce: v.pipe(
        UnsignedInteger,
        v.description("Nonce (timestamp in ms) used to prevent replay attacks."),
      ),
      /** ECDSA signature components. */
      signature: v.pipe(
        SignatureSchema,
        v.description("ECDSA signature components."),
      ),
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
    v.description("Borrow or lend assets."),
  );
})();
export type BorrowLendRequest = v.InferOutput<typeof BorrowLendRequest>;

/** Successful response without specific data or error response. */
export const BorrowLendResponse = /* @__PURE__ */ (() => {
  return v.pipe(
    v.union([SuccessResponse, ErrorResponse]),
    v.description("Successful response without specific data or error response."),
  );
})();
export type BorrowLendResponse = v.InferOutput<typeof BorrowLendResponse>;

// ============================================================
// Execution Logic
// ============================================================

import { type ExchangeConfig, executeL1Action, type ExtractRequestOptions } from "./_base/execute.ts";
import type { ExcludeErrorResponse } from "./_base/errors.ts";

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
 * import { borrowLend } from "@nktkas/hyperliquid/api/exchange";
 * import { privateKeyToAccount } from "npm:viem/accounts";
 *
 * const wallet = privateKeyToAccount("0x..."); // viem or ethers
 * const transport = new HttpTransport(); // or `WebSocketTransport`
 *
 * const data = await borrowLend(
 *   { transport, wallet },
 *   { operation: "supply", token: 0, amount: "20" },
 * );
 * ```
 */
export function borrowLend(
  config: ExchangeConfig,
  params: BorrowLendParameters,
  opts?: BorrowLendOptions,
): Promise<BorrowLendSuccessResponse> {
  const action = v.parse(BorrowLendParameters, params);
  return executeL1Action(config, { type: "borrowLend", ...action }, opts);
}
