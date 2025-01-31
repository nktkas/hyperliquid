import type { ISubscriptionTransport, Subscription } from "../transports/base.ts";
import type {
    WsActiveAssetCtxRequest,
    WsActiveAssetDataRequest,
    WsAllMidsRequest,
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
} from "../types/subscriptions/common.ts";
import type { Candle } from "../types/info/assets.ts";
import type { Book, Order, OrderStatus } from "../types/info/orders.ts";
import type { TxDetails } from "../types/explorer/common.ts";

// ———————————————Parameters———————————————

/** Parameters for the {@linkcode EventClient} constructor. */
export interface EventClientParameters<T extends ISubscriptionTransport = ISubscriptionTransport> {
    /** The transport used to connect to the Hyperliquid API. */
    transport: T;
}

/** Parameters for the {@linkcode EventClient.activeAssetCtx} method. */
export type EventActiveAssetCtxParameters = Omit<WsActiveAssetCtxRequest, "type">;

/** Parameters for the {@linkcode EventClient.activeAssetData} method. */
export type EventActiveAssetDataParameters = Omit<WsActiveAssetDataRequest, "type">;

/** Parameters for the {@linkcode EventClient.candle} method. */
export type EventCandleParameters = Omit<WsCandleRequest, "type">;

/** Parameters for the {@linkcode EventClient.l2Book} method. */
export type EventL2BookParameters = Omit<WsL2BookRequest, "type">;

/** Parameters for the {@linkcode EventClient.notification} method. */
export type EventNotificationParameters = Omit<WsNotificationRequest, "type">;

/** Parameters for the {@linkcode EventClient.orderUpdates} method. */
export type EventOrderUpdatesParameters = Omit<WsOrderUpdatesRequest, "type">;

/** Parameters for the {@linkcode EventClient.trades} method. */
export type EventTradesParameters = Omit<WsTradesRequest, "type">;

/** Parameters for the {@linkcode EventClient.userEvents} method. */
export type EventUserEventsParameters = Omit<WsUserEventsRequest, "type">;

/** Parameters for the {@linkcode EventClient.userFills} method. */
export type EventUserFillsParameters = Omit<WsUserFillsRequest, "type">;

/** Parameters for the {@linkcode EventClient.userFundings} method. */
export type EventUserFundingsParameters = Omit<WsUserFundingsRequest, "type">;

/** Parameters for the {@linkcode EventClient.userNonFundingLedgerUpdates} method. */
export type EventUserNonFundingLedgerUpdatesParameters = Omit<WsUserNonFundingLedgerUpdatesRequest, "type">;

/** Parameters for the {@linkcode EventClient.userTwapHistory} method. */
export type EventUserTwapHistory = Omit<WsUserTwapHistoryRequest, "type">;

/** Parameters for the {@linkcode EventClient.userTwapSliceFills} method. */
export type EventUserTwapSliceFills = Omit<WsUserTwapSliceFillsRequest, "type">;

/** Parameters for the {@linkcode EventClient.webData2} method. */
export type EventWebData2Parameters = Omit<WsWebData2Request, "type">;

// ———————————————Client———————————————

/**
 * Event client for subscribing to various Hyperliquid events.
 * @typeParam T - The type of transport used to connect to the Hyperliquid Websocket API.
 */
