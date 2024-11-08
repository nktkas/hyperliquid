import { keccak_256 } from "@noble/hashes/sha3";
import { encode } from "@msgpack/msgpack";
import type {
    ApproveAgentRequest,
    ApproveBuilderFeeRequest,
    BatchModifyRequest,
    CancelByCloidRequest,
    CancelRequest,
    CancelResponse,
    CancelResponseSuccess,
    CreateSubAccountRequest,
    CreateSubAccountResponse,
    ErrorResponse,
    ModifyRequest,
    OrderRequest,
    OrderResponse,
    OrderResponseSuccess,
    ScheduleCancelRequest,
    SetReferrerRequest,
    SpotSendRequest,
    SubAccountTransferRequest,
    SuccessResponse,
    UpdateIsolatedMarginRequest,
    UpdateLeverageRequest,
    UsdClassTransferRequest,
    UsdSendRequest,
    VaultTransferRequest,
    Withdraw3Request,
} from "./types/exchange.d.ts";
import type { IRESTTransport } from "../transports/base.d.ts";
import { bytesToHex, type Hex, hexToBytes, hexToNumber, isHex, parseSignature } from "../utils/hex.ts";

/** The error thrown when the API request returns an error response. */
export class ApiRequestError extends Error {
    messages: string[];

    constructor(messages: string[]) {
        super("API request failed with the following error(s): " + messages.join(", "));
        this.name = this.constructor.name;
        this.messages = messages;
    }
}

/** @see {@linkcode ExchangeClient.approveAgent} */
export type ApproveAgentParameters = Omit<ApproveAgentRequest["action"], "type">;

/** @see {@linkcode ExchangeClient.approveBuilderFee} */
export type ApproveBuilderFeeParameters = Omit<ApproveBuilderFeeRequest["action"], "type">;

/** @see {@linkcode ExchangeClient.batchModify} */
export type BatchModifyParameters =
    & Omit<BatchModifyRequest["action"], "type">
    & Pick<BatchModifyRequest, "vaultAddress">;

/** @see {@linkcode ExchangeClient.cancel} */
export type CancelParameters =
    & Omit<CancelRequest["action"], "type">
    & Pick<CancelRequest, "vaultAddress">;

/** @see {@linkcode ExchangeClient.cancelByCloid} */
export type CancelByCloidParameters =
    & Omit<CancelByCloidRequest["action"], "type">
    & Pick<CancelByCloidRequest, "vaultAddress">;

/** @see {@linkcode ExchangeClient.createSubAccount} */
export type CreateSubAccountParameters = Omit<CreateSubAccountRequest["action"], "type">;

/** @see {@linkcode ExchangeClient.modify} */
export type ModifyParameters =
    & Omit<ModifyRequest["action"], "type">
    & Pick<ModifyRequest, "vaultAddress">;

/** @see {@linkcode ExchangeClient.order} */
export type OrderParameters =
    & Omit<OrderRequest["action"], "type">
    & Pick<OrderRequest, "vaultAddress">;

/** @see {@linkcode ExchangeClient.scheduleCancel} */
export type ScheduleCancelParameters =
    & Omit<ScheduleCancelRequest["action"], "type">
    & Pick<ScheduleCancelRequest, "vaultAddress">;

/** @see {@linkcode ExchangeClient.setReferrer} */
export type SetReferrerParameters = Omit<SetReferrerRequest["action"], "type">;

/** @see {@linkcode ExchangeClient.spotSend} */
export type SpotSendParameters = Omit<SpotSendRequest["action"], "type">;

/** @see {@linkcode ExchangeClient.subAccountTransfer} */
export type SubAccountTransferParameters = Omit<SubAccountTransferRequest["action"], "type">;

/** @see {@linkcode ExchangeClient.updateIsolatedMargin} */
export type UpdateIsolatedMarginParameters =
    & Omit<UpdateIsolatedMarginRequest["action"], "type">
    & Pick<UpdateIsolatedMarginRequest, "vaultAddress">;

/** @see {@linkcode ExchangeClient.updateLeverage} */
export type UpdateLeverageParameters =
    & Omit<UpdateLeverageRequest["action"], "type">
    & Pick<UpdateLeverageRequest, "vaultAddress">;

