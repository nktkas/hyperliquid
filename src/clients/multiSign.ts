import { keccak_256 } from "@noble/hashes/sha3";
import { etc, getPublicKey } from "@noble/secp256k1";
import type { Hex } from "../base.ts";
import type { IRequestTransport } from "../transports/base.ts";
import type { CreateSubAccountResponse, CreateVaultResponse, SuccessResponse } from "../types/exchange/responses.ts";
import {
    type AbstractEthersSigner,
    type AbstractEthersV5Signer,
    type AbstractViemWalletClient,
    type AbstractWallet,
    type AbstractWindowEthereum,
    actionSorter,
    isAbstractEthersSigner,
    isAbstractEthersV5Signer,
    isAbstractViemWalletClient,
    isAbstractWindowEthereum,
    isValidPrivateKey,
    type Signature,
    signL1Action,
    signUserSignedAction,
    userSignedActionEip712Types,
} from "../signing/mod.ts";
import {
    type CancelResponseSuccess,
    ExchangeClient,
    type ExchangeClientParameters,
    type OrderResponseSuccess,
    type ScheduleCancelParameters,
    type TwapCancelResponseSuccess,
    type TwapOrderResponseSuccess,
} from "./exchange.ts";

type Signers = [AbstractWalletWithAddress, ...AbstractWallet[]];

/** Parameters for the {@linkcode MultiSignClient} constructor. */
export interface MultiSignClientParameters<
    T extends IRequestTransport = IRequestTransport,
    S extends Readonly<Signers> = Signers,
> extends Omit<ExchangeClientParameters<T, S[0]>, "wallet"> {
    /** The multi-signature account address. */
    multiSignAddress: Hex;
    /** Array of wallets used for multi-signature operations. The first wallet acts as the leader. */
    signers: S;
}

/** Abstract interface for a wallet that can sign typed data and has wallet address. */
export type AbstractWalletWithAddress =
    | Hex // Private key
    | AbstractViemWalletClientWithAddress
    | AbstractEthersSignerWithAddress
    | AbstractEthersV5SignerWithAddress
    | AbstractWindowEthereum;

/** Abstract interface for a [viem wallet](https://viem.sh/docs/clients/wallet) with wallet address. */
export interface AbstractViemWalletClientWithAddress extends AbstractViemWalletClient {
    address: Hex;
}

/** Abstract interface for an [ethers.js signer](https://docs.ethers.org/v6/api/providers/#Signer) with wallet address. */
export interface AbstractEthersSignerWithAddress extends AbstractEthersSigner {
    getAddress(): Promise<string>;
}

/** Abstract interface for an [ethers.js v5 signer](https://docs.ethers.org/v5/api/signer/) with wallet address. */
export interface AbstractEthersV5SignerWithAddress extends AbstractEthersV5Signer {
    getAddress(): Promise<string>;
}

/**
 * Multi-signature exchange client for interacting with the Hyperliquid API.
 * @typeParam T The transport used to connect to the Hyperliquid API.
 * @typeParam S Array of wallets where the first wallet acts as the leader.
 */
export class MultiSignClient<
    T extends IRequestTransport = IRequestTransport,
    S extends Readonly<Signers> = Signers,
