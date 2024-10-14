# @nktkas/hyperliquid

[![JSR](https://jsr.io/badges/@nktkas/hyperliquid)](https://jsr.io/@nktkas/hyperliquid) [![JSR Score](https://jsr.io/badges/@nktkas/hyperliquid/score)](https://jsr.io/@nktkas/hyperliquid)

Low-level SDK for interacting with [Hyperliquid's](https://hyperliquid.gitbook.io/hyperliquid-docs) API in TypeScript.

## Features

- Documented 📚 - Comprehensive documentation for all API methods and types
- Tested 🧪 - Tests for all API methods and return types
- Universal ⚙️ - Can use [viem](https://viem.sh/) or [ethers](https://ethers.org/) to access a wallet
- Lightweight 🪶 - Depends only on 2 libraries with no subdependencies ([29.7 kB](https://bundlephobia.com/scan-results?packages=@msgpack/msgpack@3.0.0-beta2,@noble/hashes@1.5.0))
- Cross-runtime 🌍 - Works in Node.js, Deno, Web, Bun. The same code runs on all platforms

## Installation

### For Node.js

```bash
npx jsr add @nktkas/hyperliquid
```

Alternatively, you can use Yarn or pnpm:

- Yarn: `yarn dlx jsr add @nktkas/hyperliquid`
- pnpm: `pnpm dlx jsr add @nktkas/hyperliquid`

### For Deno

```ts
import * as hyperliquid from "jsr:@nktkas/hyperliquid";
```

### For Web

```ts
import * as hyperliquid from "https://esm.sh/jsr/@nktkas/hyperliquid";
```

### For Bun

```bash
bunx jsr add @nktkas/hyperliquid
```

## Usage

### Create ExchangeClient

##### Private key via [viem](https://viem.sh/docs/clients/wallet#local-accounts-private-key-mnemonic-etc)

```ts
import * as hyperliquid from "@nktkas/hyperliquid";
import { privateKeyToAccount } from "viem/accounts";

const account = privateKeyToAccount("0x...");

const client = new hyperliquid.ExchangeClient(account);
```

##### Private key via [ethers](https://docs.ethers.org/v6/api/wallet/#Wallet)

```ts
import * as hyperliquid from "@nktkas/hyperliquid";
import { ethers } from "ethers";

const wallet = new ethers.Wallet("0x...");

const client = new hyperliquid.ExchangeClient(wallet);
```

##### External wallet (e.g. MetaMask) via [viem](https://viem.sh/docs/clients/wallet#optional-hoist-the-account)

```ts
import * as hyperliquid from "@nktkas/hyperliquid";
import { createWalletClient, custom } from "viem";
import { arbitrum } from "viem/chains";

const [account] = await window.ethereum!.request({ method: "eth_requestAccounts" });

const walletClient = createWalletClient({ account, chain: arbitrum, transport: http() });

const client = new hyperliquid.ExchangeClient(walletClient);
```

### Create InfoClient

```ts
import * as hyperliquid from "@nktkas/hyperliquid";

const client = new hyperliquid.InfoClient(); // You can specify a custom url
```

### Basic example

```typescript
import * as hyperliquid from "@nktkas/hyperliquid";

// Initialize the exchange client
const exchangeClient = new hyperliquid.ExchangeClient(...);

// Initialize the info client
const infoClient = new hyperliquid.InfoClient();

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
  grouping: "na", // Just order(s) without grouping
});

console.log("Order placed:", orderResult);

// Example: Get user's open orders
const openOrders = await infoClient.openOrders({ user: "0x..." });
console.log("Open orders:", openOrders);
```

## API Reference

The SDK provides 2 main classes:

- `ExchangeClient`: For interacting with the exchange API (placing orders, cancelling orders, etc.)
- `InfoClient`: For retrieving information (order book, user positions, etc.)

Each method in these classes is fully documented with TypeScript types and JSDoc comments. Refer to the source code for detailed information on each method and its parameters.

## Contributing

Contributions are welcome! Please see the [CONTRIBUTING](./CONTRIBUTING.md) file for guidelines on how to contribute to this project.

## License

This project is licensed under the MIT License - see the [LICENSE](./LICENSE) file for details.
