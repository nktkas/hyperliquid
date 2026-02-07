import * as v from "@valibot/valibot";

// ============================================================
// API Schemas
// ============================================================

import { UnsignedInteger } from "../../_schemas.ts";
import { type ErrorResponse, SignatureSchema } from "./_base/commonSchemas.ts";

/**
 * Create a sub-account.
 */
export const CreateSubAccountRequest = /* @__PURE__ */ (() => {
  return v.object({
    /** Action to perform. */
    action: v.object({
      /** Type of action. */
      type: v.literal("createSubAccount"),
      /** Sub-account name. */
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
export type CreateSubAccountRequest = v.InferOutput<typeof CreateSubAccountRequest>;

/**
 * Response for creating a sub-account.
 */
export type CreateSubAccountResponse = {
  /** Successful status. */
  status: "ok";
  /** Response details. */
  response: {
    /** Type of response. */
    type: "createSubAccount";
    /**
     * Sub-account address.
     * @pattern ^0x[a-fA-F0-9]{40}$
     */
    data: `0x${string}`;
  };
} | ErrorResponse;

// ============================================================
// Execution Logic
// ============================================================

import { type ExchangeConfig, executeL1Action, type ExtractRequestOptions } from "./_base/execute.ts";
import type { ExcludeErrorResponse } from "./_base/errors.ts";

/** Schema for user-provided action parameters (excludes system fields). */
const CreateSubAccountParameters = /* @__PURE__ */ (() => {
  return v.omit(
    v.object(CreateSubAccountRequest.entries.action.entries),
    ["type"],
  );
})();
/** Action parameters for the {@linkcode createSubAccount} function. */
export type CreateSubAccountParameters = v.InferInput<typeof CreateSubAccountParameters>;

/** Request options for the {@linkcode createSubAccount} function. */
export type CreateSubAccountOptions = ExtractRequestOptions<v.InferInput<typeof CreateSubAccountRequest>>;

/** Successful variant of {@linkcode CreateSubAccountResponse} without errors. */
export type CreateSubAccountSuccessResponse = ExcludeErrorResponse<CreateSubAccountResponse>;

/**
 * Create a sub-account.
 *
 * @param config - General configuration for Exchange API requests.
 * @param params - Parameters specific to the API request.
 * @param opts - Request execution options.
 *
 * @returns Response for creating a sub-account.
 *
 * @throws {ValiError} When the request parameters fail validation (before sending).
 * @throws {TransportError} When the transport layer throws an error.
 * @throws {ApiRequestError} When the API returns an unsuccessful response.
 *
 * @example
 * ```ts
 * import { HttpTransport } from "@nktkas/hyperliquid";
 * import { createSubAccount } from "@nktkas/hyperliquid/api/exchange";
 * import { privateKeyToAccount } from "npm:viem/accounts";
 *
 * const wallet = privateKeyToAccount("0x..."); // viem or ethers
 * const transport = new HttpTransport(); // or `WebSocketTransport`
 *
 * const data = await createSubAccount(
 *   { transport, wallet },
 *   { name: "..." },
 * );
 * ```
 */
export function createSubAccount(
  config: ExchangeConfig,
  params: CreateSubAccountParameters,
  opts?: CreateSubAccountOptions,
): Promise<CreateSubAccountSuccessResponse> {
  const action = v.parse(CreateSubAccountParameters, params);
  return executeL1Action(config, { type: "createSubAccount", ...action }, opts);
}
