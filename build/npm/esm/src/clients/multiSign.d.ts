import type { IRequestTransport } from "../transports/base.js";
import type { CancelSuccessResponse, CreateSubAccountResponse, CreateVaultResponse, Hex, OrderSuccessResponse, SuccessResponse, TwapCancelSuccessResponse, TwapOrderSuccessResponse } from "../types/mod.js";
import { ExchangeClient, type ExchangeClientParameters } from "./exchange.js";
import { type AbstractWallet, type actionSorter, userSignedActionEip712Types } from "../signing/mod.js";
/** Parameters for the {@linkcode MultiSignClient} constructor. */
export interface MultiSignClientParameters<T extends IRequestTransport = IRequestTransport, S extends readonly AbstractWallet[] = AbstractWallet[]> extends Omit<ExchangeClientParameters<T, S[0]>, "wallet"> {
    /** The multi-signature account address. */
    multiSignAddress: Hex;
    /** Array of wallets used for multi-signature operations. The first wallet acts as the leader. */
    signers: S;
}
/**
 * Multi-signature exchange client for interacting with the Hyperliquid API.
 * @typeParam T The transport used to connect to the Hyperliquid API.
 * @typeParam S Array of wallets where the first wallet acts as the leader.
 */
export declare class MultiSignClient<T extends IRequestTransport = IRequestTransport, S extends readonly AbstractWallet[] = AbstractWallet[]> extends ExchangeClient<T, S[0]> implements MultiSignClientParameters<T, S> {
    multiSignAddress: Hex;
    signers: S;
    /**
     * @multisign Is the first wallet from {@linkcode signers}. Changing the property also changes the first element in the {@linkcode signers} array.
     */
    wallet: S[0];
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
    constructor(args: MultiSignClientParameters<T, S>);
    protected _executeL1Action<T extends SuccessResponse | CancelSuccessResponse | CreateSubAccountResponse | CreateVaultResponse | OrderSuccessResponse | TwapOrderSuccessResponse | TwapCancelSuccessResponse>(request: {
        action: Parameters<typeof actionSorter[Exclude<keyof typeof actionSorter, keyof typeof userSignedActionEip712Types>]>[0];
        vaultAddress?: Hex;
        expiresAfter: number | undefined;
    }, signal?: AbortSignal): Promise<T>;
    protected _executeUserSignedAction<T extends SuccessResponse | CancelSuccessResponse | CreateSubAccountResponse | CreateVaultResponse | OrderSuccessResponse | TwapOrderSuccessResponse | TwapCancelSuccessResponse>(request: {
        action: Parameters<typeof actionSorter[Exclude<Extract<keyof typeof actionSorter, keyof typeof userSignedActionEip712Types>, "multiSig">]>[0];
    }, signal?: AbortSignal): Promise<T>;
}
//# sourceMappingURL=multiSign.d.ts.map