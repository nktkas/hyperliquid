// ———————————————Base Interface———————————————

/** Base structure for information requests. */
export interface BaseInfoRequest {
    /** Type of request. */
    type: string;
}

/** Base structure for delta updates. */
export interface BaseDelta {
    /** Type of update. */
    type: string;
}

// ———————————————Types———————————————

/** Hexadecimal string starting with '0x'. */
export type Hex = `0x${string}`;

/**
 * Order type for market execution:
 * - `"Market"`: An order that executes immediately at the current market price.
 * - `"Limit"`: An order that executes at the selected limit price or better.
 * - `"Stop Market"`: A market order that is activated when the price reaches the selected stop price.
 * - `"Stop Limit"`: A limit order that is activated when the price reaches the selected stop price.
 * - `"Scale"`: Multiple limit orders in a set price range.
 * - `"TWAP"`: A large order divided into smaller suborders and executed in 30 second intervals.
 *
 * @see {@link https://hyperliquid.gitbook.io/hyperliquid-docs/trading/order-types|Hyperliquid GitBook}
 */
export type OrderType =
    | "Market"
    | "Limit"
    | "Stop Market"
    | "Stop Limit"
    | "Scale"
    | "TWAP";

/**
 * Time-in-force options:
 * - `"Gtc"` (Good Til Cancelled): Remains active until filled or canceled.
 * - `"Ioc"` (Immediate or Cancel): Fills immediately or cancels any unfilled portion.
 * - `"Alo"` (Add Liquidity Only): Only adds liquidity; does not take liquidity.
 */
export type TIF =
    | "Gtc"
    | "Ioc"
    | "Alo";

/**
 * Order processing status:
 * - `"filled"`: Order fully executed.
 * - `"open"`: Order is active and waiting to be filled.
 * - `"canceled"`: Order canceled by the user.
 * - `"triggered"`: Order triggered and awaiting execution.
 * - `"rejected"`: Order rejected by the system.
 * - `"marginCanceled"`: Order canceled due to insufficient margin.
 */
export type OrderProcessingStatus =
    | "filled"
    | "open"
    | "canceled"
    | "triggered"
    | "rejected"
    | "marginCanceled";

// ———————————————Interface———————————————

/** Mid coin prices. */
export interface AllMids {
    /** Maps coin symbols to mid prices. */
    [coin: string]: string;
}

/** Context information for a perpetual asset. */
export interface AssetCtx {
    /** Funding rate. */
    funding: string;

    /** Total open interest. */
    openInterest: string;

    /** Previous day's closing price. */
    prevDayPx: string;

    /** Daily volume. */
    dayNtlVlm: string;

    /** Premium price. */
    premium: string | null;

    /** Oracle price. */
    oraclePx: string;

    /** Mark price. */
    markPx: string;

    /** Index price. */
    midPx: string | null;

    /** Impact prices. */
    impactPxs: string[] | null;
}

/** Position in a specific asset. */
export interface AssetPosition {
    /** Position type. */
    type: "oneWay";

    /** Position details. */
    position: {
        /** Asset symbol. */
        coin: string;

        /** Signed position size. */
        szi: string;

        /** Leverage details. */
        leverage:
            | {
                /** Leverage type. */
                type: "isolated";

                /** Leverage value used. */
                value: number;

                /** Amount of raw USD used. */
                rawUsd: string;
            }
            | {
                /** Leverage type. */
                type: "cross";

                /** Leverage value used. */
                value: number;
            };

        /** Average entry price. */
        entryPx: string;

        /** Position value. */
        positionValue: string;

        /** Unrealized PnL. */
        unrealizedPnl: string;

        /** Return on equity. */
        returnOnEquity: string;

        /** Liquidation price. */
        liquidationPx: string | null;

        /** Margin used. */
        marginUsed: string;

        /** Maximum allowed leverage. */
        maxLeverage: number;

        /** Cumulative funding details. */
        cumFunding: {
            /** Total funding paid or received since account opening. */
            allTime: string;

            /** Funding since the position was opened. */
            sinceOpen: string;

            /** Funding since the last position size change. */
            sinceChange: string;
        };
    };
}

/** Candlestick data point. */
export interface CandleSnapshot {
    /** Opening timestamp (in ms since epoch). */
    t: number;

    /** Closing timestamp (in ms since epoch). */
    T: number;

    /** Asset symbol. */
    s: string;

