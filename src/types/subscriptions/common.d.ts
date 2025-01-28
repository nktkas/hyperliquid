import type { Hex } from "../common.d.ts";
import type {
    FundingUpdate,
    PerpsClearinghouseState,
    SpotClearinghouseState,
    UserFundingUpdate,
    UserNonFundingLedgerUpdate,
} from "../info/accounts.d.ts";
import type { AllMids, PerpsAssetCtx, PerpsMeta, SpotAssetCtx } from "../info/assets.d.ts";
import type {
    Fill,
    FrontendOrder,
    Order,
    OrderProcessingStatus,
    TwapHistory,
    TwapSliceFill,
    TwapState,
} from "../info/orders.d.ts";

/** WebSocket message containing active perpetual asset context. */
export interface WsActiveAssetCtx {
    /** Asset symbol. */
    coin: string;
    /** Context information for the perpetual asset. */
    ctx: PerpsAssetCtx;
}

/** WebSocket message containing active asset trading data. */
export interface WsActiveAssetData {
    /** Available to trade range [min, max]. */
    availableToTrade: [string, string];
    /** Asset symbol. */
    coin: string;
    /** Leverage configuration. */
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
    /** Maximum trade size range [min, max]. */
    maxTradeSzs: [string, string];
    /** User's address. */
    user: Hex;
}

/** WebSocket message containing active spot asset context. */
export interface WsActiveSpotAssetCtx {
    /** Asset symbol. */
    coin: string;
    /** Context information for the spot asset. */
    ctx: SpotAssetCtx;
}

/** WebSocket message containing mid prices for all assets. */
export interface WsAllMids {
    /** Mid prices for all assets. */
    mids: AllMids;
}

/** WebSocket message containing user notifications. */
export interface WsNotification {
    /** Notification content. */
    notification: string;
}

/** WebSocket message containing order information. */
export interface WsOrder {
    /** Order details. */
    order: Order;
    /** Order processing status. */
    status: OrderProcessingStatus;
    /** Status timestamp (in ms since epoch). */
    statusTimestamp: number;
}

/** WebSocket message containing trade information. */
export interface WsTrade {
    /** Asset symbol. */
    coin: string;
    /** Transaction hash. */
    hash: string;
    /** Trade price. */
    px: string;
    /** Trade side. */
    side: string;
    /** Trade size. */
    sz: string;
    /** Trade ID. */
    tid: number;
    /** Trade timestamp (in ms since epoch). */
    time: number;
    /** Addresses of users involved in the trade. */
    users: [Hex, Hex];
}

/** WebSocket message containing user event. */
export type WsUserEvent =
    | WsUserEventFill
    | WsUserEventFunding
    | WsUserEventLiquidation
    | WsUserEventNonUserCancel;

/** WebSocket message containing fill event information. */
export interface WsUserEventFill {
    /** Array of trade fills. */
    fills: Fill[];
}

/** WebSocket message containing funding event information. */
export interface WsUserEventFunding {
    /** Funding update details. */
    funding: Omit<FundingUpdate, "type">;
}

/** WebSocket message containing liquidation event information. */
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

/** WebSocket message containing non-user initiated order cancellation information. */
export interface WsUserEventNonUserCancel {
    /** Array of cancelled orders not initiated by the user. */
    nonUserCancel: {
        /** Asset symbol. */
        coin: string;
        /** Order ID. */
        oid: number;
    }[];
}

/** WebSocket message containing user's fills. */
export interface WsUserFills {
    /** User's address. */
    user: Hex;
    /** Array of fill events. */
    fills: Fill[];
    /** Whether this is an initial snapshot. */
    isSnapshot?: true;
}

/** WebSocket message containing user's fundings. */
export interface WsUserFundings {
    /** User's address. */
    user: Hex;
    /** Array of funding events. */
    fundings: (Omit<FundingUpdate, "type"> & Pick<UserFundingUpdate, "time">)[];
    /** Whether this is an initial snapshot. */
    isSnapshot?: true;
}

/** WebSocket message containing user's non-funding ledger updates. */
export interface WsUserNonFundingLedgerUpdates {
    /** User's address. */
    user: Hex;
    /** Array of non-funding ledger updates. */
    nonFundingLedgerUpdates: UserNonFundingLedgerUpdate[];
    /** Whether this is an initial snapshot. */
    isSnapshot?: true;
}

/** WebSocket message containing user's TWAP history. */
export interface WsUserTwapHistory {
    /** User's address. */
    user: Hex;
    /** Array of historical TWAP fills. */
    history: TwapHistory[];
    /** Whether this is an initial snapshot. */
    isSnapshot?: true;
}

/** WebSocket message containing user's TWAP slice fills. */
export interface WsUserTwapSliceFills {
    /** User's address. */
    user: Hex;
    /** Array of TWAP slice fills. */
    twapSliceFills: TwapSliceFill[];
    /** Whether this is an initial snapshot. */
    isSnapshot?: true;
}

/** WebSocket message containing comprehensive user and market data. */
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
    /** Assets currently at their open interest cap. */
    perpsAtOpenInterestCap?: string[];
}
