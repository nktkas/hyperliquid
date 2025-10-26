import { type AbstractWallet, getWalletChainId } from "../../../signing/mod.ts";
import { Hex, type MaybePromise, parser } from "../../_base.ts";

/** Get the signature chain ID from the config value / function or from the wallet. */
export async function getSignatureChainId(
  config:
    | {
      wallet: AbstractWallet;
      signatureChainId?: string | (() => MaybePromise<string>);
    }
    | {
      signers: readonly AbstractWallet[];
      signatureChainId?: string | (() => MaybePromise<string>);
    },
): Promise<`0x${string}`> {
  if ("signatureChainId" in config && config.signatureChainId) {
    const signatureChainId = typeof config.signatureChainId === "string"
      ? config.signatureChainId
      : await config.signatureChainId();
    return parser(Hex)(signatureChainId);
  } else if ("wallet" in config) {
    return await getWalletChainId(config.wallet);
  } else {
    return await getWalletChainId(config.signers[0]);
  }
}