/** @see {@linkcode ExchangeClient.usdClassTransfer} */
export type UsdClassTransferParameters = Omit<UsdClassTransferRequest["action"], "type">;

/** @see {@linkcode ExchangeClient.usdSend} */
export type UsdSendParameters = Omit<UsdSendRequest["action"], "type">;

/** @see {@linkcode ExchangeClient.vaultTransfer} */
export type VaultTransferParameters = Omit<VaultTransferRequest["action"], "type">;

/** @see {@linkcode ExchangeClient.withdraw3} */
export type Withdraw3Parameters = Omit<Withdraw3Request["action"], "type">;

/** Abstract interface for a wallet client (compatible with [viem](https://viem.sh/docs/clients/wallet)'s WalletClient/Account). */
export interface AbstractWalletClient {
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

/** Abstract interface for a signer (compatible with [ethers](https://docs.ethers.org/v6/api/providers/#Signer)' Signer). */
export interface AbstractSigner {
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

/**
 * The client for interacting with the Hyperliquid API.
 *
 * @see {@link https://hyperliquid.gitbook.io/hyperliquid-docs/for-developers/api/exchange-endpoint|Hyperliquid GitBook}
 */
export class ExchangeClient {
    /**
     * The wallet used for signing transactions:
     * - [WalletClient/Account](https://viem.sh/docs/clients/wallet) from `viem`
     * - [Signer](https://docs.ethers.org/v6/api/providers/#Signer) from `ethers`
     */
    wallet: AbstractWalletClient | AbstractSigner;

    /** The transport used to connect to the Hyperliquid API. */
    transport: IRESTTransport;

    /** Specifies whether the client uses testnet. */
    isTestnet: boolean;

    /**
     * Initialises a new instance.
     * @param wallet - The WalletClient/Account ([viem](https://viem.sh/docs/clients/wallet)) or signer ([ethers](https://docs.ethers.org/v6/api/providers/#Signer)) used for signing transactions.
     * @param transport - The transport used to connect to the Hyperliquid API.
     * @param isTestnet - Specifies whether the client uses testnet. Defaults to `false`.
     *
     * @example Private key via [viem](https://viem.sh/docs/clients/wallet#local-accounts-private-key-mnemonic-etc)
     * ```ts
     * import * as hyperliquid from "@nktkas/hyperliquid";
     * import { privateKeyToAccount } from "viem/accounts";
     *
     * const account = privateKeyToAccount("0x...");
     * const transport = new hyperliquid.HttpTransport(); // or WebSocketTransport
     *
     * const client = new hyperliquid.ExchangeClient(account, transport);
     * ```
     *
     * @example Private key via [ethers](https://docs.ethers.org/v6/api/wallet/#Wallet)
     * ```ts
     * import * as hyperliquid from "@nktkas/hyperliquid";
     * import { ethers } from "ethers";
     *
     * const wallet = new ethers.Wallet("0x...");
     * const transport = new hyperliquid.HttpTransport(); // or WebSocketTransport
     *
     * const client = new hyperliquid.ExchangeClient(wallet, transport);
     * ```
     *
     * @example External wallet (e.g. MetaMask) via [viem](https://viem.sh/docs/clients/wallet#optional-hoist-the-account)
     * ```ts
     * import * as hyperliquid from "@nktkas/hyperliquid";
     * import { createWalletClient, http } from "viem";
     * import { arbitrum } from "viem/chains";
     *
     * const [account] = await window.ethereum!.transport.request({ method: "eth_requestAccounts" });
     * const wallet = createWalletClient({ account, chain: arbitrum, transport: http() });
     * const transport = new hyperliquid.HttpTransport(); // or WebSocketTransport
     *
     * const client = new hyperliquid.ExchangeClient(wallet, transport);
     * ```
     */
    constructor(
        wallet: AbstractWalletClient | AbstractSigner,
        transport: IRESTTransport,
        isTestnet: boolean = false,
    ) {
        this.wallet = wallet;
        this.transport = transport;
        this.isTestnet = isTestnet;
    }

