import { keccak_256 } from "@noble/hashes/sha3";
import { encode } from "@msgpack/msgpack";
import type { Hex } from "./types/info.d.ts";
import type {
    BatchModifyRequest,
    CancelByCloidRequest,
    CancelRequest,
    CancelResponse,
    ErrorResponse,
    ModifyRequest,
    Order,
    OrderGroupingStrategy,
    OrderRequest,
    OrderResponse,
    ScheduleCancelRequest,
    SpotSendRequest,
    SpotUserRequest,
    SuccessResponse,
    UpdateIsolatedMarginRequest,
    UpdateLeverageRequest,
    UsdSendRequest,
    VaultTransferRequest,
    Withdraw3Request,
} from "./types/exchange.d.ts";
import { HyperliquidAPIError, HyperliquidBatchAPIError } from "./error.ts";

/**
 * Parameters for the {@link HyperliquidExchangeClient.order order} method.
 */
export interface OrderParameters {
    /** Array of open order parameters. */
    orders: Order[];

    /** Grouping strategy for orders. */
    grouping: OrderGroupingStrategy;

    /** On-chain address of the vault (if trading on behalf of a vault). */
    vaultAddress?: Hex;
}

/**
 * Parameters for the {@link HyperliquidExchangeClient.cancel cancel} method.
 */
export interface CancelParameters {
    /** Array of orders to cancel. */
    cancels: {
        /** Index of the coin. */
        a: number;

        /** Order ID. */
        o: number;
    }[];

    /** On-chain address of the vault (if trading on behalf of a vault). */
    vaultAddress?: Hex;
}

/**
 * Parameters for the {@link HyperliquidExchangeClient.cancelByCloid cancelByCloid} method.
 */
export interface CancelByCloidParameters {
    /** Array of orders to cancel. */
    cancels: {
        /** Index of the coin. */
        asset: number;

        /** Client Order ID. */
        cloid: Hex;
    }[];

    /** On-chain address of the vault (if trading on behalf of a vault). */
    vaultAddress?: Hex;
}

/**
 * Parameters for the {@link HyperliquidExchangeClient.scheduleCancel scheduleCancel} method.
 */
export interface ScheduleCancelParameters {
    /** Scheduled time for the cancel-all operation. */
    time: number;

    /** On-chain address of the vault (if trading on behalf of a vault). */
    vaultAddress?: Hex;
}

/**
 * Parameters for the {@link HyperliquidExchangeClient.modify modify} method.
 */
export interface ModifyParameters {
    /** Order ID to modify. */
    oid: number;

    /** New order parameters. */
    order: Order;

    /** On-chain address of the vault (if trading on behalf of a vault). */
    vaultAddress?: Hex;
}

/**
 * Parameters for the {@link HyperliquidExchangeClient.batchModify batchModify} method.
 */
export interface BatchModifyParameters {
    /** Array of order modifications. */
    modifies: {
        /** Order ID to modify. */
        oid: number;

        /** New order parameters. */
        order: Order;
    }[];

    /** On-chain address of the vault (if trading on behalf of a vault). */
    vaultAddress?: Hex;
}

/**
 * Parameters for the {@link HyperliquidExchangeClient.updateLeverage updateLeverage} method.
 */
export interface UpdateLeverageParameters {
    /** Index of the coin. */
    asset: number;

    /** `true` for cross leverage; `false` for isolated leverage. */
    isCross: boolean;

    /** New leverage value. */
    leverage: number;

    /** On-chain address of the vault (if trading on behalf of a vault). */
    vaultAddress?: Hex;
}

/**
 * Parameters for the {@link HyperliquidExchangeClient.updateIsolatedMargin updateIsolatedMargin} method.
 */
export interface UpdateIsolatedMarginParameters {
    /** Index of the coin. */
    asset: number;

    /** Position side (`true` for long, `false` for short). Has no effect until hedge mode is implemented. */
    isBuy: boolean;

    /** Amount to add or remove (in USD). */
    ntli: number;

