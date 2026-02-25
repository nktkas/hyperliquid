/**
 * Client for the Hyperliquid Subscription API endpoint.
 * @module
 */

import type { ISubscription } from "../../transport/mod.ts";
import type { SubscriptionConfig } from "./_methods/_types.ts";

// ============================================================
// Methods Imports
// ============================================================

import { activeAssetCtx, type ActiveAssetCtxEvent, type ActiveAssetCtxParameters } from "./_methods/activeAssetCtx.ts";
import {
  activeAssetData,
  type ActiveAssetDataEvent,
  type ActiveAssetDataParameters,
} from "./_methods/activeAssetData.ts";
import {
  activeSpotAssetCtx,
  type ActiveSpotAssetCtxEvent,
  type ActiveSpotAssetCtxParameters,
} from "./_methods/activeSpotAssetCtx.ts";
import { allDexsAssetCtxs, type AllDexsAssetCtxsEvent } from "./_methods/allDexsAssetCtxs.ts";
import {
  allDexsClearinghouseState,
  type AllDexsClearinghouseStateEvent,
  type AllDexsClearinghouseStateParameters,
} from "./_methods/allDexsClearinghouseState.ts";
import { allMids, type AllMidsEvent, type AllMidsParameters } from "./_methods/allMids.ts";
import { assetCtxs, type AssetCtxsEvent, type AssetCtxsParameters } from "./_methods/assetCtxs.ts";
import { bbo, type BboEvent, type BboParameters } from "./_methods/bbo.ts";
import { candle, type CandleEvent, type CandleParameters } from "./_methods/candle.ts";
import {
  clearinghouseState,
  type ClearinghouseStateEvent,
  type ClearinghouseStateParameters,
} from "./_methods/clearinghouseState.ts";
import { explorerBlock, type ExplorerBlockEvent } from "./_methods/explorerBlock.ts";
import { explorerTxs, type ExplorerTxsEvent } from "./_methods/explorerTxs.ts";
import { l2Book, type L2BookEvent, type L2BookParameters } from "./_methods/l2Book.ts";
import { notification, type NotificationEvent, type NotificationParameters } from "./_methods/notification.ts";
import { openOrders, type OpenOrdersEvent, type OpenOrdersParameters } from "./_methods/openOrders.ts";
import { orderUpdates, type OrderUpdatesEvent, type OrderUpdatesParameters } from "./_methods/orderUpdates.ts";
import { spotAssetCtxs, type SpotAssetCtxsEvent } from "./_methods/spotAssetCtxs.ts";
import { spotState, type SpotStateEvent, type SpotStateParameters } from "./_methods/spotState.ts";
import { trades, type TradesEvent, type TradesParameters } from "./_methods/trades.ts";
import { twapStates, type TwapStatesEvent, type TwapStatesParameters } from "./_methods/twapStates.ts";
import { userEvents, type UserEventsEvent, type UserEventsParameters } from "./_methods/userEvents.ts";
import { userFills, type UserFillsEvent, type UserFillsParameters } from "./_methods/userFills.ts";
import { userFundings, type UserFundingsEvent, type UserFundingsParameters } from "./_methods/userFundings.ts";
import {
  userHistoricalOrders,
  type UserHistoricalOrdersEvent,
  type UserHistoricalOrdersParameters,
} from "./_methods/userHistoricalOrders.ts";
import {
  userNonFundingLedgerUpdates,
  type UserNonFundingLedgerUpdatesEvent,
  type UserNonFundingLedgerUpdatesParameters,
} from "./_methods/userNonFundingLedgerUpdates.ts";
import {
  userTwapHistory,
  type UserTwapHistoryEvent,
  type UserTwapHistoryParameters,
} from "./_methods/userTwapHistory.ts";
import {
  userTwapSliceFills,
  type UserTwapSliceFillsEvent,
  type UserTwapSliceFillsParameters,
} from "./_methods/userTwapSliceFills.ts";
import { webData2, type WebData2Event, type WebData2Parameters } from "./_methods/webData2.ts";
import { webData3, type WebData3Event, type WebData3Parameters } from "./_methods/webData3.ts";

// ============================================================
// Client
// ============================================================

/**
 * Real-time data via WebSocket subscriptions.
 *
 * Corresponds to {@link https://hyperliquid.gitbook.io/hyperliquid-docs/for-developers/api/websocket/subscriptions | WebSocket subscriptions}.
 */
export class SubscriptionClient<C extends SubscriptionConfig = SubscriptionConfig> {
  config_: C;

  /**
   * Creates an instance of the SubscriptionClient.
   *
   * @param config Configuration for Subscription API requests. See {@link SubscriptionConfig}.
   *
   * @example
   * ```ts
   * import * as hl from "@nktkas/hyperliquid";
   *
   * const transport = new hl.WebSocketTransport();
   *
   * const subsClient = new hl.SubscriptionClient({ transport });
   * ```
   */
  constructor(config: C) {
    this.config_ = config;
  }

