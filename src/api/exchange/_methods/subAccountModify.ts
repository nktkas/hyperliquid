import * as v from "@valibot/valibot";

// ============================================================
// API Schemas
// ============================================================

import { Address, UnsignedInteger } from "../../_schemas.ts";
import { type ErrorResponse, SignatureSchema, type SuccessResponse } from "./_base/commonSchemas.ts";

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
    signature: SignatureSchema,
    /** Expiration time of the action. */
    expiresAfter: v.optional(UnsignedInteger),
  });
})();
export type SubAccountModifyRequest = v.InferOutput<typeof SubAccountModifyRequest>;

/**
 * Successful response without specific data or error response.
 * @see null
 */
export type SubAccountModifyResponse = SuccessResponse | ErrorResponse;

// ============================================================
// Execution Logic
// ============================================================

import { parse } from "../../../_base.ts";
import type { ExcludeErrorResponse } from "./_base/errors.ts";
import { type ExchangeConfig, executeL1Action, type ExtractRequestOptions } from "./_base/execute.ts";

/** Schema for user-provided action parameters (excludes system fields). */
const SubAccountModifyParameters = /* @__PURE__ */ (() => {
  return v.omit(
    v.object(SubAccountModifyRequest.entries.action.entries),
    ["type"],
  );
})();

/** Action parameters for the {@linkcode subAccountModify} function. */
export type SubAccountModifyParameters = v.InferInput<typeof SubAccountModifyParameters>;

/** Request options for the {@linkcode subAccountModify} function. */
export type SubAccountModifyOptions = ExtractRequestOptions<v.InferInput<typeof SubAccountModifyRequest>>;

/** Successful variant of {@linkcode SubAccountModifyResponse} without errors. */
export type SubAccountModifySuccessResponse = ExcludeErrorResponse<SubAccountModifyResponse>;

/**
 * Modify a sub-account.
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
 * await subAccountModify(
 *   { transport, wallet },
 *   { subAccountUser: "0x...", name: "..."  },
 * );
 * ```
 *
 * @see null
 */
export function subAccountModify(
  config: ExchangeConfig,
  params: SubAccountModifyParameters,
  opts?: SubAccountModifyOptions,
): Promise<SubAccountModifySuccessResponse> {
  const action = parse(SubAccountModifyParameters, params);
  return executeL1Action(config, { type: "subAccountModify", ...action }, opts);
}
