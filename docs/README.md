# @nktkas/hyperliquid

A TypeScript SDK for the [Hyperliquid API](https://hyperliquid.gitbook.io/hyperliquid-docs/for-developers/api).

{% tabs %}

{% tab title="npm" %}

```sh
npm i @nktkas/hyperliquid
```

{% endtab %}

{% tab title="pnpm" %}

```sh
pnpm add @nktkas/hyperliquid
```

{% endtab %}

{% tab title="yarn" %}

```sh
yarn add @nktkas/hyperliquid
```

{% endtab %}

{% tab title="bun" %}

```sh
bun add @nktkas/hyperliquid
```

{% endtab %}

{% tab title="deno" %}

```sh
deno add jsr:@nktkas/hyperliquid
```

{% endtab %}

{% endtabs %}

<table data-view="cards">
  <thead>
    <tr>
      <th></th>
      <th></th>
    </tr>
  </thead>
  <tbody>
    <tr>
      <td><strong>Type Safe</strong></td>
      <td>100% TypeScript. Full inference for 80+ methods.</td>
    </tr>
    <tr>
      <td><strong>Tested</strong></td>
      <td>Types validated against real API responses.</td>
    </tr>
    <tr>
      <td><strong>Minimal</strong></td>
      <td>Few dependencies. Tree-shakeable.</td>
    </tr>
    <tr>
      <td><strong>Universal</strong></td>
      <td>Node.js, Deno, Bun, browsers, React Native.</td>
    </tr>
    <tr>
      <td><strong>Transports</strong></td>
      <td>Native <a href="https://developer.mozilla.org/en-US/docs/Web/API/Fetch_API">fetch</a> and <a href="https://developer.mozilla.org/en-US/docs/Web/API/WebSocket">WebSocket</a>.</td>
    </tr>
    <tr>
      <td><strong>Wallet Support</strong></td>
      <td>Works with <a href="https://viem.sh">viem</a> and <a href="https://ethers.org">ethers</a>.</td>
    </tr>
    <tr>
      <td><strong>Open Source</strong></td>
      <td>MIT licensed on <a href="https://github.com/nktkas/hyperliquid">GitHub</a>.</td>
    </tr>
  </tbody>
</table>

---

## Examples

### Read Data

```ts
import { HttpTransport, InfoClient } from "@nktkas/hyperliquid";

const client = new InfoClient({ transport: new HttpTransport() });

// Order book
const book = await client.l2Book({ coin: "ETH" });
//    ^? { coin: string, time: number, levels: [{ px: string, sz: string, n: number }[], ...] }

// Account state
const state = await client.clearinghouseState({ user: "0x..." });
//    ^? { marginSummary: {...}, assetPositions: [...], withdrawable: string }
```

{% hint style="info" %} Every method has fully typed parameters and responses. No more guessing what the API returns. {%
endhint %}

### Place Orders

```ts
import { ExchangeClient, HttpTransport } from "@nktkas/hyperliquid";
import { privateKeyToAccount } from "viem/accounts";

const client = new ExchangeClient({
  transport: new HttpTransport(),
  wallet: privateKeyToAccount("0x..."),
});

const result = await client.order({
  orders: [{
    a: 4, // Asset index (ETH)
    b: true, // Buy side
    p: "3000", // Price
    s: "0.1", // Size
    r: false, // Reduce only
    t: { limit: { tif: "Gtc" } },
  }],
  grouping: "na",
});
// ^? { status: "ok", response: { type: "order", data: { statuses: [...] } } }
```

### Real-time Updates

```ts
import { SubscriptionClient, WebSocketTransport } from "@nktkas/hyperliquid";

const client = new SubscriptionClient({ transport: new WebSocketTransport() });

await client.l2Book({ coin: "ETH" }, (book) => {
  console.log(book.coin, book.levels[0][0].px);
  //          ^? { coin: string, time: number, levels: [...] }
});
```

---

## Getting Started

<table data-view="cards">
  <thead>
    <tr>
      <th></th>
      <th></th>
      <th data-hidden data-card-target data-type="content-ref"></th>
    </tr>
  </thead>
  <tbody>
    <tr>
      <td><strong>Installation</strong></td>
      <td>Requirements and setup</td>
      <td><a href="getting-started/installation.md">installation.md</a></td>
    </tr>
    <tr>
      <td><strong>Quick Start</strong></td>
      <td>First API call in 5 minutes</td>
      <td><a href="getting-started/quick-start.md">quick-start.md</a></td>
    </tr>
  </tbody>
</table>

## Core Concepts

<table data-view="cards">
  <thead>
    <tr>
      <th></th>
      <th></th>
      <th data-hidden data-card-target data-type="content-ref"></th>
    </tr>
  </thead>
  <tbody>
    <tr>
      <td><strong>Transports</strong></td>
      <td>HTTP and WebSocket configuration</td>
      <td><a href="core-concepts/transports.md">transports.md</a></td>
    </tr>
    <tr>
      <td><strong>Clients</strong></td>
      <td>InfoClient, ExchangeClient, SubscriptionClient</td>
      <td><a href="core-concepts/clients.md">clients.md</a></td>
    </tr>
    <tr>
      <td><strong>Error Handling</strong></td>
      <td>Error types and recovery</td>
      <td><a href="core-concepts/error-handling.md">error-handling.md</a></td>
    </tr>
  </tbody>
</table>

## Utilities

<table data-view="cards">
  <thead>
    <tr>
      <th></th>
      <th></th>
      <th data-hidden data-card-target data-type="content-ref"></th>
    </tr>
  </thead>
  <tbody>
    <tr>
      <td><strong>Formatting</strong></td>
      <td>Price and size formatting</td>
      <td><a href="utilities/formatting.md">formatting.md</a></td>
    </tr>
    <tr>
      <td><strong>Signing</strong></td>
      <td>Low-level signing</td>
      <td><a href="utilities/signing.md">signing.md</a></td>
    </tr>
    <tr>
      <td><strong>Symbol Converter</strong></td>
      <td>Asset symbols to IDs conversion</td>
      <td><a href="utilities/symbol-converter.md">symbol-converter.md</a></td>
    </tr>
  </tbody>
</table>
