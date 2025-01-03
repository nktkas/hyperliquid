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
import type { IRESTTransport } from "../transports/base.ts";
import {
    type AbstractEthersSigner,
    type AbstractEthersV5Signer,
    type AbstractViemWalletClient,
    signL1Action,
    signUserSignedAction,
} from "../utils/signing.ts";
import type { Hex } from "../utils/hex.ts";
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

// ———————————————Errors———————————————

/** The error thrown when the API request returns an error response. */
export class ApiRequestError extends Error {
    constructor(
        public response:
            | ErrorResponse
            | OrderResponse
            | CancelResponse
            | TwapOrderResponse
            | TwapCancelResponse,
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
export class WalletClient<
    T extends IRESTTransport = IRESTTransport,
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
     * import { arbitrum } from "viem/chains";
     *
     * const [account] = await window.ethereum.request({ method: "eth_requestAccounts" });
     * const wallet = createWalletClient({ account, chain: arbitrum, transport: custom(window.ethereum) });
     *
     * const transport = new hl.HttpTransport(); // or WebSocketTransport
     * const client = new hl.WalletClient({ wallet, transport });
     * ```
     */
    constructor(args: {
        /** The transport used to connect to the Hyperliquid API. */
        transport: T;

        /** The WalletClient/Account ([viem](https://viem.sh/docs/clients/wallet)) or Signer ([ethers.js](https://docs.ethers.org/v6/api/providers/#Signer)) used for signing transactions. */
        wallet: W;

        /** Specifies whether the client uses testnet. Defaults to `false`. */
        isTestnet?: boolean;

        /** Sets a default vaultAddress to be used if no vaultAddress is explicitly passed to a method. */
        defaultVaultAddress?: Hex;
    }) {
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
     * @see {@link https://hyperliquid.gitbook.io/hyperliquid-docs/for-developers/api/exchange-endpoint#approve-an-api-wallet|Hyperliquid GitBook}
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
            signatureChainId: args.signatureChainId ?? this.isTestnet ? "0x66eee" : "0xa4b1",
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
        const response = await this.transport.request<SuccessResponse | ErrorResponse>("action", request, signal);

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
     * @see {@link https://hyperliquid.gitbook.io/hyperliquid-docs/for-developers/api/exchange-endpoint#approve-a-builder-fee|Hyperliquid GitBook}
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
            signatureChainId: args.signatureChainId ?? this.isTestnet ? "0x66eee" : "0xa4b1",
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
        const response = await this.transport.request<SuccessResponse | ErrorResponse>("action", request, signal);

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
     * @see {@link https://hyperliquid.gitbook.io/hyperliquid-docs/for-developers/api/exchange-endpoint#modify-multiple-orders|Hyperliquid GitBook}
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
            vaultAddress = this.defaultVaultAddress,
            nonce = Date.now(),
            ...actionArgs
        } = args;

        const sortedAction = sortActionKeys({ type: "batchModify", ...actionArgs });
        const cleanedAction = removeUndefinedValues(sortedAction);
        const signature = await signL1Action(this.wallet, this.isTestnet, cleanedAction, nonce, vaultAddress);

        const request: BatchModifyRequest = {
            action: cleanedAction,
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
     * @see {@link https://hyperliquid.gitbook.io/hyperliquid-docs/for-developers/api/exchange-endpoint#cancel-order-s|Hyperliquid GitBook}
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
            vaultAddress = this.defaultVaultAddress,
            nonce = Date.now(),
            ...actionArgs
        } = args;

        const sortedAction = sortActionKeys({ type: "cancel", ...actionArgs });
        const cleanedAction = removeUndefinedValues(sortedAction);
        const signature = await signL1Action(this.wallet, this.isTestnet, cleanedAction, nonce, vaultAddress);

        const request: CancelRequest = {
            action: cleanedAction,
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
     * @see {@link https://hyperliquid.gitbook.io/hyperliquid-docs/for-developers/api/exchange-endpoint#cancel-order-s-by-cloid|Hyperliquid GitBook}
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
            vaultAddress = this.defaultVaultAddress,
            nonce = Date.now(),
            ...actionArgs
        } = args;

        const sortedAction = sortActionKeys({ type: "cancelByCloid", ...actionArgs });
        const cleanedAction = removeUndefinedValues(sortedAction);
        const signature = await signL1Action(this.wallet, this.isTestnet, cleanedAction, nonce, vaultAddress);

        const request: CancelByCloidRequest = {
            action: cleanedAction,
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
        const cleanedAction = removeUndefinedValues(sortedAction);
        const signature = await signL1Action(this.wallet, this.isTestnet, cleanedAction, nonce);

        const request: CreateSubAccountRequest = {
            action: cleanedAction,
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
     * @see {@link https://hyperliquid.gitbook.io/hyperliquid-docs/for-developers/api/exchange-endpoint#modify-an-order|Hyperliquid GitBook}
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
            vaultAddress = this.defaultVaultAddress,
            nonce = Date.now(),
            ...actionArgs
        } = args;

        const sortedAction = sortActionKeys({ type: "modify", ...actionArgs });
        const cleanedAction = removeUndefinedValues(sortedAction);
        const signature = await signL1Action(this.wallet, this.isTestnet, cleanedAction, nonce, vaultAddress);

        const request: ModifyRequest = {
            action: cleanedAction,
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
     * @see {@link https://hyperliquid.gitbook.io/hyperliquid-docs/for-developers/api/exchange-endpoint#place-an-order|Hyperliquid GitBook}
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
        const clonedArgs = structuredClone(args); // Clone to prevent mutation of original object
        const {
            vaultAddress = this.defaultVaultAddress,
            nonce = Date.now(),
            ...actionArgs
        } = clonedArgs;

        if (actionArgs.builder) actionArgs.builder.b = actionArgs.builder.b.toLowerCase() as Hex;

        const sortedAction = sortActionKeys({ type: "order", ...actionArgs });
        const cleanedAction = removeUndefinedValues(sortedAction);
        const signature = await signL1Action(this.wallet, this.isTestnet, cleanedAction, nonce, vaultAddress);

        const request: OrderRequest = {
            action: cleanedAction,
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
     * @see {@link https://hyperliquid.gitbook.io/hyperliquid-docs/for-developers/api/exchange-endpoint#schedule-cancel-dead-mans-switch|Hyperliquid GitBook}
     * @example
     * ```ts
     * const result = await client.scheduleCancel({
     *     time: Date.now() + 3600000 // Schedule cancellation 1 hour from now
     * });
     * ```
     */
    async scheduleCancel(args: ScheduleCancelParameters = {}, signal?: AbortSignal): Promise<SuccessResponse> {
        const {
            vaultAddress = this.defaultVaultAddress,
            nonce = Date.now(),
            ...actionArgs
        } = args;

        const sortedAction = sortActionKeys({ type: "scheduleCancel", ...actionArgs });
        const cleanedAction = removeUndefinedValues(sortedAction);
        const signature = await signL1Action(this.wallet, this.isTestnet, cleanedAction, nonce, vaultAddress);

        const request: ScheduleCancelRequest = {
            action: cleanedAction,
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
        const cleanedAction = removeUndefinedValues(sortedAction);
        const signature = await signL1Action(this.wallet, this.isTestnet, cleanedAction, nonce);

        const request: SetReferrerRequest = {
            action: cleanedAction,
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
     * @see {@link https://hyperliquid.gitbook.io/hyperliquid-docs/for-developers/api/exchange-endpoint#l1-spot-transfer|Hyperliquid GitBook}
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
            signatureChainId: args.signatureChainId ?? this.isTestnet ? "0x66eee" : "0xa4b1",
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
        const response = await this.transport.request<SuccessResponse | ErrorResponse>("action", request, signal);

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
        const cleanedAction = removeUndefinedValues(sortedAction);
        const signature = await signL1Action(this.wallet, this.isTestnet, cleanedAction, nonce);

        const request: SubAccountTransferRequest = {
            action: cleanedAction,
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
     * @see {@link https://hyperliquid.gitbook.io/hyperliquid-docs/for-developers/api/exchange-endpoint#cancel-a-twap-order|Hyperliquid GitBook}
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
            vaultAddress = this.defaultVaultAddress,
            nonce = Date.now(),
            ...actionArgs
        } = args;

        const sortedAction = sortActionKeys({ type: "twapCancel", ...actionArgs });
        const cleanedAction = removeUndefinedValues(sortedAction);
        const signature = await signL1Action(this.wallet, this.isTestnet, cleanedAction, nonce, vaultAddress);

        const request: TwapCancelRequest = {
            action: cleanedAction,
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
     * @see {@link https://hyperliquid.gitbook.io/hyperliquid-docs/for-developers/api/exchange-endpoint#place-a-twap-order|Hyperliquid GitBook}
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
            vaultAddress = this.defaultVaultAddress,
            nonce = Date.now(),
            ...actionArgs
        } = args;

        const sortedAction = sortActionKeys({ type: "twapOrder", twap: actionArgs });
        const cleanedAction = removeUndefinedValues(sortedAction);
        const signature = await signL1Action(this.wallet, this.isTestnet, cleanedAction, nonce, vaultAddress);

        const request: TwapOrderRequest = {
            action: cleanedAction,
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
     * @see {@link https://hyperliquid.gitbook.io/hyperliquid-docs/for-developers/api/exchange-endpoint#update-isolated-margin|Hyperliquid GitBook}
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
            vaultAddress = this.defaultVaultAddress,
            nonce = Date.now(),
            ...actionArgs
        } = args;

        const sortedAction = sortActionKeys({ type: "updateIsolatedMargin", ...actionArgs });
        const cleanedAction = removeUndefinedValues(sortedAction);
        const signature = await signL1Action(this.wallet, this.isTestnet, cleanedAction, nonce, vaultAddress);

        const request: UpdateIsolatedMarginRequest = {
            action: cleanedAction,
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
     * @see {@link https://hyperliquid.gitbook.io/hyperliquid-docs/for-developers/api/exchange-endpoint#update-leverage|Hyperliquid GitBook}
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
            vaultAddress = this.defaultVaultAddress,
            nonce = Date.now(),
            ...actionArgs
        } = args;

        const sortedAction = sortActionKeys({ type: "updateLeverage", ...actionArgs });
        const cleanedAction = removeUndefinedValues(sortedAction);
        const signature = await signL1Action(this.wallet, this.isTestnet, cleanedAction, nonce, vaultAddress);

        const request: UpdateLeverageRequest = {
            action: cleanedAction,
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
     * @see {@link https://hyperliquid.gitbook.io/hyperliquid-docs/for-developers/api/exchange-endpoint#transfer-from-spot-account-to-perp-account-and-vice-versa|Hyperliquid GitBook}
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
            signatureChainId: args.signatureChainId ?? this.isTestnet ? "0x66eee" : "0xa4b1",
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
        const response = await this.transport.request<SuccessResponse | ErrorResponse>("action", request, signal);

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
     * @see {@link https://hyperliquid.gitbook.io/hyperliquid-docs/for-developers/api/exchange-endpoint#l1-usdc-transfer|Hyperliquid GitBook}
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
            signatureChainId: args.signatureChainId ?? this.isTestnet ? "0x66eee" : "0xa4b1",
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
        const response = await this.transport.request<SuccessResponse | ErrorResponse>("action", request, signal);

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
     * @see {@link https://hyperliquid.gitbook.io/hyperliquid-docs/for-developers/api/exchange-endpoint#deposit-or-withdraw-from-a-vault|Hyperliquid GitBook}
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
        const cleanedAction = removeUndefinedValues(sortedAction);
        const signature = await signL1Action(this.wallet, this.isTestnet, cleanedAction, nonce);

        const request: VaultTransferRequest = {
            action: cleanedAction,
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
     * @see {@link https://hyperliquid.gitbook.io/hyperliquid-docs/for-developers/api/exchange-endpoint#initiate-a-withdrawal-request|Hyperliquid GitBook}
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
            signatureChainId: args.signatureChainId ?? this.isTestnet ? "0x66eee" : "0xa4b1",
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
        const response = await this.transport.request<SuccessResponse | ErrorResponse>("action", request, signal);

        this.validateResponse(response);
        return response;
    }

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
}

/**
 * Remove undefined values from an object.
 * @param obj - The object to remove undefined values from.
 * @returns A new object with undefined values removed.
 */
function removeUndefinedValues<T>(obj: T): T {
    if (Array.isArray(obj)) {
        return obj.map(removeUndefinedValues) as T;
    } else if (obj && typeof obj === "object") {
        return Object.entries(obj).reduce((acc, [key, val]) => {
            if (val === undefined) {
                return acc;
            }
            return {
                ...acc,
                [key]: removeUndefinedValues(val),
            };
        }, {} as T);
    } else {
        return obj;
    }
}
