# Error handling

The SDK throws `HyperliquidError` and its subclasses. Each subclass represents a specific failure category, such as
validation, transport, API, or wallet errors.

## Error hierarchy

```
Error
└─ HyperliquidError
   ├─ ValidationError
   ├─ TransportError
   │  ├─ HttpRequestError
   │  └─ WebSocketRequestError
   ├─ ApiRequestError
   └─ AbstractWalletError
```

## Transport errors

These errors are thrown when the request itself fails, such as network issues, timeouts, or non-JSON responses.

### HttpRequestError

This error is thrown when an HTTP request fails, such as non-200 status codes, non-JSON responses, or network-level
failures.

Has `response` (the [`Response`](https://developer.mozilla.org/en-US/docs/Web/API/Response) object) when the server
responded, `undefined` for network-level failures.

```ts
import { HttpRequestError } from "@nktkas/hyperliquid";

try {
  await client.allMids();
} catch (error) {
  if (error instanceof HttpRequestError) {
    console.error(error.message); // "429 Too Many Requests - ..."
    console.error(error.response?.status); // 429
    console.error(await error.response?.text()); // response body
  }
}
```

### WebSocketRequestError

This error is thrown when a WebSocket request or subscription fails, such as connection failures, server errors, or
exceeded subscription limits.

```ts
import { WebSocketRequestError } from "@nktkas/hyperliquid";

try {
  await client.allMids();
} catch (error) {
  if (error instanceof WebSocketRequestError) {
    console.error(error.message); // for example, "WebSocket connection closed"
  }
}
```

## API errors

`ApiRequestError` is thrown when the Hyperliquid API processes the request but returns an error, such as insufficient
margin, invalid price, or unknown wallet address.

Has `response` with the full API response object:

```ts
import { ApiRequestError } from "@nktkas/hyperliquid";

try {
  await client.order({ orders: [/* ... */], grouping: "na" });
} catch (error) {
  if (error instanceof ApiRequestError) {
    console.error(error.message); // for example, "Insufficient margin to place order"
    console.error(error.response); // full API response
  }
}
```

## Wallet errors

`AbstractWalletError` is thrown when a wallet operation fails, such as signature creation, address retrieval, or chain
ID detection. The original error is in `cause`.

```ts
import { AbstractWalletError } from "@nktkas/hyperliquid";

try {
  await client.order({ orders: [/* ... */], grouping: "na" });
} catch (error) {
  if (error instanceof AbstractWalletError) {
    console.error(error.message); // for example, "Failed to sign typed data with viem wallet"
    console.error(error.cause); // original wallet error
  }
}
```

## Validation errors

`ValidationError` is thrown when request parameters fail schema validation before sending.

The `cause` property contains the original [`ValiError`](https://valibot.dev/api/ValiError/) with detailed issue
information:

```ts
import { ValidationError } from "@nktkas/hyperliquid";

try {
  await client.order({ orders: [/* ... */], grouping: "na" });
} catch (error) {
  if (error instanceof ValidationError) {
    console.error(error.message); // human-readable validation message
    console.error(error.cause.issues); // detailed list of validation issues
  }
}
```

## Timeouts and cancellation

Both transports use [`AbortSignal`](https://developer.mozilla.org/en-US/docs/Web/API/AbortSignal) internally, so
timeouts and user-initiated cancellations produce a
[`DOMException`](https://developer.mozilla.org/en-US/docs/Web/API/DOMException) in `cause`:

```ts
import { TransportError } from "@nktkas/hyperliquid";

try {
  await client.allMids();
} catch (error) {
  if (error instanceof TransportError && error.cause instanceof DOMException) {
    if (error.cause.name === "TimeoutError") {
      // Transport timeout (default 10 s)
    }
    if (error.cause.name === "AbortError") {
      // Cancelled via AbortSignal
    }
  }
}
```

## Catch all errors

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
  if (error instanceof ValidationError) {
    // Invalid parameters - check error.message / error.cause
  } else if (error instanceof ApiRequestError) {
    // API rejected the action - check error.message
  } else if (error instanceof AbstractWalletError) {
    // Wallet failed - check error.cause
  } else if (error instanceof TransportError) {
    if (error instanceof HttpRequestError) {
      // HTTP failure - check error.response, error.cause
    } else if (error instanceof WebSocketRequestError) {
      // WebSocket failure - check error.message
    }
  } else if (error instanceof HyperliquidError) {
    // Other SDK error
  } else {
    throw error;
  }
}
```
