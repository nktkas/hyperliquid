/**
 * Client for the Hyperliquid Exchange API endpoint.
 * @module
 */

import type { ExchangeConfig, ExchangeSingleWalletConfig } from "./_methods/_base/execute.ts";

// ============================================================
// Methods Imports
// ============================================================

import {
  agentEnableDexAbstraction,
  type AgentEnableDexAbstractionOptions,
  type AgentEnableDexAbstractionSuccessResponse,
} from "./_methods/agentEnableDexAbstraction.ts";
import {
  agentSetAbstraction,
  type AgentSetAbstractionOptions,
  type AgentSetAbstractionParameters,
  type AgentSetAbstractionSuccessResponse,
} from "./_methods/agentSetAbstraction.ts";
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
import {
  borrowLend,
  type BorrowLendOptions,
  type BorrowLendParameters,
  type BorrowLendSuccessResponse,
} from "./_methods/borrowLend.ts";
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
import { noop, type NoopOptions, type NoopSuccessResponse } from "./_methods/noop.ts";
import { order, type OrderOptions, type OrderParameters, type OrderSuccessResponse } from "./_methods/order.ts";
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
  userPortfolioMargin,
  type UserPortfolioMarginOptions,
  type UserPortfolioMarginParameters,
  type UserPortfolioMarginSuccessResponse,
} from "./_methods/userPortfolioMargin.ts";
import {
  userSetAbstraction,
  type UserSetAbstractionOptions,
  type UserSetAbstractionParameters,
  type UserSetAbstractionSuccessResponse,
} from "./_methods/userSetAbstraction.ts";
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

// ============================================================
// Client
// ============================================================

/**
 * Execute actions: place orders, cancel orders, transfer funds, etc.
 *
 * Corresponds to the {@link https://hyperliquid.gitbook.io/hyperliquid-docs/for-developers/api/exchange-endpoint | Exchange endpoint}.
 */
export class ExchangeClient<C extends ExchangeConfig = ExchangeSingleWalletConfig> {
  config_: C;

  /**
   * Creates an instance of the ExchangeClient.
   *
   * @param config Configuration for Exchange API requests. See {@link ExchangeConfig}.
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
   * const wallet = new ethers.Wallet("0x...");
   * const transport = new hl.HttpTransport();
   *
   * const client = new hl.ExchangeClient({ transport, wallet });
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

  /**
   * Enable HIP-3 DEX abstraction.
   *
   * @param opts Request execution options.
   * @return Successful response without specific data.
   *
   * @throws {ValiError} When the request parameters fail validation (before sending).
   * @throws {TransportError} When the transport layer throws an error.
   * @throws {ApiRequestError} When the API returns an unsuccessful response.
   *
   * @example
   * ```ts
   * import * as hl from "@nktkas/hyperliquid";
   * import { privateKeyToAccount } from "npm:viem/accounts";
   *
   * const wallet = privateKeyToAccount("0x..."); // viem or ethers
   * const transport = new hl.HttpTransport(); // or `WebSocketTransport`
   * const client = new hl.ExchangeClient({ transport, wallet });
   *
   * await client.agentEnableDexAbstraction();
   * ```
   *
   * @see https://hyperliquid.gitbook.io/hyperliquid-docs/for-developers/api/exchange-endpoint#enable-hip-3-dex-abstraction-agent
   *
   * @deprecated Use {@link agentSetAbstraction} instead.
   */
  agentEnableDexAbstraction(
    opts?: AgentEnableDexAbstractionOptions,
  ): Promise<AgentEnableDexAbstractionSuccessResponse> {
    return agentEnableDexAbstraction(this.config_, opts);
  }

  /**
   * Set User abstraction mode (method for agent wallet).
   *
   * @param params Parameters specific to the API request.
   * @param opts Request execution options.
   * @return Successful response without specific data.
   *
   * @throws {ValiError} When the request parameters fail validation (before sending).
   * @throws {TransportError} When the transport layer throws an error.
   * @throws {ApiRequestError} When the API returns an unsuccessful response.
   *
   * @example
   * ```ts
   * import * as hl from "@nktkas/hyperliquid";
   * import { privateKeyToAccount } from "npm:viem/accounts";
   *
   * const wallet = privateKeyToAccount("0x..."); // viem or ethers
   * const transport = new hl.HttpTransport(); // or `WebSocketTransport`
   * const client = new hl.ExchangeClient({ transport, wallet });
   *
   * await client.agentSetAbstraction({ abstraction: "u" });
   * ```
   *
   * @see https://hyperliquid.gitbook.io/hyperliquid-docs/for-developers/api/exchange-endpoint#set-user-abstraction-agent
   */
  agentSetAbstraction(
    params: AgentSetAbstractionParameters,
    opts?: AgentSetAbstractionOptions,
  ): Promise<AgentSetAbstractionSuccessResponse> {
    return agentSetAbstraction(this.config_, params, opts);
  }

  /**
   * Approve an agent to sign on behalf of the master account.
   *
   * @param params Parameters specific to the API request.
   * @param opts Request execution options.
   * @return Successful response without specific data.
   *
   * @throws {ValiError} When the request parameters fail validation (before sending).
   * @throws {TransportError} When the transport layer throws an error.
   * @throws {ApiRequestError} When the API returns an unsuccessful response.
   *
   * @example Basic usage
   * ```ts
   * import * as hl from "@nktkas/hyperliquid";
   * import { privateKeyToAccount } from "npm:viem/accounts";
   *
   * const wallet = privateKeyToAccount("0x..."); // viem or ethers
   * const transport = new hl.HttpTransport(); // or `WebSocketTransport`
   * const client = new hl.ExchangeClient({ transport, wallet });
   *
   * await client.approveAgent({ agentAddress: "0x...", agentName: "myAgent" });
   * ```
   * @example With expiration timestamp
   * ```ts
   * import * as hl from "@nktkas/hyperliquid";
   * import { privateKeyToAccount } from "npm:viem/accounts";
   *
   * const wallet = privateKeyToAccount("0x..."); // viem or ethers
   * const transport = new hl.HttpTransport(); // or `WebSocketTransport`
   * const client = new hl.ExchangeClient({ transport, wallet });
   *
   * const expirationTimestamp = Date.now() + 24 * 60 * 60 * 1000;
   * await client.approveAgent({
   *   agentAddress: "0x...",
   *   agentName: `myAgent valid_until ${expirationTimestamp}`,
   * });
   * ```
   *
   * @see https://hyperliquid.gitbook.io/hyperliquid-docs/for-developers/api/exchange-endpoint#approve-an-api-wallet
   */
  approveAgent(
    params: ApproveAgentParameters,
    opts?: ApproveAgentOptions,
  ): Promise<ApproveAgentSuccessResponse> {
    return approveAgent(this.config_, params, opts);
  }

  /**
   * Approve a maximum fee rate for a builder.
   *
   * @param params Parameters specific to the API request.
   * @param opts Request execution options.
   * @return Successful response without specific data.
   *
   * @throws {ValiError} When the request parameters fail validation (before sending).
   * @throws {TransportError} When the transport layer throws an error.
   * @throws {ApiRequestError} When the API returns an unsuccessful response.
   *
   * @example
   * ```ts
   * import * as hl from "@nktkas/hyperliquid";
   * import { privateKeyToAccount } from "npm:viem/accounts";
   *
   * const wallet = privateKeyToAccount("0x..."); // viem or ethers
   * const transport = new hl.HttpTransport(); // or `WebSocketTransport`
   * const client = new hl.ExchangeClient({ transport, wallet });
   *
   * await client.approveBuilderFee({ maxFeeRate: "0.01%", builder: "0x..." });
   * ```
   *
   * @see https://hyperliquid.gitbook.io/hyperliquid-docs/for-developers/api/exchange-endpoint#approve-a-builder-fee
   */
  approveBuilderFee(
    params: ApproveBuilderFeeParameters,
    opts?: ApproveBuilderFeeOptions,
  ): Promise<ApproveBuilderFeeSuccessResponse> {
    return approveBuilderFee(this.config_, params, opts);
  }

