import * as v from "@valibot/valibot";

// ============================================================
// API Schemas
// ============================================================

import { Address, Hex, Integer, UnsignedInteger } from "../../_schemas.ts";

/**
 * Add or remove margin from isolated position.
 * @see https://hyperliquid.gitbook.io/hyperliquid-docs/for-developers/api/exchange-endpoint#update-isolated-margin
 */
export const UpdateIsolatedMarginRequest = /* @__PURE__ */ (() => {
  return v.object({
    /** Action to perform. */
    action: v.object({
      /** Type of action. */
      type: v.literal("updateIsolatedMargin"),
      /** Asset ID. */
      asset: UnsignedInteger,
      /** Position side (`true` for long, `false` for short). */
      isBuy: v.boolean(),
      /** Amount to adjust (float * 1e6). */
      ntli: Integer,
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
export type UpdateIsolatedMarginRequest = v.InferOutput<typeof UpdateIsolatedMarginRequest>;

/**
 * Successful response without specific data or error response.
 * @see https://hyperliquid.gitbook.io/hyperliquid-docs/for-developers/api/exchange-endpoint#update-isolated-margin
 */
export type UpdateIsolatedMarginResponse =
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
const UpdateIsolatedMarginActionSchema = /* @__PURE__ */ (() => {
  return v.object(UpdateIsolatedMarginRequest.entries.action.entries);
})();

/** Action parameters for the {@linkcode updateIsolatedMargin} function. */
export type UpdateIsolatedMarginParameters = Omit<v.InferInput<typeof UpdateIsolatedMarginActionSchema>, "type">;

/** Request options for the {@linkcode updateIsolatedMargin} function. */
export type UpdateIsolatedMarginOptions = ExtractRequestOptions<v.InferInput<typeof UpdateIsolatedMarginRequest>>;

/** Successful variant of {@linkcode UpdateIsolatedMarginResponse} without errors. */
export type UpdateIsolatedMarginSuccessResponse = ExcludeErrorResponse<UpdateIsolatedMarginResponse>;

/**
 * Add or remove margin from isolated position.
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
 * import { updateIsolatedMargin } from "@nktkas/hyperliquid/api/exchange";
 * import { privateKeyToAccount } from "npm:viem/accounts";
 *
 * const wallet = privateKeyToAccount("0x..."); // viem or ethers
 * const transport = new HttpTransport(); // or `WebSocketTransport`
 *
 * await updateIsolatedMargin({ transport, wallet }, {
 *   asset: 0,
 *   isBuy: true,
 *   ntli: 1 * 1e6,
 * });
 * ```
 *
 * @see https://hyperliquid.gitbook.io/hyperliquid-docs/for-developers/api/exchange-endpoint#update-isolated-margin
 */
export function updateIsolatedMargin(
  config: ExchangeConfig,
  params: UpdateIsolatedMarginParameters,
  opts?: UpdateIsolatedMarginOptions,
): Promise<UpdateIsolatedMarginSuccessResponse> {
  const action = canonicalize(
    UpdateIsolatedMarginActionSchema,
    parse(UpdateIsolatedMarginActionSchema, { type: "updateIsolatedMargin", ...params }),
  );
  return executeL1Action(config, action, opts);
}
