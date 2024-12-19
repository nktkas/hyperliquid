import { keccak_256 } from "@noble/hashes/sha3";
import { encode } from "@msgpack/msgpack";
import type {
    ApproveAgentRequest,
    ApproveBuilderFeeRequest,
    BatchModifyRequest,
    CancelByCloidRequest,
    CancelRequest,
    CreateSubAccountRequest,
    ModifyRequest,
    OrderRequest,
    ScheduleCancelRequest,
    SetReferrerRequest,
    SpotSendRequest,
    SubAccountTransferRequest,
    TwapCancelRequest,
    TwapOrderRequest,
    UpdateIsolatedMarginRequest,
    UpdateLeverageRequest,
    UsdClassTransferRequest,
    UsdSendRequest,
    VaultTransferRequest,
    Withdraw3Request,
} from "../types/exchange/requests.d.ts";
import type {
    CancelResponse,
    CreateSubAccountResponse,
    ErrorResponse,
    OrderResponse,
    SuccessResponse,
    TwapCancelResponse,
    TwapOrderResponse,
} from "../types/exchange/responses.d.ts";
import type { IRESTTransport } from "../transports/base.d.ts";
import { bytesToHex, type Hex, hexToBytes, parseSignature } from "../utils/hex.ts";
import { sortActionKeys } from "../utils/keySort.ts";

// ———————————————Parameters———————————————

/** @see {@linkcode WalletClient.approveAgent} */
export type ApproveAgentParameters =
    & Omit<ApproveAgentRequest["action"], "type" | "hyperliquidChain" | "signatureChainId" | "nonce">
    & Partial<Pick<ApproveAgentRequest["action"], "signatureChainId" | "nonce">>;

/** @see {@linkcode WalletClient.approveBuilderFee} */
export type ApproveBuilderFeeParameters =
    & Omit<ApproveBuilderFeeRequest["action"], "type" | "hyperliquidChain" | "signatureChainId" | "nonce">
    & Partial<Pick<ApproveBuilderFeeRequest["action"], "signatureChainId" | "nonce">>;

/** @see {@linkcode WalletClient.batchModify} */
export type BatchModifyParameters =
    & Omit<BatchModifyRequest["action"], "type">
    & Partial<Pick<BatchModifyRequest, "vaultAddress" | "nonce">>;

/** @see {@linkcode WalletClient.cancel} */
export type CancelParameters =
    & Omit<CancelRequest["action"], "type">
    & Partial<Pick<CancelRequest, "vaultAddress" | "nonce">>;

/** @see {@linkcode WalletClient.cancelByCloid} */
export type CancelByCloidParameters =
    & Omit<CancelByCloidRequest["action"], "type">
    & Partial<Pick<CancelByCloidRequest, "vaultAddress" | "nonce">>;

/** @see {@linkcode WalletClient.createSubAccount} */
export type CreateSubAccountParameters =
    & Omit<CreateSubAccountRequest["action"], "type">
    & Partial<Pick<CreateSubAccountRequest, "nonce">>;

/** @see {@linkcode WalletClient.modify} */
export type ModifyParameters =
    & Omit<ModifyRequest["action"], "type">
    & Partial<Pick<ModifyRequest, "vaultAddress" | "nonce">>;

/** @see {@linkcode WalletClient.order} */
export type OrderParameters =
    & Omit<OrderRequest["action"], "type">
    & Partial<Pick<OrderRequest, "vaultAddress" | "nonce">>;

/** @see {@linkcode WalletClient.scheduleCancel} */
export type ScheduleCancelParameters =
    & Omit<ScheduleCancelRequest["action"], "type">
    & Partial<Pick<ScheduleCancelRequest, "vaultAddress" | "nonce">>;

/** @see {@linkcode WalletClient.setReferrer} */
export type SetReferrerParameters =
    & Omit<SetReferrerRequest["action"], "type">
    & Partial<Pick<SetReferrerRequest, "nonce">>;

/** @see {@linkcode WalletClient.spotSend} */
export type SpotSendParameters =
    & Omit<SpotSendRequest["action"], "type" | "hyperliquidChain" | "signatureChainId" | "time">
    & Partial<Pick<SpotSendRequest["action"], "signatureChainId" | "time">>;

/** @see {@linkcode WalletClient.subAccountTransfer} */
export type SubAccountTransferParameters =
    & Omit<SubAccountTransferRequest["action"], "type">
    & Partial<Pick<SubAccountTransferRequest, "nonce">>;

/** @see {@linkcode WalletClient.twapCancel} */
export type TwapCancelParameters =
    & Omit<TwapCancelRequest["action"], "type">
    & Partial<Pick<TwapCancelRequest, "vaultAddress" | "nonce">>;

/** @see {@linkcode WalletClient.twapOrder} */
export type TwapOrderParameters =
    & TwapOrderRequest["action"]["twap"]
    & Partial<Pick<TwapOrderRequest, "vaultAddress" | "nonce">>;

/** @see {@linkcode WalletClient.updateIsolatedMargin} */
export type UpdateIsolatedMarginParameters =
    & Omit<UpdateIsolatedMarginRequest["action"], "type">
    & Partial<Pick<UpdateIsolatedMarginRequest, "vaultAddress" | "nonce">>;

/** @see {@linkcode WalletClient.updateLeverage} */
export type UpdateLeverageParameters =
    & Omit<UpdateLeverageRequest["action"], "type">
    & Partial<Pick<UpdateLeverageRequest, "vaultAddress" | "nonce">>;

