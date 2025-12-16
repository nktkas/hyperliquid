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

<!-- deno-fmt-ignore-start -->
{% hint style="info" %} Every method has fully typed parameters and responses. No more guessing what the API returns. {% endhint %}
<!-- deno-fmt-ignore-end -->

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