    /** Candle interval (e.g., "1m", "5m", "1h", etc.). */
    i: string;

    /** Opening price. */
    o: string;

    /** Closing price. */
    c: string;

    /** Highest price. */
    h: string;

    /** Lowest price. */
    l: string;

    /** Total volume traded (in base currency). */
    v: string;

    /** Number of trades executed. */
    n: number;
}

/** Account summary for perpetual trading. */
export interface ClearinghouseState {
    /** Margin details. */
    marginSummary: {
        /** Total account value. */
        accountValue: string;

        /** Total notional value. */
        totalNtlPos: string;

        /** Total raw USD value. */
        totalRawUsd: string;

        /** Total margin used. */
        totalMarginUsed: string;
    };

    /** Cross-margin details. */
    crossMarginSummary: {
        /** Total account value. */
        accountValue: string;

        /** Total notional value. */
        totalNtlPos: string;

        /** Total raw USD value. */
        totalRawUsd: string;

        /** Total margin used. */
        totalMarginUsed: string;
    };

    /** Maintenance margin used for cross-margin positions. */
    crossMaintenanceMarginUsed: string;

    /** Amount available for withdrawal. */
    withdrawable: string;

    /** Positions in various assets. */
    assetPositions: AssetPosition[];

    /** Timestamp when the data was retrieved (in ms since epoch). */
    time: number;
}

/** Open order with additional frontend information. */
export interface FrontendOpenOrder extends Omit<OpenOrder, "cloid"> {
    /** Condition for triggering. */
    triggerCondition: string;

    /** Is the order a trigger order? */
    isTrigger: boolean;

    /** Trigger price (if {@link isTrigger} is true). */
    triggerPx: string;

    /** Child orders associated with this order. */
    children: unknown[];

    /** Is the order a position TP/SL order (which changes depending on the position size)? */
    isPositionTpsl: boolean;

    /** Is reduce-only? */
    reduceOnly: boolean;

    /** Type of the order. */
    orderType: OrderType;

    /** Time-in-force. */
    tif: TIF | null;

    /** Client Order ID. */
    cloid: Hex | null;
}

/** Historical funding rate data for an asset. */
export interface FundingHistory {
    /** Asset symbol. */
    coin: string;

    /** Funding rate. */
    fundingRate: string;

    /** Premium price. */
    premium: string;

    /** Timestamp of the funding record (in ms since epoch). */
    time: number;
}

/** L2 order book snapshot. */
export interface L2Book {
    /** Asset symbol. */
    coin: string;

    /** Timestamp when the snapshot was taken (in ms since epoch). */
    time: number;

    /** Bid and ask levels (index 0 = bids, index 1 = asks). */
    levels: L2BookEntry[][];
}

/** Single entry in {@link L2Book.levels}. */
export interface L2BookEntry {
    /** Price. */
    px: string;

    /** Total size. */
    sz: string;

    /** Number of individual orders. */
    n: number;
}

/** Metadata for perpetual assets. */
export interface Meta {
    /** Universes available for trading. */
    universe: Universe[];
}

/** Metadata and context information for each perpetual asset. */
export type MetaAndAssetCtxs = [
    /** Metadata for assets. */
    Meta,

    /** Context information for each asset. */
    AssetCtx[],
];

/** Open order. */
export interface OpenOrder {
    /** Asset symbol. */
    coin: string;

    /** Side of the order ("B" = Bid, "A" = Ask). */
    side: "B" | "A";

    /** Limit price. */
    limitPx: string;

    /** Size. */
    sz: string;

    /** Order ID. */
    oid: number;

    /** Timestamp when the order was placed (in ms since epoch). */
    timestamp: number;

    /** Original size when placed. */
    origSz: string;

    /** Client Order ID. */
    cloid?: Hex;
}

/** Open order with additional frontend information and current status. */
export interface OrderStatus {
    /** Order details. */
    order: FrontendOpenOrder;

    /** Order processing status. */
    status: OrderProcessingStatus;

    /** Timestamp when the status was last updated (in ms since epoch). */
    statusTimestamp: number;
}

/** Result of an order status lookup. */
export type OrderStatusResponse =
    | {
        /** Indicates that the order was found. */
        status: "order";

        /** Open order with additional frontend information and current status. */
        order: OrderStatus;
    }
    | {
        /** Indicates that the order was not found. */
        status: "unknownOid";
    };

