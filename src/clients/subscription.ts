import type { ISubscriptionTransport, Subscription } from "../transports/base.ts";
import type {
    Book,
    Candle,
    Order,
    OrderStatus,
    TxDetails,
    WsActiveAssetCtx,
    WsActiveAssetCtxRequest,
    WsActiveAssetData,
    WsActiveAssetDataRequest,
    WsActiveSpotAssetCtx,
    WsAllMids,
    WsAllMidsRequest,
    WsBbo,
    WsBboRequest,
    WsBlockDetails,
    WsCandleRequest,
    WsExplorerBlockRequest,
    WsExplorerTxsRequest,
    WsL2BookRequest,
    WsNotification,
    WsNotificationRequest,
    WsOrderUpdatesRequest,
    WsTrade,
    WsTradesRequest,
    WsUserEvent,
    WsUserEventsRequest,
    WsUserFills,
    WsUserFillsRequest,
    WsUserFundings,
    WsUserFundingsRequest,
    WsUserNonFundingLedgerUpdates,
    WsUserNonFundingLedgerUpdatesRequest,
    WsUserTwapHistory,
    WsUserTwapHistoryRequest,
    WsUserTwapSliceFills,
    WsUserTwapSliceFillsRequest,
    WsWebData2,
    WsWebData2Request,
} from "../types/mod.ts";

/** Parameters for the {@linkcode SubscriptionClient} constructor. */
export interface SubscriptionClientParameters<T extends ISubscriptionTransport = ISubscriptionTransport> {
    /** The transport used to connect to the Hyperliquid API. */
    transport: T;
}

/** Subscription parameters for the {@linkcode SubscriptionClient.activeAssetCtx} method. */
export type EventActiveAssetCtxParameters = Omit<WsActiveAssetCtxRequest, "type">;
/** Subscription parameters for the {@linkcode SubscriptionClient.activeAssetData} method. */
export type EventActiveAssetDataParameters = Omit<WsActiveAssetDataRequest, "type">;
/** Subscription parameters for the {@linkcode SubscriptionClient.allMids} method. */
export type WsAllMidsParameters = Omit<WsAllMidsRequest, "type">;
/** Subscription parameters for the {@linkcode SubscriptionClient.bbo} method. */
export type EventBboParameters = Omit<WsBboRequest, "type">;
/** Subscription parameters for the {@linkcode SubscriptionClient.candle} method. */
export type EventCandleParameters = Omit<WsCandleRequest, "type">;
/** Subscription parameters for the {@linkcode SubscriptionClient.l2Book} method. */
export type EventL2BookParameters = Omit<WsL2BookRequest, "type">;
/** Subscription parameters for the {@linkcode SubscriptionClient.notification} method. */
export type EventNotificationParameters = Omit<WsNotificationRequest, "type">;
/** Subscription parameters for the {@linkcode SubscriptionClient.orderUpdates} method. */
export type EventOrderUpdatesParameters = Omit<WsOrderUpdatesRequest, "type">;
/** Subscription parameters for the {@linkcode SubscriptionClient.trades} method. */
export type EventTradesParameters = Omit<WsTradesRequest, "type">;
/** Subscription parameters for the {@linkcode SubscriptionClient.userEvents} method. */
export type EventUserEventsParameters = Omit<WsUserEventsRequest, "type">;
/** Subscription parameters for the {@linkcode SubscriptionClient.userFills} method. */
export type EventUserFillsParameters = Omit<WsUserFillsRequest, "type">;
/** Subscription parameters for the {@linkcode SubscriptionClient.userFundings} method. */
export type EventUserFundingsParameters = Omit<WsUserFundingsRequest, "type">;
/** Subscription parameters for the {@linkcode SubscriptionClient.userNonFundingLedgerUpdates} method. */
export type EventUserNonFundingLedgerUpdatesParameters = Omit<WsUserNonFundingLedgerUpdatesRequest, "type">;
/** Subscription parameters for the {@linkcode SubscriptionClient.userTwapHistory} method. */
export type EventUserTwapHistory = Omit<WsUserTwapHistoryRequest, "type">;
/** Subscription parameters for the {@linkcode SubscriptionClient.userTwapSliceFills} method. */
export type EventUserTwapSliceFills = Omit<WsUserTwapSliceFillsRequest, "type">;
/** Subscription parameters for the {@linkcode SubscriptionClient.webData2} method. */
export type EventWebData2Parameters = Omit<WsWebData2Request, "type">;

