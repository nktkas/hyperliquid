# @nktkas/hyperliquid

A community-supported [Hyperliquid API](https://hyperliquid.gitbook.io/hyperliquid-docs/for-developers/api) SDK for all
major JS runtimes, written in TypeScript.

## Installation

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

{% tab title="React Native" %}

```sh
npm i @nktkas/hyperliquid event-target-shim
```

Hermes lacks the global `EventTarget` and `Event` the SDK relies on — polyfill them before importing the SDK:

```ts
import { Event, EventTarget } from "event-target-shim";
if (!globalThis.EventTarget) globalThis.EventTarget = EventTarget;
if (!globalThis.Event) globalThis.Event = Event;
```

{% endtab %}

{% endtabs %}

## Quick start

{% tabs %}

{% tab title="InfoClient" %}

Read market data, account state, order book. [Learn more](clients.md#info-endpoint)

```ts
import { HttpTransport, InfoClient } from "@nktkas/hyperliquid";

const transport = new HttpTransport();
const client = new InfoClient({ transport });

const mids = await client.allMids();
```

{% endtab %}

{% tab title="ExchangeClient" %}

Place orders, transfer funds, manage accounts. [Learn more](clients.md#exchange-endpoint)

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

Receive real-time updates via WebSocket. [Learn more](clients.md#websocket-subscriptions)

```ts
import { SubscriptionClient, WebSocketTransport } from "@nktkas/hyperliquid";

const transport = new WebSocketTransport();
const client = new SubscriptionClient({ transport });

await client.allMids((data) => {
  console.log(data.mids);
});
```

{% endtab %}

{% tab title="ExplorerClient" %}

Look up blocks, transactions, and addresses. [Learn more](clients.md#explorer-endpoint)

```ts
import { ExplorerClient, HttpTransport } from "@nktkas/hyperliquid";

const transport = new HttpTransport();
const client = new ExplorerClient({ transport });

const block = await client.blockDetails({ height: 123 });
```

{% endtab %}

{% endtabs %}

## Versioning

This SDK follows [Semantic Versioning](https://semver.org/). While it is on `0.x.y`, a breaking change bumps the minor
version and every other change bumps the patch version.

The exception is the request, response, and event types that mirror the Hyperliquid API. The API is unversioned and
always serves its latest shape, so changes to these types ship in **patch** releases even when breaking — the break
comes from Hyperliquid, not the SDK.
