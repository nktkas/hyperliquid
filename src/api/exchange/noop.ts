import { parser, UnsignedInteger } from "../_common.ts";
import {
  type ExchangeRequestConfig,
  executeL1Action,
  type ExtractRequestOptions,
  type MultiSignRequestConfig,
  Signature,
} from "./_common.ts";
import * as v from "valibot";

// -------------------- Schemas --------------------

/**
 * This action does not do anything (no operation), but causes the nonce to be marked as used.
 * @see https://hyperliquid.gitbook.io/hyperliquid-docs/for-developers/api/exchange-endpoint#invalidate-pending-nonce-noop
 */
export const NoopRequest = /* @__PURE__ */ (() => {
  return v.pipe(
    v.object({
      /** Action to perform. */
      action: v.pipe(
        v.object({
          /** Type of action. */
          type: v.pipe(
            v.literal("noop"),
            v.description("Type of action."),
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
    v.description("This action does not do anything (no operation), but causes the nonce to be marked as used."),
  );
})();
export type NoopRequest = v.InferOutput<typeof NoopRequest>;

import { SuccessResponse } from "./_common.ts";
export { SuccessResponse };

// -------------------- Function --------------------

/** Request options for the {@linkcode noop} function. */
export type NoopOptions = ExtractRequestOptions<v.InferInput<typeof NoopRequest>>;

/**
 * This action does not do anything (no operation), but causes the nonce to be marked as used.
 * @param config - General configuration for Exchange API requests.
 * @param params - Parameters specific to the API request.
 * @param opts - Request execution options.
 * @returns Successful response without specific data.
 *
 * @throws {ApiRequestError} When the API returns an unsuccessful response.
 * @throws {TransportError} When the transport layer throws an error.
 *
 * @see https://hyperliquid.gitbook.io/hyperliquid-docs/for-developers/api/exchange-endpoint#invalidate-pending-nonce-noop
 * @example
 * ```ts
 * import { HttpTransport } from "@nktkas/hyperliquid";
 * import { noop } from "@nktkas/hyperliquid/api/exchange";
 * import { privateKeyToAccount } from "npm:viem/accounts";
 *
 * const wallet = privateKeyToAccount("0x..."); // viem or ethers
 * const transport = new HttpTransport(); // or `WebSocketTransport`
 *
 * await noop({ transport, wallet });
 * ```
 */
export async function noop(
  config: ExchangeRequestConfig | MultiSignRequestConfig,
  opts?: NoopOptions,
): Promise<SuccessResponse> {
  const action = parser(NoopRequest.entries.action)({
    type: "noop",
  });
  const expiresAfter = typeof config.defaultExpiresAfter === "number"
    ? config.defaultExpiresAfter
    : await config.defaultExpiresAfter?.();
  return await executeL1Action(config, { action, expiresAfter }, opts?.signal);
}
