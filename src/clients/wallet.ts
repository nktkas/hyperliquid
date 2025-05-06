import { type Hex, HyperliquidError, type IRequestTransport, type MaybePromise } from "../base.ts";
import type {
    ApproveAgentRequest,
    ApproveBuilderFeeRequest,
    BatchModifyRequest,
    CancelByCloidRequest,
    CancelRequest,
    CDepositRequest,
    ClaimRewardsRequest,
    CreateSubAccountRequest,
    CreateVaultRequest,
    CWithdrawRequest,
    EvmUserModifyRequest,
    ModifyRequest,
    OrderRequest,
    RegisterReferrerRequest,
    ReserveRequestWeightRequest,
    ScheduleCancelRequest,
    SetDisplayNameRequest,
    SetReferrerRequest,
    SpotDeployRequest_Genesis,
    SpotDeployRequest_RegisterHyperliquidity,
    SpotDeployRequest_RegisterSpot,
    SpotDeployRequest_RegisterToken2,
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
    BaseExchangeResponse,
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
    type AbstractEthersSigner,
    type AbstractEthersV5Signer,
    type AbstractExtendedViemWalletClient,
    type AbstractViemWalletClient,
    type AbstractWindowEthereum,
    isAbstractEthersSigner,
    isAbstractEthersV5Signer,
    isAbstractViemWalletClient,
    isAbstractWindowEthereum,
    signL1Action,
    signUserSignedAction,
} from "../signing.ts";

/** Parameters for the {@linkcode WalletClient} constructor. */
export interface WalletClientParameters<
    T extends IRequestTransport = IRequestTransport,
    W extends
        | AbstractViemWalletClient
        | AbstractEthersSigner
        | AbstractEthersV5Signer
        | AbstractExtendedViemWalletClient
        | AbstractWindowEthereum =
            | AbstractViemWalletClient
            | AbstractEthersSigner
            | AbstractEthersV5Signer
            | AbstractExtendedViemWalletClient
            | AbstractWindowEthereum,
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

/** Parameters for the {@linkcode WalletClient.approveAgent} method. */
export type ApproveAgentParameters = Omit<
    ApproveAgentRequest["action"],
    "type" | "hyperliquidChain" | "signatureChainId" | "nonce"
>;

/** Parameters for the {@linkcode WalletClient.approveBuilderFee} method. */
export type ApproveBuilderFeeParameters = Omit<
    ApproveBuilderFeeRequest["action"],
    "type" | "hyperliquidChain" | "signatureChainId" | "nonce"
>;

/** Parameters for the {@linkcode WalletClient.batchModify} method. */
export type BatchModifyParameters =
    & Omit<BatchModifyRequest["action"], "type">
    & Partial<Pick<BatchModifyRequest, "vaultAddress">>
    & Partial<Pick<BatchModifyRequest, "expiresAfter">>;

/** Parameters for the {@linkcode WalletClient.cancel} method. */
export type CancelParameters =
    & Omit<CancelRequest["action"], "type">
    & Partial<Pick<CancelRequest, "vaultAddress">>
    & Partial<Pick<CancelRequest, "expiresAfter">>;

/** Parameters for the {@linkcode WalletClient.cancelByCloid} method. */
export type CancelByCloidParameters =
    & Omit<CancelByCloidRequest["action"], "type">
    & Partial<Pick<CancelByCloidRequest, "vaultAddress">>
    & Partial<Pick<CancelByCloidRequest, "expiresAfter">>;

/** Parameters for the {@linkcode WalletClient.cDeposit} method. */
export type CDepositParameters = Omit<
    CDepositRequest["action"],
    "type" | "hyperliquidChain" | "signatureChainId" | "nonce"
>;

/** Parameters for the {@linkcode WalletClient.createSubAccount} method. */
export type CreateSubAccountParameters = Omit<
    CreateSubAccountRequest["action"],
    "type"
>;

/** Parameters for the {@linkcode WalletClient.createVault} method. */
export type CreateVaultParameters = Omit<
    CreateVaultRequest["action"],
    "type" | "nonce"
>;

/** Parameters for the {@linkcode WalletClient.cWithdraw} method. */
export type CWithdrawParameters = Omit<
    CWithdrawRequest["action"],
    "type" | "hyperliquidChain" | "signatureChainId" | "nonce"
>;

/** Parameters for the {@linkcode WalletClient.evmUserModify} method. */
export type EvmUserModifyParameters = Omit<
    EvmUserModifyRequest["action"],
    "type"
>;

/** Parameters for the {@linkcode WalletClient.modify} method. */
export type ModifyParameters =
    & Omit<ModifyRequest["action"], "type">
    & Partial<Pick<ModifyRequest, "vaultAddress">>
    & Partial<Pick<ModifyRequest, "expiresAfter">>;

/** Parameters for the {@linkcode WalletClient.order} method. */
export type OrderParameters =
    & Omit<OrderRequest["action"], "type">
    & Partial<Pick<OrderRequest, "vaultAddress">>
    & Partial<Pick<OrderRequest, "expiresAfter">>;

/** Parameters for the {@linkcode WalletClient.registerReferrer} method. */
export type RegisterReferrerParameters = Omit<RegisterReferrerRequest["action"], "type">;