/**
 * Subscription client for subscribing to various Hyperliquid events.
 * @typeParam T The type of transport used to connect to the Hyperliquid Websocket API.
 */
export class SubscriptionClient<
    T extends ISubscriptionTransport = ISubscriptionTransport,
> implements SubscriptionClientParameters<T>, AsyncDisposable {
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
    constructor(args: SubscriptionClientParameters<T>) {
        this.transport = args.transport;
    }

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
    activeAssetCtx(
        params: EventActiveAssetCtxParameters,
        listener: (data: WsActiveAssetCtx | WsActiveSpotAssetCtx) => void,
    ): Promise<Subscription> {
        const channel = params.coin.startsWith("@") ? "activeSpotAssetCtx" : "activeAssetCtx";
        const payload = { type: "activeAssetCtx", ...params } satisfies WsActiveAssetCtxRequest;
        return this.transport.subscribe<WsActiveAssetCtx | WsActiveSpotAssetCtx>(channel, payload, (e) => {
            if (e.detail.coin === params.coin) {
                listener(e.detail);
            }
        });
    }

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
    activeAssetData(
        params: EventActiveAssetDataParameters,
        listener: (data: WsActiveAssetData) => void,
    ): Promise<Subscription> {
        const payload = { type: "activeAssetData", ...params } satisfies WsActiveAssetDataRequest;
        return this.transport.subscribe<WsActiveAssetData>(payload.type, payload, (e) => {
            if (e.detail.coin === params.coin && e.detail.user === params.user.toLowerCase()) {
                listener(e.detail);
            }
        });
    }

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
    allMids(params: WsAllMidsParameters, listener: (data: WsAllMids) => void): Promise<Subscription>;
    allMids(
        params_or_listener: WsAllMidsParameters | ((data: WsAllMids) => void),
        maybeListener?: (data: WsAllMids) => void,
    ): Promise<Subscription> {
        const params = typeof params_or_listener === "function" ? {} : params_or_listener;
        const listener = typeof params_or_listener === "function" ? params_or_listener : maybeListener!;

        const payload = { type: "allMids", ...params } satisfies WsAllMidsRequest;
        return this.transport.subscribe<WsAllMids>(payload.type, payload, (e) => {
            listener(e.detail);
        });
    }

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
    bbo(params: EventBboParameters, listener: (data: WsBbo) => void): Promise<Subscription> {
        const payload = { type: "bbo", ...params } satisfies WsBboRequest;
        return this.transport.subscribe<WsBbo>(payload.type, payload, (e) => {
            if (e.detail.coin === params.coin) {
                listener(e.detail);
            }
        });
    }

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
    candle(params: EventCandleParameters, listener: (data: Candle) => void): Promise<Subscription> {
        const payload = { type: "candle", ...params } satisfies WsCandleRequest;
        return this.transport.subscribe<Candle>(payload.type, payload, (e) => {
            if (e.detail.s === params.coin && e.detail.i === params.interval) {
                listener(e.detail);
            }
        });
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
     * const transport = new hl.WebSocketTransport();
     * const subsClient = new hl.SubscriptionClient({ transport });
     *
     * const sub = await subsClient.explorerBlock((data) => {
     *   console.log(data);
     * });
     * ```
     */
    explorerBlock(listener: (data: WsBlockDetails[]) => void): Promise<Subscription> {
        const payload = { type: "explorerBlock" } satisfies WsExplorerBlockRequest;
        return this.transport.subscribe<WsBlockDetails[]>("_explorerBlock", payload, (e) => { // Internal channel as it does not have its own channel
            listener(e.detail);
        });
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
     * const transport = new hl.WebSocketTransport();
     * const subsClient = new hl.SubscriptionClient({ transport });
     *
     * const sub = await subsClient.explorerTxs((data) => {
     *   console.log(data);
     * });
     * ```
     */
    explorerTxs(listener: (data: TxDetails[]) => void): Promise<Subscription> {
        const payload = { type: "explorerTxs" } satisfies WsExplorerTxsRequest;
        return this.transport.subscribe<TxDetails[]>("_explorerTxs", payload, (e) => { // Internal channel as it does not have its own channel
            listener(e.detail);
        });
    }

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
    l2Book(params: EventL2BookParameters, listener: (data: Book) => void): Promise<Subscription> {
        const payload = {
            type: "l2Book",
            nSigFigs: params.nSigFigs ?? null,
            mantissa: params.mantissa ?? null,
            ...params,
        } satisfies WsL2BookRequest;
        return this.transport.subscribe<Book>(payload.type, payload, (e) => {
            if (e.detail.coin === params.coin) {
                listener(e.detail);
            }
        });
    }

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
    notification(params: EventNotificationParameters, listener: (data: WsNotification) => void): Promise<Subscription> {
        const payload = { type: "notification", user: params.user } satisfies WsNotificationRequest;
        return this.transport.subscribe<WsNotification>(payload.type, payload, (e) => {
            listener(e.detail);
        });
    }

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
    orderUpdates(
        params: EventOrderUpdatesParameters,
        listener: (data: OrderStatus<Order>[]) => void,
    ): Promise<Subscription> {
        const payload = { type: "orderUpdates", ...params } satisfies WsOrderUpdatesRequest;
        return this.transport.subscribe<OrderStatus<Order>[]>(payload.type, payload, (e) => {
            listener(e.detail);
        });
    }

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
    trades(params: EventTradesParameters, listener: (data: WsTrade[]) => void): Promise<Subscription> {
        const payload = { type: "trades", ...params } satisfies WsTradesRequest;
        return this.transport.subscribe<WsTrade[]>(payload.type, payload, (e) => {
            if (e.detail[0]?.coin === params.coin) {
                listener(e.detail);
            }
        });
    }

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
    userEvents(params: EventUserEventsParameters, listener: (data: WsUserEvent) => void): Promise<Subscription> {
        const payload = { type: "userEvents", ...params } satisfies WsUserEventsRequest;
        return this.transport.subscribe<WsUserEvent>("user", payload, (e) => {
            listener(e.detail);
        });
    }

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
    userFills(params: EventUserFillsParameters, listener: (data: WsUserFills) => void): Promise<Subscription> {
        const payload = {
            type: "userFills",
            aggregateByTime: params.aggregateByTime ?? false,
            ...params,
        } satisfies WsUserFillsRequest;
        return this.transport.subscribe<WsUserFills>(payload.type, payload, (e) => {
            if (e.detail.user === params.user.toLowerCase()) {
                listener(e.detail);
            }
        });
    }

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
    userFundings(params: EventUserFundingsParameters, listener: (data: WsUserFundings) => void): Promise<Subscription> {
        const payload = { type: "userFundings", ...params } satisfies WsUserFundingsRequest;
        return this.transport.subscribe<WsUserFundings>(payload.type, payload, (e) => {
            if (e.detail.user === params.user.toLowerCase()) {
                listener(e.detail);
            }
        });
    }

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
    userNonFundingLedgerUpdates(
        params: EventUserNonFundingLedgerUpdatesParameters,
        listener: (data: WsUserNonFundingLedgerUpdates) => void,
    ): Promise<Subscription> {
        const payload = {
            type: "userNonFundingLedgerUpdates",
            ...params,
        } satisfies WsUserNonFundingLedgerUpdatesRequest;
        return this.transport.subscribe<WsUserNonFundingLedgerUpdates>(payload.type, payload, (e) => {
            if (e.detail.user === params.user.toLowerCase()) {
                listener(e.detail);
            }
        });
    }

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
    userTwapHistory(params: EventUserTwapHistory, listener: (data: WsUserTwapHistory) => void): Promise<Subscription> {
        const payload = { type: "userTwapHistory", ...params } satisfies WsUserTwapHistoryRequest;
        return this.transport.subscribe<WsUserTwapHistory>(payload.type, payload, (e) => {
            if (e.detail.user === params.user.toLowerCase()) {
                listener(e.detail);
            }
        });
    }

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
    userTwapSliceFills(
        params: EventUserTwapSliceFills,
        listener: (data: WsUserTwapSliceFills) => void,
    ): Promise<Subscription> {
        const payload = { type: "userTwapSliceFills", ...params } satisfies WsUserTwapSliceFillsRequest;
        return this.transport.subscribe<WsUserTwapSliceFills>(payload.type, payload, (e) => {
            if (e.detail.user === params.user.toLowerCase()) {
                listener(e.detail);
            }
        });
    }

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
    webData2(params: EventWebData2Parameters, listener: (data: WsWebData2) => void): Promise<Subscription> {
        const payload = { type: "webData2", ...params } satisfies WsWebData2Request;
        return this.transport.subscribe<WsWebData2>(payload.type, payload, (e) => {
            if (e.detail.user === params.user.toLowerCase()) {
                listener(e.detail);
            }
        });
    }

    async [Symbol.asyncDispose](): Promise<void> {
        await this.transport[Symbol.asyncDispose]?.();
    }
}
