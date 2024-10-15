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
import { HttpError, HyperliquidAPIError, HyperliquidBatchAPIError } from "./error.ts";

/** @see {@linkcode ExchangeClient.approveAgent} */
export interface ApproveAgentParameters {
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
}

/** @see {@linkcode ExchangeClient.approveBuilderFee} */
export interface ApproveBuilderFeeParameters {
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
}

/** @see {@linkcode ExchangeClient.batchModify} */
export interface BatchModifyParameters {
    /** Order modifications. */
    modifies: {
        /** Order ID to modify. */
        oid: number;

        /** New order parameters. */
        order: Order;
    }[];

    /** Vault address (optional, for vault trading). */
    vaultAddress?: Hex;
}

/** @see {@linkcode ExchangeClient.cancel} */
export interface CancelParameters {
    /** Orders to cancel. */
    cancels: {
        /** Coin index. */
        a: number;

        /** Order ID. */
        o: number;
    }[];

    /** Vault address (optional, for vault trading). */
    vaultAddress?: Hex;
}

/** @see {@linkcode ExchangeClient.cancelByCloid} */
export interface CancelByCloidParameters {
    /** Orders to cancel. */
    cancels: {
        /** Coin index. */
        asset: number;

        /** Client Order ID. */
        cloid: Hex;
    }[];

    /** Vault address (optional, for vault trading). */
    vaultAddress?: Hex;
}

/** @see {@linkcode ExchangeClient.createSubAccount} */
export interface CreateSubAccountParameters {
    /** Sub-account name. */
    name: string;
}

/** @see {@linkcode ExchangeClient.modify} */
export interface ModifyParameters {
    /** Order ID to modify. */
    oid: number;

    /** New order parameters. */
    order: Order;

    /** Vault address (optional, for vault trading). */
    vaultAddress?: Hex;
}

/** @see {@linkcode ExchangeClient.order} */
export interface OrderParameters {
    /** Order parameters. */
    orders: Order[];

    /** Order grouping strategy. */
    grouping: OrderGroupingStrategy;

    /** Vault address (optional, for vault trading). */
    vaultAddress?: Hex;
}

/** @see {@linkcode ExchangeClient.scheduleCancel} */
export interface ScheduleCancelParameters {
    /** Scheduled time (in ms since epoch). Must be at least 5 seconds in the future. */
    time: number;

    /** Vault address (optional, for vault trading). */
    vaultAddress?: Hex;
}

/** @see {@linkcode ExchangeClient.setReferrer} */
export interface SetReferrerParameters {
    /** Referral code. */
    code: string;
}

/** @see {@linkcode ExchangeClient.spotSend} */
export interface SpotSendParameters {
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
}

/** @see {@linkcode ExchangeClient.subAccountTransfer} */
export interface SubAccountTransferParameters {
    /** Sub-account address. */
    subAccountUser: Hex;

    /** `true` for deposit, `false` for withdrawal. */
    isDeposit: boolean;

    /** Amount to transfer (float * 1e6). */
    usd: number;
}

/** @see {@linkcode ExchangeClient.updateIsolatedMargin} */
export interface UpdateIsolatedMarginParameters {
    /** Coin index. */
    asset: number;

    /** Position side (`true` for long, `false` for short). */
    isBuy: boolean;

    /** Amount to adjust (in USD). This should be an integer value. */
    ntli: number;

    /** Vault address (optional, for vault trading). */
    vaultAddress?: Hex;
}

/** @see {@linkcode ExchangeClient.updateLeverage} */
export interface UpdateLeverageParameters {
    /** Coin index. */
    asset: number;

    /** `true` for cross leverage, `false` for isolated leverage. */
    isCross: boolean;

    /** New leverage value. */
    leverage: number;

    /** Vault address (optional, for vault trading). */
    vaultAddress?: Hex;
}

/** @see {@linkcode ExchangeClient.usdClassTransfer} */
export interface UsdClassTransferParameters {
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
}

/** @see {@linkcode ExchangeClient.usdSend} */
export interface UsdSendParameters {
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
}

/** @see {@linkcode ExchangeClient.vaultTransfer} */
export interface VaultTransferParameters {
    /** Vault address. */
    vaultAddress: Hex;

    /** `true` for deposit, `false` for withdrawal. */
    isDeposit: boolean;

    /** Amount to transfer (float * 1e6). */
    usd: number;
}

/** @see {@linkcode ExchangeClient.withdraw3} */
export interface Withdraw3Parameters {
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
}

/** Successful variant of {@linkcode CancelResponse}. */
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

/** Successful variant of {@linkcode OrderResponse}. */
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

/** A client to interact with the Hyperliquid exchange APIs. */
export class ExchangeClient {
    /** The WalletClient/Account ([viem](https://viem.sh/docs/clients/wallet)) or Signer ([ethers](https://docs.ethers.org/v6/api/providers/#Signer)) used for signing transactions. */
    public readonly wallet: AbstractWalletClient | AbstractSigner;