    /** On-chain address of the vault (if trading on behalf of a vault). */
    vaultAddress?: Hex;
}

/**
 * Parameters for the {@link HyperliquidExchangeClient.usdSend usdSend} method.
 */
export interface UsdSendParameters {
    /** HyperLiquid network to use. */
    hyperliquidChain: "Mainnet" | "Testnet";

    /** Chain ID used when signing. */
    signatureChainId: Hex;

    /** Recipient's address. */
    destination: Hex;

    /** Amount of USD to send. */
    amount: string;

    /** Current timestamp in milliseconds. */
    time: number;
}

/**
 * Parameters for the {@link HyperliquidExchangeClient.spotSend spotSend} method.
 */
export interface SpotSendParameters {
    /** HyperLiquid network to use. */
    hyperliquidChain: "Mainnet" | "Testnet";

    /** Chain ID used when signing. */
    signatureChainId: Hex;

    /** Recipient's address. */
    destination: Hex;

    /** Token identifier (format: `tokenName:tokenId`). */
    token: `${string}:${Hex}`;

    /** Amount of token to send. */
    amount: string;

    /** Current timestamp in milliseconds. */
    time: number;
}

/**
 * Parameters for the {@link HyperliquidExchangeClient.withdraw3 withdraw3} method.
 */
export interface Withdraw3Parameters {
    /** HyperLiquid network to use. */
    hyperliquidChain: "Mainnet" | "Testnet";

    /** Chain ID used when signing. */
    signatureChainId: Hex;

    /** Recipient's address. */
    destination: Hex;

    /** Amount of USD to withdraw. */
    amount: string;

    /** Current timestamp in milliseconds. */
    time: number;
}

/**
 * Parameters for the {@link HyperliquidExchangeClient.spotUser spotUser} method.
 */
export interface SpotUserParameters {
    /** Amount of raw USDC to send (float amount * 1e6). */
    usdc: number;

    /** `true` for Spot to Perp; `false` for Perp to Spot. */
    toPerp: boolean;
}

/**
 * Parameters for the {@link HyperliquidExchangeClient.vaultTransfer vaultTransfer} method.
 */
export interface VaultTransferParameters {
    /** Address of the vault. */
    vaultAddress: Hex;

    /** `true` for deposit; `false` for withdrawal. */
    isDeposit: boolean;

    /** Amount of raw USD to transfer (float amount * 1e6). */
    usd: number;
}

/**
 * Successful variant of {@link CancelResponse}.
 */
export interface CancelResponseSuccess extends CancelResponse {
    status: "ok";
    response: {
        type: "cancel";
        data: {
            statuses: "success"[];
        };
    };
}

/**
 * Successful variant of {@link OrderResponse}.
 */
export interface OrderResponseSuccess extends OrderResponse {
    status: "ok";
    response: {
        type: "order";
        data: {
            statuses: (
                | {
                    /** Status for a resting order. */
                    resting: {
                        /** Order ID. */
                        oid: number;

                        /** Client Order ID. */
                        cloid?: Hex;
                    };
                }
                | {
                    /** Status for a filled order. */
                    filled: {
                        /** Total size filled. */
                        totalSz: string;

                        /** Average price of fill. */
                        avgPx: string;

                        /** Order ID. */
                        oid: number;

                        /** Client Order ID. */
                        cloid?: Hex;
                    };
                }
            )[];
        };
    };
}

/**
 * Abstract interface for a wallet client (compatible with viem's WalletClient).
 */
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

/**
 * Abstract interface for a signer (compatible with ethers' Signer).
 */
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
 * A client to interact with the Hyperliquid exchange APIs.
 */
export class HyperliquidExchangeClient {
    /** The endpoint of the Hyperliquid exchange APIs. */
    public readonly endpoint: string; // TESTNET: https://api.hyperliquid-testnet.xyz/exchange

    /** If the endpoint is testnet, change this value to `false`. */
    public readonly isMainnet: boolean;

    /** The wallet client ([viem](https://viem.sh/)) or signer ([ethers](https://ethers.org/)) used for signing transactions. */
    public readonly walletClientOrSigner: AbstractWalletClient | AbstractSigner;