  /**
   * Subscribe to context updates for a specific perpetual asset.
   *
   * @param params Parameters specific to the API subscription.
   * @param listener A callback function to be called when the event is received.
   * @return A request-promise that resolves with a {@link ISubscription} object to manage the subscription lifecycle.
   *
   * @throws {ValiError} When the request parameters fail validation (before sending).
   * @throws {TransportError} When the transport layer throws an error.
   *
   * @example
   * ```ts
   * import * as hl from "@nktkas/hyperliquid";
   *
   * const transport = new hl.WebSocketTransport();
   * const client = new hl.SubscriptionClient({ transport });
   *
   * const sub = await client.activeAssetCtx({ coin: "ETH" }, (data) => {
   *   console.log(data);
   * });
   * ```
   *
   * @see https://hyperliquid.gitbook.io/hyperliquid-docs/for-developers/api/websocket/subscriptions
   */
  activeAssetCtx(
    params: ActiveAssetCtxParameters,
    listener: (data: ActiveAssetCtxEvent) => void,
  ): Promise<ISubscription> {
    return activeAssetCtx(this.config_, params, listener);
  }

  /**
   * Subscribe to trading data updates for a specific asset and user.
   *
   * @param params Parameters specific to the API subscription.
   * @param listener A callback function to be called when the event is received.
   * @return A request-promise that resolves with a {@link ISubscription} object to manage the subscription lifecycle.
   *
   * @throws {ValiError} When the request parameters fail validation (before sending).
   * @throws {TransportError} When the transport layer throws an error.
   *
   * @example
   * ```ts
   * import * as hl from "@nktkas/hyperliquid";
   *
   * const transport = new hl.WebSocketTransport();
   * const client = new hl.SubscriptionClient({ transport });
   *
   * const sub = await client.activeAssetData({ coin: "ETH", user: "0x..." }, (data) => {
   *   console.log(data);
   * });
   * ```
   *
   * @see https://hyperliquid.gitbook.io/hyperliquid-docs/for-developers/api/websocket/subscriptions
   */
  activeAssetData(
    params: ActiveAssetDataParameters,
    listener: (data: ActiveAssetDataEvent) => void,
  ): Promise<ISubscription> {
    return activeAssetData(this.config_, params, listener);
  }

  /**
   * Subscribe to context updates for a specific spot asset.
   *
   * @param params Parameters specific to the API subscription.
   * @param listener A callback function to be called when the event is received.
   * @return A request-promise that resolves with a {@link ISubscription} object to manage the subscription lifecycle.
   *
   * @throws {ValiError} When the request parameters fail validation (before sending).
   * @throws {TransportError} When the transport layer throws an error.
   *
   * @example
   * ```ts
   * import * as hl from "@nktkas/hyperliquid";
   *
   * const transport = new hl.WebSocketTransport();
   * const client = new hl.SubscriptionClient({ transport });
   *
   * const sub = await client.activeSpotAssetCtx({ coin: "@1" }, (data) => {
   *   console.log(data);
   * });
   * ```
   *
   * @see https://hyperliquid.gitbook.io/hyperliquid-docs/for-developers/api/websocket/subscriptions
   */
  activeSpotAssetCtx(
    params: ActiveSpotAssetCtxParameters,
    listener: (data: ActiveSpotAssetCtxEvent) => void,
  ): Promise<ISubscription> {
    return activeSpotAssetCtx(this.config_, params, listener);
  }

  /**
   * Subscribe to asset contexts for all DEXs.
   *
   * @param listener A callback function to be called when the event is received.
   * @return A request-promise that resolves with a {@link ISubscription} object to manage the subscription lifecycle.
   *
   * @throws {ValiError} When the request parameters fail validation (before sending).
   * @throws {TransportError} When the transport layer throws an error.
   *
   * @example
   * ```ts
   * import * as hl from "@nktkas/hyperliquid";
   *
   * const transport = new hl.WebSocketTransport();
   * const client = new hl.SubscriptionClient({ transport });
   *
   * const sub = await client.allDexsAssetCtxs((data) => {
   *   console.log(data);
   * });
   * ```
   *
   * @see https://hyperliquid.gitbook.io/hyperliquid-docs/for-developers/api/websocket/subscriptions
   */
  allDexsAssetCtxs(
    listener: (data: AllDexsAssetCtxsEvent) => void,
  ): Promise<ISubscription> {
    return allDexsAssetCtxs(this.config_, listener);
  }

  /**
   * Subscribe to clearinghouse states for all DEXs for a specific user.
   *
   * @param params Parameters specific to the API subscription.
   * @param listener A callback function to be called when the event is received.
   * @return A request-promise that resolves with a {@link ISubscription} object to manage the subscription lifecycle.
   *
   * @throws {ValiError} When the request parameters fail validation (before sending).
   * @throws {TransportError} When the transport layer throws an error.
   *
   * @example
   * ```ts
   * import * as hl from "@nktkas/hyperliquid";
   *
   * const transport = new hl.WebSocketTransport();
   * const client = new hl.SubscriptionClient({ transport });
   *
   * const sub = await client.allDexsClearinghouseState({ user: "0x..." }, (data) => {
   *   console.log(data);
   * });
   * ```
   *
   * @see https://hyperliquid.gitbook.io/hyperliquid-docs/for-developers/api/websocket/subscriptions
   */
  allDexsClearinghouseState(
    params: AllDexsClearinghouseStateParameters,
    listener: (data: AllDexsClearinghouseStateEvent) => void,
  ): Promise<ISubscription> {
    return allDexsClearinghouseState(this.config_, params, listener);
  }

