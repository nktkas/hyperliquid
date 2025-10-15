import * as v from "valibot";
import { Address, type DeepImmutable, parser, UnsignedDecimal, UnsignedInteger } from "../_base.ts";
import type { InfoRequestConfig } from "./_base.ts";

// -------------------- Schemas --------------------

/**
 * Request user staking delegations.
 * @see https://hyperliquid.gitbook.io/hyperliquid-docs/for-developers/api/info-endpoint#query-a-users-staking-delegations
 */
export const DelegationsRequest = /* @__PURE__ */ (() => {
  return v.pipe(
    v.object({
      /** Type of request. */
      type: v.pipe(
        v.literal("delegations"),
        v.description("Type of request."),
      ),
      /** User address. */
      user: v.pipe(
        Address,
        v.description("User address."),
      ),
    }),
    v.description("Request user staking delegations."),
  );
})();
export type DelegationsRequest = v.InferOutput<typeof DelegationsRequest>;

/**
 * Array of user's delegations to validators.
 * @see https://hyperliquid.gitbook.io/hyperliquid-docs/for-developers/api/info-endpoint#query-a-users-staking-delegations
 */
export const DelegationsResponse = /* @__PURE__ */ (() => {
  return v.pipe(
    v.array(
      /** User delegation to a validator. */
      v.pipe(
        v.object({
          /** Validator address. */
          validator: v.pipe(
            Address,
            v.description("Validator address."),
          ),
          /** Amount of tokens delegated to the validator. */
          amount: v.pipe(
            UnsignedDecimal,
            v.description("Amount of tokens delegated to the validator."),
          ),
          /** Locked until timestamp (in ms since epoch). */
          lockedUntilTimestamp: v.pipe(
            UnsignedInteger,
            v.description("Locked until timestamp (in ms since epoch)."),
          ),
        }),
        v.description("User delegation to a validator."),
      ),
    ),
    v.description("Array of user's delegations to validators."),
  );
})();
export type DelegationsResponse = v.InferOutput<typeof DelegationsResponse>;

// -------------------- Function --------------------

/** Request parameters for the {@linkcode delegations} function. */
export type DelegationsParameters = Omit<v.InferInput<typeof DelegationsRequest>, "type">;

/**
 * Request user staking delegations.
 * @param config - General configuration for Info API requests.
 * @param params - Parameters specific to the API request.
 * @param signal - An [`AbortSignal`](https://developer.mozilla.org/en-US/docs/Web/API/AbortSignal) can be used to cancel the request by calling [`abort()`](https://developer.mozilla.org/en-US/docs/Web/API/AbortController/abort) on the corresponding [`AbortController`](https://developer.mozilla.org/en-US/docs/Web/API/AbortController).
 * @returns Array of user's delegations to validators.
 *
 * @throws {TransportError} When the transport layer throws an error.
 *
 * @see https://hyperliquid.gitbook.io/hyperliquid-docs/for-developers/api/info-endpoint#query-a-users-staking-delegations
 * @example
 * ```ts
 * import { HttpTransport } from "@nktkas/hyperliquid";
 * import { delegations } from "@nktkas/hyperliquid/api/info";
 *
 * const transport = new HttpTransport(); // or `WebSocketTransport`
 * const data = await delegations(
 *   { transport },
 *   { user: "0x..." },
 * );
 * ```
 */
export function delegations(
  config: InfoRequestConfig,
  params: DeepImmutable<DelegationsParameters>,
  signal?: AbortSignal,
): Promise<DelegationsResponse> {
  const request = parser(DelegationsRequest)({
    type: "delegations",
    ...params,
  });
  return config.transport.request("info", request, signal);
}