export class EventClient<T extends ISubscriptionTransport = ISubscriptionTransport> {
    /** The transport used to connect to the Hyperliquid API. */
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
     * const client = new hl.EventClient({ transport });
     * ```
     */
    constructor(args: EventClientParameters<T>) {
        this.transport = args.transport;
    }

    /**
     * Subscribe to context updates for a specific perpetual asset.
     * @param args - The parameters for the subscription.
     * @param listener - The callback function to be called when the event is received.
     * @param signal - An optional abort signal for canceling the subscription request.
     * @returns A promise that resolves with a {@link Subscription} object to manage the subscription lifecycle.
     *
     * @see {@link https://hyperliquid.gitbook.io/hyperliquid-docs/for-developers/api/websocket/subscriptions | Hyperliquid GitBook}
     * @example
     * ```ts
     * import * as hl from "@nktkas/hyperliquid";
     *
     * const transport = new hl.WebSocketTransport();
     * const client = new hl.EventClient({ transport });
     *
     * const sub = await client.activeAssetCtx({ coin: "BTC" }, (data) => {
     *   console.log(data);
     * });
     * ```
     */
    activeAssetCtx(
        args: EventActiveAssetCtxParameters,
        listener: (data: WsActiveAssetCtx | WsActiveSpotAssetCtx) => void,
        signal?: AbortSignal,
    ): Promise<Subscription> {
        const channel = args.coin.startsWith("@") ? "activeSpotAssetCtx" : "activeAssetCtx";
        const payload: WsActiveAssetCtxRequest = {
            type: "activeAssetCtx",
            coin: args.coin,
        };
        return this.transport.subscribe(
            channel,
            payload,
            (event: CustomEvent<WsActiveAssetCtx | WsActiveSpotAssetCtx>) => {
                if (event.detail.coin === args.coin) {
                    listener(event.detail);
                }
            },
            signal,
        );
    }

    /**
     * Subscribe to trading data updates for a specific asset and user.
     * @param args - The parameters for the subscription.
     * @param listener - The callback function to be called when the event is received.
     * @param signal - An optional abort signal for canceling the subscription request.
     * @returns A promise that resolves with a {@link Subscription} object to manage the subscription lifecycle.
     *
     * @see {@link https://hyperliquid.gitbook.io/hyperliquid-docs/for-developers/api/websocket/subscriptions | Hyperliquid GitBook}
     * @example
     * ```ts
     * import * as hl from "@nktkas/hyperliquid";
     *
     * const transport = new hl.WebSocketTransport();
     * const client = new hl.EventClient({ transport });
     *
     * const sub = await client.activeAssetData({ coin: "BTC", user: "0x..." }, (data) => {
     *   console.log(data);
     * });
     * ```
     */
    activeAssetData(
        args: EventActiveAssetDataParameters,
        listener: (data: WsActiveAssetData) => void,
        signal?: AbortSignal,
    ): Promise<Subscription> {
        const payload: WsActiveAssetDataRequest = {
            type: "activeAssetData",
            coin: args.coin,
            user: args.user,
        };
        return this.transport.subscribe(
            payload.type,
            payload,
            (event: CustomEvent<WsActiveAssetData>) => {
                if (event.detail.coin === args.coin && event.detail.user === args.user.toLowerCase()) {
                    listener(event.detail);
                }
            },
            signal,
        );
    }

    /**
     * Subscribe to mid prices for all actively traded assets.
     * @param listener - The callback function to be called when the event is received.
     * @param signal - An optional abort signal for canceling the subscription request.
     * @returns A promise that resolves with a {@link Subscription} object to manage the subscription lifecycle.
     *
     * @see {@link https://hyperliquid.gitbook.io/hyperliquid-docs/for-developers/api/websocket/subscriptions | Hyperliquid GitBook}
     * @example
     * ```ts
     * import * as hl from "@nktkas/hyperliquid";
     *
     * const transport = new hl.WebSocketTransport();
     * const client = new hl.EventClient({ transport });
     *
     * const sub = await client.allMids((data) => {
     *   console.log(data);
     * });
     * ```
     */
    allMids(
        listener: (data: WsAllMids) => void,
        signal?: AbortSignal,
    ): Promise<Subscription> {
        const payload: WsAllMidsRequest = {
            type: "allMids",
        };
        return this.transport.subscribe(
            payload.type,
            payload,
            (event: CustomEvent<WsAllMids>) => {
                listener(event.detail);
            },
            signal,
        );
    }

    /**
     * Subscribe to candlestick data updates for a specific asset.
     * @param args - The parameters for the subscription.
     * @param listener - The callback function to be called when the event is received.
     * @param signal - An optional abort signal for canceling the subscription request.
     * @returns A promise that resolves with a {@link Subscription} object to manage the subscription lifecycle.
     *
     * @see {@link https://hyperliquid.gitbook.io/hyperliquid-docs/for-developers/api/websocket/subscriptions | Hyperliquid GitBook}
     * @example
     * ```ts
     * import * as hl from "@nktkas/hyperliquid";
     *
     * const transport = new hl.WebSocketTransport();
     * const client = new hl.EventClient({ transport });
     *
     * const sub = await client.candle({ coin: "BTC", interval: "1h" }, (data) => {
     *   console.log(data);
     * });
     * ```
     */
    candle(
        args: EventCandleParameters,
        listener: (data: Candle) => void,
        signal?: AbortSignal,
    ): Promise<Subscription> {
        const payload: WsCandleRequest = {
            type: "candle",
            coin: args.coin,
            interval: args.interval,
        };
        return this.transport.subscribe(
            payload.type,
            payload,
            (event: CustomEvent<Candle>) => {
                if (event.detail.s === args.coin && event.detail.i === args.interval) {
                    listener(event.detail);
                }
            },
            signal,
        );
    }

    /**
     * Subscribe to explorer block updates.
     * @param listener - The callback function to be called when the event is received.
     * @param signal - An optional abort signal for canceling the subscription request.
     * @returns A promise that resolves with a {@link Subscription} object to manage the subscription lifecycle.
     *
     * @example
     * ```ts
     * import * as hl from "@nktkas/hyperliquid";
     *
     * const transport = new hl.WebSocketTransport();
     * const client = new hl.EventClient({ transport });
     *
     * const sub = await client.explorerBlock((data) => {
     *   console.log(data);
     * });
     * ```
     */
    explorerBlock(
        listener: (data: WsBlockDetails[]) => void,
        signal?: AbortSignal,
    ): Promise<Subscription> {
        const payload: WsExplorerBlockRequest = {
            type: "explorerBlock",
        };
        return this.transport.subscribe(
            "_explorerBlock", // Internal channel as it does not have its own channel
            payload,
            (event: CustomEvent<WsBlockDetails[]>) => {
                listener(event.detail);
            },
            signal,
        );
    }

    /**
     * Subscribe to explorer transaction updates.
     * @param listener - The callback function to be called when the event is received.
     * @param signal - An optional abort signal for canceling the subscription request.
     * @returns A promise that resolves with a {@link Subscription} object to manage the subscription lifecycle.
     *
     * @example
     * ```ts
     * import * as hl from "@nktkas/hyperliquid";
     *
     * const transport = new hl.WebSocketTransport();
     * const client = new hl.EventClient({ transport });
     *
     * const sub = await client.explorerTxs((data) => {
     *   console.log(data);
     * });
     * ```
     */
    explorerTxs(
        listener: (data: TxDetails[]) => void,
        signal?: AbortSignal,
    ): Promise<Subscription> {
        const payload: WsExplorerTxsRequest = {
            type: "explorerTxs",
        };
        return this.transport.subscribe(
            "_explorerTxs", // Internal channel as it does not have its own channel
            payload,
            (event: CustomEvent<TxDetails[]>) => {
                listener(event.detail);
            },
            signal,
        );
    }

    /**
     * Subscribe to L2 order book updates for a specific asset.
     * @param args - The parameters for the subscription.
     * @param listener - The callback function to be called when the event is received.
     * @param signal - An optional abort signal for canceling the subscription request.
     * @returns A promise that resolves with a {@link Subscription} object to manage the subscription lifecycle.
     *
     * @see {@link https://hyperliquid.gitbook.io/hyperliquid-docs/for-developers/api/websocket/subscriptions | Hyperliquid GitBook}
     * @example
     * ```ts
     * import * as hl from "@nktkas/hyperliquid";
     *
     * const transport = new hl.WebSocketTransport();
     * const client = new hl.EventClient({ transport });
     *
     * const sub = await client.l2Book({ coin: "BTC" }, (data) => {
     *   console.log(data);
     * });
     * ```
     */
    l2Book(
        args: EventL2BookParameters,
        listener: (data: Book) => void,
        signal?: AbortSignal,
    ): Promise<Subscription> {
        const payload: WsL2BookRequest = {
            type: "l2Book",
            coin: args.coin,
            nSigFigs: args.nSigFigs ?? null,
            mantissa: args.mantissa ?? null,
        };
        return this.transport.subscribe(
            payload.type,
            payload,
            (event: CustomEvent<Book>) => {
                if (event.detail.coin === args.coin) {
                    listener(event.detail);
                }
            },
            signal,
        );
    }

    /**
     * Subscribe to notification updates for a specific user.
     * @param args - The parameters for the subscription.
     * @param listener - The callback function to be called when the event is received.
     * @param signal - An optional abort signal for canceling the subscription request.
     * @returns A promise that resolves with a {@link Subscription} object to manage the subscription lifecycle.
     *
     * @see {@link https://hyperliquid.gitbook.io/hyperliquid-docs/for-developers/api/websocket/subscriptions | Hyperliquid GitBook}
     * @example
     * ```ts
     * import * as hl from "@nktkas/hyperliquid";
     *
     * const transport = new hl.WebSocketTransport();
     * const client = new hl.EventClient({ transport });
     *
     * const sub = await client.notification({ user: "0x..." }, (data) => {
     *   console.log(data);
     * });
     * ```
     */
    notification(
        args: EventNotificationParameters,
        listener: (data: WsNotification) => void,
        signal?: AbortSignal,
    ): Promise<Subscription> {
        const payload: WsNotificationRequest = {
            type: "notification",
            user: args.user,
        };
        return this.transport.subscribe(
            payload.type,
            payload,
            (event: CustomEvent<WsNotification>) => {
                listener(event.detail);
            },
            signal,
        );
    }

    /**
     * Subscribe to order status updates for a specific user.
     * @param args - The parameters for the subscription.
     * @param listener - The callback function to be called when the event is received.
     * @param signal - An optional abort signal for canceling the subscription request.
     * @returns A promise that resolves with a {@link Subscription} object to manage the subscription lifecycle.
     *
     * @see {@link https://hyperliquid.gitbook.io/hyperliquid-docs/for-developers/api/websocket/subscriptions | Hyperliquid GitBook}
     * @example
     * ```ts
     * import * as hl from "@nktkas/hyperliquid";
     *
     * const transport = new hl.WebSocketTransport();
     * const client = new hl.EventClient({ transport });
     *
     * const sub = await client.orderUpdates({ user: "0x..." }, (data) => {
     *   console.log(data);
     * });
     * ```
     */
    orderUpdates(
        args: EventOrderUpdatesParameters,
        listener: (data: OrderStatus<Order>[]) => void,
        signal?: AbortSignal,
    ): Promise<Subscription> {
        const payload: WsOrderUpdatesRequest = {
            type: "orderUpdates",
            user: args.user,
        };
        return this.transport.subscribe(
            payload.type,
            payload,
            (event: CustomEvent<OrderStatus<Order>[]>) => {
                listener(event.detail);
            },
            signal,
        );
    }

    /**
     * Subscribe to real-time trade updates for a specific asset.
     * @param args - The parameters for the subscription.
     * @param listener - The callback function to be called when the event is received.
     * @param signal - An optional abort signal for canceling the subscription request.
     * @returns A promise that resolves with a {@link Subscription} object to manage the subscription lifecycle.
     *
     * @see {@link https://hyperliquid.gitbook.io/hyperliquid-docs/for-developers/api/websocket/subscriptions | Hyperliquid GitBook}
     * @example
     * ```ts
     * import * as hl from "@nktkas/hyperliquid";
     *
     * const transport = new hl.WebSocketTransport();
     * const client = new hl.EventClient({ transport });
     *
     * const sub = await client.trades({ coin: "BTC" }, (data) => {
     *   console.log(data);
     * });
     * ```
     */
    trades(
        args: EventTradesParameters,
        listener: (data: WsTrade[]) => void,
        signal?: AbortSignal,
    ): Promise<Subscription> {
        const payload: WsTradesRequest = {
            type: "trades",
            coin: args.coin,
        };
        return this.transport.subscribe(
            payload.type,
            payload,
            (event: CustomEvent<WsTrade[]>) => {
                if (event.detail[0]?.coin === args.coin) {
                    listener(event.detail);
                }
            },
            signal,
        );
    }

    /**
     * Subscribe to non-order events for a specific user.
     * @param args - The parameters for the subscription.
     * @param listener - The callback function to be called when the event is received.
     * @param signal - An optional abort signal for canceling the subscription request.
     * @returns A promise that resolves with a {@link Subscription} object to manage the subscription lifecycle.
     *
     * @note Different subscriptions cannot be distinguished from each other.
     *
     * @see {@link https://hyperliquid.gitbook.io/hyperliquid-docs/for-developers/api/websocket/subscriptions | Hyperliquid GitBook}
     * @example
     * ```ts
     * import * as hl from "@nktkas/hyperliquid";
     *
     * const transport = new hl.WebSocketTransport();
     * const client = new hl.EventClient({ transport });
     *
     * const sub = await client.userEvents({ user: "0x..." }, (data) => {
     *   console.log(data);
     * });
     * ```
     */
    userEvents(
        args: EventUserEventsParameters,
        listener: (data: WsUserEvent) => void,
        signal?: AbortSignal,
    ): Promise<Subscription> {
        const payload: WsUserEventsRequest = {
            type: "userEvents",
            user: args.user,
        };
        return this.transport.subscribe(
            payload.type,
            payload,
            (event: CustomEvent<WsUserEvent>) => {
                listener(event.detail);
            },
            signal,
        );
    }

    /**
     * Subscribe to trade fill updates for a specific user.
     * @param args - The parameters for the subscription.
     * @param listener - The callback function to be called when the event is received.
     * @param signal - An optional abort signal for canceling the subscription request.
     * @returns A promise that resolves with a {@link Subscription} object to manage the subscription lifecycle.
     *
     * @see {@link https://hyperliquid.gitbook.io/hyperliquid-docs/for-developers/api/websocket/subscriptions | Hyperliquid GitBook}
     * @example
     * ```ts
     * import * as hl from "@nktkas/hyperliquid";
     *
     * const transport = new hl.WebSocketTransport();
     * const client = new hl.EventClient({ transport });
     *
     * const sub = await client.userFills({ user: "0x..." }, (data) => {
     *   console.log(data);
     * });
     * ```
     */
    userFills(
        args: EventUserFillsParameters,
        listener: (data: WsUserFills) => void,
        signal?: AbortSignal,
    ): Promise<Subscription> {
        const payload: WsUserFillsRequest = {
            type: "userFills",
            user: args.user,
            aggregateByTime: args.aggregateByTime ?? false,
        };
        return this.transport.subscribe(
            payload.type,
            payload,
            (event: CustomEvent<WsUserFills>) => {
                if (event.detail.user === args.user.toLowerCase()) {
                    listener(event.detail);
                }
            },
            signal,
        );
    }

    /**
     * Subscribe to funding payment updates for a specific user.
     * @param args - The parameters for the subscription.
     * @param listener - The callback function to be called when the event is received.
     * @param signal - An optional abort signal for canceling the subscription request.
     * @returns A promise that resolves with a {@link Subscription} object to manage the subscription lifecycle.
     *
     * @see {@link https://hyperliquid.gitbook.io/hyperliquid-docs/for-developers/api/websocket/subscriptions | Hyperliquid GitBook}
     * @example
     * ```ts
     * import * as hl from "@nktkas/hyperliquid";
     *
     * const transport = new hl.WebSocketTransport();
     * const client = new hl.EventClient({ transport });
     *
     * const sub = await client.userFundings({ user: "0x..." }, (data) => {
     *   console.log(data);
     * });
     * ```
     */
    userFundings(
        args: EventUserFundingsParameters,
        listener: (data: WsUserFundings) => void,
        signal?: AbortSignal,
    ): Promise<Subscription> {
        const payload: WsUserFundingsRequest = {
            type: "userFundings",
            user: args.user,
        };
        return this.transport.subscribe(
            payload.type,
            payload,
            (event: CustomEvent<WsUserFundings>) => {
                if (event.detail.user === args.user.toLowerCase()) {
                    listener(event.detail);
                }
            },
            signal,
        );
    }

    /**
     * Subscribe to non-funding ledger updates for a specific user.
     * @param args - The parameters for the subscription.
     * @param listener - The callback function to be called when the event is received.
     * @param signal - An optional abort signal for canceling the subscription request.
     * @returns A promise that resolves with a {@link Subscription} object to manage the subscription lifecycle.
     *
     * @see {@link https://hyperliquid.gitbook.io/hyperliquid-docs/for-developers/api/websocket/subscriptions | Hyperliquid GitBook}
     * @example
     * ```ts
     * import * as hl from "@nktkas/hyperliquid";
     *
     * const transport = new hl.WebSocketTransport();
     * const client = new hl.EventClient({ transport });
     *
     * const sub = await client.userNonFundingLedgerUpdates({ user: "0x..." }, (data) => {
     *   console.log(data);
     * });
     * ```
     */
    userNonFundingLedgerUpdates(
        args: EventUserNonFundingLedgerUpdatesParameters,
        listener: (data: WsUserNonFundingLedgerUpdates) => void,
        signal?: AbortSignal,
    ): Promise<Subscription> {
        const payload: WsUserNonFundingLedgerUpdatesRequest = {
            type: "userNonFundingLedgerUpdates",
            user: args.user,
        };
        return this.transport.subscribe(
            payload.type,
            payload,
            (event: CustomEvent<WsUserNonFundingLedgerUpdates>) => {
                if (event.detail.user === args.user.toLowerCase()) {
                    listener(event.detail);
                }
            },
            signal,
        );
    }

    /**
     * Subscribe to TWAP order history updates for a specific user.
     * @param args - The parameters for the subscription.
     * @param listener - The callback function to be called when the event is received.
     * @param signal - An optional abort signal for canceling the subscription request.
     * @returns A promise that resolves with a {@link Subscription} object to manage the subscription lifecycle.
     *
     * @see {@link https://hyperliquid.gitbook.io/hyperliquid-docs/for-developers/api/websocket/subscriptions | Hyperliquid GitBook}
     * @example
     * ```ts
     * import * as hl from "@nktkas/hyperliquid";
     *
     * const transport = new hl.WebSocketTransport();
     * const client = new hl.EventClient({ transport });
     *
     * const sub = await client.userTwapHistory({ user: "0x..." }, (data) => {
     *   console.log(data);
     * });
     * ```
     */
    userTwapHistory(
        args: EventUserTwapHistory,
        listener: (data: WsUserTwapHistory) => void,
        signal?: AbortSignal,
    ): Promise<Subscription> {
        const payload: WsUserTwapHistoryRequest = {
            type: "userTwapHistory",
            user: args.user,
        };
        return this.transport.subscribe(
            payload.type,
            payload,
            (event: CustomEvent<WsUserTwapHistory>) => {
                if (event.detail.user === args.user.toLowerCase()) {
                    listener(event.detail);
                }
            },
            signal,
        );
    }

    /**
     * Subscribe to TWAP execution updates for a specific user.
     * @param args - The parameters for the subscription.
     * @param listener - The callback function to be called when the event is received.
     * @param signal - An optional abort signal for canceling the subscription request.
     * @returns A promise that resolves with a {@link Subscription} object to manage the subscription lifecycle.
     *
     * @see {@link https://hyperliquid.gitbook.io/hyperliquid-docs/for-developers/api/websocket/subscriptions | Hyperliquid GitBook}
     * @example
     * ```ts
     * import * as hl from "@nktkas/hyperliquid";
     *
     * const transport = new hl.WebSocketTransport();
     * const client = new hl.EventClient({ transport });
     *
     * const sub = await client.userTwapSliceFills({ user: "0x..." }, (data) => {
     *   console.log(data);
     * });
     * ```
     */
    userTwapSliceFills(
        args: EventUserTwapSliceFills,
        listener: (data: WsUserTwapSliceFills) => void,
        signal?: AbortSignal,
    ): Promise<Subscription> {
        const payload: WsUserTwapSliceFillsRequest = {
            type: "userTwapSliceFills",
            user: args.user,
        };
        return this.transport.subscribe(
            payload.type,
            payload,
            (event: CustomEvent<WsUserTwapSliceFills>) => {
                if (event.detail.user === args.user.toLowerCase()) {
                    listener(event.detail);
                }
            },
            signal,
        );
    }

    /**
     * Subscribe to comprehensive user and market data updates.
     * @param args - The parameters for the subscription.
     * @param listener - The callback function to be called when the event is received.
     * @param signal - An optional abort signal for canceling the subscription request.
     * @returns A promise that resolves with a {@link Subscription} object to manage the subscription lifecycle.
     *
     * @see {@link https://hyperliquid.gitbook.io/hyperliquid-docs/for-developers/api/websocket/subscriptions | Hyperliquid GitBook}
     * @example
     * ```ts
     * import * as hl from "@nktkas/hyperliquid";
     *
     * const transport = new hl.WebSocketTransport();
     * const client = new hl.EventClient({ transport });
     *
     * const sub = await client.webData2({ user: "0x..." }, (data) => {
     *   console.log(data);
     * });
     * ```
     */
    webData2(
        args: EventWebData2Parameters,
        listener: (data: WsWebData2) => void,
        signal?: AbortSignal,
    ): Promise<Subscription> {
        const payload: WsWebData2Request = {
            type: "webData2",
            user: args.user,
        };
        return this.transport.subscribe(
            payload.type,
            payload,
            (event: CustomEvent<WsWebData2>) => {
                if (event.detail.user === args.user.toLowerCase()) {
                    listener(event.detail);
                }
            },
            signal,
        );
    }
}