/** @see {@linkcode WalletClient.usdClassTransfer} */
export type UsdClassTransferParameters =
    & Omit<UsdClassTransferRequest["action"], "type" | "hyperliquidChain" | "signatureChainId" | "nonce">
    & Partial<Pick<UsdClassTransferRequest["action"], "signatureChainId" | "nonce">>;

/** @see {@linkcode WalletClient.usdSend} */
export type UsdSendParameters =
    & Omit<UsdSendRequest["action"], "type" | "hyperliquidChain" | "signatureChainId" | "time">
    & Partial<Pick<UsdSendRequest["action"], "signatureChainId" | "time">>;

/** @see {@linkcode WalletClient.vaultTransfer} */
export type VaultTransferParameters =
    & Omit<VaultTransferRequest["action"], "type">
    & Partial<Pick<VaultTransferRequest, "nonce">>;

/** @see {@linkcode WalletClient.withdraw3} */
export type Withdraw3Parameters =
    & Omit<Withdraw3Request["action"], "type" | "hyperliquidChain" | "signatureChainId" | "time">
    & Partial<Pick<Withdraw3Request["action"], "signatureChainId" | "time">>;

// ———————————————Abstracts———————————————

/** Abstract interface for a [viem](https://viem.sh/docs/clients/wallet) wallet client. */
export interface AbstractViemWalletClient {
    signTypedData(params: {
        domain: {
            name: string;
            version: string;
            chainId: number;
            verifyingContract: Hex;
        };
        types: Record<string, Array<{ name: string; type: string }>>;
        primaryType: string;
        message: Record<string, unknown>;
    }): Promise<Hex>;
}

/** Abstract interface for a [ethers.js](https://docs.ethers.org/v6/api/providers/#Signer) signer. */
export interface AbstractEthersSigner {
    signTypedData(
        domain: {
            name: string;
            version: string;
            chainId: number;
            verifyingContract: string;
        },
        types: Record<string, Array<{ name: string; type: string }>>,
        value: Record<string, unknown>,
    ): Promise<string>;
}

/** Abstract interface for a [ethers.js v5](https://docs.ethers.org/v5/api/providers/#Signer) signer. */
export interface AbstractEthersV5Signer {
    _signTypedData(
        domain: {
            name: string;
            version: string;
            chainId: number;
            verifyingContract: string;
        },
        types: Record<string, Array<{ name: string; type: string }>>,
        value: Record<string, unknown>,
    ): Promise<string>;
}

// ———————————————Responses———————————————

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

