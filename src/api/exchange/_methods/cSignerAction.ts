import * as v from "@valibot/valibot";

// ============================================================
// API Schemas
// ============================================================

import { UnsignedInteger } from "../../_schemas.ts";
import { ErrorResponse, Nonce, Signature, SuccessResponse } from "./_base/schemas.ts";

/** Jail or unjail self as a validator signer. */
export const CSignerActionRequest = /* @__PURE__ */ (() => {
  return v.pipe(
    v.object({
      /** Action to perform. */
      action: v.pipe(
        v.union([
          v.object({
            /** Type of action. */
            type: v.pipe(
              v.literal("CSignerAction"),
              v.description("Type of action."),
            ),
            /** Jail the signer. */
            jailSelf: v.pipe(
              v.null(),
              v.description("Jail the signer."),
            ),
          }),
          v.object({
            /** Type of action. */
            type: v.pipe(
              v.literal("CSignerAction"),
              v.description("Type of action."),
            ),
            /** Unjail the signer. */
            unjailSelf: v.pipe(
              v.null(),
              v.description("Unjail the signer."),
            ),
          }),
        ]),
        v.description("Action to perform."),
      ),
      /** Nonce (timestamp in ms) used to prevent replay attacks. */
      nonce: Nonce,
      /** ECDSA signature components. */
      signature: Signature,
      /** Expiration time of the action. */
      expiresAfter: v.pipe(
        v.optional(UnsignedInteger),
        v.description("Expiration time of the action."),
      ),
    }),
    v.description("Jail or unjail self as a validator signer."),
  );
})();
export type CSignerActionRequest = v.InferOutput<typeof CSignerActionRequest>;

/** Successful response without specific data or error response. */
export const CSignerActionResponse = /* @__PURE__ */ (() => {
  return v.pipe(
    v.union([SuccessResponse, ErrorResponse]),
    v.description("Successful response without specific data or error response."),
  );
})();
export type CSignerActionResponse = v.InferOutput<typeof CSignerActionResponse>;

// ============================================================
// Execution Logic
// ============================================================

import { type ExchangeConfig, executeL1Action, type ExtractRequestOptions } from "./_base/execute.ts";
import type { ExcludeErrorResponse } from "./_base/errors.ts";

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
 * import { cSignerAction } from "@nktkas/hyperliquid/api/exchange";
 * import { privateKeyToAccount } from "npm:viem/accounts";
 *
 * const wallet = privateKeyToAccount("0x..."); // viem or ethers
 * const transport = new HttpTransport(); // or `WebSocketTransport`
 *
 * // Jail self
 * await cSignerAction(
 *   { transport, wallet },
 *   { jailSelf: null },
 * );
 *
 * // Unjail self
 * await cSignerAction(
 *   { transport, wallet },
 *   { unjailSelf: null },
 * );
 * ```
 */
export function cSignerAction(
  config: ExchangeConfig,
  params: CSignerActionParameters,
  opts?: CSignerActionOptions,
): Promise<CSignerActionSuccessResponse> {
  const action = v.parse(CSignerActionParameters, params);
  return executeL1Action(config, { type: "CSignerAction", ...action }, opts);
}
