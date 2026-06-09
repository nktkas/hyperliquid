# Tree-shaking

The SDK is organized into modular entry points so bundlers can eliminate unused code.

## Entry points

| Entry point                                    | Contains                                                                                                                  |
| ---------------------------------------------- | ------------------------------------------------------------------------------------------------------------------------- |
| `@nktkas/hyperliquid`                          | [Transports](../transports.md), [clients](../clients.md), [error classes](../error-handling.md)                           |
| [`@nktkas/hyperliquid/signing`](../signing.md) | Signing functions, wallet utilities                                                                                       |
| [`@nktkas/hyperliquid/utils`](../utilities.md) | `formatPrice`, `formatSize`, `SymbolConverter`                                                                            |
| `@nktkas/hyperliquid/api/info`                 | [Info methods](https://nktkas.gitbook.io/hyperliquid/api-reference/info-methods), individually importable                 |
| `@nktkas/hyperliquid/api/exchange`             | [Exchange methods](https://nktkas.gitbook.io/hyperliquid/api-reference/exchange-methods), individually importable         |
| `@nktkas/hyperliquid/api/subscription`         | [Subscription methods](https://nktkas.gitbook.io/hyperliquid/api-reference/subscription-methods), individually importable |
| `@nktkas/hyperliquid/api/explorer`             | [Explorer methods](https://nktkas.gitbook.io/hyperliquid/api-reference/explorer-methods), individually importable         |

Each entry point has independent dependencies — e.g., importing `@nktkas/hyperliquid/utils` doesn't pull in signing or
validation code.

## Direct method imports

Instead of creating a [client](../clients.md), import individual methods directly: each import pulls in only that
method, its validation schema, and the transport logic — not the full client with all its methods.

Each method accepts the same config as its client as the first argument:

Info methods use [`InfoClient`](../clients.md#info-endpoint) config:

```ts
import { HttpTransport } from "@nktkas/hyperliquid";
import { allMids } from "@nktkas/hyperliquid/api/info";

const transport = new HttpTransport();
const result = await allMids({ transport });
```

Exchange methods use [`ExchangeClient`](../clients.md#exchange-endpoint) config:

```ts
import { HttpTransport } from "@nktkas/hyperliquid";
import { order } from "@nktkas/hyperliquid/api/exchange";
import { privateKeyToAccount } from "viem/accounts";

const transport = new HttpTransport();
const wallet = privateKeyToAccount("0x...");

await order(
  { transport, wallet },
  {
    orders: [{
      a: 0,
      b: true,
      p: "50000",
      s: "0.01",
      r: false,
      t: { limit: { tif: "Gtc" } },
    }],
    grouping: "na",
  },
);
```

Subscription methods use [`SubscriptionClient`](../clients.md#websocket-subscriptions) config:

```ts
import { WebSocketTransport } from "@nktkas/hyperliquid";
import { allMids } from "@nktkas/hyperliquid/api/subscription";

const transport = new WebSocketTransport();
const subscription = await allMids({ transport }, (data) => {
  console.log(data.mids);
});
```

Explorer methods use [`ExplorerClient`](../clients.md#explorer-endpoint) config:

```ts
import { HttpTransport } from "@nktkas/hyperliquid";
import { blockDetails } from "@nktkas/hyperliquid/api/explorer";

const transport = new HttpTransport();
const block = await blockDetails({ transport }, { height: 123 });
```