    /**
     * Approve an agent to sign on behalf of the master or sub-accounts.
     * @param args - The parameters for the request.
     *
     * @throws {ApiRequestError} When the API returns an error response.
     *
     * @see {@link https://hyperliquid.gitbook.io/hyperliquid-docs/for-developers/api/exchange-endpoint#approve-an-api-wallet|Hyperliquid GitBook: approveAgent}
     * @example
     * ```ts
     * const result = await client.approveAgent({
     *     hyperliquidChain: "Mainnet", // Use mainnet
     *     signatureChainId: "0x66eee", // Hyperliquid chain ID
     *     agentAddress: "0x...", // Agent address
     *     agentName: "agentName" // Agent name
     *     nonce: Date.now() // Current time as nonce
     * });
     */
    async approveAgent(args: ApproveAgentParameters): Promise<SuccessResponse> {
        const signature = await this.signUserSignedAction(
            { type: "approveAgent", ...args },
            [
                { name: "hyperliquidChain", type: "string" },
                { name: "agentAddress", type: "address" },
                { name: "agentName", type: "string" },
                { name: "nonce", type: "uint64" },
            ],
            "HyperliquidTransaction:ApproveAgent",
            hexToNumber(args.signatureChainId),
        );

        const response = await this.transport.request<SuccessResponse | ErrorResponse>(
            "action",
            {
                action: { type: "approveAgent", ...args },
                signature,
                nonce: args.nonce,
            },
        );

        this.validateResponse(response);
        return response;
    }

    /**
     * Approve a max fee rate for a builder address.
     * @param args - The parameters for the request.
     *
     * @throws {ApiRequestError} When the API returns an error response.
     *
     * @see {@link https://hyperliquid.gitbook.io/hyperliquid-docs/for-developers/api/exchange-endpoint#approve-a-builder-fee|Hyperliquid GitBook: approveBuilderFee}
     * @example
     * ```ts
     * const result = await client.approveBuilderFee({
     *     hyperliquidChain: "Mainnet", // Use mainnet
     *     signatureChainId: "0x66eee", // Hyperliquid chain ID
     *     maxFeeRate: "0.01%", // 0.01% maximum fee rate
     *     builder: "0x..." // Builder address
     *     nonce: Date.now() // Current time as nonce
     * });
     */
    async approveBuilderFee(args: ApproveBuilderFeeParameters): Promise<SuccessResponse> {
        const signature = await this.signUserSignedAction(
            { type: "approveBuilderFee", ...args },
            [
                { name: "hyperliquidChain", type: "string" },
                { name: "maxFeeRate", type: "string" },
                { name: "builder", type: "address" },
                { name: "nonce", type: "uint64" },
            ],
            "HyperliquidTransaction:ApproveBuilderFee",
            hexToNumber(args.signatureChainId),
        );

        const response = await this.transport.request<SuccessResponse | ErrorResponse>(
            "action",
            {
                action: { type: "approveBuilderFee", ...args },
                signature,
                nonce: args.nonce,
            },
        );

        this.validateResponse(response);
        return response;
    }

    /**
     * Modify multiple orders.
     * @param args - The parameters for the request.
     *
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
     *             c: "0x1234567890abcdef1234567890abcdef" // Optional: Client Order ID
     *         }
     *     }]
     * });
     * ```
     */
    async batchModify(args: BatchModifyParameters): Promise<OrderResponseSuccess> {
        const action: BatchModifyRequest["action"] = {
            type: "batchModify",
            modifies: args.modifies.map((modify) => {
                const o: BatchModifyRequest["action"]["modifies"][0] = {
                    oid: modify.oid,
                    order: {
                        a: modify.order.a,
                        b: modify.order.b,
                        p: modify.order.p,
                        s: modify.order.s,
                        r: modify.order.r,
                        t: "limit" in modify.order.t ? modify.order.t : {
                            trigger: {
                                isMarket: modify.order.t.trigger.isMarket,
                                triggerPx: modify.order.t.trigger.triggerPx,
                                tpsl: modify.order.t.trigger.tpsl,
                            },
                        },
                    },
                };
                if (modify.order.c) o.order.c = modify.order.c;
                return o;
            }),
        };
        const nonce = Date.now();
        const signature = await this.signL1Action(action, args.vaultAddress ?? null, nonce);

        const response = await this.transport.request<OrderResponse>(
            "action",
            {
                action,
                signature,
                nonce,
                vaultAddress: args.vaultAddress,
            },
        );

        this.validateResponse(response);
        return response;
    }

