import type { Hex } from "../mod.js";
import type { BlockDetails } from "../explorer/responses.js";
import type {
    FundingUpdate,
    PerpsClearinghouseState,
    SpotClearinghouseState,
    UserFundingUpdate,
    UserNonFundingLedgerUpdate,
} from "../info/accounts.js";
import type { AllMids, PerpsAssetCtx, PerpsMeta, SpotAssetCtx } from "../info/assets.js";
import type { BookLevel, Fill, FrontendOrder, TwapHistory, TwapSliceFill, TwapState } from "../info/orders.js";

/** Active perpetual asset context. */
export interface WsActiveAssetCtx {
    /** Asset symbol (e.g., BTC). */
    coin: string;
    /** Context information for the perpetual asset. */
    ctx: PerpsAssetCtx;
}

/** Active spot asset context. */
export interface WsActiveSpotAssetCtx {
    /** Asset symbol (e.g., BTC). */
    coin: string;
    /** Context information for the spot asset. */
    ctx: SpotAssetCtx;
}

/** Mid prices for all assets. */
export interface WsAllMids {
    /** Mapping of coin symbols to mid prices. */
    mids: AllMids;
}

/** Best Bid and Offer. */
export interface WsBbo {
    /** Asset symbol (e.g., BTC). */
    coin: string;
    /** Time of the BBO update (in ms since epoch). */
    time: number;
    /** Best bid and offer tuple [bid, offer], either can be undefined if unavailable. */
    bbo: [BookLevel | undefined, BookLevel | undefined];
}

/** Block details. */
export type WsBlockDetails = Omit<BlockDetails, "txs">;

/** User notifications. */
export interface WsNotification {
    /** Notification content. */
    notification: string;
}

/** Trade information. */
export interface WsTrade {
    /** Asset symbol (e.g., BTC). */
    coin: string;
    /** Trade side ("B" = Bid/Buy, "A" = Ask/Sell). */
    side: "B" | "A";
    /**
     * Trade price.
     * @pattern ^[0-9]+(\.[0-9]+)?$
     */
    px: string;
    /**
     * Trade size.
     * @pattern ^[0-9]+(\.[0-9]+)?$
     */
    sz: string;
    /** Trade timestamp (in ms since epoch). */
    time: number;
    /** Transaction hash. */
    hash: Hex;
    /** Trade ID. */
    tid: number;
    /** Addresses of users involved in the trade [Maker, Taker]. */
    users: [Hex, Hex];
}

/** User event. */
export type WsUserEvent =
    | WsUserEventFill
    | WsUserEventFunding
    | WsUserEventLiquidation
    | WsUserEventNonUserCancel
    | WsUserEventTwapHistory
    | WsUserEventTwapSliceFills;

/** User fill event. */
export interface WsUserEventFill {
    /** Array of trade fills. */
    fills: Fill[];
}

/** User funding event. */
export interface WsUserEventFunding {
    /** Funding update details. */
    funding: Omit<FundingUpdate, "type">;
}

/** User liquidation event. */
export interface WsUserEventLiquidation {
    /** Liquidation event details. */
    liquidation: {
        /** Unique liquidation ID. */
        lid: number;
        /** Address of the liquidator. */
        liquidator: Hex;
        /** Address of the liquidated user. */
        liquidated_user: Hex;
        /**
         * Notional position size that was liquidated.
         * @pattern ^[0-9]+(\.[0-9]+)?$
         */
        liquidated_ntl_pos: string;
        /**
         * Account value at time of liquidation.
         * @pattern ^[0-9]+(\.[0-9]+)?$
         */
        liquidated_account_value: string;
    };
}

/** Non-user initiated order cancellation event. */
export interface WsUserEventNonUserCancel {
    /** Array of cancelled orders not initiated by the user. */
    nonUserCancel: {
        /** Asset symbol (e.g., BTC). */
        coin: string;
        /** Order ID. */
        oid: number;
    }[];
}

/** User TWAP history event. */
export interface WsUserEventTwapHistory {
    /** Array of historical TWAP fills. */
    twapHistory: TwapHistory[];
}

/** User TWAP slice fills event. */
export interface WsUserEventTwapSliceFills {
    /** Array of TWAP slice fills. */
    twapSliceFills: TwapSliceFill[];
}

/** User fills. */
export interface WsUserFills {
    /** User address. */
    user: Hex;
    /** Array of fill events. */
    fills: Fill[];
    /** Whether this is an initial snapshot. */
    isSnapshot?: true;
}

/** User fundings. */
export interface WsUserFundings {
    /** User address. */
    user: Hex;
    /** Array of funding events. */
    fundings: (Omit<FundingUpdate, "type"> & Pick<UserFundingUpdate, "time">)[];
    /** Whether this is an initial snapshot. */
    isSnapshot?: true;
}

/** User non-funding ledger updates. */
export interface WsUserNonFundingLedgerUpdates {
    /** User address. */
    user: Hex;
    /** Array of non-funding ledger updates. */
    nonFundingLedgerUpdates: UserNonFundingLedgerUpdate[];
    /** Whether this is an initial snapshot. */
    isSnapshot?: true;
}

/** User TWAP history. */
export interface WsUserTwapHistory {
    /** User address. */
    user: Hex;
    /** Array of historical TWAP fills. */
    history: TwapHistory[];
    /** Whether this is an initial snapshot. */
    isSnapshot?: true;
}

/** User TWAP slice fills. */
export interface WsUserTwapSliceFills {
    /** User address. */
    user: Hex;
    /** Array of TWAP slice fills. */
    twapSliceFills: TwapSliceFill[];
    /** Whether this is an initial snapshot. */
    isSnapshot?: true;
}

/** Comprehensive user and market data. */
export interface WsWebData2 {
    /** Account summary for perpetual trading. */
    clearinghouseState: PerpsClearinghouseState;
    /** Leading vaults information. */
    leadingVaults: {
        /** Address of the vault. */
        address: Hex;
        /** Name of the vault. */
        name: string;
    }[];
    /**
     * Total equity in vaults.
     * @pattern ^[0-9]+(\.[0-9]+)?$
     */
    totalVaultEquity: string;
    /** User open orders with frontend information. */
    openOrders: FrontendOrder[];
    /** Agent address if one exists. */
    agentAddress: Hex | null;
    /** Timestamp until which the agent is valid. */
    agentValidUntil: number | null;
    /**
     * Cumulative ledger value.
     * @pattern ^[0-9]+(\.[0-9]+)?$
     */
    cumLedger: string;
    /** Metadata for perpetual assets. */
    meta: PerpsMeta;
    /** Context information for perpetual assets. */
    assetCtxs: PerpsAssetCtx[];
    /** Server timestamp (in ms since epoch). */
    serverTime: number;
    /** Whether this account is a vault. */
    isVault: boolean;
    /** User address. */
    user: Hex;
    /** TWAP states. */
    twapStates: [number, TwapState][];
    /** Account summary for spot trading. */
    spotState?: SpotClearinghouseState;
    /** Context information for spot assets. */
    spotAssetCtxs: SpotAssetCtx[];
    /** Whether the user has opted out of spot dusting. */
    optOutOfSpotDusting?: true;
    /** Assets currently at their open interest cap. */
    perpsAtOpenInterestCap?: string[];
}
