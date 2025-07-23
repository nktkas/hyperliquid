import type { IRequestTransport } from "../transports/base.ts";
import type {
    CancelSuccessResponse,
    CreateSubAccountResponse,
    CreateVaultResponse,
    Hex,
    OrderSuccessResponse,
    SuccessResponse,
    TwapCancelSuccessResponse,
    TwapOrderSuccessResponse,
} from "../types/mod.ts";
import { ExchangeClient, type ExchangeClientParameters } from "./exchange.ts";
import {
    type AbstractEthersSigner,
    type AbstractEthersV5Signer,
    type AbstractViemWalletClient,
    type AbstractWallet,
    getWalletAddress,
    signL1Action,
    signUserSignedAction,
} from "../signing/mod.ts";
import { type actionSorter, userSignedActionEip712Types } from "../signing/mod.ts";

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
    | Required<AbstractEthersV5Signer>;

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
     *   "0x...", // private key; or any other wallet libraries
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
            | CancelSuccessResponse
            | CreateSubAccountResponse
            | CreateVaultResponse
            | OrderSuccessResponse
            | TwapOrderSuccessResponse
            | TwapCancelSuccessResponse,
    >(
        request: {
            action: Parameters<
                typeof actionSorter[
                    Exclude<keyof typeof actionSorter, keyof typeof userSignedActionEip712Types>
                ]
            >[0];
            vaultAddress?: Hex;
            expiresAfter: number | undefined;
        },
        signal?: AbortSignal,
    ): Promise<T> {
        const { action, vaultAddress, expiresAfter } = request;

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
            | CancelSuccessResponse
            | CreateSubAccountResponse
            | CreateVaultResponse
            | OrderSuccessResponse
            | TwapOrderSuccessResponse
            | TwapCancelSuccessResponse,
    >(
        request: {
            action: Parameters<
                typeof actionSorter[
                    Exclude<Extract<keyof typeof actionSorter, keyof typeof userSignedActionEip712Types>, "multiSig">
                ]
            >[0];
        },
        signal?: AbortSignal,
    ): Promise<T> {
        const { action } = request;

        // Sign a user-signed action
        const nonce = "nonce" in action ? action.nonce : action.time;
        const outerSigner = await getWalletAddress(this.signers[0]);
        const signatures = await Promise.all(this.signers.map(async (signer) => {
            return await signUserSignedAction({
                wallet: signer,
                action: {
                    payloadMultiSigUser: this.multiSignAddress,
                    outerSigner,
                    ...action,
                },
                types: userSignedActionEip712Types[action.type],
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
            { signal },
        );
    }
}
