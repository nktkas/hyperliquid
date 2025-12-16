# Signing

Low-level utilities for signing Hyperliquid transactions. Most users don't need this -
[`ExchangeClient`](../core-concepts/clients.md#exchangeclient) handles signing automatically.

Use these utilities when:

- **Custom wallet integration** - implement `AbstractViemLocalAccount` to use hardware wallets, MPC, or other signing
  systems
- **Signing unsupported actions** - sign new action types that are not yet implemented in the SDK

## Import

```ts
import {
  createL1ActionHash,
  PrivateKeySigner,
  signL1Action,
  signMultiSigAction,
  signUserSignedAction,
} from "@nktkas/hyperliquid/signing";
```

## PrivateKeySigner

Lightweight signer that doesn't require viem or ethers.

```ts
import { PrivateKeySigner } from "@nktkas/hyperliquid/signing";

const signer = new PrivateKeySigner("0xabc123...");
console.log(signer.address); // "0x..."
```

Use with `ExchangeClient`:

```ts
import { ExchangeClient, HttpTransport } from "@nktkas/hyperliquid";
import { PrivateKeySigner } from "@nktkas/hyperliquid/signing";

const client = new ExchangeClient({
  transport: new HttpTransport(),
  wallet: new PrivateKeySigner("0x..."),
});
```

## signL1Action

Signs an L1 action - trading operations like orders, cancels, leverage updates, TWAP, vault operations, etc.

```ts
import { signL1Action } from "@nktkas/hyperliquid/signing";
import { privateKeyToAccount } from "viem/accounts";

const wallet = privateKeyToAccount("0x...");

const action = {
  type: "cancel",
  cancels: [{ a: 0, o: 12345 }],
};
const nonce = Date.now();

const signature = await signL1Action({ wallet, action, nonce });

// Send manually
const response = await fetch("https://api.hyperliquid.xyz/exchange", {
  method: "POST",
  headers: { "Content-Type": "application/json" },
  body: JSON.stringify({ action, signature, nonce }),
});
```

### Parameters

#### wallet (required)

- **Type:** `AbstractWallet`

Wallet to sign (viem, ethers, or PrivateKeySigner).

#### action (required)

- **Type:** `Record<string, unknown>`

Action object. Key order matters for hash calculation.

#### nonce (required)

- **Type:** `number`

Timestamp in milliseconds.

#### isTestnet (optional)

- **Type:** `boolean`
- **Default:** `false`

Use testnet instead of mainnet.

#### vaultAddress (optional)

- **Type:** `` `0x${string}` ``

[Vault address](https://hyperliquid.gitbook.io/hyperliquid-docs/for-developers/api/exchange-endpoint#subaccounts-and-vaults)
for trading on behalf of a vault.

#### expiresAfter (optional)

- **Type:** `number`

[Expiration time](https://hyperliquid.gitbook.io/hyperliquid-docs/for-developers/api/exchange-endpoint#expires-after) of
the action in milliseconds since epoch.

{% hint style="warning" %}

The action hash depends on key order. Use valibot schema to guarantee correct order:

```ts
import { CancelByCloidRequest } from "@nktkas/hyperliquid/api/exchange";
import * as v from "valibot";

const action = v.parse(CancelByCloidRequest.entries.action, {
  cancels: [{ cloid: 12345, asset: 0 }],
  type: "cancel",
});
// => { type, cancels: [{ asset, cloid }] }
```

{% endhint %}

## signUserSignedAction

Signs a user-signed action - transfers and administrative operations like withdraw, usdSend, spotSend, approveAgent,
etc. Uses EIP-712 typed data with `signatureChainId`.

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
  agentName: "MyAgent",
  nonce: Date.now(),
};

const signature = await signUserSignedAction({
  wallet,
  action,
  types: ApproveAgentTypes,
});
```

### Parameters

#### wallet (required)

- **Type:** `AbstractWallet`

Wallet to sign (viem, ethers, or PrivateKeySigner).

#### action (required)

- **Type:** `object`

Action object with `signatureChainId` field.

#### types (required)

- **Type:** `object`

EIP-712 types for the action. Import from `@nktkas/hyperliquid/api/exchange` (e.g., `ApproveAgentTypes`).

## signMultiSigAction

Signs a multi-signature action. Requires signatures from multiple signers collected beforehand.

```ts
import { signL1Action, signMultiSigAction } from "@nktkas/hyperliquid/signing";
import { privateKeyToAccount } from "viem/accounts";

const multiSigUser = "0x..."; // multi-sig account address
const signerKeys = ["0x...", "0x..."]; // private keys of all signers
const leader = privateKeyToAccount(signerKeys[0] as `0x${string}`);

const action = {
  type: "scheduleCancel",
  time: Date.now() + 10000,
};
const nonce = Date.now();

// Collect signatures from all signers
const signatures = await Promise.all(
  signerKeys.map((key) =>
    signL1Action({
      wallet: privateKeyToAccount(key as `0x${string}`),
      action: [multiSigUser.toLowerCase(), leader.address.toLowerCase(), action],
      nonce,
      isTestnet: false,
    })
  ),
);

// Sign the multi-sig wrapper
const multiSigAction = {
  type: "multiSig",
  signatureChainId: "0x66eee",
  signatures,
  payload: {
    multiSigUser,
    outerSigner: leader.address,
    action,
  },
};

const signature = await signMultiSigAction({
  wallet: leader,
  action: multiSigAction,
  nonce,
});
```

## createL1ActionHash

Creates a hash of an L1 action without signing. Used internally by `signL1Action` as `connectionId` in EIP-712
structure. The hash depends on key order in the action object.

```ts
import { createL1ActionHash } from "@nktkas/hyperliquid/signing";

const action = {
  type: "cancel",
  cancels: [{ a: 0, o: 12345 }],
};

const hash = createL1ActionHash({
  action,
  nonce: Date.now(),
});
// => "0x..."
```

## AbstractWallet

The SDK accepts any wallet that implements `signTypedData`. Supported out of the box:

- **viem:** [Local accounts](https://viem.sh/docs/accounts/local),
  [JSON-RPC accounts](https://viem.sh/docs/accounts/jsonRpc)
- **ethers:** [Wallet](https://docs.ethers.org/v6/api/wallet/),
  [JsonRpcSigner](https://docs.ethers.org/v6/api/providers/jsonrpc/#JsonRpcSigner)
- Any object with `address` and `signTypedData` method

```ts
// viem
import { privateKeyToAccount } from "viem/accounts";
const wallet = privateKeyToAccount("0x...");

// ethers
import { Wallet } from "ethers";
const wallet = new Wallet("0x...");

// SDK (no viem or ethers dependency)
import { PrivateKeySigner } from "@nktkas/hyperliquid/signing";
const wallet = new PrivateKeySigner("0x...");
```
