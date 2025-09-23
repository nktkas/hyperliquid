import type { OmitFirst, OverloadedParameters } from "../_common.ts";
import type { ISubscriptionTransport } from "../../transport/base.ts";
import type { SubscriptionRequestConfig } from "./_common.ts";

import { activeAssetCtx } from "./activeAssetCtx.ts";
import { activeAssetData } from "./activeAssetData.ts";
import { activeSpotAssetCtx } from "./activeSpotAssetCtx.ts";
import { allMids } from "./allMids.ts";
import { assetCtxs } from "./assetCtxs.ts";
import { bbo } from "./bbo.ts";
import { candle } from "./candle.ts";
import { clearinghouseState } from "./clearinghouseState.ts";
import { explorerBlock } from "./explorerBlock.ts";
import { explorerTxs } from "./explorerTxs.ts";
import { l2Book } from "./l2Book.ts";
import { notification } from "./notification.ts";
import { openOrders } from "./openOrders.ts";
import { orderUpdates } from "./orderUpdates.ts";
import { trades } from "./trades.ts";
import { userEvents } from "./userEvents.ts";
import { userFills } from "./userFills.ts";
import { userFundings } from "./userFundings.ts";
import { userNonFundingLedgerUpdates } from "./userNonFundingLedgerUpdates.ts";
import { userTwapHistory } from "./userTwapHistory.ts";
import { userTwapSliceFills } from "./userTwapSliceFills.ts";
import { webData2 } from "./webData2.ts";

export type {
  ActiveAssetCtxEvent as WsActiveAssetCtxEvent,
  ActiveAssetCtxParameters as WsActiveAssetCtxParameters,
} from "./activeAssetCtx.ts";
export type {
  ActiveAssetDataEvent as WsActiveAssetDataEvent,
  ActiveAssetDataParameters as WsActiveAssetDataParameters,
} from "./activeAssetData.ts";
export type {
  ActiveSpotAssetCtxEvent as WsActiveSpotAssetCtxEvent,
  ActiveSpotAssetCtxParameters as WsActiveSpotAssetCtxParameters,
} from "./activeSpotAssetCtx.ts";
export type { AllMidsEvent as WsAllMidsEvent, AllMidsParameters as WsAllMidsParameters } from "./allMids.ts";
export type { AssetCtxsEvent as WsAssetCtxsEvent, AssetCtxsParameters as WsAssetCtxsParameters } from "./assetCtxs.ts";
export type { BboEvent as WsBboEvent, BboParameters as WsBboParameters } from "./bbo.ts";
export type { CandleEvent as WsCandleEvent, CandleParameters as WsCandleParameters } from "./candle.ts";
export type {
  ClearinghouseStateEvent as WsClearinghouseStateEvent,
  ClearinghouseStateParameters as WsClearinghouseStateParameters,
} from "./clearinghouseState.ts";
export type {
  ExplorerBlockEvent as WsExplorerBlockEvent,
  ExplorerBlockParameters as WsExplorerBlockParameters,
} from "./explorerBlock.ts";
export type {
  ExplorerTxsEvent as WsExplorerTxsEvent,
  ExplorerTxsParameters as WsExplorerTxsParameters,
} from "./explorerTxs.ts";
export type { L2BookEvent as WsL2BookEvent, L2BookParameters as WsL2BookParameters } from "./l2Book.ts";
export type {
  NotificationEvent as WsNotificationEvent,
  NotificationParameters as WsNotificationParameters,
} from "./notification.ts";
export type {
  OpenOrdersEvent as WsOpenOrdersEvent,
  OpenOrdersParameters as WsOpenOrdersParameters,
} from "./openOrders.ts";
export type {
  OrderUpdatesEvent as WsOrderUpdatesEvent,
  OrderUpdatesParameters as WsOrderUpdatesParameters,
} from "./orderUpdates.ts";
export type { TradesEvent as WsTradesEvent, TradesParameters as WsTradesParameters } from "./trades.ts";
export type {
  UserEventsEvent as WsUserEventsEvent,
  UserEventsParameters as WsUserEventsParameters,
} from "./userEvents.ts";
export type { UserFillsEvent as WsUserFillsEvent, UserFillsParameters as WsUserFillsParameters } from "./userFills.ts";
export type {
  UserFundingsEvent as WsUserFundingsEvent,
  UserFundingsParameters as WsUserFundingsParameters,
} from "./userFundings.ts";
export type {
  UserNonFundingLedgerUpdatesEvent as WsUserNonFundingLedgerUpdatesEvent,
  UserNonFundingLedgerUpdatesParameters as WsUserNonFundingLedgerUpdatesParameters,
} from "./userNonFundingLedgerUpdates.ts";
export type {
  UserTwapHistoryEvent as WsUserTwapHistoryEvent,
  UserTwapHistoryParameters as WsUserTwapHistoryParameters,
} from "./userTwapHistory.ts";
export type {
  UserTwapSliceFillsEvent as WsUserTwapSliceFillsEvent,
  UserTwapSliceFillsParameters as WsUserTwapSliceFillsParameters,
} from "./userTwapSliceFills.ts";
export type { WebData2Event as WsWebData2Event, WebData2Parameters as WsWebData2Parameters } from "./webData2.ts";