    /**
     * Cancel order(s).
     * @param args - The parameters for the request.
     *
     * @throws {ApiRequestError} When the API returns an error response.
     *
     * @see {@link https://hyperliquid.gitbook.io/hyperliquid-docs/for-developers/api/exchange-endpoint#cancel-order-s|Hyperliquid GitBook: cancel}
     * @example
     * ```ts
     * const result = await client.cancel({
     *     cancels: [{
     *         a: 0, // Asset index
     *         o: 123 // Order ID
     *     }]
     * });
     * ```
     */
    async cancel(args: CancelParameters): Promise<CancelResponseSuccess> {
        const action: CancelRequest["action"] = {
            type: "cancel",
            cancels: args.cancels.map((cancel) => ({ a: cancel.a, o: cancel.o })),
        };
        const nonce = Date.now();
        const signature = await this.signL1Action(action, args.vaultAddress ?? null, nonce);

        const response = await this.transport.request<CancelResponse>(
            "action",
            {
                action,
                signature,
                nonce,
                vaultAddress: args.vaultAddress,
            },
        );

        this.validateResponse(response);
        return response;
    }

    /**
     * Cancel order(s) by Client Order ID.
     * @param args - The parameters for the request.
     *
     * @throws {ApiRequestError} When the API returns an error response.
     *
     * @see {@link https://hyperliquid.gitbook.io/hyperliquid-docs/for-developers/api/exchange-endpoint#cancel-order-s-by-cloid|Hyperliquid GitBook: cancelByCloid}
     * @example
     * ```ts
     * const result = await client.cancelByCloid({
     *     cancels: [{
     *         asset: 0, // Asset index
     *         cloid: "0x1234567890abcdef1234567890abcdef" // Client Order ID
     *     }]
     * });
     * ```
     */
    async cancelByCloid(args: CancelByCloidParameters): Promise<CancelResponseSuccess> {
        const action: CancelByCloidRequest["action"] = {
            type: "cancelByCloid",
            cancels: args.cancels.map((cancel) => ({ asset: cancel.asset, cloid: cancel.cloid })),
        };
        const nonce = Date.now();
        const signature = await this.signL1Action(action, args.vaultAddress ?? null, nonce);

        const response = await this.transport.request<CancelResponse>(
            "action",
            {
                action,
                signature,
                nonce,
                vaultAddress: args.vaultAddress,
            },
        );

        this.validateResponse(response);
        return response;
    }

    /**
     * Create a sub-account.
     * @param args - The parameters for the request.
     *
     * @throws {ApiRequestError} When the API returns an error response.
     *
     * @see null
     * @example
     * ```ts
     * const result = await client.createSubAccount({
     *     name: "subAccountName" // Sub-account name
     * });
     * ```
     */
    async createSubAccount(args: CreateSubAccountParameters): Promise<CreateSubAccountResponse> {
        const action: CreateSubAccountRequest["action"] = {
            type: "createSubAccount",
            name: args.name,
        };
        const nonce = Date.now();
        const signature = await this.signL1Action(action, null, nonce);

        const response = await this.transport.request<CreateSubAccountResponse | ErrorResponse>(
            "action",
            {
                action,
                signature,
                nonce,
            },
        );

        this.validateResponse(response);
        return response;
    }

    /**
     * Modify an order.
     * @param args - The parameters for the request.
     *
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
     *         c: "0x1234567890abcdef1234567890abcdef" // Optional: Client Order ID
     *     }
     * });
     * ```
     */
    async modify(args: ModifyParameters): Promise<SuccessResponse> {
        const action: ModifyRequest["action"] = {
            type: "modify",
            oid: args.oid,
            order: {
                a: args.order.a,
                b: args.order.b,
                p: args.order.p,
                s: args.order.s,
                r: args.order.r,
                t: "limit" in args.order.t ? args.order.t : {
                    trigger: {
                        isMarket: args.order.t.trigger.isMarket,
                        triggerPx: args.order.t.trigger.triggerPx,
                        tpsl: args.order.t.trigger.tpsl,
                    },
                },
            },
        };
        if (args.order.c) action.order.c = args.order.c;
        const nonce = Date.now();
        const signature = await this.signL1Action(action, args.vaultAddress ?? null, nonce);

        const response = await this.transport.request<SuccessResponse | ErrorResponse>(
            "action",
            {
                action,
                signature,
                nonce,
                vaultAddress: args.vaultAddress,
            },
        );

        this.validateResponse(response);
        return response;
    }

