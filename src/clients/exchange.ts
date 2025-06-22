import { type DeepImmutable, type Hex, HyperliquidError, type MaybePromise } from "../base.ts";
import type { IRequestTransport } from "../transports/base.ts";
import type {
    ApproveAgentRequest,
    ApproveBuilderFeeRequest,
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

/** Parameters for the {@linkcode ExchangeClient.approveAgent} method. */
export type ApproveAgentParameters = Omit<
    ApproveAgentRequest["action"],
    "type" | "hyperliquidChain" | "signatureChainId" | "nonce"
>;

/** Parameters for the {@linkcode ExchangeClient.approveBuilderFee} method. */
export type ApproveBuilderFeeParameters = Omit<
    ApproveBuilderFeeRequest["action"],
    "type" | "hyperliquidChain" | "signatureChainId" | "nonce"
>;

/** Parameters for the {@linkcode ExchangeClient.batchModify} method. */
export type BatchModifyParameters =
    & Omit<BatchModifyRequest["action"], "type">
    & Partial<Pick<BatchModifyRequest, "vaultAddress">>
    & Partial<Pick<BatchModifyRequest, "expiresAfter">>;

/** Parameters for the {@linkcode ExchangeClient.cancel} method. */
export type CancelParameters =
    & Omit<CancelRequest["action"], "type">
    & Partial<Pick<CancelRequest, "vaultAddress">>
    & Partial<Pick<CancelRequest, "expiresAfter">>;

/** Parameters for the {@linkcode ExchangeClient.cancelByCloid} method. */
export type CancelByCloidParameters =
    & Omit<CancelByCloidRequest["action"], "type">
    & Partial<Pick<CancelByCloidRequest, "vaultAddress">>
    & Partial<Pick<CancelByCloidRequest, "expiresAfter">>;

/** Parameters for the {@linkcode ExchangeClient.cDeposit} method. */
export type CDepositParameters = Omit<
    CDepositRequest["action"],
    "type" | "hyperliquidChain" | "signatureChainId" | "nonce"
>;

/** Parameters for the {@linkcode ExchangeClient.convertToMultiSigUser} method. */
export type ConvertToMultiSigUserParameters = ConvertToMultiSigUserRequest_Signers;

/** Parameters for the {@linkcode ExchangeClient.createSubAccount} method. */
export type CreateSubAccountParameters = Omit<
    CreateSubAccountRequest["action"],
    "type"
>;

/** Parameters for the {@linkcode ExchangeClient.createVault} method. */
export type CreateVaultParameters = Omit<
    CreateVaultRequest["action"],
    "type" | "nonce"
>;

/** Parameters for the {@linkcode ExchangeClient.cSignerAction} method. */
export type CSignerActionParameters =
    | CSignerActionParameters_JailSelf
    | CSignerActionParameters_UnjailSelf;
/** One of the parameters for the {@linkcode ExchangeClient.cSignerAction} method. */
export type CSignerActionParameters_JailSelf =
    & Omit<CSignerActionRequest_JailSelf["action"], "type">
    & Partial<Pick<CSignerActionRequest_JailSelf, "expiresAfter">>;
/** One of the parameters for the {@linkcode ExchangeClient.cSignerAction} method. */
export type CSignerActionParameters_UnjailSelf =
    & Omit<CSignerActionRequest_UnjailSelf["action"], "type">
    & Partial<Pick<CSignerActionRequest_UnjailSelf, "expiresAfter">>;

/** Parameters for the {@linkcode ExchangeClient.cValidatorAction} method. */
export type CValidatorActionParameters =
    | CValidatorActionParameters_ChangeProfile
    | CValidatorActionParameters_Register
    | CValidatorActionParameters_Unregister;
/** One of the parameters for the {@linkcode ExchangeClient.cValidatorAction} method. */
export type CValidatorActionParameters_ChangeProfile =
    & Omit<CValidatorActionRequest_ChangeProfile["action"], "type">
    & Partial<Pick<CValidatorActionRequest_ChangeProfile, "expiresAfter">>;
/** One of the parameters for the {@linkcode ExchangeClient.cValidatorAction} method. */
export type CValidatorActionParameters_Register =
    & Omit<CValidatorActionRequest_Register["action"], "type">
    & Partial<Pick<CValidatorActionRequest_Register, "expiresAfter">>;
/** One of the parameters for the {@linkcode ExchangeClient.cValidatorAction} method. */
export type CValidatorActionParameters_Unregister =
    & Omit<CValidatorActionRequest_Unregister["action"], "type">
    & Partial<Pick<CValidatorActionRequest_Unregister, "expiresAfter">>;

/** Parameters for the {@linkcode ExchangeClient.cWithdraw} method. */
export type CWithdrawParameters = Omit<
    CWithdrawRequest["action"],
    "type" | "hyperliquidChain" | "signatureChainId" | "nonce"
>;

/** Parameters for the {@linkcode ExchangeClient.evmUserModify} method. */
export type EvmUserModifyParameters = Omit<
    EvmUserModifyRequest["action"],
    "type"
>;

/** Parameters for the {@linkcode ExchangeClient.modify} method. */
export type ModifyParameters =
    & Omit<ModifyRequest["action"], "type">
    & Partial<Pick<ModifyRequest, "vaultAddress">>
    & Partial<Pick<ModifyRequest, "expiresAfter">>;

/** Parameters for the {@linkcode ExchangeClient.multiSig} method. */
export type MultiSigParameters =
    & Omit<MultiSigRequest["action"], "type" | "signatureChainId">
    & Partial<Pick<MultiSigRequest, "vaultAddress">>
    & Partial<Pick<MultiSigRequest, "expiresAfter">>
    & {
        /** Must be the same for all signers. */
        nonce: number;
    };

/** Parameters for the {@linkcode ExchangeClient.order} method. */
export type OrderParameters =
    & Omit<OrderRequest["action"], "type">
    & Partial<Pick<OrderRequest, "vaultAddress">>
    & Partial<Pick<OrderRequest, "expiresAfter">>;

/** Parameters for the {@linkcode ExchangeClient.perpDeploy} method. */
export type PerpDeployParameters =
    | PerpDeployParameters_RegisterAsset
    | PerpDeployParameters_SetOracle;
/** One of the parameters for the {@linkcode ExchangeClient.perpDeploy} method. */
export type PerpDeployParameters_RegisterAsset = Omit<PerpDeployRequest_RegisterAsset["action"], "type">;
/** One of the parameters for the {@linkcode ExchangeClient.perpDeploy} method. */
export type PerpDeployParameters_SetOracle = Omit<PerpDeployRequest_SetOracle["action"], "type">;

/** Parameters for the {@linkcode ExchangeClient.perpDexClassTransfer} method. */
export type PerpDexClassTransferParameters = Omit<
    PerpDexClassTransferRequest["action"],
    "type" | "hyperliquidChain" | "signatureChainId" | "nonce"
>;

/** Parameters for the {@linkcode ExchangeClient.perpDexTransfer} method. */
export type PerpDexTransferParameters = Omit<
    PerpDexTransferRequest["action"],
    "type" | "hyperliquidChain" | "signatureChainId" | "nonce"
>;

/** Parameters for the {@linkcode ExchangeClient.registerReferrer} method. */
export type RegisterReferrerParameters = Omit<RegisterReferrerRequest["action"], "type">;

/** Parameters for the {@linkcode ExchangeClient.reserveRequestWeight} method. */
export type ReserveRequestWeightParameters =
    & Omit<ReserveRequestWeightRequest["action"], "type">
    & Partial<Pick<ReserveRequestWeightRequest, "expiresAfter">>;

/** Parameters for the {@linkcode ExchangeClient.scheduleCancel} method. */
export type ScheduleCancelParameters =
    & Omit<ScheduleCancelRequest["action"], "type">
    & Partial<Pick<ScheduleCancelRequest, "vaultAddress">>
    & Partial<Pick<ScheduleCancelRequest, "expiresAfter">>;

/** Parameters for the {@linkcode ExchangeClient.setDisplayName} method. */
export type SetDisplayNameParameters = Omit<
    SetDisplayNameRequest["action"],
    "type"
>;

/** Parameters for the {@linkcode ExchangeClient.setReferrer} method. */
export type SetReferrerParameters = Omit<
    SetReferrerRequest["action"],
    "type"
>;

/** Parameters for the {@linkcode ExchangeClient.spotDeploy} method. */
export type SpotDeployParameters =
    | SpotDeployParameters_Genesis
    | SpotDeployParameters_RegisterHyperliquidity
    | SpotDeployParameters_RegisterSpot
    | SpotDeployParameters_RegisterToken2
    | SpotDeployParameters_SetDeployerTradingFeeShare
    | SpotDeployParameters_UserGenesis;
/** One of the parameters for the {@linkcode ExchangeClient.spotDeploy} method. */
export type SpotDeployParameters_Genesis = Omit<
    SpotDeployRequest_Genesis["action"],
    "type"
>;
/** One of the parameters for the {@linkcode ExchangeClient.spotDeploy} method. */
export type SpotDeployParameters_RegisterHyperliquidity = Omit<
    SpotDeployRequest_RegisterHyperliquidity["action"],
    "type"
>;
/** One of the parameters for the {@linkcode ExchangeClient.spotDeploy} method. */
export type SpotDeployParameters_RegisterSpot = Omit<
    SpotDeployRequest_RegisterSpot["action"],
    "type"
>;
/** One of the parameters for the {@linkcode ExchangeClient.spotDeploy} method. */
export type SpotDeployParameters_RegisterToken2 = Omit<
    SpotDeployRequest_RegisterToken2["action"],
    "type"
>;
/** One of the parameters for the {@linkcode ExchangeClient.spotDeploy} method. */
export type SpotDeployParameters_SetDeployerTradingFeeShare = Omit<
    SpotDeployRequest_SetDeployerTradingFeeShare["action"],
    "type"
>;
/** One of the parameters for the {@linkcode ExchangeClient.spotDeploy} method. */
export type SpotDeployParameters_UserGenesis = Omit<
    SpotDeployRequest_UserGenesis["action"],
    "type"
>;

/** Parameters for the {@linkcode ExchangeClient.spotSend} method. */
export type SpotSendParameters = Omit<
    SpotSendRequest["action"],
    "type" | "hyperliquidChain" | "signatureChainId" | "time"
>;

/** Parameters for the {@linkcode ExchangeClient.spotUser} method. */
export type SpotUserParameters = Omit<
    SpotUserRequest["action"],
    "type"
>;

/** Parameters for the {@linkcode ExchangeClient.subAccountSpotTransfer} method. */
export type SubAccountSpotTransferParameters = Omit<
    SubAccountSpotTransferRequest["action"],
    "type"
>;

/** Parameters for the {@linkcode ExchangeClient.subAccountTransfer} method. */
export type SubAccountTransferParameters = Omit<
    SubAccountTransferRequest["action"],
    "type"
>;

/** Parameters for the {@linkcode ExchangeClient.tokenDelegate} method. */
export type TokenDelegateParameters = Omit<
    TokenDelegateRequest["action"],
    "type" | "hyperliquidChain" | "signatureChainId" | "nonce"
>;

/** Parameters for the {@linkcode ExchangeClient.twapCancel} method. */
export type TwapCancelParameters =
    & Omit<TwapCancelRequest["action"], "type">
    & Partial<Pick<TwapCancelRequest, "vaultAddress">>
    & Partial<Pick<TwapCancelRequest, "expiresAfter">>;

/** Parameters for the {@linkcode ExchangeClient.twapOrder} method. */
export type TwapOrderParameters =
    & TwapOrderRequest["action"]["twap"]
    & Partial<Pick<TwapOrderRequest, "vaultAddress">>
    & Partial<Pick<TwapOrderRequest, "expiresAfter">>;

/** Parameters for the {@linkcode ExchangeClient.updateIsolatedMargin} method. */
export type UpdateIsolatedMarginParameters =
    & Omit<UpdateIsolatedMarginRequest["action"], "type">
    & Partial<Pick<UpdateIsolatedMarginRequest, "vaultAddress">>
    & Partial<Pick<UpdateIsolatedMarginRequest, "expiresAfter">>;

/** Parameters for the {@linkcode ExchangeClient.updateLeverage} method. */
export type UpdateLeverageParameters =
    & Omit<UpdateLeverageRequest["action"], "type">
    & Partial<Pick<UpdateLeverageRequest, "vaultAddress">>
    & Partial<Pick<UpdateLeverageRequest, "expiresAfter">>;

/** Parameters for the {@linkcode ExchangeClient.usdClassTransfer} method. */
export type UsdClassTransferParameters = Omit<
    UsdClassTransferRequest["action"],
    "type" | "hyperliquidChain" | "signatureChainId" | "nonce"
>;

/** Parameters for the {@linkcode ExchangeClient.usdSend} method. */
export type UsdSendParameters = Omit<
    UsdSendRequest["action"],
    "type" | "hyperliquidChain" | "signatureChainId" | "time"
>;

/** Parameters for the {@linkcode ExchangeClient.vaultDistribute} method. */
export type VaultDistributeParameters = Omit<
    VaultDistributeRequest["action"],
    "type"
>;

/** Parameters for the {@linkcode ExchangeClient.vaultModify} method. */
export type VaultModifyParameters = Omit<
    VaultModifyRequest["action"],
    "type"
>;

/** Parameters for the {@linkcode ExchangeClient.vaultTransfer} method. */
export type VaultTransferParameters =
    & Omit<VaultTransferRequest["action"], "type">
    & Partial<Pick<VaultTransferRequest, "expiresAfter">>;

/** Parameters for the {@linkcode ExchangeClient.withdraw3} method. */
export type Withdraw3Parameters = Omit<
    Withdraw3Request["action"],
    "type" | "hyperliquidChain" | "signatureChainId" | "time"
>;

/** Successful variant of {@linkcode CancelResponse} without error statuses. */
export type CancelResponseSuccess = CancelResponse & {
    response: {
        data: {
            statuses: Exclude<CancelResponse["response"]["data"]["statuses"][number], { error: string }>[];
        };
    };
};

/** Successful variant of {@linkcode OrderResponse} without error statuses. */
export type OrderResponseSuccess = OrderResponse & {
    response: {
        data: {
            statuses: Exclude<OrderResponse["response"]["data"]["statuses"][number], { error: string }>[];
        };
    };
};

/** Successful variant of {@linkcode TwapCancelResponse} without error status. */
export type TwapCancelResponseSuccess = TwapCancelResponse & {
    response: {
        data: {
            status: Exclude<TwapCancelResponse["response"]["data"]["status"], { error: string }>;
        };
    };
};

/** Successful variant of {@linkcode TwapOrderResponse} without error status. */
export type TwapOrderResponseSuccess = TwapOrderResponse & {
    response: {
        data: {
            status: Exclude<TwapOrderResponse["response"]["data"]["status"], { error: string }>;
        };
    };
};

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
     * @param signal - An optional abort signal
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
    async approveAgent(args: DeepImmutable<ApproveAgentParameters>, signal?: AbortSignal): Promise<SuccessResponse> {
        // Destructure the parameters
        const { ...actionArgs } = args;

        // Construct an action
        const nonce = await this.nonceManager();
        const action = actionSorter.approveAgent({
            type: "approveAgent",
            hyperliquidChain: this._getHyperliquidChain(),
            signatureChainId: await this._getSignatureChainId(),
            nonce,
            ...actionArgs,
        });

        // Sign the action
        const signature = await signUserSignedAction({
            wallet: this.wallet,
            action,
            types: userSignedActionEip712Types[action.type],
        });
        if (action.agentName === "") action.agentName = null;

        // Send a request
        const response = await this.transport.request(
            "exchange",
            { action, signature, nonce },
            signal,
        ) as SuccessResponse | ErrorResponse;
        this._validateResponse(response);
        return response;
    }

    /**
     * Approve a maximum fee rate for a builder.
     * @param args - The parameters for the request.
     * @param signal - An optional abort signal.
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
    async approveBuilderFee(
        args: DeepImmutable<ApproveBuilderFeeParameters>,
        signal?: AbortSignal,
    ): Promise<SuccessResponse> {
        // Destructure the parameters
        const { ...actionArgs } = args;

        // Construct an action
        const nonce = await this.nonceManager();
        const action = actionSorter.approveBuilderFee({
            type: "approveBuilderFee",
            hyperliquidChain: this._getHyperliquidChain(),
            signatureChainId: await this._getSignatureChainId(),
            nonce,
            ...actionArgs,
        });

        // Sign the action
        const signature = await signUserSignedAction({
            wallet: this.wallet,
            action,
            types: userSignedActionEip712Types[action.type],
        });

        // Send a request
        const response = await this.transport.request(
            "exchange",
            { action, signature, nonce },
            signal,
        ) as SuccessResponse | ErrorResponse;
        this._validateResponse(response);
        return response;
    }

    /**
     * Modify multiple orders.
     * @param args - The parameters for the request.
     * @param signal - An optional abort signal.
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
    async batchModify(args: DeepImmutable<BatchModifyParameters>, signal?: AbortSignal): Promise<OrderResponseSuccess> {
        // Destructure the parameters
        const {
            vaultAddress = this.defaultVaultAddress,
            expiresAfter = await this._getDefaultExpiresAfter(),
            ...actionArgs
        } = args;

        // Construct an action
        const nonce = await this.nonceManager();
        const action = actionSorter.batchModify({ type: "batchModify", ...actionArgs });

        // Sign the action
        const signature = await signL1Action({
            wallet: this.wallet,
            action,
            nonce,
            isTestnet: this.isTestnet,
            vaultAddress,
            expiresAfter,
        });

        // Send a request
        const response = await this.transport.request(
            "exchange",
            { action, signature, nonce, vaultAddress, expiresAfter },
            signal,
        ) as OrderResponse;
        this._validateResponse(response);
        return response;
    }

    /**
     * Cancel order(s).
     * @param args - The parameters for the request.
     * @param signal - An optional abort signal.
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
        // Destructure the parameters
        const {
            vaultAddress = this.defaultVaultAddress,
            expiresAfter = await this._getDefaultExpiresAfter(),
            ...actionArgs
        } = args;

        // Construct an action
        const nonce = await this.nonceManager();
        const action = actionSorter.cancel({ type: "cancel", ...actionArgs });

        // Sign the action
        const signature = await signL1Action({
            wallet: this.wallet,
            action,
            nonce,
            isTestnet: this.isTestnet,
            vaultAddress,
            expiresAfter,
        });

        // Send a request
        const response = await this.transport.request(
            "exchange",
            { action, signature, nonce, vaultAddress, expiresAfter },
            signal,
        ) as CancelResponse;
        this._validateResponse(response);
        return response;
    }

    /**
     * Cancel order(s) by cloid.
     * @param args - The parameters for the request.
     * @param signal - An optional abort signal.
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
        // Destructure the parameters
        const {
            vaultAddress = this.defaultVaultAddress,
            expiresAfter = await this._getDefaultExpiresAfter(),
            ...actionArgs
        } = args;

        // Construct an action
        const nonce = await this.nonceManager();
        const action = actionSorter.cancelByCloid({ type: "cancelByCloid", ...actionArgs });

        // Sign the action
        const signature = await signL1Action({
            wallet: this.wallet,
            action,
            nonce,
            isTestnet: this.isTestnet,
            vaultAddress,
            expiresAfter,
        });

        // Send a request
        const response = await this.transport.request(
            "exchange",
            { action, signature, nonce, vaultAddress, expiresAfter },
            signal,
        ) as CancelResponse;
        this._validateResponse(response);
        return response;
    }

    /**
     * Transfer native token from the user's spot account into staking for delegating to validators.
     * @param args - The parameters for the request.
     * @param signal - An optional abort signal.
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
        // Destructure the parameters
        const { ...actionArgs } = args;

        // Construct an action
        const nonce = await this.nonceManager();
        const action = actionSorter.cDeposit({
            type: "cDeposit",
            hyperliquidChain: this._getHyperliquidChain(),
            signatureChainId: await this._getSignatureChainId(),
            nonce,
            ...actionArgs,
        });

        // Sign the action
        const signature = await signUserSignedAction({
            wallet: this.wallet,
            action,
            types: userSignedActionEip712Types[action.type],
        });

        // Send a request
        const response = await this.transport.request(
            "exchange",
            { action, signature, nonce },
            signal,
        ) as SuccessResponse | ErrorResponse;
        this._validateResponse(response);
        return response;
    }

    /**
     * Claim rewards from referral program.
     * @param args - The parameters for the request.
     * @param signal - An optional abort signal.
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
    async claimRewards(signal?: AbortSignal): Promise<SuccessResponse> {
        // Construct an action
        const nonce = await this.nonceManager();
        const action = actionSorter.claimRewards({ type: "claimRewards" });

        // Sign the action
        const signature = await signL1Action({
            wallet: this.wallet,
            action,
            nonce,
            isTestnet: this.isTestnet,
        });

        // Send a request
        const response = await this.transport.request(
            "exchange",
            { action, signature, nonce },
            signal,
        ) as SuccessResponse | ErrorResponse;
        this._validateResponse(response);
        return response;
    }

    /**
     * Convert a single-signature account to a multi-signature account or vice versa.
     * @param args - The parameters for the request.
     * @param signal - An optional abort signal.
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
        // Destructure the parameters
        const actionArgs = args;

        // Construct an action
        const nonce = await this.nonceManager();
        const action = actionSorter.convertToMultiSigUser({
            type: "convertToMultiSigUser",
            hyperliquidChain: this._getHyperliquidChain(),
            signatureChainId: await this._getSignatureChainId(),
            signers: JSON.stringify(actionArgs),
            nonce,
        });

        // Sign the action
        const signature = await signUserSignedAction({
            wallet: this.wallet,
            action,
            types: userSignedActionEip712Types[action.type],
        });

        // Send a request
        const response = await this.transport.request(
            "exchange",
            { action, signature, nonce },
            signal,
        ) as SuccessResponse | ErrorResponse;
        this._validateResponse(response);
        return response;
    }

    /**
     * Create a sub-account.
     * @param args - The parameters for the request.
     * @param signal - An optional abort signal.
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
    async createSubAccount(args: CreateSubAccountParameters, signal?: AbortSignal): Promise<CreateSubAccountResponse> {
        // Destructure the parameters
        const { ...actionArgs } = args;

        // Construct an action
        const nonce = await this.nonceManager();
        const action = actionSorter.createSubAccount({ type: "createSubAccount", ...actionArgs });

        // Sign the action
        const signature = await signL1Action({
            wallet: this.wallet,
            action,
            nonce,
            isTestnet: this.isTestnet,
        });

        // Send a request
        const response = await this.transport.request(
            "exchange",
            { action, signature, nonce },
            signal,
        ) as CreateSubAccountResponse | ErrorResponse;
        this._validateResponse(response);
        return response;
    }

    /**
     * Create a vault.
     * @param args - The parameters for the request.
     * @param signal - An optional abort signal.
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
     * const data = await exchClient.createVault({ name: "...", description: "...", initialUsd: 100 * 1e6 });
     * ```
     */
    async createVault(args: CreateVaultParameters, signal?: AbortSignal): Promise<CreateVaultResponse> {
        // Destructure the parameters
        const { ...actionArgs } = args;

        // Construct an action
        const nonce = await this.nonceManager();
        const action = actionSorter.createVault({ type: "createVault", nonce, ...actionArgs });

        // Sign the action
        const signature = await signL1Action({
            wallet: this.wallet,
            action,
            nonce,
            isTestnet: this.isTestnet,
        });

        // Send a request
        const response = await this.transport.request(
            "exchange",
            { action, signature, nonce },
            signal,
        ) as CreateVaultResponse | ErrorResponse;
        this._validateResponse(response);
        return response;
    }

    /**
     * Jail or unjail self as a validator signer.
     * @param args - The parameters for the request.
     * @param signal - An optional abort signal.
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
        // Destructure the parameters
        const {
            expiresAfter = await this._getDefaultExpiresAfter(),
            ...actionArgs
        } = args;

        // Construct an action
        const nonce = await this.nonceManager();
        const action = actionSorter.CSignerAction({ type: "CSignerAction", ...actionArgs });

        // Sign the action
        const signature = await signL1Action({
            wallet: this.wallet,
            action,
            nonce,
            isTestnet: this.isTestnet,
            expiresAfter,
        });

        // Send a request
        const response = await this.transport.request(
            "exchange",
            { action, signature, nonce, expiresAfter },
            signal,
        ) as SuccessResponse | ErrorResponse;
        this._validateResponse(response);
        return response;
    }

    /**
     * Action related to validator management.
     * @param args - The parameters for the request.
     * @param signal - An optional abort signal.
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
        // Destructure the parameters
        const {
            expiresAfter = await this._getDefaultExpiresAfter(),
            ...actionArgs
        } = args;

        // Construct an action
        const nonce = await this.nonceManager();
        const action = actionSorter.CValidatorAction({ type: "CValidatorAction", ...actionArgs });

        // Sign the action
        const signature = await signL1Action({
            wallet: this.wallet,
            action,
            nonce,
            isTestnet: this.isTestnet,
            expiresAfter,
        });

        // Send a request
        const response = await this.transport.request(
            "exchange",
            { action, signature, nonce, expiresAfter },
            signal,
        ) as SuccessResponse | ErrorResponse;
        this._validateResponse(response);
        return response;
    }

    /**
     * Transfer native token from staking into the user's spot account.
     * @param args - The parameters for the request.
     * @param signal - An optional abort signal.
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
        // Destructure the parameters
        const { ...actionArgs } = args;

        // Construct an action
        const nonce = await this.nonceManager();
        const action = actionSorter.cWithdraw({
            type: "cWithdraw",
            hyperliquidChain: this._getHyperliquidChain(),
            signatureChainId: await this._getSignatureChainId(),
            nonce,
            ...actionArgs,
        });

        // Sign the action
        const signature = await signUserSignedAction({
            wallet: this.wallet,
            action,
            types: userSignedActionEip712Types[action.type],
        });

        // Send a request
        const response = await this.transport.request(
            "exchange",
            { action, signature, nonce },
            signal,
        ) as SuccessResponse | ErrorResponse;
        this._validateResponse(response);
        return response;
    }

    /**
     * Configure block type for EVM transactions.
     * @param args - The parameters for the request.
     * @param signal - An optional abort signal.
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
    async evmUserModify(args: EvmUserModifyParameters, signal?: AbortSignal): Promise<SuccessResponse> {
        // Destructure the parameters
        const { ...actionArgs } = args;

        // Construct an action
        const nonce = await this.nonceManager();
        const action = actionSorter.evmUserModify({ type: "evmUserModify", ...actionArgs });

        // Sign the action
        const signature = await signL1Action({
            wallet: this.wallet,
            action,
            nonce,
            isTestnet: this.isTestnet,
        });

        // Send a request
        const response = await this.transport.request(
            "exchange",
            { action, signature, nonce },
            signal,
        ) as SuccessResponse | ErrorResponse;
        this._validateResponse(response);
        return response;
    }

    /**
     * Modify an order.
     * @param args - The parameters for the request.
     * @param signal - An optional abort signal.
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
        // Destructure the parameters
        const {
            vaultAddress = this.defaultVaultAddress,
            expiresAfter = await this._getDefaultExpiresAfter(),
            ...actionArgs
        } = args;

        // Construct an action
        const nonce = await this.nonceManager();
        const action = actionSorter.modify({ type: "modify", ...actionArgs });

        // Sign the action
        const signature = await signL1Action({
            wallet: this.wallet,
            action,
            nonce,
            isTestnet: this.isTestnet,
            vaultAddress,
            expiresAfter,
        });

        // Send a request
        const response = await this.transport.request(
            "exchange",
            { action, signature, nonce, vaultAddress, expiresAfter },
            signal,
        ) as SuccessResponse | ErrorResponse;
        this._validateResponse(response);
        return response;
    }

    /**
     * A multi-signature request.
     * @param args - The parameters for the request.
     * @param signal - An optional abort signal.
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
        // Destructure the parameters
        const {
            vaultAddress = this.defaultVaultAddress,
            expiresAfter = await this._getDefaultExpiresAfter(),
            nonce,
            ...actionArgs
        } = args;

        // Construct an action
        const action = actionSorter.multiSig({
            type: "multiSig",
            signatureChainId: await this._getSignatureChainId(),
            ...actionArgs,
        });

        // Sign the action
        // deno-lint-ignore no-explicit-any
        const actionWithoutType = structuredClone<any>(action);
        delete actionWithoutType.type;

        const signature = await signMultiSigAction({
            wallet: this.wallet,
            action: actionWithoutType,
            nonce,
            isTestnet: this.isTestnet,
            vaultAddress,
            expiresAfter,
        });

        // Send a request
        const response = await this.transport.request(
            "exchange",
            { action, signature, nonce, vaultAddress, expiresAfter },
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
        this._validateResponse(response);
        return response as T;
    }

    /**
     * Place an order(s).
     * @param args - The parameters for the request.
     * @param signal - An optional abort signal.
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
        // Destructure the parameters
        const {
            vaultAddress = this.defaultVaultAddress,
            expiresAfter = await this._getDefaultExpiresAfter(),
            ...actionArgs
        } = args;

        // Construct an action
        const nonce = await this.nonceManager();
        const action = actionSorter.order({ type: "order", ...actionArgs });

        // Sign the action
        const signature = await signL1Action({
            wallet: this.wallet,
            action,
            nonce,
            isTestnet: this.isTestnet,
            vaultAddress,
            expiresAfter,
        });

        // Send a request
        const response = await this.transport.request(
            "exchange",
            { action, signature, nonce, vaultAddress, expiresAfter },
            signal,
        ) as OrderResponse;
        this._validateResponse(response);
        return response;
    }

    /**
     * Deploying HIP-3 assets.
     * @param args - The parameters for the request.
     * @param signal - An optional abort signal.
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
    async perpDeploy(args: PerpDeployParameters, signal?: AbortSignal): Promise<SuccessResponse> {
        // Destructure the parameters
        const { ...actionArgs } = args;

        // Construct an action
        const nonce = await this.nonceManager();
        const action = actionSorter.perpDeploy({ type: "perpDeploy", ...actionArgs });

        // Sign the action
        const signature = await signL1Action({
            wallet: this.wallet,
            action,
            nonce,
            isTestnet: this.isTestnet,
        });

        // Send a request
        const response = await this.transport.request(
            "exchange",
            { action, signature, nonce },
            signal,
        ) as SuccessResponse | ErrorResponse;
        this._validateResponse(response);
        return response;
    }

    /**
     * Transfer funds between Spot account and Perp dex account.
     * @param args - The parameters for the request.
     * @param signal - An optional abort signal.
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
        // Destructure the parameters
        const { ...actionArgs } = args;

        // Construct an action
        const nonce = await this.nonceManager();
        const action = actionSorter.PerpDexClassTransfer({
            type: "PerpDexClassTransfer",
            hyperliquidChain: this._getHyperliquidChain(),
            signatureChainId: await this._getSignatureChainId(),
            nonce,
            ...actionArgs,
        });

        // Sign the action
        const signature = await signUserSignedAction({
            wallet: this.wallet,
            action,
            types: userSignedActionEip712Types[action.type],
        });

        // Send a request
        const response = await this.transport.request(
            "exchange",
            { action, signature, nonce },
            signal,
        ) as SuccessResponse | ErrorResponse;
        this._validateResponse(response);
        return response;
    }

    /**
     * Transfer collateral tokens between different perp dexes for the same user.
     * @param args - The parameters for the request.
     * @param signal - An optional abort signal.
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
        // Destructure the parameters
        const { ...actionArgs } = args;

        // Construct an action
        const nonce = await this.nonceManager();
        const action = actionSorter.PerpDexTransfer({
            type: "PerpDexTransfer",
            hyperliquidChain: this._getHyperliquidChain(),
            signatureChainId: await this._getSignatureChainId(),
            nonce,
            ...actionArgs,
        });

        // Sign the action
        const signature = await signUserSignedAction({
            wallet: this.wallet,
            action,
            types: userSignedActionEip712Types[action.type],
        });

        // Send a request
        const response = await this.transport.request(
            "exchange",
            { action, signature, nonce },
            signal,
        ) as SuccessResponse | ErrorResponse;
        this._validateResponse(response);
        return response;
    }

    /**
     * Create a referral code.
     * @param args - The parameters for the request.
     * @param signal - An optional abort signal.
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
    async registerReferrer(args: RegisterReferrerParameters, signal?: AbortSignal): Promise<SuccessResponse> {
        // Destructure the parameters
        const { ...actionArgs } = args;

        // Construct an action
        const nonce = await this.nonceManager();
        const action = actionSorter.registerReferrer({ type: "registerReferrer", ...actionArgs });

        // Sign the action
        const signature = await signL1Action({
            wallet: this.wallet,
            action,
            nonce,
            isTestnet: this.isTestnet,
        });

        // Send a request
        const response = await this.transport.request(
            "exchange",
            { action, signature, nonce },
            signal,
        ) as SuccessResponse | ErrorResponse;
        this._validateResponse(response);
        return response;
    }

    /**
     * Reserve additional rate-limited actions for a fee.
     * @param args - The parameters for the request.
     * @param signal - An optional abort signal.
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
        // Destructure the parameters
        const {
            expiresAfter = await this._getDefaultExpiresAfter(),
            ...actionArgs
        } = args;

        // Construct an action
        const nonce = await this.nonceManager();
        const action = actionSorter.reserveRequestWeight({ type: "reserveRequestWeight", ...actionArgs });

        // Sign the action
        const signature = await signL1Action({
            wallet: this.wallet,
            action,
            nonce,
            isTestnet: this.isTestnet,
            expiresAfter,
        });

        // Send a request
        const response = await this.transport.request(
            "exchange",
            { action, signature, nonce, expiresAfter },
            signal,
        ) as SuccessResponse | ErrorResponse;
        this._validateResponse(response);
        return response;
    }

    /**
     * Schedule a cancel-all operation at a future time.
     * @param args - The parameters for the request.
     * @param signal - An optional abort signal.
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

        // Destructure the parameters
        const {
            vaultAddress = this.defaultVaultAddress,
            expiresAfter = await this._getDefaultExpiresAfter(),
            ...actionArgs
        } = args;

        // Construct an action
        const nonce = await this.nonceManager();
        const action = actionSorter.scheduleCancel({ type: "scheduleCancel", ...actionArgs });

        // Sign the action
        const signature = await signL1Action({
            wallet: this.wallet,
            action,
            nonce,
            isTestnet: this.isTestnet,
            vaultAddress,
            expiresAfter,
        });

        // Send a request
        const response = await this.transport.request(
            "exchange",
            { action, signature, nonce, vaultAddress, expiresAfter },
            signal,
        ) as SuccessResponse | ErrorResponse;
        this._validateResponse(response);
        return response;
    }

    /**
     * Set the display name in the leaderboard.
     * @param args - The parameters for the request.
     * @param signal - An optional abort signal.
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
    async setDisplayName(args: SetDisplayNameParameters, signal?: AbortSignal): Promise<SuccessResponse> {
        // Destructure the parameters
        const { ...actionArgs } = args;

        // Construct an action
        const nonce = await this.nonceManager();
        const action = actionSorter.setDisplayName({ type: "setDisplayName", ...actionArgs });

        // Sign the action
        const signature = await signL1Action({
            wallet: this.wallet,
            action,
            nonce,
            isTestnet: this.isTestnet,
        });

        // Send a request
        const response = await this.transport.request(
            "exchange",
            { action, signature, nonce },
            signal,
        ) as SuccessResponse | ErrorResponse;
        this._validateResponse(response);
        return response;
    }

    /**
     * Set a referral code.
     * @param args - The parameters for the request.
     * @param signal - An optional abort signal.
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
    async setReferrer(args: SetReferrerParameters, signal?: AbortSignal): Promise<SuccessResponse> {
        // Destructure the parameters
        const { ...actionArgs } = args;

        // Construct an action
        const nonce = await this.nonceManager();
        const action = actionSorter.setReferrer({ type: "setReferrer", ...actionArgs });

        // Sign the action
        const signature = await signL1Action({
            wallet: this.wallet,
            action,
            nonce,
            isTestnet: this.isTestnet,
        });

        // Send a request
        const response = await this.transport.request(
            "exchange",
            { action, signature, nonce },
            signal,
        ) as SuccessResponse | ErrorResponse;
        this._validateResponse(response);
        return response;
    }

    /**
     * Deploying HIP-1 and HIP-2 assets.
     * @param args - The parameters for the request.
     * @param signal - An optional abort signal.
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
    async spotDeploy(args: SpotDeployParameters, signal?: AbortSignal): Promise<SuccessResponse> {
        // Destructure the parameters
        const { ...actionArgs } = args;

        // Construct an action
        const nonce = await this.nonceManager();
        const action = actionSorter.spotDeploy({ type: "spotDeploy", ...actionArgs });

        // Sign the action
        const signature = await signL1Action({
            wallet: this.wallet,
            action,
            nonce,
            isTestnet: this.isTestnet,
        });

        // Send a request
        const response = await this.transport.request(
            "exchange",
            { action, signature, nonce },
            signal,
        ) as SuccessResponse | ErrorResponse;
        this._validateResponse(response);
        return response;
    }

    /**
     * Send spot assets to another address.
     * @param args - The parameters for the request.
     * @param signal - An optional abort signal.
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
        // Destructure the parameters
        const { ...actionArgs } = args;

        // Construct an action
        const nonce = await this.nonceManager();
        const action = actionSorter.spotSend({
            type: "spotSend",
            hyperliquidChain: this._getHyperliquidChain(),
            signatureChainId: await this._getSignatureChainId(),
            time: nonce,
            ...actionArgs,
        });

        // Sign the action
        const signature = await signUserSignedAction({
            wallet: this.wallet,
            action,
            types: userSignedActionEip712Types[action.type],
        });

        // Send a request
        const response = await this.transport.request(
            "exchange",
            { action, signature, nonce },
            signal,
        ) as SuccessResponse | ErrorResponse;
        this._validateResponse(response);
        return response;
    }

    /**
     * Opt Out of Spot Dusting.
     * @param args - The parameters for the request.
     * @param signal - An optional abort signal.
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
    async spotUser(args: SpotUserParameters, signal?: AbortSignal): Promise<SuccessResponse> {
        // Destructure the parameters
        const { ...actionArgs } = args;

        // Construct an action
        const nonce = await this.nonceManager();
        const action = actionSorter.spotUser({ type: "spotUser", ...actionArgs });

        // Sign the action
        const signature = await signL1Action({
            wallet: this.wallet,
            action,
            nonce,
            isTestnet: this.isTestnet,
        });

        // Send a request
        const response = await this.transport.request(
            "exchange",
            { action, signature, nonce },
            signal,
        ) as SuccessResponse | ErrorResponse;
        this._validateResponse(response);
        return response;
    }

    /**
     * Transfer between sub-accounts (spot).
     * @param args - The parameters for the request.
     * @param signal - An optional abort signal.
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
    async subAccountSpotTransfer(
        args: SubAccountSpotTransferParameters,
        signal?: AbortSignal,
    ): Promise<SuccessResponse> {
        // Destructure the parameters
        const { ...actionArgs } = args;

        // Construct an action
        const nonce = await this.nonceManager();
        const action = actionSorter.subAccountSpotTransfer({ type: "subAccountSpotTransfer", ...actionArgs });

        // Sign the action
        const signature = await signL1Action({
            wallet: this.wallet,
            action,
            nonce,
            isTestnet: this.isTestnet,
        });

        // Send a request
        const response = await this.transport.request(
            "exchange",
            { action, signature, nonce },
            signal,
        ) as SuccessResponse | ErrorResponse;
        this._validateResponse(response);
        return response;
    }

    /**
     * Transfer between sub-accounts (perpetual).
     * @param args - The parameters for the request.
     * @param signal - An optional abort signal.
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
    async subAccountTransfer(args: SubAccountTransferParameters, signal?: AbortSignal): Promise<SuccessResponse> {
        // Destructure the parameters
        const { ...actionArgs } = args;

        // Construct an action
        const nonce = await this.nonceManager();
        const action = actionSorter.subAccountTransfer({ type: "subAccountTransfer", ...actionArgs });

        // Sign the action
        const signature = await signL1Action({
            wallet: this.wallet,
            action,
            nonce,
            isTestnet: this.isTestnet,
        });

        // Send a request
        const response = await this.transport.request(
            "exchange",
            { action, signature, nonce },
            signal,
        ) as SuccessResponse | ErrorResponse;
        this._validateResponse(response);
        return response;
    }

    /**
     * Delegate or undelegate native tokens to or from a validator.
     * @param args - The parameters for the request.
     * @param signal - An optional abort signal.
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
        // Destructure the parameters
        const { ...actionArgs } = args;

        // Construct an action
        const nonce = await this.nonceManager();
        const action = actionSorter.tokenDelegate({
            type: "tokenDelegate",
            hyperliquidChain: this._getHyperliquidChain(),
            signatureChainId: await this._getSignatureChainId(),
            nonce,
            ...actionArgs,
        });

        // Sign the action
        const signature = await signUserSignedAction({
            wallet: this.wallet,
            action,
            types: userSignedActionEip712Types[action.type],
        });

        // Send a request
        const response = await this.transport.request(
            "exchange",
            { action, signature, nonce },
            signal,
        ) as SuccessResponse | ErrorResponse;
        this._validateResponse(response);
        return response;
    }

    /**
     * Cancel a TWAP order.
     * @param args - The parameters for the request.
     * @param signal - An optional abort signal.
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
        // Destructure the parameters
        const {
            vaultAddress = this.defaultVaultAddress,
            expiresAfter = await this._getDefaultExpiresAfter(),
            ...actionArgs
        } = args;

        // Construct an action
        const nonce = await this.nonceManager();
        const action = actionSorter.twapCancel({ type: "twapCancel", ...actionArgs });

        // Sign the action
        const signature = await signL1Action({
            wallet: this.wallet,
            action,
            nonce,
            isTestnet: this.isTestnet,
            vaultAddress,
            expiresAfter,
        });

        // Send a request
        const response = await this.transport.request(
            "exchange",
            { action, signature, nonce, vaultAddress, expiresAfter },
            signal,
        ) as TwapCancelResponse;
        this._validateResponse(response);
        return response;
    }

    /**
     * Place a TWAP order.
     * @param args - The parameters for the request.
     * @param signal - An optional abort signal.
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
     *   a: 0,
     *   b: true,
     *   s: "1",
     *   r: false,
     *   m: 10,
     *   t: true,
     * });
     * ```
     */
    async twapOrder(args: TwapOrderParameters, signal?: AbortSignal): Promise<TwapOrderResponseSuccess> {
        // Destructure the parameters
        const {
            vaultAddress = this.defaultVaultAddress,
            expiresAfter = await this._getDefaultExpiresAfter(),
            ...actionArgs
        } = args;

        // Construct an action
        const nonce = await this.nonceManager();
        const action = actionSorter.twapOrder({ type: "twapOrder", twap: { ...actionArgs } });

        // Sign the action
        const signature = await signL1Action({
            wallet: this.wallet,
            action,
            nonce,
            isTestnet: this.isTestnet,
            vaultAddress,
            expiresAfter,
        });

        // Send a request
        const response = await this.transport.request(
            "exchange",
            { action, signature, nonce, vaultAddress, expiresAfter },
            signal,
        ) as TwapOrderResponse;
        this._validateResponse(response);
        return response;
    }

    /**
     * Add or remove margin from isolated position.
     * @param args - The parameters for the request.
     * @param signal - An optional abort signal.
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
        // Destructure the parameters
        const {
            vaultAddress = this.defaultVaultAddress,
            expiresAfter = await this._getDefaultExpiresAfter(),
            ...actionArgs
        } = args;

        // Construct an action
        const nonce = await this.nonceManager();
        const action = actionSorter.updateIsolatedMargin({ type: "updateIsolatedMargin", ...actionArgs });

        // Sign the action
        const signature = await signL1Action({
            wallet: this.wallet,
            action,
            nonce,
            isTestnet: this.isTestnet,
            vaultAddress,
            expiresAfter,
        });

        // Send a request
        const response = await this.transport.request(
            "exchange",
            { action, signature, nonce, vaultAddress, expiresAfter },
            signal,
        ) as SuccessResponse | ErrorResponse;
        this._validateResponse(response);
        return response;
    }

    /**
     * Update cross or isolated leverage on a coin.
     * @param args - The parameters for the request.
     * @param signal - An optional abort signal.
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
        // Destructure the parameters
        const {
            vaultAddress = this.defaultVaultAddress,
            expiresAfter = await this._getDefaultExpiresAfter(),
            ...actionArgs
        } = args;

        // Construct an action
        const nonce = await this.nonceManager();
        const action = actionSorter.updateLeverage({ type: "updateLeverage", ...actionArgs });

        // Sign the action
        const signature = await signL1Action({
            wallet: this.wallet,
            action,
            nonce,
            isTestnet: this.isTestnet,
            vaultAddress,
            expiresAfter,
        });

        // Send a request
        const response = await this.transport.request(
            "exchange",
            { action, signature, nonce, vaultAddress, expiresAfter },
            signal,
        ) as SuccessResponse | ErrorResponse;
        this._validateResponse(response);
        return response;
    }

    /**
     * Transfer funds between Spot account and Perp account.
     * @param args - The parameters for the request.
     * @param signal - An optional abort signal.
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
        // Destructure the parameters
        const { ...actionArgs } = args;

        // Construct an action
        const nonce = await this.nonceManager();
        const action = actionSorter.usdClassTransfer({
            type: "usdClassTransfer",
            hyperliquidChain: this._getHyperliquidChain(),
            signatureChainId: await this._getSignatureChainId(),
            nonce,
            ...actionArgs,
        });

        // Sign the action
        const signature = await signUserSignedAction({
            wallet: this.wallet,
            action,
            types: userSignedActionEip712Types[action.type],
        });

        // Send a request
        const response = await this.transport.request(
            "exchange",
            { action, signature, nonce },
            signal,
        ) as SuccessResponse | ErrorResponse;
        this._validateResponse(response);
        return response;
    }

    /**
     * Send usd to another address.
     * @param args - The parameters for the request.
     * @param signal - An optional abort signal.
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
        // Destructure the parameters
        const { ...actionArgs } = args;

        // Construct an action
        const nonce = await this.nonceManager();
        const action = actionSorter.usdSend({
            type: "usdSend",
            hyperliquidChain: this._getHyperliquidChain(),
            signatureChainId: await this._getSignatureChainId(),
            time: nonce,
            ...actionArgs,
        });

        // Sign the action
        const signature = await signUserSignedAction({
            wallet: this.wallet,
            action,
            types: userSignedActionEip712Types[action.type],
        });

        // Send a request
        const response = await this.transport.request(
            "exchange",
            { action, signature, nonce },
            signal,
        ) as SuccessResponse | ErrorResponse;
        this._validateResponse(response);
        return response;
    }

    /**
     * Distribute funds from a vault between followers.
     * @param args - The parameters for the request.
     * @param signal - An optional abort signal.
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
    async vaultDistribute(args: VaultDistributeParameters, signal?: AbortSignal): Promise<SuccessResponse> {
        // Destructure the parameters
        const { ...actionArgs } = args;

        // Construct an action
        const nonce = await this.nonceManager();
        const action = actionSorter.vaultDistribute({ type: "vaultDistribute", ...actionArgs });

        // Sign the action
        const signature = await signL1Action({
            wallet: this.wallet,
            action,
            nonce,
            isTestnet: this.isTestnet,
        });

        // Send a request
        const response = await this.transport.request(
            "exchange",
            { action, signature, nonce },
            signal,
        ) as SuccessResponse | ErrorResponse;
        this._validateResponse(response);
        return response;
    }

    /**
     * Modify a vault's configuration.
     * @param args - The parameters for the request.
     * @param signal - An optional abort signal.
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
    async vaultModify(args: VaultModifyParameters, signal?: AbortSignal): Promise<SuccessResponse> {
        // Destructure the parameters
        const { ...actionArgs } = args;

        // Construct an action
        const nonce = await this.nonceManager();
        const action = actionSorter.vaultModify({ type: "vaultModify", ...actionArgs });

        // Sign the action
        const signature = await signL1Action({
            wallet: this.wallet,
            action,
            nonce,
            isTestnet: this.isTestnet,
        });

        // Send a request
        const response = await this.transport.request(
            "exchange",
            { action, signature, nonce },
            signal,
        ) as SuccessResponse | ErrorResponse;
        this._validateResponse(response);
        return response;
    }

    /**
     * Deposit or withdraw from a vault.
     * @param args - The parameters for the request.
     * @param signal - An optional abort signal.
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
        // Destructure the parameters
        const {
            expiresAfter = await this._getDefaultExpiresAfter(),
            ...actionArgs
        } = args;

        // Construct an action
        const nonce = await this.nonceManager();
        const action = actionSorter.vaultTransfer({ type: "vaultTransfer", ...actionArgs });

        // Sign the action
        const signature = await signL1Action({
            wallet: this.wallet,
            action,
            nonce,
            isTestnet: this.isTestnet,
            expiresAfter,
        });

        // Send a request
        const response = await this.transport.request(
            "exchange",
            { action, signature, nonce, expiresAfter },
            signal,
        ) as SuccessResponse | ErrorResponse;
        this._validateResponse(response);
        return response;
    }

    /**
     * Initiate a withdrawal request.
     * @param args - The parameters for the request.
     * @param signal - An optional abort signal.
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
        // Destructure the parameters
        const { ...actionArgs } = args;

        // Construct an action
        const nonce = await this.nonceManager();
        const action = actionSorter.withdraw3({
            type: "withdraw3",
            hyperliquidChain: this._getHyperliquidChain(),
            signatureChainId: await this._getSignatureChainId(),
            time: nonce,
            ...actionArgs,
        });

        // Sign the action
        const signature = await signUserSignedAction({
            wallet: this.wallet,
            action,
            types: userSignedActionEip712Types[action.type],
        });

        // Send a request
        const response = await this.transport.request(
            "exchange",
            { action, signature, nonce },
            signal,
        ) as SuccessResponse | ErrorResponse;
        this._validateResponse(response);
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
    protected _validateResponse(
        response:
            | SuccessResponse
            | ErrorResponse
            | CancelResponse
            | CreateSubAccountResponse
            | CreateVaultResponse
            | OrderResponse
            | TwapOrderResponse
            | TwapCancelResponse,
    ): asserts response is
        | SuccessResponse
        | CancelResponseSuccess
        | CreateSubAccountResponse
        | CreateVaultResponse
        | OrderResponseSuccess
        | TwapOrderResponseSuccess
        | TwapCancelResponseSuccess {
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
