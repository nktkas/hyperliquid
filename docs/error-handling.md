# Error handling

The SDK throws a small, typed set of exceptions so you can route error handling by **class**. Read this page when you
are writing a `try/catch` around a client call, wiring observability, or deciding what to retry.

## Class hierarchy

Every exception the SDK itself throws extends `HyperliquidError`. One `instanceof` check is enough to separate
"something in the SDK threw" from "something else threw".

```
Error
└─ HyperliquidError
   ├─ ValidationError
   ├─ AbstractWalletError
   ├─ CanonicalizeError
   ├─ ApiRequestError
   └─ TransportError
      ├─ HttpRequestError
      └─ WebSocketRequestError
```

| Class                   | Thrown from                                      | Inspect                   |
| ----------------------- | ------------------------------------------------ | ------------------------- |
| `ValidationError`       | Schema parsing, before any network I/O           | `message`, `cause.issues` |
| `AbstractWalletError`   | Signing layer (viem / ethers / custom adapter)   | `cause`                   |
| `CanonicalizeError`     | `canonicalize()` helper during low-level signing | `message`                 |
| `ApiRequestError`       | Hyperliquid API returned an error response       | `message`, `response`     |
| `HttpRequestError`      | `fetch` failed or returned non-2xx / non-JSON    | `response`, `cause`       |
| `WebSocketRequestError` | WebSocket operation failed                       | `message`, `cause`        |

## `ValidationError`

