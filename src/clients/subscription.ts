import type { ISubscriptionTransport, Subscription } from "../transports/base.ts";
import type {
    WsActiveAssetCtxRequest,
    WsActiveAssetDataRequest,
    WsAllMidsRequest,
    WsBboRequest,
    WsCandleRequest,
    WsExplorerBlockRequest,
    WsExplorerTxsRequest,
    WsL2BookRequest,
    WsNotificationRequest,
    WsOrderUpdatesRequest,
    WsTradesRequest,
    WsUserEventsRequest,
    WsUserFillsRequest,
    WsUserFundingsRequest,
    WsUserNonFundingLedgerUpdatesRequest,
    WsUserTwapHistoryRequest,
    WsUserTwapSliceFillsRequest,
    WsWebData2Request,
} from "../types/subscriptions/requests.ts";
import type {
    WsActiveAssetCtx,
    WsActiveAssetData,
    WsActiveSpotAssetCtx,
    WsAllMids,
    WsBbo,
    WsBlockDetails,
    WsNotification,
    WsTrade,
    WsUserEvent,
    WsUserFills,
    WsUserFundings,
    WsUserNonFundingLedgerUpdates,
    WsUserTwapHistory,
    WsUserTwapSliceFills,
    WsWebData2,
} from "../types/subscriptions/responses.ts";
import type { Candle } from "../types/info/assets.ts";
import type { Book, Order, OrderStatus } from "../types/info/orders.ts";
import type { TxDetails } from "../types/explorer/responses.ts";

/** Parameters for the {@linkcode SubscriptionClient} constructor. */
export interface SubscriptionClientParameters<T extends ISubscriptionTransport = ISubscriptionTransport> {
    /** The transport used to connect to the Hyperliquid API. */
    transport: T;
}

/** Parameters for the {@linkcode SubscriptionClient.activeAssetCtx} method. */
export type EventActiveAssetCtxParameters = Omit<WsActiveAssetCtxRequest, "type">;

/** Parameters for the {@linkcode SubscriptionClient.activeAssetData} method. */
export type EventActiveAssetDataParameters = Omit<WsActiveAssetDataRequest, "type">;

/** Parameters for the {@linkcode SubscriptionClient.allMids} method. */
export type WsAllMidsParameters = Omit<WsAllMidsRequest, "type">;

/** Parameters for the {@linkcode SubscriptionClient.bbo} method. */
export type EventBboParameters = Omit<WsBboRequest, "type">;

/** Parameters for the {@linkcode SubscriptionClient.candle} method. */
export type EventCandleParameters = Omit<WsCandleRequest, "type">;

/** Parameters for the {@linkcode SubscriptionClient.l2Book} method. */
export type EventL2BookParameters = Omit<WsL2BookRequest, "type">;

/** Parameters for the {@linkcode SubscriptionClient.notification} method. */
export type EventNotificationParameters = Omit<WsNotificationRequest, "type">;

/** Parameters for the {@linkcode SubscriptionClient.orderUpdates} method. */
export type EventOrderUpdatesParameters = Omit<WsOrderUpdatesRequest, "type">;

/** Parameters for the {@linkcode SubscriptionClient.trades} method. */
export type EventTradesParameters = Omit<WsTradesRequest, "type">;

/** Parameters for the {@linkcode SubscriptionClient.userEvents} method. */
export type EventUserEventsParameters = Omit<WsUserEventsRequest, "type">;

/** Parameters for the {@linkcode SubscriptionClient.userFills} method. */
export type EventUserFillsParameters = Omit<WsUserFillsRequest, "type">;

/** Parameters for the {@linkcode SubscriptionClient.userFundings} method. */
export type EventUserFundingsParameters = Omit<WsUserFundingsRequest, "type">;

/** Parameters for the {@linkcode SubscriptionClient.userNonFundingLedgerUpdates} method. */
export type EventUserNonFundingLedgerUpdatesParameters = Omit<WsUserNonFundingLedgerUpdatesRequest, "type">;

/** Parameters for the {@linkcode SubscriptionClient.userTwapHistory} method. */
export type EventUserTwapHistory = Omit<WsUserTwapHistoryRequest, "type">;

/** Parameters for the {@linkcode SubscriptionClient.userTwapSliceFills} method. */
export type EventUserTwapSliceFills = Omit<WsUserTwapSliceFillsRequest, "type">;