  /**
   * Subscribe to mid prices for all actively traded assets.
   *
   * @param params Parameters specific to the API subscription.
   * @param listener A callback function to be called when the event is received.
   * @return A request-promise that resolves with a {@link ISubscription} object to manage the subscription lifecycle.
   *
   * @throws {ValiError} When the request parameters fail validation (before sending).
   * @throws {TransportError} When the transport layer throws an error.
   *
   * @example
   * ```ts
   * import * as hl from "@nktkas/hyperliquid";
   *
   * const transport = new hl.WebSocketTransport();
   * const client = new hl.SubscriptionClient({ transport });
   *
   * const sub = await client.allMids((data) => {
   *   console.log(data);
   * });
   * ```
   *
   * @see https://hyperliquid.gitbook.io/hyperliquid-docs/for-developers/api/websocket/subscriptions
   */
  allMids(
    listener: (data: AllMidsEvent) => void,
  ): Promise<ISubscription>;
  allMids(
    params: AllMidsParameters,
    listener: (data: AllMidsEvent) => void,
  ): Promise<ISubscription>;
  allMids(
    paramsOrListener: AllMidsParameters | ((data: AllMidsEvent) => void),
    maybeListener?: (data: AllMidsEvent) => void,
  ): Promise<ISubscription> {
    const params = typeof paramsOrListener === "function" ? {} : paramsOrListener;
    const listener = typeof paramsOrListener === "function" ? paramsOrListener : maybeListener!;
    return allMids(this.config_, params, listener);
  }

  /**
   * Subscribe to asset contexts for all perpetual assets.
   *
   * @param params Parameters specific to the API subscription.
   * @param listener A callback function to be called when the event is received.
   * @return A request-promise that resolves with a {@link ISubscription} object to manage the subscription lifecycle.
   *
   * @throws {ValiError} When the request parameters fail validation (before sending).
   * @throws {TransportError} When the transport layer throws an error.
   *
   * @example
   * ```ts
   * import * as hl from "@nktkas/hyperliquid";
   *
   * const transport = new hl.WebSocketTransport();
   * const client = new hl.SubscriptionClient({ transport });
   *
   * const sub = await client.assetCtxs((data) => {
   *   console.log(data);
   * });
   * ```
   *
   * @see https://hyperliquid.gitbook.io/hyperliquid-docs/for-developers/api/websocket/subscriptions
   */
  assetCtxs(
    listener: (data: AssetCtxsEvent) => void,
  ): Promise<ISubscription>;
  assetCtxs(
    params: AssetCtxsParameters,
    listener: (data: AssetCtxsEvent) => void,
  ): Promise<ISubscription>;
  assetCtxs(
    paramsOrListener: AssetCtxsParameters | ((data: AssetCtxsEvent) => void),
    maybeListener?: (data: AssetCtxsEvent) => void,
  ): Promise<ISubscription> {
    const params = typeof paramsOrListener === "function" ? {} : paramsOrListener;
    const listener = typeof paramsOrListener === "function" ? paramsOrListener : maybeListener!;
    return assetCtxs(this.config_, params, listener);
  }

  /**
   * Subscribe to best bid and offer updates for a specific asset.
   *
   * @param params Parameters specific to the API subscription.
   * @param listener A callback function to be called when the event is received.
   * @return A request-promise that resolves with a {@link ISubscription} object to manage the subscription lifecycle.
   *
   * @throws {ValiError} When the request parameters fail validation (before sending).
   * @throws {TransportError} When the transport layer throws an error.
   *
   * @example
   * ```ts
   * import * as hl from "@nktkas/hyperliquid";
   *
   * const transport = new hl.WebSocketTransport();
   * const client = new hl.SubscriptionClient({ transport });
   *
   * const sub = await client.bbo({ coin: "ETH" }, (data) => {
   *   console.log(data);
   * });
   * ```
   *
   * @see https://hyperliquid.gitbook.io/hyperliquid-docs/for-developers/api/websocket/subscriptions
   */
  bbo(
    params: BboParameters,
    listener: (data: BboEvent) => void,
  ): Promise<ISubscription> {
    return bbo(this.config_, params, listener);
  }

  /**
   * Subscribe to candlestick data updates for a specific asset.
   *
   * @param params Parameters specific to the API subscription.
   * @param listener A callback function to be called when the event is received.
   * @return A request-promise that resolves with a {@link ISubscription} object to manage the subscription lifecycle.
   *
   * @throws {ValiError} When the request parameters fail validation (before sending).
   * @throws {TransportError} When the transport layer throws an error.
   *
   * @example
   * ```ts
   * import * as hl from "@nktkas/hyperliquid";
   *
   * const transport = new hl.WebSocketTransport();
   * const client = new hl.SubscriptionClient({ transport });
   *
   * const sub = await client.candle({ coin: "ETH", interval: "1h" }, (data) => {
   *   console.log(data);
   * });
   * ```
   *
   * @see https://hyperliquid.gitbook.io/hyperliquid-docs/for-developers/api/websocket/subscriptions
   */
  candle(
    params: CandleParameters,
    listener: (data: CandleEvent) => void,
  ): Promise<ISubscription> {
    return candle(this.config_, params, listener);
  }