Thrown when a client method's valibot schema rejects your payload — so it fires **before** any network I/O. The `cause`
is always a [valibot `ValiError`](https://valibot.dev/api/ValiError/), and its `issues` array gives the exact path of
every problem.

<!-- deno-fmt-ignore -->
```ts
import { ValidationError } from "@nktkas/hyperliquid";

try {
  await client.order({ orders: [/* ... */], grouping: "na" });
} catch (error) {
  if (error instanceof ValidationError) {
    console.error(error.message);      // human-readable summary
    console.error(error.cause.issues); // path + expected + received per issue
  }
}
```

Defined in [`src/_base.ts`](../src/_base.ts).

## `ApiRequestError`

Thrown when Hyperliquid's API processed the request and returned an error response. The raw payload is attached as
`response`, and `message` is its error text. Server messages have no stability guarantee, so avoid branching on their
exact text.

<!-- deno-fmt-ignore -->
```ts
import { ApiRequestError } from "@nktkas/hyperliquid";

try {
  await client.order({ orders: [/* ... */], grouping: "na" });
} catch (error) {
  if (error instanceof ApiRequestError) {
    console.error(error.message);  // server-owned text
    console.error(error.response); // full raw API response
  }
}
```

Defined in [`src/api/exchange/_methods/_base/errors.ts`](../src/api/exchange/_methods/_base/errors.ts).

## `AbstractWalletError`

Thrown from the signing layer when a wallet operation fails: signing EIP-712 typed data, reading the wallet address, or
reading the chain id. The underlying wallet's own error (from viem, ethers, or a custom adapter) is attached as `cause`.

<!-- deno-fmt-ignore -->
```ts
import { AbstractWalletError } from "@nktkas/hyperliquid";

try {
  await client.order({ orders: [/* ... */], grouping: "na" });
} catch (error) {
  if (error instanceof AbstractWalletError) {
    console.error(error.message); // SDK-constructed summary
    console.error(error.cause);   // original wallet error
  }
}
```

Defined in [`src/signing/_abstractWallet.ts`](../src/signing/_abstractWallet.ts).

## `CanonicalizeError`

Thrown by the [`canonicalize`](signing.md#canonicalize) helper when the payload does not match the schema — an extra
field or a missing required field. You only hit this when you are building your own signed action; the built-in
`ExchangeClient` methods never reach this path with their own payloads.

```ts
import { CancelRequest } from "@nktkas/hyperliquid/api/exchange";
import { canonicalize, CanonicalizeError } from "@nktkas/hyperliquid/signing";

try {
  const action = canonicalize(CancelRequest.entries.action, {
    type: "cancel",
    cancels: [{ a: 0, o: 12345 }],
  });
  // ... continue building the signed payload with `action`
} catch (error) {
  if (error instanceof CanonicalizeError) {
    console.error(error.message); // which key was unexpected or missing
  }
}
```

Defined in [`src/signing/_canonicalize.ts`](../src/signing/_canonicalize.ts).

## Transport errors

`TransportError` is the common base for every failure that happens at the transport layer. Catch it directly when you
want a single branch that covers both `HttpRequestError` and `WebSocketRequestError`.

```ts
import { TransportError } from "@nktkas/hyperliquid";

try {
  await client.allMids();
} catch (error) {
  if (error instanceof TransportError) {
    // both HttpRequestError and WebSocketRequestError land here
  }
}
```

### `HttpRequestError`

Thrown by `HttpTransport` when `fetch` itself rejects, or when the server returns a non-2xx / non-JSON response. When
the server did respond, `response` is a [`Response`](https://developer.mozilla.org/en-US/docs/Web/API/Response) object —
you can read its status and body. For network-level failures (DNS, connection reset, offline), `response` is `undefined`
and the underlying cause is in `cause`.

<!-- deno-fmt-ignore -->
```ts
import { HttpRequestError } from "@nktkas/hyperliquid";

try {
  await client.allMids();
} catch (error) {
  if (error instanceof HttpRequestError) {
    if (error.response) {
      console.error(error.response.status);       // HTTP status
      console.error(await error.response.text()); // response body
    } else {
      console.error(error.cause); // network-level reason
    }
  }
}
```

Defined in [`src/transport/http/mod.ts`](../src/transport/http/mod.ts).

### `WebSocketRequestError`

Thrown by `WebSocketTransport` when the WebSocket connection cannot be used, or when a request or subscription receives
an error response. The underlying cause (if any) is in `cause`.

<!-- deno-fmt-ignore -->
```ts
import { WebSocketRequestError } from "@nktkas/hyperliquid";

try {
  await client.allMids();
} catch (error) {
  if (error instanceof WebSocketRequestError) {
    console.error(error.message); // SDK-constructed summary
    console.error(error.cause);   // underlying reason, if any
  }
}
```

Defined in [`src/transport/websocket/_postRequest.ts`](../src/transport/websocket/_postRequest.ts).

## Timeouts and cancellation

Both transports use [`AbortSignal`](https://developer.mozilla.org/en-US/docs/Web/API/AbortSignal) under the hood. The
default request timeout (10s) is built with `AbortSignal.timeout()`, and any `signal` you pass into a
[client](clients.md) method is merged with it — whichever aborts first wins. The resulting
[`DOMException`](https://developer.mozilla.org/en-US/docs/Web/API/DOMException) is wrapped as `cause` on a
`TransportError`.

```ts
import { TransportError } from "@nktkas/hyperliquid";

try {
  await client.allMids();
} catch (error) {
  if (error instanceof TransportError && error.cause instanceof DOMException) {
    if (error.cause.name === "TimeoutError") {
      // transport hit the configured timeout
    }
    if (error.cause.name === "AbortError") {
      // caller aborted via their own AbortSignal
    }
  }
}
```

## Catch-all pattern

One pattern that covers every SDK-thrown error, routes by class, and re-throws anything foreign.

```ts
import {
  AbstractWalletError,
  ApiRequestError,
  HttpRequestError,
  HyperliquidError,
  TransportError,
  ValidationError,
  WebSocketRequestError,
} from "@nktkas/hyperliquid";

try {
  await client.order({ orders: [/* ... */], grouping: "na" });
} catch (error) {
  if (error instanceof HyperliquidError) {
    if (error instanceof ValidationError) {
      // invalid parameters — inspect error.message
    } else if (error instanceof ApiRequestError) {
      // API rejected the action — inspect error.message
    } else if (error instanceof AbstractWalletError) {
      // wallet failed — inspect error.cause
    } else if (error instanceof TransportError) {
      if (error instanceof HttpRequestError) {
        // HTTP transport failed — inspect error.response, error.cause
      } else if (error instanceof WebSocketRequestError) {
        // WebSocket transport failed — inspect error.cause
      }
    }
  } else {
    throw error; // not ours — let it propagate
  }
}
```
