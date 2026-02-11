# FAQ

## How to create a market order?

Hyperliquid doesn't have traditional market orders. Use a limit order with `tif: "Ioc"` (Immediate or Cancel) and a
price that guarantees immediate execution:

```ts
import { ExchangeClient, HttpTransport, InfoClient } from "@nktkas/hyperliquid";
import { formatPrice, formatSize, SymbolConverter } from "@nktkas/hyperliquid/utils";
import { privateKeyToAccount } from "viem/accounts";

const wallet = privateKeyToAccount("0x..."); // viem or ethers
const transport = new HttpTransport();

const info = new InfoClient({ transport });
const exchange = new ExchangeClient({ transport, wallet });
const converter = await SymbolConverter.create({ transport });

const symbol = "ETH";
const assetId = converter.getAssetId(symbol);
const szDecimals = converter.getSzDecimals(symbol);

// Get current price
const mids = await info.allMids();
const currentPrice = parseFloat(mids[symbol]);

// Buy: set price above current (e.g., +1%)
const buyPrice = formatPrice(currentPrice * 1.01, szDecimals);

// Sell: set price below current (e.g., -1%)
const sellPrice = formatPrice(currentPrice * 0.99, szDecimals);

const size = formatSize("0.1", szDecimals);

await exchange.order({
  orders: [{
    a: assetId,
    b: true,
    p: buyPrice,
    s: size,
    r: false,
    t: { limit: { tif: "Ioc" } }, // Immediate or Cancel
  }],
  grouping: "na",
});
```

## How to use Agent Wallet?

[Agent wallets](https://hyperliquid.gitbook.io/hyperliquid-docs/for-developers/api/nonces-and-api-wallets#api-wallets)
can sign on behalf of your master account. Use the agent's private key instead of master account's:

```ts
import { ExchangeClient, HttpTransport } from "@nktkas/hyperliquid";
import { privateKeyToAccount } from "viem/accounts";

const client = new ExchangeClient({
  transport: new HttpTransport(),
  wallet: privateKeyToAccount("0x..."), // agent's private key
});
```

Create an agent via `approveAgent` method or through the [Hyperliquid UI](https://app.hyperliquid.xyz/API).

## How to trade on behalf of a Vault or Sub-Account?

Pass
[vault or sub-account address](https://hyperliquid.gitbook.io/hyperliquid-docs/for-developers/api/exchange-endpoint#subaccounts-and-vaults)
via `vaultAddress` option:

```ts
// Per-request
await client.order({ ... }, { vaultAddress: "0x..." });

// Or set default for all requests
const client = new ExchangeClient({
  transport: new HttpTransport(),
  wallet: privateKeyToAccount("0x..."),
  defaultVaultAddress: "0x...",
});
```

## How to sign with MetaMask or other browser wallets?

L1 actions use chain ID `1337` (dev network, not in wallets by default) and sign an action hash instead of readable
order details. Users will see `Agent { source: "a", connectionId: "0x..." }` - not useful.

**Solution:** Use
[Agent Wallet](https://hyperliquid.gitbook.io/hyperliquid-docs/for-developers/api/nonces-and-api-wallets#api-wallets)
for trading. Master account signs once to approve the agent.
