import { type Hex, HyperliquidError, type IRequestTransport } from "../base.ts";
import type {
    ApproveAgentRequest,
    ApproveBuilderFeeRequest,
    BatchModifyRequest,
    CancelByCloidRequest,
    CancelRequest,
    CDepositRequest,
    ClaimRewardsRequest,
    CreateSubAccountRequest,
    CWithdrawRequest,
    EvmUserModifyRequest,
    ModifyRequest,
    OrderRequest,
    ScheduleCancelRequest,
    SetDisplayNameRequest,
    SetReferrerRequest,
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
    ErrorResponse,
    OrderResponse,
    SuccessResponse,
    TwapCancelResponse,
    TwapOrderResponse,
} from "../types/exchange/responses.ts";
import {
    type AbstractEthersSigner,
    type AbstractEthersV5Signer,
    type AbstractViemWalletClient,
    signL1Action,
    signUserSignedAction,
} from "../signing.ts";

// ——————————————— Parameters ———————————————

/** Parameters for the {@linkcode WalletClient} constructor. */
export interface WalletClientParameters<
    T extends IRequestTransport = IRequestTransport,
    W extends AbstractViemWalletClient | AbstractEthersSigner | AbstractEthersV5Signer =
        | AbstractViemWalletClient
        | AbstractEthersSigner
        | AbstractEthersV5Signer,
> {
    /** The transport used to connect to the Hyperliquid API. */
    transport: T;
    /** The WalletClient/Account ([viem](https://viem.sh/docs/clients/wallet)) or Signer ([ethers.js](https://docs.ethers.org/v6/api/providers/#Signer)) used for signing transactions. */
    wallet: W;
    /**
     * Specifies whether the client uses testnet.
     *
     * Defaults to `false`.
     */
    isTestnet?: boolean;
    /** Sets a default vaultAddress to be used if no vaultAddress is explicitly passed to a method. */
    defaultVaultAddress?: Hex;
    /**
     * The network that will be used to sign transactions.
     * Must match the network of the {@link wallet}.
     *
     * Defaults to `0xa4b1` for `isTestnet = false` or `0x66eee` for `isTestnet = true`.
     */
    signatureChainId?: Hex;
}

/** Parameters for the {@linkcode WalletClient.approveAgent} method. */
export type ApproveAgentParameters =
    & Omit<ApproveAgentRequest["action"], "type" | "hyperliquidChain" | "signatureChainId" | "nonce">
    & Partial<Pick<ApproveAgentRequest["action"], "nonce">>;

/** Parameters for the {@linkcode WalletClient.approveBuilderFee} method. */
export type ApproveBuilderFeeParameters =
    & Omit<ApproveBuilderFeeRequest["action"], "type" | "hyperliquidChain" | "signatureChainId" | "nonce">
    & Partial<Pick<ApproveBuilderFeeRequest["action"], "nonce">>;

/** Parameters for the {@linkcode WalletClient.batchModify} method. */
export type BatchModifyParameters =
    & Omit<BatchModifyRequest["action"], "type">
    & Partial<Pick<BatchModifyRequest, "vaultAddress" | "nonce">>;

/** Parameters for the {@linkcode WalletClient.cancel} method. */
export type CancelParameters =
    & Omit<CancelRequest["action"], "type">
    & Partial<Pick<CancelRequest, "vaultAddress" | "nonce">>;

/** Parameters for the {@linkcode WalletClient.cDeposit} method. */
export type CDepositParameters =
    & Omit<CDepositRequest["action"], "type" | "hyperliquidChain" | "signatureChainId" | "nonce">
    & Partial<Pick<CDepositRequest["action"], "nonce">>;

/** Parameters for the {@linkcode WalletClient.claimRewards} method. */
export type ClaimRewardsParameters =
    & Omit<ClaimRewardsRequest["action"], "type">
    & Partial<Pick<ClaimRewardsRequest, "nonce">>;

/** Parameters for the {@linkcode WalletClient.cancelByCloid} method. */
export type CancelByCloidParameters =
    & Omit<CancelByCloidRequest["action"], "type">
    & Partial<Pick<CancelByCloidRequest, "vaultAddress" | "nonce">>;

