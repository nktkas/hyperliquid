import { HyperliquidError } from "../base.js";
import type { IRequestTransport } from "../transports/base.js";
import type { ApproveAgentRequest, ApproveBuilderFeeRequest, BatchModifyRequest, CancelByCloidRequest, CancelRequest, CancelResponse, CancelSuccessResponse, CDepositRequest, ClaimRewardsRequest, ConvertToMultiSigUserRequest, ConvertToMultiSigUserRequestWithoutStringify, CreateSubAccountRequest, CreateSubAccountResponse, CreateVaultRequest, CreateVaultResponse, CSignerActionRequest, CValidatorActionRequest, CWithdrawRequest, ErrorResponse, EvmUserModifyRequest, Hex, ModifyRequest, MultiSigRequest, OrderRequest, OrderResponse, OrderSuccessResponse, PerpDeployRequest, RegisterReferrerRequest, ReserveRequestWeightRequest, ScheduleCancelRequest, SetDisplayNameRequest, SetReferrerRequest, SpotDeployRequest, SpotSendRequest, SpotUserRequest, SubAccountModifyRequest, SubAccountSpotTransferRequest, SubAccountTransferRequest, SuccessResponse, TokenDelegateRequest, TwapCancelRequest, TwapCancelResponse, TwapCancelSuccessResponse, TwapOrderRequest, TwapOrderResponse, TwapOrderSuccessResponse, UpdateIsolatedMarginRequest, UpdateLeverageRequest, UsdClassTransferRequest, UsdSendRequest, VaultDistributeRequest, VaultModifyRequest, VaultTransferRequest, Withdraw3Request } from "../types/mod.js";
import { type AbstractWallet, actionSorter, userSignedActionEip712Types } from "../signing/mod.js";
type MaybePromise<T> = T | Promise<T>;
/** @see https://github.com/microsoft/TypeScript/issues/13923#issuecomment-2191862501 */
type DeepImmutable<T> = {
    readonly [K in keyof T]: DeepImmutable<T[K]>;
};
/** Parameters for the {@linkcode ExchangeClient} constructor. */
export interface ExchangeClientParameters<T extends IRequestTransport = IRequestTransport, W extends AbstractWallet = AbstractWallet> {
    /** The transport used to connect to the Hyperliquid API. */
    transport: T;
    /** The viem or ethers.js wallet used for signing transactions. */
    wallet: W;
    /**
     * Specifies whether the client uses testnet.
     *
     * Defaults to `false`.
     */
    isTestnet?: boolean;
    /** Sets a default vaultAddress to be used if no vaultAddress is explicitly passed to a method. */
    defaultVaultAddress?: Hex;
    /** Sets a default expiresAfter to be used if no expiresAfter is explicitly passed to a method. */
    defaultExpiresAfter?: number | (() => MaybePromise<number>);
    /**
     * The network that will be used to sign transactions.
     * Must match the network of the {@link wallet}.
     *
     * Defaults to get chain id from wallet otherwise `0x1`.
     */
    signatureChainId?: Hex | (() => MaybePromise<Hex>);
    /**
     * Function to get the next nonce for signing transactions.
     *
     * Defaults to a function that returns the current timestamp or, if duplicated, increments the last nonce.
     */
    nonceManager?: () => MaybePromise<number>;
}
type DistributiveOmit<T, K extends keyof any> = T extends unknown ? Omit<T, K> : never;
type ExtractRequestAction<T extends {
    action: Record<string, unknown>;
}> = T["action"] extends {
    signatureChainId: unknown;
} ? DistributiveOmit<T["action"], "type" | "signatureChainId" | "hyperliquidChain" | "nonce" | "time"> : DistributiveOmit<T["action"], "type">;
/** Action parameters for the {@linkcode ExchangeClient.approveAgent} method. */
export type ApproveAgentParameters = ExtractRequestAction<ApproveAgentRequest>;
/** Action parameters for the {@linkcode ExchangeClient.approveBuilderFee} method. */
export type ApproveBuilderFeeParameters = ExtractRequestAction<ApproveBuilderFeeRequest>;
/** Action parameters for the {@linkcode ExchangeClient.batchModify} method. */
export type BatchModifyParameters = ExtractRequestAction<BatchModifyRequest>;
/** Action parameters for the {@linkcode ExchangeClient.cancel} method. */
export type CancelParameters = ExtractRequestAction<CancelRequest>;
/** Action parameters for the {@linkcode ExchangeClient.cancelByCloid} method. */
export type CancelByCloidParameters = ExtractRequestAction<CancelByCloidRequest>;
/** Action parameters for the {@linkcode ExchangeClient.cDeposit} method. */
export type CDepositParameters = ExtractRequestAction<CDepositRequest>;
/** Action parameters for the {@linkcode ExchangeClient.convertToMultiSigUser} method. */
export type ConvertToMultiSigUserParameters = ExtractRequestAction<ConvertToMultiSigUserRequestWithoutStringify>;
/** Action parameters for the {@linkcode ExchangeClient.createSubAccount} method. */
export type CreateSubAccountParameters = ExtractRequestAction<CreateSubAccountRequest>;
/** Action parameters for the {@linkcode ExchangeClient.createVault} method. */
export type CreateVaultParameters = ExtractRequestAction<CreateVaultRequest>;
/** Action parameters for the {@linkcode ExchangeClient.cSignerAction} method. */
export type CSignerActionParameters = ExtractRequestAction<CSignerActionRequest>;
/** Action parameters for the {@linkcode ExchangeClient.cValidatorAction} method. */
export type CValidatorActionParameters = ExtractRequestAction<CValidatorActionRequest>;
/** Action parameters for the {@linkcode ExchangeClient.cWithdraw} method. */
export type CWithdrawParameters = ExtractRequestAction<CWithdrawRequest>;
/** Action parameters for the {@linkcode ExchangeClient.evmUserModify} method. */
export type EvmUserModifyParameters = ExtractRequestAction<EvmUserModifyRequest>;
/** Action parameters for the {@linkcode ExchangeClient.modify} method. */
export type ModifyParameters = ExtractRequestAction<ModifyRequest>;
/** Action parameters for the {@linkcode ExchangeClient.multiSig} method. */
export type MultiSigParameters = ExtractRequestAction<MultiSigRequest> & Pick<MultiSigRequest, "nonce">;
/** Action parameters for the {@linkcode ExchangeClient.order} method. */
export type OrderParameters = ExtractRequestAction<OrderRequest>;
/** Action parameters for the {@linkcode ExchangeClient.perpDeploy} method. */
export type PerpDeployParameters = ExtractRequestAction<PerpDeployRequest>;
/** Action parameters for the {@linkcode ExchangeClient.registerReferrer} method. */
export type RegisterReferrerParameters = ExtractRequestAction<RegisterReferrerRequest>;
/** Action parameters for the {@linkcode ExchangeClient.reserveRequestWeight} method. */
export type ReserveRequestWeightParameters = ExtractRequestAction<ReserveRequestWeightRequest>;
/** Action parameters for the {@linkcode ExchangeClient.scheduleCancel} method. */
export type ScheduleCancelParameters = ExtractRequestAction<ScheduleCancelRequest>;
/** Action parameters for the {@linkcode ExchangeClient.setDisplayName} method. */
export type SetDisplayNameParameters = ExtractRequestAction<SetDisplayNameRequest>;
/** Action parameters for the {@linkcode ExchangeClient.setReferrer} method. */
export type SetReferrerParameters = ExtractRequestAction<SetReferrerRequest>;
/** Action parameters for the {@linkcode ExchangeClient.spotDeploy} method. */
export type SpotDeployParameters = ExtractRequestAction<SpotDeployRequest>;
/** Action parameters for the {@linkcode ExchangeClient.spotSend} method. */
export type SpotSendParameters = ExtractRequestAction<SpotSendRequest>;
/** Action parameters for the {@linkcode ExchangeClient.spotUser} method. */
export type SpotUserParameters = ExtractRequestAction<SpotUserRequest>;
/** Action parameters for the {@linkcode ExchangeClient.subAccountModify} method. */
export type SubAccountModifyParameters = ExtractRequestAction<SubAccountModifyRequest>;
/** Action parameters for the {@linkcode ExchangeClient.subAccountSpotTransfer} method. */
export type SubAccountSpotTransferParameters = ExtractRequestAction<SubAccountSpotTransferRequest>;
/** Action parameters for the {@linkcode ExchangeClient.subAccountTransfer} method. */
export type SubAccountTransferParameters = ExtractRequestAction<SubAccountTransferRequest>;
/** Action parameters for the {@linkcode ExchangeClient.tokenDelegate} method. */
export type TokenDelegateParameters = ExtractRequestAction<TokenDelegateRequest>;
/** Action parameters for the {@linkcode ExchangeClient.twapCancel} method. */
export type TwapCancelParameters = ExtractRequestAction<TwapCancelRequest>;
/** Action parameters for the {@linkcode ExchangeClient.twapOrder} method. */
export type TwapOrderParameters = ExtractRequestAction<TwapOrderRequest>;
/** Action parameters for the {@linkcode ExchangeClient.updateIsolatedMargin} method. */
export type UpdateIsolatedMarginParameters = ExtractRequestAction<UpdateIsolatedMarginRequest>;
/** Action parameters for the {@linkcode ExchangeClient.updateLeverage} method. */
export type UpdateLeverageParameters = ExtractRequestAction<UpdateLeverageRequest>;
/** Action parameters for the {@linkcode ExchangeClient.usdClassTransfer} method. */
export type UsdClassTransferParameters = ExtractRequestAction<UsdClassTransferRequest>;
/** Action parameters for the {@linkcode ExchangeClient.usdSend} method. */
export type UsdSendParameters = ExtractRequestAction<UsdSendRequest>;
/** Action parameters for the {@linkcode ExchangeClient.vaultDistribute} method. */
export type VaultDistributeParameters = ExtractRequestAction<VaultDistributeRequest>;
/** Action parameters for the {@linkcode ExchangeClient.vaultModify} method. */
export type VaultModifyParameters = ExtractRequestAction<VaultModifyRequest>;
/** Action parameters for the {@linkcode ExchangeClient.vaultTransfer} method. */
export type VaultTransferParameters = ExtractRequestAction<VaultTransferRequest>;
/** Action parameters for the {@linkcode ExchangeClient.withdraw3} method. */
export type Withdraw3Parameters = ExtractRequestAction<Withdraw3Request>;
interface BaseRequestOptions {
    /**
     * An {@linkcode https://developer.mozilla.org/en-US/docs/Web/API/AbortSignal | AbortSignal}
     * If this option is set, the request can be canceled by calling {@linkcode https://developer.mozilla.org/en-US/docs/Web/API/AbortController/abort | abort()}
     * on the corresponding {@linkcode https://developer.mozilla.org/en-US/docs/Web/API/AbortController | AbortController}.
     */
    signal?: AbortSignal;
}
type ExtractRequestOptions<T extends {
    action: Record<string, unknown>;
}> = BaseRequestOptions & Omit<T, "action" | "nonce" | "signature">;
/** Request options for the {@linkcode ExchangeClient.approveAgent} method. */
export type ApproveAgentOptions = ExtractRequestOptions<ApproveAgentRequest>;
/** Request options for the {@linkcode ExchangeClient.approveBuilderFee} method. */
export type ApproveBuilderFeeOptions = ExtractRequestOptions<ApproveBuilderFeeRequest>;
/** Request options for the {@linkcode ExchangeClient.batchModify} method. */
export type BatchModifyOptions = ExtractRequestOptions<BatchModifyRequest>;
/** Request options for the {@linkcode ExchangeClient.cancel} method. */
export type CancelOptions = ExtractRequestOptions<CancelRequest>;
/** Request options for the {@linkcode ExchangeClient.cancelByCloid} method. */
export type CancelByCloidOptions = ExtractRequestOptions<CancelByCloidRequest>;
/** Request options for the {@linkcode ExchangeClient.cDeposit} method. */
export type CDepositOptions = ExtractRequestOptions<CDepositRequest>;
/** Request options for the {@linkcode ExchangeClient.claimRewards} method. */
export type ClaimRewardsOptions = ExtractRequestOptions<ClaimRewardsRequest>;
/** Request options for the {@linkcode ExchangeClient.convertToMultiSigUser} method. */
export type ConvertToMultiSigUserOptions = ExtractRequestOptions<ConvertToMultiSigUserRequest>;
/** Request options for the {@linkcode ExchangeClient.createSubAccount} method. */
export type CreateSubAccountOptions = ExtractRequestOptions<CreateSubAccountRequest>;
/** Request options for the {@linkcode ExchangeClient.createVault} method. */
export type CreateVaultOptions = ExtractRequestOptions<CreateVaultRequest>;
/** Request options for the {@linkcode ExchangeClient.cSignerAction} method. */
export type CSignerActionOptions = ExtractRequestOptions<CSignerActionRequest>;
/** Request options for the {@linkcode ExchangeClient.cValidatorAction} method. */
export type CValidatorActionOptions = ExtractRequestOptions<CValidatorActionRequest>;
/** Request options for the {@linkcode ExchangeClient.cWithdraw} method. */
export type CWithdrawOptions = ExtractRequestOptions<CWithdrawRequest>;
/** Request options for the {@linkcode ExchangeClient.evmUserModify} method. */
export type EvmUserModifyOptions = ExtractRequestOptions<EvmUserModifyRequest>;
/** Request options for the {@linkcode ExchangeClient.modify} method. */
export type ModifyOptions = ExtractRequestOptions<ModifyRequest>;
/** Request options for the {@linkcode ExchangeClient.multiSig} method. */
export type MultiSigOptions = ExtractRequestOptions<MultiSigRequest>;
/** Request options for the {@linkcode ExchangeClient.order} method. */
export type OrderOptions = ExtractRequestOptions<OrderRequest>;
/** Request options for the {@linkcode ExchangeClient.perpDeploy} method. */
export type PerpDeployOptions = ExtractRequestOptions<PerpDeployRequest>;
/** Request options for the {@linkcode ExchangeClient.registerReferrer} method. */
export type RegisterReferrerOptions = ExtractRequestOptions<RegisterReferrerRequest>;
/** Request options for the {@linkcode ExchangeClient.reserveRequestWeight} method. */
export type ReserveRequestWeightOptions = ExtractRequestOptions<ReserveRequestWeightRequest>;
/** Request options for the {@linkcode ExchangeClient.scheduleCancel} method. */
export type ScheduleCancelOptions = ExtractRequestOptions<ScheduleCancelRequest>;
/** Request options for the {@linkcode ExchangeClient.setDisplayName} method. */
export type SetDisplayNameOptions = ExtractRequestOptions<SetDisplayNameRequest>;
/** Request options for the {@linkcode ExchangeClient.setReferrer} method. */
export type SetReferrerOptions = ExtractRequestOptions<SetReferrerRequest>;
/** Request options for the {@linkcode ExchangeClient.spotDeploy} method. */
export type SpotDeployOptions = ExtractRequestOptions<SpotDeployRequest>;
/** Request options for the {@linkcode ExchangeClient.spotSend} method. */
export type SpotSendOptions = ExtractRequestOptions<SpotSendRequest>;
/** Request options for the {@linkcode ExchangeClient.spotUser} method. */
export type SpotUserOptions = ExtractRequestOptions<SpotUserRequest>;
/** Request options for the {@linkcode ExchangeClient.subAccountModify} method. */
export type SubAccountModifyOptions = ExtractRequestOptions<SubAccountModifyRequest>;
/** Request options for the {@linkcode ExchangeClient.subAccountSpotTransfer} method. */
export type SubAccountSpotTransferOptions = ExtractRequestOptions<SubAccountSpotTransferRequest>;
/** Request options for the {@linkcode ExchangeClient.subAccountTransfer} method. */
export type SubAccountTransferOptions = ExtractRequestOptions<SubAccountTransferRequest>;
/** Request options for the {@linkcode ExchangeClient.tokenDelegate} method. */
export type TokenDelegateOptions = ExtractRequestOptions<TokenDelegateRequest>;
/** Request options for the {@linkcode ExchangeClient.twapCancel} method. */
export type TwapCancelOptions = ExtractRequestOptions<TwapCancelRequest>;
/** Request options for the {@linkcode ExchangeClient.twapOrder} method. */
export type TwapOrderOptions = ExtractRequestOptions<TwapOrderRequest>;
/** Request options for the {@linkcode ExchangeClient.updateIsolatedMargin} method. */
export type UpdateIsolatedMarginOptions = ExtractRequestOptions<UpdateIsolatedMarginRequest>;
/** Request options for the {@linkcode ExchangeClient.updateLeverage} method. */
export type UpdateLeverageOptions = ExtractRequestOptions<UpdateLeverageRequest>;
/** Request options for the {@linkcode ExchangeClient.usdClassTransfer} method. */
export type UsdClassTransferOptions = ExtractRequestOptions<UsdClassTransferRequest>;
/** Request options for the {@linkcode ExchangeClient.usdSend} method. */
export type UsdSendOptions = ExtractRequestOptions<UsdSendRequest>;
/** Request options for the {@linkcode ExchangeClient.vaultDistribute} method. */
export type VaultDistributeOptions = ExtractRequestOptions<VaultDistributeRequest>;
/** Request options for the {@linkcode ExchangeClient.vaultModify} method. */
export type VaultModifyOptions = ExtractRequestOptions<VaultModifyRequest>;
/** Request options for the {@linkcode ExchangeClient.vaultTransfer} method. */
export type VaultTransferOptions = ExtractRequestOptions<VaultTransferRequest>;
/** Request options for the {@linkcode ExchangeClient.withdraw3} method. */
export type Withdraw3Options = ExtractRequestOptions<Withdraw3Request>;
/** Custom error class for API request errors. */
export declare class ApiRequestError extends HyperliquidError {
    response: ErrorResponse | OrderResponse | CancelResponse | TwapOrderResponse | TwapCancelResponse;
    constructor(response: ErrorResponse | OrderResponse | CancelResponse | TwapOrderResponse | TwapCancelResponse);
}
/**
 * Exchange client for interacting with the Hyperliquid API.
 * @typeParam T The transport used to connect to the Hyperliquid API.
 * @typeParam W The wallet used for signing transactions.
 */