  /**
   * Subscribe to clearinghouse state updates for a specific user.
   *
   * @param params Parameters specific to the API subscription.
   * @param listener A callback function to be called when the event is received.
   * @return A request-promise that resolves with a {@link ISubscription} object to manage the subscription lifecycle.
   *
   * @throws {ValiError} When the request parameters fail validation (before sending).
   * @throws {TransportError} When the transport layer throws an error.
   *
   * @example
   * ```ts
   * import * as hl from "@nktkas/hyperliquid";
   *
   * const transport = new hl.WebSocketTransport();
   * const client = new hl.SubscriptionClient({ transport });
   *
   * const sub = await client.clearinghouseState({ user: "0x..." }, (data) => {
   *   console.log(data);
   * });
   * ```
   *
   * @see https://hyperliquid.gitbook.io/hyperliquid-docs/for-developers/api/websocket/subscriptions
   */
  clearinghouseState(
    params: ClearinghouseStateParameters,
    listener: (data: ClearinghouseStateEvent) => void,
  ): Promise<ISubscription> {
    return clearinghouseState(this.config_, params, listener);
  }

  /**
   * Subscribe to explorer block updates.
   *
   * @param listener A callback function to be called when the event is received.
   * @return A request-promise that resolves with a {@link ISubscription} object to manage the subscription lifecycle.
   *
   * @throws {ValiError} When the request parameters fail validation (before sending).
   * @throws {TransportError} When the transport layer throws an error.
   *
   * @example
   * ```ts
   * import * as hl from "@nktkas/hyperliquid";
   *
   * const transport = new hl.WebSocketTransport({ url: "wss://rpc.hyperliquid.xyz/ws" }); // RPC endpoint
   * const client = new hl.SubscriptionClient({ transport });
   *
   * const sub = await client.explorerBlock((data) => {
   *   console.log(data);
   * });
   * ```
   *
   * @see https://hyperliquid.gitbook.io/hyperliquid-docs/for-developers/api/websocket/subscriptions
   */
  explorerBlock(
    listener: (data: ExplorerBlockEvent) => void,
  ): Promise<ISubscription> {
    return explorerBlock(this.config_, listener);
  }

  /**
   * Subscribe to explorer transaction updates.
   *
   * @param listener A callback function to be called when the event is received.
   * @return A request-promise that resolves with a {@link ISubscription} object to manage the subscription lifecycle.
   *
   * @throws {ValiError} When the request parameters fail validation (before sending).
   * @throws {TransportError} When the transport layer throws an error.
   *
   * @example
   * ```ts
   * import * as hl from "@nktkas/hyperliquid";
   *
   * const transport = new hl.WebSocketTransport({ url: "wss://rpc.hyperliquid.xyz/ws" }); // RPC endpoint
   * const client = new hl.SubscriptionClient({ transport });
   *
   * const sub = await client.explorerTxs((data) => {
   *   console.log(data);
   * });
   * ```
   *
   * @see https://hyperliquid.gitbook.io/hyperliquid-docs/for-developers/api/websocket/subscriptions
   */
  explorerTxs(
    listener: (data: ExplorerTxsEvent) => void,
  ): Promise<ISubscription> {
    return explorerTxs(this.config_, listener);
  }

  /**
   * Subscribe to L2 order book updates for a specific asset.
   *
   * @param params Parameters specific to the API subscription.
   * @param listener A callback function to be called when the event is received.
   * @return A request-promise that resolves with a {@link ISubscription} object to manage the subscription lifecycle.
   *
   * @throws {ValiError} When the request parameters fail validation (before sending).
   * @throws {TransportError} When the transport layer throws an error.
   *
   * @example
   * ```ts
   * import * as hl from "@nktkas/hyperliquid";
   *
   * const transport = new hl.WebSocketTransport();
   * const client = new hl.SubscriptionClient({ transport });
   *
   * const sub = await client.l2Book({ coin: "ETH" }, (data) => {
   *   console.log(data);
   * });
   * ```
   *
   * @see https://hyperliquid.gitbook.io/hyperliquid-docs/for-developers/api/websocket/subscriptions
   */
  l2Book(
    params: L2BookParameters,
    listener: (data: L2BookEvent) => void,
  ): Promise<ISubscription> {
    return l2Book(this.config_, params, listener);
  }

  /**
   * Subscribe to notification updates for a specific user.
   *
   * @param params Parameters specific to the API subscription.
   * @param listener A callback function to be called when the event is received.
   * @return A request-promise that resolves with a {@link ISubscription} object to manage the subscription lifecycle.
   *
   * @throws {ValiError} When the request parameters fail validation (before sending).
   * @throws {TransportError} When the transport layer throws an error.
   *
   * @example
   * ```ts
   * import * as hl from "@nktkas/hyperliquid";
   *
   * const transport = new hl.WebSocketTransport();
   * const client = new hl.SubscriptionClient({ transport });
   *
   * const sub = await client.notification({ user: "0x..." }, (data) => {
   *   console.log(data);
   * });
   * ```
   *
   * @see https://hyperliquid.gitbook.io/hyperliquid-docs/for-developers/api/websocket/subscriptions
   */
  notification(
    params: NotificationParameters,
    listener: (data: NotificationEvent) => void,
  ): Promise<ISubscription> {
    return notification(this.config_, params, listener);
  }