    /**
     * Place an order(s).
     * @param args - The parameters for the request.
     *
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
     *         c: "0x1234567890abcdef1234567890abcdef" // Optional: Client Order ID
     *     }],
     *     grouping: "na" // No grouping
     * });
     * ```
     */
    async order(args: OrderParameters): Promise<OrderResponseSuccess> {
        const action: OrderRequest["action"] = {
            type: "order",
            orders: args.orders.map((order) => {
                const o: OrderRequest["action"]["orders"][0] = {
                    a: order.a,
                    b: order.b,
                    p: order.p,
                    s: order.s,
                    r: order.r,
                    t: "limit" in order.t ? order.t : {
                        trigger: {
                            isMarket: order.t.trigger.isMarket,
                            triggerPx: order.t.trigger.triggerPx,
                            tpsl: order.t.trigger.tpsl,
                        },
                    },
                };
                if (order.c) o.c = order.c;
                return o;
            }),
            grouping: args.grouping,
        };
        if (args.builder) {
            action.builder = {
                b: args.builder.b.toLowerCase() as typeof args.builder.b,
                f: args.builder.f,
            };
        }
        const nonce = Date.now();
        const signature = await this.signL1Action(action, args.vaultAddress ?? null, nonce);

        const response = await this.transport.request<OrderResponse>(
            "action",
            {
                action,
                signature,
                nonce,
                vaultAddress: args.vaultAddress,
            },
        );

        this.validateResponse(response);
        return response;
    }

    /**
     * Schedule a time to cancel all open orders.
     * @param args - The parameters for the request.
     *
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
    async scheduleCancel(args: ScheduleCancelParameters): Promise<SuccessResponse> {
        const action: ScheduleCancelRequest["action"] = {
            type: "scheduleCancel",
            time: args.time,
        };
        const nonce = Date.now();
        const signature = await this.signL1Action(action, args.vaultAddress ?? null, nonce);

        const response = await this.transport.request<SuccessResponse | ErrorResponse>(
            "action",
            {
                action,
                signature,
                nonce,
                vaultAddress: args.vaultAddress,
            },
        );

        this.validateResponse(response);
        return response;
    }

    /**
     * Set a referral code.
     * @param args - The parameters for the request.
     *
     * @throws {ApiRequestError} When the API returns an error response.
     *
     * @see null
     * @example
     * ```ts
     * const result = await client.setReferrer({
     *     code: "TEST" // Referral code
     * });
     * ```
     */
    async setReferrer(args: SetReferrerParameters): Promise<SuccessResponse> {
        const action: SetReferrerRequest["action"] = {
            type: "setReferrer",
            code: args.code,
        };
        const nonce = Date.now();
        const signature = await this.signL1Action(action, null, nonce);

        const response = await this.transport.request<SuccessResponse | ErrorResponse>(
            "action",
            {
                action,
                signature,
                nonce,
            },
        );

        this.validateResponse(response);
        return response;
    }

    /**
     * Transfer a spot asset on L1 to another address.
     * @param args - The parameters for the request.
     *
     * @throws {ApiRequestError} When the API returns an error response.
     *
     * @see {@link https://hyperliquid.gitbook.io/hyperliquid-docs/for-developers/api/exchange-endpoint#l1-spot-transfer|Hyperliquid GitBook: spotSend}
     * @example
     * ```ts
     * const result = await client.spotSend({
     *     hyperliquidChain: "Mainnet", // Use mainnet
     *     signatureChainId: "0x66eee", // Hyperliquid chain ID
     *     destination: "0x...", // Recipient's address
     *     token: "USDC:0xeb62eee3685fc4c43992febcd9e75443", // USDC identifier
     *     amount: "1", // Send 1 USDC
     *     time: Date.now() // Current time as nonce
     * });
     * ```
     */
    async spotSend(args: SpotSendParameters): Promise<SuccessResponse> {
        const signature = await this.signUserSignedAction(
            { type: "spotSend", ...args },
            [
                { name: "hyperliquidChain", type: "string" },
                { name: "destination", type: "string" },
                { name: "token", type: "string" },
                { name: "amount", type: "string" },
                { name: "time", type: "uint64" },
            ],
            "HyperliquidTransaction:SpotSend",
            hexToNumber(args.signatureChainId),
        );

        const response = await this.transport.request<SuccessResponse | ErrorResponse>(
            "action",
            {
                action: { type: "spotSend", ...args },
                signature,
                nonce: args.time,
            },
        );

        this.validateResponse(response);
        return response;
    }

