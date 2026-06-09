# Connect to Hyperliquid

Every [client](clients.md) reaches Hyperliquid through a transport. Two are built in — [`HttpTransport`](#http) and
[`WebSocketTransport`](#websocket) — and both expose the same request API, so switching between them is a one-line
change.

The choice comes down to [subscriptions](clients.md#websocket-subscriptions): live data streams that only
`WebSocketTransport` can open. If you don't need them, `HttpTransport` is the simpler choice.

## Common options

Both transports take the same two options:

- `isTestnet` — connect to the Hyperliquid testnet instead of mainnet.
- `timeout` — abort a request after this many milliseconds (default `10_000`; pass `null` to disable).

```ts
import { HttpTransport, WebSocketTransport } from "@nktkas/hyperliquid";

const transport = new HttpTransport({ isTestnet: true, timeout: 30_000 });
//                    ^^^^^^^^^^^^^
//                    or `WebSocketTransport`
```

## HTTP

Each request is an independent POST with no connection to keep alive, which suits serverless functions, edge workers,
and unstable networks:

```ts
import { ExchangeClient, HttpTransport, InfoClient } from "@nktkas/hyperliquid";
import { privateKeyToAccount } from "viem/accounts";

const wallet = privateKeyToAccount("0x...");
const transport = new HttpTransport();

const info = new InfoClient({ transport });
const exchange = new ExchangeClient({ wallet, transport });
//                                            ^^^^^^^^^
//                     A single transport instance can be reused with any client

const mids = await info.allMids();
```

### Endpoints

`HttpTransport` uses two endpoints, both defaulting to Hyperliquid's public URLs (set `isTestnet` to send requests to
the testnet URL):

- `apiUrl` — info and exchange requests. Default: `https://api.hyperliquid.xyz`.
- `rpcUrl` — [explorer](https://app.hyperliquid.xyz/explorer) requests. Default: `https://rpc.hyperliquid.xyz`.

Override either to run against your [own node](https://github.com/hyperliquid-dex/node) or a proxy:

```ts
import { HttpTransport } from "@nktkas/hyperliquid";

const transport = new HttpTransport({
  apiUrl: "https://custom-api.example.com",
  rpcUrl: "https://custom-rpc.example.com",
});
```

### Fetch options

`fetchOptions` is merged into every request the transport sends, so you can set any
[`RequestInit`](https://developer.mozilla.org/en-US/docs/Web/API/RequestInit) field (except `body` and `method`) — extra
headers, `credentials`, `cache`, and the like:

```ts
import { HttpTransport } from "@nktkas/hyperliquid";

const transport = new HttpTransport({
  fetchOptions: {
    headers: { "X-Custom-Header": "value" },
  },
});
```

## WebSocket

`WebSocketTransport` opens one connection and reuses it, shaving a little latency off each request and allows using the
subscription API:

```ts
import { SubscriptionClient, WebSocketTransport } from "@nktkas/hyperliquid";

const transport = new WebSocketTransport();
const subs = new SubscriptionClient({ transport });
//                 ^^^^^^^^^^^^^^^^^^
//                 Unlike other clients, it supports only `WebSocketTransport`

await subs.allMids((data) => {
  console.log(data.mids);
});
// Promise is resolved when the subscription is connected
```

### Endpoints

Because a WebSocket transport is one open connection, it reaches a single endpoint per instance, unlike `HttpTransport`.
`WebSocketTransport` therefore takes one `url` (default `wss://api.hyperliquid.xyz/ws`) for info, exchange, and
subscriptions; [explorer](https://app.hyperliquid.xyz/explorer) subscriptions need a second transport pointed at
`wss://rpc.hyperliquid.xyz/ws`:

```ts
import { ExplorerClient, WebSocketTransport } from "@nktkas/hyperliquid";

const transport = new WebSocketTransport({ url: "wss://rpc.hyperliquid.xyz/ws" });
//                                         ^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^
//                            Default value for `url` is `wss://api.hyperliquid.xyz/ws`.
//                            For explorer subscriptions, you need a separate transport pointed at `wss://rpc.hyperliquid.xyz/ws`.
const explorer = new ExplorerClient({ transport });

await explorer.explorerBlock((data) => {
  console.log(data);
});
```

### Reconnection

`WebSocketTransport` reconnects on its own when the connection drops, through
[`@nktkas/rews`](https://github.com/nktkas/rews) — minimal WebSocket wrapper with reconnection logic.

By default it retries 3 times with exponential backoff (capped at 10 s); pass `reconnect` to change the retry count,
delay, or connection timeout. See [`ReconnectingWebSocketOptions`](https://github.com/nktkas/rews#options) for the rest.

```ts
import { WebSocketTransport } from "@nktkas/hyperliquid";

const transport = new WebSocketTransport({
  reconnect: { maxRetries: 5, reconnectionDelay: 1_000 },
});
```

### Resubscription

The SDK re-subscribes to every active channel on its own after a [reconnect](#reconnection), so you never restore them
by hand. Delivery pauses while the connection is down and resumes once it's back. Turn that off with
`resubscribe: false`:

```ts
const transport = new WebSocketTransport({ resubscribe: false });
```

If a subscription then fails to re-establish, its `onError` callback is invoked — handle it as shown in
[Handle failures](#handle-failures).

### Handle failures

Resubscription rarely fails. When it does, or when the connection is lost for good, the `onError` callback fires once
and that channel is dropped. It's the optional last argument of every subscription method:

```ts
await client.allMids(
  (data) => {
    console.log(data.mids);
  },
  (error: WebSocketRequestError) => {
    console.error("Subscription error:", error);
    // The subscription is gone — check the error and/or subscribe again
  },
);
```