/** Parameters for the {@linkcode WalletClient.cWithdraw} method. */
export type CWithdrawParameters =
    & Omit<CWithdrawRequest["action"], "type" | "hyperliquidChain" | "signatureChainId" | "nonce">
    & Partial<Pick<CWithdrawRequest["action"], "nonce">>;

/** Parameters for the {@linkcode WalletClient.evmUserModify} method. */
export type EvmUserModifyParameters =
    & Omit<EvmUserModifyRequest["action"], "type">
    & Partial<Pick<EvmUserModifyRequest, "nonce">>;

/** Parameters for the {@linkcode WalletClient.createSubAccount} method. */
export type CreateSubAccountParameters =
    & Omit<CreateSubAccountRequest["action"], "type">
    & Partial<Pick<CreateSubAccountRequest, "nonce">>;

/** Parameters for the {@linkcode WalletClient.modify} method. */
export type ModifyParameters =
    & Omit<ModifyRequest["action"], "type">
    & Partial<Pick<ModifyRequest, "vaultAddress" | "nonce">>;

/** Parameters for the {@linkcode WalletClient.order} method. */
export type OrderParameters =
    & Omit<OrderRequest["action"], "type">
    & Partial<Pick<OrderRequest, "vaultAddress" | "nonce">>;

/** Parameters for the {@linkcode WalletClient.scheduleCancel} method. */
export type ScheduleCancelParameters =
    & Omit<ScheduleCancelRequest["action"], "type">
    & Partial<Pick<ScheduleCancelRequest, "vaultAddress" | "nonce">>;

/** Parameters for the {@linkcode WalletClient.setDisplayName} method. */
export type SetDisplayNameParameters =
    & Omit<SetDisplayNameRequest["action"], "type">
    & Partial<Pick<SetDisplayNameRequest, "nonce">>;

/** Parameters for the {@linkcode WalletClient.setReferrer} method. */
export type SetReferrerParameters =
    & Omit<SetReferrerRequest["action"], "type">
    & Partial<Pick<SetReferrerRequest, "nonce">>;

/** Parameters for the {@linkcode WalletClient.spotSend} method. */
export type SpotSendParameters =
    & Omit<SpotSendRequest["action"], "type" | "hyperliquidChain" | "signatureChainId" | "time">
    & Partial<Pick<SpotSendRequest["action"], "time">>;

/** Parameters for the {@linkcode WalletClient.spotUser} method. */
export type SpotUserParameters =
    & Omit<SpotUserRequest["action"], "type">
    & Partial<Pick<SpotUserRequest, "nonce">>;

/** Parameters for the {@linkcode WalletClient.subAccountSpotTransfer} method. */
export type SubAccountSpotTransferParameters =
    & Omit<SubAccountSpotTransferRequest["action"], "type">
    & Partial<Pick<SubAccountSpotTransferRequest, "nonce">>;

/** Parameters for the {@linkcode WalletClient.subAccountTransfer} method. */
export type SubAccountTransferParameters =
    & Omit<SubAccountTransferRequest["action"], "type">
    & Partial<Pick<SubAccountTransferRequest, "nonce">>;

/** Parameters for the {@linkcode WalletClient.tokenDelegate} method. */
export type TokenDelegateParameters =
    & Omit<TokenDelegateRequest["action"], "type" | "hyperliquidChain" | "signatureChainId" | "nonce">
    & Partial<Pick<TokenDelegateRequest["action"], "nonce">>;

/** Parameters for the {@linkcode WalletClient.twapCancel} method. */
export type TwapCancelParameters =
    & Omit<TwapCancelRequest["action"], "type">
    & Partial<Pick<TwapCancelRequest, "vaultAddress" | "nonce">>;

/** Parameters for the {@linkcode WalletClient.twapOrder} method. */
export type TwapOrderParameters =
    & TwapOrderRequest["action"]["twap"]
    & Partial<Pick<TwapOrderRequest, "vaultAddress" | "nonce">>;

/** Parameters for the {@linkcode WalletClient.updateIsolatedMargin} method. */
export type UpdateIsolatedMarginParameters =
    & Omit<UpdateIsolatedMarginRequest["action"], "type">
    & Partial<Pick<UpdateIsolatedMarginRequest, "vaultAddress" | "nonce">>;

