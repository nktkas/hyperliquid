import type { Hex } from "../types/common.ts";
import type {
    ApproveAgentRequest,
    ApproveBuilderFeeRequest,
    BatchModifyRequest,
    CancelByCloidRequest,
    CancelRequest,
    CDepositRequest,
    CreateSubAccountRequest,
    CWithdrawRequest,
    EvmUserModifyRequest,
    ModifyRequest,
    OrderRequest,
    ScheduleCancelRequest,
    SetReferrerRequest,
    SpotSendRequest,
    SubAccountTransferRequest,
    TokenDelegateRequest,
    TwapCancelRequest,
    TwapOrderRequest,
    UpdateIsolatedMarginRequest,
    UpdateLeverageRequest,
    UsdClassTransferRequest,
    UsdSendRequest,
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
import type { IRequestTransport } from "../transports/base.ts";
import { sorters } from "../utils/key_sort.ts";
import {
    type AbstractEthersSigner,
    type AbstractEthersV5Signer,
    type AbstractViemWalletClient,
    signL1Action,
    signUserSignedAction,
} from "../utils/signing.ts";

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
    /** Specifies whether the client uses testnet. Defaults to `false`. */
    isTestnet?: boolean;
    /** Sets a default vaultAddress to be used if no vaultAddress is explicitly passed to a method. */
    defaultVaultAddress?: Hex;
}

/** Parameters for the {@linkcode WalletClient.approveAgent} method. */
export type ApproveAgentParameters =
    & Omit<ApproveAgentRequest["action"], "type" | "hyperliquidChain" | "signatureChainId" | "nonce">
    & Partial<Pick<ApproveAgentRequest["action"], "signatureChainId" | "nonce">>;

/** Parameters for the {@linkcode WalletClient.approveBuilderFee} method. */
export type ApproveBuilderFeeParameters =
    & Omit<ApproveBuilderFeeRequest["action"], "type" | "hyperliquidChain" | "signatureChainId" | "nonce">
    & Partial<Pick<ApproveBuilderFeeRequest["action"], "signatureChainId" | "nonce">>;

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
    & Partial<Pick<CDepositRequest["action"], "signatureChainId" | "nonce">>;

/** Parameters for the {@linkcode WalletClient.cancelByCloid} method. */
export type CancelByCloidParameters =
    & Omit<CancelByCloidRequest["action"], "type">
    & Partial<Pick<CancelByCloidRequest, "vaultAddress" | "nonce">>;

/** Parameters for the {@linkcode WalletClient.cWithdraw} method. */
export type CWithdrawParameters =
    & Omit<CWithdrawRequest["action"], "type" | "hyperliquidChain" | "signatureChainId" | "nonce">
    & Partial<Pick<CWithdrawRequest["action"], "signatureChainId" | "nonce">>;

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

/** Parameters for the {@linkcode WalletClient.setReferrer} method. */
export type SetReferrerParameters =
    & Omit<SetReferrerRequest["action"], "type">
    & Partial<Pick<SetReferrerRequest, "nonce">>;

/** Parameters for the {@linkcode WalletClient.spotSend} method. */
export type SpotSendParameters =
    & Omit<SpotSendRequest["action"], "type" | "hyperliquidChain" | "signatureChainId" | "time">
    & Partial<Pick<SpotSendRequest["action"], "signatureChainId" | "time">>;

/** Parameters for the {@linkcode WalletClient.subAccountTransfer} method. */
export type SubAccountTransferParameters =
    & Omit<SubAccountTransferRequest["action"], "type">
    & Partial<Pick<SubAccountTransferRequest, "nonce">>;

/** Parameters for the {@linkcode WalletClient.tokenDelegate} method. */
export type TokenDelegateParameters =
    & Omit<TokenDelegateRequest["action"], "type" | "hyperliquidChain" | "signatureChainId" | "nonce">
    & Partial<Pick<TokenDelegateRequest["action"], "signatureChainId" | "nonce">>;

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
    & Partial<Pick<UsdClassTransferRequest["action"], "signatureChainId" | "nonce">>;

/** Parameters for the {@linkcode WalletClient.usdSend} method. */
export type UsdSendParameters =
    & Omit<UsdSendRequest["action"], "type" | "hyperliquidChain" | "signatureChainId" | "time">
    & Partial<Pick<UsdSendRequest["action"], "signatureChainId" | "time">>;

