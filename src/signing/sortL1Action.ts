import type {
    BatchModifyRequest,
    CancelByCloidRequest,
    CancelRequest,
    ClaimRewardsRequest,
    CreateSubAccountRequest,
    CreateVaultRequest,
    CSignerActionRequest_JailSelf,
    CSignerActionRequest_UnjailSelf,
    CValidatorActionRequest_ChangeProfile,
    CValidatorActionRequest_Register,
    CValidatorActionRequest_Unregister,
    EvmUserModifyRequest,
    ModifyRequest,
    MultiSigRequest,
    OrderRequest,
    PerpDeployRequest_RegisterAsset,
    PerpDeployRequest_SetOracle,
    RegisterReferrerRequest,
    ReserveRequestWeightRequest,
    ScheduleCancelRequest,
    SetDisplayNameRequest,
    SetReferrerRequest,
    SpotDeployRequest_Genesis,
    SpotDeployRequest_RegisterHyperliquidity,
    SpotDeployRequest_RegisterSpot,
    SpotDeployRequest_RegisterToken2,
    SpotDeployRequest_SetDeployerTradingFeeShare,
    SpotDeployRequest_UserGenesis,
    SpotUserRequest,
    SubAccountSpotTransferRequest,
    SubAccountTransferRequest,
    TwapCancelRequest,
    TwapOrderRequest,
    UpdateIsolatedMarginRequest,
    UpdateLeverageRequest,
    VaultDistributeRequest,
    VaultModifyRequest,
    VaultTransferRequest,
} from "../types/exchange/requests.ts";

export function sortBatchModify<T extends BatchModifyRequest["action"]>(action: T): T {
    return {
        type: action.type,
        modifies: action.modifies.map((modify) => {
            const sortedModify = {
                oid: modify.oid,
                order: {
                    a: modify.order.a,
                    b: modify.order.b,
                    p: formatDecimal(modify.order.p),
                    s: formatDecimal(modify.order.s),
                    r: modify.order.r,
                    t: "limit" in modify.order.t
                        ? {
                            limit: {
                                tif: modify.order.t.limit.tif,
                            },
                        }
                        : {
                            trigger: {
                                isMarket: modify.order.t.trigger.isMarket,
                                triggerPx: formatDecimal(modify.order.t.trigger.triggerPx),
                                tpsl: modify.order.t.trigger.tpsl,
                            },
                        },
                    c: modify.order.c,
                },
            };
            if (sortedModify.order.c === undefined) delete sortedModify.order.c;
            return sortedModify;
        }),
    } as T;
}

export function sortCancel<T extends CancelRequest["action"]>(action: T): T {
    return {
        type: action.type,
        cancels: action.cancels.map((cancel) => ({
            a: cancel.a,
            o: cancel.o,
        })),
    } as T;
}

export function sortCancelByCloid<T extends CancelByCloidRequest["action"]>(action: T): T {
    return {
        type: action.type,
        cancels: action.cancels.map((cancel) => ({
            asset: cancel.asset,
            cloid: cancel.cloid,
        })),
    } as T;
}

export function sortClaimRewards<T extends ClaimRewardsRequest["action"]>(action: T): T {
    return {
        type: action.type,
    } as T;
}

export function sortCreateSubAccount<T extends CreateSubAccountRequest["action"]>(action: T): T {
    return {
        type: action.type,
        name: action.name,
    } as T;
}

export function sortCreateVault<T extends CreateVaultRequest["action"]>(action: T): T {
    return {
        type: action.type,
        name: action.name,
        description: action.description,
        initialUsd: action.initialUsd,
        nonce: action.nonce,
    } as T;
}

export function sortCSignerAction<
    T extends
        | CSignerActionRequest_JailSelf["action"]
        | CSignerActionRequest_UnjailSelf["action"],
>(action: T): T {
    if ("jailSelf" in action) {
        return {
            type: action.type,
            jailSelf: action.jailSelf,
        } as T;
    } else {
        return {
            type: action.type,
            unjailSelf: action.unjailSelf,
        } as T;
    }
}

