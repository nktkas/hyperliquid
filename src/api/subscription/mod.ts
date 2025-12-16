/**
 * This module re-exports all subscription-related API request functions and types.
 *
 * You can use raw functions to maximize tree-shaking in your app,
 * or to access {@link https://github.com/fabian-hiller/valibot | valibot} schemas Request/Response.
 *
 * @example
 * ```ts
 * import { WebSocketTransport } from "@nktkas/hyperliquid";
 * import { candle } from "@nktkas/hyperliquid/api/subscription";
 * //       ^^^^^^
 * //       same name as in `SubscriptionClient`
 *
 * const transport = new WebSocketTransport();
 *
 * const sub = await candle(
 *   { transport }, // same params as in `SubscriptionClient`
 *   { coin: "ETH", interval: "1h" },
 *   (data) => console.log(data),
 * );
 * ```
 *
 * @module
 */

export type { SubscriptionConfig } from "./_methods/_types.ts";

export * from "./_methods/activeAssetCtx.ts";
export * from "./_methods/activeAssetData.ts";
export * from "./_methods/activeSpotAssetCtx.ts";
export * from "./_methods/allDexsAssetCtxs.ts";
export * from "./_methods/allDexsClearinghouseState.ts";
export * from "./_methods/allMids.ts";
export * from "./_methods/assetCtxs.ts";
export * from "./_methods/bbo.ts";
export * from "./_methods/candle.ts";
export * from "./_methods/clearinghouseState.ts";
export * from "./_methods/explorerBlock.ts";
export * from "./_methods/explorerTxs.ts";
export * from "./_methods/l2Book.ts";
export * from "./_methods/notification.ts";
export * from "./_methods/openOrders.ts";
export * from "./_methods/orderUpdates.ts";
export * from "./_methods/spotAssetCtxs.ts";
export * from "./_methods/spotState.ts";
export * from "./_methods/trades.ts";
export * from "./_methods/twapStates.ts";
export * from "./_methods/userEvents.ts";
export * from "./_methods/userFills.ts";
export * from "./_methods/userFundings.ts";
export * from "./_methods/userHistoricalOrders.ts";
export * from "./_methods/userNonFundingLedgerUpdates.ts";
export * from "./_methods/userTwapHistory.ts";
export * from "./_methods/userTwapSliceFills.ts";
export * from "./_methods/webData2.ts";
export * from "./_methods/webData3.ts";
