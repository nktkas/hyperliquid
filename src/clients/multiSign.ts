import type { Hex } from "../base.ts";
import type { IRequestTransport } from "../transports/base.ts";
import type { CreateSubAccountResponse, CreateVaultResponse, SuccessResponse } from "../types/mod.ts";
import {
    type CancelResponseSuccess,
    ExchangeClient,
    type ExchangeClientParameters,
    type OrderResponseSuccess,
    type TwapCancelResponseSuccess,
    type TwapOrderResponseSuccess,
} from "./exchange.ts";
import {
    type AbstractEthersSigner,
    type AbstractEthersV5Signer,
    type AbstractViemWalletClient,
    type AbstractWallet,
    type AbstractWindowEthereum,
    actionSorter,
    getWalletAddress,
    signL1Action,
    signUserSignedAction,
    userSignedActionEip712Types,
} from "../signing/mod.ts";

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
    | Required<AbstractViemWalletClient>
    | Required<AbstractEthersSigner>
    | Required<AbstractEthersV5Signer>
    | AbstractWindowEthereum;

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
     * @multisign Is the first wallet from {@linkcode signers}. Changing the property also changes the first element in the {@linkcode signers} array.
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

    protected override async _executeL1Action<
        T extends
            | SuccessResponse
            | CancelResponseSuccess
            | CreateSubAccountResponse
            | CreateVaultResponse
            | OrderResponseSuccess
            | TwapOrderResponseSuccess
            | TwapCancelResponseSuccess,
    >(
        request: {
            action: {
                type: string;
                [key: string]: unknown;
            };
            vaultAddress?: Hex;
            expiresAfter: number | undefined;
        },
        signal?: AbortSignal,
    ): Promise<T> {
        let { action, vaultAddress, expiresAfter } = request;
        // @ts-ignore - for test
        action = actionSorter[action.type](action);

        // Sign an L1 action
        const nonce = await this.nonceManager();
        const outerSigner = await getWalletAddress(this.signers[0]);
        const signatures = await Promise.all(this.signers.map(async (signer) => {
            return await signL1Action({
                wallet: signer,
                action: [this.multiSignAddress.toLowerCase(), outerSigner.toLowerCase(), action],
                nonce,
                isTestnet: this.isTestnet,
                vaultAddress,
                expiresAfter,
            });
        }));

        // Send a request via multi-sign action
        return await super.multiSig(
            {
                signatures,
                payload: {
                    multiSigUser: this.multiSignAddress,
                    outerSigner,
                    action,
                },
                nonce,
            },
            { signal, vaultAddress, expiresAfter },
        );
    }

    protected override async _executeUserSignedAction<
        T extends
            | SuccessResponse
            | CancelResponseSuccess
            | CreateSubAccountResponse
            | CreateVaultResponse
            | OrderResponseSuccess
            | TwapOrderResponseSuccess
            | TwapCancelResponseSuccess,
    >(
        request: {
            action:
                & {
                    type: keyof typeof userSignedActionEip712Types;
                    signatureChainId: Hex;
                    [key: string]: unknown;
                }
                & (
                    | { nonce: number; time?: undefined }
                    | { time: number; nonce?: undefined }
                );
        },
        signal?: AbortSignal,
    ): Promise<T> {
        let { action } = request;
        // @ts-ignore - for test
        action = actionSorter[action.type](action);

        // Sign a user-signed action
        const outerSigner = await getWalletAddress(this.signers[0]);

        if (action.type === "approveAgent" && !action.agentName) action.agentName = ""; // Special case for approveAgent
        const signatures = await Promise.all(this.signers.map(async (signer) => {
            const types = structuredClone(userSignedActionEip712Types[action.type]); // for safe mutation
            Object.values(types)[0].splice( // array mutation
                1, // after `hyperliquidChain`
                0, // do not remove any elements
                { name: "payloadMultiSigUser", type: "address" },
                { name: "outerSigner", type: "address" },
            );
            return await signUserSignedAction({
                wallet: signer,
                action: {
                    payloadMultiSigUser: this.multiSignAddress,
                    outerSigner,
                    ...action,
                },
                types,
            });
        }));
        if (action.type === "approveAgent" && action.agentName === "") action.agentName = null; // Special case for approveAgent

        // Send a request via multi-sign action
        return await super.multiSig(
            {
                signatures,
                payload: {
                    multiSigUser: this.multiSignAddress,
                    outerSigner,
                    action,
                },
                nonce: action.nonce ?? action.time,
            },
            { signal },
        );
    }

    protected override _executeMultiSigAction<
        T extends
            | SuccessResponse
            | CancelResponseSuccess
            | CreateSubAccountResponse
            | CreateVaultResponse
            | OrderResponseSuccess
            | TwapOrderResponseSuccess
            | TwapCancelResponseSuccess,
    >(
        request: {
            action: {
                type: "multiSig";
                [key: string]: unknown;
            };
            vaultAddress?: Hex;
            expiresAfter?: number;
            nonce: number;
        },
        signal?: AbortSignal,
    ): Promise<T> {
        return super._executeMultiSigAction(request, signal);
    }
}
