import type { ApproveAgentRequest, ApproveBuilderFeeRequest, BatchModifyRequest, CancelByCloidRequest, CancelRequest, CDepositRequest, ClaimRewardsRequest, ConvertToMultiSigUserRequest, ConvertToMultiSigUserRequestWithoutStringify, CreateSubAccountRequest, CreateVaultRequest, CSignerActionRequest, CValidatorActionRequest, CWithdrawRequest, EvmUserModifyRequest, ModifyRequest, MultiSigRequest, OrderRequest, PerpDeployRequest, RegisterReferrerRequest, ReserveRequestWeightRequest, ScheduleCancelRequest, SetDisplayNameRequest, SetReferrerRequest, SpotDeployRequest, SpotSendRequest, SpotUserRequest, SubAccountModifyRequest, SubAccountSpotTransferRequest, SubAccountTransferRequest, TokenDelegateRequest, TwapCancelRequest, TwapOrderRequest, UpdateIsolatedMarginRequest, UpdateLeverageRequest, UsdClassTransferRequest, UsdSendRequest, VaultDistributeRequest, VaultModifyRequest, VaultTransferRequest, Withdraw3Request } from "../types/mod.js";
/** @see https://github.com/microsoft/TypeScript/issues/13923#issuecomment-2191862501 */
type DeepImmutable<T> = {
    readonly [K in keyof T]: DeepImmutable<T[K]>;
};
/** Action sorter and formatter for correct signature generation. */
export declare const actionSorter: {
    approveAgent: (action: DeepImmutable<ApproveAgentRequest["action"]>) => ApproveAgentRequest["action"];
    approveBuilderFee: (action: DeepImmutable<ApproveBuilderFeeRequest["action"]>) => ApproveBuilderFeeRequest["action"];
    batchModify: (action: DeepImmutable<BatchModifyRequest["action"]>) => BatchModifyRequest["action"];
    cancel: (action: DeepImmutable<CancelRequest["action"]>) => CancelRequest["action"];
    cancelByCloid: (action: DeepImmutable<CancelByCloidRequest["action"]>) => CancelByCloidRequest["action"];
    cDeposit: (action: DeepImmutable<CDepositRequest["action"]>) => CDepositRequest["action"];
    claimRewards: (action: DeepImmutable<ClaimRewardsRequest["action"]>) => ClaimRewardsRequest["action"];
    convertToMultiSigUser: (action: DeepImmutable<ConvertToMultiSigUserRequest["action"] | ConvertToMultiSigUserRequestWithoutStringify["action"]>) => ConvertToMultiSigUserRequest["action"];
    createSubAccount: (action: DeepImmutable<CreateSubAccountRequest["action"]>) => CreateSubAccountRequest["action"];
    createVault: (action: DeepImmutable<CreateVaultRequest["action"]>) => CreateVaultRequest["action"];
    CSignerAction: (action: DeepImmutable<CSignerActionRequest["action"]>) => CSignerActionRequest["action"];
    CValidatorAction: (action: DeepImmutable<CValidatorActionRequest["action"]>) => CValidatorActionRequest["action"];
    cWithdraw: (action: DeepImmutable<CWithdrawRequest["action"]>) => CWithdrawRequest["action"];
    evmUserModify: (action: DeepImmutable<EvmUserModifyRequest["action"]>) => EvmUserModifyRequest["action"];
    modify: (action: DeepImmutable<ModifyRequest["action"]>) => ModifyRequest["action"];
    multiSig: (action: DeepImmutable<MultiSigRequest["action"]>) => MultiSigRequest["action"];
    order: (action: DeepImmutable<OrderRequest["action"]>) => OrderRequest["action"];
    perpDeploy: (action: DeepImmutable<PerpDeployRequest["action"]>) => PerpDeployRequest["action"];
    registerReferrer: (action: DeepImmutable<RegisterReferrerRequest["action"]>) => RegisterReferrerRequest["action"];
    reserveRequestWeight: (action: DeepImmutable<ReserveRequestWeightRequest["action"]>) => ReserveRequestWeightRequest["action"];
    scheduleCancel: (action: DeepImmutable<ScheduleCancelRequest["action"]>) => ScheduleCancelRequest["action"];
    setDisplayName: (action: DeepImmutable<SetDisplayNameRequest["action"]>) => SetDisplayNameRequest["action"];
    setReferrer: (action: DeepImmutable<SetReferrerRequest["action"]>) => SetReferrerRequest["action"];
    spotDeploy: (action: DeepImmutable<SpotDeployRequest["action"]>) => SpotDeployRequest["action"];
    spotSend: (action: DeepImmutable<SpotSendRequest["action"]>) => SpotSendRequest["action"];
    spotUser: (action: DeepImmutable<SpotUserRequest["action"]>) => SpotUserRequest["action"];
    subAccountModify: (action: DeepImmutable<SubAccountModifyRequest["action"]>) => SubAccountModifyRequest["action"];
    subAccountSpotTransfer: (action: DeepImmutable<SubAccountSpotTransferRequest["action"]>) => SubAccountSpotTransferRequest["action"];
    subAccountTransfer: (action: DeepImmutable<SubAccountTransferRequest["action"]>) => SubAccountTransferRequest["action"];
    tokenDelegate: (action: DeepImmutable<TokenDelegateRequest["action"]>) => TokenDelegateRequest["action"];
    twapCancel: (action: DeepImmutable<TwapCancelRequest["action"]>) => TwapCancelRequest["action"];
    twapOrder: (action: DeepImmutable<TwapOrderRequest["action"]>) => TwapOrderRequest["action"];
    updateIsolatedMargin: (action: DeepImmutable<UpdateIsolatedMarginRequest["action"]>) => UpdateIsolatedMarginRequest["action"];
    updateLeverage: (action: DeepImmutable<UpdateLeverageRequest["action"]>) => UpdateLeverageRequest["action"];
    usdClassTransfer: (action: DeepImmutable<UsdClassTransferRequest["action"]>) => UsdClassTransferRequest["action"];
    usdSend: (action: DeepImmutable<UsdSendRequest["action"]>) => UsdSendRequest["action"];
    vaultDistribute: (action: DeepImmutable<VaultDistributeRequest["action"]>) => VaultDistributeRequest["action"];
    vaultModify: (action: DeepImmutable<VaultModifyRequest["action"]>) => VaultModifyRequest["action"];
    vaultTransfer: (action: DeepImmutable<VaultTransferRequest["action"]>) => VaultTransferRequest["action"];
    withdraw3: (action: DeepImmutable<Withdraw3Request["action"]>) => Withdraw3Request["action"];
};
/** EIP-712 type definitions for user-signed actions. */
export declare const userSignedActionEip712Types: {
    approveAgent: {
        "HyperliquidTransaction:ApproveAgent": {
            name: string;
            type: string;
        }[];
    };
    approveBuilderFee: {
        "HyperliquidTransaction:ApproveBuilderFee": {
            name: string;
            type: string;
        }[];
    };
    cDeposit: {
        "HyperliquidTransaction:CDeposit": {
            name: string;
            type: string;
        }[];
    };
    convertToMultiSigUser: {
        "HyperliquidTransaction:ConvertToMultiSigUser": {
            name: string;
            type: string;
        }[];
    };
    cWithdraw: {
        "HyperliquidTransaction:CWithdraw": {
            name: string;
            type: string;
        }[];
    };
    multiSig: {
        "HyperliquidTransaction:SendMultiSig": {
            name: string;
            type: string;
        }[];
    };
    spotSend: {
        "HyperliquidTransaction:SpotSend": {
            name: string;
            type: string;
        }[];
    };
    tokenDelegate: {
        "HyperliquidTransaction:TokenDelegate": {
            name: string;
            type: string;
        }[];
    };
    usdClassTransfer: {
        "HyperliquidTransaction:UsdClassTransfer": {
            name: string;
            type: string;
        }[];
    };
    usdSend: {
        "HyperliquidTransaction:UsdSend": {
            name: string;
            type: string;
        }[];
    };
    withdraw3: {
        "HyperliquidTransaction:Withdraw": {
            name: string;
            type: string;
        }[];
    };
};
export {};
//# sourceMappingURL=_sorter.d.ts.map