import { keccak_256 } from "@noble/hashes/sha3";
import { encode } from "@msgpack/msgpack";
import type { Hex } from "./types/info.d.ts";
import type {
    ApproveAgentRequest,
    ApproveBuilderFeeRequest,
    BatchModifyRequest,
    CancelByCloidRequest,
    CancelRequest,
    CancelResponse,
    CreateSubAccountRequest,
    CreateSubAccountResponse,
    ErrorResponse,
    ModifyRequest,
    Order,
    OrderGroupingStrategy,
    OrderRequest,
    OrderResponse,
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
import { HyperliquidAPIError, HyperliquidBatchAPIError } from "./error.ts";

/**
 * Successful variant of {@link CancelResponse}.
 */
export interface CancelResponseSuccess extends CancelResponse {
    /** Successful status. */
    status: "ok";

    /** Response details. */
    response: {
        /** Type of operation. */
        type: "cancel";

        /** Specific data. */
        data: {
            /** Array of statuses. */
            statuses: "success"[];
        };
    };
}

/**
 * Successful variant of {@link OrderResponse}.
 */
export interface OrderResponseSuccess extends OrderResponse {
    /** Successful status. */
    status: "ok";

    /** Response details. */
    response: {
        /** Type of operation. */
        type: "order";

        /** Specific data. */
        data: {
            /** Array of statuses. */
            statuses: (
                | {
                    /** Resting order status. */
                    resting: {
                        /** Order ID. */
                        oid: number;

                        /** Client Order ID. */
                        cloid?: Hex;
                    };
                }
                | {
                    /** Filled order status. */
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
 * Abstract interface for a wallet client (compatible with [viem](https://viem.sh/docs/clients/wallet)'s WalletClient/Account).
 */
export interface AbstractWalletClient {
    /** Abstract function for signing typed data. */
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
 * Abstract interface for a signer (compatible with [ethers](https://docs.ethers.org/v6/api/providers/#Signer)' Signer).
 */
export interface AbstractSigner {
    /** Abstract function for signing typed data. */
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
export class ExchangeClient {
    /** The WalletClient/Account ([viem](https://viem.sh/docs/clients/wallet)) or Signer ([ethers](https://docs.ethers.org/v6/api/providers/#Signer)) used for signing transactions. */
    public readonly walletClientOrSigner: AbstractWalletClient | AbstractSigner;

    /** The endpoint of the Hyperliquid exchange APIs. */
    public readonly endpoint: string; // TESTNET: https://api.hyperliquid-testnet.xyz/exchange

    /** If the endpoint is testnet, change this value to `false`. */
    public readonly isMainnet: boolean;

    /**
     * Initialises a new instance.
     *
     * @param walletClientOrSigner The WalletClient/Account ([viem](https://viem.sh/docs/clients/wallet)) or signer ([ethers](https://docs.ethers.org/v6/api/providers/#Signer)) used for signing transactions.
     * @param endpoint The endpoint of the Hyperliquid exchange APIs.
     * @param isMainnet If the endpoint is testnet, change this value to `false`.
     *
     * @example Private key via [viem](https://viem.sh/docs/clients/wallet#local-accounts-private-key-mnemonic-etc)
     * ```ts
     * import * as hyperliquid from "@nktkas/hyperliquid";
     * import { privateKeyToAccount } from "viem/accounts";
     *
     * const account = privateKeyToAccount("0x...");
     *
     * const client = new hyperliquid.ExchangeClient(account);
     * ```
     *
     * @example Private key via [ethers](https://docs.ethers.org/v6/api/wallet/#Wallet)
     * ```ts
     * import * as hyperliquid from "@nktkas/hyperliquid";
     * import { ethers } from "ethers";
     *
     * const wallet = new ethers.Wallet("0x...");
     *
     * const client = new hyperliquid.ExchangeClient(wallet);
     * ```
     *
     * @example External wallet (e.g. MetaMask) via [viem](https://viem.sh/docs/clients/wallet#json-rpc-accounts)
     * ```ts
     * import * as hyperliquid from "@nktkas/hyperliquid";
     * import { createWalletClient, custom } from "viem";
     * import { arbitrum } from "viem/chains";
     *
     * const [account] = await window.ethereum!.request({ method: "eth_requestAccounts" });
     *
     * const walletClient = createWalletClient({ account, chain: arbitrum, transport: http() });
     *
     * const client = new hyperliquid.ExchangeClient(walletClient);
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
     * Approve an agent to sign on behalf of the master or sub-accounts.
     *
     * @throws {HyperliquidAPIError} Thrown if the response is not successful.
     *
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
    async approveAgent(
        /** The parameters for the request. */
        args: {
            /** HyperLiquid network. */
            hyperliquidChain: "Mainnet" | "Testnet";

            /** Chain ID used for signing. */
            signatureChainId: Hex;

            /** Agent address. */
            agentAddress: Hex;

            /** Agent name. */
            agentName: string;

            /** Unique request identifier (recommended: current timestamp in ms). */
            nonce: number;
        },
    ): Promise<SuccessResponse> {
        const action: ApproveAgentRequest["action"] = {
            type: "approveAgent",
            hyperliquidChain: args.hyperliquidChain,
            signatureChainId: args.signatureChainId,
            agentAddress: args.agentAddress,
            agentName: args.agentName,
            nonce: args.nonce,
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
            hexToNumber(action.signatureChainId),
        );
        return await this.request({ action, signature, nonce: args.nonce });
    }

    /**
     * Approve a max fee rate for a builder address.
     *
     * @throws {HyperliquidAPIError} Thrown if the response is not successful.
     *
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
    async approveBuilderFee(
        /** The parameters for the request. */
        args: {
            /** HyperLiquid network. */
            hyperliquidChain: "Mainnet" | "Testnet";

            /** Chain ID used for signing. */
            signatureChainId: Hex;

            /** Max fee rate (e.g., "0.01%"). */
            maxFeeRate: `${string}%`;

            /** Builder address. */
            builder: Hex;

            /** Unique request identifier (recommended: current timestamp in ms). */
            nonce: number;
        },
    ): Promise<SuccessResponse> {
        const action: ApproveBuilderFeeRequest["action"] = {
            type: "approveBuilderFee",
            hyperliquidChain: args.hyperliquidChain,
            signatureChainId: args.signatureChainId,
            maxFeeRate: args.maxFeeRate,
            builder: args.builder,
            nonce: args.nonce,
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
            hexToNumber(action.signatureChainId),
        );
        return await this.request({ action, signature, nonce: args.nonce });
    }

    /**
     * Modify multiple orders.
     *
     * @throws {HyperliquidBatchAPIError} Thrown if the response is not successful.
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
     *             },
     *             c: "0x1234567890abcdef1234567890abcdef" // Optional: Client Order ID
     *         }
     *     }]
     * });
     * ```
     */
    async batchModify(
        /** The parameters for the request. */
        args: {
            /** Order modifications. */
            modifies: {
                /** Order ID to modify. */
                oid: number;

                /** New order parameters. */
                order: Order;
            }[];

            /** Vault address (optional, for vault trading). */
            vaultAddress?: Hex;
        },
    ): Promise<OrderResponseSuccess> {
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
     * Cancel order(s).
     *
     * @throws {HyperliquidBatchAPIError} Thrown if the response is not successful.
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
    async cancel(
        /** The parameters for the request. */
        args: {
            /** Orders to cancel. */
            cancels: {
                /** Coin index. */
                a: number;

                /** Order ID. */
                o: number;
            }[];

            /** Vault address (optional, for vault trading). */
            vaultAddress?: Hex;
        },
    ): Promise<CancelResponseSuccess> {
        const action: CancelRequest["action"] = {
            type: "cancel",
            cancels: args.cancels.map((cancel) => ({ a: cancel.a, o: cancel.o })),
        };
        const nonce = Date.now();
        const signature = await this.signL1Action(action, args.vaultAddress ?? null, nonce);
        return await this.request({ action, signature, nonce, vaultAddress: args.vaultAddress });
    }

    /**
     * Cancel order(s) by Client Order ID.
     *
     * @throws {HyperliquidBatchAPIError} Thrown if the response is not successful.
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
    async cancelByCloid(
        /** The parameters for the request. */
        args: {
            /** Orders to cancel. */
            cancels: {
                /** Coin index. */
                asset: number;

                /** Client Order ID. */
                cloid: Hex;
            }[];

            /** Vault address (optional, for vault trading). */
            vaultAddress?: Hex;
        },
    ): Promise<CancelResponseSuccess> {
        const action: CancelByCloidRequest["action"] = {
            type: "cancelByCloid",
            cancels: args.cancels.map((cancel) => ({ asset: cancel.asset, cloid: cancel.cloid })),
        };
        const nonce = Date.now();
        const signature = await this.signL1Action(action, args.vaultAddress ?? null, nonce);
        return await this.request({ action, signature, nonce, vaultAddress: args.vaultAddress });
    }

    /**
     * Create a sub-account.
     *
     * @throws {HyperliquidAPIError} Thrown if the response is not successful.
     *
     * @example
     * ```ts
     * const result = await client.createSubAccount({
     *     name: "subAccountName" // Sub-account name
     * });
     * ```
     */
    async createSubAccount(
        /** The parameters for the request. */
        args: {
            /** Sub-account name. */
            name: string;
        },
    ): Promise<CreateSubAccountResponse> {
        const action: CreateSubAccountRequest["action"] = {
            type: "createSubAccount",
            name: args.name,
        };
        const nonce = Date.now();
        const signature = await this.signL1Action(action, null, nonce);
        return await this.request({ action, signature, nonce });
    }

    /**
     * Modify an order.
     *
     * @throws {HyperliquidAPIError} Thrown if the response is not successful.
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
     *         },
     *         c: "0x1234567890abcdef1234567890abcdef" // Optional: Client Order ID
     *     }
     * });
     * ```
     */
    async modify(
        /** The parameters for the request. */
        args: {
            /** Order ID to modify. */
            oid: number;

            /** New order parameters. */
            order: Order;

            /** Vault address (optional, for vault trading). */
            vaultAddress?: Hex;
        },
    ): Promise<SuccessResponse> {
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
     * Place an order(s).
     *
     * @throws {HyperliquidBatchAPIError} Thrown if the response is not successful.
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
    async order(
        /** The parameters for the request. */
        args: {
            /** Order parameters. */
            orders: Order[];

            /** Order grouping strategy. */
            grouping: OrderGroupingStrategy;

            /** Vault address (optional, for vault trading). */
            vaultAddress?: Hex;
        },
    ): Promise<OrderResponseSuccess> {
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
     * Schedule a time to cancel all open orders.
     *
     * **Note:** A maximum of 10 triggers are allowed per day, resetting at 00:00 UTC.
     *
     * @throws {HyperliquidAPIError} Thrown if the response is not successful.
     *
     * @example
     * ```ts
     * const result = await client.scheduleCancel({
     *     time: Date.now() + 3600000 // Schedule cancellation 1 hour from now
     * });
     * ```
     */
    async scheduleCancel(
        /** The parameters for the request. */
        args: {
            /** Scheduled time (in ms since epoch). Must be at least 5 seconds in the future. */
            time: number;

            /** Vault address (optional, for vault trading). */
            vaultAddress?: Hex;
        },
    ): Promise<SuccessResponse> {
        const action: ScheduleCancelRequest["action"] = {
            type: "scheduleCancel",
            time: args.time,
        };
        const nonce = Date.now();
        const signature = await this.signL1Action(action, args.vaultAddress ?? null, nonce);
        return await this.request({ action, signature, nonce, vaultAddress: args.vaultAddress });
    }

    /**
     * Set a referral code.
     *
     * @throws {HyperliquidAPIError} Thrown if the response is not successful.
     *
     * @example
     * ```ts
     * const result = await client.setReferrer({
     *     code: "TEST" // Referral code
     * });
     * ```
     */
    async setReferrer(
        /** The parameters for the request. */
        args: {
            /** Referral code. */
            code: string;
        },
    ): Promise<SuccessResponse> {
        const action: SetReferrerRequest["action"] = {
            type: "setReferrer",
            code: args.code,
        };
        const nonce = Date.now();
        const signature = await this.signL1Action(action, null, nonce);
        return await this.request({ action, signature, nonce });
    }

    /**
     * Transfer a spot asset on L1 to another address.
     *
     * @throws {HyperliquidAPIError} Thrown if the response is not successful.
     *
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
    async spotSend(
        /** The parameters for the request. */
        args: {
            /** HyperLiquid network. */
            hyperliquidChain: "Mainnet" | "Testnet";

            /** Chain ID used for signing. */
            signatureChainId: Hex;

            /** Recipient address. */
            destination: Hex;

            /** Token identifier (e.g., tokenName:tokenId). */
            token: `${string}:${Hex}`;

            /** Amount to send. */
            amount: string;

            /** Current timestamp in ms. */
            time: number;
        },
    ): Promise<SuccessResponse> {
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
     * Transfer between sub-accounts.
     *
     * @throws {HyperliquidAPIError} Thrown if the response is not successful.
     *
     * @example
     * ```ts
     * const result = await client.subAccountTransfer({
     *     subAccountUser: "0x...", // Sub-account address
     *     isDeposit: true, // Deposit to sub-account
     *     usd: 1000000 // 1 USD in raw units (float amount * 1e6)
     * });
     * ```
     */
    async subAccountTransfer(
        /** The parameters for the request. */
        args: {
            /** Sub-account address. */
            subAccountUser: Hex;

            /** `true` for deposit, `false` for withdrawal. */
            isDeposit: boolean;

            /** Amount to transfer (float * 1e6). */
            usd: number;
        },
    ): Promise<SuccessResponse> {
        const action: SubAccountTransferRequest["action"] = {
            type: "subAccountTransfer",
            subAccountUser: args.subAccountUser,
            isDeposit: args.isDeposit,
            usd: args.usd,
        };
        const nonce = Date.now();
        const signature = await this.signL1Action(action, null, nonce);
        return await this.request({ action, signature, nonce });
    }

    /**
     * Update isolated margin for a position.
     *
     * @throws {HyperliquidAPIError} Thrown if the response is not successful.
     *
     * @example
     * ```ts
     * const result = await client.updateIsolatedMargin({
     *     asset: 0, // Asset index
     *     isBuy: true, // Add to long position
     *     ntli: 1000 // Add 1000 USD margin (integer only)
     * });
     * ```
     */
    async updateIsolatedMargin(
        /** The parameters for the request. */
        args: {
            /** Coin index. */
            asset: number;

            /** Position side (`true` for long, `false` for short). */
            isBuy: boolean;

            /** Amount to adjust (in USD). This should be an integer value. */
            ntli: number;

            /** Vault address (optional, for vault trading). */
            vaultAddress?: Hex;
        },
    ): Promise<SuccessResponse> {
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
     * Update leverage for cross or isolated margin.
     *
     * @throws {HyperliquidAPIError} Thrown if the response is not successful.
     *
     * @example
     * ```ts
     * const result = await client.updateLeverage({
     *     asset: 0, // Asset index
     *     isCross: true, // Use cross leverage
     *     leverage: 5 // Set leverage to 5
     * });
     * ```
     */
    async updateLeverage(
        /** The parameters for the request. */
        args: {
            /** Coin index. */
            asset: number;

            /** `true` for cross leverage, `false` for isolated leverage. */
            isCross: boolean;

            /** New leverage value. */
            leverage: number;

            /** Vault address (optional, for vault trading). */
            vaultAddress?: Hex;
        },
    ): Promise<SuccessResponse> {
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
     * Transfer funds between Spot and Perp accounts.
     *
     * @throws {HyperliquidAPIError} Thrown if the response is not successful.
     *
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
    async usdClassTransfer(
        /** The parameters for the request. */
        args: {
            /** HyperLiquid network. */
            hyperliquidChain: "Mainnet" | "Testnet";

            /** Chain ID used for signing. */
            signatureChainId: Hex;

            /** USD amount to transfer. */
            amount: string;

            /** `true` for Spot to Perp, `false` for Perp to Spot. */
            toPerp: boolean;

            /** Unique request identifier (recommended: current timestamp in ms). */
            nonce: number;
        },
    ): Promise<SuccessResponse> {
        const action: UsdClassTransferRequest["action"] = {
            type: "usdClassTransfer",
            hyperliquidChain: args.hyperliquidChain,
            signatureChainId: args.signatureChainId,
            amount: args.amount,
            toPerp: args.toPerp,
            nonce: args.nonce,
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
            hexToNumber(action.signatureChainId),
        );
        return await this.request({ action, signature, nonce: args.nonce });
    }

    /**
     * Transfer USDC on L1 to another address.
     *
     * @throws {HyperliquidAPIError} Thrown if the response is not successful.
     *
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
    async usdSend(
        /** The parameters for the request. */
        args: {
            /** HyperLiquid network. */
            hyperliquidChain: "Mainnet" | "Testnet";

            /** Chain ID used for signing. */
            signatureChainId: Hex;

            /** Recipient address. */
            destination: Hex;

            /** USD amount to send. */
            amount: string;

            /** Current timestamp in ms. */
            time: number;
        },
    ): Promise<SuccessResponse> {
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
     * Transfer funds to/from a vault.
     *
     * @throws {HyperliquidAPIError} Thrown if the response is not successful.
     *
     * @example
     * ```ts
     * const result = await client.vaultTransfer({
     *     vaultAddress: "0x...", // Vault address
     *     isDeposit: true, // Deposit to vault
     *     usd: 1000000 // 1 USD in raw units (float amount * 1e6)
     * });
     * ```
     */
    async vaultTransfer(
        /** The parameters for the request. */
        args: {
            /** Vault address. */
            vaultAddress: Hex;

            /** `true` for deposit, `false` for withdrawal. */
            isDeposit: boolean;

            /** Amount to transfer (float * 1e6). */
            usd: number;
        },
    ): Promise<SuccessResponse> {
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

    /**
     * Initiate a withdrawal request.
     *
     * @throws {HyperliquidAPIError} Thrown if the response is not successful.
     *
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
    async withdraw3(
        /** The parameters for the request. */
        args: {
            /** HyperLiquid network. */
            hyperliquidChain: "Mainnet" | "Testnet";

            /** Chain ID used for signing. */
            signatureChainId: Hex;

            /** USD amount to withdraw. */
            amount: string;

            /** Current timestamp in ms. */
            time: number;

            /** Recipient address. */
            destination: Hex;
        },
    ): Promise<SuccessResponse> {
        const action: Withdraw3Request["action"] = {
            type: "withdraw3",
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
            "HyperliquidTransaction:Withdraw",
            hexToNumber(action.signatureChainId),
        );
        return await this.request({ action, signature, nonce: args.time });
    }

    /** Make `approveAgent` request */
    protected async request<T extends ApproveAgentRequest>(body: T): Promise<SuccessResponse>;

    /** Make `approveBuilderFee` request */
    protected async request<T extends ApproveBuilderFeeRequest>(body: T): Promise<SuccessResponse>;

    /** Make `batchModify` request */
    protected async request<T extends BatchModifyRequest>(body: T): Promise<OrderResponseSuccess>;

    /** Make `cancel` request */
    protected async request<T extends CancelRequest>(body: T): Promise<CancelResponseSuccess>;

    /** Make `cancelByCloid` request */
    protected async request<T extends CancelByCloidRequest>(body: T): Promise<CancelResponseSuccess>;

    /** Make `createSubAccount` request */
    protected async request<T extends CreateSubAccountRequest>(body: T): Promise<CreateSubAccountResponse>;

    /** Make `modify` request */
    protected async request<T extends ModifyRequest>(body: T): Promise<SuccessResponse>;

    /** Make `order` request */
    protected async request<T extends OrderRequest>(body: T): Promise<OrderResponseSuccess>;

    /** Make `scheduleCancel` request */
    protected async request<T extends ScheduleCancelRequest>(body: T): Promise<SuccessResponse>;

    /** Make `setReferrer` request */
    protected async request<T extends SetReferrerRequest>(body: T): Promise<SuccessResponse>;

    /** Make `spotSend` request */
    protected async request<T extends SpotSendRequest>(body: T): Promise<SuccessResponse>;

    /** Make `subAccountTransfer` request */
    protected async request<T extends SubAccountTransferRequest>(body: T): Promise<SuccessResponse>;

    /** Make `updateIsolatedMargin` request */
    protected async request<T extends UpdateIsolatedMarginRequest>(body: T): Promise<SuccessResponse>;

    /** Make `updateLeverage` request */
    protected async request<T extends UpdateLeverageRequest>(body: T): Promise<SuccessResponse>;

    /** Make `usdClassTransfer` request */
    protected async request<T extends UsdClassTransferRequest>(body: T): Promise<SuccessResponse>;

    /** Make `usdSend` request */
    protected async request<T extends UsdSendRequest>(body: T): Promise<SuccessResponse>;

    /** Make `vaultTransfer` request */
    protected async request<T extends VaultTransferRequest>(body: T): Promise<SuccessResponse>;

    /** Make `withdraw3` request */
    protected async request<T extends Withdraw3Request>(body: T): Promise<SuccessResponse>;

    /** Make a request */
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

        const data = await res.json() as
            | SuccessResponse
            | ErrorResponse
            | CancelResponse
            | CreateSubAccountResponse
            | OrderResponse;

        if (data.status !== "ok") {
            throw new HyperliquidAPIError(data.response);
        }
        if (
            data.response.type !== "default" &&
            data.response.type !== "createSubAccount" &&
            data.response.data.statuses.some((status) => typeof status === "object" && status !== null && "error" in status)
        ) {
            const messages = data.response.data.statuses
                .filter((status) => typeof status === "object" && status !== null && "error" in status)
                .map((status) => status.error);
            throw new HyperliquidBatchAPIError(messages);
        }

        return data;
    }

    /** Sign an L1 action */
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

    /** Sign a user-signed action */
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

    /** Create a hash of an action */
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
}

// ———————————————Supporting functions———————————————

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
