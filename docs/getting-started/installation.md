# Installation

Install the SDK via your package manager or a `<script>` tag.

## Package Manager

::: code-group

```sh [npm]
npm i @nktkas/hyperliquid
```

```sh [pnpm]
pnpm add @nktkas/hyperliquid
```

```sh [yarn]
yarn add @nktkas/hyperliquid
```

```sh [bun]
bun add @nktkas/hyperliquid
```

```sh [deno]
deno add jsr:@nktkas/hyperliquid
```

:::

## CDN

If you're not using a package manager, you can use the SDK via an ESM-compatible CDN such as [esm.sh](https://esm.sh/).
Simply add a `<script type="module">` tag to the bottom of your HTML file with the following content:

```html
<script type="module">
  import * as hl from "https://esm.sh/jsr/@nktkas/hyperliquid";
</script>
```

## Platform Requirements

::: info Node.js Requires **Node.js 20** or higher.

Node.js 22+ includes native WebSocket support. For earlier versions, install the `ws` package if you plan to use
`WebSocketTransport`:

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

:::

::: info React Native React Native requires polyfills for `TextEncoder` and `EventTarget`. Install and import them
before the SDK:

```sh
npm install fast-text-encoding event-target-polyfill
```

```ts
import "fast-text-encoding";
import "event-target-polyfill";
import * as hl from "@nktkas/hyperliquid";
```

:::
