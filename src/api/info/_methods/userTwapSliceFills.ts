import * as v from "@valibot/valibot";

// ============================================================
// API Schemas
// ============================================================

import { Address, Decimal, Hex, UnsignedDecimal, UnsignedInteger } from "../../_schemas.ts";

/**
 * Request user TWAP slice fills.
 * @see https://hyperliquid.gitbook.io/hyperliquid-docs/for-developers/api/info-endpoint#retrieve-a-users-twap-slice-fills
 */
export const UserTwapSliceFillsRequest = /* @__PURE__ */ (() => {
  return v.pipe(
    v.object({
      /** Type of request. */
      type: v.pipe(
        v.literal("userTwapSliceFills"),
        v.description("Type of request."),
      ),
      /** User address. */
      user: v.pipe(
        Address,
        v.description("User address."),
      ),
    }),
    v.description("Request user TWAP slice fills."),
  );
})();
export type UserTwapSliceFillsRequest = v.InferOutput<typeof UserTwapSliceFillsRequest>;

/**
 * Array of user's twap slice fills.
 * @see https://hyperliquid.gitbook.io/hyperliquid-docs/for-developers/api/info-endpoint#retrieve-a-users-twap-slice-fills
 */
export const UserTwapSliceFillsResponse = /* @__PURE__ */ (() => {
  return v.pipe(
    v.array(
      /** User twap slice fill. */
      v.pipe(
        v.object({
          /** TWAP fill record. */
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
                v.picklist(["B", "A"]),
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
                v.nullable(UnsignedInteger),
                v.description("ID of the TWAP."),
              ),
            }),
            v.description("TWAP fill record."),
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
    v.description("Array of user's twap slice fills."),
  );
})();
export type UserTwapSliceFillsResponse = v.InferOutput<typeof UserTwapSliceFillsResponse>;

// ============================================================
// Execution Logic
// ============================================================

import type { InfoConfig } from "./_types.ts";

/** Request parameters for the {@linkcode userTwapSliceFills} function. */
export type UserTwapSliceFillsParameters = Omit<v.InferInput<typeof UserTwapSliceFillsRequest>, "type">;

/**
 * Request user TWAP slice fills.
 *
 * @param config - General configuration for Info API requests.
 * @param params - Parameters specific to the API request.
 * @param signal - [AbortSignal](https://developer.mozilla.org/en-US/docs/Web/API/AbortSignal) to cancel the request.
 *
 * @returns Array of user's twap slice fills.
 *
 * @throws {ValiError} When the request parameters fail validation (before sending).
 * @throws {TransportError} When the transport layer throws an error.
 *
 * @example
 * ```ts
 * import { HttpTransport } from "@nktkas/hyperliquid";
 * import { userTwapSliceFills } from "@nktkas/hyperliquid/api/info";
 *
 * const transport = new HttpTransport(); // or `WebSocketTransport`
 *
 * const data = await userTwapSliceFills(
 *   { transport },
 *   { user: "0x..." },
 * );
 * ```
 *
 * @see https://hyperliquid.gitbook.io/hyperliquid-docs/for-developers/api/info-endpoint#retrieve-a-users-twap-slice-fills
 */
export function userTwapSliceFills(
  config: InfoConfig,
  params: UserTwapSliceFillsParameters,
  signal?: AbortSignal,
): Promise<UserTwapSliceFillsResponse> {
  const request = v.parse(UserTwapSliceFillsRequest, {
    type: "userTwapSliceFills",
    ...params,
  });
  return config.transport.request("info", request, signal);
}