  /**
   * Modify multiple orders.
   *
   * @param params Parameters specific to the API request.
   * @param opts Request execution options.
   * @return Successful variant of {@link OrderResponse} without error statuses.
   *
   * @throws {ValiError} When the request parameters fail validation (before sending).
   * @throws {TransportError} When the transport layer throws an error.
   * @throws {ApiRequestError} When the API returns an unsuccessful response.
   *
   * @example
   * ```ts
   * import * as hl from "@nktkas/hyperliquid";
   * import { privateKeyToAccount } from "npm:viem/accounts";
   *
   * const wallet = privateKeyToAccount("0x..."); // viem or ethers
   * const transport = new hl.HttpTransport(); // or `WebSocketTransport`
   * const client = new hl.ExchangeClient({ transport, wallet });
   *
   * const data = await client.batchModify({
   *   modifies: [
   *     {
   *       oid: 123,
   *       order: {
   *         a: 0,
   *         b: true,
   *         p: "31000",
   *         s: "0.2",
   *         r: false,
   *         t: { limit: { tif: "Gtc" } },
   *       },
   *     },
   *   ],
   * });
   * ```
   *
   * @see https://hyperliquid.gitbook.io/hyperliquid-docs/for-developers/api/exchange-endpoint#modify-multiple-orders
   */
  batchModify(
    params: BatchModifyParameters,
    opts?: BatchModifyOptions,
  ): Promise<BatchModifySuccessResponse> {
    return batchModify(this.config_, params, opts);
  }

  /**
   * Borrow or lend assets.
   *
   * @param params Parameters specific to the API request.
   * @param opts Request execution options.
   * @return Successful response without specific data.
   *
   * @throws {ValiError} When the request parameters fail validation (before sending).
   * @throws {TransportError} When the transport layer throws an error.
   * @throws {ApiRequestError} When the API returns an unsuccessful response.
   *
   * @example
   * ```ts
   * import * as hl from "@nktkas/hyperliquid";
   * import { privateKeyToAccount } from "npm:viem/accounts";
   *
   * const wallet = privateKeyToAccount("0x..."); // viem or ethers
   * const transport = new hl.HttpTransport(); // or `WebSocketTransport`
   * const client = new hl.ExchangeClient({ transport, wallet });
   *
   * await client.borrowLend({ operation: "supply", token: 0, amount: "20" });
   * ```
   *
   * @see null
   */
  borrowLend(
    params: BorrowLendParameters,
    opts?: BorrowLendOptions,
  ): Promise<BorrowLendSuccessResponse> {
    return borrowLend(this.config_, params, opts);
  }

  /**
   * Cancel order(s).
   *
   * @param params Parameters specific to the API request.
   * @param opts Request execution options.
   * @return Successful variant of {@link CancelResponse} without error statuses.
   *
   * @throws {ValiError} When the request parameters fail validation (before sending).
   * @throws {TransportError} When the transport layer throws an error.
   * @throws {ApiRequestError} When the API returns an unsuccessful response.
   *
   * @example
   * ```ts
   * import * as hl from "@nktkas/hyperliquid";
   * import { privateKeyToAccount } from "npm:viem/accounts";
   *
   * const wallet = privateKeyToAccount("0x..."); // viem or ethers
   * const transport = new hl.HttpTransport(); // or `WebSocketTransport`
   * const client = new hl.ExchangeClient({ transport, wallet });
   *
   * await client.cancel({ cancels: [{ a: 0, o: 123 }] });
   * ```
   *
   * @see https://hyperliquid.gitbook.io/hyperliquid-docs/for-developers/api/exchange-endpoint#cancel-order-s
   */
  cancel(
    params: CancelParameters,
    opts?: CancelOptions,
  ): Promise<CancelSuccessResponse> {
    return cancel(this.config_, params, opts);
  }

  /**
   * Cancel order(s) by cloid.
   *
   * @param params Parameters specific to the API request.
   * @param opts Request execution options.
   * @return Successful variant of {@link CancelResponse} without error statuses.
   *
   * @throws {ValiError} When the request parameters fail validation (before sending).
   * @throws {TransportError} When the transport layer throws an error.
   * @throws {ApiRequestError} When the API returns an unsuccessful response.
   *
   * @example
   * ```ts
   * import * as hl from "@nktkas/hyperliquid";
   * import { privateKeyToAccount } from "npm:viem/accounts";
   *
   * const wallet = privateKeyToAccount("0x..."); // viem or ethers
   * const transport = new hl.HttpTransport(); // or `WebSocketTransport`
   * const client = new hl.ExchangeClient({ transport, wallet });
   *
   * await client.cancelByCloid({
   *   cancels: [
   *     { asset: 0, cloid: "0x..." },
   *   ],
   * });
   * ```
   *
   * @see https://hyperliquid.gitbook.io/hyperliquid-docs/for-developers/api/exchange-endpoint#cancel-order-s-by-cloid
   */
  cancelByCloid(
    params: CancelByCloidParameters,
    opts?: CancelByCloidOptions,
  ): Promise<CancelByCloidSuccessResponse> {
    return cancelByCloid(this.config_, params, opts);
  }

  /**
   * Transfer native token from the user spot account into staking for delegating to validators.
   *
   * @param params Parameters specific to the API request.
   * @param opts Request execution options.
   * @return Successful response without specific data.
   *
   * @throws {ValiError} When the request parameters fail validation (before sending).
   * @throws {TransportError} When the transport layer throws an error.
   * @throws {ApiRequestError} When the API returns an unsuccessful response.
   *
   * @example
   * ```ts
   * import * as hl from "@nktkas/hyperliquid";
   * import { privateKeyToAccount } from "npm:viem/accounts";
   *
   * const wallet = privateKeyToAccount("0x..."); // viem or ethers
   * const transport = new hl.HttpTransport(); // or `WebSocketTransport`
   * const client = new hl.ExchangeClient({ transport, wallet });
   *
   * await client.cDeposit({ wei: 1 * 1e8 });
   * ```
   *
   * @see https://hyperliquid.gitbook.io/hyperliquid-docs/for-developers/api/exchange-endpoint#deposit-into-staking
   */
  cDeposit(
    params: CDepositParameters,
    opts?: CDepositOptions,
  ): Promise<CDepositSuccessResponse> {
    return cDeposit(this.config_, params, opts);
  }

  /**
   * Claim rewards from referral program.
   *
   * @param opts Request execution options.
   * @return Successful response without specific data.
   *
   * @throws {ValiError} When the request parameters fail validation (before sending).
   * @throws {TransportError} When the transport layer throws an error.
   * @throws {ApiRequestError} When the API returns an unsuccessful response.
   *
   * @example
   * ```ts
   * import * as hl from "@nktkas/hyperliquid";
   * import { privateKeyToAccount } from "npm:viem/accounts";
   *
   * const wallet = privateKeyToAccount("0x..."); // viem or ethers
   * const transport = new hl.HttpTransport(); // or `WebSocketTransport`
   * const client = new hl.ExchangeClient({ transport, wallet });
   *
   * await client.claimRewards();
   * ```
   *
   * @see null
   */
  claimRewards(
    opts?: ClaimRewardsOptions,
  ): Promise<ClaimRewardsSuccessResponse> {
    return claimRewards(this.config_, opts);
  }

  /**
   * Convert a single-signature account to a multi-signature account or vice versa.
   *
   * @param params Parameters specific to the API request.
   * @param opts Request execution options.
   * @return Successful response without specific data.
   *
   * @throws {ValiError} When the request parameters fail validation (before sending).
   * @throws {TransportError} When the transport layer throws an error.
   * @throws {ApiRequestError} When the API returns an unsuccessful response.
   *
   * @example Convert to multi-sig
   * ```ts
   * import * as hl from "@nktkas/hyperliquid";
   * import { privateKeyToAccount } from "npm:viem/accounts";
   *
   * const wallet = privateKeyToAccount("0x..."); // viem or ethers
   * const transport = new hl.HttpTransport(); // or `WebSocketTransport`
   * const client = new hl.ExchangeClient({ transport, wallet });
   *
   * await client.convertToMultiSigUser({
   *   signers: {
   *     authorizedUsers: ["0x...", "0x...", "0x..."],
   *     threshold: 2,
   *   },
   * });
   * ```
   *
   * @example Convert to single-sig
   * ```ts
   * import * as hl from "@nktkas/hyperliquid";
   * import { privateKeyToAccount } from "npm:viem/accounts";
   *
   * const wallet = privateKeyToAccount("0x..."); // viem or ethers
   * const transport = new hl.HttpTransport(); // or `WebSocketTransport`
   * const client = new hl.ExchangeClient({ transport, wallet });
   *
   * await client.convertToMultiSigUser({ signers: null });
   * ```
   *
   * @see https://hyperliquid.gitbook.io/hyperliquid-docs/hypercore/multi-sig
   */
  convertToMultiSigUser(
    params: ConvertToMultiSigUserParameters,
    opts?: ConvertToMultiSigUserOptions,
  ): Promise<ConvertToMultiSigUserSuccessResponse> {
    return convertToMultiSigUser(this.config_, params, opts);
  }

