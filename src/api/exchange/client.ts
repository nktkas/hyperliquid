import type { ExchangeConfig, ExchangeSingleWalletConfig } from "./_methods/_base/execute.ts";

// =============================================================
// Methods Imports
// =============================================================

import {
  agentEnableDexAbstraction,
  type AgentEnableDexAbstractionOptions,
  type AgentEnableDexAbstractionSuccessResponse,
} from "./_methods/agentEnableDexAbstraction.ts";
import {
  approveAgent,
  type ApproveAgentOptions,
  type ApproveAgentParameters,
  type ApproveAgentSuccessResponse,
} from "./_methods/approveAgent.ts";
import {
  approveBuilderFee,
  type ApproveBuilderFeeOptions,
  type ApproveBuilderFeeParameters,
  type ApproveBuilderFeeSuccessResponse,
} from "./_methods/approveBuilderFee.ts";
import {
  batchModify,
  type BatchModifyOptions,
  type BatchModifyParameters,
  type BatchModifySuccessResponse,
} from "./_methods/batchModify.ts";
import { cancel, type CancelOptions, type CancelParameters, type CancelSuccessResponse } from "./_methods/cancel.ts";
import {
  cancelByCloid,
  type CancelByCloidOptions,
  type CancelByCloidParameters,
  type CancelByCloidSuccessResponse,
} from "./_methods/cancelByCloid.ts";
import {
  cDeposit,
  type CDepositOptions,
  type CDepositParameters,
  type CDepositSuccessResponse,
} from "./_methods/cDeposit.ts";
import { claimRewards, type ClaimRewardsOptions, type ClaimRewardsSuccessResponse } from "./_methods/claimRewards.ts";
import {
  convertToMultiSigUser,
  type ConvertToMultiSigUserOptions,
  type ConvertToMultiSigUserParameters,
  type ConvertToMultiSigUserSuccessResponse,
} from "./_methods/convertToMultiSigUser.ts";
import {
  createSubAccount,
  type CreateSubAccountOptions,
  type CreateSubAccountParameters,
  type CreateSubAccountSuccessResponse,
} from "./_methods/createSubAccount.ts";
import {
  createVault,
  type CreateVaultOptions,
  type CreateVaultParameters,
  type CreateVaultSuccessResponse,
} from "./_methods/createVault.ts";
import {
  cSignerAction,
  type CSignerActionOptions,
  type CSignerActionParameters,
  type CSignerActionSuccessResponse,
} from "./_methods/cSignerAction.ts";
import {
  cValidatorAction,
  type CValidatorActionOptions,
  type CValidatorActionParameters,
  type CValidatorActionSuccessResponse,
} from "./_methods/cValidatorAction.ts";
import {
  cWithdraw,
  type CWithdrawOptions,
  type CWithdrawParameters,
  type CWithdrawSuccessResponse,
} from "./_methods/cWithdraw.ts";
import {
  evmUserModify,
  type EvmUserModifyOptions,
  type EvmUserModifyParameters,
  type EvmUserModifySuccessResponse,
} from "./_methods/evmUserModify.ts";
import {
  linkStakingUser,
  type LinkStakingUserOptions,
  type LinkStakingUserParameters,
  type LinkStakingUserSuccessResponse,
} from "./_methods/linkStakingUser.ts";
import { modify, type ModifyOptions, type ModifyParameters, type ModifySuccessResponse } from "./_methods/modify.ts";
import { order, type OrderOptions, type OrderParameters, type OrderSuccessResponse } from "./_methods/order.ts";
import { noop, type NoopOptions, type NoopSuccessResponse } from "./_methods/noop.ts";
import {
  perpDeploy,
  type PerpDeployOptions,
  type PerpDeployParameters,
  type PerpDeploySuccessResponse,
} from "./_methods/perpDeploy.ts";
import {
  registerReferrer,
  type RegisterReferrerOptions,
  type RegisterReferrerParameters,
  type RegisterReferrerSuccessResponse,
} from "./_methods/registerReferrer.ts";
import {
  reserveRequestWeight,
  type ReserveRequestWeightOptions,
  type ReserveRequestWeightParameters,
  type ReserveRequestWeightSuccessResponse,
} from "./_methods/reserveRequestWeight.ts";
import {
  scheduleCancel,
  type ScheduleCancelOptions,
  type ScheduleCancelParameters,
  type ScheduleCancelSuccessResponse,
} from "./_methods/scheduleCancel.ts";
import {
  sendAsset,
  type SendAssetOptions,
  type SendAssetParameters,
  type SendAssetSuccessResponse,
} from "./_methods/sendAsset.ts";
import {
  setDisplayName,
  type SetDisplayNameOptions,
  type SetDisplayNameParameters,
  type SetDisplayNameSuccessResponse,
} from "./_methods/setDisplayName.ts";
import {
  setReferrer,
  type SetReferrerOptions,
  type SetReferrerParameters,
  type SetReferrerSuccessResponse,
} from "./_methods/setReferrer.ts";
import {
  spotDeploy,
  type SpotDeployOptions,
  type SpotDeployParameters,
  type SpotDeploySuccessResponse,
} from "./_methods/spotDeploy.ts";
import {
  spotSend,
  type SpotSendOptions,
  type SpotSendParameters,
  type SpotSendSuccessResponse,
} from "./_methods/spotSend.ts";
import {
  spotUser,
  type SpotUserOptions,
  type SpotUserParameters,
  type SpotUserSuccessResponse,
} from "./_methods/spotUser.ts";
import {
  subAccountModify,
  type SubAccountModifyOptions,
  type SubAccountModifyParameters,
  type SubAccountModifySuccessResponse,
} from "./_methods/subAccountModify.ts";
import {
  subAccountSpotTransfer,
  type SubAccountSpotTransferOptions,
  type SubAccountSpotTransferParameters,
  type SubAccountSpotTransferSuccessResponse,
} from "./_methods/subAccountSpotTransfer.ts";
import {
  subAccountTransfer,
  type SubAccountTransferOptions,
  type SubAccountTransferParameters,
  type SubAccountTransferSuccessResponse,
} from "./_methods/subAccountTransfer.ts";
import {
  tokenDelegate,
  type TokenDelegateOptions,
  type TokenDelegateParameters,
  type TokenDelegateSuccessResponse,
} from "./_methods/tokenDelegate.ts";
import {
  twapCancel,
  type TwapCancelOptions,
  type TwapCancelParameters,
  type TwapCancelSuccessResponse,
} from "./_methods/twapCancel.ts";
import {
  twapOrder,
  type TwapOrderOptions,
  type TwapOrderParameters,
  type TwapOrderSuccessResponse,
} from "./_methods/twapOrder.ts";
import {
  updateIsolatedMargin,
  type UpdateIsolatedMarginOptions,
  type UpdateIsolatedMarginParameters,
  type UpdateIsolatedMarginSuccessResponse,
} from "./_methods/updateIsolatedMargin.ts";
import {
  updateLeverage,
  type UpdateLeverageOptions,
  type UpdateLeverageParameters,
  type UpdateLeverageSuccessResponse,
} from "./_methods/updateLeverage.ts";
import {
  usdClassTransfer,
  type UsdClassTransferOptions,
  type UsdClassTransferParameters,
  type UsdClassTransferSuccessResponse,
} from "./_methods/usdClassTransfer.ts";
import {
  usdSend,
  type UsdSendOptions,
  type UsdSendParameters,
  type UsdSendSuccessResponse,
} from "./_methods/usdSend.ts";
import {
  userDexAbstraction,
  type UserDexAbstractionOptions,
  type UserDexAbstractionParameters,
  type UserDexAbstractionSuccessResponse,
} from "./_methods/userDexAbstraction.ts";
import {
  validatorL1Stream,
  type ValidatorL1StreamOptions,
  type ValidatorL1StreamParameters,
  type ValidatorL1StreamSuccessResponse,
} from "./_methods/validatorL1Stream.ts";
import {
  vaultDistribute,
  type VaultDistributeOptions,
  type VaultDistributeParameters,
  type VaultDistributeSuccessResponse,
} from "./_methods/vaultDistribute.ts";
import {
  vaultModify,
  type VaultModifyOptions,
  type VaultModifyParameters,
  type VaultModifySuccessResponse,
} from "./_methods/vaultModify.ts";
import {
  vaultTransfer,
  type VaultTransferOptions,
  type VaultTransferParameters,
  type VaultTransferSuccessResponse,
} from "./_methods/vaultTransfer.ts";
import {
  withdraw3,
  type Withdraw3Options,
  type Withdraw3Parameters,
  type Withdraw3SuccessResponse,
} from "./_methods/withdraw3.ts";

