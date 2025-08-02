"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.SubscriptionClient = void 0;
/**
 * Subscription client for subscribing to various Hyperliquid events.
 * @typeParam T The type of transport used to connect to the Hyperliquid Websocket API.
 */
class SubscriptionClient {
    transport;
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
    constructor(args) {
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
    activeAssetCtx(params, listener) {
        const channel = params.coin.startsWith("@") ? "activeSpotAssetCtx" : "activeAssetCtx";
        const payload = { type: "activeAssetCtx", ...params };
        return this.transport.subscribe(channel, payload, (e) => {
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
    activeAssetData(params, listener) {
        const payload = { type: "activeAssetData", ...params };
        return this.transport.subscribe(payload.type, payload, (e) => {
            if (e.detail.coin === params.coin && e.detail.user === params.user.toLowerCase()) {
                listener(e.detail);
            }
        });
    }
    allMids(params_or_listener, maybeListener) {
        const params = typeof params_or_listener === "function" ? {} : params_or_listener;
        const listener = typeof params_or_listener === "function" ? params_or_listener : maybeListener;
        const payload = { type: "allMids", ...params };
        return this.transport.subscribe(payload.type, payload, (e) => {
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
    bbo(params, listener) {
        const payload = { type: "bbo", ...params };
        return this.transport.subscribe(payload.type, payload, (e) => {
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
    candle(params, listener) {
        const payload = { type: "candle", ...params };
        return this.transport.subscribe(payload.type, payload, (e) => {
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
    explorerBlock(listener) {
        const payload = { type: "explorerBlock" };
        return this.transport.subscribe("_explorerBlock", payload, (e) => {
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
    explorerTxs(listener) {
        const payload = { type: "explorerTxs" };
        return this.transport.subscribe("_explorerTxs", payload, (e) => {
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
    l2Book(params, listener) {
        const payload = {
            type: "l2Book",
            nSigFigs: params.nSigFigs ?? null,
            mantissa: params.mantissa ?? null,
            ...params,
        };
        return this.transport.subscribe(payload.type, payload, (e) => {
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
    notification(params, listener) {
        const payload = { type: "notification", ...params };
        return this.transport.subscribe(payload.type, payload, (e) => {
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
    orderUpdates(params, listener) {
        const payload = { type: "orderUpdates", ...params };
        return this.transport.subscribe(payload.type, payload, (e) => {
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
    trades(params, listener) {
        const payload = { type: "trades", ...params };
        return this.transport.subscribe(payload.type, payload, (e) => {
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
    userEvents(params, listener) {
        const payload = { type: "userEvents", ...params };
        return this.transport.subscribe("user", payload, (e) => {
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
    userFills(params, listener) {
        const payload = {
            type: "userFills",
            aggregateByTime: params.aggregateByTime ?? false,
            ...params,
        };
        return this.transport.subscribe(payload.type, payload, (e) => {
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
    userFundings(params, listener) {
        const payload = { type: "userFundings", ...params };
        return this.transport.subscribe(payload.type, payload, (e) => {
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
    userNonFundingLedgerUpdates(params, listener) {
        const payload = {
            type: "userNonFundingLedgerUpdates",
            ...params,
        };
        return this.transport.subscribe(payload.type, payload, (e) => {
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
    userTwapHistory(params, listener) {
        const payload = { type: "userTwapHistory", ...params };
        return this.transport.subscribe(payload.type, payload, (e) => {
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
    userTwapSliceFills(params, listener) {
        const payload = { type: "userTwapSliceFills", ...params };
        return this.transport.subscribe(payload.type, payload, (e) => {
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
    webData2(params, listener) {
        const payload = { type: "webData2", ...params };
        return this.transport.subscribe(payload.type, payload, (e) => {
            if (e.detail.user === params.user.toLowerCase()) {
                listener(e.detail);
            }
        });
    }
    async [Symbol.asyncDispose]() {
        await this.transport[Symbol.asyncDispose]?.();
    }
}
exports.SubscriptionClient = SubscriptionClient;
