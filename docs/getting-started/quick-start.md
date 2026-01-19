# Quick Start

Get started with the SDK in just a few lines of code.

{% stepper %}

{% step %}

### Set up Transport

First, create a [Transport](/core-concepts/transports) - the layer that handles communication with Hyperliquid servers.

{% tabs %}

{% tab title="HTTP" %}

Use [`HttpTransport`](/core-concepts/transports#httptransport) for simple requests.

```ts
import { HttpTransport } from "@nktkas/hyperliquid";

const transport = new HttpTransport();
```

{% endtab %}

{% tab title="WebSocket" %}

Use [`WebSocketTransport`](/core-concepts/transports#websockettransport) for subscriptions or lower latency.

```ts
import { WebSocketTransport } from "@nktkas/hyperliquid";

const transport = new WebSocketTransport();
```

{% endtab %}

{% endtabs %}

{% endstep %}

{% step %}

### Create a Client

Next, create a [Client](/core-concepts/clients) with your transport. The SDK provides three clients for different
purposes:

{% tabs %}

{% tab title="Info endpoint" %}

Use [`Info`](/core-concepts/clients#infoclient) to query market data, account state, and other read-only information.

```ts
import { HttpTransport, InfoClient } from "@nktkas/hyperliquid";

const transport = new HttpTransport();
const info = new InfoClient({ transport });
```

{% endtab %}

{% tab title="Exchange endpoint" %}

Use [`ExchangeClient`](/core-concepts/clients#exchangeclient) to place orders, transfer funds, and perform other actions
that require signing.

```ts
import { ExchangeClient, HttpTransport } from "@nktkas/hyperliquid";
import { privateKeyToAccount } from "viem/accounts";

const wallet = privateKeyToAccount("0x..."); // viem account or ethers signer

const transport = new HttpTransport();
const exchange = new ExchangeClient({ transport, wallet });
```

{% endtab %}

{% tab title="Subscription" %}

Use [`SubscriptionClient`](/core-concepts/clients#subscriptionclient) to subscribe to live market data via WebSocket.

```ts
import { SubscriptionClient, WebSocketTransport } from "@nktkas/hyperliquid";

const transport = new WebSocketTransport();
const subs = new SubscriptionClient({ transport });
```

{% endtab %}

{% endtabs %}

{% endstep %}

{% step %}

### Use the Client

Call client methods to query data, place orders, or subscribe to streams.

{% tabs %}

{% tab title="Info endpoint" %}

```ts
// Retrieve mids for all coins
const mids = await info.allMids();

// Retrieve a user's open orders
const openOrders = await info.openOrders({ user: "0x..." });

// L2 book snapshot
const book = await info.l2Book({ coin: "BTC" });
```

{% endtab %}

{% tab title="Exchange endpoint" %}

```ts
// Place an order
const result = await exchange.order({
  orders: [{
    a: 0,
    b: true,
    p: "95000",
    s: "0.01",
    r: false,
    t: { limit: { tif: "Gtc" } },
  }],
  grouping: "na",
});

// Update leverage
await exchange.updateLeverage({ asset: 0, isCross: true, leverage: 5 });

// Initiate a withdrawal request
await exchange.withdraw3({ destination: "0x...", amount: "1" });
```

{% endtab %}

{% tab title="Subscription" %}

```ts
// Subscribe to mids for all coins
await subs.allMids((data) => {
  console.log(data);
});

// Subscribe to user's open orders
await subs.openOrders({ user: "0x..." }, (data) => {
  console.log(data);
});

// Subscribe to L2 book snapshot
await subs.l2Book({ coin: "ETH" }, (data) => {
  console.log(data);
});
```

{% endtab %}

{% endtabs %}

{% endstep %}

{% endstepper %}