// =============================================================
// Client
// =============================================================

/**
 * A client for interacting with the Hyperliquid Exchange API.
 */
export class ExchangeClient<C extends ExchangeConfig = ExchangeSingleWalletConfig> {
  config_: C;

  /**
   * Creates an instance of the ExchangeClient.
   *
   * @param config - Configuration for Exchange API requests. See {@link ExchangeConfig}.
   *
   * @example [viem](https://viem.sh/docs/clients/wallet#local-accounts-private-key-mnemonic-etc)
   * ```ts
   * import * as hl from "@nktkas/hyperliquid";
   * import { privateKeyToAccount } from "npm:viem/accounts";
   *
   * const wallet = privateKeyToAccount("0x..."); // viem or ethers
   * const transport = new hl.HttpTransport(); // or `WebSocketTransport`
   *
   * const client = new hl.ExchangeClient({ transport, wallet });
   * ```
   *
   * @example [ethers.js](https://docs.ethers.org/v6/api/wallet/#Wallet)
   * ```ts
   * import * as hl from "@nktkas/hyperliquid";
   * import { ethers } from "npm:ethers";
   *
   * const transport = new hl.HttpTransport();
   * const client = new hl.ExchangeClient({ transport, wallet: new ethers.Wallet("0x...") });
   * ```
   *
   * @example Multi-sig
   * ```ts
   * import * as hl from "@nktkas/hyperliquid";
   * import { privateKeyToAccount } from "npm:viem/accounts";
   * import { ethers } from "npm:ethers";
   *
   * const signer1 = privateKeyToAccount("0x...");
   * const signer2 = new ethers.Wallet("0x...");
   * // ... and more signers
   *
   * const transport = new hl.HttpTransport(); // or `WebSocketTransport`
   *
   * const client = new hl.ExchangeClient({
   *   transport,
   *   signers: [signer1, signer2],
   *   multiSigUser: "0x...",
   * });
   * ```
   */
  constructor(config: C) {
    this.config_ = config;
  }

