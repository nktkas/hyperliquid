# Tree-shaking

The SDK is organized into modular entry points so bundlers can eliminate unused code.

## Entry points

The following table lists the available entry points:

| Entry point                            | Contains                                       |
| -------------------------------------- | ---------------------------------------------- |
| `@nktkas/hyperliquid`                  | Transports, clients, error classes             |
| `@nktkas/hyperliquid/signing`          | Signing functions, wallet utilities            |
| `@nktkas/hyperliquid/utils`            | `formatPrice`, `formatSize`, `SymbolConverter` |
| `@nktkas/hyperliquid/api/info`         | Info methods, individually importable          |
| `@nktkas/hyperliquid/api/exchange`     | Exchange methods, individually importable      |
| `@nktkas/hyperliquid/api/subscription` | Subscription methods, individually importable  |

Each entry point has independent dependencies. Importing `@nktkas/hyperliquid/utils` doesn't pull in signing or
validation code.

## Direct method imports

Instead of creating a [client](../clients.md) (which bundles all methods), import individual methods directly. Each
method accepts the same config as its client as the first argument.

Info methods use [`InfoClient`](../clients.md#read-data) config:

```ts
import { HttpTransport } from "@nktkas/hyperliquid";
import { allMids } from "@nktkas/hyperliquid/api/info";

const transport = new HttpTransport();
const result = await allMids({ transport });
```

This bundles only the `allMids` method, its validation schema, and the transport logic — not the full `InfoClient` with
all methods.

Exchange methods use [`ExchangeClient`](../clients.md#trading) config:

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

Subscription methods use [`SubscriptionClient`](../clients.md#real-time-updates) config:

```ts
import { WebSocketTransport } from "@nktkas/hyperliquid";
import { allMids } from "@nktkas/hyperliquid/api/subscription";

const transport = new WebSocketTransport();
const subscription = await allMids({ transport }, (data) => {
  console.log(data.mids);
});
```
