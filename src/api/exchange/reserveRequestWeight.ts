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
 * Reserve additional rate-limited actions for a fee.
 * @see https://hyperliquid.gitbook.io/hyperliquid-docs/for-developers/api/exchange-endpoint#reserve-additional-actions
 */
export const ReserveRequestWeightRequest = /* @__PURE__ */ (() => {
  return v.pipe(
    v.object({
      /** Action to perform. */
      action: v.pipe(
        v.object({
          /** Type of action. */
          type: v.pipe(
            v.literal("reserveRequestWeight"),
            v.description("Type of action."),
          ),
          /** Amount of request weight to reserve. */
          weight: v.pipe(
            UnsignedInteger,
            v.description("Amount of request weight to reserve."),
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
    v.description("Reserve additional rate-limited actions for a fee."),
  );
})();
export type ReserveRequestWeightRequest = v.InferOutput<typeof ReserveRequestWeightRequest>;

import { SuccessResponse } from "./_base.ts";
export { SuccessResponse };

// -------------------- Function --------------------

/** Action parameters for the {@linkcode reserveRequestWeight} function. */
export type ReserveRequestWeightParameters = ExtractRequestAction<v.InferInput<typeof ReserveRequestWeightRequest>>;
/** Request options for the {@linkcode reserveRequestWeight} function. */
export type ReserveRequestWeightOptions = ExtractRequestOptions<v.InferInput<typeof ReserveRequestWeightRequest>>;

/**
 * Reserve additional rate-limited actions for a fee.
 * @param config - General configuration for Exchange API requests.
 * @param params - Parameters specific to the API request.
 * @param opts - Request execution options.
 * @returns Successful response without specific data.
 *
 * @throws {ApiRequestError} When the API returns an unsuccessful response.
 * @throws {TransportError} When the transport layer throws an error.
 *
 * @see https://hyperliquid.gitbook.io/hyperliquid-docs/for-developers/api/exchange-endpoint#reserve-additional-actions
 * @example
 * ```ts
 * import { HttpTransport } from "@nktkas/hyperliquid";
 * import { reserveRequestWeight } from "@nktkas/hyperliquid/api/exchange";
 * import { privateKeyToAccount } from "npm:viem/accounts";
 *
 * const wallet = privateKeyToAccount("0x..."); // viem or ethers
 * const transport = new HttpTransport(); // or `WebSocketTransport`
 *
 * await reserveRequestWeight(
 *   { transport, wallet },
 *   { weight: 10 },
 * );
 * ```
 */
export async function reserveRequestWeight(
  config: ExchangeRequestConfig | MultiSignRequestConfig,
  params: DeepImmutable<ReserveRequestWeightParameters>,
  opts?: ReserveRequestWeightOptions,
): Promise<SuccessResponse> {
  const action = parser(ReserveRequestWeightRequest.entries.action)({
    type: "reserveRequestWeight",
    ...params,
  });
  const expiresAfter = typeof config.defaultExpiresAfter === "number"
    ? config.defaultExpiresAfter
    : await config.defaultExpiresAfter?.();
  return await executeL1Action(config, { action, expiresAfter }, opts?.signal);
}