    /** The endpoint of the Hyperliquid exchange APIs. */
    public readonly endpoint: string;

    /** If the endpoint is testnet, change this value to `false`. */
    public readonly isMainnet: boolean;

    /**
     * Initialises a new instance.
     *
     * @param wallet The WalletClient/Account ([viem](https://viem.sh/docs/clients/wallet)) or signer ([ethers](https://docs.ethers.org/v6/api/providers/#Signer)) used for signing transactions.
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
        wallet: AbstractWalletClient | AbstractSigner,
        endpoint: string = "https://api.hyperliquid.xyz/exchange",
        isMainnet: boolean = true,
    ) {
        this.wallet = wallet;
        this.endpoint = endpoint;
        this.isMainnet = isMainnet;
    }

    /**
     * Approve an agent to sign on behalf of the master or sub-accounts.
     *
     * @throws {HttpError} if HTTP response is not ok.
     * @throws {HyperliquidAPIError} if Hyperliquid API response is not ok.
     *
     * @see {@link https://hyperliquid.gitbook.io/hyperliquid-docs/for-developers/api/exchange-endpoint#approve-an-api-wallet|Hyperliquid GitBook}
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
     * @throws {HttpError} if HTTP response is not ok.
     * @throws {HyperliquidAPIError} if Hyperliquid API response is not ok.
     *
     * @see {@link https://hyperliquid.gitbook.io/hyperliquid-docs/for-developers/api/exchange-endpoint#approve-a-builder-fee|Hyperliquid GitBook}
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
     * @throws {HttpError} if HTTP response is not ok.
     * @throws {HyperliquidBatchAPIError} if Hyperliquid API response is not ok.
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
        return await this.request({ action, signature, nonce, vaultAddress: args.vaultAddress });
    }

    /**
     * Cancel order(s).
     *
     * @throws {HttpError} if HTTP response is not ok.
     * @throws {HyperliquidBatchAPIError} if Hyperliquid API response is not ok.
     *
     * @see {@link https://hyperliquid.gitbook.io/hyperliquid-docs/for-developers/api/exchange-endpoint#cancel-order-s|Hyperliquid GitBook}
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
     * Cancel order(s) by Client Order ID.
     *
     * @throws {HttpError} if HTTP response is not ok.
     * @throws {HyperliquidBatchAPIError} if Hyperliquid API response is not ok.
     *
     * @see {@link https://hyperliquid.gitbook.io/hyperliquid-docs/for-developers/api/exchange-endpoint#cancel-order-s-by-cloid|Hyperliquid GitBook}
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
     * Create a sub-account.
     *
     * @throws {HttpError} if HTTP response is not ok.
     * @throws {HyperliquidAPIError} if Hyperliquid API response is not ok.
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
        return await this.request({ action, signature, nonce });
    }

    /**
     * Modify an order.
     *
     * @throws {HttpError} if HTTP response is not ok.
     * @throws {HyperliquidAPIError} if Hyperliquid API response is not ok.
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
        return await this.request({ action, signature, nonce, vaultAddress: args.vaultAddress });
    }

    /**
     * Place an order(s).
     *
     * @throws {HttpError} if HTTP response is not ok.
     * @throws {HyperliquidBatchAPIError} if Hyperliquid API response is not ok.
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
     * Schedule a time to cancel all open orders.
     *
     * **Note:** A maximum of 10 triggers are allowed per day, resetting at 00:00 UTC.
     *
     * @throws {HttpError} if HTTP response is not ok.
     * @throws {HyperliquidAPIError} if Hyperliquid API response is not ok.
     *
     * @see {@link https://hyperliquid.gitbook.io/hyperliquid-docs/for-developers/api/exchange-endpoint#schedule-cancel-dead-mans-switch|Hyperliquid GitBook}
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
     * Set a referral code.
     *
     * @throws {HttpError} if HTTP response is not ok.
     * @throws {HyperliquidAPIError} if Hyperliquid API response is not ok.
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
        return await this.request({ action, signature, nonce });
    }

    /**
     * Transfer a spot asset on L1 to another address.
     *
     * @throws {HttpError} if HTTP response is not ok.
     * @throws {HyperliquidAPIError} if Hyperliquid API response is not ok.
     *
     * @see {@link https://hyperliquid.gitbook.io/hyperliquid-docs/for-developers/api/exchange-endpoint#l1-spot-transfer|Hyperliquid GitBook}
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
     * @throws {HttpError} if HTTP response is not ok.
     * @throws {HyperliquidAPIError} if Hyperliquid API response is not ok.
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
        return await this.request({ action, signature, nonce });
    }

    /**
     * Update isolated margin for a position.
     *
     * @throws {HttpError} if HTTP response is not ok.
     * @throws {HyperliquidAPIError} if Hyperliquid API response is not ok.
     *
     * @see {@link https://hyperliquid.gitbook.io/hyperliquid-docs/for-developers/api/exchange-endpoint#update-isolated-margin|Hyperliquid GitBook}
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
        return await this.request({ action, signature, nonce, vaultAddress: args.vaultAddress });
    }

    /**
     * Update leverage for cross or isolated margin.
     *
     * @throws {HttpError} if HTTP response is not ok.
     * @throws {HyperliquidAPIError} if Hyperliquid API response is not ok.
     *
     * @see {@link https://hyperliquid.gitbook.io/hyperliquid-docs/for-developers/api/exchange-endpoint#update-leverage|Hyperliquid GitBook}
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
        return await this.request({ action, signature, nonce, vaultAddress: args.vaultAddress });
    }

    /**
     * Transfer funds between Spot and Perp accounts.
     *
     * @throws {HttpError} if HTTP response is not ok.
     * @throws {HyperliquidAPIError} if Hyperliquid API response is not ok.
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
     * @throws {HttpError} if HTTP response is not ok.
     * @throws {HyperliquidAPIError} if Hyperliquid API response is not ok.
     *
     * @see {@link https://hyperliquid.gitbook.io/hyperliquid-docs/for-developers/api/exchange-endpoint#l1-usdc-transfer|Hyperliquid GitBook}
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
     * @throws {HttpError} if HTTP response is not ok.
     * @throws {HyperliquidAPIError} if Hyperliquid API response is not ok.
     *
     * @see {@link https://hyperliquid.gitbook.io/hyperliquid-docs/for-developers/api/exchange-endpoint#deposit-or-withdraw-from-a-vault|Hyperliquid GitBook}
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
        return await this.request({ action, signature, nonce });
    }

    /**
     * Initiate a withdrawal request.
     *
     * @throws {HttpError} if HTTP response is not ok.
     * @throws {HyperliquidAPIError} if Hyperliquid API response is not ok.
     *
     * @see {@link https://hyperliquid.gitbook.io/hyperliquid-docs/for-developers/api/exchange-endpoint#initiate-a-withdrawal-request|Hyperliquid GitBook}
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

    protected async request(body: ApproveAgentRequest): Promise<SuccessResponse>;
    protected async request(body: ApproveBuilderFeeRequest): Promise<SuccessResponse>;
    protected async request(body: BatchModifyRequest): Promise<OrderResponseSuccess>;
    protected async request(body: CancelRequest): Promise<CancelResponseSuccess>;
    protected async request(body: CancelByCloidRequest): Promise<CancelResponseSuccess>;
    protected async request(body: CreateSubAccountRequest): Promise<CreateSubAccountResponse>;
    protected async request(body: ModifyRequest): Promise<SuccessResponse>;
    protected async request(body: OrderRequest): Promise<OrderResponseSuccess>;
    protected async request(body: ScheduleCancelRequest): Promise<SuccessResponse>;
    protected async request(body: SetReferrerRequest): Promise<SuccessResponse>;
    protected async request(body: SpotSendRequest): Promise<SuccessResponse>;
    protected async request(body: SubAccountTransferRequest): Promise<SuccessResponse>;
    protected async request(body: UpdateIsolatedMarginRequest): Promise<SuccessResponse>;
    protected async request(body: UpdateLeverageRequest): Promise<SuccessResponse>;
    protected async request(body: UsdClassTransferRequest): Promise<SuccessResponse>;
    protected async request(body: UsdSendRequest): Promise<SuccessResponse>;
    protected async request(body: VaultTransferRequest): Promise<SuccessResponse>;
    protected async request(body: Withdraw3Request): Promise<SuccessResponse>;
    protected async request<T extends unknown>(body: T): Promise<unknown> {
        const response = await fetch(
            this.endpoint,
            {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify(body),
            },
        );

        if (!response.ok) {
            throw new HttpError(response);
        }

        const data = await response.json() as
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
            data.response.data.statuses.some((status) => isObject(status) && "error" in status)
        ) {
            const messages = data.response.data.statuses
                .filter((status) => isObject(status) && "error" in status)
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
            source: this.isMainnet ? "a" : "b",
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

    /** Sign a user-signed action */
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

function isObject(data: unknown): data is Record<string, unknown> {
    return typeof data === "object" && data !== null;
}

function isAbstractWalletClient(client: unknown): client is AbstractWalletClient {
    return isObject(client) && typeof client.signTypedData === "function" && client.signTypedData.length === 1;
}

function isAbstractSigner(client: unknown): client is AbstractSigner {
    return isObject(client) && typeof client.signTypedData === "function" && client.signTypedData.length === 3;
}
