import type { ISubscriptionTransport, Subscription } from "../transports/base.js";
import type { ActiveAssetData, ActiveAssetDataRequest, AllMidsRequest, Book, Candle, L2BookRequest, Order, OrderStatus, TxDetails, UserFillsRequest, UserTwapSliceFillsRequest, WsActiveAssetCtx, WsActiveAssetCtxRequest, WsActiveSpotAssetCtx, WsAllMids, WsBbo, WsBboRequest, WsBlockDetails, WsCandleRequest, WsNotification, WsNotificationRequest, WsOrderUpdatesRequest, WsTrade, WsTradesRequest, WsUserEvent, WsUserEventsRequest, WsUserFills, WsUserFundings, WsUserFundingsRequest, WsUserNonFundingLedgerUpdates, WsUserNonFundingLedgerUpdatesRequest, WsUserTwapHistory, WsUserTwapHistoryRequest, WsUserTwapSliceFills, WsWebData2, WsWebData2Request } from "../types/mod.js";
/** @see https://github.com/microsoft/TypeScript/issues/13923#issuecomment-2191862501 */
type DeepImmutable<T> = {
    readonly [K in keyof T]: DeepImmutable<T[K]>;
};
/** Parameters for the {@linkcode SubscriptionClient} constructor. */
export interface SubscriptionClientParameters<T extends ISubscriptionTransport = ISubscriptionTransport> {
    /** The transport used to connect to the Hyperliquid API. */
    transport: T;
}
/** Subscription parameters for the {@linkcode SubscriptionClient.activeAssetCtx} method. */
export type EventActiveAssetCtxParameters = Omit<WsActiveAssetCtxRequest, "type">;
/** Subscription parameters for the {@linkcode SubscriptionClient.activeAssetData} method. */
export type EventActiveAssetDataParameters = Omit<ActiveAssetDataRequest, "type">;
/** Subscription parameters for the {@linkcode SubscriptionClient.allMids} method. */
export type WsAllMidsParameters = Omit<AllMidsRequest, "type">;
/** Subscription parameters for the {@linkcode SubscriptionClient.bbo} method. */
export type EventBboParameters = Omit<WsBboRequest, "type">;
/** Subscription parameters for the {@linkcode SubscriptionClient.candle} method. */
export type EventCandleParameters = Omit<WsCandleRequest, "type">;
/** Subscription parameters for the {@linkcode SubscriptionClient.l2Book} method. */
export type EventL2BookParameters = Omit<L2BookRequest, "type">;
/** Subscription parameters for the {@linkcode SubscriptionClient.notification} method. */
export type EventNotificationParameters = Omit<WsNotificationRequest, "type">;
/** Subscription parameters for the {@linkcode SubscriptionClient.orderUpdates} method. */
export type EventOrderUpdatesParameters = Omit<WsOrderUpdatesRequest, "type">;
/** Subscription parameters for the {@linkcode SubscriptionClient.trades} method. */
export type EventTradesParameters = Omit<WsTradesRequest, "type">;
/** Subscription parameters for the {@linkcode SubscriptionClient.userEvents} method. */
export type EventUserEventsParameters = Omit<WsUserEventsRequest, "type">;
/** Subscription parameters for the {@linkcode SubscriptionClient.userFills} method. */
export type EventUserFillsParameters = Omit<UserFillsRequest, "type">;
/** Subscription parameters for the {@linkcode SubscriptionClient.userFundings} method. */
export type EventUserFundingsParameters = Omit<WsUserFundingsRequest, "type">;
/** Subscription parameters for the {@linkcode SubscriptionClient.userNonFundingLedgerUpdates} method. */
export type EventUserNonFundingLedgerUpdatesParameters = Omit<WsUserNonFundingLedgerUpdatesRequest, "type">;
/** Subscription parameters for the {@linkcode SubscriptionClient.userTwapHistory} method. */
export type EventUserTwapHistory = Omit<WsUserTwapHistoryRequest, "type">;
/** Subscription parameters for the {@linkcode SubscriptionClient.userTwapSliceFills} method. */
export type EventUserTwapSliceFills = Omit<UserTwapSliceFillsRequest, "type">;
/** Subscription parameters for the {@linkcode SubscriptionClient.webData2} method. */
export type EventWebData2Parameters = Omit<WsWebData2Request, "type">;
/**
 * Subscription client for subscribing to various Hyperliquid events.
 * @typeParam T The type of transport used to connect to the Hyperliquid Websocket API.
 */
