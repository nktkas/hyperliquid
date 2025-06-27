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

    protected override async _executeAction<
        T extends
            | SuccessResponse
            | CancelResponseSuccess
            | CreateSubAccountResponse
            | CreateVaultResponse
            | OrderResponseSuccess
            | TwapOrderResponseSuccess
            | TwapCancelResponseSuccess,
    >(
        args: {
            action: Parameters<typeof actionSorter[keyof typeof actionSorter]>[0];
            vaultAddress?: Hex;
            expiresAfter?: number;
            multiSigNonce?: number;
        },
        signal?: AbortSignal,
    ): Promise<T> {
        const { action, vaultAddress, expiresAfter, multiSigNonce } = args;

        if (action.type === "multiSig") { // Multi-signature action
            return await super._executeAction({
                action,
                vaultAddress,
                expiresAfter,
                multiSigNonce,
            }, signal);
        }

        // Sign an action

        // deno-lint-ignore no-explicit-any
        const sortedAction = actionSorter[action.type](action as any); // TypeScript cannot infer a type from a dynamic function call

        let nonce: number;
        if ("signatureChainId" in sortedAction) { // User-signed action
            nonce = "nonce" in sortedAction ? sortedAction.nonce : sortedAction.time;
        } else { // L1 action
            nonce = await this.nonceManager();
        }

        const outerSigner = await this._getWalletAddress(this.signers[0]);

        let signatures: Signature[];
        if ("signatureChainId" in sortedAction) { // User-signed action
            signatures = await Promise.all(this.signers.map(async (signer) => {
                const types = structuredClone(userSignedActionEip712Types[sortedAction.type]); // for safe mutation
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
                        ...sortedAction,
                    },
                    types,
                });
            }));
            if ("agentName" in sortedAction && sortedAction.agentName === "") sortedAction.agentName = null;
        } else { // L1 action
            signatures = await Promise.all(this.signers.map(async (signer) => {
                return await signL1Action({
                    wallet: signer,
                    action: [this.multiSignAddress.toLowerCase(), outerSigner.toLowerCase(), sortedAction],
                    nonce,
                    isTestnet: this.isTestnet,
                    vaultAddress,
                    expiresAfter,
                });
            }));
        }

        // Send a multi-signature action
        return await super.multiSig({
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

    /** Extracts the wallet address from different wallet types. */
    protected async _getWalletAddress(wallet: AbstractWalletWithAddress): Promise<Hex> {
        if (isValidPrivateKey(wallet)) {
            return privateKeyToAddress(wallet);
        } else if (isAbstractViemWalletClient(wallet)) {
            return wallet.address;
        } else if (isAbstractEthersSigner(wallet) || isAbstractEthersV5Signer(wallet)) {
            return await wallet.getAddress() as Hex;
        } else if (isAbstractWindowEthereum(wallet)) {
            return await getWindowEthereumAddress(wallet);
        } else {
            throw new Error("Unsupported wallet for getting address");
        }
    }
}

function privateKeyToAddress(privateKey: string): Hex {
    const cleanPrivKey = privateKey.startsWith("0x") ? privateKey.slice(2) : privateKey;

    const publicKey = getPublicKey(cleanPrivKey, false);
    const publicKeyWithoutPrefix = publicKey.slice(1);

    const hash = keccak_256(publicKeyWithoutPrefix);

    const addressBytes = hash.slice(-20);
    const address = etc.bytesToHex(addressBytes);

    return `0x${address}`;
}

async function getWindowEthereumAddress(ethereum: AbstractWindowEthereum): Promise<Hex> {
    const accounts = await ethereum.request({ method: "eth_requestAccounts", params: [] });
    if (!Array.isArray(accounts) || accounts.length === 0) {
        throw new Error("No Ethereum accounts available");
    }
    return accounts[0] as Hex;
}
