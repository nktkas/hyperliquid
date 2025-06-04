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
    ClaimRewardsRequest,
    ConvertToMultiSigUserRequest,
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
    isAbstractEthersSigner,
    isAbstractEthersV5Signer,
    isAbstractExtendedViemWalletClient,
    isAbstractViemWalletClient,
    isAbstractWindowEthereum,
    l1ActionSorter,
    signL1Action,
    signMultiSigAction,
    signUserSignedAction,
} from "../signing.ts";

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
export type ConvertToMultiSigUserParameters = NonNullable<ConvertToMultiSigUserRequest_Signers>;

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
        let message = "Cannot process API request";

        if (response.status === "err") {
            // For ErrorResponse
            message += `: ${response.response}`;
        } else {
            if ("statuses" in response.response.data) {
                // For OrderResponse, CancelResponse
                const errors = response.response.data.statuses.reduce<string[]>((acc, status, index) => {
                    if (typeof status === "object" && "error" in status) {
                        acc.push(`Order ${index} failed: ${status.error}`);
                    }
                    return acc;
                }, []);
                if (errors.length > 0) {
                    message += `: ${errors.join(", ")}`;
                }
            } else {
                // For TwapOrderResponse, TwapCancelResponse
                if (typeof response.response.data.status === "object" && "error" in response.response.data.status) {
                    message += `: ${response.response.data.status.error}`;
                }
            }
        }

        super(message);
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
 * @typeParam W The WalletClient/Account ([viem](https://viem.sh/docs/clients/wallet)) or Signer ([ethers.js](https://docs.ethers.io/v6/api/providers/#Signer)) used for signing transactions.
 */
export class ExchangeClient<
    T extends IRequestTransport = IRequestTransport,
    W extends AbstractWallet = AbstractWallet,
> implements ExchangeClientParameters, AsyncDisposable {
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
     * @example Private key via [viem](https://viem.sh/docs/clients/wallet#local-accounts-private-key-mnemonic-etc)
     * ```ts
     * import * as hl from "@nktkas/hyperliquid";
     * import { privateKeyToAccount } from "viem/accounts";
     *
     * const wallet = privateKeyToAccount("0x...");
     *
     * const transport = new hl.HttpTransport(); // or WebSocketTransport
     * const exchClient = new hl.ExchangeClient({ wallet, transport });
     * ```
     *
     * @example Private key via [ethers.js](https://docs.ethers.org/v6/api/wallet/#Wallet) or [ethers.js v5](https://docs.ethers.org/v5/api/signer/#Wallet)
     * ```ts
     * import * as hl from "@nktkas/hyperliquid";
     * import { ethers } from "ethers";
     *
     * const wallet = new ethers.Wallet("0x...");
     *
     * const transport = new hl.HttpTransport(); // or WebSocketTransport
     * const exchClient = new hl.ExchangeClient({ wallet, transport });
     * ```
     *
     * @example External wallet (e.g. MetaMask) via [viem](https://viem.sh/docs/clients/wallet#optional-hoist-the-account)
     * ```ts
     * import * as hl from "@nktkas/hyperliquid";
     * import { createWalletClient, custom } from "viem";
     *
     * const [account] = await window.ethereum.request({ method: "eth_requestAccounts" });
     * const wallet = createWalletClient({ account, transport: custom(window.ethereum) });
     *
     * const transport = new hl.HttpTransport(); // or WebSocketTransport
     * const exchClient = new hl.ExchangeClient({ wallet, transport });
     * ```
     *
     * @example External wallet (e.g. MetaMask) via `window.ethereum` directly
     * ```ts
     * import * as hl from "@nktkas/hyperliquid";
     *
     * const transport = new hl.HttpTransport(); // or WebSocketTransport
     * const exchClient = new hl.ExchangeClient({ wallet: window.ethereum, transport });
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
     * @throws {ApiRequestError} When the API returns an error response.
     *
     * @see https://hyperliquid.gitbook.io/hyperliquid-docs/for-developers/api/exchange-endpoint#approve-an-api-wallet
     * @example
     * ```ts
     * import * as hl from "@nktkas/hyperliquid";
     * import { privateKeyToAccount } from "viem/accounts";
     *
     * const wallet = privateKeyToAccount("0x...");
     * const transport = new hl.HttpTransport(); // or WebSocketTransport
     * const exchClient = new hl.ExchangeClient({ wallet, transport });
     *
     * const data = await exchClient.approveAgent({ agentAddress: "0x...", agentName: "agentName" });
     * ```
     */
    async approveAgent(args: ApproveAgentParameters, signal?: AbortSignal): Promise<SuccessResponse> {
        // Construct an action
        const action: ApproveAgentRequest["action"] = {
            ...args,
            agentName: args.agentName ?? "",
            type: "approveAgent",
            hyperliquidChain: this._getHyperliquidChain(),
            signatureChainId: await this._getSignatureChainId(),
            nonce: await this.nonceManager(),
        };

        // Sign the action
        const signature = await signUserSignedAction({
            wallet: this.wallet,
            action,
            types: {
                "HyperliquidTransaction:ApproveAgent": [
                    { name: "hyperliquidChain", type: "string" },
                    { name: "agentAddress", type: "address" },
                    { name: "agentName", type: "string" },
                    { name: "nonce", type: "uint64" },
                ],
            },
            chainId: parseInt(action.signatureChainId, 16),
        });
        if (action.agentName === "") delete action.agentName;

        // Send a request
        return await this._request(
            { action, signature, nonce: action.nonce } satisfies ApproveAgentRequest,
            signal,
        ) as SuccessResponse;
    }

    /**
     * Approve a maximum fee rate for a builder.
     * @param args - The parameters for the request.
     * @param signal - An optional abort signal.
     * @returns Successful response without specific data.
     * @throws {ApiRequestError} When the API returns an error response.
     *
     * @see https://hyperliquid.gitbook.io/hyperliquid-docs/for-developers/api/exchange-endpoint#approve-a-builder-fee
     * @example
     * ```ts
     * import * as hl from "@nktkas/hyperliquid";
     * import { privateKeyToAccount } from "viem/accounts";
     *
     * const wallet = privateKeyToAccount("0x...");
     * const transport = new hl.HttpTransport(); // or WebSocketTransport
     * const exchClient = new hl.ExchangeClient({ wallet, transport });
     *
     * const data = await exchClient.approveBuilderFee({ maxFeeRate: "0.01%", builder: "0x..." });
     * ```
     */
    async approveBuilderFee(args: ApproveBuilderFeeParameters, signal?: AbortSignal): Promise<SuccessResponse> {
        // Construct an action
        const action: ApproveBuilderFeeRequest["action"] = {
            ...args,
            type: "approveBuilderFee",
            hyperliquidChain: this._getHyperliquidChain(),
            signatureChainId: await this._getSignatureChainId(),
            nonce: await this.nonceManager(),
        };

        // Sign the action
        const signature = await signUserSignedAction({
            wallet: this.wallet,
            action,
            types: {
                "HyperliquidTransaction:ApproveBuilderFee": [
                    { name: "hyperliquidChain", type: "string" },
                    { name: "maxFeeRate", type: "string" },
                    { name: "builder", type: "address" },
                    { name: "nonce", type: "uint64" },
                ],
            },
            chainId: parseInt(action.signatureChainId, 16),
        });

        // Send a request
        return await this._request(
            { action, signature, nonce: action.nonce } satisfies ApproveBuilderFeeRequest,
            signal,
        ) as SuccessResponse;
    }

    /**
     * Modify multiple orders.
     * @param args - The parameters for the request.
     * @param signal - An optional abort signal.
     * @returns Successful variant of {@link OrderResponse} without error statuses.
     * @throws {ApiRequestError} When the API returns an error response.
     *
     * @see https://hyperliquid.gitbook.io/hyperliquid-docs/for-developers/api/exchange-endpoint#modify-multiple-orders
     * @example
     * ```ts
     * import * as hl from "@nktkas/hyperliquid";
     * import { privateKeyToAccount } from "viem/accounts";
     *
     * const wallet = privateKeyToAccount("0x...");
     * const transport = new hl.HttpTransport(); // or WebSocketTransport
     * const exchClient = new hl.ExchangeClient({ wallet, transport });
     *
     * const data = await exchClient.batchModify({
     *   modifies: [{
     *     oid: 123,
     *     order: {
     *       a: 0, // Asset index
     *       b: true, // Buy order
     *       p: "31000", // New price
     *       s: "0.2", // New size
     *       r: false, // Not reduce-only
     *       t: {
     *         limit: {
     *           tif: "Gtc", // Good-til-cancelled
     *         },
     *       },
     *       c: "0x...", // Optional: Client Order ID
     *     },
     *   }],
     * });
     * ```
     */
    async batchModify(args: BatchModifyParameters, signal?: AbortSignal): Promise<OrderResponseSuccess> {
        // Destructure the parameters
        const {
            vaultAddress = this.defaultVaultAddress,
            expiresAfter = await this._getDefaultExpiresAfter(),
            ...actionArgs
        } = args;

        // Construct an action
        const nonce = await this.nonceManager();
        const action = l1ActionSorter.batchModify({ type: "batchModify", ...actionArgs });

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
        return await this._request(
            { action, signature, nonce, vaultAddress, expiresAfter } satisfies BatchModifyRequest,
            signal,
        ) as OrderResponseSuccess;
    }

    /**
     * Cancel order(s).
     * @param args - The parameters for the request.
     * @param signal - An optional abort signal.
     * @returns Successful variant of {@link CancelResponse} without error statuses.
     * @throws {ApiRequestError} When the API returns an error response.
     *
     * @see https://hyperliquid.gitbook.io/hyperliquid-docs/for-developers/api/exchange-endpoint#cancel-order-s
     * @example
     * ```ts
     * import * as hl from "@nktkas/hyperliquid";
     * import { privateKeyToAccount } from "viem/accounts";
     *
     * const wallet = privateKeyToAccount("0x...");
     * const transport = new hl.HttpTransport(); // or WebSocketTransport
     * const exchClient = new hl.ExchangeClient({ wallet, transport });
     *
     * const data = await exchClient.cancel({
     *   cancels: [{
     *     a: 0, // Asset index
     *     o: 123, // Order ID
     *   }],
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
        const action = l1ActionSorter.cancel({ type: "cancel", ...actionArgs });

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
        return await this._request(
            { action, signature, nonce, vaultAddress, expiresAfter } satisfies CancelRequest,
            signal,
        ) as CancelResponseSuccess;
    }

    /**
     * Cancel order(s) by cloid.
     * @param args - The parameters for the request.
     * @param signal - An optional abort signal.
     * @returns Successful variant of {@link CancelResponse} without error statuses.
     * @throws {ApiRequestError} When the API returns an error response.
     *
     * @see https://hyperliquid.gitbook.io/hyperliquid-docs/for-developers/api/exchange-endpoint#cancel-order-s-by-cloid
     * @example
     * ```ts
     * import * as hl from "@nktkas/hyperliquid";
     * import { privateKeyToAccount } from "viem/accounts";
     *
     * const wallet = privateKeyToAccount("0x...");
     * const transport = new hl.HttpTransport(); // or WebSocketTransport
     * const exchClient = new hl.ExchangeClient({ wallet, transport });
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
        const action = l1ActionSorter.cancelByCloid({ type: "cancelByCloid", ...actionArgs });

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
        return await this._request(
            { action, signature, nonce, vaultAddress, expiresAfter } satisfies CancelByCloidRequest,
            signal,
        ) as CancelResponseSuccess;
    }

    /**
     * Transfer native token from the user's spot account into staking for delegating to validators.
     * @param args - The parameters for the request.
     * @param signal - An optional abort signal.
     * @returns Successful response without specific data.
     * @throws {ApiRequestError} When the API returns an error response.
     *
     * @see https://hyperliquid.gitbook.io/hyperliquid-docs/for-developers/api/exchange-endpoint#deposit-into-staking
     * @example
     * ```ts
     * import * as hl from "@nktkas/hyperliquid";
     * import { privateKeyToAccount } from "viem/accounts";
     *
     * const wallet = privateKeyToAccount("0x...");
     * const transport = new hl.HttpTransport(); // or WebSocketTransport
     * const exchClient = new hl.ExchangeClient({ wallet, transport });
     *
     * const data = await exchClient.cDeposit({ wei: 1 * 1e8 });
     * ```
     */
    async cDeposit(args: CDepositParameters, signal?: AbortSignal): Promise<SuccessResponse> {
        // Construct an action
        const action: CDepositRequest["action"] = {
            ...args,
            type: "cDeposit",
            hyperliquidChain: this._getHyperliquidChain(),
            signatureChainId: await this._getSignatureChainId(),
            nonce: await this.nonceManager(),
        };

        // Sign the action
        const signature = await signUserSignedAction({
            wallet: this.wallet,
            action,
            types: {
                "HyperliquidTransaction:CDeposit": [
                    { name: "hyperliquidChain", type: "string" },
                    { name: "wei", type: "uint64" },
                    { name: "nonce", type: "uint64" },
                ],
            },
            chainId: parseInt(action.signatureChainId, 16),
        });

        // Send a request
        return await this._request(
            { action, signature, nonce: action.nonce } satisfies CDepositRequest,
            signal,
        ) as SuccessResponse;
    }

    /**
     * Claim rewards from referral program.
     * @param args - The parameters for the request.
     * @param signal - An optional abort signal.
     * @returns Successful response without specific data.
     * @throws {ApiRequestError} When the API returns an error response.
     *
     * @see null - no documentation
     * @example
     * ```ts
     * import * as hl from "@nktkas/hyperliquid";
     * import { privateKeyToAccount } from "viem/accounts";
     *
     * const wallet = privateKeyToAccount("0x...");
     * const transport = new hl.HttpTransport(); // or WebSocketTransport
     * const exchClient = new hl.ExchangeClient({ wallet, transport });
     *
     * const data = await exchClient.claimRewards();
     * ```
     */
    async claimRewards(signal?: AbortSignal): Promise<SuccessResponse> {
        // Construct an action
        const nonce = await this.nonceManager();
        const action = l1ActionSorter.claimRewards({ type: "claimRewards" });

        // Sign the action
        const signature = await signL1Action({
            wallet: this.wallet,
            action,
            nonce,
            isTestnet: this.isTestnet,
        });

        // Send a request
        return await this._request(
            { action, signature, nonce } satisfies ClaimRewardsRequest,
            signal,
        ) as SuccessResponse;
    }

    /**
     * Convert a single-signature account to a multi-signature account.
     * @param args - The parameters for the request.
     * @param signal - An optional abort signal.
     * @returns Successful response without specific data.
     * @throws {ApiRequestError} When the API returns an error response.
     *
     * @see https://hyperliquid.gitbook.io/hyperliquid-docs/hypercore/multi-sig
     * @example
     * ```ts
     * import * as hl from "@nktkas/hyperliquid";
     * import { privateKeyToAccount } from "viem/accounts";
     *
     * const wallet = privateKeyToAccount("0x...");
     * const transport = new hl.HttpTransport(); // or WebSocketTransport
     * const exchClient = new hl.ExchangeClient({ wallet, transport });
     *
     * const data = await exchClient.convertToMultiSigUser({
     *   authorizedUsers: ["0x...", "0x..."],
     *   threshold: 2,
     * });
     * ```
     */
    async convertToMultiSigUser(args: ConvertToMultiSigUserParameters, signal?: AbortSignal): Promise<SuccessResponse> {
        // Construct an action
        const action: ConvertToMultiSigUserRequest["action"] = {
            type: "convertToMultiSigUser",
            hyperliquidChain: this._getHyperliquidChain(),
            signatureChainId: await this._getSignatureChainId(),
            signers: JSON.stringify(args),
            nonce: await this.nonceManager(),
        };

        // Sign the action
        const signature = await signUserSignedAction({
            wallet: this.wallet,
            action,
            types: {
                "HyperliquidTransaction:ConvertToMultiSigUser": [
                    { name: "hyperliquidChain", type: "string" },
                    { name: "signers", type: "string" },
                    { name: "nonce", type: "uint64" },
                ],
            },
            chainId: parseInt(action.signatureChainId, 16),
        });

        // Send a request
        return await this._request(
            { action, signature, nonce: action.nonce } satisfies ConvertToMultiSigUserRequest,
            signal,
        ) as SuccessResponse;
    }

    /**
     * Create a sub-account.
     * @param args - The parameters for the request.
     * @param signal - An optional abort signal.
     * @returns Response for creating a sub-account.
     * @throws {ApiRequestError} When the API returns an error response.
     *
     * @see null - no documentation
     * @example
     * ```ts
     * import * as hl from "@nktkas/hyperliquid";
     * import { privateKeyToAccount } from "viem/accounts";
     *
     * const wallet = privateKeyToAccount("0x...");
     * const transport = new hl.HttpTransport(); // or WebSocketTransport
     * const exchClient = new hl.ExchangeClient({ wallet, transport });
     *
     * const data = await exchClient.createSubAccount({ name: "subAccountName" });
     * ```
     */
    async createSubAccount(args: CreateSubAccountParameters, signal?: AbortSignal): Promise<CreateSubAccountResponse> {
        // Construct an action
        const nonce = await this.nonceManager();
        const action = l1ActionSorter.createSubAccount({ type: "createSubAccount", ...args });

        // Sign the action
        const signature = await signL1Action({
            wallet: this.wallet,
            action,
            nonce,
            isTestnet: this.isTestnet,
        });

        // Send a request
        return await this._request(
            { action, signature, nonce } satisfies CreateSubAccountRequest,
            signal,
        ) as CreateSubAccountResponse;
    }

    /**
     * Create a vault.
     * @param args - The parameters for the request.
     * @param signal - An optional abort signal.
     * @returns Response for creating a vault.
     * @throws {ApiRequestError} When the API returns an error response.
     *
     * @see null - no documentation
     * @example
     * ```ts
     * import * as hl from "@nktkas/hyperliquid";
     * import { privateKeyToAccount } from "viem/accounts";
     *
     * const wallet = privateKeyToAccount("0x...");
     * const transport = new hl.HttpTransport(); // or WebSocketTransport
     * const exchClient = new hl.ExchangeClient({ wallet, transport });
     *
     * const data = await exchClient.createVault({
     *   name: "VaultName",
     *   description: "This is an example of a vault description",
     *   initialUsd: 100 * 1e6,
     * });
     * ```
     */
    async createVault(args: CreateVaultParameters, signal?: AbortSignal): Promise<CreateVaultResponse> {
        // Construct an action
        const nonce = await this.nonceManager();
        const action = l1ActionSorter.createVault({ type: "createVault", nonce, ...args });

        // Sign the action
        const signature = await signL1Action({
            wallet: this.wallet,
            action,
            nonce,
            isTestnet: this.isTestnet,
        });

        // Send a request
        return await this._request(
            { action, signature, nonce } satisfies CreateVaultRequest,
            signal,
        ) as CreateVaultResponse;
    }

    /**
     * Jail or unjail self as a validator signer.
     * @param args - The parameters for the request.
     * @param signal - An optional abort signal.
     * @returns Successful response without specific data.
     * @throws {ApiRequestError} When the API returns an error response.
     *
     * @see null - no documentation
     * @example
     * ```ts
     * import * as hl from "@nktkas/hyperliquid";
     * import { privateKeyToAccount } from "viem/accounts";
     *
     * const wallet = privateKeyToAccount("0x...");
     * const transport = new hl.HttpTransport(); // or WebSocketTransport
     * const exchClient = new hl.ExchangeClient({ wallet, transport });
     *
     * // Jail self
     * const data = await exchClient.cSignerAction({ jailSelf: null });
     *
     * // Unjail self
     * const data = await exchClient.cSignerAction({ unjailSelf: null });
     * ```
     */
    async cSignerAction(args: CSignerActionParameters_JailSelf, signal?: AbortSignal): Promise<SuccessResponse>;
    async cSignerAction(args: CSignerActionParameters_UnjailSelf, signal?: AbortSignal): Promise<SuccessResponse>;
    async cSignerAction(args: CSignerActionParameters, signal?: AbortSignal): Promise<SuccessResponse> {
        // Destructure the parameters
        const {
            expiresAfter = await this._getDefaultExpiresAfter(),
            ...actionArgs
        } = args;

        // Construct an action
        const nonce = await this.nonceManager();
        const action = l1ActionSorter.CSignerAction({ type: "CSignerAction", ...actionArgs });

        // Sign the action
        const signature = await signL1Action({
            wallet: this.wallet,
            action,
            nonce,
            isTestnet: this.isTestnet,
            expiresAfter,
        });

        // Send a request
        return await this._request(
            { action, signature, nonce, expiresAfter } as
                | CSignerActionRequest_JailSelf
                | CSignerActionRequest_UnjailSelf,
            signal,
        ) as SuccessResponse;
    }

    /**
     * Action related to validator management.
     * @param args - The parameters for the request.
     * @param signal - An optional abort signal.
     * @returns Successful response without specific data.
     * @throws {ApiRequestError} When the API returns an error response.
     *
     * @example
     * ```ts
     * import * as hl from "@nktkas/hyperliquid";
     * import { privateKeyToAccount } from "viem/accounts";
     *
     * const wallet = privateKeyToAccount("0x...");
     * const transport = new hl.HttpTransport(); // or WebSocketTransport
     * const exchClient = new hl.ExchangeClient({ wallet, transport });
     *
     * // Change validator profile
     * const data = await exchClient.cValidatorAction({
     *   changeProfile: {
     *     name: "My Validator",
     *     description: "My validator description",
     *     unjailed: true,
     *   }
     * });
     * ```
     */
    async cValidatorAction(
        args: CValidatorActionParameters_ChangeProfile,
        signal?: AbortSignal,
    ): Promise<SuccessResponse>;
    async cValidatorAction(
        args: CValidatorActionParameters_Register,
        signal?: AbortSignal,
    ): Promise<SuccessResponse>;
    async cValidatorAction(
        args: CValidatorActionParameters_Unregister,
        signal?: AbortSignal,
    ): Promise<SuccessResponse>;
    async cValidatorAction(
        args: CValidatorActionParameters,
        signal?: AbortSignal,
    ): Promise<SuccessResponse> {
        // Destructure the parameters
        const {
            expiresAfter = await this._getDefaultExpiresAfter(),
            ...actionArgs
        } = args;

        // Construct an action
        const nonce = await this.nonceManager();
        const action = l1ActionSorter.CValidatorAction({ type: "CValidatorAction", ...actionArgs });

        // Sign the action
        const signature = await signL1Action({
            wallet: this.wallet,
            action,
            nonce,
            isTestnet: this.isTestnet,
            expiresAfter,
        });

        // Send a request
        return await this._request(
            { action, signature, nonce, expiresAfter } as
                | CValidatorActionRequest_ChangeProfile
                | CValidatorActionRequest_Register
                | CValidatorActionRequest_Unregister,
            signal,
        ) as SuccessResponse;
    }

    /**
     * Transfer native token from staking into the user's spot account.
     * @param args - The parameters for the request.
     * @param signal - An optional abort signal.
     * @returns Successful response without specific data.
     * @throws {ApiRequestError} When the API returns an error response.
     *
     * @see https://hyperliquid.gitbook.io/hyperliquid-docs/for-developers/api/exchange-endpoint#withdraw-from-staking
     * @example
     * ```ts
     * import * as hl from "@nktkas/hyperliquid";
     * import { privateKeyToAccount } from "viem/accounts";
     *
     * const wallet = privateKeyToAccount("0x...");
     * const transport = new hl.HttpTransport(); // or WebSocketTransport
     * const exchClient = new hl.ExchangeClient({ wallet, transport });
     *
     * const data = await exchClient.cWithdraw({ wei: 1 * 1e8 });
     * ```
     */
    async cWithdraw(args: CWithdrawParameters, signal?: AbortSignal): Promise<SuccessResponse> {
        // Construct an action
        const action: CWithdrawRequest["action"] = {
            ...args,
            type: "cWithdraw",
            hyperliquidChain: this._getHyperliquidChain(),
            signatureChainId: await this._getSignatureChainId(),
            nonce: await this.nonceManager(),
        };

        // Sign the action
        const signature = await signUserSignedAction({
            wallet: this.wallet,
            action,
            types: {
                "HyperliquidTransaction:CWithdraw": [
                    { name: "hyperliquidChain", type: "string" },
                    { name: "wei", type: "uint64" },
                    { name: "nonce", type: "uint64" },
                ],
            },
            chainId: parseInt(action.signatureChainId, 16),
        });

        // Send a request
        return await this._request(
            { action, signature, nonce: action.nonce } satisfies CWithdrawRequest,
            signal,
        ) as SuccessResponse;
    }

    /**
     * Configure block type for EVM transactions.
     * @param args - The parameters for the request.
     * @param signal - An optional abort signal.
     * @returns Response for creating a sub-account.
     * @throws {ApiRequestError} When the API returns an error response.
     *
     * @see https://hyperliquid.gitbook.io/hyperliquid-docs/for-developers/evm/dual-block-architecture
     * @example
     * ```ts
     * import * as hl from "@nktkas/hyperliquid";
     * import { privateKeyToAccount } from "viem/accounts";
     *
     * const wallet = privateKeyToAccount("0x...");
     * const transport = new hl.HttpTransport(); // or WebSocketTransport
     * const exchClient = new hl.ExchangeClient({ wallet, transport });
     *
     * const data = await exchClient.evmUserModify({ usingBigBlocks: true });
     * ```
     */
    async evmUserModify(args: EvmUserModifyParameters, signal?: AbortSignal): Promise<SuccessResponse> {
        // Construct an action
        const nonce = await this.nonceManager();
        const action = l1ActionSorter.evmUserModify({ type: "evmUserModify", ...args });

        // Sign the action
        const signature = await signL1Action({
            wallet: this.wallet,
            action,
            nonce,
            isTestnet: this.isTestnet,
        });

        // Send a request
        return await this._request(
            { action, signature, nonce } satisfies EvmUserModifyRequest,
            signal,
        ) as SuccessResponse;
    }

    /**
     * Modify an order.
     * @param args - The parameters for the request.
     * @param signal - An optional abort signal.
     * @returns Successful response without specific data.
     * @throws {ApiRequestError} When the API returns an error response.
     *
     * @see https://hyperliquid.gitbook.io/hyperliquid-docs/for-developers/api/exchange-endpoint#modify-an-order
     * @example
     * ```ts
     * import * as hl from "@nktkas/hyperliquid";
     * import { privateKeyToAccount } from "viem/accounts";
     *
     * const wallet = privateKeyToAccount("0x...");
     * const transport = new hl.HttpTransport(); // or WebSocketTransport
     * const exchClient = new hl.ExchangeClient({ wallet, transport });
     *
     * const data = await exchClient.modify({
     *   oid: 123,
     *   order: {
     *     a: 0, // Asset index
     *     b: true, // Buy order
     *     p: "31000", // New price
     *     s: "0.2", // New size
     *     r: false, // Not reduce-only
     *     t: {
     *       limit: {
     *         tif: "Gtc", // Good-til-cancelled
     *       },
     *     },
     *     c: "0x...", // Optional: Client Order ID
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
        const action = l1ActionSorter.modify({ type: "modify", ...actionArgs });

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
        return await this._request(
            { action, signature, nonce, vaultAddress, expiresAfter } satisfies ModifyRequest,
            signal,
        ) as SuccessResponse;
    }

    /**
     * A multi-signature request.
     * @param args - The parameters for the request.
     * @param signal - An optional abort signal.
     * @returns Successful response without specific data.
     * @throws {ApiRequestError} When the API returns an error response.
     *
     * @see https://hyperliquid.gitbook.io/hyperliquid-docs/hypercore/multi-sig
     * @example
     * ```ts
     * import * as hl from "@nktkas/hyperliquid";
     * import { privateKeyToAccount } from "viem/accounts";
     *
     * const wallet = privateKeyToAccount("0x...");
     * const transport = new hl.HttpTransport(); // or WebSocketTransport
     * const exchClient = new hl.ExchangeClient({ wallet, transport });
     *
     * const multiSigUser = "0x..."; // Multi-sig user address
     *
     * const nonce = Date.now();
     * const action = { type: "scheduleCancel", time: Date.now() + 10000 };
     *
     * const signature = await hl.signL1Action({
     *   wallet,
     *   action: [multiSigUser.toLowerCase(), signer1.address.toLowerCase(), action],
     *   nonce,
     *   isTestnet: true,
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
     * @unstable May not behave as expected and the interface may change in the future.
     */
    async multiSig(args: MultiSigParameters, signal?: AbortSignal): Promise<
        | SuccessResponse
        | CancelResponseSuccess
        | CreateSubAccountResponse
        | CreateVaultResponse
        | OrderResponseSuccess
        | TwapOrderResponseSuccess
        | TwapCancelResponseSuccess
    > {
        // Destructure the parameters
        const {
            vaultAddress = this.defaultVaultAddress,
            expiresAfter = await this._getDefaultExpiresAfter(),
            nonce,
            ...actionArgs
        } = args;

        // Construct an action
        const hyperliquidChain = this._getHyperliquidChain();
        const action = l1ActionSorter.multiSig({
            type: "multiSig",
            signatureChainId: await this._getSignatureChainId(),
            ...actionArgs,
        });

        // Sign the action
        const actionForMultiSig = structuredClone(action) as Omit<MultiSigRequest["action"], "type"> & {
            type?: string | undefined;
        };
        delete actionForMultiSig.type;

        const signature = await signMultiSigAction({
            wallet: this.wallet,
            action: actionForMultiSig,
            nonce,
            vaultAddress,
            expiresAfter,
            hyperliquidChain,
            signatureChainId: action.signatureChainId,
        });

        // Send a request
        return await this._request(
            { action, signature, nonce, vaultAddress, expiresAfter } satisfies MultiSigRequest,
            signal,
        );
    }

    /**
     * Place an order(s).
     * @param args - The parameters for the request.
     * @param signal - An optional abort signal.
     * @returns Successful variant of {@link OrderResponse} without error statuses.
     * @throws {ApiRequestError} When the API returns an error response.
     *
     * @see https://hyperliquid.gitbook.io/hyperliquid-docs/for-developers/api/exchange-endpoint#place-an-order
     * @example
     * ```ts
     * import * as hl from "@nktkas/hyperliquid";
     * import { privateKeyToAccount } from "viem/accounts";
     *
     * const wallet = privateKeyToAccount("0x...");
     * const transport = new hl.HttpTransport(); // or WebSocketTransport
     * const exchClient = new hl.ExchangeClient({ wallet, transport });
     *
     * const data = await exchClient.order({
     *   orders: [{
     *     a: 0, // Asset index
     *     b: true, // Buy order
     *     p: "30000", // Price
     *     s: "0.1", // Size
     *     r: false, // Not reduce-only
     *     t: {
     *       limit: {
     *         tif: "Gtc", // Good-til-cancelled
     *       },
     *     },
     *     c: "0x...", // Optional: Client Order ID
     *   }],
     *   grouping: "na", // No grouping
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
        const action = l1ActionSorter.order({ type: "order", ...actionArgs });

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
        return await this._request(
            { action, signature, nonce, vaultAddress, expiresAfter } satisfies OrderRequest,
            signal,
        ) as OrderResponseSuccess;
    }

    /**
     * Deploying HIP-3 assets.
     * @param args - The parameters for the request.
     * @param signal - An optional abort signal.
     * @returns Successful response without specific data.
     * @throws {ApiRequestError} When the API returns an error response.
     *
     * @see https://hyperliquid.gitbook.io/hyperliquid-docs/for-developers/api/deploying-hip-3-assets
     */
    async perpDeploy(args: PerpDeployParameters_RegisterAsset, signal?: AbortSignal): Promise<SuccessResponse>;
    async perpDeploy(args: PerpDeployParameters_SetOracle, signal?: AbortSignal): Promise<SuccessResponse>;
    async perpDeploy(args: PerpDeployParameters, signal?: AbortSignal): Promise<SuccessResponse> {
        // Construct an action
        const nonce = await this.nonceManager();
        const action = l1ActionSorter.perpDeploy({ type: "perpDeploy", ...args });

        // Sign the action
        const signature = await signL1Action({
            wallet: this.wallet,
            action,
            nonce,
            isTestnet: this.isTestnet,
        });

        // Send a request
        return await this._request(
            { action, signature, nonce } as
                | PerpDeployRequest_RegisterAsset
                | PerpDeployRequest_SetOracle,
            signal,
        ) as SuccessResponse;
    }

    /**
     * Transfer funds between Spot account and Perp dex account.
     * @param args - The parameters for the request.
     * @param signal - An optional abort signal.
     * @returns Successful response without specific data.
     * @throws {ApiRequestError} When the API returns an error response.
     *
     * @see https://hyperliquid.gitbook.io/hyperliquid-docs/for-developers/api/exchange-endpoint#transfer-from-spot-account-to-perp-account-and-vice-versa
     * @example
     * ```ts
     * import * as hl from "@nktkas/hyperliquid";
     * import { privateKeyToAccount } from "viem/accounts";
     *
     * const wallet = privateKeyToAccount("0x...");
     * const transport = new hl.HttpTransport(); // or WebSocketTransport
     * const exchClient = new hl.ExchangeClient({ wallet, transport });
     *
     * const data = await exchClient.perpDexClassTransfer({
     *   dex: "test",
     *   token: "USDC",
     *   amount: "1",
     *   toPerp: true,
     * });
     * ```
     */
    async perpDexClassTransfer(args: PerpDexClassTransferParameters, signal?: AbortSignal): Promise<SuccessResponse> {
        // Construct an action
        const action: PerpDexClassTransferRequest["action"] = {
            ...args,
            type: "PerpDexClassTransfer",
            hyperliquidChain: this._getHyperliquidChain(),
            signatureChainId: await this._getSignatureChainId(),
            nonce: await this.nonceManager(),
        };

        // Sign the action
        const signature = await signUserSignedAction({
            wallet: this.wallet,
            action,
            types: {
                "HyperliquidTransaction:PerpDexClassTransfer": [
                    { name: "hyperliquidChain", type: "string" },
                    { name: "dex", type: "string" },
                    { name: "token", type: "string" },
                    { name: "amount", type: "string" },
                    { name: "toPerp", type: "bool" },
                    { name: "nonce", type: "uint64" },
                ],
            },
            chainId: parseInt(action.signatureChainId, 16),
        });

        // Send a request
        return await this._request(
            { action, signature, nonce: action.nonce } satisfies PerpDexClassTransferRequest,
            signal,
        ) as SuccessResponse;
    }

    /**
     * Create a referral code.
     * @param args - The parameters for the request.
     * @param signal - An optional abort signal.
     * @returns Successful response without specific data.
     * @throws {ApiRequestError} When the API returns an error response.
     *
     * @see null - no documentation
     * @example
     * ```ts
     * import * as hl from "@nktkas/hyperliquid";
     * import { privateKeyToAccount } from "viem/accounts";
     *
     * const wallet = privateKeyToAccount("0x...");
     * const transport = new hl.HttpTransport(); // or WebSocketTransport
     * const exchClient = new hl.ExchangeClient({ wallet, transport });
     *
     * const data = await exchClient.registerReferrer({ code: "TEST" });
     * ```
     */
    async registerReferrer(args: RegisterReferrerParameters, signal?: AbortSignal): Promise<SuccessResponse> {
        // Construct an action
        const nonce = await this.nonceManager();
        const action = l1ActionSorter.registerReferrer({ type: "registerReferrer", ...args });

        // Sign the action
        const signature = await signL1Action({
            wallet: this.wallet,
            action,
            nonce,
            isTestnet: this.isTestnet,
        });

        // Send a request
        return await this._request(
            { action, signature, nonce } satisfies RegisterReferrerRequest,
            signal,
        ) as SuccessResponse;
    }

    /**
     * Reserve additional rate-limited actions for a fee.
     * @param args - The parameters for the request.
     * @param signal - An optional abort signal.
     * @returns Successful response without specific data.
     * @throws {ApiRequestError} When the API returns an error response.
     *
     * @see https://hyperliquid.gitbook.io/hyperliquid-docs/for-developers/api/exchange-endpoint#reserve-additional-actions
     * @example
     * ```ts
     * import * as hl from "@nktkas/hyperliquid";
     * import { privateKeyToAccount } from "viem/accounts";
     *
     * const wallet = privateKeyToAccount("0x...");
     * const transport = new hl.HttpTransport(); // or WebSocketTransport
     * const exchClient = new hl.ExchangeClient({ wallet, transport });
     *
     * const data = await exchClient.reserveRequestWeight({ weight: 10 });
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
        const action = l1ActionSorter.reserveRequestWeight({ type: "reserveRequestWeight", ...actionArgs });

        // Sign the action
        const signature = await signL1Action({
            wallet: this.wallet,
            action,
            nonce,
            isTestnet: this.isTestnet,
            expiresAfter,
        });

        // Send a request
        return await this._request(
            { action, signature, nonce, expiresAfter } satisfies ReserveRequestWeightRequest,
            signal,
        ) as SuccessResponse;
    }

    /**
     * Schedule a cancel-all operation at a future time.
     * @param args - The parameters for the request.
     * @param signal - An optional abort signal.
     * @returns Successful response without specific data.
     * @throws {ApiRequestError} When the API returns an error response.
     *
     * @see https://hyperliquid.gitbook.io/hyperliquid-docs/for-developers/api/exchange-endpoint#schedule-cancel-dead-mans-switch
     * @example
     * ```ts
     * import * as hl from "@nktkas/hyperliquid";
     * import { privateKeyToAccount } from "viem/accounts";
     *
     * const wallet = privateKeyToAccount("0x...");
     * const transport = new hl.HttpTransport(); // or WebSocketTransport
     * const exchClient = new hl.ExchangeClient({ wallet, transport });
     *
     * const data = await exchClient.scheduleCancel({ time: Date.now() + 3600000 });
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
        const action = l1ActionSorter.scheduleCancel({ type: "scheduleCancel", ...actionArgs });

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
        return await this._request(
            { action, signature, nonce, vaultAddress, expiresAfter } satisfies ScheduleCancelRequest,
            signal,
        ) as SuccessResponse;
    }

    /**
     * Set the display name in the leaderboard.
     * @param args - The parameters for the request.
     * @param signal - An optional abort signal.
     * @returns Successful response without specific data.
     * @throws {ApiRequestError} When the API returns an error response.
     *
     * @see null - no documentation
     * @example
     * ```ts
     * import * as hl from "@nktkas/hyperliquid";
     * import { privateKeyToAccount } from "viem/accounts";
     *
     * const wallet = privateKeyToAccount("0x...");
     * const transport = new hl.HttpTransport(); // or WebSocketTransport
     * const exchClient = new hl.ExchangeClient({ wallet, transport });
     *
     * const data = await exchClient.setDisplayName({ displayName: "My Name" });
     * ```
     */
    async setDisplayName(args: SetDisplayNameParameters, signal?: AbortSignal): Promise<SuccessResponse> {
        // Construct an action
        const nonce = await this.nonceManager();
        const action = l1ActionSorter.setDisplayName({ type: "setDisplayName", ...args });

        // Sign the action
        const signature = await signL1Action({
            wallet: this.wallet,
            action,
            nonce,
            isTestnet: this.isTestnet,
        });

        // Send a request
        return await this._request(
            { action, signature, nonce } satisfies SetDisplayNameRequest,
            signal,
        ) as SuccessResponse;
    }

    /**
     * Set a referral code.
     * @param args - The parameters for the request.
     * @param signal - An optional abort signal.
     * @returns Successful response without specific data.
     * @throws {ApiRequestError} When the API returns an error response.
     *
     * @see null - no documentation
     * @example
     * ```ts
     * import * as hl from "@nktkas/hyperliquid";
     * import { privateKeyToAccount } from "viem/accounts";
     *
     * const wallet = privateKeyToAccount("0x...");
     * const transport = new hl.HttpTransport(); // or WebSocketTransport
     * const exchClient = new hl.ExchangeClient({ wallet, transport });
     *
     * const data = await exchClient.setReferrer({ code: "TEST" });
     * ```
     */
    async setReferrer(args: SetReferrerParameters, signal?: AbortSignal): Promise<SuccessResponse> {
        // Construct an action
        const nonce = await this.nonceManager();
        const action = l1ActionSorter.setReferrer({ type: "setReferrer", ...args });

        // Sign the action
        const signature = await signL1Action({
            wallet: this.wallet,
            action,
            nonce,
            isTestnet: this.isTestnet,
        });

        // Send a request
        return await this._request(
            { action, signature, nonce } satisfies SetReferrerRequest,
            signal,
        ) as SuccessResponse;
    }

    /**
     * Deploying HIP-1 and HIP-2 assets.
     * @param args - The parameters for the request.
     * @param signal - An optional abort signal.
     * @returns Successful response without specific data.
     * @throws {ApiRequestError} When the API returns an error response.
     *
     * @see https://hyperliquid.gitbook.io/hyperliquid-docs/for-developers/api/deploying-hip-1-and-hip-2-assets
     */
    async spotDeploy(
        args: SpotDeployParameters_Genesis,
        signal?: AbortSignal,
    ): Promise<SuccessResponse>;
    async spotDeploy(
        args: SpotDeployParameters_RegisterHyperliquidity,
        signal?: AbortSignal,
    ): Promise<SuccessResponse>;
    async spotDeploy(
        args: SpotDeployParameters_RegisterSpot,
        signal?: AbortSignal,
    ): Promise<SuccessResponse>;
    async spotDeploy(
        args: SpotDeployParameters_RegisterToken2,
        signal?: AbortSignal,
    ): Promise<SuccessResponse>;
    async spotDeploy(
        args: SpotDeployParameters_SetDeployerTradingFeeShare,
        signal?: AbortSignal,
    ): Promise<SuccessResponse>;
    async spotDeploy(
        args: SpotDeployParameters_UserGenesis,
        signal?: AbortSignal,
    ): Promise<SuccessResponse>;
    async spotDeploy(
        args: SpotDeployParameters,
        signal?: AbortSignal,
    ): Promise<SuccessResponse> {
        // Construct an action
        const nonce = await this.nonceManager();
        const action = l1ActionSorter.spotDeploy({ type: "spotDeploy", ...args });

        // Sign the action
        const signature = await signL1Action({
            wallet: this.wallet,
            action,
            nonce,
            isTestnet: this.isTestnet,
        });

        // Send a request
        return await this._request(
            { action, signature, nonce } as
                | SpotDeployRequest_RegisterToken2
                | SpotDeployRequest_UserGenesis
                | SpotDeployRequest_Genesis
                | SpotDeployRequest_RegisterSpot
                | SpotDeployRequest_RegisterHyperliquidity
                | SpotDeployRequest_SetDeployerTradingFeeShare,
            signal,
        ) as SuccessResponse;
    }

    /**
     * Send spot assets to another address.
     * @param args - The parameters for the request.
     * @param signal - An optional abort signal.
     * @returns Successful response without specific data.
     * @throws {ApiRequestError} When the API returns an error response.
     *
     * @see https://hyperliquid.gitbook.io/hyperliquid-docs/for-developers/api/exchange-endpoint#core-spot-transfer
     * @example
     * ```ts
     * import * as hl from "@nktkas/hyperliquid";
     * import { privateKeyToAccount } from "viem/accounts";
     *
     * const wallet = privateKeyToAccount("0x...");
     * const transport = new hl.HttpTransport(); // or WebSocketTransport
     * const exchClient = new hl.ExchangeClient({ wallet, transport });
     *
     * const data = await exchClient.spotSend({
     *   destination: "0x...",
     *   token: "USDC:0xeb62eee3685fc4c43992febcd9e75443",
     *   amount: "1",
     * });
     * ```
     */
    async spotSend(args: SpotSendParameters, signal?: AbortSignal): Promise<SuccessResponse> {
        // Construct an action
        const action: SpotSendRequest["action"] = {
            ...args,
            type: "spotSend",
            hyperliquidChain: this._getHyperliquidChain(),
            signatureChainId: await this._getSignatureChainId(),
            time: await this.nonceManager(),
        };

        // Sign the action
        const signature = await signUserSignedAction({
            wallet: this.wallet,
            action,
            types: {
                "HyperliquidTransaction:SpotSend": [
                    { name: "hyperliquidChain", type: "string" },
                    { name: "destination", type: "string" },
                    { name: "token", type: "string" },
                    { name: "amount", type: "string" },
                    { name: "time", type: "uint64" },
                ],
            },
            chainId: parseInt(action.signatureChainId, 16),
        });

        // Send a request
        return await this._request(
            { action, signature, nonce: action.time } satisfies SpotSendRequest,
            signal,
        ) as SuccessResponse;
    }

    /**
     * Opt Out of Spot Dusting.
     * @param args - The parameters for the request.
     * @param signal - An optional abort signal.
     * @returns Successful response without specific data.
     * @throws {ApiRequestError} When the API returns an error response.
     *
     * @see null - no documentation
     * @example
     * ```ts
     * import * as hl from "@nktkas/hyperliquid";
     * import { privateKeyToAccount } from "viem/accounts";
     *
     * const wallet = privateKeyToAccount("0x...");
     * const transport = new hl.HttpTransport(); // or WebSocketTransport
     * const exchClient = new hl.ExchangeClient({ wallet, transport });
     *
     * const data = await exchClient.spotUser({ toggleSpotDusting: { optOut: false } });
     * ```
     */
    async spotUser(args: SpotUserParameters, signal?: AbortSignal): Promise<SuccessResponse> {
        // Construct an action
        const nonce = await this.nonceManager();
        const action = l1ActionSorter.spotUser({ type: "spotUser", ...args });

        // Sign the action
        const signature = await signL1Action({
            wallet: this.wallet,
            action,
            nonce,
            isTestnet: this.isTestnet,
        });

        // Send a request
        return await this._request(
            { action, signature, nonce } satisfies SpotUserRequest,
            signal,
        ) as SuccessResponse;
    }

    /**
     * Transfer between sub-accounts (spot).
     * @param args - The parameters for the request.
     * @param signal - An optional abort signal.
     * @returns Successful response without specific data.
     * @throws {ApiRequestError} When the API returns an error response.
     *
     * @see null - no documentation
     * @example
     * ```ts
     * import * as hl from "@nktkas/hyperliquid";
     * import { privateKeyToAccount } from "viem/accounts";
     *
     * const wallet = privateKeyToAccount("0x...");
     * const transport = new hl.HttpTransport(); // or WebSocketTransport
     * const exchClient = new hl.ExchangeClient({ wallet, transport });
     *
     * const data = await exchClient.subAccountSpotTransfer({
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
        // Construct an action
        const nonce = await this.nonceManager();
        const action = l1ActionSorter.subAccountSpotTransfer({ type: "subAccountSpotTransfer", ...args });

        // Sign the action
        const signature = await signL1Action({
            wallet: this.wallet,
            action,
            nonce,
            isTestnet: this.isTestnet,
        });

        // Send a request
        return await this._request(
            { action, signature, nonce } satisfies SubAccountSpotTransferRequest,
            signal,
        ) as SuccessResponse;
    }

    /**
     * Transfer between sub-accounts (perpetual).
     * @param args - The parameters for the request.
     * @param signal - An optional abort signal.
     * @returns Successful response without specific data.
     * @throws {ApiRequestError} When the API returns an error response.
     *
     * @see null - no documentation
     * @example
     * ```ts
     * import * as hl from "@nktkas/hyperliquid";
     * import { privateKeyToAccount } from "viem/accounts";
     *
     * const wallet = privateKeyToAccount("0x...");
     * const transport = new hl.HttpTransport(); // or WebSocketTransport
     * const exchClient = new hl.ExchangeClient({ wallet, transport });
     *
     * const data = await exchClient.subAccountTransfer({
     *   subAccountUser: "0x...",
     *   isDeposit: true,
     *   usd: 1 * 1e6,
     * });
     * ```
     */
    async subAccountTransfer(args: SubAccountTransferParameters, signal?: AbortSignal): Promise<SuccessResponse> {
        // Construct an action
        const nonce = await this.nonceManager();
        const action = l1ActionSorter.subAccountTransfer({ type: "subAccountTransfer", ...args });

        // Sign the action
        const signature = await signL1Action({
            wallet: this.wallet,
            action,
            nonce,
            isTestnet: this.isTestnet,
        });

        // Send a request
        return await this._request(
            { action, signature, nonce } satisfies SubAccountTransferRequest,
            signal,
        ) as SuccessResponse;
    }

    /**
     * Delegate or undelegate native tokens to or from a validator.
     * @param args - The parameters for the request.
     * @param signal - An optional abort signal.
     * @returns Successful response without specific data.
     * @throws {ApiRequestError} When the API returns an error response.
     *
     * @see https://hyperliquid.gitbook.io/hyperliquid-docs/for-developers/api/exchange-endpoint#delegate-or-undelegate-stake-from-validator
     * @example
     * ```ts
     * import * as hl from "@nktkas/hyperliquid";
     * import { privateKeyToAccount } from "viem/accounts";
     *
     * const wallet = privateKeyToAccount("0x...");
     * const transport = new hl.HttpTransport(); // or WebSocketTransport
     * const exchClient = new hl.ExchangeClient({ wallet, transport });
     *
     * const data = await exchClient.tokenDelegate({
     *   validator: "0x...",
     *   isUndelegate: true,
     *   wei: 1 * 1e8,
     * });
     * ```
     */
    async tokenDelegate(args: TokenDelegateParameters, signal?: AbortSignal): Promise<SuccessResponse> {
        // Construct an action
        const action: TokenDelegateRequest["action"] = {
            ...args,
            type: "tokenDelegate",
            hyperliquidChain: this._getHyperliquidChain(),
            signatureChainId: await this._getSignatureChainId(),
            nonce: await this.nonceManager(),
        };

        // Sign the action
        const signature = await signUserSignedAction({
            wallet: this.wallet,
            action,
            types: {
                "HyperliquidTransaction:TokenDelegate": [
                    { name: "hyperliquidChain", type: "string" },
                    { name: "validator", type: "address" },
                    { name: "wei", type: "uint64" },
                    { name: "isUndelegate", type: "bool" },
                    { name: "nonce", type: "uint64" },
                ],
            },
            chainId: parseInt(action.signatureChainId, 16),
        });

        // Send a request
        return await this._request(
            { action, signature, nonce: action.nonce } satisfies TokenDelegateRequest,
            signal,
        ) as SuccessResponse;
    }

    /**
     * Cancel a TWAP order.
     * @param args - The parameters for the request.
     * @param signal - An optional abort signal.
     * @returns Successful variant of {@link TwapCancelResponse} without error status.
     * @throws {ApiRequestError} When the API returns an error response.
     *
     * @see https://hyperliquid.gitbook.io/hyperliquid-docs/for-developers/api/exchange-endpoint#cancel-a-twap-order
     * @example
     * ```ts
     * import * as hl from "@nktkas/hyperliquid";
     * import { privateKeyToAccount } from "viem/accounts";
     *
     * const wallet = privateKeyToAccount("0x...");
     * const transport = new hl.HttpTransport(); // or WebSocketTransport
     * const exchClient = new hl.ExchangeClient({ wallet, transport });
     *
     * const data = await exchClient.twapCancel({
     *   a: 0, // Asset index
     *   t: 1, // TWAP ID
     * });
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
        const action = l1ActionSorter.twapCancel({ type: "twapCancel", ...actionArgs });

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
        return await this._request(
            { action, signature, nonce, vaultAddress, expiresAfter } satisfies TwapCancelRequest,
            signal,
        ) as TwapCancelResponseSuccess;
    }

    /**
     * Place a TWAP order.
     * @param args - The parameters for the request.
     * @param signal - An optional abort signal.
     * @returns Successful variant of {@link TwapOrderResponse} without error status.
     * @throws {ApiRequestError} When the API returns an error response.
     *
     * @see https://hyperliquid.gitbook.io/hyperliquid-docs/for-developers/api/exchange-endpoint#place-a-twap-order
     * @example
     * ```ts
     * import * as hl from "@nktkas/hyperliquid";
     * import { privateKeyToAccount } from "viem/accounts";
     *
     * const wallet = privateKeyToAccount("0x...");
     * const transport = new hl.HttpTransport(); // or WebSocketTransport
     * const exchClient = new hl.ExchangeClient({ wallet, transport });
     *
     * const data = await exchClient.twapOrder({
     *   a: 0, // Asset index
     *   b: true, // Buy order
     *   s: "1", // Size
     *   r: false, // Not reduce-only
     *   m: 10, // Duration in minutes
     *   t: true, // Randomize order timing
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
        const action = l1ActionSorter.twapOrder({ type: "twapOrder", twap: { ...actionArgs } });

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
        return await this._request(
            { action, signature, nonce, vaultAddress, expiresAfter } satisfies TwapOrderRequest,
            signal,
        ) as TwapOrderResponseSuccess;
    }

    /**
     * Add or remove margin from isolated position.
     * @param args - The parameters for the request.
     * @param signal - An optional abort signal.
     * @returns Successful response without specific data.
     * @throws {ApiRequestError} When the API returns an error response.
     *
     * @see https://hyperliquid.gitbook.io/hyperliquid-docs/for-developers/api/exchange-endpoint#update-isolated-margin
     * @example
     * ```ts
     * import * as hl from "@nktkas/hyperliquid";
     * import { privateKeyToAccount } from "viem/accounts";
     *
     * const wallet = privateKeyToAccount("0x...");
     * const transport = new hl.HttpTransport(); // or WebSocketTransport
     * const exchClient = new hl.ExchangeClient({ wallet, transport });
     *
     * const data = await exchClient.updateIsolatedMargin({ asset: 0, isBuy: true, ntli: 1 * 1e6 });
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
        const action = l1ActionSorter.updateIsolatedMargin({ type: "updateIsolatedMargin", ...actionArgs });

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
        return await this._request(
            { action, signature, nonce, vaultAddress, expiresAfter } satisfies UpdateIsolatedMarginRequest,
            signal,
        ) as SuccessResponse;
    }

    /**
     * Update cross or isolated leverage on a coin.
     * @param args - The parameters for the request.
     * @param signal - An optional abort signal.
     * @returns Successful response without specific data.
     * @throws {ApiRequestError} When the API returns an error response.
     *
     * @see https://hyperliquid.gitbook.io/hyperliquid-docs/for-developers/api/exchange-endpoint#update-leverage
     * @example
     * ```ts
     * import * as hl from "@nktkas/hyperliquid";
     * import { privateKeyToAccount } from "viem/accounts";
     *
     * const wallet = privateKeyToAccount("0x...");
     * const transport = new hl.HttpTransport(); // or WebSocketTransport
     * const exchClient = new hl.ExchangeClient({ wallet, transport });
     *
     * const data = await exchClient.updateLeverage({ asset: 0, isCross: true, leverage: 5 });
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
        const action = l1ActionSorter.updateLeverage({ type: "updateLeverage", ...actionArgs });

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
        return await this._request(
            { action, signature, nonce, vaultAddress, expiresAfter } satisfies UpdateLeverageRequest,
            signal,
        ) as SuccessResponse;
    }

    /**
     * Transfer funds between Spot account and Perp account.
     * @param args - The parameters for the request.
     * @param signal - An optional abort signal.
     * @returns Successful response without specific data.
     * @throws {ApiRequestError} When the API returns an error response.
     *
     * @see https://hyperliquid.gitbook.io/hyperliquid-docs/for-developers/api/exchange-endpoint#transfer-from-spot-account-to-perp-account-and-vice-versa
     * @example
     * ```ts
     * import * as hl from "@nktkas/hyperliquid";
     * import { privateKeyToAccount } from "viem/accounts";
     *
     * const wallet = privateKeyToAccount("0x...");
     * const transport = new hl.HttpTransport(); // or WebSocketTransport
     * const exchClient = new hl.ExchangeClient({ wallet, transport });
     *
     * const data = await exchClient.usdClassTransfer({ amount: "1", toPerp: true });
     * ```
     */
    async usdClassTransfer(args: UsdClassTransferParameters, signal?: AbortSignal): Promise<SuccessResponse> {
        // Construct an action
        const action: UsdClassTransferRequest["action"] = {
            ...args,
            type: "usdClassTransfer",
            hyperliquidChain: this._getHyperliquidChain(),
            signatureChainId: await this._getSignatureChainId(),
            nonce: await this.nonceManager(),
        };

        // Sign the action
        const signature = await signUserSignedAction({
            wallet: this.wallet,
            action,
            types: {
                "HyperliquidTransaction:UsdClassTransfer": [
                    { name: "hyperliquidChain", type: "string" },
                    { name: "amount", type: "string" },
                    { name: "toPerp", type: "bool" },
                    { name: "nonce", type: "uint64" },
                ],
            },
            chainId: parseInt(action.signatureChainId, 16),
        });

        // Send a request
        return await this._request(
            { action, signature, nonce: action.nonce } satisfies UsdClassTransferRequest,
            signal,
        ) as SuccessResponse;
    }

    /**
     * Send usd to another address.
     * @param args - The parameters for the request.
     * @param signal - An optional abort signal.
     * @returns Successful response without specific data.
     * @throws {ApiRequestError} When the API returns an error response.
     *
     * @see https://hyperliquid.gitbook.io/hyperliquid-docs/for-developers/api/exchange-endpoint#core-usdc-transfer
     * @example
     * ```ts
     * import * as hl from "@nktkas/hyperliquid";
     * import { privateKeyToAccount } from "viem/accounts";
     *
     * const wallet = privateKeyToAccount("0x...");
     * const transport = new hl.HttpTransport(); // or WebSocketTransport
     * const exchClient = new hl.ExchangeClient({ wallet, transport });
     *
     * const data = await exchClient.usdSend({ destination: "0x...", amount: "1" });
     * ```
     */
    async usdSend(args: UsdSendParameters, signal?: AbortSignal): Promise<SuccessResponse> {
        // Construct an action
        const action: UsdSendRequest["action"] = {
            ...args,
            type: "usdSend",
            hyperliquidChain: this._getHyperliquidChain(),
            signatureChainId: await this._getSignatureChainId(),
            time: await this.nonceManager(),
        };

        // Sign the action
        const signature = await signUserSignedAction({
            wallet: this.wallet,
            action,
            types: {
                "HyperliquidTransaction:UsdSend": [
                    { name: "hyperliquidChain", type: "string" },
                    { name: "destination", type: "string" },
                    { name: "amount", type: "string" },
                    { name: "time", type: "uint64" },
                ],
            },
            chainId: parseInt(action.signatureChainId, 16),
        });

        // Send a request
        return await this._request(
            { action, signature, nonce: action.time } satisfies UsdSendRequest,
            signal,
        ) as SuccessResponse;
    }

    /**
     * Distribute funds from a vault between followers.
     * @param args - The parameters for the request.
     * @param signal - An optional abort signal.
     * @returns Successful response without specific data.
     * @throws {ApiRequestError} When the API returns an error response.
     *
     * @see null - no documentation
     * @example
     * ```ts
     * import * as hl from "@nktkas/hyperliquid";
     * import { privateKeyToAccount } from "viem/accounts";
     *
     * const wallet = privateKeyToAccount("0x...");
     * const transport = new hl.HttpTransport(); // or WebSocketTransport
     * const exchClient = new hl.ExchangeClient({ wallet, transport });
     *
     * const data = await exchClient.vaultDistribute({ vaultAddress: "0x...", usd: 10 * 1e6 });
     * ```
     */
    async vaultDistribute(args: VaultDistributeParameters, signal?: AbortSignal): Promise<SuccessResponse> {
        // Construct an action
        const nonce = await this.nonceManager();
        const action = l1ActionSorter.vaultDistribute({ type: "vaultDistribute", ...args });

        // Sign the action
        const signature = await signL1Action({
            wallet: this.wallet,
            action,
            nonce,
            isTestnet: this.isTestnet,
        });

        // Send a request
        return await this._request(
            { action, signature, nonce } satisfies VaultDistributeRequest,
            signal,
        ) as SuccessResponse;
    }

    /**
     * Modify a vault's configuration.
     * @param args - The parameters for the request.
     * @param signal - An optional abort signal.
     * @returns Successful response without specific data.
     * @throws {ApiRequestError} When the API returns an error response.
     *
     * @see null - no documentation
     * @example
     * ```ts
     * import * as hl from "@nktkas/hyperliquid";
     * import { privateKeyToAccount } from "viem/accounts";
     *
     * const wallet = privateKeyToAccount("0x...");
     * const transport = new hl.HttpTransport(); // or WebSocketTransport
     * const exchClient = new hl.ExchangeClient({ wallet, transport });
     *
     * const data = await exchClient.vaultModify({
     *   vaultAddress: "0x...",
     *   allowDeposits: true,
     *   alwaysCloseOnWithdraw: false,
     * });
     * ```
     */
    async vaultModify(args: VaultModifyParameters, signal?: AbortSignal): Promise<SuccessResponse> {
        // Construct an action
        const nonce = await this.nonceManager();
        const action = l1ActionSorter.vaultModify({ type: "vaultModify", ...args });

        // Sign the action
        const signature = await signL1Action({
            wallet: this.wallet,
            action,
            nonce,
            isTestnet: this.isTestnet,
        });

        // Send a request
        return await this._request(
            { action, signature, nonce } satisfies VaultModifyRequest,
            signal,
        ) as SuccessResponse;
    }

    /**
     * Deposit or withdraw from a vault.
     * @param args - The parameters for the request.
     * @param signal - An optional abort signal.
     * @returns Successful response without specific data.
     * @throws {ApiRequestError} When the API returns an error response.
     *
     * @see https://hyperliquid.gitbook.io/hyperliquid-docs/for-developers/api/exchange-endpoint#deposit-or-withdraw-from-a-vault
     * @example
     * ```ts
     * import * as hl from "@nktkas/hyperliquid";
     * import { privateKeyToAccount } from "viem/accounts";
     *
     * const wallet = privateKeyToAccount("0x...");
     * const transport = new hl.HttpTransport(); // or WebSocketTransport
     * const exchClient = new hl.ExchangeClient({ wallet, transport });
     *
     * const data = await exchClient.vaultTransfer({
     *   vaultAddress: "0x...",
     *   isDeposit: true,
     *   usd: 10 * 1e6,
     * });
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
        const action = l1ActionSorter.vaultTransfer({ type: "vaultTransfer", ...actionArgs });

        // Sign the action
        const signature = await signL1Action({
            wallet: this.wallet,
            action,
            nonce,
            isTestnet: this.isTestnet,
            expiresAfter,
        });

        // Send a request
        return await this._request(
            { action, signature, nonce, expiresAfter } satisfies VaultTransferRequest,
            signal,
        ) as SuccessResponse;
    }

    /**
     * Initiate a withdrawal request.
     * @param args - The parameters for the request.
     * @param signal - An optional abort signal.
     * @returns Successful response without specific data.
     * @throws {ApiRequestError} When the API returns an error response.
     *
     * @see https://hyperliquid.gitbook.io/hyperliquid-docs/for-developers/api/exchange-endpoint#initiate-a-withdrawal-request
     * @example
     * ```ts
     * import * as hl from "@nktkas/hyperliquid";
     * import { privateKeyToAccount } from "viem/accounts";
     *
     * const wallet = privateKeyToAccount("0x...");
     * const transport = new hl.HttpTransport(); // or WebSocketTransport
     * const exchClient = new hl.ExchangeClient({ wallet, transport });
     *
     * const data = await exchClient.withdraw3({ destination: "0x...", amount: "1" });
     * ```
     */
    async withdraw3(args: Withdraw3Parameters, signal?: AbortSignal): Promise<SuccessResponse> {
        // Construct an action
        const action: Withdraw3Request["action"] = {
            ...args,
            type: "withdraw3",
            hyperliquidChain: this._getHyperliquidChain(),
            signatureChainId: await this._getSignatureChainId(),
            time: await this.nonceManager(),
        };

        // Sign the action
        const signature = await signUserSignedAction({
            wallet: this.wallet,
            action,
            types: {
                "HyperliquidTransaction:Withdraw": [
                    { name: "hyperliquidChain", type: "string" },
                    { name: "destination", type: "string" },
                    { name: "amount", type: "string" },
                    { name: "time", type: "uint64" },
                ],
            },
            chainId: parseInt(action.signatureChainId, 16),
        });

        // Send a request
        return await this._request(
            { action, signature, nonce: action.time } satisfies Withdraw3Request,
            signal,
        ) as SuccessResponse;
    }

    /** Send an API request and validate the response. */
    protected async _request(payload: BaseExchangeRequest, signal?: AbortSignal): Promise<
        | SuccessResponse
        | CancelResponseSuccess
        | CreateSubAccountResponse
        | CreateVaultResponse
        | OrderResponseSuccess
        | TwapOrderResponseSuccess
        | TwapCancelResponseSuccess
    > {
        const response = await this.transport.request<
            | SuccessResponse
            | ErrorResponse
            | CancelResponse
            | CreateSubAccountResponse
            | CreateVaultResponse
            | OrderResponse
            | TwapOrderResponse
            | TwapCancelResponse
        >("exchange", payload, signal);
        this._validateResponse(response);
        return response;
    }

    /** Guesses the chain ID based on the wallet type or the isTestnet flag. */
    protected async _guessSignatureChainId(): Promise<Hex> {
        // Trying to get chain ID of the wallet
        if (isAbstractViemWalletClient(this.wallet) || isAbstractExtendedViemWalletClient(this.wallet)) {
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