/** Referral information for a user. */
export interface Referral {
    /** Details about who referred this user, or `null` if no referrer exists. */
    referredBy:
        | null
        | {
            /** Referrer's address. */
            referrer: Hex;

            /** Referral code used. */
            code: string;
        };

    /** Cumulative volume traded. */
    cumVlm: string;

    /** Rewards earned but not yet claimed. */
    unclaimedRewards: string;

    /** Rewards claimed. */
    claimedRewards: string;

    /** Rewards builder. */
    builderRewards: string;

    /** Current state of the referrer. */
    referrerState:
        | {
            /** Referrer is ready to receive rewards. */
            stage: "ready";

            /** Data related to the referrer's referral program. */
            data: {
                /** Referral code assigned. */
                code: string;

                /** Summary of each user's activity. */
                referralStates: {
                    /** Cumulative volume traded. */
                    cumVlm: string;

                    /** Total fees rewarded to the referred user since being referred. */
                    cumRewardedFeesSinceReferred: string;

                    /** Total fees rewarded to the referrer from the referred user's trades. */
                    cumFeesRewardedToReferrer: string;

                    /** Timestamp when the referred user joined (in ms since epoch). */
                    timeJoined: number;

                    /** Address of the referred user. */
                    user: string;
                }[];
            };
        }
        | {
            /** Referrer needs to create a referral code to start receiving rewards. */
            stage: "needToCreateCode";
        }
        | {
            /** Referrer must complete a trade before receiving rewards. */
            stage: "needToTrade";

            /** Additional information about the required volume to start earning rewards. */
            data: {
                /** Required trading volume to activate rewards. */
                required: string;
            };
        };

    /** History of rewards. */
    rewardHistory: unknown[];
}

/** Context information for a spot asset. */
export interface SpotAssetCtx {
    /** Previous day's closing price. */
    prevDayPx: string;

    /** Daily volume. */
    dayNtlVlm: string;

    /** Mark price. */
    markPx: string;

    /** Index price. */
    midPx: string | null;

    /** Circulating supply. */
    circulatingSupply: string;

    /** Asset symbol. */
    coin: string;
}

/** Balance for a specific spot token. */
export interface SpotBalance {
    /** Asset symbol. */
    coin: string;

    /** Entry notional value. */
    entryNtl: string;

    /** Amount on hold. */
    hold: string;

    /** Unique identifier for the token. */
    token: number;

    /** Total balance. */
    total: string;
}

/** Balances for spot tokens. */
export interface SpotClearinghouseState {
    /** Balance for each token. */
    balances: SpotBalance[];
}

/** Metadata for spot assets. */
export interface SpotMeta {
    /** Universes available for trading. */
    universe: SpotUniverse[];

    /** Tokens available for trading. */
    tokens: SpotToken[];
}

/** Metadata and context information for each spot asset. */
export type SpotMetaAndAssetCtxs = [
    /** Metadata for assets. */
    SpotMeta,

    /** Context information for each asset. */
    SpotAssetCtx[],
];

/** User sub-accounts. */
export interface SubAccount {
    /** Name of the sub-account. */
    name: string;

    /** Address of the sub-account. */
    subAccountUser: Hex;

    /** Address of the master account. */
    master: Hex;

    /** Account summary for perpetual trading. */
    clearinghouseState: ClearinghouseState;

    /** Balances for spot tokens. */
    spotState: SpotClearinghouseState;
}

/** User fees. */
export interface UserFees {
    /** User's daily volume. */
    dailyUserVlm: {
        /** Date. */
        date: `${number}-${number}-${number}`;

        /** User's cross-trade volume. */
        userCross: string;

        /** User's add liquidity volume. */
        userAdd: string;

        /** Total exchange volume. */
        exchange: string;
    }[];

    /** Fee schedule. */
    feeSchedule: {
        /** Cross-trade fee rate. */
        cross: string;

        /** Add liquidity fee rate. */
        add: string;

        /** Fee tiers. */
        tiers: {
            /** VIP fee tiers. */
            vip: {
                /** Notional volume cutoff. */
                ntlCutoff: string;

                /** Cross-trade fee rate. */
                cross: string;

                /** Add liquidity fee rate. */
                add: string;
            }[];

            /** MM fee tiers. */
            mm: {
                /** Maker fraction cutoff. */
                makerFractionCutoff: string;

                /** Add liquidity fee rate. */
                add: string;
            }[];
        };

        /** Referral discount. */
        referralDiscount: string;
    };

