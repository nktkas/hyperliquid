# Hyperliquid API TypeScript SDK

[![npm](https://img.shields.io/npm/v/@nktkas/hyperliquid?color=blue)](https://www.npmjs.com/package/@nktkas/hyperliquid)
[![jsr](https://jsr.io/badges/@nktkas/hyperliquid)](https://jsr.io/@nktkas/hyperliquid)
[![Downloads](https://img.shields.io/npm/dm/@nktkas/hyperliquid.svg)](https://www.npmjs.com/package/@nktkas/hyperliquid)
[![coveralls](https://img.shields.io/coverallsCoverage/github/nktkas/hyperliquid)](https://coveralls.io/github/nktkas/hyperliquid)
[![bundlephobia](https://img.shields.io/bundlephobia/minzip/@nktkas/hyperliquid)](https://bundlephobia.com/package/@nktkas/hyperliquid)

A community-supported [Hyperliquid API](https://hyperliquid.gitbook.io/hyperliquid-docs/for-developers/api) SDK for all
major JS runtimes, written in TypeScript.

## Features

- 🖋️ **Typed**: Source code is 100% TypeScript.
- 🧪 **Tested**: Good code coverage and type relevance.
- 📦 **Minimal dependencies**: A few small trusted dependencies.
- 🌐 **Cross-Environment Support**: Compatible with all major JS runtimes.
- 🔧 **Integratable**: Easy to use with wallet providers ([viem](https://github.com/wevm/viem) or
  [ethers](https://github.com/ethers-io/ethers.js)).

## Installation

```sh
# Node.js 22.12+ / React Native 0.86+
npm i @nktkas/hyperliquid

# Deno 1.23+ 
deno add jsr:@nktkas/hyperliquid

# Bun 1.3.3+
bun add @nktkas/hyperliquid
```

> React Native needs polyfills for the `fastAssetCtxs` subscription and for versions below 0.86 — see the
> [documentation](https://nktkas.gitbook.io/hyperliquid).

## Quick Example

### Read data

```ts
// 1. Import module
import { HttpTransport, InfoClient } from "@nktkas/hyperliquid";

// 2. Set up client with transport
const transport = new HttpTransport();
const info = new InfoClient({ transport });

// 3. Query data

// Retrieve mids for all coins
const mids = await info.allMids();

// Retrieve a user's open orders
const openOrders = await info.openOrders({ user: "0x..." });

// L2 book snapshot
const book = await info.l2Book({ coin: "BTC" });
```

### Trading

```ts
// 1. Import modules
import { ExchangeClient, HttpTransport } from "@nktkas/hyperliquid";
import { privateKeyToAccount } from "viem/accounts";

// 2. Set up client with wallet and transport
const wallet = privateKeyToAccount("0x...");

const transport = new HttpTransport();
const exchange = new ExchangeClient({ transport, wallet });

// 3. Execute an action

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

### Real-time updates

```ts
// 1. Import module
import { SubscriptionClient, WebSocketTransport } from "@nktkas/hyperliquid";

// 2. Set up client with transport
const transport = new WebSocketTransport();
const subs = new SubscriptionClient({ transport });

// 3. Subscribe to events

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

## Documentation

Full guides, examples, and API reference: [nktkas.gitbook.io/hyperliquid](https://nktkas.gitbook.io/hyperliquid)

## Versioning

This SDK follows [Semantic Versioning](https://semver.org/). Until `1.0.0`, breaking changes bump the minor version and
everything else bumps the patch — the [caret-range](https://github.com/npm/node-semver#caret-ranges-123-025-004)
convention.

The exception is the request, response, and event types that mirror the Hyperliquid API. The API is unversioned and
always serves its latest shape, so changes to these types ship in **patch** releases even when breaking — the break
comes from Hyperliquid, not the SDK.

## Star History

<a href="https://www.star-history.com/#nktkas/hyperliquid&type=date&legend=top-left">
 <picture>
   <source media="(prefers-color-scheme: dark)" srcset="https://api.star-history.com/svg?repos=nktkas/hyperliquid&type=date&theme=dark&legend=top-left" />
   <source media="(prefers-color-scheme: light)" srcset="https://api.star-history.com/svg?repos=nktkas/hyperliquid&type=date&legend=top-left" />
   <img alt="Star History Chart" src="https://api.star-history.com/svg?repos=nktkas/hyperliquid&type=date&legend=top-left" />
 </picture>
</a>

## License

**@nktkas/hyperliquid** is licensed under the [MIT License](LICENSE).

Copyright © 2024-present [nktkas](https://github.com/nktkas) and
[contributors](https://github.com/nktkas/hyperliquid/graphs/contributors).
