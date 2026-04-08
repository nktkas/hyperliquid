import * as v from "@valibot/valibot";

// ============================================================
// API Schemas
// ============================================================

import { Address, Hex, UnsignedInteger } from "../../_schemas.ts";

/**
 * Modify a sub-account.
 * @see null
 */
export const SubAccountModifyRequest = /* @__PURE__ */ (() => {
  return v.object({
    /** Action to perform. */
    action: v.object({
      /** Type of action. */
      type: v.literal("subAccountModify"),
      /** Sub-account address to modify. */
      subAccountUser: Address,
      /** New sub-account name. */
      name: v.pipe(v.string(), v.minLength(1), v.maxLength(16)),
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
export type SubAccountModifyRequest = v.InferOutput<typeof SubAccountModifyRequest>;

/**
 * Successful response without specific data or error response.
 * @see null
 */
export type SubAccountModifyResponse =
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
const SubAccountModifyActionSchema = /* @__PURE__ */ (() => {
  return v.object(SubAccountModifyRequest.entries.action.entries);
})();

/** Action parameters for the {@linkcode subAccountModify} function. */
export type SubAccountModifyParameters = Omit<v.InferInput<typeof SubAccountModifyActionSchema>, "type">;

/** Request options for the {@linkcode subAccountModify} function. */
export type SubAccountModifyOptions = ExtractRequestOptions<v.InferInput<typeof SubAccountModifyRequest>>;

/** Successful variant of {@linkcode SubAccountModifyResponse} without errors. */
export type SubAccountModifySuccessResponse = ExcludeErrorResponse<SubAccountModifyResponse>;

/**
 * Modify a sub-account.
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
 * import { subAccountModify } from "@nktkas/hyperliquid/api/exchange";
 * import { privateKeyToAccount } from "npm:viem/accounts";
 *
 * const wallet = privateKeyToAccount("0x..."); // viem or ethers
 * const transport = new HttpTransport(); // or `WebSocketTransport`
 *
 * await subAccountModify({ transport, wallet }, {
 *   subAccountUser: "0x...",
 *   name: "...",
 * });
 * ```
 *
 * @see null
 */
export function subAccountModify(
  config: ExchangeConfig,
  params: SubAccountModifyParameters,
  opts?: SubAccountModifyOptions,
): Promise<SubAccountModifySuccessResponse> {
  const action = parse(SubAccountModifyActionSchema, { type: "subAccountModify", ...params });
  return executeL1Action(config, action, opts);
}
