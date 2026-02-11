# Error Handling

## Error Hierarchy

```
Error
├─ HyperliquidError (SDK)
│  ├─ TransportError
│  │  ├─ HttpRequestError
│  │  └─ WebSocketRequestError
│  ├─ ApiRequestError
│  └─ AbstractWalletError
└─ ValiError (valibot)
```

## HyperliquidError

Base class for all SDK errors.

```ts
import { HyperliquidError } from "@nktkas/hyperliquid";

try {
  await client.order({ ... });
} catch (error) {
  if (error instanceof HyperliquidError) {
    // Any SDK error
  }
}
```

## TransportError

Thrown when an error occurs at the transport level (network issues, timeouts).

### HttpRequestError

Thrown when an HTTP request fails.

```ts
import { HttpRequestError } from "@nktkas/hyperliquid";

try {
  await client.allMids();
} catch (error) {
  if (error instanceof HttpRequestError) {
    console.log(error.response); // Response object
    console.log(error.body); // Response body text
  }
}
```

### WebSocketRequestError

Thrown when a WebSocket request fails.

```ts
import { WebSocketRequestError } from "@nktkas/hyperliquid";

try {
  await client.allMids();
} catch (error) {
  if (error instanceof WebSocketRequestError) {
    console.log(error.message);
  }
}
```

## ApiRequestError

Thrown when the Hyperliquid API returns an error response. Contains the full response for inspection.

```ts
import { ApiRequestError } from "@nktkas/hyperliquid";

try {
  await client.order({ ... });
} catch (error) {
  if (error instanceof ApiRequestError) {
    console.log(error.message);  // Extracted error message
    console.log(error.response); // Full API response
  }
}
```

Common API errors:

- `"User or API Wallet 0x... does not exist"` - invalid signer or signature
- `"Insufficient margin to place order"` - not enough balance
- `"Price too far from oracle"` - price outside allowed range

## AbstractWalletError

Thrown when wallet operations fail (signing, getting address).

```ts
import { AbstractWalletError } from "@nktkas/hyperliquid";

try {
  await client.order({ ... });
} catch (error) {
  if (error instanceof AbstractWalletError) {
    console.log(error.message);
  }
}
```

## Validation Errors

Request parameters are validated before sending. Invalid parameters throw
[`ValiError`](https://valibot.dev/api/ValiError/) from [valibot](https://valibot.dev/).

```ts
import * as v from "valibot";

try {
  await client.order({
    orders: [{
      a: -1, // invalid: must be non-negative
      // ...
    }],
    grouping: "na",
  });
} catch (error) {
  if (error instanceof v.ValiError) {
    console.log(error.issues); // Validation issues
  }
}
```

## Example: Comprehensive Error Handling

```ts
import {
  AbstractWalletError,
  ApiRequestError,
  HttpRequestError,
  HyperliquidError,
  WebSocketRequestError,
} from "@nktkas/hyperliquid";
import * as v from "valibot";

try {
  const result = await client.order({ ... });
} catch (error) {
  if (error instanceof v.ValiError) {
    // Invalid parameters (before request)
    console.error("Validation failed:", error.issues);
  } else if (error instanceof ApiRequestError) {
    // API returned an error
    console.error("API error:", error.message);
  } else if (error instanceof HttpRequestError) {
    // HTTP request failed
    console.error("HTTP error:", error.response?.status);
  } else if (error instanceof WebSocketRequestError) {
    // WebSocket request failed
    console.error("WebSocket error:", error.message);
  } else if (error instanceof AbstractWalletError) {
    // Wallet operation failed
    console.error("Wallet error:", error.message);
  } else if (error instanceof HyperliquidError) {
    // Other SDK error
    console.error("SDK error:", error.message);
  } else {
    // Unknown error
    throw error;
  }
}
```

---

## Timeouts

When a request exceeds the transport [timeout](./transports.md#timeout-optional), a transport error is thrown with the
original `TimeoutError` as the `cause`:

```ts
try {
  await client.allMids();
} catch (error) {
  if (error instanceof HttpRequestError && error.cause instanceof DOMException) {
    console.log(error.cause.name); // "TimeoutError"
  }
}
```

## Request Cancellation

All methods accept an optional [`AbortSignal`](https://developer.mozilla.org/en-US/docs/Web/API/AbortSignal) to cancel
in-flight requests. On cancellation, a transport error is thrown with the abort reason as the `cause`:

```ts
const controller = new AbortController();

setTimeout(() => controller.abort(), 5000);

try {
  await client.clearinghouseState({ user: "0x..." }, controller.signal);
} catch (error) {
  if (error instanceof HttpRequestError && error.cause instanceof DOMException) {
    console.log(error.cause.name); // "AbortError"
  }
}
```

## WebSocket Disconnection

When the WebSocket connection drops during an in-flight request, a `WebSocketRequestError` is thrown. Active
subscriptions are automatically restored after [reconnection](./transports.md#reconnection).

```ts
try {
  await client.allMids();
} catch (error) {
  if (error instanceof WebSocketRequestError) {
    console.log(error.message); // "WebSocket connection closed"
  }
}
```
