# Clients

Clients provide methods to interact with the Hyperliquid API. Each client corresponds to a specific API type.

## InfoClient

Read-only access to market data, user state, and other public information. Corresponds to the
[Info endpoint](https://hyperliquid.gitbook.io/hyperliquid-docs/for-developers/api/info-endpoint).

### Import

```ts
import { InfoClient } from "@nktkas/hyperliquid";
```

### Usage

```ts
import { HttpTransport, InfoClient } from "@nktkas/hyperliquid";

const transport = new HttpTransport();
const client = new InfoClient({ transport });

// Get all mid prices
const mids = await client.allMids();

// Get user's perpetual positions
const state = await client.clearinghouseState({
  user: "0x...",
});
```

### Parameters

#### transport (required)

- **Type:** [`HttpTransport`](./transports.md#httptransport) |
  [`WebSocketTransport`](./transports.md#websockettransport)

The transport used to send requests.

```ts
const client = new InfoClient({
  transport: new HttpTransport(),
});
```

## ExchangeClient

Execute actions: place orders, cancel orders, transfer funds, etc. Corresponds to the
[Exchange endpoint](https://hyperliquid.gitbook.io/hyperliquid-docs/for-developers/api/exchange-endpoint).

Requires a wallet for signing. The SDK handles
[signing](https://hyperliquid.gitbook.io/hyperliquid-docs/for-developers/api/signing) and
[nonces](https://hyperliquid.gitbook.io/hyperliquid-docs/for-developers/api/nonces-and-api-wallets) automatically.

### Import

```ts
import { ExchangeClient } from "@nktkas/hyperliquid";
```

### Usage with viem

```ts
import { ExchangeClient, HttpTransport } from "@nktkas/hyperliquid";
import { privateKeyToAccount } from "viem/accounts";

const wallet = privateKeyToAccount("0x...");
const transport = new HttpTransport();

const client = new ExchangeClient({ transport, wallet });

// Place a limit order
const result = await client.order({
  orders: [{
    a: 0, // asset index (BTC)
    b: true, // buy
    p: "50000", // price
    s: "0.01", // size
    r: false, // not reduce-only
    t: { limit: { tif: "Gtc" } },
  }],
  grouping: "na",
});
```

### Usage with ethers

```ts
import { ExchangeClient, HttpTransport } from "@nktkas/hyperliquid";
import { ethers } from "ethers";

const wallet = new ethers.Wallet("0x...");
const transport = new HttpTransport();

const client = new ExchangeClient({ transport, wallet });
```

### Usage with Multi-Sig

```ts
import { ExchangeClient, HttpTransport } from "@nktkas/hyperliquid";
import { privateKeyToAccount } from "viem/accounts";

const signer1 = privateKeyToAccount("0x...");
const signer2 = privateKeyToAccount("0x...");

const client = new ExchangeClient({
  transport: new HttpTransport(),
  signers: [signer1, signer2], // any number of signers
  multiSigUser: "0x...", // multi-sig account address
});
```

### Parameters

#### transport (required)

- **Type:** [`HttpTransport`](./transports.md#httptransport) |
  [`WebSocketTransport`](./transports.md#websockettransport)

The transport used to send requests.

#### wallet (required for single wallet)

- **Type:** `AbstractWallet`

The wallet used to sign requests. Supports:

- **viem:** [Local accounts](https://viem.sh/docs/accounts/local),
  [JSON-RPC accounts](https://viem.sh/docs/accounts/jsonRpc)
- **ethers:** [Wallet](https://docs.ethers.org/v6/api/wallet/),
  [JsonRpcSigner](https://docs.ethers.org/v6/api/providers/jsonrpc/#JsonRpcSigner)
- Any object with `address` and `signTypedData` method

#### signers (required for multi-sig)

- **Type:** `[AbstractWallet, ...AbstractWallet[]]`

Array of wallets for multi-sig signing. The first wallet is the
[leader](https://hyperliquid.gitbook.io/hyperliquid-docs/hypercore/multi-sig).

#### multiSigUser (required for multi-sig)

- **Type:** `` `0x${string}` ``

The multi-signature account address.

#### signatureChainId (optional)

- **Type:** `` `0x${string}` `` | `(() => MaybePromise<`0x${string}`>)`
- **Default:** Wallet's connected chain ID

Custom chain ID for EIP-712 signing.

```ts
const client = new ExchangeClient({
  transport,
  wallet,
  signatureChainId: "0xa4b1", // Arbitrum One
});
```

#### defaultVaultAddress (optional)

- **Type:** `` `0x${string}` ``

Default vault address for vault-based operations. Can be overridden per-request.

```ts
const client = new ExchangeClient({
  transport,
  wallet,
  defaultVaultAddress: "0x...",
});

// Uses defaultVaultAddress
await client.order({ ... });

// Override for this request
await client.order({ ... }, { vaultAddress: "0x..." });
```

#### defaultExpiresAfter (optional)

- **Type:** `number` | `(() => MaybePromise<number>)`

Default expiration time in milliseconds for actions. See
[Expires After](https://hyperliquid.gitbook.io/hyperliquid-docs/for-developers/api/exchange-endpoint#expires-after).

```ts
const client = new ExchangeClient({
  transport,
  wallet,
  defaultExpiresAfter: 60000, // 1 minute
});
```

#### nonceManager (optional)

- **Type:** `(address: string) => MaybePromise<number>`
- **Default:** Timestamp-based with auto-increment

Custom nonce generator. See
[Hyperliquid nonces](https://hyperliquid.gitbook.io/hyperliquid-docs/for-developers/api/nonces-and-api-wallets#hyperliquid-nonces).

```ts
const client = new ExchangeClient({
  transport,
  wallet,
  nonceManager: async (address) => Date.now(),
});
```

## SubscriptionClient

Real-time data via WebSocket subscriptions. Corresponds to
[WebSocket subscriptions](https://hyperliquid.gitbook.io/hyperliquid-docs/for-developers/api/websocket/subscriptions).

**Requires [`WebSocketTransport`](./transports.md#websockettransport).**

### Import

```ts
import { SubscriptionClient } from "@nktkas/hyperliquid";
```

### Usage

```ts
import { SubscriptionClient, WebSocketTransport } from "@nktkas/hyperliquid";

const transport = new WebSocketTransport();
const client = new SubscriptionClient({ transport });

// Subscribe to all mid prices
const subscription = await client.allMids((data) => {
  console.log(data.mids);
});

// Later: unsubscribe
await subscription.unsubscribe();
```

### Subscription Object

Each subscription returns an object with:

- `unsubscribe()` — Stop receiving updates
- `failureSignal` — AbortSignal that aborts if resubscription fails after reconnect

```ts
const subscription = await client.trades({ coin: "BTC" }, (data) => {
  console.log(data);
});

subscription.failureSignal.addEventListener("abort", (event) => {
  console.error("Subscription failed:", event.target.reason);
});
```

### Parameters

#### transport (required)

- **Type:** [`WebSocketTransport`](./transports.md#websockettransport)

Must be [`WebSocketTransport`](./transports.md#websockettransport). Does not work with
[`HttpTransport`](./transports.md#httptransport).

```ts
const client = new SubscriptionClient({
  transport: new WebSocketTransport(),
});
```
