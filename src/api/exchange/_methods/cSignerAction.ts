import * as v from "@valibot/valibot";

// ============================================================
// API Schemas
// ============================================================

import { UnsignedInteger } from "../../_schemas.ts";
import { type ErrorResponse, SignatureSchema, type SuccessResponse } from "./_base/commonSchemas.ts";

/**
 * Jail or unjail self as a validator signer.
 * @see null
 */
export const CSignerActionRequest = /* @__PURE__ */ (() => {
  return v.object({
    /** Action to jail or unjail the signer. */
    action: v.variant("type", [
      v.object({
        /** Type of action. */
        type: v.literal("CSignerAction"),
        /** Jail the signer. */
        jailSelf: v.null(),
      }),
      v.object({
        /** Type of action. */
        type: v.literal("CSignerAction"),
        /** Unjail the signer. */
        unjailSelf: v.null(),
      }),
    ]),
    /** Nonce (timestamp in ms) used to prevent replay attacks. */
    nonce: UnsignedInteger,
    /** ECDSA signature components. */
    signature: SignatureSchema,
    /** Expiration time of the action. */
    expiresAfter: v.optional(UnsignedInteger),
  });
})();
export type CSignerActionRequest = v.InferOutput<typeof CSignerActionRequest>;

/**
 * Successful response without specific data or error response.
 * @see null
 */
export type CSignerActionResponse = SuccessResponse | ErrorResponse;

// ============================================================
// Execution Logic
// ============================================================

import type { ExcludeErrorResponse } from "./_base/errors.ts";
import { type ExchangeConfig, executeL1Action, type ExtractRequestOptions } from "./_base/execute.ts";

/** Schema for user-provided action parameters (excludes system fields). */
const CSignerActionParameters = /* @__PURE__ */ (() => {
  return v.union(
    CSignerActionRequest.entries.action.options.map((option) => v.omit(option, ["type"])),
  );
})();

/** Action parameters for the {@linkcode cSignerAction} function. */
export type CSignerActionParameters = v.InferInput<typeof CSignerActionParameters>;

/** Request options for the {@linkcode cSignerAction} function. */
export type CSignerActionOptions = ExtractRequestOptions<v.InferInput<typeof CSignerActionRequest>>;

/** Successful variant of {@linkcode CSignerActionResponse} without errors. */
export type CSignerActionSuccessResponse = ExcludeErrorResponse<CSignerActionResponse>;

/**
 * Jail or unjail self as a validator signer.
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
 * @example Jail self
 * ```ts
 * import { HttpTransport } from "@nktkas/hyperliquid";
 * import { cSignerAction } from "@nktkas/hyperliquid/api/exchange";
 * import { privateKeyToAccount } from "npm:viem/accounts";
 *
 * const wallet = privateKeyToAccount("0x..."); // viem or ethers
 * const transport = new HttpTransport(); // or `WebSocketTransport`
 *
 * await cSignerAction(
 *   { transport, wallet },
 *   { jailSelf: null },
 * );
 * ```
 *
 * @example Unjail self
 * ```ts
 * import { HttpTransport } from "@nktkas/hyperliquid";
 * import { cSignerAction } from "@nktkas/hyperliquid/api/exchange";
 * import { privateKeyToAccount } from "npm:viem/accounts";
 *
 * const wallet = privateKeyToAccount("0x..."); // viem or ethers
 * const transport = new HttpTransport(); // or `WebSocketTransport`
 *
 * await cSignerAction(
 *   { transport, wallet },
 *   { unjailSelf: null },
 * );
 * ```
 *
 * @see null
 */
export function cSignerAction(
  config: ExchangeConfig,
  params: CSignerActionParameters,
  opts?: CSignerActionOptions,
): Promise<CSignerActionSuccessResponse> {
  const action = v.parse(CSignerActionParameters, params);
  return executeL1Action(config, { type: "CSignerAction", ...action }, opts);
}
