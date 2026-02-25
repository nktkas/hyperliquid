import * as v from "@valibot/valibot";

// ============================================================
// API Schemas
// ============================================================

import { UnsignedInteger } from "../../_schemas.ts";

/**
 * Request supply, rate, and pending payment information for an aligned quote token.
 * @see null
 */
export const AlignedQuoteTokenInfoRequest = /* @__PURE__ */ (() => {
  return v.object({
    /** Type of request. */
    type: v.literal("alignedQuoteTokenInfo"),
    /** Token index. */
    token: UnsignedInteger,
  });
})();
export type AlignedQuoteTokenInfoRequest = v.InferOutput<typeof AlignedQuoteTokenInfoRequest>;

/**
 * Supply, rate, and pending payment information for an aligned quote token.
 * @see null
 */
export type AlignedQuoteTokenInfoResponse = {
  /** Whether the token is aligned. */
  isAligned: boolean;
  /** Timestamp (in ms since epoch) when the token was first aligned. */
  firstAlignedTime: number;
  /**
   * Total EVM minted supply.
   * @pattern ^[0-9]+(\.[0-9]+)?$
   */
  evmMintedSupply: string;
  /** Daily amount owed as an array of [date, amount] tuples. */
  dailyAmountOwed: [
    /** Date in YYYY-MM-DD format. */
    date: string,
    /** @pattern ^[0-9]+(\.[0-9]+)?$ */
    amount: string,
  ][];
  /**
   * Predicted rate.
   * @pattern ^[0-9]+(\.[0-9]+)?$
   */
  predictedRate: string;
};

// ============================================================
// Execution Logic
// ============================================================

import type { InfoConfig } from "./_base/types.ts";

/** Request parameters for the {@linkcode alignedQuoteTokenInfo} function. */
export type AlignedQuoteTokenInfoParameters = Omit<v.InferInput<typeof AlignedQuoteTokenInfoRequest>, "type">;

/**
 * Request supply, rate, and pending payment information for an aligned quote token.
 *
 * @param config General configuration for Info API requests.
 * @param params Parameters specific to the API request.
 * @param signal {@link https://developer.mozilla.org/en-US/docs/Web/API/AbortSignal | AbortSignal} to cancel the request.
 * @return Supply, rate, and pending payment information for an aligned quote token.
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
 *
 * @see null
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