  /** @see {@link agentEnableDexAbstraction} */
  agentEnableDexAbstraction(
    opts?: AgentEnableDexAbstractionOptions,
  ): Promise<AgentEnableDexAbstractionSuccessResponse> {
    return agentEnableDexAbstraction(this.config_, opts);
  }

  /** @see {@link approveAgent} */
  approveAgent(
    params: ApproveAgentParameters,
    opts?: ApproveAgentOptions,
  ): Promise<ApproveAgentSuccessResponse> {
    return approveAgent(this.config_, params, opts);
  }

  /** @see {@link approveBuilderFee} */
  approveBuilderFee(
    params: ApproveBuilderFeeParameters,
    opts?: ApproveBuilderFeeOptions,
  ): Promise<ApproveBuilderFeeSuccessResponse> {
    return approveBuilderFee(this.config_, params, opts);
  }

  /** @see {@link batchModify} */
  batchModify(
    params: BatchModifyParameters,
    opts?: BatchModifyOptions,
  ): Promise<BatchModifySuccessResponse> {
    return batchModify(this.config_, params, opts);
  }

  /** @see {@link cancel} */
  cancel(
    params: CancelParameters,
    opts?: CancelOptions,
  ): Promise<CancelSuccessResponse> {
    return cancel(this.config_, params, opts);
  }

  /** @see {@link cancelByCloid} */
  cancelByCloid(
    params: CancelByCloidParameters,
    opts?: CancelByCloidOptions,
  ): Promise<CancelByCloidSuccessResponse> {
    return cancelByCloid(this.config_, params, opts);
  }

  /** @see {@link cDeposit} */
  cDeposit(
    params: CDepositParameters,
    opts?: CDepositOptions,
  ): Promise<CDepositSuccessResponse> {
    return cDeposit(this.config_, params, opts);
  }

  /** @see {@link claimRewards} */
  claimRewards(
    opts?: ClaimRewardsOptions,
  ): Promise<ClaimRewardsSuccessResponse> {
    return claimRewards(this.config_, opts);
  }

  /** @see {@link convertToMultiSigUser} */
  convertToMultiSigUser(
    params: ConvertToMultiSigUserParameters,
    opts?: ConvertToMultiSigUserOptions,
  ): Promise<ConvertToMultiSigUserSuccessResponse> {
    return convertToMultiSigUser(this.config_, params, opts);
  }

