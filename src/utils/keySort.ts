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
import type { OrderParms } from "../types/exchange/common.d.ts";

/** Record of action types and their corresponding sorters. */
// NOTE: An object after sorting must not contain undefined values.
export const sorters = {
    batchModify: (action: BatchModifyRequest["action"]): BatchModifyRequest["action"] => ({
        type: action.type,
        modifies: action.modifies.map((m) => ({
            oid: m.oid,
            order: sorters._order(m.order),
        })),
    }),
    cancel: (action: CancelRequest["action"]): CancelRequest["action"] => ({
        type: action.type,
        cancels: action.cancels.map((c) => ({
            a: c.a,
            o: c.o,
        })),
    }),
    cancelByCloid: (action: CancelByCloidRequest["action"]): CancelByCloidRequest["action"] => ({
        type: action.type,
        cancels: action.cancels.map((cancel) => ({
            asset: cancel.asset,
            cloid: cancel.cloid,
        })),
    }),
    createSubAccount: (action: CreateSubAccountRequest["action"]): CreateSubAccountRequest["action"] => ({
        type: action.type,
        name: action.name,
    }),
    modify: (action: ModifyRequest["action"]): ModifyRequest["action"] => ({
        type: action.type,
        oid: action.oid,
        order: sorters._order(action.order),
    }),
    order: (action: OrderRequest["action"]): OrderRequest["action"] => {
        const sortedAction = {
            type: action.type,
            orders: action.orders.map(sorters._order),
            grouping: action.grouping,
            builder: action.builder ? { b: action.builder.b, f: action.builder.f } : undefined,
        };
        if (action.builder === undefined) delete sortedAction.builder;
        return sortedAction;
    },
    scheduleCancel: (action: ScheduleCancelRequest["action"]): ScheduleCancelRequest["action"] => {
        const sortedAction = {
            type: action.type,
            time: action.time,
        };
        if (action.time === undefined) delete sortedAction.time;
        return sortedAction;
    },
    setReferrer: (action: SetReferrerRequest["action"]): SetReferrerRequest["action"] => ({
        type: action.type,
        code: action.code,
    }),
    subAccountTransfer: (action: SubAccountTransferRequest["action"]): SubAccountTransferRequest["action"] => ({
        type: action.type,
        subAccountUser: action.subAccountUser,
        isDeposit: action.isDeposit,
        usd: action.usd,
    }),
    twapCancel: (action: TwapCancelRequest["action"]): TwapCancelRequest["action"] => ({
        type: action.type,
        a: action.a,
        t: action.t,
    }),
    twapOrder: (action: TwapOrderRequest["action"]): TwapOrderRequest["action"] => ({
        type: action.type,
        twap: {
            a: action.twap.a,
            b: action.twap.b,
            s: action.twap.s,
            r: action.twap.r,
            m: action.twap.m,
            t: action.twap.t,
        },
    }),
    updateIsolatedMargin: (action: UpdateIsolatedMarginRequest["action"]): UpdateIsolatedMarginRequest["action"] => ({
        type: action.type,
        asset: action.asset,
        isBuy: action.isBuy,
        ntli: action.ntli,
    }),
    updateLeverage: (action: UpdateLeverageRequest["action"]): UpdateLeverageRequest["action"] => ({
        type: action.type,
        asset: action.asset,
        isCross: action.isCross,
        leverage: action.leverage,
    }),
    vaultTransfer: (action: VaultTransferRequest["action"]): VaultTransferRequest["action"] => ({
        type: action.type,
        vaultAddress: action.vaultAddress,
        isDeposit: action.isDeposit,
        usd: action.usd,
    }),

    _order: (order: OrderParms): OrderParms => {
        const sortedOrder = {
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
        };
        if (order.c === undefined) delete sortedOrder.c;
        return sortedOrder;
    },
};
