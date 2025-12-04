# Quick Start

Get started with the SDK in just a few lines of code.

## 1. Set up Transport

First, create a [Transport](/core-concepts/transports) — the layer that handles communication with Hyperliquid servers.

```ts
import { HttpTransport } from "@nktkas/hyperliquid";

const transport = new HttpTransport();
```

::: tip Use [`HttpTransport`](/core-concepts/transports#httptransport) for simple requests. Use
[`WebSocketTransport`](/core-concepts/transports#websockettransport) for subscriptions or lower latency. :::

## 2. Create a Client

Next, create a [Client](/core-concepts/clients) with your transport. The SDK provides three clients for different
purposes:

### 2.a InfoClient — Read Data

Use [`InfoClient`](/core-concepts/clients#infoclient) to query market data, account state, and other read-only
information.

```ts
import { HttpTransport, InfoClient } from "@nktkas/hyperliquid";

const transport = new HttpTransport();

const client = new InfoClient({ transport });

// Get mid prices for all assets
const mids = await client.allMids();
// => { "BTC": "97000.5", "ETH": "3500.25", ... }
```

### 2.b ExchangeClient — Execute Actions

Use [`ExchangeClient`](/core-concepts/clients#exchangeclient) to place orders, transfer funds, and perform other actions
that require signing.

```ts
import { ExchangeClient, HttpTransport } from "@nktkas/hyperliquid";
import { privateKeyToAccount } from "viem/accounts";

const transport = new HttpTransport();

const client = new ExchangeClient({
  transport,
  wallet: privateKeyToAccount("0x..."), // viem account or ethers signer
});

// Place a limit order
const result = await client.order({
  orders: [{
    a: 0, // Asset index (0 = BTC)
    b: true, // Buy side
    p: "95000", // Price
    s: "0.01", // Size
    r: false, // Not reduce-only
    t: { limit: { tif: "Gtc" } },
  }],
  grouping: "na",
});
// => { status: "ok", response: { type: "order", data: { statuses: [...] } } }
```

### 2.c SubscriptionClient — Real-time Updates

Use [`SubscriptionClient`](/core-concepts/clients#subscriptionclient) to subscribe to live market data via WebSocket.

```ts
import { SubscriptionClient, WebSocketTransport } from "@nktkas/hyperliquid";

const transport = new WebSocketTransport();

const client = new SubscriptionClient({ transport });

// Subscribe to all mid prices
const subscription = await client.allMids((data) => {
  console.log("Price update:", data.mids);
});

// Later: unsubscribe
await subscription.unsubscribe();
```