    /**
     * Transfer between sub-accounts.
     * @param args - The parameters for the request.
     *
     * @throws {ApiRequestError} When the API returns an error response.
     *
     * @see null
     * @example
     * ```ts
     * const result = await client.subAccountTransfer({
     *     subAccountUser: "0x...", // Sub-account address
     *     isDeposit: true, // Deposit to sub-account
     *     usd: 1000000 // 1 USD in raw units (float amount * 1e6)
     * });
     * ```
     */
    async subAccountTransfer(args: SubAccountTransferParameters): Promise<SuccessResponse> {
        const action: SubAccountTransferRequest["action"] = {
            type: "subAccountTransfer",
            subAccountUser: args.subAccountUser,
            isDeposit: args.isDeposit,
            usd: args.usd,
        };
        const nonce = Date.now();
        const signature = await this.signL1Action(action, null, nonce);

        const response = await this.transport.request<SuccessResponse | ErrorResponse>(
            "action",
            {
                action,
                signature,
                nonce,
            },
        );

        this.validateResponse(response);
        return response;
    }

    /**
     * Update isolated margin for a position.
     * @param args - The parameters for the request.
     *
     * @throws {ApiRequestError} When the API returns an error response.
     *
     * @see {@link https://hyperliquid.gitbook.io/hyperliquid-docs/for-developers/api/exchange-endpoint#update-isolated-margin|Hyperliquid GitBook: updateIsolatedMargin}
     * @example
     * ```ts
     * const result = await client.updateIsolatedMargin({
     *     asset: 0, // Asset index
     *     isBuy: true, // Add to long position
     *     ntli: 1000 // Add 1000 USD margin (integer only)
     * });
     * ```
     */
    async updateIsolatedMargin(args: UpdateIsolatedMarginParameters): Promise<SuccessResponse> {
        const action: UpdateIsolatedMarginRequest["action"] = {
            type: "updateIsolatedMargin",
            asset: args.asset,
            isBuy: args.isBuy,
            ntli: args.ntli,
        };
        const nonce = Date.now();
        const signature = await this.signL1Action(action, args.vaultAddress ?? null, nonce);

        const response = await this.transport.request<SuccessResponse | ErrorResponse>(
            "action",
            {
                action,
                signature,
                nonce,
                vaultAddress: args.vaultAddress,
            },
        );

        this.validateResponse(response);
        return response;
    }

    /**
     * Update leverage for cross or isolated margin.
     * @param args - The parameters for the request.
     *
     * @throws {ApiRequestError} When the API returns an error response.
     *
     * @see {@link https://hyperliquid.gitbook.io/hyperliquid-docs/for-developers/api/exchange-endpoint#update-leverage|Hyperliquid GitBook: updateLeverage}
     * @example
     * ```ts
     * const result = await client.updateLeverage({
     *     asset: 0, // Asset index
     *     isCross: true, // Use cross leverage
     *     leverage: 5 // Set leverage to 5
     * });
     * ```
     */
    async updateLeverage(args: UpdateLeverageParameters): Promise<SuccessResponse> {
        const action: UpdateLeverageRequest["action"] = {
            type: "updateLeverage",
            asset: args.asset,
            isCross: args.isCross,
            leverage: args.leverage,
        };
        const nonce = Date.now();
        const signature = await this.signL1Action(action, args.vaultAddress ?? null, nonce);

        const response = await this.transport.request<SuccessResponse | ErrorResponse>(
            "action",
            {
                action,
                signature,
                nonce,
                vaultAddress: args.vaultAddress,
            },
        );

        this.validateResponse(response);
        return response;
    }

