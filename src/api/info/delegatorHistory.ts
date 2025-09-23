import * as v from "valibot";
import { Address, type DeepImmutable, Hex, parser, UnsignedDecimal, UnsignedInteger } from "../_common.ts";
import type { InfoRequestConfig } from "./_common.ts";

// -------------------- Schemas --------------------

/**
 * Request user staking history.
 * @see https://hyperliquid.gitbook.io/hyperliquid-docs/for-developers/api/info-endpoint#query-a-users-staking-history
 */
export const DelegatorHistoryRequest = /* @__PURE__ */ (() => {
  return v.pipe(
    v.object({
      /** Type of request. */
      type: v.pipe(
        v.literal("delegatorHistory"),
        v.description("Type of request."),
      ),
      /** User address. */
      user: v.pipe(
        Address,
        v.description("User address."),
      ),
    }),
    v.description("Request user staking history."),
  );
})();
export type DelegatorHistoryRequest = v.InferOutput<typeof DelegatorHistoryRequest>;

/**
 * Array of records of staking events by a delegator.
 * @see https://hyperliquid.gitbook.io/hyperliquid-docs/for-developers/api/info-endpoint#query-a-users-staking-history
 */
export const DelegatorHistoryResponse = /* @__PURE__ */ (() => {
  return v.pipe(
    v.array(
      /** Record of a staking event by a delegator. */
      v.pipe(
        v.object({
          /** Timestamp of the delegation event (in ms since epoch). */
          time: v.pipe(
            UnsignedInteger,
            v.description("Timestamp of the delegation event (in ms since epoch)."),
          ),
          /** Transaction hash of the delegation event. */
          hash: v.pipe(
            v.pipe(Hex, v.length(66)),
            v.description("Transaction hash of the delegation event."),
          ),
          /** Details of the update. */
          delta: v.pipe(
            v.union([
              v.object({
                /** Delegation operation details. */
                delegate: v.pipe(
                  v.object({
                    /** Address of the validator receiving or losing delegation. */
                    validator: v.pipe(
                      Address,
                      v.description("Address of the validator receiving or losing delegation."),
                    ),
                    /** Amount of tokens being delegated or undelegated. */
                    amount: v.pipe(
                      UnsignedDecimal,
                      v.description("Amount of tokens being delegated or undelegated."),
                    ),
                    /** Whether this is an undelegation operation. */
                    isUndelegate: v.pipe(
                      v.boolean(),
                      v.description("Whether this is an undelegation operation."),
                    ),
                  }),
                  v.description("Delegation operation details."),
                ),
              }),
              v.object({
                /** Deposit details. */
                cDeposit: v.pipe(
                  v.object({
                    /** Amount of tokens being deposited. */
                    amount: v.pipe(
                      UnsignedDecimal,
                      v.description("Amount of tokens being deposited."),
                    ),
                  }),
                  v.description("Deposit details."),
                ),
              }),
              v.object({
                /** Withdrawal details. */
                withdrawal: v.pipe(
                  v.object({
                    /** Amount of tokens being withdrawn. */
                    amount: v.pipe(
                      UnsignedDecimal,
                      v.description("Amount of tokens being withdrawn."),
                    ),
                    /** Phase of the withdrawal process. */
                    phase: v.pipe(
                      v.union([v.literal("initiated"), v.literal("finalized")]),
                      v.description("Phase of the withdrawal process."),
                    ),
                  }),
                  v.description("Withdrawal details."),
                ),
              }),
            ]),
            v.description("Details of the update."),
          ),
        }),
        v.description("Record of a staking event by a delegator."),
      ),
    ),
    v.description("Array of records of staking events by a delegator."),
  );
})();
export type DelegatorHistoryResponse = v.InferOutput<typeof DelegatorHistoryResponse>;

// -------------------- Function --------------------

/** Request parameters for the {@linkcode delegatorHistory} function. */
export type DelegatorHistoryParameters = Omit<v.InferInput<typeof DelegatorHistoryRequest>, "type">;

/**
 * Request user staking history.
 * @param config - General configuration for Info API requests.
 * @param params - Parameters specific to the API request.
 * @param signal - An [`AbortSignal`](https://developer.mozilla.org/en-US/docs/Web/API/AbortSignal) can be used to cancel the request by calling [`abort()`](https://developer.mozilla.org/en-US/docs/Web/API/AbortController/abort) on the corresponding [`AbortController`](https://developer.mozilla.org/en-US/docs/Web/API/AbortController).
 * @returns Array of records of staking events by a delegator.
 *
 * @throws {TransportError} When the transport layer throws an error.
 *
 * @see https://hyperliquid.gitbook.io/hyperliquid-docs/for-developers/api/info-endpoint#query-a-users-staking-history
 * @example
 * ```ts
 * import { HttpTransport } from "@nktkas/hyperliquid";
 * import { delegatorHistory } from "@nktkas/hyperliquid/api/info";
 *
 * const transport = new HttpTransport(); // or `WebSocketTransport`
 * const data = await delegatorHistory(
 *   { transport },
 *   { user: "0x..." },
 * );
 * ```
 */
export function delegatorHistory(
  config: InfoRequestConfig,
  params: DeepImmutable<DelegatorHistoryParameters>,
  signal?: AbortSignal,
): Promise<DelegatorHistoryResponse> {
  const request = parser(DelegatorHistoryRequest)({
    type: "delegatorHistory",
    ...params,
  });
  return config.transport.request("info", request, signal);
}