  /**
   * Create a sub-account.
   *
   * @param params Parameters specific to the API request.
   * @param opts Request execution options.
   * @return Response for creating a sub-account.
   *
   * @throws {ValiError} When the request parameters fail validation (before sending).
   * @throws {TransportError} When the transport layer throws an error.
   * @throws {ApiRequestError} When the API returns an unsuccessful response.
   *
   * @example
   * ```ts
   * import * as hl from "@nktkas/hyperliquid";
   * import { privateKeyToAccount } from "npm:viem/accounts";
   *
   * const wallet = privateKeyToAccount("0x..."); // viem or ethers
   * const transport = new hl.HttpTransport(); // or `WebSocketTransport`
   * const client = new hl.ExchangeClient({ transport, wallet });
   *
   * const data = await client.createSubAccount({ name: "..." });
   * ```
   *
   * @see null
   */
  createSubAccount(
    params: CreateSubAccountParameters,
    opts?: CreateSubAccountOptions,
  ): Promise<CreateSubAccountSuccessResponse> {
    return createSubAccount(this.config_, params, opts);
  }

  /**
   * Create a vault.
   *
   * @param params Parameters specific to the API request.
   * @param opts Request execution options.
   * @return Response for creating a vault.
   *
   * @throws {ValiError} When the request parameters fail validation (before sending).
   * @throws {TransportError} When the transport layer throws an error.
   * @throws {ApiRequestError} When the API returns an unsuccessful response.
   *
   * @example
   * ```ts
   * import * as hl from "@nktkas/hyperliquid";
   * import { privateKeyToAccount } from "npm:viem/accounts";
   *
   * const wallet = privateKeyToAccount("0x..."); // viem or ethers
   * const transport = new hl.HttpTransport(); // or `WebSocketTransport`
   * const client = new hl.ExchangeClient({ transport, wallet });
   *
   * const data = await client.createVault({
   *   name: "...",
   *   description: "...",
   *   initialUsd: 100 * 1e6,
   *   nonce: Date.now(),
   * });
   * ```
   *
   * @see null
   */
  createVault(
    params: CreateVaultParameters,
    opts?: CreateVaultOptions,
  ): Promise<CreateVaultSuccessResponse> {
    return createVault(this.config_, params, opts);
  }

  /**
   * Jail or unjail self as a validator signer.
   *
   * @param params Parameters specific to the API request.
   * @param opts Request execution options.
   * @return Successful response without specific data.
   *
   * @throws {ValiError} When the request parameters fail validation (before sending).
   * @throws {TransportError} When the transport layer throws an error.
   * @throws {ApiRequestError} When the API returns an unsuccessful response.
   *
   * @example Jail self
   * ```ts
   * import * as hl from "@nktkas/hyperliquid";
   * import { privateKeyToAccount } from "npm:viem/accounts";
   *
   * const wallet = privateKeyToAccount("0x..."); // viem or ethers
   * const transport = new hl.HttpTransport(); // or `WebSocketTransport`
   * const client = new hl.ExchangeClient({ transport, wallet });
   *
   * await client.cSignerAction({ jailSelf: null });
   * ```
   *
   * @example Unjail self
   * ```ts
   * import * as hl from "@nktkas/hyperliquid";
   * import { privateKeyToAccount } from "npm:viem/accounts";
   *
   * const wallet = privateKeyToAccount("0x..."); // viem or ethers
   * const transport = new hl.HttpTransport(); // or `WebSocketTransport`
   * const client = new hl.ExchangeClient({ transport, wallet });
   *
   * await client.cSignerAction({ unjailSelf: null });
   * ```
   *
   * @see null
   */
  cSignerAction(
    params: CSignerActionParameters,
    opts?: CSignerActionOptions,
  ): Promise<CSignerActionSuccessResponse> {
    return cSignerAction(this.config_, params, opts);
  }

  /**
   * Action related to validator management.
   *
   * @param params Parameters specific to the API request.
   * @param opts Request execution options.
   * @return Successful response without specific data.
   *
   * @throws {ValiError} When the request parameters fail validation (before sending).
   * @throws {TransportError} When the transport layer throws an error.
   * @throws {ApiRequestError} When the API returns an unsuccessful response.
   *
   * @example
   * ```ts
   * import * as hl from "@nktkas/hyperliquid";
   * import { privateKeyToAccount } from "npm:viem/accounts";
   *
   * const wallet = privateKeyToAccount("0x..."); // viem or ethers
   * const transport = new hl.HttpTransport(); // or `WebSocketTransport`
   * const client = new hl.ExchangeClient({ transport, wallet });
   *
   * await client.cValidatorAction({
   *   changeProfile: {
   *     node_ip: { Ip: "1.2.3.4" },
   *     name: "...",
   *     description: "...",
   *     unjailed: true,
   *     disable_delegations: false,
   *     commission_bps: null,
   *     signer: null,
   *   },
   * });
   * ```
   *
   * @see null
   */
  cValidatorAction(
    params: CValidatorActionParameters,
    opts?: CValidatorActionOptions,
  ): Promise<CValidatorActionSuccessResponse> {
    return cValidatorAction(this.config_, params, opts);
  }

  /**
   * Transfer native token from staking into the user's spot account.
   *
   * @param params Parameters specific to the API request.
   * @param opts Request execution options.
   * @return Successful response without specific data.
   *
   * @throws {ValiError} When the request parameters fail validation (before sending).
   * @throws {TransportError} When the transport layer throws an error.
   * @throws {ApiRequestError} When the API returns an unsuccessful response.
   *
   * @example
   * ```ts
   * import * as hl from "@nktkas/hyperliquid";
   * import { privateKeyToAccount } from "npm:viem/accounts";
   *
   * const wallet = privateKeyToAccount("0x..."); // viem or ethers
   * const transport = new hl.HttpTransport(); // or `WebSocketTransport`
   * const client = new hl.ExchangeClient({ transport, wallet });
   *
   * await client.cWithdraw({ wei: 1 * 1e8 });
   * ```
   *
   * @see https://hyperliquid.gitbook.io/hyperliquid-docs/for-developers/api/exchange-endpoint#withdraw-from-staking
   */
  cWithdraw(
    params: CWithdrawParameters,
    opts?: CWithdrawOptions,
  ): Promise<CWithdrawSuccessResponse> {
    return cWithdraw(this.config_, params, opts);
  }

  /**
   * Configure block type for EVM transactions.
   *
   * @param params Parameters specific to the API request.
   * @param opts Request execution options.
   * @return Successful response without specific data.
   *
   * @throws {ValiError} When the request parameters fail validation (before sending).
   * @throws {TransportError} When the transport layer throws an error.
   * @throws {ApiRequestError} When the API returns an unsuccessful response.
   *
   * @example
   * ```ts
   * import * as hl from "@nktkas/hyperliquid";
   * import { privateKeyToAccount } from "npm:viem/accounts";
   *
   * const wallet = privateKeyToAccount("0x..."); // viem or ethers
   * const transport = new hl.HttpTransport(); // or `WebSocketTransport`
   * const client = new hl.ExchangeClient({ transport, wallet });
   *
   * await client.evmUserModify({ usingBigBlocks: true });
   * ```
   *
   * @see https://hyperliquid.gitbook.io/hyperliquid-docs/for-developers/hyperevm/dual-block-architecture
   */
  evmUserModify(
    params: EvmUserModifyParameters,
    opts?: EvmUserModifyOptions,
  ): Promise<EvmUserModifySuccessResponse> {
    return evmUserModify(this.config_, params, opts);
  }

