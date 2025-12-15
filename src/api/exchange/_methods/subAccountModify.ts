import * as v from "@valibot/valibot";

// ============================================================
// API Schemas
// ============================================================

import { Address, UnsignedInteger } from "../../_schemas.ts";
import { ErrorResponse, SignatureSchema, SuccessResponse } from "./_base/commonSchemas.ts";

/** Modify a sub-account. */
export const SubAccountModifyRequest = /* @__PURE__ */ (() => {
  return v.pipe(
    v.object({
      /** Action to perform. */
      action: v.pipe(
        v.object({
          /** Type of action. */
          type: v.pipe(
            v.literal("subAccountModify"),
            v.description("Type of action."),
          ),
          /** Sub-account address to modify. */
          subAccountUser: v.pipe(
            Address,
            v.description("Sub-account address to modify."),
          ),
          /** New sub-account name. */
          name: v.pipe(
            v.string(),
            v.minLength(1),
            v.maxLength(16),
            v.description("New sub-account name."),
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
      /** Expiration time of the action. */
      expiresAfter: v.pipe(
        v.optional(UnsignedInteger),
        v.description("Expiration time of the action."),
      ),
    }),
    v.description("Modify a sub-account."),
  );
})();
export type SubAccountModifyRequest = v.InferOutput<typeof SubAccountModifyRequest>;

/** Successful response without specific data or error response. */
export const SubAccountModifyResponse = /* @__PURE__ */ (() => {
  return v.pipe(
    v.union([SuccessResponse, ErrorResponse]),
    v.description("Successful response without specific data or error response."),
  );
})();
export type SubAccountModifyResponse = v.InferOutput<typeof SubAccountModifyResponse>;

// ============================================================
// Execution Logic
// ============================================================

import { type ExchangeConfig, executeL1Action, type ExtractRequestOptions } from "./_base/execute.ts";
import type { ExcludeErrorResponse } from "./_base/errors.ts";

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
 */
export function subAccountModify(
  config: ExchangeConfig,
  params: SubAccountModifyParameters,
  opts?: SubAccountModifyOptions,
): Promise<SubAccountModifySuccessResponse> {
  const action = v.parse(SubAccountModifyParameters, params);
  return executeL1Action(config, { type: "subAccountModify", ...action }, opts);
}