    /**
     * Initializes a new instance of the HyperliquidExchangeClient class.
     *
     * @param walletClientOrSigner - The wallet client ([viem](https://viem.sh/)) or signer ([ethers](https://ethers.org/)) used for signing transactions.
     * @param endpoint - The endpoint of the Hyperliquid exchange APIs.
     * @param isMainnet - If the endpoint is testnet, change this value to `false`.
     *
     * @example Based on [viem](https://viem.sh/)
     * ```ts
     * import { privateKeyToAccount } from "viem/accounts";
     *
     * const account = privateKeyToAccount("0x...");
     *
     * const client = new HyperliquidExchangeClient(account);
     * ```
     *
     * @example Based on [ethers](https://ethers.org/)
     * ```ts
     * import { ethers } from "ethers";
     *
     * const wallet = new ethers.Wallet("0x...");
     *
     * const client = new HyperliquidExchangeClient(wallet);
     * ```
     */
    constructor(
        walletClientOrSigner: AbstractWalletClient | AbstractSigner,
        endpoint: string = "https://api.hyperliquid.xyz/exchange",
        isMainnet: boolean = true,
    ) {
        this.walletClientOrSigner = walletClientOrSigner;
        this.endpoint = endpoint;
        this.isMainnet = isMainnet;
    }

    /**
     * Places an order.
     *
     * @requestWeight 1
     * @throws {HyperliquidBatchAPIError} If the API returns an error.
     *
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
        const nonce = Date.now();
        const signature = await this.signL1Action(action, args.vaultAddress ?? null, nonce);
        return await this.request({ action, signature, nonce, vaultAddress: args.vaultAddress });
    }

    /**
     * Cancels order(s).
     *
     * @requestWeight 1
     * @throws {HyperliquidBatchAPIError} If the API returns an error.
     *
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
        return await this.request({ action, signature, nonce, vaultAddress: args.vaultAddress });
    }

    /**
     * Cancels order(s) by client order ID.
     *
     * @requestWeight 1
     * @throws {HyperliquidBatchAPIError} If the API returns an error.
     *
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
        return await this.request({ action, signature, nonce, vaultAddress: args.vaultAddress });
    }

    /**
     * Schedules a cancel-all operation (dead man's switch).
     *
     * @requestWeight 1
     * @throws {HyperliquidAPIError} If the API returns an error.
     *
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
        return await this.request({ action, signature, nonce, vaultAddress: args.vaultAddress });
    }

    /**
     * Modifies an order.
     *
     * @requestWeight 1
     * @throws {HyperliquidAPIError} If the API returns an error.
     *
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
     *         }
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
        return await this.request({ action, signature, nonce, vaultAddress: args.vaultAddress });
    }

    /**
     * Modifies multiple orders.
     *
     * @requestWeight 1
     * @throws {HyperliquidBatchAPIError} If the API returns an error.
     *
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
     *             }
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
        return await this.request({ action, signature, nonce, vaultAddress: args.vaultAddress });
    }

    /**
     * Updates cross or isolated leverage for a coin.
     *
     * @requestWeight 1
     * @throws {HyperliquidAPIError} If the API returns an error.
     *
     * @example
     * ```ts
     * const result = await client.updateLeverage({
     *     asset: 0, // Asset index
     *     isCross: true, // Use cross leverage
     *     leverage: 5 // Value of leverage
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
        return await this.request({ action, signature, nonce, vaultAddress: args.vaultAddress });
    }

    /**
     * Adds or removes margin from an isolated position.
     *
     * @requestWeight 1
     * @throws {HyperliquidAPIError} If the API returns an error.
     *
     * @example
     * ```ts
     * const result = await client.updateIsolatedMargin({
     *     asset: 0, // Asset index
     *     isBuy: true, // Long position
     *     ntli: 1000 // Add 1000 USD margin
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
        return await this.request({ action, signature, nonce, vaultAddress: args.vaultAddress });
    }

    /**
     * Transfers USDC on L1 to another address.
     *
     * @requestWeight 1
     * @throws {HyperliquidAPIError} If the API returns an error.
     *
     * @example
     * ```ts
     * const result = await client.usdSend({
     *     hyperliquidChain: "Mainnet", // Use mainnet
     *     signatureChainId: "0x66eee", // Hyperliquid chain ID
     *     destination: "0x...", // Recipient's address
     *     amount: "1000", // Amount in USDC
     *     time: Date.now() // Current timestamp
     * });
     * ```
     */
    async usdSend(args: UsdSendParameters): Promise<SuccessResponse> {
        const action: UsdSendRequest["action"] = {
            type: "usdSend",
            hyperliquidChain: args.hyperliquidChain,
            signatureChainId: args.signatureChainId,
            destination: args.destination,
            amount: args.amount,
            time: args.time,
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
            hexToNumber(action.signatureChainId),
        );
        return await this.request({ action, signature, nonce: args.time });
    }