export function sortCValidatorAction<
    T extends
        | CValidatorActionRequest_ChangeProfile["action"]
        | CValidatorActionRequest_Register["action"]
        | CValidatorActionRequest_Unregister["action"],
>(action: T): T {
    if ("changeProfile" in action) {
        return {
            type: action.type,
            changeProfile: {
                node_ip: action.changeProfile.node_ip ?? null,
                name: action.changeProfile.name ?? null,
                description: action.changeProfile.description ?? null,
                unjailed: action.changeProfile.unjailed,
                disable_delegations: action.changeProfile.disable_delegations ?? null,
                commission_bps: action.changeProfile.commission_bps ?? null,
                signer: action.changeProfile.signer?.toLowerCase() ?? null,
            },
        } as T;
    } else if ("register" in action) {
        return {
            type: action.type,
            register: {
                profile: {
                    node_ip: {
                        Ip: action.register.profile.node_ip.Ip,
                    },
                    name: action.register.profile.name,
                    description: action.register.profile.description,
                    delegations_disabled: action.register.profile.delegations_disabled,
                    commission_bps: action.register.profile.commission_bps,
                    signer: action.register.profile.signer?.toLowerCase(),
                },
                unjailed: action.register.unjailed,
                initial_wei: action.register.initial_wei,
            },
        } as T;
    } else { // "unregister" in action
        return {
            type: action.type,
            unregister: action.unregister,
        } as T;
    }
}

export function sortEvmUserModify<T extends EvmUserModifyRequest["action"]>(action: T): T {
    return {
        type: action.type,
        usingBigBlocks: action.usingBigBlocks,
    } as T;
}

export function sortModify<T extends ModifyRequest["action"]>(action: T): T {
    const sortedAction = {
        type: action.type,
        oid: action.oid,
        order: {
            a: action.order.a,
            b: action.order.b,
            p: formatDecimal(action.order.p),
            s: formatDecimal(action.order.s),
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
                        triggerPx: formatDecimal(action.order.t.trigger.triggerPx),
                        tpsl: action.order.t.trigger.tpsl,
                    },
                },
            c: action.order.c,
        },
    } as T;
    if (sortedAction.order.c === undefined) delete sortedAction.order.c;
    return sortedAction;
}

export function sortMultiSig<T extends MultiSigRequest["action"]>(action: T): T {
    return {
        type: action.type,
        signatureChainId: action.signatureChainId,
        signatures: action.signatures.map((signature) => ({
            r: signature.r.replace(/^0x0+/, "0x").toLowerCase(),
            s: signature.s.replace(/^0x0+/, "0x").toLowerCase(),
            v: signature.v,
        })),
        payload: {
            multiSigUser: action.payload.multiSigUser.toLowerCase(),
            outerSigner: action.payload.outerSigner.toLowerCase(),
            action: action.payload.action,
        },
    } as T;
}

export function sortOrder<T extends OrderRequest["action"]>(action: T): T {
    const sortedAction = {
        type: action.type,
        orders: action.orders.map((order) => {
            const sortedOrder = {
                a: order.a,
                b: order.b,
                p: formatDecimal(order.p),
                s: formatDecimal(order.s),
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
                            triggerPx: formatDecimal(order.t.trigger.triggerPx),
                            tpsl: order.t.trigger.tpsl,
                        },
                    },
                c: order.c,
            };
            if (order.c === undefined) delete sortedOrder.c;
            return sortedOrder;
        }),
        grouping: action.grouping,
        builder: action.builder
            ? {
                b: action.builder.b.toLowerCase(),
                f: action.builder.f,
            }
            : action.builder,
    } as T;
    if (sortedAction.builder === undefined) delete sortedAction.builder;
    return sortedAction;
}

export function sortPerpDeploy<
    T extends
        | PerpDeployRequest_RegisterAsset["action"]
        | PerpDeployRequest_SetOracle["action"],