  /**
   * Subscribe to open orders updates for a specific user.
   *
   * @param params Parameters specific to the API subscription.
   * @param listener A callback function to be called when the event is received.
   * @return A request-promise that resolves with a {@link ISubscription} object to manage the subscription lifecycle.
   *
   * @throws {ValiError} When the request parameters fail validation (before sending).
   * @throws {TransportError} When the transport layer throws an error.
   *
   * @example
   * ```ts
   * import * as hl from "@nktkas/hyperliquid";
   *
   * const transport = new hl.WebSocketTransport();
   * const client = new hl.SubscriptionClient({ transport });
   *
   * const sub = await client.openOrders({ user: "0x..." }, (data) => {
   *   console.log(data);
   * });
   * ```
   *
   * @see https://hyperliquid.gitbook.io/hyperliquid-docs/for-developers/api/websocket/subscriptions
   */
  openOrders(
    params: OpenOrdersParameters,
    listener: (data: OpenOrdersEvent) => void,
  ): Promise<ISubscription> {
    return openOrders(this.config_, params, listener);
  }

  /**
   * Subscribe to order status updates for a specific user.
   *
   * @param params Parameters specific to the API subscription.
   * @param listener A callback function to be called when the event is received.
   * @return A request-promise that resolves with a {@link ISubscription} object to manage the subscription lifecycle.
   *
   * @throws {ValiError} When the request parameters fail validation (before sending).
   * @throws {TransportError} When the transport layer throws an error.
   *
   * @example
   * ```ts
   * import * as hl from "@nktkas/hyperliquid";
   *
   * const transport = new hl.WebSocketTransport();
   * const client = new hl.SubscriptionClient({ transport });
   *
   * const sub = await client.orderUpdates({ user: "0x..." }, (data) => {
   *   console.log(data);
   * });
   * ```
   *
   * @see https://hyperliquid.gitbook.io/hyperliquid-docs/for-developers/api/websocket/subscriptions
   */
  orderUpdates(
    params: OrderUpdatesParameters,
    listener: (data: OrderUpdatesEvent) => void,
  ): Promise<ISubscription> {
    return orderUpdates(this.config_, params, listener);
  }

  /**
   * Subscribe to context updates for all spot assets.
   *
   * @param listener A callback function to be called when the event is received.
   * @return A request-promise that resolves with a {@link ISubscription} object to manage the subscription lifecycle.
   *
   * @throws {ValiError} When the request parameters fail validation (before sending).
   * @throws {TransportError} When the transport layer throws an error.
   *
   * @example
   * ```ts
   * import * as hl from "@nktkas/hyperliquid";
   *
   * const transport = new hl.WebSocketTransport();
   * const client = new hl.SubscriptionClient({ transport });
   *
   * const sub = await client.spotAssetCtxs((data) => {
   *   console.log(data);
   * });
   * ```
   *
   * @see https://hyperliquid.gitbook.io/hyperliquid-docs/for-developers/api/websocket/subscriptions
   */
  spotAssetCtxs(
    listener: (data: SpotAssetCtxsEvent) => void,
  ): Promise<ISubscription> {
    return spotAssetCtxs(this.config_, listener);
  }

  /**
   * Subscribe to spot state updates for a specific user.
   *
   * @param params Parameters specific to the API subscription.
   * @param listener A callback function to be called when the event is received.
   * @return A request-promise that resolves with a {@link ISubscription} object to manage the subscription lifecycle.
   *
   * @throws {ValiError} When the request parameters fail validation (before sending).
   * @throws {TransportError} When the transport layer throws an error.
   *
   * @example
   * ```ts
   * import * as hl from "@nktkas/hyperliquid";
   *
   * const transport = new hl.WebSocketTransport();
   * const client = new hl.SubscriptionClient({ transport });
   *
   * const sub = await client.spotState({ user: "0x..." }, (data) => {
   *   console.log(data);
   * });
   * ```
   *
   * @see https://hyperliquid.gitbook.io/hyperliquid-docs/for-developers/api/websocket/subscriptions
   */
  spotState(
    params: SpotStateParameters,
    listener: (data: SpotStateEvent) => void,
  ): Promise<ISubscription> {
    return spotState(this.config_, params, listener);
  }

  /**
   * Subscribe to real-time trade updates for a specific asset.
   *
   * @param params Parameters specific to the API subscription.
   * @param listener A callback function to be called when the event is received.
   * @return A request-promise that resolves with a {@link ISubscription} object to manage the subscription lifecycle.
   *
   * @throws {ValiError} When the request parameters fail validation (before sending).
   * @throws {TransportError} When the transport layer throws an error.
   *
   * @example
   * ```ts
   * import * as hl from "@nktkas/hyperliquid";
   *
   * const transport = new hl.WebSocketTransport();
   * const client = new hl.SubscriptionClient({ transport });
   *
   * const sub = await client.trades({ coin: "ETH" }, (data) => {
   *   console.log(data);
   * });
   * ```
   *
   * @see https://hyperliquid.gitbook.io/hyperliquid-docs/for-developers/api/websocket/subscriptions
   */
  trades(
    params: TradesParameters,
    listener: (data: TradesEvent) => void,
  ): Promise<ISubscription> {
    return trades(this.config_, params, listener);
  }