    /**
     * Transfer funds between Spot and Perp accounts.
     * @param args - The parameters for the request.
     *
     * @throws {ApiRequestError} When the API returns an error response.
     *
     * @see null
     * @example
     * ```ts
     * const result = await client.usdClassTransfer({
     *     hyperliquidChain: "Mainnet", // Use mainnet
     *     signatureChainId: "0x66eee", // Hyperliquid chain ID
     *     amount: "1000", // Transfer 1000 USD
     *     toPerp: true // Transfer from Spot to Perp
     *     nonce: Date.now() // Current time as nonce
     * });
     * ```
     */
    async usdClassTransfer(args: UsdClassTransferParameters): Promise<SuccessResponse> {
        const signature = await this.signUserSignedAction(
            { type: "usdClassTransfer", ...args },
            [
                { name: "hyperliquidChain", type: "string" },
                { name: "amount", type: "string" },
                { name: "toPerp", type: "bool" },
                { name: "nonce", type: "uint64" },
            ],
            "HyperliquidTransaction:UsdClassTransfer",
            hexToNumber(args.signatureChainId),
        );

        const response = await this.transport.request<SuccessResponse | ErrorResponse>(
            "action",
            {
                action: { type: "usdClassTransfer", ...args },
                signature,
                nonce: args.nonce,
            },
        );

        this.validateResponse(response);
        return response;
    }

    /**
     * Transfer USDC on L1 to another address.
     * @param args - The parameters for the request.
     *
     * @throws {ApiRequestError} When the API returns an error response.
     *
     * @see {@link https://hyperliquid.gitbook.io/hyperliquid-docs/for-developers/api/exchange-endpoint#l1-usdc-transfer|Hyperliquid GitBook: usdSend}
     * @example
     * ```ts
     * const result = await client.usdSend({
     *     hyperliquidChain: "Mainnet", // Use mainnet
     *     signatureChainId: "0x66eee", // Hyperliquid chain ID
     *     destination: "0x...", // Recipient's address
     *     amount: "1000", // Transfer 1000 USD
     *     time: Date.now() // Current time as nonce
     * });
     * ```
     */
    async usdSend(args: UsdSendParameters): Promise<SuccessResponse> {
        const signature = await this.signUserSignedAction(
            { type: "usdSend", ...args },
            [
                { name: "hyperliquidChain", type: "string" },
                { name: "destination", type: "string" },
                { name: "amount", type: "string" },
                { name: "time", type: "uint64" },
            ],
            "HyperliquidTransaction:UsdSend",
            hexToNumber(args.signatureChainId),
        );

        const response = await this.transport.request<SuccessResponse | ErrorResponse>(
            "action",
            {
                action: { type: "usdSend", ...args },
                signature,
                nonce: args.time,
            },
        );

        this.validateResponse(response);
        return response;
    }

    /**
     * Transfer funds to/from a vault.
     * @param args - The parameters for the request.
     *
     * @throws {ApiRequestError} When the API returns an error response.
     *
     * @see {@link https://hyperliquid.gitbook.io/hyperliquid-docs/for-developers/api/exchange-endpoint#deposit-or-withdraw-from-a-vault|Hyperliquid GitBook: vaultTransfer}
     * @example
     * ```ts
     * const result = await client.vaultTransfer({
     *     vaultAddress: "0x...", // Vault address
     *     isDeposit: true, // Deposit to vault
     *     usd: 1000000 // 1 USD in raw units (float amount * 1e6)
     * });
     * ```
     */
    async vaultTransfer(args: VaultTransferParameters): Promise<SuccessResponse> {
        const action: VaultTransferRequest["action"] = {
            type: "vaultTransfer",
            vaultAddress: args.vaultAddress,
            isDeposit: args.isDeposit,
            usd: args.usd,
        };
        const nonce = Date.now();
        const signature = await this.signL1Action(action, null, nonce);

        const response = await this.transport.request<SuccessResponse | ErrorResponse>(
            "action",
            {
                action,
                signature,
                nonce,
            },
        );

        this.validateResponse(response);
        return response;
    }

