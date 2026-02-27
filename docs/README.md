# @nktkas/hyperliquid

A community-supported [Hyperliquid API](https://hyperliquid.gitbook.io/hyperliquid-docs/for-developers/api) SDK for all
major JS runtimes, written in TypeScript.

## Installation

{% tabs %}

{% tab
title="<img src='https://cdn.jsdelivr.net/gh/simple-icons/simple-icons/icons/npm.svg' height='14' style='filter: invert(24%) sepia(98%) saturate(2053%) hue-rotate(344deg) brightness(86%) contrast(88%)'>
npm" %}

```sh
npm i @nktkas/hyperliquid
```

{% endtab %}

{% tab title="<img src='https://cdn.jsdelivr.net/gh/devicons/devicon/icons/pnpm/pnpm-original.svg' height='14'> pnpm" %}

```sh
pnpm add @nktkas/hyperliquid
```

{% endtab %}

{% tab title="<img src='https://cdn.jsdelivr.net/gh/devicons/devicon/icons/yarn/yarn-original.svg' height='14'> yarn" %}

```sh
yarn add @nktkas/hyperliquid
```

{% endtab %}

{% tab title="<img src='https://cdn.jsdelivr.net/gh/devicons/devicon/icons/bun/bun-original.svg' height='14'> bun" %}

```sh
bun add @nktkas/hyperliquid
```

{% endtab %}

{% tab title="🦕 deno" %}

```sh
deno add jsr:@nktkas/hyperliquid
```

{% endtab %}

{% tab title="🌐 CDN" %}

```html
<script type="module">
  import * as hl from "https://esm.sh/jsr/@nktkas/hyperliquid";
</script>
```

{% endtab %}

{% endtabs %}

## Quick start

{% tabs %}

{% tab title="InfoClient" %}

Read market data, account state, order book. [Learn more](clients.md#read-data)

```ts
import { HttpTransport, InfoClient } from "@nktkas/hyperliquid";

const transport = new HttpTransport();
const client = new InfoClient({ transport });

const mids = await client.allMids();
```

{% endtab %}

{% tab title="ExchangeClient" %}

Place orders, transfer funds, manage accounts. [Learn more](clients.md#trading)

```ts
import { ExchangeClient, HttpTransport } from "@nktkas/hyperliquid";
import { privateKeyToAccount } from "viem/accounts";

const wallet = privateKeyToAccount("0x...");

const transport = new HttpTransport();
const client = new ExchangeClient({ transport, wallet });

await client.order({
  orders: [{
    a: 0,
    b: true,
    p: "50000",
    s: "0.01",
    r: false,
    t: { limit: { tif: "Gtc" } },
  }],
  grouping: "na",
});
```

{% endtab %}

{% tab title="SubscriptionClient" %}

Receive real-time updates via WebSocket. [Learn more](clients.md#real-time-updates)

```ts
import { SubscriptionClient, WebSocketTransport } from "@nktkas/hyperliquid";

const transport = new WebSocketTransport();
const client = new SubscriptionClient({ transport });

await client.allMids((data) => {
  console.log(data.mids);
});
```

{% endtab %}

{% endtabs %}