/** Parameters for the {@linkcode WalletClient.reserveRequestWeight} method. */
export type ReserveRequestWeightParameters =
    & Omit<ReserveRequestWeightRequest["action"], "type">
    & Partial<Pick<ReserveRequestWeightRequest, "expiresAfter">>;

/** Parameters for the {@linkcode WalletClient.scheduleCancel} method. */
export type ScheduleCancelParameters =
    & Omit<ScheduleCancelRequest["action"], "type">
    & Partial<Pick<ScheduleCancelRequest, "vaultAddress">>
    & Partial<Pick<ScheduleCancelRequest, "expiresAfter">>;

/** Parameters for the {@linkcode WalletClient.setDisplayName} method. */
export type SetDisplayNameParameters = Omit<
    SetDisplayNameRequest["action"],
    "type"
>;

/** Parameters for the {@linkcode WalletClient.setReferrer} method. */
export type SetReferrerParameters = Omit<
    SetReferrerRequest["action"],
    "type"
>;

/** Parameters for the {@linkcode WalletClient.spotDeploy} method. */
export type SpotDeployParameters =
    | SpotDeployParameters_RegisterToken2
    | SpotDeployParameters_UserGenesis
    | SpotDeployParameters_Genesis
    | SpotDeployParameters_RegisterSpot
    | SpotDeployParameters_RegisterHyperliquidity;
/** One of the parameters for the {@linkcode WalletClient.spotDeploy} method. */
export type SpotDeployParameters_RegisterToken2 = Omit<
    SpotDeployRequest_RegisterToken2["action"],
    "type"
>;
/** One of the parameters for the {@linkcode WalletClient.spotDeploy} method. */
export type SpotDeployParameters_UserGenesis = Omit<
    SpotDeployRequest_UserGenesis["action"],
    "type"
>;
/** One of the parameters for the {@linkcode WalletClient.spotDeploy} method. */
export type SpotDeployParameters_Genesis = Omit<
    SpotDeployRequest_Genesis["action"],
    "type"
>;
/** One of the parameters for the {@linkcode WalletClient.spotDeploy} method. */
export type SpotDeployParameters_RegisterSpot = Omit<
    SpotDeployRequest_RegisterSpot["action"],
    "type"
>;
/** One of the parameters for the {@linkcode WalletClient.spotDeploy} method. */
export type SpotDeployParameters_RegisterHyperliquidity = Omit<
    SpotDeployRequest_RegisterHyperliquidity["action"],
    "type"
>;

/** Parameters for the {@linkcode WalletClient.spotSend} method. */
export type SpotSendParameters = Omit<
    SpotSendRequest["action"],
    "type" | "hyperliquidChain" | "signatureChainId" | "time"
>;

/** Parameters for the {@linkcode WalletClient.spotUser} method. */
export type SpotUserParameters = Omit<
    SpotUserRequest["action"],
    "type"
>;

/** Parameters for the {@linkcode WalletClient.subAccountSpotTransfer} method. */
export type SubAccountSpotTransferParameters = Omit<
    SubAccountSpotTransferRequest["action"],
    "type"
>;

/** Parameters for the {@linkcode WalletClient.subAccountTransfer} method. */
export type SubAccountTransferParameters = Omit<
    SubAccountTransferRequest["action"],
    "type"
>;

/** Parameters for the {@linkcode WalletClient.tokenDelegate} method. */
export type TokenDelegateParameters = Omit<
    TokenDelegateRequest["action"],
    "type" | "hyperliquidChain" | "signatureChainId" | "nonce"
>;

/** Parameters for the {@linkcode WalletClient.twapCancel} method. */
export type TwapCancelParameters =
    & Omit<TwapCancelRequest["action"], "type">
    & Partial<Pick<TwapCancelRequest, "vaultAddress">>
    & Partial<Pick<TwapCancelRequest, "expiresAfter">>;

/** Parameters for the {@linkcode WalletClient.twapOrder} method. */
export type TwapOrderParameters =
    & TwapOrderRequest["action"]["twap"]
    & Partial<Pick<TwapOrderRequest, "vaultAddress">>
    & Partial<Pick<TwapOrderRequest, "expiresAfter">>;

/** Parameters for the {@linkcode WalletClient.updateIsolatedMargin} method. */
export type UpdateIsolatedMarginParameters =
    & Omit<UpdateIsolatedMarginRequest["action"], "type">
    & Partial<Pick<UpdateIsolatedMarginRequest, "vaultAddress">>
    & Partial<Pick<UpdateIsolatedMarginRequest, "expiresAfter">>;

/** Parameters for the {@linkcode WalletClient.updateLeverage} method. */
export type UpdateLeverageParameters =
    & Omit<UpdateLeverageRequest["action"], "type">
    & Partial<Pick<UpdateLeverageRequest, "vaultAddress">>
    & Partial<Pick<UpdateLeverageRequest, "expiresAfter">>;

/** Parameters for the {@linkcode WalletClient.usdClassTransfer} method. */
export type UsdClassTransferParameters = Omit<
    UsdClassTransferRequest["action"],
    "type" | "hyperliquidChain" | "signatureChainId" | "nonce"
>;