    /**
     * Transfers a spot asset on L1 to another address.
     *
     * @requestWeight 1
     * @throws {HyperliquidAPIError} If the API returns an error.
     *
     * @example
     * ```ts
     * const result = await client.spotSend({
     *     hyperliquidChain: "Mainnet", // Use mainnet
     *     signatureChainId: "0x66eee", // Hyperliquid chain ID
     *     destination: "0x...", // Recipient's address
     *     token: "ETH:0x...", // Token to send
     *     amount: "1", // Amount
     *     time: Date.now() // Current timestamp
     * });
     * ```
     */
    async spotSend(args: SpotSendParameters): Promise<SuccessResponse> {
        const action: SpotSendRequest["action"] = {
            type: "spotSend",
            hyperliquidChain: args.hyperliquidChain,
            signatureChainId: args.signatureChainId,
            destination: args.destination,
            token: args.token,
            amount: args.amount,
            time: args.time,
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
            hexToNumber(action.signatureChainId),
        );
        return await this.request({ action, signature, nonce: args.time });
    }

    /**
     * Initiates a withdrawal request.
     *
     * @requestWeight 1
     * @throws {HyperliquidAPIError} If the API returns an error.
     *
     * @example
     * ```ts
     * const result = await client.withdraw3({
     *     hyperliquidChain: "Mainnet", // Use mainnet
     *     signatureChainId: "0x66eee", // Hyperliquid chain ID
     *     destination: "0x..." // Recipient's address
     *     amount: "1000", // Amount in USD
     *     time: Date.now(), // Current timestamp
     * });
     * ```
     */
    async withdraw3(args: Withdraw3Parameters): Promise<SuccessResponse> {
        const action: Withdraw3Request["action"] = {
            type: "withdraw3",
            hyperliquidChain: args.hyperliquidChain,
            signatureChainId: args.signatureChainId,
            amount: args.amount,
            time: args.time,
            destination: args.destination,
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
            hexToNumber(action.signatureChainId),
        );
        return await this.request({ action, signature, nonce: args.time });
    }

    /**
     * Transfers funds between Spot and Perp accounts.
     *
     * @requestWeight 1
     * @throws {HyperliquidAPIError} If the API returns an error.
     *
     * @example
     * ```ts
     * const result = await client.spotUser({
     *     usdc: 1000000, // Amount in raw USDC units (float amount * 1e6)
     *     toPerp: true // Transfer from Spot to Perp
     * });
     * ```
     */
    async spotUser(args: SpotUserParameters): Promise<SuccessResponse> {
        const action: SpotUserRequest["action"] = {
            type: "spotUser",
            classTransfer: {
                usdc: args.usdc,
                toPerp: args.toPerp,
            },
        };
        const nonce = Date.now();
        const signature = await this.signL1Action(action, null, nonce);
        return await this.request({ action, signature, nonce });
    }

