import * as v from "valibot";

// ============================================================
// API Schemas
// ============================================================

import { UnsignedInteger } from "../_base.ts";
import { ErrorResponse, Signature, SuccessResponse } from "./_base/mod.ts";

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
      /** Unique request identifier (current timestamp in ms). */
      nonce: v.pipe(
        UnsignedInteger,
        v.description("Unique request identifier (current timestamp in ms)."),
      ),
      /** Cryptographic signature. */
      signature: v.pipe(
        Signature,
        v.description("Cryptographic signature."),
      ),
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

import { type DeepImmutable, parser } from "../_base.ts";
import {
  type ExchangeRequestConfig,
  type ExcludeErrorResponse,
  executeL1Action,
  type ExtractRequestAction,
  type ExtractRequestOptions,
  type MultiSignRequestConfig,
} from "./_base/mod.ts";

/** Action parameters for the {@linkcode setDisplayName} function. */
export type SetDisplayNameParameters = ExtractRequestAction<v.InferInput<typeof SetDisplayNameRequest>>;

/** Request options for the {@linkcode setDisplayName} function. */
export type SetDisplayNameOptions = ExtractRequestOptions<v.InferInput<typeof SetDisplayNameRequest>>;

/** Successful variant of {@linkcode SetDisplayNameResponse} without errors. */
export type SetDisplayNameSuccessResponse = ExcludeErrorResponse<SetDisplayNameResponse>;

/**
 * Set the display name in the leaderboard.
 * @param config - General configuration for Exchange API requests.
 * @param params - Parameters specific to the API request.
 * @param opts - Request execution options.
 * @returns Successful response without specific data.
 *
 * @throws {ApiRequestError} When the API returns an unsuccessful response.
 * @throws {TransportError} When the transport layer throws an error.
 *
 * @example
 * ```ts
 * import { HttpTransport } from "@nktkas/hyperliquid";
 * import { setDisplayName } from "@nktkas/hyperliquid/api/exchange";
 * import { privateKeyToAccount } from "viem/accounts";
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
export async function setDisplayName(
  config: ExchangeRequestConfig | MultiSignRequestConfig,
  params: DeepImmutable<SetDisplayNameParameters>,
  opts?: SetDisplayNameOptions,
): Promise<SetDisplayNameSuccessResponse> {
  const request = parser(SetDisplayNameRequest)({
    action: {
      type: "setDisplayName",
      ...params,
    },
    nonce: 0, // Placeholder; actual nonce generated in `executeL1Action`
    signature: { // Placeholder; actual signature generated in `executeL1Action`
      r: "0x0000000000000000000000000000000000000000000000000000000000000000",
      s: "0x0000000000000000000000000000000000000000000000000000000000000000",
      v: 27,
    },
    expiresAfter: typeof config.defaultExpiresAfter === "number"
      ? config.defaultExpiresAfter
      : await config.defaultExpiresAfter?.(),
  });
  return await executeL1Action(config, request, opts?.signal);
}
