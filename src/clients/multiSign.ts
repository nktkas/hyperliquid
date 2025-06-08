import type { Hex } from "../base.ts";
import type { IRequestTransport } from "../transports/base.ts";
import type {
    ApproveAgentRequest,
    ApproveBuilderFeeRequest,
    BaseExchangeRequest,
    BatchModifyRequest,
    CancelByCloidRequest,
    CancelRequest,
    CDepositRequest,
    ClaimRewardsRequest,
    ConvertToMultiSigUserRequest,
    CreateSubAccountRequest,
    CreateVaultRequest,
    CSignerActionRequest_JailSelf,
    CSignerActionRequest_UnjailSelf,
    CValidatorActionRequest_ChangeProfile,
    CValidatorActionRequest_Register,
    CValidatorActionRequest_Unregister,
    CWithdrawRequest,
    EvmUserModifyRequest,
    ModifyRequest,
    OrderRequest,
    PerpDeployRequest_RegisterAsset,
    PerpDeployRequest_SetOracle,
    PerpDexClassTransferRequest,
    RegisterReferrerRequest,
    ReserveRequestWeightRequest,
    ScheduleCancelRequest,
    SetDisplayNameRequest,
    SetReferrerRequest,
    SpotDeployRequest_Genesis,
    SpotDeployRequest_RegisterHyperliquidity,
    SpotDeployRequest_RegisterSpot,
    SpotDeployRequest_RegisterToken2,
    SpotDeployRequest_SetDeployerTradingFeeShare,
    SpotDeployRequest_UserGenesis,
    SpotSendRequest,
    SpotUserRequest,
    SubAccountSpotTransferRequest,
    SubAccountTransferRequest,
    TokenDelegateRequest,
    TwapCancelRequest,
    TwapOrderRequest,
    UpdateIsolatedMarginRequest,
    UpdateLeverageRequest,
    UsdClassTransferRequest,
    UsdSendRequest,
    VaultDistributeRequest,
    VaultModifyRequest,
    VaultTransferRequest,
    Withdraw3Request,
} from "../types/exchange/requests.ts";
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
    type Signature,
    signL1Action,
    signUserSignedAction,
    userSignedActionEip712Types,
} from "../signing.ts";
import {
    type CancelResponseSuccess,
    type CSignerActionParameters,
    type CSignerActionParameters_JailSelf,
    type CSignerActionParameters_UnjailSelf,
    type CValidatorActionParameters,
    type CValidatorActionParameters_ChangeProfile,
    type CValidatorActionParameters_Register,
    type CValidatorActionParameters_Unregister,
    ExchangeClient,
    type ExchangeClientParameters,
    type OrderResponseSuccess,
    type PerpDeployParameters,
    type PerpDeployParameters_RegisterAsset,
    type PerpDeployParameters_SetOracle,
    type ScheduleCancelParameters,
    type SpotDeployParameters,
    type SpotDeployParameters_Genesis,
    type SpotDeployParameters_RegisterHyperliquidity,
    type SpotDeployParameters_RegisterSpot,
    type SpotDeployParameters_RegisterToken2,
    type SpotDeployParameters_SetDeployerTradingFeeShare,
    type SpotDeployParameters_UserGenesis,
    type TwapCancelResponseSuccess,
    type TwapOrderResponseSuccess,
} from "./exchange.ts";

/** Parameters for the {@linkcode MultiSignClient} constructor. */
export interface MultiSignClientParameters<
    T extends IRequestTransport = IRequestTransport,
    S extends readonly [AbstractWalletWithAddress, ...AbstractWallet[]] = [
        AbstractWalletWithAddress,
        ...AbstractWallet[],
    ],
> extends Omit<ExchangeClientParameters<T, S[0]>, "wallet"> {
    /** The multi-signature account address. */
    multiSignAddress: Hex;
    /** Array of wallets used for multi-signature operations. The first wallet acts as the leader. */
    signers: S;
}