>(action: T): T {
    if ("registerAsset" in action) {
        return {
            type: action.type,
            registerAsset: {
                maxGas: action.registerAsset.maxGas ?? null,
                assetRequest: {
                    coin: action.registerAsset.assetRequest.coin,
                    szDecimals: action.registerAsset.assetRequest.szDecimals,
                    oraclePx: action.registerAsset.assetRequest.oraclePx,
                    marginTableId: action.registerAsset.assetRequest.marginTableId,
                    onlyIsolated: action.registerAsset.assetRequest.onlyIsolated,
                },
                dex: action.registerAsset.dex,
                schema: action.registerAsset.schema
                    ? {
                        fullName: action.registerAsset.schema.fullName,
                        collateralToken: action.registerAsset.schema.collateralToken,
                        oracleUpdater: action.registerAsset.schema.oracleUpdater?.toLowerCase() ?? null,
                    }
                    : null,
            },
        } as T;
    } else {
        return {
            type: action.type,
            setOracle: {
                dex: action.setOracle.dex,
                oraclePxs: action.setOracle.oraclePxs,
                markPxs: action.setOracle.markPxs,
            },
        } as T;
    }
}

export function sortRegisterReferrer<T extends RegisterReferrerRequest["action"]>(action: T): T {
    return {
        type: action.type,
        code: action.code,
    } as T;
}

export function sortReserveRequestWeight<T extends ReserveRequestWeightRequest["action"]>(action: T): T {
    return {
        type: action.type,
        weight: action.weight,
    } as T;
}

export function sortScheduleCancel<T extends ScheduleCancelRequest["action"]>(action: T): T {
    const sortedAction = {
        type: action.type,
        time: action.time,
    } as T;
    if (sortedAction.time === undefined) delete sortedAction.time;
    return sortedAction;
}

export function sortSetDisplayName<T extends SetDisplayNameRequest["action"]>(action: T): T {
    return {
        type: action.type,
        displayName: action.displayName,
    } as T;
}

export function sortSetReferrer<T extends SetReferrerRequest["action"]>(action: T): T {
    return {
        type: action.type,
        code: action.code,
    } as T;
}

export function sortSpotDeploy<
    T extends
        | SpotDeployRequest_Genesis["action"]
        | SpotDeployRequest_RegisterHyperliquidity["action"]
        | SpotDeployRequest_RegisterSpot["action"]
        | SpotDeployRequest_RegisterToken2["action"]
        | SpotDeployRequest_SetDeployerTradingFeeShare["action"]
        | SpotDeployRequest_UserGenesis["action"],
>(action: T): T {
    if ("genesis" in action) {
        const sortedAction: SpotDeployRequest_Genesis["action"] = {
            type: action.type,
            genesis: {
                token: action.genesis.token,
                maxSupply: action.genesis.maxSupply,
                noHyperliquidity: action.genesis.noHyperliquidity,
            },
        };
        if (sortedAction.genesis.noHyperliquidity === undefined) {
            delete sortedAction.genesis.noHyperliquidity;
        }
        return sortedAction as T;
    } else if ("registerHyperliquidity" in action) {
        const sortedAction: SpotDeployRequest_RegisterHyperliquidity["action"] = {
            type: action.type,
            registerHyperliquidity: {
                spot: action.registerHyperliquidity.spot,
                startPx: action.registerHyperliquidity.startPx,
                orderSz: action.registerHyperliquidity.orderSz,
                nOrders: action.registerHyperliquidity.nOrders,
                nSeededLevels: action.registerHyperliquidity.nSeededLevels,
            },
        };
        if (sortedAction.registerHyperliquidity.nSeededLevels === undefined) {
            delete sortedAction.registerHyperliquidity.nSeededLevels;
        }
        return sortedAction as T;
    } else if ("registerSpot" in action) {
        return {
            type: action.type,
            registerSpot: {
                tokens: action.registerSpot.tokens,
            },
        } as T;
    } else if ("registerToken2" in action) {
        const sortedAction: SpotDeployRequest_RegisterToken2["action"] = {
            type: action.type,
            registerToken2: {
                spec: {
                    name: action.registerToken2.spec.name,
                    szDecimals: action.registerToken2.spec.szDecimals,
                    weiDecimals: action.registerToken2.spec.weiDecimals,
                },
                maxGas: action.registerToken2.maxGas,
                fullName: action.registerToken2.fullName,
            },
        };
        if (sortedAction.registerToken2.fullName === undefined) {
            delete sortedAction.registerToken2.fullName;
        }
        return sortedAction as T;
    } else if ("setDeployerTradingFeeShare" in action) {
        return {
            type: action.type,
            setDeployerTradingFeeShare: {
                token: action.setDeployerTradingFeeShare.token,
                share: action.setDeployerTradingFeeShare.share,
            },
        } as T;
    } else { // "userGenesis" in action
        const sortedAction: SpotDeployRequest_UserGenesis["action"] = {
            type: action.type,
            userGenesis: {
                token: action.userGenesis.token,
                userAndWei: action.userGenesis.userAndWei,
                existingTokenAndWei: action.userGenesis.existingTokenAndWei,
                blacklistUsers: action.userGenesis.blacklistUsers,
            },
        };
        if (sortedAction.userGenesis.blacklistUsers === undefined) {
            delete sortedAction.userGenesis.blacklistUsers;
        }
        return sortedAction as T;
    }
}

