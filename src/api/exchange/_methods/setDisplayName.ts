import * as v from "@valibot/valibot";

// ============================================================
// API Schemas
// ============================================================

import { UnsignedInteger } from "../../_schemas.ts";
import { type ErrorResponse, SignatureSchema, type SuccessResponse } from "./_base/commonSchemas.ts";

/**
 * Set the display name in the leaderboard.
 * @see null
 */
export const SetDisplayNameRequest = /* @__PURE__ */ (() => {
  return v.object({
    /** Action to perform. */
    action: v.object({
      /** Type of action. */
      type: v.literal("setDisplayName"),
      /**
       * Display name.
       * Set to an empty string to remove the display name.
       */
      displayName: v.pipe(v.string(), v.maxLength(20)),
    }),
    /** Nonce (timestamp in ms) used to prevent replay attacks. */
    nonce: UnsignedInteger,
    /** ECDSA signature components. */
    signature: SignatureSchema,
    /** Expiration time of the action. */
    expiresAfter: v.optional(UnsignedInteger),
  });
})();
export type SetDisplayNameRequest = v.InferOutput<typeof SetDisplayNameRequest>;

/**
 * Successful response without specific data or error response.
 * @see null
 */
export type SetDisplayNameResponse = SuccessResponse | ErrorResponse;

// ============================================================
// Execution Logic
// ============================================================

import type { ExcludeErrorResponse } from "./_base/errors.ts";
import { type ExchangeConfig, executeL1Action, type ExtractRequestOptions } from "./_base/execute.ts";

/** Schema for user-provided action parameters (excludes system fields). */
const SetDisplayNameParameters = /* @__PURE__ */ (() => {
  return v.omit(
    v.object(SetDisplayNameRequest.entries.action.entries),
    ["type"],
  );
})();

/** Action parameters for the {@linkcode setDisplayName} function. */
export type SetDisplayNameParameters = v.InferInput<typeof SetDisplayNameParameters>;

/** Request options for the {@linkcode setDisplayName} function. */
export type SetDisplayNameOptions = ExtractRequestOptions<v.InferInput<typeof SetDisplayNameRequest>>;

/** Successful variant of {@linkcode SetDisplayNameResponse} without errors. */
export type SetDisplayNameSuccessResponse = ExcludeErrorResponse<SetDisplayNameResponse>;

/**
 * Set the display name in the leaderboard.
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
 * @example
 * ```ts
 * import { HttpTransport } from "@nktkas/hyperliquid";
 * import { setDisplayName } from "@nktkas/hyperliquid/api/exchange";
 * import { privateKeyToAccount } from "npm:viem/accounts";
 *
 * const wallet = privateKeyToAccount("0x..."); // viem or ethers
 * const transport = new HttpTransport(); // or `WebSocketTransport`
 *
 * await setDisplayName(
 *   { transport, wallet },
 *   { displayName: "..." },
 * );
 * ```
 *
 * @see null
 */
export function setDisplayName(
  config: ExchangeConfig,
  params: SetDisplayNameParameters,
  opts?: SetDisplayNameOptions,
): Promise<SetDisplayNameSuccessResponse> {
  const action = v.parse(SetDisplayNameParameters, params);
  return executeL1Action(config, { type: "setDisplayName", ...action }, opts);
}
