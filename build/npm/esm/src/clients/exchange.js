import { HyperliquidError } from "../base.js";
import { actionSorter, getWalletChainId, signL1Action, signMultiSigAction, signUserSignedAction, userSignedActionEip712Types, } from "../signing/mod.js";
/** Custom error class for API request errors. */
export class ApiRequestError extends HyperliquidError {
    response;
    constructor(response) {
        let message;
        if (response.status === "err") {
            // ErrorResponse
            message = response.response;
        }
        else {
            if ("statuses" in response.response.data) {
                // OrderResponse | CancelResponse
                const errors = response.response.data.statuses.reduce((acc, status, index) => {
                    if (typeof status === "object" && "error" in status) {
                        acc.push(`Order ${index}: ${status.error}`);
                    }
                    return acc;
                }, []);
                if (errors.length > 0) {
                    message = errors.join(", ");
                }
            }
            else {
                // TwapOrderResponse | TwapCancelResponse
                if (typeof response.response.data.status === "object" && "error" in response.response.data.status) {
                    message = response.response.data.status.error;
                }
            }
        }
        super(message || "An unknown error occurred while processing an API request. See `response` for more details.");
        this.response = response;
        this.name = "ApiRequestError";
    }
}
/** Nonce manager for generating unique nonces for signing transactions. */
class NonceManager {
    /** The last nonce used for signing transactions. */
    lastNonce = 0;
    /**
     * Gets the next nonce for signing transactions.
     * @returns The next nonce.
     */
    getNonce() {
        let nonce = Date.now();
        if (nonce <= this.lastNonce) {
            nonce = ++this.lastNonce;
        }
        else {
            this.lastNonce = nonce;
        }
        return nonce;
    }
}
/**
 * Exchange client for interacting with the Hyperliquid API.
 * @typeParam T The transport used to connect to the Hyperliquid API.
 * @typeParam W The wallet used for signing transactions.
 */
