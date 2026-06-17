# Clients

A client uses a [transport](transports.md) to call a specific part of the Hyperliquid API:

| API                                                                                                            | What it covers                                  | Client                                           |
| -------------------------------------------------------------------------------------------------------------- | ----------------------------------------------- | ------------------------------------------------ |
| [**Info**](https://hyperliquid.gitbook.io/hyperliquid-docs/for-developers/api/info-endpoint)                   | market data, account state                      | [`InfoClient`](#info-endpoint)                   |
| [**Exchange**](https://hyperliquid.gitbook.io/hyperliquid-docs/for-developers/api/exchange-endpoint)           | trading, fund management, account configuration | [`ExchangeClient`](#exchange-endpoint)           |
| [**Subscription**](https://hyperliquid.gitbook.io/hyperliquid-docs/for-developers/api/websocket/subscriptions) | real-time updates via WebSocket                 | [`SubscriptionClient`](#websocket-subscriptions) |
| [**Explorer**](https://app.hyperliquid.xyz/explorer)                                                           | blocks, transactions, and address activity      | [`ExplorerClient`](#explorer-endpoint)           |

## Info endpoint

`InfoClient` is read-only and works with any transport. See all
[Info methods](https://nktkas.gitbook.io/hyperliquid/api-reference/info-methods).

```ts
import { HttpTransport, InfoClient } from "@nktkas/hyperliquid";

const transport = new HttpTransport();
const client = new InfoClient({ transport });

const book = await client.l2Book({ coin: "ETH" });
```

## Exchange endpoint

`ExchangeClient` requires a wallet for [signing](signing.md#wallet-compatibility) and works with any transport. See all
[Exchange methods](https://nktkas.gitbook.io/hyperliquid/api-reference/exchange-methods).

{% tabs %}

{% tab title="viem" %}

```ts
import { ExchangeClient, HttpTransport } from "@nktkas/hyperliquid";
import { privateKeyToAccount } from "viem/accounts";

const wallet = privateKeyToAccount("0x...");

const transport = new HttpTransport();
const client = new ExchangeClient({ transport, wallet });

await client.order({ orders: [/* ... */], grouping: "na" });
```

{% endtab %}

{% tab title="ethers" %}

```ts
import { ExchangeClient, HttpTransport } from "@nktkas/hyperliquid";
import { Wallet } from "ethers";

const wallet = new Wallet("0x...");

const transport = new HttpTransport();
const client = new ExchangeClient({ transport, wallet });

await client.order({ orders: [/* ... */], grouping: "na" });
```

{% endtab %}

{% tab title="Browser (viem)" %}

```ts
import { ExchangeClient, HttpTransport } from "@nktkas/hyperliquid";
import { createWalletClient, custom } from "viem";
import { arbitrum } from "viem/chains";

const [account] = await window.ethereum!.request({ method: "eth_requestAccounts" }) as `0x${string}`[];
const wallet = createWalletClient({ account, chain: arbitrum, transport: custom(window.ethereum!) });

const transport = new HttpTransport();
const client = new ExchangeClient({ transport, wallet });

await client.order({ orders: [/* ... */], grouping: "na" });
```

{% endtab %}

{% tab title="Browser (ethers)" %}

```ts
import { ExchangeClient, HttpTransport } from "@nktkas/hyperliquid";
import { BrowserProvider } from "ethers";

const provider = new BrowserProvider(window.ethereum!);
const wallet = await provider.getSigner();

const transport = new HttpTransport();
const client = new ExchangeClient({ transport, wallet });

await client.order({ orders: [/* ... */], grouping: "na" });
```

{% endtab %}

{% tab title="Custom" %}

Any object matching one of the [supported wallet interfaces](signing.md#wallet-compatibility) works. The minimum
requirement is [`signTypedData`](https://eips.ethereum.org/EIPS/eip-712) and an `address`:

```ts
import { ExchangeClient, HttpTransport } from "@nktkas/hyperliquid";
import type { AbstractViemLocalAccount } from "@nktkas/hyperliquid/signing";

const wallet: AbstractViemLocalAccount = {
  address: "0x...",
  async signTypedData({ domain, types, primaryType, message }) {
    // Your EIP-712 signing logic (HSM, MPC, remote signer, etc.)
    return "0x...";
  },
};

const transport = new HttpTransport();
const client = new ExchangeClient({ transport, wallet });

await client.order({ orders: [/* ... */], grouping: "na" });
```

{% endtab %}

{% endtabs %}

### Multi-sig

[Multi-signature accounts](https://hyperliquid.gitbook.io/hyperliquid-docs/hypercore/multi-sig) require multiple
authorized signers to approve every action. The **leader** (first signer in the array) collects all signatures and
submits the final transaction — only the leader's nonce is validated by the server.

```ts
import { ExchangeClient, HttpTransport } from "@nktkas/hyperliquid";
import { privateKeyToAccount } from "viem/accounts";

const multiSigUser = "0x..."; // the multi-sig account address
const signers = [
  privateKeyToAccount("0x..."), // leader — signs the wrapper
  privateKeyToAccount("0x..."),
] as const;

const transport = new HttpTransport();
const client = new ExchangeClient({ transport, signers, multiSigUser });

// Use the client as usual
await client.order({ orders: [/* ... */], grouping: "na" });
```

### Vault and sub-account trading

To trade on behalf of a vault or sub-account, set a default or pass `vaultAddress` per-request. See
[Subaccounts and vaults](https://hyperliquid.gitbook.io/hyperliquid-docs/for-developers/api/exchange-endpoint#subaccounts-and-vaults).

```ts
const client = new ExchangeClient({
  transport,
  wallet,
  defaultVaultAddress: "0x...", // is included in every API request that supports this feature
});
```

```ts
await client.order({ orders: [/* ... */], grouping: "na" }, {
  vaultAddress: "0x...", // takes precedence over `defaultVaultAddress`
});
```

### Expiration

A server-side guard. The API rejects the action after this timestamp. See
[Expires After](https://hyperliquid.gitbook.io/hyperliquid-docs/for-developers/api/exchange-endpoint#expires-after).

```ts
const client = new ExchangeClient({
  transport,
  wallet,
  defaultExpiresAfter: Date.now() + 60_000, // is included in every API request that supports this feature
});
```

```ts
const client = new ExchangeClient({
  transport,
  wallet,
  defaultExpiresAfter: () => Date.now() + 60_000, // function - recomputed per request
});
```

```ts
await client.order({ orders: [/* ... */], grouping: "na" }, {
  expiresAfter: Date.now() + 60_000, // takes precedence over `defaultExpiresAfter`
});
```

### Signature chain ID

Sets the EIP-712 domain `chainId` for [user-signed actions](signing.md#user-signed-action). Defaults to the wallet's
provider chain ID. Local wallets without a provider (e.g.,
[`privateKeyToAccount`](https://viem.sh/docs/accounts/local/privateKeyToAccount),
[`new Wallet()`](https://docs.ethers.org/v6/api/wallet/#Wallet)) fall back to `0x1`. Override to set a different chain:

```ts
const client = new ExchangeClient({
  transport,
  wallet,
  signatureChainId: "0xa4b1", // static - fixed chain ID
});
```

```ts
const client = new ExchangeClient({
  transport,
  wallet,
  signatureChainId: () => "0xa4b1", // function - recomputed per request
});
```

### Nonce manager

The SDK generates
[nonces](https://hyperliquid.gitbook.io/hyperliquid-docs/for-developers/api/nonces-and-api-wallets#hyperliquid-nonces)
automatically using the `Date.now()` function with auto-increment on duplicates. Replace it if you need custom logic:

```ts
const client = new ExchangeClient({
  transport,
  wallet,
  nonceManager: (address) => Date.now(), // function - recomputed per request
});
```

## WebSocket subscriptions

`SubscriptionClient` requires a [`WebSocketTransport`](transports.md#websocket) — subscriptions can't run over HTTP. See
all [Subscription methods](https://nktkas.gitbook.io/hyperliquid/api-reference/subscription-methods).

```ts
import { SubscriptionClient, WebSocketTransport } from "@nktkas/hyperliquid";

const transport = new WebSocketTransport();
const client = new SubscriptionClient({ transport });

const subscription = await client.allMids((data) => {
  console.log(data.mids);
});
```

### Errors

Each subscription method takes an optional `options` argument — `{ signal?, onError? }`. The `onError` callback runs at
most once, when an already confirmed subscription fails:

- the server rejects a re-subscription after a [reconnect](transports.md#reconnection);
- the connection is permanently terminated;
- the connection goes down while [re-subscription](transports.md#resubscription) is disabled.

Failures before confirmation reject the subscribe promise instead. After `onError` fires, the subscription is removed
and no further events arrive:

```ts
const subscription = await client.allMids(
  (data) => {
    console.log(data.mids);
  },
  {
    onError: (error: TransportError) => {
      // The subscription is gone — inspect the error and re-subscribe if needed
      console.error(error);
    },
  },
);
```

### Unsubscribe

A single connection supports up to
[1000 active subscriptions and 10 unique users](https://hyperliquid.gitbook.io/hyperliquid-docs/for-developers/api/rate-limits-and-user-limits).
Call `unsubscribe()` to remove a listener and free these slots:

```ts
const subscription = await client.allMids((data) => {
  console.log(data.mids);
});

// Later
await subscription.unsubscribe();
```

Subscribing to the same channel multiple times reuses one underlying subscription. Each `unsubscribe()` removes only its
listener — the channel stays open until the last one is removed:

```ts
const sub1 = await client.allMids((data) => console.log("A:", data.mids));
const sub2 = await client.allMids((data) => console.log("B:", data.mids));

await sub1.unsubscribe(); // removes listener A, subscription stays active
await sub2.unsubscribe(); // removes listener B, channel closed
```

## Explorer endpoint

`ExplorerClient` reads the Hyperliquid blockchain [explorer](https://app.hyperliquid.xyz/explorer), which lives on the
RPC endpoint. See all [Explorer methods](https://nktkas.gitbook.io/hyperliquid/api-reference/explorer-methods).

Requests take an `HttpTransport`:

```ts
import { ExplorerClient, HttpTransport } from "@nktkas/hyperliquid";

const transport = new HttpTransport();
const client = new ExplorerClient({ transport });

const block = await client.blockDetails({ height: 123 });
```

Subscriptions take a [`WebSocketTransport`](transports.md#websocket) pointed at the RPC WebSocket URL:

```ts
import { ExplorerClient, WebSocketTransport } from "@nktkas/hyperliquid";

const transport = new WebSocketTransport({ url: "wss://rpc.hyperliquid.xyz/ws" });
const client = new ExplorerClient({ transport });

const sub = await client.explorerBlock((data) => {
  console.log(data);
});
```

## Common options

### Cancellation

Request methods of [`InfoClient`](#info-endpoint) and [`ExplorerClient`](#explorer-endpoint) accept an optional
[`AbortSignal`](https://developer.mozilla.org/en-US/docs/Web/API/AbortSignal) as the last argument:

```ts
const controller = new AbortController();
const mids = await client.allMids(controller.signal);
```

---

[`ExchangeClient`](#exchange-endpoint) methods accept it inside the options object (last argument):

```ts
const controller = new AbortController();
await client.order({ orders: [/* ... */], grouping: "na" }, {
  signal: controller.signal,
});
```

Unlike [`Expiration`](#expiration), which is a server-side guard, cancellation aborts the request on the client side
before or during delivery.