    /** User's cross-trade rate. */
    userCrossRate: string;

    /** User's add liquidity rate. */
    userAddRate: string;

    /** Active referral discount. */
    activeReferralDiscount: string;
}

/** Trading token for spot. */
export interface SpotToken {
    /**
     * Name of the token.
     *
     * Note: Max length: 6 characters. No uniqueness constraints.
     */
    name: string;

    /** Minimum decimal places for order sizes. */
    szDecimals: number;

    /** Number of decimals in the token's smallest unit. */
    weiDecimals: number;

    /** Unique identifier for the token. */
    index: number;

    /** Token ID. */
    tokenId: Hex;

    /** Whether this token is the primary representation in the system. */
    isCanonical: boolean;

    /**  EVM contract details. */
    evmContract:
        | {
            /** Address of the contract. */
            address: Hex;

            /** Extra decimals in the token's smallest unit. */
            evm_extra_wei_decimals: number;
        }
        | null;

    /** Full display name of the token. */
    fullName: string | null;
}

/** Trading universe with specific parameters for spot. */
export interface SpotUniverse {
    /** Token indices included in this universe. */
    tokens: number[];

    /**
     * Name of the universe.
     *
     * Note: Max length: 6 characters. No uniqueness constraints.
     */
    name: string;

    /** Unique identifier. */
    index: number;

    /** Whether this token is the primary representation in the system. */
    isCanonical: boolean;
}

/** Trading universe with specific parameters for perpetual. */
export interface Universe {
    /** Minimum decimal places for order sizes. */
    szDecimals: number;

    /**
     * Name of the universe.
     *
     * Note: Max length: 6 characters. No uniqueness constraints.
     */
    name: string;

    /** Maximum allowed leverage. */
    maxLeverage: number;

    /** Whether only isolated margin trading is allowed. */
    onlyIsolated: boolean;
}

/** User's trade fill. */
export interface UserFill {
    /** Asset symbol. */
    coin: string;

    /** Price. */
    px: string;

    /** Size. */
    sz: string;

    /** Side of the order ("B" = Bid, "A" = Ask). */
    side: "B" | "A";

    /** Timestamp when the trade occurred (in ms since epoch). */
    time: number;

    /** Start position size. */
    startPosition: string;

    /** Direction indicator for frontend display. */
    dir: string;

    /** Realized PnL. */
    closedPnl: string;

    /** L1 transaction hash. */
    hash: Hex;

    /** Order ID. */
    oid: number;

    /** Whether the fill was a taker order. */
    crossed: boolean;

    /** Fee charged or rebate received (negative value indicates rebate). */
    fee: string;

    /** Unique identifier of the transaction for the specified amount, which was a partial filling of one order (oid). */
    tid: number;

    /** Client Order ID. */
    cloid?: Hex;

    /** Liquidation details. */
    liquidation?: {
        /** Address of the user who was liquidated. */
        liquidatedUser: Hex;

        /** Mark price at the time of liquidation. */
        markPx: string;

        /** Method of liquidation. */
        method: "market";
    };

    /** Token in which the fee is denominated (e.g., "USDC"). */
    feeToken: string;
}

/** User's funding ledger update. */
export interface UserFunding {
    /** Timestamp of the update (in ms since epoch). */
    time: number;

    /** L1 transaction hash. */
    hash: Hex;

    /** Details of the update. */
    delta: FundingDelta;
}

/** User's non-funding ledger update. */
export interface UserNonFundingLedgerUpdates {
    /** Timestamp of the update (in ms since epoch). */
    time: number;

    /** L1 transaction hash. */
    hash: Hex;

    /** Details of the update. */
    delta:
        | AccountClassTransferDelta
        | DepositDelta
        | InternalTransferDelta
        | SpotTransferDelta
        | SubAccountTransferDelta
        | VaultCreateDelta
        | VaultDistributionDelta
        | WithdrawDelta;
}

/** User's rate limits. */
export interface UserRateLimit {
    /** Cumulative trading volume. */
    cumVlm: string;

    /** Number of API requests used. */
    nRequestsUsed: number;

    /** Maximum allowed API requests. */
    nRequestsCap: number;
}

/** Transfer between spot and perpetual accounts. */
export interface AccountClassTransferDelta extends BaseDelta {
    /** Type of update. */
    type: "accountClassTransfer";

