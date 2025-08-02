import { ExchangeClient } from "./exchange.js";
import { getWalletAddress, signL1Action, signUserSignedAction, userSignedActionEip712Types, } from "../signing/mod.js";
/**
 * Multi-signature exchange client for interacting with the Hyperliquid API.
 * @typeParam T The transport used to connect to the Hyperliquid API.
 * @typeParam S Array of wallets where the first wallet acts as the leader.
 */
export class MultiSignClient extends ExchangeClient {
    multiSignAddress;
    signers;
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
    constructor(args) {
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
    async _executeL1Action(request, signal) {
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
        return await super.multiSig({
            signatures,
            payload: {
                multiSigUser: this.multiSignAddress,
                outerSigner,
                action,
            },
            nonce,
        }, { signal, vaultAddress, expiresAfter });
    }
    async _executeUserSignedAction(request, signal) {
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
        return await super.multiSig({
            signatures,
            payload: {
                multiSigUser: this.multiSignAddress,
                outerSigner,
                action,
            },
            nonce,
        }, { signal });
    }
}
