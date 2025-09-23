import type { OmitFirst, OverloadedParameters } from "../_common.ts";
import type { ExchangeRequestConfig, MaybePromise, MultiSignRequestConfig } from "./_common.ts";
import type { IRequestTransport } from "../../transport/base.ts";
import type { AbstractWallet } from "../../signing/mod.ts";
import { PrivateKeyEIP712Signer } from "../../utils/minimalEIP712Signer.ts";

import { approveAgent } from "./approveAgent.ts";
import { approveBuilderFee } from "./approveBuilderFee.ts";
import { batchModify } from "./batchModify.ts";
import { cancel } from "./cancel.ts";
import { cancelByCloid } from "./cancelByCloid.ts";
import { cDeposit } from "./cDeposit.ts";
import { claimRewards } from "./claimRewards.ts";
import { convertToMultiSigUser } from "./convertToMultiSigUser.ts";
import { createSubAccount } from "./createSubAccount.ts";
import { createVault } from "./createVault.ts";
import { cSignerAction } from "./cSignerAction.ts";
import { cValidatorAction } from "./cValidatorAction.ts";
import { cWithdraw } from "./cWithdraw.ts";
import { evmUserModify } from "./evmUserModify.ts";
import { modify } from "./modify.ts";
import { multiSig } from "./multiSig.ts";
import { order } from "./order.ts";
import { noop } from "./noop.ts";
import { perpDeploy } from "./perpDeploy.ts";
import { registerReferrer } from "./registerReferrer.ts";
import { reserveRequestWeight } from "./reserveRequestWeight.ts";
import { scheduleCancel } from "./scheduleCancel.ts";
import { sendAsset } from "./sendAsset.ts";
import { setDisplayName } from "./setDisplayName.ts";
import { setReferrer } from "./setReferrer.ts";
import { spotDeploy } from "./spotDeploy.ts";
import { spotSend } from "./spotSend.ts";
import { spotUser } from "./spotUser.ts";
import { subAccountModify } from "./subAccountModify.ts";
import { subAccountSpotTransfer } from "./subAccountSpotTransfer.ts";
import { subAccountTransfer } from "./subAccountTransfer.ts";
import { tokenDelegate } from "./tokenDelegate.ts";
import { twapCancel } from "./twapCancel.ts";
import { twapOrder } from "./twapOrder.ts";
import { updateIsolatedMargin } from "./updateIsolatedMargin.ts";
import { updateLeverage } from "./updateLeverage.ts";
import { usdClassTransfer } from "./usdClassTransfer.ts";
import { usdSend } from "./usdSend.ts";
import { vaultDistribute } from "./vaultDistribute.ts";
import { vaultModify } from "./vaultModify.ts";
import { vaultTransfer } from "./vaultTransfer.ts";
import { withdraw3 } from "./withdraw3.ts";

export type { ApproveAgentParameters } from "./approveAgent.ts";
export type { ApproveBuilderFeeParameters } from "./approveBuilderFee.ts";
export type { BatchModifyParameters } from "./batchModify.ts";
export type { CancelParameters } from "./cancel.ts";
export type { CancelByCloidParameters } from "./cancelByCloid.ts";
export type { CDepositParameters } from "./cDeposit.ts";
export type { ConvertToMultiSigUserParameters } from "./convertToMultiSigUser.ts";
export type { CreateSubAccountParameters } from "./createSubAccount.ts";
export type { CreateVaultParameters } from "./createVault.ts";
export type { CSignerActionParameters } from "./cSignerAction.ts";
export type { CValidatorActionParameters } from "./cValidatorAction.ts";
export type { CWithdrawParameters } from "./cWithdraw.ts";
export type { EvmUserModifyParameters } from "./evmUserModify.ts";
export type { ModifyParameters } from "./modify.ts";
export type { MultiSigParameters } from "./multiSig.ts";
export type { OrderParameters } from "./order.ts";
export type { PerpDeployParameters } from "./perpDeploy.ts";
export type { RegisterReferrerParameters } from "./registerReferrer.ts";
export type { ReserveRequestWeightParameters } from "./reserveRequestWeight.ts";
export type { ScheduleCancelParameters } from "./scheduleCancel.ts";
export type { SendAssetParameters } from "./sendAsset.ts";
export type { SetDisplayNameParameters } from "./setDisplayName.ts";
export type { SetReferrerParameters } from "./setReferrer.ts";
export type { SpotDeployParameters } from "./spotDeploy.ts";
export type { SpotSendParameters } from "./spotSend.ts";
export type { SpotUserParameters } from "./spotUser.ts";
export type { SubAccountModifyParameters } from "./subAccountModify.ts";
export type { SubAccountSpotTransferParameters } from "./subAccountSpotTransfer.ts";
export type { SubAccountTransferParameters } from "./subAccountTransfer.ts";
export type { TokenDelegateParameters } from "./tokenDelegate.ts";
export type { TwapCancelParameters } from "./twapCancel.ts";
export type { TwapOrderParameters } from "./twapOrder.ts";
export type { UpdateIsolatedMarginParameters } from "./updateIsolatedMargin.ts";
export type { UpdateLeverageParameters } from "./updateLeverage.ts";
export type { UsdClassTransferParameters } from "./usdClassTransfer.ts";
export type { UsdSendParameters } from "./usdSend.ts";
export type { VaultDistributeParameters } from "./vaultDistribute.ts";
export type { VaultModifyParameters } from "./vaultModify.ts";
export type { VaultTransferParameters } from "./vaultTransfer.ts";
export type { Withdraw3Parameters } from "./withdraw3.ts";

export type { CancelSuccessResponse } from "./cancel.ts";
export type { CreateSubAccountResponse } from "./createSubAccount.ts";
export type { CreateVaultResponse } from "./createVault.ts";
export type { OrderSuccessResponse } from "./order.ts";
export type { TwapCancelSuccessResponse } from "./twapCancel.ts";
export type { TwapOrderSuccessResponse } from "./twapOrder.ts";
export type { ErrorResponse, SuccessResponse } from "./_common.ts";

export { ApiRequestError } from "./_common.ts";

/**
 * A client for interacting with the Hyperliquid Exchange API.
 * @typeParam T The transport (extends {@linkcode IRequestTransport}) used to connect to the Hyperliquid API.
 * @typeParam W The wallet used for signing transactions.
 */
export class ExchangeClient<
  T extends IRequestTransport = IRequestTransport,
  W extends AbstractWallet = AbstractWallet,