  /**
   * Subscribe to TWAP states updates for a specific user.
   *
   * @param params Parameters specific to the API subscription.
   * @param listener A callback function to be called when the event is received.
   * @return A request-promise that resolves with a {@link ISubscription} object to manage the subscription lifecycle.
   *
   * @throws {ValiError} When the request parameters fail validation (before sending).
   * @throws {TransportError} When the transport layer throws an error.
   *
   * @example
   * ```ts
   * import * as hl from "@nktkas/hyperliquid";
   *
   * const transport = new hl.WebSocketTransport();
   * const client = new hl.SubscriptionClient({ transport });
   *
   * const sub = await client.twapStates({ user: "0x..." }, (data) => {
   *   console.log(data);
   * });
   * ```
   *
   * @see https://hyperliquid.gitbook.io/hyperliquid-docs/for-developers/api/websocket/subscriptions
   */
  twapStates(
    params: TwapStatesParameters,
    listener: (data: TwapStatesEvent) => void,
  ): Promise<ISubscription> {
    return twapStates(this.config_, params, listener);
  }

  /**
   * Subscribe to non-order events for a specific user.
   *
   * @param params Parameters specific to the API subscription.
   * @param listener A callback function to be called when the event is received.
   * @return A request-promise that resolves with a {@link ISubscription} object to manage the subscription lifecycle.
   *
   * @throws {ValiError} When the request parameters fail validation (before sending).
   * @throws {TransportError} When the transport layer throws an error.
   *
   * @example
   * ```ts
   * import * as hl from "@nktkas/hyperliquid";
   *
   * const transport = new hl.WebSocketTransport();
   * const client = new hl.SubscriptionClient({ transport });
   *
   * const sub = await client.userEvents({ user: "0x..." }, (data) => {
   *   console.log(data);
   * });
   * ```
   *
   * @see https://hyperliquid.gitbook.io/hyperliquid-docs/for-developers/api/websocket/subscriptions
   */
  userEvents(
    params: UserEventsParameters,
    listener: (data: UserEventsEvent) => void,
  ): Promise<ISubscription> {
    return userEvents(this.config_, params, listener);
  }

  /**
   * Subscribe to trade fill updates for a specific user.
   *
   * @param params Parameters specific to the API subscription.
   * @param listener A callback function to be called when the event is received.
   * @return A request-promise that resolves with a {@link ISubscription} object to manage the subscription lifecycle.
   *
   * @throws {ValiError} When the request parameters fail validation (before sending).
   * @throws {TransportError} When the transport layer throws an error.
   *
   * @example
   * ```ts
   * import * as hl from "@nktkas/hyperliquid";
   *
   * const transport = new hl.WebSocketTransport();
   * const client = new hl.SubscriptionClient({ transport });
   *
   * const sub = await client.userFills({ user: "0x..." }, (data) => {
   *   console.log(data);
   * });
   * ```
   *
   * @see https://hyperliquid.gitbook.io/hyperliquid-docs/for-developers/api/websocket/subscriptions
   */
  userFills(
    params: UserFillsParameters,
    listener: (data: UserFillsEvent) => void,
  ): Promise<ISubscription> {
    return userFills(this.config_, params, listener);
  }

  /**
   * Subscribe to funding payment updates for a specific user.
   *
   * @param params Parameters specific to the API subscription.
   * @param listener A callback function to be called when the event is received.
   * @return A request-promise that resolves with a {@link ISubscription} object to manage the subscription lifecycle.
   *
   * @throws {ValiError} When the request parameters fail validation (before sending).
   * @throws {TransportError} When the transport layer throws an error.
   *
   * @example
   * ```ts
   * import * as hl from "@nktkas/hyperliquid";
   *
   * const transport = new hl.WebSocketTransport();
   * const client = new hl.SubscriptionClient({ transport });
   *
   * const sub = await client.userFundings({ user: "0x..." }, (data) => {
   *   console.log(data);
   * });
   * ```
   *
   * @see https://hyperliquid.gitbook.io/hyperliquid-docs/for-developers/api/websocket/subscriptions
   */
  userFundings(
    params: UserFundingsParameters,
    listener: (data: UserFundingsEvent) => void,
  ): Promise<ISubscription> {
    return userFundings(this.config_, params, listener);
  }

  /**
   * Subscribe to historical order updates for a specific user.
   *
   * @param params Parameters specific to the API subscription.
   * @param listener A callback function to be called when the event is received.
   * @return A request-promise that resolves with a {@link ISubscription} object to manage the subscription lifecycle.
   *
   * @throws {ValiError} When the request parameters fail validation (before sending).
   * @throws {TransportError} When the transport layer throws an error.
   *
   * @example
   * ```ts
   * import * as hl from "@nktkas/hyperliquid";
   *
   * const transport = new hl.WebSocketTransport();
   * const client = new hl.SubscriptionClient({ transport });
   *
   * const sub = await client.userHistoricalOrders({ user: "0x..." }, (data) => {
   *   console.log(data);
   * });
   * ```
   *
   * @see https://hyperliquid.gitbook.io/hyperliquid-docs/for-developers/api/websocket/subscriptions
   */
  userHistoricalOrders(
    params: UserHistoricalOrdersParameters,
    listener: (data: UserHistoricalOrdersEvent) => void,
  ): Promise<ISubscription> {
    return userHistoricalOrders(this.config_, params, listener);
  }