  /**
   * Link staking and trading accounts for fee discount attribution.
   *
   * @param params Parameters specific to the API request.
   * @param opts Request execution options.
   * @return Successful response without specific data.
   *
   * @throws {ValiError} When the request parameters fail validation (before sending).
   * @throws {TransportError} When the transport layer throws an error.
   * @throws {ApiRequestError} When the API returns an unsuccessful response.
   *
   * @example
   * ```ts
   * import * as hl from "@nktkas/hyperliquid";
   * import { privateKeyToAccount } from "npm:viem/accounts";
   *
   * const wallet = privateKeyToAccount("0x..."); // viem or ethers
   * const transport = new hl.HttpTransport(); // or `WebSocketTransport`
   * const client = new hl.ExchangeClient({ transport, wallet });
   *
   * await client.linkStakingUser({ user: "0x...", isFinalize: false });
   * ```
   *
   * @see https://hyperliquid.gitbook.io/hyperliquid-docs/trading/fees#staking-linking
   */
  linkStakingUser(
    params: LinkStakingUserParameters,
    opts?: LinkStakingUserOptions,
  ): Promise<LinkStakingUserSuccessResponse> {
    return linkStakingUser(this.config_, params, opts);
  }

  /**
   * Modify an order.
   *
   * @param params Parameters specific to the API request.
   * @param opts Request execution options.
   * @return Successful response without specific data.
   *
   * @throws {ValiError} When the request parameters fail validation (before sending).
   * @throws {TransportError} When the transport layer throws an error.
   * @throws {ApiRequestError} When the API returns an unsuccessful response.
   *
   * @example
   * ```ts
   * import * as hl from "@nktkas/hyperliquid";
   * import { privateKeyToAccount } from "npm:viem/accounts";
   *
   * const wallet = privateKeyToAccount("0x..."); // viem or ethers
   * const transport = new hl.HttpTransport(); // or `WebSocketTransport`
   * const client = new hl.ExchangeClient({ transport, wallet });
   *
   * await client.modify({
   *   oid: 123,
   *   order: {
   *     a: 0,
   *     b: true,
   *     p: "31000",
   *     s: "0.2",
   *     r: false,
   *     t: { limit: { tif: "Gtc" } },
   *   },
   * });
   * ```
   *
   * @see https://hyperliquid.gitbook.io/hyperliquid-docs/for-developers/api/exchange-endpoint#modify-an-order
   */
  modify(
    params: ModifyParameters,
    opts?: ModifyOptions,
  ): Promise<ModifySuccessResponse> {
    return modify(this.config_, params, opts);
  }

  /**
   * Place an order(s).
   *
   * @param params Parameters specific to the API request.
   * @param opts Request execution options.
   * @return Successful variant of {@link OrderResponse} without error statuses.
   *
   * @throws {ValiError} When the request parameters fail validation (before sending).
   * @throws {TransportError} When the transport layer throws an error.
   * @throws {ApiRequestError} When the API returns an unsuccessful response.
   *
   * @example
   * ```ts
   * import * as hl from "@nktkas/hyperliquid";
   * import { privateKeyToAccount } from "npm:viem/accounts";
   *
   * const wallet = privateKeyToAccount("0x..."); // viem or ethers
   * const transport = new hl.HttpTransport(); // or `WebSocketTransport`
   * const client = new hl.ExchangeClient({ transport, wallet });
   *
   * const data = await client.order({
   *   orders: [
   *     {
   *       a: 0,
   *       b: true,
   *       p: "30000",
   *       s: "0.1",
   *       r: false,
   *       t: { limit: { tif: "Gtc" } },
   *     },
   *   ],
   *   grouping: "na",
   * });
   * ```
   *
   * @see https://hyperliquid.gitbook.io/hyperliquid-docs/for-developers/api/exchange-endpoint#place-an-order
   */
  order(
    params: OrderParameters,
    opts?: OrderOptions,
  ): Promise<OrderSuccessResponse> {
    return order(this.config_, params, opts);
  }

  /**
   * This action does not do anything (no operation), but causes the nonce to be marked as used.
   *
   * @param opts Request execution options.
   * @return Successful response without specific data.
   *
   * @throws {ValiError} When the request parameters fail validation (before sending).
   * @throws {TransportError} When the transport layer throws an error.
   * @throws {ApiRequestError} When the API returns an unsuccessful response.
   *
   * @example
   * ```ts
   * import * as hl from "@nktkas/hyperliquid";
   * import { privateKeyToAccount } from "npm:viem/accounts";
   *
   * const wallet = privateKeyToAccount("0x..."); // viem or ethers
   * const transport = new hl.HttpTransport(); // or `WebSocketTransport`
   * const client = new hl.ExchangeClient({ transport, wallet });
   *
   * await client.noop();
   * ```
   *
   * @see https://hyperliquid.gitbook.io/hyperliquid-docs/for-developers/api/exchange-endpoint#invalidate-pending-nonce-noop
   */
  noop(
    opts?: NoopOptions,
  ): Promise<NoopSuccessResponse> {
    return noop(this.config_, opts);
  }

  /**
   * Deploying HIP-3 assets.
   *
   * @param params Parameters specific to the API request.
   * @param opts Request execution options.
   * @return Successful response without specific data.
   *
   * @throws {ValiError} When the request parameters fail validation (before sending).
   * @throws {TransportError} When the transport layer throws an error.
   * @throws {ApiRequestError} When the API returns an unsuccessful response.
   *
   * @example
   * ```ts
   * import * as hl from "@nktkas/hyperliquid";
   * import { privateKeyToAccount } from "npm:viem/accounts";
   *
   * const wallet = privateKeyToAccount("0x..."); // viem or ethers
   * const transport = new hl.HttpTransport(); // or `WebSocketTransport`
   * const client = new hl.ExchangeClient({ transport, wallet });
   *
   * await client.perpDeploy({
   *   registerAsset: {
   *     maxGas: 1000000,
   *     assetRequest: {
   *       coin: "USDC",
   *       szDecimals: 8,
   *       oraclePx: "1",
   *       marginTableId: 1,
   *       onlyIsolated: false,
   *     },
   *     dex: "test",
   *     schema: null,
   *   },
   * });
   * ```
   *
   * @see https://hyperliquid.gitbook.io/hyperliquid-docs/for-developers/api/hip-3-deployer-actions
   */
  perpDeploy(
    params: PerpDeployParameters,
    opts?: PerpDeployOptions,
  ): Promise<PerpDeploySuccessResponse> {
    return perpDeploy(this.config_, params, opts);
  }

  /**
   * Create a referral code.
   *
   * @param params Parameters specific to the API request.
   * @param opts Request execution options.
   * @return Successful response without specific data.
   *
   * @throws {ValiError} When the request parameters fail validation (before sending).
   * @throws {TransportError} When the transport layer throws an error.
   * @throws {ApiRequestError} When the API returns an unsuccessful response.
   *
   * @example
   * ```ts
   * import * as hl from "@nktkas/hyperliquid";
   * import { privateKeyToAccount } from "npm:viem/accounts";
   *
   * const wallet = privateKeyToAccount("0x..."); // viem or ethers
   * const transport = new hl.HttpTransport(); // or `WebSocketTransport`
   * const client = new hl.ExchangeClient({ transport, wallet });
   *
   * await client.registerReferrer({ code: "..." });
   * ```
   *
   * @see null
   */
  registerReferrer(
    params: RegisterReferrerParameters,
    opts?: RegisterReferrerOptions,
  ): Promise<RegisterReferrerSuccessResponse> {
    return registerReferrer(this.config_, params, opts);
  }

  /**
   * Reserve additional rate-limited actions for a fee.
   *
   * @param params Parameters specific to the API request.
   * @param opts Request execution options.
   * @return Successful response without specific data.
   *
   * @throws {ValiError} When the request parameters fail validation (before sending).
   * @throws {TransportError} When the transport layer throws an error.
   * @throws {ApiRequestError} When the API returns an unsuccessful response.
   *
   * @example
   * ```ts
   * import * as hl from "@nktkas/hyperliquid";
   * import { privateKeyToAccount } from "npm:viem/accounts";
   *
   * const wallet = privateKeyToAccount("0x..."); // viem or ethers
   * const transport = new hl.HttpTransport(); // or `WebSocketTransport`
   * const client = new hl.ExchangeClient({ transport, wallet });
   *
   * await client.reserveRequestWeight({ weight: 10 });
   * ```
   *
   * @see https://hyperliquid.gitbook.io/hyperliquid-docs/for-developers/api/exchange-endpoint#reserve-additional-actions
   */
  reserveRequestWeight(
    params: ReserveRequestWeightParameters,
    opts?: ReserveRequestWeightOptions,
  ): Promise<ReserveRequestWeightSuccessResponse> {
    return reserveRequestWeight(this.config_, params, opts);
  }