> extends ExchangeClient<T, S[0]> implements MultiSignClientParameters<T, S> {
    multiSignAddress: Hex;
    signers: S;

    /**
     * @multisign Is the first wallet from {@linkcode signers}.
     */
    declare wallet: S[0];

    /**
     * Initialises a new multi-signature client instance.
     * @param args - The parameters for the multi-signature client.
     *
     * @example
     * ```ts
     * import * as hl from "@nktkas/hyperliquid";
     *
     * const multiSignAddress = "0x...";
     * const signers = [
     *   "0x...", // Private key; or any other wallet libraries
     * ] as const;
     *
     * const transport = new hl.HttpTransport();
     * const multiSignClient = new hl.MultiSignClient({ transport, multiSignAddress, signers });
     * ```
     */
    constructor(args: MultiSignClientParameters<T, S>) {
        super({ ...args, wallet: args.signers[0] });
        this.multiSignAddress = args.multiSignAddress;
        this.signers = args.signers;

        Object.defineProperty(this, "wallet", {
            get() {
                return this.signers[0];
            },
            set(value) {
                this.signers[0] = value;
            },
            enumerable: true,
            configurable: true,
        });
    }

    /**
     * Approve an agent to sign on behalf of the master account.
     * @param args - The parameters for the request.
     * @param signal - An optional abort signal
     * @returns Successful response without specific data.
     *
     * @throws {ApiRequestError} When the API returns an unsuccessful response.
     * @throws {TransportError} When the transport layer throws an error.
     *
     * @see https://hyperliquid.gitbook.io/hyperliquid-docs/for-developers/api/exchange-endpoint#approve-an-api-wallet
     * @example
     * ```ts
     * import * as hl from "@nktkas/hyperliquid";
     *
     * const multiSignAddress = "0x...";
     * const signers = [
     *   "0x...", // Private key; or any other wallet libraries
     * ] as const;
     *
     * const transport = new hl.HttpTransport(); // or `WebSocketTransport`
     * const multiSignClient = new hl.MultiSignClient({ transport, multiSignAddress, signers });
     *
     * await multiSignClient.approveAgent({ agentAddress: "0x...", agentName: "..." });
     * ```
     */
    override async approveAgent(
        ...[args, signal]: Parameters<ExchangeClient["approveAgent"]>
    ): ReturnType<ExchangeClient["approveAgent"]> {
        // Destructure the parameters
        const { ...actionArgs } = args;

        // Construct an action
        const nonce = await this.nonceManager();
        const action = actionSorter.approveAgent({
            type: "approveAgent",
            hyperliquidChain: this._getHyperliquidChain(),
            signatureChainId: await this._getSignatureChainId(),
            nonce,
            ...actionArgs,
        });

        // Sign the action
        const outerSigner = await this._getWalletAddress(this.signers[0]);
        const signatures = await this._multiSignUserSignedAction({ action, outerSigner });
        if (action.agentName === "") action.agentName = null;

        // Send a multi-sig action
        return super.multiSig({
            signatures,
            payload: {
                multiSigUser: this.multiSignAddress,
                outerSigner,
                action,
            },
            nonce,
        }, signal);
    }

    /**
     * Approve a maximum fee rate for a builder.
     * @param args - The parameters for the request.
     * @param signal - An optional abort signal.
     * @returns Successful response without specific data.
     *
     * @throws {ApiRequestError} When the API returns an unsuccessful response.
     * @throws {TransportError} When the transport layer throws an error.
     *
     * @see https://hyperliquid.gitbook.io/hyperliquid-docs/for-developers/api/exchange-endpoint#approve-a-builder-fee
     * @example
     * ```ts
     * import * as hl from "@nktkas/hyperliquid";
     *
     * const multiSignAddress = "0x...";
     * const signers = [
     *   "0x...", // Private key; or any other wallet libraries
     * ] as const;
     *
     * const transport = new hl.HttpTransport(); // or `WebSocketTransport`
     * const multiSignClient = new hl.MultiSignClient({ transport, multiSignAddress, signers });
     *
     * await multiSignClient.approveBuilderFee({ maxFeeRate: "0.01%", builder: "0x..." });
     * ```
     */
    override async approveBuilderFee(
        ...[args, signal]: Parameters<ExchangeClient["approveBuilderFee"]>
    ): ReturnType<ExchangeClient["approveBuilderFee"]> {
        // Destructure the parameters
        const { ...actionArgs } = args;

        // Construct an action
        const nonce = await this.nonceManager();
        const action = actionSorter.approveBuilderFee({
            type: "approveBuilderFee",
            hyperliquidChain: this._getHyperliquidChain(),
            signatureChainId: await this._getSignatureChainId(),
            nonce,
            ...actionArgs,
        });

        // Sign the action
        const outerSigner = await this._getWalletAddress(this.signers[0]);
        const signatures = await this._multiSignUserSignedAction({ action, outerSigner });

        // Send a multi-sig action
        return super.multiSig({
            signatures,
            payload: {
                multiSigUser: this.multiSignAddress,
                outerSigner,
                action,
            },
            nonce,
        }, signal);
    }

    /**
     * Modify multiple orders.
     * @param args - The parameters for the request.
     * @param signal - An optional abort signal.
     * @returns Successful variant of {@link OrderResponse} without error statuses.
     *
     * @throws {ApiRequestError} When the API returns an unsuccessful response.
     * @throws {TransportError} When the transport layer throws an error.
     *
     * @see https://hyperliquid.gitbook.io/hyperliquid-docs/for-developers/api/exchange-endpoint#modify-multiple-orders
     * @example
     * ```ts
     * import * as hl from "@nktkas/hyperliquid";
     *
     * const multiSignAddress = "0x...";
     * const signers = [
     *   "0x...", // Private key; or any other wallet libraries
     * ] as const;
     *
     * const transport = new hl.HttpTransport(); // or `WebSocketTransport`
     * const multiSignClient = new hl.MultiSignClient({ transport, multiSignAddress, signers });
     *
     * const data = await multiSignClient.batchModify({
     *   modifies: [
     *     {
     *       oid: 123,
     *       order: {
     *         a: 0,
     *         b: true,
     *         p: "31000",
     *         s: "0.2",
     *         r: false,
     *         t: { limit: { tif: "Gtc" } },
     *       },
     *     },
     *   ],
     * });
     * ```
     */
    override async batchModify(
        ...[args, signal]: Parameters<ExchangeClient["batchModify"]>
    ): ReturnType<ExchangeClient["batchModify"]> {
        // Destructure the parameters
        const {
            vaultAddress = this.defaultVaultAddress,
            expiresAfter = await this._getDefaultExpiresAfter(),
            ...actionArgs
        } = args;

        // Construct an action
        const nonce = await this.nonceManager();
        const action = actionSorter.batchModify({ type: "batchModify", ...actionArgs });

        // Send a multi-sig action
        const outerSigner = await this._getWalletAddress(this.signers[0]);
        const signatures = await this._multiSignL1Action({ action, nonce, outerSigner, vaultAddress, expiresAfter });

        // Send a multi-sig action
        return super.multiSig({
            signatures,
            payload: {
                multiSigUser: this.multiSignAddress,
                outerSigner,
                action,
            },
            nonce,
            vaultAddress,
            expiresAfter,
        }, signal);
    }

    /**
     * Cancel order(s).
     * @param args - The parameters for the request.
     * @param signal - An optional abort signal.
     * @returns Successful variant of {@link CancelResponse} without error statuses.
     *
     * @throws {ApiRequestError} When the API returns an unsuccessful response.
     * @throws {TransportError} When the transport layer throws an error.
     *
     * @see https://hyperliquid.gitbook.io/hyperliquid-docs/for-developers/api/exchange-endpoint#cancel-order-s
     * @example
     * ```ts
     * import * as hl from "@nktkas/hyperliquid";
     *
     * const multiSignAddress = "0x...";
     * const signers = [
     *   "0x...", // Private key; or any other wallet libraries
     * ] as const;
     *
     * const transport = new hl.HttpTransport(); // or `WebSocketTransport`
     * const multiSignClient = new hl.MultiSignClient({ transport, multiSignAddress, signers });
     *
     * const data = await multiSignClient.cancel({
     *   cancels: [
     *     { a: 0, o: 123 },
     *   ],
     * });
     * ```
     */
    override async cancel(
        ...[args, signal]: Parameters<ExchangeClient["cancel"]>
    ): ReturnType<ExchangeClient["cancel"]> {
        // Destructure the parameters
        const {
            vaultAddress = this.defaultVaultAddress,
            expiresAfter = await this._getDefaultExpiresAfter(),
            ...actionArgs
        } = args;

        // Construct an action
        const nonce = await this.nonceManager();
        const action = actionSorter.cancel({ type: "cancel", ...actionArgs });

        // Send a multi-sig action
        const outerSigner = await this._getWalletAddress(this.signers[0]);
        const signatures = await this._multiSignL1Action({ action, nonce, outerSigner, vaultAddress, expiresAfter });

        // Send a multi-sig action
        return super.multiSig({
            signatures,
            payload: {
                multiSigUser: this.multiSignAddress,
                outerSigner,
                action,
            },
            nonce,
            vaultAddress,
            expiresAfter,
        }, signal);
    }

    /**
     * Cancel order(s) by cloid.
     * @param args - The parameters for the request.
     * @param signal - An optional abort signal.
     * @returns Successful variant of {@link CancelResponse} without error statuses.
     *
     * @throws {ApiRequestError} When the API returns an unsuccessful response.
     * @throws {TransportError} When the transport layer throws an error.
     *
     * @see https://hyperliquid.gitbook.io/hyperliquid-docs/for-developers/api/exchange-endpoint#cancel-order-s-by-cloid
     * @example
     * ```ts
     * import * as hl from "@nktkas/hyperliquid";
     *
     * const multiSignAddress = "0x...";
     * const signers = [
     *   "0x...", // Private key; or any other wallet libraries
     * ] as const;
     *
     * const transport = new hl.HttpTransport(); // or `WebSocketTransport`
     * const multiSignClient = new hl.MultiSignClient({ transport, multiSignAddress, signers });
     *
     * const data = await multiSignClient.cancelByCloid({
     *   cancels: [
     *     { asset: 0, cloid: "0x..." },
     *   ],
     * });
     * ```
     */
    override async cancelByCloid(
        ...[args, signal]: Parameters<ExchangeClient["cancelByCloid"]>
    ): ReturnType<ExchangeClient["cancelByCloid"]> {
        // Destructure the parameters
        const {
            vaultAddress = this.defaultVaultAddress,
            expiresAfter = await this._getDefaultExpiresAfter(),
            ...actionArgs
        } = args;

        // Construct an action
        const nonce = await this.nonceManager();
        const action = actionSorter.cancelByCloid({ type: "cancelByCloid", ...actionArgs });

        // Send a multi-sig action
        const outerSigner = await this._getWalletAddress(this.signers[0]);
        const signatures = await this._multiSignL1Action({ action, nonce, outerSigner, vaultAddress, expiresAfter });

        // Send a multi-sig action
        return super.multiSig({
            signatures,
            payload: {
                multiSigUser: this.multiSignAddress,
                outerSigner,
                action,
            },
            nonce,
            vaultAddress,
            expiresAfter,
        }, signal);
    }

    /**
     * Transfer native token from the user's spot account into staking for delegating to validators.
     * @param args - The parameters for the request.
     * @param signal - An optional abort signal.
     * @returns Successful response without specific data.
     *
     * @throws {ApiRequestError} When the API returns an unsuccessful response.
     * @throws {TransportError} When the transport layer throws an error.
     *
     * @see https://hyperliquid.gitbook.io/hyperliquid-docs/for-developers/api/exchange-endpoint#deposit-into-staking
     * @example
     * ```ts
     * import * as hl from "@nktkas/hyperliquid";
     *
     * const multiSignAddress = "0x...";
     * const signers = [
     *   "0x...", // Private key; or any other wallet libraries
     * ] as const;
     *
     * const transport = new hl.HttpTransport(); // or `WebSocketTransport`
     * const multiSignClient = new hl.MultiSignClient({ transport, multiSignAddress, signers });
     *
     * await multiSignClient.cDeposit({ wei: 1 * 1e8 });
     * ```
     */
    override async cDeposit(
        ...[args, signal]: Parameters<ExchangeClient["cDeposit"]>
    ): ReturnType<ExchangeClient["cDeposit"]> {
        // Destructure the parameters
        const { ...actionArgs } = args;

        // Construct an action
        const nonce = await this.nonceManager();
        const action = actionSorter.cDeposit({
            type: "cDeposit",
            hyperliquidChain: this._getHyperliquidChain(),
            signatureChainId: await this._getSignatureChainId(),
            nonce,
            ...actionArgs,
        });

        // Sign the action
        const outerSigner = await this._getWalletAddress(this.signers[0]);
        const signatures = await this._multiSignUserSignedAction({ action, outerSigner });

        // Send a multi-sig action
        return super.multiSig({
            signatures,
            payload: {
                multiSigUser: this.multiSignAddress,
                outerSigner,
                action,
            },
            nonce,
        }, signal);
    }

    /**
     * Claim rewards from referral program.
     * @param args - The parameters for the request.
     * @param signal - An optional abort signal.
     * @returns Successful response without specific data.
     *
     * @throws {ApiRequestError} When the API returns an unsuccessful response.
     * @throws {TransportError} When the transport layer throws an error.
     *
     * @see null
     * @example
     * ```ts
     * import * as hl from "@nktkas/hyperliquid";
     *
     * const multiSignAddress = "0x...";
     * const signers = [
     *   "0x...", // Private key; or any other wallet libraries
     * ] as const;
     *
     * const transport = new hl.HttpTransport(); // or `WebSocketTransport`
     * const multiSignClient = new hl.MultiSignClient({ transport, multiSignAddress, signers });
     *
     * await multiSignClient.claimRewards();
     * ```
     */
    override async claimRewards(
        ...[signal]: Parameters<ExchangeClient["claimRewards"]>
    ): ReturnType<ExchangeClient["claimRewards"]> {
        // Construct an action
        const nonce = await this.nonceManager();
        const action = actionSorter.claimRewards({ type: "claimRewards" });

        // Send a multi-sig action
        const outerSigner = await this._getWalletAddress(this.signers[0]);
        const signatures = await this._multiSignL1Action({ action, nonce, outerSigner });

        // Send a multi-sig action
        return super.multiSig({
            signatures,
            payload: {
                multiSigUser: this.multiSignAddress,
                outerSigner,
                action,
            },
            nonce,
        }, signal);
    }

    /**
     * Convert a single-signature account to a multi-signature account or vice versa.
     * @param args - The parameters for the request.
     * @param signal - An optional abort signal.
     * @returns Successful response without specific data.
     *
     * @throws {ApiRequestError} When the API returns an unsuccessful response.
     * @throws {TransportError} When the transport layer throws an error.
     *
     * @see https://hyperliquid.gitbook.io/hyperliquid-docs/hypercore/multi-sig
     * @example
     * ```ts
     * import * as hl from "@nktkas/hyperliquid";
     *
     * const multiSignAddress = "0x...";
     * const signers = [
     *   "0x...", // Private key; or any other wallet libraries
     * ] as const;
     *
     * const transport = new hl.HttpTransport(); // or `WebSocketTransport`
     * const multiSignClient = new hl.MultiSignClient({ transport, multiSignAddress, signers });
     *
     * // Convert to multi-sig user
     * await multiSignClient.convertToMultiSigUser({
     *   authorizedUsers: ["0x...", "0x...", "0x..."],
     *   threshold: 2,
     * });
     *
     * // Convert to single-sig user
     * await multiSignClient.convertToMultiSigUser(null);
     * ```
     */
    override async convertToMultiSigUser(
        ...[args, signal]: Parameters<ExchangeClient["convertToMultiSigUser"]>
    ): ReturnType<ExchangeClient["convertToMultiSigUser"]> {
        // Destructure the parameters
        const actionArgs = args;

        // Construct an action
        const nonce = await this.nonceManager();
        const action = actionSorter.convertToMultiSigUser({
            type: "convertToMultiSigUser",
            hyperliquidChain: this._getHyperliquidChain(),
            signatureChainId: await this._getSignatureChainId(),
            signers: JSON.stringify(actionArgs),
            nonce,
        });

        // Sign the action
        const outerSigner = await this._getWalletAddress(this.signers[0]);
        const signatures = await this._multiSignUserSignedAction({ action, outerSigner });

        // Send a multi-sig action
        return super.multiSig({
            signatures,
            payload: {
                multiSigUser: this.multiSignAddress,
                outerSigner,
                action,
            },
            nonce,
        }, signal);
    }

    /**
     * Create a sub-account.
     * @param args - The parameters for the request.
     * @param signal - An optional abort signal.
     * @returns Response for creating a sub-account.
     *
     * @throws {ApiRequestError} When the API returns an unsuccessful response.
     * @throws {TransportError} When the transport layer throws an error.
     *
     * @see null
     * @example
     * ```ts
     * import * as hl from "@nktkas/hyperliquid";
     *
     * const multiSignAddress = "0x...";
     * const signers = [
     *   "0x...", // Private key; or any other wallet libraries
     * ] as const;
     *
     * const transport = new hl.HttpTransport(); // or `WebSocketTransport`
     * const multiSignClient = new hl.MultiSignClient({ transport, multiSignAddress, signers });
     *
     * const data = await multiSignClient.createSubAccount({ name: "..." });
     * ```
     */
    override async createSubAccount(
        ...[args, signal]: Parameters<ExchangeClient["createSubAccount"]>
    ): ReturnType<ExchangeClient["createSubAccount"]> {
        // Destructure the parameters
        const { ...actionArgs } = args;

        // Construct an action
        const nonce = await this.nonceManager();
        const action = actionSorter.createSubAccount({ type: "createSubAccount", ...actionArgs });

        // Send a multi-sig action
        const outerSigner = await this._getWalletAddress(this.signers[0]);
        const signatures = await this._multiSignL1Action({ action, nonce, outerSigner });

        // Send a multi-sig action
        return super.multiSig({
            signatures,
            payload: {
                multiSigUser: this.multiSignAddress,
                outerSigner,
                action,
            },
            nonce,
        }, signal);
    }

    /**
     * Create a vault.
     * @param args - The parameters for the request.
     * @param signal - An optional abort signal.
     * @returns Response for creating a vault.
     *
     * @throws {ApiRequestError} When the API returns an unsuccessful response.
     * @throws {TransportError} When the transport layer throws an error.
     *
     * @see null
     * @example
     * ```ts
     * import * as hl from "@nktkas/hyperliquid";
     *
     * const multiSignAddress = "0x...";
     * const signers = [
     *   "0x...", // Private key; or any other wallet libraries
     * ] as const;
     *
     * const transport = new hl.HttpTransport(); // or `WebSocketTransport`
     * const multiSignClient = new hl.MultiSignClient({ transport, multiSignAddress, signers });
     *
     * const data = await multiSignClient.createVault({ name: "...", description: "...", initialUsd: 100 * 1e6 });
     * ```
     */
    override async createVault(
        ...[args, signal]: Parameters<ExchangeClient["createVault"]>
    ): ReturnType<ExchangeClient["createVault"]> {
        // Destructure the parameters
        const { ...actionArgs } = args;

        // Construct an action
        const nonce = await this.nonceManager();
        const action = actionSorter.createVault({ type: "createVault", nonce, ...actionArgs });

        // Send a multi-sig action
        const outerSigner = await this._getWalletAddress(this.signers[0]);
        const signatures = await this._multiSignL1Action({ action, nonce, outerSigner });

        // Send a multi-sig action
        return super.multiSig({
            signatures,
            payload: {
                multiSigUser: this.multiSignAddress,
                outerSigner,
                action,
            },
            nonce,
        }, signal);
    }

    /**
     * Jail or unjail self as a validator signer.
     * @param args - The parameters for the request.
     * @param signal - An optional abort signal.
     * @returns Successful response without specific data.
     *
     * @throws {ApiRequestError} When the API returns an unsuccessful response.
     * @throws {TransportError} When the transport layer throws an error.
     *
     * @see null
     * @example
     * ```ts
     * import * as hl from "@nktkas/hyperliquid";
     *
     * const multiSignAddress = "0x...";
     * const signers = [
     *   "0x...", // Private key; or any other wallet libraries
     * ] as const;
     *
     * const transport = new hl.HttpTransport(); // or `WebSocketTransport`
     * const multiSignClient = new hl.MultiSignClient({ transport, multiSignAddress, signers });
     *
     * // Jail self
     * await multiSignClient.cSignerAction({ jailSelf: null });
     *
     * // Unjail self
     * await multiSignClient.cSignerAction({ unjailSelf: null });
     * ```
     */
    override async cSignerAction(
        ...[args, signal]: Parameters<ExchangeClient["cSignerAction"]>
    ): ReturnType<ExchangeClient["cSignerAction"]> {
        // Destructure the parameters
        const {
            expiresAfter = await this._getDefaultExpiresAfter(),
            ...actionArgs
        } = args;

        // Construct an action
        const nonce = await this.nonceManager();
        const action = actionSorter.CSignerAction({ type: "CSignerAction", ...actionArgs });

        // Send a multi-sig action
        const outerSigner = await this._getWalletAddress(this.signers[0]);
        const signatures = await this._multiSignL1Action({ action, nonce, outerSigner, expiresAfter });

        // Send a multi-sig action
        return super.multiSig({
            signatures,
            payload: {
                multiSigUser: this.multiSignAddress,
                outerSigner,
                action,
            },
            nonce,
            expiresAfter,
        }, signal);
    }

    /**
     * Action related to validator management.
     * @param args - The parameters for the request.
     * @param signal - An optional abort signal.
     * @returns Successful response without specific data.
     *
     * @throws {ApiRequestError} When the API returns an unsuccessful response.
     * @throws {TransportError} When the transport layer throws an error.
     *
     * @example
     * ```ts
     * import * as hl from "@nktkas/hyperliquid";
     *
     * const multiSignAddress = "0x...";
     * const signers = [
     *   "0x...", // Private key; or any other wallet libraries
     * ] as const;
     *
     * const transport = new hl.HttpTransport(); // or `WebSocketTransport`
     * const multiSignClient = new hl.MultiSignClient({ transport, multiSignAddress, signers });
     *
     * // Change validator profile
     * await multiSignClient.cValidatorAction({
     *   changeProfile: {
     *     name: "...",
     *     description: "...",
     *     unjailed: true,
     *   }
     * });
     *
     * // Register a new validator
     * await multiSignClient.cValidatorAction({
     *   register: {
     *     profile: {
     *       node_ip: { Ip: "1.2.3.4" },
     *       name: "...",
     *       description: "...",
     *       delegations_disabled: true,
     *       commission_bps: 1,
     *       signer: "0x...",
     *     },
     *     unjailed: false,
     *     initial_wei: 1,
     *   },
     * });
     *
     * // Unregister a validator
     * await multiSignClient.cValidatorAction({ unregister: null });
     * ```
     */
    override async cValidatorAction(
        ...[args, signal]: Parameters<ExchangeClient["cValidatorAction"]>
    ): ReturnType<ExchangeClient["cSignerAction"]> {
        // Destructure the parameters
        const {
            expiresAfter = await this._getDefaultExpiresAfter(),
            ...actionArgs
        } = args;

        // Construct an action
        const nonce = await this.nonceManager();
        const action = actionSorter.CValidatorAction({ type: "CValidatorAction", ...actionArgs });

        // Send a multi-sig action
        const outerSigner = await this._getWalletAddress(this.signers[0]);
        const signatures = await this._multiSignL1Action({ action, nonce, outerSigner, expiresAfter });

        // Send a multi-sig action
        return super.multiSig({
            signatures,
            payload: {
                multiSigUser: this.multiSignAddress,
                outerSigner,
                action,
            },
            nonce,
            expiresAfter,
        }, signal);
    }

    /**
     * Transfer native token from staking into the user's spot account.
     * @param args - The parameters for the request.
     * @param signal - An optional abort signal.
     * @returns Successful response without specific data.
     *
     * @throws {ApiRequestError} When the API returns an unsuccessful response.
     * @throws {TransportError} When the transport layer throws an error.
     *
     * @see https://hyperliquid.gitbook.io/hyperliquid-docs/for-developers/api/exchange-endpoint#withdraw-from-staking
     * @example
     * ```ts
     * import * as hl from "@nktkas/hyperliquid";
     *
     * const multiSignAddress = "0x...";
     * const signers = [
     *   "0x...", // Private key; or any other wallet libraries
     * ] as const;
     *
     * const transport = new hl.HttpTransport(); // or `WebSocketTransport`
     * const multiSignClient = new hl.MultiSignClient({ transport, multiSignAddress, signers });
     *
     * await multiSignClient.cWithdraw({ wei: 1 * 1e8 });
     * ```
     */
    override async cWithdraw(
        ...[args, signal]: Parameters<ExchangeClient["cWithdraw"]>
    ): ReturnType<ExchangeClient["cWithdraw"]> {
        // Destructure the parameters
        const { ...actionArgs } = args;

        // Construct an action
        const nonce = await this.nonceManager();
        const action = actionSorter.cWithdraw({
            type: "cWithdraw",
            hyperliquidChain: this._getHyperliquidChain(),
            signatureChainId: await this._getSignatureChainId(),
            nonce,
            ...actionArgs,
        });

        // Sign the action
        const outerSigner = await this._getWalletAddress(this.signers[0]);
        const signatures = await this._multiSignUserSignedAction({ action, outerSigner });

        // Send a multi-sig action
        return super.multiSig({
            signatures,
            payload: {
                multiSigUser: this.multiSignAddress,
                outerSigner,
                action,
            },
            nonce,
        }, signal);
    }

    /**
     * Configure block type for EVM transactions.
     * @param args - The parameters for the request.
     * @param signal - An optional abort signal.
     * @returns Response for creating a sub-account.
     *
     * @throws {ApiRequestError} When the API returns an unsuccessful response.
     * @throws {TransportError} When the transport layer throws an error.
     *
     * @see https://hyperliquid.gitbook.io/hyperliquid-docs/for-developers/evm/dual-block-architecture
     * @example
     * ```ts
     * import * as hl from "@nktkas/hyperliquid";
     *
     * const multiSignAddress = "0x...";
     * const signers = [
     *   "0x...", // Private key; or any other wallet libraries
     * ] as const;
     *
     * const transport = new hl.HttpTransport(); // or `WebSocketTransport`
     * const multiSignClient = new hl.MultiSignClient({ transport, multiSignAddress, signers });
     *
     * const data = await multiSignClient.evmUserModify({ usingBigBlocks: true });
     * ```
     */
    override async evmUserModify(
        ...[args, signal]: Parameters<ExchangeClient["evmUserModify"]>
    ): ReturnType<ExchangeClient["evmUserModify"]> {
        // Destructure the parameters
        const { ...actionArgs } = args;

        // Construct an action
        const nonce = await this.nonceManager();
        const action = actionSorter.evmUserModify({ type: "evmUserModify", ...actionArgs });

        // Send a multi-sig action
        const outerSigner = await this._getWalletAddress(this.signers[0]);
        const signatures = await this._multiSignL1Action({ action, nonce, outerSigner });

        // Send a multi-sig action
        return super.multiSig({
            signatures,
            payload: {
                multiSigUser: this.multiSignAddress,
                outerSigner,
                action,
            },
            nonce,
        }, signal);
    }

    /**
     * Modify an order.
     * @param args - The parameters for the request.
     * @param signal - An optional abort signal.
     * @returns Successful response without specific data.
     *
     * @throws {ApiRequestError} When the API returns an unsuccessful response.
     * @throws {TransportError} When the transport layer throws an error.
     *
     * @see https://hyperliquid.gitbook.io/hyperliquid-docs/for-developers/api/exchange-endpoint#modify-an-order
     * @example
     * ```ts
     * import * as hl from "@nktkas/hyperliquid";
     *
     * const multiSignAddress = "0x...";
     * const signers = [
     *   "0x...", // Private key; or any other wallet libraries
     * ] as const;
     *
     * const transport = new hl.HttpTransport(); // or `WebSocketTransport`
     * const multiSignClient = new hl.MultiSignClient({ transport, multiSignAddress, signers });
     *
     * await multiSignClient.modify({
     *   oid: 123,
     *   order: {
     *     a: 0,
     *     b: true,
     *     p: "31000",
     *     s: "0.2",
     *     r: false,
     *     t: { limit: { tif: "Gtc" } },
     *     c: "0x...",
     *   },
     * });
     * ```
     */
    override async modify(
        ...[args, signal]: Parameters<ExchangeClient["modify"]>
    ): ReturnType<ExchangeClient["modify"]> {
        // Destructure the parameters
        const {
            vaultAddress = this.defaultVaultAddress,
            expiresAfter = await this._getDefaultExpiresAfter(),
            ...actionArgs
        } = args;

        // Construct an action
        const nonce = await this.nonceManager();
        const action = actionSorter.modify({ type: "modify", ...actionArgs });

        // Send a multi-sig action
        const outerSigner = await this._getWalletAddress(this.signers[0]);
        const signatures = await this._multiSignL1Action({ action, nonce, outerSigner, vaultAddress, expiresAfter });

        // Send a multi-sig action
        return super.multiSig({
            signatures,
            payload: {
                multiSigUser: this.multiSignAddress,
                outerSigner,
                action,
            },
            nonce,
            vaultAddress,
            expiresAfter,
        }, signal);
    }

    /**
     * @multisign Not implemented
     */
    override multiSig<
        T extends
            | SuccessResponse
            | CancelResponseSuccess
            | CreateSubAccountResponse
            | CreateVaultResponse
            | OrderResponseSuccess
            | TwapOrderResponseSuccess
            | TwapCancelResponseSuccess,
    >(
        ...[_args, _signal]: Parameters<ExchangeClient["multiSig"]>
    ): Promise<T> {
        throw new Error("Not implemented"); // FIXME
    }

    /**
     * Place an order(s).
     * @param args - The parameters for the request.
     * @param signal - An optional abort signal.
     * @returns Successful variant of {@link OrderResponse} without error statuses.
     *
     * @throws {ApiRequestError} When the API returns an unsuccessful response.
     * @throws {TransportError} When the transport layer throws an error.
     *
     * @see https://hyperliquid.gitbook.io/hyperliquid-docs/for-developers/api/exchange-endpoint#place-an-order
     * @example
     * ```ts
     * import * as hl from "@nktkas/hyperliquid";
     *
     * const multiSignAddress = "0x...";
     * const signers = [
     *   "0x...", // Private key; or any other wallet libraries
     * ] as const;
     *
     * const transport = new hl.HttpTransport(); // or `WebSocketTransport`
     * const multiSignClient = new hl.MultiSignClient({ transport, multiSignAddress, signers });
     *
     * const data = await multiSignClient.order({
     *   orders: [
     *     {
     *       a: 0,
     *       b: true,
     *       p: "30000",
     *       s: "0.1",
     *       r: false,
     *       t: { limit: { tif: "Gtc" } },
     *       c: "0x...",
     *     },
     *   ],
     *   grouping: "na",
     * });
     * ```
     */
    override async order(
        ...[args, signal]: Parameters<ExchangeClient["order"]>
    ): ReturnType<ExchangeClient["order"]> {
        // Destructure the parameters
        const {
            vaultAddress = this.defaultVaultAddress,
            expiresAfter = await this._getDefaultExpiresAfter(),
            ...actionArgs
        } = args;

        // Construct an action
        const nonce = await this.nonceManager();
        const action = actionSorter.order({ type: "order", ...actionArgs });

        // Send a multi-sig action
        const outerSigner = await this._getWalletAddress(this.signers[0]);
        const signatures = await this._multiSignL1Action({ action, nonce, outerSigner, vaultAddress, expiresAfter });

        // Send a multi-sig action
        return super.multiSig({
            signatures,
            payload: {
                multiSigUser: this.multiSignAddress,
                outerSigner,
                action,
            },
            nonce,
            vaultAddress,
            expiresAfter,
        }, signal);
    }

    /**
     * Deploying HIP-3 assets.
     * @param args - The parameters for the request.
     * @param signal - An optional abort signal.
     * @returns Successful response without specific data.
     *
     * @throws {ApiRequestError} When the API returns an unsuccessful response.
     * @throws {TransportError} When the transport layer throws an error.
     *
     * @see https://hyperliquid.gitbook.io/hyperliquid-docs/for-developers/api/deploying-hip-3-assets
     * @example
     * ```ts
     * import * as hl from "@nktkas/hyperliquid";
     *
     * const multiSignAddress = "0x...";
     * const signers = [
     *   "0x...", // Private key; or any other wallet libraries
     * ] as const;
     *
     * const transport = new hl.HttpTransport(); // or `WebSocketTransport`
     * const multiSignClient = new hl.MultiSignClient({ transport, multiSignAddress, signers });
     *
     * await multiSignClient.perpDeploy({
     *   registerAsset: {
     *     maxGas: 1000000,
     *     assetRequest: {
     *       coin: "USDC",
     *       szDecimals: 8,
     *       oraclePx: "1",
     *       marginTableId: 1,
     *       onlyIsolated: false,
     *     },
     *     dex: "test",
     *   },
     * });
     * ```
     */
    override async perpDeploy(
        ...[args, signal]: Parameters<ExchangeClient["perpDeploy"]>
    ): ReturnType<ExchangeClient["perpDeploy"]> {
        // Destructure the parameters
        const { ...actionArgs } = args;

        // Construct an action
        const nonce = await this.nonceManager();
        const action = actionSorter.perpDeploy({ type: "perpDeploy", ...actionArgs });

        // Send a multi-sig action
        const outerSigner = await this._getWalletAddress(this.signers[0]);
        const signatures = await this._multiSignL1Action({ action, nonce, outerSigner });

        // Send a multi-sig action
        return super.multiSig({
            signatures,
            payload: {
                multiSigUser: this.multiSignAddress,
                outerSigner,
                action,
            },
            nonce,
        }, signal);
    }

    /**
     * Transfer funds between Spot account and Perp dex account.
     * @param args - The parameters for the request.
     * @param signal - An optional abort signal.
     * @returns Successful response without specific data.
     *
     * @throws {ApiRequestError} When the API returns an unsuccessful response.
     * @throws {TransportError} When the transport layer throws an error.
     *
     * @see https://hyperliquid.gitbook.io/hyperliquid-docs/for-developers/api/exchange-endpoint#transfer-from-spot-account-to-perp-account-and-vice-versa
     * @example
     * ```ts
     * import * as hl from "@nktkas/hyperliquid";
     *
     * const multiSignAddress = "0x...";
     * const signers = [
     *   "0x...", // Private key; or any other wallet libraries
     * ] as const;
     *
     * const transport = new hl.HttpTransport(); // or `WebSocketTransport`
     * const multiSignClient = new hl.MultiSignClient({ transport, multiSignAddress, signers });
     *
     * await multiSignClient.perpDexClassTransfer({ dex: "test", token: "USDC", amount: "1", toPerp: true });
     * ```
     */
    override async perpDexClassTransfer(
        ...[args, signal]: Parameters<ExchangeClient["perpDexClassTransfer"]>
    ): ReturnType<ExchangeClient["perpDexClassTransfer"]> {
        // Destructure the parameters
        const { ...actionArgs } = args;

        // Construct an action
        const nonce = await this.nonceManager();
        const action = actionSorter.PerpDexClassTransfer({
            type: "PerpDexClassTransfer",
            hyperliquidChain: this._getHyperliquidChain(),
            signatureChainId: await this._getSignatureChainId(),
            nonce,
            ...actionArgs,
        });

        // Sign the action
        const outerSigner = await this._getWalletAddress(this.signers[0]);
        const signatures = await this._multiSignUserSignedAction({ action, outerSigner });

        // Send a multi-sig action
        return super.multiSig({
            signatures,
            payload: {
                multiSigUser: this.multiSignAddress,
                outerSigner,
                action,
            },
            nonce,
        }, signal);
    }

    /**
     * Create a referral code.
     * @param args - The parameters for the request.
     * @param signal - An optional abort signal.
     * @returns Successful response without specific data.
     *
     * @throws {ApiRequestError} When the API returns an unsuccessful response.
     * @throws {TransportError} When the transport layer throws an error.
     *
     * @see null
     * @example
     * ```ts
     * import * as hl from "@nktkas/hyperliquid";
     *
     * const multiSignAddress = "0x...";
     * const signers = [
     *   "0x...", // Private key; or any other wallet libraries
     * ] as const;
     *
     * const transport = new hl.HttpTransport(); // or `WebSocketTransport`
     * const multiSignClient = new hl.MultiSignClient({ transport, multiSignAddress, signers });
     *
     * await multiSignClient.registerReferrer({ code: "..." });
     * ```
     */
    override async registerReferrer(
        ...[args, signal]: Parameters<ExchangeClient["registerReferrer"]>
    ): ReturnType<ExchangeClient["registerReferrer"]> {
        // Destructure the parameters
        const { ...actionArgs } = args;

        // Construct an action
        const nonce = await this.nonceManager();
        const action = actionSorter.registerReferrer({ type: "registerReferrer", ...actionArgs });

        // Send a multi-sig action
        const outerSigner = await this._getWalletAddress(this.signers[0]);
        const signatures = await this._multiSignL1Action({ action, nonce, outerSigner });

        // Send a multi-sig action
        return super.multiSig({
            signatures,
            payload: {
                multiSigUser: this.multiSignAddress,
                outerSigner,
                action,
            },
            nonce,
        }, signal);
    }

    /**
     * Reserve additional rate-limited actions for a fee.
     * @param args - The parameters for the request.
     * @param signal - An optional abort signal.
     * @returns Successful response without specific data.
     *
     * @throws {ApiRequestError} When the API returns an unsuccessful response.
     * @throws {TransportError} When the transport layer throws an error.
     *
     * @see https://hyperliquid.gitbook.io/hyperliquid-docs/for-developers/api/exchange-endpoint#reserve-additional-actions
     * @example
     * ```ts
     * import * as hl from "@nktkas/hyperliquid";
     *
     * const multiSignAddress = "0x...";
     * const signers = [
     *   "0x...", // Private key; or any other wallet libraries
     * ] as const;
     *
     * const transport = new hl.HttpTransport(); // or `WebSocketTransport`
     * const multiSignClient = new hl.MultiSignClient({ transport, multiSignAddress, signers });
     *
     * await multiSignClient.reserveRequestWeight({ weight: 10 });
     * ```
     */
    override async reserveRequestWeight(
        ...[args, signal]: Parameters<ExchangeClient["reserveRequestWeight"]>
    ): ReturnType<ExchangeClient["reserveRequestWeight"]> {
        // Destructure the parameters
        const {
            expiresAfter = await this._getDefaultExpiresAfter(),
            ...actionArgs
        } = args;

        // Construct an action
        const nonce = await this.nonceManager();
        const action = actionSorter.reserveRequestWeight({ type: "reserveRequestWeight", ...actionArgs });

        // Send a multi-sig action
        const outerSigner = await this._getWalletAddress(this.signers[0]);
        const signatures = await this._multiSignL1Action({ action, nonce, outerSigner, expiresAfter });

        // Send a multi-sig action
        return super.multiSig({
            signatures,
            payload: {
                multiSigUser: this.multiSignAddress,
                outerSigner,
                action,
            },
            nonce,
            expiresAfter,
        }, signal);
    }

    /**
     * Schedule a cancel-all operation at a future time.
     * @param args - The parameters for the request.
     * @param signal - An optional abort signal.
     * @returns Successful response without specific data.
     *
     * @throws {ApiRequestError} When the API returns an unsuccessful response.
     * @throws {TransportError} When the transport layer throws an error.
     *
     * @see https://hyperliquid.gitbook.io/hyperliquid-docs/for-developers/api/exchange-endpoint#schedule-cancel-dead-mans-switch
     * @example
     * ```ts
     * import * as hl from "@nktkas/hyperliquid";
     *
     * const multiSignAddress = "0x...";
     * const signers = [
     *   "0x...", // Private key; or any other wallet libraries
     * ] as const;
     *
     * const transport = new hl.HttpTransport(); // or `WebSocketTransport`
     * const multiSignClient = new hl.MultiSignClient({ transport, multiSignAddress, signers });
     *
     * await multiSignClient.scheduleCancel({ time: Date.now() + 10_000 });
     * ```
     */
    override async scheduleCancel(
        args?: ScheduleCancelParameters,
        signal?: AbortSignal,
    ): ReturnType<ExchangeClient["scheduleCancel"]>;
    override async scheduleCancel(
        signal?: AbortSignal,
    ): ReturnType<ExchangeClient["scheduleCancel"]>;
    override async scheduleCancel(
        args_or_signal?: ScheduleCancelParameters | AbortSignal,
        maybeSignal?: AbortSignal,
    ): ReturnType<ExchangeClient["scheduleCancel"]> {
        const args = args_or_signal instanceof AbortSignal ? {} : args_or_signal ?? {};
        const signal = args_or_signal instanceof AbortSignal ? args_or_signal : maybeSignal;

        // Destructure the parameters
        const {
            vaultAddress = this.defaultVaultAddress,
            expiresAfter = await this._getDefaultExpiresAfter(),
            ...actionArgs
        } = args;

        // Construct an action
        const nonce = await this.nonceManager();
        const action = actionSorter.scheduleCancel({ type: "scheduleCancel", ...actionArgs });

        // Send a multi-sig action
        const outerSigner = await this._getWalletAddress(this.signers[0]);
        const signatures = await this._multiSignL1Action({ action, nonce, outerSigner, vaultAddress, expiresAfter });

        // Send a multi-sig action
        return super.multiSig({
            signatures,
            payload: {
                multiSigUser: this.multiSignAddress,
                outerSigner,
                action,
            },
            nonce,
            vaultAddress,
            expiresAfter,
        }, signal);
    }

    /**
     * Set the display name in the leaderboard.
     * @param args - The parameters for the request.
     * @param signal - An optional abort signal.
     * @returns Successful response without specific data.
     *
     * @throws {ApiRequestError} When the API returns an unsuccessful response.
     * @throws {TransportError} When the transport layer throws an error.
     *
     * @see null
     * @example
     * ```ts
     * import * as hl from "@nktkas/hyperliquid";
     *
     * const multiSignAddress = "0x...";
     * const signers = [
     *   "0x...", // Private key; or any other wallet libraries
     * ] as const;
     *
     * const transport = new hl.HttpTransport(); // or `WebSocketTransport`
     * const multiSignClient = new hl.MultiSignClient({ transport, multiSignAddress, signers });
     *
     * await multiSignClient.setDisplayName({ displayName: "..." });
     * ```
     */
    override async setDisplayName(
        ...[args, signal]: Parameters<ExchangeClient["setDisplayName"]>
    ): ReturnType<ExchangeClient["setDisplayName"]> {
        // Destructure the parameters
        const { ...actionArgs } = args;

        // Construct an action
        const nonce = await this.nonceManager();
        const action = actionSorter.setDisplayName({ type: "setDisplayName", ...actionArgs });

        // Send a multi-sig action
        const outerSigner = await this._getWalletAddress(this.signers[0]);
        const signatures = await this._multiSignL1Action({ action, nonce, outerSigner });

        // Send a multi-sig action
        return super.multiSig({
            signatures,
            payload: {
                multiSigUser: this.multiSignAddress,
                outerSigner,
                action,
            },
            nonce,
        }, signal);
    }

    /**
     * Set a referral code.
     * @param args - The parameters for the request.
     * @param signal - An optional abort signal.
     * @returns Successful response without specific data.
     *
     * @throws {ApiRequestError} When the API returns an unsuccessful response.
     * @throws {TransportError} When the transport layer throws an error.
     *
     * @see null
     * @example
     * ```ts
     * import * as hl from "@nktkas/hyperliquid";
     *
     * const multiSignAddress = "0x...";
     * const signers = [
     *   "0x...", // Private key; or any other wallet libraries
     * ] as const;
     *
     * const transport = new hl.HttpTransport(); // or `WebSocketTransport`
     * const multiSignClient = new hl.MultiSignClient({ transport, multiSignAddress, signers });
     *
     * await multiSignClient.setReferrer({ code: "..." });
     * ```
     */
    override async setReferrer(
        ...[args, signal]: Parameters<ExchangeClient["setReferrer"]>
    ): ReturnType<ExchangeClient["setReferrer"]> {
        // Destructure the parameters
        const { ...actionArgs } = args;

        // Construct an action
        const nonce = await this.nonceManager();
        const action = actionSorter.setReferrer({ type: "setReferrer", ...actionArgs });

        // Send a multi-sig action
        const outerSigner = await this._getWalletAddress(this.signers[0]);
        const signatures = await this._multiSignL1Action({ action, nonce, outerSigner });

        // Send a multi-sig action
        return super.multiSig({
            signatures,
            payload: {
                multiSigUser: this.multiSignAddress,
                outerSigner,
                action,
            },
            nonce,
        }, signal);
    }

    /**
     * Deploying HIP-1 and HIP-2 assets.
     * @param args - The parameters for the request.
     * @param signal - An optional abort signal.
     * @returns Successful response without specific data.
     *
     * @throws {ApiRequestError} When the API returns an unsuccessful response.
     * @throws {TransportError} When the transport layer throws an error.
     *
     * @see https://hyperliquid.gitbook.io/hyperliquid-docs/for-developers/api/deploying-hip-1-and-hip-2-assets
     * @example
     * ```ts
     * import * as hl from "@nktkas/hyperliquid";
     *
     * const multiSignAddress = "0x...";
     * const signers = [
     *   "0x...", // Private key; or any other wallet libraries
     * ] as const;
     *
     * const transport = new hl.HttpTransport(); // or `WebSocketTransport`
     * const multiSignClient = new hl.MultiSignClient({ transport, multiSignAddress, signers });
     *
     * await multiSignClient.spotDeploy({
     *   registerToken2: {
     *     spec: {
     *       name: "USDC",
     *       szDecimals: 8,
     *       weiDecimals: 8,
     *     },
     *     maxGas: 1000000,
     *     fullName: "USD Coin",
     *   },
     * });
     * ```
     */
    override async spotDeploy(
        ...[args, signal]: Parameters<ExchangeClient["spotDeploy"]>
    ): ReturnType<ExchangeClient["spotDeploy"]> {
        // Destructure the parameters
        const { ...actionArgs } = args;

        // Construct an action
        const nonce = await this.nonceManager();
        const action = actionSorter.spotDeploy({ type: "spotDeploy", ...actionArgs });

        // Send a multi-sig action
        const outerSigner = await this._getWalletAddress(this.signers[0]);
        const signatures = await this._multiSignL1Action({ action, nonce, outerSigner });

        // Send a multi-sig action
        return super.multiSig({
            signatures,
            payload: {
                multiSigUser: this.multiSignAddress,
                outerSigner,
                action,
            },
            nonce,
        }, signal);
    }

    /**
     * Send spot assets to another address.
     * @param args - The parameters for the request.
     * @param signal - An optional abort signal.
     * @returns Successful response without specific data.
     *
     * @throws {ApiRequestError} When the API returns an unsuccessful response.
     * @throws {TransportError} When the transport layer throws an error.
     *
     * @see https://hyperliquid.gitbook.io/hyperliquid-docs/for-developers/api/exchange-endpoint#core-spot-transfer
     * @example
     * ```ts
     * import * as hl from "@nktkas/hyperliquid";
     *
     * const multiSignAddress = "0x...";
     * const signers = [
     *   "0x...", // Private key; or any other wallet libraries
     * ] as const;
     *
     * const transport = new hl.HttpTransport(); // or `WebSocketTransport`
     * const multiSignClient = new hl.MultiSignClient({ transport, multiSignAddress, signers });
     *
     * await multiSignClient.spotSend({
     *   destination: "0x...",
     *   token: "USDC:0xeb62eee3685fc4c43992febcd9e75443",
     *   amount: "1",
     * });
     * ```
     */
    override async spotSend(
        ...[args, signal]: Parameters<ExchangeClient["spotSend"]>
    ): ReturnType<ExchangeClient["spotSend"]> {
        // Destructure the parameters
        const { ...actionArgs } = args;

        // Construct an action
        const nonce = await this.nonceManager();
        const action = actionSorter.spotSend({
            type: "spotSend",
            hyperliquidChain: this._getHyperliquidChain(),
            signatureChainId: await this._getSignatureChainId(),
            time: nonce,
            ...actionArgs,
        });

        // Sign the action
        const outerSigner = await this._getWalletAddress(this.signers[0]);
        const signatures = await this._multiSignUserSignedAction({ action, outerSigner });

        // Send a multi-sig action
        return super.multiSig({
            signatures,
            payload: {
                multiSigUser: this.multiSignAddress,
                outerSigner,
                action,
            },
            nonce,
        }, signal);
    }

    /**
     * Opt Out of Spot Dusting.
     * @param args - The parameters for the request.
     * @param signal - An optional abort signal.
     * @returns Successful response without specific data.
     *
     * @throws {ApiRequestError} When the API returns an unsuccessful response.
     * @throws {TransportError} When the transport layer throws an error.
     *
     * @see null
     * @example
     * ```ts
     * import * as hl from "@nktkas/hyperliquid";
     *
     * const multiSignAddress = "0x...";
     * const signers = [
     *   "0x...", // Private key; or any other wallet libraries
     * ] as const;
     *
     * const transport = new hl.HttpTransport(); // or `WebSocketTransport`
     * const multiSignClient = new hl.MultiSignClient({ transport, multiSignAddress, signers });
     *
     * await multiSignClient.spotUser({ toggleSpotDusting: { optOut: false } });
     * ```
     */
    override async spotUser(
        ...[args, signal]: Parameters<ExchangeClient["spotUser"]>
    ): ReturnType<ExchangeClient["spotUser"]> {
        // Destructure the parameters
        const { ...actionArgs } = args;

        // Construct an action
        const nonce = await this.nonceManager();
        const action = actionSorter.spotUser({ type: "spotUser", ...actionArgs });

        // Send a multi-sig action
        const outerSigner = await this._getWalletAddress(this.signers[0]);
        const signatures = await this._multiSignL1Action({ action, nonce, outerSigner });

        // Send a multi-sig action
        return super.multiSig({
            signatures,
            payload: {
                multiSigUser: this.multiSignAddress,
                outerSigner,
                action,
            },
            nonce,
        }, signal);
    }

    /**
     * Transfer between sub-accounts (spot).
     * @param args - The parameters for the request.
     * @param signal - An optional abort signal.
     * @returns Successful response without specific data.
     *
     * @throws {ApiRequestError} When the API returns an unsuccessful response.
     * @throws {TransportError} When the transport layer throws an error.
     *
     * @see null
     * @example
     * ```ts
     * import * as hl from "@nktkas/hyperliquid";
     *
     * const multiSignAddress = "0x...";
     * const signers = [
     *   "0x...", // Private key; or any other wallet libraries
     * ] as const;
     *
     * const transport = new hl.HttpTransport(); // or `WebSocketTransport`
     * const multiSignClient = new hl.MultiSignClient({ transport, multiSignAddress, signers });
     *
     * await multiSignClient.subAccountSpotTransfer({
     *   subAccountUser: "0x...",
     *   isDeposit: true,
     *   token: "USDC:0xeb62eee3685fc4c43992febcd9e75443",
     *   amount: "1",
     * });
     * ```
     */
    override async subAccountSpotTransfer(
        ...[args, signal]: Parameters<ExchangeClient["subAccountSpotTransfer"]>
    ): ReturnType<ExchangeClient["subAccountSpotTransfer"]> {
        // Destructure the parameters
        const { ...actionArgs } = args;

        // Construct an action
        const nonce = await this.nonceManager();
        const action = actionSorter.subAccountSpotTransfer({ type: "subAccountSpotTransfer", ...actionArgs });

        // Send a multi-sig action
        const outerSigner = await this._getWalletAddress(this.signers[0]);
        const signatures = await this._multiSignL1Action({ action, nonce, outerSigner });

        // Send a multi-sig action
        return super.multiSig({
            signatures,
            payload: {
                multiSigUser: this.multiSignAddress,
                outerSigner,
                action,
            },
            nonce,
        }, signal);
    }

    /**
     * Transfer between sub-accounts (perpetual).
     * @param args - The parameters for the request.
     * @param signal - An optional abort signal.
     * @returns Successful response without specific data.
     *
     * @throws {ApiRequestError} When the API returns an unsuccessful response.
     * @throws {TransportError} When the transport layer throws an error.
     *
     * @see null
     * @example
     * ```ts
     * import * as hl from "@nktkas/hyperliquid";
     *
     * const multiSignAddress = "0x...";
     * const signers = [
     *   "0x...", // Private key; or any other wallet libraries
     * ] as const;
     *
     * const transport = new hl.HttpTransport(); // or `WebSocketTransport`
     * const multiSignClient = new hl.MultiSignClient({ transport, multiSignAddress, signers });
     *
     * await multiSignClient.subAccountTransfer({ subAccountUser: "0x...", isDeposit: true, usd: 1 * 1e6 });
     * ```
     */
    override async subAccountTransfer(
        ...[args, signal]: Parameters<ExchangeClient["subAccountTransfer"]>
    ): ReturnType<ExchangeClient["subAccountTransfer"]> {
        // Destructure the parameters
        const { ...actionArgs } = args;

        // Construct an action
        const nonce = await this.nonceManager();
        const action = actionSorter.subAccountTransfer({ type: "subAccountTransfer", ...actionArgs });

        // Send a multi-sig action
        const outerSigner = await this._getWalletAddress(this.signers[0]);
        const signatures = await this._multiSignL1Action({ action, nonce, outerSigner });

        // Send a multi-sig action
        return super.multiSig({
            signatures,
            payload: {
                multiSigUser: this.multiSignAddress,
                outerSigner,
                action,
            },
            nonce,
        }, signal);
    }

    /**
     * Delegate or undelegate native tokens to or from a validator.
     * @param args - The parameters for the request.
     * @param signal - An optional abort signal.
     * @returns Successful response without specific data.
     *
     * @throws {ApiRequestError} When the API returns an unsuccessful response.
     * @throws {TransportError} When the transport layer throws an error.
     *
     * @see https://hyperliquid.gitbook.io/hyperliquid-docs/for-developers/api/exchange-endpoint#delegate-or-undelegate-stake-from-validator
     * @example
     * ```ts
     * import * as hl from "@nktkas/hyperliquid";
     *
     * const multiSignAddress = "0x...";
     * const signers = [
     *   "0x...", // Private key; or any other wallet libraries
     * ] as const;
     *
     * const transport = new hl.HttpTransport(); // or `WebSocketTransport`
     * const multiSignClient = new hl.MultiSignClient({ transport, multiSignAddress, signers });
     *
     * await multiSignClient.tokenDelegate({ validator: "0x...", isUndelegate: true, wei: 1 * 1e8 });
     * ```
     */
    override async tokenDelegate(
        ...[args, signal]: Parameters<ExchangeClient["tokenDelegate"]>
    ): ReturnType<ExchangeClient["tokenDelegate"]> {
        // Destructure the parameters
        const { ...actionArgs } = args;

        // Construct an action
        const nonce = await this.nonceManager();
        const action = actionSorter.tokenDelegate({
            type: "tokenDelegate",
            hyperliquidChain: this._getHyperliquidChain(),
            signatureChainId: await this._getSignatureChainId(),
            nonce,
            ...actionArgs,
        });

        // Sign the action
        const outerSigner = await this._getWalletAddress(this.signers[0]);
        const signatures = await this._multiSignUserSignedAction({ action, outerSigner });

        // Send a multi-sig action
        return super.multiSig({
            signatures,
            payload: {
                multiSigUser: this.multiSignAddress,
                outerSigner,
                action,
            },
            nonce,
        }, signal);
    }

    /**
     * Cancel a TWAP order.
     * @param args - The parameters for the request.
     * @param signal - An optional abort signal.
     * @returns Successful variant of {@link TwapCancelResponse} without error status.
     *
     * @throws {ApiRequestError} When the API returns an unsuccessful response.
     * @throws {TransportError} When the transport layer throws an error.
     *
     * @see https://hyperliquid.gitbook.io/hyperliquid-docs/for-developers/api/exchange-endpoint#cancel-a-twap-order
     * @example
     * ```ts
     * import * as hl from "@nktkas/hyperliquid";
     *
     * const multiSignAddress = "0x...";
     * const signers = [
     *   "0x...", // Private key; or any other wallet libraries
     * ] as const;
     *
     * const transport = new hl.HttpTransport(); // or `WebSocketTransport`
     * const multiSignClient = new hl.MultiSignClient({ transport, multiSignAddress, signers });
     *
     * const data = await multiSignClient.twapCancel({ a: 0, t: 1 });
     * ```
     */
    override async twapCancel(
        ...[args, signal]: Parameters<ExchangeClient["twapCancel"]>
    ): ReturnType<ExchangeClient["twapCancel"]> {
        // Destructure the parameters
        const {
            vaultAddress = this.defaultVaultAddress,
            expiresAfter = await this._getDefaultExpiresAfter(),
            ...actionArgs
        } = args;

        // Construct an action
        const nonce = await this.nonceManager();
        const action = actionSorter.twapCancel({ type: "twapCancel", ...actionArgs });

        // Send a multi-sig action
        const outerSigner = await this._getWalletAddress(this.signers[0]);
        const signatures = await this._multiSignL1Action({ action, nonce, outerSigner, vaultAddress, expiresAfter });

        // Send a multi-sig action
        return super.multiSig({
            signatures,
            payload: {
                multiSigUser: this.multiSignAddress,
                outerSigner,
                action,
            },
            nonce,
            vaultAddress,
            expiresAfter,
        }, signal);
    }

    /**
     * Place a TWAP order.
     * @param args - The parameters for the request.
     * @param signal - An optional abort signal.
     * @returns Successful variant of {@link TwapOrderResponse} without error status.
     *
     * @throws {ApiRequestError} When the API returns an unsuccessful response.
     * @throws {TransportError} When the transport layer throws an error.
     *
     * @see https://hyperliquid.gitbook.io/hyperliquid-docs/for-developers/api/exchange-endpoint#place-a-twap-order
     * @example
     * ```ts
     * import * as hl from "@nktkas/hyperliquid";
     *
     * const multiSignAddress = "0x...";
     * const signers = [
     *   "0x...", // Private key; or any other wallet libraries
     * ] as const;
     *
     * const transport = new hl.HttpTransport(); // or `WebSocketTransport`
     * const multiSignClient = new hl.MultiSignClient({ transport, multiSignAddress, signers });
     *
     * const data = await multiSignClient.twapOrder({
     *   a: 0,
     *   b: true,
     *   s: "1",
     *   r: false,
     *   m: 10,
     *   t: true,
     * });
     * ```
     */
    override async twapOrder(
        ...[args, signal]: Parameters<ExchangeClient["twapOrder"]>
    ): ReturnType<ExchangeClient["twapOrder"]> {
        // Destructure the parameters
        const {
            vaultAddress = this.defaultVaultAddress,
            expiresAfter = await this._getDefaultExpiresAfter(),
            ...actionArgs
        } = args;

        // Construct an action
        const nonce = await this.nonceManager();
        const action = actionSorter.twapOrder({ type: "twapOrder", twap: { ...actionArgs } });

        // Send a multi-sig action
        const outerSigner = await this._getWalletAddress(this.signers[0]);
        const signatures = await this._multiSignL1Action({ action, nonce, outerSigner, vaultAddress, expiresAfter });

        // Send a multi-sig action
        return super.multiSig({
            signatures,
            payload: {
                multiSigUser: this.multiSignAddress,
                outerSigner,
                action,
            },
            nonce,
            vaultAddress,
            expiresAfter,
        }, signal);
    }

    /**
     * Add or remove margin from isolated position.
     * @param args - The parameters for the request.
     * @param signal - An optional abort signal.
     * @returns Successful response without specific data.
     *
     * @throws {ApiRequestError} When the API returns an unsuccessful response.
     * @throws {TransportError} When the transport layer throws an error.
     *
     * @see https://hyperliquid.gitbook.io/hyperliquid-docs/for-developers/api/exchange-endpoint#update-isolated-margin
     * @example
     * ```ts
     * import * as hl from "@nktkas/hyperliquid";
     *
     * const multiSignAddress = "0x...";
     * const signers = [
     *   "0x...", // Private key; or any other wallet libraries
     * ] as const;
     *
     * const transport = new hl.HttpTransport(); // or `WebSocketTransport`
     * const multiSignClient = new hl.MultiSignClient({ transport, multiSignAddress, signers });
     *
     * await multiSignClient.updateIsolatedMargin({ asset: 0, isBuy: true, ntli: 1 * 1e6 });
     * ```
     */
    override async updateIsolatedMargin(
        ...[args, signal]: Parameters<ExchangeClient["updateIsolatedMargin"]>
    ): ReturnType<ExchangeClient["updateIsolatedMargin"]> {
        // Destructure the parameters
        const {
            vaultAddress = this.defaultVaultAddress,
            expiresAfter = await this._getDefaultExpiresAfter(),
            ...actionArgs
        } = args;

        // Construct an action
        const nonce = await this.nonceManager();
        const action = actionSorter.updateIsolatedMargin({ type: "updateIsolatedMargin", ...actionArgs });

        // Send a multi-sig action
        const outerSigner = await this._getWalletAddress(this.signers[0]);
        const signatures = await this._multiSignL1Action({ action, nonce, outerSigner, vaultAddress, expiresAfter });

        // Send a multi-sig action
        return super.multiSig({
            signatures,
            payload: {
                multiSigUser: this.multiSignAddress,
                outerSigner,
                action,
            },
            nonce,
            vaultAddress,
            expiresAfter,
        }, signal);
    }

    /**
     * Update cross or isolated leverage on a coin.
     * @param args - The parameters for the request.
     * @param signal - An optional abort signal.
     * @returns Successful response without specific data.
     *
     * @throws {ApiRequestError} When the API returns an unsuccessful response.
     * @throws {TransportError} When the transport layer throws an error.
     *
     * @see https://hyperliquid.gitbook.io/hyperliquid-docs/for-developers/api/exchange-endpoint#update-leverage
     * @example
     * ```ts
     * import * as hl from "@nktkas/hyperliquid";
     *
     * const multiSignAddress = "0x...";
     * const signers = [
     *   "0x...", // Private key; or any other wallet libraries
     * ] as const;
     *
     * const transport = new hl.HttpTransport(); // or `WebSocketTransport`
     * const multiSignClient = new hl.MultiSignClient({ transport, multiSignAddress, signers });
     *
     * await multiSignClient.updateLeverage({ asset: 0, isCross: true, leverage: 5 });
     * ```
     */
    override async updateLeverage(
        ...[args, signal]: Parameters<ExchangeClient["updateLeverage"]>
    ): ReturnType<ExchangeClient["updateLeverage"]> {
        // Destructure the parameters
        const {
            vaultAddress = this.defaultVaultAddress,
            expiresAfter = await this._getDefaultExpiresAfter(),
            ...actionArgs
        } = args;

        // Construct an action
        const nonce = await this.nonceManager();
        const action = actionSorter.updateLeverage({ type: "updateLeverage", ...actionArgs });

        // Send a multi-sig action
        const outerSigner = await this._getWalletAddress(this.signers[0]);
        const signatures = await this._multiSignL1Action({ action, nonce, outerSigner, vaultAddress, expiresAfter });

        // Send a multi-sig action
        return super.multiSig({
            signatures,
            payload: {
                multiSigUser: this.multiSignAddress,
                outerSigner,
                action,
            },
            nonce,
            vaultAddress,
            expiresAfter,
        }, signal);
    }

    /**
     * Transfer funds between Spot account and Perp account.
     * @param args - The parameters for the request.
     * @param signal - An optional abort signal.
     * @returns Successful response without specific data.
     *
     * @throws {ApiRequestError} When the API returns an unsuccessful response.
     * @throws {TransportError} When the transport layer throws an error.
     *
     * @see https://hyperliquid.gitbook.io/hyperliquid-docs/for-developers/api/exchange-endpoint#transfer-from-spot-account-to-perp-account-and-vice-versa
     * @example
     * ```ts
     * import * as hl from "@nktkas/hyperliquid";
     *
     * const multiSignAddress = "0x...";
     * const signers = [
     *   "0x...", // Private key; or any other wallet libraries
     * ] as const;
     *
     * const transport = new hl.HttpTransport(); // or `WebSocketTransport`
     * const multiSignClient = new hl.MultiSignClient({ transport, multiSignAddress, signers });
     *
     * await multiSignClient.usdClassTransfer({ amount: "1", toPerp: true });
     * ```
     */
    override async usdClassTransfer(
        ...[args, signal]: Parameters<ExchangeClient["usdClassTransfer"]>
    ): ReturnType<ExchangeClient["usdClassTransfer"]> {
        // Destructure the parameters
        const { ...actionArgs } = args;

        // Construct an action
        const nonce = await this.nonceManager();
        const action = actionSorter.usdClassTransfer({
            type: "usdClassTransfer",
            hyperliquidChain: this._getHyperliquidChain(),
            signatureChainId: await this._getSignatureChainId(),
            nonce,
            ...actionArgs,
        });

        // Sign the action
        const outerSigner = await this._getWalletAddress(this.signers[0]);
        const signatures = await this._multiSignUserSignedAction({ action, outerSigner });

        // Send a multi-sig action
        return super.multiSig({
            signatures,
            payload: {
                multiSigUser: this.multiSignAddress,
                outerSigner,
                action,
            },
            nonce,
        }, signal);
    }

    /**
     * Send usd to another address.
     * @param args - The parameters for the request.
     * @param signal - An optional abort signal.
     * @returns Successful response without specific data.
     *
     * @throws {ApiRequestError} When the API returns an unsuccessful response.
     * @throws {TransportError} When the transport layer throws an error.
     *
     * @see https://hyperliquid.gitbook.io/hyperliquid-docs/for-developers/api/exchange-endpoint#core-usdc-transfer
     * @example
     * ```ts
     * import * as hl from "@nktkas/hyperliquid";
     *
     * const multiSignAddress = "0x...";
     * const signers = [
     *   "0x...", // Private key; or any other wallet libraries
     * ] as const;
     *
     * const transport = new hl.HttpTransport(); // or `WebSocketTransport`
     * const multiSignClient = new hl.MultiSignClient({ transport, multiSignAddress, signers });
     *
     * await multiSignClient.usdSend({ destination: "0x...", amount: "1" });
     * ```
     */
    override async usdSend(
        ...[args, signal]: Parameters<ExchangeClient["usdSend"]>
    ): ReturnType<ExchangeClient["usdSend"]> {
        // Destructure the parameters
        const { ...actionArgs } = args;

        // Construct an action
        const nonce = await this.nonceManager();
        const action = actionSorter.usdSend({
            type: "usdSend",
            hyperliquidChain: this._getHyperliquidChain(),
            signatureChainId: await this._getSignatureChainId(),
            time: nonce,
            ...actionArgs,
        });

        // Sign the action
        const outerSigner = await this._getWalletAddress(this.signers[0]);
        const signatures = await this._multiSignUserSignedAction({ action, outerSigner });

        // Send a multi-sig action
        return super.multiSig({
            signatures,
            payload: {
                multiSigUser: this.multiSignAddress,
                outerSigner,
                action,
            },
            nonce,
        }, signal);
    }

    /**
     * Distribute funds from a vault between followers.
     * @param args - The parameters for the request.
     * @param signal - An optional abort signal.
     * @returns Successful response without specific data.
     *
     * @throws {ApiRequestError} When the API returns an unsuccessful response.
     * @throws {TransportError} When the transport layer throws an error.
     *
     * @see null
     * @example
     * ```ts
     * import * as hl from "@nktkas/hyperliquid";
     *
     * const multiSignAddress = "0x...";
     * const signers = [
     *   "0x...", // Private key; or any other wallet libraries
     * ] as const;
     *
     * const transport = new hl.HttpTransport(); // or `WebSocketTransport`
     * const multiSignClient = new hl.MultiSignClient({ transport, multiSignAddress, signers });
     *
     * await multiSignClient.vaultDistribute({ vaultAddress: "0x...", usd: 10 * 1e6 });
     * ```
     */
    override async vaultDistribute(
        ...[args, signal]: Parameters<ExchangeClient["vaultDistribute"]>
    ): ReturnType<ExchangeClient["vaultDistribute"]> {
        // Destructure the parameters
        const { ...actionArgs } = args;

        // Construct an action
        const nonce = await this.nonceManager();
        const action = actionSorter.vaultDistribute({ type: "vaultDistribute", ...actionArgs });

        // Send a multi-sig action
        const outerSigner = await this._getWalletAddress(this.signers[0]);
        const signatures = await this._multiSignL1Action({ action, nonce, outerSigner });

        // Send a multi-sig action
        return super.multiSig({
            signatures,
            payload: {
                multiSigUser: this.multiSignAddress,
                outerSigner,
                action,
            },
            nonce,
        }, signal);
    }

    /**
     * Modify a vault's configuration.
     * @param args - The parameters for the request.
     * @param signal - An optional abort signal.
     * @returns Successful response without specific data.
     *
     * @throws {ApiRequestError} When the API returns an unsuccessful response.
     * @throws {TransportError} When the transport layer throws an error.
     *
     * @see null
     * @example
     * ```ts
     * import * as hl from "@nktkas/hyperliquid";
     *
     * const multiSignAddress = "0x...";
     * const signers = [
     *   "0x...", // Private key; or any other wallet libraries
     * ] as const;
     *
     * const transport = new hl.HttpTransport(); // or `WebSocketTransport`
     * const multiSignClient = new hl.MultiSignClient({ transport, multiSignAddress, signers });
     *
     * await multiSignClient.vaultModify({
     *   vaultAddress: "0x...",
     *   allowDeposits: true,
     *   alwaysCloseOnWithdraw: false,
     * });
     * ```
     */
    override async vaultModify(
        ...[args, signal]: Parameters<ExchangeClient["vaultModify"]>
    ): ReturnType<ExchangeClient["vaultModify"]> {
        // Destructure the parameters
        const { ...actionArgs } = args;

        // Construct an action
        const nonce = await this.nonceManager();
        const action = actionSorter.vaultModify({ type: "vaultModify", ...actionArgs });

        // Send a multi-sig action
        const outerSigner = await this._getWalletAddress(this.signers[0]);
        const signatures = await this._multiSignL1Action({ action, nonce, outerSigner });

        // Send a multi-sig action
        return super.multiSig({
            signatures,
            payload: {
                multiSigUser: this.multiSignAddress,
                outerSigner,
                action,
            },
            nonce,
        }, signal);
    }

    /**
     * Deposit or withdraw from a vault.
     * @param args - The parameters for the request.
     * @param signal - An optional abort signal.
     * @returns Successful response without specific data.
     *
     * @throws {ApiRequestError} When the API returns an unsuccessful response.
     * @throws {TransportError} When the transport layer throws an error.
     *
     * @see https://hyperliquid.gitbook.io/hyperliquid-docs/for-developers/api/exchange-endpoint#deposit-or-withdraw-from-a-vault
     * @example
     * ```ts
     * import * as hl from "@nktkas/hyperliquid";
     *
     * const multiSignAddress = "0x...";
     * const signers = [
     *   "0x...", // Private key; or any other wallet libraries
     * ] as const;
     *
     * const transport = new hl.HttpTransport(); // or `WebSocketTransport`
     * const multiSignClient = new hl.MultiSignClient({ transport, multiSignAddress, signers });
     *
     * await multiSignClient.vaultTransfer({ vaultAddress: "0x...", isDeposit: true, usd: 10 * 1e6 });
     * ```
     */
    override async vaultTransfer(
        ...[args, signal]: Parameters<ExchangeClient["vaultTransfer"]>
    ): ReturnType<ExchangeClient["vaultTransfer"]> {
        // Destructure the parameters
        const {
            expiresAfter = await this._getDefaultExpiresAfter(),
            ...actionArgs
        } = args;

        // Construct an action
        const nonce = await this.nonceManager();
        const action = actionSorter.vaultTransfer({ type: "vaultTransfer", ...actionArgs });

        // Send a multi-sig action
        const outerSigner = await this._getWalletAddress(this.signers[0]);
        const signatures = await this._multiSignL1Action({ action, nonce, outerSigner, expiresAfter });

        // Send a multi-sig action
        return super.multiSig({
            signatures,
            payload: {
                multiSigUser: this.multiSignAddress,
                outerSigner,
                action,
            },
            nonce,
            expiresAfter,
        }, signal);
    }

    /**
     * Initiate a withdrawal request.
     * @param args - The parameters for the request.
     * @param signal - An optional abort signal.
     * @returns Successful response without specific data.
     *
     * @throws {ApiRequestError} When the API returns an unsuccessful response.
     * @throws {TransportError} When the transport layer throws an error.
     *
     * @see https://hyperliquid.gitbook.io/hyperliquid-docs/for-developers/api/exchange-endpoint#initiate-a-withdrawal-request
     * @example
     * ```ts
     * import * as hl from "@nktkas/hyperliquid";
     *
     * const multiSignAddress = "0x...";
     * const signers = [
     *   "0x...", // Private key; or any other wallet libraries
     * ] as const;
     *
     * const transport = new hl.HttpTransport(); // or `WebSocketTransport`
     * const multiSignClient = new hl.MultiSignClient({ transport, multiSignAddress, signers });
     *
     * await multiSignClient.withdraw3({ destination: "0x...", amount: "1" });
     * ```
     */
    override async withdraw3(
        ...[args, signal]: Parameters<ExchangeClient["withdraw3"]>
    ): ReturnType<ExchangeClient["withdraw3"]> {
        // Destructure the parameters
        const { ...actionArgs } = args;

        // Construct an action
        const nonce = await this.nonceManager();
        const action = actionSorter.withdraw3({
            type: "withdraw3",
            hyperliquidChain: this._getHyperliquidChain(),
            signatureChainId: await this._getSignatureChainId(),
            time: nonce,
            ...actionArgs,
        });

        // Sign the action
        const outerSigner = await this._getWalletAddress(this.signers[0]);
        const signatures = await this._multiSignUserSignedAction({ action, outerSigner });

        // Send a multi-sig action
        return super.multiSig({
            signatures,
            payload: {
                multiSigUser: this.multiSignAddress,
                outerSigner,
                action,
            },
            nonce,
        }, signal);
    }

    /** Extracts the wallet address from different wallet types. */
    protected async _getWalletAddress(wallet: AbstractWalletWithAddress): Promise<Hex> {
        if (isValidPrivateKey(wallet)) {
            return privateKeyToAddress(wallet);
        } else if (isAbstractViemWalletClient(wallet)) {
            return wallet.address;
        } else if (isAbstractEthersSigner(wallet) || isAbstractEthersV5Signer(wallet)) {
            return await wallet.getAddress() as Hex;
        } else if (isAbstractWindowEthereum(wallet)) {
            const accounts = await wallet.request({ method: "eth_requestAccounts", params: [] });
            if (!Array.isArray(accounts) || accounts.length === 0) {
                throw new Error("No Ethereum accounts available");
            }
            return accounts[0] as Hex;
        } else {
            throw new Error("Unsupported wallet for getting address");
        }
    }

    /** Signs L1 action with all signers for multi-signature operations. */
    protected _multiSignL1Action(args: {
        action: Record<string, unknown>;
        nonce: number;
        outerSigner: Hex;
        vaultAddress?: Hex;
        expiresAfter?: number;
    }): Promise<Signature[]> {
        const { action, nonce, outerSigner, vaultAddress, expiresAfter } = args;
        return Promise.all(this.signers.map((signer) => {
            return signL1Action({
                wallet: signer,
                action: [this.multiSignAddress.toLowerCase(), outerSigner.toLowerCase(), action],
                nonce,
                isTestnet: this.isTestnet,
                vaultAddress,
                expiresAfter,
            });
        }));
    }

    /** Signs user-signed action with all signers for multi-signature operations. */
    protected _multiSignUserSignedAction(args: {
        action:
            & Record<string, unknown>
            & {
                type: keyof typeof userSignedActionEip712Types;
                signatureChainId: Hex;
            };
        outerSigner: Hex;
    }): Promise<Signature[]> {
        const { action, outerSigner } = args;
        return Promise.all(this.signers.map((signer) => {
            const types = structuredClone(userSignedActionEip712Types[action.type]); // for safe mutation
            Object.values(types)[0].splice( // array mutation
                1, // after `hyperliquidChain`
                0, // do not remove any elements
                { name: "payloadMultiSigUser", type: "address" },
                { name: "outerSigner", type: "address" },
            );
            return signUserSignedAction({
                wallet: signer,
                action: {
                    payloadMultiSigUser: this.multiSignAddress,
                    outerSigner,
                    ...action,
                },
                types,
            });
        }));
    }
}

/** Converts a private key to an Ethereum address. */
function privateKeyToAddress(privateKey: string): Hex {
    const cleanPrivKey = privateKey.startsWith("0x") ? privateKey.slice(2) : privateKey;

    const publicKey = getPublicKey(cleanPrivKey, false);
    const publicKeyWithoutPrefix = publicKey.slice(1);

    const hash = keccak_256(publicKeyWithoutPrefix);

    const addressBytes = hash.slice(-20);
    const address = etc.bytesToHex(addressBytes);

    return `0x${address}`;
}