export declare class SubscriptionClient<T extends ISubscriptionTransport = ISubscriptionTransport> implements SubscriptionClientParameters<T>, AsyncDisposable {
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
    constructor(args: SubscriptionClientParameters<T>);
    /**
     * Subscribe to context updates for a specific perpetual asset.
     * @param params - Subscription-specific parameters.
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
     * const subsClient = new hl.SubscriptionClient({ transport });
     *
     * const sub = await subsClient.activeAssetCtx({ coin: "BTC" }, (data) => {
     *   console.log(data);
     * });
     * ```
     */
    activeAssetCtx(params: DeepImmutable<EventActiveAssetCtxParameters>, listener: (data: WsActiveAssetCtx | WsActiveSpotAssetCtx) => void): Promise<Subscription>;
    /**
     * Subscribe to trading data updates for a specific asset and user.
     * @param params - Subscription-specific parameters.
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
     * const subsClient = new hl.SubscriptionClient({ transport });
     *
     * const sub = await subsClient.activeAssetData({ coin: "BTC", user: "0x..." }, (data) => {
     *   console.log(data);
     * });
     * ```
     */
    activeAssetData(params: DeepImmutable<EventActiveAssetDataParameters>, listener: (data: ActiveAssetData) => void): Promise<Subscription>;
    /**
     * Subscribe to mid prices for all actively traded assets.
     * @param params - An optional subscription-specific parameters.
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
     * const subsClient = new hl.SubscriptionClient({ transport });
     *
     * const sub = await subsClient.allMids((data) => {
     *   console.log(data);
     * });
     * ```
     */
    allMids(listener: (data: WsAllMids) => void): Promise<Subscription>;
    allMids(params: DeepImmutable<WsAllMidsParameters>, listener: (data: WsAllMids) => void): Promise<Subscription>;
    /**
     * Subscribe to best bid and offer updates for a specific asset.
     * @param params - Subscription-specific parameters.
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
     * const subsClient = new hl.SubscriptionClient({ transport });
     *
     * const sub = await subsClient.bbo({ coin: "BTC" }, (data) => {
     *   console.log(data);
     * });
     * ```
     */
    bbo(params: DeepImmutable<EventBboParameters>, listener: (data: WsBbo) => void): Promise<Subscription>;
    /**
     * Subscribe to candlestick data updates for a specific asset.
     * @param params - Subscription-specific parameters.
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
     * const subsClient = new hl.SubscriptionClient({ transport });
     *
     * const sub = await subsClient.candle({ coin: "BTC", interval: "1h" }, (data) => {
     *   console.log(data);
     * });
     * ```
     */
    candle(params: DeepImmutable<EventCandleParameters>, listener: (data: Candle) => void): Promise<Subscription>;
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
     * const transport = new hl.WebSocketTransport();
     * const subsClient = new hl.SubscriptionClient({ transport });
     *
     * const sub = await subsClient.explorerBlock((data) => {
     *   console.log(data);
     * });
     * ```
     */
    explorerBlock(listener: (data: WsBlockDetails[]) => void): Promise<Subscription>;
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
     * const transport = new hl.WebSocketTransport();
     * const subsClient = new hl.SubscriptionClient({ transport });
     *
     * const sub = await subsClient.explorerTxs((data) => {
     *   console.log(data);
     * });
     * ```
     */
    explorerTxs(listener: (data: TxDetails[]) => void): Promise<Subscription>;
    /**
     * Subscribe to L2 order book updates for a specific asset.
     * @param params - Subscription-specific parameters.
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
     * const subsClient = new hl.SubscriptionClient({ transport });
     *
     * const sub = await subsClient.l2Book({ coin: "BTC" }, (data) => {
     *   console.log(data);
     * });
     * ```
     */
    l2Book(params: DeepImmutable<EventL2BookParameters>, listener: (data: Book) => void): Promise<Subscription>;
    /**
     * Subscribe to notification updates for a specific user.
     * @param params - Subscription-specific parameters.
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
     * const subsClient = new hl.SubscriptionClient({ transport });
     *
     * const sub = await subsClient.notification({ user: "0x..." }, (data) => {
     *   console.log(data);
     * });
     * ```
     */
    notification(params: DeepImmutable<EventNotificationParameters>, listener: (data: WsNotification) => void): Promise<Subscription>;
    /**
     * Subscribe to order status updates for a specific user.
     * @param params - Subscription-specific parameters.
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
     * const subsClient = new hl.SubscriptionClient({ transport });
     *
     * const sub = await subsClient.orderUpdates({ user: "0x..." }, (data) => {
     *   console.log(data);
     * });
     * ```
     */
    orderUpdates(params: DeepImmutable<EventOrderUpdatesParameters>, listener: (data: OrderStatus<Order>[]) => void): Promise<Subscription>;
    /**
     * Subscribe to real-time trade updates for a specific asset.
     * @param params - Subscription-specific parameters.
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
     * const subsClient = new hl.SubscriptionClient({ transport });
     *
     * const sub = await subsClient.trades({ coin: "BTC" }, (data) => {
     *   console.log(data);
     * });
     * ```
     */
    trades(params: DeepImmutable<EventTradesParameters>, listener: (data: WsTrade[]) => void): Promise<Subscription>;
    /**
     * Subscribe to non-order events for a specific user.
     * @param params - Subscription-specific parameters.
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
     * const subsClient = new hl.SubscriptionClient({ transport });
     *
     * const sub = await subsClient.userEvents({ user: "0x..." }, (data) => {
     *   console.log(data);
     * });
     * ```
     */
    userEvents(params: DeepImmutable<EventUserEventsParameters>, listener: (data: WsUserEvent) => void): Promise<Subscription>;
    /**
     * Subscribe to trade fill updates for a specific user.
     * @param params - Subscription-specific parameters.
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
     * const subsClient = new hl.SubscriptionClient({ transport });
     *
     * const sub = await subsClient.userFills({ user: "0x..." }, (data) => {
     *   console.log(data);
     * });
     * ```
     */
    userFills(params: DeepImmutable<EventUserFillsParameters>, listener: (data: WsUserFills) => void): Promise<Subscription>;
    /**
     * Subscribe to funding payment updates for a specific user.
     * @param params - Subscription-specific parameters.
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
     * const subsClient = new hl.SubscriptionClient({ transport });
     *
     * const sub = await subsClient.userFundings({ user: "0x..." }, (data) => {
     *   console.log(data);
     * });
     * ```
     */
    userFundings(params: DeepImmutable<EventUserFundingsParameters>, listener: (data: WsUserFundings) => void): Promise<Subscription>;
    /**
     * Subscribe to non-funding ledger updates for a specific user.
     * @param params - Subscription-specific parameters.
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
     * const subsClient = new hl.SubscriptionClient({ transport });
     *
     * const sub = await subsClient.userNonFundingLedgerUpdates({ user: "0x..." }, (data) => {
     *   console.log(data);
     * });
     * ```
     */
    userNonFundingLedgerUpdates(params: DeepImmutable<EventUserNonFundingLedgerUpdatesParameters>, listener: (data: WsUserNonFundingLedgerUpdates) => void): Promise<Subscription>;
    /**
     * Subscribe to TWAP order history updates for a specific user.
     * @param params - Subscription-specific parameters.
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
     * const subsClient = new hl.SubscriptionClient({ transport });
     *
     * const sub = await subsClient.userTwapHistory({ user: "0x..." }, (data) => {
     *   console.log(data);
     * });
     * ```
     */
    userTwapHistory(params: DeepImmutable<EventUserTwapHistory>, listener: (data: WsUserTwapHistory) => void): Promise<Subscription>;
    /**
     * Subscribe to TWAP execution updates for a specific user.
     * @param params - Subscription-specific parameters.
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
     * const subsClient = new hl.SubscriptionClient({ transport });
     *
     * const sub = await subsClient.userTwapSliceFills({ user: "0x..." }, (data) => {
     *   console.log(data);
     * });
     * ```
     */
    userTwapSliceFills(params: DeepImmutable<EventUserTwapSliceFills>, listener: (data: WsUserTwapSliceFills) => void): Promise<Subscription>;
    /**
     * Subscribe to comprehensive user and market data updates.
     * @param params - Subscription-specific parameters.
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
     * const subsClient = new hl.SubscriptionClient({ transport });
     *
     * const sub = await subsClient.webData2({ user: "0x..." }, (data) => {
     *   console.log(data);
     * });
     * ```
     */
    webData2(params: DeepImmutable<EventWebData2Parameters>, listener: (data: WsWebData2) => void): Promise<Subscription>;
    [Symbol.asyncDispose](): Promise<void>;
}
export {};
//# sourceMappingURL=subscription.d.ts.map