  /**
   * Schedule a cancel-all operation at a future time.
   *
   * @param params Parameters specific to the API request.
   * @param opts Request execution options.
   * @return Successful response without specific data.
   *
   * @throws {ValiError} When the request parameters fail validation (before sending).
   * @throws {TransportError} When the transport layer throws an error.
   * @throws {ApiRequestError} When the API returns an unsuccessful response.
   *
   * @example
   * ```ts
   * import * as hl from "@nktkas/hyperliquid";
   * import { privateKeyToAccount } from "npm:viem/accounts";
   *
   * const wallet = privateKeyToAccount("0x..."); // viem or ethers
   * const transport = new hl.HttpTransport(); // or `WebSocketTransport`
   * const client = new hl.ExchangeClient({ transport, wallet });
   *
   * await client.scheduleCancel({ time: Date.now() + 10_000 });
   * ```
   *
   * @see https://hyperliquid.gitbook.io/hyperliquid-docs/for-developers/api/exchange-endpoint#schedule-cancel-dead-mans-switch
   */
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

  /**
   * Transfer tokens between different perp DEXs, spot balance, users, and/or sub-accounts.
   *
   * @param params Parameters specific to the API request.
   * @param opts Request execution options.
   * @return Successful response without specific data.
   *
   * @throws {ValiError} When the request parameters fail validation (before sending).
   * @throws {TransportError} When the transport layer throws an error.
   * @throws {ApiRequestError} When the API returns an unsuccessful response.
   *
   * @example
   * ```ts
   * import * as hl from "@nktkas/hyperliquid";
   * import { privateKeyToAccount } from "npm:viem/accounts";
   *
   * const wallet = privateKeyToAccount("0x..."); // viem or ethers
   * const transport = new hl.HttpTransport(); // or `WebSocketTransport`
   * const client = new hl.ExchangeClient({ transport, wallet });
   *
   * await client.sendAsset({
   *   destination: "0x0000000000000000000000000000000000000001",
   *   sourceDex: "",
   *   destinationDex: "test",
   *   token: "USDC:0xeb62eee3685fc4c43992febcd9e75443",
   *   amount: "1",
   * });
   * ```
   *
   * @see https://hyperliquid.gitbook.io/hyperliquid-docs/for-developers/api/exchange-endpoint#send-asset
   */
  sendAsset(
    params: SendAssetParameters,
    opts?: SendAssetOptions,
  ): Promise<SendAssetSuccessResponse> {
    return sendAsset(this.config_, params, opts);
  }

  /**
   * Set the display name in the leaderboard.
   *
   * @param params Parameters specific to the API request.
   * @param opts Request execution options.
   * @return Successful response without specific data.
   *
   * @throws {ValiError} When the request parameters fail validation (before sending).
   * @throws {TransportError} When the transport layer throws an error.
   * @throws {ApiRequestError} When the API returns an unsuccessful response.
   *
   * @example
   * ```ts
   * import * as hl from "@nktkas/hyperliquid";
   * import { privateKeyToAccount } from "npm:viem/accounts";
   *
   * const wallet = privateKeyToAccount("0x..."); // viem or ethers
   * const transport = new hl.HttpTransport(); // or `WebSocketTransport`
   * const client = new hl.ExchangeClient({ transport, wallet });
   *
   * await client.setDisplayName({ displayName: "..." });
   * ```
   *
   * @see null
   */
  setDisplayName(
    params: SetDisplayNameParameters,
    opts?: SetDisplayNameOptions,
  ): Promise<SetDisplayNameSuccessResponse> {
    return setDisplayName(this.config_, params, opts);
  }

  /**
   * Set a referral code.
   *
   * @param params Parameters specific to the API request.
   * @param opts Request execution options.
   * @return Successful response without specific data.
   *
   * @throws {ValiError} When the request parameters fail validation (before sending).
   * @throws {TransportError} When the transport layer throws an error.
   * @throws {ApiRequestError} When the API returns an unsuccessful response.
   *
   * @example
   * ```ts
   * import * as hl from "@nktkas/hyperliquid";
   * import { privateKeyToAccount } from "npm:viem/accounts";
   *
   * const wallet = privateKeyToAccount("0x..."); // viem or ethers
   * const transport = new hl.HttpTransport(); // or `WebSocketTransport`
   * const client = new hl.ExchangeClient({ transport, wallet });
   *
   * await client.setReferrer({ code: "..." });
   * ```
   *
   * @see null
   */
  setReferrer(
    params: SetReferrerParameters,
    opts?: SetReferrerOptions,
  ): Promise<SetReferrerSuccessResponse> {
    return setReferrer(this.config_, params, opts);
  }

  /**
   * Deploying HIP-1 and HIP-2 assets.
   *
   * @param params Parameters specific to the API request.
   * @param opts Request execution options.
   * @return Successful response without specific data.
   *
   * @throws {ValiError} When the request parameters fail validation (before sending).
   * @throws {TransportError} When the transport layer throws an error.
   * @throws {ApiRequestError} When the API returns an unsuccessful response.
   *
   * @example
   * ```ts
   * import * as hl from "@nktkas/hyperliquid";
   * import { privateKeyToAccount } from "npm:viem/accounts";
   *
   * const wallet = privateKeyToAccount("0x..."); // viem or ethers
   * const transport = new hl.HttpTransport(); // or `WebSocketTransport`
   * const client = new hl.ExchangeClient({ transport, wallet });
   *
   * await client.spotDeploy({
   *   registerToken2: {
   *     spec: {
   *       name: "USDC",
   *       szDecimals: 8,
   *       weiDecimals: 8,
   *     },
   *     maxGas: 1000000,
   *     fullName: "USD Coin",
   *   },
   * });
   * ```
   *
   * @see https://hyperliquid.gitbook.io/hyperliquid-docs/for-developers/api/deploying-hip-1-and-hip-2-assets
   */
  spotDeploy(
    params: SpotDeployParameters,
    opts?: SpotDeployOptions,
  ): Promise<SpotDeploySuccessResponse> {
    return spotDeploy(this.config_, params, opts);
  }

  /**
   * Send spot assets to another address.
   *
   * @param params Parameters specific to the API request.
   * @param opts Request execution options.
   * @return Successful response without specific data.
   *
   * @throws {ValiError} When the request parameters fail validation (before sending).
   * @throws {TransportError} When the transport layer throws an error.
   * @throws {ApiRequestError} When the API returns an unsuccessful response.
   *
   * @example
   * ```ts
   * import * as hl from "@nktkas/hyperliquid";
   * import { privateKeyToAccount } from "npm:viem/accounts";
   *
   * const wallet = privateKeyToAccount("0x..."); // viem or ethers
   * const transport = new hl.HttpTransport(); // or `WebSocketTransport`
   * const client = new hl.ExchangeClient({ transport, wallet });
   *
   * await client.spotSend({
   *   destination: "0x...",
   *   token: "USDC:0xeb62eee3685fc4c43992febcd9e75443",
   *   amount: "1",
   * });
   * ```
   *
   * @see https://hyperliquid.gitbook.io/hyperliquid-docs/for-developers/api/exchange-endpoint#core-spot-transfer
   */
  spotSend(
    params: SpotSendParameters,
    opts?: SpotSendOptions,
  ): Promise<SpotSendSuccessResponse> {
    return spotSend(this.config_, params, opts);
  }