/** Parameters for the {@linkcode SubscriptionClient.webData2} method. */
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
     * @param args - The parameters for the subscription.
     * @param listener - The callback function to be called when the event is received.
     * @returns A promise that resolves with a {@link Subscription} object to manage the subscription lifecycle.
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
        args: EventActiveAssetCtxParameters,
        listener: (data: WsActiveAssetCtx | WsActiveSpotAssetCtx) => void,
    ): Promise<Subscription> {
        const channel = args.coin.startsWith("@") ? "activeSpotAssetCtx" : "activeAssetCtx";
        const payload: WsActiveAssetCtxRequest = {
            type: "activeAssetCtx",
            coin: args.coin,
        };
        return this.transport.subscribe<WsActiveAssetCtx | WsActiveSpotAssetCtx>(channel, payload, (e) => {
            if (e.detail.coin === args.coin) {
                listener(e.detail);
            }
        });
    }

    /**
     * Subscribe to trading data updates for a specific asset and user.
     * @param args - The parameters for the subscription.
     * @param listener - The callback function to be called when the event is received.
     * @returns A promise that resolves with a {@link Subscription} object to manage the subscription lifecycle.
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
        args: EventActiveAssetDataParameters,
        listener: (data: WsActiveAssetData) => void,
    ): Promise<Subscription> {
        const payload: WsActiveAssetDataRequest = {
            type: "activeAssetData",
            coin: args.coin,
            user: args.user,
        };
        return this.transport.subscribe<WsActiveAssetData>(payload.type, payload, (e) => {
            if (e.detail.coin === args.coin && e.detail.user === args.user.toLowerCase()) {
                listener(e.detail);
            }
        });
    }

    /**
     * Subscribe to mid prices for all actively traded assets.
     * @param listener - The callback function to be called when the event is received.
     * @returns A promise that resolves with a {@link Subscription} object to manage the subscription lifecycle.
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
    allMids(
        args: WsAllMidsParameters,
        listener: (data: WsAllMids) => void,
    ): Promise<Subscription>;
    allMids(
        args_or_listener: WsAllMidsParameters | ((data: WsAllMids) => void),
        maybeListener?: (data: WsAllMids) => void,
    ): Promise<Subscription> {
        const args = typeof args_or_listener === "function" ? {} : args_or_listener;
        const listener = typeof args_or_listener === "function" ? args_or_listener : maybeListener!;

        const payload: WsAllMidsRequest = {
            type: "allMids",
            dex: args.dex,
        };
        return this.transport.subscribe<WsAllMids>(payload.type, payload, (e) => {
            listener(e.detail);
        });
    }

    /**
     * Subscribe to best bid and offer updates for a specific asset.
     * @param args - The parameters for the subscription.
     * @param listener - The callback function to be called when the event is received.
     * @returns A promise that resolves with a {@link Subscription} object to manage the subscription lifecycle.
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
    bbo(args: EventBboParameters, listener: (data: WsBbo) => void): Promise<Subscription> {
        const payload: WsBboRequest = {
            type: "bbo",
            coin: args.coin,
        };
        return this.transport.subscribe<WsBbo>(payload.type, payload, (e) => {
            if (e.detail.coin === args.coin) {
                listener(e.detail);
            }
        });
    }

    /**
     * Subscribe to candlestick data updates for a specific asset.
     * @param args - The parameters for the subscription.
     * @param listener - The callback function to be called when the event is received.
     * @returns A promise that resolves with a {@link Subscription} object to manage the subscription lifecycle.
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
    candle(args: EventCandleParameters, listener: (data: Candle) => void): Promise<Subscription> {
        const payload: WsCandleRequest = {
            type: "candle",
            coin: args.coin,
            interval: args.interval,
        };
        return this.transport.subscribe<Candle>(payload.type, payload, (e) => {
            if (e.detail.s === args.coin && e.detail.i === args.interval) {
                listener(e.detail);
            }
        });
    }

    /**
     * Subscribe to explorer block updates.
     * @param listener - The callback function to be called when the event is received.
     * @returns A promise that resolves with a {@link Subscription} object to manage the subscription lifecycle.
     * @note Make sure the endpoint in the {@link transport} supports this method.
     *
     * @see null - no documentation
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
        const payload: WsExplorerBlockRequest = {
            type: "explorerBlock",
        };
        return this.transport.subscribe<WsBlockDetails[]>("_explorerBlock", payload, (e) => { // Internal channel as it does not have its own channel
            listener(e.detail);
        });
    }

    /**
     * Subscribe to explorer transaction updates.
     * @param listener - The callback function to be called when the event is received.
     * @returns A promise that resolves with a {@link Subscription} object to manage the subscription lifecycle.
     * @note Make sure the endpoint in the {@link transport} supports this method.
     *
     * @see null - no documentation
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
        const payload: WsExplorerTxsRequest = {
            type: "explorerTxs",
        };
        return this.transport.subscribe<TxDetails[]>("_explorerTxs", payload, (e) => { // Internal channel as it does not have its own channel
            listener(e.detail);
        });
    }

    /**
     * Subscribe to L2 order book updates for a specific asset.
     * @param args - The parameters for the subscription.
     * @param listener - The callback function to be called when the event is received.
     * @returns A promise that resolves with a {@link Subscription} object to manage the subscription lifecycle.
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
    l2Book(args: EventL2BookParameters, listener: (data: Book) => void): Promise<Subscription> {
        const payload: WsL2BookRequest = {
            type: "l2Book",
            coin: args.coin,
            nSigFigs: args.nSigFigs ?? null,
            mantissa: args.mantissa ?? null,
        };
        return this.transport.subscribe<Book>(payload.type, payload, (e) => {
            if (e.detail.coin === args.coin) {
                listener(e.detail);
            }
        });
    }

    /**
     * Subscribe to notification updates for a specific user.
     * @param args - The parameters for the subscription.
     * @param listener - The callback function to be called when the event is received.
     * @returns A promise that resolves with a {@link Subscription} object to manage the subscription lifecycle.
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
    notification(args: EventNotificationParameters, listener: (data: WsNotification) => void): Promise<Subscription> {
        const payload: WsNotificationRequest = {
            type: "notification",
            user: args.user,
        };
        return this.transport.subscribe<WsNotification>(payload.type, payload, (e) => {
            listener(e.detail);
        });
    }

    /**
     * Subscribe to order status updates for a specific user.
     * @param args - The parameters for the subscription.
     * @param listener - The callback function to be called when the event is received.
     * @returns A promise that resolves with a {@link Subscription} object to manage the subscription lifecycle.
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
        args: EventOrderUpdatesParameters,
        listener: (data: OrderStatus<Order>[]) => void,
    ): Promise<Subscription> {
        const payload: WsOrderUpdatesRequest = {
            type: "orderUpdates",
            user: args.user,
        };
        return this.transport.subscribe<OrderStatus<Order>[]>(payload.type, payload, (e) => {
            listener(e.detail);
        });
    }

    /**
     * Subscribe to real-time trade updates for a specific asset.
     * @param args - The parameters for the subscription.
     * @param listener - The callback function to be called when the event is received.
     * @returns A promise that resolves with a {@link Subscription} object to manage the subscription lifecycle.
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
    trades(args: EventTradesParameters, listener: (data: WsTrade[]) => void): Promise<Subscription> {
        const payload: WsTradesRequest = {
            type: "trades",
            coin: args.coin,
        };
        return this.transport.subscribe<WsTrade[]>(payload.type, payload, (e) => {
            if (e.detail[0]?.coin === args.coin) {
                listener(e.detail);
            }
        });
    }

    /**
     * Subscribe to non-order events for a specific user.
     * @param args - The parameters for the subscription.
     * @param listener - The callback function to be called when the event is received.
     * @returns A promise that resolves with a {@link Subscription} object to manage the subscription lifecycle.
     *
     * @note Different subscriptions cannot be distinguished from each other.
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
    userEvents(args: EventUserEventsParameters, listener: (data: WsUserEvent) => void): Promise<Subscription> {
        const payload: WsUserEventsRequest = {
            type: "userEvents",
            user: args.user,
        };
        return this.transport.subscribe<WsUserEvent>("user", payload, (e) => {
            listener(e.detail);
        });
    }

    /**
     * Subscribe to trade fill updates for a specific user.
     * @param args - The parameters for the subscription.
     * @param listener - The callback function to be called when the event is received.
     * @returns A promise that resolves with a {@link Subscription} object to manage the subscription lifecycle.
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
    userFills(args: EventUserFillsParameters, listener: (data: WsUserFills) => void): Promise<Subscription> {
        const payload: WsUserFillsRequest = {
            type: "userFills",
            user: args.user,
            aggregateByTime: args.aggregateByTime ?? false,
        };
        return this.transport.subscribe<WsUserFills>(payload.type, payload, (e) => {
            if (e.detail.user === args.user.toLowerCase()) {
                listener(e.detail);
            }
        });
    }

    /**
     * Subscribe to funding payment updates for a specific user.
     * @param args - The parameters for the subscription.
     * @param listener - The callback function to be called when the event is received.
     * @returns A promise that resolves with a {@link Subscription} object to manage the subscription lifecycle.
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
    userFundings(args: EventUserFundingsParameters, listener: (data: WsUserFundings) => void): Promise<Subscription> {
        const payload: WsUserFundingsRequest = {
            type: "userFundings",
            user: args.user,
        };
        return this.transport.subscribe<WsUserFundings>(payload.type, payload, (e) => {
            if (e.detail.user === args.user.toLowerCase()) {
                listener(e.detail);
            }
        });
    }

    /**
     * Subscribe to non-funding ledger updates for a specific user.
     * @param args - The parameters for the subscription.
     * @param listener - The callback function to be called when the event is received.
     * @returns A promise that resolves with a {@link Subscription} object to manage the subscription lifecycle.
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
        args: EventUserNonFundingLedgerUpdatesParameters,
        listener: (data: WsUserNonFundingLedgerUpdates) => void,
    ): Promise<Subscription> {
        const payload: WsUserNonFundingLedgerUpdatesRequest = {
            type: "userNonFundingLedgerUpdates",
            user: args.user,
        };
        return this.transport.subscribe<WsUserNonFundingLedgerUpdates>(payload.type, payload, (e) => {
            if (e.detail.user === args.user.toLowerCase()) {
                listener(e.detail);
            }
        });
    }

    /**
     * Subscribe to TWAP order history updates for a specific user.
     * @param args - The parameters for the subscription.
     * @param listener - The callback function to be called when the event is received.
     * @returns A promise that resolves with a {@link Subscription} object to manage the subscription lifecycle.
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
    userTwapHistory(args: EventUserTwapHistory, listener: (data: WsUserTwapHistory) => void): Promise<Subscription> {
        const payload: WsUserTwapHistoryRequest = {
            type: "userTwapHistory",
            user: args.user,
        };
        return this.transport.subscribe<WsUserTwapHistory>(payload.type, payload, (e) => {
            if (e.detail.user === args.user.toLowerCase()) {
                listener(e.detail);
            }
        });
    }

    /**
     * Subscribe to TWAP execution updates for a specific user.
     * @param args - The parameters for the subscription.
     * @param listener - The callback function to be called when the event is received.
     * @returns A promise that resolves with a {@link Subscription} object to manage the subscription lifecycle.
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
        args: EventUserTwapSliceFills,
        listener: (data: WsUserTwapSliceFills) => void,
    ): Promise<Subscription> {
        const payload: WsUserTwapSliceFillsRequest = {
            type: "userTwapSliceFills",
            user: args.user,
        };
        return this.transport.subscribe<WsUserTwapSliceFills>(payload.type, payload, (e) => {
            if (e.detail.user === args.user.toLowerCase()) {
                listener(e.detail);
            }
        });
    }

    /**
     * Subscribe to comprehensive user and market data updates.
     * @param args - The parameters for the subscription.
     * @param listener - The callback function to be called when the event is received.
     * @returns A promise that resolves with a {@link Subscription} object to manage the subscription lifecycle.
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
    webData2(args: EventWebData2Parameters, listener: (data: WsWebData2) => void): Promise<Subscription> {
        const payload: WsWebData2Request = {
            type: "webData2",
            user: args.user,
        };
        return this.transport.subscribe<WsWebData2>(payload.type, payload, (e) => {
            if (e.detail.user === args.user.toLowerCase()) {
                listener(e.detail);
            }
        });
    }

    async [Symbol.asyncDispose](): Promise<void> {
        await this.transport[Symbol.asyncDispose]?.();
    }
}