    /** Amount. */
    usdc: string;

    /** Whether the transfer is to the perpetual account. */
    toPerp: boolean;
}

/** Deposit to account. */
export interface DepositDelta extends BaseDelta {
    /** Type of update. */
    type: "deposit";

    /** Amount. */
    usdc: string;
}

/** Funding update. */
export interface FundingDelta extends BaseDelta {
    /** Type of update. */
    type: "funding";

    /** Asset symbol. */
    coin: string;

    /** Amount. */
    usdc: string;

    /** Signed position size. */
    szi: string;

    /** Funding rate. */
    fundingRate: string;

    /** Number of samples. */
    nSamples: number | null;
}

/** Internal transfer between accounts. */
export interface InternalTransferDelta extends BaseDelta {
    /** Type of update. */
    type: "internalTransfer";

    /** Amount. */
    usdc: string;

    /** Address of the user initiating the transfer. */
    user: Hex;

    /** Destination address. */
    destination: Hex;

    /** Fee. */
    fee: string;
}

/** Spot transfer between accounts. */
export interface SpotTransferDelta extends BaseDelta {
    /** Type of update. */
    type: "spotTransfer";

    /** Token. */
    token: string;

    /** Amount. */
    amount: string;

    /** Equivalent USDC value of the amount. */
    usdcValue: string;

    /** Address of the user initiating the transfer. */
    user: Hex;

    /** Destination address. */
    destination: Hex;

    /** Fee. */
    fee: string;
}

/** Transfer between sub-accounts. */
export interface SubAccountTransferDelta extends BaseDelta {
    /** Type of update. */
    type: "subAccountTransfer";

    /** Amount. */
    usdc: string;

    /** Address of the user initiating the transfer. */
    user: Hex;

    /** Destination address. */
    destination: Hex;
}

/** Creating a vault. */
export interface VaultCreateDelta extends BaseDelta {
    /** Type of update. */
    type: "vaultCreate";

    /** Address of the created vault. */
    vault: Hex;

    /** Initial amount allocated. */
    usdc: string;
}

/** Distribution event from a vault. */
export interface VaultDistributionDelta extends BaseDelta {
    /** Type of update. */
    type: "vaultDistribution";

    /** Address of the vault distributing funds. */
    vault: Hex;

    /** Amount. */
    usdc: string;
}

/** Withdrawal from account. */
export interface WithdrawDelta extends BaseDelta {
    /** Type of update. */
    type: "withdraw";

    /** Amount. */
    usdc: string;

    /** Unique request identifier. */
    nonce: number;

    /** Fee. */
    fee: string;
}

// ———————————————Requests———————————————

/**
 * Request mid coin prices.
 *
 * @returns {AllMids}
 * @see {@link https://hyperliquid.gitbook.io/hyperliquid-docs/for-developers/api/info-endpoint#retrieve-mids-for-all-actively-traded-coins|Hyperliquid GitBook}
 */
export interface AllMidsRequest extends BaseInfoRequest {
    /** Type of request. */
    type: "allMids";
}

/**
 * Request candlestick snapshots.
 *
 * @returns {CandleSnapshot[]}
 * @see {@link https://hyperliquid.gitbook.io/hyperliquid-docs/for-developers/api/info-endpoint#candle-snapshot|Hyperliquid GitBook}
 */
export interface CandleSnapshotRequest extends BaseInfoRequest {
    /** Type of request. */
    type: "candleSnapshot";

    /** Request parameters. */
    req: {
        /** Asset symbol. */
        coin: string;

        /** Time interval (e.g., "15m"). */
        interval: string;

        /** Start time (in ms since epoch). */
        startTime: number;

        /** End time (in ms since epoch). */
        endTime?: number;
    };
}

/**
 * Request clearinghouse state.
 *
 * @returns {ClearinghouseState}
 * @see {@link https://hyperliquid.gitbook.io/hyperliquid-docs/for-developers/api/info-endpoint/perpetuals#retrieve-users-perpetuals-account-summary|Hyperliquid GitBook}
 */
export interface ClearinghouseStateRequest extends BaseInfoRequest {
    /** Type of request. */
    type: "clearinghouseState";

    /** User's address. */
    user: Hex;
}

/**
 * Request frontend open orders.
 *
 * @returns {FrontendOpenOrder[]}
 * @see {@link https://hyperliquid.gitbook.io/hyperliquid-docs/for-developers/api/info-endpoint#retrieve-a-users-open-orders-with-additional-frontend-info|Hyperliquid GitBook}
 */