  /** @see {@link createSubAccount} */
  createSubAccount(
    params: CreateSubAccountParameters,
    opts?: CreateSubAccountOptions,
  ): Promise<CreateSubAccountSuccessResponse> {
    return createSubAccount(this.config_, params, opts);
  }

  /** @see {@link createVault} */
  createVault(
    params: CreateVaultParameters,
    opts?: CreateVaultOptions,
  ): Promise<CreateVaultSuccessResponse> {
    return createVault(this.config_, params, opts);
  }

  /** @see {@link cSignerAction} */
  cSignerAction(
    params: CSignerActionParameters,
    opts?: CSignerActionOptions,
  ): Promise<CSignerActionSuccessResponse> {
    return cSignerAction(this.config_, params, opts);
  }

  /** @see {@link cValidatorAction} */
  cValidatorAction(
    params: CValidatorActionParameters,
    opts?: CValidatorActionOptions,
  ): Promise<CValidatorActionSuccessResponse> {
    return cValidatorAction(this.config_, params, opts);
  }

  /** @see {@link cWithdraw} */
  cWithdraw(
    params: CWithdrawParameters,
    opts?: CWithdrawOptions,
  ): Promise<CWithdrawSuccessResponse> {
    return cWithdraw(this.config_, params, opts);
  }

  /** @see {@link evmUserModify} */
  evmUserModify(
    params: EvmUserModifyParameters,
    opts?: EvmUserModifyOptions,
  ): Promise<EvmUserModifySuccessResponse> {
    return evmUserModify(this.config_, params, opts);
  }

  /** @see {@link linkStakingUser} */
  linkStakingUser(
    params: LinkStakingUserParameters,
    opts?: LinkStakingUserOptions,
  ): Promise<LinkStakingUserSuccessResponse> {
    return linkStakingUser(this.config_, params, opts);
  }

  /** @see {@link modify} */
  modify(
    params: ModifyParameters,
    opts?: ModifyOptions,
  ): Promise<ModifySuccessResponse> {
    return modify(this.config_, params, opts);
  }

  /** @see {@link order} */
  order(
    params: OrderParameters,
    opts?: OrderOptions,
  ): Promise<OrderSuccessResponse> {
    return order(this.config_, params, opts);
  }

  /** @see {@link noop} */
  noop(
    opts?: NoopOptions,
  ): Promise<NoopSuccessResponse> {
    return noop(this.config_, opts);
  }

  /** @see {@link perpDeploy} */
  perpDeploy(
    params: PerpDeployParameters,
    opts?: PerpDeployOptions,
  ): Promise<PerpDeploySuccessResponse> {
    return perpDeploy(this.config_, params, opts);
  }

  /** @see {@link registerReferrer} */
  registerReferrer(
    params: RegisterReferrerParameters,
    opts?: RegisterReferrerOptions,
  ): Promise<RegisterReferrerSuccessResponse> {
    return registerReferrer(this.config_, params, opts);
  }

  /** @see {@link reserveRequestWeight} */
  reserveRequestWeight(
    params: ReserveRequestWeightParameters,
    opts?: ReserveRequestWeightOptions,
  ): Promise<ReserveRequestWeightSuccessResponse> {
    return reserveRequestWeight(this.config_, params, opts);
  }

  /** @see {@link scheduleCancel} */
  scheduleCancel(
    params?: ScheduleCancelParameters,
    opts?: ScheduleCancelOptions,
  ): Promise<ScheduleCancelSuccessResponse>;
  scheduleCancel(
    opts?: ScheduleCancelOptions,
  ): Promise<ScheduleCancelSuccessResponse>;
  scheduleCancel(
    paramsOrOpts?: ScheduleCancelParameters | ScheduleCancelOptions,
    maybeOpts?: ScheduleCancelOptions,
  ): Promise<ScheduleCancelSuccessResponse> {
    const isFirstArgParams = paramsOrOpts && "time" in paramsOrOpts;
    const params = isFirstArgParams ? paramsOrOpts : {};
    const opts = isFirstArgParams ? maybeOpts : paramsOrOpts as ScheduleCancelOptions;
    return scheduleCancel(this.config_, params, opts);
  }