export declare class ExchangeClient<T extends IRequestTransport = IRequestTransport, W extends AbstractWallet = AbstractWallet> implements ExchangeClientParameters<T, W>, AsyncDisposable {
    transport: T;
    wallet: W;
    isTestnet: boolean;
    defaultVaultAddress?: Hex;
    defaultExpiresAfter?: number | (() => MaybePromise<number>);
    signatureChainId: Hex | (() => MaybePromise<Hex>);
    nonceManager: () => MaybePromise<number>;
    /**
     * Initialises a new instance.
     * @param args - The parameters for the client.
     *
     * @example Private key directly
     * ```ts
     * import * as hl from "@nktkas/hyperliquid";
     *
     * const privateKey = "0x...";
     *
     * const transport = new hl.HttpTransport(); // or `WebSocketTransport`
     * const exchClient = new hl.ExchangeClient({ wallet: privateKey, transport });
     * ```
     *
     * @example [Viem](https://viem.sh/docs/clients/wallet#local-accounts-private-key-mnemonic-etc)
     * ```ts
     * import * as hl from "@nktkas/hyperliquid";
     * import { privateKeyToAccount } from "viem/accounts";
     *
     * const account = privateKeyToAccount("0x...");
     *
     * const transport = new hl.HttpTransport(); // or `WebSocketTransport`
     * const exchClient = new hl.ExchangeClient({ wallet: account, transport });
     * ```
     *
     * @example [ethers.js](https://docs.ethers.org/v6/api/wallet/#Wallet) or [ethers.js v5](https://docs.ethers.org/v5/api/signer/#Wallet)
     * ```ts
     * import * as hl from "@nktkas/hyperliquid";
     * import { ethers } from "ethers";
     *
     * const wallet = new ethers.Wallet("0x...");
     *
     * const transport = new hl.HttpTransport(); // or `WebSocketTransport`
     * const exchClient = new hl.ExchangeClient({ wallet, transport });
     * ```
     *
     * @example External wallet (e.g. MetaMask) via [viem](https://viem.sh/docs/clients/wallet)
     * ```ts
     * import * as hl from "@nktkas/hyperliquid";
     * import { createWalletClient, custom } from "viem";
     *
     * const ethereum = (window as any).ethereum;
     * const [account] = await ethereum.request({ method: "eth_requestAccounts" });
     * const wallet = createWalletClient({ account, transport: custom(ethereum) });
     *
     * const transport = new hl.HttpTransport(); // or `WebSocketTransport`
     * const exchClient = new hl.ExchangeClient({ wallet, transport });
     * ```
     */
    constructor(args: ExchangeClientParameters<T, W>);
    /**
     * Approve an agent to sign on behalf of the master account.
     * @param params - Action-specific parameters.
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
     * const privateKey = "0x..."; // `viem`, `ethers`, or private key directly`
     * const transport = new hl.HttpTransport(); // or `WebSocketTransport`
     * const exchClient = new hl.ExchangeClient({ wallet: privateKey, transport });
     *
     * await exchClient.approveAgent({ agentAddress: "0x...", agentName: "..." });
     * ```
     */
    approveAgent(params: DeepImmutable<ApproveAgentParameters>, opts?: ApproveAgentOptions): Promise<SuccessResponse>;
    /**
     * Approve a maximum fee rate for a builder.
     * @param params - Action-specific parameters.
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
     * const privateKey = "0x..."; // `viem`, `ethers`, or private key directly`
     * const transport = new hl.HttpTransport(); // or `WebSocketTransport`
     * const exchClient = new hl.ExchangeClient({ wallet: privateKey, transport });
     *
     * await exchClient.approveBuilderFee({ maxFeeRate: "0.01%", builder: "0x..." });
     * ```
     */
    approveBuilderFee(params: DeepImmutable<ApproveBuilderFeeParameters>, opts?: ApproveBuilderFeeOptions): Promise<SuccessResponse>;
    /**
     * Modify multiple orders.
     * @param params - Action-specific parameters.
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
     * const privateKey = "0x..."; // `viem`, `ethers`, or private key directly`
     * const transport = new hl.HttpTransport(); // or `WebSocketTransport`
     * const exchClient = new hl.ExchangeClient({ wallet: privateKey, transport });
     *
     * const data = await exchClient.batchModify({
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
    batchModify(params: DeepImmutable<BatchModifyParameters>, opts?: BatchModifyOptions): Promise<OrderSuccessResponse>;
    /**
     * Cancel order(s).
     * @param params - Action-specific parameters.
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
     * const privateKey = "0x..."; // `viem`, `ethers`, or private key directly`
     * const transport = new hl.HttpTransport(); // or `WebSocketTransport`
     * const exchClient = new hl.ExchangeClient({ wallet: privateKey, transport });
     *
     * const data = await exchClient.cancel({
     *   cancels: [
     *     { a: 0, o: 123 },
     *   ],
     * });
     * ```
     */
    cancel(params: DeepImmutable<CancelParameters>, opts?: CancelOptions): Promise<CancelSuccessResponse>;
    /**
     * Cancel order(s) by cloid.
     * @param params - Action-specific parameters.
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
     * const privateKey = "0x..."; // `viem`, `ethers`, or private key directly`
     * const transport = new hl.HttpTransport(); // or `WebSocketTransport`
     * const exchClient = new hl.ExchangeClient({ wallet: privateKey, transport });
     *
     * const data = await exchClient.cancelByCloid({
     *   cancels: [
     *     { asset: 0, cloid: "0x..." },
     *   ],
     * });
     * ```
     */
    cancelByCloid(params: DeepImmutable<CancelByCloidParameters>, opts?: CancelByCloidOptions): Promise<CancelSuccessResponse>;
    /**
     * Transfer native token from the user's spot account into staking for delegating to validators.
     * @param params - Action-specific parameters.
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
     * const privateKey = "0x..."; // `viem`, `ethers`, or private key directly`
     * const transport = new hl.HttpTransport(); // or `WebSocketTransport`
     * const exchClient = new hl.ExchangeClient({ wallet: privateKey, transport });
     *
     * await exchClient.cDeposit({ wei: 1 * 1e8 });
     * ```
     */
    cDeposit(params: DeepImmutable<CDepositParameters>, opts?: CDepositOptions): Promise<SuccessResponse>;
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
     * const privateKey = "0x..."; // `viem`, `ethers`, or private key directly`
     * const transport = new hl.HttpTransport(); // or `WebSocketTransport`
     * const exchClient = new hl.ExchangeClient({ wallet: privateKey, transport });
     *
     * await exchClient.claimRewards();
     * ```
     */
    claimRewards(opts?: ClaimRewardsOptions): Promise<SuccessResponse>;
    /**
     * Convert a single-signature account to a multi-signature account or vice versa.
     * @param params - Action-specific parameters.
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
     * const privateKey = "0x..."; // `viem`, `ethers`, or private key directly`
     * const transport = new hl.HttpTransport(); // or `WebSocketTransport`
     * const exchClient = new hl.ExchangeClient({ wallet: privateKey, transport });
     *
     * // Convert to multi-sig user
     * await exchClient.convertToMultiSigUser({
     *   signers: {
     *     authorizedUsers: ["0x...", "0x...", "0x..."],
     *     threshold: 2,
     *   },
     * });
     *
     * // Convert to single-sig user
     * await exchClient.convertToMultiSigUser({ signers: null });
     * ```
     */
    convertToMultiSigUser(params: DeepImmutable<ConvertToMultiSigUserParameters>, opts?: ConvertToMultiSigUserOptions): Promise<SuccessResponse>;
    /**
     * Create a sub-account.
     * @param params - Action-specific parameters.
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
     * const privateKey = "0x..."; // `viem`, `ethers`, or private key directly`
     * const transport = new hl.HttpTransport(); // or `WebSocketTransport`
     * const exchClient = new hl.ExchangeClient({ wallet: privateKey, transport });
     *
     * const data = await exchClient.createSubAccount({ name: "..." });
     * ```
     */
    createSubAccount(params: DeepImmutable<CreateSubAccountParameters>, opts?: CreateSubAccountOptions): Promise<CreateSubAccountResponse>;
    /**
     * Create a vault.
     * @param params - Action-specific parameters.
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
     * const privateKey = "0x..."; // `viem`, `ethers`, or private key directly`
     * const transport = new hl.HttpTransport(); // or `WebSocketTransport`
     * const exchClient = new hl.ExchangeClient({ wallet: privateKey, transport });
     *
     * const data = await exchClient.createVault({
     *   name: "...",
     *   description: "...",
     *   initialUsd: 100 * 1e6,
     *   nonce: Date.now(),
     * });
     * ```
     */
    createVault(params: DeepImmutable<CreateVaultParameters>, opts?: CreateVaultOptions): Promise<CreateVaultResponse>;
    /**
     * Jail or unjail self as a validator signer.
     * @param params - Action-specific parameters.
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
     * const privateKey = "0x..."; // `viem`, `ethers`, or private key directly`
     * const transport = new hl.HttpTransport(); // or `WebSocketTransport`
     * const exchClient = new hl.ExchangeClient({ wallet: privateKey, transport });
     *
     * // Jail self
     * await exchClient.cSignerAction({ jailSelf: null });
     *
     * // Unjail self
     * await exchClient.cSignerAction({ unjailSelf: null });
     * ```
     */
    cSignerAction(params: DeepImmutable<CSignerActionParameters>, opts?: CSignerActionOptions): Promise<SuccessResponse>;
    /**
     * Action related to validator management.
     * @param params - Action-specific parameters.
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
     * const privateKey = "0x..."; // `viem`, `ethers`, or private key directly`
     * const transport = new hl.HttpTransport(); // or `WebSocketTransport`
     * const exchClient = new hl.ExchangeClient({ wallet: privateKey, transport });
     *
     * // Change validator profile
     * await exchClient.cValidatorAction({
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
     * await exchClient.cValidatorAction({
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
     * await exchClient.cValidatorAction({ unregister: null });
     * ```
     */
    cValidatorAction(params: DeepImmutable<CValidatorActionParameters>, opts?: CValidatorActionOptions): Promise<SuccessResponse>;
    /**
     * Transfer native token from staking into the user's spot account.
     * @param params - Action-specific parameters.
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
     * const privateKey = "0x..."; // `viem`, `ethers`, or private key directly`
     * const transport = new hl.HttpTransport(); // or `WebSocketTransport`
     * const exchClient = new hl.ExchangeClient({ wallet: privateKey, transport });
     *
     * await exchClient.cWithdraw({ wei: 1 * 1e8 });
     * ```
     */
    cWithdraw(params: DeepImmutable<CWithdrawParameters>, opts?: CWithdrawOptions): Promise<SuccessResponse>;
    /**
     * Configure block type for EVM transactions.
     * @param params - Action-specific parameters.
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
     * const privateKey = "0x..."; // `viem`, `ethers`, or private key directly`
     * const transport = new hl.HttpTransport(); // or `WebSocketTransport`
     * const exchClient = new hl.ExchangeClient({ wallet: privateKey, transport });
     *
     * const data = await exchClient.evmUserModify({ usingBigBlocks: true });
     * ```
     */
    evmUserModify(params: DeepImmutable<EvmUserModifyParameters>, opts?: EvmUserModifyOptions): Promise<SuccessResponse>;
    /**
     * Modify an order.
     * @param params - Action-specific parameters.
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
     * const privateKey = "0x..."; // `viem`, `ethers`, or private key directly`
     * const transport = new hl.HttpTransport(); // or `WebSocketTransport`
     * const exchClient = new hl.ExchangeClient({ wallet: privateKey, transport });
     *
     * await exchClient.modify({
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
    modify(params: DeepImmutable<ModifyParameters>, opts?: ModifyOptions): Promise<SuccessResponse>;
    /**
     * A multi-signature request.
     * @param params - Action-specific parameters.
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
     * import { actionSorter, signL1Action } from "@nktkas/hyperliquid/signing";
     * import { privateKeyToAccount } from "viem/accounts";
     *
     * const wallet = privateKeyToAccount("0x..."); // or any other wallet libraries
     * const multiSigUser = "0x...";
     *
     * const transport = new hl.HttpTransport(); // or `WebSocketTransport`
     * const exchClient = new hl.ExchangeClient({ wallet, transport });
     *
     * const nonce = Date.now();
     * const action = actionSorter.scheduleCancel({
     *   type: "scheduleCancel",
     *   time: Date.now() + 10000,
     * });
     *
     * // Create the required number of signatures
     * const signatures = await Promise.all(["0x...", "0x..."].map(async (signerPrivKey) => {
     *   return await signL1Action({
     *     wallet: signerPrivKey as `0x${string}`,
     *     action: [multiSigUser.toLowerCase(), wallet.address.toLowerCase(), action],
     *     nonce,
     *   });
     * }));
     *
     * // or user-signed action
     * // const signatures = await Promise.all(["0x...", "0x..."].map(async (signerPrivKey) => {
     * //   return await signUserSignedAction({
     * //     wallet: signerPrivKey as `0x${string}`,
     * //     action: {
     * //       ...action,
     * //       payloadMultiSigUser: multiSigUser,
     * //       outerSigner: wallet.address,
     * //     },
     * //     types: userSignedActionEip712Types[action.type],
     * //   });
     * // }));
     *
     * // Then use signatures in the `multiSig` action
     * const data = await exchClient.multiSig({
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
    multiSig<T extends SuccessResponse | CancelSuccessResponse | CreateSubAccountResponse | CreateVaultResponse | OrderSuccessResponse | TwapOrderSuccessResponse | TwapCancelSuccessResponse>(params_and_nonce: DeepImmutable<MultiSigParameters>, opts?: MultiSigOptions): Promise<T>;
    /**
     * Place an order(s).
     * @param params - Action-specific parameters.
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
     * const privateKey = "0x..."; // `viem`, `ethers`, or private key directly`
     * const transport = new hl.HttpTransport(); // or `WebSocketTransport`
     * const exchClient = new hl.ExchangeClient({ wallet: privateKey, transport });
     *
     * const data = await exchClient.order({
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
    order(params: DeepImmutable<OrderParameters>, opts?: OrderOptions): Promise<OrderSuccessResponse>;
    /**
     * Deploying HIP-3 assets.
     * @param params - Action-specific parameters.
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
     * const privateKey = "0x..."; // `viem`, `ethers`, or private key directly`
     * const transport = new hl.HttpTransport(); // or `WebSocketTransport`
     * const exchClient = new hl.ExchangeClient({ wallet: privateKey, transport });
     *
     * await exchClient.perpDeploy({
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
    perpDeploy(params: DeepImmutable<PerpDeployParameters>, opts?: PerpDeployOptions): Promise<SuccessResponse>;
    /**
     * Create a referral code.
     * @param params - Action-specific parameters.
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
     * const privateKey = "0x..."; // `viem`, `ethers`, or private key directly`
     * const transport = new hl.HttpTransport(); // or `WebSocketTransport`
     * const exchClient = new hl.ExchangeClient({ wallet: privateKey, transport });
     *
     * await exchClient.registerReferrer({ code: "..." });
     * ```
     */
    registerReferrer(params: DeepImmutable<RegisterReferrerParameters>, opts?: RegisterReferrerOptions): Promise<SuccessResponse>;
    /**
     * Reserve additional rate-limited actions for a fee.
     * @param params - Action-specific parameters.
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
     * const privateKey = "0x..."; // `viem`, `ethers`, or private key directly`
     * const transport = new hl.HttpTransport(); // or `WebSocketTransport`
     * const exchClient = new hl.ExchangeClient({ wallet: privateKey, transport });
     *
     * await exchClient.reserveRequestWeight({ weight: 10 });
     * ```
     */
    reserveRequestWeight(params: DeepImmutable<ReserveRequestWeightParameters>, opts?: ReserveRequestWeightOptions): Promise<SuccessResponse>;
    /**
     * Schedule a cancel-all operation at a future time.
     * @param params - An optional action-specific parameters.
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
     * const privateKey = "0x..."; // `viem`, `ethers`, or private key directly`
     * const transport = new hl.HttpTransport(); // or `WebSocketTransport`
     * const exchClient = new hl.ExchangeClient({ wallet: privateKey, transport });
     *
     * await exchClient.scheduleCancel({ time: Date.now() + 10_000 });
     * ```
     */
    scheduleCancel(params?: DeepImmutable<ScheduleCancelParameters>, opts?: ScheduleCancelOptions): Promise<SuccessResponse>;
    scheduleCancel(opts?: ScheduleCancelOptions): Promise<SuccessResponse>;
    /**
     * Set the display name in the leaderboard.
     * @param params - Action-specific parameters.
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
     * const privateKey = "0x..."; // `viem`, `ethers`, or private key directly`
     * const transport = new hl.HttpTransport(); // or `WebSocketTransport`
     * const exchClient = new hl.ExchangeClient({ wallet: privateKey, transport });
     *
     * await exchClient.setDisplayName({ displayName: "..." });
     * ```
     */
    setDisplayName(params: DeepImmutable<SetDisplayNameParameters>, opts?: SetDisplayNameOptions): Promise<SuccessResponse>;
    /**
     * Set a referral code.
     * @param params - Action-specific parameters.
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
     * const privateKey = "0x..."; // `viem`, `ethers`, or private key directly`
     * const transport = new hl.HttpTransport(); // or `WebSocketTransport`
     * const exchClient = new hl.ExchangeClient({ wallet: privateKey, transport });
     *
     * await exchClient.setReferrer({ code: "..." });
     * ```
     */
    setReferrer(params: DeepImmutable<SetReferrerParameters>, opts?: SetReferrerOptions): Promise<SuccessResponse>;
    /**
     * Deploying HIP-1 and HIP-2 assets.
     * @param params - Action-specific parameters.
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
     * const privateKey = "0x..."; // `viem`, `ethers`, or private key directly`
     * const transport = new hl.HttpTransport(); // or `WebSocketTransport`
     * const exchClient = new hl.ExchangeClient({ wallet: privateKey, transport });
     *
     * await exchClient.spotDeploy({
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
    spotDeploy(params: DeepImmutable<SpotDeployParameters>, opts?: SpotDeployOptions): Promise<SuccessResponse>;
    /**
     * Send spot assets to another address.
     * @param params - Action-specific parameters.
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
     * const privateKey = "0x..."; // `viem`, `ethers`, or private key directly`
     * const transport = new hl.HttpTransport(); // or `WebSocketTransport`
     * const exchClient = new hl.ExchangeClient({ wallet: privateKey, transport });
     *
     * await exchClient.spotSend({
     *   destination: "0x...",
     *   token: "USDC:0xeb62eee3685fc4c43992febcd9e75443",
     *   amount: "1",
     * });
     * ```
     */
    spotSend(params: DeepImmutable<SpotSendParameters>, opts?: SpotSendOptions): Promise<SuccessResponse>;
    /**
     * Opt Out of Spot Dusting.
     * @param params - Action-specific parameters.
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
     * const privateKey = "0x..."; // `viem`, `ethers`, or private key directly`
     * const transport = new hl.HttpTransport(); // or `WebSocketTransport`
     * const exchClient = new hl.ExchangeClient({ wallet: privateKey, transport });
     *
     * await exchClient.spotUser({ toggleSpotDusting: { optOut: false } });
     * ```
     */
    spotUser(params: DeepImmutable<SpotUserParameters>, opts?: SpotUserOptions): Promise<SuccessResponse>;
    /**
     * Modify a sub-account's.
     * @param params - Action-specific parameters.
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
     * const privateKey = "0x..."; // `viem`, `ethers`, or private key directly`
     * const transport = new hl.HttpTransport(); // or `WebSocketTransport`
     * const exchClient = new hl.ExchangeClient({ wallet: privateKey, transport });
     *
     * await exchClient.subAccountModify({ subAccountUser: "0x...", name: "..."  });
     * ```
     */
    subAccountModify(params: DeepImmutable<SubAccountModifyParameters>, opts?: SubAccountModifyOptions): Promise<SuccessResponse>;
    /**
     * Transfer between sub-accounts (spot).
     * @param params - Action-specific parameters.
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
     * const privateKey = "0x..."; // `viem`, `ethers`, or private key directly`
     * const transport = new hl.HttpTransport(); // or `WebSocketTransport`
     * const exchClient = new hl.ExchangeClient({ wallet: privateKey, transport });
     *
     * await exchClient.subAccountSpotTransfer({
     *   subAccountUser: "0x...",
     *   isDeposit: true,
     *   token: "USDC:0xeb62eee3685fc4c43992febcd9e75443",
     *   amount: "1",
     * });
     * ```
     */
    subAccountSpotTransfer(params: DeepImmutable<SubAccountSpotTransferParameters>, opts?: SubAccountSpotTransferOptions): Promise<SuccessResponse>;
    /**
     * Transfer between sub-accounts (perpetual).
     * @param params - Action-specific parameters.
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
     * const privateKey = "0x..."; // `viem`, `ethers`, or private key directly`
     * const transport = new hl.HttpTransport(); // or `WebSocketTransport`
     * const exchClient = new hl.ExchangeClient({ wallet: privateKey, transport });
     *
     * await exchClient.subAccountTransfer({ subAccountUser: "0x...", isDeposit: true, usd: 1 * 1e6 });
     * ```
     */
    subAccountTransfer(params: DeepImmutable<SubAccountTransferParameters>, opts?: SubAccountTransferOptions): Promise<SuccessResponse>;
    /**
     * Delegate or undelegate native tokens to or from a validator.
     * @param params - Action-specific parameters.
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
     * const privateKey = "0x..."; // `viem`, `ethers`, or private key directly`
     * const transport = new hl.HttpTransport(); // or `WebSocketTransport`
     * const exchClient = new hl.ExchangeClient({ wallet: privateKey, transport });
     *
     * await exchClient.tokenDelegate({ validator: "0x...", isUndelegate: true, wei: 1 * 1e8 });
     * ```
     */
    tokenDelegate(params: DeepImmutable<TokenDelegateParameters>, opts?: TokenDelegateOptions): Promise<SuccessResponse>;
    /**
     * Cancel a TWAP order.
     * @param params - Action-specific parameters.
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
     * const privateKey = "0x..."; // `viem`, `ethers`, or private key directly`
     * const transport = new hl.HttpTransport(); // or `WebSocketTransport`
     * const exchClient = new hl.ExchangeClient({ wallet: privateKey, transport });
     *
     * const data = await exchClient.twapCancel({ a: 0, t: 1 });
     * ```
     */
    twapCancel(params: DeepImmutable<TwapCancelParameters>, opts?: TwapCancelOptions): Promise<TwapCancelSuccessResponse>;
    /**
     * Place a TWAP order.
     * @param params - Action-specific parameters.
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
     * const privateKey = "0x..."; // `viem`, `ethers`, or private key directly`
     * const transport = new hl.HttpTransport(); // or `WebSocketTransport`
     * const exchClient = new hl.ExchangeClient({ wallet: privateKey, transport });
     *
     * const data = await exchClient.twapOrder({
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
    twapOrder(params: DeepImmutable<TwapOrderParameters>, opts?: TwapOrderOptions): Promise<TwapOrderSuccessResponse>;
    /**
     * Add or remove margin from isolated position.
     * @param params - Action-specific parameters.
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
     * const privateKey = "0x..."; // `viem`, `ethers`, or private key directly`
     * const transport = new hl.HttpTransport(); // or `WebSocketTransport`
     * const exchClient = new hl.ExchangeClient({ wallet: privateKey, transport });
     *
     * await exchClient.updateIsolatedMargin({ asset: 0, isBuy: true, ntli: 1 * 1e6 });
     * ```
     */
    updateIsolatedMargin(params: DeepImmutable<UpdateIsolatedMarginParameters>, opts?: UpdateIsolatedMarginOptions): Promise<SuccessResponse>;
    /**
     * Update cross or isolated leverage on a coin.
     * @param params - Action-specific parameters.
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
     * const privateKey = "0x..."; // `viem`, `ethers`, or private key directly`
     * const transport = new hl.HttpTransport(); // or `WebSocketTransport`
     * const exchClient = new hl.ExchangeClient({ wallet: privateKey, transport });
     *
     * await exchClient.updateLeverage({ asset: 0, isCross: true, leverage: 5 });
     * ```
     */
    updateLeverage(params: DeepImmutable<UpdateLeverageParameters>, opts?: UpdateLeverageOptions): Promise<SuccessResponse>;
    /**
     * Transfer funds between Spot account and Perp account.
     * @param params - Action-specific parameters.
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
     * const privateKey = "0x..."; // `viem`, `ethers`, or private key directly`
     * const transport = new hl.HttpTransport(); // or `WebSocketTransport`
     * const exchClient = new hl.ExchangeClient({ wallet: privateKey, transport });
     *
     * await exchClient.usdClassTransfer({ amount: "1", toPerp: true });
     * ```
     */
    usdClassTransfer(params: DeepImmutable<UsdClassTransferParameters>, opts?: UsdClassTransferOptions): Promise<SuccessResponse>;
    /**
     * Send usd to another address.
     * @param params - Action-specific parameters.
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
     * const privateKey = "0x..."; // `viem`, `ethers`, or private key directly`
     * const transport = new hl.HttpTransport(); // or `WebSocketTransport`
     * const exchClient = new hl.ExchangeClient({ wallet: privateKey, transport });
     *
     * await exchClient.usdSend({ destination: "0x...", amount: "1" });
     * ```
     */
    usdSend(params: DeepImmutable<UsdSendParameters>, opts?: UsdSendOptions): Promise<SuccessResponse>;
    /**
     * Distribute funds from a vault between followers.
     * @param params - Action-specific parameters.
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
     * const privateKey = "0x..."; // `viem`, `ethers`, or private key directly`
     * const transport = new hl.HttpTransport(); // or `WebSocketTransport`
     * const exchClient = new hl.ExchangeClient({ wallet: privateKey, transport });
     *
     * await exchClient.vaultDistribute({ vaultAddress: "0x...", usd: 10 * 1e6 });
     * ```
     */
    vaultDistribute(params: DeepImmutable<VaultDistributeParameters>, opts?: VaultDistributeOptions): Promise<SuccessResponse>;
    /**
     * Modify a vault's configuration.
     * @param params - Action-specific parameters.
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
     * const privateKey = "0x..."; // `viem`, `ethers`, or private key directly`
     * const transport = new hl.HttpTransport(); // or `WebSocketTransport`
     * const exchClient = new hl.ExchangeClient({ wallet: privateKey, transport });
     *
     * await exchClient.vaultModify({
     *   vaultAddress: "0x...",
     *   allowDeposits: true,
     *   alwaysCloseOnWithdraw: false,
     * });
     * ```
     */
    vaultModify(params: DeepImmutable<VaultModifyParameters>, opts?: VaultModifyOptions): Promise<SuccessResponse>;
    /**
     * Deposit or withdraw from a vault.
     * @param params - Action-specific parameters.
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
     * const privateKey = "0x..."; // `viem`, `ethers`, or private key directly`
     * const transport = new hl.HttpTransport(); // or `WebSocketTransport`
     * const exchClient = new hl.ExchangeClient({ wallet: privateKey, transport });
     *
     * await exchClient.vaultTransfer({ vaultAddress: "0x...", isDeposit: true, usd: 10 * 1e6 });
     * ```
     */
    vaultTransfer(params: DeepImmutable<VaultTransferParameters>, opts?: VaultTransferOptions): Promise<SuccessResponse>;
    /**
     * Initiate a withdrawal request.
     * @param params - Action-specific parameters.
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
     * const privateKey = "0x..."; // `viem`, `ethers`, or private key directly`
     * const transport = new hl.HttpTransport(); // or `WebSocketTransport`
     * const exchClient = new hl.ExchangeClient({ wallet: privateKey, transport });
     *
     * await exchClient.withdraw3({ destination: "0x...", amount: "1" });
     * ```
     */
    withdraw3(params: DeepImmutable<Withdraw3Parameters>, opts?: Withdraw3Options): Promise<SuccessResponse>;
    protected _executeL1Action<T extends SuccessResponse | CancelSuccessResponse | CreateSubAccountResponse | CreateVaultResponse | OrderSuccessResponse | TwapOrderSuccessResponse | TwapCancelSuccessResponse>(request: {
        action: Parameters<typeof actionSorter[Exclude<keyof typeof actionSorter, keyof typeof userSignedActionEip712Types>]>[0];
        vaultAddress?: Hex;
        expiresAfter: number | undefined;
    }, signal?: AbortSignal): Promise<T>;
    protected _executeUserSignedAction<T extends SuccessResponse | CancelSuccessResponse | CreateSubAccountResponse | CreateVaultResponse | OrderSuccessResponse | TwapOrderSuccessResponse | TwapCancelSuccessResponse>(request: {
        action: Parameters<typeof actionSorter[Exclude<Extract<keyof typeof actionSorter, keyof typeof userSignedActionEip712Types>, "multiSig">]>[0];
    }, signal?: AbortSignal): Promise<T>;
    protected _executeMultiSigAction<T extends SuccessResponse | CancelSuccessResponse | CreateSubAccountResponse | CreateVaultResponse | OrderSuccessResponse | TwapOrderSuccessResponse | TwapCancelSuccessResponse>(request: {
        action: Parameters<typeof actionSorter["multiSig"]>[0];
        nonce: number;
        vaultAddress?: Hex;
        expiresAfter?: number;
    }, signal?: AbortSignal): Promise<T>;
    protected _getDefaultExpiresAfter(): Promise<number | undefined>;
    protected _getSignatureChainId(): Promise<Hex>;
    protected _getHyperliquidChain(): "Mainnet" | "Testnet";
    protected _validateResponse<T extends SuccessResponse | CancelSuccessResponse | CreateSubAccountResponse | CreateVaultResponse | OrderSuccessResponse | TwapOrderSuccessResponse | TwapCancelSuccessResponse>(response: SuccessResponse | ErrorResponse | CancelResponse | CreateSubAccountResponse | CreateVaultResponse | OrderResponse | TwapOrderResponse | TwapCancelResponse): asserts response is T;
    [Symbol.asyncDispose](): Promise<void>;
}
export {};
//# sourceMappingURL=exchange.d.ts.map