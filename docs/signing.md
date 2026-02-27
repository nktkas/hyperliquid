# Signing

Every exchange action on Hyperliquid requires an [EIP-712](https://eips.ethereum.org/EIPS/eip-712) signature.
[`ExchangeClient`](clients.md#trading) handles this automatically. The following functions are for custom integrations
or actions not yet supported by `ExchangeClient`.

## How signing works

Hyperliquid has two signing flows depending on the action type:

|                      | L1 actions                      | User-signed actions                           |
| -------------------- | ------------------------------- | --------------------------------------------- |
| **Examples**         | Trading and position management | Fund movements and account security           |
| **EIP-712 domain**   | `Exchange`, chain ID `1337`     | `HyperliquidSignTransaction`, user's chain ID |
| **What gets signed** | Action hash as `connectionId`   | Action fields directly                        |

### L1 action

The action is never signed directly. Instead, a **phantom agent** is constructed:

1. [Msgpack](https://msgpack.org/)-encode the action object (field order matters — the expected order varies by action
   type)
2. Append the [nonce](https://hyperliquid.gitbook.io/hyperliquid-docs/for-developers/api/nonces-and-api-wallets) as
   uint64 big-endian (8 bytes)
3. Append a [vault](https://hyperliquid.gitbook.io/hyperliquid-docs/hypercore/vaults) marker: `0x01` + 20-byte vault
   address, or `0x00` if none
4. If
   [`expiresAfter`](https://hyperliquid.gitbook.io/hyperliquid-docs/for-developers/api/exchange-endpoint#expires-after)
   is set, append `0x00` + the timestamp as uint64 big-endian
5. [Keccak-256](https://en.wikipedia.org/wiki/SHA-3#Instances) hash the concatenated bytes. This is the `connectionId`
6. Sign an [EIP-712](https://eips.ethereum.org/EIPS/eip-712) message with:
   - Domain: `{ name: "Exchange", version: "1", chainId: 1337, verifyingContract: 0x0...0 }`
   - Type: `Agent { source: string, connectionId: bytes32 }`
   - Message: `{ source: "a" (mainnet) or "b" (testnet), connectionId }` where `connectionId` is the hash from step 5
7. Send `{ action, signature: { r, s, v }, nonce }` to the
   [exchange endpoint](https://hyperliquid.gitbook.io/hyperliquid-docs/for-developers/api/exchange-endpoint)

Chain ID `1337` is hardcoded and doesn't depend on the wallet's network. The phantom agent construct means the validator
recovers the signer from the `Agent` message, then verifies that the `connectionId` matches the action hash.

### User-signed action

The action fields are placed directly into the EIP-712 message, with no hashing or phantom agent:

1. Each action type defines its own
   [typed data](https://eips.ethereum.org/EIPS/eip-712#definition-of-typed-structured-data-𝕊) structure (for example,
   `HyperliquidTransaction:ApproveAgent`)
2. Sign an EIP-712 message with:
   - Domain:
     `{ name: "HyperliquidSignTransaction", version: "1", chainId: <signatureChainId>, verifyingContract: 0x0...0 }`
   - Type and message: defined per action
3. Send `{ action, signature: { r, s, v }, nonce }` to the exchange endpoint

The `signatureChainId` field in the action (hex, such as `"0x66eee"`) sets the EIP-712 domain chain ID.

### Common rules

Both flows share:

- **Nonce:** current timestamp in milliseconds. Hyperliquid stores the 100 highest nonces per signer and rejects
  duplicates. See [Nonces](https://hyperliquid.gitbook.io/hyperliquid-docs/for-developers/api/nonces-and-api-wallets).
- **Signature:** ECDSA `{ r, s, v }` where `v` is `27` or `28`
- **Hex strings:** lowercase all hex values before signing

The following functions implement these flows. Each accepts any [compatible wallet](#wallet-compatibility).

## L1 actions

`signL1Action` signs an [L1 action](#l1-action) and returns an ECDSA signature.

Use `isTestnet: true` when signing for the testnet — this changes the EIP-712 source from `"a"` to `"b"`.

{% tabs %}

{% tab title="viem" %}

```ts
import { signL1Action } from "@nktkas/hyperliquid/signing";
import { privateKeyToAccount } from "viem/accounts";

const wallet = privateKeyToAccount("0x...");

const action = { type: "cancel", cancels: [{ a: 0, o: 12345 }] };
const nonce = Date.now();

const signature = await signL1Action({ wallet, action, nonce });

await fetch("https://api.hyperliquid.xyz/exchange", {
  method: "POST",
  headers: { "Content-Type": "application/json" },
  body: JSON.stringify({ action, signature, nonce }),
});
```

{% endtab %}

{% tab title="ethers" %}

```ts
import { signL1Action } from "@nktkas/hyperliquid/signing";
import { Wallet } from "ethers";

const wallet = new Wallet("0x...");

const action = { type: "cancel", cancels: [{ a: 0, o: 12345 }] };
const nonce = Date.now();

const signature = await signL1Action({ wallet, action, nonce });

await fetch("https://api.hyperliquid.xyz/exchange", {
  method: "POST",
  headers: { "Content-Type": "application/json" },
  body: JSON.stringify({ action, signature, nonce }),
});
```

{% endtab %}

{% tab title="Browser (viem)" %}

```ts
import { signL1Action } from "@nktkas/hyperliquid/signing";
import { createWalletClient, custom } from "viem";
import { arbitrum } from "viem/chains";

const wallet = createWalletClient({
  chain: arbitrum,
  transport: custom(window.ethereum!),
});

const action = { type: "cancel", cancels: [{ a: 0, o: 12345 }] };
const nonce = Date.now();

const signature = await signL1Action({ wallet, action, nonce });

await fetch("https://api.hyperliquid.xyz/exchange", {
  method: "POST",
  headers: { "Content-Type": "application/json" },
  body: JSON.stringify({ action, signature, nonce }),
});
```

{% endtab %}

{% tab title="Browser (ethers)" %}

```ts
import { signL1Action } from "@nktkas/hyperliquid/signing";
import { BrowserProvider } from "ethers";

const provider = new BrowserProvider(window.ethereum!);
const wallet = await provider.getSigner();

const action = { type: "cancel", cancels: [{ a: 0, o: 12345 }] };
const nonce = Date.now();

const signature = await signL1Action({ wallet, action, nonce });

await fetch("https://api.hyperliquid.xyz/exchange", {
  method: "POST",
  headers: { "Content-Type": "application/json" },
  body: JSON.stringify({ action, signature, nonce }),
});
```

{% endtab %}

{% tab title="Custom" %}

```ts
import { signL1Action } from "@nktkas/hyperliquid/signing";
import type { AbstractViemLocalAccount } from "@nktkas/hyperliquid/signing";

const wallet: AbstractViemLocalAccount = {
  address: "0x...",
  async signTypedData({ domain, types, primaryType, message }) {
    // Your EIP-712 signing logic (HSM, MPC, remote signer, etc.)
    return "0x...";
  },
};

const action = { type: "cancel", cancels: [{ a: 0, o: 12345 }] };
const nonce = Date.now();

const signature = await signL1Action({ wallet, action, nonce });

await fetch("https://api.hyperliquid.xyz/exchange", {
  method: "POST",
  headers: { "Content-Type": "application/json" },
  body: JSON.stringify({ action, signature, nonce }),
});
```

{% endtab %}

{% endtabs %}

## User-signed actions

`signUserSignedAction` signs a [user-signed action](#user-signed-action) and returns an ECDSA signature.

Each action type has its own EIP-712 types, exported from `@nktkas/hyperliquid/api/exchange` using the convention
`PascalCase(actionType) + "Types"` (for example, `Withdraw3Types` for `withdraw3`, `ApproveAgentTypes` for
`approveAgent`).

{% tabs %}

{% tab title="viem" %}

```ts
import { signUserSignedAction } from "@nktkas/hyperliquid/signing";
import { ApproveAgentTypes } from "@nktkas/hyperliquid/api/exchange";
import { privateKeyToAccount } from "viem/accounts";

const wallet = privateKeyToAccount("0x...");

const action = {
  type: "approveAgent",
  signatureChainId: "0x66eee",
  hyperliquidChain: "Mainnet",
  agentAddress: "0x...",
  agentName: "Agent",
  nonce: Date.now(),
};

const signature = await signUserSignedAction({ wallet, action, types: ApproveAgentTypes });

await fetch("https://api.hyperliquid.xyz/exchange", {
  method: "POST",
  headers: { "Content-Type": "application/json" },
  body: JSON.stringify({ action, signature, nonce: action.nonce }),
});
```

{% endtab %}

{% tab title="ethers" %}

```ts
import { signUserSignedAction } from "@nktkas/hyperliquid/signing";
import { ApproveAgentTypes } from "@nktkas/hyperliquid/api/exchange";
import { Wallet } from "ethers";

const wallet = new Wallet("0x...");

const action = {
  type: "approveAgent",
  signatureChainId: "0x66eee",
  hyperliquidChain: "Mainnet",
  agentAddress: "0x...",
  agentName: "Agent",
  nonce: Date.now(),
};

const signature = await signUserSignedAction({ wallet, action, types: ApproveAgentTypes });

await fetch("https://api.hyperliquid.xyz/exchange", {
  method: "POST",
  headers: { "Content-Type": "application/json" },
  body: JSON.stringify({ action, signature, nonce: action.nonce }),
});
```

{% endtab %}

{% tab title="Browser (viem)" %}

```ts
import { signUserSignedAction } from "@nktkas/hyperliquid/signing";
import { ApproveAgentTypes } from "@nktkas/hyperliquid/api/exchange";
import { createWalletClient, custom } from "viem";
import { arbitrum } from "viem/chains";

const wallet = createWalletClient({
  chain: arbitrum,
  transport: custom(window.ethereum!),
});

const action = {
  type: "approveAgent",
  signatureChainId: "0x66eee",
  hyperliquidChain: "Mainnet",
  agentAddress: "0x...",
  agentName: "Agent",
  nonce: Date.now(),
};

const signature = await signUserSignedAction({ wallet, action, types: ApproveAgentTypes });

await fetch("https://api.hyperliquid.xyz/exchange", {
  method: "POST",
  headers: { "Content-Type": "application/json" },
  body: JSON.stringify({ action, signature, nonce: action.nonce }),
});
```

{% endtab %}

{% tab title="Browser (ethers)" %}

```ts
import { signUserSignedAction } from "@nktkas/hyperliquid/signing";
import { ApproveAgentTypes } from "@nktkas/hyperliquid/api/exchange";
import { BrowserProvider } from "ethers";

const provider = new BrowserProvider(window.ethereum!);
const wallet = await provider.getSigner();

const action = {
  type: "approveAgent",
  signatureChainId: "0x66eee",
  hyperliquidChain: "Mainnet",
  agentAddress: "0x...",
  agentName: "Agent",
  nonce: Date.now(),
};

const signature = await signUserSignedAction({ wallet, action, types: ApproveAgentTypes });

await fetch("https://api.hyperliquid.xyz/exchange", {
  method: "POST",
  headers: { "Content-Type": "application/json" },
  body: JSON.stringify({ action, signature, nonce: action.nonce }),
});
```

{% endtab %}

{% tab title="Custom" %}

```ts
import { signUserSignedAction } from "@nktkas/hyperliquid/signing";
import { ApproveAgentTypes } from "@nktkas/hyperliquid/api/exchange";
import type { AbstractViemLocalAccount } from "@nktkas/hyperliquid/signing";

const wallet: AbstractViemLocalAccount = {
  address: "0x...",
  async signTypedData({ domain, types, primaryType, message }) {
    // Your EIP-712 signing logic (HSM, MPC, remote signer, etc.)
    return "0x...";
  },
};

const action = {
  type: "approveAgent",
  signatureChainId: "0x66eee",
  hyperliquidChain: "Mainnet",
  agentAddress: "0x...",
  agentName: "Agent",
  nonce: Date.now(),
};

const signature = await signUserSignedAction({ wallet, action, types: ApproveAgentTypes });

await fetch("https://api.hyperliquid.xyz/exchange", {
  method: "POST",
  headers: { "Content-Type": "application/json" },
  body: JSON.stringify({ action, signature, nonce: action.nonce }),
});
```

{% endtab %}

{% endtabs %}

## Action hashing

`createL1ActionHash` produces the keccak256 hash used as `connectionId` in L1 signing. Use it to verify that your action
serialization matches what the SDK produces:

```ts
import { createL1ActionHash } from "@nktkas/hyperliquid/signing";

const hash = createL1ActionHash({
  action: { type: "cancel", cancels: [{ a: 0, o: 12345 }] },
  nonce: Date.now(),
});
```

{% hint style="warning" %} The hash depends on key order in the action object. The expected order varies by action type.
{% endhint %}

Optional parameters `vaultAddress` and `expiresAfter` are included in the hash when present.

## Multi-sig actions

`signMultiSigAction` signs the [multi-sig](https://hyperliquid.gitbook.io/hyperliquid-docs/hypercore/multi-sig) wrapper
after all signers have signed the inner action. The inner signing differs for L1 and user-signed actions. Use
`isTestnet: true` when signing for the testnet, as with `signL1Action`.

### L1 actions

Each signer signs the `[multiSigUser, outerSigner, action]` tuple via `signL1Action`. The leader (first signer) then
signs the wrapper via `signMultiSigAction`:

```ts
import { signL1Action, signMultiSigAction } from "@nktkas/hyperliquid/signing";
import { privateKeyToAccount } from "viem/accounts";

const signers = [
  privateKeyToAccount("0x..."), // leader — signs the wrapper
  privateKeyToAccount("0x..."),
];
const multiSigUser = "0x..."; // the multi-sig account address

const action = { type: "scheduleCancel", time: Date.now() + 10_000 };
const nonce = Date.now();

// 1. All signers sign the [user, leader, action] tuple
const signatures = await Promise.all(signers.map(async (signer) => {
  return await signL1Action({
    wallet: signer,
    action: [multiSigUser.toLowerCase(), signers[0].address.toLowerCase(), action],
    nonce,
    // isTestnet: true,
  });
}));

// 2. Wrap and sign with leader
const multiSigAction = {
  type: "multiSig" as const,
  signatureChainId: "0x66eee" as const,
  signatures,
  payload: {
    multiSigUser: multiSigUser.toLowerCase(),
    outerSigner: signers[0].address.toLowerCase(),
    action,
  },
};

const signature = await signMultiSigAction({
  wallet: signers[0],
  action: multiSigAction,
  nonce,
  // isTestnet: true,
});

await fetch("https://api.hyperliquid.xyz/exchange", {
  method: "POST",
  headers: { "Content-Type": "application/json" },
  body: JSON.stringify({ action: multiSigAction, signature, nonce }),
});
```

### User-signed

Each signer signs the action with embedded `payloadMultiSigUser` and `outerSigner` fields via `signUserSignedAction`.
The leader then signs the wrapper via `signMultiSigAction`:

```ts
import { signMultiSigAction, signUserSignedAction } from "@nktkas/hyperliquid/signing";
import { UsdSendTypes } from "@nktkas/hyperliquid/api/exchange";
import { privateKeyToAccount } from "viem/accounts";

const signers = [
  privateKeyToAccount("0x..."), // leader — signs the wrapper
  privateKeyToAccount("0x..."),
];
const multiSigUser = "0x..."; // the multi-sig account address

const action = {
  type: "usdSend",
  signatureChainId: "0x66eee" as const,
  hyperliquidChain: "Mainnet", // "Testnet" for testnet
  destination: "0x...",
  amount: "100",
  time: Date.now(),
};

// 1. All signers sign the action with multi-sig fields
const signatures = await Promise.all(signers.map(async (signer) => {
  return await signUserSignedAction({
    wallet: signer,
    action: {
      payloadMultiSigUser: multiSigUser.toLowerCase() as `0x${string}`,
      outerSigner: signers[0].address.toLowerCase() as `0x${string}`,
      ...action,
    },
    types: UsdSendTypes,
  });
}));

// 2. Wrap and sign with leader
const multiSigAction = {
  type: "multiSig",
  signatureChainId: "0x66eee" as const,
  signatures,
  payload: {
    multiSigUser: multiSigUser.toLowerCase(),
    outerSigner: signers[0].address.toLowerCase(),
    action,
  },
};

const signature = await signMultiSigAction({
  wallet: signers[0],
  action: multiSigAction,
  nonce: action.time,
  // isTestnet: true,
});

await fetch("https://api.hyperliquid.xyz/exchange", {
  method: "POST",
  headers: { "Content-Type": "application/json" },
  body: JSON.stringify({ action: multiSigAction, signature, nonce: action.time }),
});
```

## Wallet compatibility

All signing functions accept `AbstractWallet` — a union of supported wallet interfaces:

|                                                                                | `signTypedData`  | Address            | Chain ID                |
| ------------------------------------------------------------------------------ | ---------------- | ------------------ | ----------------------- |
| [viem Local Account](https://viem.sh/docs/accounts/local)                      | 1 param (object) | `address` property | fallback `0x1`          |
| [viem JSON-RPC Account](https://viem.sh/docs/clients/wallet#json-rpc-accounts) | 1 param (object) | `getAddresses()`   | `getChainId()`          |
| [ethers Signer](https://docs.ethers.org/v6/api/providers/#Signer)              | 3 params         | `getAddress()`     | `provider.getNetwork()` |

Any object matching one of these interfaces works. See the [Custom tab](#l1-actions) in signing examples.

### Helpers

These functions work with any supported wallet type:

- `getWalletAddress` — returns the wallet address, always lowercase
- `getWalletChainId` — returns the wallet chain ID as hex, falls back to `"0x1"` for local wallets without a provider

```ts
import { getWalletAddress, getWalletChainId } from "@nktkas/hyperliquid/signing";
import { privateKeyToAccount } from "viem/accounts";

const wallet = privateKeyToAccount("0x...");

const address = await getWalletAddress(wallet); // "0x..."
const chainId = await getWalletChainId(wallet); // "0xa4b1"
```