export interface FrontendOpenOrdersRequest extends BaseInfoRequest {
    /** Type of request. */
    type: "frontendOpenOrders";

    /** User's address. */
    user: Hex;
}

/**
 * Request funding history.
 *
 * @returns {FundingHistory[]}
 * @see {@link https://hyperliquid.gitbook.io/hyperliquid-docs/for-developers/api/info-endpoint/perpetuals#retrieve-historical-funding-rates|Hyperliquid GitBook}
 */
export interface FundingHistoryRequest extends BaseInfoRequest {
    /** Type of request. */
    type: "fundingHistory";

    /** Asset symbol. */
    coin: string;

    /** Start time (in ms since epoch). */
    startTime: number;

    /** End time (in ms since epoch). */
    endTime?: number;
}

/**
 * Request L2 order book ({@link L2Book}).
 *
 * @returns {L2Book}
 * @see {@link https://hyperliquid.gitbook.io/hyperliquid-docs/for-developers/api/info-endpoint#l2-book-snapshot|Hyperliquid GitBook}
 */
export interface L2BookRequest extends BaseInfoRequest {
    /** Type of request. */
    type: "l2Book";

    /** Asset symbol. */
    coin: string;

    /** Number of significant figures. */
    nSigFigs?: 2 | 3 | 4 | 5;

    /** Mantissa for aggregation (if nSigFigs is 5). */
    mantissa?: 2 | 5;
}

/**
 * Request builder fee approval.
 *
 * @returns {number}
 * @see {@link https://hyperliquid.gitbook.io/hyperliquid-docs/for-developers/api/info-endpoint#check-builder-fee-approval|Hyperliquid GitBook}
 */
export interface MaxBuilderFeeRequest extends BaseInfoRequest {
    /** Type of request. */
    type: "maxBuilderFee";

    /** User's address. */
    user: Hex;

    /** Builder address. */
    builder: Hex;
}

/**
 * Request trading metadata.
 *
 * @returns {Meta}
 * @see {@link https://hyperliquid.gitbook.io/hyperliquid-docs/for-developers/api/info-endpoint/perpetuals#retrieve-perpetuals-metadata|Hyperliquid GitBook}
 */
export interface MetaRequest extends BaseInfoRequest {
    /** Type of request. */
    type: "meta";
}

/**
 * Request metadata and asset contexts.
 *
 * @returns {MetaAndAssetCtxs}
 * @see {@link https://hyperliquid.gitbook.io/hyperliquid-docs/for-developers/api/info-endpoint/perpetuals#retrieve-perpetuals-asset-contexts-includes-mark-price-current-funding-open-interest-etc|Hyperliquid GitBook}
 */
export interface MetaAndAssetCtxsRequest extends BaseInfoRequest {
    /** Type of request. */
    type: "metaAndAssetCtxs";
}

/**
 * Request open orders.
 *
 * @returns {OpenOrder[]}
 * @see {@link https://hyperliquid.gitbook.io/hyperliquid-docs/for-developers/api/info-endpoint#retrieve-a-users-open-orders|Hyperliquid GitBook}
 */
export interface OpenOrdersRequest extends BaseInfoRequest {
    /** Type of request. */
    type: "openOrders";

    /** User's address. */
    user: Hex;
}

/**
 * Request order status.
 *
 * @returns {OrderStatusResponse}
 * @see {@link https://hyperliquid.gitbook.io/hyperliquid-docs/for-developers/api/info-endpoint#query-order-status-by-oid-or-cloid|Hyperliquid GitBook}
 */
export interface OrderStatusRequest extends BaseInfoRequest {
    /** Type of request. */
    type: "orderStatus";

    /** User's address. */
    user: Hex;

    /** Order ID or Client Order ID. */
    oid: number | Hex;
}

/**
 * Request user referral.
 *
 * @returns {Referral}
 * @see null
 */
export interface ReferralRequest extends BaseInfoRequest {
    /** Type of request. */
    type: "referral";

    /** User's address. */
    user: Hex;
}

/**
 * Request spot clearinghouse state.
 *
 * @returns {SpotClearinghouseState}
 * @see {@link https://hyperliquid.gitbook.io/hyperliquid-docs/for-developers/api/info-endpoint/spot#retrieve-a-users-token-balances|Hyperliquid GitBook}
 */
