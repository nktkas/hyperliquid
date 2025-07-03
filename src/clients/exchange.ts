import { type Hex, HyperliquidError, type MaybePromise } from "../base.ts";
import type { IRequestTransport } from "../transports/base.ts";
import type {
    ApproveAgentRequest,
    ApproveBuilderFeeRequest,
    BatchModifyRequest,
    CancelByCloidRequest,
    CancelRequest,
    CancelResponse,
    CDepositRequest,
    ClaimRewardsRequest,
    ConvertToMultiSigUserRequest,
    ConvertToMultiSigUserRequest_Signers,
    CreateSubAccountRequest,
    CreateSubAccountResponse,
    CreateVaultRequest,
    CreateVaultResponse,
    CSignerActionRequest,
    CValidatorActionRequest,
    CWithdrawRequest,
    ErrorResponse,
    EvmUserModifyRequest,
    ModifyRequest,
    MultiSigRequest,
    OrderRequest,
    OrderResponse,
    PerpDeployRequest,
    PerpDexClassTransferRequest,
    PerpDexTransferRequest,
    RegisterReferrerRequest,
    ReserveRequestWeightRequest,
    ScheduleCancelRequest,
    SetDisplayNameRequest,
    SetReferrerRequest,
    SpotDeployRequest,
    SpotSendRequest,
    SpotUserRequest,
    SubAccountModifyRequest,
    SubAccountSpotTransferRequest,
    SubAccountTransferRequest,
    SuccessResponse,
    TokenDelegateRequest,
    TwapCancelRequest,
    TwapCancelResponse,
    TwapOrderRequest,
    TwapOrderResponse,
    UpdateIsolatedMarginRequest,
    UpdateLeverageRequest,
    UsdClassTransferRequest,
    UsdSendRequest,
    VaultDistributeRequest,
    VaultModifyRequest,
    VaultTransferRequest,
    Withdraw3Request,
} from "../types/mod.ts";
import {
    type AbstractWallet,
    actionSorter,
    isAbstractEthersSigner,
    isAbstractEthersV5Signer,
    isAbstractViemWalletClient,
    isAbstractWindowEthereum,
    type Signature,
    signL1Action,
    signMultiSigAction,
    signUserSignedAction,
    userSignedActionEip712Types,
} from "../signing/mod.ts";

/** Parameters for the {@linkcode ExchangeClient} constructor. */
export interface ExchangeClientParameters<
    T extends IRequestTransport = IRequestTransport,
    W extends AbstractWallet = AbstractWallet,
> {
    /** The transport used to connect to the Hyperliquid API. */
    transport: T;
    /** The `viem`, `ethers.js`, or `window.ethereum` wallet used for signing transactions. */
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
     * Defaults to trying to get the current wallet network. Otherwise `0xa4b1` for `isTestnet = false` or `0x66eee` for `isTestnet = true` will be used.
     */
    signatureChainId?: Hex | (() => MaybePromise<Hex>);
    /**
     * Function to get the next nonce for signing transactions.
     *
     * Defaults to a function that returns the current timestamp or, if duplicated, increments the last nonce.
     */
    nonceManager?: () => MaybePromise<number>;
}