/** Successful variant of {@linkcode TwapOrderResponse} without error status. */
export type TwapOrderResponseSuccess = TwapOrderResponse & {
    response: {
        data: {
            status: Exclude<TwapOrderResponse["response"]["data"]["status"], { error: string }>;
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

// ———————————————Errors———————————————

/** The error thrown when the API request returns an error response. */
export class ApiRequestError extends Error {
    constructor(
        public response: ErrorResponse | OrderResponse | CancelResponse | TwapOrderResponse | TwapCancelResponse,
    ) {
        let message = "";
        if (response.status === "err") {
            message = response.response;
        } else {
            if ("statuses" in response.response.data) {
                message = response.response.data.statuses
                    .reduce<string[]>((acc, status, index) => {
                        if (typeof status === "object" && "error" in status) {
                            acc.push(`[${index}] ${status.error}`);
                        }
                        return acc;
                    }, [])
                    .join(", ");
            } else {
                if (typeof response.response.data.status === "object" && "error" in response.response.data.status) {
                    message = response.response.data.status.error;
                }
            }
        }

        super(message);
        this.name = this.constructor.name;
    }
}

// ———————————————Client———————————————

/** Wallet client for interacting with the Hyperliquid API. */
export class WalletClient {
    /**
     * Initialises a new instance.
     * @param wallet - The WalletClient/Account ([viem](https://viem.sh/docs/clients/wallet)) or Signer ([ethers.js](https://docs.ethers.org/v6/api/providers/#Signer)) used for signing transactions.
     * @param transport - The transport used to connect to the Hyperliquid API.
     * @param isTestnet - Specifies whether the client uses testnet. Defaults to `false`.
     *
     * @example Private key via [viem](https://viem.sh/docs/clients/wallet#local-accounts-private-key-mnemonic-etc)
     * ```ts
     * import * as hl from "@nktkas/hyperliquid";
     * import { privateKeyToAccount } from "viem/accounts";
     *
     * const account = privateKeyToAccount("0x...");
     * const transport = new hl.HttpTransport(); // or WebSocketTransport
     *
     * const client = new hl.ExchangeClient(account, transport);
     * ```
     *
     * @example Private key via [ethers.js](https://docs.ethers.org/v6/api/wallet/#Wallet)
     * ```ts
     * import * as hl from "@nktkas/hyperliquid";
     * import { ethers } from "ethers";
     *
     * const wallet = new ethers.Wallet("0x...");
     * const transport = new hl.HttpTransport(); // or WebSocketTransport
     *
     * const client = new hl.ExchangeClient(wallet, transport);
     * ```
     *
     * @example External wallet (e.g. MetaMask) via [viem](https://viem.sh/docs/clients/wallet#optional-hoist-the-account)
     * ```ts
     * import * as hl from "@nktkas/hyperliquid";
     * import { createWalletClient, custom } from "viem";
     * import { arbitrum } from "viem/chains";
     *
     * const [account] = await window.ethereum.request({ method: "eth_requestAccounts" });
     * const wallet = createWalletClient({ account, chain: arbitrum, transport: custom(window.ethereum) });
     * const transport = new hl.HttpTransport(); // or WebSocketTransport
     *
     * const client = new hl.ExchangeClient(wallet, transport);
     * ```
     */
    constructor(
        public wallet: AbstractViemWalletClient | AbstractEthersSigner | AbstractEthersV5Signer,
        public transport: IRESTTransport,
        public isTestnet: boolean = false,
    ) {}

    // ———————————————Actions———————————————

    /**
     * Approve an agent to sign on behalf of the master or sub-accounts.
     * @param args - The parameters for the request.
     * @param signal - An optional abort signal
     * @returns Successful response without specific data.
     * @throws {ApiRequestError} When the API returns an error response.
     *
     * @see {@link https://hyperliquid.gitbook.io/hyperliquid-docs/for-developers/api/exchange-endpoint#approve-an-api-wallet|Hyperliquid GitBook: approveAgent}
     * @example
     * ```ts
     * const result = await client.approveAgent({
     *     agentAddress: "0x...",
     *     agentName: "agentName"
     * });
     */
    async approveAgent(args: ApproveAgentParameters, signal?: AbortSignal): Promise<SuccessResponse> {
        const action: ApproveAgentRequest["action"] = {
            ...args,
            type: "approveAgent",
            hyperliquidChain: this.isTestnet ? "Testnet" : "Mainnet",
            signatureChainId: args.signatureChainId ?? "0x66eee",
            nonce: args.nonce ?? Date.now(),
        };
        const signature = await this.signUserSignedAction(
            action,
            [
                { name: "hyperliquidChain", type: "string" },
                { name: "agentAddress", type: "address" },
                { name: "agentName", type: "string" },
                { name: "nonce", type: "uint64" },
            ],
            "HyperliquidTransaction:ApproveAgent",
            parseInt(action.signatureChainId, 16),
        );

        const response = await this.transport.request<SuccessResponse | ErrorResponse>("action", {
            action,
            signature,
            nonce: action.nonce,
        }, signal);

        this.validateResponse(response);
        return response;
    }

    /**
     * Approve a max fee rate for a builder address.
     * @param args - The parameters for the request.
     * @param signal - An optional abort signal.
     * @returns Successful response without specific data.
     * @throws {ApiRequestError} When the API returns an error response.
     *
     * @see {@link https://hyperliquid.gitbook.io/hyperliquid-docs/for-developers/api/exchange-endpoint#approve-a-builder-fee|Hyperliquid GitBook: approveBuilderFee}
     * @example
     * ```ts
     * const result = await client.approveBuilderFee({
     *     maxFeeRate: "0.01%",
     *     builder: "0x..."
     * });
     */
    async approveBuilderFee(args: ApproveBuilderFeeParameters, signal?: AbortSignal): Promise<SuccessResponse> {
        const action: ApproveBuilderFeeRequest["action"] = {
            ...args,
            type: "approveBuilderFee",
            hyperliquidChain: this.isTestnet ? "Testnet" : "Mainnet",
            signatureChainId: args.signatureChainId ?? "0x66eee",
            nonce: args.nonce ?? Date.now(),
        };
        const signature = await this.signUserSignedAction(
            action,
            [
                { name: "hyperliquidChain", type: "string" },
                { name: "maxFeeRate", type: "string" },
                { name: "builder", type: "address" },
                { name: "nonce", type: "uint64" },
            ],
            "HyperliquidTransaction:ApproveBuilderFee",
            parseInt(action.signatureChainId, 16),
        );

        const response = await this.transport.request<SuccessResponse | ErrorResponse>("action", {
            action,
            signature,
            nonce: action.nonce,
        }, signal);

        this.validateResponse(response);
        return response;
    }

    /**
     * Modify multiple orders.
     * @param args - The parameters for the request.
     * @param signal - An optional abort signal.
     * @returns Successful variant of {@linkcode OrderResponse}.
     * @throws {ApiRequestError} When the API returns an error response.
     *
     * @see {@link https://hyperliquid.gitbook.io/hyperliquid-docs/for-developers/api/exchange-endpoint#modify-multiple-orders|Hyperliquid GitBook: batchModify}
     * @example
     * ```ts
     * const result = await client.batchModify({
     *     modifies: [{
     *         oid: 123, // Order ID
     *         order: {
     *             a: 0, // Asset index
     *             b: true, // Buy order
     *             p: "31000", // New price
     *             s: "0.2", // New size
     *             r: false, // Not reduce-only
     *             t: {
     *                 limit: {
     *                     tif: "Gtc" // Good-til-cancelled
     *                 }
     *             },
     *             c: "0x..." // Optional: Client Order ID
     *         }
     *     }]
     * });
     * ```
     */
    async batchModify(args: BatchModifyParameters, signal?: AbortSignal): Promise<OrderResponseSuccess> {
        const {
            vaultAddress,
            nonce = Date.now(),
            ...actionArgs
        } = args;

        const sortedAction = sortActionKeys({ type: "batchModify", ...actionArgs });
        const signature = await this.signL1Action(sortedAction, nonce, vaultAddress);

        const request: BatchModifyRequest = {
            action: sortedAction,
            signature,
            nonce,
            vaultAddress,
        };
        const response = await this.transport.request<OrderResponse>("action", request, signal);

        this.validateResponse(response);
        return response;
    }

    /**
     * Cancel order(s).
     * @param args - The parameters for the request.
     * @param signal - An optional abort signal.
     * @returns Successful variant of {@linkcode CancelResponse}.
     * @throws {ApiRequestError} When the API returns an error response.
     *
     * @see {@link https://hyperliquid.gitbook.io/hyperliquid-docs/for-developers/api/exchange-endpoint#cancel-order-s|Hyperliquid GitBook: cancel}
     * @example
     * ```ts
     * const result = await client.cancel({
     *     cancels: [{
     *         a: 0,  // Asset index
     *         o: 123 // Order ID
     *     }]
     * });
     * ```
     */
    async cancel(args: CancelParameters, signal?: AbortSignal): Promise<CancelResponseSuccess> {
        const {
            vaultAddress,
            nonce = Date.now(),
            ...actionArgs
        } = args;

        const sortedAction = sortActionKeys({ type: "cancel", ...actionArgs });
        const signature = await this.signL1Action(sortedAction, nonce, vaultAddress);

        const request: CancelRequest = {
            action: sortedAction,
            signature,
            nonce,
            vaultAddress,
        };
        const response = await this.transport.request<CancelResponse>("action", request, signal);

        this.validateResponse(response);
        return response;
    }

    /**
     * Cancel order(s) by Client Order ID.
     * @param args - The parameters for the request.
     * @param signal - An optional abort signal.
     * @returns Successful variant of {@linkcode CancelResponse}.
     * @throws {ApiRequestError} When the API returns an error response.
     *
     * @see {@link https://hyperliquid.gitbook.io/hyperliquid-docs/for-developers/api/exchange-endpoint#cancel-order-s-by-cloid|Hyperliquid GitBook: cancelByCloid}
     * @example
     * ```ts
     * const result = await client.cancelByCloid({
     *     cancels: [{
     *         asset: 0,
     *         cloid: "0x..." // Client Order ID
     *     }]
     * });
     * ```
     */
    async cancelByCloid(args: CancelByCloidParameters, signal?: AbortSignal): Promise<CancelResponseSuccess> {
        const {
            vaultAddress,
            nonce = Date.now(),
            ...actionArgs
        } = args;

        const sortedAction = sortActionKeys({ type: "cancelByCloid", ...actionArgs });
        const signature = await this.signL1Action(sortedAction, nonce, vaultAddress);

        const request: CancelByCloidRequest = {
            action: sortedAction,
            signature,
            nonce,
            vaultAddress,
        };
        const response = await this.transport.request<CancelResponse>("action", request, signal);

        this.validateResponse(response);
        return response;
    }

    /**
     * Create a sub-account.
     * @param args - The parameters for the request.
     * @param signal - An optional abort signal.
     * @returns Response for creating a sub-account.
     * @throws {ApiRequestError} When the API returns an error response.
     *
     * @see null
     * @example
     * ```ts
     * const result = await client.createSubAccount({
     *     name: "subAccountName"
     * });
     * ```
     */
    async createSubAccount(args: CreateSubAccountParameters, signal?: AbortSignal): Promise<CreateSubAccountResponse> {
        const {
            nonce = Date.now(),
            ...actionArgs
        } = args;

        const sortedAction = sortActionKeys({ type: "createSubAccount", ...actionArgs });
        const signature = await this.signL1Action(sortedAction, nonce);

        const request: CreateSubAccountRequest = {
            action: sortedAction,
            signature,
            nonce,
        };
        const response = await this.transport.request<CreateSubAccountResponse | ErrorResponse>(
            "action",
            request,
            signal,
        );

        this.validateResponse(response);
        return response;
    }

    /**
     * Modify an order.
     * @param args - The parameters for the request.
     * @param signal - An optional abort signal.
     * @returns Successful response without specific data.
     * @throws {ApiRequestError} When the API returns an error response.
     *
     * @see {@link https://hyperliquid.gitbook.io/hyperliquid-docs/for-developers/api/exchange-endpoint#modify-an-order|Hyperliquid GitBook: modify}
     * @example
     * ```ts
     * const result = await client.modify({
     *     oid: 123, // Order ID
     *     order: {
     *         a: 0, // Asset index
     *         b: true, // Buy order
     *         p: "31000", // New price
     *         s: "0.2", // New size
     *         r: false, // Not reduce-only
     *         t: {
     *             limit: {
     *                 tif: "Gtc" // Good-til-cancelled
     *             }
     *         },
     *         c: "0x..." // Optional: Client Order ID
     *     }
     * });
     * ```
     */
    async modify(args: ModifyParameters, signal?: AbortSignal): Promise<SuccessResponse> {
        const {
            vaultAddress,
            nonce = Date.now(),
            ...actionArgs
        } = args;

        const sortedAction = sortActionKeys({ type: "modify", ...actionArgs });
        const signature = await this.signL1Action(sortedAction, nonce, vaultAddress);

        const request: ModifyRequest = {
            action: sortedAction,
            signature,
            nonce,
            vaultAddress,
        };
        const response = await this.transport.request<SuccessResponse | ErrorResponse>("action", request, signal);

        this.validateResponse(response);
        return response;
    }

    /**
     * Place an order(s).
     * @param args - The parameters for the request.
     * @param signal - An optional abort signal.
     * @returns Successful variant of {@linkcode OrderResponse}.
     * @throws {ApiRequestError} When the API returns an error response.
     *
     * @see {@link https://hyperliquid.gitbook.io/hyperliquid-docs/for-developers/api/exchange-endpoint#place-an-order|Hyperliquid GitBook: order}
     * @example
     * ```ts
     * const result = await client.order({
     *     orders: [{
     *         a: 0, // Asset index
     *         b: true, // Buy order
     *         p: "30000", // Price
     *         s: "0.1", // Size
     *         r: false, // Not reduce-only
     *         t: {
     *             limit: {
     *                 tif: "Gtc" // Good-til-cancelled
     *             }
     *         },
     *         c: "0x..." // Optional: Client Order ID
     *     }],
     *     grouping: "na" // No grouping
     * });
     * ```
     */
    async order(args: OrderParameters, signal?: AbortSignal): Promise<OrderResponseSuccess> {
        const {
            vaultAddress,
            nonce = Date.now(),
            ...actionArgs
        } = args;

        if (actionArgs.builder) actionArgs.builder.b = actionArgs.builder.b.toLowerCase() as Hex;

        const sortedAction = sortActionKeys({ type: "order", ...actionArgs });
        const signature = await this.signL1Action(sortedAction, nonce, vaultAddress);

        const request: OrderRequest = {
            action: sortedAction,
            signature,
            nonce,
            vaultAddress,
        };
        const response = await this.transport.request<OrderResponse>("action", request, signal);

        this.validateResponse(response);
        return response;
    }

    /**
     * Schedule a time to cancel all open orders.
     * @param args - The parameters for the request.
     * @param signal - An optional abort signal.
     * @returns Successful response without specific data.
     * @throws {ApiRequestError} When the API returns an error response.
     *
     * @see {@link https://hyperliquid.gitbook.io/hyperliquid-docs/for-developers/api/exchange-endpoint#schedule-cancel-dead-mans-switch|Hyperliquid GitBook: scheduleCancel}
     * @example
     * ```ts
     * const result = await client.scheduleCancel({
     *     time: Date.now() + 3600000 // Schedule cancellation 1 hour from now
     * });
     * ```
     */
    async scheduleCancel(args: ScheduleCancelParameters, signal?: AbortSignal): Promise<SuccessResponse> {
        const {
            vaultAddress,
            nonce = Date.now(),
            ...actionArgs
        } = args;

        const sortedAction = sortActionKeys({ type: "scheduleCancel", ...actionArgs });
        const signature = await this.signL1Action(sortedAction, nonce, vaultAddress);

        const request: ScheduleCancelRequest = {
            action: sortedAction,
            signature,
            nonce,
            vaultAddress,
        };
        const response = await this.transport.request<SuccessResponse | ErrorResponse>("action", request, signal);

        this.validateResponse(response);
        return response;
    }

    /**
     * Set a referral code.
     * @param args - The parameters for the request.
     * @param signal - An optional abort signal.
     * @returns Successful response without specific data.
     * @throws {ApiRequestError} When the API returns an error response.
     *
     * @see null
     * @example
     * ```ts
     * const result = await client.setReferrer({
     *     code: "TEST"
     * });
     * ```
     */
    async setReferrer(args: SetReferrerParameters, signal?: AbortSignal): Promise<SuccessResponse> {
        const {
            nonce = Date.now(),
            ...actionArgs
        } = args;

        const sortedAction = sortActionKeys({ type: "setReferrer", ...actionArgs });
        const signature = await this.signL1Action(sortedAction, nonce);

        const request: SetReferrerRequest = {
            action: sortedAction,
            signature,
            nonce,
        };
        const response = await this.transport.request<SuccessResponse | ErrorResponse>("action", request, signal);

        this.validateResponse(response);
        return response;
    }

    /**
     * Transfer a spot asset on L1 to another address.
     * @param args - The parameters for the request.
     * @param signal - An optional abort signal.
     * @returns Successful response without specific data.
     * @throws {ApiRequestError} When the API returns an error response.
     *
     * @see {@link https://hyperliquid.gitbook.io/hyperliquid-docs/for-developers/api/exchange-endpoint#l1-spot-transfer|Hyperliquid GitBook: spotSend}
     * @example
     * ```ts
     * const result = await client.spotSend({
     *     destination: "0x...",
     *     token: "USDC:0xeb62eee3685fc4c43992febcd9e75443",
     *     amount: "1"
     * });
     * ```
     */
    async spotSend(args: SpotSendParameters, signal?: AbortSignal): Promise<SuccessResponse> {
        const action: SpotSendRequest["action"] = {
            ...args,
            type: "spotSend",
            hyperliquidChain: this.isTestnet ? "Testnet" : "Mainnet",
            signatureChainId: args.signatureChainId ?? "0x66eee",
            time: args.time ?? Date.now(),
        };
        const signature = await this.signUserSignedAction(
            action,
            [
                { name: "hyperliquidChain", type: "string" },
                { name: "destination", type: "string" },
                { name: "token", type: "string" },
                { name: "amount", type: "string" },
                { name: "time", type: "uint64" },
            ],
            "HyperliquidTransaction:SpotSend",
            parseInt(action.signatureChainId, 16),
        );

        const response = await this.transport.request<SuccessResponse | ErrorResponse>("action", {
            action,
            signature,
            nonce: action.time,
        }, signal);

        this.validateResponse(response);
        return response;
    }

    /**
     * Transfer between sub-accounts.
     * @param args - The parameters for the request.
     * @param signal - An optional abort signal.
     * @returns Successful response without specific data.
     * @throws {ApiRequestError} When the API returns an error response.
     *
     * @see null
     * @example
     * ```ts
     * const result = await client.subAccountTransfer({
     *     subAccountUser: "0x...",
     *     isDeposit: true,
     *     usd: 1000000 // 1 USD in raw units (float amount * 1e6)
     * });
     * ```
     */
    async subAccountTransfer(args: SubAccountTransferParameters, signal?: AbortSignal): Promise<SuccessResponse> {
        const {
            nonce = Date.now(),
            ...actionArgs
        } = args;

        const sortedAction = sortActionKeys({ type: "subAccountTransfer", ...actionArgs });
        const signature = await this.signL1Action(sortedAction, nonce);

        const request: SubAccountTransferRequest = {
            action: sortedAction,
            signature,
            nonce,
        };
        const response = await this.transport.request<SuccessResponse | ErrorResponse>("action", request, signal);

        this.validateResponse(response);
        return response;
    }

    /**
     * Cancel a TWAP order.
     * @param args - The parameters for the request.
     * @param signal - An optional abort signal.
     * @returns Successful response without specific data.
     * @throws {ApiRequestError} When the API returns an error response.
     *
     * @see {@link https://hyperliquid.gitbook.io/hyperliquid-docs/for-developers/api/exchange-endpoint#cancel-a-twap-order|Hyperliquid GitBook: twapCancel}
     * @example
     * ```ts
     * const result = await client.twapCancel({
     *     a: 0, // Asset index
     *     t: 1 // TWAP ID
     * });
     * ```
     */
    async twapCancel(args: TwapCancelParameters, signal?: AbortSignal): Promise<TwapCancelResponseSuccess> {
        const {
            vaultAddress,
            nonce = Date.now(),
            ...actionArgs
        } = args;

        const sortedAction = sortActionKeys({ type: "twapCancel", ...actionArgs });
        const signature = await this.signL1Action(sortedAction, nonce, vaultAddress);

        const request: TwapCancelRequest = {
            action: sortedAction,
            signature,
            nonce,
            vaultAddress,
        };
        const response = await this.transport.request<TwapCancelResponse>("action", request, signal);

        this.validateResponse(response);
        return response;
    }

    /**
     * Place a TWAP order.
     * @param args - The parameters for the request.
     * @param signal - An optional abort signal.
     * @returns Successful response without specific data.
     * @throws {ApiRequestError} When the API returns an error response.
     *
     * @see {@link https://hyperliquid.gitbook.io/hyperliquid-docs/for-developers/api/exchange-endpoint#place-a-twap-order|Hyperliquid GitBook: twapOrder}
     * @example
     * ```ts
     * const result = await client.twapOrder({
     *     a: 0, // Asset index
     *     b: true, // Buy order
     *     s: "1", // Size
     *     r: false, // Not reduce-only
     *     m: 10, // Duration in minutes
     *     t: true // Randomize order timing
     * });
     * ```
     */
    async twapOrder(args: TwapOrderParameters, signal?: AbortSignal): Promise<TwapOrderResponseSuccess> {
        const {
            vaultAddress,
            nonce = Date.now(),
            ...actionArgs
        } = args;

        const sortedAction = sortActionKeys({ type: "twapOrder", twap: actionArgs });
        const signature = await this.signL1Action(sortedAction, nonce, vaultAddress);

        const request: TwapOrderRequest = {
            action: sortedAction,
            signature,
            nonce,
            vaultAddress,
        };
        const response = await this.transport.request<TwapOrderResponse>("action", request, signal);

        this.validateResponse(response);
        return response;
    }

    /**
     * Update isolated margin for a position.
     * @param args - The parameters for the request.
     * @param signal - An optional abort signal.
     * @returns Successful response without specific data.
     * @throws {ApiRequestError} When the API returns an error response.
     *
     * @see {@link https://hyperliquid.gitbook.io/hyperliquid-docs/for-developers/api/exchange-endpoint#update-isolated-margin|Hyperliquid GitBook: updateIsolatedMargin}
     * @example
     * ```ts
     * const result = await client.updateIsolatedMargin({
     *     asset: 0,
     *     isBuy: true, // Add to long position
     *     ntli: 1000 // Add 1000 USD margin (integer only)
     * });
     * ```
     */
    async updateIsolatedMargin(args: UpdateIsolatedMarginParameters, signal?: AbortSignal): Promise<SuccessResponse> {
        const {
            vaultAddress,
            nonce = Date.now(),
            ...actionArgs
        } = args;

        const sortedAction = sortActionKeys({ type: "updateIsolatedMargin", ...actionArgs });
        const signature = await this.signL1Action(sortedAction, nonce, vaultAddress);

        const request: UpdateIsolatedMarginRequest = {
            action: sortedAction,
            signature,
            nonce,
            vaultAddress,
        };
        const response = await this.transport.request<SuccessResponse | ErrorResponse>("action", request, signal);

        this.validateResponse(response);
        return response;
    }

    /**
     * Update leverage for cross or isolated margin.
     * @param args - The parameters for the request.
     * @param signal - An optional abort signal.
     * @returns Successful response without specific data.
     * @throws {ApiRequestError} When the API returns an error response.
     *
     * @see {@link https://hyperliquid.gitbook.io/hyperliquid-docs/for-developers/api/exchange-endpoint#update-leverage|Hyperliquid GitBook: updateLeverage}
     * @example
     * ```ts
     * const result = await client.updateLeverage({
     *     asset: 0,
     *     isCross: true,
     *     leverage: 5
     * });
     * ```
     */
    async updateLeverage(args: UpdateLeverageParameters, signal?: AbortSignal): Promise<SuccessResponse> {
        const {
            vaultAddress,
            nonce = Date.now(),
            ...actionArgs
        } = args;

        const sortedAction = sortActionKeys({ type: "updateLeverage", ...actionArgs });
        const signature = await this.signL1Action(sortedAction, nonce, vaultAddress);

        const request: UpdateLeverageRequest = {
            action: sortedAction,
            signature,
            nonce,
            vaultAddress,
        };
        const response = await this.transport.request<SuccessResponse | ErrorResponse>("action", request, signal);

        this.validateResponse(response);
        return response;
    }

    /**
     * Transfer funds between Spot and Perp accounts.
     * @param args - The parameters for the request.
     * @param signal - An optional abort signal.
     * @returns Successful response without specific data.
     * @throws {ApiRequestError} When the API returns an error response.
     *
     * @see null
     * @example
     * ```ts
     * const result = await client.usdClassTransfer({
     *     amount: "1000",
     *     toPerp: true // Transfer from Spot to Perp
     * });
     * ```
     */
    async usdClassTransfer(args: UsdClassTransferParameters, signal?: AbortSignal): Promise<SuccessResponse> {
        const action: UsdClassTransferRequest["action"] = {
            ...args,
            type: "usdClassTransfer",
            hyperliquidChain: this.isTestnet ? "Testnet" : "Mainnet",
            signatureChainId: args.signatureChainId ?? "0x66eee",
            nonce: args.nonce ?? Date.now(),
        };
        const signature = await this.signUserSignedAction(
            action,
            [
                { name: "hyperliquidChain", type: "string" },
                { name: "amount", type: "string" },
                { name: "toPerp", type: "bool" },
                { name: "nonce", type: "uint64" },
            ],
            "HyperliquidTransaction:UsdClassTransfer",
            parseInt(action.signatureChainId, 16),
        );

        const response = await this.transport.request<SuccessResponse | ErrorResponse>("action", {
            action,
            signature,
            nonce: action.nonce,
        }, signal);

        this.validateResponse(response);
        return response;
    }

    /**
     * Transfer USDC on L1 to another address.
     * @param args - The parameters for the request.
     * @param signal - An optional abort signal.
     * @returns Successful response without specific data.
     * @throws {ApiRequestError} When the API returns an error response.
     *
     * @see {@link https://hyperliquid.gitbook.io/hyperliquid-docs/for-developers/api/exchange-endpoint#l1-usdc-transfer|Hyperliquid GitBook: usdSend}
     * @example
     * ```ts
     * const result = await client.usdSend({
     *     destination: "0x...",
     *     amount: "1000"
     * });
     * ```
     */
    async usdSend(args: UsdSendParameters, signal?: AbortSignal): Promise<SuccessResponse> {
        const action: UsdSendRequest["action"] = {
            ...args,
            type: "usdSend",
            hyperliquidChain: this.isTestnet ? "Testnet" : "Mainnet",
            signatureChainId: args.signatureChainId ?? "0x66eee",
            time: args.time ?? Date.now(),
        };
        const signature = await this.signUserSignedAction(
            action,
            [
                { name: "hyperliquidChain", type: "string" },
                { name: "destination", type: "string" },
                { name: "amount", type: "string" },
                { name: "time", type: "uint64" },
            ],
            "HyperliquidTransaction:UsdSend",
            parseInt(action.signatureChainId, 16),
        );

        const response = await this.transport.request<SuccessResponse | ErrorResponse>("action", {
            action,
            signature,
            nonce: action.time,
        }, signal);

        this.validateResponse(response);
        return response;
    }

    /**
     * Transfer funds to/from a vault.
     * @param args - The parameters for the request.
     * @param signal - An optional abort signal.
     * @returns Successful response without specific data.
     * @throws {ApiRequestError} When the API returns an error response.
     *
     * @see {@link https://hyperliquid.gitbook.io/hyperliquid-docs/for-developers/api/exchange-endpoint#deposit-or-withdraw-from-a-vault|Hyperliquid GitBook: vaultTransfer}
     * @example
     * ```ts
     * const result = await client.vaultTransfer({
     *     vaultAddress: "0x...",
     *     isDeposit: true,
     *     usd: 1000000 // 1 USD in raw units (float amount * 1e6)
     * });
     * ```
     */
    async vaultTransfer(args: VaultTransferParameters, signal?: AbortSignal): Promise<SuccessResponse> {
        const {
            nonce = Date.now(),
            ...actionArgs
        } = args;

        const sortedAction = sortActionKeys({ type: "vaultTransfer", ...actionArgs });
        const signature = await this.signL1Action(sortedAction, nonce);

        const request: VaultTransferRequest = {
            action: sortedAction,
            signature,
            nonce,
        };
        const response = await this.transport.request<SuccessResponse | ErrorResponse>("action", request, signal);

        this.validateResponse(response);
        return response;
    }

    /**
     * Initiate a withdrawal request.
     * @param args - The parameters for the request.
     * @param signal - An optional abort signal.
     * @returns Successful response without specific data.
     * @throws {ApiRequestError} When the API returns an error response.
     *
     * @see {@link https://hyperliquid.gitbook.io/hyperliquid-docs/for-developers/api/exchange-endpoint#initiate-a-withdrawal-request|Hyperliquid GitBook: withdraw3}
     * @example
     * ```ts
     * const result = await client.withdraw3({
     *     destination: "0x...",
     *     amount: "1000"
     * });
     * ```
     */
    async withdraw3(args: Withdraw3Parameters, signal?: AbortSignal): Promise<SuccessResponse> {
        const action: Withdraw3Request["action"] = {
            ...args,
            type: "withdraw3",
            hyperliquidChain: this.isTestnet ? "Testnet" : "Mainnet",
            signatureChainId: args.signatureChainId ?? "0x66eee",
            time: args.time ?? Date.now(),
        };
        const signature = await this.signUserSignedAction(
            action,
            [
                { name: "hyperliquidChain", type: "string" },
                { name: "destination", type: "string" },
                { name: "amount", type: "string" },
                { name: "time", type: "uint64" },
            ],
            "HyperliquidTransaction:Withdraw",
            parseInt(action.signatureChainId, 16),
        );

        const response = await this.transport.request<SuccessResponse | ErrorResponse>("action", {
            action,
            signature,
            nonce: action.time,
        }, signal);

        this.validateResponse(response);
        return response;
    }

    // ———————————————Signatures———————————————

    /**
     * Sign an L1 action.
     * @param action - The action to sign.
     * @param nonce - The nonce.
     * @param vaultAddress - The vault address.
     * @returns The signature.
     */
    protected async signL1Action(
        action: Record<string, unknown>,
        nonce: number,
        vaultAddress?: Hex,
    ): Promise<{ r: Hex; s: Hex; v: number }> {
        const domain = {
            name: "Exchange",
            version: "1",
            chainId: 1337,
            verifyingContract: "0x0000000000000000000000000000000000000000",
        } as const;
        const types = {
            Agent: [
                { name: "source", type: "string" },
                { name: "connectionId", type: "bytes32" },
            ],
        };

        const actionHash = this.createActionHash(action, nonce, vaultAddress);
        const message = {
            source: this.isTestnet ? "b" : "a",
            connectionId: actionHash,
        };

        let signature: string;
        if (this.isAbstractViemWalletClient(this.wallet)) {
            signature = await this.wallet.signTypedData({ domain, types, primaryType: "Agent", message });
        } else if (this.isAbstractEthersSigner(this.wallet)) {
            signature = await this.wallet.signTypedData(domain, types, message);
        } else if (this.isAbstractEthersV5Signer(this.wallet)) {
            signature = await this.wallet._signTypedData(domain, types, message);
        } else {
            throw new Error("Unsupported wallet for signing typed data", { cause: this.wallet });
        }
        return parseSignature(signature);
    }

    /**
     * Sign a user-signed action.
     * @param action - The action to sign.
     * @param payloadTypes - The payload types.
     * @param primaryType - The primary type.
     * @param chainId - The chain ID.
     * @returns The signature.
     */
    protected async signUserSignedAction(
        action: Record<string, unknown>,
        payloadTypes: Array<{ name: string; type: string }>,
        primaryType: string,
        chainId: number,
    ): Promise<{ r: Hex; s: Hex; v: number }> {
        const domain = {
            name: "HyperliquidSignTransaction",
            version: "1",
            chainId,
            verifyingContract: "0x0000000000000000000000000000000000000000",
        } as const;
        const types = {
            [primaryType]: payloadTypes,
        };

        let signature: string;
        if (this.isAbstractViemWalletClient(this.wallet)) {
            signature = await this.wallet.signTypedData({ domain, types, primaryType, message: action });
        } else if (this.isAbstractEthersSigner(this.wallet)) {
            signature = await this.wallet.signTypedData(domain, types, action);
        } else if (this.isAbstractEthersV5Signer(this.wallet)) {
            signature = await this.wallet._signTypedData(domain, types, action);
        } else {
            throw new Error("Unsupported wallet for signing typed data", { cause: this.wallet });
        }
        return parseSignature(signature);
    }

    /**
     * Create a hash of the action.
     * @param action - The action to hash.
     * @param nonce - The nonce.
     * @param vaultAddress - The vault address.
     * @returns The hash of the action.
     */
    protected createActionHash(action: unknown, nonce: number, vaultAddress?: Hex): Hex {
        const msgPackBytes = encode(action, { ignoreUndefined: true });
        const additionalBytesLength = vaultAddress ? 29 : 9;

        const data = new Uint8Array(msgPackBytes.length + additionalBytesLength);
        data.set(msgPackBytes);

        const view = new DataView(data.buffer);
        view.setBigUint64(msgPackBytes.length, BigInt(nonce));

        if (vaultAddress) {
            view.setUint8(msgPackBytes.length + 8, 1);
            data.set(hexToBytes(vaultAddress), msgPackBytes.length + 9);
        } else {
            view.setUint8(msgPackBytes.length + 8, 0);
        }

        return bytesToHex(keccak_256(data));
    }

    // ———————————————Errors———————————————

    /**
     * Validate the response.
     * @param response - The response to validate.
     */
    protected validateResponse(
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

    // ———————————————Abstracts———————————————

    /**
     * Checks if the given client is an abstract wallet client (viem).
     * @param client - The client to check.
     * @returns A boolean indicating if the client is an abstract wallet client.
     */
    protected isAbstractViemWalletClient(client: unknown): client is AbstractViemWalletClient {
        return typeof client === "object" && client !== null &&
            "signTypedData" in client && typeof client.signTypedData === "function" &&
            client.signTypedData.length === 1;
    }

    /**
     * Checks if the given client is an abstract signer (ethers.js).
     * @param client - The client to check.
     * @returns A boolean indicating if the client is an abstract signer.
     */
    protected isAbstractEthersSigner(client: unknown): client is AbstractEthersSigner {
        return typeof client === "object" && client !== null &&
            "signTypedData" in client && typeof client.signTypedData === "function" &&
            client.signTypedData.length === 3;
    }

    /**
     * Checks if the given client is an abstract signer (ethers.js v5).
     * @param client - The client to check.
     * @returns A boolean indicating if the client is an abstract signer.
     */
    protected isAbstractEthersV5Signer(client: unknown): client is AbstractEthersV5Signer {
        return typeof client === "object" && client !== null &&
            "_signTypedData" in client && typeof client._signTypedData === "function" &&
            client._signTypedData.length === 3;
    }
}