  /** @see {@link sendAsset} */
  sendAsset(
    params: SendAssetParameters,
    opts?: SendAssetOptions,
  ): Promise<SendAssetSuccessResponse> {
    return sendAsset(this.config_, params, opts);
  }

  /** @see {@link setDisplayName} */
  setDisplayName(
    params: SetDisplayNameParameters,
    opts?: SetDisplayNameOptions,
  ): Promise<SetDisplayNameSuccessResponse> {
    return setDisplayName(this.config_, params, opts);
  }

  /** @see {@link setReferrer} */
  setReferrer(
    params: SetReferrerParameters,
    opts?: SetReferrerOptions,
  ): Promise<SetReferrerSuccessResponse> {
    return setReferrer(this.config_, params, opts);
  }

  /** @see {@link spotDeploy} */
  spotDeploy(
    params: SpotDeployParameters,
    opts?: SpotDeployOptions,
  ): Promise<SpotDeploySuccessResponse> {
    return spotDeploy(this.config_, params, opts);
  }

  /** @see {@link spotSend} */
  spotSend(
    params: SpotSendParameters,
    opts?: SpotSendOptions,
  ): Promise<SpotSendSuccessResponse> {
    return spotSend(this.config_, params, opts);
  }

  /** @see {@link spotUser} */
  spotUser(
    params: SpotUserParameters,
    opts?: SpotUserOptions,
  ): Promise<SpotUserSuccessResponse> {
    return spotUser(this.config_, params, opts);
  }

  /** @see {@link subAccountModify} */
  subAccountModify(
    params: SubAccountModifyParameters,
    opts?: SubAccountModifyOptions,
  ): Promise<SubAccountModifySuccessResponse> {
    return subAccountModify(this.config_, params, opts);
  }

  /** @see {@link subAccountSpotTransfer} */
  subAccountSpotTransfer(
    params: SubAccountSpotTransferParameters,
    opts?: SubAccountSpotTransferOptions,
  ): Promise<SubAccountSpotTransferSuccessResponse> {
    return subAccountSpotTransfer(this.config_, params, opts);
  }

  /** @see {@link subAccountTransfer} */
  subAccountTransfer(
    params: SubAccountTransferParameters,
    opts?: SubAccountTransferOptions,
  ): Promise<SubAccountTransferSuccessResponse> {
    return subAccountTransfer(this.config_, params, opts);
  }

  /** @see {@link tokenDelegate} */
  tokenDelegate(
    params: TokenDelegateParameters,
    opts?: TokenDelegateOptions,
  ): Promise<TokenDelegateSuccessResponse> {
    return tokenDelegate(this.config_, params, opts);
  }

  /** @see {@link twapCancel} */
  twapCancel(
    params: TwapCancelParameters,
    opts?: TwapCancelOptions,
  ): Promise<TwapCancelSuccessResponse> {
    return twapCancel(this.config_, params, opts);
  }

  /** @see {@link twapOrder} */
  twapOrder(
    params: TwapOrderParameters,
    opts?: TwapOrderOptions,
  ): Promise<TwapOrderSuccessResponse> {
    return twapOrder(this.config_, params, opts);
  }

  /** @see {@link updateIsolatedMargin} */
  updateIsolatedMargin(
    params: UpdateIsolatedMarginParameters,
    opts?: UpdateIsolatedMarginOptions,
  ): Promise<UpdateIsolatedMarginSuccessResponse> {
    return updateIsolatedMargin(this.config_, params, opts);
  }

  /** @see {@link updateLeverage} */
  updateLeverage(
    params: UpdateLeverageParameters,
    opts?: UpdateLeverageOptions,
  ): Promise<UpdateLeverageSuccessResponse> {
    return updateLeverage(this.config_, params, opts);
  }

  /** @see {@link usdClassTransfer} */
  usdClassTransfer(
    params: UsdClassTransferParameters,
    opts?: UsdClassTransferOptions,
  ): Promise<UsdClassTransferSuccessResponse> {
    return usdClassTransfer(this.config_, params, opts);
  }

  /** @see {@link usdSend} */
  usdSend(
    params: UsdSendParameters,
    opts?: UsdSendOptions,
  ): Promise<UsdSendSuccessResponse> {
    return usdSend(this.config_, params, opts);
  }

  /** @see {@link userDexAbstraction} */
  userDexAbstraction(
    params: UserDexAbstractionParameters,
    opts?: UserDexAbstractionOptions,
  ): Promise<UserDexAbstractionSuccessResponse> {
    return userDexAbstraction(this.config_, params, opts);
  }

