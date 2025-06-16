import type { Hex } from "../base.ts";
import type {
    ApproveAgentRequest,
    ApproveBuilderFeeRequest,
    BatchModifyRequest,
    CancelByCloidRequest,
    CancelRequest,
    CDepositRequest,
    ClaimRewardsRequest,
    ConvertToMultiSigUserRequest,
    CreateSubAccountRequest,
    CreateVaultRequest,
    CSignerActionRequest_JailSelf,
    CSignerActionRequest_UnjailSelf,
    CValidatorActionRequest_ChangeProfile,
    CValidatorActionRequest_Register,
    CValidatorActionRequest_Unregister,
    CWithdrawRequest,
    EvmUserModifyRequest,
    ModifyRequest,
    MultiSigRequest,
    OrderRequest,
    PerpDeployRequest_RegisterAsset,
    PerpDeployRequest_SetOracle,
    PerpDexClassTransferRequest,
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
    SpotSendRequest,
    SpotUserRequest,
    SubAccountSpotTransferRequest,
    SubAccountTransferRequest,
    TokenDelegateRequest,
    TwapCancelRequest,
    TwapOrderRequest,
    UpdateIsolatedMarginRequest,
    UpdateLeverageRequest,
    UsdClassTransferRequest,
    UsdSendRequest,
    VaultDistributeRequest,
    VaultModifyRequest,
    VaultTransferRequest,
    Withdraw3Request,
} from "../types/exchange/requests.ts";

