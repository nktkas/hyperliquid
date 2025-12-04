# Transports

A Transport is the layer responsible for executing requests to Hyperliquid servers.

## HttpTransport

Executes requests via HTTP POST to the Hyperliquid API.

### Import

```ts
import { HttpTransport } from "@nktkas/hyperliquid";
```

### Usage

```ts
import { HttpTransport, InfoClient } from "@nktkas/hyperliquid";

const transport = new HttpTransport();
const client = new InfoClient({ transport });

const mids = await client.allMids();
```

### Parameters

#### isTestnet (optional)

- **Type:** `boolean`
- **Default:** `false`

Use testnet endpoints instead of mainnet.

```ts
const transport = new HttpTransport({
  isTestnet: true,
});
```

#### timeout (optional)

- **Type:** `number` | `null`
- **Default:** `10000`

Request timeout in milliseconds. Set to `null` to disable.

```ts
const transport = new HttpTransport({
  timeout: 30000,
});
```

#### apiUrl (optional)

- **Type:** `string` | `URL`
- **Default:** `https://api.hyperliquid.xyz` (mainnet) or `https://api.hyperliquid-testnet.xyz` (testnet)

Custom API URL for info and exchange requests.

```ts
const transport = new HttpTransport({
  apiUrl: "https://custom-api.example.com",
});
```

#### rpcUrl (optional)

- **Type:** `string` | `URL`
- **Default:** `https://rpc.hyperliquid.xyz` (mainnet) or `https://rpc.hyperliquid-testnet.xyz` (testnet)

Custom RPC URL for explorer requests (block details, transactions).

```ts
const transport = new HttpTransport({
  rpcUrl: "https://custom-rpc.example.com",
});
```

#### fetchOptions (optional)

- **Type:** [`RequestInit`](https://developer.mozilla.org/en-US/docs/Web/API/RequestInit)

Custom options passed to the underlying [`fetch`](https://developer.mozilla.org/en-US/docs/Web/API/Fetch_API) call.

```ts
const transport = new HttpTransport({
  fetchOptions: {
    headers: {
      "X-Custom-Header": "value",
    },
  },
});
```

## WebSocketTransport

WebSocket connection for
[subscriptions](https://hyperliquid.gitbook.io/hyperliquid-docs/for-developers/api/websocket/subscriptions) and
[POST requests](https://hyperliquid.gitbook.io/hyperliquid-docs/for-developers/api/websocket/post-requests).

### Import

```ts
import { WebSocketTransport } from "@nktkas/hyperliquid";
```

### Usage

Subscription:

```ts
import { SubscriptionClient, WebSocketTransport } from "@nktkas/hyperliquid";

const transport = new WebSocketTransport();
const client = new SubscriptionClient({ transport });

const subscription = await client.allMids((data) => {
  console.log(data.mids);
});
```

POST request:

```ts
import { InfoClient, WebSocketTransport } from "@nktkas/hyperliquid";

const transport = new WebSocketTransport();
const client = new InfoClient({ transport });

const mids = await client.allMids();
```

### Reconnection

When connection drops, the transport automatically reconnects with exponential backoff (max 10 seconds) and 3 attempts.

After reconnection, all active subscriptions are automatically restored if `resubscribe: true` (default).

### Parameters

#### isTestnet (optional)

- **Type:** `boolean`
- **Default:** `false`

Use testnet endpoints instead of mainnet.

```ts
const transport = new WebSocketTransport({
  isTestnet: true,
});
```

#### timeout (optional)

- **Type:** `number` | `null`
- **Default:** `10000`

Request timeout in milliseconds. Set to `null` to disable.

```ts
const transport = new WebSocketTransport({
  timeout: 30000,
});
```

#### url (optional)

- **Type:** `string` | `URL`
- **Default:** `wss://api.hyperliquid.xyz/ws` (mainnet) or `wss://api.hyperliquid-testnet.xyz/ws` (testnet)

Custom WebSocket URL.

```ts
const transport = new WebSocketTransport({
  url: "wss://custom-api.example.com/ws",
});
```

#### reconnect (optional)

- **Type:** `object`
- **Default:**
  `{ maxRetries: 3, connectionTimeout: 10000, reconnectionDelay: (attempt) => Math.min(~~(1 << attempt) * 150, 10000) }`

Reconnection policy. See [`ReconnectingWebSocketOptions`](https://github.com/nktkas/rews#options).

```ts
const transport = new WebSocketTransport({
  reconnect: {
    maxRetries: 10,
    reconnectionDelay: 1000, // fixed 1s delay
  },
});
```

#### resubscribe (optional)

- **Type:** `boolean`
- **Default:** `true`

Automatically restore active subscriptions after reconnection.

```ts
const transport = new WebSocketTransport({
  resubscribe: false, // handle resubscription manually
});
```