  /**
   * Opt Out of Spot Dusting.
   *
   * @param params Parameters specific to the API request.
   * @param opts Request execution options.
   * @return Successful response without specific data.
   *
   * @throws {ValiError} When the request parameters fail validation (before sending).
   * @throws {TransportError} When the transport layer throws an error.
   * @throws {ApiRequestError} When the API returns an unsuccessful response.
   *
   * @example
   * ```ts
   * import * as hl from "@nktkas/hyperliquid";
   * import { privateKeyToAccount } from "npm:viem/accounts";
   *
   * const wallet = privateKeyToAccount("0x..."); // viem or ethers
   * const transport = new hl.HttpTransport(); // or `WebSocketTransport`
   * const client = new hl.ExchangeClient({ transport, wallet });
   *
   * await client.spotUser({ toggleSpotDusting: { optOut: false } });
   * ```
   *
   * @see null
   */
  spotUser(
    params: SpotUserParameters,
    opts?: SpotUserOptions,
  ): Promise<SpotUserSuccessResponse> {
    return spotUser(this.config_, params, opts);
  }

  /**
   * Modify a sub-account.
   *
   * @param params Parameters specific to the API request.
   * @param opts Request execution options.
   * @return Successful response without specific data.
   *
   * @throws {ValiError} When the request parameters fail validation (before sending).
   * @throws {TransportError} When the transport layer throws an error.
   * @throws {ApiRequestError} When the API returns an unsuccessful response.
   *
   * @example
   * ```ts
   * import * as hl from "@nktkas/hyperliquid";
   * import { privateKeyToAccount } from "npm:viem/accounts";
   *
   * const wallet = privateKeyToAccount("0x..."); // viem or ethers
   * const transport = new hl.HttpTransport(); // or `WebSocketTransport`
   * const client = new hl.ExchangeClient({ transport, wallet });
   *
   * await client.subAccountModify({ subAccountUser: "0x...", name: "..." });
   * ```
   *
   * @see null
   */
  subAccountModify(
    params: SubAccountModifyParameters,
    opts?: SubAccountModifyOptions,
  ): Promise<SubAccountModifySuccessResponse> {
    return subAccountModify(this.config_, params, opts);
  }

  /**
   * Transfer between sub-accounts (spot).
   *
   * @param params Parameters specific to the API request.
   * @param opts Request execution options.
   * @return Successful response without specific data.
   *
   * @throws {ValiError} When the request parameters fail validation (before sending).
   * @throws {TransportError} When the transport layer throws an error.
   * @throws {ApiRequestError} When the API returns an unsuccessful response.
   *
   * @example
   * ```ts
   * import * as hl from "@nktkas/hyperliquid";
   * import { privateKeyToAccount } from "npm:viem/accounts";
   *
   * const wallet = privateKeyToAccount("0x..."); // viem or ethers
   * const transport = new hl.HttpTransport(); // or `WebSocketTransport`
   * const client = new hl.ExchangeClient({ transport, wallet });
   *
   * await client.subAccountSpotTransfer({
   *   subAccountUser: "0x...",
   *   isDeposit: true,
   *   token: "USDC:0xeb62eee3685fc4c43992febcd9e75443",
   *   amount: "1",
   * });
   * ```
   *
   * @see null
   */
  subAccountSpotTransfer(
    params: SubAccountSpotTransferParameters,
    opts?: SubAccountSpotTransferOptions,
  ): Promise<SubAccountSpotTransferSuccessResponse> {
    return subAccountSpotTransfer(this.config_, params, opts);
  }

  /**
   * Transfer between sub-accounts (perpetual).
   *
   * @param params Parameters specific to the API request.
   * @param opts Request execution options.
   * @return Successful response without specific data.
   *
   * @throws {ValiError} When the request parameters fail validation (before sending).
   * @throws {TransportError} When the transport layer throws an error.
   * @throws {ApiRequestError} When the API returns an unsuccessful response.
   *
   * @example
   * ```ts
   * import * as hl from "@nktkas/hyperliquid";
   * import { privateKeyToAccount } from "npm:viem/accounts";
   *
   * const wallet = privateKeyToAccount("0x..."); // viem or ethers
   * const transport = new hl.HttpTransport(); // or `WebSocketTransport`
   * const client = new hl.ExchangeClient({ transport, wallet });
   *
   * await client.subAccountTransfer({
   *   subAccountUser: "0x...",
   *   isDeposit: true,
   *   usd: 1 * 1e6,
   * });
   * ```
   *
   * @see null
   */
  subAccountTransfer(
    params: SubAccountTransferParameters,
    opts?: SubAccountTransferOptions,
  ): Promise<SubAccountTransferSuccessResponse> {
    return subAccountTransfer(this.config_, params, opts);
  }

  /**
   * Delegate or undelegate native tokens to or from a validator.
   *
   * @param params Parameters specific to the API request.
   * @param opts Request execution options.
   * @return Successful response without specific data.
   *
   * @throws {ValiError} When the request parameters fail validation (before sending).
   * @throws {TransportError} When the transport layer throws an error.
   * @throws {ApiRequestError} When the API returns an unsuccessful response.
   *
   * @example
   * ```ts
   * import * as hl from "@nktkas/hyperliquid";
   * import { privateKeyToAccount } from "npm:viem/accounts";
   *
   * const wallet = privateKeyToAccount("0x..."); // viem or ethers
   * const transport = new hl.HttpTransport(); // or `WebSocketTransport`
   * const client = new hl.ExchangeClient({ transport, wallet });
   *
   * await client.tokenDelegate({
   *   validator: "0x...",
   *   isUndelegate: true,
   *   wei: 1 * 1e8,
   * });
   * ```
   *
   * @see https://hyperliquid.gitbook.io/hyperliquid-docs/for-developers/api/exchange-endpoint#delegate-or-undelegate-stake-from-validator
   */
  tokenDelegate(
    params: TokenDelegateParameters,
    opts?: TokenDelegateOptions,
  ): Promise<TokenDelegateSuccessResponse> {
    return tokenDelegate(this.config_, params, opts);
  }

  /**
   * Cancel a TWAP order.
   *
   * @param params Parameters specific to the API request.
   * @param opts Request execution options.
   * @return Successful variant of {@link TwapCancelResponse} without error status.
   *
   * @throws {ValiError} When the request parameters fail validation (before sending).
   * @throws {TransportError} When the transport layer throws an error.
   * @throws {ApiRequestError} When the API returns an unsuccessful response.
   *
   * @example
   * ```ts
   * import * as hl from "@nktkas/hyperliquid";
   * import { privateKeyToAccount } from "npm:viem/accounts";
   *
   * const wallet = privateKeyToAccount("0x..."); // viem or ethers
   * const transport = new hl.HttpTransport(); // or `WebSocketTransport`
   * const client = new hl.ExchangeClient({ transport, wallet });
   *
   * await client.twapCancel({ a: 0, t: 1 });
   * ```
   *
   * @see https://hyperliquid.gitbook.io/hyperliquid-docs/for-developers/api/exchange-endpoint#cancel-a-twap-order
   */
  twapCancel(
    params: TwapCancelParameters,
    opts?: TwapCancelOptions,
  ): Promise<TwapCancelSuccessResponse> {
    return twapCancel(this.config_, params, opts);
  }

  /**
   * Place a TWAP order.
   *
   * @param params Parameters specific to the API request.
   * @param opts Request execution options.
   * @return Successful variant of {@link TwapOrderResponse} without error status.
   *
   * @throws {ValiError} When the request parameters fail validation (before sending).
   * @throws {TransportError} When the transport layer throws an error.
   * @throws {ApiRequestError} When the API returns an unsuccessful response.
   *
   * @example
   * ```ts
   * import * as hl from "@nktkas/hyperliquid";
   * import { privateKeyToAccount } from "npm:viem/accounts";
   *
   * const wallet = privateKeyToAccount("0x..."); // viem or ethers
   * const transport = new hl.HttpTransport(); // or `WebSocketTransport`
   * const client = new hl.ExchangeClient({ transport, wallet });
   *
   * const data = await client.twapOrder({
   *   twap: {
   *     a: 0,
   *     b: true,
   *     s: "1",
   *     r: false,
   *     m: 10,
   *     t: true,
   *   },
   * });
   * ```
   *
   * @see https://hyperliquid.gitbook.io/hyperliquid-docs/for-developers/api/exchange-endpoint#place-a-twap-order
   */
  twapOrder(
    params: TwapOrderParameters,
    opts?: TwapOrderOptions,
  ): Promise<TwapOrderSuccessResponse> {
    return twapOrder(this.config_, params, opts);
  }

