# Signing

Low-level signing helpers from `@nktkas/hyperliquid/signing` for building signed
[EIP-712](https://eips.ethereum.org/EIPS/eip-712) payloads outside [`ExchangeClient`](clients.md#exchange-endpoint) —
for custom integrations or actions not yet covered by the high-level client.

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
6. Sign an EIP-712 message with:
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
   [typed data](https://eips.ethereum.org/EIPS/eip-712#definition-of-typed-structured-data-𝕊) structure (e.g.,
   `HyperliquidTransaction:ApproveAgent`)
2. Sign an EIP-712 message with:
   - Domain:
     `{ name: "HyperliquidSignTransaction", version: "1", chainId: <signatureChainId>, verifyingContract: 0x0...0 }`
   - Type and message: defined per action
3. Send `{ action, signature: { r, s, v }, nonce }` to the exchange endpoint

The `signatureChainId` field in the action (hex, such as `"0x66eee"`) sets the EIP-712 domain chain ID.

### Shared rules

Both flows produce the same envelope: `{ action, signature, nonce }`.

The signature is ECDSA `{ r, s, v }` with `v` equal to `27` or `28` — wallets that return a raw recovery value of
`0`/`1` are normalized by the SDK.

The nonce is a unix millisecond timestamp. Hyperliquid stores the 100 highest nonces per signer: a new one must be
larger than the smallest stored, never repeat, and fall within `(T - 2 days, T + 1 day)` of the block timestamp. See
[Nonces](https://hyperliquid.gitbook.io/hyperliquid-docs/for-developers/api/nonces-and-api-wallets).

Hex is case-sensitive for signing. The SDK lowercases the values it generates (wallet addresses, multi-sig fields); any
hex you place into an action yourself must already be lowercase, or the signature won't verify server-side.

## L1 actions

The action is hashed, not signed directly — its key order is what the signature commits to, so build it in schema order
(see [L1 action](#l1-action)), or let [`canonicalize`](#canonicalize) build it for you.

Three optional parameters:

- `isTestnet` — switch the EIP-712 source to the testnet (`"b"` instead of `"a"`).
- `vaultAddress` — sign through a vault; folded into the hash.
- `expiresAfter` — reject the action after this timestamp; folded into the hash.

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

const [account] = await window.ethereum!.request({ method: "eth_requestAccounts" }) as `0x${string}`[];
const wallet = createWalletClient({ account, chain: arbitrum, transport: custom(window.ethereum!) });

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

The action fields are signed directly as EIP-712 typed data (see [user-signed action](#user-signed-action)) — no
hashing, so you must hand it the `types` that match the action.

Each action type has its own types, exported from `@nktkas/hyperliquid/api/exchange` under the convention
`PascalCase(actionType) + "Types"` — `ApproveAgentTypes` for `approveAgent`, `Withdraw3Types` for `withdraw3`, and so
on.

{% tabs %}

{% tab title="viem" %}

```ts
import { signUserSignedAction } from "@nktkas/hyperliquid/signing";
import { ApproveAgentTypes } from "@nktkas/hyperliquid/api/exchange";
import { privateKeyToAccount } from "viem/accounts";

const wallet = privateKeyToAccount("0x...");

const action = {
  type: "approveAgent",
  signatureChainId: "0x66eee" as const,
  hyperliquidChain: "Mainnet", // or "Testnet"
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
  signatureChainId: "0x66eee" as const,
  hyperliquidChain: "Mainnet", // or "Testnet"
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

const [account] = await window.ethereum!.request({ method: "eth_requestAccounts" }) as `0x${string}`[];
const wallet = createWalletClient({ account, chain: arbitrum, transport: custom(window.ethereum!) });

const action = {
  type: "approveAgent",
  signatureChainId: "0x66eee" as const,
  hyperliquidChain: "Mainnet", // or "Testnet"
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
  signatureChainId: "0x66eee" as const,
  hyperliquidChain: "Mainnet", // or "Testnet"
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
  signatureChainId: "0x66eee" as const,
  hyperliquidChain: "Mainnet", // or "Testnet"
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

`createL1ActionHash` is the keccak256 `connectionId` that `signL1Action` signs internally — `vaultAddress` and
`expiresAfter` feed into it exactly as they do when signing. Compute the hash yourself to verify that your action
serialization matches the SDK's:

```ts
import { createL1ActionHash } from "@nktkas/hyperliquid/signing";

const hash = createL1ActionHash({
  action: { type: "cancel", cancels: [{ a: 0, o: 12345 }] },
  nonce: Date.now(),
});
```

{% hint style="warning" %}

The hash depends on key order in the action object. The expected order varies by action type — look it up in that
action's valibot schema (e.g., `CancelRequest` for `cancel`), or hand the action to [`canonicalize`](#canonicalize).

{% endhint %}

## Canonicalize

`canonicalize` reorders an action's keys to match its valibot schema — the order an [L1 signature](#l1-action) commits
to. The signing functions don't reorder for you, so an action you build by hand must already be in schema order;
`canonicalize` guarantees it:

```ts
import { canonicalize } from "@nktkas/hyperliquid/signing";
import { CancelRequest } from "@nktkas/hyperliquid/api/exchange";

const action = canonicalize(CancelRequest.entries.action, {
  cancels: [{ o: 12345, a: 0 }],
  type: "cancel",
});
// → { type: "cancel", cancels: [{ a: 0, o: 12345 }] }

// `action` is now in schema order — pass it to `signL1Action` or `createL1ActionHash`
```

Each action's request schema is exported from `@nktkas/hyperliquid/api/exchange` under the convention
`PascalCase(actionType) + "Request"` — `CancelRequest` for `cancel`, `OrderRequest` for `order`, and so on; pass its
`.entries.action`. It throws [`CanonicalizeError`](error-handling.md#canonicalizeerror) if the object has an unexpected
key or is missing a required one.

## Multi-sig actions

### signMultiSigL1

One call runs the whole L1 multi-sig flow: it collects an inner signature from every signer, wraps them, and signs the
wrapper with the leader (the first signer in the array).

It returns `{ action, signature }`, where `action` is the multi-sig wrapper — send that, not your original action.

Optional `isTestnet`, `vaultAddress`, and `expiresAfter` behave as in [`signL1Action`](#l1-actions).

{% tabs %}

{% tab title="viem" %}

```ts
import { signMultiSigL1 } from "@nktkas/hyperliquid/signing";
import { privateKeyToAccount } from "viem/accounts";

const multiSigUser = "0x..."; // the multi-sig account address
const signers = [
  privateKeyToAccount("0x..."), // leader — signs the wrapper
  privateKeyToAccount("0x..."),
] as const;

const action = { type: "scheduleCancel", time: Date.now() + 10_000 };
const nonce = Date.now();

const { action: multiSigAction, signature } = await signMultiSigL1({
  signers,
  multiSigUser,
  signatureChainId: "0x66eee",
  action,
  nonce,
});

await fetch("https://api.hyperliquid.xyz/exchange", {
  method: "POST",
  headers: { "Content-Type": "application/json" },
  body: JSON.stringify({ action: multiSigAction, signature, nonce }),
});
```

{% endtab %}

{% tab title="ethers" %}

```ts
import { signMultiSigL1 } from "@nktkas/hyperliquid/signing";
import { Wallet } from "ethers";

const multiSigUser = "0x..."; // the multi-sig account address
const signers = [
  new Wallet("0x..."), // leader
  new Wallet("0x..."),
] as const;

const action = { type: "scheduleCancel", time: Date.now() + 10_000 };
const nonce = Date.now();

const { action: multiSigAction, signature } = await signMultiSigL1({
  signers,
  multiSigUser,
  signatureChainId: "0x66eee",
  action,
  nonce,
});

await fetch("https://api.hyperliquid.xyz/exchange", {
  method: "POST",
  headers: { "Content-Type": "application/json" },
  body: JSON.stringify({ action: multiSigAction, signature, nonce }),
});
```

{% endtab %}

{% tab title="Browser (viem)" %}

```ts
import { signMultiSigL1 } from "@nktkas/hyperliquid/signing";
import { createWalletClient, custom } from "viem";
import { arbitrum } from "viem/chains";

const [account] = await window.ethereum!.request({ method: "eth_requestAccounts" }) as `0x${string}`[];
const leader = createWalletClient({
  account,
  chain: arbitrum,
  transport: custom(window.ethereum!),
});

const multiSigUser = "0x..."; // the multi-sig account address
const signers = [leader /* additional signers */] as const;

const action = { type: "scheduleCancel", time: Date.now() + 10_000 };
const nonce = Date.now();

const { action: multiSigAction, signature } = await signMultiSigL1({
  signers,
  multiSigUser,
  signatureChainId: "0x66eee",
  action,
  nonce,
});

await fetch("https://api.hyperliquid.xyz/exchange", {
  method: "POST",
  headers: { "Content-Type": "application/json" },
  body: JSON.stringify({ action: multiSigAction, signature, nonce }),
});
```

{% endtab %}

{% tab title="Browser (ethers)" %}

```ts
import { signMultiSigL1 } from "@nktkas/hyperliquid/signing";
import { BrowserProvider } from "ethers";

const provider = new BrowserProvider(window.ethereum!);
const leader = await provider.getSigner();

const multiSigUser = "0x..."; // the multi-sig account address
const signers = [leader /* additional signers */] as const;

const action = { type: "scheduleCancel", time: Date.now() + 10_000 };
const nonce = Date.now();

const { action: multiSigAction, signature } = await signMultiSigL1({
  signers,
  multiSigUser,
  signatureChainId: "0x66eee",
  action,
  nonce,
});

await fetch("https://api.hyperliquid.xyz/exchange", {
  method: "POST",
  headers: { "Content-Type": "application/json" },
  body: JSON.stringify({ action: multiSigAction, signature, nonce }),
});
```

{% endtab %}

{% tab title="Custom" %}

```ts
import { signMultiSigL1 } from "@nktkas/hyperliquid/signing";
import type { AbstractViemLocalAccount } from "@nktkas/hyperliquid/signing";

const leader: AbstractViemLocalAccount = {
  address: "0x...",
  async signTypedData({ domain, types, primaryType, message }) {
    // Your EIP-712 signing logic (HSM, MPC, remote signer, etc.)
    return "0x...";
  },
};

const multiSigUser = "0x..."; // the multi-sig account address
const signers = [leader /* additional signers */] as const;

const action = { type: "scheduleCancel", time: Date.now() + 10_000 };
const nonce = Date.now();

const { action: multiSigAction, signature } = await signMultiSigL1({
  signers,
  multiSigUser,
  signatureChainId: "0x66eee",
  action,
  nonce,
});

await fetch("https://api.hyperliquid.xyz/exchange", {
  method: "POST",
  headers: { "Content-Type": "application/json" },
  body: JSON.stringify({ action: multiSigAction, signature, nonce }),
});
```

{% endtab %}

{% endtabs %}

### signMultiSigUserSigned

The user-signed counterpart: one call collects each signer's contribution, wraps it, and signs the wrapper with the
leader (the first signer). For the inner signatures it extends the action's `types` with the multi-sig fields, so you
pass the same `types` as the single-signer call.

It returns `{ action, signature }` — `action` is the wrapper to send, not your original action.

{% tabs %}

{% tab title="viem" %}

```ts
import { signMultiSigUserSigned } from "@nktkas/hyperliquid/signing";
import { UsdSendTypes } from "@nktkas/hyperliquid/api/exchange";
import { privateKeyToAccount } from "viem/accounts";

const multiSigUser = "0x..."; // the multi-sig account address
const signers = [
  privateKeyToAccount("0x..."), // leader
  privateKeyToAccount("0x..."),
] as const;

const action = {
  type: "usdSend",
  signatureChainId: "0x66eee" as const,
  hyperliquidChain: "Mainnet" as const, // or "Testnet"
  destination: "0x...",
  amount: "100",
  time: Date.now(),
};

const { action: multiSigAction, signature } = await signMultiSigUserSigned({
  signers,
  multiSigUser,
  action,
  types: UsdSendTypes,
});

await fetch("https://api.hyperliquid.xyz/exchange", {
  method: "POST",
  headers: { "Content-Type": "application/json" },
  body: JSON.stringify({ action: multiSigAction, signature, nonce: action.time }),
});
```

{% endtab %}

{% tab title="ethers" %}

```ts
import { signMultiSigUserSigned } from "@nktkas/hyperliquid/signing";
import { UsdSendTypes } from "@nktkas/hyperliquid/api/exchange";
import { Wallet } from "ethers";

const multiSigUser = "0x..."; // the multi-sig account address
const signers = [
  new Wallet("0x..."), // leader
  new Wallet("0x..."),
] as const;

const action = {
  type: "usdSend",
  signatureChainId: "0x66eee" as const,
  hyperliquidChain: "Mainnet" as const, // or "Testnet"
  destination: "0x...",
  amount: "100",
  time: Date.now(),
};

const { action: multiSigAction, signature } = await signMultiSigUserSigned({
  signers,
  multiSigUser,
  action,
  types: UsdSendTypes,
});

await fetch("https://api.hyperliquid.xyz/exchange", {
  method: "POST",
  headers: { "Content-Type": "application/json" },
  body: JSON.stringify({ action: multiSigAction, signature, nonce: action.time }),
});
```

{% endtab %}

{% tab title="Browser (viem)" %}

```ts
import { signMultiSigUserSigned } from "@nktkas/hyperliquid/signing";
import { UsdSendTypes } from "@nktkas/hyperliquid/api/exchange";
import { createWalletClient, custom } from "viem";
import { arbitrum } from "viem/chains";

const [account] = await window.ethereum!.request({ method: "eth_requestAccounts" }) as `0x${string}`[];

const leader = createWalletClient({
  account,
  chain: arbitrum,
  transport: custom(window.ethereum!),
});

const multiSigUser = "0x..."; // the multi-sig account address
const signers = [leader /* additional signers */] as const;

const action = {
  type: "usdSend",
  signatureChainId: "0x66eee" as const,
  hyperliquidChain: "Mainnet" as const, // or "Testnet"
  destination: "0x...",
  amount: "100",
  time: Date.now(),
};

const { action: multiSigAction, signature } = await signMultiSigUserSigned({
  signers,
  multiSigUser,
  action,
  types: UsdSendTypes,
});

await fetch("https://api.hyperliquid.xyz/exchange", {
  method: "POST",
  headers: { "Content-Type": "application/json" },
  body: JSON.stringify({ action: multiSigAction, signature, nonce: action.time }),
});
```

{% endtab %}

{% tab title="Browser (ethers)" %}

```ts
import { signMultiSigUserSigned } from "@nktkas/hyperliquid/signing";
import { UsdSendTypes } from "@nktkas/hyperliquid/api/exchange";
import { BrowserProvider } from "ethers";

const provider = new BrowserProvider(window.ethereum!);
const leader = await provider.getSigner();

const multiSigUser = "0x..."; // the multi-sig account address
const signers = [leader /* additional signers */] as const;

const action = {
  type: "usdSend",
  signatureChainId: "0x66eee" as const,
  hyperliquidChain: "Mainnet" as const, // or "Testnet"
  destination: "0x...",
  amount: "100",
  time: Date.now(),
};

const { action: multiSigAction, signature } = await signMultiSigUserSigned({
  signers,
  multiSigUser,
  action,
  types: UsdSendTypes,
});

await fetch("https://api.hyperliquid.xyz/exchange", {
  method: "POST",
  headers: { "Content-Type": "application/json" },
  body: JSON.stringify({ action: multiSigAction, signature, nonce: action.time }),
});
```

{% endtab %}

{% tab title="Custom" %}

```ts
import { signMultiSigUserSigned } from "@nktkas/hyperliquid/signing";
import { UsdSendTypes } from "@nktkas/hyperliquid/api/exchange";
import type { AbstractViemLocalAccount } from "@nktkas/hyperliquid/signing";

const leader: AbstractViemLocalAccount = {
  address: "0x...",
  async signTypedData({ domain, types, primaryType, message }) {
    return "0x...";
  },
};

const multiSigUser = "0x..."; // the multi-sig account address
const signers = [leader /* additional signers */] as const;

const action = {
  type: "usdSend",
  signatureChainId: "0x66eee" as const,
  hyperliquidChain: "Mainnet" as const, // or "Testnet"
  destination: "0x...",
  amount: "100",
  time: Date.now(),
};

const { action: multiSigAction, signature } = await signMultiSigUserSigned({
  signers,
  multiSigUser,
  action,
  types: UsdSendTypes,
});

await fetch("https://api.hyperliquid.xyz/exchange", {
  method: "POST",
  headers: { "Content-Type": "application/json" },
  body: JSON.stringify({ action: multiSigAction, signature, nonce: action.time }),
});
```

{% endtab %}

{% endtabs %}

## Wallet compatibility

All signing functions accept `AbstractWallet` — a union of supported wallet interfaces:

|                                                                                | `signTypedData`  | Address            | Chain ID                |
| ------------------------------------------------------------------------------ | ---------------- | ------------------ | ----------------------- |
| [viem Local Account](https://viem.sh/docs/accounts/local)                      | 1 param (object) | `address` property | fallback `0x1`          |
| [viem JSON-RPC Account](https://viem.sh/docs/clients/wallet#json-rpc-accounts) | 1 param (object) | `getAddresses()`   | `getChainId()`          |
| [ethers Signer](https://docs.ethers.org/v6/api/providers/#Signer)              | 3 params         | `getAddress()`     | `provider.getNetwork()` |

Any object matching one of these interfaces works — for a custom signer (HSM, MPC, remote service), implement the viem
Local Account shape (`address` and `signTypedData`), as in the [Custom tab](#l1-actions).

## Helpers

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
