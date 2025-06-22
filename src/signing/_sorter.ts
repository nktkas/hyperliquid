import type { DeepImmutable, Hex } from "../base.ts";
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
    PerpDexTransferRequest,
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

/** Action sorter and formatter for correct signature generation. */
export const actionSorter = {
    approveAgent: (action: DeepImmutable<ApproveAgentRequest["action"]>): ApproveAgentRequest["action"] => {
        return {
            type: action.type,
            signatureChainId: action.signatureChainId,
            hyperliquidChain: action.hyperliquidChain,
            agentAddress: action.agentAddress.toLowerCase() as Hex,
            agentName: action.agentName ?? "",
            nonce: action.nonce,
        };
    },
    approveBuilderFee: (
        action: DeepImmutable<ApproveBuilderFeeRequest["action"]>,
    ): ApproveBuilderFeeRequest["action"] => {
        return {
            type: action.type,
            signatureChainId: action.signatureChainId,
            hyperliquidChain: action.hyperliquidChain,
            maxFeeRate: action.maxFeeRate,
            builder: action.builder.toLowerCase() as Hex,
            nonce: action.nonce,
        };
    },
    batchModify: (action: DeepImmutable<BatchModifyRequest["action"]>): BatchModifyRequest["action"] => {
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
    cancel: (action: DeepImmutable<CancelRequest["action"]>): CancelRequest["action"] => {
        return {
            type: action.type,
            cancels: action.cancels.map((cancel) => ({
                a: cancel.a,
                o: cancel.o,
            })),
        };
    },
    cancelByCloid: (action: DeepImmutable<CancelByCloidRequest["action"]>): CancelByCloidRequest["action"] => {
        return {
            type: action.type,
            cancels: action.cancels.map((cancel) => ({
                asset: cancel.asset,
                cloid: cancel.cloid,
            })),
        };
    },
    cDeposit: (action: DeepImmutable<CDepositRequest["action"]>): CDepositRequest["action"] => {
        return {
            type: action.type,
            signatureChainId: action.signatureChainId,
            hyperliquidChain: action.hyperliquidChain,
            wei: action.wei,
            nonce: action.nonce,
        };
    },
    claimRewards: (action: DeepImmutable<ClaimRewardsRequest["action"]>): ClaimRewardsRequest["action"] => {
        return {
            type: action.type,
        };
    },
    convertToMultiSigUser: (
        action: DeepImmutable<ConvertToMultiSigUserRequest["action"]>,
    ): ConvertToMultiSigUserRequest["action"] => {
        return {
            type: action.type,
            signatureChainId: action.signatureChainId,
            hyperliquidChain: action.hyperliquidChain,
            signers: action.signers, // key order is not important
            nonce: action.nonce,
        };
    },
    createSubAccount: (action: DeepImmutable<CreateSubAccountRequest["action"]>): CreateSubAccountRequest["action"] => {
        return {
            type: action.type,
            name: action.name,
        };
    },
    createVault: (action: DeepImmutable<CreateVaultRequest["action"]>): CreateVaultRequest["action"] => {
        return {
            type: action.type,
            name: action.name,
            description: action.description,
            initialUsd: action.initialUsd,
            nonce: action.nonce,
        };
    },
    CSignerAction: (
        action:
            | DeepImmutable<CSignerActionRequest_JailSelf["action"]>
            | DeepImmutable<CSignerActionRequest_UnjailSelf["action"]>,
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
    CValidatorAction: (
        action:
            | DeepImmutable<CValidatorActionRequest_ChangeProfile["action"]>
            | DeepImmutable<CValidatorActionRequest_Register["action"]>
            | DeepImmutable<CValidatorActionRequest_Unregister["action"]>,
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
    cWithdraw: (action: DeepImmutable<CWithdrawRequest["action"]>): CWithdrawRequest["action"] => {
        return {
            type: action.type,
            signatureChainId: action.signatureChainId,
            hyperliquidChain: action.hyperliquidChain,
            wei: action.wei,
            nonce: action.nonce,
        };
    },
    evmUserModify: (action: DeepImmutable<EvmUserModifyRequest["action"]>): EvmUserModifyRequest["action"] => {
        return {
            type: action.type,
            usingBigBlocks: action.usingBigBlocks,
        };
    },
    modify: (action: DeepImmutable<ModifyRequest["action"]>): ModifyRequest["action"] => {
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
    multiSig: (action: DeepImmutable<MultiSigRequest["action"]>): MultiSigRequest["action"] => {
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
                action: structuredClone(action.payload.action),
            },
        };
    },
    order: (action: DeepImmutable<OrderRequest["action"]>): OrderRequest["action"] => {
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
    perpDeploy: (
        action:
            | DeepImmutable<PerpDeployRequest_RegisterAsset["action"]>
            | DeepImmutable<PerpDeployRequest_SetOracle["action"]>,
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
                    oraclePxs: action.setOracle.oraclePxs.map((el) => [...el]),
                    markPxs: action.setOracle.markPxs.map((el) => [...el]),
                },
            };
        }
    },
    PerpDexClassTransfer: (
        action: DeepImmutable<PerpDexClassTransferRequest["action"]>,
    ): PerpDexClassTransferRequest["action"] => {
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
    PerpDexTransfer: (
        action: DeepImmutable<PerpDexTransferRequest["action"]>,
    ): PerpDexTransferRequest["action"] => {
        return {
            type: action.type,
            signatureChainId: action.signatureChainId,
            hyperliquidChain: action.hyperliquidChain,
            sourceDex: action.sourceDex,
            destinationDex: action.destinationDex,
            amount: action.amount,
            nonce: action.nonce,
        };
    },
    registerReferrer: (action: DeepImmutable<RegisterReferrerRequest["action"]>): RegisterReferrerRequest["action"] => {
        return {
            type: action.type,
            code: action.code,
        };
    },
    reserveRequestWeight: (
        action: DeepImmutable<ReserveRequestWeightRequest["action"]>,
    ): ReserveRequestWeightRequest["action"] => {
        return {
            type: action.type,
            weight: action.weight,
        };
    },
    scheduleCancel: (action: DeepImmutable<ScheduleCancelRequest["action"]>): ScheduleCancelRequest["action"] => {
        const sortedAction = {
            type: action.type,
            time: action.time,
        };
        if (sortedAction.time === undefined) delete sortedAction.time;
        return sortedAction;
    },
    setDisplayName: (action: DeepImmutable<SetDisplayNameRequest["action"]>): SetDisplayNameRequest["action"] => {
        return {
            type: action.type,
            displayName: action.displayName,
        };
    },
    setReferrer: (action: DeepImmutable<SetReferrerRequest["action"]>): SetReferrerRequest["action"] => {
        return {
            type: action.type,
            code: action.code,
        };
    },
    spotDeploy: (
        action:
            | DeepImmutable<SpotDeployRequest_Genesis["action"]>
            | DeepImmutable<SpotDeployRequest_RegisterHyperliquidity["action"]>
            | DeepImmutable<SpotDeployRequest_RegisterSpot["action"]>
            | DeepImmutable<SpotDeployRequest_RegisterToken2["action"]>
            | DeepImmutable<SpotDeployRequest_SetDeployerTradingFeeShare["action"]>
            | DeepImmutable<SpotDeployRequest_UserGenesis["action"]>,
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
                    tokens: [...action.registerSpot.tokens],
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
                    userAndWei: action.userGenesis.userAndWei.map((el) => [...el]),
                    existingTokenAndWei: action.userGenesis.existingTokenAndWei.map((el) => [...el]),
                    blacklistUsers: action.userGenesis.blacklistUsers?.map((el) => [...el]),
                },
            };
            if (sortedAction.userGenesis.blacklistUsers === undefined) {
                delete sortedAction.userGenesis.blacklistUsers;
            }
            return sortedAction;
        }
    },
    spotSend: (action: DeepImmutable<SpotSendRequest["action"]>): SpotSendRequest["action"] => {
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
    spotUser: (action: DeepImmutable<SpotUserRequest["action"]>): SpotUserRequest["action"] => {
        return {
            type: action.type,
            toggleSpotDusting: {
                optOut: action.toggleSpotDusting.optOut,
            },
        };
    },
    subAccountSpotTransfer: (
        action: DeepImmutable<SubAccountSpotTransferRequest["action"]>,
    ): SubAccountSpotTransferRequest["action"] => {
        return {
            type: action.type,
            subAccountUser: action.subAccountUser.toLowerCase() as Hex,
            isDeposit: action.isDeposit,
            token: action.token,
            amount: action.amount,
        };
    },
    subAccountTransfer: (
        action: DeepImmutable<SubAccountTransferRequest["action"]>,
    ): SubAccountTransferRequest["action"] => {
        return {
            type: action.type,
            subAccountUser: action.subAccountUser.toLowerCase() as Hex,
            isDeposit: action.isDeposit,
            usd: action.usd,
        };
    },
    tokenDelegate: (action: DeepImmutable<TokenDelegateRequest["action"]>): TokenDelegateRequest["action"] => {
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
    twapCancel: (action: DeepImmutable<TwapCancelRequest["action"]>): TwapCancelRequest["action"] => {
        return {
            type: action.type,
            a: action.a,
            t: action.t,
        };
    },
    twapOrder: (action: DeepImmutable<TwapOrderRequest["action"]>): TwapOrderRequest["action"] => {
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
    updateIsolatedMargin: (
        action: DeepImmutable<UpdateIsolatedMarginRequest["action"]>,
    ): UpdateIsolatedMarginRequest["action"] => {
        return {
            type: action.type,
            asset: action.asset,
            isBuy: action.isBuy,
            ntli: action.ntli,
        };
    },
    updateLeverage: (action: DeepImmutable<UpdateLeverageRequest["action"]>): UpdateLeverageRequest["action"] => {
        return {
            type: action.type,
            asset: action.asset,
            isCross: action.isCross,
            leverage: action.leverage,
        };
    },
    usdClassTransfer: (action: DeepImmutable<UsdClassTransferRequest["action"]>): UsdClassTransferRequest["action"] => {
        return {
            type: action.type,
            signatureChainId: action.signatureChainId,
            hyperliquidChain: action.hyperliquidChain,
            amount: action.amount,
            toPerp: action.toPerp,
            nonce: action.nonce,
        };
    },
    usdSend: (action: DeepImmutable<UsdSendRequest["action"]>): UsdSendRequest["action"] => {
        return {
            type: action.type,
            signatureChainId: action.signatureChainId,
            hyperliquidChain: action.hyperliquidChain,
            destination: action.destination.toLowerCase() as Hex,
            amount: action.amount,
            time: action.time,
        };
    },
    vaultDistribute: (action: DeepImmutable<VaultDistributeRequest["action"]>): VaultDistributeRequest["action"] => {
        return {
            type: action.type,
            vaultAddress: action.vaultAddress,
            usd: action.usd,
        };
    },
    vaultModify: (action: DeepImmutable<VaultModifyRequest["action"]>): VaultModifyRequest["action"] => {
        return {
            type: action.type,
            vaultAddress: action.vaultAddress,
            allowDeposits: action.allowDeposits,
            alwaysCloseOnWithdraw: action.alwaysCloseOnWithdraw,
        };
    },
    vaultTransfer: (action: DeepImmutable<VaultTransferRequest["action"]>): VaultTransferRequest["action"] => {
        return {
            type: action.type,
            vaultAddress: action.vaultAddress,
            isDeposit: action.isDeposit,
            usd: action.usd,
        };
    },
    withdraw3: (action: DeepImmutable<Withdraw3Request["action"]>): Withdraw3Request["action"] => {
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
    PerpDexTransfer: {
        "HyperliquidTransaction:PerpDexTransfer": [
            { name: "hyperliquidChain", type: "string" },
            { name: "sourceDex", type: "string" },
            { name: "destinationDex", type: "string" },
            { name: "amount", type: "string" },
            { name: "nonce", type: "uint64" },
        ],
    },
    multiSig: {
        "HyperliquidTransaction:SendMultiSig": [
            { name: "hyperliquidChain", type: "string" },
            { name: "multiSigActionHash", type: "bytes32" },
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