export function sortSpotUser<T extends SpotUserRequest["action"]>(action: T): T {
    return {
        type: action.type,
        toggleSpotDusting: {
            optOut: action.toggleSpotDusting.optOut,
        },
    } as T;
}

export function sortSubAccountSpotTransfer<T extends SubAccountSpotTransferRequest["action"]>(action: T): T {
    return {
        type: action.type,
        subAccountUser: action.subAccountUser,
        isDeposit: action.isDeposit,
        token: action.token,
        amount: action.amount,
    } as T;
}

export function sortSubAccountTransfer<T extends SubAccountTransferRequest["action"]>(action: T): T {
    return {
        type: action.type,
        subAccountUser: action.subAccountUser,
        isDeposit: action.isDeposit,
        usd: action.usd,
    } as T;
}

export function sortTwapCancel<T extends TwapCancelRequest["action"]>(action: T): T {
    return {
        type: action.type,
        a: action.a,
        t: action.t,
    } as T;
}

export function sortTwapOrder<T extends TwapOrderRequest["action"]>(action: T): T {
    return {
        type: action.type,
        twap: {
            a: action.twap.a,
            b: action.twap.b,
            s: formatDecimal(action.twap.s),
            r: action.twap.r,
            m: action.twap.m,
            t: action.twap.t,
        },
    } as T;
}

export function sortUpdateIsolatedMargin<T extends UpdateIsolatedMarginRequest["action"]>(action: T): T {
    return {
        type: action.type,
        asset: action.asset,
        isBuy: action.isBuy,
        ntli: action.ntli,
    } as T;
}

export function sortUpdateLeverage<T extends UpdateLeverageRequest["action"]>(action: T): T {
    return {
        type: action.type,
        asset: action.asset,
        isCross: action.isCross,
        leverage: action.leverage,
    } as T;
}

export function sortVaultDistribute<T extends VaultDistributeRequest["action"]>(action: T): T {
    return {
        type: action.type,
        vaultAddress: action.vaultAddress,
        usd: action.usd,
    } as T;
}

export function sortVaultModify<T extends VaultModifyRequest["action"]>(action: T): T {
    return {
        type: action.type,
        vaultAddress: action.vaultAddress,
        allowDeposits: action.allowDeposits,
        alwaysCloseOnWithdraw: action.alwaysCloseOnWithdraw,
    } as T;
}

export function sortVaultTransfer<T extends VaultTransferRequest["action"]>(action: T): T {
    return {
        type: action.type,
        vaultAddress: action.vaultAddress,
        isDeposit: action.isDeposit,
        usd: action.usd,
    } as T;
}

function formatDecimal(numStr: string): string {
    if (!numStr.includes(".")) return numStr;

    const [intPart, fracPart] = numStr.split(".");
    const newFrac = fracPart.replace(/0+$/, "");

    return newFrac ? `${intPart}.${newFrac}` : intPart;
}