export class ExchangeClient {
    transport;
    wallet;
    isTestnet;
    defaultVaultAddress;
    defaultExpiresAfter;
    signatureChainId;
    nonceManager;
    /**
     * Initialises a new instance.
     * @param args - The parameters for the client.
     *
     * @example Private key directly
     * ```ts
     * import * as hl from "@nktkas/hyperliquid";
     *
     * const privateKey = "0x...";
     *
     * const transport = new hl.HttpTransport(); // or `WebSocketTransport`
     * const exchClient = new hl.ExchangeClient({ wallet: privateKey, transport });
     * ```
     *
     * @example [Viem](https://viem.sh/docs/clients/wallet#local-accounts-private-key-mnemonic-etc)
     * ```ts
     * import * as hl from "@nktkas/hyperliquid";
     * import { privateKeyToAccount } from "viem/accounts";
     *
     * const account = privateKeyToAccount("0x...");
     *
     * const transport = new hl.HttpTransport(); // or `WebSocketTransport`
     * const exchClient = new hl.ExchangeClient({ wallet: account, transport });
     * ```
     *
     * @example [ethers.js](https://docs.ethers.org/v6/api/wallet/#Wallet) or [ethers.js v5](https://docs.ethers.org/v5/api/signer/#Wallet)
     * ```ts
     * import * as hl from "@nktkas/hyperliquid";
     * import { ethers } from "ethers";
     *
     * const wallet = new ethers.Wallet("0x...");
     *
     * const transport = new hl.HttpTransport(); // or `WebSocketTransport`
     * const exchClient = new hl.ExchangeClient({ wallet, transport });
     * ```
     *
     * @example External wallet (e.g. MetaMask) via [viem](https://viem.sh/docs/clients/wallet)
     * ```ts
     * import * as hl from "@nktkas/hyperliquid";
     * import { createWalletClient, custom } from "viem";
     *
     * const ethereum = (window as any).ethereum;
     * const [account] = await ethereum.request({ method: "eth_requestAccounts" });
     * const wallet = createWalletClient({ account, transport: custom(ethereum) });
     *
     * const transport = new hl.HttpTransport(); // or `WebSocketTransport`
     * const exchClient = new hl.ExchangeClient({ wallet, transport });
     * ```
     */
    constructor(args) {
        this.transport = args.transport;
        this.wallet = args.wallet;
        this.isTestnet = args.isTestnet ?? false;
        this.defaultVaultAddress = args.defaultVaultAddress;
        this.defaultExpiresAfter = args.defaultExpiresAfter;
        this.signatureChainId = args.signatureChainId ?? (() => getWalletChainId(this.wallet));
        this.nonceManager = args.nonceManager ?? new NonceManager().getNonce;
    }
    /**
     * Approve an agent to sign on behalf of the master account.
     * @param params - Action-specific parameters.
     * @param opts - Request execution options.
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
     * const privateKey = "0x..."; // `viem`, `ethers`, or private key directly`
     * const transport = new hl.HttpTransport(); // or `WebSocketTransport`
     * const exchClient = new hl.ExchangeClient({ wallet: privateKey, transport });
     *
     * await exchClient.approveAgent({ agentAddress: "0x...", agentName: "..." });
     * ```
     */
    async approveAgent(params, opts) {
        const action = actionSorter.approveAgent({
            type: "approveAgent",
            hyperliquidChain: this._getHyperliquidChain(),
            signatureChainId: await this._getSignatureChainId(),
            nonce: await this.nonceManager(),
            ...params,
        });
        return await this._executeUserSignedAction({ action }, opts?.signal);
    }
    /**
     * Approve a maximum fee rate for a builder.
     * @param params - Action-specific parameters.
     * @param opts - Request execution options.
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
     * const privateKey = "0x..."; // `viem`, `ethers`, or private key directly`
     * const transport = new hl.HttpTransport(); // or `WebSocketTransport`
     * const exchClient = new hl.ExchangeClient({ wallet: privateKey, transport });
     *
     * await exchClient.approveBuilderFee({ maxFeeRate: "0.01%", builder: "0x..." });
     * ```
     */
    async approveBuilderFee(params, opts) {
        const action = actionSorter.approveBuilderFee({
            type: "approveBuilderFee",
            hyperliquidChain: this._getHyperliquidChain(),
            signatureChainId: await this._getSignatureChainId(),
            nonce: await this.nonceManager(),
            ...params,
        });
        return await this._executeUserSignedAction({ action }, opts?.signal);
    }
    /**
     * Modify multiple orders.
     * @param params - Action-specific parameters.
     * @param opts - Request execution options.
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
     * const privateKey = "0x..."; // `viem`, `ethers`, or private key directly`
     * const transport = new hl.HttpTransport(); // or `WebSocketTransport`
     * const exchClient = new hl.ExchangeClient({ wallet: privateKey, transport });
     *
     * const data = await exchClient.batchModify({
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
    async batchModify(params, opts) {
        const action = actionSorter.batchModify({
            type: "batchModify",
            ...params,
        });
        const vaultAddress = opts?.vaultAddress ?? this.defaultVaultAddress;
        const expiresAfter = opts?.expiresAfter ?? await this._getDefaultExpiresAfter();
        return await this._executeL1Action({ action, vaultAddress, expiresAfter }, opts?.signal);
    }
    /**
     * Cancel order(s).
     * @param params - Action-specific parameters.
     * @param opts - Request execution options.
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
     * const privateKey = "0x..."; // `viem`, `ethers`, or private key directly`
     * const transport = new hl.HttpTransport(); // or `WebSocketTransport`
     * const exchClient = new hl.ExchangeClient({ wallet: privateKey, transport });
     *
     * const data = await exchClient.cancel({
     *   cancels: [
     *     { a: 0, o: 123 },
     *   ],
     * });
     * ```
     */
    async cancel(params, opts) {
        const action = actionSorter.cancel({
            type: "cancel",
            ...params,
        });
        const vaultAddress = opts?.vaultAddress ?? this.defaultVaultAddress;
        const expiresAfter = opts?.expiresAfter ?? await this._getDefaultExpiresAfter();
        return await this._executeL1Action({ action, vaultAddress, expiresAfter }, opts?.signal);
    }
    /**
     * Cancel order(s) by cloid.
     * @param params - Action-specific parameters.
     * @param opts - Request execution options.
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
     * const privateKey = "0x..."; // `viem`, `ethers`, or private key directly`
     * const transport = new hl.HttpTransport(); // or `WebSocketTransport`
     * const exchClient = new hl.ExchangeClient({ wallet: privateKey, transport });
     *
     * const data = await exchClient.cancelByCloid({
     *   cancels: [
     *     { asset: 0, cloid: "0x..." },
     *   ],
     * });
     * ```
     */
    async cancelByCloid(params, opts) {
        const action = actionSorter.cancelByCloid({
            type: "cancelByCloid",
            ...params,
        });
        const vaultAddress = opts?.vaultAddress ?? this.defaultVaultAddress;
        const expiresAfter = opts?.expiresAfter ?? await this._getDefaultExpiresAfter();
        return await this._executeL1Action({ action, vaultAddress, expiresAfter }, opts?.signal);
    }
    /**
     * Transfer native token from the user's spot account into staking for delegating to validators.
     * @param params - Action-specific parameters.
     * @param opts - Request execution options.
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
     * const privateKey = "0x..."; // `viem`, `ethers`, or private key directly`
     * const transport = new hl.HttpTransport(); // or `WebSocketTransport`
     * const exchClient = new hl.ExchangeClient({ wallet: privateKey, transport });
     *
     * await exchClient.cDeposit({ wei: 1 * 1e8 });
     * ```
     */
    async cDeposit(params, opts) {
        const action = actionSorter.cDeposit({
            type: "cDeposit",
            hyperliquidChain: this._getHyperliquidChain(),
            signatureChainId: await this._getSignatureChainId(),
            nonce: await this.nonceManager(),
            ...params,
        });
        return await this._executeUserSignedAction({ action }, opts?.signal);
    }
    /**
     * Claim rewards from referral program.
     * @param opts - Request execution options.
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
     * const privateKey = "0x..."; // `viem`, `ethers`, or private key directly`
     * const transport = new hl.HttpTransport(); // or `WebSocketTransport`
     * const exchClient = new hl.ExchangeClient({ wallet: privateKey, transport });
     *
     * await exchClient.claimRewards();
     * ```
     */
    async claimRewards(opts) {
        const action = actionSorter.claimRewards({
            type: "claimRewards",
        });
        const expiresAfter = opts?.expiresAfter ?? await this._getDefaultExpiresAfter();
        return await this._executeL1Action({ action, expiresAfter }, opts?.signal);
    }
    /**
     * Convert a single-signature account to a multi-signature account or vice versa.
     * @param params - Action-specific parameters.
     * @param opts - Request execution options.
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
     * const privateKey = "0x..."; // `viem`, `ethers`, or private key directly`
     * const transport = new hl.HttpTransport(); // or `WebSocketTransport`
     * const exchClient = new hl.ExchangeClient({ wallet: privateKey, transport });
     *
     * // Convert to multi-sig user
     * await exchClient.convertToMultiSigUser({
     *   signers: {
     *     authorizedUsers: ["0x...", "0x...", "0x..."],
     *     threshold: 2,
     *   },
     * });
     *
     * // Convert to single-sig user
     * await exchClient.convertToMultiSigUser({ signers: null });
     * ```
     */
    async convertToMultiSigUser(params, opts) {
        const action = actionSorter.convertToMultiSigUser({
            type: "convertToMultiSigUser",
            hyperliquidChain: this._getHyperliquidChain(),
            signatureChainId: await this._getSignatureChainId(),
            nonce: await this.nonceManager(),
            ...params,
        });
        return await this._executeUserSignedAction({ action }, opts?.signal);
    }
    /**
     * Create a sub-account.
     * @param params - Action-specific parameters.
     * @param opts - Request execution options.
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
     * const privateKey = "0x..."; // `viem`, `ethers`, or private key directly`
     * const transport = new hl.HttpTransport(); // or `WebSocketTransport`
     * const exchClient = new hl.ExchangeClient({ wallet: privateKey, transport });
     *
     * const data = await exchClient.createSubAccount({ name: "..." });
     * ```
     */
    async createSubAccount(params, opts) {
        const action = actionSorter.createSubAccount({
            type: "createSubAccount",
            ...params,
        });
        const expiresAfter = opts?.expiresAfter ?? await this._getDefaultExpiresAfter();
        return await this._executeL1Action({ action, expiresAfter }, opts?.signal);
    }
    /**
     * Create a vault.
     * @param params - Action-specific parameters.
     * @param opts - Request execution options.
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
     * const privateKey = "0x..."; // `viem`, `ethers`, or private key directly`
     * const transport = new hl.HttpTransport(); // or `WebSocketTransport`
     * const exchClient = new hl.ExchangeClient({ wallet: privateKey, transport });
     *
     * const data = await exchClient.createVault({
     *   name: "...",
     *   description: "...",
     *   initialUsd: 100 * 1e6,
     *   nonce: Date.now(),
     * });
     * ```
     */
    async createVault(params, opts) {
        const action = actionSorter.createVault({
            type: "createVault",
            ...params,
        });
        const expiresAfter = opts?.expiresAfter ?? await this._getDefaultExpiresAfter();
        return await this._executeL1Action({ action, expiresAfter }, opts?.signal);
    }
    /**
     * Jail or unjail self as a validator signer.
     * @param params - Action-specific parameters.
     * @param opts - Request execution options.
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
     * const privateKey = "0x..."; // `viem`, `ethers`, or private key directly`
     * const transport = new hl.HttpTransport(); // or `WebSocketTransport`
     * const exchClient = new hl.ExchangeClient({ wallet: privateKey, transport });
     *
     * // Jail self
     * await exchClient.cSignerAction({ jailSelf: null });
     *
     * // Unjail self
     * await exchClient.cSignerAction({ unjailSelf: null });
     * ```
     */
    async cSignerAction(params, opts) {
        const action = actionSorter.CSignerAction({
            type: "CSignerAction",
            ...params,
        });
        const expiresAfter = opts?.expiresAfter ?? await this._getDefaultExpiresAfter();
        return await this._executeL1Action({ action, expiresAfter }, opts?.signal);
    }
    /**
     * Action related to validator management.
     * @param params - Action-specific parameters.
     * @param opts - Request execution options.
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
     * const privateKey = "0x..."; // `viem`, `ethers`, or private key directly`
     * const transport = new hl.HttpTransport(); // or `WebSocketTransport`
     * const exchClient = new hl.ExchangeClient({ wallet: privateKey, transport });
     *
     * // Change validator profile
     * await exchClient.cValidatorAction({
     *   changeProfile: {
     *     node_ip: { Ip: "1.2.3.4" },
     *     name: "...",
     *     description: "...",
     *     unjailed: true,
     *     disable_delegations: false,
     *     commission_bps: null,
     *     signer: null,
     *   },
     * });
     *
     * // Register a new validator
     * await exchClient.cValidatorAction({
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
     * await exchClient.cValidatorAction({ unregister: null });
     * ```
     */
    async cValidatorAction(params, opts) {
        const action = actionSorter.CValidatorAction({
            type: "CValidatorAction",
            ...params,
        });
        const expiresAfter = opts?.expiresAfter ?? await this._getDefaultExpiresAfter();
        return await this._executeL1Action({ action, expiresAfter }, opts?.signal);
    }
    /**
     * Transfer native token from staking into the user's spot account.
     * @param params - Action-specific parameters.
     * @param opts - Request execution options.
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
     * const privateKey = "0x..."; // `viem`, `ethers`, or private key directly`
     * const transport = new hl.HttpTransport(); // or `WebSocketTransport`
     * const exchClient = new hl.ExchangeClient({ wallet: privateKey, transport });
     *
     * await exchClient.cWithdraw({ wei: 1 * 1e8 });
     * ```
     */
    async cWithdraw(params, opts) {
        const action = actionSorter.cWithdraw({
            type: "cWithdraw",
            hyperliquidChain: this._getHyperliquidChain(),
            signatureChainId: await this._getSignatureChainId(),
            nonce: await this.nonceManager(),
            ...params,
        });
        return await this._executeUserSignedAction({ action }, opts?.signal);
    }
    /**
     * Configure block type for EVM transactions.
     * @param params - Action-specific parameters.
     * @param opts - Request execution options.
     * @returns Response for creating a sub-account.
     *
     * @throws {ApiRequestError} When the API returns an unsuccessful response.
     * @throws {TransportError} When the transport layer throws an error.
     *
     * @see https://hyperliquid.gitbook.io/hyperliquid-docs/for-developers/hyperevm/dual-block-architecture
     * @example
     * ```ts
     * import * as hl from "@nktkas/hyperliquid";
     *
     * const privateKey = "0x..."; // `viem`, `ethers`, or private key directly`
     * const transport = new hl.HttpTransport(); // or `WebSocketTransport`
     * const exchClient = new hl.ExchangeClient({ wallet: privateKey, transport });
     *
     * const data = await exchClient.evmUserModify({ usingBigBlocks: true });
     * ```
     */
    async evmUserModify(params, opts) {
        const action = actionSorter.evmUserModify({
            type: "evmUserModify",
            ...params,
        });
        const expiresAfter = opts?.expiresAfter ?? await this._getDefaultExpiresAfter();
        return await this._executeL1Action({ action, expiresAfter }, opts?.signal);
    }
    /**
     * Modify an order.
     * @param params - Action-specific parameters.
     * @param opts - Request execution options.
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
     * const privateKey = "0x..."; // `viem`, `ethers`, or private key directly`
     * const transport = new hl.HttpTransport(); // or `WebSocketTransport`
     * const exchClient = new hl.ExchangeClient({ wallet: privateKey, transport });
     *
     * await exchClient.modify({
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
    async modify(params, opts) {
        const action = actionSorter.modify({
            type: "modify",
            ...params,
        });
        const vaultAddress = opts?.vaultAddress ?? this.defaultVaultAddress;
        const expiresAfter = opts?.expiresAfter ?? await this._getDefaultExpiresAfter();
        return await this._executeL1Action({ action, vaultAddress, expiresAfter }, opts?.signal);
    }
    /**
     * A multi-signature request.
     * @param params - Action-specific parameters.
     * @param opts - Request execution options.
     * @returns Any successful response.
     *
     * @throws {ApiRequestError} When the API returns an unsuccessful response.
     * @throws {TransportError} When the transport layer throws an error.
     *
     * @see https://hyperliquid.gitbook.io/hyperliquid-docs/hypercore/multi-sig
     * @example
     * ```ts
     * import * as hl from "@nktkas/hyperliquid";
     * import { actionSorter, signL1Action } from "@nktkas/hyperliquid/signing";
     * import { privateKeyToAccount } from "viem/accounts";
     *
     * const wallet = privateKeyToAccount("0x..."); // or any other wallet libraries
     * const multiSigUser = "0x...";
     *
     * const transport = new hl.HttpTransport(); // or `WebSocketTransport`
     * const exchClient = new hl.ExchangeClient({ wallet, transport });
     *
     * const nonce = Date.now();
     * const action = actionSorter.scheduleCancel({
     *   type: "scheduleCancel",
     *   time: Date.now() + 10000,
     * });
     *
     * // Create the required number of signatures
     * const signatures = await Promise.all(["0x...", "0x..."].map(async (signerPrivKey) => {
     *   return await signL1Action({
     *     wallet: signerPrivKey as `0x${string}`,
     *     action: [multiSigUser.toLowerCase(), wallet.address.toLowerCase(), action],
     *     nonce,
     *   });
     * }));
     *
     * // or user-signed action
     * // const signatures = await Promise.all(["0x...", "0x..."].map(async (signerPrivKey) => {
     * //   return await signUserSignedAction({
     * //     wallet: signerPrivKey as `0x${string}`,
     * //     action: {
     * //       ...action,
     * //       payloadMultiSigUser: multiSigUser,
     * //       outerSigner: wallet.address,
     * //     },
     * //     types: userSignedActionEip712Types[action.type],
     * //   });
     * // }));
     *
     * // Then use signatures in the `multiSig` action
     * const data = await exchClient.multiSig({
     *   signatures,
     *   payload: {
     *     multiSigUser,
     *     outerSigner: wallet.address,
     *     action,
     *   },
     *   nonce,
     * });
     * ```
     */
    async multiSig(params_and_nonce, opts) {
        const { nonce, ...params } = params_and_nonce;
        const action = actionSorter.multiSig({
            type: "multiSig",
            signatureChainId: await this._getSignatureChainId(),
            ...params,
        });
        const vaultAddress = opts?.vaultAddress ?? this.defaultVaultAddress;
        const expiresAfter = opts?.expiresAfter ?? await this._getDefaultExpiresAfter();
        return await this._executeMultiSigAction({ action, vaultAddress, expiresAfter, nonce }, opts?.signal);
    }
    /**
     * Place an order(s).
     * @param params - Action-specific parameters.
     * @param opts - Request execution options.
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
     * const privateKey = "0x..."; // `viem`, `ethers`, or private key directly`
     * const transport = new hl.HttpTransport(); // or `WebSocketTransport`
     * const exchClient = new hl.ExchangeClient({ wallet: privateKey, transport });
     *
     * const data = await exchClient.order({
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
    async order(params, opts) {
        const action = actionSorter.order({
            type: "order",
            ...params,
        });
        const vaultAddress = opts?.vaultAddress ?? this.defaultVaultAddress;
        const expiresAfter = opts?.expiresAfter ?? await this._getDefaultExpiresAfter();
        return await this._executeL1Action({ action, vaultAddress, expiresAfter }, opts?.signal);
    }
    /**
     * Deploying HIP-3 assets.
     * @param params - Action-specific parameters.
     * @param opts - Request execution options.
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
     * const privateKey = "0x..."; // `viem`, `ethers`, or private key directly`
     * const transport = new hl.HttpTransport(); // or `WebSocketTransport`
     * const exchClient = new hl.ExchangeClient({ wallet: privateKey, transport });
     *
     * await exchClient.perpDeploy({
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
     *     schema: null,
     *   },
     * });
     * ```
     */
    async perpDeploy(params, opts) {
        const action = actionSorter.perpDeploy({
            type: "perpDeploy",
            ...params,
        });
        const expiresAfter = opts?.expiresAfter ?? await this._getDefaultExpiresAfter();
        return await this._executeL1Action({ action, expiresAfter }, opts?.signal);
    }
    /**
     * Create a referral code.
     * @param params - Action-specific parameters.
     * @param opts - Request execution options.
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
     * const privateKey = "0x..."; // `viem`, `ethers`, or private key directly`
     * const transport = new hl.HttpTransport(); // or `WebSocketTransport`
     * const exchClient = new hl.ExchangeClient({ wallet: privateKey, transport });
     *
     * await exchClient.registerReferrer({ code: "..." });
     * ```
     */
    async registerReferrer(params, opts) {
        const action = actionSorter.registerReferrer({
            type: "registerReferrer",
            ...params,
        });
        const expiresAfter = opts?.expiresAfter ?? await this._getDefaultExpiresAfter();
        return await this._executeL1Action({ action, expiresAfter }, opts?.signal);
    }
    /**
     * Reserve additional rate-limited actions for a fee.
     * @param params - Action-specific parameters.
     * @param opts - Request execution options.
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
     * const privateKey = "0x..."; // `viem`, `ethers`, or private key directly`
     * const transport = new hl.HttpTransport(); // or `WebSocketTransport`
     * const exchClient = new hl.ExchangeClient({ wallet: privateKey, transport });
     *
     * await exchClient.reserveRequestWeight({ weight: 10 });
     * ```
     */
    async reserveRequestWeight(params, opts) {
        const action = actionSorter.reserveRequestWeight({
            type: "reserveRequestWeight",
            ...params,
        });
        const expiresAfter = opts?.expiresAfter ?? await this._getDefaultExpiresAfter();
        return await this._executeL1Action({ action, expiresAfter }, opts?.signal);
    }
    async scheduleCancel(params_or_opts, maybeOpts) {
        const isFirstArgParams = params_or_opts && "time" in params_or_opts;
        const params = isFirstArgParams ? params_or_opts : {};
        const opts = isFirstArgParams ? maybeOpts : params_or_opts;
        const action = actionSorter.scheduleCancel({
            type: "scheduleCancel",
            ...params,
        });
        const vaultAddress = opts?.vaultAddress ?? this.defaultVaultAddress;
        const expiresAfter = opts?.expiresAfter ?? await this._getDefaultExpiresAfter();
        return await this._executeL1Action({ action, vaultAddress, expiresAfter }, opts?.signal);
    }
    /**
     * Set the display name in the leaderboard.
     * @param params - Action-specific parameters.
     * @param opts - Request execution options.
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
     * const privateKey = "0x..."; // `viem`, `ethers`, or private key directly`
     * const transport = new hl.HttpTransport(); // or `WebSocketTransport`
     * const exchClient = new hl.ExchangeClient({ wallet: privateKey, transport });
     *
     * await exchClient.setDisplayName({ displayName: "..." });
     * ```
     */
    async setDisplayName(params, opts) {
        const action = actionSorter.setDisplayName({
            type: "setDisplayName",
            ...params,
        });
        const expiresAfter = opts?.expiresAfter ?? await this._getDefaultExpiresAfter();
        return await this._executeL1Action({ action, expiresAfter }, opts?.signal);
    }
    /**
     * Set a referral code.
     * @param params - Action-specific parameters.
     * @param opts - Request execution options.
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
     * const privateKey = "0x..."; // `viem`, `ethers`, or private key directly`
     * const transport = new hl.HttpTransport(); // or `WebSocketTransport`
     * const exchClient = new hl.ExchangeClient({ wallet: privateKey, transport });
     *
     * await exchClient.setReferrer({ code: "..." });
     * ```
     */
    async setReferrer(params, opts) {
        const action = actionSorter.setReferrer({
            type: "setReferrer",
            ...params,
        });
        const expiresAfter = opts?.expiresAfter ?? await this._getDefaultExpiresAfter();
        return await this._executeL1Action({ action, expiresAfter }, opts?.signal);
    }
    /**
     * Deploying HIP-1 and HIP-2 assets.
     * @param params - Action-specific parameters.
     * @param opts - Request execution options.
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
     * const privateKey = "0x..."; // `viem`, `ethers`, or private key directly`
     * const transport = new hl.HttpTransport(); // or `WebSocketTransport`
     * const exchClient = new hl.ExchangeClient({ wallet: privateKey, transport });
     *
     * await exchClient.spotDeploy({
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
    async spotDeploy(params, opts) {
        const action = actionSorter.spotDeploy({
            type: "spotDeploy",
            ...params,
        });
        const expiresAfter = opts?.expiresAfter ?? await this._getDefaultExpiresAfter();
        return await this._executeL1Action({ action, expiresAfter }, opts?.signal);
    }
    /**
     * Send spot assets to another address.
     * @param params - Action-specific parameters.
     * @param opts - Request execution options.
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
     * const privateKey = "0x..."; // `viem`, `ethers`, or private key directly`
     * const transport = new hl.HttpTransport(); // or `WebSocketTransport`
     * const exchClient = new hl.ExchangeClient({ wallet: privateKey, transport });
     *
     * await exchClient.spotSend({
     *   destination: "0x...",
     *   token: "USDC:0xeb62eee3685fc4c43992febcd9e75443",
     *   amount: "1",
     * });
     * ```
     */
    async spotSend(params, opts) {
        const action = actionSorter.spotSend({
            type: "spotSend",
            hyperliquidChain: this._getHyperliquidChain(),
            signatureChainId: await this._getSignatureChainId(),
            time: await this.nonceManager(),
            ...params,
        });
        return await this._executeUserSignedAction({ action }, opts?.signal);
    }
    /**
     * Opt Out of Spot Dusting.
     * @param params - Action-specific parameters.
     * @param opts - Request execution options.
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
     * const privateKey = "0x..."; // `viem`, `ethers`, or private key directly`
     * const transport = new hl.HttpTransport(); // or `WebSocketTransport`
     * const exchClient = new hl.ExchangeClient({ wallet: privateKey, transport });
     *
     * await exchClient.spotUser({ toggleSpotDusting: { optOut: false } });
     * ```
     */
    async spotUser(params, opts) {
        const action = actionSorter.spotUser({
            type: "spotUser",
            ...params,
        });
        const expiresAfter = opts?.expiresAfter ?? await this._getDefaultExpiresAfter();
        return await this._executeL1Action({ action, expiresAfter }, opts?.signal);
    }
    /**
     * Modify a sub-account's.
     * @param params - Action-specific parameters.
     * @param opts - Request execution options.
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
     * const privateKey = "0x..."; // `viem`, `ethers`, or private key directly`
     * const transport = new hl.HttpTransport(); // or `WebSocketTransport`
     * const exchClient = new hl.ExchangeClient({ wallet: privateKey, transport });
     *
     * await exchClient.subAccountModify({ subAccountUser: "0x...", name: "..."  });
     * ```
     */
    async subAccountModify(params, opts) {
        const action = actionSorter.subAccountModify({
            type: "subAccountModify",
            ...params,
        });
        const expiresAfter = opts?.expiresAfter ?? await this._getDefaultExpiresAfter();
        return await this._executeL1Action({ action, expiresAfter }, opts?.signal);
    }
    /**
     * Transfer between sub-accounts (spot).
     * @param params - Action-specific parameters.
     * @param opts - Request execution options.
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
     * const privateKey = "0x..."; // `viem`, `ethers`, or private key directly`
     * const transport = new hl.HttpTransport(); // or `WebSocketTransport`
     * const exchClient = new hl.ExchangeClient({ wallet: privateKey, transport });
     *
     * await exchClient.subAccountSpotTransfer({
     *   subAccountUser: "0x...",
     *   isDeposit: true,
     *   token: "USDC:0xeb62eee3685fc4c43992febcd9e75443",
     *   amount: "1",
     * });
     * ```
     */
    async subAccountSpotTransfer(params, opts) {
        const action = actionSorter.subAccountSpotTransfer({
            type: "subAccountSpotTransfer",
            ...params,
        });
        const expiresAfter = opts?.expiresAfter ?? await this._getDefaultExpiresAfter();
        return await this._executeL1Action({ action, expiresAfter }, opts?.signal);
    }
    /**
     * Transfer between sub-accounts (perpetual).
     * @param params - Action-specific parameters.
     * @param opts - Request execution options.
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
     * const privateKey = "0x..."; // `viem`, `ethers`, or private key directly`
     * const transport = new hl.HttpTransport(); // or `WebSocketTransport`
     * const exchClient = new hl.ExchangeClient({ wallet: privateKey, transport });
     *
     * await exchClient.subAccountTransfer({ subAccountUser: "0x...", isDeposit: true, usd: 1 * 1e6 });
     * ```
     */
    async subAccountTransfer(params, opts) {
        const action = actionSorter.subAccountTransfer({
            type: "subAccountTransfer",
            ...params,
        });
        const expiresAfter = opts?.expiresAfter ?? await this._getDefaultExpiresAfter();
        return await this._executeL1Action({ action, expiresAfter }, opts?.signal);
    }
    /**
     * Delegate or undelegate native tokens to or from a validator.
     * @param params - Action-specific parameters.
     * @param opts - Request execution options.
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
     * const privateKey = "0x..."; // `viem`, `ethers`, or private key directly`
     * const transport = new hl.HttpTransport(); // or `WebSocketTransport`
     * const exchClient = new hl.ExchangeClient({ wallet: privateKey, transport });
     *
     * await exchClient.tokenDelegate({ validator: "0x...", isUndelegate: true, wei: 1 * 1e8 });
     * ```
     */
    async tokenDelegate(params, opts) {
        const action = actionSorter.tokenDelegate({
            type: "tokenDelegate",
            hyperliquidChain: this._getHyperliquidChain(),
            signatureChainId: await this._getSignatureChainId(),
            nonce: await this.nonceManager(),
            ...params,
        });
        return await this._executeUserSignedAction({ action }, opts?.signal);
    }
    /**
     * Cancel a TWAP order.
     * @param params - Action-specific parameters.
     * @param opts - Request execution options.
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
     * const privateKey = "0x..."; // `viem`, `ethers`, or private key directly`
     * const transport = new hl.HttpTransport(); // or `WebSocketTransport`
     * const exchClient = new hl.ExchangeClient({ wallet: privateKey, transport });
     *
     * const data = await exchClient.twapCancel({ a: 0, t: 1 });
     * ```
     */
    async twapCancel(params, opts) {
        const action = actionSorter.twapCancel({
            type: "twapCancel",
            ...params,
        });
        const vaultAddress = opts?.vaultAddress ?? this.defaultVaultAddress;
        const expiresAfter = opts?.expiresAfter ?? await this._getDefaultExpiresAfter();
        return await this._executeL1Action({ action, vaultAddress, expiresAfter }, opts?.signal);
    }
    /**
     * Place a TWAP order.
     * @param params - Action-specific parameters.
     * @param opts - Request execution options.
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
     * const privateKey = "0x..."; // `viem`, `ethers`, or private key directly`
     * const transport = new hl.HttpTransport(); // or `WebSocketTransport`
     * const exchClient = new hl.ExchangeClient({ wallet: privateKey, transport });
     *
     * const data = await exchClient.twapOrder({
     *   twap: {
     *     a: 0,
     *     b: true,
     *     s: "1",
     *     r: false,
     *     m: 10,
     *     t: true,
     *   },
     * });
     * ```
     */
    async twapOrder(params, opts) {
        const action = actionSorter.twapOrder({
            type: "twapOrder",
            ...params,
        });
        const vaultAddress = opts?.vaultAddress ?? this.defaultVaultAddress;
        const expiresAfter = opts?.expiresAfter ?? await this._getDefaultExpiresAfter();
        return await this._executeL1Action({ action, vaultAddress, expiresAfter }, opts?.signal);
    }
    /**
     * Add or remove margin from isolated position.
     * @param params - Action-specific parameters.
     * @param opts - Request execution options.
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
     * const privateKey = "0x..."; // `viem`, `ethers`, or private key directly`
     * const transport = new hl.HttpTransport(); // or `WebSocketTransport`
     * const exchClient = new hl.ExchangeClient({ wallet: privateKey, transport });
     *
     * await exchClient.updateIsolatedMargin({ asset: 0, isBuy: true, ntli: 1 * 1e6 });
     * ```
     */
    async updateIsolatedMargin(params, opts) {
        const action = actionSorter.updateIsolatedMargin({
            type: "updateIsolatedMargin",
            ...params,
        });
        const vaultAddress = opts?.vaultAddress ?? this.defaultVaultAddress;
        const expiresAfter = opts?.expiresAfter ?? await this._getDefaultExpiresAfter();
        return await this._executeL1Action({ action, vaultAddress, expiresAfter }, opts?.signal);
    }
    /**
     * Update cross or isolated leverage on a coin.
     * @param params - Action-specific parameters.
     * @param opts - Request execution options.
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
     * const privateKey = "0x..."; // `viem`, `ethers`, or private key directly`
     * const transport = new hl.HttpTransport(); // or `WebSocketTransport`
     * const exchClient = new hl.ExchangeClient({ wallet: privateKey, transport });
     *
     * await exchClient.updateLeverage({ asset: 0, isCross: true, leverage: 5 });
     * ```
     */
    async updateLeverage(params, opts) {
        const action = actionSorter.updateLeverage({
            type: "updateLeverage",
            ...params,
        });
        const vaultAddress = opts?.vaultAddress ?? this.defaultVaultAddress;
        const expiresAfter = opts?.expiresAfter ?? await this._getDefaultExpiresAfter();
        return await this._executeL1Action({ action, vaultAddress, expiresAfter }, opts?.signal);
    }
    /**
     * Transfer funds between Spot account and Perp account.
     * @param params - Action-specific parameters.
     * @param opts - Request execution options.
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
     * const privateKey = "0x..."; // `viem`, `ethers`, or private key directly`
     * const transport = new hl.HttpTransport(); // or `WebSocketTransport`
     * const exchClient = new hl.ExchangeClient({ wallet: privateKey, transport });
     *
     * await exchClient.usdClassTransfer({ amount: "1", toPerp: true });
     * ```
     */
    async usdClassTransfer(params, opts) {
        const action = actionSorter.usdClassTransfer({
            type: "usdClassTransfer",
            hyperliquidChain: this._getHyperliquidChain(),
            signatureChainId: await this._getSignatureChainId(),
            nonce: await this.nonceManager(),
            ...params,
        });
        return await this._executeUserSignedAction({ action }, opts?.signal);
    }
    /**
     * Send usd to another address.
     * @param params - Action-specific parameters.
     * @param opts - Request execution options.
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
     * const privateKey = "0x..."; // `viem`, `ethers`, or private key directly`
     * const transport = new hl.HttpTransport(); // or `WebSocketTransport`
     * const exchClient = new hl.ExchangeClient({ wallet: privateKey, transport });
     *
     * await exchClient.usdSend({ destination: "0x...", amount: "1" });
     * ```
     */
    async usdSend(params, opts) {
        const action = actionSorter.usdSend({
            type: "usdSend",
            hyperliquidChain: this._getHyperliquidChain(),
            signatureChainId: await this._getSignatureChainId(),
            time: await this.nonceManager(),
            ...params,
        });
        return await this._executeUserSignedAction({ action }, opts?.signal);
    }
    /**
     * Distribute funds from a vault between followers.
     * @param params - Action-specific parameters.
     * @param opts - Request execution options.
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
     * const privateKey = "0x..."; // `viem`, `ethers`, or private key directly`
     * const transport = new hl.HttpTransport(); // or `WebSocketTransport`
     * const exchClient = new hl.ExchangeClient({ wallet: privateKey, transport });
     *
     * await exchClient.vaultDistribute({ vaultAddress: "0x...", usd: 10 * 1e6 });
     * ```
     */
    async vaultDistribute(params, opts) {
        const action = actionSorter.vaultDistribute({
            type: "vaultDistribute",
            ...params,
        });
        const expiresAfter = opts?.expiresAfter ?? await this._getDefaultExpiresAfter();
        return await this._executeL1Action({ action, expiresAfter }, opts?.signal);
    }
    /**
     * Modify a vault's configuration.
     * @param params - Action-specific parameters.
     * @param opts - Request execution options.
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
     * const privateKey = "0x..."; // `viem`, `ethers`, or private key directly`
     * const transport = new hl.HttpTransport(); // or `WebSocketTransport`
     * const exchClient = new hl.ExchangeClient({ wallet: privateKey, transport });
     *
     * await exchClient.vaultModify({
     *   vaultAddress: "0x...",
     *   allowDeposits: true,
     *   alwaysCloseOnWithdraw: false,
     * });
     * ```
     */
    async vaultModify(params, opts) {
        const action = actionSorter.vaultModify({
            type: "vaultModify",
            ...params,
        });
        const expiresAfter = opts?.expiresAfter ?? await this._getDefaultExpiresAfter();
        return await this._executeL1Action({ action, expiresAfter }, opts?.signal);
    }
    /**
     * Deposit or withdraw from a vault.
     * @param params - Action-specific parameters.
     * @param opts - Request execution options.
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
     * const privateKey = "0x..."; // `viem`, `ethers`, or private key directly`
     * const transport = new hl.HttpTransport(); // or `WebSocketTransport`
     * const exchClient = new hl.ExchangeClient({ wallet: privateKey, transport });
     *
     * await exchClient.vaultTransfer({ vaultAddress: "0x...", isDeposit: true, usd: 10 * 1e6 });
     * ```
     */
    async vaultTransfer(params, opts) {
        const action = actionSorter.vaultTransfer({
            type: "vaultTransfer",
            ...params,
        });
        const expiresAfter = opts?.expiresAfter ?? await this._getDefaultExpiresAfter();
        return await this._executeL1Action({ action, expiresAfter }, opts?.signal);
    }
    /**
     * Initiate a withdrawal request.
     * @param params - Action-specific parameters.
     * @param opts - Request execution options.
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
     * const privateKey = "0x..."; // `viem`, `ethers`, or private key directly`
     * const transport = new hl.HttpTransport(); // or `WebSocketTransport`
     * const exchClient = new hl.ExchangeClient({ wallet: privateKey, transport });
     *
     * await exchClient.withdraw3({ destination: "0x...", amount: "1" });
     * ```
     */
    async withdraw3(params, opts) {
        const action = actionSorter.withdraw3({
            type: "withdraw3",
            hyperliquidChain: this._getHyperliquidChain(),
            signatureChainId: await this._getSignatureChainId(),
            time: await this.nonceManager(),
            ...params,
        });
        return await this._executeUserSignedAction({ action }, opts?.signal);
    }
    async _executeL1Action(request, signal) {
        const { action, vaultAddress, expiresAfter } = request;
        // Sign an L1 action
        const nonce = await this.nonceManager();
        const signature = await signL1Action({
            wallet: this.wallet,
            action,
            nonce,
            isTestnet: this.isTestnet,
            vaultAddress,
            expiresAfter,
        });
        // Send a request
        const response = await this.transport.request("exchange", { action, signature, nonce, vaultAddress, expiresAfter }, signal);
        this._validateResponse(response);
        return response;
    }
    async _executeUserSignedAction(request, signal) {
        const { action } = request;
        // Sign a user-signed action
        const nonce = "nonce" in action ? action.nonce : action.time;
        const signature = await signUserSignedAction({
            wallet: this.wallet,
            action,
            types: userSignedActionEip712Types[action.type],
        });
        // Send a request
        const response = await this.transport.request("exchange", { action, signature, nonce }, signal);
        this._validateResponse(response);
        return response;
    }
    async _executeMultiSigAction(request, signal) {
        const { action, nonce, vaultAddress, expiresAfter } = request;
        // Sign a multi-signature action
        const signature = await signMultiSigAction({
            wallet: this.wallet,
            action,
            nonce,
            isTestnet: this.isTestnet,
            vaultAddress,
            expiresAfter,
        });
        // Send a request
        const response = await this.transport.request("exchange", { action, signature, nonce, vaultAddress, expiresAfter }, signal);
        this._validateResponse(response);
        return response;
    }
    async _getDefaultExpiresAfter() {
        return typeof this.defaultExpiresAfter === "number"
            ? this.defaultExpiresAfter
            : await this.defaultExpiresAfter?.();
    }
    async _getSignatureChainId() {
        return typeof this.signatureChainId === "string" ? this.signatureChainId : await this.signatureChainId();
    }
    _getHyperliquidChain() {
        return this.isTestnet ? "Testnet" : "Mainnet";
    }
    _validateResponse(response) {
        if (response.status === "err") {
            throw new ApiRequestError(response);
        }
        else if (response.response.type === "order" || response.response.type === "cancel") {
            if (response.response.data.statuses.some((status) => typeof status === "object" && "error" in status)) {
                throw new ApiRequestError(response);
            }
        }
        else if (response.response.type === "twapOrder" || response.response.type === "twapCancel") {
            if (typeof response.response.data.status === "object" && "error" in response.response.data.status) {
                throw new ApiRequestError(response);
            }
        }
    }
    async [Symbol.asyncDispose]() {
        await this.transport[Symbol.asyncDispose]?.();
    }
}