export interface SpotClearinghouseStateRequest extends BaseInfoRequest {
    /** Type of request. */
    type: "spotClearinghouseState";

    /** User's address. */
    user: Hex;
}

/**
 * Request spot trading metadata.
 *
 * @returns {SpotMeta}
 * @see {@link https://hyperliquid.gitbook.io/hyperliquid-docs/for-developers/api/info-endpoint/spot#retrieve-spot-metadata|Hyperliquid GitBook}
 */
export interface SpotMetaRequest extends BaseInfoRequest {
    /** Type of request. */
    type: "spotMeta";
}

/**
 * Request user sub-accounts.
 *
 * @returns {SubAccount[]}
 * @see null
 */
export interface SubAccountsRequest extends BaseInfoRequest {
    /** Type of request. */
    type: "subAccounts";

    /** User's address. */
    user: Hex;
}

/**
 * Request user fees.
 *
 * @returns {UserFees}
 * @see null
 */
export interface UserFeesRequest extends BaseInfoRequest {
    /** Type of request. */
    type: "userFees";

    /** User's address. */
    user: Hex;
}

/**
 * Request spot metadata and asset contexts.
 *
 * @returns {SpotMetaAndAssetCtxs}
 * @see {@link https://hyperliquid.gitbook.io/hyperliquid-docs/for-developers/api/info-endpoint/spot#retrieve-spot-asset-contexts|Hyperliquid GitBook}
 */
export interface SpotMetaAndAssetCtxsRequest extends BaseInfoRequest {
    /** Type of request. */
    type: "spotMetaAndAssetCtxs";
}

/**
 * Request user fills.
 *
 * @returns {UserFill[]}
 * @see {@link https://hyperliquid.gitbook.io/hyperliquid-docs/for-developers/api/info-endpoint#retrieve-a-users-fills|Hyperliquid GitBook}
 */
export interface UserFillsRequest extends BaseInfoRequest {
    /** Type of request. */
    type: "userFills";

    /** User's address. */
    user: Hex;
}

/**
 * Request user fills by time.
 *
 * @returns {UserFill[]}
 * @see {@link https://hyperliquid.gitbook.io/hyperliquid-docs/for-developers/api/info-endpoint#retrieve-a-users-fills-by-time|Hyperliquid GitBook}
 */
export interface UserFillsByTimeRequest extends BaseInfoRequest {
    /** Type of request. */
    type: "userFillsByTime";

    /** User's address. */
    user: Hex;

    /** Start time (in ms since epoch). */
    startTime: number;

    /** End time (in ms since epoch). */
    endTime?: number;
}

/**
 * Request user funding.
 *
 * @returns {UserFunding[]}
 * @see {@link https://hyperliquid.gitbook.io/hyperliquid-docs/for-developers/api/info-endpoint/perpetuals#retrieve-a-users-funding-history-or-non-funding-ledger-updates|Hyperliquid GitBook}
 */
export interface UserFundingRequest extends BaseInfoRequest {
    /** Type of request. */
    type: "userFunding";

    /** User's address. */
    user: Hex;

    /** Start time (in ms since epoch). */
    startTime: number;

    /** End time (in ms since epoch). */
    endTime?: number;
}

/**
 * Request user non-funding ledger updates.
 *
 * @returns {UserNonFundingLedgerUpdates[]}
 * @see {@link https://hyperliquid.gitbook.io/hyperliquid-docs/for-developers/api/info-endpoint/perpetuals#retrieve-a-users-funding-history-or-non-funding-ledger-updates|Hyperliquid GitBook}
 */
export interface UserNonFundingLedgerUpdatesRequest extends BaseInfoRequest {
    /** Type of request. */
    type: "userNonFundingLedgerUpdates";

    /** User's address. */
    user: Hex;

    /** Start time (in ms since epoch). */
    startTime: number;

    /** End time (in ms since epoch). */
    endTime?: number;
}

/**
 * Request user rate limits.
 *
 * @returns {UserRateLimit}
 * @see {@link https://hyperliquid.gitbook.io/hyperliquid-docs/for-developers/api/info-endpoint#query-user-rate-limits|Hyperliquid GitBook}
 */
export interface UserRateLimitRequest extends BaseInfoRequest {
    /** Type of request. */
    type: "userRateLimit";

    /** User's address. */
    user: Hex;
}