/**
 * A client for interacting with the Hyperliquid Subscription API.
 * @typeParam T - The transport (extends {@linkcode ISubscriptionTransport}) used to connect to the Hyperliquid API.
 */
export class SubscriptionClient<
  T extends ISubscriptionTransport = ISubscriptionTransport,
> implements SubscriptionRequestConfig<T> {
  transport: T;

  /**
   * Initialises a new instance.
   * @param args - The arguments for initialisation.
   *
   * @example
   * ```ts
   * import * as hl from "@nktkas/hyperliquid";
   *
   * const transport = new hl.WebSocketTransport();
   * const subsClient = new hl.SubscriptionClient({ transport });
   * ```
   */
  constructor(args: SubscriptionRequestConfig<T>) {
    this.transport = args.transport;
  }

  /**
   * Subscribe to context updates for a specific perpetual asset.
   * @param params - Parameters specific to the API subscription.
   * @param listener - A callback function to be called when the event is received.
   * @returns A request-promise that resolves with a {@link Subscription} object to manage the subscription lifecycle.
   *
   * @throws {TransportError} When the transport layer throws an error.
   *
   * @see https://hyperliquid.gitbook.io/hyperliquid-docs/for-developers/api/websocket/subscriptions
   * @example
   * ```ts
   * import * as hl from "@nktkas/hyperliquid";
   *
   * const transport = new hl.WebSocketTransport();
   *
   * const client = new hl.SubscriptionClient({ transport });
   * const sub = await client.activeAssetCtx({ coin: "ETH" }, (data) => console.log(data));
   * ```
   */
  activeAssetCtx(...args: OmitFirst<OverloadedParameters<typeof activeAssetCtx>>) {
    return activeAssetCtx(this, ...args);
  }

  /**
   * Subscribe to trading data updates for a specific asset and user.
   * @param params - Parameters specific to the API subscription.
   * @param listener - A callback function to be called when the event is received.
   * @returns A request-promise that resolves with a {@link Subscription} object to manage the subscription lifecycle.
   *
   * @throws {TransportError} When the transport layer throws an error.
   *
   * @see https://hyperliquid.gitbook.io/hyperliquid-docs/for-developers/api/websocket/subscriptions
   * @example
   * ```ts
   * import * as hl from "@nktkas/hyperliquid";
   *
   * const transport = new hl.WebSocketTransport();
   *
   * const client = new hl.SubscriptionClient({ transport });
   * const sub = await client.activeAssetData({ coin: "ETH", user: "0x..." }, (data) => console.log(data));
   * ```
   */
  activeAssetData(...args: OmitFirst<OverloadedParameters<typeof activeAssetData>>) {
    return activeAssetData(this, ...args);
  }

  /**
   * Subscribe to context updates for a specific spot asset.
   * @param params - Parameters specific to the API subscription.
   * @param listener - A callback function to be called when the event is received.
   * @returns A request-promise that resolves with a {@link Subscription} object to manage the subscription lifecycle.
   *
   * @throws {TransportError} When the transport layer throws an error.
   *
   * @see https://hyperliquid.gitbook.io/hyperliquid-docs/for-developers/api/websocket/subscriptions
   * @example
   * ```ts
   * import * as hl from "@nktkas/hyperliquid";
   *
   * const transport = new hl.WebSocketTransport();
   *
   * const client = new hl.SubscriptionClient({ transport });
   * const sub = await client.activeSpotAssetCtx({ coin: "@1" }, (data) => console.log(data));
   * ```
   */
  activeSpotAssetCtx(...args: OmitFirst<OverloadedParameters<typeof activeSpotAssetCtx>>) {
    return activeSpotAssetCtx(this, ...args);
  }

  /**
   * Subscribe to mid prices for all actively traded assets.
   * @param params - Parameters specific to the API subscription.
   * @param listener - A callback function to be called when the event is received.
   * @returns A request-promise that resolves with a {@link Subscription} object to manage the subscription lifecycle.
   *
   * @throws {TransportError} When the transport layer throws an error.
   *
   * @see https://hyperliquid.gitbook.io/hyperliquid-docs/for-developers/api/websocket/subscriptions
   * @example
   * ```ts
   * import * as hl from "@nktkas/hyperliquid";
   *
   * const transport = new hl.WebSocketTransport();
   *
   * const client = new hl.SubscriptionClient({ transport });
   * const sub = await client.allMids((data) => console.log(data));
   * ```
   */
  allMids(...args: OmitFirst<OverloadedParameters<typeof allMids>>) {
    return allMids(
      this,
      // @ts-ignore: TypeScript can't resolve overloaded signatures from parameter unions
      ...args,
    );
  }

  /**
   * Subscribe to asset contexts for all perpetual assets.
   * @param params - Parameters specific to the API subscription.
   * @param listener - A callback function to be called when the event is received.
   * @returns A request-promise that resolves with a {@link Subscription} object to manage the subscription lifecycle.
   *
   * @throws {TransportError} When the transport layer throws an error.
   *
   * @see null
   * @example
   * ```ts
   * import * as hl from "@nktkas/hyperliquid";
   *
   * const transport = new hl.WebSocketTransport();
   *
   * const client = new hl.SubscriptionClient({ transport });
   * const sub = await client.assetCtxs((data) => console.log(data));
   * ```
   */
  assetCtxs(...args: OmitFirst<OverloadedParameters<typeof assetCtxs>>) {
    return assetCtxs(
      this,
      // @ts-ignore: TypeScript can't resolve overloaded signatures from parameter unions
      ...args,
    );
  }

  /**
   * Subscribe to best bid and offer updates for a specific asset.
   * @param params - Parameters specific to the API subscription.
   * @param listener - A callback function to be called when the event is received.
   * @returns A request-promise that resolves with a {@link Subscription} object to manage the subscription lifecycle.
   *
   * @throws {TransportError} When the transport layer throws an error.
   *
   * @see https://hyperliquid.gitbook.io/hyperliquid-docs/for-developers/api/websocket/subscriptions
   * @example
   * ```ts
   * import * as hl from "@nktkas/hyperliquid";
   *
   * const transport = new hl.WebSocketTransport();
   *
   * const client = new hl.SubscriptionClient({ transport });
   * const sub = await client.bbo({ coin: "ETH" }, (data) => console.log(data));
   * ```
   */
  bbo(...args: OmitFirst<OverloadedParameters<typeof bbo>>) {
    return bbo(this, ...args);
  }

  /**
   * Subscribe to candlestick data updates for a specific asset.
   * @param params - Parameters specific to the API subscription.
   * @param listener - A callback function to be called when the event is received.
   * @returns A request-promise that resolves with a {@link Subscription} object to manage the subscription lifecycle.
   *
   * @throws {TransportError} When the transport layer throws an error.
   *
   * @see https://hyperliquid.gitbook.io/hyperliquid-docs/for-developers/api/websocket/subscriptions
   * @example
   * ```ts
   * import * as hl from "@nktkas/hyperliquid";
   *
   * const transport = new hl.WebSocketTransport();
   *
   * const client = new hl.SubscriptionClient({ transport });
   * const sub = await client.candle({ coin: "ETH", interval: "1h" }, (data) => console.log(data));
   * ```
   */
  candle(...args: OmitFirst<OverloadedParameters<typeof candle>>) {
    return candle(this, ...args);
  }

  /**
   * Subscribe to clearinghouse state updates for a specific user.
   * @param params - Parameters specific to the API subscription.
   * @param listener - A callback function to be called when the event is received.
   * @returns A request-promise that resolves with a {@link Subscription} object to manage the subscription lifecycle.
   *
   * @throws {TransportError} When the transport layer throws an error.
   *
   * @see null
   * @example
   * ```ts
   * import * as hl from "@nktkas/hyperliquid";
   *
   * const transport = new hl.WebSocketTransport();
   *
   * const client = new hl.SubscriptionClient({ transport });
   * const sub = await client.clearinghouseState({ user: "0x..." }, (data) => console.log(data));
   * ```
   */
  clearinghouseState(...args: OmitFirst<OverloadedParameters<typeof clearinghouseState>>) {
    return clearinghouseState(this, ...args);
  }

  /**
   * Subscribe to explorer block updates.
   * @param listener - A callback function to be called when the event is received.
   * @returns A request-promise that resolves with a {@link Subscription} object to manage the subscription lifecycle.
   * @note Make sure the endpoint in the {@link transport} supports this method.
   *
   * @throws {TransportError} When the transport layer throws an error.
   *
   * @see null
   * @example
   * ```ts
   * import * as hl from "@nktkas/hyperliquid";
   *
   * const transport = new hl.WebSocketTransport({ url: "wss://rpc.hyperliquid.xyz/ws" }); // RPC endpoint
   *
   * const client = new hl.SubscriptionClient({ transport });
   * const sub = await client.explorerBlock((data) => console.log(data));
   * ```
   */
  explorerBlock(...args: OmitFirst<OverloadedParameters<typeof explorerBlock>>) {
    return explorerBlock(this, ...args);
  }

  /**
   * Subscribe to explorer transaction updates.
   * @param listener - A callback function to be called when the event is received.
   * @returns A request-promise that resolves with a {@link Subscription} object to manage the subscription lifecycle.
   * @note Make sure the endpoint in the {@link transport} supports this method.
   *
   * @throws {TransportError} When the transport layer throws an error.
   *
   * @see null
   * @example
   * ```ts
   * import * as hl from "@nktkas/hyperliquid";
   *
   * const transport = new hl.WebSocketTransport({ url: "wss://rpc.hyperliquid.xyz/ws" }); // RPC endpoint
   *
   * const client = new hl.SubscriptionClient({ transport });
   * const sub = await client.explorerTxs((data) => console.log(data));
   * ```
   */
  explorerTxs(...args: OmitFirst<OverloadedParameters<typeof explorerTxs>>) {
    return explorerTxs(this, ...args);
  }

  /**
   * Subscribe to L2 order book updates for a specific asset.
   * @param params - Parameters specific to the API subscription.
   * @param listener - A callback function to be called when the event is received.
   * @returns A request-promise that resolves with a {@link Subscription} object to manage the subscription lifecycle.
   *
   * @throws {TransportError} When the transport layer throws an error.
   *
   * @see https://hyperliquid.gitbook.io/hyperliquid-docs/for-developers/api/websocket/subscriptions
   * @example
   * ```ts
   * import * as hl from "@nktkas/hyperliquid";
   *
   * const transport = new hl.WebSocketTransport();
   *
   * const client = new hl.SubscriptionClient({ transport });
   * const sub = await client.l2Book({ coin: "ETH" }, (data) => console.log(data));
   * ```
   */
  l2Book(...args: OmitFirst<OverloadedParameters<typeof l2Book>>) {
    return l2Book(this, ...args);
  }

  /**
   * Subscribe to notification updates for a specific user.
   * @param params - Parameters specific to the API subscription.
   * @param listener - A callback function to be called when the event is received.
   * @returns A request-promise that resolves with a {@link Subscription} object to manage the subscription lifecycle.
   *
   * @throws {TransportError} When the transport layer throws an error.
   *
   * @see https://hyperliquid.gitbook.io/hyperliquid-docs/for-developers/api/websocket/subscriptions
   * @example
   * ```ts
   * import * as hl from "@nktkas/hyperliquid";
   *
   * const transport = new hl.WebSocketTransport();
   *
   * const client = new hl.SubscriptionClient({ transport });
   * const sub = await client.notification({ user: "0x..." }, (data) => console.log(data));
   * ```
   */
  notification(...args: OmitFirst<OverloadedParameters<typeof notification>>) {
    return notification(this, ...args);
  }

  /**
   * Subscribe to open orders updates for a specific user.
   * @param params - Parameters specific to the API subscription.
   * @param listener - A callback function to be called when the event is received.
   * @returns A request-promise that resolves with a {@link Subscription} object to manage the subscription lifecycle.
   *
   * @throws {TransportError} When the transport layer throws an error.
   *
   * @see https://hyperliquid.gitbook.io/hyperliquid-docs/for-developers/api/websocket/subscriptions
   * @example
   * ```ts
   * import * as hl from "@nktkas/hyperliquid";
   *
   * const transport = new hl.WebSocketTransport();
   *
   * const client = new hl.SubscriptionClient({ transport });
   * const sub = await client.openOrders({ user: "0x..." }, (data) => console.log(data));
   * ```
   */
  openOrders(...args: OmitFirst<OverloadedParameters<typeof openOrders>>) {
    return openOrders(this, ...args);
  }

  /**
   * Subscribe to order status updates for a specific user.
   * @param params - Parameters specific to the API subscription.
   * @param listener - A callback function to be called when the event is received.
   * @returns A request-promise that resolves with a {@link Subscription} object to manage the subscription lifecycle.
   *
   * @throws {TransportError} When the transport layer throws an error.
   *
   * @see https://hyperliquid.gitbook.io/hyperliquid-docs/for-developers/api/websocket/subscriptions
   * @example
   * ```ts
   * import * as hl from "@nktkas/hyperliquid";
   *
   * const transport = new hl.WebSocketTransport();
   *
   * const client = new hl.SubscriptionClient({ transport });
   * const sub = await client.orderUpdates({ user: "0x..." }, (data) => console.log(data));
   * ```
   */
  orderUpdates(...args: OmitFirst<OverloadedParameters<typeof orderUpdates>>) {
    return orderUpdates(this, ...args);
  }

  /**
   * Subscribe to real-time trade updates for a specific asset.
   * @param params - Parameters specific to the API subscription.
   * @param listener - A callback function to be called when the event is received.
   * @returns A request-promise that resolves with a {@link Subscription} object to manage the subscription lifecycle.
   *
   * @throws {TransportError} When the transport layer throws an error.
   *
   * @see https://hyperliquid.gitbook.io/hyperliquid-docs/for-developers/api/websocket/subscriptions
   * @example
   * ```ts
   * import * as hl from "@nktkas/hyperliquid";
   *
   * const transport = new hl.WebSocketTransport();
   *
   * const client = new hl.SubscriptionClient({ transport });
   * const sub = await client.trades({ coin: "ETH" }, (data) => console.log(data));
   * ```
   */
  trades(...args: OmitFirst<OverloadedParameters<typeof trades>>) {
    return trades(this, ...args);
  }

  /**
   * Subscribe to non-order events for a specific user.
   * @param params - Parameters specific to the API subscription.
   * @param listener - A callback function to be called when the event is received.
   * @returns A request-promise that resolves with a {@link Subscription} object to manage the subscription lifecycle.
   * @note Different subscriptions cannot be distinguished from each other.
   *
   * @throws {TransportError} When the transport layer throws an error.
   *
   * @see https://hyperliquid.gitbook.io/hyperliquid-docs/for-developers/api/websocket/subscriptions
   * @example
   * ```ts
   * import * as hl from "@nktkas/hyperliquid";
   *
   * const transport = new hl.WebSocketTransport();
   *
   * const client = new hl.SubscriptionClient({ transport });
   * const sub = await client.userEvents({ user: "0x..." }, (data) => console.log(data));
   * ```
   */
  userEvents(...args: OmitFirst<OverloadedParameters<typeof userEvents>>) {
    return userEvents(this, ...args);
  }

  /**
   * Subscribe to trade fill updates for a specific user.
   * @param params - Parameters specific to the API subscription.
   * @param listener - A callback function to be called when the event is received.
   * @returns A request-promise that resolves with a {@link Subscription} object to manage the subscription lifecycle.
   *
   * @throws {TransportError} When the transport layer throws an error.
   *
   * @see https://hyperliquid.gitbook.io/hyperliquid-docs/for-developers/api/websocket/subscriptions
   * @example
   * ```ts
   * import * as hl from "@nktkas/hyperliquid";
   *
   * const transport = new hl.WebSocketTransport();
   *
   * const client = new hl.SubscriptionClient({ transport });
   * const sub = await client.userFills({ user: "0x..." }, (data) => console.log(data));
   * ```
   */
  userFills(...args: OmitFirst<OverloadedParameters<typeof userFills>>) {
    return userFills(this, ...args);
  }

  /**
   * Subscribe to funding payment updates for a specific user.
   * @param params - Parameters specific to the API subscription.
   * @param listener - A callback function to be called when the event is received.
   * @returns A request-promise that resolves with a {@link Subscription} object to manage the subscription lifecycle.
   *
   * @throws {TransportError} When the transport layer throws an error.
   *
   * @see https://hyperliquid.gitbook.io/hyperliquid-docs/for-developers/api/websocket/subscriptions
   * @example
   * ```ts
   * import * as hl from "@nktkas/hyperliquid";
   *
   * const transport = new hl.WebSocketTransport();
   *
   * const client = new hl.SubscriptionClient({ transport });
   * const sub = await client.userFundings({ user: "0x..." }, (data) => console.log(data));
   * ```
   */
  userFundings(...args: OmitFirst<OverloadedParameters<typeof userFundings>>) {
    return userFundings(this, ...args);
  }

  /**
   * Subscribe to non-funding ledger updates for a specific user.
   * @param params - Parameters specific to the API subscription.
   * @param listener - A callback function to be called when the event is received.
   * @returns A request-promise that resolves with a {@link Subscription} object to manage the subscription lifecycle.
   *
   * @throws {TransportError} When the transport layer throws an error.
   *
   * @see https://hyperliquid.gitbook.io/hyperliquid-docs/for-developers/api/websocket/subscriptions
   * @example
   * ```ts
   * import * as hl from "@nktkas/hyperliquid";
   *
   * const transport = new hl.WebSocketTransport();
   *
   * const client = new hl.SubscriptionClient({ transport });
   * const sub = await client.userNonFundingLedgerUpdates({ user: "0x..." }, (data) => console.log(data));
   * ```
   */
  userNonFundingLedgerUpdates(...args: OmitFirst<OverloadedParameters<typeof userNonFundingLedgerUpdates>>) {
    return userNonFundingLedgerUpdates(this, ...args);
  }

  /**
   * Subscribe to TWAP order history updates for a specific user.
   * @param params - Parameters specific to the API subscription.
   * @param listener - A callback function to be called when the event is received.
   * @returns A request-promise that resolves with a {@link Subscription} object to manage the subscription lifecycle.
   *
   * @throws {TransportError} When the transport layer throws an error.
   *
   * @see https://hyperliquid.gitbook.io/hyperliquid-docs/for-developers/api/websocket/subscriptions
   * @example
   * ```ts
   * import * as hl from "@nktkas/hyperliquid";
   *
   * const transport = new hl.WebSocketTransport();
   *
   * const client = new hl.SubscriptionClient({ transport });
   * const sub = await client.userTwapHistory({ user: "0x..." }, (data) => console.log(data));
   * ```
   */
  userTwapHistory(...args: OmitFirst<OverloadedParameters<typeof userTwapHistory>>) {
    return userTwapHistory(this, ...args);
  }

  /**
   * Subscribe to TWAP execution updates for a specific user.
   * @param params - Parameters specific to the API subscription.
   * @param listener - A callback function to be called when the event is received.
   * @returns A request-promise that resolves with a {@link Subscription} object to manage the subscription lifecycle.
   *
   * @throws {TransportError} When the transport layer throws an error.
   *
   * @see https://hyperliquid.gitbook.io/hyperliquid-docs/for-developers/api/websocket/subscriptions
   * @example
   * ```ts
   * import * as hl from "@nktkas/hyperliquid";
   *
   * const transport = new hl.WebSocketTransport();
   *
   * const client = new hl.SubscriptionClient({ transport });
   * const sub = await client.userTwapSliceFills({ user: "0x..." }, (data) => console.log(data));
   * ```
   */
  userTwapSliceFills(...args: OmitFirst<OverloadedParameters<typeof userTwapSliceFills>>) {
    return userTwapSliceFills(this, ...args);
  }

  /**
   * Subscribe to comprehensive user and market data updates.
   * @param params - Parameters specific to the API subscription.
   * @param listener - A callback function to be called when the event is received.
   * @returns A request-promise that resolves with a {@link Subscription} object to manage the subscription lifecycle.
   *
   * @throws {TransportError} When the transport layer throws an error.
   *
   * @see https://hyperliquid.gitbook.io/hyperliquid-docs/for-developers/api/websocket/subscriptions
   * @example
   * ```ts
   * import * as hl from "@nktkas/hyperliquid";
   *
   * const transport = new hl.WebSocketTransport();
   *
   * const client = new hl.SubscriptionClient({ transport });
   * const sub = await client.webData2({ user: "0x..." }, (data) => console.log(data));
   * ```
   */
  webData2(...args: OmitFirst<OverloadedParameters<typeof webData2>>) {
    return webData2(this, ...args);
  }
}
