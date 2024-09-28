# @nktkas/hyperliquid

A low-level SDK for interacting with [Hyperliquid's](https://hyperliquid.xyz/) APIs in TypeScript.

## Features

- Support for all Hyperliquid's exchange and info API's
- Comprehensive documentation for all API methods and types
- Test suite to ensure TypeScript types match real API data
- Minimal dependencies (only [@noble/hashes/sha3](https://github.com/paulmillr/noble-hashes) and
  [@msgpack/msgpack](https://github.com/msgpack/msgpack-javascript))
- Support for [viem](https://viem.sh/) and [ethers](https://ethers.org/)

## Installation

Use [jsr](https://jsr.io/@nktkas/hyperliquid) to install. JSR makes it compatible with major JS runtimes and package managers.

## Usage

Here's a basic example of how to use the SDK:

```typescript
import { HyperliquidExchangeClient, HyperliquidInfoClient } from "@nktkas/hyperliquid";
import { privateKeyToAccount } from "viem/accounts";
// import { ethers } from "ethers";

// A wallet that will sign transactions
const account = privateKeyToAccount("0x...");
// const wallet = new ethers.Wallet("0x...");

// Initialize the exchange client
const exchangeClient = new HyperliquidExchangeClient(account);
// const exchangeClient = new HyperliquidExchangeClient(wallet);

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
  - [x] Info tests
  - [ ] Exchange tests

## Contributing

Contributions are welcome! Please see the [CONTRIBUTING](./CONTRIBUTING.md) file for guidelines on how to contribute to this
project.

## License

This project is licensed under the MIT License - see the [LICENSE](./LICENSE) file for details.