  /**
   * Subscribe to non-funding ledger updates for a specific user.
   *
   * @param params Parameters specific to the API subscription.
   * @param listener A callback function to be called when the event is received.
   * @return A request-promise that resolves with a {@link ISubscription} object to manage the subscription lifecycle.
   *
   * @throws {ValiError} When the request parameters fail validation (before sending).
   * @throws {TransportError} When the transport layer throws an error.
   *
   * @example
   * ```ts
   * import * as hl from "@nktkas/hyperliquid";
   *
   * const transport = new hl.WebSocketTransport();
   * const client = new hl.SubscriptionClient({ transport });
   *
   * const sub = await client.userNonFundingLedgerUpdates({ user: "0x..." }, (data) => {
   *   console.log(data);
   * });
   * ```
   *
   * @see https://hyperliquid.gitbook.io/hyperliquid-docs/for-developers/api/websocket/subscriptions
   */
  userNonFundingLedgerUpdates(
    params: UserNonFundingLedgerUpdatesParameters,
    listener: (data: UserNonFundingLedgerUpdatesEvent) => void,
  ): Promise<ISubscription> {
    return userNonFundingLedgerUpdates(this.config_, params, listener);
  }

  /**
   * Subscribe to TWAP order history updates for a specific user.
   *
   * @param params Parameters specific to the API subscription.
   * @param listener A callback function to be called when the event is received.
   * @return A request-promise that resolves with a {@link ISubscription} object to manage the subscription lifecycle.
   *
   * @throws {ValiError} When the request parameters fail validation (before sending).
   * @throws {TransportError} When the transport layer throws an error.
   *
   * @example
   * ```ts
   * import * as hl from "@nktkas/hyperliquid";
   *
   * const transport = new hl.WebSocketTransport();
   * const client = new hl.SubscriptionClient({ transport });
   *
   * const sub = await client.userTwapHistory({ user: "0x..." }, (data) => {
   *   console.log(data);
   * });
   * ```
   *
   * @see https://hyperliquid.gitbook.io/hyperliquid-docs/for-developers/api/websocket/subscriptions
   */
  userTwapHistory(
    params: UserTwapHistoryParameters,
    listener: (data: UserTwapHistoryEvent) => void,
  ): Promise<ISubscription> {
    return userTwapHistory(this.config_, params, listener);
  }

  /**
   * Subscribe to TWAP execution updates for a specific user.
   *
   * @param params Parameters specific to the API subscription.
   * @param listener A callback function to be called when the event is received.
   * @return A request-promise that resolves with a {@link ISubscription} object to manage the subscription lifecycle.
   *
   * @throws {ValiError} When the request parameters fail validation (before sending).
   * @throws {TransportError} When the transport layer throws an error.
   *
   * @example
   * ```ts
   * import * as hl from "@nktkas/hyperliquid";
   *
   * const transport = new hl.WebSocketTransport();
   * const client = new hl.SubscriptionClient({ transport });
   *
   * const sub = await client.userTwapSliceFills({ user: "0x..." }, (data) => {
   *   console.log(data);
   * });
   * ```
   *
   * @see https://hyperliquid.gitbook.io/hyperliquid-docs/for-developers/api/websocket/subscriptions
   */
  userTwapSliceFills(
    params: UserTwapSliceFillsParameters,
    listener: (data: UserTwapSliceFillsEvent) => void,
  ): Promise<ISubscription> {
    return userTwapSliceFills(this.config_, params, listener);
  }

  /**
   * Subscribe to comprehensive user and market data updates.
   *
   * @param params Parameters specific to the API subscription.
   * @param listener A callback function to be called when the event is received.
   * @return A request-promise that resolves with a {@link ISubscription} object to manage the subscription lifecycle.
   *
   * @throws {ValiError} When the request parameters fail validation (before sending).
   * @throws {TransportError} When the transport layer throws an error.
   *
   * @example
   * ```ts
   * import * as hl from "@nktkas/hyperliquid";
   *
   * const transport = new hl.WebSocketTransport();
   * const client = new hl.SubscriptionClient({ transport });
   *
   * const sub = await client.webData2({ user: "0x..." }, (data) => {
   *   console.log(data);
   * });
   * ```
   *
   * @see https://hyperliquid.gitbook.io/hyperliquid-docs/for-developers/api/websocket/subscriptions
   */
  webData2(
    params: WebData2Parameters,
    listener: (data: WebData2Event) => void,
  ): Promise<ISubscription> {
    return webData2(this.config_, params, listener);
  }

  /**
   * Subscribe to comprehensive user and market data updates.
   *
   * @param params Parameters specific to the API subscription.
   * @param listener A callback function to be called when the event is received.
   * @return A request-promise that resolves with a {@link ISubscription} object to manage the subscription lifecycle.
   *
   * @throws {ValiError} When the request parameters fail validation (before sending).
   * @throws {TransportError} When the transport layer throws an error.
   *
   * @example
   * ```ts
   * import * as hl from "@nktkas/hyperliquid";
   *
   * const transport = new hl.WebSocketTransport();
   * const client = new hl.SubscriptionClient({ transport });
   *
   * const sub = await client.webData3({ user: "0x..." }, (data) => {
   *   console.log(data);
   * });
   * ```
   *
   * @see https://hyperliquid.gitbook.io/hyperliquid-docs/for-developers/api/websocket/subscriptions
   */
  webData3(
    params: WebData3Parameters,
    listener: (data: WebData3Event) => void,
  ): Promise<ISubscription> {
    return webData3(this.config_, params, listener);
  }
}

