# Installation

Install the SDK via your package manager or a `<script>` tag.

## Package Manager

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

## CDN

If you're not using a package manager, you can use the SDK via an ESM-compatible CDN such as [esm.sh](https://esm.sh/).
Simply add a `<script type="module">` tag to the bottom of your HTML file with the following content:

```html
<script type="module">
  import * as hl from "https://esm.sh/jsr/@nktkas/hyperliquid";
</script>
```

## Platform Requirements

{% hint style="info" %} Node.js: requires v20 or higher.

Node.js 22+ includes native WebSocket support. For earlier versions, install the
[`ws`](https://www.npmjs.com/package/ws) package if you plan to use
[`WebSocketTransport`](https://nktkas.gitbook.io/hyperliquid/core-concepts/transports#websockettransport):

```sh
npm install ws
```

```ts
import WebSocket from "ws";
import * as hl from "@nktkas/hyperliquid";

const transport = new hl.WebSocketTransport({
  reconnect: {
    WebSocket, // Pass WebSocket class from ws package
  },
});
```

{% endhint %}

{% hint style="info" %} React Native: requires polyfills for
[`TextEncoder`](https://developer.mozilla.org/en-US/docs/Web/API/TextEncoder) and
[`EventTarget`](https://developer.mozilla.org/en-US/docs/Web/API/EventTarget). Install and import them before the SDK:

```sh
npm install fast-text-encoding event-target-polyfill
```

```ts
import "fast-text-encoding";
import "event-target-polyfill";
import * as hl from "@nktkas/hyperliquid";
```

{% endhint %}