> implements ExchangeRequestConfig<T, W> {
  transport: T;
  wallet: W;
  signatureChainId?: string | (() => MaybePromise<string>);
  nonceManager?: () => MaybePromise<number>;
  defaultVaultAddress?: string;
  defaultExpiresAfter?: number | (() => MaybePromise<number>);

  /**
   * Initialises a new instance.
   * @param args - The parameters for the client.
   *
   * @example via a private key
   * ```ts
   * import * as hl from "@nktkas/hyperliquid";
   *
   * const privateKey = "0x...";
   *
   * const transport = new hl.HttpTransport(); // or `WebSocketTransport`
   * const exchClient = new hl.ExchangeClient({ wallet: privateKey, transport });
   * ```
   *
   * @example via [viem](https://viem.sh/docs/clients/wallet#local-accounts-private-key-mnemonic-etc)
   * ```ts
   * import * as hl from "@nktkas/hyperliquid";
   *
   * const pk = "0x...";
   *
   * const transport = new hl.HttpTransport();
   * const exchClient = new hl.ExchangeClient({ wallet: pk, transport });
   * ```
   *
   * @example via [ethers.js v6](https://docs.ethers.org/v6/api/wallet/#Wallet) or [ethers.js v5](https://docs.ethers.org/v5/api/signer/#Wallet)
   * ```ts
   * import * as hl from "@nktkas/hyperliquid";
   * import { ethers } from "npm:ethers";
   *
   * const wallet = new ethers.Wallet("0x...");
   *
   * const transport = new hl.HttpTransport();
   * const exchClient = new hl.ExchangeClient({ wallet, transport });
   * ```
   *
   * @example via an external wallet (e.g. MetaMask) with [viem](https://viem.sh/docs/clients/wallet)
   * ```ts
   * import * as hl from "@nktkas/hyperliquid";
   * import { createWalletClient, custom } from "npm:viem";
   *
   * const ethereum = (window as any).ethereum;
   * const [account] = await ethereum.request({ method: "eth_requestAccounts" }) as `0x${string}`[];
   * const wallet = createWalletClient({ account, transport: custom(ethereum) });
   *
   * const transport = new hl.HttpTransport();
   * const exchClient = new hl.ExchangeClient({ wallet, transport });
   * ```
   */
  constructor(
    args:
      & Omit<ExchangeRequestConfig<T, W>, "wallet">
      & (Pick<ExchangeRequestConfig<T, W>, "wallet"> | { wallet: string }),
  ) {
    this.transport = args.transport;
    this.wallet = typeof args.wallet === "string"
      // convert private key string to PrivateKeyEIP712Signer instance
      ? new PrivateKeyEIP712Signer(args.wallet) as unknown as W
      : args.wallet;
    this.defaultVaultAddress = args.defaultVaultAddress;
    this.defaultExpiresAfter = args.defaultExpiresAfter;
    this.signatureChainId = args.signatureChainId;
    this.nonceManager = args.nonceManager;
  }

  /**
   * Approve an agent to sign on behalf of the master account.
   * @param params - Parameters specific to the API request.
   * @param opts - Request execution options.
   * @returns Successful response without specific data.
   *
   * @throws {ApiRequestError} When the API returns an unsuccessful response.
   * @throws {TransportError} When the transport layer throws an error.
   *
   * @see https://hyperliquid.gitbook.io/hyperliquid-docs/for-developers/api/exchange-endpoint#approve-an-api-wallet
   * @example
   * ```ts
   * import * as hl from "@nktkas/hyperliquid";
   *
   * const pk = "0x..."; // viem, ethers or private key
   * const transport = new hl.HttpTransport(); // or `WebSocketTransport`
   *
   * const client = new hl.ExchangeClient({ transport, wallet: pk });
   * await client.approveAgent({ agentAddress: "0x...", agentName: "..." });
   * ```
   */
  approveAgent(...args: OmitFirst<OverloadedParameters<typeof approveAgent>>) {
    return approveAgent(this, ...args);
  }

  /**
   * Approve a maximum fee rate for a builder.
   * @param params - Parameters specific to the API request.
   * @param opts - Request execution options.
   * @returns Successful response without specific data.
   *
   * @throws {ApiRequestError} When the API returns an unsuccessful response.
   * @throws {TransportError} When the transport layer throws an error.
   *
   * @see https://hyperliquid.gitbook.io/hyperliquid-docs/for-developers/api/exchange-endpoint#approve-a-builder-fee
   * @example
   * ```ts
   * import * as hl from "@nktkas/hyperliquid";
   *
   * const pk = "0x..."; // viem, ethers or private key
   * const transport = new hl.HttpTransport(); // or `WebSocketTransport`
   *
   * const client = new hl.ExchangeClient({ transport, wallet: pk });
   * await client.approveBuilderFee({ maxFeeRate: "0.01%", builder: "0x..." });
   * ```
   */
  approveBuilderFee(...args: OmitFirst<OverloadedParameters<typeof approveBuilderFee>>) {
    return approveBuilderFee(this, ...args);
  }

  /**
   * Modify multiple orders.
   * @param params - Parameters specific to the API request.
   * @param opts - Request execution options.
   * @returns Successful variant of {@link OrderResponse} without error statuses.
   *
   * @throws {ApiRequestError} When the API returns an unsuccessful response.
   * @throws {TransportError} When the transport layer throws an error.
   *
   * @see https://hyperliquid.gitbook.io/hyperliquid-docs/for-developers/api/exchange-endpoint#modify-multiple-orders
   * @example
   * ```ts
   * import * as hl from "@nktkas/hyperliquid";
   *
   * const pk = "0x..."; // viem, ethers or private key
   * const transport = new hl.HttpTransport(); // or `WebSocketTransport`
   *
   * const client = new hl.ExchangeClient({ transport, wallet: pk });
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
   */
  batchModify(...args: OmitFirst<OverloadedParameters<typeof batchModify>>) {
    return batchModify(this, ...args);
  }

  /**
   * Cancel order(s).
   * @param params - Parameters specific to the API request.
   * @param opts - Request execution options.
   * @returns Successful variant of {@link CancelResponse} without error statuses.
   *
   * @throws {ApiRequestError} When the API returns an unsuccessful response.
   * @throws {TransportError} When the transport layer throws an error.
   *
   * @see https://hyperliquid.gitbook.io/hyperliquid-docs/for-developers/api/exchange-endpoint#cancel-order-s
   * @example
   * ```ts
   * import * as hl from "@nktkas/hyperliquid";
   *
   * const pk = "0x..."; // viem, ethers or private key
   * const transport = new hl.HttpTransport(); // or `WebSocketTransport`
   *
   * const client = new hl.ExchangeClient({ transport, wallet: pk });
   * const data = await client.cancel({
   *   cancels: [
   *     { a: 0, o: 123 },
   *   ],
   * });
   * ```
   */
  cancel(...args: OmitFirst<OverloadedParameters<typeof cancel>>) {
    return cancel(this, ...args);
  }

  /**
   * Cancel order(s) by cloid.
   * @param params - Parameters specific to the API request.
   * @param opts - Request execution options.
   * @returns Successful variant of {@link CancelResponse} without error statuses.
   *
   * @throws {ApiRequestError} When the API returns an unsuccessful response.
   * @throws {TransportError} When the transport layer throws an error.
   *
   * @see https://hyperliquid.gitbook.io/hyperliquid-docs/for-developers/api/exchange-endpoint#cancel-order-s-by-cloid
   * @example
   * ```ts
   * import * as hl from "@nktkas/hyperliquid";
   *
   * const pk = "0x..."; // viem, ethers or private key
   * const transport = new hl.HttpTransport(); // or `WebSocketTransport`
   *
   * const client = new hl.ExchangeClient({ transport, wallet: pk });
   * const data = await client.cancelByCloid({
   *   cancels: [
   *     { asset: 0, cloid: "0x..." },
   *   ],
   * });
   * ```
   */
  cancelByCloid(...args: OmitFirst<OverloadedParameters<typeof cancelByCloid>>) {
    return cancelByCloid(this, ...args);
  }

  /**
   * Transfer native token from the user spot account into staking for delegating to validators.
   * @param params - Parameters specific to the API request.
   * @param opts - Request execution options.
   * @returns Successful response without specific data.
   *
   * @throws {ApiRequestError} When the API returns an unsuccessful response.
   * @throws {TransportError} When the transport layer throws an error.
   *
   * @see https://hyperliquid.gitbook.io/hyperliquid-docs/for-developers/api/exchange-endpoint#deposit-into-staking
   * @example
   * ```ts
   * import * as hl from "@nktkas/hyperliquid";
   *
   * const pk = "0x..."; // viem, ethers or private key
   * const transport = new hl.HttpTransport(); // or `WebSocketTransport`
   *
   * const client = new hl.ExchangeClient({ transport, wallet: pk });
   * await client.cDeposit({ wei: 1 * 1e8 });
   * ```
   */
  cDeposit(...args: OmitFirst<OverloadedParameters<typeof cDeposit>>) {
    return cDeposit(this, ...args);
  }

  /**
   * Claim rewards from referral program.
   * @param opts - Request execution options.
   * @returns Successful response without specific data.
   *
   * @throws {ApiRequestError} When the API returns an unsuccessful response.
   * @throws {TransportError} When the transport layer throws an error.
   *
   * @see null
   * @example
   * ```ts
   * import * as hl from "@nktkas/hyperliquid";
   *
   * const pk = "0x..."; // viem, ethers or private key
   * const transport = new hl.HttpTransport(); // or `WebSocketTransport`
   *
   * const client = new hl.ExchangeClient({ transport, wallet: pk });
   * await client.claimRewards();
   * ```
   */
  claimRewards(...args: OmitFirst<OverloadedParameters<typeof claimRewards>>) {
    return claimRewards(this, ...args);
  }

  /**
   * Convert a single-signature account to a multi-signature account or vice versa.
   * @param params - Parameters specific to the API request.
   * @param opts - Request execution options.
   * @returns Successful response without specific data.
   *
   * @throws {ApiRequestError} When the API returns an unsuccessful response.
   * @throws {TransportError} When the transport layer throws an error.
   *
   * @see https://hyperliquid.gitbook.io/hyperliquid-docs/hypercore/multi-sig
   * @example
   * ```ts
   * import * as hl from "@nktkas/hyperliquid";
   *
   * const pk = "0x..."; // viem, ethers or private key
   * const transport = new hl.HttpTransport(); // or `WebSocketTransport`
   *
   * const client = new hl.ExchangeClient({ transport, wallet: pk });
   *
   * // Convert to multi-sig user
   * await client.convertToMultiSigUser({
   *   signers: {
   *     authorizedUsers: ["0x...", "0x...", "0x..."],
   *     threshold: 2,
   *   },
   * });
   *
   * // Convert to single-sig user
   * await client.convertToMultiSigUser({ signers: null });
   * ```
   */
  convertToMultiSigUser(...args: OmitFirst<OverloadedParameters<typeof convertToMultiSigUser>>) {
    return convertToMultiSigUser(this, ...args);
  }

  /**
   * Create a sub-account.
   * @param params - Parameters specific to the API request.
   * @param opts - Request execution options.
   * @returns Response for creating a sub-account.
   *
   * @throws {ApiRequestError} When the API returns an unsuccessful response.
   * @throws {TransportError} When the transport layer throws an error.
   *
   * @see null
   * @example
   * ```ts
   * import * as hl from "@nktkas/hyperliquid";
   *
   * const pk = "0x..."; // viem, ethers or private key
   * const transport = new hl.HttpTransport(); // or `WebSocketTransport`
   *
   * const client = new hl.ExchangeClient({ transport, wallet: pk });
   * const data = await client.createSubAccount({ name: "..." });
   * ```
   */
  createSubAccount(...args: OmitFirst<OverloadedParameters<typeof createSubAccount>>) {
    return createSubAccount(this, ...args);
  }

  /**
   * Create a vault.
   * @param params - Parameters specific to the API request.
   * @param opts - Request execution options.
   * @returns Response for creating a vault.
   *
   * @throws {ApiRequestError} When the API returns an unsuccessful response.
   * @throws {TransportError} When the transport layer throws an error.
   *
   * @see null
   * @example
   * ```ts
   * import * as hl from "@nktkas/hyperliquid";
   *
   * const pk = "0x..."; // viem, ethers or private key
   * const transport = new hl.HttpTransport(); // or `WebSocketTransport`
   *
   * const client = new hl.ExchangeClient({ transport, wallet: pk });
   * const data = await client.createVault({
   *   name: "...",
   *   description: "...",
   *   initialUsd: 100 * 1e6,
   * });
   * ```
   */
  createVault(...args: OmitFirst<OverloadedParameters<typeof createVault>>) {
    return createVault(this, ...args);
  }

  /**
   * Jail or unjail self as a validator signer.
   * @param params - Parameters specific to the API request.
   * @param opts - Request execution options.
   * @returns Successful response without specific data.
   *
   * @throws {ApiRequestError} When the API returns an unsuccessful response.
   * @throws {TransportError} When the transport layer throws an error.
   *
   * @see null
   * @example
   * ```ts
   * import * as hl from "@nktkas/hyperliquid";
   *
   * const pk = "0x..."; // viem, ethers or private key
   * const transport = new hl.HttpTransport(); // or `WebSocketTransport`
   *
   * const client = new hl.ExchangeClient({ transport, wallet: pk });
   *
   * // Jail self
   * await client.cSignerAction({ jailSelf: null });
   *
   * // Unjail self
   * await client.cSignerAction({ unjailSelf: null });
   * ```
   */
  cSignerAction(...args: OmitFirst<OverloadedParameters<typeof cSignerAction>>) {
    return cSignerAction(this, ...args);
  }

  /**
   * Action related to validator management.
   * @param params - Parameters specific to the API request.
   * @param opts - Request execution options.
   * @returns Successful response without specific data.
   *
   * @throws {ApiRequestError} When the API returns an unsuccessful response.
   * @throws {TransportError} When the transport layer throws an error.
   *
   * @see null
   * @example
   * ```ts
   * import * as hl from "@nktkas/hyperliquid";
   *
   * const pk = "0x..."; // viem, ethers or private key
   * const transport = new hl.HttpTransport(); // or `WebSocketTransport`
   *
   * const client = new hl.ExchangeClient({ transport, wallet: pk });
   *
   * // Change validator profile
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
   *
   * // Register a new validator
   * await client.cValidatorAction({
   *   register: {
   *     profile: {
   *       node_ip: { Ip: "1.2.3.4" },
   *       name: "...",
   *       description: "...",
   *       delegations_disabled: true,
   *       commission_bps: 1,
   *       signer: "0x...",
   *     },
   *     unjailed: false,
   *     initial_wei: 1,
   *   },
   * });
   *
   * // Unregister a validator
   * await client.cValidatorAction({ unregister: null });
   * ```
   */
  cValidatorAction(...args: OmitFirst<OverloadedParameters<typeof cValidatorAction>>) {
    return cValidatorAction(this, ...args);
  }

  /**
   * Transfer native token from staking into the user's spot account.
   * @param params - Parameters specific to the API request.
   * @param opts - Request execution options.
   * @returns Successful response without specific data.
   *
   * @throws {ApiRequestError} When the API returns an unsuccessful response.
   * @throws {TransportError} When the transport layer throws an error.
   *
   * @see https://hyperliquid.gitbook.io/hyperliquid-docs/for-developers/api/exchange-endpoint#withdraw-from-staking
   * @example
   * ```ts
   * import * as hl from "@nktkas/hyperliquid";
   *
   * const pk = "0x..."; // viem, ethers or private key
   * const transport = new hl.HttpTransport(); // or `WebSocketTransport`
   *
   * const client = new hl.ExchangeClient({ transport, wallet: pk });
   * await client.cWithdraw({ wei: 1 * 1e8 });
   * ```
   */
  cWithdraw(...args: OmitFirst<OverloadedParameters<typeof cWithdraw>>) {
    return cWithdraw(this, ...args);
  }

  /**
   * Configure block type for EVM transactions.
   * @param params - Parameters specific to the API request.
   * @param opts - Request execution options.
   * @returns Response for creating a sub-account.
   *
   * @throws {ApiRequestError} When the API returns an unsuccessful response.
   * @throws {TransportError} When the transport layer throws an error.
   *
   * @see https://hyperliquid.gitbook.io/hyperliquid-docs/for-developers/hyperevm/dual-block-architecture
   * @example
   * ```ts
   * import * as hl from "@nktkas/hyperliquid";
   *
   * const pk = "0x..."; // viem, ethers or private key
   * const transport = new hl.HttpTransport(); // or `WebSocketTransport`
   *
   * const client = new hl.ExchangeClient({ transport, wallet: pk });
   * await client.evmUserModify({ usingBigBlocks: true });
   * ```
   */
  evmUserModify(...args: OmitFirst<OverloadedParameters<typeof evmUserModify>>) {
    return evmUserModify(this, ...args);
  }

  /**
   * Modify an order.
   * @param params - Parameters specific to the API request.
   * @param opts - Request execution options.
   * @returns Successful response without specific data.
   *
   * @throws {ApiRequestError} When the API returns an unsuccessful response.
   * @throws {TransportError} When the transport layer throws an error.
   *
   * @see https://hyperliquid.gitbook.io/hyperliquid-docs/for-developers/api/exchange-endpoint#modify-an-order
   * @example
   * ```ts
   * import * as hl from "@nktkas/hyperliquid";
   *
   * const pk = "0x..."; // viem, ethers or private key
   * const transport = new hl.HttpTransport(); // or `WebSocketTransport`
   *
   * const client = new hl.ExchangeClient({ transport, wallet: pk });
   * await client.modify({
   *   oid: 123,
   *   order: {
   *     a: 0,
   *     b: true,
   *     p: "31000",
   *     s: "0.2",
   *     r: false,
   *     t: { limit: { tif: "Gtc" } },
   *     c: "0x...",
   *   },
   * });
   * ```
   */
  modify(...args: OmitFirst<OverloadedParameters<typeof modify>>) {
    return modify(this, ...args);
  }

  /**
   * A multi-signature request.
   * @param params - Parameters specific to the API request.
   * @param opts - Request execution options.
   * @returns Any successful response.
   *
   * @throws {ApiRequestError} When the API returns an unsuccessful response.
   * @throws {TransportError} When the transport layer throws an error.
   *
   * @see https://hyperliquid.gitbook.io/hyperliquid-docs/hypercore/multi-sig
   * @example
   * ```ts
   * import * as hl from "@nktkas/hyperliquid";
   * import { signL1Action } from "@nktkas/hyperliquid/signing";
   * import { parser, ScheduleCancelRequest } from "@nktkas/hyperliquid/api/exchange";
   * import { privateKeyToAccount } from "npm:viem/accounts";
   *
   * const wallet = privateKeyToAccount("0x..."); // viem, ethers or private key
   * const multiSigUser = "0x...";
   * const transport = new hl.HttpTransport(); // or `WebSocketTransport`
   *
   * const client = new hl.ExchangeClient({ transport, wallet });
   * const nonce = Date.now();
   * const action = parser(ScheduleCancelRequest.entries.action)({
   *   type: "scheduleCancel",
   *   time: Date.now() + 10000,
   * });
   *
   * // Create the required number of signatures
   * const signatures = await Promise.all(["0x...", "0x..."].map(async (signerPrivKey) => {
   *   return await signL1Action({
   *     wallet: privateKeyToAccount(signerPrivKey as `0x${string}`), // viem or ethers
   *     action: [multiSigUser.toLowerCase(), wallet.address.toLowerCase(), action],
   *     nonce,
   *   });
   * }));
   *
   * // // or user-signed action
   * // const signatures = await Promise.all(["0x...", "0x..."].map(async (signerPrivKey) => {
   * //   return await signUserSignedAction({
   * //     wallet: privateKeyToAccount(signerPrivKey as `0x${string}`), // viem or ethers
   * //     action: {
   * //       ...action,
   * //       payloadMultiSigUser: multiSigUser,
   * //       outerSigner: wallet.address,
   * //     },
   * //     types: SomeTypes,
   * //   });
   * // }));
   *
   * // Then use signatures in the `multiSig` action
   * const data = await client.multiSig({
   *   signatures,
   *   payload: {
   *     multiSigUser,
   *     outerSigner: wallet.address,
   *     action,
   *   },
   *   nonce,
   * });
   * ```
   */
  multiSig(...args: OmitFirst<OverloadedParameters<typeof multiSig>>) {
    return multiSig(this, ...args);
  }

  /**
   * Place an order(s).
   * @param params - Parameters specific to the API request.
   * @param opts - Request execution options.
   * @returns Successful variant of {@link OrderResponse} without error statuses.
   *
   * @throws {ApiRequestError} When the API returns an unsuccessful response.
   * @throws {TransportError} When the transport layer throws an error.
   *
   * @see https://hyperliquid.gitbook.io/hyperliquid-docs/for-developers/api/exchange-endpoint#place-an-order
   * @example
   * ```ts
   * import * as hl from "@nktkas/hyperliquid";
   *
   * const pk = "0x..."; // viem, ethers or private key
   * const transport = new hl.HttpTransport(); // or `WebSocketTransport`
   *
   * const client = new hl.ExchangeClient({ transport, wallet: pk });
   * const data = await client.order({
   *   orders: [
   *     {
   *       a: 0,
   *       b: true,
   *       p: "30000",
   *       s: "0.1",
   *       r: false,
   *       t: { limit: { tif: "Gtc" } },
   *       c: "0x...",
   *     },
   *   ],
   *   grouping: "na",
   * });
   * ```
   */
  order(...args: OmitFirst<OverloadedParameters<typeof order>>) {
    return order(this, ...args);
  }

  /**
   * This action does not do anything (no operation), but causes the nonce to be marked as used.
   * @param params - Parameters specific to the API request.
   * @param opts - Request execution options.
   * @returns Successful response without specific data.
   *
   * @throws {ApiRequestError} When the API returns an unsuccessful response.
   * @throws {TransportError} When the transport layer throws an error.
   *
   * @see https://hyperliquid.gitbook.io/hyperliquid-docs/for-developers/api/exchange-endpoint#invalidate-pending-nonce-noop
   * @example
   * ```ts
   * import * as hl from "@nktkas/hyperliquid";
   *
   * const pk = "0x..."; // viem, ethers or private key
   * const transport = new hl.HttpTransport(); // or `WebSocketTransport`
   *
   * const client = new hl.ExchangeClient({ transport, wallet: pk });
   * await client.noop();
   * ```
   */
  noop(...args: OmitFirst<OverloadedParameters<typeof noop>>) {
    return noop(this, ...args);
  }

  /**
   * Deploying HIP-3 assets.
   * @param params - Parameters specific to the API request.
   * @param opts - Request execution options.
   * @returns Successful response without specific data.
   *
   * @throws {ApiRequestError} When the API returns an unsuccessful response.
   * @throws {TransportError} When the transport layer throws an error.
   *
   * @see https://hyperliquid.gitbook.io/hyperliquid-docs/for-developers/api/deploying-hip-3-assets
   * @example
   * ```ts
   * import * as hl from "@nktkas/hyperliquid";
   *
   * const pk = "0x..."; // viem, ethers or private key
   * const transport = new hl.HttpTransport(); // or `WebSocketTransport`
   *
   * const client = new hl.ExchangeClient({ transport, wallet: pk });
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
   */
  perpDeploy(...args: OmitFirst<OverloadedParameters<typeof perpDeploy>>) {
    return perpDeploy(this, ...args);
  }

  /**
   * Create a referral code.
   * @param params - Parameters specific to the API request.
   * @param opts - Request execution options.
   * @returns Successful response without specific data.
   *
   * @throws {ApiRequestError} When the API returns an unsuccessful response.
   * @throws {TransportError} When the transport layer throws an error.
   *
   * @see null
   * @example
   * ```ts
   * import * as hl from "@nktkas/hyperliquid";
   *
   * const pk = "0x..."; // viem, ethers or private key
   * const transport = new hl.HttpTransport(); // or `WebSocketTransport`
   *
   * const client = new hl.ExchangeClient({ transport, wallet: pk });
   * await client.registerReferrer({ code: "..." });
   * ```
   */
  registerReferrer(...args: OmitFirst<OverloadedParameters<typeof registerReferrer>>) {
    return registerReferrer(this, ...args);
  }

  /**
   * Reserve additional rate-limited actions for a fee.
   * @param params - Parameters specific to the API request.
   * @param opts - Request execution options.
   * @returns Successful response without specific data.
   *
   * @throws {ApiRequestError} When the API returns an unsuccessful response.
   * @throws {TransportError} When the transport layer throws an error.
   *
   * @see https://hyperliquid.gitbook.io/hyperliquid-docs/for-developers/api/exchange-endpoint#reserve-additional-actions
   * @example
   * ```ts
   * import * as hl from "@nktkas/hyperliquid";
   *
   * const pk = "0x..."; // viem, ethers or private key
   * const transport = new hl.HttpTransport(); // or `WebSocketTransport`
   *
   * const client = new hl.ExchangeClient({ transport, wallet: pk });
   * await client.reserveRequestWeight({ weight: 10 });
   * ```
   */
  reserveRequestWeight(...args: OmitFirst<OverloadedParameters<typeof reserveRequestWeight>>) {
    return reserveRequestWeight(this, ...args);
  }

  /**
   * Schedule a cancel-all operation at a future time.
   * @param params - Parameters specific to the API request.
   * @param opts - Request execution options.
   * @returns Successful response without specific data.
   *
   * @throws {ApiRequestError} When the API returns an unsuccessful response.
   * @throws {TransportError} When the transport layer throws an error.
   *
   * @see https://hyperliquid.gitbook.io/hyperliquid-docs/for-developers/api/exchange-endpoint#schedule-cancel-dead-mans-switch
   * @example
   * ```ts
   * import * as hl from "@nktkas/hyperliquid";
   *
   * const pk = "0x..."; // viem, ethers or private key
   * const transport = new hl.HttpTransport(); // or `WebSocketTransport`
   *
   * const client = new hl.ExchangeClient({ transport, wallet: pk });
   * await client.scheduleCancel({ time: Date.now() + 10_000 });
   * ```
   */
  scheduleCancel(...args: OmitFirst<OverloadedParameters<typeof scheduleCancel>>) {
    return scheduleCancel(
      this,
      // @ts-ignore: TypeScript can't resolve overloaded signatures from parameter unions
      ...args,
    );
  }

  /**
   * Transfer tokens between different perp DEXs, spot balance, users, and/or sub-accounts.
   * @param params - Parameters specific to the API request.
   * @param opts - Request execution options.
   * @returns Successful response without specific data.
   *
   * @throws {ApiRequestError} When the API returns an unsuccessful response.
   * @throws {TransportError} When the transport layer throws an error.
   *
   * @see https://hyperliquid.gitbook.io/hyperliquid-docs/for-developers/api/exchange-endpoint#send-asset-testnet-only
   * @example
   * ```ts
   * import * as hl from "@nktkas/hyperliquid";
   *
   * const pk = "0x..."; // viem, ethers or private key
   * const transport = new hl.HttpTransport(); // or `WebSocketTransport`
   *
   * const client = new hl.ExchangeClient({ transport, wallet: pk });
   * await client.sendAsset({
   *   destination: "0x0000000000000000000000000000000000000001",
   *   sourceDex: "",
   *   destinationDex: "test",
   *   token: "USDC:0xeb62eee3685fc4c43992febcd9e75443",
   *   amount: "1",
   * });
   * ```
   */
  sendAsset(...args: OmitFirst<OverloadedParameters<typeof sendAsset>>) {
    return sendAsset(this, ...args);
  }

  /**
   * Set the display name in the leaderboard.
   * @param params - Parameters specific to the API request.
   * @param opts - Request execution options.
   * @returns Successful response without specific data.
   *
   * @throws {ApiRequestError} When the API returns an unsuccessful response.
   * @throws {TransportError} When the transport layer throws an error.
   *
   * @see null
   * @example
   * ```ts
   * import * as hl from "@nktkas/hyperliquid";
   *
   * const pk = "0x..."; // viem, ethers or private key
   * const transport = new hl.HttpTransport(); // or `WebSocketTransport`
   *
   * const client = new hl.ExchangeClient({ transport, wallet: pk });
   * await client.setDisplayName({ displayName: "..." });
   * ```
   */
  setDisplayName(...args: OmitFirst<OverloadedParameters<typeof setDisplayName>>) {
    return setDisplayName(this, ...args);
  }

  /**
   * Set a referral code.
   * @param params - Parameters specific to the API request.
   * @param opts - Request execution options.
   * @returns Successful response without specific data.
   *
   * @throws {ApiRequestError} When the API returns an unsuccessful response.
   * @throws {TransportError} When the transport layer throws an error.
   *
   * @see null
   * @example
   * ```ts
   * import * as hl from "@nktkas/hyperliquid";
   *
   * const pk = "0x..."; // viem, ethers or private key
   * const transport = new hl.HttpTransport(); // or `WebSocketTransport`
   *
   * const client = new hl.ExchangeClient({ transport, wallet: pk });
   * await client.setReferrer({ code: "..." });
   * ```
   */
  setReferrer(...args: OmitFirst<OverloadedParameters<typeof setReferrer>>) {
    return setReferrer(this, ...args);
  }

  /**
   * Deploying HIP-1 and HIP-2 assets.
   * @param params - Parameters specific to the API request.
   * @param opts - Request execution options.
   * @returns Successful response without specific data.
   *
   * @throws {ApiRequestError} When the API returns an unsuccessful response.
   * @throws {TransportError} When the transport layer throws an error.
   *
   * @see https://hyperliquid.gitbook.io/hyperliquid-docs/for-developers/api/deploying-hip-1-and-hip-2-assets
   * @example
   * ```ts
   * import * as hl from "@nktkas/hyperliquid";
   *
   * const pk = "0x..."; // viem, ethers or private key
   * const transport = new hl.HttpTransport(); // or `WebSocketTransport`
   *
   * const client = new hl.ExchangeClient({ transport, wallet: pk });
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
   */
  spotDeploy(...args: OmitFirst<OverloadedParameters<typeof spotDeploy>>) {
    return spotDeploy(this, ...args);
  }

  /**
   * Send spot assets to another address.
   * @param params - Parameters specific to the API request.
   * @param opts - Request execution options.
   * @returns Successful response without specific data.
   *
   * @throws {ApiRequestError} When the API returns an unsuccessful response.
   * @throws {TransportError} When the transport layer throws an error.
   *
   * @see https://hyperliquid.gitbook.io/hyperliquid-docs/for-developers/api/exchange-endpoint#core-spot-transfer
   * @example
   * ```ts
   * import * as hl from "@nktkas/hyperliquid";
   *
   * const pk = "0x..."; // viem, ethers or private key
   * const transport = new hl.HttpTransport(); // or `WebSocketTransport`
   *
   * const client = new hl.ExchangeClient({ transport, wallet: pk });
   * await client.spotSend({
   *   destination: "0x...",
   *   token: "USDC:0xeb62eee3685fc4c43992febcd9e75443",
   *   amount: "1",
   * });
   * ```
   */
  spotSend(...args: OmitFirst<OverloadedParameters<typeof spotSend>>) {
    return spotSend(this, ...args);
  }

  /**
   * Opt Out of Spot Dusting.
   * @param params - Parameters specific to the API request.
   * @param opts - Request execution options.
   * @returns Successful response without specific data.
   *
   * @throws {ApiRequestError} When the API returns an unsuccessful response.
   * @throws {TransportError} When the transport layer throws an error.
   *
   * @see null
   * @example
   * ```ts
   * import * as hl from "@nktkas/hyperliquid";
   *
   * const pk = "0x..."; // viem, ethers or private key
   * const transport = new hl.HttpTransport(); // or `WebSocketTransport`
   *
   * const client = new hl.ExchangeClient({ transport, wallet: pk });
   * await client.spotUser({ toggleSpotDusting: { optOut: false } });
   * ```
   */
  spotUser(...args: OmitFirst<OverloadedParameters<typeof spotUser>>) {
    return spotUser(this, ...args);
  }

  /**
   * Modify a sub-account's.
   * @param params - Parameters specific to the API request.
   * @param opts - Request execution options.
   * @returns Successful response without specific data.
   *
   * @throws {ApiRequestError} When the API returns an unsuccessful response.
   * @throws {TransportError} When the transport layer throws an error.
   *
   * @see null
   * @example
   * ```ts
   * import * as hl from "@nktkas/hyperliquid";
   *
   * const pk = "0x..."; // viem, ethers or private key
   * const transport = new hl.HttpTransport(); // or `WebSocketTransport`
   *
   * const client = new hl.ExchangeClient({ transport, wallet: pk });
   * await client.subAccountModify({ subAccountUser: "0x...", name: "..." });
   * ```
   */
  subAccountModify(...args: OmitFirst<OverloadedParameters<typeof subAccountModify>>) {
    return subAccountModify(this, ...args);
  }

  /**
   * Transfer between sub-accounts (spot).
   * @param params - Parameters specific to the API request.
   * @param opts - Request execution options.
   * @returns Successful response without specific data.
   *
   * @throws {ApiRequestError} When the API returns an unsuccessful response.
   * @throws {TransportError} When the transport layer throws an error.
   *
   * @see null
   * @example
   * ```ts
   * import * as hl from "@nktkas/hyperliquid";
   *
   * const pk = "0x..."; // viem, ethers or private key
   * const transport = new hl.HttpTransport(); // or `WebSocketTransport`
   *
   * const client = new hl.ExchangeClient({ transport, wallet: pk });
   * await client.subAccountSpotTransfer({
   *   subAccountUser: "0x...",
   *   isDeposit: true,
   *   token: "USDC:0xeb62eee3685fc4c43992febcd9e75443",
   *   amount: "1",
   * });
   * ```
   */
  subAccountSpotTransfer(...args: OmitFirst<OverloadedParameters<typeof subAccountSpotTransfer>>) {
    return subAccountSpotTransfer(this, ...args);
  }

  /**
   * Transfer between sub-accounts (perpetual).
   * @param params - Parameters specific to the API request.
   * @param opts - Request execution options.
   * @returns Successful response without specific data.
   *
   * @throws {ApiRequestError} When the API returns an unsuccessful response.
   * @throws {TransportError} When the transport layer throws an error.
   *
   * @see null
   * @example
   * ```ts
   * import * as hl from "@nktkas/hyperliquid";
   *
   * const pk = "0x..."; // viem, ethers or private key
   * const transport = new hl.HttpTransport(); // or `WebSocketTransport`
   *
   * const client = new hl.ExchangeClient({ transport, wallet: pk });
   * await client.subAccountTransfer({ subAccountUser: "0x...", isDeposit: true, usd: 1 * 1e6 });
   * ```
   */
  subAccountTransfer(...args: OmitFirst<OverloadedParameters<typeof subAccountTransfer>>) {
    return subAccountTransfer(this, ...args);
  }

  /**
   * Delegate or undelegate native tokens to or from a validator.
   * @param params - Parameters specific to the API request.
   * @param opts - Request execution options.
   * @returns Successful response without specific data.
   *
   * @throws {ApiRequestError} When the API returns an unsuccessful response.
   * @throws {TransportError} When the transport layer throws an error.
   *
   * @see https://hyperliquid.gitbook.io/hyperliquid-docs/for-developers/api/exchange-endpoint#delegate-or-undelegate-stake-from-validator
   * @example
   * ```ts
   * import * as hl from "@nktkas/hyperliquid";
   *
   * const pk = "0x..."; // viem, ethers or private key
   * const transport = new hl.HttpTransport(); // or `WebSocketTransport`
   *
   * const client = new hl.ExchangeClient({ transport, wallet: pk });
   * await client.tokenDelegate({ validator: "0x...", isUndelegate: true, wei: 1 * 1e8 });
   * ```
   */
  tokenDelegate(...args: OmitFirst<OverloadedParameters<typeof tokenDelegate>>) {
    return tokenDelegate(this, ...args);
  }

  /**
   * Cancel a TWAP order.
   * @param params - Parameters specific to the API request.
   * @param opts - Request execution options.
   * @returns Successful variant of {@link TwapCancelResponse} without error status.
   *
   * @throws {ApiRequestError} When the API returns an unsuccessful response.
   * @throws {TransportError} When the transport layer throws an error.
   *
   * @see https://hyperliquid.gitbook.io/hyperliquid-docs/for-developers/api/exchange-endpoint#cancel-a-twap-order
   * @example
   * ```ts
   * import * as hl from "@nktkas/hyperliquid";
   *
   * const pk = "0x..."; // viem, ethers or private key
   * const transport = new hl.HttpTransport(); // or `WebSocketTransport`
   *
   * const client = new hl.ExchangeClient({ transport, wallet: pk });
   * const data = await client.twapCancel({ a: 0, t: 1 });
   * ```
   */
  twapCancel(...args: OmitFirst<OverloadedParameters<typeof twapCancel>>) {
    return twapCancel(this, ...args);
  }

  /**
   * Place a TWAP order.
   * @param params - Parameters specific to the API request.
   * @param opts - Request execution options.
   * @returns Successful variant of {@link TwapOrderResponse} without error status.
   *
   * @throws {ApiRequestError} When the API returns an unsuccessful response.
   * @throws {TransportError} When the transport layer throws an error.
   *
   * @see https://hyperliquid.gitbook.io/hyperliquid-docs/for-developers/api/exchange-endpoint#place-a-twap-order
   * @example
   * ```ts
   * import * as hl from "@nktkas/hyperliquid";
   *
   * const pk = "0x..."; // viem, ethers or private key
   * const transport = new hl.HttpTransport(); // or `WebSocketTransport`
   *
   * const client = new hl.ExchangeClient({ transport, wallet: pk });
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
   */
  twapOrder(...args: OmitFirst<OverloadedParameters<typeof twapOrder>>) {
    return twapOrder(this, ...args);
  }

  /**
   * Add or remove margin from isolated position.
   * @param params - Parameters specific to the API request.
   * @param opts - Request execution options.
   * @returns Successful response without specific data.
   *
   * @throws {ApiRequestError} When the API returns an unsuccessful response.
   * @throws {TransportError} When the transport layer throws an error.
   *
   * @see https://hyperliquid.gitbook.io/hyperliquid-docs/for-developers/api/exchange-endpoint#update-isolated-margin
   * @example
   * ```ts
   * import * as hl from "@nktkas/hyperliquid";
   *
   * const pk = "0x..."; // viem, ethers or private key
   * const transport = new hl.HttpTransport(); // or `WebSocketTransport`
   *
   * const client = new hl.ExchangeClient({ transport, wallet: pk });
   * await client.updateIsolatedMargin({ asset: 0, isBuy: true, ntli: 1 * 1e6 });
   * ```
   */
  updateIsolatedMargin(...args: OmitFirst<OverloadedParameters<typeof updateIsolatedMargin>>) {
    return updateIsolatedMargin(this, ...args);
  }

  /**
   * Update cross or isolated leverage on a coin.
   * @param params - Parameters specific to the API request.
   * @param opts - Request execution options.
   * @returns Successful response without specific data.
   *
   * @throws {ApiRequestError} When the API returns an unsuccessful response.
   * @throws {TransportError} When the transport layer throws an error.
   *
   * @see https://hyperliquid.gitbook.io/hyperliquid-docs/for-developers/api/exchange-endpoint#update-leverage
   * @example
   * ```ts
   * import * as hl from "@nktkas/hyperliquid";
   *
   * const pk = "0x..."; // viem, ethers or private key
   * const transport = new hl.HttpTransport(); // or `WebSocketTransport`
   *
   * const client = new hl.ExchangeClient({ transport, wallet: pk });
   * await client.updateLeverage({ asset: 0, isCross: true, leverage: 5 });
   * ```
   */
  updateLeverage(...args: OmitFirst<OverloadedParameters<typeof updateLeverage>>) {
    return updateLeverage(this, ...args);
  }

  /**
   * Transfer funds between Spot account and Perp account.
   * @param params - Parameters specific to the API request.
   * @param opts - Request execution options.
   * @returns Successful response without specific data.
   *
   * @throws {ApiRequestError} When the API returns an unsuccessful response.
   * @throws {TransportError} When the transport layer throws an error.
   *
   * @see https://hyperliquid.gitbook.io/hyperliquid-docs/for-developers/api/exchange-endpoint#transfer-from-spot-account-to-perp-account-and-vice-versa
   * @example
   * ```ts
   * import * as hl from "@nktkas/hyperliquid";
   *
   * const pk = "0x..."; // viem, ethers or private key
   * const transport = new hl.HttpTransport(); // or `WebSocketTransport`
   *
   * const client = new hl.ExchangeClient({ transport, wallet: pk });
   * await client.usdClassTransfer({ amount: "1", toPerp: true });
   * ```
   */
  usdClassTransfer(...args: OmitFirst<OverloadedParameters<typeof usdClassTransfer>>) {
    return usdClassTransfer(this, ...args);
  }

  /**
   * Send usd to another address.
   * @param params - Parameters specific to the API request.
   * @param opts - Request execution options.
   * @returns Successful response without specific data.
   *
   * @throws {ApiRequestError} When the API returns an unsuccessful response.
   * @throws {TransportError} When the transport layer throws an error.
   *
   * @see https://hyperliquid.gitbook.io/hyperliquid-docs/for-developers/api/exchange-endpoint#core-usdc-transfer
   * @example
   * ```ts
   * import * as hl from "@nktkas/hyperliquid";
   *
   * const pk = "0x..."; // viem, ethers or private key
   * const transport = new hl.HttpTransport(); // or `WebSocketTransport`
   *
   * const client = new hl.ExchangeClient({ transport, wallet: pk });
   * await client.usdSend({ destination: "0x...", amount: "1" });
   * ```
   */
  usdSend(...args: OmitFirst<OverloadedParameters<typeof usdSend>>) {
    return usdSend(this, ...args);
  }

  /**
   * Distribute funds from a vault between followers.
   * @param params - Parameters specific to the API request.
   * @param opts - Request execution options.
   * @returns Successful response without specific data.
   *
   * @throws {ApiRequestError} When the API returns an unsuccessful response.
   * @throws {TransportError} When the transport layer throws an error.
   *
   * @see null
   * @example
   * ```ts
   * import * as hl from "@nktkas/hyperliquid";
   *
   * const pk = "0x..."; // viem, ethers or private key
   * const transport = new hl.HttpTransport(); // or `WebSocketTransport`
   *
   * const client = new hl.ExchangeClient({ transport, wallet: pk });
   * await client.vaultDistribute({ vaultAddress: "0x...", usd: 10 * 1e6 });
   * ```
   */
  vaultDistribute(...args: OmitFirst<OverloadedParameters<typeof vaultDistribute>>) {
    return vaultDistribute(this, ...args);
  }

  /**
   * Modify a vault's configuration.
   * @param params - Parameters specific to the API request.
   * @param opts - Request execution options.
   * @returns Successful response without specific data.
   *
   * @throws {ApiRequestError} When the API returns an unsuccessful response.
   * @throws {TransportError} When the transport layer throws an error.
   *
   * @see null
   * @example
   * ```ts
   * import * as hl from "@nktkas/hyperliquid";
   *
   * const pk = "0x..."; // viem, ethers or private key
   * const transport = new hl.HttpTransport(); // or `WebSocketTransport`
   *
   * const client = new hl.ExchangeClient({ transport, wallet: pk });
   * await client.vaultModify({
   *   vaultAddress: "0x...",
   *   allowDeposits: true,
   *   alwaysCloseOnWithdraw: false,
   * });
   * ```
   */
  vaultModify(...args: OmitFirst<OverloadedParameters<typeof vaultModify>>) {
    return vaultModify(this, ...args);
  }

  /**
   * Deposit or withdraw from a vault.
   * @param params - Parameters specific to the API request.
   * @param opts - Request execution options.
   * @returns Successful response without specific data.
   *
   * @throws {ApiRequestError} When the API returns an unsuccessful response.
   * @throws {TransportError} When the transport layer throws an error.
   *
   * @see https://hyperliquid.gitbook.io/hyperliquid-docs/for-developers/api/exchange-endpoint#deposit-or-withdraw-from-a-vault
   * @example
   * ```ts
   * import * as hl from "@nktkas/hyperliquid";
   *
   * const pk = "0x..."; // viem, ethers or private key
   * const transport = new hl.HttpTransport(); // or `WebSocketTransport`
   *
   * const client = new hl.ExchangeClient({ transport, wallet: pk });
   * await client.vaultTransfer({ vaultAddress: "0x...", isDeposit: true, usd: 10 * 1e6 });
   * ```
   */
  vaultTransfer(...args: OmitFirst<OverloadedParameters<typeof vaultTransfer>>) {
    return vaultTransfer(this, ...args);
  }

  /**
   * Initiate a withdrawal request.
   * @param params - Parameters specific to the API request.
   * @param opts - Request execution options.
   * @returns Successful response without specific data.
   *
   * @throws {ApiRequestError} When the API returns an unsuccessful response.
   * @throws {TransportError} When the transport layer throws an error.
   *
   * @see https://hyperliquid.gitbook.io/hyperliquid-docs/for-developers/api/exchange-endpoint#initiate-a-withdrawal-request
   * @example
   * ```ts
   * import * as hl from "@nktkas/hyperliquid";
   *
   * const pk = "0x..."; // viem, ethers or private key
   * const transport = new hl.HttpTransport(); // or `WebSocketTransport`
   *
   * const client = new hl.ExchangeClient({ transport, wallet: pk });
   * await client.withdraw3({ destination: "0x...", amount: "1" });
   * ```
   */
  withdraw3(...args: OmitFirst<OverloadedParameters<typeof withdraw3>>) {
    return withdraw3(this, ...args);
  }
}