// ============================================================
// Type Re-exports
// ============================================================

export type { SubscriptionConfig } from "./_methods/_types.ts";

export type {
  ActiveAssetCtxEvent as ActiveAssetCtxWsEvent,
  ActiveAssetCtxParameters as ActiveAssetCtxWsParameters,
} from "./_methods/activeAssetCtx.ts";
export type {
  ActiveAssetDataEvent as ActiveAssetDataWsEvent,
  ActiveAssetDataParameters as ActiveAssetDataWsParameters,
} from "./_methods/activeAssetData.ts";
export type {
  ActiveSpotAssetCtxEvent as ActiveSpotAssetCtxWsEvent,
  ActiveSpotAssetCtxParameters as ActiveSpotAssetCtxWsParameters,
} from "./_methods/activeSpotAssetCtx.ts";
export type { AllDexsAssetCtxsEvent as AllDexsAssetCtxsWsEvent } from "./_methods/allDexsAssetCtxs.ts";
export type {
  AllDexsClearinghouseStateEvent as AllDexsClearinghouseStateWsEvent,
  AllDexsClearinghouseStateParameters as AllDexsClearinghouseStateWsParameters,
} from "./_methods/allDexsClearinghouseState.ts";
export type { AllMidsEvent as AllMidsWsEvent, AllMidsParameters as AllMidsWsParameters } from "./_methods/allMids.ts";
export type {
  AssetCtxsEvent as AssetCtxsWsEvent,
  AssetCtxsParameters as AssetCtxsWsParameters,
} from "./_methods/assetCtxs.ts";
export type { BboEvent as BboWsEvent, BboParameters as BboWsParameters } from "./_methods/bbo.ts";
export type { CandleEvent as CandleWsEvent, CandleParameters as CandleWsParameters } from "./_methods/candle.ts";
export type {
  ClearinghouseStateEvent as ClearinghouseStateWsEvent,
  ClearinghouseStateParameters as ClearinghouseStateWsParameters,
} from "./_methods/clearinghouseState.ts";
export type { ExplorerBlockEvent as ExplorerBlockWsEvent } from "./_methods/explorerBlock.ts";
export type { ExplorerTxsEvent as ExplorerTxsWsEvent } from "./_methods/explorerTxs.ts";
export type { L2BookEvent as L2BookWsEvent, L2BookParameters as L2BookWsParameters } from "./_methods/l2Book.ts";
export type {
  NotificationEvent as NotificationWsEvent,
  NotificationParameters as NotificationWsParameters,
} from "./_methods/notification.ts";
export type {
  OpenOrdersEvent as OpenOrdersWsEvent,
  OpenOrdersParameters as OpenOrdersWsParameters,
} from "./_methods/openOrders.ts";
export type {
  OrderUpdatesEvent as OrderUpdatesWsEvent,
  OrderUpdatesParameters as OrderUpdatesWsParameters,
} from "./_methods/orderUpdates.ts";
export type { SpotAssetCtxsEvent as SpotAssetCtxsWsEvent } from "./_methods/spotAssetCtxs.ts";
export type {
  SpotStateEvent as SpotStateWsEvent,
  SpotStateParameters as SpotStateWsParameters,
} from "./_methods/spotState.ts";
export type { TradesEvent as TradesWsEvent, TradesParameters as TradesWsParameters } from "./_methods/trades.ts";
export type {
  TwapStatesEvent as TwapStatesWsEvent,
  TwapStatesParameters as TwapStatesWsParameters,
} from "./_methods/twapStates.ts";
export type {
  UserEventsEvent as UserEventsWsEvent,
  UserEventsParameters as UserEventsWsParameters,
} from "./_methods/userEvents.ts";
export type {
  UserFillsEvent as UserFillsWsEvent,
  UserFillsParameters as UserFillsWsParameters,
} from "./_methods/userFills.ts";
export type {
  UserFundingsEvent as UserFundingsWsEvent,
  UserFundingsParameters as UserFundingsWsParameters,
} from "./_methods/userFundings.ts";
export type {
  UserHistoricalOrdersEvent as UserHistoricalOrdersWsEvent,
  UserHistoricalOrdersParameters as UserHistoricalOrdersWsParameters,
} from "./_methods/userHistoricalOrders.ts";
export type {
  UserNonFundingLedgerUpdatesEvent as UserNonFundingLedgerUpdatesWsEvent,
  UserNonFundingLedgerUpdatesParameters as UserNonFundingLedgerUpdatesWsParameters,
} from "./_methods/userNonFundingLedgerUpdates.ts";
export type {
  UserTwapHistoryEvent as UserTwapHistoryWsEvent,
  UserTwapHistoryParameters as UserTwapHistoryWsParameters,
} from "./_methods/userTwapHistory.ts";
export type {
  UserTwapSliceFillsEvent as UserTwapSliceFillsWsEvent,
  UserTwapSliceFillsParameters as UserTwapSliceFillsWsParameters,
} from "./_methods/userTwapSliceFills.ts";
export type {
  WebData2Event as WebData2WsEvent,
  WebData2Parameters as WebData2WsParameters,
} from "./_methods/webData2.ts";
export type {
  WebData3Event as WebData3WsEvent,
  WebData3Parameters as WebData3WsParameters,
} from "./_methods/webData3.ts";
