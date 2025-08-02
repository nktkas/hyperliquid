/**
 * Info client for interacting with the Hyperliquid API.
 * @typeParam T The type of transport used to connect to the Hyperliquid API.
 */
export class InfoClient {
    transport;
    /**
     * Initialises a new instance.
     * @param args - The arguments for initialisation.
     *
     * @example
     * ```ts
     * import * as hl from "@nktkas/hyperliquid";
     *
     * const transport = new hl.HttpTransport(); // or WebSocketTransport
     * const infoClient = new hl.InfoClient({ transport });
     * ```
     */
    constructor(args) {
        this.transport = args.transport;
    }
    /**
     * Request user active asset data.
     * @param params - An optional request-specific parameters.
     * @param signal - An {@linkcode https://developer.mozilla.org/en-US/docs/Web/API/AbortSignal | AbortSignal}. If this option is set, the request can be canceled by calling {@linkcode https://developer.mozilla.org/en-US/docs/Web/API/AbortController/abort | abort()} on the corresponding {@linkcode https://developer.mozilla.org/en-US/docs/Web/API/AbortController | AbortController}.
     * @returns User active asset data.
     *
     * @throws {TransportError} When the transport layer throws an error.
     *
     * @see https://hyperliquid.gitbook.io/hyperliquid-docs/for-developers/api/info-endpoint/perpetuals#retrieve-users-active-asset-data
     * @example
     * ```ts
     * import * as hl from "@nktkas/hyperliquid";
     *
     * const transport = new hl.HttpTransport(); // or WebSocketTransport
     * const infoClient = new hl.InfoClient({ transport });
     *
     * const data = await infoClient.activeAssetData({ user: "0x...", coin: "BTC" });
     * ```
     */
    activeAssetData(params, signal) {
        const request = { type: "activeAssetData", ...params };
        return this.transport.request("info", request, signal);
    }
    allMids(params_or_signal, maybeSignal) {
        const params = params_or_signal instanceof AbortSignal ? {} : params_or_signal;
        const signal = params_or_signal instanceof AbortSignal ? params_or_signal : maybeSignal;
        const request = { type: "allMids", ...params };
        return this.transport.request("info", request, signal);
    }
    /**
     * Block details by block height.
     * @param params - Request-specific parameters.
     * @param signal - An {@linkcode https://developer.mozilla.org/en-US/docs/Web/API/AbortSignal | AbortSignal}. If this option is set, the request can be canceled by calling {@linkcode https://developer.mozilla.org/en-US/docs/Web/API/AbortController/abort | abort()} on the corresponding {@linkcode https://developer.mozilla.org/en-US/docs/Web/API/AbortController | AbortController}.
     * @returns Block details.
     *
     * @throws {TransportError} When the transport layer throws an error.
     *
     * @see null
     * @example
     * ```ts
     * import * as hl from "@nktkas/hyperliquid";
     *
     * const transport = new hl.HttpTransport(); // only `HttpTransport` supports this method
     * const infoClient = new hl.InfoClient({ transport });
     *
     * const data = await infoClient.blockDetails({ height: 123 });
     * ```
     */
    blockDetails(params, signal) {
        const request = { type: "blockDetails", ...params };
        return this.transport.request("explorer", request, signal)
            .then(({ blockDetails }) => blockDetails);
    }
    /**
     * Request candlestick snapshots.
     * @param params - Request-specific parameters.
     * @param signal - An {@linkcode https://developer.mozilla.org/en-US/docs/Web/API/AbortSignal | AbortSignal}. If this option is set, the request can be canceled by calling {@linkcode https://developer.mozilla.org/en-US/docs/Web/API/AbortController/abort | abort()} on the corresponding {@linkcode https://developer.mozilla.org/en-US/docs/Web/API/AbortController | AbortController}.
     * @returns Array of candlestick data points.
     *
     * @throws {TransportError} When the transport layer throws an error.
     *
     * @see https://hyperliquid.gitbook.io/hyperliquid-docs/for-developers/api/info-endpoint#candle-snapshot
     * @example
     * ```ts
     * import * as hl from "@nktkas/hyperliquid";
     *
     * const transport = new hl.HttpTransport(); // or WebSocketTransport
     * const infoClient = new hl.InfoClient({ transport });
     *
     * const data = await infoClient.candleSnapshot({
     *   coin: "ETH",
     *   interval: "1h",
     *   startTime: Date.now() - 1000 * 60 * 60 * 24
     * });
     * ```
     */
    candleSnapshot(params, signal) {
        const request = { type: "candleSnapshot", req: params };
        return this.transport.request("info", request, signal);
    }
    /**
     * Request clearinghouse state.
     * @param params - Request-specific parameters.
     * @param signal - An {@linkcode https://developer.mozilla.org/en-US/docs/Web/API/AbortSignal | AbortSignal}. If this option is set, the request can be canceled by calling {@linkcode https://developer.mozilla.org/en-US/docs/Web/API/AbortController/abort | abort()} on the corresponding {@linkcode https://developer.mozilla.org/en-US/docs/Web/API/AbortController | AbortController}.
     * @returns Account summary for perpetual trading.
     *
     * @throws {TransportError} When the transport layer throws an error.
     *
     * @see https://hyperliquid.gitbook.io/hyperliquid-docs/for-developers/api/info-endpoint/perpetuals#retrieve-users-perpetuals-account-summary
     * @example
     * ```ts
     * import * as hl from "@nktkas/hyperliquid";
     *
     * const transport = new hl.HttpTransport(); // or WebSocketTransport
     * const infoClient = new hl.InfoClient({ transport });
     *
     * const data = await infoClient.clearinghouseState({ user: "0x..." });
     * ```
     */
    clearinghouseState(params, signal) {
        const request = { type: "clearinghouseState", ...params };
        return this.transport.request("info", request, signal);
    }
    /**
     * Request user staking delegations.
     * @param params - Request-specific parameters.
     * @param signal - An {@linkcode https://developer.mozilla.org/en-US/docs/Web/API/AbortSignal | AbortSignal}. If this option is set, the request can be canceled by calling {@linkcode https://developer.mozilla.org/en-US/docs/Web/API/AbortController/abort | abort()} on the corresponding {@linkcode https://developer.mozilla.org/en-US/docs/Web/API/AbortController | AbortController}.
     * @returns Array of user's delegations to validators.
     *
     * @throws {TransportError} When the transport layer throws an error.
     *
     * @see https://hyperliquid.gitbook.io/hyperliquid-docs/for-developers/api/info-endpoint#query-a-users-staking-delegations
     * @example
     * ```ts
     * import * as hl from "@nktkas/hyperliquid";
     *
     * const transport = new hl.HttpTransport(); // or WebSocketTransport
     * const infoClient = new hl.InfoClient({ transport });
     *
     * const data = await infoClient.delegations({ user: "0x..." });
     * ```
     */
    delegations(params, signal) {
        const request = { type: "delegations", ...params };
        return this.transport.request("info", request, signal);
    }
    /**
     * Request user staking history.
     * @param params - Request-specific parameters.
     * @param signal - An {@linkcode https://developer.mozilla.org/en-US/docs/Web/API/AbortSignal | AbortSignal}. If this option is set, the request can be canceled by calling {@linkcode https://developer.mozilla.org/en-US/docs/Web/API/AbortController/abort | abort()} on the corresponding {@linkcode https://developer.mozilla.org/en-US/docs/Web/API/AbortController | AbortController}.
     * @returns Array of user's staking updates.
     *
     * @throws {TransportError} When the transport layer throws an error.
     *
     * @see https://hyperliquid.gitbook.io/hyperliquid-docs/for-developers/api/info-endpoint#query-a-users-staking-history
     * @example
     * ```ts
     * import * as hl from "@nktkas/hyperliquid";
     *
     * const transport = new hl.HttpTransport(); // or WebSocketTransport
     * const infoClient = new hl.InfoClient({ transport });
     *
     * const data = await infoClient.delegatorHistory({ user: "0x..." });
     * ```
     */
    delegatorHistory(params, signal) {
        const request = { type: "delegatorHistory", ...params };
        return this.transport.request("info", request, signal);
    }
    /**
     * Request user staking rewards.
     * @param params - Request-specific parameters.
     * @param signal - An {@linkcode https://developer.mozilla.org/en-US/docs/Web/API/AbortSignal | AbortSignal}. If this option is set, the request can be canceled by calling {@linkcode https://developer.mozilla.org/en-US/docs/Web/API/AbortController/abort | abort()} on the corresponding {@linkcode https://developer.mozilla.org/en-US/docs/Web/API/AbortController | AbortController}.
     * @returns Array of user's staking rewards.
     *
     * @throws {TransportError} When the transport layer throws an error.
     *
     * @see https://hyperliquid.gitbook.io/hyperliquid-docs/for-developers/api/info-endpoint#query-a-users-staking-rewards
     * @example
     * ```ts
     * import * as hl from "@nktkas/hyperliquid";
     *
     * const transport = new hl.HttpTransport(); // or WebSocketTransport
     * const infoClient = new hl.InfoClient({ transport });
     *
     * const data = await infoClient.delegatorRewards({ user: "0x..." });
     * ```
     */
    delegatorRewards(params, signal) {
        const request = { type: "delegatorRewards", ...params };
        return this.transport.request("info", request, signal);
    }
    /**
     * Request user staking summary.
     * @param params - Request-specific parameters.
     * @param signal - An {@linkcode https://developer.mozilla.org/en-US/docs/Web/API/AbortSignal | AbortSignal}. If this option is set, the request can be canceled by calling {@linkcode https://developer.mozilla.org/en-US/docs/Web/API/AbortController/abort | abort()} on the corresponding {@linkcode https://developer.mozilla.org/en-US/docs/Web/API/AbortController | AbortController}.
     * @returns Summary of a user's staking delegations.
     *
     * @throws {TransportError} When the transport layer throws an error.
     *
     * @see https://hyperliquid.gitbook.io/hyperliquid-docs/for-developers/api/info-endpoint#query-a-users-staking-summary
     * @example
     * ```ts
     * import * as hl from "@nktkas/hyperliquid";
     *
     * const transport = new hl.HttpTransport(); // or WebSocketTransport
     * const infoClient = new hl.InfoClient({ transport });
     *
     * const data = await infoClient.delegatorSummary({ user: "0x..." });
     * ```
     */
    delegatorSummary(params, signal) {
        const request = { type: "delegatorSummary", ...params };
        return this.transport.request("info", request, signal);
    }
    /**
     * Request exchange status information.
     * @param signal - An {@linkcode https://developer.mozilla.org/en-US/docs/Web/API/AbortSignal | AbortSignal}. If this option is set, the request can be canceled by calling {@linkcode https://developer.mozilla.org/en-US/docs/Web/API/AbortController/abort | abort()} on the corresponding {@linkcode https://developer.mozilla.org/en-US/docs/Web/API/AbortController | AbortController}.
     * @returns Exchange system status information.
     *
     * @throws {TransportError} When the transport layer throws an error.
     *
     * @see null
     * @example
     * ```ts
     * import * as hl from "@nktkas/hyperliquid";
     *
     * const transport = new hl.HttpTransport(); // or WebSocketTransport
     * const infoClient = new hl.InfoClient({ transport });
     *
     * const data = await infoClient.exchangeStatus();
     * ```
     */
    exchangeStatus(signal) {
        const request = { type: "exchangeStatus" };
        return this.transport.request("info", request, signal);
    }
    /**
     * Request user's extra agents.
     * @param params - Request-specific parameters.
     * @param signal - An {@linkcode https://developer.mozilla.org/en-US/docs/Web/API/AbortSignal | AbortSignal}. If this option is set, the request can be canceled by calling {@linkcode https://developer.mozilla.org/en-US/docs/Web/API/AbortController/abort | abort()} on the corresponding {@linkcode https://developer.mozilla.org/en-US/docs/Web/API/AbortController | AbortController}.
     * @returns User's extra agents.
     *
     * @throws {TransportError} When the transport layer throws an error.
     *
     * @see null
     * @example
     * ```ts
     * import * as hl from "@nktkas/hyperliquid";
     *
     * const transport = new hl.HttpTransport(); // or WebSocketTransport
     * const infoClient = new hl.InfoClient({ transport });
     *
     * const data = await infoClient.extraAgents({ user: "0x..." });
     * ```
     */
    extraAgents(params, signal) {
        const request = { type: "extraAgents", ...params };
        return this.transport.request("info", request, signal);
    }
    /**
     * Request frontend open orders.
     * @param params - Request-specific parameters.
     * @param signal - An {@linkcode https://developer.mozilla.org/en-US/docs/Web/API/AbortSignal | AbortSignal}. If this option is set, the request can be canceled by calling {@linkcode https://developer.mozilla.org/en-US/docs/Web/API/AbortController/abort | abort()} on the corresponding {@linkcode https://developer.mozilla.org/en-US/docs/Web/API/AbortController | AbortController}.
     * @returns Array of open orders with additional frontend information.
     *
     * @throws {TransportError} When the transport layer throws an error.
     *
     * @see https://hyperliquid.gitbook.io/hyperliquid-docs/for-developers/api/info-endpoint#retrieve-a-users-open-orders-with-additional-frontend-info
     * @example
     * ```ts
     * import * as hl from "@nktkas/hyperliquid";
     *
     * const transport = new hl.HttpTransport(); // or WebSocketTransport
     * const infoClient = new hl.InfoClient({ transport });
     *
     * const data = await infoClient.frontendOpenOrders({ user: "0x..." });
     * ```
     */
    frontendOpenOrders(params, signal) {
        const request = { type: "frontendOpenOrders", ...params };
        return this.transport.request("info", request, signal);
    }
    /**
     * Request funding history.
     * @param params - Request-specific parameters.
     * @param signal - An {@linkcode https://developer.mozilla.org/en-US/docs/Web/API/AbortSignal | AbortSignal}. If this option is set, the request can be canceled by calling {@linkcode https://developer.mozilla.org/en-US/docs/Web/API/AbortController/abort | abort()} on the corresponding {@linkcode https://developer.mozilla.org/en-US/docs/Web/API/AbortController | AbortController}.
     * @returns Array of historical funding rate data for an asset.
     *
     * @throws {TransportError} When the transport layer throws an error.
     *
     * @see https://hyperliquid.gitbook.io/hyperliquid-docs/for-developers/api/info-endpoint/perpetuals#retrieve-historical-funding-rates
     * @example
     * ```ts
     * import * as hl from "@nktkas/hyperliquid";
     *
     * const transport = new hl.HttpTransport(); // or WebSocketTransport
     * const infoClient = new hl.InfoClient({ transport });
     *
     * const data = await infoClient.fundingHistory({
     *   coin: "ETH",
     *   startTime: Date.now() - 1000 * 60 * 60 * 24
     * });
     * ```
     */
    fundingHistory(params, signal) {
        const request = { type: "fundingHistory", ...params };
        return this.transport.request("info", request, signal);
    }
    /**
     * Request user's historical orders.
     * @param params - Request-specific parameters.
     * @param signal - An {@linkcode https://developer.mozilla.org/en-US/docs/Web/API/AbortSignal | AbortSignal}. If this option is set, the request can be canceled by calling {@linkcode https://developer.mozilla.org/en-US/docs/Web/API/AbortController/abort | abort()} on the corresponding {@linkcode https://developer.mozilla.org/en-US/docs/Web/API/AbortController | AbortController}.
     * @returns Array of user's historical orders.
     *
     * @throws {TransportError} When the transport layer throws an error.
     *
     * @see https://hyperliquid.gitbook.io/hyperliquid-docs/for-developers/api/info-endpoint#retrieve-a-users-historical-orders
     * @example
     * ```ts
     * import * as hl from "@nktkas/hyperliquid";
     *
     * const transport = new hl.HttpTransport(); // or WebSocketTransport
     * const infoClient = new hl.InfoClient({ transport });
     *
     * const data = await infoClient.historicalOrders({ user: "0x..." });
     * ```
     */
    historicalOrders(params, signal) {
        const request = { type: "historicalOrders", ...params };
        return this.transport.request("info", request, signal);
    }
    /**
     * Request to check if a user is a VIP.
     * @param params - Request-specific parameters.
     * @param signal - An {@linkcode https://developer.mozilla.org/en-US/docs/Web/API/AbortSignal | AbortSignal}. If this option is set, the request can be canceled by calling {@linkcode https://developer.mozilla.org/en-US/docs/Web/API/AbortController/abort | abort()} on the corresponding {@linkcode https://developer.mozilla.org/en-US/docs/Web/API/AbortController | AbortController}.
     * @returns Boolean indicating user's VIP status.
     *
     * @throws {TransportError} When the transport layer throws an error.
     *
     * @see null
     * @example
     * ```ts
     * import * as hl from "@nktkas/hyperliquid";
     *
     * const transport = new hl.HttpTransport(); // or WebSocketTransport
     * const infoClient = new hl.InfoClient({ transport });
     *
     * const data = await infoClient.isVip({ user: "0x..." });
     * ```
     */
    isVip(params, signal) {
        const request = { type: "isVip", ...params };
        return this.transport.request("info", request, signal);
    }
    /**
     * Request L2 order book.
     * @param params - Request-specific parameters.
     * @param signal - An {@linkcode https://developer.mozilla.org/en-US/docs/Web/API/AbortSignal | AbortSignal}. If this option is set, the request can be canceled by calling {@linkcode https://developer.mozilla.org/en-US/docs/Web/API/AbortController/abort | abort()} on the corresponding {@linkcode https://developer.mozilla.org/en-US/docs/Web/API/AbortController | AbortController}.
     * @returns L2 order book snapshot.
     *
     * @throws {TransportError} When the transport layer throws an error.
     *
     * @see https://hyperliquid.gitbook.io/hyperliquid-docs/for-developers/api/info-endpoint#l2-book-snapshot
     * @example
     * ```ts
     * import * as hl from "@nktkas/hyperliquid";
     *
     * const transport = new hl.HttpTransport(); // or WebSocketTransport
     * const infoClient = new hl.InfoClient({ transport });
     *
     * const data = await infoClient.l2Book({ coin: "ETH", nSigFigs: 2 });
     * ```
     */
    l2Book(params, signal) {
        const request = { type: "l2Book", ...params };
        return this.transport.request("info", request, signal);
    }
    /**
     * Request leading vaults for a user.
     * @param params - Request-specific parameters.
     * @param signal - An {@linkcode https://developer.mozilla.org/en-US/docs/Web/API/AbortSignal | AbortSignal}. If this option is set, the request can be canceled by calling {@linkcode https://developer.mozilla.org/en-US/docs/Web/API/AbortController/abort | abort()} on the corresponding {@linkcode https://developer.mozilla.org/en-US/docs/Web/API/AbortController | AbortController}.
     * @returns
     *
     * @throws {TransportError} When the transport layer throws an error.
     *
     * @see null
     * @example
     * ```ts
     * import * as hl from "@nktkas/hyperliquid";
     *
     * const transport = new hl.HttpTransport(); // or WebSocketTransport
     * const infoClient = new hl.InfoClient({ transport });
     *
     * const data = await infoClient.leadingVaults({ user: "0x..." });
     * ```
     */
    leadingVaults(params, signal) {
        const request = { type: "leadingVaults", ...params };
        return this.transport.request("info", request, signal);
    }
    /**
     * Request legal verification status of a user.
     * @param params - Request-specific parameters.
     * @param signal - An {@linkcode https://developer.mozilla.org/en-US/docs/Web/API/AbortSignal | AbortSignal}. If this option is set, the request can be canceled by calling {@linkcode https://developer.mozilla.org/en-US/docs/Web/API/AbortController/abort | abort()} on the corresponding {@linkcode https://developer.mozilla.org/en-US/docs/Web/API/AbortController | AbortController}.
     * @returns Legal verification status for a user.
     *
     * @throws {TransportError} When the transport layer throws an error.
     *
     * @see null
     * @example
     * ```ts
     * import * as hl from "@nktkas/hyperliquid";
     *
     * const transport = new hl.HttpTransport(); // or WebSocketTransport
     * const infoClient = new hl.InfoClient({ transport });
     *
     * const data = await infoClient.legalCheck({ user: "0x..." });
     * ```
     */
    legalCheck(params, signal) {
        const request = { type: "legalCheck", ...params };
        return this.transport.request("info", request, signal);
    }
    /**
     * Request liquidatable.
     * @param signal - An {@linkcode https://developer.mozilla.org/en-US/docs/Web/API/AbortSignal | AbortSignal}. If this option is set, the request can be canceled by calling {@linkcode https://developer.mozilla.org/en-US/docs/Web/API/AbortController/abort | abort()} on the corresponding {@linkcode https://developer.mozilla.org/en-US/docs/Web/API/AbortController | AbortController}.
     * @returns
     *
     * @throws {TransportError} When the transport layer throws an error.
     *
     * @see null
     * @example
     * ```ts
     * import * as hl from "@nktkas/hyperliquid";
     *
     * const transport = new hl.HttpTransport(); // or WebSocketTransport
     * const infoClient = new hl.InfoClient({ transport });
     *
     * const data = await infoClient.liquidatable();
     * ```
     */
    liquidatable(signal) {
        const request = { type: "liquidatable" };
        return this.transport.request("info", request, signal);
    }
    /**
     * Request margin table data.
     * @param params - Request-specific parameters.
     * @param signal - An {@linkcode https://developer.mozilla.org/en-US/docs/Web/API/AbortSignal | AbortSignal}. If this option is set, the request can be canceled by calling {@linkcode https://developer.mozilla.org/en-US/docs/Web/API/AbortController/abort | abort()} on the corresponding {@linkcode https://developer.mozilla.org/en-US/docs/Web/API/AbortController | AbortController}.
     * @returns Margin requirements table with multiple tiers.
     *
     * @throws {TransportError} When the transport layer throws an error.
     *
     * @see null
     * @example
     * ```ts
     * import * as hl from "@nktkas/hyperliquid";
     *
     * const transport = new hl.HttpTransport(); // or WebSocketTransport
     * const infoClient = new hl.InfoClient({ transport });
     *
     * const data = await infoClient.marginTable({ id: 1 });
     * ```
     */
    marginTable(params, signal) {
        const request = { type: "marginTable", ...params };
        return this.transport.request("info", request, signal);
    }
    /**
     * Request builder fee approval.
     * @param params - Request-specific parameters.
     * @param signal - An {@linkcode https://developer.mozilla.org/en-US/docs/Web/API/AbortSignal | AbortSignal}. If this option is set, the request can be canceled by calling {@linkcode https://developer.mozilla.org/en-US/docs/Web/API/AbortController/abort | abort()} on the corresponding {@linkcode https://developer.mozilla.org/en-US/docs/Web/API/AbortController | AbortController}.
     * @returns Maximum builder fee approval.
     *
     * @throws {TransportError} When the transport layer throws an error.
     *
     * @see https://hyperliquid.gitbook.io/hyperliquid-docs/for-developers/api/info-endpoint#check-builder-fee-approval
     * @example
     * ```ts
     * import * as hl from "@nktkas/hyperliquid";
     *
     * const transport = new hl.HttpTransport(); // or WebSocketTransport
     * const infoClient = new hl.InfoClient({ transport });
     *
     * const data = await infoClient.maxBuilderFee({ user: "0x...", builder: "0x..." });
     * ```
     */
    maxBuilderFee(params, signal) {
        const request = { type: "maxBuilderFee", ...params };
        return this.transport.request("info", request, signal);
    }
    /**
     * Request maximum market order notionals.
     * @param signal - An {@linkcode https://developer.mozilla.org/en-US/docs/Web/API/AbortSignal | AbortSignal}. If this option is set, the request can be canceled by calling {@linkcode https://developer.mozilla.org/en-US/docs/Web/API/AbortController/abort | abort()} on the corresponding {@linkcode https://developer.mozilla.org/en-US/docs/Web/API/AbortController | AbortController}.
     * @returns
     *
     * @throws {TransportError} When the transport layer throws an error.
     *
     * @see null
     * @example
     * ```ts
     * import * as hl from "@nktkas/hyperliquid";
     *
     * const transport = new hl.HttpTransport(); // or WebSocketTransport
     * const infoClient = new hl.InfoClient({ transport });
     *
     * const data = await infoClient.maxMarketOrderNtls();
     * ```
     */
    maxMarketOrderNtls(signal) {
        const request = { type: "maxMarketOrderNtls" };
        return this.transport.request("info", request, signal);
    }
    meta(params_or_signal, maybeSignal) {
        const params = params_or_signal instanceof AbortSignal ? {} : params_or_signal;
        const signal = params_or_signal instanceof AbortSignal ? params_or_signal : maybeSignal;
        const request = { type: "meta", ...params };
        return this.transport.request("info", request, signal);
    }
    /**
     * Request metadata and asset contexts.
     * @param signal - An {@linkcode https://developer.mozilla.org/en-US/docs/Web/API/AbortSignal | AbortSignal}. If this option is set, the request can be canceled by calling {@linkcode https://developer.mozilla.org/en-US/docs/Web/API/AbortController/abort | abort()} on the corresponding {@linkcode https://developer.mozilla.org/en-US/docs/Web/API/AbortController | AbortController}.
     * @returns Metadata and context for perpetual assets.
     *
     * @throws {TransportError} When the transport layer throws an error.
     *
     * @see https://hyperliquid.gitbook.io/hyperliquid-docs/for-developers/api/info-endpoint/perpetuals#retrieve-perpetuals-asset-contexts-includes-mark-price-current-funding-open-interest-etc
     * @example
     * ```ts
     * import * as hl from "@nktkas/hyperliquid";
     *
     * const transport = new hl.HttpTransport(); // or WebSocketTransport
     * const infoClient = new hl.InfoClient({ transport });
     *
     * const data = await infoClient.metaAndAssetCtxs();
     * ```
     */
    metaAndAssetCtxs(signal) {
        const request = { type: "metaAndAssetCtxs" };
        return this.transport.request("info", request, signal);
    }
    /**
     * Request open orders.
     * @param params - Request-specific parameters.
     * @param signal - An {@linkcode https://developer.mozilla.org/en-US/docs/Web/API/AbortSignal | AbortSignal}. If this option is set, the request can be canceled by calling {@linkcode https://developer.mozilla.org/en-US/docs/Web/API/AbortController/abort | abort()} on the corresponding {@linkcode https://developer.mozilla.org/en-US/docs/Web/API/AbortController | AbortController}.
     * @returns Array of open order.
     *
     * @throws {TransportError} When the transport layer throws an error.
     *
     * @see https://hyperliquid.gitbook.io/hyperliquid-docs/for-developers/api/info-endpoint#retrieve-a-users-open-orders
     * @example
     * ```ts
     * import * as hl from "@nktkas/hyperliquid";
     *
     * const transport = new hl.HttpTransport(); // or WebSocketTransport
     * const infoClient = new hl.InfoClient({ transport });
     *
     * const data = await infoClient.openOrders({ user: "0x..." });
     * ```
     */
    openOrders(params, signal) {
        const request = { type: "openOrders", ...params };
        return this.transport.request("info", request, signal);
    }
    /**
     * Request order status.
     * @param params - Request-specific parameters.
     * @param signal - An {@linkcode https://developer.mozilla.org/en-US/docs/Web/API/AbortSignal | AbortSignal}. If this option is set, the request can be canceled by calling {@linkcode https://developer.mozilla.org/en-US/docs/Web/API/AbortController/abort | abort()} on the corresponding {@linkcode https://developer.mozilla.org/en-US/docs/Web/API/AbortController | AbortController}.
     * @returns Result of an order status lookup.
     *
     * @throws {TransportError} When the transport layer throws an error.
     *
     * @see https://hyperliquid.gitbook.io/hyperliquid-docs/for-developers/api/info-endpoint#query-order-status-by-oid-or-cloid
     * @example
     * ```ts
     * import * as hl from "@nktkas/hyperliquid";
     *
     * const transport = new hl.HttpTransport(); // or WebSocketTransport
     * const infoClient = new hl.InfoClient({ transport });
     *
     * const data = await infoClient.orderStatus({ user: "0x...", oid: 12345 });
     * ```
     */
    orderStatus(params, signal) {
        const request = { type: "orderStatus", ...params };
        return this.transport.request("info", request, signal);
    }
    /**
     * Request for the status of the perpetual deploy auction.
     * @param signal - An {@linkcode https://developer.mozilla.org/en-US/docs/Web/API/AbortSignal | AbortSignal}. If this option is set, the request can be canceled by calling {@linkcode https://developer.mozilla.org/en-US/docs/Web/API/AbortController/abort | abort()} on the corresponding {@linkcode https://developer.mozilla.org/en-US/docs/Web/API/AbortController | AbortController}.
     * @returns Status of the perpetual deploy auction.
     *
     * @throws {TransportError} When the transport layer throws an error.
     *
     * @see https://hyperliquid.gitbook.io/hyperliquid-docs/for-developers/api/info-endpoint/perpetuals#retrieve-information-about-the-perp-deploy-auction
     * @example
     * ```ts
     * import * as hl from "@nktkas/hyperliquid";
     *
     * const transport = new hl.HttpTransport(); // or WebSocketTransport
     * const infoClient = new hl.InfoClient({ transport });
     *
     * const data = await infoClient.perpDeployAuctionStatus();
     * ```
     */
    perpDeployAuctionStatus(signal) {
        const request = { type: "perpDeployAuctionStatus" };
        return this.transport.request("info", request, signal);
    }
    /**
     * Request all perpetual dexs.
     * @param signal - An {@linkcode https://developer.mozilla.org/en-US/docs/Web/API/AbortSignal | AbortSignal}. If this option is set, the request can be canceled by calling {@linkcode https://developer.mozilla.org/en-US/docs/Web/API/AbortController/abort | abort()} on the corresponding {@linkcode https://developer.mozilla.org/en-US/docs/Web/API/AbortController | AbortController}.
     * @returns Array of perpetual dexes (null is main dex).
     *
     * @throws {TransportError} When the transport layer throws an error.
     *
     * @see https://hyperliquid.gitbook.io/hyperliquid-docs/for-developers/api/info-endpoint/perpetuals#retrieve-all-perpetual-dexs
     * @example
     * ```ts
     * import * as hl from "@nktkas/hyperliquid";
     *
     * const transport = new hl.HttpTransport(); // or WebSocketTransport
     * const infoClient = new hl.InfoClient({ transport });
     *
     * const data = await infoClient.perpDexs();
     * ```
     */
    perpDexs(signal) {
        const request = { type: "perpDexs" };
        return this.transport.request("info", request, signal);
    }
    /**
     * Request perpetuals at open interest cap.
     * @param signal - An {@linkcode https://developer.mozilla.org/en-US/docs/Web/API/AbortSignal | AbortSignal}. If this option is set, the request can be canceled by calling {@linkcode https://developer.mozilla.org/en-US/docs/Web/API/AbortController/abort | abort()} on the corresponding {@linkcode https://developer.mozilla.org/en-US/docs/Web/API/AbortController | AbortController}.
     * @returns Array of perpetuals at open interest caps.
     *
     * @throws {TransportError} When the transport layer throws an error.
     *
     * @see https://hyperliquid.gitbook.io/hyperliquid-docs/for-developers/api/info-endpoint/perpetuals#query-perps-at-open-interest-caps
     * @example
     * ```ts
     * import * as hl from "@nktkas/hyperliquid";
     *
     * const transport = new hl.HttpTransport(); // or WebSocketTransport
     * const infoClient = new hl.InfoClient({ transport });
     *
     * const data = await infoClient.perpsAtOpenInterestCap();
     * ```
     */
    perpsAtOpenInterestCap(signal) {
        const request = { type: "perpsAtOpenInterestCap" };
        return this.transport.request("info", request, signal);
    }
    /**
     * Request user portfolio.
     * @param params - Request-specific parameters.
     * @param signal - An {@linkcode https://developer.mozilla.org/en-US/docs/Web/API/AbortSignal | AbortSignal}. If this option is set, the request can be canceled by calling {@linkcode https://developer.mozilla.org/en-US/docs/Web/API/AbortController/abort | abort()} on the corresponding {@linkcode https://developer.mozilla.org/en-US/docs/Web/API/AbortController | AbortController}.
     * @returns Portfolio metrics grouped by time periods.
     *
     * @throws {TransportError} When the transport layer throws an error.
     *
     * @see https://hyperliquid.gitbook.io/hyperliquid-docs/for-developers/api/info-endpoint#query-a-users-portfolio
     * @example
     * ```ts
     * import * as hl from "@nktkas/hyperliquid";
     *
     * const transport = new hl.HttpTransport(); // or WebSocketTransport
     * const infoClient = new hl.InfoClient({ transport });
     *
     * const data = await infoClient.portfolio({ user: "0x..." });
     * ```
     */
    portfolio(params, signal) {
        const request = { type: "portfolio", ...params };
        return this.transport.request("info", request, signal);
    }
    /**
     * Request predicted funding rates.
     * @param signal - An {@linkcode https://developer.mozilla.org/en-US/docs/Web/API/AbortSignal | AbortSignal}. If this option is set, the request can be canceled by calling {@linkcode https://developer.mozilla.org/en-US/docs/Web/API/AbortController/abort | abort()} on the corresponding {@linkcode https://developer.mozilla.org/en-US/docs/Web/API/AbortController | AbortController}.
     * @returns Array of predicted funding rates.
     *
     * @throws {TransportError} When the transport layer throws an error.
     *
     * @see https://hyperliquid.gitbook.io/hyperliquid-docs/for-developers/api/info-endpoint/perpetuals#retrieve-predicted-funding-rates-for-different-venues
     * @example
     * ```ts
     * import * as hl from "@nktkas/hyperliquid";
     *
     * const transport = new hl.HttpTransport(); // or WebSocketTransport
     * const infoClient = new hl.InfoClient({ transport });
     *
     * const data = await infoClient.predictedFundings();
     * ```
     */
    predictedFundings(signal) {
        const request = { type: "predictedFundings" };
        return this.transport.request("info", request, signal);
    }
    /**
     * Request user's existence check before transfer.
     * @param params - Request-specific parameters.
     * @param signal - An {@linkcode https://developer.mozilla.org/en-US/docs/Web/API/AbortSignal | AbortSignal}. If this option is set, the request can be canceled by calling {@linkcode https://developer.mozilla.org/en-US/docs/Web/API/AbortController/abort | abort()} on the corresponding {@linkcode https://developer.mozilla.org/en-US/docs/Web/API/AbortController | AbortController}.
     * @returns Pre-transfer user existence check result.
     *
     * @throws {TransportError} When the transport layer throws an error.
     *
     * @see null
     * @example
     * ```ts
     * import * as hl from "@nktkas/hyperliquid";
     *
     * const transport = new hl.HttpTransport(); // or WebSocketTransport
     * const infoClient = new hl.InfoClient({ transport });
     *
     * const data = await infoClient.preTransferCheck({ user: "0x...", source: "0x..." });
     * ```
     */
    preTransferCheck(params, signal) {
        const request = { type: "preTransferCheck", ...params };
        return this.transport.request("info", request, signal);
    }
    /**
     * Request user referral.
     * @param params - Request-specific parameters.
     * @param signal - An {@linkcode https://developer.mozilla.org/en-US/docs/Web/API/AbortSignal | AbortSignal}. If this option is set, the request can be canceled by calling {@linkcode https://developer.mozilla.org/en-US/docs/Web/API/AbortController/abort | abort()} on the corresponding {@linkcode https://developer.mozilla.org/en-US/docs/Web/API/AbortController | AbortController}.
     * @returns Referral information for a user.
     *
     * @throws {TransportError} When the transport layer throws an error.
     *
     * @see https://hyperliquid.gitbook.io/hyperliquid-docs/for-developers/api/info-endpoint#query-a-users-referral-information
     * @example
     * ```ts
     * import * as hl from "@nktkas/hyperliquid";
     *
     * const transport = new hl.HttpTransport(); // or WebSocketTransport
     * const infoClient = new hl.InfoClient({ transport });
     *
     * const data = await infoClient.referral({ user: "0x..." });
     * ```
     */
    referral(params, signal) {
        const request = { type: "referral", ...params };
        return this.transport.request("info", request, signal);
    }
    /**
     * Request spot clearinghouse state.
     * @param params - Request-specific parameters.
     * @param signal - An {@linkcode https://developer.mozilla.org/en-US/docs/Web/API/AbortSignal | AbortSignal}. If this option is set, the request can be canceled by calling {@linkcode https://developer.mozilla.org/en-US/docs/Web/API/AbortController/abort | abort()} on the corresponding {@linkcode https://developer.mozilla.org/en-US/docs/Web/API/AbortController | AbortController}.
     * @returns Account summary for spot trading.
     *
     * @throws {TransportError} When the transport layer throws an error.
     *
     * @see https://hyperliquid.gitbook.io/hyperliquid-docs/for-developers/api/info-endpoint/spot#retrieve-a-users-token-balances
     * @example
     * ```ts
     * import * as hl from "@nktkas/hyperliquid";
     *
     * const transport = new hl.HttpTransport(); // or WebSocketTransport
     * const infoClient = new hl.InfoClient({ transport });
     *
     * const data = await infoClient.spotClearinghouseState({ user: "0x..." });
     * ```
     */
    spotClearinghouseState(params, signal) {
        const request = { type: "spotClearinghouseState", ...params };
        return this.transport.request("info", request, signal);
    }
    /**
     * Request spot deploy state.
     * @param params - Request-specific parameters.
     * @param signal - An {@linkcode https://developer.mozilla.org/en-US/docs/Web/API/AbortSignal | AbortSignal}. If this option is set, the request can be canceled by calling {@linkcode https://developer.mozilla.org/en-US/docs/Web/API/AbortController/abort | abort()} on the corresponding {@linkcode https://developer.mozilla.org/en-US/docs/Web/API/AbortController | AbortController}.
     * @returns Deploy state for spot tokens.
     *
     * @throws {TransportError} When the transport layer throws an error.
     *
     * @see https://hyperliquid.gitbook.io/hyperliquid-docs/for-developers/api/info-endpoint/spot#retrieve-information-about-the-spot-deploy-auction
     * @example
     * ```ts
     * import * as hl from "@nktkas/hyperliquid";
     *
     * const transport = new hl.HttpTransport(); // or WebSocketTransport
     * const infoClient = new hl.InfoClient({ transport });
     *
     * const data = await infoClient.spotDeployState({ user: "0x..." });
     * ```
     */
    spotDeployState(params, signal) {
        const request = { type: "spotDeployState", ...params };
        return this.transport.request("info", request, signal);
    }
    /**
     * Request spot trading metadata.
     * @param signal - An {@linkcode https://developer.mozilla.org/en-US/docs/Web/API/AbortSignal | AbortSignal}. If this option is set, the request can be canceled by calling {@linkcode https://developer.mozilla.org/en-US/docs/Web/API/AbortController/abort | abort()} on the corresponding {@linkcode https://developer.mozilla.org/en-US/docs/Web/API/AbortController | AbortController}.
     * @returns Metadata for spot assets.
     *
     * @throws {TransportError} When the transport layer throws an error.
     *
     * @see https://hyperliquid.gitbook.io/hyperliquid-docs/for-developers/api/info-endpoint/spot#retrieve-spot-metadata
     * @example
     * ```ts
     * import * as hl from "@nktkas/hyperliquid";
     *
     * const transport = new hl.HttpTransport(); // or WebSocketTransport
     * const infoClient = new hl.InfoClient({ transport });
     *
     * const data = await infoClient.spotMeta();
     * ```
     */
    spotMeta(signal) {
        const request = { type: "spotMeta" };
        return this.transport.request("info", request, signal);
    }
    /**
     * Request spot metadata and asset contexts.
     * @param signal - An {@linkcode https://developer.mozilla.org/en-US/docs/Web/API/AbortSignal | AbortSignal}. If this option is set, the request can be canceled by calling {@linkcode https://developer.mozilla.org/en-US/docs/Web/API/AbortController/abort | abort()} on the corresponding {@linkcode https://developer.mozilla.org/en-US/docs/Web/API/AbortController | AbortController}.
     * @returns Metadata and context for spot assets.
     *
     * @throws {TransportError} When the transport layer throws an error.
     *
     * @see https://hyperliquid.gitbook.io/hyperliquid-docs/for-developers/api/info-endpoint/spot#retrieve-spot-asset-contexts
     * @example
     * ```ts
     * import * as hl from "@nktkas/hyperliquid";
     *
     * const transport = new hl.HttpTransport(); // or WebSocketTransport
     * const infoClient = new hl.InfoClient({ transport });
     *
     * const data = await infoClient.spotMetaAndAssetCtxs();
     * ```
     */
    spotMetaAndAssetCtxs(signal) {
        const request = { type: "spotMetaAndAssetCtxs" };
        return this.transport.request("info", request, signal);
    }
    /**
     * Request user sub-accounts.
     * @param params - Request-specific parameters.
     * @param signal - An {@linkcode https://developer.mozilla.org/en-US/docs/Web/API/AbortSignal | AbortSignal}. If this option is set, the request can be canceled by calling {@linkcode https://developer.mozilla.org/en-US/docs/Web/API/AbortController/abort | abort()} on the corresponding {@linkcode https://developer.mozilla.org/en-US/docs/Web/API/AbortController | AbortController}.
     * @returns Array of user sub-account or null if the user does not have any sub-accounts.
     *
     * @throws {TransportError} When the transport layer throws an error.
     *
     * @see https://hyperliquid.gitbook.io/hyperliquid-docs/for-developers/api/info-endpoint#retrieve-a-users-subaccounts
     * @example
     * ```ts
     * import * as hl from "@nktkas/hyperliquid";
     *
     * const transport = new hl.HttpTransport(); // or WebSocketTransport
     * const infoClient = new hl.InfoClient({ transport });
     *
     * const data = await infoClient.subAccounts({ user: "0x..." });
     * ```
     */
    subAccounts(params, signal) {
        const request = { type: "subAccounts", ...params };
        return this.transport.request("info", request, signal);
    }
    /**
     * Request token details.
     * @param params - Request-specific parameters.
     * @param signal - An {@linkcode https://developer.mozilla.org/en-US/docs/Web/API/AbortSignal | AbortSignal}. If this option is set, the request can be canceled by calling {@linkcode https://developer.mozilla.org/en-US/docs/Web/API/AbortController/abort | abort()} on the corresponding {@linkcode https://developer.mozilla.org/en-US/docs/Web/API/AbortController | AbortController}.
     * @returns Details of a token.
     *
     * @throws {TransportError} When the transport layer throws an error.
     *
     * @see https://hyperliquid.gitbook.io/hyperliquid-docs/for-developers/api/info-endpoint/spot#retrieve-information-about-a-token
     * @example
     * ```ts
     * import * as hl from "@nktkas/hyperliquid";
     *
     * const transport = new hl.HttpTransport(); // or WebSocketTransport
     * const infoClient = new hl.InfoClient({ transport });
     *
     * const data = await infoClient.tokenDetails({ tokenId: "0x..." });
     * ```
     */
    tokenDetails(params, signal) {
        const request = { type: "tokenDetails", ...params };
        return this.transport.request("info", request, signal);
    }
    /**
     * Request twap history of a user.
     * @param params - Request-specific parameters.
     * @param signal - An {@linkcode https://developer.mozilla.org/en-US/docs/Web/API/AbortSignal | AbortSignal}. If this option is set, the request can be canceled by calling {@linkcode https://developer.mozilla.org/en-US/docs/Web/API/AbortController/abort | abort()} on the corresponding {@linkcode https://developer.mozilla.org/en-US/docs/Web/API/AbortController | AbortController}.
     * @returns Array of user's TWAP history.
     *
     * @throws {TransportError} When the transport layer throws an error.
     *
     * @see null
     * @example
     * ```ts
     * import * as hl from "@nktkas/hyperliquid";
     *
     * const transport = new hl.HttpTransport(); // or WebSocketTransport
     * const infoClient = new hl.InfoClient({ transport });
     *
     * const data = await infoClient.twapHistory({ user: "0x..." });
     * ```
     */
    twapHistory(params, signal) {
        const request = { type: "twapHistory", ...params };
        return this.transport.request("info", request, signal);
    }
    /**
     * Request transaction details by transaction hash.
     * @param params - Request-specific parameters.
     * @param signal - An {@linkcode https://developer.mozilla.org/en-US/docs/Web/API/AbortSignal | AbortSignal}. If this option is set, the request can be canceled by calling {@linkcode https://developer.mozilla.org/en-US/docs/Web/API/AbortController/abort | abort()} on the corresponding {@linkcode https://developer.mozilla.org/en-US/docs/Web/API/AbortController | AbortController}.
     * @returns Transaction details.
     *
     * @throws {TransportError} When the transport layer throws an error.
     *
     * @see null
     * @example
     * ```ts
     * import * as hl from "@nktkas/hyperliquid";
     *
     * const transport = new hl.HttpTransport(); // only `HttpTransport` supports this method
     * const infoClient = new hl.InfoClient({ transport });
     *
     * const data = await infoClient.txDetails({ hash: "0x..." });
     * ```
     */
    txDetails(params, signal) {
        const request = { type: "txDetails", ...params };
        return this.transport.request("explorer", request, signal)
            .then(({ tx }) => tx);
    }
    /**
     * Request user details by user's address.
     * @param params - Request-specific parameters.
     * @param signal - An {@linkcode https://developer.mozilla.org/en-US/docs/Web/API/AbortSignal | AbortSignal}. If this option is set, the request can be canceled by calling {@linkcode https://developer.mozilla.org/en-US/docs/Web/API/AbortController/abort | abort()} on the corresponding {@linkcode https://developer.mozilla.org/en-US/docs/Web/API/AbortController | AbortController}.
     * @returns User details.
     *
     * @throws {TransportError} When the transport layer throws an error.
     *
     * @see null
     * @example
     * ```ts
     * import * as hl from "@nktkas/hyperliquid";
     *
     * const transport = new hl.HttpTransport(); // only `HttpTransport` supports this method
     * const infoClient = new hl.InfoClient({ transport });
     *
     * const data = await infoClient.userDetails({ user: "0x..." });
     * ```
     */
    userDetails(params, signal) {
        const request = { type: "userDetails", ...params };
        return this.transport.request("explorer", request, signal)
            .then(({ txs }) => txs);
    }
    /**
     * Request user fees.
     * @param params - Request-specific parameters.
     * @param signal - An {@linkcode https://developer.mozilla.org/en-US/docs/Web/API/AbortSignal | AbortSignal}. If this option is set, the request can be canceled by calling {@linkcode https://developer.mozilla.org/en-US/docs/Web/API/AbortController/abort | abort()} on the corresponding {@linkcode https://developer.mozilla.org/en-US/docs/Web/API/AbortController | AbortController}.
     * @returns User fees.
     *
     * @throws {TransportError} When the transport layer throws an error.
     *
     * @see https://hyperliquid.gitbook.io/hyperliquid-docs/for-developers/api/info-endpoint#query-a-users-fees
     * @example
     * ```ts
     * import * as hl from "@nktkas/hyperliquid";
     *
     * const transport = new hl.HttpTransport(); // or WebSocketTransport
     * const infoClient = new hl.InfoClient({ transport });
     *
     * const data = await infoClient.userFees({ user: "0x..." });
     * ```
     */
    userFees(params, signal) {
        const request = { type: "userFees", ...params };
        return this.transport.request("info", request, signal);
    }
    /**
     * Request user fills.
     * @param params - Request-specific parameters.
     * @param signal - An {@linkcode https://developer.mozilla.org/en-US/docs/Web/API/AbortSignal | AbortSignal}. If this option is set, the request can be canceled by calling {@linkcode https://developer.mozilla.org/en-US/docs/Web/API/AbortController/abort | abort()} on the corresponding {@linkcode https://developer.mozilla.org/en-US/docs/Web/API/AbortController | AbortController}.
     * @returns Array of user's trade fill.
     *
     * @throws {TransportError} When the transport layer throws an error.
     *
     * @see https://hyperliquid.gitbook.io/hyperliquid-docs/for-developers/api/info-endpoint#retrieve-a-users-fills
     * @example
     * ```ts
     * import * as hl from "@nktkas/hyperliquid";
     *
     * const transport = new hl.HttpTransport(); // or WebSocketTransport
     * const infoClient = new hl.InfoClient({ transport });
     *
     * const data = await infoClient.userFills({ user: "0x..." });
     * ```
     */
    userFills(params, signal) {
        const request = { type: "userFills", ...params };
        return this.transport.request("info", request, signal);
    }
    /**
     * Request user fills by time.
     * @param params - Request-specific parameters.
     * @param signal - An {@linkcode https://developer.mozilla.org/en-US/docs/Web/API/AbortSignal | AbortSignal}. If this option is set, the request can be canceled by calling {@linkcode https://developer.mozilla.org/en-US/docs/Web/API/AbortController/abort | abort()} on the corresponding {@linkcode https://developer.mozilla.org/en-US/docs/Web/API/AbortController | AbortController}.
     * @returns Array of user's trade fill.
     *
     * @throws {TransportError} When the transport layer throws an error.
     *
     * @see https://hyperliquid.gitbook.io/hyperliquid-docs/for-developers/api/info-endpoint#retrieve-a-users-fills-by-time
     * @example
     * ```ts
     * import * as hl from "@nktkas/hyperliquid";
     *
     * const transport = new hl.HttpTransport(); // or WebSocketTransport
     * const infoClient = new hl.InfoClient({ transport });
     *
     * const data = await infoClient.userFillsByTime({
     *   user: "0x...",
     *   startTime: Date.now() - 1000 * 60 * 60 * 24
     * });
     * ```
     */
    userFillsByTime(params, signal) {
        const request = { type: "userFillsByTime", ...params };
        return this.transport.request("info", request, signal);
    }
    /**
     * Request user funding.
     * @param params - Request-specific parameters.
     * @param signal - An {@linkcode https://developer.mozilla.org/en-US/docs/Web/API/AbortSignal | AbortSignal}. If this option is set, the request can be canceled by calling {@linkcode https://developer.mozilla.org/en-US/docs/Web/API/AbortController/abort | abort()} on the corresponding {@linkcode https://developer.mozilla.org/en-US/docs/Web/API/AbortController | AbortController}.
     * @returns Array of user's funding ledger update.
     *
     * @throws {TransportError} When the transport layer throws an error.
     *
     * @see https://hyperliquid.gitbook.io/hyperliquid-docs/for-developers/api/info-endpoint/perpetuals#retrieve-a-users-funding-history-or-non-funding-ledger-updates
     * @example
     * ```ts
     * import * as hl from "@nktkas/hyperliquid";
     *
     * const transport = new hl.HttpTransport(); // or WebSocketTransport
     * const infoClient = new hl.InfoClient({ transport });
     *
     * const data = await infoClient.userFunding({
     *   user: "0x...",
     *   startTime: Date.now() - 1000 * 60 * 60 * 24
     * });
     * ```
     */
    userFunding(params, signal) {
        const request = { type: "userFunding", ...params };
        return this.transport.request("info", request, signal);
    }
    /**
     * Request user non-funding ledger updates.
     * @param params - Request-specific parameters.
     * @param signal - An {@linkcode https://developer.mozilla.org/en-US/docs/Web/API/AbortSignal | AbortSignal}. If this option is set, the request can be canceled by calling {@linkcode https://developer.mozilla.org/en-US/docs/Web/API/AbortController/abort | abort()} on the corresponding {@linkcode https://developer.mozilla.org/en-US/docs/Web/API/AbortController | AbortController}.
     * @returns Array of user's non-funding ledger update.
     *
     * @throws {TransportError} When the transport layer throws an error.
     *
     * @see https://hyperliquid.gitbook.io/hyperliquid-docs/for-developers/api/info-endpoint/perpetuals#retrieve-a-users-funding-history-or-non-funding-ledger-updates
     * @example
     * ```ts
     * import * as hl from "@nktkas/hyperliquid";
     *
     * const transport = new hl.HttpTransport(); // or WebSocketTransport
     * const infoClient = new hl.InfoClient({ transport });
     *
     * const data = await infoClient.userNonFundingLedgerUpdates({
     *   user: "0x...",
     *   startTime: Date.now() - 1000 * 60 * 60 * 24
     * });
     * ```
     */
    userNonFundingLedgerUpdates(params, signal) {
        const request = { type: "userNonFundingLedgerUpdates", ...params };
        return this.transport.request("info", request, signal);
    }
    /**
     * Request user rate limits.
     * @param params - Request-specific parameters.
     * @param signal - An {@linkcode https://developer.mozilla.org/en-US/docs/Web/API/AbortSignal | AbortSignal}. If this option is set, the request can be canceled by calling {@linkcode https://developer.mozilla.org/en-US/docs/Web/API/AbortController/abort | abort()} on the corresponding {@linkcode https://developer.mozilla.org/en-US/docs/Web/API/AbortController | AbortController}.
     * @returns User's rate limits.
     *
     * @throws {TransportError} When the transport layer throws an error.
     *
     * @see https://hyperliquid.gitbook.io/hyperliquid-docs/for-developers/api/info-endpoint#query-user-rate-limits
     * @example
     * ```ts
     * import * as hl from "@nktkas/hyperliquid";
     *
     * const transport = new hl.HttpTransport(); // or WebSocketTransport
     * const infoClient = new hl.InfoClient({ transport });
     *
     * const data = await infoClient.userRateLimit({ user: "0x..." });
     * ```
     */
    userRateLimit(params, signal) {
        const request = { type: "userRateLimit", ...params };
        return this.transport.request("info", request, signal);
    }
    /**
     * Request user role.
     * @param params - Request-specific parameters.
     * @param signal - An {@linkcode https://developer.mozilla.org/en-US/docs/Web/API/AbortSignal | AbortSignal}. If this option is set, the request can be canceled by calling {@linkcode https://developer.mozilla.org/en-US/docs/Web/API/AbortController/abort | abort()} on the corresponding {@linkcode https://developer.mozilla.org/en-US/docs/Web/API/AbortController | AbortController}.
     * @returns User's role.
     *
     * @throws {TransportError} When the transport layer throws an error.
     *
     * @see https://hyperliquid.gitbook.io/hyperliquid-docs/for-developers/api/info-endpoint#query-a-users-role
     * @example
     * ```ts
     * import * as hl from "@nktkas/hyperliquid";
     *
     * const transport = new hl.HttpTransport(); // or WebSocketTransport
     * const infoClient = new hl.InfoClient({ transport });
     *
     * const data = await infoClient.userRole({ user: "0x..." });
     * ```
     */
    userRole(params, signal) {
        const request = { type: "userRole", ...params };
        return this.transport.request("info", request, signal);
    }
    /**
     * Request multi-sig signers for a user.
     * @param params - Request-specific parameters.
     * @param signal - An {@linkcode https://developer.mozilla.org/en-US/docs/Web/API/AbortSignal | AbortSignal}. If this option is set, the request can be canceled by calling {@linkcode https://developer.mozilla.org/en-US/docs/Web/API/AbortController/abort | abort()} on the corresponding {@linkcode https://developer.mozilla.org/en-US/docs/Web/API/AbortController | AbortController}.
     * @returns Multi-sig signers for a user or null if the user does not have any multi-sig signers.
     *
     * @throws {TransportError} When the transport layer throws an error.
     *
     * @see null
     * @example
     * ```ts
     * import * as hl from "@nktkas/hyperliquid";
     *
     * const transport = new hl.HttpTransport(); // or WebSocketTransport
     * const infoClient = new hl.InfoClient({ transport });
     *
     * const data = await infoClient.userToMultiSigSigners({ user: "0x..." });
     * ```
     */
    userToMultiSigSigners(params, signal) {
        const request = { type: "userToMultiSigSigners", ...params };
        return this.transport.request("info", request, signal);
    }
    /**
     * Request user twap slice fills.
     * @param params - Request-specific parameters.
     * @param signal - An {@linkcode https://developer.mozilla.org/en-US/docs/Web/API/AbortSignal | AbortSignal}. If this option is set, the request can be canceled by calling {@linkcode https://developer.mozilla.org/en-US/docs/Web/API/AbortController/abort | abort()} on the corresponding {@linkcode https://developer.mozilla.org/en-US/docs/Web/API/AbortController | AbortController}.
     * @returns Array of user's twap slice fill.
     *
     * @throws {TransportError} When the transport layer throws an error.
     *
     * @see https://hyperliquid.gitbook.io/hyperliquid-docs/for-developers/api/info-endpoint#retrieve-a-users-twap-slice-fills
     * @example
     * ```ts
     * import * as hl from "@nktkas/hyperliquid";
     *
     * const transport = new hl.HttpTransport(); // or WebSocketTransport
     * const infoClient = new hl.InfoClient({ transport });
     *
     * const data = await infoClient.userTwapSliceFills({ user: "0x..." });
     * ```
     */
    userTwapSliceFills(params, signal) {
        const request = { type: "userTwapSliceFills", ...params };
        return this.transport.request("info", request, signal);
    }
    /**
     * Request user twap slice fills by time.
     * @param params - Request-specific parameters.
     * @param signal - An {@linkcode https://developer.mozilla.org/en-US/docs/Web/API/AbortSignal | AbortSignal}. If this option is set, the request can be canceled by calling {@linkcode https://developer.mozilla.org/en-US/docs/Web/API/AbortController/abort | abort()} on the corresponding {@linkcode https://developer.mozilla.org/en-US/docs/Web/API/AbortController | AbortController}.
     * @returns Array of user's twap slice fill.
     *
     * @throws {TransportError} When the transport layer throws an error.
     *
     * @see null
     * @example
     * ```ts
     * import * as hl from "@nktkas/hyperliquid";
     *
     * const transport = new hl.HttpTransport(); // or WebSocketTransport
     * const infoClient = new hl.InfoClient({ transport });
     *
     * const data = await infoClient.userTwapSliceFillsByTime({
     *   user: "0x...",
     *   startTime: Date.now() - 1000 * 60 * 60 * 24
     * });
     * ```
     */
    userTwapSliceFillsByTime(params, signal) {
        const request = { type: "userTwapSliceFillsByTime", ...params };
        return this.transport.request("info", request, signal);
    }
    /**
     * Request user vault deposits.
     * @param params - Request-specific parameters.
     * @param signal - An {@linkcode https://developer.mozilla.org/en-US/docs/Web/API/AbortSignal | AbortSignal}. If this option is set, the request can be canceled by calling {@linkcode https://developer.mozilla.org/en-US/docs/Web/API/AbortController/abort | abort()} on the corresponding {@linkcode https://developer.mozilla.org/en-US/docs/Web/API/AbortController | AbortController}.
     * @returns Array of user's vault deposits.
     *
     * @throws {TransportError} When the transport layer throws an error.
     *
     * @see https://hyperliquid.gitbook.io/hyperliquid-docs/for-developers/api/info-endpoint#retrieve-a-users-vault-deposits
     * @example
     * ```ts
     * import * as hl from "@nktkas/hyperliquid";
     *
     * const transport = new hl.HttpTransport(); // or WebSocketTransport
     * const infoClient = new hl.InfoClient({ transport });
     *
     * const data = await infoClient.userVaultEquities({ user: "0x..." });
     * ```
     */
    userVaultEquities(params, signal) {
        const request = { type: "userVaultEquities", ...params };
        return this.transport.request("info", request, signal);
    }
    /**
     * Request validator L1 votes.
     * @param signal - An {@linkcode https://developer.mozilla.org/en-US/docs/Web/API/AbortSignal | AbortSignal}. If this option is set, the request can be canceled by calling {@linkcode https://developer.mozilla.org/en-US/docs/Web/API/AbortController/abort | abort()} on the corresponding {@linkcode https://developer.mozilla.org/en-US/docs/Web/API/AbortController | AbortController}.
     * @returns
     *
     * @throws {TransportError} When the transport layer throws an error.
     *
     * @see null
     * @example
     * ```ts
     * import * as hl from "@nktkas/hyperliquid";
     *
     * const transport = new hl.HttpTransport(); // or WebSocketTransport
     * const infoClient = new hl.InfoClient({ transport });
     *
     * const data = await infoClient.validatorL1Votes();
     * ```
     */
    validatorL1Votes(signal) {
        const request = { type: "validatorL1Votes" };
        return this.transport.request("info", request, signal);
    }
    /**
     * Request validator summaries.
     * @param signal - An {@linkcode https://developer.mozilla.org/en-US/docs/Web/API/AbortSignal | AbortSignal}. If this option is set, the request can be canceled by calling {@linkcode https://developer.mozilla.org/en-US/docs/Web/API/AbortController/abort | abort()} on the corresponding {@linkcode https://developer.mozilla.org/en-US/docs/Web/API/AbortController | AbortController}.
     * @returns Array of validator summaries.
     *
     * @throws {TransportError} When the transport layer throws an error.
     *
     * @see null
     * @example
     * ```ts
     * import * as hl from "@nktkas/hyperliquid";
     *
     * const transport = new hl.HttpTransport(); // or WebSocketTransport
     * const infoClient = new hl.InfoClient({ transport });
     *
     * const data = await infoClient.validatorSummaries();
     * ```
     */
    validatorSummaries(signal) {
        const request = { type: "validatorSummaries" };
        return this.transport.request("info", request, signal);
    }
    /**
     * Request details of a vault.
     * @param params - Request-specific parameters.
     * @param signal - An {@linkcode https://developer.mozilla.org/en-US/docs/Web/API/AbortSignal | AbortSignal}. If this option is set, the request can be canceled by calling {@linkcode https://developer.mozilla.org/en-US/docs/Web/API/AbortController/abort | abort()} on the corresponding {@linkcode https://developer.mozilla.org/en-US/docs/Web/API/AbortController | AbortController}.
     * @returns Details of a vault or null if the vault does not exist.
     *
     * @throws {TransportError} When the transport layer throws an error.
     *
     * @see https://hyperliquid.gitbook.io/hyperliquid-docs/for-developers/api/info-endpoint#retrieve-details-for-a-vault
     * @example
     * ```ts
     * import * as hl from "@nktkas/hyperliquid";
     *
     * const transport = new hl.HttpTransport(); // or WebSocketTransport
     * const infoClient = new hl.InfoClient({ transport });
     *
     * const data = await infoClient.vaultDetails({ vaultAddress: "0x..." });
     * ```
     */
    vaultDetails(params, signal) {
        const request = { type: "vaultDetails", ...params };
        return this.transport.request("info", request, signal);
    }
    /**
     * Request a list of vaults less than 2 hours old.
     * @param signal - An {@linkcode https://developer.mozilla.org/en-US/docs/Web/API/AbortSignal | AbortSignal}. If this option is set, the request can be canceled by calling {@linkcode https://developer.mozilla.org/en-US/docs/Web/API/AbortController/abort | abort()} on the corresponding {@linkcode https://developer.mozilla.org/en-US/docs/Web/API/AbortController | AbortController}.
     * @returns Array of vault summaries.
     *
     * @throws {TransportError} When the transport layer throws an error.
     *
     * @see null
     * @example
     * ```ts
     * import * as hl from "@nktkas/hyperliquid";
     *
     * const transport = new hl.HttpTransport(); // or WebSocketTransport
     * const infoClient = new hl.InfoClient({ transport });
     *
     * const data = await infoClient.vaultSummaries();
     * ```
     */
    vaultSummaries(signal) {
        const request = { type: "vaultSummaries" };
        return this.transport.request("info", request, signal);
    }
    async [Symbol.asyncDispose]() {
        await this.transport[Symbol.asyncDispose]?.();
    }
}
