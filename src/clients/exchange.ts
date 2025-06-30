import { type Hex, HyperliquidError, type MaybePromise } from "../base.ts";
import type { IRequestTransport } from "../transports/base.ts";
import type {
    ApproveAgentRequest,
    ApproveBuilderFeeRequest,
    BaseExchangeRequest,
    BatchModifyRequest,
    CancelByCloidRequest,
    CancelRequest,
    CDepositRequest,
    ConvertToMultiSigUserRequest_Signers,
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
    SubAccountModifyRequest,
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
import type {
    CancelResponse,
    CreateSubAccountResponse,
    CreateVaultResponse,
    ErrorResponse,
    OrderResponse,
    SuccessResponse,
    TwapCancelResponse,
    TwapOrderResponse,
} from "../types/exchange/responses.ts";
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

type ExtractRequestParameters<T extends BaseExchangeRequest> =
    & (T["action"] extends { signatureChainId: unknown }
        ? Omit<T["action"], "type" | "signatureChainId" | "hyperliquidChain" | "nonce" | "time"> // user-signed actions
        : Omit<T["action"], "type">) // L1 actions
    // deno-lint-ignore ban-types
    & (T["vaultAddress"] extends undefined ? {} : Pick<T, "vaultAddress">)
    // deno-lint-ignore ban-types
    & (T["expiresAfter"] extends undefined ? {} : Pick<T, "expiresAfter">);

/** Parameters for the {@linkcode ExchangeClient.approveAgent} method. */
export type ApproveAgentParameters = ExtractRequestParameters<ApproveAgentRequest>;

/** Parameters for the {@linkcode ExchangeClient.approveBuilderFee} method. */
export type ApproveBuilderFeeParameters = ExtractRequestParameters<ApproveBuilderFeeRequest>;

/** Parameters for the {@linkcode ExchangeClient.batchModify} method. */
export type BatchModifyParameters = ExtractRequestParameters<BatchModifyRequest>;

/** Parameters for the {@linkcode ExchangeClient.cancel} method. */
export type CancelParameters = ExtractRequestParameters<CancelRequest>;

/** Parameters for the {@linkcode ExchangeClient.cancelByCloid} method. */
export type CancelByCloidParameters = ExtractRequestParameters<CancelByCloidRequest>;

/** Parameters for the {@linkcode ExchangeClient.cDeposit} method. */
export type CDepositParameters = ExtractRequestParameters<CDepositRequest>;

/** Parameters for the {@linkcode ExchangeClient.convertToMultiSigUser} method. */
export type ConvertToMultiSigUserParameters = ConvertToMultiSigUserRequest_Signers; // Special case: more convenient to work with an object than with a string

/** Parameters for the {@linkcode ExchangeClient.createSubAccount} method. */
export type CreateSubAccountParameters = ExtractRequestParameters<CreateSubAccountRequest>;

/** Parameters for the {@linkcode ExchangeClient.createVault} method. */
export type CreateVaultParameters = ExtractRequestParameters<CreateVaultRequest>;

/** Parameters for the {@linkcode ExchangeClient.cSignerAction} method. */
export type CSignerActionParameters =
    | ExtractRequestParameters<CSignerActionRequest_JailSelf>
    | ExtractRequestParameters<CSignerActionRequest_UnjailSelf>;

/** Parameters for the {@linkcode ExchangeClient.cValidatorAction} method. */
export type CValidatorActionParameters =
    | ExtractRequestParameters<CValidatorActionRequest_ChangeProfile>
    | ExtractRequestParameters<CValidatorActionRequest_Register>
    | ExtractRequestParameters<CValidatorActionRequest_Unregister>;

/** Parameters for the {@linkcode ExchangeClient.cWithdraw} method. */
export type CWithdrawParameters = ExtractRequestParameters<CWithdrawRequest>;

/** Parameters for the {@linkcode ExchangeClient.evmUserModify} method. */
export type EvmUserModifyParameters = ExtractRequestParameters<EvmUserModifyRequest>;

/** Parameters for the {@linkcode ExchangeClient.modify} method. */
export type ModifyParameters = ExtractRequestParameters<ModifyRequest>;

/** Parameters for the {@linkcode ExchangeClient.multiSig} method. */
export type MultiSigParameters =
    & ExtractRequestParameters<MultiSigRequest>
    & {
        /** Must be the same for all signers. */
        nonce: number; // Special case: nonce must be same for all signers
    };

/** Parameters for the {@linkcode ExchangeClient.order} method. */
export type OrderParameters = ExtractRequestParameters<OrderRequest>;

/** Parameters for the {@linkcode ExchangeClient.perpDeploy} method. */
export type PerpDeployParameters =
    | ExtractRequestParameters<PerpDeployRequest_RegisterAsset>
    | ExtractRequestParameters<PerpDeployRequest_SetOracle>;

/** Parameters for the {@linkcode ExchangeClient.perpDexClassTransfer} method. */
export type PerpDexClassTransferParameters = ExtractRequestParameters<PerpDexClassTransferRequest>;

/** Parameters for the {@linkcode ExchangeClient.perpDexTransfer} method. */
export type PerpDexTransferParameters = ExtractRequestParameters<PerpDexTransferRequest>;

/** Parameters for the {@linkcode ExchangeClient.registerReferrer} method. */
export type RegisterReferrerParameters = ExtractRequestParameters<RegisterReferrerRequest>;

/** Parameters for the {@linkcode ExchangeClient.reserveRequestWeight} method. */
export type ReserveRequestWeightParameters = ExtractRequestParameters<ReserveRequestWeightRequest>;

/** Parameters for the {@linkcode ExchangeClient.scheduleCancel} method. */
export type ScheduleCancelParameters = ExtractRequestParameters<ScheduleCancelRequest>;

/** Parameters for the {@linkcode ExchangeClient.setDisplayName} method. */
export type SetDisplayNameParameters = ExtractRequestParameters<SetDisplayNameRequest>;

/** Parameters for the {@linkcode ExchangeClient.setReferrer} method. */
export type SetReferrerParameters = ExtractRequestParameters<SetReferrerRequest>;

/** Parameters for the {@linkcode ExchangeClient.spotDeploy} method. */
export type SpotDeployParameters =
    | ExtractRequestParameters<SpotDeployRequest_Genesis>
    | ExtractRequestParameters<SpotDeployRequest_RegisterHyperliquidity>
    | ExtractRequestParameters<SpotDeployRequest_RegisterSpot>
    | ExtractRequestParameters<SpotDeployRequest_RegisterToken2>
    | ExtractRequestParameters<SpotDeployRequest_SetDeployerTradingFeeShare>
    | ExtractRequestParameters<SpotDeployRequest_UserGenesis>;

/** Parameters for the {@linkcode ExchangeClient.spotSend} method. */
export type SpotSendParameters = ExtractRequestParameters<SpotSendRequest>;

/** Parameters for the {@linkcode ExchangeClient.spotUser} method. */
export type SpotUserParameters = ExtractRequestParameters<SpotUserRequest>;

/** Parameters for the {@linkcode ExchangeClient.subAccountModify} method. */
export type SubAccountModifyParameters = ExtractRequestParameters<SubAccountModifyRequest>;

/** Parameters for the {@linkcode ExchangeClient.subAccountSpotTransfer} method. */
export type SubAccountSpotTransferParameters = ExtractRequestParameters<SubAccountSpotTransferRequest>;

/** Parameters for the {@linkcode ExchangeClient.subAccountTransfer} method. */
export type SubAccountTransferParameters = ExtractRequestParameters<SubAccountTransferRequest>;

/** Parameters for the {@linkcode ExchangeClient.tokenDelegate} method. */
export type TokenDelegateParameters = ExtractRequestParameters<TokenDelegateRequest>;

/** Parameters for the {@linkcode ExchangeClient.twapCancel} method. */
export type TwapCancelParameters = ExtractRequestParameters<TwapCancelRequest>;

/** Parameters for the {@linkcode ExchangeClient.twapOrder} method. */
export type TwapOrderParameters = ExtractRequestParameters<TwapOrderRequest>;

/** Parameters for the {@linkcode ExchangeClient.updateIsolatedMargin} method. */
export type UpdateIsolatedMarginParameters = ExtractRequestParameters<UpdateIsolatedMarginRequest>;

/** Parameters for the {@linkcode ExchangeClient.updateLeverage} method. */
export type UpdateLeverageParameters = ExtractRequestParameters<UpdateLeverageRequest>;

/** Parameters for the {@linkcode ExchangeClient.usdClassTransfer} method. */
export type UsdClassTransferParameters = ExtractRequestParameters<UsdClassTransferRequest>;

/** Parameters for the {@linkcode ExchangeClient.usdSend} method. */
export type UsdSendParameters = ExtractRequestParameters<UsdSendRequest>;

/** Parameters for the {@linkcode ExchangeClient.vaultDistribute} method. */
export type VaultDistributeParameters = ExtractRequestParameters<VaultDistributeRequest>;

/** Parameters for the {@linkcode ExchangeClient.vaultModify} method. */
export type VaultModifyParameters = ExtractRequestParameters<VaultModifyRequest>;

/** Parameters for the {@linkcode ExchangeClient.vaultTransfer} method. */
export type VaultTransferParameters = ExtractRequestParameters<VaultTransferRequest>;

/** Parameters for the {@linkcode ExchangeClient.withdraw3} method. */
export type Withdraw3Parameters = ExtractRequestParameters<Withdraw3Request>;

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
     * @param args - The parameters for the request.
     * @param signal - An optional [AbortSignal](https://developer.mozilla.org/en-US/docs/Web/API/AbortSignal).
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
     * const privateKey = "0x..."; // or `viem`, `ethers`
     * const transport = new hl.HttpTransport(); // or `WebSocketTransport`
     * const exchClient = new hl.ExchangeClient({ wallet: privateKey, transport });
     *
     * await exchClient.approveAgent({ agentAddress: "0x...", agentName: "..." });
     * ```
     */
    async approveAgent(args: ApproveAgentParameters, signal?: AbortSignal): Promise<SuccessResponse> {
        const { ...actionArgs } = args;
        return this._executeAction({
            action: {
                type: "approveAgent",
                hyperliquidChain: this._getHyperliquidChain(),
                signatureChainId: await this._getSignatureChainId(),
                nonce: await this.nonceManager(),
                ...actionArgs,
            },
        }, signal);
    }

    /**
     * Approve a maximum fee rate for a builder.
     * @param args - The parameters for the request.
     * @param signal - An optional [AbortSignal](https://developer.mozilla.org/en-US/docs/Web/API/AbortSignal).
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
     * const privateKey = "0x..."; // or `viem`, `ethers`
     * const transport = new hl.HttpTransport(); // or `WebSocketTransport`
     * const exchClient = new hl.ExchangeClient({ wallet: privateKey, transport });
     *
     * await exchClient.approveBuilderFee({ maxFeeRate: "0.01%", builder: "0x..." });
     * ```
     */
    async approveBuilderFee(args: ApproveBuilderFeeParameters, signal?: AbortSignal): Promise<SuccessResponse> {
        const { ...actionArgs } = args;
        return this._executeAction({
            action: {
                type: "approveBuilderFee",
                hyperliquidChain: this._getHyperliquidChain(),
                signatureChainId: await this._getSignatureChainId(),
                nonce: await this.nonceManager(),
                ...actionArgs,
            },
        }, signal);
    }

    /**
     * Modify multiple orders.
     * @param args - The parameters for the request.
     * @param signal - An optional [AbortSignal](https://developer.mozilla.org/en-US/docs/Web/API/AbortSignal).
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
     * const privateKey = "0x..."; // or `viem`, `ethers`
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
    async batchModify(args: BatchModifyParameters, signal?: AbortSignal): Promise<OrderResponseSuccess> {
        const { vaultAddress, expiresAfter, ...actionArgs } = args;
        return this._executeAction({
            action: {
                type: "batchModify",
                ...actionArgs,
            },
            vaultAddress: vaultAddress ?? this.defaultVaultAddress,
            expiresAfter: expiresAfter ?? await this._getDefaultExpiresAfter(),
        }, signal);
    }

    /**
     * Cancel order(s).
     * @param args - The parameters for the request.
     * @param signal - An optional [AbortSignal](https://developer.mozilla.org/en-US/docs/Web/API/AbortSignal).
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
     * const privateKey = "0x..."; // or `viem`, `ethers`
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
    async cancel(args: CancelParameters, signal?: AbortSignal): Promise<CancelResponseSuccess> {
        const { vaultAddress, expiresAfter, ...actionArgs } = args;
        return this._executeAction({
            action: {
                type: "cancel",
                ...actionArgs,
            },
            vaultAddress: vaultAddress ?? this.defaultVaultAddress,
            expiresAfter: expiresAfter ?? await this._getDefaultExpiresAfter(),
        }, signal);
    }

    /**
     * Cancel order(s) by cloid.
     * @param args - The parameters for the request.
     * @param signal - An optional [AbortSignal](https://developer.mozilla.org/en-US/docs/Web/API/AbortSignal).
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
     * const privateKey = "0x..."; // or `viem`, `ethers`
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
    async cancelByCloid(args: CancelByCloidParameters, signal?: AbortSignal): Promise<CancelResponseSuccess> {
        const { vaultAddress, expiresAfter, ...actionArgs } = args;
        return this._executeAction({
            action: {
                type: "cancelByCloid",
                ...actionArgs,
            },
            vaultAddress: vaultAddress ?? this.defaultVaultAddress,
            expiresAfter: expiresAfter ?? await this._getDefaultExpiresAfter(),
        }, signal);
    }

    /**
     * Transfer native token from the user's spot account into staking for delegating to validators.
     * @param args - The parameters for the request.
     * @param signal - An optional [AbortSignal](https://developer.mozilla.org/en-US/docs/Web/API/AbortSignal).
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
     * const privateKey = "0x..."; // or `viem`, `ethers`
     * const transport = new hl.HttpTransport(); // or `WebSocketTransport`
     * const exchClient = new hl.ExchangeClient({ wallet: privateKey, transport });
     *
     * await exchClient.cDeposit({ wei: 1 * 1e8 });
     * ```
     */
    async cDeposit(args: CDepositParameters, signal?: AbortSignal): Promise<SuccessResponse> {
        const { ...actionArgs } = args;
        return this._executeAction({
            action: {
                type: "cDeposit",
                hyperliquidChain: this._getHyperliquidChain(),
                signatureChainId: await this._getSignatureChainId(),
                nonce: await this.nonceManager(),
                ...actionArgs,
            },
        }, signal);
    }

    /**
     * Claim rewards from referral program.
     * @param args - The parameters for the request.
     * @param signal - An optional [AbortSignal](https://developer.mozilla.org/en-US/docs/Web/API/AbortSignal).
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
     * const privateKey = "0x..."; // or `viem`, `ethers`
     * const transport = new hl.HttpTransport(); // or `WebSocketTransport`
     * const exchClient = new hl.ExchangeClient({ wallet: privateKey, transport });
     *
     * await exchClient.claimRewards();
     * ```
     */
    claimRewards(signal?: AbortSignal): Promise<SuccessResponse> {
        return this._executeAction({
            action: {
                type: "claimRewards",
            },
        }, signal);
    }

    /**
     * Convert a single-signature account to a multi-signature account or vice versa.
     * @param args - The parameters for the request.
     * @param signal - An optional [AbortSignal](https://developer.mozilla.org/en-US/docs/Web/API/AbortSignal).
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
     * const privateKey = "0x..."; // or `viem`, `ethers`
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
    async convertToMultiSigUser(args: ConvertToMultiSigUserParameters, signal?: AbortSignal): Promise<SuccessResponse> {
        const actionArgs = args;
        return this._executeAction({
            action: {
                type: "convertToMultiSigUser",
                hyperliquidChain: this._getHyperliquidChain(),
                signatureChainId: await this._getSignatureChainId(),
                nonce: await this.nonceManager(),
                signers: JSON.stringify(actionArgs),
            },
        }, signal);
    }

    /**
     * Create a sub-account.
     * @param args - The parameters for the request.
     * @param signal - An optional [AbortSignal](https://developer.mozilla.org/en-US/docs/Web/API/AbortSignal).
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
     * const privateKey = "0x..."; // or `viem`, `ethers`
     * const transport = new hl.HttpTransport(); // or `WebSocketTransport`
     * const exchClient = new hl.ExchangeClient({ wallet: privateKey, transport });
     *
     * const data = await exchClient.createSubAccount({ name: "..." });
     * ```
     */
    createSubAccount(args: CreateSubAccountParameters, signal?: AbortSignal): Promise<CreateSubAccountResponse> {
        const { ...actionArgs } = args;
        return this._executeAction({
            action: {
                type: "createSubAccount",
                ...actionArgs,
            },
        }, signal);
    }

    /**
     * Create a vault.
     * @param args - The parameters for the request.
     * @param signal - An optional [AbortSignal](https://developer.mozilla.org/en-US/docs/Web/API/AbortSignal).
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
     * const privateKey = "0x..."; // or `viem`, `ethers`
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
    createVault(args: CreateVaultParameters, signal?: AbortSignal): Promise<CreateVaultResponse> {
        const { ...actionArgs } = args;
        return this._executeAction({
            action: {
                type: "createVault",
                ...actionArgs,
            },
        }, signal);
    }

    /**
     * Jail or unjail self as a validator signer.
     * @param args - The parameters for the request.
     * @param signal - An optional [AbortSignal](https://developer.mozilla.org/en-US/docs/Web/API/AbortSignal).
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
     * const privateKey = "0x..."; // or `viem`, `ethers`
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
    async cSignerAction(args: CSignerActionParameters, signal?: AbortSignal): Promise<SuccessResponse> {
        const { expiresAfter, ...actionArgs } = args;
        return this._executeAction({
            action: {
                type: "CSignerAction",
                ...actionArgs,
            },
            expiresAfter: expiresAfter ?? await this._getDefaultExpiresAfter(),
        }, signal);
    }

    /**
     * Action related to validator management.
     * @param args - The parameters for the request.
     * @param signal - An optional [AbortSignal](https://developer.mozilla.org/en-US/docs/Web/API/AbortSignal).
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
     * const privateKey = "0x..."; // or `viem`, `ethers`
     * const transport = new hl.HttpTransport(); // or `WebSocketTransport`
     * const exchClient = new hl.ExchangeClient({ wallet: privateKey, transport });
     *
     * // Change validator profile
     * await exchClient.cValidatorAction({
     *   changeProfile: {
     *     name: "...",
     *     description: "...",
     *     unjailed: true,
     *   }
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
    async cValidatorAction(args: CValidatorActionParameters, signal?: AbortSignal): Promise<SuccessResponse> {
        const { expiresAfter, ...actionArgs } = args;
        return this._executeAction({
            action: {
                type: "CValidatorAction",
                ...actionArgs,
            },
            expiresAfter: expiresAfter ?? await this._getDefaultExpiresAfter(),
        }, signal);
    }

    /**
     * Transfer native token from staking into the user's spot account.
     * @param args - The parameters for the request.
     * @param signal - An optional [AbortSignal](https://developer.mozilla.org/en-US/docs/Web/API/AbortSignal).
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
     * const privateKey = "0x..."; // or `viem`, `ethers`
     * const transport = new hl.HttpTransport(); // or `WebSocketTransport`
     * const exchClient = new hl.ExchangeClient({ wallet: privateKey, transport });
     *
     * await exchClient.cWithdraw({ wei: 1 * 1e8 });
     * ```
     */
    async cWithdraw(args: CWithdrawParameters, signal?: AbortSignal): Promise<SuccessResponse> {
        const { ...actionArgs } = args;
        return this._executeAction({
            action: {
                type: "cWithdraw",
                hyperliquidChain: this._getHyperliquidChain(),
                signatureChainId: await this._getSignatureChainId(),
                nonce: await this.nonceManager(),
                ...actionArgs,
            },
        }, signal);
    }

    /**
     * Configure block type for EVM transactions.
     * @param args - The parameters for the request.
     * @param signal - An optional [AbortSignal](https://developer.mozilla.org/en-US/docs/Web/API/AbortSignal).
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
     * const privateKey = "0x..."; // or `viem`, `ethers`
     * const transport = new hl.HttpTransport(); // or `WebSocketTransport`
     * const exchClient = new hl.ExchangeClient({ wallet: privateKey, transport });
     *
     * const data = await exchClient.evmUserModify({ usingBigBlocks: true });
     * ```
     */
    evmUserModify(args: EvmUserModifyParameters, signal?: AbortSignal): Promise<SuccessResponse> {
        const { ...actionArgs } = args;
        return this._executeAction({
            action: {
                type: "evmUserModify",
                ...actionArgs,
            },
        }, signal);
    }

    /**
     * Modify an order.
     * @param args - The parameters for the request.
     * @param signal - An optional [AbortSignal](https://developer.mozilla.org/en-US/docs/Web/API/AbortSignal).
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
     * const privateKey = "0x..."; // or `viem`, `ethers`
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
    async modify(args: ModifyParameters, signal?: AbortSignal): Promise<SuccessResponse> {
        const { vaultAddress, expiresAfter, ...actionArgs } = args;
        return this._executeAction({
            action: {
                type: "modify",
                ...actionArgs,
            },
            vaultAddress: vaultAddress ?? this.defaultVaultAddress,
            expiresAfter: expiresAfter ?? await this._getDefaultExpiresAfter(),
        }, signal);
    }

    /**
     * A multi-signature request.
     * @param args - The parameters for the request.
     * @param signal - An optional [AbortSignal](https://developer.mozilla.org/en-US/docs/Web/API/AbortSignal).
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
    >(args: MultiSigParameters, signal?: AbortSignal): Promise<T> {
        const { vaultAddress, expiresAfter, nonce, ...actionArgs } = args;
        return this._executeAction({
            action: {
                type: "multiSig",
                signatureChainId: await this._getSignatureChainId(),
                ...actionArgs,
            },
            vaultAddress: vaultAddress ?? this.defaultVaultAddress,
            expiresAfter: expiresAfter ?? await this._getDefaultExpiresAfter(),
            multiSigNonce: nonce,
        }, signal);
    }

    /**
     * Place an order(s).
     * @param args - The parameters for the request.
     * @param signal - An optional [AbortSignal](https://developer.mozilla.org/en-US/docs/Web/API/AbortSignal).
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
     * const privateKey = "0x..."; // or `viem`, `ethers`
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
    async order(args: OrderParameters, signal?: AbortSignal): Promise<OrderResponseSuccess> {
        const { vaultAddress, expiresAfter, ...actionArgs } = args;
        return this._executeAction({
            action: {
                type: "order",
                ...actionArgs,
            },
            vaultAddress: vaultAddress ?? this.defaultVaultAddress,
            expiresAfter: expiresAfter ?? await this._getDefaultExpiresAfter(),
        }, signal);
    }

    /**
     * Deploying HIP-3 assets.
     * @param args - The parameters for the request.
     * @param signal - An optional [AbortSignal](https://developer.mozilla.org/en-US/docs/Web/API/AbortSignal).
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
     * const privateKey = "0x..."; // or `viem`, `ethers`
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
     *   },
     * });
     * ```
     */
    perpDeploy(args: PerpDeployParameters, signal?: AbortSignal): Promise<SuccessResponse> {
        const { ...actionArgs } = args;
        return this._executeAction({
            action: {
                type: "perpDeploy",
                ...actionArgs,
            },
        }, signal);
    }

    /**
     * Transfer funds between Spot account and Perp dex account.
     * @param args - The parameters for the request.
     * @param signal - An optional [AbortSignal](https://developer.mozilla.org/en-US/docs/Web/API/AbortSignal).
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
     * const privateKey = "0x..."; // or `viem`, `ethers`
     * const transport = new hl.HttpTransport(); // or `WebSocketTransport`
     * const exchClient = new hl.ExchangeClient({ wallet: privateKey, transport });
     *
     * await exchClient.perpDexClassTransfer({ dex: "test", token: "USDC", amount: "1", toPerp: true });
     * ```
     */
    async perpDexClassTransfer(args: PerpDexClassTransferParameters, signal?: AbortSignal): Promise<SuccessResponse> {
        const { ...actionArgs } = args;
        return this._executeAction({
            action: {
                type: "PerpDexClassTransfer",
                hyperliquidChain: this._getHyperliquidChain(),
                signatureChainId: await this._getSignatureChainId(),
                nonce: await this.nonceManager(),
                ...actionArgs,
            },
        }, signal);
    }

    /**
     * Transfer collateral tokens between different perp dexes for the same user.
     * @param args - The parameters for the request.
     * @param signal - An optional [AbortSignal](https://developer.mozilla.org/en-US/docs/Web/API/AbortSignal).
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
     * const privateKey = "0x..."; // or `viem`, `ethers`
     * const transport = new hl.HttpTransport(); // or `WebSocketTransport`
     * const exchClient = new hl.ExchangeClient({ wallet: privateKey, transport });
     *
     * await exchClient.perpDexTransfer({ sourceDex: "", destinationDex: "test", amount: "1" });
     * ```
     */
    async perpDexTransfer(args: PerpDexTransferParameters, signal?: AbortSignal): Promise<SuccessResponse> {
        const { ...actionArgs } = args;
        return this._executeAction({
            action: {
                type: "PerpDexTransfer",
                hyperliquidChain: this._getHyperliquidChain(),
                signatureChainId: await this._getSignatureChainId(),
                nonce: await this.nonceManager(),
                ...actionArgs,
            },
        }, signal);
    }

    /**
     * Create a referral code.
     * @param args - The parameters for the request.
     * @param signal - An optional [AbortSignal](https://developer.mozilla.org/en-US/docs/Web/API/AbortSignal).
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
     * const privateKey = "0x..."; // or `viem`, `ethers`
     * const transport = new hl.HttpTransport(); // or `WebSocketTransport`
     * const exchClient = new hl.ExchangeClient({ wallet: privateKey, transport });
     *
     * await exchClient.registerReferrer({ code: "..." });
     * ```
     */
    registerReferrer(args: RegisterReferrerParameters, signal?: AbortSignal): Promise<SuccessResponse> {
        const { ...actionArgs } = args;
        return this._executeAction({
            action: {
                type: "registerReferrer",
                ...actionArgs,
            },
        }, signal);
    }

    /**
     * Reserve additional rate-limited actions for a fee.
     * @param args - The parameters for the request.
     * @param signal - An optional [AbortSignal](https://developer.mozilla.org/en-US/docs/Web/API/AbortSignal).
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
     * const privateKey = "0x..."; // or `viem`, `ethers`
     * const transport = new hl.HttpTransport(); // or `WebSocketTransport`
     * const exchClient = new hl.ExchangeClient({ wallet: privateKey, transport });
     *
     * await exchClient.reserveRequestWeight({ weight: 10 });
     * ```
     */
    async reserveRequestWeight(args: ReserveRequestWeightParameters, signal?: AbortSignal): Promise<SuccessResponse> {
        const { expiresAfter, ...actionArgs } = args;
        return this._executeAction({
            action: {
                type: "reserveRequestWeight",
                ...actionArgs,
            },
            expiresAfter: expiresAfter ?? await this._getDefaultExpiresAfter(),
        }, signal);
    }

    /**
     * Schedule a cancel-all operation at a future time.
     * @param args - The parameters for the request.
     * @param signal - An optional [AbortSignal](https://developer.mozilla.org/en-US/docs/Web/API/AbortSignal).
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
     * const privateKey = "0x..."; // or `viem`, `ethers`
     * const transport = new hl.HttpTransport(); // or `WebSocketTransport`
     * const exchClient = new hl.ExchangeClient({ wallet: privateKey, transport });
     *
     * await exchClient.scheduleCancel({ time: Date.now() + 10_000 });
     * ```
     */
    async scheduleCancel(args?: ScheduleCancelParameters, signal?: AbortSignal): Promise<SuccessResponse>;
    async scheduleCancel(signal?: AbortSignal): Promise<SuccessResponse>;
    async scheduleCancel(
        args_or_signal?: ScheduleCancelParameters | AbortSignal,
        maybeSignal?: AbortSignal,
    ): Promise<SuccessResponse> {
        const args = args_or_signal instanceof AbortSignal ? {} : args_or_signal ?? {};
        const signal = args_or_signal instanceof AbortSignal ? args_or_signal : maybeSignal;
        const { vaultAddress, expiresAfter, ...actionArgs } = args;
        return this._executeAction({
            action: {
                type: "scheduleCancel",
                ...actionArgs,
            },
            vaultAddress: vaultAddress ?? this.defaultVaultAddress,
            expiresAfter: expiresAfter ?? await this._getDefaultExpiresAfter(),
        }, signal);
    }

    /**
     * Set the display name in the leaderboard.
     * @param args - The parameters for the request.
     * @param signal - An optional [AbortSignal](https://developer.mozilla.org/en-US/docs/Web/API/AbortSignal).
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
     * const privateKey = "0x..."; // or `viem`, `ethers`
     * const transport = new hl.HttpTransport(); // or `WebSocketTransport`
     * const exchClient = new hl.ExchangeClient({ wallet: privateKey, transport });
     *
     * await exchClient.setDisplayName({ displayName: "..." });
     * ```
     */
    setDisplayName(args: SetDisplayNameParameters, signal?: AbortSignal): Promise<SuccessResponse> {
        const { ...actionArgs } = args;
        return this._executeAction({
            action: {
                type: "setDisplayName",
                ...actionArgs,
            },
        }, signal);
    }

    /**
     * Set a referral code.
     * @param args - The parameters for the request.
     * @param signal - An optional [AbortSignal](https://developer.mozilla.org/en-US/docs/Web/API/AbortSignal).
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
     * const privateKey = "0x..."; // or `viem`, `ethers`
     * const transport = new hl.HttpTransport(); // or `WebSocketTransport`
     * const exchClient = new hl.ExchangeClient({ wallet: privateKey, transport });
     *
     * await exchClient.setReferrer({ code: "..." });
     * ```
     */
    setReferrer(args: SetReferrerParameters, signal?: AbortSignal): Promise<SuccessResponse> {
        const { ...actionArgs } = args;
        return this._executeAction({
            action: {
                type: "setReferrer",
                ...actionArgs,
            },
        }, signal);
    }

    /**
     * Deploying HIP-1 and HIP-2 assets.
     * @param args - The parameters for the request.
     * @param signal - An optional [AbortSignal](https://developer.mozilla.org/en-US/docs/Web/API/AbortSignal).
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
     * const privateKey = "0x..."; // or `viem`, `ethers`
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
    spotDeploy(args: SpotDeployParameters, signal?: AbortSignal): Promise<SuccessResponse> {
        const { ...actionArgs } = args;
        return this._executeAction({
            action: {
                type: "spotDeploy",
                ...actionArgs,
            },
        }, signal);
    }

    /**
     * Send spot assets to another address.
     * @param args - The parameters for the request.
     * @param signal - An optional [AbortSignal](https://developer.mozilla.org/en-US/docs/Web/API/AbortSignal).
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
     * const privateKey = "0x..."; // or `viem`, `ethers`
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
    async spotSend(args: SpotSendParameters, signal?: AbortSignal): Promise<SuccessResponse> {
        const { ...actionArgs } = args;
        return this._executeAction({
            action: {
                type: "spotSend",
                hyperliquidChain: this._getHyperliquidChain(),
                signatureChainId: await this._getSignatureChainId(),
                time: await this.nonceManager(),
                ...actionArgs,
            },
        }, signal);
    }

    /**
     * Modify a sub-account's.
     * @param args - The parameters for the request.
     * @param signal - An optional [AbortSignal](https://developer.mozilla.org/en-US/docs/Web/API/AbortSignal).
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
     * const privateKey = "0x..."; // or `viem`, `ethers`
     * const transport = new hl.HttpTransport(); // or `WebSocketTransport`
     * const exchClient = new hl.ExchangeClient({ wallet: privateKey, transport });
     *
     * await exchClient.subAccountModify({ subAccountUser: "0x...", name: "..."  });
     * ```
     */
    subAccountModify(args: SubAccountModifyParameters, signal?: AbortSignal): Promise<SuccessResponse> {
        const { ...actionArgs } = args;
        return this._executeAction({
            action: {
                type: "subAccountModify",
                ...actionArgs,
            },
        }, signal);
    }

    /**
     * Opt Out of Spot Dusting.
     * @param args - The parameters for the request.
     * @param signal - An optional [AbortSignal](https://developer.mozilla.org/en-US/docs/Web/API/AbortSignal).
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
     * const privateKey = "0x..."; // or `viem`, `ethers`
     * const transport = new hl.HttpTransport(); // or `WebSocketTransport`
     * const exchClient = new hl.ExchangeClient({ wallet: privateKey, transport });
     *
     * await exchClient.spotUser({ toggleSpotDusting: { optOut: false } });
     * ```
     */
    spotUser(args: SpotUserParameters, signal?: AbortSignal): Promise<SuccessResponse> {
        const { ...actionArgs } = args;
        return this._executeAction({
            action: {
                type: "spotUser",
                ...actionArgs,
            },
        }, signal);
    }

    /**
     * Transfer between sub-accounts (spot).
     * @param args - The parameters for the request.
     * @param signal - An optional [AbortSignal](https://developer.mozilla.org/en-US/docs/Web/API/AbortSignal).
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
     * const privateKey = "0x..."; // or `viem`, `ethers`
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
    subAccountSpotTransfer(args: SubAccountSpotTransferParameters, signal?: AbortSignal): Promise<SuccessResponse> {
        const { ...actionArgs } = args;
        return this._executeAction({
            action: {
                type: "subAccountSpotTransfer",
                ...actionArgs,
            },
        }, signal);
    }

    /**
     * Transfer between sub-accounts (perpetual).
     * @param args - The parameters for the request.
     * @param signal - An optional [AbortSignal](https://developer.mozilla.org/en-US/docs/Web/API/AbortSignal).
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
     * const privateKey = "0x..."; // or `viem`, `ethers`
     * const transport = new hl.HttpTransport(); // or `WebSocketTransport`
     * const exchClient = new hl.ExchangeClient({ wallet: privateKey, transport });
     *
     * await exchClient.subAccountTransfer({ subAccountUser: "0x...", isDeposit: true, usd: 1 * 1e6 });
     * ```
     */
    subAccountTransfer(args: SubAccountTransferParameters, signal?: AbortSignal): Promise<SuccessResponse> {
        const { ...actionArgs } = args;
        return this._executeAction({
            action: {
                type: "subAccountTransfer",
                ...actionArgs,
            },
        }, signal);
    }

    /**
     * Delegate or undelegate native tokens to or from a validator.
     * @param args - The parameters for the request.
     * @param signal - An optional [AbortSignal](https://developer.mozilla.org/en-US/docs/Web/API/AbortSignal).
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
     * const privateKey = "0x..."; // or `viem`, `ethers`
     * const transport = new hl.HttpTransport(); // or `WebSocketTransport`
     * const exchClient = new hl.ExchangeClient({ wallet: privateKey, transport });
     *
     * await exchClient.tokenDelegate({ validator: "0x...", isUndelegate: true, wei: 1 * 1e8 });
     * ```
     */
    async tokenDelegate(args: TokenDelegateParameters, signal?: AbortSignal): Promise<SuccessResponse> {
        const { ...actionArgs } = args;
        return this._executeAction({
            action: {
                type: "tokenDelegate",
                hyperliquidChain: this._getHyperliquidChain(),
                signatureChainId: await this._getSignatureChainId(),
                nonce: await this.nonceManager(),
                ...actionArgs,
            },
        }, signal);
    }

    /**
     * Cancel a TWAP order.
     * @param args - The parameters for the request.
     * @param signal - An optional [AbortSignal](https://developer.mozilla.org/en-US/docs/Web/API/AbortSignal).
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
     * const privateKey = "0x..."; // or `viem`, `ethers`
     * const transport = new hl.HttpTransport(); // or `WebSocketTransport`
     * const exchClient = new hl.ExchangeClient({ wallet: privateKey, transport });
     *
     * const data = await exchClient.twapCancel({ a: 0, t: 1 });
     * ```
     */
    async twapCancel(args: TwapCancelParameters, signal?: AbortSignal): Promise<TwapCancelResponseSuccess> {
        const { vaultAddress, expiresAfter, ...actionArgs } = args;
        return this._executeAction({
            action: {
                type: "twapCancel",
                ...actionArgs,
            },
            vaultAddress: vaultAddress ?? this.defaultVaultAddress,
            expiresAfter: expiresAfter ?? await this._getDefaultExpiresAfter(),
        }, signal);
    }

    /**
     * Place a TWAP order.
     * @param args - The parameters for the request.
     * @param signal - An optional [AbortSignal](https://developer.mozilla.org/en-US/docs/Web/API/AbortSignal).
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
     * const privateKey = "0x..."; // or `viem`, `ethers`
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
    async twapOrder(args: TwapOrderParameters, signal?: AbortSignal): Promise<TwapOrderResponseSuccess> {
        const { vaultAddress, expiresAfter, ...actionArgs } = args;
        return this._executeAction({
            action: {
                type: "twapOrder",
                ...actionArgs,
            },
            vaultAddress: vaultAddress ?? this.defaultVaultAddress,
            expiresAfter: expiresAfter ?? await this._getDefaultExpiresAfter(),
        }, signal);
    }

    /**
     * Add or remove margin from isolated position.
     * @param args - The parameters for the request.
     * @param signal - An optional [AbortSignal](https://developer.mozilla.org/en-US/docs/Web/API/AbortSignal).
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
     * const privateKey = "0x..."; // or `viem`, `ethers`
     * const transport = new hl.HttpTransport(); // or `WebSocketTransport`
     * const exchClient = new hl.ExchangeClient({ wallet: privateKey, transport });
     *
     * await exchClient.updateIsolatedMargin({ asset: 0, isBuy: true, ntli: 1 * 1e6 });
     * ```
     */
    async updateIsolatedMargin(args: UpdateIsolatedMarginParameters, signal?: AbortSignal): Promise<SuccessResponse> {
        const { vaultAddress, expiresAfter, ...actionArgs } = args;
        return this._executeAction({
            action: {
                type: "updateIsolatedMargin",
                ...actionArgs,
            },
            vaultAddress: vaultAddress ?? this.defaultVaultAddress,
            expiresAfter: expiresAfter ?? await this._getDefaultExpiresAfter(),
        }, signal);
    }

    /**
     * Update cross or isolated leverage on a coin.
     * @param args - The parameters for the request.
     * @param signal - An optional [AbortSignal](https://developer.mozilla.org/en-US/docs/Web/API/AbortSignal).
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
     * const privateKey = "0x..."; // or `viem`, `ethers`
     * const transport = new hl.HttpTransport(); // or `WebSocketTransport`
     * const exchClient = new hl.ExchangeClient({ wallet: privateKey, transport });
     *
     * await exchClient.updateLeverage({ asset: 0, isCross: true, leverage: 5 });
     * ```
     */
    async updateLeverage(args: UpdateLeverageParameters, signal?: AbortSignal): Promise<SuccessResponse> {
        const { vaultAddress, expiresAfter, ...actionArgs } = args;
        return this._executeAction({
            action: {
                type: "updateLeverage",
                ...actionArgs,
            },
            vaultAddress: vaultAddress ?? this.defaultVaultAddress,
            expiresAfter: expiresAfter ?? await this._getDefaultExpiresAfter(),
        }, signal);
    }

    /**
     * Transfer funds between Spot account and Perp account.
     * @param args - The parameters for the request.
     * @param signal - An optional [AbortSignal](https://developer.mozilla.org/en-US/docs/Web/API/AbortSignal).
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
     * const privateKey = "0x..."; // or `viem`, `ethers`
     * const transport = new hl.HttpTransport(); // or `WebSocketTransport`
     * const exchClient = new hl.ExchangeClient({ wallet: privateKey, transport });
     *
     * await exchClient.usdClassTransfer({ amount: "1", toPerp: true });
     * ```
     */
    async usdClassTransfer(args: UsdClassTransferParameters, signal?: AbortSignal): Promise<SuccessResponse> {
        const { ...actionArgs } = args;
        return this._executeAction({
            action: {
                type: "usdClassTransfer",
                hyperliquidChain: this._getHyperliquidChain(),
                signatureChainId: await this._getSignatureChainId(),
                nonce: await this.nonceManager(),
                ...actionArgs,
            },
        }, signal);
    }

    /**
     * Send usd to another address.
     * @param args - The parameters for the request.
     * @param signal - An optional [AbortSignal](https://developer.mozilla.org/en-US/docs/Web/API/AbortSignal).
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
     * const privateKey = "0x..."; // or `viem`, `ethers`
     * const transport = new hl.HttpTransport(); // or `WebSocketTransport`
     * const exchClient = new hl.ExchangeClient({ wallet: privateKey, transport });
     *
     * await exchClient.usdSend({ destination: "0x...", amount: "1" });
     * ```
     */
    async usdSend(args: UsdSendParameters, signal?: AbortSignal): Promise<SuccessResponse> {
        const { ...actionArgs } = args;
        return this._executeAction({
            action: {
                type: "usdSend",
                hyperliquidChain: this._getHyperliquidChain(),
                signatureChainId: await this._getSignatureChainId(),
                time: await this.nonceManager(),
                ...actionArgs,
            },
        }, signal);
    }

    /**
     * Distribute funds from a vault between followers.
     * @param args - The parameters for the request.
     * @param signal - An optional [AbortSignal](https://developer.mozilla.org/en-US/docs/Web/API/AbortSignal).
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
     * const privateKey = "0x..."; // or `viem`, `ethers`
     * const transport = new hl.HttpTransport(); // or `WebSocketTransport`
     * const exchClient = new hl.ExchangeClient({ wallet: privateKey, transport });
     *
     * await exchClient.vaultDistribute({ vaultAddress: "0x...", usd: 10 * 1e6 });
     * ```
     */
    vaultDistribute(args: VaultDistributeParameters, signal?: AbortSignal): Promise<SuccessResponse> {
        const { ...actionArgs } = args;
        return this._executeAction({
            action: {
                type: "vaultDistribute",
                ...actionArgs,
            },
        }, signal);
    }

    /**
     * Modify a vault's configuration.
     * @param args - The parameters for the request.
     * @param signal - An optional [AbortSignal](https://developer.mozilla.org/en-US/docs/Web/API/AbortSignal).
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
     * const privateKey = "0x..."; // or `viem`, `ethers`
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
    vaultModify(args: VaultModifyParameters, signal?: AbortSignal): Promise<SuccessResponse> {
        const { ...actionArgs } = args;
        return this._executeAction({
            action: {
                type: "vaultModify",
                ...actionArgs,
            },
        }, signal);
    }

    /**
     * Deposit or withdraw from a vault.
     * @param args - The parameters for the request.
     * @param signal - An optional [AbortSignal](https://developer.mozilla.org/en-US/docs/Web/API/AbortSignal).
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
     * const privateKey = "0x..."; // or `viem`, `ethers`
     * const transport = new hl.HttpTransport(); // or `WebSocketTransport`
     * const exchClient = new hl.ExchangeClient({ wallet: privateKey, transport });
     *
     * await exchClient.vaultTransfer({ vaultAddress: "0x...", isDeposit: true, usd: 10 * 1e6 });
     * ```
     */
    async vaultTransfer(args: VaultTransferParameters, signal?: AbortSignal): Promise<SuccessResponse> {
        const { expiresAfter, ...actionArgs } = args;
        return this._executeAction({
            action: {
                type: "vaultTransfer",
                ...actionArgs,
            },
            expiresAfter: expiresAfter ?? await this._getDefaultExpiresAfter(),
        }, signal);
    }

    /**
     * Initiate a withdrawal request.
     * @param args - The parameters for the request.
     * @param signal - An optional [AbortSignal](https://developer.mozilla.org/en-US/docs/Web/API/AbortSignal).
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
     * const privateKey = "0x..."; // or `viem`, `ethers`
     * const transport = new hl.HttpTransport(); // or `WebSocketTransport`
     * const exchClient = new hl.ExchangeClient({ wallet: privateKey, transport });
     *
     * await exchClient.withdraw3({ destination: "0x...", amount: "1" });
     * ```
     */
    async withdraw3(args: Withdraw3Parameters, signal?: AbortSignal): Promise<SuccessResponse> {
        const { ...actionArgs } = args;
        return this._executeAction({
            action: {
                type: "withdraw3",
                hyperliquidChain: this._getHyperliquidChain(),
                signatureChainId: await this._getSignatureChainId(),
                time: await this.nonceManager(),
                ...actionArgs,
            },
        }, signal);
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
