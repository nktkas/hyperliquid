import * as v from "valibot";
import { Address, type DeepImmutable, parser, UnsignedDecimal, UnsignedInteger } from "../_common.ts";
import type { InfoRequestConfig } from "./_common.ts";

// -------------------- Schemas --------------------

/**
 * Request user's staking summary.
 * @see https://hyperliquid.gitbook.io/hyperliquid-docs/for-developers/api/info-endpoint#query-a-users-staking-summary
 */
export const DelegatorSummaryRequest = /* @__PURE__ */ (() => {
  return v.pipe(
    v.object({
      /** Type of request. */
      type: v.pipe(
        v.literal("delegatorSummary"),
        v.description("Type of request."),
      ),
      /** User address. */
      user: v.pipe(
        Address,
        v.description("User address."),
      ),
    }),
    v.description("Request user's staking summary."),
  );
})();
export type DelegatorSummaryRequest = v.InferOutput<typeof DelegatorSummaryRequest>;

/**
 * User's staking summary.
 * @see https://hyperliquid.gitbook.io/hyperliquid-docs/for-developers/api/info-endpoint#query-a-users-staking-summary
 */
export const DelegatorSummaryResponse = /* @__PURE__ */ (() => {
  return v.pipe(
    v.object({
      /** Total amount of delegated tokens. */
      delegated: v.pipe(
        UnsignedDecimal,
        v.description("Total amount of delegated tokens."),
      ),
      /** Total amount of undelegated tokens. */
      undelegated: v.pipe(
        UnsignedDecimal,
        v.description("Total amount of undelegated tokens."),
      ),
      /** Total amount of tokens pending withdrawal. */
      totalPendingWithdrawal: v.pipe(
        UnsignedDecimal,
        v.description("Total amount of tokens pending withdrawal."),
      ),
      /** Number of pending withdrawals. */
      nPendingWithdrawals: v.pipe(
        UnsignedInteger,
        v.description("Number of pending withdrawals."),
      ),
    }),
    v.description("User's staking summary."),
  );
})();
export type DelegatorSummaryResponse = v.InferOutput<typeof DelegatorSummaryResponse>;

// -------------------- Function --------------------

/** Request parameters for the {@linkcode delegatorSummary} function. */
export type DelegatorSummaryParameters = Omit<v.InferInput<typeof DelegatorSummaryRequest>, "type">;

/**
 * Request user's staking summary.
 * @param config - General configuration for Info API requests.
 * @param params - Parameters specific to the API request.
 * @param signal - An [`AbortSignal`](https://developer.mozilla.org/en-US/docs/Web/API/AbortSignal) can be used to cancel the request by calling [`abort()`](https://developer.mozilla.org/en-US/docs/Web/API/AbortController/abort) on the corresponding [`AbortController`](https://developer.mozilla.org/en-US/docs/Web/API/AbortController).
 * @returns User's staking summary.
 *
 * @throws {TransportError} When the transport layer throws an error.
 *
 * @see https://hyperliquid.gitbook.io/hyperliquid-docs/for-developers/api/info-endpoint#query-a-users-staking-summary
 * @example
 * ```ts
 * import { HttpTransport } from "@nktkas/hyperliquid";
 * import { delegatorSummary } from "@nktkas/hyperliquid/api/info";
 *
 * const transport = new HttpTransport(); // or `WebSocketTransport`
 * const data = await delegatorSummary(
 *   { transport },
 *   { user: "0x..." },
 * );
 * ```
 */
export function delegatorSummary(
  config: InfoRequestConfig,
  params: DeepImmutable<DelegatorSummaryParameters>,
  signal?: AbortSignal,
): Promise<DelegatorSummaryResponse> {
  const request = parser(DelegatorSummaryRequest)({
    type: "delegatorSummary",
    ...params,
  });
  return config.transport.request("info", request, signal);
}