/** Parameters for the {@linkcode WalletClient.usdSend} method. */
export type UsdSendParameters = Omit<
    UsdSendRequest["action"],
    "type" | "hyperliquidChain" | "signatureChainId" | "time"
>;

/** Parameters for the {@linkcode WalletClient.vaultDistribute} method. */
export type VaultDistributeParameters = Omit<
    VaultDistributeRequest["action"],
    "type"
>;

/** Parameters for the {@linkcode WalletClient.vaultModify} method. */
export type VaultModifyParameters = Omit<
    VaultModifyRequest["action"],
    "type"
>;

/** Parameters for the {@linkcode WalletClient.vaultTransfer} method. */
export type VaultTransferParameters =
    & Omit<VaultTransferRequest["action"], "type">
    & Partial<Pick<VaultTransferRequest, "expiresAfter">>;

/** Parameters for the {@linkcode WalletClient.withdraw3} method. */
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
 * Wallet client for interacting with the Hyperliquid API.
 * @typeParam T The transport used to connect to the Hyperliquid API.
 * @typeParam W The WalletClient/Account ([viem](https://viem.sh/docs/clients/wallet)) or Signer ([ethers.js](https://docs.ethers.io/v6/api/providers/#Signer)) used for signing transactions.
 */
export class WalletClient<
    T extends IRequestTransport = IRequestTransport,
    W extends
        | AbstractViemWalletClient
        | AbstractEthersSigner
        | AbstractEthersV5Signer
        | AbstractExtendedViemWalletClient
        | AbstractWindowEthereum =
            | AbstractViemWalletClient
            | AbstractEthersSigner
            | AbstractEthersV5Signer
            | AbstractExtendedViemWalletClient
            | AbstractWindowEthereum,
> {
    /** The transport used to connect to the Hyperliquid API. */
    transport: T;

    /** The `viem`, `ethers.js`, or `window.ethereum` wallet used for signing transactions. */
    wallet: W;

    /** Specifies whether the client uses testnet. */
    isTestnet: boolean;

    /** Sets a default vaultAddress to be used if no vaultAddress is explicitly passed to a method. */
    defaultVaultAddress?: Hex;

    /** Sets a default expiresAfter to be used if no expiresAfter is explicitly passed to a method. */
    defaultExpiresAfter?: number | (() => MaybePromise<number>);

    /**
     * The network that will be used to sign transactions.
     * Must match the network of the {@link wallet}.
     */
    signatureChainId: Hex | (() => MaybePromise<Hex>);

    /** Function to get the next nonce for signing transactions. */
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
     * const client = new hl.WalletClient({ wallet, transport });
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
     * const client = new hl.WalletClient({ wallet, transport });
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
     * const client = new hl.WalletClient({ wallet, transport });
     * ```
     *
     * @example External wallet (e.g. MetaMask) via `window.ethereum` directly
     * ```ts
     * import * as hl from "@nktkas/hyperliquid";
     *
     * const transport = new hl.HttpTransport(); // or WebSocketTransport
     * const client = new hl.WalletClient({ wallet: window.ethereum, transport });
     * ```
     */
    constructor(args: WalletClientParameters<T, W>) {
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
     * const client = new hl.WalletClient({ wallet, transport });
     *
     * const result = await client.approveAgent({ agentAddress: "0x...", agentName: "agentName" });
     * ```
     */
    async approveAgent(args: ApproveAgentParameters, signal?: AbortSignal): Promise<SuccessResponse> {
        // Construct an action
        const action: ApproveAgentRequest["action"] = {
            ...args,
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

        // Send a request
        const request: ApproveAgentRequest = { action, signature, nonce: action.nonce };
        const response = await this.transport.request("exchange", request, signal) as ErrorResponse | SuccessResponse;

        // Validate a response
        this._validateResponse(response);
        return response;
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
     * const client = new hl.WalletClient({ wallet, transport });
     *
     * const result = await client.approveBuilderFee({ maxFeeRate: "0.01%", builder: "0x..." });
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
        const request: ApproveBuilderFeeRequest = { action, signature, nonce: action.nonce };
        const response = await this.transport.request("exchange", request, signal) as ErrorResponse | SuccessResponse;

        // Validate a response
        this._validateResponse(response);
        return response;
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
     * const client = new hl.WalletClient({ wallet, transport });
     *
     * const result = await client.batchModify({
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
        const action: BatchModifyRequest["action"] = {
            type: "batchModify",
            modifies: actionArgs.modifies.map((modify) => {
                const sortedModify = {
                    oid: modify.oid,
                    order: {
                        a: modify.order.a,
                        b: modify.order.b,
                        p: this._formatDecimal(modify.order.p),
                        s: this._formatDecimal(modify.order.s),
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
                                    triggerPx: this._formatDecimal(modify.order.t.trigger.triggerPx),
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
        const request: BatchModifyRequest = { action, signature, nonce, vaultAddress, expiresAfter };
        const response = await this.transport.request("exchange", request, signal) as OrderResponse;

        // Validate a response
        this._validateResponse(response);
        return response;
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
     * const client = new hl.WalletClient({ wallet, transport });
     *
     * const result = await client.cancel({
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
        const action: CancelRequest["action"] = {
            type: "cancel",
            cancels: actionArgs.cancels.map((cancel) => ({
                a: cancel.a,
                o: cancel.o,
            })),
        };

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
        const request: CancelRequest = { action, signature, nonce, vaultAddress, expiresAfter };
        const response = await this.transport.request("exchange", request, signal) as CancelResponse;

        // Validate a response
        this._validateResponse(response);
        return response;
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
     * const client = new hl.WalletClient({ wallet, transport });
     *
     * const result = await client.cancelByCloid({
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
        const action: CancelByCloidRequest["action"] = {
            type: "cancelByCloid",
            cancels: actionArgs.cancels.map((cancel) => ({
                asset: cancel.asset,
                cloid: cancel.cloid,
            })),
        };

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
        const request: CancelByCloidRequest = { action, signature, nonce, vaultAddress, expiresAfter };
        const response = await this.transport.request("exchange", request, signal) as CancelResponse;

        // Validate a response
        this._validateResponse(response);
        return response;
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
     * const client = new hl.WalletClient({ wallet, transport });
     *
     * const result = await client.cDeposit({ wei: 1 * 1e8 });
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
        const request: CDepositRequest = { action, signature, nonce: action.nonce };
        const response = await this.transport.request("exchange", request, signal) as ErrorResponse | SuccessResponse;

        // Validate a response
        this._validateResponse(response);
        return response;
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
     * const client = new hl.WalletClient({ wallet, transport });
     *
     * const result = await client.claimRewards();
     * ```
     */
    async claimRewards(signal?: AbortSignal): Promise<SuccessResponse> {
        // Construct an action
        const nonce = await this.nonceManager();
        const sortedAction: ClaimRewardsRequest["action"] = { type: "claimRewards" };

        // Sign the action
        const signature = await signL1Action({
            wallet: this.wallet,
            action: sortedAction,
            nonce,
            isTestnet: this.isTestnet,
        });

        // Send a request
        const request: ClaimRewardsRequest = { action: sortedAction, signature, nonce };
        const response = await this.transport.request("exchange", request, signal) as ErrorResponse | SuccessResponse;

        // Validate a response
        this._validateResponse(response);
        return response;
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
     * const client = new hl.WalletClient({ wallet, transport });
     *
     * const result = await client.createSubAccount({ name: "subAccountName" });
     * ```
     */
    async createSubAccount(args: CreateSubAccountParameters, signal?: AbortSignal): Promise<CreateSubAccountResponse> {
        // Construct an action
        const nonce = await this.nonceManager();
        const action: CreateSubAccountRequest["action"] = {
            type: "createSubAccount",
            name: args.name,
        };

        // Sign the action
        const signature = await signL1Action({
            wallet: this.wallet,
            action,
            nonce,
            isTestnet: this.isTestnet,
        });

        // Send a request
        const request: CreateSubAccountRequest = { action, signature, nonce };
        const response = await this.transport.request("exchange", request, signal) as
            | ErrorResponse
            | CreateSubAccountResponse;

        // Validate a response
        this._validateResponse(response);
        return response;
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
     * const client = new hl.WalletClient({ wallet, transport });
     *
     * const result = await client.createVault({
     *   name: "VaultName",
     *   description: "This is an example of a vault description",
     *   initialUsd: 100 * 1e6,
     * });
     * ```
     */
    async createVault(args: CreateVaultParameters, signal?: AbortSignal): Promise<CreateVaultResponse> {
        // Construct an action
        const nonce = await this.nonceManager();
        const action: CreateVaultRequest["action"] = {
            type: "createVault",
            name: args.name,
            description: args.description,
            initialUsd: args.initialUsd,
            nonce,
        };

        // Sign the action
        const signature = await signL1Action({
            wallet: this.wallet,
            action,
            nonce,
            isTestnet: this.isTestnet,
        });

        // Send a request
        const request: CreateVaultRequest = { action, signature, nonce };
        const response = await this.transport.request("exchange", request, signal) as
            | ErrorResponse
            | CreateVaultResponse;

        // Validate a response
        this._validateResponse(response);
        return response;
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
     * const client = new hl.WalletClient({ wallet, transport });
     *
     * const result = await client.cWithdraw({ wei: 1 * 1e8 });
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
        const request: CWithdrawRequest = { action, signature, nonce: action.nonce };
        const response = await this.transport.request("exchange", request, signal) as ErrorResponse | SuccessResponse;

        // Validate a response
        this._validateResponse(response);
        return response;
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
     * const client = new hl.WalletClient({ wallet, transport });
     *
     * const result = await client.evmUserModify({ usingBigBlocks: true });
     * ```
     */
    async evmUserModify(args: EvmUserModifyParameters, signal?: AbortSignal): Promise<SuccessResponse> {
        // Construct an action
        const nonce = await this.nonceManager();
        const action: EvmUserModifyRequest["action"] = {
            type: "evmUserModify",
            usingBigBlocks: args.usingBigBlocks,
        };

        // Sign the action
        const signature = await signL1Action({
            wallet: this.wallet,
            action,
            nonce,
            isTestnet: this.isTestnet,
        });

        // Send a request
        const request: EvmUserModifyRequest = { action, signature, nonce };
        const response = await this.transport.request("exchange", request, signal) as ErrorResponse | SuccessResponse;

        // Validate a response
        this._validateResponse(response);
        return response;
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
     * const client = new hl.WalletClient({ wallet, transport });
     *
     * const result = await client.modify({
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
        const action: ModifyRequest["action"] = {
            type: "modify",
            oid: actionArgs.oid,
            order: {
                a: actionArgs.order.a,
                b: actionArgs.order.b,
                p: this._formatDecimal(actionArgs.order.p),
                s: this._formatDecimal(actionArgs.order.s),
                r: actionArgs.order.r,
                t: "limit" in actionArgs.order.t
                    ? {
                        limit: {
                            tif: actionArgs.order.t.limit.tif,
                        },
                    }
                    : {
                        trigger: {
                            isMarket: actionArgs.order.t.trigger.isMarket,
                            triggerPx: this._formatDecimal(actionArgs.order.t.trigger.triggerPx),
                            tpsl: actionArgs.order.t.trigger.tpsl,
                        },
                    },
                c: actionArgs.order.c,
            },
        };
        if (action.order.c === undefined) delete action.order.c;

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
        const request: ModifyRequest = { action, signature, nonce, vaultAddress, expiresAfter };
        const response = await this.transport.request("exchange", request, signal) as ErrorResponse | SuccessResponse;

        // Validate a response
        this._validateResponse(response);
        return response;
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
     * const client = new hl.WalletClient({ wallet, transport });
     *
     * const result = await client.order({
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
        const action: OrderRequest["action"] = {
            type: "order",
            orders: actionArgs.orders.map((order) => {
                const sortedOrder = {
                    a: order.a,
                    b: order.b,
                    p: this._formatDecimal(order.p),
                    s: this._formatDecimal(order.s),
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
                                triggerPx: this._formatDecimal(order.t.trigger.triggerPx),
                                tpsl: order.t.trigger.tpsl,
                            },
                        },
                    c: order.c,
                };
                if (order.c === undefined) delete sortedOrder.c;
                return sortedOrder;
            }),
            grouping: actionArgs.grouping,
            builder: actionArgs.builder
                ? {
                    b: actionArgs.builder.b.toLowerCase() as `0x${string}`,
                    f: actionArgs.builder.f,
                }
                : actionArgs.builder,
        };
        if (action.builder === undefined) delete action.builder;

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
        const request: OrderRequest = { action, signature, nonce, vaultAddress, expiresAfter };
        const response = await this.transport.request("exchange", request, signal) as OrderResponse;

        // Validate a response
        this._validateResponse(response);
        return response;
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
     * const client = new hl.WalletClient({ wallet, transport });
     *
     * const result = await client.registerReferrer({ code: "TEST" });
     * ```
     */
    async registerReferrer(args: RegisterReferrerParameters, signal?: AbortSignal): Promise<SuccessResponse> {
        // Construct an action
        const nonce = await this.nonceManager();
        const action: RegisterReferrerRequest["action"] = {
            type: "registerReferrer",
            code: args.code,
        };

        // Sign the action
        const signature = await signL1Action({
            wallet: this.wallet,
            action,
            nonce,
            isTestnet: this.isTestnet,
        });

        // Send a request
        const request: RegisterReferrerRequest = { action, signature, nonce };
        const response = await this.transport.request("exchange", request, signal) as ErrorResponse | SuccessResponse;

        // Validate a response
        this._validateResponse(response);
        return response;
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
     * const client = new hl.WalletClient({ wallet, transport });
     *
     * const result = await client.reserveRequestWeight({ weight: 10 });
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
        const action: ReserveRequestWeightRequest["action"] = {
            type: "reserveRequestWeight",
            weight: actionArgs.weight,
        };

        // Sign the action
        const signature = await signL1Action({
            wallet: this.wallet,
            action,
            nonce,
            isTestnet: this.isTestnet,
            expiresAfter,
        });

        // Send a request
        const request: ReserveRequestWeightRequest = { action, signature, nonce, expiresAfter };
        const response = await this.transport.request("exchange", request, signal) as ErrorResponse | SuccessResponse;

        // Validate a response
        this._validateResponse(response);
        return response;
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
     * const client = new hl.WalletClient({ wallet, transport });
     *
     * const result = await client.scheduleCancel({ time: Date.now() + 3600000 });
     * ```
     */
    async scheduleCancel(args: ScheduleCancelParameters = {}, signal?: AbortSignal): Promise<SuccessResponse> {
        // Destructure the parameters
        const {
            vaultAddress = this.defaultVaultAddress,
            expiresAfter = await this._getDefaultExpiresAfter(),
            ...actionArgs
        } = args;

        // Construct an action
        const nonce = await this.nonceManager();
        const action: ScheduleCancelRequest["action"] = {
            type: "scheduleCancel",
            time: actionArgs.time,
        };
        if (action.time === undefined) delete action.time;

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
        const request: ScheduleCancelRequest = { action, signature, nonce, vaultAddress, expiresAfter };
        const response = await this.transport.request("exchange", request, signal) as ErrorResponse | SuccessResponse;

        // Validate a response
        this._validateResponse(response);
        return response;
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
     * const client = new hl.WalletClient({ wallet, transport });
     *
     * const result = await client.setDisplayName({ displayName: "My Name" });
     * ```
     */
    async setDisplayName(args: SetDisplayNameParameters, signal?: AbortSignal): Promise<SuccessResponse> {
        // Construct an action
        const nonce = await this.nonceManager();
        const action: SetDisplayNameRequest["action"] = {
            type: "setDisplayName",
            displayName: args.displayName,
        };

        // Sign the action
        const signature = await signL1Action({
            wallet: this.wallet,
            action,
            nonce,
            isTestnet: this.isTestnet,
        });

        // Send a request
        const request: SetDisplayNameRequest = { action, signature, nonce };
        const response = await this.transport.request("exchange", request, signal) as ErrorResponse | SuccessResponse;

        // Validate a response
        this._validateResponse(response);
        return response;
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
     * const client = new hl.WalletClient({ wallet, transport });
     *
     * const result = await client.setReferrer({ code: "TEST" });
     * ```
     */
    async setReferrer(args: SetReferrerParameters, signal?: AbortSignal): Promise<SuccessResponse> {
        // Construct an action
        const nonce = await this.nonceManager();
        const action: SetReferrerRequest["action"] = {
            type: "setReferrer",
            code: args.code,
        };

        // Sign the action
        const signature = await signL1Action({
            wallet: this.wallet,
            action,
            nonce,
            isTestnet: this.isTestnet,
        });

        // Send a request
        const request: SetReferrerRequest = { action, signature, nonce };
        const response = await this.transport.request("exchange", request, signal) as ErrorResponse | SuccessResponse;

        // Validate a response
        this._validateResponse(response);
        return response;
    }

    /**
     * Deploying HIP-1 and HIP-2 assets.
     * @param args - The parameters for the request.
     * @param signal - An optional abort signal.
     * @returns Successful response without specific data.
     * @throws {ApiRequestError} When the API returns an error response.
     * @untested
     *
     * @see https://hyperliquid.gitbook.io/hyperliquid-docs/for-developers/api/deploying-hip-1-and-hip-2-assets
     * @example
     * ```ts
     * import * as hl from "@nktkas/hyperliquid";
     * import { privateKeyToAccount } from "viem/accounts";
     *
     * const wallet = privateKeyToAccount("0x...");
     * const transport = new hl.HttpTransport(); // or WebSocketTransport
     * const client = new hl.WalletClient({ wallet, transport });
     *
     * const result = await client.spotDeploy({
     *   registerToken2: {
     *     spec: {
     *       name: "TestToken",
     *       szDecimals: 8,
     *       weiDecimals: 8,
     *     },
     *     maxGas: 1000000,
     *     fullName: "TestToken (TT)"
     *   }
     * });
     * ```
     */
    async spotDeploy(args: SpotDeployParameters, signal?: AbortSignal): Promise<BaseExchangeResponse> {
        // Construct an action
        const nonce = await this.nonceManager();
        let action:
            | SpotDeployRequest_RegisterToken2["action"]
            | SpotDeployRequest_UserGenesis["action"]
            | SpotDeployRequest_Genesis["action"]
            | SpotDeployRequest_RegisterSpot["action"]
            | SpotDeployRequest_RegisterHyperliquidity["action"];
        if ("registerToken2" in args) {
            action = {
                type: "spotDeploy",
                registerToken2: {
                    spec: {
                        name: args.registerToken2.spec.name,
                        szDecimals: args.registerToken2.spec.szDecimals,
                        weiDecimals: args.registerToken2.spec.weiDecimals,
                    },
                    maxGas: args.registerToken2.maxGas,
                    fullName: args.registerToken2.fullName,
                },
            };
        } else if ("userGenesis" in args) {
            action = {
                type: "spotDeploy",
                userGenesis: {
                    token: args.userGenesis.token,
                    userAndWei: args.userGenesis.userAndWei,
                    existingTokenAndWei: args.userGenesis.existingTokenAndWei,
                },
            };
        } else if ("genesis" in args) {
            action = {
                type: "spotDeploy",
                genesis: {
                    token: args.genesis.token,
                    maxSupply: args.genesis.maxSupply,
                },
            };
        } else if ("registerSpot" in args) {
            action = {
                type: "spotDeploy",
                registerSpot: {
                    tokens: args.registerSpot.tokens,
                },
            };
        } else {
            action = {
                type: "spotDeploy",
                registerHyperliquidity: {
                    spot: args.registerHyperliquidity.spot,
                    startPx: args.registerHyperliquidity.startPx,
                    orderSz: args.registerHyperliquidity.orderSz,
                    nOrders: args.registerHyperliquidity.nOrders,
                    nSeededLevels: args.registerHyperliquidity.nSeededLevels,
                },
            };
        }

        // Sign the action
        const signature = await signL1Action({
            wallet: this.wallet,
            action,
            nonce,
            isTestnet: this.isTestnet,
        });

        // Send a request
        const request = { action, signature, nonce } as
            | SpotDeployRequest_RegisterToken2
            | SpotDeployRequest_UserGenesis
            | SpotDeployRequest_Genesis
            | SpotDeployRequest_RegisterSpot
            | SpotDeployRequest_RegisterHyperliquidity;
        const response = await this.transport.request("exchange", request, signal) as ErrorResponse | SuccessResponse;

        // Validate a response
        this._validateResponse(response);
        return response;
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
     * const client = new hl.WalletClient({ wallet, transport });
     *
     * const result = await client.spotSend({
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
        const request: SpotSendRequest = { action, signature, nonce: action.time };
        const response = await this.transport.request("exchange", request, signal) as ErrorResponse | SuccessResponse;

        // Validate a response
        this._validateResponse(response);
        return response;
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
     * const client = new hl.WalletClient({ wallet, transport });
     *
     * const result = await client.spotUser({ toggleSpotDusting: { optOut: false } });
     * ```
     */
    async spotUser(args: SpotUserParameters, signal?: AbortSignal): Promise<SuccessResponse> {
        // Construct an action
        const nonce = await this.nonceManager();
        const action: SpotUserRequest["action"] = {
            type: "spotUser",
            toggleSpotDusting: {
                optOut: args.toggleSpotDusting.optOut,
            },
        };

        // Sign the action
        const signature = await signL1Action({
            wallet: this.wallet,
            action,
            nonce,
            isTestnet: this.isTestnet,
        });

        // Send a request
        const request: SpotUserRequest = { action, signature, nonce };
        const response = await this.transport.request("exchange", request, signal) as ErrorResponse | SuccessResponse;

        // Validate a response
        this._validateResponse(response);
        return response;
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
     * const client = new hl.WalletClient({ wallet, transport });
     *
     * const result = await client.subAccountSpotTransfer({
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
        const action: SubAccountSpotTransferRequest["action"] = {
            type: "subAccountSpotTransfer",
            subAccountUser: args.subAccountUser,
            isDeposit: args.isDeposit,
            token: args.token,
            amount: args.amount,
        };

        // Sign the action
        const signature = await signL1Action({
            wallet: this.wallet,
            action,
            nonce,
            isTestnet: this.isTestnet,
        });

        // Send a request
        const request: SubAccountSpotTransferRequest = { action, signature, nonce };
        const response = await this.transport.request("exchange", request, signal) as ErrorResponse | SuccessResponse;

        // Validate a response
        this._validateResponse(response);
        return response;
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
     * const client = new hl.WalletClient({ wallet, transport });
     *
     * const result = await client.subAccountTransfer({
     *   subAccountUser: "0x...",
     *   isDeposit: true,
     *   usd: 1 * 1e6,
     * });
     * ```
     */
    async subAccountTransfer(args: SubAccountTransferParameters, signal?: AbortSignal): Promise<SuccessResponse> {
        // Construct an action
        const nonce = await this.nonceManager();
        const action: SubAccountTransferRequest["action"] = {
            type: "subAccountTransfer",
            subAccountUser: args.subAccountUser,
            isDeposit: args.isDeposit,
            usd: args.usd,
        };

        // Sign the action
        const signature = await signL1Action({
            wallet: this.wallet,
            action,
            nonce,
            isTestnet: this.isTestnet,
        });

        // Send a request
        const request: SubAccountTransferRequest = { action, signature, nonce };
        const response = await this.transport.request("exchange", request, signal) as ErrorResponse | SuccessResponse;

        // Validate a response
        this._validateResponse(response);
        return response;
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
     * const client = new hl.WalletClient({ wallet, transport });
     *
     * const result = await client.tokenDelegate({
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
        const request: TokenDelegateRequest = { action, signature, nonce: action.nonce };
        const response = await this.transport.request("exchange", request, signal) as ErrorResponse | SuccessResponse;

        // Validate a response
        this._validateResponse(response);
        return response;
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
     * const client = new hl.WalletClient({ wallet, transport });
     *
     * const result = await client.twapCancel({
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
        const action: TwapCancelRequest["action"] = {
            type: "twapCancel",
            a: actionArgs.a,
            t: actionArgs.t,
        };

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
        const request: TwapCancelRequest = { action, signature, nonce, vaultAddress, expiresAfter };
        const response = await this.transport.request("exchange", request, signal) as TwapCancelResponse;

        // Validate a response
        this._validateResponse(response);
        return response;
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
     * const client = new hl.WalletClient({ wallet, transport });
     *
     * const result = await client.twapOrder({
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
        const action: TwapOrderRequest["action"] = {
            type: "twapOrder",
            twap: {
                a: actionArgs.a,
                b: actionArgs.b,
                s: this._formatDecimal(actionArgs.s),
                r: actionArgs.r,
                m: actionArgs.m,
                t: actionArgs.t,
            },
        };

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
        const request: TwapOrderRequest = { action, signature, nonce, vaultAddress, expiresAfter };
        const response = await this.transport.request("exchange", request, signal) as TwapOrderResponse;

        // Validate a response
        this._validateResponse(response);
        return response;
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
     * const client = new hl.WalletClient({ wallet, transport });
     *
     * const result = await client.updateIsolatedMargin({ asset: 0, isBuy: true, ntli: 1 * 1e6 });
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
        const action: UpdateIsolatedMarginRequest["action"] = {
            type: "updateIsolatedMargin",
            asset: actionArgs.asset,
            isBuy: actionArgs.isBuy,
            ntli: actionArgs.ntli,
        };

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
        const request: UpdateIsolatedMarginRequest = { action, signature, nonce, vaultAddress, expiresAfter };
        const response = await this.transport.request("exchange", request, signal) as ErrorResponse | SuccessResponse;

        // Validate a response
        this._validateResponse(response);
        return response;
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
     * const client = new hl.WalletClient({ wallet, transport });
     *
     * const result = await client.updateLeverage({ asset: 0, isCross: true, leverage: 5 });
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
        const action: UpdateLeverageRequest["action"] = {
            type: "updateLeverage",
            asset: actionArgs.asset,
            isCross: actionArgs.isCross,
            leverage: actionArgs.leverage,
        };

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
        const request: UpdateLeverageRequest = { action, signature, nonce, vaultAddress, expiresAfter };
        const response = await this.transport.request("exchange", request, signal) as ErrorResponse | SuccessResponse;

        // Validate a response
        this._validateResponse(response);
        return response;
    }

    /**
     * Transfer funds between Spot and Perp accounts.
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
     * const client = new hl.WalletClient({ wallet, transport });
     *
     * const result = await client.usdClassTransfer({ amount: "1", toPerp: true });
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
        const request: UsdClassTransferRequest = { action, signature, nonce: action.nonce };
        const response = await this.transport.request("exchange", request, signal) as ErrorResponse | SuccessResponse;

        // Validate a response
        this._validateResponse(response);
        return response;
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
     * const client = new hl.WalletClient({ wallet, transport });
     *
     * const result = await client.usdSend({ destination: "0x...", amount: "1" });
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
        const request: UsdSendRequest = { action, signature, nonce: action.time };
        const response = await this.transport.request("exchange", request, signal) as ErrorResponse | SuccessResponse;

        // Validate a response
        this._validateResponse(response);
        return response;
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
     * const client = new hl.WalletClient({ wallet, transport });
     *
     * const result = await client.vaultDistribute({ vaultAddress: "0x...", usd: 10 * 1e6 });
     * ```
     */
    async vaultDistribute(args: VaultDistributeParameters, signal?: AbortSignal): Promise<SuccessResponse> {
        // Construct an action
        const nonce = await this.nonceManager();
        const action: VaultDistributeRequest["action"] = {
            type: "vaultDistribute",
            vaultAddress: args.vaultAddress,
            usd: args.usd,
        };

        // Sign the action
        const signature = await signL1Action({
            wallet: this.wallet,
            action,
            nonce,
            isTestnet: this.isTestnet,
        });

        // Send a request
        const request: VaultDistributeRequest = { action, signature, nonce };
        const response = await this.transport.request("exchange", request, signal) as ErrorResponse | SuccessResponse;

        // Validate a response
        this._validateResponse(response);
        return response;
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
     * const client = new hl.WalletClient({ wallet, transport });
     *
     * const result = await client.vaultModify({
     *   vaultAddress: "0x...",
     *   allowDeposits: true,
     *   alwaysCloseOnWithdraw: false,
     * });
     * ```
     */
    async vaultModify(args: VaultModifyParameters, signal?: AbortSignal): Promise<SuccessResponse> {
        // Construct an action
        const nonce = await this.nonceManager();
        const action: VaultModifyRequest["action"] = {
            type: "vaultModify",
            vaultAddress: args.vaultAddress,
            allowDeposits: args.allowDeposits,
            alwaysCloseOnWithdraw: args.alwaysCloseOnWithdraw,
        };

        // Sign the action
        const signature = await signL1Action({
            wallet: this.wallet,
            action,
            nonce,
            isTestnet: this.isTestnet,
        });

        // Send a request
        const request: VaultModifyRequest = { action, signature, nonce };
        const response = await this.transport.request("exchange", request, signal) as ErrorResponse | SuccessResponse;

        // Validate a response
        this._validateResponse(response);
        return response;
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
     * const client = new hl.WalletClient({ wallet, transport });
     *
     * const result = await client.vaultTransfer({
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
        const action: VaultTransferRequest["action"] = {
            type: "vaultTransfer",
            vaultAddress: actionArgs.vaultAddress,
            isDeposit: actionArgs.isDeposit,
            usd: actionArgs.usd,
        };

        // Sign the action
        const signature = await signL1Action({
            wallet: this.wallet,
            action,
            nonce,
            isTestnet: this.isTestnet,
            expiresAfter,
        });

        // Send a request
        const request: VaultTransferRequest = { action, signature, nonce, expiresAfter };
        const response = await this.transport.request("exchange", request, signal) as ErrorResponse | SuccessResponse;

        // Validate a response
        this._validateResponse(response);
        return response;
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
     * const client = new hl.WalletClient({ wallet, transport });
     *
     * const result = await client.withdraw3({ destination: "0x...", amount: "1" });
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
        const request: Withdraw3Request = { action, signature, nonce: action.time };
        const response = await this.transport.request("exchange", request, signal) as ErrorResponse | SuccessResponse;

        // Validate a response
        this._validateResponse(response);
        return response;
    }

    /** Formats a decimal number as a string, removing trailing zeros. */
    protected _formatDecimal(numStr: string): string {
        if (!numStr.includes(".")) return numStr;

        const [intPart, fracPart] = numStr.split(".");
        const newFrac = fracPart.replace(/0+$/, "");

        return newFrac ? `${intPart}.${newFrac}` : intPart;
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
}