/**
 * A client for interacting with the Hyperliquid Exchange API using multi-signature wallet.
 * Extends the {@link ExchangeClient} to support multi-signature operations.
 * @typeParam T The transport (extends {@linkcode IRequestTransport}) used to connect to the Hyperliquid API.
 * @typeParam S Array of wallets where the first wallet is the leader.
 */
export class MultiSignClient<
  T extends IRequestTransport = IRequestTransport,
  S extends readonly AbstractWallet[] = AbstractWallet[],
> extends ExchangeClient<T, S[0]> implements MultiSignRequestConfig<T, S> {
  multiSigUser: string;
  signers: S;

  /**
   * @note Is the first wallet from {@linkcode signers}. Changing the property also changes the first element in the {@linkcode signers} array.
   */
  declare readonly wallet: S[0];

  /**
   * Initialises a new multi-signature client instance.
   * @param args - The parameters for the multi-signature client.
   *
   * @example
   * ```ts
   * import * as hl from "@nktkas/hyperliquid";
   *
   * const multiSigUser = "0x...";
   * const signers = [
   *   "0x...", // viem, ethers or private key
   *   // ... (more signers if needed)
   * ] as const;
   *
   * const transport = new hl.HttpTransport();
   * const multiSignClient = new hl.MultiSignClient({ transport, multiSigUser, signers });
   * ```
   */
  constructor(
    args:
      & Omit<MultiSignRequestConfig<T, S>, "signers">
      & (
        | Pick<MultiSignRequestConfig<T, S>, "signers">
        | { signers: readonly (S[number] | string)[] }
      ),
  ) {
    // Convert string private keys to PrivateKeyEIP712Signer instances
    const processedSigners = args.signers
      .map((signer) => typeof signer === "string" ? new PrivateKeyEIP712Signer(signer) : signer) as unknown as S;

    super({ ...args, wallet: processedSigners[0] });
    this.multiSigUser = args.multiSigUser;
    this.signers = processedSigners;

    Object.defineProperty(this, "wallet", {
      get() {
        return this.signers[0];
      },
      set(value) {
        this.signers[0] = value;
      },
      enumerable: true,
      configurable: true,
    });
  }
}
