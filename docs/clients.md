# Clients

A client uses a [transport](transports.md) to call a specific part of the Hyperliquid API:

- **Info:** market data, account state, blockchain explorer
- **Exchange:** trading, fund management, account configuration
- **Subscription:** real-time updates via WebSocket

## Read data

`InfoClient` gives read-only access to the
[Info endpoint](https://hyperliquid.gitbook.io/hyperliquid-docs/for-developers/api/info-endpoint). Works with any
transport.

```ts
import { HttpTransport, InfoClient } from "@nktkas/hyperliquid";

const transport = new HttpTransport();
const client = new InfoClient({ transport });

const mids = await client.allMids();
const book = await client.l2Book({ coin: "ETH" });
```

## Trading

`ExchangeClient` executes actions on the
[Exchange endpoint](https://hyperliquid.gitbook.io/hyperliquid-docs/for-developers/api/exchange-endpoint): trading, fund
management, and account configuration. Requires a wallet for [signing](signing.md#wallet-compatibility) and works with
any transport.

{% tabs %}

{% tab title="viem" %}

```ts
import { ExchangeClient, HttpTransport } from "@nktkas/hyperliquid";
import { privateKeyToAccount } from "viem/accounts";

const transport = new HttpTransport();
const client = new ExchangeClient({
  transport,
  wallet: privateKeyToAccount("0x..."),
});
```

{% endtab %}

{% tab title="ethers" %}

```ts
import { ExchangeClient, HttpTransport } from "@nktkas/hyperliquid";
import { Wallet } from "ethers";

const transport = new HttpTransport();
const client = new ExchangeClient({
  transport,
  wallet: new Wallet("0x..."),
});
```

{% endtab %}

{% tab title="Browser (viem)" %}

Use a [JSON-RPC Account](https://viem.sh/docs/clients/wallet#json-rpc-accounts) to connect browser extensions like
MetaMask:

```ts
import { ExchangeClient, HttpTransport } from "@nktkas/hyperliquid";
import { createWalletClient, custom } from "viem";
import { arbitrum } from "viem/chains";

const wallet = createWalletClient({
  chain: arbitrum,
  transport: custom(window.ethereum!),
});

const transport = new HttpTransport();
const client = new ExchangeClient({ transport, wallet });
```

{% endtab %}

{% tab title="Browser (ethers)" %}

Use a [BrowserProvider](https://docs.ethers.org/v6/api/providers/#BrowserProvider) to connect browser extensions like
MetaMask:

```ts
import { ExchangeClient, HttpTransport } from "@nktkas/hyperliquid";
import { BrowserProvider } from "ethers";

const provider = new BrowserProvider(window.ethereum!);
const wallet = await provider.getSigner();

const transport = new HttpTransport();
const client = new ExchangeClient({ transport, wallet });
```

{% endtab %}

{% tab title="Custom" %}

Any object matching one of the [supported wallet interfaces](signing.md#wallet-compatibility) works. The minimum
requirement is [`signTypedData`](https://eips.ethereum.org/EIPS/eip-712) and an address:

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
```

{% endtab %}

{% endtabs %}

Place an order:

```ts
await client.order({
  orders: [{
    a: 0, // asset index
    b: true, // buy
    p: "50000", // price
    s: "0.01", // size
    r: false, // not reduce-only
    t: { limit: { tif: "Gtc" } }, // Good 'til Cancelled
  }],
  grouping: "na",
});
```

### Multi-sig

[Multi-signature accounts](https://hyperliquid.gitbook.io/hyperliquid-docs/hypercore/multi-sig) require multiple
authorized signers to approve every action. The **leader** (first signer in the array) collects all signatures and
submits the final transaction — only the leader's nonce is validated by the server.

```ts
import { ExchangeClient, HttpTransport } from "@nktkas/hyperliquid";
import { privateKeyToAccount } from "viem/accounts";

const transport = new HttpTransport();
const client = new ExchangeClient({
  transport,
  signers: [
    privateKeyToAccount("0x..."), // leader — submits the transaction
    privateKeyToAccount("0x..."),
  ],
  multiSigUser: "0x...", // the multi-sig account address
});
```

### Vault and sub-account trading

To trade on behalf of a
[vault or sub-account](https://hyperliquid.gitbook.io/hyperliquid-docs/for-developers/api/exchange-endpoint#subaccounts-and-vaults),
set a default or pass `vaultAddress` per-request:

```ts
const client = new ExchangeClient({
  transport,
  wallet,
  defaultVaultAddress: "0x...",
});
```

```ts
await client.order({ orders: [/* ... */], grouping: "na" }, {
  vaultAddress: "0x...",
});
```

### Expiration

A server-side guard. The API rejects the action after this timestamp (milliseconds). See
[Expires After](https://hyperliquid.gitbook.io/hyperliquid-docs/for-developers/api/exchange-endpoint#expires-after).

```ts
const client = new ExchangeClient({
  transport,
  wallet,
  defaultExpiresAfter: () => Date.now() + 60_000, // function - recomputed per request
});
```

```ts
const client = new ExchangeClient({
  transport,
  wallet,
  defaultExpiresAfter: Date.now() + 60_000, // static - fixed at construction time
});
```

```ts
await client.order({ orders: [/* ... */], grouping: "na" }, {
  expiresAfter: Date.now() + 60_000, // per-request override
});
```

### Signature chain ID

Sets the EIP-712 domain `chainId` for [user-signed actions](signing.md#user-signed-action-protocol). Defaults to the
wallet's provider chain ID. Local wallets without a provider (e.g.,
[`privateKeyToAccount`](https://viem.sh/docs/accounts/local/privateKeyToAccount),
[`new Wallet()`](https://docs.ethers.org/v6/api/wallet/#Wallet)) fall back to `0x1` (Ethereum mainnet). Override to set
the correct chain:

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
automatically using timestamps with auto-increment. Replace it if you need custom logic:

```ts
const client = new ExchangeClient({
  transport,
  wallet,
  nonceManager: (address) => Date.now(), // function - recomputed per request
});
```

## Real-time updates

`SubscriptionClient` streams live data via
[WebSocket subscriptions](https://hyperliquid.gitbook.io/hyperliquid-docs/for-developers/api/websocket/subscriptions).
Requires [`WebSocketTransport`](transports.md#websocket).

```ts
import { SubscriptionClient, WebSocketTransport } from "@nktkas/hyperliquid";

const transport = new WebSocketTransport();
const client = new SubscriptionClient({ transport });

const subscription = await client.allMids((data) => {
  console.log(data.mids);
});
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

### Handle failures

When the WebSocket [reconnects](transports.md#reconnection), the SDK automatically resubscribes to all active channels.
If resubscription fails for a channel, its `failureSignal` aborts with the error:

```ts
const subscription = await client.allMids((data) => {
  console.log(data.mids);
});

subscription.failureSignal.addEventListener("abort", () => {
  console.error("Resubscription failed:", subscription.failureSignal.reason);
  // Create a new subscription or explore the error...
});
```

## Common options

### Cancellation

`InfoClient` methods accept an optional [`AbortSignal`](https://developer.mozilla.org/en-US/docs/Web/API/AbortSignal) as
the last argument:

```ts
const controller = new AbortController();
const mids = await client.allMids(controller.signal);
```

`ExchangeClient` methods accept it inside the options object (also last argument). Unlike [Expiration](#expiration),
which is a server-side guard, cancellation aborts the request on the client side before or during delivery:

```ts
const controller = new AbortController();
await client.order({ orders: [/* ... */], grouping: "na" }, {
  signal: controller.signal,
});
```
