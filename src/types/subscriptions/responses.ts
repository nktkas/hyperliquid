import type { Hex } from "../../base.ts";
import type { BlockDetails } from "../explorer/responses.ts";
import type {
    FundingUpdate,
    PerpsClearinghouseState,
    SpotClearinghouseState,
    UserFundingUpdate,
    UserNonFundingLedgerUpdate,
} from "../info/accounts.ts";
import type { AllMids, PerpsAssetCtx, PerpsMeta, SpotAssetCtx } from "../info/assets.ts";
import type { BookLevel, Fill, FrontendOrder, TwapHistory, TwapSliceFill, TwapState } from "../info/orders.ts";

/** Active perpetual asset context. */
export interface WsActiveAssetCtx {
    /** Asset symbol (e.g., BTC). */
    coin: string;
    /** Context information for the perpetual asset. */
    ctx: PerpsAssetCtx;
}

/** Active asset trading data. */
export interface WsActiveAssetData {
    /** User's address. */
    user: Hex;
    /** Asset symbol (e.g., BTC). */
    coin: string;
    /** Leverage configuration. */
    leverage:
        | {
            /** Leverage type. */
            type: "isolated";
            /** Leverage value used. */
            value: number;
            /** Amount of USD used (1 = 1$). */
            rawUsd: string;
        }
        | {
            /** Leverage type. */
            type: "cross";
            /** Leverage value used. */
            value: number;
        };
    /** Maximum trade size range [min, max]. */
    maxTradeSzs: [string, string];
    /** Available to trade range [min, max]. */
    availableToTrade: [string, string];
    /** Mark price. */
    markPx: string;
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

/** User's notifications. */
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
    /** Trade price. */
    px: string;
    /** Trade size. */
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

/** User's event. */
export type WsUserEvent =
    | WsUserEventFill
    | WsUserEventFunding
    | WsUserEventLiquidation
    | WsUserEventNonUserCancel
    | WsUserEventTwapHistory
    | WsUserEventTwapSliceFills;

/** User's fill event. */
export interface WsUserEventFill {
    /** Array of trade fills. */
    fills: Fill[];
}

/** User's funding event. */
export interface WsUserEventFunding {
    /** Funding update details. */
    funding: Omit<FundingUpdate, "type">;
}

/** User's liquidation event. */
export interface WsUserEventLiquidation {
    /** Liquidation event details. */
    liquidation: {
        /** Unique liquidation ID. */
        lid: number;
        /** Address of the liquidator. */
        liquidator: Hex;
        /** Address of the liquidated user. */
        liquidated_user: Hex;
        /** Notional position size that was liquidated. */
        liquidated_ntl_pos: string;
        /** Account value at time of liquidation. */
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

/** User's TWAP history event. */
export interface WsUserEventTwapHistory {
    /** Array of historical TWAP fills. */
    twapHistory: TwapHistory[];
}

/** User's TWAP slice fills event. */
export interface WsUserEventTwapSliceFills {
    /** Array of TWAP slice fills. */
    twapSliceFills: TwapSliceFill[];
}

/** User's fills. */
export interface WsUserFills {
    /** User's address. */
    user: Hex;
    /** Array of fill events. */
    fills: Fill[];
    /** Whether this is an initial snapshot. */
    isSnapshot?: true;
}

/** User's fundings. */
export interface WsUserFundings {
    /** User's address. */
    user: Hex;
    /** Array of funding events. */
    fundings: (Omit<FundingUpdate, "type"> & Pick<UserFundingUpdate, "time">)[];
    /** Whether this is an initial snapshot. */
    isSnapshot?: true;
}

/** User's non-funding ledger updates. */
export interface WsUserNonFundingLedgerUpdates {
    /** User's address. */
    user: Hex;
    /** Array of non-funding ledger updates. */
    nonFundingLedgerUpdates: UserNonFundingLedgerUpdate[];
    /** Whether this is an initial snapshot. */
    isSnapshot?: true;
}

/** User's TWAP history. */
export interface WsUserTwapHistory {
    /** User's address. */
    user: Hex;
    /** Array of historical TWAP fills. */
    history: TwapHistory[];
    /** Whether this is an initial snapshot. */
    isSnapshot?: true;
}

/** User's TWAP slice fills. */
export interface WsUserTwapSliceFills {
    /** User's address. */
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
    /** Total equity in vaults. */
    totalVaultEquity: string;
    /** User's open orders with frontend information. */
    openOrders: FrontendOrder[];
    /** Agent's address if one exists. */
    agentAddress: Hex | null;
    /** Timestamp until which the agent is valid. */
    agentValidUntil: number | null;
    /** Cumulative ledger value. */
    cumLedger: string;
    /** Metadata for perpetual assets. */
    meta: PerpsMeta;
    /** Context information for perpetual assets. */
    assetCtxs: PerpsAssetCtx[];
    /** Server timestamp (in ms since epoch). */
    serverTime: number;
    /** Whether this account is a vault. */
    isVault: boolean;
    /** User's address. */
    user: Hex;
    /** TWAP states. */
    twapStates: [number, TwapState][];
    /** Account summary for spot trading. */
    spotState: SpotClearinghouseState;
    /** Context information for spot assets. */
    spotAssetCtxs: SpotAssetCtx[];
    /** Whether the user has opted out of spot dusting. */
    optOutOfSpotDusting?: true;
    /** Assets currently at their open interest cap. */
    perpsAtOpenInterestCap?: string[];
}
