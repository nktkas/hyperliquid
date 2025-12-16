import * as v from "@valibot/valibot";

// ============================================================
// API Schemas
// ============================================================

import { UnsignedDecimal, UnsignedInteger } from "../../_schemas.ts";

/**
 * Request supply, rate, and pending payment information for an aligned quote token.
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
      /** Daily amount owed as an array of [date, amount] tuples. */
      dailyAmountOwed: v.pipe(
        v.array(
          v.tuple([
            v.pipe(v.string(), v.isoDate()),
            UnsignedDecimal,
          ]),
        ),
        v.description("Daily amount owed as an array of [date, amount] tuples."),
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

// ============================================================
// Execution Logic
// ============================================================

import type { InfoConfig } from "./_base/types.ts";

/** Request parameters for the {@linkcode alignedQuoteTokenInfo} function. */
export type AlignedQuoteTokenInfoParameters = Omit<v.InferInput<typeof AlignedQuoteTokenInfoRequest>, "type">;

/**
 * Request supply, rate, and pending payment information for an aligned quote token.
 *
 * @param config - General configuration for Info API requests.
 * @param params - Parameters specific to the API request.
 * @param signal - {@link https://developer.mozilla.org/en-US/docs/Web/API/AbortSignal | AbortSignal} to cancel the request.
 *
 * @returns Supply, rate, and pending payment information for an aligned quote token.
 *
 * @throws {ValiError} When the request parameters fail validation (before sending).
 * @throws {TransportError} When the transport layer throws an error.
 *
 * @example
 * ```ts
 * import { HttpTransport } from "@nktkas/hyperliquid";
 * import { alignedQuoteTokenInfo } from "@nktkas/hyperliquid/api/info";
 *
 * const transport = new HttpTransport(); // or `WebSocketTransport`
 *
 * const data = await alignedQuoteTokenInfo(
 *   { transport },
 *   { token: 1328 },
 * );
 * ```
 */
export function alignedQuoteTokenInfo(
  config: InfoConfig,
  params: AlignedQuoteTokenInfoParameters,
  signal?: AbortSignal,
): Promise<AlignedQuoteTokenInfoResponse> {
  const request = v.parse(AlignedQuoteTokenInfoRequest, {
    type: "alignedQuoteTokenInfo",
    ...params,
  });
  return config.transport.request("info", request, signal);
}
