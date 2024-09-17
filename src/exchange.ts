import {
    type Account,
    type Chain,
    type Hex,
    hexToBytes,
    hexToNumber,
    keccak256,
    parseSignature,
    type RpcSchema,
    type Transport,
    type TypedDataParameter,
    type WalletClient,
} from "viem";
import { encode } from "@msgpack/msgpack";
import type {
    BaseExchangeRequest,
    BaseExchangeResponse,
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

type JSONValue =
    | string
    | number
    | boolean
    | null
    | JSONValue[]
    | { [k: string | number]: JSONValue };

interface JSONObject {
    [k: string | number]: JSONValue;
}

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
    /** Scheduled time for the cancel-all operation (set to `null` to remove scheduled cancel). */
    time: number | null;

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

    /** Amount to add or remove. */
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

    /** Amount of USD to withdraw. */
    amount: string;

    /** Current timestamp in milliseconds. */
    time: number;

    /** Recipient's address. */
    destination: Hex;
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

    /** Amount of USD to transfer. */
    usd: string;
}

/**
 * A client to interact with the Hyperliquid exchange APIs.
 */
export class HyperliquidExchangeClient {
    /** The endpoint of the Hyperliquid exchange APIs. */
    public readonly endpoint: string; // TESTNET: https://api.hyperliquid-testnet.xyz/exchange

    /** If the endpoint is testnet, change this value to `false`. */
    public readonly isMainnet: boolean;

    /** WalletClient from `viem` to sign transactions. */
    public readonly walletClient: WalletClient<Transport, Chain | undefined, Account, RpcSchema | undefined>;

    /**
     * Initializes a new instance of the HyperliquidExchangeClient class.
     *
     * @param walletClient - WalletClient from `viem` to sign transactions.
     * @param endpoint - The endpoint of the Hyperliquid exchange APIs.
     * @param isMainnet - If the endpoint is testnet, change this value to `false`.
     */
    constructor(
        walletClient: WalletClient<Transport, Chain | undefined, Account, RpcSchema | undefined>,
        endpoint: string = "https://api.hyperliquid.xyz/exchange",
        isMainnet: boolean = true,
    ) {
        this.walletClient = walletClient;
        this.endpoint = endpoint;
        this.isMainnet = isMainnet;
    }