  /** @see {@link validatorL1Stream} */
  validatorL1Stream(
    params: ValidatorL1StreamParameters,
    opts?: ValidatorL1StreamOptions,
  ): Promise<ValidatorL1StreamSuccessResponse> {
    return validatorL1Stream(this.config_, params, opts);
  }

  /** @see {@link vaultDistribute} */
  vaultDistribute(
    params: VaultDistributeParameters,
    opts?: VaultDistributeOptions,
  ): Promise<VaultDistributeSuccessResponse> {
    return vaultDistribute(this.config_, params, opts);
  }

  /** @see {@link vaultModify} */
  vaultModify(
    params: VaultModifyParameters,
    opts?: VaultModifyOptions,
  ): Promise<VaultModifySuccessResponse> {
    return vaultModify(this.config_, params, opts);
  }

  /** @see {@link vaultTransfer} */
  vaultTransfer(
    params: VaultTransferParameters,
    opts?: VaultTransferOptions,
  ): Promise<VaultTransferSuccessResponse> {
    return vaultTransfer(this.config_, params, opts);
  }

  /** @see {@link withdraw3} */
  withdraw3(
    params: Withdraw3Parameters,
    opts?: Withdraw3Options,
  ): Promise<Withdraw3SuccessResponse> {
    return withdraw3(this.config_, params, opts);
  }
}

// =============================================================
// Type Re-exports
// =============================================================

export type { ExchangeMultiSigConfig, ExchangeSingleWalletConfig } from "./_methods/_base/execute.ts";
export { ApiRequestError } from "./_methods/_base/errors.ts";

