# Market orders

Hyperliquid doesn't have a dedicated market order type. Simulate market orders using a limit order with `tif: "Ioc"`
(Immediate or Cancel) and a price that guarantees immediate execution.

## IoC order workflow

An IoC order fills immediately at the best available price and cancels any unfilled portion. Set the price aggressively
to ensure a fill:

- **Buy:** price above current mid (for example, +1%)
- **Sell:** price below current mid (for example, -1%)

The 1% buffer is a starting point. Volatile markets or large orders may need a wider margin.

## Example

```ts
import { ExchangeClient, HttpTransport, InfoClient } from "@nktkas/hyperliquid";
import { formatPrice, formatSize, SymbolConverter } from "@nktkas/hyperliquid/utils";
import { privateKeyToAccount } from "viem/accounts";

const wallet = privateKeyToAccount("0x...");

const transport = new HttpTransport();
const converter = await SymbolConverter.create({ transport });
const info = new InfoClient({ transport });
const exchange = new ExchangeClient({ transport, wallet });

// Parameters
const coin = "ETH";
const size = "0.1";
const isBuy = true;
const tolerance = 0.01; // 1% price buffer

// Get aggressive price based on current mid price with tolerance
const mids = await info.allMids();
const mid = parseFloat(mids[coin]);
const price = mid * (1 + (isBuy ? tolerance : -tolerance));

// ! asserts the symbol exists - handle undefined in production
const assetId = converter.getAssetId(coin)!;
const szDecimals = converter.getSzDecimals(coin)!;

// Place IoC order with aggressive price to ensure fill
await exchange.order({
  orders: [{
    a: assetId,
    b: isBuy,
    p: formatPrice(price, szDecimals),
    s: formatSize(size, szDecimals),
    r: false,
    t: { limit: { tif: "Ioc" } },
  }],
  grouping: "na",
});
```