  /**
   * Add or remove margin from isolated position.
   *
   * @param params Parameters specific to the API request.
   * @param opts Request execution options.
   * @return Successful response without specific data.
   *
   * @throws {ValiError} When the request parameters fail validation (before sending).
   * @throws {TransportError} When the transport layer throws an error.
   * @throws {ApiRequestError} When the API returns an unsuccessful response.
   *
   * @example
   * ```ts
   * import * as hl from "@nktkas/hyperliquid";
   * import { privateKeyToAccount } from "npm:viem/accounts";
   *
   * const wallet = privateKeyToAccount("0x..."); // viem or ethers
   * const transport = new hl.HttpTransport(); // or `WebSocketTransport`
   * const client = new hl.ExchangeClient({ transport, wallet });
   *
   * await client.updateIsolatedMargin({ asset: 0, isBuy: true, ntli: 1 * 1e6 });
   * ```
   *
   * @see https://hyperliquid.gitbook.io/hyperliquid-docs/for-developers/api/exchange-endpoint#update-isolated-margin
   */
  updateIsolatedMargin(
    params: UpdateIsolatedMarginParameters,
    opts?: UpdateIsolatedMarginOptions,
  ): Promise<UpdateIsolatedMarginSuccessResponse> {
    return updateIsolatedMargin(this.config_, params, opts);
  }

  /**
   * Update cross or isolated leverage on a coin.
   *
   * @param params Parameters specific to the API request.
   * @param opts Request execution options.
   * @return Successful response without specific data.
   *
   * @throws {ValiError} When the request parameters fail validation (before sending).
   * @throws {TransportError} When the transport layer throws an error.
   * @throws {ApiRequestError} When the API returns an unsuccessful response.
   *
   * @example
   * ```ts
   * import * as hl from "@nktkas/hyperliquid";
   * import { privateKeyToAccount } from "npm:viem/accounts";
   *
   * const wallet = privateKeyToAccount("0x..."); // viem or ethers
   * const transport = new hl.HttpTransport(); // or `WebSocketTransport`
   * const client = new hl.ExchangeClient({ transport, wallet });
   *
   * await client.updateLeverage({ asset: 0, isCross: true, leverage: 5 });
   * ```
   *
   * @see https://hyperliquid.gitbook.io/hyperliquid-docs/for-developers/api/exchange-endpoint#update-leverage
   */
  updateLeverage(
    params: UpdateLeverageParameters,
    opts?: UpdateLeverageOptions,
  ): Promise<UpdateLeverageSuccessResponse> {
    return updateLeverage(this.config_, params, opts);
  }

  /**
   * Transfer funds between Spot account and Perp account.
   *
   * @param params Parameters specific to the API request.
   * @param opts Request execution options.
   * @return Successful response without specific data.
   *
   * @throws {ValiError} When the request parameters fail validation (before sending).
   * @throws {TransportError} When the transport layer throws an error.
   * @throws {ApiRequestError} When the API returns an unsuccessful response.
   *
   * @example
   * ```ts
   * import * as hl from "@nktkas/hyperliquid";
   * import { privateKeyToAccount } from "npm:viem/accounts";
   *
   * const wallet = privateKeyToAccount("0x..."); // viem or ethers
   * const transport = new hl.HttpTransport(); // or `WebSocketTransport`
   * const client = new hl.ExchangeClient({ transport, wallet });
   *
   * await client.usdClassTransfer({ amount: "1", toPerp: true });
   * ```
   *
   * @see https://hyperliquid.gitbook.io/hyperliquid-docs/for-developers/api/exchange-endpoint#transfer-from-spot-account-to-perp-account-and-vice-versa
   */
  usdClassTransfer(
    params: UsdClassTransferParameters,
    opts?: UsdClassTransferOptions,
  ): Promise<UsdClassTransferSuccessResponse> {
    return usdClassTransfer(this.config_, params, opts);
  }

  /**
   * Send usd to another address.
   *
   * @param params Parameters specific to the API request.
   * @param opts Request execution options.
   * @return Successful response without specific data.
   *
   * @throws {ValiError} When the request parameters fail validation (before sending).
   * @throws {TransportError} When the transport layer throws an error.
   * @throws {ApiRequestError} When the API returns an unsuccessful response.
   *
   * @example
   * ```ts
   * import * as hl from "@nktkas/hyperliquid";
   * import { privateKeyToAccount } from "npm:viem/accounts";
   *
   * const wallet = privateKeyToAccount("0x..."); // viem or ethers
   * const transport = new hl.HttpTransport(); // or `WebSocketTransport`
   * const client = new hl.ExchangeClient({ transport, wallet });
   *
   * await client.usdSend({ destination: "0x...", amount: "1" });
   * ```
   *
   * @see https://hyperliquid.gitbook.io/hyperliquid-docs/for-developers/api/exchange-endpoint#core-usdc-transfer
   */
  usdSend(
    params: UsdSendParameters,
    opts?: UsdSendOptions,
  ): Promise<UsdSendSuccessResponse> {
    return usdSend(this.config_, params, opts);
  }

  /**
   * Enable/disable HIP-3 DEX abstraction.
   *
   * @param params Parameters specific to the API request.
   * @param opts Request execution options.
   * @return Successful response without specific data.
   *
   * @throws {ValiError} When the request parameters fail validation (before sending).
   * @throws {TransportError} When the transport layer throws an error.
   * @throws {ApiRequestError} When the API returns an unsuccessful response.
   *
   * @example
   * ```ts
   * import * as hl from "@nktkas/hyperliquid";
   * import { privateKeyToAccount } from "npm:viem/accounts";
   *
   * const wallet = privateKeyToAccount("0x..."); // viem or ethers
   * const transport = new hl.HttpTransport(); // or `WebSocketTransport`
   * const client = new hl.ExchangeClient({ transport, wallet });
   *
   * await client.userDexAbstraction({ user: "0x...", enabled: true });
   * ```
   *
   * @see https://hyperliquid.gitbook.io/hyperliquid-docs/for-developers/api/exchange-endpoint#enable-hip-3-dex-abstraction
   *
   * @deprecated Use {@link userSetAbstraction} instead.
   */
  userDexAbstraction(
    params: UserDexAbstractionParameters,
    opts?: UserDexAbstractionOptions,
  ): Promise<UserDexAbstractionSuccessResponse> {
    return userDexAbstraction(this.config_, params, opts);
  }

  /**
   * Set user abstraction mode.
   *
   * @param params Parameters specific to the API request.
   * @param opts Request execution options.
   * @return Successful response without specific data.
   *
   * @throws {ValiError} When the request parameters fail validation (before sending).
   * @throws {TransportError} When the transport layer throws an error.
   * @throws {ApiRequestError} When the API returns an unsuccessful response.
   *
   * @example
   * ```ts
   * import * as hl from "@nktkas/hyperliquid";
   * import { privateKeyToAccount } from "npm:viem/accounts";
   *
   * const wallet = privateKeyToAccount("0x..."); // viem or ethers
   * const transport = new hl.HttpTransport(); // or `WebSocketTransport`
   * const client = new hl.ExchangeClient({ transport, wallet });
   *
   * await client.userSetAbstraction({ user: "0x...", abstraction: "dexAbstraction" });
   * ```
   *
   * @see https://hyperliquid.gitbook.io/hyperliquid-docs/for-developers/api/exchange-endpoint#set-user-abstraction
   */
  userSetAbstraction(
    params: UserSetAbstractionParameters,
    opts?: UserSetAbstractionOptions,
  ): Promise<UserSetAbstractionSuccessResponse> {
    return userSetAbstraction(this.config_, params, opts);
  }

  /**
   * Enable/disable user portfolio margin.
   *
   * @param params Parameters specific to the API request.
   * @param opts Request execution options.
   * @return Successful response without specific data.
   *
   * @throws {ValiError} When the request parameters fail validation (before sending).
   * @throws {TransportError} When the transport layer throws an error.
   * @throws {ApiRequestError} When the API returns an unsuccessful response.
   *
   * @example
   * ```ts
   * import * as hl from "@nktkas/hyperliquid";
   * import { privateKeyToAccount } from "npm:viem/accounts";
   *
   * const wallet = privateKeyToAccount("0x..."); // viem or ethers
   * const transport = new hl.HttpTransport(); // or `WebSocketTransport`
   * const client = new hl.ExchangeClient({ transport, wallet });
   *
   * await client.userPortfolioMargin({ user: "0x...", enabled: true });
   * ```
   *
   * @see https://hyperliquid.gitbook.io/hyperliquid-docs/trading/portfolio-margin
   */
  userPortfolioMargin(
    params: UserPortfolioMarginParameters,
    opts?: UserPortfolioMarginOptions,
  ): Promise<UserPortfolioMarginSuccessResponse> {
    return userPortfolioMargin(this.config_, params, opts);
  }

