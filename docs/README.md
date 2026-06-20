# @nktkas/hyperliquid

A community-supported [Hyperliquid API](https://hyperliquid.gitbook.io/hyperliquid-docs/for-developers/api) SDK for all
major JS runtimes, written in TypeScript.

## Installation

{% tabs %}

{% tab title="Node.js 22.12+" %}

```sh
npm i @nktkas/hyperliquid
```

{% endtab %}

{% tab title="Bun 1.3.3+" %}

```sh
bun add @nktkas/hyperliquid
```

{% endtab %}

{% tab title="Deno 1.23+" %}

```sh
deno add jsr:@nktkas/hyperliquid
```

{% endtab %}

{% tab title="React Native 0.86+" %}

```sh
npm i @nktkas/hyperliquid
```

The `fastAssetCtxs` subscription additionally needs `DecompressionStream`, Web Streams, and `TextDecoder`, none of which
Hermes provides:

```sh
npm i text-encoding-polyfill web-streams-polyfill compression-streams-polyfill
```

```ts
import "text-encoding-polyfill";
import "web-streams-polyfill/polyfill";
import "compression-streams-polyfill";
```

On **React Native < 0.86** the global `Event`/`EventTarget` is missing — polyfill it:

```sh
npm i event-target-shim
```

```ts
import { Event, EventTarget } from "event-target-shim";
if (!globalThis.EventTarget) globalThis.EventTarget = EventTarget;
if (!globalThis.Event) globalThis.Event = Event;
```

On **React Native < 0.84** the native `URL` is incomplete — add `react-native-url-polyfill`:

```sh
npm i react-native-url-polyfill
```

```ts
import "react-native-url-polyfill/auto";
```

Import every polyfill before `@nktkas/hyperliquid` (e.g. at the top of `index.js`).

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

This SDK follows [Semantic Versioning](https://semver.org/). Until `1.0.0`, breaking changes bump the minor version and
everything else bumps the patch — the [caret-range](https://github.com/npm/node-semver#caret-ranges-123-025-004)
convention.

The exception is the request, response, and event types that mirror the Hyperliquid API. The API is unversioned and
always serves its latest shape, so changes to these types ship in **patch** releases even when breaking — the break
comes from Hyperliquid, not the SDK.