/** Parameters for the {@linkcode WalletClient.vaultTransfer} method. */
export type VaultTransferParameters =
    & Omit<VaultTransferRequest["action"], "type">
    & Partial<Pick<VaultTransferRequest, "nonce">>;

/** Parameters for the {@linkcode WalletClient.withdraw3} method. */
export type Withdraw3Parameters =
    & Omit<Withdraw3Request["action"], "type" | "hyperliquidChain" | "signatureChainId" | "time">
    & Partial<Pick<Withdraw3Request["action"], "signatureChainId" | "time">>;

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
export class ApiRequestError extends Error {
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
            message += `: ${response.response}`;
        } else {
            if ("statuses" in response.response.data) {
                const errors = response.response.data.statuses
                    .reduce<string[]>((acc, status, index) => {
                        if (typeof status === "object" && "error" in status) {
                            acc.push(`Order ${index} failed: ${status.error}`);
                        }
                        return acc;
                    }, []);
                if (errors.length > 0) {
                    message += `: ${errors.join(", ")}`;
                }
            } else {
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
 * @typeParam T - The transport used to connect to the Hyperliquid API.
 * @typeParam W - The WalletClient/Account ([viem](https://viem.sh/docs/clients/wallet)) or Signer ([ethers.js](https://docs.ethers.io/v6/api/providers/#Signer)) used for signing transactions.
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

    /** The WalletClient/Account ([viem](https://viem.sh/docs/clients/wallet)) or Signer ([ethers.js](https://docs.ethers.org/v6/api/providers/#Signer)) used for signing transactions. */
    wallet: W;

    /** Specifies whether the client uses testnet. */
    isTestnet: boolean;

    /** Sets a default vaultAddress to be used if no vaultAddress is explicitly passed to a method. */
    defaultVaultAddress?: Hex;

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
     * @example Private key via [ethers.js](https://docs.ethers.org/v6/api/wallet/#Wallet)
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
     */
    constructor(args: WalletClientParameters<T, W>) {
        this.transport = args.transport;
        this.wallet = args.wallet;
        this.isTestnet = args.isTestnet ?? false;
        this.defaultVaultAddress = args.defaultVaultAddress;
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
     */
    async approveAgent(args: ApproveAgentParameters, signal?: AbortSignal): Promise<SuccessResponse> {
        const action: ApproveAgentRequest["action"] = {
            ...args,
            type: "approveAgent",
            hyperliquidChain: this.isTestnet ? "Testnet" : "Mainnet",
            signatureChainId: args.signatureChainId ?? (this.isTestnet ? "0x66eee" : "0xa4b1"),
            nonce: args.nonce ?? Date.now(),
        };

        const signature = await signUserSignedAction(
            this.wallet,
            action,
            {
                "HyperliquidTransaction:ApproveAgent": [
                    { name: "hyperliquidChain", type: "string" },
                    { name: "agentAddress", type: "address" },
                    { name: "agentName", type: "string" },
                    { name: "nonce", type: "uint64" },
                ],
            },
            parseInt(action.signatureChainId, 16),
        );

        const request: ApproveAgentRequest = {
            action,
            signature,
            nonce: action.nonce,
        };
        const response = await this.transport.request("action", request, signal) as SuccessResponse | ErrorResponse;

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
     */
    async approveBuilderFee(args: ApproveBuilderFeeParameters, signal?: AbortSignal): Promise<SuccessResponse> {
        const action: ApproveBuilderFeeRequest["action"] = {
            ...args,
            type: "approveBuilderFee",
            hyperliquidChain: this.isTestnet ? "Testnet" : "Mainnet",
            signatureChainId: args.signatureChainId ?? (this.isTestnet ? "0x66eee" : "0xa4b1"),
            nonce: args.nonce ?? Date.now(),
        };

        const signature = await signUserSignedAction(
            this.wallet,
            action,
            {
                "HyperliquidTransaction:ApproveBuilderFee": [
                    { name: "hyperliquidChain", type: "string" },
                    { name: "maxFeeRate", type: "string" },
                    { name: "builder", type: "address" },
                    { name: "nonce", type: "uint64" },
                ],
            },
            parseInt(action.signatureChainId, 16),
        );

        const request: ApproveBuilderFeeRequest = {
            action,
            signature,
            nonce: action.nonce,
        };
        const response = await this.transport.request("action", request, signal) as SuccessResponse | ErrorResponse;

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
        const {
            vaultAddress = this.defaultVaultAddress,
            nonce = Date.now(),
            ...actionArgs
        } = args;

        const sortedAction = sorters.batchModify({ type: "batchModify", ...actionArgs });
        const signature = await signL1Action(this.wallet, this.isTestnet, sortedAction, nonce, vaultAddress);

        const request: BatchModifyRequest = {
            action: sortedAction,
            signature,
            nonce,
            vaultAddress,
        };
        const response = await this.transport.request("action", request, signal) as OrderResponse;

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
        const {
            vaultAddress = this.defaultVaultAddress,
            nonce = Date.now(),
            ...actionArgs
        } = args;

        const sortedAction = sorters.cancel({ type: "cancel", ...actionArgs });
        const signature = await signL1Action(this.wallet, this.isTestnet, sortedAction, nonce, vaultAddress);

        const request: CancelRequest = {
            action: sortedAction,
            signature,
            nonce,
            vaultAddress,
        };
        const response = await this.transport.request("action", request, signal) as CancelResponse;

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
     * const result = await client.cDeposit({ wei: 100000000 });
     * ```
     */
    async cDeposit(args: CDepositParameters, signal?: AbortSignal): Promise<SuccessResponse> {
        const action: CDepositRequest["action"] = {
            ...args,
            type: "cDeposit",
            hyperliquidChain: this.isTestnet ? "Testnet" : "Mainnet",
            signatureChainId: args.signatureChainId ?? (this.isTestnet ? "0x66eee" : "0xa4b1"),
            nonce: args.nonce ?? Date.now(),
        };

        const signature = await signUserSignedAction(
            this.wallet,
            action,
            {
                "HyperliquidTransaction:CDeposit": [
                    { name: "hyperliquidChain", type: "string" },
                    { name: "wei", type: "uint64" },
                    { name: "nonce", type: "uint64" },
                ],
            },
            parseInt(action.signatureChainId, 16),
        );

        const request: CDepositRequest = {
            action,
            signature,
            nonce: action.nonce,
        };
        const response = await this.transport.request("action", request, signal) as SuccessResponse | ErrorResponse;

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
        const {
            vaultAddress = this.defaultVaultAddress,
            nonce = Date.now(),
            ...actionArgs
        } = args;

        const sortedAction = sorters.cancelByCloid({ type: "cancelByCloid", ...actionArgs });
        const signature = await signL1Action(this.wallet, this.isTestnet, sortedAction, nonce, vaultAddress);

        const request: CancelByCloidRequest = {
            action: sortedAction,
            signature,
            nonce,
            vaultAddress,
        };
        const response = await this.transport.request("action", request, signal) as CancelResponse;

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
     * const result = await client.cWithdraw({ wei: 100000000 });
     * ```
     */
    async cWithdraw(args: CWithdrawParameters, signal?: AbortSignal): Promise<SuccessResponse> {
        const action: CWithdrawRequest["action"] = {
            ...args,
            type: "cWithdraw",
            hyperliquidChain: this.isTestnet ? "Testnet" : "Mainnet",
            signatureChainId: args.signatureChainId ?? (this.isTestnet ? "0x66eee" : "0xa4b1"),
            nonce: args.nonce ?? Date.now(),
        };

        const signature = await signUserSignedAction(
            this.wallet,
            action,
            {
                "HyperliquidTransaction:CWithdraw": [
                    { name: "hyperliquidChain", type: "string" },
                    { name: "wei", type: "uint64" },
                    { name: "nonce", type: "uint64" },
                ],
            },
            parseInt(action.signatureChainId, 16),
        );

        const request: CWithdrawRequest = {
            action,
            signature,
            nonce: action.nonce,
        };
        const response = await this.transport.request("action", request, signal) as SuccessResponse | ErrorResponse;

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
        const {
            nonce = Date.now(),
            ...actionArgs
        } = args;

        const sortedAction = sorters.evmUserModify({ type: "evmUserModify", ...actionArgs });
        const signature = await signL1Action(this.wallet, this.isTestnet, sortedAction, nonce);

        const request: EvmUserModifyRequest = {
            action: sortedAction,
            signature,
            nonce,
        };
        const response = await this.transport.request("action", request, signal) as SuccessResponse | ErrorResponse;

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
        const {
            nonce = Date.now(),
            ...actionArgs
        } = args;

        const sortedAction = sorters.createSubAccount({ type: "createSubAccount", ...actionArgs });
        const signature = await signL1Action(this.wallet, this.isTestnet, sortedAction, nonce);

        const request: CreateSubAccountRequest = {
            action: sortedAction,
            signature,
            nonce,
        };
        const response = await this.transport.request("action", request, signal) as
            | CreateSubAccountResponse
            | ErrorResponse;

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
        const {
            vaultAddress = this.defaultVaultAddress,
            nonce = Date.now(),
            ...actionArgs
        } = args;

        const sortedAction = sorters.modify({ type: "modify", ...actionArgs });
        const signature = await signL1Action(this.wallet, this.isTestnet, sortedAction, nonce, vaultAddress);

        const request: ModifyRequest = {
            action: sortedAction,
            signature,
            nonce,
            vaultAddress,
        };
        const response = await this.transport.request("action", request, signal) as SuccessResponse | ErrorResponse;

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
        const clonedArgs = structuredClone(args); // Clone to prevent mutation of original object
        const {
            vaultAddress = this.defaultVaultAddress,
            nonce = Date.now(),
            ...actionArgs
        } = clonedArgs;

        if (actionArgs.builder) actionArgs.builder.b = actionArgs.builder.b.toLowerCase() as Hex;

        const sortedAction = sorters.order({ type: "order", ...actionArgs });
        const signature = await signL1Action(this.wallet, this.isTestnet, sortedAction, nonce, vaultAddress);

        const request: OrderRequest = {
            action: sortedAction,
            signature,
            nonce,
            vaultAddress,
        };
        const response = await this.transport.request("action", request, signal) as OrderResponse;

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
        const {
            vaultAddress = this.defaultVaultAddress,
            nonce = Date.now(),
            ...actionArgs
        } = args;

        const sortedAction = sorters.scheduleCancel({ type: "scheduleCancel", ...actionArgs });
        const signature = await signL1Action(this.wallet, this.isTestnet, sortedAction, nonce, vaultAddress);

        const request: ScheduleCancelRequest = {
            action: sortedAction,
            signature,
            nonce,
            vaultAddress,
        };
        const response = await this.transport.request("action", request, signal) as SuccessResponse | ErrorResponse;

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
        const {
            nonce = Date.now(),
            ...actionArgs
        } = args;

        const sortedAction = sorters.setReferrer({ type: "setReferrer", ...actionArgs });
        const signature = await signL1Action(this.wallet, this.isTestnet, sortedAction, nonce);

        const request: SetReferrerRequest = {
            action: sortedAction,
            signature,
            nonce,
        };
        const response = await this.transport.request("action", request, signal) as SuccessResponse | ErrorResponse;

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
        const action: SpotSendRequest["action"] = {
            ...args,
            type: "spotSend",
            hyperliquidChain: this.isTestnet ? "Testnet" : "Mainnet",
            signatureChainId: args.signatureChainId ?? (this.isTestnet ? "0x66eee" : "0xa4b1"),
            time: args.time ?? Date.now(),
        };

        const signature = await signUserSignedAction(
            this.wallet,
            action,
            {
                "HyperliquidTransaction:SpotSend": [
                    { name: "hyperliquidChain", type: "string" },
                    { name: "destination", type: "string" },
                    { name: "token", type: "string" },
                    { name: "amount", type: "string" },
                    { name: "time", type: "uint64" },
                ],
            },
            parseInt(action.signatureChainId, 16),
        );

        const request: SpotSendRequest = {
            action,
            signature,
            nonce: action.time,
        };
        const response = await this.transport.request("action", request, signal) as SuccessResponse | ErrorResponse;

        this._validateResponse(response);
        return response;
    }

    /**
     * Transfer between sub-accounts.
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
     *   usd: 1000000, // 1 USD in raw units (float amount * 1e6)
     * });
     * ```
     */
    async subAccountTransfer(args: SubAccountTransferParameters, signal?: AbortSignal): Promise<SuccessResponse> {
        const {
            nonce = Date.now(),
            ...actionArgs
        } = args;

        const sortedAction = sorters.subAccountTransfer({ type: "subAccountTransfer", ...actionArgs });
        const signature = await signL1Action(this.wallet, this.isTestnet, sortedAction, nonce);

        const request: SubAccountTransferRequest = {
            action: sortedAction,
            signature,
            nonce,
        };
        const response = await this.transport.request("action", request, signal) as SuccessResponse | ErrorResponse;

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
     *   wei: 100000000,
     * });
     * ```
     */
    async tokenDelegate(args: TokenDelegateParameters, signal?: AbortSignal): Promise<SuccessResponse> {
        const action: TokenDelegateRequest["action"] = {
            ...args,
            type: "tokenDelegate",
            hyperliquidChain: this.isTestnet ? "Testnet" : "Mainnet",
            signatureChainId: args.signatureChainId ?? (this.isTestnet ? "0x66eee" : "0xa4b1"),
            nonce: args.nonce ?? Date.now(),
        };

        const signature = await signUserSignedAction(
            this.wallet,
            action,
            {
                "HyperliquidTransaction:TokenDelegate": [
                    { name: "hyperliquidChain", type: "string" },
                    { name: "validator", type: "address" },
                    { name: "wei", type: "uint64" },
                    { name: "isUndelegate", type: "bool" },
                    { name: "nonce", type: "uint64" },
                ],
            },
            parseInt(action.signatureChainId, 16),
        );

        const request: TokenDelegateRequest = {
            action,
            signature,
            nonce: action.nonce,
        };
        const response = await this.transport.request("action", request, signal) as SuccessResponse | ErrorResponse;

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
        const {
            vaultAddress = this.defaultVaultAddress,
            nonce = Date.now(),
            ...actionArgs
        } = args;

        const sortedAction = sorters.twapCancel({ type: "twapCancel", ...actionArgs });
        const signature = await signL1Action(this.wallet, this.isTestnet, sortedAction, nonce, vaultAddress);

        const request: TwapCancelRequest = {
            action: sortedAction,
            signature,
            nonce,
            vaultAddress,
        };
        const response = await this.transport.request("action", request, signal) as TwapCancelResponse;

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
        const {
            vaultAddress = this.defaultVaultAddress,
            nonce = Date.now(),
            ...actionArgs
        } = args;

        const sortedAction = sorters.twapOrder({ type: "twapOrder", twap: actionArgs });
        const signature = await signL1Action(this.wallet, this.isTestnet, sortedAction, nonce, vaultAddress);

        const request: TwapOrderRequest = {
            action: sortedAction,
            signature,
            nonce,
            vaultAddress,
        };
        const response = await this.transport.request("action", request, signal) as TwapOrderResponse;

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
     *   ntli: 1000, // Add 1000 USD margin (integer only)
     * });
     * ```
     */
    async updateIsolatedMargin(args: UpdateIsolatedMarginParameters, signal?: AbortSignal): Promise<SuccessResponse> {
        const {
            vaultAddress = this.defaultVaultAddress,
            nonce = Date.now(),
            ...actionArgs
        } = args;

        const sortedAction = sorters.updateIsolatedMargin({ type: "updateIsolatedMargin", ...actionArgs });
        const signature = await signL1Action(this.wallet, this.isTestnet, sortedAction, nonce, vaultAddress);

        const request: UpdateIsolatedMarginRequest = {
            action: sortedAction,
            signature,
            nonce,
            vaultAddress,
        };
        const response = await this.transport.request("action", request, signal) as SuccessResponse | ErrorResponse;

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
        const {
            vaultAddress = this.defaultVaultAddress,
            nonce = Date.now(),
            ...actionArgs
        } = args;

        const sortedAction = sorters.updateLeverage({ type: "updateLeverage", ...actionArgs });
        const signature = await signL1Action(this.wallet, this.isTestnet, sortedAction, nonce, vaultAddress);

        const request: UpdateLeverageRequest = {
            action: sortedAction,
            signature,
            nonce,
            vaultAddress,
        };
        const response = await this.transport.request("action", request, signal) as SuccessResponse | ErrorResponse;

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
     *   amount: "1000",
     *   toPerp: true, // Transfer from Spot to Perp
     * });
     * ```
     */
    async usdClassTransfer(args: UsdClassTransferParameters, signal?: AbortSignal): Promise<SuccessResponse> {
        const action: UsdClassTransferRequest["action"] = {
            ...args,
            type: "usdClassTransfer",
            hyperliquidChain: this.isTestnet ? "Testnet" : "Mainnet",
            signatureChainId: args.signatureChainId ?? (this.isTestnet ? "0x66eee" : "0xa4b1"),
            nonce: args.nonce ?? Date.now(),
        };

        const signature = await signUserSignedAction(
            this.wallet,
            action,
            {
                "HyperliquidTransaction:UsdClassTransfer": [
                    { name: "hyperliquidChain", type: "string" },
                    { name: "amount", type: "string" },
                    { name: "toPerp", type: "bool" },
                    { name: "nonce", type: "uint64" },
                ],
            },
            parseInt(action.signatureChainId, 16),
        );

        const request: UsdClassTransferRequest = {
            action,
            signature,
            nonce: action.nonce,
        };
        const response = await this.transport.request("action", request, signal) as SuccessResponse | ErrorResponse;

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
     *   amount: "1000",
     * });
     * ```
     */
    async usdSend(args: UsdSendParameters, signal?: AbortSignal): Promise<SuccessResponse> {
        const action: UsdSendRequest["action"] = {
            ...args,
            type: "usdSend",
            hyperliquidChain: this.isTestnet ? "Testnet" : "Mainnet",
            signatureChainId: args.signatureChainId ?? (this.isTestnet ? "0x66eee" : "0xa4b1"),
            time: args.time ?? Date.now(),
        };

        const signature = await signUserSignedAction(
            this.wallet,
            action,
            {
                "HyperliquidTransaction:UsdSend": [
                    { name: "hyperliquidChain", type: "string" },
                    { name: "destination", type: "string" },
                    { name: "amount", type: "string" },
                    { name: "time", type: "uint64" },
                ],
            },
            parseInt(action.signatureChainId, 16),
        );

        const request: UsdSendRequest = {
            action,
            signature,
            nonce: action.time,
        };
        const response = await this.transport.request("action", request, signal) as SuccessResponse | ErrorResponse;

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
     *   usd: 1000000, // 1 USD in raw units (float amount * 1e6)
     * });
     * ```
     */
    async vaultTransfer(args: VaultTransferParameters, signal?: AbortSignal): Promise<SuccessResponse> {
        const {
            nonce = Date.now(),
            ...actionArgs
        } = args;

        const sortedAction = sorters.vaultTransfer({ type: "vaultTransfer", ...actionArgs });
        const signature = await signL1Action(this.wallet, this.isTestnet, sortedAction, nonce);

        const request: VaultTransferRequest = {
            action: sortedAction,
            signature,
            nonce,
        };
        const response = await this.transport.request("action", request, signal) as SuccessResponse | ErrorResponse;

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
     *   amount: "1000",
     * });
     * ```
     */
    async withdraw3(args: Withdraw3Parameters, signal?: AbortSignal): Promise<SuccessResponse> {
        const action: Withdraw3Request["action"] = {
            ...args,
            type: "withdraw3",
            hyperliquidChain: this.isTestnet ? "Testnet" : "Mainnet",
            signatureChainId: args.signatureChainId ?? (this.isTestnet ? "0x66eee" : "0xa4b1"),
            time: args.time ?? Date.now(),
        };

        const signature = await signUserSignedAction(
            this.wallet,
            action,
            {
                "HyperliquidTransaction:Withdraw": [
                    { name: "hyperliquidChain", type: "string" },
                    { name: "destination", type: "string" },
                    { name: "amount", type: "string" },
                    { name: "time", type: "uint64" },
                ],
            },
            parseInt(action.signatureChainId, 16),
        );

        const request: Withdraw3Request = {
            action,
            signature,
            nonce: action.time,
        };
        const response = await this.transport.request("action", request, signal) as SuccessResponse | ErrorResponse;

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
            throw new ApiRequestError(response);
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