/** Action sorter for correct signature generation. */
export const actionSorter = {
    /** Sorts and formats an `approveAgent` action. */
    approveAgent: (action: ApproveAgentRequest["action"]): ApproveAgentRequest["action"] => {
        return {
            type: action.type,
            signatureChainId: action.signatureChainId,
            hyperliquidChain: action.hyperliquidChain,
            agentAddress: action.agentAddress.toLowerCase() as Hex,
            agentName: action.agentName ?? "",
            nonce: action.nonce,
        };
    },

    /** Sorts and formats an `approveBuilderFee` action. */
    approveBuilderFee: (action: ApproveBuilderFeeRequest["action"]): ApproveBuilderFeeRequest["action"] => {
        return {
            type: action.type,
            signatureChainId: action.signatureChainId,
            hyperliquidChain: action.hyperliquidChain,
            maxFeeRate: action.maxFeeRate,
            builder: action.builder.toLowerCase() as Hex,
            nonce: action.nonce,
        };
    },

    /** Sorts and formats a `batchModify` action. */
    batchModify: (action: BatchModifyRequest["action"]): BatchModifyRequest["action"] => {
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
        };
    },

    /** Sorts and formats a `cancel` action. */
    cancel: (action: CancelRequest["action"]): CancelRequest["action"] => {
        return {
            type: action.type,
            cancels: action.cancels.map((cancel) => ({
                a: cancel.a,
                o: cancel.o,
            })),
        };
    },

    /** Sorts and formats a `cancelByCloid` action. */
    cancelByCloid: (action: CancelByCloidRequest["action"]): CancelByCloidRequest["action"] => {
        return {
            type: action.type,
            cancels: action.cancels.map((cancel) => ({
                asset: cancel.asset,
                cloid: cancel.cloid,
            })),
        };
    },

    /** Sorts and formats a `cDeposit` action. */
    cDeposit: (action: CDepositRequest["action"]): CDepositRequest["action"] => {
        return {
            type: action.type,
            signatureChainId: action.signatureChainId,
            hyperliquidChain: action.hyperliquidChain,
            wei: action.wei,
            nonce: action.nonce,
        };
    },

    /** Sorts and formats a `claimRewards` action. */
    claimRewards: (action: ClaimRewardsRequest["action"]): ClaimRewardsRequest["action"] => {
        return {
            type: action.type,
        };
    },

    /** Sorts and formats a `convertToMultiSigUser` action. */
    convertToMultiSigUser: (action: ConvertToMultiSigUserRequest["action"]): ConvertToMultiSigUserRequest["action"] => {
        return {
            type: action.type,
            signatureChainId: action.signatureChainId,
            hyperliquidChain: action.hyperliquidChain,
            signers: action.signers,
            nonce: action.nonce,
        };
    },

    /** Sorts and formats a `createSubAccount` action. */
    createSubAccount: (action: CreateSubAccountRequest["action"]): CreateSubAccountRequest["action"] => {
        return {
            type: action.type,
            name: action.name,
        };
    },

    /** Sorts and formats a `createVault` action. */
    createVault: (action: CreateVaultRequest["action"]): CreateVaultRequest["action"] => {
        return {
            type: action.type,
            name: action.name,
            description: action.description,
            initialUsd: action.initialUsd,
            nonce: action.nonce,
        };
    },

    /** Sorts and formats a `CSignerAction` action (jail/unjail). */
    CSignerAction: (
        action:
            | CSignerActionRequest_JailSelf["action"]
            | CSignerActionRequest_UnjailSelf["action"],
    ):
        | CSignerActionRequest_JailSelf["action"]
        | CSignerActionRequest_UnjailSelf["action"] => {
        if ("jailSelf" in action) {
            return {
                type: action.type,
                jailSelf: action.jailSelf,
            };
        } else {
            return {
                type: action.type,
                unjailSelf: action.unjailSelf,
            };
        }
    },

    /** Sorts and formats a `CValidatorAction` action (register/unregister/change profile). */
    CValidatorAction: (
        action:
            | CValidatorActionRequest_ChangeProfile["action"]
            | CValidatorActionRequest_Register["action"]
            | CValidatorActionRequest_Unregister["action"],
    ):
        | CValidatorActionRequest_ChangeProfile["action"]
        | CValidatorActionRequest_Register["action"]
        | CValidatorActionRequest_Unregister["action"] => {
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
                    signer: action.changeProfile.signer?.toLowerCase() as Hex | undefined ?? null,
                },
            };
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
                        signer: action.register.profile.signer.toLowerCase() as Hex,
                    },
                    unjailed: action.register.unjailed,
                    initial_wei: action.register.initial_wei,
                },
            };
        } else { // "unregister" in action
            return {
                type: action.type,
                unregister: action.unregister,
            };
        }
    },

    /** Sorts and formats a `cWithdraw` action. */
    cWithdraw: (action: CWithdrawRequest["action"]): CWithdrawRequest["action"] => {
        return {
            type: action.type,
            signatureChainId: action.signatureChainId,
            hyperliquidChain: action.hyperliquidChain,
            wei: action.wei,
            nonce: action.nonce,
        };
    },

    /** Sorts and formats an `evmUserModify` action. */
    evmUserModify: (action: EvmUserModifyRequest["action"]): EvmUserModifyRequest["action"] => {
        return {
            type: action.type,
            usingBigBlocks: action.usingBigBlocks,
        };
    },

    /** Sorts and formats a `modify` action. */
    modify: (action: ModifyRequest["action"]): ModifyRequest["action"] => {
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
        };
        if (sortedAction.order.c === undefined) delete sortedAction.order.c;
        return sortedAction;
    },

    /** Sorts and formats a `multiSig` action. */
    multiSig: (action: MultiSigRequest["action"]): MultiSigRequest["action"] => {
        return {
            type: action.type,
            signatureChainId: action.signatureChainId,
            signatures: action.signatures.map((signature) => ({
                r: signature.r.replace(/^0x0+/, "0x").toLowerCase() as Hex,
                s: signature.s.replace(/^0x0+/, "0x").toLowerCase() as Hex,
                v: signature.v,
            })),
            payload: {
                multiSigUser: action.payload.multiSigUser.toLowerCase() as Hex,
                outerSigner: action.payload.outerSigner.toLowerCase() as Hex,
                action: action.payload.action,
            },
        };
    },

    /** Sorts and formats an `order` action. */
    order: (action: OrderRequest["action"]): OrderRequest["action"] => {
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
                    b: action.builder.b.toLowerCase() as Hex,
                    f: action.builder.f,
                }
                : action.builder,
        };
        if (sortedAction.builder === undefined) delete sortedAction.builder;
        return sortedAction;
    },

    /** Sorts and formats a `perpDeploy` action. */
    perpDeploy: (
        action:
            | PerpDeployRequest_RegisterAsset["action"]
            | PerpDeployRequest_SetOracle["action"],
    ):
        | PerpDeployRequest_RegisterAsset["action"]
        | PerpDeployRequest_SetOracle["action"] => {
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
                            oracleUpdater:
                                action.registerAsset.schema.oracleUpdater?.toLowerCase() as Hex | undefined ?? null,
                        }
                        : null,
                },
            };
        } else {
            return {
                type: action.type,
                setOracle: {
                    dex: action.setOracle.dex,
                    oraclePxs: action.setOracle.oraclePxs,
                    markPxs: action.setOracle.markPxs,
                },
            };
        }
    },

    /** Sorts and formats a `PerpDexClassTransfer` action. */
    PerpDexClassTransfer: (action: PerpDexClassTransferRequest["action"]): PerpDexClassTransferRequest["action"] => {
        return {
            type: action.type,
            signatureChainId: action.signatureChainId,
            hyperliquidChain: action.hyperliquidChain,
            dex: action.dex,
            token: action.token,
            amount: action.amount,
            toPerp: action.toPerp,
            nonce: action.nonce,
        };
    },

    /** Sorts and formats a `registerReferrer` action. */
    registerReferrer: (action: RegisterReferrerRequest["action"]): RegisterReferrerRequest["action"] => {
        return {
            type: action.type,
            code: action.code,
        };
    },

    /** Sorts and formats a `reserveRequestWeight` action. */
    reserveRequestWeight: (action: ReserveRequestWeightRequest["action"]): ReserveRequestWeightRequest["action"] => {
        return {
            type: action.type,
            weight: action.weight,
        };
    },

    /** Sorts and formats a `scheduleCancel` action. */
    scheduleCancel: (action: ScheduleCancelRequest["action"]): ScheduleCancelRequest["action"] => {
        const sortedAction = {
            type: action.type,
            time: action.time,
        };
        if (sortedAction.time === undefined) delete sortedAction.time;
        return sortedAction;
    },

    /** Sorts and formats a `setDisplayName` action. */
    setDisplayName: (action: SetDisplayNameRequest["action"]): SetDisplayNameRequest["action"] => {
        return {
            type: action.type,
            displayName: action.displayName,
        };
    },

    /** Sorts and formats a `setReferrer` action. */
    setReferrer: (action: SetReferrerRequest["action"]): SetReferrerRequest["action"] => {
        return {
            type: action.type,
            code: action.code,
        };
    },

    /** Sorts and formats a `spotDeploy` action. */
    spotDeploy: (
        action:
            | SpotDeployRequest_Genesis["action"]
            | SpotDeployRequest_RegisterHyperliquidity["action"]
            | SpotDeployRequest_RegisterSpot["action"]
            | SpotDeployRequest_RegisterToken2["action"]
            | SpotDeployRequest_SetDeployerTradingFeeShare["action"]
            | SpotDeployRequest_UserGenesis["action"],
    ):
        | SpotDeployRequest_Genesis["action"]
        | SpotDeployRequest_RegisterHyperliquidity["action"]
        | SpotDeployRequest_RegisterSpot["action"]
        | SpotDeployRequest_RegisterToken2["action"]
        | SpotDeployRequest_SetDeployerTradingFeeShare["action"]
        | SpotDeployRequest_UserGenesis["action"] => {
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
            return sortedAction;
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
            return sortedAction;
        } else if ("registerSpot" in action) {
            return {
                type: action.type,
                registerSpot: {
                    tokens: action.registerSpot.tokens,
                },
            };
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
            return sortedAction;
        } else if ("setDeployerTradingFeeShare" in action) {
            return {
                type: action.type,
                setDeployerTradingFeeShare: {
                    token: action.setDeployerTradingFeeShare.token,
                    share: action.setDeployerTradingFeeShare.share,
                },
            };
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
            return sortedAction;
        }
    },

    /** Sorts and formats a `spotSend` action. */
    spotSend: (action: SpotSendRequest["action"]): SpotSendRequest["action"] => {
        return {
            type: action.type,
            signatureChainId: action.signatureChainId,
            hyperliquidChain: action.hyperliquidChain,
            destination: action.destination.toLowerCase() as Hex,
            token: action.token,
            amount: action.amount,
            time: action.time,
        };
    },

    /** Sorts and formats a `spotUser` action. */
    spotUser: (action: SpotUserRequest["action"]): SpotUserRequest["action"] => {
        return {
            type: action.type,
            toggleSpotDusting: {
                optOut: action.toggleSpotDusting.optOut,
            },
        };
    },

    /** Sorts and formats a `subAccountSpotTransfer` action. */
    subAccountSpotTransfer: (
        action: SubAccountSpotTransferRequest["action"],
    ): SubAccountSpotTransferRequest["action"] => {
        return {
            type: action.type,
            subAccountUser: action.subAccountUser.toLowerCase() as Hex,
            isDeposit: action.isDeposit,
            token: action.token,
            amount: action.amount,
        };
    },

    /** Sorts and formats a `subAccountTransfer` action. */
    subAccountTransfer: (action: SubAccountTransferRequest["action"]): SubAccountTransferRequest["action"] => {
        return {
            type: action.type,
            subAccountUser: action.subAccountUser.toLowerCase() as Hex,
            isDeposit: action.isDeposit,
            usd: action.usd,
        };
    },

    /** Sorts and formats a `tokenDelegate` action. */
    tokenDelegate: (action: TokenDelegateRequest["action"]): TokenDelegateRequest["action"] => {
        return {
            type: action.type,
            signatureChainId: action.signatureChainId,
            hyperliquidChain: action.hyperliquidChain,
            validator: action.validator.toLowerCase() as Hex,
            wei: action.wei,
            isUndelegate: action.isUndelegate,
            nonce: action.nonce,
        };
    },

    /** Sorts and formats a `twapCancel` action. */
    twapCancel: (action: TwapCancelRequest["action"]): TwapCancelRequest["action"] => {
        return {
            type: action.type,
            a: action.a,
            t: action.t,
        };
    },

    /** Sorts and formats a `twapOrder` action. */
    twapOrder: (action: TwapOrderRequest["action"]): TwapOrderRequest["action"] => {
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
        };
    },

    /** Sorts and formats an `updateIsolatedMargin` action. */
    updateIsolatedMargin: (action: UpdateIsolatedMarginRequest["action"]): UpdateIsolatedMarginRequest["action"] => {
        return {
            type: action.type,
            asset: action.asset,
            isBuy: action.isBuy,
            ntli: action.ntli,
        };
    },

    /** Sorts and formats an `updateLeverage` action. */
    updateLeverage: (action: UpdateLeverageRequest["action"]): UpdateLeverageRequest["action"] => {
        return {
            type: action.type,
            asset: action.asset,
            isCross: action.isCross,
            leverage: action.leverage,
        };
    },

    /** Sorts and formats an `usdClassTransfer` action. */
    usdClassTransfer: (action: UsdClassTransferRequest["action"]): UsdClassTransferRequest["action"] => {
        return {
            type: action.type,
            signatureChainId: action.signatureChainId,
            hyperliquidChain: action.hyperliquidChain,
            amount: action.amount,
            toPerp: action.toPerp,
            nonce: action.nonce,
        };
    },

    /** Sorts and formats an `usdSend` action. */
    usdSend: (action: UsdSendRequest["action"]): UsdSendRequest["action"] => {
        return {
            type: action.type,
            signatureChainId: action.signatureChainId,
            hyperliquidChain: action.hyperliquidChain,
            destination: action.destination.toLowerCase() as Hex,
            amount: action.amount,
            time: action.time,
        };
    },

    /** Sorts and formats a `vaultDistribute` action. */
    vaultDistribute: (action: VaultDistributeRequest["action"]): VaultDistributeRequest["action"] => {
        return {
            type: action.type,
            vaultAddress: action.vaultAddress,
            usd: action.usd,
        };
    },

    /** Sorts and formats a `vaultModify` action. */
    vaultModify: (action: VaultModifyRequest["action"]): VaultModifyRequest["action"] => {
        return {
            type: action.type,
            vaultAddress: action.vaultAddress,
            allowDeposits: action.allowDeposits,
            alwaysCloseOnWithdraw: action.alwaysCloseOnWithdraw,
        };
    },

    /** Sorts and formats a `vaultTransfer` action. */
    vaultTransfer: (action: VaultTransferRequest["action"]): VaultTransferRequest["action"] => {
        return {
            type: action.type,
            vaultAddress: action.vaultAddress,
            isDeposit: action.isDeposit,
            usd: action.usd,
        };
    },

    /** Sorts and formats a `withdraw3` action. */
    withdraw3: (action: Withdraw3Request["action"]): Withdraw3Request["action"] => {
        return {
            type: action.type,
            signatureChainId: action.signatureChainId,
            hyperliquidChain: action.hyperliquidChain,
            destination: action.destination.toLowerCase() as Hex,
            amount: action.amount,
            time: action.time,
        };
    },
};

