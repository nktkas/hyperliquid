import { addr, signTyped } from "@paulmillr/micro-eth-signer";
import type { AbstractViemLocalAccount } from "./_abstractWallet.ts";

/**
 * Private key signer implementing the {@link AbstractViemLocalAccount} interface.
 *
 * @example
 * ```ts
 * import { PrivateKeySigner } from "@nktkas/hyperliquid/signing";
 * //       ^^^^^^^^^^^^^^^^
 * //       instead of importing viem / ethers
 *
 * const privateKey = "0xabc123..."; // your private key
 * const signer = new PrivateKeySigner(privateKey);
 * ```
 */
export class PrivateKeySigner implements AbstractViemLocalAccount {
  #privateKey: `0x${string}`;
  address: `0x${string}`;

  constructor(privateKey: string) {
    this.#privateKey = privateKey as `0x${string}`;
    this.address = addr.fromSecretKey(privateKey) as `0x${string}`;
  }

  signTypedData(params: {
    domain: {
      name?: string;
      version?: string;
      chainId?: number;
      verifyingContract?: `0x${string}`;
      salt?: `0x${string}`;
    };
    types: {
      [key: string]: {
        name: string;
        type: string;
      }[];
    };
    primaryType: string;
    message: Record<string, unknown>;
  }): Promise<`0x${string}`> {
    const signature = signTyped(
      {
        domain: params.domain,
        // deno-lint-ignore no-explicit-any
        types: params.types as any, // function is too strict on types
        primaryType: params.primaryType,
        message: params.message,
      },
      this.#privateKey,
      false,
    ) as `0x${string}`;
    return Promise.resolve(signature);
  }
}