export type {
  AgentEnableDexAbstractionOptions,
  AgentEnableDexAbstractionSuccessResponse,
} from "./_methods/agentEnableDexAbstraction.ts";
export type {
  ApproveAgentOptions,
  ApproveAgentParameters,
  ApproveAgentSuccessResponse,
} from "./_methods/approveAgent.ts";
export type {
  ApproveBuilderFeeOptions,
  ApproveBuilderFeeParameters,
  ApproveBuilderFeeSuccessResponse,
} from "./_methods/approveBuilderFee.ts";
export type { BatchModifyOptions, BatchModifyParameters, BatchModifySuccessResponse } from "./_methods/batchModify.ts";
export type { CancelOptions, CancelParameters, CancelSuccessResponse } from "./_methods/cancel.ts";
export type {
  CancelByCloidOptions,
  CancelByCloidParameters,
  CancelByCloidSuccessResponse,
} from "./_methods/cancelByCloid.ts";
export type { CDepositOptions, CDepositParameters, CDepositSuccessResponse } from "./_methods/cDeposit.ts";
export type { ClaimRewardsOptions, ClaimRewardsSuccessResponse } from "./_methods/claimRewards.ts";
export type {
  ConvertToMultiSigUserOptions,
  ConvertToMultiSigUserParameters,
  ConvertToMultiSigUserSuccessResponse,
} from "./_methods/convertToMultiSigUser.ts";
export type {
  CreateSubAccountOptions,
  CreateSubAccountParameters,
  CreateSubAccountSuccessResponse,
} from "./_methods/createSubAccount.ts";
export type { CreateVaultOptions, CreateVaultParameters, CreateVaultSuccessResponse } from "./_methods/createVault.ts";
export type {
  CSignerActionOptions,
  CSignerActionParameters,
  CSignerActionSuccessResponse,
} from "./_methods/cSignerAction.ts";
export type {
  CValidatorActionOptions,
  CValidatorActionParameters,
  CValidatorActionSuccessResponse,
} from "./_methods/cValidatorAction.ts";
export type { CWithdrawOptions, CWithdrawParameters, CWithdrawSuccessResponse } from "./_methods/cWithdraw.ts";
export type {
  EvmUserModifyOptions,
  EvmUserModifyParameters,
  EvmUserModifySuccessResponse,
} from "./_methods/evmUserModify.ts";
export type {
  LinkStakingUserOptions,
  LinkStakingUserParameters,
  LinkStakingUserSuccessResponse,
} from "./_methods/linkStakingUser.ts";
export type { ModifyOptions, ModifyParameters, ModifySuccessResponse } from "./_methods/modify.ts";
export type { OrderOptions, OrderParameters, OrderSuccessResponse } from "./_methods/order.ts";
export type { NoopOptions, NoopSuccessResponse } from "./_methods/noop.ts";
export type { PerpDeployOptions, PerpDeployParameters, PerpDeploySuccessResponse } from "./_methods/perpDeploy.ts";
export type {
  RegisterReferrerOptions,
  RegisterReferrerParameters,
  RegisterReferrerSuccessResponse,
} from "./_methods/registerReferrer.ts";
export type {
  ReserveRequestWeightOptions,
  ReserveRequestWeightParameters,
  ReserveRequestWeightSuccessResponse,
} from "./_methods/reserveRequestWeight.ts";
export type {
  ScheduleCancelOptions,
  ScheduleCancelParameters,
  ScheduleCancelSuccessResponse,
} from "./_methods/scheduleCancel.ts";
export type { SendAssetOptions, SendAssetParameters, SendAssetSuccessResponse } from "./_methods/sendAsset.ts";
export type {
  SetDisplayNameOptions,
  SetDisplayNameParameters,
  SetDisplayNameSuccessResponse,
} from "./_methods/setDisplayName.ts";
export type { SetReferrerOptions, SetReferrerParameters, SetReferrerSuccessResponse } from "./_methods/setReferrer.ts";
export type { SpotDeployOptions, SpotDeployParameters, SpotDeploySuccessResponse } from "./_methods/spotDeploy.ts";
export type { SpotSendOptions, SpotSendParameters, SpotSendSuccessResponse } from "./_methods/spotSend.ts";
export type { SpotUserOptions, SpotUserParameters, SpotUserSuccessResponse } from "./_methods/spotUser.ts";
export type {
  SubAccountModifyOptions,
  SubAccountModifyParameters,
  SubAccountModifySuccessResponse,
} from "./_methods/subAccountModify.ts";
export type {
  SubAccountSpotTransferOptions,
  SubAccountSpotTransferParameters,
  SubAccountSpotTransferSuccessResponse,
} from "./_methods/subAccountSpotTransfer.ts";
export type {
  SubAccountTransferOptions,
  SubAccountTransferParameters,
  SubAccountTransferSuccessResponse,
} from "./_methods/subAccountTransfer.ts";
export type {
  TokenDelegateOptions,
  TokenDelegateParameters,
  TokenDelegateSuccessResponse,
} from "./_methods/tokenDelegate.ts";
export type { TwapCancelOptions, TwapCancelParameters, TwapCancelSuccessResponse } from "./_methods/twapCancel.ts";
export type { TwapOrderOptions, TwapOrderParameters, TwapOrderSuccessResponse } from "./_methods/twapOrder.ts";
export type {
  UpdateIsolatedMarginOptions,
  UpdateIsolatedMarginParameters,
  UpdateIsolatedMarginSuccessResponse,
} from "./_methods/updateIsolatedMargin.ts";
export type {
  UpdateLeverageOptions,
  UpdateLeverageParameters,
  UpdateLeverageSuccessResponse,
} from "./_methods/updateLeverage.ts";
export type {
  UsdClassTransferOptions,
  UsdClassTransferParameters,
  UsdClassTransferSuccessResponse,
} from "./_methods/usdClassTransfer.ts";
export type { UsdSendOptions, UsdSendParameters, UsdSendSuccessResponse } from "./_methods/usdSend.ts";
export type {
  UserDexAbstractionOptions,
  UserDexAbstractionParameters,
  UserDexAbstractionSuccessResponse,
} from "./_methods/userDexAbstraction.ts";
export type {
  ValidatorL1StreamOptions,
  ValidatorL1StreamParameters,
  ValidatorL1StreamSuccessResponse,
} from "./_methods/validatorL1Stream.ts";
export type {
  VaultDistributeOptions,
  VaultDistributeParameters,
  VaultDistributeSuccessResponse,
} from "./_methods/vaultDistribute.ts";
export type { VaultModifyOptions, VaultModifyParameters, VaultModifySuccessResponse } from "./_methods/vaultModify.ts";
export type {
  VaultTransferOptions,
  VaultTransferParameters,
  VaultTransferSuccessResponse,
} from "./_methods/vaultTransfer.ts";
export type { Withdraw3Options, Withdraw3Parameters, Withdraw3SuccessResponse } from "./_methods/withdraw3.ts";
