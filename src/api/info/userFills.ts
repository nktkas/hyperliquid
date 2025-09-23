import * as v from "valibot";
import { Address, Decimal, type DeepImmutable, Hex, parser, UnsignedDecimal, UnsignedInteger } from "../_common.ts";
import type { InfoRequestConfig } from "./_common.ts";

// -------------------- Schemas --------------------

/**
 * Request array of user fills.
 * @see https://hyperliquid.gitbook.io/hyperliquid-docs/for-developers/api/info-endpoint#retrieve-a-users-fills
 */
export const UserFillsRequest = /* @__PURE__ */ (() => {
  return v.pipe(
    v.object({
      /** Type of request. */
      type: v.pipe(
        v.literal("userFills"),
        v.description("Type of request."),
      ),
      /** User address. */
      user: v.pipe(
        Address,
        v.description("User address."),
      ),
      /** If true, partial fills are aggregated when a crossing order fills multiple resting orders. */
      aggregateByTime: v.pipe(
        v.optional(v.boolean()),
        v.description("If true, partial fills are aggregated when a crossing order fills multiple resting orders."),
      ),
    }),
    v.description("Request array of user fills."),
  );
})();
export type UserFillsRequest = v.InferOutput<typeof UserFillsRequest>;

/**
 * Array of user trade fills.
 * @see https://hyperliquid.gitbook.io/hyperliquid-docs/for-developers/api/info-endpoint#retrieve-a-users-fills
 */
export const UserFillsResponse = /* @__PURE__ */ (() => {
  return v.pipe(
    v.array(
      /** Trade fill record. */
      v.pipe(
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
          /** Client Order ID. */
          cloid: v.pipe(
            v.optional(v.pipe(Hex, v.length(34))),
            v.description("Client Order ID."),
          ),
          /** Liquidation details. */
          liquidation: v.pipe(
            v.optional(
              v.object({
                /** Address of the liquidated user. */
                liquidatedUser: v.pipe(
                  Address,
                  v.description("Address of the liquidated user."),
                ),
                /** Mark price at the time of liquidation. */
                markPx: v.pipe(
                  UnsignedDecimal,
                  v.description("Mark price at the time of liquidation."),
                ),
                /** Liquidation method. */
                method: v.pipe(
                  v.union([v.literal("market"), v.literal("backstop")]),
                  v.description("Liquidation method."),
                ),
              }),
            ),
            v.description("Liquidation details."),
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
        v.description("Trade fill record."),
      ),
    ),
    v.description("Array of user trade fills."),
  );
})();
export type UserFillsResponse = v.InferOutput<typeof UserFillsResponse>;

// -------------------- Function --------------------

/** Request parameters for the {@linkcode userFills} function. */
export type UserFillsParameters = Omit<v.InferInput<typeof UserFillsRequest>, "type">;

/**
 * Request array of user fills.
 * @param config - General configuration for Info API requests.
 * @param params - Parameters specific to the API request.
 * @param signal - An [`AbortSignal`](https://developer.mozilla.org/en-US/docs/Web/API/AbortSignal) can be used to cancel the request by calling [`abort()`](https://developer.mozilla.org/en-US/docs/Web/API/AbortController/abort) on the corresponding [`AbortController`](https://developer.mozilla.org/en-US/docs/Web/API/AbortController).
 * @returns Array of user trade fills.
 *
 * @throws {TransportError} When the transport layer throws an error.
 *
 * @see https://hyperliquid.gitbook.io/hyperliquid-docs/for-developers/api/info-endpoint#retrieve-a-users-fills
 * @example
 * ```ts
 * import { HttpTransport } from "@nktkas/hyperliquid";
 * import { userFills } from "@nktkas/hyperliquid/api/info";
 *
 * const transport = new HttpTransport(); // or `WebSocketTransport`
 * const data = await userFills(
 *   { transport },
 *   { user: "0x..." },
 * );
 * ```
 */
export function userFills(
  config: InfoRequestConfig,
  params: DeepImmutable<UserFillsParameters>,
  signal?: AbortSignal,
): Promise<UserFillsResponse> {
  const request = parser(UserFillsRequest)({
    type: "userFills",
    ...params,
  });
  return config.transport.request("info", request, signal);
}
