/**
 * User-signed ([EIP-712](https://eips.ethereum.org/EIPS/eip-712)) signing for fund and account actions.
 * @module
 */

import { type AbstractWallet, type Signature, signTypedData } from "./_abstractWallet.ts";
import { trimSignature } from "./_multiSig.ts";

/**
 * Signs a user-signed action.
 *
 * @param args The wallet, action, and EIP-712 types.
 * @return The ECDSA signature.
 *
 * @throws {AbstractWalletError} If signing fails.
 *
 * @example
 * ```ts
 * import { signUserSignedAction } from "@nktkas/hyperliquid/signing";
 * import { ApproveAgentTypes } from "@nktkas/hyperliquid/api/exchange";
 * import { privateKeyToAccount } from "npm:viem/accounts";
 *
 * const wallet = privateKeyToAccount("0x..."); // `viem` or `ethers` or any `AbstractWallet`
 *
 * const types = ApproveAgentTypes; // or custom EIP-712 types matching the action
 * const action = {
 *   type: "approveAgent",
 *   signatureChainId: "0x66eee" as const,
 *   hyperliquidChain: "Mainnet",
 *   agentAddress: "0x...",
 *   agentName: "Agent",
 *   nonce: Date.now(),
 * };
 *
 * const signature = await signUserSignedAction({ wallet, action, types });
 * ```
 *
 * @example
 * \- Full cycle of signing and sending a user-signed action to the Hyperliquid API
 * ```ts
 * import { signUserSignedAction } from "@nktkas/hyperliquid/signing";
 * import { ApproveAgentTypes } from "@nktkas/hyperliquid/api/exchange";
 * import { privateKeyToAccount } from "npm:viem/accounts";
 *
 * const wallet = privateKeyToAccount("0x..."); // `viem` or `ethers` or any `AbstractWallet`
 *
 * const types = ApproveAgentTypes; // or custom EIP-712 types matching the action
 * const action = {
 *   type: "approveAgent",
 *   signatureChainId: "0x66eee" as const,
 *   hyperliquidChain: "Mainnet",
 *   agentAddress: "0x...",
 *   agentName: "Agent",
 *   nonce: Date.now(),
 * };
 *
 * const signature = await signUserSignedAction({ wallet, action, types });
 *
 * // Send the signed action to the Hyperliquid API
 * const response = await fetch("https://api.hyperliquid.xyz/exchange", {
 *   method: "POST",
 *   headers: { "Content-Type": "application/json" },
 *   body: JSON.stringify({ action, signature, nonce: action.nonce }),
 * });
 * const body = await response.json();
 * ```
 */
export async function signUserSignedAction<
  TAction extends { signatureChainId: `0x${string}`; [key: string]: unknown },
>(args: {
  /** Wallet to sign the action. */
  wallet: AbstractWallet;
  /** The action to be signed (hex strings must be in lower case). */
  action: TAction;
  /** The types of the action (hash depends on key order). */
  types: Record<string, readonly { name: string; type: string }[]>;
}): Promise<Signature> {
  const { wallet, action, types } = args;
  return await signTypedData({
    wallet,
    domain: {
      name: "HyperliquidSignTransaction",
      version: "1",
      chainId: parseInt(action.signatureChainId),
      verifyingContract: "0x0000000000000000000000000000000000000000",
    },
    types,
    primaryType: Object.keys(types)[0],
    message: action,
  });
}

/**
 * Signs an inner per-signer contribution to a multi-sig user-signed action.
 *
 * Signs the action with `payloadMultiSigUser` and `outerSigner` fields injected
 * (using a type extended after its first field); the returned signature is
 * trimmed for inclusion in the multi-sig wrapper.
 *
 * @param args The signer, action, types, and signing parameters.
 * @return The trimmed ECDSA signature.
 *
 * @throws {AbstractWalletError} If signing fails.
 */
export async function signUserSignedInner(args: {
  /** Inner signer (one of the multi-sig authorized users). */
  signer: AbstractWallet;
  /** The action to be authorized (must include `signatureChainId`). */
  action: { signatureChainId: `0x${string}`; [key: string]: unknown };
  /** The types of the action. */
  types: Record<string, readonly { name: string; type: string }[]>;
  /** The multi-sig account address. */
  multiSigUser: `0x${string}`;
  /** The leader address (address of the wallet that signs the outer wrapper). */
  outerSigner: `0x${string}`;
}): Promise<Signature> {
  // Inject fields for multi-sig
  const primaryType = Object.keys(args.types)[0];
  const primaryTypeFields = args.types[primaryType];
  const extendedTypes = {
    ...args.types,
    [primaryType]: [
      primaryTypeFields[0],
      { name: "payloadMultiSigUser", type: "address" },
      { name: "outerSigner", type: "address" },
      ...primaryTypeFields.slice(1),
    ],
  };

  const signature = await signUserSignedAction({
    wallet: args.signer,
    action: {
      payloadMultiSigUser: args.multiSigUser.toLowerCase(),
      outerSigner: args.outerSigner.toLowerCase(),
      ...args.action,
    },
    types: extendedTypes,
  });
  return trimSignature(signature);
}