    /**
     * Places an order.
     *
     * @requestWeight 1
     * @param args - Order parameters; {@link OrderParameters}.
     * @returns - {@link OrderResponse}.
     * @throws {HyperliquidBatchAPIError} If the API returns an error.
     */
    async order(args: OrderParameters): Promise<OrderResponse> {
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
     * @param args - Parameters for the cancel operation; {@link CancelParameters}.
     * @returns - {@link CancelResponse}.
     * @throws {HyperliquidBatchAPIError} If the API returns an error.
     */
    async cancel(args: CancelParameters): Promise<CancelResponse> {
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
     * @param args - Parameters for the cancel by client order ID operation; {@link CancelByCloidParameters}.
     * @returns - {@link CancelResponse}.
     * @throws {HyperliquidBatchAPIError} If the API returns an error.
     */
    async cancelByCloid(args: CancelByCloidParameters): Promise<CancelResponse> {
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
     * @param args - Parameters for scheduling a cancel; {@link ScheduleCancelParameters}.
     * @returns - {@link SuccessResponse}.
     * @throws {HyperliquidAPIError} If the API returns an error.
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
     * @param args - Parameters for the modify operation; {@link ModifyParameters}.
     * @returns - {@link SuccessResponse}.
     * @throws {HyperliquidAPIError} If the API returns an error.
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
     * @param args - Parameters for the batch modify operation; {@link BatchModifyParameters}.
     * @returns - {@link OrderResponse}.
     * @throws {HyperliquidBatchAPIError} If the API returns an error.
     */
    async batchModify(args: BatchModifyParameters): Promise<OrderResponse> {
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
     * @param args - Parameters for updating leverage; {@link UpdateLeverageParameters}.
     * @returns - {@link SuccessResponse}.
     * @throws {HyperliquidAPIError} If the API returns an error.
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
     * @param args - Parameters for updating isolated margin; {@link UpdateIsolatedMarginParameters}.
     * @returns - {@link SuccessResponse}.
     * @throws {HyperliquidAPIError} If the API returns an error.
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
     * @param args - Parameters for the USDC transfer; {@link UsdSendParameters}.
     * @returns - {@link SuccessResponse}.
     * @throws {HyperliquidAPIError} If the API returns an error.
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
     * @param args - Parameters for the spot asset transfer; {@link SpotSendParameters}.
     * @returns - {@link SuccessResponse}.
     * @throws {HyperliquidAPIError} If the API returns an error.
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
     * @param args - Parameters for the withdrawal request; {@link Withdraw3Parameters}.
     * @returns - {@link SuccessResponse}.
     * @throws {HyperliquidAPIError} If the API returns an error.
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
     * @param args - Parameters for transferring from Spot to Perp; {@link SpotUserParameters}.
     * @returns - {@link SuccessResponse}.
     * @throws {HyperliquidAPIError} If the API returns an error.
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
     * Performs a deposit into a vault or a withdrawal from it.
     *
     * @requestWeight 1
     * @param args - Parameters for the vault transfer; {@link VaultTransferParameters}.
     * @returns - {@link SuccessResponse}.
     * @throws {HyperliquidAPIError} If the API returns an error.
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

    protected async request<T extends OrderRequest>(body: T): Promise<OrderResponse>;
    protected async request<T extends CancelRequest>(body: T): Promise<CancelResponse>;
    protected async request<T extends CancelByCloidRequest>(body: T): Promise<CancelResponse>;
    protected async request<T extends ScheduleCancelRequest>(body: T): Promise<SuccessResponse>;
    protected async request<T extends ModifyRequest>(body: T): Promise<SuccessResponse>;
    protected async request<T extends BatchModifyRequest>(body: T): Promise<OrderResponse>;
    protected async request<T extends UpdateLeverageRequest>(body: T): Promise<SuccessResponse>;
    protected async request<T extends UpdateIsolatedMarginRequest>(body: T): Promise<SuccessResponse>;
    protected async request<T extends UsdSendRequest>(body: T): Promise<SuccessResponse>;
    protected async request<T extends SpotSendRequest>(body: T): Promise<SuccessResponse>;
    protected async request<T extends Withdraw3Request>(body: T): Promise<SuccessResponse>;
    protected async request<T extends SpotUserRequest>(body: T): Promise<SuccessResponse>;
    protected async request<T extends VaultTransferRequest>(body: T): Promise<SuccessResponse>;
    protected async request<T extends BaseExchangeRequest>(body: T): Promise<BaseExchangeResponse> {
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

        if (data.status === "err") {
            throw new HyperliquidAPIError(data.response);
        }
        if (
            data.status === "ok" &&
            data.response.type !== "default" &&
            data.response.data.statuses.some((status) => typeof status === "object" && status !== null && "error" in status)
        ) {
            const messages = data.response.data.statuses
                .filter((status) => typeof status === "object" && status !== null && "error" in status)
                .map((status) => status.error);
            throw new HyperliquidBatchAPIError(messages);
        }

        return data;
    }

    protected async signL1Action(
        action: JSONObject,
        vaultAddress: Hex | null,
        nonce: number,
    ): Promise<{ r: Hex; s: Hex; v: number }> {
        const actionHash = this.createActionHash(action, vaultAddress, nonce);
        const signature = await this.walletClient.signTypedData({
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
        const { r, s, v } = parseSignature(signature);
        return { r, s, v: Number(v!) };
    }

    protected async signUserSignedAction(
        action: JSONObject,
        payloadTypes: TypedDataParameter[],
        primaryType: string,
        chainId: number,
    ): Promise<{ r: Hex; s: Hex; v: number }> {
        const signature = await this.walletClient.signTypedData({
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
        const { r, s, v } = parseSignature(signature);
        return { r, s, v: Number(v!) };
    }

    protected createActionHash(action: JSONObject, vaultAddress: Hex | null, nonce: number): Hex {
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

        return keccak256(data);
    }
}