/** Parameters for the {@linkcode WalletClient.updateLeverage} method. */
export type UpdateLeverageParameters =
    & Omit<UpdateLeverageRequest["action"], "type">
    & Partial<Pick<UpdateLeverageRequest, "vaultAddress" | "nonce">>;

/** Parameters for the {@linkcode WalletClient.usdClassTransfer} method. */
export type UsdClassTransferParameters =
    & Omit<UsdClassTransferRequest["action"], "type" | "hyperliquidChain" | "signatureChainId" | "nonce">
    & Partial<Pick<UsdClassTransferRequest["action"], "nonce">>;

/** Parameters for the {@linkcode WalletClient.usdSend} method. */
export type UsdSendParameters =
    & Omit<UsdSendRequest["action"], "type" | "hyperliquidChain" | "signatureChainId" | "time">
    & Partial<Pick<UsdSendRequest["action"], "time">>;

/** Parameters for the {@linkcode WalletClient.vaultDistribute} method. */
export type VaultDistributeParameters =
    & Omit<VaultDistributeRequest["action"], "type">
    & Partial<Pick<VaultDistributeRequest, "nonce">>;

/** Parameters for the {@linkcode WalletClient.vaultModify} method. */
export type VaultModifyParameters =
    & Omit<VaultModifyRequest["action"], "type">
    & Partial<Pick<VaultModifyRequest, "nonce">>;

/** Parameters for the {@linkcode WalletClient.vaultTransfer} method. */
export type VaultTransferParameters =
    & Omit<VaultTransferRequest["action"], "type">
    & Partial<Pick<VaultTransferRequest, "nonce">>;

/** Parameters for the {@linkcode WalletClient.withdraw3} method. */
export type Withdraw3Parameters =
    & Omit<Withdraw3Request["action"], "type" | "hyperliquidChain" | "signatureChainId" | "time">
    & Partial<Pick<Withdraw3Request["action"], "time">>;

// ——————————————— Responses ———————————————

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

// ——————————————— Errors ———————————————

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

// ——————————————— Client ———————————————

/**
 * Wallet client for interacting with the Hyperliquid API.
 * @typeParam T The transport used to connect to the Hyperliquid API.
 * @typeParam W The WalletClient/Account ([viem](https://viem.sh/docs/clients/wallet)) or Signer ([ethers.js](https://docs.ethers.io/v6/api/providers/#Signer)) used for signing transactions.
 */
export class WalletClient<
    T extends IRequestTransport = IRequestTransport,
    W extends AbstractViemWalletClient | AbstractEthersSigner | AbstractEthersV5Signer =
        | AbstractViemWalletClient
        | AbstractEthersSigner
        | AbstractEthersV5Signer,