    /**
     * Initiate a withdrawal request.
     * @param args - The parameters for the request.
     *
     * @throws {ApiRequestError} When the API returns an error response.
     *
     * @see {@link https://hyperliquid.gitbook.io/hyperliquid-docs/for-developers/api/exchange-endpoint#initiate-a-withdrawal-request|Hyperliquid GitBook: withdraw3}
     * @example
     * ```ts
     * const result = await client.withdraw3({
     *     hyperliquidChain: "Mainnet", // Use mainnet
     *     signatureChainId: "0x66eee", // Hyperliquid chain ID
     *     destination: "0x..." // Recipient's address
     *     amount: "1000", // Withdraw 1000 USD
     *     time: Date.now(), // Current time as nonce
     * });
     * ```
     */
    async withdraw3(args: Withdraw3Parameters): Promise<SuccessResponse> {
        const signature = await this.signUserSignedAction(
            { type: "withdraw3", ...args },
            [
                { name: "hyperliquidChain", type: "string" },
                { name: "destination", type: "string" },
                { name: "amount", type: "string" },
                { name: "time", type: "uint64" },
            ],
            "HyperliquidTransaction:Withdraw",
            hexToNumber(args.signatureChainId),
        );

        const response = await this.transport.request<SuccessResponse | ErrorResponse>(
            "action",
            {
                action: { type: "withdraw3", ...args },
                signature,
                nonce: args.time,
            },
        );

        this.validateResponse(response);
        return response;
    }

    protected async signL1Action(
        action: Record<string, unknown>,
        vaultAddress: Hex | null,
        nonce: number,
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

        const actionHash = this.createActionHash(action, vaultAddress, nonce);
        const message = {
            source: this.isTestnet ? "b" : "a",
            connectionId: actionHash,
        };

        if (isAbstractWalletClient(this.wallet)) {
            const signature = await this.wallet.signTypedData({ domain, types, primaryType: "Agent", message });

            return parseSignature(signature);
        } else if (isAbstractSigner(this.wallet)) {
            const signature = await this.wallet.signTypedData(domain, types, message);

            if (!isHex(signature)) {
                throw new Error("Invalid signature format");
            }

            return parseSignature(signature);
        } else {
            throw new Error("Unsupported wallet for signing typed data");
        }
    }

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

        if (isAbstractWalletClient(this.wallet)) {
            const signature = await this.wallet.signTypedData({ domain, types, primaryType, message: action });

            return parseSignature(signature);
        } else if (isAbstractSigner(this.wallet)) {
            const signature = await this.wallet.signTypedData(domain, types, action);

            if (!isHex(signature)) {
                throw new Error("Invalid signature format");
            }

            return parseSignature(signature);
        } else {
            throw new Error("Unsupported wallet for signing typed data");
        }
    }

    protected createActionHash(action: unknown, vaultAddress: Hex | null, nonce: number): Hex {
        const msgPackBytes = encode(action);
        const additionalBytesLength = vaultAddress === null ? 9 : 29;

        const data = new Uint8Array(msgPackBytes.length + additionalBytesLength);
        data.set(msgPackBytes);

        const view = new DataView(data.buffer);
        view.setBigUint64(msgPackBytes.length, BigInt(nonce));

        if (vaultAddress === null) {
            view.setUint8(msgPackBytes.length + 8, 0);
        } else {
            view.setUint8(msgPackBytes.length + 8, 1);
            data.set(hexToBytes(vaultAddress), msgPackBytes.length + 9);
        }

        return bytesToHex(keccak_256(data));
    }

    protected validateResponse(
        response: SuccessResponse | ErrorResponse | CancelResponse | CreateSubAccountResponse | OrderResponse,
    ): asserts response is SuccessResponse | CancelResponseSuccess | CreateSubAccountResponse | OrderResponseSuccess {
        if (response.status === "err") {
            throw new ApiRequestError([response.response]);
        }

        if (response.response.type === "order" || response.response.type === "cancel") {
            const errorMessages = response.response.data.statuses
                .filter((status) => typeof status === "object" && "error" in status)
                .map((status) => status.error);

            if (errorMessages.length > 0) {
                throw new ApiRequestError(errorMessages);
            }
        }
    }
}

function isAbstractWalletClient(client: unknown): client is AbstractWalletClient {
    return typeof client === "object" && client !== null &&
        "signTypedData" in client && typeof client.signTypedData === "function" && client.signTypedData.length === 1;
}
function isAbstractSigner(client: unknown): client is AbstractSigner {
    return typeof client === "object" && client !== null &&
        "signTypedData" in client && typeof client.signTypedData === "function" && client.signTypedData.length === 3;
}
