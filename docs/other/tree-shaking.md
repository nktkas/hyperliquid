# Tree-shaking

The SDK supports tree-shaking through granular imports - reduce bundle size by ~50% by importing only the functions you
need.

## Import

```ts
// Granular imports (tree-shakeable)
import { clearinghouseState } from "@nktkas/hyperliquid/api/info";
import { order } from "@nktkas/hyperliquid/api/exchange";
import { candle } from "@nktkas/hyperliquid/api/subscription";
```

## Usage

Functions have the same names as client methods. Instead of `client.order(...)`, you call `order(config, ...)`:

```ts
import { HttpTransport } from "@nktkas/hyperliquid";
import { order } from "@nktkas/hyperliquid/api/exchange";
import { privateKeyToAccount } from "viem/accounts";

const transport = new HttpTransport();
const wallet = privateKeyToAccount("0x...");

// Function takes config as first argument
const result = await order(
  { transport, wallet },
  {
    orders: [{
      a: 0,
      b: true,
      p: "30000",
      s: "0.1",
      r: false,
      t: { limit: { tif: "Gtc" } },
    }],
    grouping: "na",
  },
);
```

Compare with client approach:

```ts
import { ExchangeClient, HttpTransport } from "@nktkas/hyperliquid";
import { privateKeyToAccount } from "viem/accounts";

const wallet = privateKeyToAccount("0x...");

const transport = new HttpTransport();
const client = new ExchangeClient({ transport, wallet });

// Method on client instance
const result = await client.order({
  orders: [{
    a: 0,
    b: true,
    p: "30000",
    s: "0.1",
    r: false,
    t: { limit: { tif: "Gtc" } },
  }],
  grouping: "na",
});
```

## Info Functions

Info functions only need `transport`:

```ts
import { HttpTransport } from "@nktkas/hyperliquid";
import { allMids } from "@nktkas/hyperliquid/api/info";

const transport = new HttpTransport();

const mids = await allMids({ transport });
```

## Exchange Functions

Exchange functions require `transport` and `wallet`:

```ts
import { HttpTransport } from "@nktkas/hyperliquid";
import { order } from "@nktkas/hyperliquid/api/exchange";
import { privateKeyToAccount } from "viem/accounts";

const transport = new HttpTransport();
const wallet = privateKeyToAccount("0x...");

const result = await order(
  { transport, wallet },
  {
    orders: [{ a: 0, b: true, p: "30000", s: "0.1", r: false, t: { limit: { tif: "Gtc" } } }],
    grouping: "na",
  },
);
```

## Subscription Functions

Subscription functions require `WebSocketTransport`:

```ts
import { WebSocketTransport } from "@nktkas/hyperliquid";
import { trades } from "@nktkas/hyperliquid/api/subscription";

const transport = new WebSocketTransport();

const subscription = await trades({ transport }, { coin: "BTC" }, (data) => {
  console.log(data);
});
```

## Available Exports

| Export Path                            | Description                                                        |
| -------------------------------------- | ------------------------------------------------------------------ |
| `@nktkas/hyperliquid/api/info`         | Info API functions (`clearinghouseState`, `meta`, `allMids`, etc.) |
| `@nktkas/hyperliquid/api/exchange`     | Exchange API functions (`order`, `cancel`, `withdraw3`, etc.)      |
| `@nktkas/hyperliquid/api/subscription` | Subscription functions (`candle`, `trades`, `l2Book`, etc.)        |

## Valibot Schemas

These exports also include [valibot](https://valibot.dev) schemas for every API method:

```ts
import { ClearinghouseStateRequest, ClearinghouseStateResponse } from "@nktkas/hyperliquid/api/info";
import { OrderRequest, OrderResponse } from "@nktkas/hyperliquid/api/exchange";
```

### Available Schemas

Each method exports:

- `*Request` - full request schema (with `type`, `nonce`, `signature` for exchange)
- `*Response` - response schema from API

### Use Cases

**TypeScript types:**

```ts
import { ClearinghouseStateResponse } from "@nktkas/hyperliquid/api/info";
import * as v from "valibot";

type State = v.InferOutput<typeof ClearinghouseStateResponse>;
```

**Runtime validation:**

```ts
import { OrderRequest } from "@nktkas/hyperliquid/api/exchange";
import * as v from "valibot";

// Validate data before sending
const validated = v.parse(OrderRequest, {
  action: {
    type: "order",
    orders: [{ a: 0, b: true, p: "30000", s: "0.1", r: false, t: { limit: { tif: "Gtc" } } }],
    grouping: "na",
  },
  nonce: Date.now(),
  signature: { r: "0x...", s: "0x...", v: 27 },
});
```

**Field descriptions:**

Schemas include descriptions for all fields via `v.description()`, useful for generating documentation or exploring the
API structure.
