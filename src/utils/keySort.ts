import type {
    BatchModifyRequest,
    CancelByCloidRequest,
    CancelRequest,
    CreateSubAccountRequest,
    ModifyRequest,
    OrderRequest,
    ScheduleCancelRequest,
    SetReferrerRequest,
    SubAccountTransferRequest,
    TwapCancelRequest,
    TwapOrderRequest,
    UpdateIsolatedMarginRequest,
    UpdateLeverageRequest,
    VaultTransferRequest,
} from "../types/exchange/requests.d.ts";

// Union type of all possible action types
type ActionType =
    | BatchModifyRequest["action"]
    | CancelRequest["action"]
    | CancelByCloidRequest["action"]
    | CreateSubAccountRequest["action"]
    | ModifyRequest["action"]
    | OrderRequest["action"]
    | ScheduleCancelRequest["action"]
    | SetReferrerRequest["action"]
    | SubAccountTransferRequest["action"]
    | TwapCancelRequest["action"]
    | TwapOrderRequest["action"]
    | UpdateIsolatedMarginRequest["action"]
    | UpdateLeverageRequest["action"]
    | VaultTransferRequest["action"];

/**
 * Sort the keys of the action object to then create the correct action hash.
 * @param action - The action object to sort.
 * @returns A new sorted action object.
 */
export function sortActionKeys(action: BatchModifyRequest["action"]): BatchModifyRequest["action"];
export function sortActionKeys(action: CancelRequest["action"]): CancelRequest["action"];
export function sortActionKeys(action: CancelByCloidRequest["action"]): CancelByCloidRequest["action"];
export function sortActionKeys(action: CreateSubAccountRequest["action"]): CreateSubAccountRequest["action"];
export function sortActionKeys(action: ModifyRequest["action"]): ModifyRequest["action"];
export function sortActionKeys(action: OrderRequest["action"]): OrderRequest["action"];
export function sortActionKeys(action: ScheduleCancelRequest["action"]): ScheduleCancelRequest["action"];
export function sortActionKeys(action: SetReferrerRequest["action"]): SetReferrerRequest["action"];
export function sortActionKeys(action: SubAccountTransferRequest["action"]): SubAccountTransferRequest["action"];
export function sortActionKeys(action: TwapCancelRequest["action"]): TwapCancelRequest["action"];
export function sortActionKeys(action: TwapOrderRequest["action"]): TwapOrderRequest["action"];
export function sortActionKeys(action: UpdateIsolatedMarginRequest["action"]): UpdateIsolatedMarginRequest["action"];
export function sortActionKeys(action: UpdateLeverageRequest["action"]): UpdateLeverageRequest["action"];
export function sortActionKeys(action: VaultTransferRequest["action"]): VaultTransferRequest["action"];
export function sortActionKeys(action: ActionType): ActionType {
    let sortedAction: ActionType;
    if (action.type === "batchModify") {
        sortedAction = {
            type: action.type,
            modifies: action.modifies.map((modify) => ({
                oid: modify.oid,
                order: {
                    a: modify.order.a,
                    b: modify.order.b,
                    p: modify.order.p,
                    s: modify.order.s,
                    r: modify.order.r,
                    t: modify.order.t,
                    c: modify.order.c,
                },
            })),
        };
    } else if (action.type === "cancel") {
        sortedAction = {
            type: action.type,
            cancels: action.cancels.map((cancel) => ({
                a: cancel.a,
                o: cancel.o,
            })),
        };
    } else if (action.type === "cancelByCloid") {
        sortedAction = {
            type: action.type,
            cancels: action.cancels.map((cancel) => ({
                asset: cancel.asset,
                cloid: cancel.cloid,
            })),
        };
    } else if (action.type === "createSubAccount") {
        sortedAction = {
            type: action.type,
            name: action.name,
        };
    } else if (action.type === "modify") {
        sortedAction = {
            type: action.type,
            oid: action.oid,
            order: {
                a: action.order.a,
                b: action.order.b,
                p: action.order.p,
                s: action.order.s,
                r: action.order.r,
                t: "limit" in action.order.t
                    ? {
                        limit: {
                            tif: action.order.t.limit.tif,
                        },
                    }
                    : {
                        trigger: {
                            isMarket: action.order.t.trigger.isMarket,
                            triggerPx: action.order.t.trigger.triggerPx,
                            tpsl: action.order.t.trigger.tpsl,
                        },
                    },
                c: action.order.c,
            },
        };
    } else if (action.type === "order") {
        sortedAction = {
            type: action.type,
            orders: action.orders.map((order) => ({
                a: order.a,
                b: order.b,
                p: order.p,
                s: order.s,
                r: order.r,
                t: "limit" in order.t
                    ? {
                        limit: {
                            tif: order.t.limit.tif,
                        },
                    }
                    : {
                        trigger: {
                            isMarket: order.t.trigger.isMarket,
                            triggerPx: order.t.trigger.triggerPx,
                            tpsl: order.t.trigger.tpsl,
                        },
                    },
                c: order.c,
            })),
            grouping: action.grouping,
            builder: action.builder
                ? {
                    b: action.builder.b,
                    f: action.builder.f,
                }
                : action.builder,
        };
    } else if (action.type === "scheduleCancel") {
        sortedAction = {
            type: action.type,
            time: action.time,
        };
    } else if (action.type === "setReferrer") {
        sortedAction = {
            type: action.type,
            code: action.code,
        };
    } else if (action.type === "subAccountTransfer") {
        sortedAction = {
            type: action.type,
            subAccountUser: action.subAccountUser,
            isDeposit: action.isDeposit,
            usd: action.usd,
        };
    } else if (action.type === "twapCancel") {
        sortedAction = {
            type: action.type,
            a: action.a,
            t: action.t,
        };
    } else if (action.type === "twapOrder") {
        sortedAction = {
            type: action.type,
            twap: {
                a: action.twap.a,
                b: action.twap.b,
                s: action.twap.s,
                r: action.twap.r,
                m: action.twap.m,
                t: action.twap.t,
            },
        };
    } else if (action.type === "updateIsolatedMargin") {
        sortedAction = {
            type: action.type,
            asset: action.asset,
            isBuy: action.isBuy,
            ntli: action.ntli,
        };
    } else if (action.type === "updateLeverage") {
        sortedAction = {
            type: action.type,
            asset: action.asset,
            isCross: action.isCross,
            leverage: action.leverage,
        };
    } else {
        sortedAction = {
            type: action.type,
            vaultAddress: action.vaultAddress,
            isDeposit: action.isDeposit,
            usd: action.usd,
        };
    }
    return removeUndefinedValues(sortedAction);
}

/**
 * Remove undefined values from an object.
 * @param obj - The object to remove undefined values from.
 * @returns A new object with undefined values removed.
 */
function removeUndefinedValues<T>(obj: T): T {
    if (Array.isArray(obj)) {
        return obj.map(removeUndefinedValues) as T;
    } else if (obj && typeof obj === "object") {
        return Object.entries(obj).reduce((acc, [key, val]) => {
            if (val === undefined) {
                return acc;
            }
            return {
                ...acc,
                [key]: removeUndefinedValues(val),
            };
        }, {} as T);
    } else {
        return obj;
    }
}