    /**
     * Deposits or withdraws from a vault.
     *
     * @requestWeight 1
     * @throws {HyperliquidAPIError} If the API returns an error.
     *
     * @example
     * ```ts
     * const result = await client.vaultTransfer({
     *     vaultAddress: "0x...", // Vault address
     *     isDeposit: true, // Deposit to vault
     *     usd: 1000000 // Amount in raw USD units (float amount * 1e6)
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
        return await this.request({ action, signature, nonce });
    }

    protected async request<T extends OrderRequest>(body: T): Promise<OrderResponseSuccess>;
    protected async request<T extends CancelRequest>(body: T): Promise<CancelResponseSuccess>;
    protected async request<T extends CancelByCloidRequest>(body: T): Promise<CancelResponseSuccess>;
    protected async request<T extends ScheduleCancelRequest>(body: T): Promise<SuccessResponse>;
    protected async request<T extends ModifyRequest>(body: T): Promise<SuccessResponse>;
    protected async request<T extends BatchModifyRequest>(body: T): Promise<OrderResponseSuccess>;
    protected async request<T extends UpdateLeverageRequest>(body: T): Promise<SuccessResponse>;
    protected async request<T extends UpdateIsolatedMarginRequest>(body: T): Promise<SuccessResponse>;
    protected async request<T extends UsdSendRequest>(body: T): Promise<SuccessResponse>;
    protected async request<T extends SpotSendRequest>(body: T): Promise<SuccessResponse>;
    protected async request<T extends Withdraw3Request>(body: T): Promise<SuccessResponse>;
    protected async request<T extends SpotUserRequest>(body: T): Promise<SuccessResponse>;
    protected async request<T extends VaultTransferRequest>(body: T): Promise<SuccessResponse>;
    protected async request<T extends unknown>(body: T): Promise<unknown> {
        const res = await fetch(
            this.endpoint,
            {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify(body),
            },
        );

        if (!res.ok) {
            throw new Error(`Request failed with status ${res.status}: ${await res.text()}`);
        }

        const data = await res.json() as SuccessResponse | ErrorResponse | OrderResponse | CancelResponse;

        if (data.status !== "ok") {
            throw new HyperliquidAPIError(data.response);
        }
        if (
            data.response.type !== "default" &&
            data.response.data.statuses.some((status) => typeof status === "object" && status !== null && "error" in status)
        ) {
            const messages = data.response.data.statuses
                .filter((status) => typeof status === "object" && status !== null && "error" in status)
                .map((status) => status.error);
            throw new HyperliquidBatchAPIError(messages);
        }

        return data as SuccessResponse | OrderResponseSuccess | CancelResponseSuccess;
    }

    protected async signL1Action(
        action: Record<string, unknown>,
        vaultAddress: Hex | null,
        nonce: number,
    ): Promise<{ r: Hex; s: Hex; v: number }> {
        const actionHash = this.createActionHash(action, vaultAddress, nonce);

        if (isAbstractWalletClient(this.walletClientOrSigner)) {
            const signature = await this.walletClientOrSigner.signTypedData({
                domain: {
                    name: "Exchange",
                    version: "1",
                    chainId: 1337,
                    verifyingContract: "0x0000000000000000000000000000000000000000",
                },
                types: {
                    Agent: [
                        { name: "source", type: "string" },
                        { name: "connectionId", type: "bytes32" },
                    ],
                },
                primaryType: "Agent",
                message: {
                    source: this.isMainnet ? "a" : "b",
                    connectionId: actionHash,
                },
            });

            return parseSignature(signature);
        } else if (isAbstractSigner(this.walletClientOrSigner)) {
            const signature = await this.walletClientOrSigner.signTypedData(
                {
                    name: "Exchange",
                    version: "1",
                    chainId: 1337,
                    verifyingContract: "0x0000000000000000000000000000000000000000",
                },
                {
                    Agent: [
                        { name: "source", type: "string" },
                        { name: "connectionId", type: "bytes32" },
                    ],
                },
                {
                    source: this.isMainnet ? "a" : "b",
                    connectionId: actionHash,
                },
            );

            if (!isHex(signature)) {
                throw new Error("Invalid signature format");
            }

            return parseSignature(signature);
        } else {
            throw new Error("Unsupported wallet client");
        }
    }

    protected async signUserSignedAction(
        action: Record<string, unknown>,
        payloadTypes: Array<{ name: string; type: string }>,
        primaryType: string,
        chainId: number,
    ): Promise<{ r: Hex; s: Hex; v: number }> {
        if (isAbstractWalletClient(this.walletClientOrSigner)) {
            const signature = await this.walletClientOrSigner.signTypedData({
                domain: {
                    name: "HyperliquidSignTransaction",
                    version: "1",
                    chainId,
                    verifyingContract: "0x0000000000000000000000000000000000000000",
                },
                types: {
                    [primaryType]: payloadTypes,
                },
                primaryType,
                message: action,
            });

            return parseSignature(signature);
        } else if (isAbstractSigner(this.walletClientOrSigner)) {
            const signature = await this.walletClientOrSigner.signTypedData(
                {
                    name: "HyperliquidSignTransaction",
                    version: "1",
                    chainId,
                    verifyingContract: "0x0000000000000000000000000000000000000000",
                },
                {
                    [primaryType]: payloadTypes,
                },
                action,
            );

            if (!isHex(signature)) {
                throw new Error("Invalid signature format");
            }

            return parseSignature(signature);
        } else {
            throw new Error("Unsupported wallet client");
        }
    }

    protected createActionHash(action: Record<string, unknown>, vaultAddress: Hex | null, nonce: number): Hex {
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
}

function hexToBytes(hex: Hex): Uint8Array {
    const len = hex.length;
    if (len % 2 !== 0) throw new Error(`Invalid hex string length: ${len}. Length must be even.`);
    const bytes = new Uint8Array(len / 2);
    for (let i = 0; i < len; i += 2) {
        const c1 = hex.charCodeAt(i);
        const c2 = hex.charCodeAt(i + 1);

        let high: number;
        if (c1 >= 48 && c1 <= 57) { // '0' - '9'
            high = c1 - 48;
        } else if (c1 >= 65 && c1 <= 70) { // 'A' - 'F'
            high = c1 - 55;
        } else if (c1 >= 97 && c1 <= 102) { // 'a' - 'f'
            high = c1 - 87;
        } else {
            throw new Error(`Invalid hex character at index ${i}: '${hex[i]}'`);
        }

        let low: number;
        if (c2 >= 48 && c2 <= 57) { // '0' - '9'
            low = c2 - 48;
        } else if (c2 >= 65 && c2 <= 70) { // 'A' - 'F'
            low = c2 - 55;
        } else if (c2 >= 97 && c2 <= 102) { // 'a' - 'f'
            low = c2 - 87;
        } else {
            throw new Error(`Invalid hex character at index ${i + 1}: '${hex[i + 1]}'`);
        }

        bytes[i / 2] = (high << 4) | low;
    }
    return bytes;
}

function hexToNumber(hex: Hex): number {
    return parseInt(hex, 16);
}

function parseSignature(signature: Hex): { r: Hex; s: Hex; v: number } {
    return {
        r: `0x${signature.slice(2, 66)}`,
        s: `0x${signature.slice(66, 130)}`,
        v: parseInt(signature.slice(130, 132), 16),
    };
}

function bytesToHex(bytes: Uint8Array): Hex {
    const lookup = "0123456789abcdef";
    let hex: Hex = "0x";
    for (let i = 0; i < bytes.length; i++) {
        hex += lookup[bytes[i] >> 4] + lookup[bytes[i] & 0xF];
    }
    return hex;
}

function isHex(data: unknown): data is Hex {
    return typeof data === "string" && /^0x[0-9a-fA-F]+$/.test(data);
}

function isAbstractWalletClient(client: AbstractWalletClient | AbstractSigner): client is AbstractWalletClient {
    return client.signTypedData.length === 1;
}

function isAbstractSigner(client: AbstractWalletClient | AbstractSigner): client is AbstractSigner {
    return client.signTypedData.length === 3;
}