// deno-lint-ignore no-explicit-any
type DistributiveOmit<T, K extends keyof any> = T extends unknown ? Omit<T, K> : never;
type ExtractRequestAction<T extends { action: unknown }> = T["action"] extends { signatureChainId: unknown }
    ? DistributiveOmit<T["action"], "type" | "signatureChainId" | "hyperliquidChain" | "nonce" | "time"> // user-signed actions
    : DistributiveOmit<T["action"], "type">; // L1 actions
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
export type ConvertToMultiSigUserParameters = ConvertToMultiSigUserRequest_Signers;
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
/** Action parameters for the {@linkcode ExchangeClient.perpDexClassTransfer} method. */
export type PerpDexClassTransferParameters = ExtractRequestAction<PerpDexClassTransferRequest>;
/** Action parameters for the {@linkcode ExchangeClient.perpDexTransfer} method. */
export type PerpDexTransferParameters = ExtractRequestAction<PerpDexTransferRequest>;
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
     * An [`AbortSignal`](https://developer.mozilla.org/en-US/docs/Web/API/AbortSignal).
     * If this option is set, the request can be canceled by calling [`abort()`](https://developer.mozilla.org/en-US/docs/Web/API/AbortController/abort)
     * on the corresponding [`AbortController`](https://developer.mozilla.org/en-US/docs/Web/API/AbortController).
     */
    signal?: AbortSignal;
}
type ExtractRequestOptions<T extends { vaultAddress?: unknown; expiresAfter?: unknown }> =
    & (T["vaultAddress"] extends undefined ? BaseRequestOptions : BaseRequestOptions & Pick<T, "vaultAddress">)
    & (T["expiresAfter"] extends undefined ? BaseRequestOptions : BaseRequestOptions & Pick<T, "expiresAfter">);
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
/** Request options for the {@linkcode ExchangeClient.perpDexClassTransfer} method. */
export type PerpDexClassTransferOptions = ExtractRequestOptions<PerpDexClassTransferRequest>;
/** Request options for the {@linkcode ExchangeClient.perpDexTransfer} method. */
export type PerpDexTransferOptions = ExtractRequestOptions<PerpDexTransferRequest>;
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

type ExtractSuccessResponse<T> = T extends { response: { data: { statuses: (infer U)[] } } } ? T & { // multiple statuses
        response: { data: { statuses: Exclude<U, { error: string }>[] } };
    }
    : T extends { response: { data: { status: infer S } } } ? T & { // single status
            response: { data: { status: Exclude<S, { error: string }> } };
        }
    : never; // unknown response
/** Successful variant of {@linkcode CancelResponse} without errors. */
export type CancelResponseSuccess = ExtractSuccessResponse<CancelResponse>;
/** Successful variant of {@linkcode OrderResponse} without errors. */
export type OrderResponseSuccess = ExtractSuccessResponse<OrderResponse>;
/** Successful variant of {@linkcode TwapCancelResponse} without errors. */
export type TwapCancelResponseSuccess = ExtractSuccessResponse<TwapCancelResponse>;
/** Successful variant of {@linkcode TwapOrderResponse} without errors. */
export type TwapOrderResponseSuccess = ExtractSuccessResponse<TwapOrderResponse>;

/** Error thrown when the API returns an error response. */
export class ApiRequestError extends HyperliquidError {
    constructor(
        public response:
            | ErrorResponse
            | OrderResponse
            | CancelResponse
            | TwapOrderResponse
            | TwapCancelResponse,
    ) {
        let message;
        if (response.status === "err") {
            // ErrorResponse
            message = response.response;
        } else {
            if ("statuses" in response.response.data) {
                // OrderResponse | CancelResponse
                const errors = response.response.data.statuses.reduce<string[]>((acc, status, index) => {
                    if (typeof status === "object" && "error" in status) {
                        acc.push(`Order ${index}: ${status.error}`);
                    }
                    return acc;
                }, []);
                if (errors.length > 0) {
                    message = errors.join(", ");
                }
            } else {
                // TwapOrderResponse | TwapCancelResponse
                if (typeof response.response.data.status === "object" && "error" in response.response.data.status) {
                    message = response.response.data.status.error;
                }
            }
        }

        super(message || "An unknown error occurred while processing an API request. See `response` for more details.");
        this.name = "ApiRequestError";
    }
}

/** Nonce manager for generating unique nonces for signing transactions. */
class NonceManager {
    /** The last nonce used for signing transactions. */
    private lastNonce = 0;

    /**
     * Gets the next nonce for signing transactions.
     * @returns The next nonce.
     */
    getNonce(): number {
        let nonce = Date.now();
        if (nonce <= this.lastNonce) {
            nonce = ++this.lastNonce;
        } else {
            this.lastNonce = nonce;
        }
        return nonce;
    }
}

/**
 * Exchange client for interacting with the Hyperliquid API.
 * @typeParam T The transport used to connect to the Hyperliquid API.
 * @typeParam W The wallet used for signing transactions.
 */
export class ExchangeClient<
    T extends IRequestTransport = IRequestTransport,
    W extends AbstractWallet = AbstractWallet,
> implements ExchangeClientParameters<T, W>, AsyncDisposable {
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
     *
     * @example External wallet (e.g. MetaMask) via [`window.ethereum`](https://eips.ethereum.org/EIPS/eip-1193)
     * ```ts
     * import * as hl from "@nktkas/hyperliquid";
     *
     * const ethereum = (window as any).ethereum;
     * const transport = new hl.HttpTransport(); // or `WebSocketTransport`
     * const exchClient = new hl.ExchangeClient({ wallet: ethereum, transport });
     * ```
     */
    constructor(args: ExchangeClientParameters<T, W>) {
        this.transport = args.transport;
        this.wallet = args.wallet;
        this.isTestnet = args.isTestnet ?? false;
        this.defaultVaultAddress = args.defaultVaultAddress;
        this.defaultExpiresAfter = args.defaultExpiresAfter;
        this.signatureChainId = args.signatureChainId ?? this._guessSignatureChainId;
        this.nonceManager = args.nonceManager ?? new NonceManager().getNonce;
    }

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
     * const privateKey = "0x..."; // or `viem`, `ethers`, `window.ethereum`
     * const transport = new hl.HttpTransport(); // or `WebSocketTransport`
     * const exchClient = new hl.ExchangeClient({ wallet: privateKey, transport });
     *
     * await exchClient.approveAgent({ agentAddress: "0x...", agentName: "..." });
     * ```
     */
    async approveAgent(
        params: ApproveAgentParameters,
        opts?: ApproveAgentOptions,
    ): Promise<SuccessResponse> {
        return this._executeAction({
            action: {
                type: "approveAgent",
                hyperliquidChain: this._getHyperliquidChain(),
                signatureChainId: await this._getSignatureChainId(),
                nonce: await this.nonceManager(),
                ...params,
            },
        }, opts?.signal);
    }

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
     * const privateKey = "0x..."; // or `viem`, `ethers`, `window.ethereum`
     * const transport = new hl.HttpTransport(); // or `WebSocketTransport`
     * const exchClient = new hl.ExchangeClient({ wallet: privateKey, transport });
     *
     * await exchClient.approveBuilderFee({ maxFeeRate: "0.01%", builder: "0x..." });
     * ```
     */
    async approveBuilderFee(
        params: ApproveBuilderFeeParameters,
        opts?: ApproveBuilderFeeOptions,
    ): Promise<SuccessResponse> {
        return this._executeAction({
            action: {
                type: "approveBuilderFee",
                hyperliquidChain: this._getHyperliquidChain(),
                signatureChainId: await this._getSignatureChainId(),
                nonce: await this.nonceManager(),
                ...params,
            },
        }, opts?.signal);
    }

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
     * const privateKey = "0x..."; // or `viem`, `ethers`, `window.ethereum`
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
    async batchModify(
        params: BatchModifyParameters,
        opts?: BatchModifyOptions,
    ): Promise<OrderResponseSuccess> {
        return this._executeAction({
            action: {
                type: "batchModify",
                ...params,
            },
            vaultAddress: opts?.vaultAddress ?? this.defaultVaultAddress,
            expiresAfter: opts?.expiresAfter ?? await this._getDefaultExpiresAfter(),
        }, opts?.signal);
    }

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
     * const privateKey = "0x..."; // or `viem`, `ethers`, `window.ethereum`
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
    async cancel(
        params: CancelParameters,
        opts?: CancelOptions,
    ): Promise<CancelResponseSuccess> {
        return this._executeAction({
            action: {
                type: "cancel",
                ...params,
            },
            vaultAddress: opts?.vaultAddress ?? this.defaultVaultAddress,
            expiresAfter: opts?.expiresAfter ?? await this._getDefaultExpiresAfter(),
        }, opts?.signal);
    }

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
     * const privateKey = "0x..."; // or `viem`, `ethers`, `window.ethereum`
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
    async cancelByCloid(
        params: CancelByCloidParameters,
        opts?: CancelByCloidOptions,
    ): Promise<CancelResponseSuccess> {
        return this._executeAction({
            action: {
                type: "cancelByCloid",
                ...params,
            },
            vaultAddress: opts?.vaultAddress ?? this.defaultVaultAddress,
            expiresAfter: opts?.expiresAfter ?? await this._getDefaultExpiresAfter(),
        }, opts?.signal);
    }

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
     * const privateKey = "0x..."; // or `viem`, `ethers`, `window.ethereum`
     * const transport = new hl.HttpTransport(); // or `WebSocketTransport`
     * const exchClient = new hl.ExchangeClient({ wallet: privateKey, transport });
     *
     * await exchClient.cDeposit({ wei: 1 * 1e8 });
     * ```
     */
    async cDeposit(
        params: CDepositParameters,
        opts?: CDepositOptions,
    ): Promise<SuccessResponse> {
        return this._executeAction({
            action: {
                type: "cDeposit",
                hyperliquidChain: this._getHyperliquidChain(),
                signatureChainId: await this._getSignatureChainId(),
                nonce: await this.nonceManager(),
                ...params,
            },
        }, opts?.signal);
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
     * const privateKey = "0x..."; // or `viem`, `ethers`, `window.ethereum`
     * const transport = new hl.HttpTransport(); // or `WebSocketTransport`
     * const exchClient = new hl.ExchangeClient({ wallet: privateKey, transport });
     *
     * await exchClient.claimRewards();
     * ```
     */
    claimRewards(
        opts?: ClaimRewardsOptions,
    ): Promise<SuccessResponse> {
        return this._executeAction({
            action: {
                type: "claimRewards",
            },
        }, opts?.signal);
    }

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
     * const privateKey = "0x..."; // or `viem`, `ethers`, `window.ethereum`
     * const transport = new hl.HttpTransport(); // or `WebSocketTransport`
     * const exchClient = new hl.ExchangeClient({ wallet: privateKey, transport });
     *
     * // Convert to multi-sig user
     * await exchClient.convertToMultiSigUser({
     *   authorizedUsers: ["0x...", "0x...", "0x..."],
     *   threshold: 2,
     * });
     *
     * // Convert to single-sig user
     * await exchClient.convertToMultiSigUser(null);
     * ```
     */
    async convertToMultiSigUser(
        params: ConvertToMultiSigUserRequest_Signers,
        opts?: ConvertToMultiSigUserOptions,
    ): Promise<SuccessResponse> {
        return this._executeAction({
            action: {
                type: "convertToMultiSigUser",
                hyperliquidChain: this._getHyperliquidChain(),
                signatureChainId: await this._getSignatureChainId(),
                nonce: await this.nonceManager(),
                signers: JSON.stringify(params),
            },
        }, opts?.signal);
    }

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
     * const privateKey = "0x..."; // or `viem`, `ethers`, `window.ethereum`
     * const transport = new hl.HttpTransport(); // or `WebSocketTransport`
     * const exchClient = new hl.ExchangeClient({ wallet: privateKey, transport });
     *
     * const data = await exchClient.createSubAccount({ name: "..." });
     * ```
     */
    createSubAccount(
        params: CreateSubAccountParameters,
        opts?: CreateSubAccountOptions,
    ): Promise<CreateSubAccountResponse> {
        return this._executeAction({
            action: {
                type: "createSubAccount",
                ...params,
            },
        }, opts?.signal);
    }

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
     * const privateKey = "0x..."; // or `viem`, `ethers`, `window.ethereum`
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
    createVault(
        params: CreateVaultParameters,
        opts?: CreateVaultOptions,
    ): Promise<CreateVaultResponse> {
        return this._executeAction({
            action: {
                type: "createVault",
                ...params,
            },
        }, opts?.signal);
    }

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
     * const privateKey = "0x..."; // or `viem`, `ethers`, `window.ethereum`
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
    async cSignerAction(
        params: CSignerActionParameters,
        opts?: CSignerActionOptions,
    ): Promise<SuccessResponse> {
        return this._executeAction({
            action: {
                type: "CSignerAction",
                ...params,
            },
            expiresAfter: opts?.expiresAfter ?? await this._getDefaultExpiresAfter(),
        }, opts?.signal);
    }

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
     * const privateKey = "0x..."; // or `viem`, `ethers`, `window.ethereum`
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
    async cValidatorAction(
        params: CValidatorActionParameters,
        opts?: CValidatorActionOptions,
    ): Promise<SuccessResponse> {
        return this._executeAction({
            action: {
                type: "CValidatorAction",
                ...params,
            },
            expiresAfter: opts?.expiresAfter ?? await this._getDefaultExpiresAfter(),
        }, opts?.signal);
    }

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
     * const privateKey = "0x..."; // or `viem`, `ethers`, `window.ethereum`
     * const transport = new hl.HttpTransport(); // or `WebSocketTransport`
     * const exchClient = new hl.ExchangeClient({ wallet: privateKey, transport });
     *
     * await exchClient.cWithdraw({ wei: 1 * 1e8 });
     * ```
     */
    async cWithdraw(
        params: CWithdrawParameters,
        opts?: CWithdrawOptions,
    ): Promise<SuccessResponse> {
        return this._executeAction({
            action: {
                type: "cWithdraw",
                hyperliquidChain: this._getHyperliquidChain(),
                signatureChainId: await this._getSignatureChainId(),
                nonce: await this.nonceManager(),
                ...params,
            },
        }, opts?.signal);
    }

    /**
     * Configure block type for EVM transactions.
     * @param params - Action-specific parameters.
     * @param opts - Request execution options.
     * @returns Response for creating a sub-account.
     *
     * @throws {ApiRequestError} When the API returns an unsuccessful response.
     * @throws {TransportError} When the transport layer throws an error.
     *
     * @see https://hyperliquid.gitbook.io/hyperliquid-docs/for-developers/evm/dual-block-architecture
     * @example
     * ```ts
     * import * as hl from "@nktkas/hyperliquid";
     *
     * const privateKey = "0x..."; // or `viem`, `ethers`, `window.ethereum`
     * const transport = new hl.HttpTransport(); // or `WebSocketTransport`
     * const exchClient = new hl.ExchangeClient({ wallet: privateKey, transport });
     *
     * const data = await exchClient.evmUserModify({ usingBigBlocks: true });
     * ```
     */
    evmUserModify(
        params: EvmUserModifyParameters,
        opts?: EvmUserModifyOptions,
    ): Promise<SuccessResponse> {
        return this._executeAction({
            action: {
                type: "evmUserModify",
                ...params,
            },
        }, opts?.signal);
    }

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
     * const privateKey = "0x..."; // or `viem`, `ethers`, `window.ethereum`
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
    async modify(
        params: ModifyParameters,
        opts?: ModifyOptions,
    ): Promise<OrderResponseSuccess> {
        return this._executeAction({
            action: {
                type: "modify",
                ...params,
            },
            vaultAddress: opts?.vaultAddress ?? this.defaultVaultAddress,
            expiresAfter: opts?.expiresAfter ?? await this._getDefaultExpiresAfter(),
        }, opts?.signal);
    }

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
     * const action = {
     *   type: "scheduleCancel",
     *   time: Date.now() + 10000,
     * } as const;
     *
     * // Create the required number of signatures
     * const signature = await signL1Action({
     *   wallet,
     *   action: [multiSigUser.toLowerCase(), wallet.address.toLowerCase(), actionSorter[action.type](action)],
     *   nonce,
     * });
     *
     * const data = await exchClient.multiSig({
     *   signatures: [signature],
     *   payload: {
     *     multiSigUser,
     *     outerSigner: wallet.address,
     *     action,
     *   },
     *   nonce,
     * });
     * ```
     */
    async multiSig<
        T extends
            | SuccessResponse
            | CancelResponseSuccess
            | CreateSubAccountResponse
            | CreateVaultResponse
            | OrderResponseSuccess
            | TwapOrderResponseSuccess
            | TwapCancelResponseSuccess,
    >(
        params: MultiSigParameters,
        opts?: MultiSigOptions,
    ): Promise<T> {
        return this._executeAction({
            action: {
                type: "multiSig",
                signatureChainId: await this._getSignatureChainId(),
                ...params,
            },
            vaultAddress: opts?.vaultAddress ?? this.defaultVaultAddress,
            expiresAfter: opts?.expiresAfter ?? await this._getDefaultExpiresAfter(),
            multiSigNonce: params?.nonce,
        }, opts?.signal);
    }

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
     * const privateKey = "0x..."; // or `viem`, `ethers`, `window.ethereum`
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
    async order(
        params: OrderParameters,
        opts?: OrderOptions,
    ): Promise<OrderResponseSuccess> {
        return this._executeAction({
            action: {
                type: "order",
                ...params,
            },
            vaultAddress: opts?.vaultAddress ?? this.defaultVaultAddress,
            expiresAfter: opts?.expiresAfter ?? await this._getDefaultExpiresAfter(),
        }, opts?.signal);
    }

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
     * const privateKey = "0x..."; // or `viem`, `ethers`, `window.ethereum`
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
    perpDeploy(
        params: PerpDeployParameters,
        opts?: PerpDeployOptions,
    ): Promise<SuccessResponse> {
        return this._executeAction({
            action: {
                type: "perpDeploy",
                ...params,
            },
        }, opts?.signal);
    }

    /**
     * Transfer funds between Spot account and Perp dex account.
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
     * const privateKey = "0x..."; // or `viem`, `ethers`, `window.ethereum`
     * const transport = new hl.HttpTransport(); // or `WebSocketTransport`
     * const exchClient = new hl.ExchangeClient({ wallet: privateKey, transport });
     *
     * await exchClient.perpDexClassTransfer({ dex: "test", token: "USDC", amount: "1", toPerp: true });
     * ```
     */
    async perpDexClassTransfer(
        params: PerpDexClassTransferParameters,
        opts?: PerpDexClassTransferOptions,
    ): Promise<SuccessResponse> {
        return this._executeAction({
            action: {
                type: "PerpDexClassTransfer",
                hyperliquidChain: this._getHyperliquidChain(),
                signatureChainId: await this._getSignatureChainId(),
                nonce: await this.nonceManager(),
                ...params,
            },
        }, opts?.signal);
    }

    /**
     * Transfer collateral tokens between different perp dexes for the same user.
     * @param params - Action-specific parameters.
     * @param opts - Request execution options.
     * @returns Successful response without specific data.
     *
     * @throws {ApiRequestError} When the API returns an unsuccessful response.
     * @throws {TransportError} When the transport layer throws an error.
     *
     * @see https://hyperliquid.gitbook.io/hyperliquid-docs/for-developers/api/exchange-endpoint#transfer-from-perp-account-to-perp-account-for-builder-deployed-dex
     * @example
     * ```ts
     * import * as hl from "@nktkas/hyperliquid";
     *
     * const privateKey = "0x..."; // or `viem`, `ethers`, `window.ethereum`
     * const transport = new hl.HttpTransport(); // or `WebSocketTransport`
     * const exchClient = new hl.ExchangeClient({ wallet: privateKey, transport });
     *
     * await exchClient.perpDexTransfer({ sourceDex: "", destinationDex: "test", amount: "1" });
     * ```
     */
    async perpDexTransfer(
        params: PerpDexTransferParameters,
        opts?: PerpDexTransferOptions,
    ): Promise<SuccessResponse> {
        return this._executeAction({
            action: {
                type: "PerpDexTransfer",
                hyperliquidChain: this._getHyperliquidChain(),
                signatureChainId: await this._getSignatureChainId(),
                nonce: await this.nonceManager(),
                ...params,
            },
        }, opts?.signal);
    }

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
     * const privateKey = "0x..."; // or `viem`, `ethers`, `window.ethereum`
     * const transport = new hl.HttpTransport(); // or `WebSocketTransport`
     * const exchClient = new hl.ExchangeClient({ wallet: privateKey, transport });
     *
     * await exchClient.registerReferrer({ code: "..." });
     * ```
     */
    registerReferrer(
        params: RegisterReferrerParameters,
        opts?: RegisterReferrerOptions,
    ): Promise<SuccessResponse> {
        return this._executeAction({
            action: {
                type: "registerReferrer",
                ...params,
            },
        }, opts?.signal);
    }

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
     * const privateKey = "0x..."; // or `viem`, `ethers`, `window.ethereum`
     * const transport = new hl.HttpTransport(); // or `WebSocketTransport`
     * const exchClient = new hl.ExchangeClient({ wallet: privateKey, transport });
     *
     * await exchClient.reserveRequestWeight({ weight: 10 });
     * ```
     */
    async reserveRequestWeight(
        params: ReserveRequestWeightParameters,
        opts?: ReserveRequestWeightOptions,
    ): Promise<SuccessResponse> {
        return this._executeAction({
            action: {
                type: "reserveRequestWeight",
                ...params,
            },
            expiresAfter: opts?.expiresAfter ?? await this._getDefaultExpiresAfter(),
        }, opts?.signal);
    }

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
     * const privateKey = "0x..."; // or `viem`, `ethers`, `window.ethereum`
     * const transport = new hl.HttpTransport(); // or `WebSocketTransport`
     * const exchClient = new hl.ExchangeClient({ wallet: privateKey, transport });
     *
     * await exchClient.scheduleCancel({ time: Date.now() + 10_000 });
     * ```
     */
    async scheduleCancel(params?: ScheduleCancelParameters, opts?: ScheduleCancelOptions): Promise<SuccessResponse>;
    async scheduleCancel(opts?: ScheduleCancelOptions): Promise<SuccessResponse>;
    async scheduleCancel(
        params_or_opts?:
            | ScheduleCancelParameters
            | ScheduleCancelOptions,
        maybeOpts?: ScheduleCancelOptions,
    ): Promise<SuccessResponse> {
        const isFirstArgParams = params_or_opts && "time" in params_or_opts;
        const params = isFirstArgParams ? params_or_opts : {};
        const opts = isFirstArgParams ? maybeOpts : params_or_opts as ScheduleCancelOptions;
        return this._executeAction({
            action: {
                type: "scheduleCancel",
                ...params,
            },
            vaultAddress: opts?.vaultAddress ?? this.defaultVaultAddress,
            expiresAfter: opts?.expiresAfter ?? await this._getDefaultExpiresAfter(),
        }, opts?.signal);
    }

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
     * const privateKey = "0x..."; // or `viem`, `ethers`, `window.ethereum`
     * const transport = new hl.HttpTransport(); // or `WebSocketTransport`
     * const exchClient = new hl.ExchangeClient({ wallet: privateKey, transport });
     *
     * await exchClient.setDisplayName({ displayName: "..." });
     * ```
     */
    setDisplayName(
        params: SetDisplayNameParameters,
        opts?: SetDisplayNameOptions,
    ): Promise<SuccessResponse> {
        return this._executeAction({
            action: {
                type: "setDisplayName",
                ...params,
            },
        }, opts?.signal);
    }

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
     * const privateKey = "0x..."; // or `viem`, `ethers`, `window.ethereum`
     * const transport = new hl.HttpTransport(); // or `WebSocketTransport`
     * const exchClient = new hl.ExchangeClient({ wallet: privateKey, transport });
     *
     * await exchClient.setReferrer({ code: "..." });
     * ```
     */
    setReferrer(
        params: RegisterReferrerParameters,
        opts?: RegisterReferrerOptions,
    ): Promise<SuccessResponse> {
        return this._executeAction({
            action: {
                type: "setReferrer",
                ...params,
            },
        }, opts?.signal);
    }

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
     * const privateKey = "0x..."; // or `viem`, `ethers`, `window.ethereum`
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
    spotDeploy(
        params: SpotDeployParameters,
        opts?: SpotDeployOptions,
    ): Promise<SuccessResponse> {
        return this._executeAction({
            action: {
                type: "spotDeploy",
                ...params,
            },
        }, opts?.signal);
    }

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
     * const privateKey = "0x..."; // or `viem`, `ethers`, `window.ethereum`
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
    async spotSend(
        params: SpotSendParameters,
        opts?: SpotSendOptions,
    ): Promise<SuccessResponse> {
        return this._executeAction({
            action: {
                type: "spotSend",
                hyperliquidChain: this._getHyperliquidChain(),
                signatureChainId: await this._getSignatureChainId(),
                time: await this.nonceManager(),
                ...params,
            },
        }, opts?.signal);
    }

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
     * const privateKey = "0x..."; // or `viem`, `ethers`, `window.ethereum`
     * const transport = new hl.HttpTransport(); // or `WebSocketTransport`
     * const exchClient = new hl.ExchangeClient({ wallet: privateKey, transport });
     *
     * await exchClient.subAccountModify({ subAccountUser: "0x...", name: "..."  });
     * ```
     */
    subAccountModify(
        params: SubAccountModifyParameters,
        opts?: SubAccountModifyOptions,
    ): Promise<SuccessResponse> {
        return this._executeAction({
            action: {
                type: "subAccountModify",
                ...params,
            },
        }, opts?.signal);
    }

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
     * const privateKey = "0x..."; // or `viem`, `ethers`, `window.ethereum`
     * const transport = new hl.HttpTransport(); // or `WebSocketTransport`
     * const exchClient = new hl.ExchangeClient({ wallet: privateKey, transport });
     *
     * await exchClient.spotUser({ toggleSpotDusting: { optOut: false } });
     * ```
     */
    spotUser(
        params: SpotUserParameters,
        opts?: SpotUserOptions,
    ): Promise<SuccessResponse> {
        return this._executeAction({
            action: {
                type: "spotUser",
                ...params,
            },
        }, opts?.signal);
    }

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
     * const privateKey = "0x..."; // or `viem`, `ethers`, `window.ethereum`
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
    subAccountSpotTransfer(
        params: SubAccountSpotTransferParameters,
        opts?: SubAccountSpotTransferOptions,
    ): Promise<SuccessResponse> {
        return this._executeAction({
            action: {
                type: "subAccountSpotTransfer",
                ...params,
            },
        }, opts?.signal);
    }

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
     * const privateKey = "0x..."; // or `viem`, `ethers`, `window.ethereum`
     * const transport = new hl.HttpTransport(); // or `WebSocketTransport`
     * const exchClient = new hl.ExchangeClient({ wallet: privateKey, transport });
     *
     * await exchClient.subAccountTransfer({ subAccountUser: "0x...", isDeposit: true, usd: 1 * 1e6 });
     * ```
     */
    subAccountTransfer(
        params: SubAccountTransferParameters,
        opts?: SubAccountTransferOptions,
    ): Promise<SuccessResponse> {
        return this._executeAction({
            action: {
                type: "subAccountTransfer",
                ...params,
            },
        }, opts?.signal);
    }

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
     * const privateKey = "0x..."; // or `viem`, `ethers`, `window.ethereum`
     * const transport = new hl.HttpTransport(); // or `WebSocketTransport`
     * const exchClient = new hl.ExchangeClient({ wallet: privateKey, transport });
     *
     * await exchClient.tokenDelegate({ validator: "0x...", isUndelegate: true, wei: 1 * 1e8 });
     * ```
     */
    async tokenDelegate(
        params: TokenDelegateParameters,
        opts?: TokenDelegateOptions,
    ): Promise<SuccessResponse> {
        return this._executeAction({
            action: {
                type: "tokenDelegate",
                hyperliquidChain: this._getHyperliquidChain(),
                signatureChainId: await this._getSignatureChainId(),
                nonce: await this.nonceManager(),
                ...params,
            },
        }, opts?.signal);
    }

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
     * const privateKey = "0x..."; // or `viem`, `ethers`, `window.ethereum`
     * const transport = new hl.HttpTransport(); // or `WebSocketTransport`
     * const exchClient = new hl.ExchangeClient({ wallet: privateKey, transport });
     *
     * const data = await exchClient.twapCancel({ a: 0, t: 1 });
     * ```
     */
    async twapCancel(
        params: TwapCancelParameters,
        opts?: TwapCancelOptions,
    ): Promise<TwapCancelResponseSuccess> {
        return this._executeAction({
            action: {
                type: "twapCancel",
                ...params,
            },
            vaultAddress: opts?.vaultAddress ?? this.defaultVaultAddress,
            expiresAfter: opts?.expiresAfter ?? await this._getDefaultExpiresAfter(),
        }, opts?.signal);
    }

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
     * const privateKey = "0x..."; // or `viem`, `ethers`, `window.ethereum`
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
    async twapOrder(
        params: TwapOrderParameters,
        opts?: TwapOrderOptions,
    ): Promise<TwapOrderResponseSuccess> {
        return this._executeAction({
            action: {
                type: "twapOrder",
                ...params,
            },
            vaultAddress: opts?.vaultAddress ?? this.defaultVaultAddress,
            expiresAfter: opts?.expiresAfter ?? await this._getDefaultExpiresAfter(),
        }, opts?.signal);
    }

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
     * const privateKey = "0x..."; // or `viem`, `ethers`, `window.ethereum`
     * const transport = new hl.HttpTransport(); // or `WebSocketTransport`
     * const exchClient = new hl.ExchangeClient({ wallet: privateKey, transport });
     *
     * await exchClient.updateIsolatedMargin({ asset: 0, isBuy: true, ntli: 1 * 1e6 });
     * ```
     */
    async updateIsolatedMargin(
        params: UpdateIsolatedMarginParameters,
        opts?: UpdateIsolatedMarginOptions,
    ): Promise<SuccessResponse> {
        return this._executeAction({
            action: {
                type: "updateIsolatedMargin",
                ...params,
            },
            vaultAddress: opts?.vaultAddress ?? this.defaultVaultAddress,
            expiresAfter: opts?.expiresAfter ?? await this._getDefaultExpiresAfter(),
        }, opts?.signal);
    }

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
     * const privateKey = "0x..."; // or `viem`, `ethers`, `window.ethereum`
     * const transport = new hl.HttpTransport(); // or `WebSocketTransport`
     * const exchClient = new hl.ExchangeClient({ wallet: privateKey, transport });
     *
     * await exchClient.updateLeverage({ asset: 0, isCross: true, leverage: 5 });
     * ```
     */
    async updateLeverage(
        params: UpdateLeverageParameters,
        opts?: UpdateLeverageOptions,
    ): Promise<SuccessResponse> {
        return this._executeAction({
            action: {
                type: "updateLeverage",
                ...params,
            },
            vaultAddress: opts?.vaultAddress ?? this.defaultVaultAddress,
            expiresAfter: opts?.expiresAfter ?? await this._getDefaultExpiresAfter(),
        }, opts?.signal);
    }

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
     * const privateKey = "0x..."; // or `viem`, `ethers`, `window.ethereum`
     * const transport = new hl.HttpTransport(); // or `WebSocketTransport`
     * const exchClient = new hl.ExchangeClient({ wallet: privateKey, transport });
     *
     * await exchClient.usdClassTransfer({ amount: "1", toPerp: true });
     * ```
     */
    async usdClassTransfer(
        params: UsdClassTransferParameters,
        opts?: UsdClassTransferOptions,
    ): Promise<SuccessResponse> {
        return this._executeAction({
            action: {
                type: "usdClassTransfer",
                hyperliquidChain: this._getHyperliquidChain(),
                signatureChainId: await this._getSignatureChainId(),
                nonce: await this.nonceManager(),
                ...params,
            },
        }, opts?.signal);
    }

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
     * const privateKey = "0x..."; // or `viem`, `ethers`, `window.ethereum`
     * const transport = new hl.HttpTransport(); // or `WebSocketTransport`
     * const exchClient = new hl.ExchangeClient({ wallet: privateKey, transport });
     *
     * await exchClient.usdSend({ destination: "0x...", amount: "1" });
     * ```
     */
    async usdSend(
        params: UsdSendParameters,
        opts?: UsdSendOptions,
    ): Promise<SuccessResponse> {
        return this._executeAction({
            action: {
                type: "usdSend",
                hyperliquidChain: this._getHyperliquidChain(),
                signatureChainId: await this._getSignatureChainId(),
                time: await this.nonceManager(),
                ...params,
            },
        }, opts?.signal);
    }

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
     * const privateKey = "0x..."; // or `viem`, `ethers`, `window.ethereum`
     * const transport = new hl.HttpTransport(); // or `WebSocketTransport`
     * const exchClient = new hl.ExchangeClient({ wallet: privateKey, transport });
     *
     * await exchClient.vaultDistribute({ vaultAddress: "0x...", usd: 10 * 1e6 });
     * ```
     */
    vaultDistribute(
        params: VaultDistributeParameters,
        opts?: VaultDistributeOptions,
    ): Promise<SuccessResponse> {
        return this._executeAction({
            action: {
                type: "vaultDistribute",
                ...params,
            },
        }, opts?.signal);
    }

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
     * const privateKey = "0x..."; // or `viem`, `ethers`, `window.ethereum`
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
    vaultModify(
        params: VaultModifyParameters,
        opts?: VaultModifyOptions,
    ): Promise<SuccessResponse> {
        return this._executeAction({
            action: {
                type: "vaultModify",
                ...params,
            },
        }, opts?.signal);
    }

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
     * const privateKey = "0x..."; // or `viem`, `ethers`, `window.ethereum`
     * const transport = new hl.HttpTransport(); // or `WebSocketTransport`
     * const exchClient = new hl.ExchangeClient({ wallet: privateKey, transport });
     *
     * await exchClient.vaultTransfer({ vaultAddress: "0x...", isDeposit: true, usd: 10 * 1e6 });
     * ```
     */
    async vaultTransfer(
        params: VaultTransferParameters,
        opts?: VaultTransferOptions,
    ): Promise<SuccessResponse> {
        return this._executeAction({
            action: {
                type: "vaultTransfer",
                ...params,
            },
            expiresAfter: opts?.expiresAfter ?? await this._getDefaultExpiresAfter(),
        }, opts?.signal);
    }

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
     * const privateKey = "0x..."; // or `viem`, `ethers`, `window.ethereum`
     * const transport = new hl.HttpTransport(); // or `WebSocketTransport`
     * const exchClient = new hl.ExchangeClient({ wallet: privateKey, transport });
     *
     * await exchClient.withdraw3({ destination: "0x...", amount: "1" });
     * ```
     */
    async withdraw3(
        params: Withdraw3Parameters,
        opts?: Withdraw3Options,
    ): Promise<SuccessResponse> {
        return this._executeAction({
            action: {
                type: "withdraw3",
                hyperliquidChain: this._getHyperliquidChain(),
                signatureChainId: await this._getSignatureChainId(),
                time: await this.nonceManager(),
                ...params,
            },
        }, opts?.signal);
    }

    protected async _executeAction<
        T extends
            | SuccessResponse
            | CancelResponseSuccess
            | CreateSubAccountResponse
            | CreateVaultResponse
            | OrderResponseSuccess
            | TwapOrderResponseSuccess
            | TwapCancelResponseSuccess,
    >(
        args: {
            action: Parameters<typeof actionSorter[keyof typeof actionSorter]>[0];
            vaultAddress?: Hex;
            expiresAfter?: number;
            multiSigNonce?: number;
        },
        signal?: AbortSignal,
    ): Promise<T> {
        const { action, vaultAddress, expiresAfter, multiSigNonce } = args;

        // Sign an action

        // deno-lint-ignore no-explicit-any
        const sortedAction = actionSorter[action.type](action as any); // TypeScript cannot infer a type from a dynamic function call

        let nonce: number;
        if (sortedAction.type === "multiSig") { // Multi-signature action
            nonce = multiSigNonce!;
        } else if ("signatureChainId" in sortedAction) { // User-signed action
            nonce = "nonce" in sortedAction ? sortedAction.nonce : sortedAction.time;
        } else { // L1 action
            nonce = await this.nonceManager();
        }

        let signature: Signature;
        if (sortedAction.type === "multiSig") { // Multi-signature action
            // deno-lint-ignore no-explicit-any
            const actionWithoutType = structuredClone<any>(sortedAction);
            delete actionWithoutType.type;
            signature = await signMultiSigAction({
                wallet: this.wallet,
                action: actionWithoutType,
                nonce,
                isTestnet: this.isTestnet,
                vaultAddress,
                expiresAfter,
            });
        } else if ("signatureChainId" in sortedAction) { // User-signed action
            signature = await signUserSignedAction({
                wallet: this.wallet,
                action: sortedAction,
                types: userSignedActionEip712Types[sortedAction.type],
            });
            if ("agentName" in sortedAction && sortedAction.agentName === "") sortedAction.agentName = null;
        } else { // L1 action
            signature = await signL1Action({
                wallet: this.wallet,
                action: sortedAction,
                nonce,
                isTestnet: this.isTestnet,
                vaultAddress,
                expiresAfter,
            });
        }

        // Send a request
        const response = await this.transport.request(
            "exchange",
            { action: sortedAction, signature, nonce, vaultAddress, expiresAfter },
            signal,
        ) as
            | SuccessResponse
            | ErrorResponse
            | CancelResponse
            | CreateSubAccountResponse
            | CreateVaultResponse
            | OrderResponse
            | TwapOrderResponse
            | TwapCancelResponse;
        this._validateResponse<T>(response);
        return response;
    }

    /** Guesses the chain ID based on the wallet type or the isTestnet flag. */
    protected async _guessSignatureChainId(): Promise<Hex> {
        // Trying to get chain ID of the wallet
        if (isAbstractViemWalletClient(this.wallet)) {
            if ("getChainId" in this.wallet && typeof this.wallet.getChainId === "function") {
                const chainId = await this.wallet.getChainId() as number;
                return `0x${chainId.toString(16)}`;
            }
        } else if (isAbstractEthersSigner(this.wallet) || isAbstractEthersV5Signer(this.wallet)) {
            if (
                "provider" in this.wallet &&
                typeof this.wallet.provider === "object" && this.wallet.provider !== null &&
                "getNetwork" in this.wallet.provider &&
                typeof this.wallet.provider.getNetwork === "function"
            ) {
                const network = await this.wallet.provider.getNetwork() as { chainId: number | bigint };
                return `0x${network.chainId.toString(16)}`;
            }
        } else if (isAbstractWindowEthereum(this.wallet)) {
            const [chainId] = await this.wallet.request({ method: "eth_chainId", params: [] }) as Hex[];
            return chainId;
        }
        // Attempt to guess chain ID based on isTestnet
        return this.isTestnet ? "0x66eee" : "0xa4b1";
    }

    /** Get the default expiration time for an action. */
    protected async _getDefaultExpiresAfter(): Promise<number | undefined> {
        return typeof this.defaultExpiresAfter === "number"
            ? this.defaultExpiresAfter
            : await this.defaultExpiresAfter?.();
    }

    /** Get the signature chain ID for the wallet. */
    protected async _getSignatureChainId(): Promise<Hex> {
        return typeof this.signatureChainId === "string" ? this.signatureChainId : await this.signatureChainId();
    }

    /** Get the Hyperliquid chain based on the isTestnet flag. */
    protected _getHyperliquidChain(): "Mainnet" | "Testnet" {
        return this.isTestnet ? "Testnet" : "Mainnet";
    }

    /** Validate a response from the API. */
    protected _validateResponse<
        T extends
            | SuccessResponse
            | CancelResponseSuccess
            | CreateSubAccountResponse
            | CreateVaultResponse
            | OrderResponseSuccess
            | TwapOrderResponseSuccess
            | TwapCancelResponseSuccess,
    >(
        response:
            | SuccessResponse
            | ErrorResponse
            | CancelResponse
            | CreateSubAccountResponse
            | CreateVaultResponse
            | OrderResponse
            | TwapOrderResponse
            | TwapCancelResponse,
    ): asserts response is T {
        if (response.status === "err") {
            throw new ApiRequestError(response as ErrorResponse);
        } else if (response.response.type === "order" || response.response.type === "cancel") {
            if (response.response.data.statuses.some((status) => typeof status === "object" && "error" in status)) {
                throw new ApiRequestError(response as OrderResponse | CancelResponse);
            }
        } else if (response.response.type === "twapOrder" || response.response.type === "twapCancel") {
            if (typeof response.response.data.status === "object" && "error" in response.response.data.status) {
                throw new ApiRequestError(response as TwapOrderResponse | TwapCancelResponse);
            }
        }
    }

    async [Symbol.asyncDispose](): Promise<void> {
        await this.transport[Symbol.asyncDispose]?.();
    }
}
