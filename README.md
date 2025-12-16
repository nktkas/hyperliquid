# Hyperliquid API TypeScript SDK

[![npm](https://img.shields.io/npm/v/@nktkas/hyperliquid?color=blue)](https://www.npmjs.com/package/@nktkas/hyperliquid)
[![jsr](https://jsr.io/badges/@nktkas/hyperliquid)](https://jsr.io/@nktkas/hyperliquid)
[![Downloads](https://img.shields.io/npm/dm/@nktkas/hyperliquid.svg)](https://www.npmjs.com/package/@nktkas/hyperliquid)
[![coveralls](https://img.shields.io/coverallsCoverage/github/nktkas/hyperliquid)](https://coveralls.io/github/nktkas/hyperliquid)
[![bundlephobia](https://img.shields.io/bundlephobia/minzip/@nktkas/hyperliquid)](https://bundlephobia.com/package/@nktkas/hyperliquid)

**@nktkas/hyperliquid** is a TypeScript SDK for the
[Hyperliquid API](https://hyperliquid.gitbook.io/hyperliquid-docs/for-developers/api).

## Features

- 🖋️ **Typed**: Source code is 100% TypeScript.
- 🧪 **Tested**: Good code coverage and type relevance.
- 📦 **Minimal dependencies**: A few small trusted dependencies.
- 🌐 **Cross-Environment Support**: Compatible with all major JS runtimes.
- 🔧 **Integratable**: Easy to use with wallet providers ([viem](https://github.com/wevm/viem) or
  [ethers](https://github.com/ethers-io/ethers.js)).

## Installation

```sh
npm i @nktkas/hyperliquid
```

## Quick Example

```ts
import { ExchangeClient, HttpTransport, InfoClient } from "@nktkas/hyperliquid";
import { privateKeyToAccount } from "viem/accounts";

// Read data
const info = new InfoClient({ transport: new HttpTransport() });
const mids = await info.allMids();
console.log(mids); // { "BTC": "97000.5", "ETH": "3500.25", ... }

// Place order
const exchange = new ExchangeClient({
  transport: new HttpTransport(),
  wallet: privateKeyToAccount("0x..."),
});

const result = await exchange.order({
  orders: [{
    a: 0, // Asset index (BTC)
    b: true, // Buy side
    p: "95000", // Price
    s: "0.01", // Size
    r: false, // Reduce only
    t: { limit: { tif: "Gtc" } },
  }],
  grouping: "na",
});
```

## Documentation

📚 **[Read the full documentation](https://nktkas.gitbook.io/hyperliquid)**

## Star History

<a href="https://www.star-history.com/#nktkas/hyperliquid&type=date&legend=top-left">
 <picture>
   <source media="(prefers-color-scheme: dark)" srcset="https://api.star-history.com/svg?repos=nktkas/hyperliquid&type=date&theme=dark&legend=top-left" />
   <source media="(prefers-color-scheme: light)" srcset="https://api.star-history.com/svg?repos=nktkas/hyperliquid&type=date&legend=top-left" />
   <img alt="Star History Chart" src="https://api.star-history.com/svg?repos=nktkas/hyperliquid&type=date&legend=top-left" />
 </picture>
</a>