> {
    /** The transport used to connect to the Hyperliquid API. */
    transport: T;

    /**
     * The [viem](https://viem.sh/docs/clients/wallet) or [ethers.js](https://docs.ethers.org/v6/api/providers/#Signer)
     * used for signing transactions.
     */
    wallet: W;

    /** Specifies whether the client uses testnet. */
    isTestnet: boolean;

    /** Sets a default vaultAddress to be used if no vaultAddress is explicitly passed to a method. */
    defaultVaultAddress?: Hex;

    /**
     * The network that will be used to sign transactions.
     * Must match the network of the {@link wallet}.
     */
    signatureChainId: Hex;

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
        this.signatureChainId = args.signatureChainId ?? (this.isTestnet ? "0x66eee" : "0xa4b1");
    }

    // ———————————————Actions———————————————

    /**
     * Approve an agent to sign on behalf of the master or sub-accounts.
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
     * const result = await client.approveAgent({
     *   agentAddress: "0x...",
     *   agentName: "agentName",
     * });
     * ```
     */
    async approveAgent(args: ApproveAgentParameters, signal?: AbortSignal): Promise<SuccessResponse> {
        // Construct an action
        const action: ApproveAgentRequest["action"] = {
            ...args,
            type: "approveAgent",
            hyperliquidChain: this.isTestnet ? "Testnet" : "Mainnet",
            signatureChainId: this.signatureChainId,
            nonce: args.nonce ?? Date.now(),
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
        const response = await this.transport.request("exchange", request, signal) as
            | SuccessResponse
            | ErrorResponse;

        // Validate a response
        this._validateResponse(response);
        return response;
    }

    /**
     * Approve a max fee rate for a builder address.
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
     * const result = await client.approveBuilderFee({
     *   maxFeeRate: "0.01%",
     *   builder: "0x...",
     * });
     * ```
     */
    async approveBuilderFee(args: ApproveBuilderFeeParameters, signal?: AbortSignal): Promise<SuccessResponse> {
        // Construct an action
        const action: ApproveBuilderFeeRequest["action"] = {
            ...args,
            type: "approveBuilderFee",
            hyperliquidChain: this.isTestnet ? "Testnet" : "Mainnet",
            signatureChainId: this.signatureChainId,
            nonce: args.nonce ?? Date.now(),
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
        const response = await this.transport.request("exchange", request, signal) as
            | SuccessResponse
            | ErrorResponse;

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
     *     oid: 123, // Order ID
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
            nonce = Date.now(),
            ...actionArgs
        } = args;

        // Construct an action
        const action: BatchModifyRequest["action"] = {
            type: "batchModify",
            modifies: actionArgs.modifies.map((modify) => {
                const sortedModify = {
                    oid: modify.oid,
                    order: {
                        a: modify.order.a,
                        b: modify.order.b,
                        p: modify.order.p,
                        s: modify.order.s,
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
                                    triggerPx: modify.order.t.trigger.triggerPx,
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
        });

        // Send a request
        const request: BatchModifyRequest = { action, signature, nonce, vaultAddress };
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
            nonce = Date.now(),
            ...actionArgs
        } = args;

        // Construct an action
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
        });

        // Send a request
        const request: CancelRequest = { action, signature, nonce, vaultAddress };
        const response = await this.transport.request("exchange", request, signal) as CancelResponse;

        // Validate a response
        this._validateResponse(response);
        return response;
    }

    /**
     * Deposit into staking balance.
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
            hyperliquidChain: this.isTestnet ? "Testnet" : "Mainnet",
            signatureChainId: this.signatureChainId,
            nonce: args.nonce ?? Date.now(),
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
        const response = await this.transport.request("exchange", request, signal) as
            | SuccessResponse
            | ErrorResponse;

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
    async claimRewards(args: ClaimRewardsParameters = {}, signal?: AbortSignal): Promise<SuccessResponse> {
        // Destructure the parameters
        const { nonce = Date.now() } = args;

        // Construct an action
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
        const response = await this.transport.request("exchange", request, signal) as
            | SuccessResponse
            | ErrorResponse;

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
     *   cancels: [{
     *     asset: 0,
     *     cloid: "0x...", // Client Order ID
     *   }],
     * });
     * ```
     */
    async cancelByCloid(args: CancelByCloidParameters, signal?: AbortSignal): Promise<CancelResponseSuccess> {
        // Destructure the parameters
        const {
            vaultAddress = this.defaultVaultAddress,
            nonce = Date.now(),
            ...actionArgs
        } = args;

        // Construct an action
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
        });

        // Send a request
        const request: CancelByCloidRequest = { action, signature, nonce, vaultAddress };
        const response = await this.transport.request("exchange", request, signal) as CancelResponse;

        // Validate a response
        this._validateResponse(response);
        return response;
    }

    /**
     * Withdraw from staking balance.
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
            hyperliquidChain: this.isTestnet ? "Testnet" : "Mainnet",
            signatureChainId: this.signatureChainId,
            nonce: args.nonce ?? Date.now(),
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
        const response = await this.transport.request("exchange", request, signal) as
            | SuccessResponse
            | ErrorResponse;

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
        // Destructure the parameters
        const {
            nonce = Date.now(),
            ...actionArgs
        } = args;

        // Construct an action
        const action: EvmUserModifyRequest["action"] = {
            type: "evmUserModify",
            usingBigBlocks: actionArgs.usingBigBlocks,
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
        const response = await this.transport.request("exchange", request, signal) as
            | SuccessResponse
            | ErrorResponse;

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
        // Destructure the parameters
        const {
            nonce = Date.now(),
            ...actionArgs
        } = args;

        // Construct an action
        const action: CreateSubAccountRequest["action"] = {
            type: "createSubAccount",
            name: actionArgs.name,
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
            | CreateSubAccountResponse
            | ErrorResponse;

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
     *   oid: 123, // Order ID
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
            nonce = Date.now(),
            ...actionArgs
        } = args;

        // Construct an action
        const action: ModifyRequest["action"] = {
            type: "modify",
            oid: actionArgs.oid,
            order: {
                a: actionArgs.order.a,
                b: actionArgs.order.b,
                p: actionArgs.order.p,
                s: actionArgs.order.s,
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
                            triggerPx: actionArgs.order.t.trigger.triggerPx,
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
        });

        // Send a request
        const request: ModifyRequest = { action, signature, nonce, vaultAddress };
        const response = await this.transport.request("exchange", request, signal) as
            | SuccessResponse
            | ErrorResponse;

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
            nonce = Date.now(),
            ...actionArgs
        } = args;

        // Construct an action
        const action: OrderRequest["action"] = {
            type: "order",
            orders: actionArgs.orders.map((order) => {
                const sortedOrder = {
                    a: order.a,
                    b: order.b,
                    p: order.p,
                    s: order.s,
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
                                triggerPx: order.t.trigger.triggerPx,
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
        });

        // Send a request
        const request: OrderRequest = { action, signature, nonce, vaultAddress };
        const response = await this.transport.request("exchange", request, signal) as OrderResponse;

        // Validate a response
        this._validateResponse(response);
        return response;
    }

    /**
     * Schedule a time to cancel all open orders.
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
            nonce = Date.now(),
            ...actionArgs
        } = args;

        // Construct an action
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
        });

        // Send a request
        const request: ScheduleCancelRequest = { action, signature, nonce, vaultAddress };
        const response = await this.transport.request("exchange", request, signal) as
            | SuccessResponse
            | ErrorResponse;

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
        // Destructure the parameters
        const {
            nonce = Date.now(),
            ...actionArgs
        } = args;

        // Construct an action
        const action: SetDisplayNameRequest["action"] = {
            type: "setDisplayName",
            displayName: actionArgs.displayName,
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
        const response = await this.transport.request("exchange", request, signal) as
            | SuccessResponse
            | ErrorResponse;

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
        // Destructure the parameters
        const {
            nonce = Date.now(),
            ...actionArgs
        } = args;

        // Construct an action
        const action: SetReferrerRequest["action"] = {
            type: "setReferrer",
            code: actionArgs.code,
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
        const response = await this.transport.request("exchange", request, signal) as
            | SuccessResponse
            | ErrorResponse;

        // Validate a response
        this._validateResponse(response);
        return response;
    }

    /**
     * Transfer a spot asset on L1 to another address.
     * @param args - The parameters for the request.
     * @param signal - An optional abort signal.
     * @returns Successful response without specific data.
     * @throws {ApiRequestError} When the API returns an error response.
     *
     * @see https://hyperliquid.gitbook.io/hyperliquid-docs/for-developers/api/exchange-endpoint#l1-spot-transfer
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
            hyperliquidChain: this.isTestnet ? "Testnet" : "Mainnet",
            signatureChainId: this.signatureChainId,
            time: args.time ?? Date.now(),
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
        const response = await this.transport.request("exchange", request, signal) as
            | SuccessResponse
            | ErrorResponse;

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
     * const result = await client.spotUser({
     *   toggleSpotDusting: { optOut: false },
     * });
     * ```
     */
    async spotUser(args: SpotUserParameters, signal?: AbortSignal): Promise<SuccessResponse> {
        // Destructure the parameters
        const {
            nonce = Date.now(),
            ...actionArgs
        } = args;

        // Construct an action
        const action: SpotUserRequest["action"] = {
            type: "spotUser",
            toggleSpotDusting: {
                optOut: actionArgs.toggleSpotDusting.optOut,
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
        const response = await this.transport.request("exchange", request, signal) as
            | SuccessResponse
            | ErrorResponse;

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
        // Destructure the parameters
        const {
            nonce = Date.now(),
            ...actionArgs
        } = args;

        // Construct an action
        const action: SubAccountSpotTransferRequest["action"] = {
            type: "subAccountSpotTransfer",
            subAccountUser: actionArgs.subAccountUser,
            isDeposit: actionArgs.isDeposit,
            token: actionArgs.token,
            amount: actionArgs.amount,
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
        const response = await this.transport.request("exchange", request, signal) as
            | SuccessResponse
            | ErrorResponse;

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
        // Destructure the parameters
        const {
            nonce = Date.now(),
            ...actionArgs
        } = args;

        // Construct an action
        const action: SubAccountTransferRequest["action"] = {
            type: "subAccountTransfer",
            subAccountUser: actionArgs.subAccountUser,
            isDeposit: actionArgs.isDeposit,
            usd: actionArgs.usd,
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
        const response = await this.transport.request("exchange", request, signal) as
            | SuccessResponse
            | ErrorResponse;

        // Validate a response
        this._validateResponse(response);
        return response;
    }

    /**
     * Delegate or undelegate stake from a validator.
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
            hyperliquidChain: this.isTestnet ? "Testnet" : "Mainnet",
            signatureChainId: this.signatureChainId,
            nonce: args.nonce ?? Date.now(),
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
        const response = await this.transport.request("exchange", request, signal) as
            | SuccessResponse
            | ErrorResponse;

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
            nonce = Date.now(),
            ...actionArgs
        } = args;

        // Construct an action
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
        });

        // Send a request
        const request: TwapCancelRequest = { action, signature, nonce, vaultAddress };
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
            nonce = Date.now(),
            ...actionArgs
        } = args;

        // Construct an action
        const action: TwapOrderRequest["action"] = {
            type: "twapOrder",
            twap: {
                a: actionArgs.a,
                b: actionArgs.b,
                s: actionArgs.s,
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
        });

        // Send a request
        const request: TwapOrderRequest = { action, signature, nonce, vaultAddress };
        const response = await this.transport.request("exchange", request, signal) as TwapOrderResponse;

        // Validate a response
        this._validateResponse(response);
        return response;
    }

    /**
     * Update isolated margin for a position.
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
     * const result = await client.updateIsolatedMargin({
     *   asset: 0,
     *   isBuy: true, // Add to long position
     *   ntli: 1, // Add 1 USD margin (integer only)
     * });
     * ```
     */
    async updateIsolatedMargin(args: UpdateIsolatedMarginParameters, signal?: AbortSignal): Promise<SuccessResponse> {
        // Destructure the parameters
        const {
            vaultAddress = this.defaultVaultAddress,
            nonce = Date.now(),
            ...actionArgs
        } = args;

        // Construct an action
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
        });

        // Send a request
        const request: UpdateIsolatedMarginRequest = { action, signature, nonce, vaultAddress };
        const response = await this.transport.request("exchange", request, signal) as
            | SuccessResponse
            | ErrorResponse;

        // Validate a response
        this._validateResponse(response);
        return response;
    }

    /**
     * Update leverage for cross or isolated margin.
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
     * const result = await client.updateLeverage({
     *   asset: 0,
     *   isCross: true,
     *   leverage: 5,
     * });
     * ```
     */
    async updateLeverage(args: UpdateLeverageParameters, signal?: AbortSignal): Promise<SuccessResponse> {
        // Destructure the parameters
        const {
            vaultAddress = this.defaultVaultAddress,
            nonce = Date.now(),
            ...actionArgs
        } = args;

        // Construct an action
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
        });

        // Send a request
        const request: UpdateLeverageRequest = { action, signature, nonce, vaultAddress };
        const response = await this.transport.request("exchange", request, signal) as
            | SuccessResponse
            | ErrorResponse;

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
     * const result = await client.usdClassTransfer({
     *   amount: "1",
     *   toPerp: true, // Transfer from Spot to Perp
     * });
     * ```
     */
    async usdClassTransfer(args: UsdClassTransferParameters, signal?: AbortSignal): Promise<SuccessResponse> {
        // Construct an action
        const action: UsdClassTransferRequest["action"] = {
            ...args,
            type: "usdClassTransfer",
            hyperliquidChain: this.isTestnet ? "Testnet" : "Mainnet",
            signatureChainId: this.signatureChainId,
            nonce: args.nonce ?? Date.now(),
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
        const response = await this.transport.request("exchange", request, signal) as
            | SuccessResponse
            | ErrorResponse;

        // Validate a response
        this._validateResponse(response);
        return response;
    }

    /**
     * Transfer USDC on L1 to another address.
     * @param args - The parameters for the request.
     * @param signal - An optional abort signal.
     * @returns Successful response without specific data.
     * @throws {ApiRequestError} When the API returns an error response.
     *
     * @see https://hyperliquid.gitbook.io/hyperliquid-docs/for-developers/api/exchange-endpoint#l1-usdc-transfer
     * @example
     * ```ts
     * import * as hl from "@nktkas/hyperliquid";
     * import { privateKeyToAccount } from "viem/accounts";
     *
     * const wallet = privateKeyToAccount("0x...");
     * const transport = new hl.HttpTransport(); // or WebSocketTransport
     * const client = new hl.WalletClient({ wallet, transport });
     *
     * const result = await client.usdSend({
     *   destination: "0x...",
     *   amount: "1",
     * });
     * ```
     */
    async usdSend(args: UsdSendParameters, signal?: AbortSignal): Promise<SuccessResponse> {
        // Construct an action
        const action: UsdSendRequest["action"] = {
            ...args,
            type: "usdSend",
            hyperliquidChain: this.isTestnet ? "Testnet" : "Mainnet",
            signatureChainId: this.signatureChainId,
            time: args.time ?? Date.now(),
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
        const response = await this.transport.request("exchange", request, signal) as
            | SuccessResponse
            | ErrorResponse;

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
     * const result = await client.vaultDistribute({
     *   vaultAddress: "0x...",
     *   usd: 10 * 1e6,
     * });
     * ```
     */
    async vaultDistribute(args: VaultDistributeParameters, signal?: AbortSignal): Promise<SuccessResponse> {
        // Destructure the parameters
        const {
            nonce = Date.now(),
            ...actionArgs
        } = args;

        // Construct an action
        const action: VaultDistributeRequest["action"] = {
            type: "vaultDistribute",
            vaultAddress: actionArgs.vaultAddress,
            usd: actionArgs.usd,
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
        const response = await this.transport.request("exchange", request, signal) as
            | SuccessResponse
            | ErrorResponse;

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
        // Destructure the parameters
        const {
            nonce = Date.now(),
            ...actionArgs
        } = args;

        // Construct an action
        const action: VaultModifyRequest["action"] = {
            type: "vaultModify",
            vaultAddress: actionArgs.vaultAddress,
            allowDeposits: actionArgs.allowDeposits,
            alwaysCloseOnWithdraw: actionArgs.alwaysCloseOnWithdraw,
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
        const response = await this.transport.request("exchange", request, signal) as
            | SuccessResponse
            | ErrorResponse;

        // Validate a response
        this._validateResponse(response);
        return response;
    }

    /**
     * Add or remove funds from a vault.
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
            nonce = Date.now(),
            ...actionArgs
        } = args;

        // Construct an action
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
        });

        // Send a request
        const request: VaultTransferRequest = { action, signature, nonce };
        const response = await this.transport.request("exchange", request, signal) as
            | SuccessResponse
            | ErrorResponse;

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
     * const result = await client.withdraw3({
     *   destination: "0x...",
     *   amount: "1",
     * });
     * ```
     */
    async withdraw3(args: Withdraw3Parameters, signal?: AbortSignal): Promise<SuccessResponse> {
        // Construct an action
        const action: Withdraw3Request["action"] = {
            ...args,
            type: "withdraw3",
            hyperliquidChain: this.isTestnet ? "Testnet" : "Mainnet",
            signatureChainId: this.signatureChainId,
            time: args.time ?? Date.now(),
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
        const response = await this.transport.request("exchange", request, signal) as
            | SuccessResponse
            | ErrorResponse;

        // Validate a response
        this._validateResponse(response);
        return response;
    }

    /** Validate a response from the API. */
    protected _validateResponse(
        response:
            | SuccessResponse
            | ErrorResponse
            | CancelResponse
            | CreateSubAccountResponse
            | OrderResponse
            | TwapOrderResponse
            | TwapCancelResponse,
    ): asserts response is
        | SuccessResponse
        | CancelResponseSuccess
        | CreateSubAccountResponse
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