/** Abstract interface for a wallet that can sign typed data and has wallet address. */
export type AbstractWalletWithAddress =
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
    S extends readonly [AbstractWalletWithAddress, ...AbstractWallet[]] = [
        AbstractWalletWithAddress,
        ...AbstractWallet[],
    ],
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
     * import { privateKeyToAccount } from "viem/accounts";
     *
     * const multiSignAddress = "0x...";
     * const signers = [
     *   privateKeyToAccount("0x..."), // first is leader
     *   privateKeyToAccount("0x..."),
     *   privateKeyToAccount("0x..."),
     * ];
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
     * const multiSignAddress = "0x...";
     * const signers = [
     *   privateKeyToAccount("0x..."), // first is leader
     *   privateKeyToAccount("0x..."),
     *   // ...
     *   privateKeyToAccount("0x..."),
     * ];
     *
     * const transport = new hl.HttpTransport(); // or WebSocketTransport
     * const multiSignClient = new hl.MultiSignClient({ transport, multiSignAddress, signers });
     *
     * const data = await multiSignClient.approveAgent({ agentAddress: "0x...", agentName: "agentName" });
     * ```
     */
    override async approveAgent(
        ...[args, signal]: Parameters<ExchangeClient["approveAgent"]>
    ): ReturnType<ExchangeClient["approveAgent"]> {
        // Destructure the parameters
        const { ...actionArgs } = args;

        // Construct an action
        const nonce = await this.nonceManager();
        const action: ApproveAgentRequest["action"] = {
            ...actionArgs,
            agentName: args.agentName ?? "",
            type: "approveAgent",
            hyperliquidChain: this._getHyperliquidChain(),
            signatureChainId: await this._getSignatureChainId(),
            nonce,
        };

        // Sign the action
        const sortedAction = actionSorter[action.type](action);
        const outerSigner = await this._getWalletAddress(this.signers[0]);

        const signatures = await this._multiSignUserSignedAction(sortedAction, outerSigner);
        if (sortedAction.agentName === "") sortedAction.agentName = null;

        // Send a multi-sig action
        return super.multiSig({
            signatures,
            payload: {
                multiSigUser: this.multiSignAddress,
                outerSigner,
                action: sortedAction,
            },
            nonce,
        }, signal);
    }

    /**
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
     * const multiSignAddress = "0x...";
     * const signers = [
     *   privateKeyToAccount("0x..."), // first is leader
     *   privateKeyToAccount("0x..."),
     *   // ...
     *   privateKeyToAccount("0x..."),
     * ];
     *
     * const transport = new hl.HttpTransport(); // or WebSocketTransport
     * const multiSignClient = new hl.MultiSignClient({ transport, multiSignAddress, signers });
     *
     * const data = await multiSignClient.approveBuilderFee({ maxFeeRate: "0.01%", builder: "0x..." });
     * ```
     */
    override async approveBuilderFee(
        ...[args, signal]: Parameters<ExchangeClient["approveBuilderFee"]>
    ): ReturnType<ExchangeClient["approveBuilderFee"]> {
        // Destructure the parameters
        const { ...actionArgs } = args;

        // Construct an action
        const nonce = await this.nonceManager();
        const action: ApproveBuilderFeeRequest["action"] = {
            ...actionArgs,
            type: "approveBuilderFee",
            hyperliquidChain: this._getHyperliquidChain(),
            signatureChainId: await this._getSignatureChainId(),
            nonce,
        };

        // Sign the action
        const sortedAction = actionSorter[action.type](action);
        const outerSigner = await this._getWalletAddress(this.signers[0]);

        const signatures = await this._multiSignUserSignedAction(sortedAction, outerSigner);

        // Send a multi-sig action
        return super.multiSig({
            signatures,
            payload: {
                multiSigUser: this.multiSignAddress,
                outerSigner,
                action: sortedAction,
            },
            nonce,
        }, signal);
    }

    /**
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
     * const multiSignAddress = "0x...";
     * const signers = [
     *   privateKeyToAccount("0x..."), // first is leader
     *   privateKeyToAccount("0x..."),
     *   // ...
     *   privateKeyToAccount("0x..."),
     * ];
     *
     * const transport = new hl.HttpTransport(); // or WebSocketTransport
     * const multiSignClient = new hl.MultiSignClient({ transport, multiSignAddress, signers });
     *
     * const data = await multiSignClient.batchModify({
     *   modifies: [{
     *     oid: 123,
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
     *       c: "0x...", // Client Order ID (optional)
     *     },
     *   }],
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
        const action: BatchModifyRequest["action"] = {
            type: "batchModify",
            ...actionArgs,
        };

        // Send a multi-sig action
        const sortedAction = actionSorter[action.type](action);
        const outerSigner = await this._getWalletAddress(this.signers[0]);

        const signatures = await this._multiSignL1Action({
            action: sortedAction,
            nonce,
            outerSigner,
            vaultAddress,
            expiresAfter,
        });

        // Send a multi-sig action
        return super.multiSig({
            signatures,
            payload: {
                multiSigUser: this.multiSignAddress,
                outerSigner,
                action: sortedAction,
            },
            nonce,
            vaultAddress,
            expiresAfter,
        }, signal);
    }

    /**
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
     * const multiSignAddress = "0x...";
     * const signers = [
     *   privateKeyToAccount("0x..."), // first is leader
     *   privateKeyToAccount("0x..."),
     *   // ...
     *   privateKeyToAccount("0x..."),
     * ];
     *
     * const transport = new hl.HttpTransport(); // or WebSocketTransport
     * const multiSignClient = new hl.MultiSignClient({ transport, multiSignAddress, signers });
     *
     * const data = await multiSignClient.cancel({
     *   cancels: [{
     *     a: 0, // Asset index
     *     o: 123, // Order ID
     *   }],
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
        const action: CancelRequest["action"] = {
            type: "cancel",
            ...actionArgs,
        };

        // Send a multi-sig action
        const sortedAction = actionSorter[action.type](action);
        const outerSigner = await this._getWalletAddress(this.signers[0]);

        const signatures = await this._multiSignL1Action({
            action: sortedAction,
            nonce,
            outerSigner,
            vaultAddress,
            expiresAfter,
        });

        // Send a multi-sig action
        return super.multiSig({
            signatures,
            payload: {
                multiSigUser: this.multiSignAddress,
                outerSigner,
                action: sortedAction,
            },
            nonce,
            vaultAddress,
            expiresAfter,
        }, signal);
    }

    /**
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
     * const multiSignAddress = "0x...";
     * const signers = [
     *   privateKeyToAccount("0x..."), // first is leader
     *   privateKeyToAccount("0x..."),
     *   // ...
     *   privateKeyToAccount("0x..."),
     * ];
     *
     * const transport = new hl.HttpTransport(); // or WebSocketTransport
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
        const action: CancelByCloidRequest["action"] = {
            type: "cancelByCloid",
            ...actionArgs,
        };

        // Send a multi-sig action
        const sortedAction = actionSorter[action.type](action);
        const outerSigner = await this._getWalletAddress(this.signers[0]);

        const signatures = await this._multiSignL1Action({
            action: sortedAction,
            nonce,
            outerSigner,
            vaultAddress,
            expiresAfter,
        });

        // Send a multi-sig action
        return super.multiSig({
            signatures,
            payload: {
                multiSigUser: this.multiSignAddress,
                outerSigner,
                action: sortedAction,
            },
            nonce,
            vaultAddress,
            expiresAfter,
        }, signal);
    }

    /**
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
     * const multiSignAddress = "0x...";
     * const signers = [
     *   privateKeyToAccount("0x..."), // first is leader
     *   privateKeyToAccount("0x..."),
     *   // ...
     *   privateKeyToAccount("0x..."),
     * ];
     *
     * const transport = new hl.HttpTransport(); // or WebSocketTransport
     * const multiSignClient = new hl.MultiSignClient({ transport, multiSignAddress, signers });
     *
     * const data = await multiSignClient.cDeposit({ wei: 1 * 1e8 });
     * ```
     */
    override async cDeposit(
        ...[args, signal]: Parameters<ExchangeClient["cDeposit"]>
    ): ReturnType<ExchangeClient["cDeposit"]> {
        // Destructure the parameters
        const { ...actionArgs } = args;

        // Construct an action
        const nonce = await this.nonceManager();
        const action: CDepositRequest["action"] = {
            ...actionArgs,
            type: "cDeposit",
            hyperliquidChain: this._getHyperliquidChain(),
            signatureChainId: await this._getSignatureChainId(),
            nonce,
        };

        // Sign the action
        const sortedAction = actionSorter[action.type](action);
        const outerSigner = await this._getWalletAddress(this.signers[0]);

        const signatures = await this._multiSignUserSignedAction(sortedAction, outerSigner);

        // Send a multi-sig action
        return super.multiSig({
            signatures,
            payload: {
                multiSigUser: this.multiSignAddress,
                outerSigner,
                action: sortedAction,
            },
            nonce,
        }, signal);
    }

    /**
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
     * const multiSignAddress = "0x...";
     * const signers = [
     *   privateKeyToAccount("0x..."), // first is leader
     *   privateKeyToAccount("0x..."),
     *   // ...
     *   privateKeyToAccount("0x..."),
     * ];
     *
     * const transport = new hl.HttpTransport(); // or WebSocketTransport
     * const multiSignClient = new hl.MultiSignClient({ transport, multiSignAddress, signers });
     *
     * const data = await multiSignClient.claimRewards();
     * ```
     */
    override async claimRewards(
        ...[signal]: Parameters<ExchangeClient["claimRewards"]>
    ): ReturnType<ExchangeClient["claimRewards"]> {
        // Construct an action
        const nonce = await this.nonceManager();
        const action: ClaimRewardsRequest["action"] = {
            type: "claimRewards",
        };

        // Send a multi-sig action
        const sortedAction = actionSorter[action.type](action);
        const outerSigner = await this._getWalletAddress(this.signers[0]);

        const signatures = await this._multiSignL1Action({ action: sortedAction, nonce, outerSigner });

        // Send a multi-sig action
        return super.multiSig({
            signatures,
            payload: {
                multiSigUser: this.multiSignAddress,
                outerSigner,
                action: sortedAction,
            },
            nonce,
        }, signal);
    }

    /**
     * @param args - The parameters for the request.
     * @param signal - An optional abort signal.
     * @returns Successful response without specific data.
     * @throws {ApiRequestError} When the API returns an error response.
     *
     * @see https://hyperliquid.gitbook.io/hyperliquid-docs/hypercore/multi-sig
     * @example
     * ```ts
     * import * as hl from "@nktkas/hyperliquid";
     * import { privateKeyToAccount } from "viem/accounts";
     *
     * const multiSignAddress = "0x...";
     * const signers = [
     *   privateKeyToAccount("0x..."), // first is leader
     *   privateKeyToAccount("0x..."),
     *   // ...
     *   privateKeyToAccount("0x..."),
     * ];
     *
     * const transport = new hl.HttpTransport(); // or WebSocketTransport
     * const multiSignClient = new hl.MultiSignClient({ transport, multiSignAddress, signers });
     *
     * const data = await multiSignClient.convertToMultiSigUser({ // convert to normal user
     *   authorizedUsers: [],
     *   threshold: 0,
     * });
     * ```
     */
    override async convertToMultiSigUser(
        ...[args, signal]: Parameters<ExchangeClient["convertToMultiSigUser"]>
    ): ReturnType<ExchangeClient["convertToMultiSigUser"]> {
        // Destructure the parameters
        const { ...actionArgs } = args;

        // Construct an action
        const nonce = await this.nonceManager();
        const action: ConvertToMultiSigUserRequest["action"] = {
            type: "convertToMultiSigUser",
            hyperliquidChain: this._getHyperliquidChain(),
            signatureChainId: await this._getSignatureChainId(),
            signers: JSON.stringify(actionArgs),
            nonce,
        };

        // Sign the action
        const sortedAction = actionSorter[action.type](action);
        const outerSigner = await this._getWalletAddress(this.signers[0]);

        const signatures = await this._multiSignUserSignedAction(sortedAction, outerSigner);

        // Send a multi-sig action
        return super.multiSig({
            signatures,
            payload: {
                multiSigUser: this.multiSignAddress,
                outerSigner,
                action: sortedAction,
            },
            nonce,
        }, signal);
    }

    /**
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
     * const multiSignAddress = "0x...";
     * const signers = [
     *   privateKeyToAccount("0x..."), // first is leader
     *   privateKeyToAccount("0x..."),
     *   // ...
     *   privateKeyToAccount("0x..."),
     * ];
     *
     * const transport = new hl.HttpTransport(); // or WebSocketTransport
     * const multiSignClient = new hl.MultiSignClient({ transport, multiSignAddress, signers });
     *
     * const data = await multiSignClient.createSubAccount({ name: "subAccountName" });
     * ```
     */
    override async createSubAccount(
        ...[args, signal]: Parameters<ExchangeClient["createSubAccount"]>
    ): ReturnType<ExchangeClient["createSubAccount"]> {
        // Destructure the parameters
        const { ...actionArgs } = args;

        // Construct an action
        const nonce = await this.nonceManager();
        const action: CreateSubAccountRequest["action"] = {
            type: "createSubAccount",
            ...actionArgs,
        };

        // Send a multi-sig action
        const sortedAction = actionSorter[action.type](action);
        const outerSigner = await this._getWalletAddress(this.signers[0]);

        const signatures = await this._multiSignL1Action({ action: sortedAction, nonce, outerSigner });

        // Send a multi-sig action
        return super.multiSig({
            signatures,
            payload: {
                multiSigUser: this.multiSignAddress,
                outerSigner,
                action: sortedAction,
            },
            nonce,
        }, signal);
    }

    /**
     * @param args - The parameters for the request.
     * @param signal - An optional abort signal.
     * @returns Response for creating a vault.
     * @throws {ApiRequestError} When the API returns an error response.
     *
     * @see null - no documentation
     * @example
     * ```ts
     * import * as hl from "@nktkas/hyperliquid";
     * import { privateKeyToAccount } from "viem/accounts";
     *
     * const multiSignAddress = "0x...";
     * const signers = [
     *   privateKeyToAccount("0x..."), // first is leader
     *   privateKeyToAccount("0x..."),
     *   // ...
     *   privateKeyToAccount("0x..."),
     * ];
     *
     * const transport = new hl.HttpTransport(); // or WebSocketTransport
     * const multiSignClient = new hl.MultiSignClient({ transport, multiSignAddress, signers });
     *
     * const data = await multiSignClient.createVault({
     *   name: "VaultName",
     *   description: "Vault description",
     *   initialUsd: 100 * 1e6,
     * });
     * ```
     */
    override async createVault(
        ...[args, signal]: Parameters<ExchangeClient["createVault"]>
    ): ReturnType<ExchangeClient["createVault"]> {
        // Destructure the parameters
        const { ...actionArgs } = args;

        // Construct an action
        const nonce = await this.nonceManager();
        const action: CreateVaultRequest["action"] = {
            type: "createVault",
            nonce,
            ...actionArgs,
        };

        // Send a multi-sig action
        const sortedAction = actionSorter[action.type](action);
        const outerSigner = await this._getWalletAddress(this.signers[0]);

        const signatures = await this._multiSignL1Action({ action: sortedAction, nonce, outerSigner });

        // Send a multi-sig action
        return super.multiSig({
            signatures,
            payload: {
                multiSigUser: this.multiSignAddress,
                outerSigner,
                action: sortedAction,
            },
            nonce,
        }, signal);
    }

    /**
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
     * const multiSignAddress = "0x...";
     * const signers = [
     *   privateKeyToAccount("0x..."), // first is leader
     *   privateKeyToAccount("0x..."),
     *   // ...
     *   privateKeyToAccount("0x..."),
     * ];
     *
     * const transport = new hl.HttpTransport(); // or WebSocketTransport
     * const multiSignClient = new hl.MultiSignClient({ transport, multiSignAddress, signers });
     *
     * // Jail self
     * const data = await multiSignClient.cSignerAction({ jailSelf: null });
     *
     * // Unjail self
     * const data = await multiSignClient.cSignerAction({ unjailSelf: null });
     * ```
     */
    override async cSignerAction(
        args: CSignerActionParameters_JailSelf,
        signal?: AbortSignal,
    ): ReturnType<ExchangeClient["cSignerAction"]>;
    override async cSignerAction(
        args: CSignerActionParameters_UnjailSelf,
        signal?: AbortSignal,
    ): ReturnType<ExchangeClient["cSignerAction"]>;
    override async cSignerAction(
        args: CSignerActionParameters,
        signal?: AbortSignal,
    ): ReturnType<ExchangeClient["cSignerAction"]> {
        // Destructure the parameters
        const {
            expiresAfter = await this._getDefaultExpiresAfter(),
            ...actionArgs
        } = args;

        // Construct an action
        const nonce = await this.nonceManager();
        const action: CSignerActionRequest_JailSelf["action"] | CSignerActionRequest_UnjailSelf["action"] = {
            type: "CSignerAction",
            ...actionArgs,
        };

        // Send a multi-sig action
        const sortedAction = actionSorter[action.type](action);
        const outerSigner = await this._getWalletAddress(this.signers[0]);

        const signatures = await this._multiSignL1Action({ action: sortedAction, nonce, outerSigner, expiresAfter });

        // Send a multi-sig action
        return super.multiSig({
            signatures,
            payload: {
                multiSigUser: this.multiSignAddress,
                outerSigner,
                action: sortedAction,
            },
            nonce,
            expiresAfter,
        }, signal);
    }

    /**
     * @param args - The parameters for the request.
     * @param signal - An optional abort signal.
     * @returns Successful response without specific data.
     * @throws {ApiRequestError} When the API returns an error response.
     *
     * @example
     * ```ts
     * import * as hl from "@nktkas/hyperliquid";
     * import { privateKeyToAccount } from "viem/accounts";
     *
     * const multiSignAddress = "0x...";
     * const signers = [
     *   privateKeyToAccount("0x..."), // first is leader
     *   privateKeyToAccount("0x..."),
     *   // ...
     *   privateKeyToAccount("0x..."),
     * ];
     *
     * const transport = new hl.HttpTransport(); // or WebSocketTransport
     * const multiSignClient = new hl.MultiSignClient({ transport, multiSignAddress, signers });
     *
     * // Change validator profile
     * const data = await multiSignClient.cValidatorAction({
     *   changeProfile: {
     *     name: "My Validator",
     *     description: "Validator description",
     *     unjailed: true,
     *   }
     * });
     * ```
     */
    override async cValidatorAction(
        args: CValidatorActionParameters_ChangeProfile,
        signal?: AbortSignal,
    ): ReturnType<ExchangeClient["cSignerAction"]>;
    override async cValidatorAction(
        args: CValidatorActionParameters_Register,
        signal?: AbortSignal,
    ): ReturnType<ExchangeClient["cSignerAction"]>;
    override async cValidatorAction(
        args: CValidatorActionParameters_Unregister,
        signal?: AbortSignal,
    ): ReturnType<ExchangeClient["cSignerAction"]>;
    override async cValidatorAction(
        args: CValidatorActionParameters,
        signal?: AbortSignal,
    ): ReturnType<ExchangeClient["cSignerAction"]> {
        // Destructure the parameters
        const {
            expiresAfter = await this._getDefaultExpiresAfter(),
            ...actionArgs
        } = args;

        // Construct an action
        const nonce = await this.nonceManager();
        const action:
            | CValidatorActionRequest_ChangeProfile["action"]
            | CValidatorActionRequest_Register["action"]
            | CValidatorActionRequest_Unregister["action"] = {
                type: "CValidatorAction",
                ...actionArgs,
            };

        // Send a multi-sig action
        const sortedAction = actionSorter[action.type](action);
        const outerSigner = await this._getWalletAddress(this.signers[0]);

        const signatures = await this._multiSignL1Action({ action: sortedAction, nonce, outerSigner, expiresAfter });

        // Send a multi-sig action
        return super.multiSig({
            signatures,
            payload: {
                multiSigUser: this.multiSignAddress,
                outerSigner,
                action: sortedAction,
            },
            nonce,
            expiresAfter,
        }, signal);
    }

    /**
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
     * const multiSignAddress = "0x...";
     * const signers = [
     *   privateKeyToAccount("0x..."), // first is leader
     *   privateKeyToAccount("0x..."),
     *   // ...
     *   privateKeyToAccount("0x..."),
     * ];
     *
     * const transport = new hl.HttpTransport(); // or WebSocketTransport
     * const multiSignClient = new hl.MultiSignClient({ transport, multiSignAddress, signers });
     *
     * const data = await multiSignClient.cWithdraw({ wei: 1 * 1e8 });
     * ```
     */
    override async cWithdraw(
        ...[args, signal]: Parameters<ExchangeClient["cWithdraw"]>
    ): ReturnType<ExchangeClient["cWithdraw"]> {
        // Destructure the parameters
        const { ...actionArgs } = args;

        // Construct an action
        const nonce = await this.nonceManager();
        const action: CWithdrawRequest["action"] = {
            ...actionArgs,
            type: "cWithdraw",
            hyperliquidChain: this._getHyperliquidChain(),
            signatureChainId: await this._getSignatureChainId(),
            nonce,
        };

        // Sign the action
        const sortedAction = actionSorter[action.type](action);
        const outerSigner = await this._getWalletAddress(this.signers[0]);

        const signatures = await this._multiSignUserSignedAction(sortedAction, outerSigner);

        // Send a multi-sig action
        return super.multiSig({
            signatures,
            payload: {
                multiSigUser: this.multiSignAddress,
                outerSigner,
                action: sortedAction,
            },
            nonce,
        }, signal);
    }

    /**
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
     * const multiSignAddress = "0x...";
     * const signers = [
     *   privateKeyToAccount("0x..."), // first is leader
     *   privateKeyToAccount("0x..."),
     *   // ...
     *   privateKeyToAccount("0x..."),
     * ];
     *
     * const transport = new hl.HttpTransport(); // or WebSocketTransport
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
        const action: EvmUserModifyRequest["action"] = {
            type: "evmUserModify",
            ...actionArgs,
        };

        // Send a multi-sig action
        const sortedAction = actionSorter[action.type](action);
        const outerSigner = await this._getWalletAddress(this.signers[0]);

        const signatures = await this._multiSignL1Action({ action: sortedAction, nonce, outerSigner });

        // Send a multi-sig action
        return super.multiSig({
            signatures,
            payload: {
                multiSigUser: this.multiSignAddress,
                outerSigner,
                action: sortedAction,
            },
            nonce,
        }, signal);
    }

    /**
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
     * const multiSignAddress = "0x...";
     * const signers = [
     *   privateKeyToAccount("0x..."), // first is leader
     *   privateKeyToAccount("0x..."),
     *   // ...
     *   privateKeyToAccount("0x..."),
     * ];
     *
     * const transport = new hl.HttpTransport(); // or WebSocketTransport
     * const multiSignClient = new hl.MultiSignClient({ transport, multiSignAddress, signers });
     *
     * const data = await multiSignClient.modify({
     *   oid: 123,
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
     *     c: "0x...", // Client Order ID (optional)
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
        const action: ModifyRequest["action"] = {
            type: "modify",
            ...actionArgs,
        };

        // Send a multi-sig action
        const sortedAction = actionSorter[action.type](action);
        const outerSigner = await this._getWalletAddress(this.signers[0]);

        const signatures = await this._multiSignL1Action({
            action: sortedAction,
            nonce,
            outerSigner,
            vaultAddress,
            expiresAfter,
        });

        // Send a multi-sig action
        return super.multiSig({
            signatures,
            payload: {
                multiSigUser: this.multiSignAddress,
                outerSigner,
                action: sortedAction,
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
     * const multiSignAddress = "0x...";
     * const signers = [
     *   privateKeyToAccount("0x..."), // first is leader
     *   privateKeyToAccount("0x..."),
     *   // ...
     *   privateKeyToAccount("0x..."),
     * ];
     *
     * const transport = new hl.HttpTransport(); // or WebSocketTransport
     * const multiSignClient = new hl.MultiSignClient({ transport, multiSignAddress, signers });
     *
     * const data = await multiSignClient.order({
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
     *     c: "0x...", // Client Order ID (optional)
     *   }],
     *   grouping: "na", // No grouping
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
        const action: OrderRequest["action"] = {
            type: "order",
            ...actionArgs,
        };

        // Send a multi-sig action
        const sortedAction = actionSorter[action.type](action);
        const outerSigner = await this._getWalletAddress(this.signers[0]);

        const signatures = await this._multiSignL1Action({
            action: sortedAction,
            nonce,
            outerSigner,
            vaultAddress,
            expiresAfter,
        });

        // Send a multi-sig action
        return super.multiSig({
            signatures,
            payload: {
                multiSigUser: this.multiSignAddress,
                outerSigner,
                action: sortedAction,
            },
            nonce,
            vaultAddress,
            expiresAfter,
        }, signal);
    }

    /**
     * @param args - The parameters for the request.
     * @param signal - An optional abort signal.
     * @returns Successful response without specific data.
     * @throws {ApiRequestError} When the API returns an error response.
     *
     * @see https://hyperliquid.gitbook.io/hyperliquid-docs/for-developers/api/deploying-hip-3-assets
     * @example
     * ```ts
     * import * as hl from "@nktkas/hyperliquid";
     * import { privateKeyToAccount } from "viem/accounts";
     *
     * const multiSignAddress = "0x...";
     * const signers = [
     *   privateKeyToAccount("0x..."), // first is leader
     *   privateKeyToAccount("0x..."),
     *   // ...
     *   privateKeyToAccount("0x..."),
     * ];
     *
     * const transport = new hl.HttpTransport(); // or WebSocketTransport
     * const multiSignClient = new hl.MultiSignClient({ transport, multiSignAddress, signers });
     *
     * const data = await multiSignClient.perpDeploy({
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
        args: PerpDeployParameters_RegisterAsset,
        signal?: AbortSignal,
    ): ReturnType<ExchangeClient["perpDeploy"]>;
    override async perpDeploy(
        args: PerpDeployParameters_SetOracle,
        signal?: AbortSignal,
    ): ReturnType<ExchangeClient["perpDeploy"]>;
    override async perpDeploy(
        args: PerpDeployParameters,
        signal?: AbortSignal,
    ): ReturnType<ExchangeClient["perpDeploy"]> {
        // Destructure the parameters
        const { ...actionArgs } = args;

        // Construct an action
        const nonce = await this.nonceManager();
        const action: PerpDeployRequest_RegisterAsset["action"] | PerpDeployRequest_SetOracle["action"] = {
            type: "perpDeploy",
            ...actionArgs,
        };

        // Send a multi-sig action
        const sortedAction = actionSorter[action.type](action);
        const outerSigner = await this._getWalletAddress(this.signers[0]);

        const signatures = await this._multiSignL1Action({ action: sortedAction, nonce, outerSigner });

        // Send a multi-sig action
        return super.multiSig({
            signatures,
            payload: {
                multiSigUser: this.multiSignAddress,
                outerSigner,
                action: sortedAction,
            },
            nonce,
        }, signal);
    }

    /**
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
     * const multiSignAddress = "0x...";
     * const signers = [
     *   privateKeyToAccount("0x..."), // first is leader
     *   privateKeyToAccount("0x..."),
     *   // ...
     *   privateKeyToAccount("0x..."),
     * ];
     *
     * const transport = new hl.HttpTransport(); // or WebSocketTransport
     * const multiSignClient = new hl.MultiSignClient({ transport, multiSignAddress, signers });
     *
     * const data = await multiSignClient.perpDexClassTransfer({
     *   dex: "test",
     *   token: "USDC",
     *   amount: "1",
     *   toPerp: true,
     * });
     * ```
     */
    override async perpDexClassTransfer(
        ...[args, signal]: Parameters<ExchangeClient["perpDexClassTransfer"]>
    ): ReturnType<ExchangeClient["perpDexClassTransfer"]> {
        // Destructure the parameters
        const { ...actionArgs } = args;

        // Construct an action
        const nonce = await this.nonceManager();
        const action: PerpDexClassTransferRequest["action"] = {
            ...actionArgs,
            type: "PerpDexClassTransfer",
            hyperliquidChain: this._getHyperliquidChain(),
            signatureChainId: await this._getSignatureChainId(),
            nonce,
        };

        // Sign the action
        const sortedAction = actionSorter[action.type](action);
        const outerSigner = await this._getWalletAddress(this.signers[0]);

        const signatures = await this._multiSignUserSignedAction(sortedAction, outerSigner);

        // Send a multi-sig action
        return super.multiSig({
            signatures,
            payload: {
                multiSigUser: this.multiSignAddress,
                outerSigner,
                action: sortedAction,
            },
            nonce,
        }, signal);
    }

    /**
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
     * const multiSignAddress = "0x...";
     * const signers = [
     *   privateKeyToAccount("0x..."), // first is leader
     *   privateKeyToAccount("0x..."),
     *   // ...
     *   privateKeyToAccount("0x..."),
     * ];
     *
     * const transport = new hl.HttpTransport(); // or WebSocketTransport
     * const multiSignClient = new hl.MultiSignClient({ transport, multiSignAddress, signers });
     *
     * const data = await multiSignClient.registerReferrer({ code: "TEST" });
     * ```
     */
    override async registerReferrer(
        ...[args, signal]: Parameters<ExchangeClient["registerReferrer"]>
    ): ReturnType<ExchangeClient["registerReferrer"]> {
        // Destructure the parameters
        const { ...actionArgs } = args;

        // Construct an action
        const nonce = await this.nonceManager();
        const action: RegisterReferrerRequest["action"] = {
            type: "registerReferrer",
            ...actionArgs,
        };

        // Send a multi-sig action
        const sortedAction = actionSorter[action.type](action);
        const outerSigner = await this._getWalletAddress(this.signers[0]);

        const signatures = await this._multiSignL1Action({ action: sortedAction, nonce, outerSigner });

        // Send a multi-sig action
        return super.multiSig({
            signatures,
            payload: {
                multiSigUser: this.multiSignAddress,
                outerSigner,
                action: sortedAction,
            },
            nonce,
        }, signal);
    }

    /**
     * @param args - The parameters for the request.
     * @param signal - An optional abort signal.
     * @returns Successful response without specific data.
     * @throws {ApiRequestError} When the API returns an error response.
     *
     * @see https://hyperliquid.gitbook.io/hyperliquid-docs/for-developers/api/exchange-endpoint#reserve-additional-actions
     * @example
     * ```ts
     * import * as hl from "@nktkas/hyperliquid";
     * import { privateKeyToAccount } from "viem/accounts";
     *
     * const multiSignAddress = "0x...";
     * const signers = [
     *   privateKeyToAccount("0x..."), // first is leader
     *   privateKeyToAccount("0x..."),
     *   // ...
     *   privateKeyToAccount("0x..."),
     * ];
     *
     * const transport = new hl.HttpTransport(); // or WebSocketTransport
     * const multiSignClient = new hl.MultiSignClient({ transport, multiSignAddress, signers });
     *
     * const data = await multiSignClient.reserveRequestWeight({ weight: 10 });
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
        const action: ReserveRequestWeightRequest["action"] = {
            type: "reserveRequestWeight",
            ...actionArgs,
        };

        // Send a multi-sig action
        const sortedAction = actionSorter[action.type](action);
        const outerSigner = await this._getWalletAddress(this.signers[0]);

        const signatures = await this._multiSignL1Action({ action: sortedAction, nonce, outerSigner, expiresAfter });

        // Send a multi-sig action
        return super.multiSig({
            signatures,
            payload: {
                multiSigUser: this.multiSignAddress,
                outerSigner,
                action: sortedAction,
            },
            nonce,
            expiresAfter,
        }, signal);
    }

    /**
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
     * const multiSignAddress = "0x...";
     * const signers = [
     *   privateKeyToAccount("0x..."), // first is leader
     *   privateKeyToAccount("0x..."),
     *   // ...
     *   privateKeyToAccount("0x..."),
     * ];
     *
     * const transport = new hl.HttpTransport(); // or WebSocketTransport
     * const multiSignClient = new hl.MultiSignClient({ transport, multiSignAddress, signers });
     *
     * const data = await multiSignClient.scheduleCancel({ time: Date.now() + 3600000 });
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
        const action: ScheduleCancelRequest["action"] = {
            type: "scheduleCancel",
            ...actionArgs,
        };

        // Send a multi-sig action
        const sortedAction = actionSorter[action.type](action);
        const outerSigner = await this._getWalletAddress(this.signers[0]);

        const signatures = await this._multiSignL1Action({
            action: sortedAction,
            nonce,
            outerSigner,
            vaultAddress,
            expiresAfter,
        });

        // Send a multi-sig action
        return super.multiSig({
            signatures,
            payload: {
                multiSigUser: this.multiSignAddress,
                outerSigner,
                action: sortedAction,
            },
            nonce,
            vaultAddress,
            expiresAfter,
        }, signal);
    }

    /**
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
     * const multiSignAddress = "0x...";
     * const signers = [
     *   privateKeyToAccount("0x..."), // first is leader
     *   privateKeyToAccount("0x..."),
     *   // ...
     *   privateKeyToAccount("0x..."),
     * ];
     *
     * const transport = new hl.HttpTransport(); // or WebSocketTransport
     * const multiSignClient = new hl.MultiSignClient({ transport, multiSignAddress, signers });
     *
     * const data = await multiSignClient.setDisplayName({ displayName: "My Name" });
     * ```
     */
    override async setDisplayName(
        ...[args, signal]: Parameters<ExchangeClient["setDisplayName"]>
    ): ReturnType<ExchangeClient["setDisplayName"]> {
        // Destructure the parameters
        const { ...actionArgs } = args;

        // Construct an action
        const nonce = await this.nonceManager();
        const action: SetDisplayNameRequest["action"] = {
            type: "setDisplayName",
            ...actionArgs,
        };

        // Send a multi-sig action
        const sortedAction = actionSorter[action.type](action);
        const outerSigner = await this._getWalletAddress(this.signers[0]);

        const signatures = await this._multiSignL1Action({ action: sortedAction, nonce, outerSigner });

        // Send a multi-sig action
        return super.multiSig({
            signatures,
            payload: {
                multiSigUser: this.multiSignAddress,
                outerSigner,
                action: sortedAction,
            },
            nonce,
        }, signal);
    }

    /**
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
     * const multiSignAddress = "0x...";
     * const signers = [
     *   privateKeyToAccount("0x..."), // first is leader
     *   privateKeyToAccount("0x..."),
     *   // ...
     *   privateKeyToAccount("0x..."),
     * ];
     *
     * const transport = new hl.HttpTransport(); // or WebSocketTransport
     * const multiSignClient = new hl.MultiSignClient({ transport, multiSignAddress, signers });
     *
     * const data = await multiSignClient.setReferrer({ code: "TEST" });
     * ```
     */
    override async setReferrer(
        ...[args, signal]: Parameters<ExchangeClient["setReferrer"]>
    ): ReturnType<ExchangeClient["setReferrer"]> {
        // Destructure the parameters
        const { ...actionArgs } = args;

        // Construct an action
        const nonce = await this.nonceManager();
        const action: SetReferrerRequest["action"] = {
            type: "setReferrer",
            ...actionArgs,
        };

        // Send a multi-sig action
        const sortedAction = actionSorter[action.type](action);
        const outerSigner = await this._getWalletAddress(this.signers[0]);

        const signatures = await this._multiSignL1Action({ action: sortedAction, nonce, outerSigner });

        // Send a multi-sig action
        return super.multiSig({
            signatures,
            payload: {
                multiSigUser: this.multiSignAddress,
                outerSigner,
                action: sortedAction,
            },
            nonce,
        }, signal);
    }

    /**
     * @param args - The parameters for the request.
     * @param signal - An optional abort signal.
     * @returns Successful response without specific data.
     * @throws {ApiRequestError} When the API returns an error response.
     *
     * @see https://hyperliquid.gitbook.io/hyperliquid-docs/for-developers/api/deploying-hip-1-and-hip-2-assets
     * @example
     * ```ts
     * import * as hl from "@nktkas/hyperliquid";
     * import { privateKeyToAccount } from "viem/accounts";
     *
     * const multiSignAddress = "0x...";
     * const signers = [
     *   privateKeyToAccount("0x..."), // first is leader
     *   privateKeyToAccount("0x..."),
     *   // ...
     *   privateKeyToAccount("0x..."),
     * ];
     *
     * const transport = new hl.HttpTransport(); // or WebSocketTransport
     * const multiSignClient = new hl.MultiSignClient({ transport, multiSignAddress, signers });
     *
     * const data = await multiSignClient.spotDeploy({
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
        args: SpotDeployParameters_Genesis,
        signal?: AbortSignal,
    ): ReturnType<ExchangeClient["spotDeploy"]>;
    override async spotDeploy(
        args: SpotDeployParameters_RegisterHyperliquidity,
        signal?: AbortSignal,
    ): ReturnType<ExchangeClient["spotDeploy"]>;
    override async spotDeploy(
        args: SpotDeployParameters_RegisterSpot,
        signal?: AbortSignal,
    ): ReturnType<ExchangeClient["spotDeploy"]>;
    override async spotDeploy(
        args: SpotDeployParameters_RegisterToken2,
        signal?: AbortSignal,
    ): ReturnType<ExchangeClient["spotDeploy"]>;
    override async spotDeploy(
        args: SpotDeployParameters_SetDeployerTradingFeeShare,
        signal?: AbortSignal,
    ): ReturnType<ExchangeClient["spotDeploy"]>;
    override async spotDeploy(
        args: SpotDeployParameters_UserGenesis,
        signal?: AbortSignal,
    ): ReturnType<ExchangeClient["spotDeploy"]>;
    override async spotDeploy(
        args: SpotDeployParameters,
        signal?: AbortSignal,
    ): ReturnType<ExchangeClient["spotDeploy"]> {
        // Destructure the parameters
        const { ...actionArgs } = args;

        // Construct an action
        const nonce = await this.nonceManager();
        const action:
            | SpotDeployRequest_RegisterToken2["action"]
            | SpotDeployRequest_UserGenesis["action"]
            | SpotDeployRequest_Genesis["action"]
            | SpotDeployRequest_RegisterSpot["action"]
            | SpotDeployRequest_RegisterHyperliquidity["action"]
            | SpotDeployRequest_SetDeployerTradingFeeShare["action"] = {
                type: "spotDeploy",
                ...actionArgs,
            };

        // Send a multi-sig action
        const sortedAction = actionSorter[action.type](action);
        const outerSigner = await this._getWalletAddress(this.signers[0]);

        const signatures = await this._multiSignL1Action({ action: sortedAction, nonce, outerSigner });

        // Send a multi-sig action
        return super.multiSig({
            signatures,
            payload: {
                multiSigUser: this.multiSignAddress,
                outerSigner,
                action: sortedAction,
            },
            nonce,
        }, signal);
    }

    /**
     * @param args - The parameters for the request.
     * @param signal - An optional abort signal.
     * @returns Successful response without specific data.
     * @throws {ApiRequestError} When the API returns an error response.
     *
     * @see https://hyperliquid.gitbook.io/hyperliquid-docs/for-developers/api/exchange-endpoint#core-spot-transfer
     * @example
     * ```ts
     * import * as hl from "@nktkas/hyperliquid";
     * import { privateKeyToAccount } from "viem/accounts";
     *
     * const multiSignAddress = "0x...";
     * const signers = [
     *   privateKeyToAccount("0x..."), // first is leader
     *   privateKeyToAccount("0x..."),
     *   // ...
     *   privateKeyToAccount("0x..."),
     * ];
     *
     * const transport = new hl.HttpTransport(); // or WebSocketTransport
     * const multiSignClient = new hl.MultiSignClient({ transport, multiSignAddress, signers });
     *
     * const data = await multiSignClient.spotSend({
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
        const action: SpotSendRequest["action"] = {
            ...actionArgs,
            type: "spotSend",
            hyperliquidChain: this._getHyperliquidChain(),
            signatureChainId: await this._getSignatureChainId(),
            time: nonce,
        };

        // Sign the action
        const sortedAction = actionSorter[action.type](action);
        const outerSigner = await this._getWalletAddress(this.signers[0]);

        const signatures = await this._multiSignUserSignedAction(sortedAction, outerSigner);

        // Send a multi-sig action
        return super.multiSig({
            signatures,
            payload: {
                multiSigUser: this.multiSignAddress,
                outerSigner,
                action: sortedAction,
            },
            nonce,
        }, signal);
    }

    /**
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
     * const multiSignAddress = "0x...";
     * const signers = [
     *   privateKeyToAccount("0x..."), // first is leader
     *   privateKeyToAccount("0x..."),
     *   // ...
     *   privateKeyToAccount("0x..."),
     * ];
     *
     * const transport = new hl.HttpTransport(); // or WebSocketTransport
     * const multiSignClient = new hl.MultiSignClient({ transport, multiSignAddress, signers });
     *
     * const data = await multiSignClient.spotUser({ toggleSpotDusting: { optOut: false } });
     * ```
     */
    override async spotUser(
        ...[args, signal]: Parameters<ExchangeClient["spotUser"]>
    ): ReturnType<ExchangeClient["spotUser"]> {
        // Destructure the parameters
        const { ...actionArgs } = args;

        // Construct an action
        const nonce = await this.nonceManager();
        const action: SpotUserRequest["action"] = {
            type: "spotUser",
            ...actionArgs,
        };

        // Send a multi-sig action
        const sortedAction = actionSorter[action.type](action);
        const outerSigner = await this._getWalletAddress(this.signers[0]);

        const signatures = await this._multiSignL1Action({ action: sortedAction, nonce, outerSigner });

        // Send a multi-sig action
        return super.multiSig({
            signatures,
            payload: {
                multiSigUser: this.multiSignAddress,
                outerSigner,
                action: sortedAction,
            },
            nonce,
        }, signal);
    }

    /**
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
     * const multiSignAddress = "0x...";
     * const signers = [
     *   privateKeyToAccount("0x..."), // first is leader
     *   privateKeyToAccount("0x..."),
     *   // ...
     *   privateKeyToAccount("0x..."),
     * ];
     *
     * const transport = new hl.HttpTransport(); // or WebSocketTransport
     * const multiSignClient = new hl.MultiSignClient({ transport, multiSignAddress, signers });
     *
     * const data = await multiSignClient.subAccountSpotTransfer({
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
        const action: SubAccountSpotTransferRequest["action"] = {
            type: "subAccountSpotTransfer",
            ...actionArgs,
        };

        // Send a multi-sig action
        const sortedAction = actionSorter[action.type](action);
        const outerSigner = await this._getWalletAddress(this.signers[0]);

        const signatures = await this._multiSignL1Action({ action: sortedAction, nonce, outerSigner });

        // Send a multi-sig action
        return super.multiSig({
            signatures,
            payload: {
                multiSigUser: this.multiSignAddress,
                outerSigner,
                action: sortedAction,
            },
            nonce,
        }, signal);
    }

    /**
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
     * const multiSignAddress = "0x...";
     * const signers = [
     *   privateKeyToAccount("0x..."), // first is leader
     *   privateKeyToAccount("0x..."),
     *   // ...
     *   privateKeyToAccount("0x..."),
     * ];
     *
     * const transport = new hl.HttpTransport(); // or WebSocketTransport
     * const multiSignClient = new hl.MultiSignClient({ transport, multiSignAddress, signers });
     *
     * const data = await multiSignClient.subAccountTransfer({
     *   subAccountUser: "0x...",
     *   isDeposit: true,
     *   usd: 1 * 1e6,
     * });
     * ```
     */
    override async subAccountTransfer(
        ...[args, signal]: Parameters<ExchangeClient["subAccountTransfer"]>
    ): ReturnType<ExchangeClient["subAccountTransfer"]> {
        // Destructure the parameters
        const { ...actionArgs } = args;

        // Construct an action
        const nonce = await this.nonceManager();
        const action: SubAccountTransferRequest["action"] = {
            type: "subAccountTransfer",
            ...actionArgs,
        };

        // Send a multi-sig action
        const sortedAction = actionSorter[action.type](action);
        const outerSigner = await this._getWalletAddress(this.signers[0]);

        const signatures = await this._multiSignL1Action({ action: sortedAction, nonce, outerSigner });

        // Send a multi-sig action
        return super.multiSig({
            signatures,
            payload: {
                multiSigUser: this.multiSignAddress,
                outerSigner,
                action: sortedAction,
            },
            nonce,
        }, signal);
    }

    /**
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
     * const multiSignAddress = "0x...";
     * const signers = [
     *   privateKeyToAccount("0x..."), // first is leader
     *   privateKeyToAccount("0x..."),
     *   // ...
     *   privateKeyToAccount("0x..."),
     * ];
     *
     * const transport = new hl.HttpTransport(); // or WebSocketTransport
     * const multiSignClient = new hl.MultiSignClient({ transport, multiSignAddress, signers });
     *
     * const data = await multiSignClient.tokenDelegate({
     *   validator: "0x...",
     *   isUndelegate: true,
     *   wei: 1 * 1e8,
     * });
     * ```
     */
    override async tokenDelegate(
        ...[args, signal]: Parameters<ExchangeClient["tokenDelegate"]>
    ): ReturnType<ExchangeClient["tokenDelegate"]> {
        // Destructure the parameters
        const { ...actionArgs } = args;

        // Construct an action
        const nonce = await this.nonceManager();
        const action: TokenDelegateRequest["action"] = {
            ...actionArgs,
            type: "tokenDelegate",
            hyperliquidChain: this._getHyperliquidChain(),
            signatureChainId: await this._getSignatureChainId(),
            nonce,
        };

        // Sign the action
        const sortedAction = actionSorter[action.type](action);
        const outerSigner = await this._getWalletAddress(this.signers[0]);

        const signatures = await this._multiSignUserSignedAction(sortedAction, outerSigner);

        // Send a multi-sig action
        return super.multiSig({
            signatures,
            payload: {
                multiSigUser: this.multiSignAddress,
                outerSigner,
                action: sortedAction,
            },
            nonce,
        }, signal);
    }

    /**
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
     * const multiSignAddress = "0x...";
     * const signers = [
     *   privateKeyToAccount("0x..."), // first is leader
     *   privateKeyToAccount("0x..."),
     *   // ...
     *   privateKeyToAccount("0x..."),
     * ];
     *
     * const transport = new hl.HttpTransport(); // or WebSocketTransport
     * const multiSignClient = new hl.MultiSignClient({ transport, multiSignAddress, signers });
     *
     * const data = await multiSignClient.twapCancel({
     *   a: 0, // Asset index
     *   t: 1, // TWAP ID
     * });
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
        const action: TwapCancelRequest["action"] = {
            type: "twapCancel",
            ...actionArgs,
        };

        // Send a multi-sig action
        const sortedAction = actionSorter[action.type](action);
        const outerSigner = await this._getWalletAddress(this.signers[0]);

        const signatures = await this._multiSignL1Action({
            action: sortedAction,
            nonce,
            outerSigner,
            vaultAddress,
            expiresAfter,
        });

        // Send a multi-sig action
        return super.multiSig({
            signatures,
            payload: {
                multiSigUser: this.multiSignAddress,
                outerSigner,
                action: sortedAction,
            },
            nonce,
            vaultAddress,
            expiresAfter,
        }, signal);
    }

    /**
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
     * const multiSignAddress = "0x...";
     * const signers = [
     *   privateKeyToAccount("0x..."), // first is leader
     *   privateKeyToAccount("0x..."),
     *   // ...
     *   privateKeyToAccount("0x..."),
     * ];
     *
     * const transport = new hl.HttpTransport(); // or WebSocketTransport
     * const multiSignClient = new hl.MultiSignClient({ transport, multiSignAddress, signers });
     *
     * const data = await multiSignClient.twapOrder({
     *   a: 0, // Asset index
     *   b: true, // Buy order
     *   s: "1", // Size
     *   r: false, // Not reduce-only
     *   m: 10, // Duration in minutes
     *   t: true, // Randomize order timing
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
        const action: TwapOrderRequest["action"] = {
            type: "twapOrder",
            twap: {
                ...actionArgs,
            },
        };

        // Send a multi-sig action
        const sortedAction = actionSorter[action.type](action);
        const outerSigner = await this._getWalletAddress(this.signers[0]);

        const signatures = await this._multiSignL1Action({
            action: sortedAction,
            nonce,
            outerSigner,
            vaultAddress,
            expiresAfter,
        });

        // Send a multi-sig action
        return super.multiSig({
            signatures,
            payload: {
                multiSigUser: this.multiSignAddress,
                outerSigner,
                action: sortedAction,
            },
            nonce,
            vaultAddress,
            expiresAfter,
        }, signal);
    }

    /**
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
     * const multiSignAddress = "0x...";
     * const signers = [
     *   privateKeyToAccount("0x..."), // first is leader
     *   privateKeyToAccount("0x..."),
     *   // ...
     *   privateKeyToAccount("0x..."),
     * ];
     *
     * const transport = new hl.HttpTransport(); // or WebSocketTransport
     * const multiSignClient = new hl.MultiSignClient({ transport, multiSignAddress, signers });
     *
     * const data = await multiSignClient.updateIsolatedMargin({
     *   asset: 0,
     *   isBuy: true,
     *   ntli: 1 * 1e6,
     * });
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
        const action: UpdateIsolatedMarginRequest["action"] = {
            type: "updateIsolatedMargin",
            ...actionArgs,
        };

        // Send a multi-sig action
        const sortedAction = actionSorter[action.type](action);
        const outerSigner = await this._getWalletAddress(this.signers[0]);

        const signatures = await this._multiSignL1Action({
            action: sortedAction,
            nonce,
            outerSigner,
            vaultAddress,
            expiresAfter,
        });

        // Send a multi-sig action
        return super.multiSig({
            signatures,
            payload: {
                multiSigUser: this.multiSignAddress,
                outerSigner,
                action: sortedAction,
            },
            nonce,
            vaultAddress,
            expiresAfter,
        }, signal);
    }

    /**
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
     * const multiSignAddress = "0x...";
     * const signers = [
     *   privateKeyToAccount("0x..."), // first is leader
     *   privateKeyToAccount("0x..."),
     *   // ...
     *   privateKeyToAccount("0x..."),
     * ];
     *
     * const transport = new hl.HttpTransport(); // or WebSocketTransport
     * const multiSignClient = new hl.MultiSignClient({ transport, multiSignAddress, signers });
     *
     * const data = await multiSignClient.updateLeverage({
     *   asset: 0,
     *   isCross: true,
     *   leverage: 5,
     * });
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
        const action: UpdateLeverageRequest["action"] = {
            type: "updateLeverage",
            ...actionArgs,
        };

        // Send a multi-sig action
        const sortedAction = actionSorter[action.type](action);
        const outerSigner = await this._getWalletAddress(this.signers[0]);

        const signatures = await this._multiSignL1Action({
            action: sortedAction,
            nonce,
            outerSigner,
            vaultAddress,
            expiresAfter,
        });

        // Send a multi-sig action
        return super.multiSig({
            signatures,
            payload: {
                multiSigUser: this.multiSignAddress,
                outerSigner,
                action: sortedAction,
            },
            nonce,
            vaultAddress,
            expiresAfter,
        }, signal);
    }

    /**
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
     * const multiSignAddress = "0x...";
     * const signers = [
     *   privateKeyToAccount("0x..."), // first is leader
     *   privateKeyToAccount("0x..."),
     *   // ...
     *   privateKeyToAccount("0x..."),
     * ];
     *
     * const transport = new hl.HttpTransport(); // or WebSocketTransport
     * const multiSignClient = new hl.MultiSignClient({ transport, multiSignAddress, signers });
     *
     * const data = await multiSignClient.usdClassTransfer({ amount: "1", toPerp: true });
     * ```
     */
    override async usdClassTransfer(
        ...[args, signal]: Parameters<ExchangeClient["usdClassTransfer"]>
    ): ReturnType<ExchangeClient["usdClassTransfer"]> {
        // Destructure the parameters
        const { ...actionArgs } = args;

        // Construct an action
        const nonce = await this.nonceManager();
        const action: UsdClassTransferRequest["action"] = {
            ...actionArgs,
            type: "usdClassTransfer",
            hyperliquidChain: this._getHyperliquidChain(),
            signatureChainId: await this._getSignatureChainId(),
            nonce,
        };

        // Sign the action
        const sortedAction = actionSorter[action.type](action);
        const outerSigner = await this._getWalletAddress(this.signers[0]);

        const signatures = await this._multiSignUserSignedAction(sortedAction, outerSigner);

        // Send a multi-sig action
        return super.multiSig({
            signatures,
            payload: {
                multiSigUser: this.multiSignAddress,
                outerSigner,
                action: sortedAction,
            },
            nonce,
        }, signal);
    }

    /**
     * @param args - The parameters for the request.
     * @param signal - An optional abort signal.
     * @returns Successful response without specific data.
     * @throws {ApiRequestError} When the API returns an error response.
     *
     * @see https://hyperliquid.gitbook.io/hyperliquid-docs/for-developers/api/exchange-endpoint#core-usdc-transfer
     * @example
     * ```ts
     * import * as hl from "@nktkas/hyperliquid";
     * import { privateKeyToAccount } from "viem/accounts";
     *
     * const multiSignAddress = "0x...";
     * const signers = [
     *   privateKeyToAccount("0x..."), // first is leader
     *   privateKeyToAccount("0x..."),
     *   // ...
     *   privateKeyToAccount("0x..."),
     * ];
     *
     * const transport = new hl.HttpTransport(); // or WebSocketTransport
     * const multiSignClient = new hl.MultiSignClient({ transport, multiSignAddress, signers });
     *
     * const data = await multiSignClient.usdSend({ destination: "0x...", amount: "1" });
     * ```
     */
    override async usdSend(
        ...[args, signal]: Parameters<ExchangeClient["usdSend"]>
    ): ReturnType<ExchangeClient["usdSend"]> {
        // Destructure the parameters
        const { ...actionArgs } = args;

        // Construct an action
        const nonce = await this.nonceManager();
        const action: UsdSendRequest["action"] = {
            ...actionArgs,
            type: "usdSend",
            hyperliquidChain: this._getHyperliquidChain(),
            signatureChainId: await this._getSignatureChainId(),
            time: nonce,
        };

        // Sign the action
        const sortedAction = actionSorter[action.type](action);
        const outerSigner = await this._getWalletAddress(this.signers[0]);

        const signatures = await this._multiSignUserSignedAction(sortedAction, outerSigner);

        // Send a multi-sig action
        return super.multiSig({
            signatures,
            payload: {
                multiSigUser: this.multiSignAddress,
                outerSigner,
                action: sortedAction,
            },
            nonce,
        }, signal);
    }

    /**
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
     * const multiSignAddress = "0x...";
     * const signers = [
     *   privateKeyToAccount("0x..."), // first is leader
     *   privateKeyToAccount("0x..."),
     *   // ...
     *   privateKeyToAccount("0x..."),
     * ];
     *
     * const transport = new hl.HttpTransport(); // or WebSocketTransport
     * const multiSignClient = new hl.MultiSignClient({ transport, multiSignAddress, signers });
     *
     * const data = await multiSignClient.vaultDistribute({ vaultAddress: "0x...", usd: 10 * 1e6 });
     * ```
     */
    override async vaultDistribute(
        ...[args, signal]: Parameters<ExchangeClient["vaultDistribute"]>
    ): ReturnType<ExchangeClient["vaultDistribute"]> {
        // Destructure the parameters
        const { ...actionArgs } = args;

        // Construct an action
        const nonce = await this.nonceManager();
        const action: VaultDistributeRequest["action"] = {
            type: "vaultDistribute",
            ...actionArgs,
        };

        // Send a multi-sig action
        const sortedAction = actionSorter[action.type](action);
        const outerSigner = await this._getWalletAddress(this.signers[0]);

        const signatures = await this._multiSignL1Action({ action: sortedAction, nonce, outerSigner });

        // Send a multi-sig action
        return super.multiSig({
            signatures,
            payload: {
                multiSigUser: this.multiSignAddress,
                outerSigner,
                action: sortedAction,
            },
            nonce,
        }, signal);
    }

    /**
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
     * const multiSignAddress = "0x...";
     * const signers = [
     *   privateKeyToAccount("0x..."), // first is leader
     *   privateKeyToAccount("0x..."),
     *   // ...
     *   privateKeyToAccount("0x..."),
     * ];
     *
     * const transport = new hl.HttpTransport(); // or WebSocketTransport
     * const multiSignClient = new hl.MultiSignClient({ transport, multiSignAddress, signers });
     *
     * const data = await multiSignClient.vaultModify({
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
        const action: VaultModifyRequest["action"] = {
            type: "vaultModify",
            ...actionArgs,
        };

        // Send a multi-sig action
        const sortedAction = actionSorter[action.type](action);
        const outerSigner = await this._getWalletAddress(this.signers[0]);

        const signatures = await this._multiSignL1Action({ action: sortedAction, nonce, outerSigner });

        // Send a multi-sig action
        return super.multiSig({
            signatures,
            payload: {
                multiSigUser: this.multiSignAddress,
                outerSigner,
                action: sortedAction,
            },
            nonce,
        }, signal);
    }

    /**
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
     * const multiSignAddress = "0x...";
     * const signers = [
     *   privateKeyToAccount("0x..."), // first is leader
     *   privateKeyToAccount("0x..."),
     *   // ...
     *   privateKeyToAccount("0x..."),
     * ];
     *
     * const transport = new hl.HttpTransport(); // or WebSocketTransport
     * const multiSignClient = new hl.MultiSignClient({ transport, multiSignAddress, signers });
     *
     * const data = await multiSignClient.vaultTransfer({
     *   vaultAddress: "0x...",
     *   isDeposit: true,
     *   usd: 10 * 1e6,
     * });
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
        const action: VaultTransferRequest["action"] = {
            type: "vaultTransfer",
            ...actionArgs,
        };

        // Send a multi-sig action
        const sortedAction = actionSorter[action.type](action);
        const outerSigner = await this._getWalletAddress(this.signers[0]);

        const signatures = await this._multiSignL1Action({ action: sortedAction, nonce, outerSigner, expiresAfter });

        // Send a multi-sig action
        return super.multiSig({
            signatures,
            payload: {
                multiSigUser: this.multiSignAddress,
                outerSigner,
                action: sortedAction,
            },
            nonce,
            expiresAfter,
        }, signal);
    }

    /**
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
     * const multiSignAddress = "0x...";
     * const signers = [
     *   privateKeyToAccount("0x..."), // first is leader
     *   privateKeyToAccount("0x..."),
     *   // ...
     *   privateKeyToAccount("0x..."),
     * ];
     *
     * const transport = new hl.HttpTransport(); // or WebSocketTransport
     * const multiSignClient = new hl.MultiSignClient({ transport, multiSignAddress, signers });
     *
     * const data = await multiSignClient.withdraw3({ destination: "0x...", amount: "1" });
     * ```
     */
    override async withdraw3(
        ...[args, signal]: Parameters<ExchangeClient["withdraw3"]>
    ): ReturnType<ExchangeClient["withdraw3"]> {
        // Destructure the parameters
        const { ...actionArgs } = args;

        // Construct an action
        const nonce = await this.nonceManager();
        const action: Withdraw3Request["action"] = {
            ...actionArgs,
            type: "withdraw3",
            hyperliquidChain: this._getHyperliquidChain(),
            signatureChainId: await this._getSignatureChainId(),
            time: nonce,
        };

        // Sign the action
        const sortedAction = actionSorter[action.type](action);
        const outerSigner = await this._getWalletAddress(this.signers[0]);

        const signatures = await this._multiSignUserSignedAction(sortedAction, outerSigner);

        // Send a multi-sig action
        return super.multiSig({
            signatures,
            payload: {
                multiSigUser: this.multiSignAddress,
                outerSigner,
                action: sortedAction,
            },
            nonce,
        }, signal);
    }

    /** Extracts the wallet address from different wallet types. */
    protected async _getWalletAddress(wallet: AbstractWalletWithAddress): Promise<`0x${string}`> {
        if (isAbstractViemWalletClient(wallet)) {
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
        action: BaseExchangeRequest["action"];
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
    protected _multiSignUserSignedAction(
        action:
            & BaseExchangeRequest["action"]
            & {
                type: keyof typeof userSignedActionEip712Types;
                signatureChainId: string;
            }
            & (
                | { nonce: number; time?: undefined }
                | { time: number; nonce?: undefined }
            ),
        outerSigner: Hex,
    ): Promise<Signature[]> {
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
                    ...action,
                    payloadMultiSigUser: this.multiSignAddress,
                    outerSigner,
                },
                types,
                chainId: parseInt(action.signatureChainId, 16),
            });
        }));
    }
}
