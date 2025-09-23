import * as v from "valibot";
import { Address, Decimal, type DeepImmutable, Hex, parser, UnsignedDecimal, UnsignedInteger } from "../_common.ts";
import type { InfoRequestConfig } from "./_common.ts";

// -------------------- Schemas --------------------

/**
 * Request user TWAP slice fills by time.
 * @see null
 */
export const UserTwapSliceFillsByTimeRequest = /* @__PURE__ */ (() => {
  return v.pipe(
    v.object({
      /** Type of request. */
      type: v.pipe(
        v.literal("userTwapSliceFillsByTime"),
        v.description("Type of request."),
      ),
      /** User address. */
      user: v.pipe(
        Address,
        v.description("User address."),
      ),
      /** Start time (in ms since epoch). */
      startTime: v.pipe(
        UnsignedInteger,
        v.description("Start time (in ms since epoch)."),
      ),
      /** End time (in ms since epoch). */
      endTime: v.pipe(
        v.nullish(UnsignedInteger),
        v.description("End time (in ms since epoch)."),
      ),
      /** If true, partial fills are aggregated when a crossing order fills multiple resting orders. */
      aggregateByTime: v.pipe(
        v.optional(v.boolean()),
        v.description("If true, partial fills are aggregated when a crossing order fills multiple resting orders."),
      ),
    }),
    v.description("Request user TWAP slice fills by time."),
  );
})();
export type UserTwapSliceFillsByTimeRequest = v.InferOutput<typeof UserTwapSliceFillsByTimeRequest>;

/**
 * Array of user's twap slice fill by time.
 * @see https://hyperliquid.gitbook.io/hyperliquid-docs/for-developers/api/info-endpoint#retrieve-a-users-twap-slice-fills
 */
export const UserTwapSliceFillsByTimeResponse = /* @__PURE__ */ (() => {
  return v.pipe(
    v.array(
      /** User twap slice fill. */
      v.pipe(
        v.object({
          /** Fill details for the TWAP slice. */
          fill: v.pipe(
            v.object({
              /** Asset symbol. */
              coin: v.pipe(
                v.string(),
                v.description("Asset symbol."),
              ),
              /** Price. */
              px: v.pipe(
                UnsignedDecimal,
                v.description("Price."),
              ),
              /** Size. */
              sz: v.pipe(
                UnsignedDecimal,
                v.description("Size."),
              ),
              /** Order side ("B" = Bid/Buy, "A" = Ask/Sell). */
              side: v.pipe(
                v.union([v.literal("B"), v.literal("A")]),
                v.description('Order side ("B" = Bid/Buy, "A" = Ask/Sell).'),
              ),
              /** Timestamp when the trade occurred (in ms since epoch). */
              time: v.pipe(
                UnsignedInteger,
                v.description("Timestamp when the trade occurred (in ms since epoch)."),
              ),
              /** Start position size. */
              startPosition: v.pipe(
                Decimal,
                v.description("Start position size."),
              ),
              /** Direction indicator for frontend display. */
              dir: v.pipe(
                v.string(),
                v.description("Direction indicator for frontend display."),
              ),
              /** Realized PnL. */
              closedPnl: v.pipe(
                Decimal,
                v.description("Realized PnL."),
              ),
              /** L1 transaction hash. */
              hash: v.pipe(
                v.pipe(Hex, v.length(66)),
                v.description("L1 transaction hash."),
              ),
              /** Order ID. */
              oid: v.pipe(
                UnsignedInteger,
                v.description("Order ID."),
              ),
              /** Indicates if the fill was a taker order. */
              crossed: v.pipe(
                v.boolean(),
                v.description("Indicates if the fill was a taker order."),
              ),
              /** Fee charged or rebate received (negative indicates rebate). */
              fee: v.pipe(
                Decimal,
                v.description("Fee charged or rebate received (negative indicates rebate)."),
              ),
              /** Unique transaction identifier for a partial fill of an order. */
              tid: v.pipe(
                UnsignedInteger,
                v.description("Unique transaction identifier for a partial fill of an order."),
              ),
              /** Token in which the fee is denominated (e.g., "USDC"). */
              feeToken: v.pipe(
                v.string(),
                v.description('Token in which the fee is denominated (e.g., "USDC").'),
              ),
              /** ID of the TWAP. */
              twapId: v.pipe(
                v.union([UnsignedInteger, v.null()]),
                v.description("ID of the TWAP."),
              ),
            }),
            v.description("Fill details for the TWAP slice."),
          ),
          /** ID of the TWAP. */
          twapId: v.pipe(
            UnsignedInteger,
            v.description("ID of the TWAP."),
          ),
        }),
        v.description("User twap slice fill."),
      ),
    ),
    v.description("Array of user's twap slice fill by time."),
  );
})();
export type UserTwapSliceFillsByTimeResponse = v.InferOutput<typeof UserTwapSliceFillsByTimeResponse>;

// -------------------- Function --------------------

/** Request parameters for the {@linkcode userTwapSliceFillsByTime} function. */
export type UserTwapSliceFillsByTimeParameters = Omit<v.InferInput<typeof UserTwapSliceFillsByTimeRequest>, "type">;

/**
 * Request user TWAP slice fills by time.
 * @param config - General configuration for Info API requests.
 * @param params - Parameters specific to the API request.
 * @param signal - An [`AbortSignal`](https://developer.mozilla.org/en-US/docs/Web/API/AbortSignal) can be used to cancel the request by calling [`abort()`](https://developer.mozilla.org/en-US/docs/Web/API/AbortController/abort) on the corresponding [`AbortController`](https://developer.mozilla.org/en-US/docs/Web/API/AbortController).
 * @returns Array of user's twap slice fill by time.
 *
 * @throws {TransportError} When the transport layer throws an error.
 *
 * @see null
 * @example
 * ```ts
 * import { HttpTransport } from "@nktkas/hyperliquid";
 * import { userTwapSliceFillsByTime } from "@nktkas/hyperliquid/api/info";
 *
 * const transport = new HttpTransport(); // or `WebSocketTransport`
 * const data = await userTwapSliceFillsByTime(
 *   { transport },
 *   { user: "0x...", startTime: Date.now() - 1000 * 60 * 60 * 24 },
 * );
 * ```
 */
export function userTwapSliceFillsByTime(
  config: InfoRequestConfig,
  params: DeepImmutable<UserTwapSliceFillsByTimeParameters>,
  signal?: AbortSignal,
): Promise<UserTwapSliceFillsByTimeResponse> {
  const request = parser(UserTwapSliceFillsByTimeRequest)({
    type: "userTwapSliceFillsByTime",
    ...params,
  });
  return config.transport.request("info", request, signal);
}