  /**
   * Validator vote on risk-free rate for aligned quote asset.
   *
   * @param params Parameters specific to the API request.
   * @param opts Request execution options.
   * @return Successful response without specific data.
   *
   * @throws {ValiError} When the request parameters fail validation (before sending).
   * @throws {TransportError} When the transport layer throws an error.
   * @throws {ApiRequestError} When the API returns an unsuccessful response.
   *
   * @example
   * ```ts
   * import * as hl from "@nktkas/hyperliquid";
   * import { privateKeyToAccount } from "npm:viem/accounts";
   *
   * const wallet = privateKeyToAccount("0x..."); // viem or ethers
   * const transport = new hl.HttpTransport(); // or `WebSocketTransport`
   * const client = new hl.ExchangeClient({ transport, wallet });
   *
   * await client.validatorL1Stream({ riskFreeRate: "0.05" });
   * ```
   *
   * @see https://hyperliquid.gitbook.io/hyperliquid-docs/for-developers/api/exchange-endpoint#validator-vote-on-risk-free-rate-for-aligned-quote-asset
   */
  validatorL1Stream(
    params: ValidatorL1StreamParameters,
    opts?: ValidatorL1StreamOptions,
  ): Promise<ValidatorL1StreamSuccessResponse> {
    return validatorL1Stream(this.config_, params, opts);
  }

  /**
   * Distribute funds from a vault between followers.
   *
   * @param params Parameters specific to the API request.
   * @param opts Request execution options.
   * @return Successful response without specific data.
   *
   * @throws {ValiError} When the request parameters fail validation (before sending).
   * @throws {TransportError} When the transport layer throws an error.
   * @throws {ApiRequestError} When the API returns an unsuccessful response.
   *
   * @example
   * ```ts
   * import * as hl from "@nktkas/hyperliquid";
   * import { privateKeyToAccount } from "npm:viem/accounts";
   *
   * const wallet = privateKeyToAccount("0x..."); // viem or ethers
   * const transport = new hl.HttpTransport(); // or `WebSocketTransport`
   * const client = new hl.ExchangeClient({ transport, wallet });
   *
   * await client.vaultDistribute({ vaultAddress: "0x...", usd: 10 * 1e6 });
   * ```
   *
   * @see null
   */
  vaultDistribute(
    params: VaultDistributeParameters,
    opts?: VaultDistributeOptions,
  ): Promise<VaultDistributeSuccessResponse> {
    return vaultDistribute(this.config_, params, opts);
  }

  /**
   * Modify a vault's configuration.
   *
   * @param params Parameters specific to the API request.
   * @param opts Request execution options.
   * @return Successful response without specific data.
   *
   * @throws {ValiError} When the request parameters fail validation (before sending).
   * @throws {TransportError} When the transport layer throws an error.
   * @throws {ApiRequestError} When the API returns an unsuccessful response.
   *
   * @example
   * ```ts
   * import * as hl from "@nktkas/hyperliquid";
   * import { privateKeyToAccount } from "npm:viem/accounts";
   *
   * const wallet = privateKeyToAccount("0x..."); // viem or ethers
   * const transport = new hl.HttpTransport(); // or `WebSocketTransport`
   * const client = new hl.ExchangeClient({ transport, wallet });
   *
   * await client.vaultModify({
   *   vaultAddress: "0x...",
   *   allowDeposits: true,
   *   alwaysCloseOnWithdraw: false,
   * });
   * ```
   *
   * @see null
   */
  vaultModify(
    params: VaultModifyParameters,
    opts?: VaultModifyOptions,
  ): Promise<VaultModifySuccessResponse> {
    return vaultModify(this.config_, params, opts);
  }

  /**
   * Deposit or withdraw from a vault.
   *
   * @param params Parameters specific to the API request.
   * @param opts Request execution options.
   * @return Successful response without specific data.
   *
   * @throws {ValiError} When the request parameters fail validation (before sending).
   * @throws {TransportError} When the transport layer throws an error.
   * @throws {ApiRequestError} When the API returns an unsuccessful response.
   *
   * @example
   * ```ts
   * import * as hl from "@nktkas/hyperliquid";
   * import { privateKeyToAccount } from "npm:viem/accounts";
   *
   * const wallet = privateKeyToAccount("0x..."); // viem or ethers
   * const transport = new hl.HttpTransport(); // or `WebSocketTransport`
   * const client = new hl.ExchangeClient({ transport, wallet });
   *
   * await client.vaultTransfer({
   *   vaultAddress: "0x...",
   *   isDeposit: true,
   *   usd: 10 * 1e6,
   * });
   * ```
   *
   * @see https://hyperliquid.gitbook.io/hyperliquid-docs/for-developers/api/exchange-endpoint#deposit-or-withdraw-from-a-vault
   */
  vaultTransfer(
    params: VaultTransferParameters,
    opts?: VaultTransferOptions,
  ): Promise<VaultTransferSuccessResponse> {
    return vaultTransfer(this.config_, params, opts);
  }

  /**
   * Initiate a withdrawal request.
   *
   * @param params Parameters specific to the API request.
   * @param opts Request execution options.
   * @return Successful response without specific data.
   *
   * @throws {ValiError} When the request parameters fail validation (before sending).
   * @throws {TransportError} When the transport layer throws an error.
   * @throws {ApiRequestError} When the API returns an unsuccessful response.
   *
   * @example
   * ```ts
   * import * as hl from "@nktkas/hyperliquid";
   * import { privateKeyToAccount } from "npm:viem/accounts";
   *
   * const wallet = privateKeyToAccount("0x..."); // viem or ethers
   * const transport = new hl.HttpTransport(); // or `WebSocketTransport`
   * const client = new hl.ExchangeClient({ transport, wallet });
   *
   * await client.withdraw3({ destination: "0x...", amount: "1" });
   * ```
   *
   * @see https://hyperliquid.gitbook.io/hyperliquid-docs/for-developers/api/exchange-endpoint#initiate-a-withdrawal-request
   */
  withdraw3(
    params: Withdraw3Parameters,
    opts?: Withdraw3Options,
  ): Promise<Withdraw3SuccessResponse> {
    return withdraw3(this.config_, params, opts);
  }
}

// ============================================================
// Type Re-exports
// ============================================================

export { ApiRequestError } from "./_methods/_base/errors.ts";
export type { ExchangeMultiSigConfig, ExchangeSingleWalletConfig } from "./_methods/_base/execute.ts";

export type {
  AgentEnableDexAbstractionOptions,
  AgentEnableDexAbstractionSuccessResponse,
} from "./_methods/agentEnableDexAbstraction.ts";
export type {
  AgentSetAbstractionOptions,
  AgentSetAbstractionParameters,
  AgentSetAbstractionSuccessResponse,
} from "./_methods/agentSetAbstraction.ts";
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
export type { BorrowLendOptions, BorrowLendParameters, BorrowLendSuccessResponse } from "./_methods/borrowLend.ts";
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
export type { NoopOptions, NoopSuccessResponse } from "./_methods/noop.ts";
export type { OrderOptions, OrderParameters, OrderSuccessResponse } from "./_methods/order.ts";
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
  UserDexAbstractionOptions as UserDexAbstractionExchangeOptions,
  UserDexAbstractionParameters,
  UserDexAbstractionParameters as UserDexAbstractionExchangeParameters,
  UserDexAbstractionSuccessResponse,
  UserDexAbstractionSuccessResponse as UserDexAbstractionExchangeSuccessResponse,
} from "./_methods/userDexAbstraction.ts";
export type {
  UserPortfolioMarginOptions,
  UserPortfolioMarginParameters,
  UserPortfolioMarginSuccessResponse,
} from "./_methods/userPortfolioMargin.ts";
export type {
  UserSetAbstractionOptions,
  UserSetAbstractionParameters,
  UserSetAbstractionSuccessResponse,
} from "./_methods/userSetAbstraction.ts";
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
