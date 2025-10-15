/**
 * This module re-exports all subscription-related API request functions and types.
 *
 * You can use raw functions to maximize tree-shaking in your app,
 * or to access [valibot](https://github.com/fabian-hiller/valibot) schemas Request/Response.
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

export { parser, SchemaError } from "../_base.ts";
export type { SubscriptionRequestConfig } from "./_base.ts";

export * from "./activeAssetCtx.ts";
export * from "./activeAssetData.ts";
export * from "./activeSpotAssetCtx.ts";
export * from "./allMids.ts";
export * from "./assetCtxs.ts";
export * from "./bbo.ts";
export * from "./candle.ts";
export * from "./clearinghouseState.ts";
export * from "./explorerBlock.ts";
export * from "./explorerTxs.ts";
export * from "./l2Book.ts";
export * from "./notification.ts";
export * from "./openOrders.ts";
export * from "./orderUpdates.ts";
export * from "./trades.ts";
export * from "./userEvents.ts";
export * from "./userFills.ts";
export * from "./userFundings.ts";
export * from "./userHistoricalOrders.ts";
export * from "./userNonFundingLedgerUpdates.ts";
export * from "./userTwapHistory.ts";
export * from "./userTwapSliceFills.ts";
export * from "./webData2.ts";
