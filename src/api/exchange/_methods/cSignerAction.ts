import * as v from "@valibot/valibot";

// ============================================================
// API Schemas
// ============================================================

import { Hex, UnsignedInteger } from "../../_schemas.ts";

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
export type CSignerActionRequest = v.InferOutput<typeof CSignerActionRequest>;

/**
 * Successful response without specific data or error response.
 * @see null
 */
export type CSignerActionResponse =
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
const CSignerActionActionSchema = /* @__PURE__ */ (() => {
  return v.variant("type", CSignerActionRequest.entries.action.options);
})();

/** Action parameters for the {@linkcode cSignerAction} function. */
export type CSignerActionParameters = v.InferInput<typeof CSignerActionActionSchema> extends infer T
  ? T extends unknown ? { [K in Exclude<keyof T, "type">]: T[K] } : never
  : never;

/** Request options for the {@linkcode cSignerAction} function. */
export type CSignerActionOptions = ExtractRequestOptions<v.InferInput<typeof CSignerActionRequest>>;

/** Successful variant of {@linkcode CSignerActionResponse} without errors. */
export type CSignerActionSuccessResponse = ExcludeErrorResponse<CSignerActionResponse>;

/**
 * Jail or unjail self as a validator signer.
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
 * @example Jail self
 * ```ts
 * import { HttpTransport } from "@nktkas/hyperliquid";
 * import { cSignerAction } from "@nktkas/hyperliquid/api/exchange";
 * import { privateKeyToAccount } from "npm:viem/accounts";
 *
 * const wallet = privateKeyToAccount("0x..."); // viem or ethers
 * const transport = new HttpTransport(); // or `WebSocketTransport`
 *
 * await cSignerAction({ transport, wallet }, {
 *   jailSelf: null,
 * });
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
 * await cSignerAction({ transport, wallet }, {
 *   unjailSelf: null,
 * });
 * ```
 *
 * @see null
 */
export function cSignerAction(
  config: ExchangeConfig,
  params: CSignerActionParameters,
  opts?: CSignerActionOptions,
): Promise<CSignerActionSuccessResponse> {
  const action = canonicalize(
    CSignerActionActionSchema,
    parse(CSignerActionActionSchema, { type: "CSignerAction", ...params }),
  );
  return executeL1Action(config, action, opts);
}
