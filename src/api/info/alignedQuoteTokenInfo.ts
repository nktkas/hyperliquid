import * as v from "valibot";
import { type DeepImmutable, parser, UnsignedDecimal, UnsignedInteger } from "../_base.ts";
import type { InfoRequestConfig } from "./_base.ts";

// -------------------- Schemas --------------------

/**
 * Request supply, rate, and pending payment information for an aligned quote token.
 * @see null
 */
export const AlignedQuoteTokenInfoRequest = /* @__PURE__ */ (() => {
  return v.pipe(
    v.object({
      /** Type of request. */
      type: v.pipe(
        v.literal("alignedQuoteTokenInfo"),
        v.description("Type of request."),
      ),
      /** Token index. */
      token: v.pipe(
        UnsignedInteger,
        v.description("Token index."),
      ),
    }),
    v.description("Request supply, rate, and pending payment information for an aligned quote token."),
  );
})();
export type AlignedQuoteTokenInfoRequest = v.InferOutput<typeof AlignedQuoteTokenInfoRequest>;

/**
 * Supply, rate, and pending payment information for an aligned quote token.
 * @see null
 */
export const AlignedQuoteTokenInfoResponse = /* @__PURE__ */ (() => {
  return v.pipe(
    v.object({
      /** Whether the token is aligned. */
      isAligned: v.pipe(
        v.boolean(),
        v.description("Whether the token is aligned."),
      ),
      /** Timestamp (in ms since epoch) when the token was first aligned. */
      firstAlignedTime: v.pipe(
        UnsignedInteger,
        v.description("Timestamp (in ms since epoch) when the token was first aligned."),
      ),
      /** Total EVM minted supply. */
      evmMintedSupply: v.pipe(
        UnsignedDecimal,
        v.description("Total EVM minted supply."),
      ),
      /** Daily wei owed as an array of [date, amount] tuples. */
      dailyWeiOwed: v.pipe(
        v.array(
          v.pipe(
            v.tuple([
              /** Date in YYYY-MM-DD format. */
              v.pipe(
                v.string(),
                v.description("Date in YYYY-MM-DD format."),
              ),
              /** Amount of wei owed. */
              v.pipe(
                UnsignedDecimal,
                v.description("Amount of wei owed."),
              ),
            ]),
            v.description("[date, amount] tuple."),
          ),
        ),
        v.description("Daily wei owed as an array of [date, amount] tuples."),
      ),
      /** Predicted rate. */
      predictedRate: v.pipe(
        UnsignedDecimal,
        v.description("Predicted rate."),
      ),
    }),
    v.description("Supply, rate, and pending payment information for an aligned quote token."),
  );
})();
export type AlignedQuoteTokenInfoResponse = v.InferOutput<typeof AlignedQuoteTokenInfoResponse>;

// -------------------- Function --------------------

/** Request parameters for the {@linkcode alignedQuoteTokenInfo} function. */
export type AlignedQuoteTokenInfoParameters = Omit<v.InferInput<typeof AlignedQuoteTokenInfoRequest>, "type">;

/**
 * Request supply, rate, and pending payment information for an aligned quote token.
 * @param config - General configuration for Info API requests.
 * @param params - Parameters specific to the API request.
 * @param signal - An [`AbortSignal`](https://developer.mozilla.org/en-US/docs/Web/API/AbortSignal) can be used to cancel the request by calling [`abort()`](https://developer.mozilla.org/en-US/docs/Web/API/AbortController/abort) on the corresponding [`AbortController`](https://developer.mozilla.org/en-US/docs/Web/API/AbortController).
 * @returns Supply, rate, and pending payment information for an aligned quote token.
 *
 * @throws {TransportError} When the transport layer throws an error.
 *
 * @see null
 * @example
 * ```ts
 * import { HttpTransport } from "@nktkas/hyperliquid";
 * import { alignedQuoteTokenInfo } from "@nktkas/hyperliquid/api/info";
 *
 * const transport = new HttpTransport(); // or `WebSocketTransport`
 * const data = await alignedQuoteTokenInfo(
 *   { transport },
 *   { token: 1328 },
 * );
 * ```
 */
export function alignedQuoteTokenInfo(
  config: InfoRequestConfig,
  params: DeepImmutable<AlignedQuoteTokenInfoParameters>,
  signal?: AbortSignal,
): Promise<AlignedQuoteTokenInfoResponse> {
  const request = parser(AlignedQuoteTokenInfoRequest)({
    type: "alignedQuoteTokenInfo",
    ...params,
  });
  return config.transport.request("info", request, signal);
}
