# @nktkas/hyperliquid

A low-level SDK for interacting with [Hyperliquid's](https://hyperliquid.xyz/) APIs in TypeScript.

## Features

- Support for all Hyperliquid's exchange and info API's
- Comprehensive documentation for all API methods and types
- Test suite to ensure TypeScript types match real API data
- Minimal dependencies (only [viem](https://viem.sh/) and [@msgpack/msgpack](https://github.com/msgpack/msgpack-javascript))

## Installation

Use [jsr](https://jsr.io/@nktkas/hyperliquid) to install. JSR makes it compatible with major JS runtimes and package managers.

## Usage

Here's a basic example of how to use the SDK:

```typescript
import { HyperliquidExchangeClient, HyperliquidInfoClient } from "@nktkas/hyperliquid";
import { createWalletClient, http } from "viem";

// Create a wallet client (you need to provide your own account and transport)
const walletClient = createWalletClient({
    account,
    transport: http(),
});

// Initialize the exchange client
const exchangeClient = new HyperliquidExchangeClient(walletClient);

// Initialize the info client
const infoClient = new HyperliquidInfoClient();

// Example: Place an order
const orderResult = await exchangeClient.order({
    orders: [
        {
            a: 0, // Asset index
            b: true, // Buy order
            p: "1000", // Price
            s: "1", // Size
            r: false, // Not reduce-only
            t: { limit: { tif: "Gtc" } }, // Good-til-cancelled limit order
        },
    ],
    grouping: "na",
});

console.log("Order placed:", orderResult);

// Example: Get user's open orders
const openOrders = await infoClient.openOrders({ user: "0x..." });
console.log("Open orders:", openOrders);
```

## API Reference

The SDK provides 2 main classes:

- `HyperliquidExchangeClient`: For interacting with the exchange API (placing orders, cancelling orders, etc.)
- `HyperliquidInfoClient`: For retrieving information (order book, user positions, etc.)

Each method in these classes is fully documented with TypeScript types and JSDoc comments. Refer to the source code for detailed
information on each method and its parameters.

## TODO

- [ ] Add WebSocket support
- [ ] Make tests more thorough

## Contributing

Contributions are welcome! Please see the [CONTRIBUTING](./CONTRIBUTING.md) file for guidelines on how to contribute to this
project.

## License

This project is licensed under the MIT License - see the [LICENSE](./LICENSE) file for details.
