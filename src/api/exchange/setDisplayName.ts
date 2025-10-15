import { type DeepImmutable, parser, UnsignedInteger } from "../_base.ts";
import {
  type ExchangeRequestConfig,
  executeL1Action,
  type ExtractRequestAction,
  type ExtractRequestOptions,
  type MultiSignRequestConfig,
  Signature,
} from "./_base.ts";
import * as v from "valibot";

// -------------------- Schemas --------------------

/**
 * Set the display name in the leaderboard.
 * @see null
 */
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

import { SuccessResponse } from "./_base.ts";
export { SuccessResponse };

// -------------------- Function --------------------

/** Action parameters for the {@linkcode setDisplayName} function. */
export type SetDisplayNameParameters = ExtractRequestAction<v.InferInput<typeof SetDisplayNameRequest>>;
/** Request options for the {@linkcode setDisplayName} function. */
export type SetDisplayNameOptions = ExtractRequestOptions<v.InferInput<typeof SetDisplayNameRequest>>;

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
 * @see null
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
export async function setDisplayName(
  config: ExchangeRequestConfig | MultiSignRequestConfig,
  params: DeepImmutable<SetDisplayNameParameters>,
  opts?: SetDisplayNameOptions,
): Promise<SuccessResponse> {
  const action = parser(SetDisplayNameRequest.entries.action)({
    type: "setDisplayName",
    ...params,
  });
  const expiresAfter = typeof config.defaultExpiresAfter === "number"
    ? config.defaultExpiresAfter
    : await config.defaultExpiresAfter?.();
  return await executeL1Action(config, { action, expiresAfter }, opts?.signal);
}
