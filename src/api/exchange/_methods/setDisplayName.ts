import * as v from "@valibot/valibot";

// ============================================================
// API Schemas
// ============================================================

import { UnsignedInteger } from "../../_schemas.ts";
import { ErrorResponse, Nonce, Signature, SuccessResponse } from "./_base/schemas.ts";

/** Set the display name in the leaderboard. */
export const SetDisplayNameRequest = /* @__PURE__ */ (() => {
  return v.pipe(
    v.object({
      /** Action to perform. */
      action: v.pipe(
        v.object({
          /** Type of action. */
          type: v.pipe(
            v.literal("setDisplayName"),
            v.description("Type of action."),
          ),
          /**
           * Display name.
           *
           * Set to an empty string to remove the display name.
           */
          displayName: v.pipe(
            v.string(),
            v.description(
              "Display name." +
                "\n\nSet to an empty string to remove the display name.",
            ),
          ),
        }),
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
    v.description("Set the display name in the leaderboard."),
  );
})();
export type SetDisplayNameRequest = v.InferOutput<typeof SetDisplayNameRequest>;

/** Successful response without specific data or error response. */
export const SetDisplayNameResponse = /* @__PURE__ */ (() => {
  return v.pipe(
    v.union([SuccessResponse, ErrorResponse]),
    v.description("Successful response without specific data or error response."),
  );
})();
export type SetDisplayNameResponse = v.InferOutput<typeof SetDisplayNameResponse>;

// ============================================================
// Execution Logic
// ============================================================

import { type ExchangeConfig, executeL1Action, type ExtractRequestOptions } from "./_base/execute.ts";
import type { ExcludeErrorResponse } from "./_base/errors.ts";

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
 */
export function setDisplayName(
  config: ExchangeConfig,
  params: SetDisplayNameParameters,
  opts?: SetDisplayNameOptions,
): Promise<SetDisplayNameSuccessResponse> {
  const action = v.parse(SetDisplayNameParameters, params);
  return executeL1Action(config, { type: "setDisplayName", ...action }, opts);
}