/** Removes trailing zeros from decimal string. */
function formatDecimal(numStr: string): string {
    if (!numStr.includes(".")) return numStr;

    const [intPart, fracPart] = numStr.split(".");
    const newFrac = fracPart.replace(/0+$/, "");

    return newFrac ? `${intPart}.${newFrac}` : intPart;
}

/** EIP-712 type definitions for user-signed actions. */
export const userSignedActionEip712Types = {
    approveAgent: {
        "HyperliquidTransaction:ApproveAgent": [
            { name: "hyperliquidChain", type: "string" },
            { name: "agentAddress", type: "address" },
            { name: "agentName", type: "string" },
            { name: "nonce", type: "uint64" },
        ],
    },
    approveBuilderFee: {
        "HyperliquidTransaction:ApproveBuilderFee": [
            { name: "hyperliquidChain", type: "string" },
            { name: "maxFeeRate", type: "string" },
            { name: "builder", type: "address" },
            { name: "nonce", type: "uint64" },
        ],
    },
    cDeposit: {
        "HyperliquidTransaction:CDeposit": [
            { name: "hyperliquidChain", type: "string" },
            { name: "wei", type: "uint64" },
            { name: "nonce", type: "uint64" },
        ],
    },
    convertToMultiSigUser: {
        "HyperliquidTransaction:ConvertToMultiSigUser": [
            { name: "hyperliquidChain", type: "string" },
            { name: "signers", type: "string" },
            { name: "nonce", type: "uint64" },
        ],
    },
    cWithdraw: {
        "HyperliquidTransaction:CWithdraw": [
            { name: "hyperliquidChain", type: "string" },
            { name: "wei", type: "uint64" },
            { name: "nonce", type: "uint64" },
        ],
    },
    PerpDexClassTransfer: {
        "HyperliquidTransaction:PerpDexClassTransfer": [
            { name: "hyperliquidChain", type: "string" },
            { name: "dex", type: "string" },
            { name: "token", type: "string" },
            { name: "amount", type: "string" },
            { name: "toPerp", type: "bool" },
            { name: "nonce", type: "uint64" },
        ],
    },
    spotSend: {
        "HyperliquidTransaction:SpotSend": [
            { name: "hyperliquidChain", type: "string" },
            { name: "destination", type: "string" },
            { name: "token", type: "string" },
            { name: "amount", type: "string" },
            { name: "time", type: "uint64" },
        ],
    },
    tokenDelegate: {
        "HyperliquidTransaction:TokenDelegate": [
            { name: "hyperliquidChain", type: "string" },
            { name: "validator", type: "address" },
            { name: "wei", type: "uint64" },
            { name: "isUndelegate", type: "bool" },
            { name: "nonce", type: "uint64" },
        ],
    },
    usdClassTransfer: {
        "HyperliquidTransaction:UsdClassTransfer": [
            { name: "hyperliquidChain", type: "string" },
            { name: "amount", type: "string" },
            { name: "toPerp", type: "bool" },
            { name: "nonce", type: "uint64" },
        ],
    },
    usdSend: {
        "HyperliquidTransaction:UsdSend": [
            { name: "hyperliquidChain", type: "string" },
            { name: "destination", type: "string" },
            { name: "amount", type: "string" },
            { name: "time", type: "uint64" },
        ],
    },
    withdraw3: {
        "HyperliquidTransaction:Withdraw": [
            { name: "hyperliquidChain", type: "string" },
            { name: "destination", type: "string" },
            { name: "amount", type: "string" },
            { name: "time", type: "uint64" },
        ],
    },
};
