# Connect to Hyperliquid

The SDK communicates with Hyperliquid through a transport. Choose HTTP or WebSocket and pass it to any
[client](clients.md).

## HTTP vs WebSocket

The following table compares the two transport types:

|                   | HTTP                       | WebSocket                   |
| ----------------- | -------------------------- | --------------------------- |
| **Best for**      | Serverless, simple scripts | Real-time data, low latency |
| **Connection**    | Per-request, stateless     | Persistent                  |
| **Subscriptions** | No                         | Required                    |

## HTTP

```ts
import { HttpTransport, InfoClient } from "@nktkas/hyperliquid";

const transport = new HttpTransport();
const client = new InfoClient({ transport });

const mids = await client.allMids();
```

Each request is an independent HTTP POST. No connection state to manage, so it works well in serverless functions, edge
workers, or unstable networks.

### Endpoints

Two built-in endpoints: `apiUrl` for info and exchange requests, `rpcUrl` for explorer requests (block details,
transactions). The following table lists the default URLs:

|          | Mainnet                       | Testnet                               |
| -------- | ----------------------------- | ------------------------------------- |
| `apiUrl` | `https://api.hyperliquid.xyz` | `https://api.hyperliquid-testnet.xyz` |
| `rpcUrl` | `https://rpc.hyperliquid.xyz` | `https://rpc.hyperliquid-testnet.xyz` |

Override when running your [own node](https://github.com/hyperliquid-dex/node) or using a proxy:

```ts
import { HttpTransport } from "@nktkas/hyperliquid";

const transport = new HttpTransport({
  apiUrl: "https://custom-api.example.com",
  rpcUrl: "https://custom-rpc.example.com",
});
```

### Fetch options

Pass custom options to the underlying [`fetch`](https://developer.mozilla.org/en-US/docs/Web/API/Fetch_API) call, such
as headers, credentials, and cache settings.

```ts
import { HttpTransport } from "@nktkas/hyperliquid";

const transport = new HttpTransport({
  fetchOptions: {
    headers: { "Authorization": "Bearer ..." },
  },
});
```

## WebSocket

```ts
import { SubscriptionClient, WebSocketTransport } from "@nktkas/hyperliquid";

const transport = new WebSocketTransport();
const client = new SubscriptionClient({ transport });

await client.allMids((data) => {
  console.log(data.mids);
});
```

The transport maintains a single persistent connection, required for
[subscriptions](https://hyperliquid.gitbook.io/hyperliquid-docs/for-developers/api/websocket/subscriptions) and
lower-latency for high-frequency
[POST requests](https://hyperliquid.gitbook.io/hyperliquid-docs/for-developers/api/websocket/post-requests):

```ts
import { InfoClient, WebSocketTransport } from "@nktkas/hyperliquid";

const transport = new WebSocketTransport();
const client = new InfoClient({ transport });

const mids = await client.allMids();
```

### Endpoints

`url` for info, exchange, and subscription requests. Explorer requests (block details, transactions) need a separate
transport on the RPC endpoint. The following table lists the default URLs:

|                      | Mainnet                        | Testnet                                |
| -------------------- | ------------------------------ | -------------------------------------- |
| `url`                | `wss://api.hyperliquid.xyz/ws` | `wss://api.hyperliquid-testnet.xyz/ws` |
| `MAINNET_RPC_WS_URL` | `wss://rpc.hyperliquid.xyz/ws` |                                        |
| `TESTNET_RPC_WS_URL` |                                | `wss://rpc.hyperliquid-testnet.xyz/ws` |

Override when running your [own node](https://github.com/hyperliquid-dex/node) or using a proxy:

```ts
import { WebSocketTransport } from "@nktkas/hyperliquid";

const transport = new WebSocketTransport({
  url: "wss://custom-api.example.com/ws",
});
```

For explorer, pass the RPC constant as `url`:

```ts
import { MAINNET_RPC_WS_URL, WebSocketTransport } from "@nktkas/hyperliquid";

const explorerTransport = new WebSocketTransport({ url: MAINNET_RPC_WS_URL });
```

### Reconnection

When the connection drops, the transport reconnects automatically via [`@nktkas/rews`](https://github.com/nktkas/rews):

```ts
import { WebSocketTransport } from "@nktkas/hyperliquid";

const transport = new WebSocketTransport({
  reconnect: {
    maxRetries: 10,
    reconnectionDelay: 1_000,
  },
});
```

See [`ReconnectingWebSocketOptions`](https://github.com/nktkas/rews#options) for all available options.

---

After reconnection, all active subscriptions are restored automatically. Disable this with `resubscribe`:

```ts
const transport = new WebSocketTransport({ resubscribe: false });
```

If a subscription fails to restore, its `failureSignal` is aborted. For details, see
[Handle failures](clients.md#handle-failures).

## Common options

### Testnet

Connect to the Hyperliquid testnet for development and testing:

```ts
const transport = new HttpTransport({ isTestnet: true });
// or
const transport = new WebSocketTransport({ isTestnet: true });
```

### Timeout

Both transports abort requests after 10 seconds by default. Set a custom timeout or `null` to disable:

```ts
const transport = new HttpTransport({ timeout: 30_000 });
// or
const transport = new WebSocketTransport({ timeout: 30_000 });
```
