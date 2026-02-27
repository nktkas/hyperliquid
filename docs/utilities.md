# Utilities

Helper functions for formatting orders and resolving asset symbols, imported from `@nktkas/hyperliquid/utils`.

## Format prices

`formatPrice` truncates a price to the Hyperliquid
[tick size](https://hyperliquid.gitbook.io/hyperliquid-docs/for-developers/api/tick-and-lot-size) precision.

```ts
import { formatPrice } from "@nktkas/hyperliquid/utils";

formatPrice("97123.456789", 0); // "97123"
formatPrice("1.23456789", 5); // "1.2"
formatPrice("0.0000123456789", 0, "spot"); // "0.00001234"
```

## Format sizes

`formatSize` truncates a size to the asset
[lot size](https://hyperliquid.gitbook.io/hyperliquid-docs/for-developers/api/tick-and-lot-size) precision.

```ts
import { formatSize } from "@nktkas/hyperliquid/utils";

formatSize("1.23456789", 5); // "1.23456"
formatSize("0.123456789", 2); // "0.12"
formatSize("100", 0); // "100"
```

## Resolve symbols

`SymbolConverter` maps human-readable symbols to Hyperliquid
[asset IDs](https://hyperliquid.gitbook.io/hyperliquid-docs/for-developers/api/asset-ids) and formatting metadata. It
fetches data from the API on creation.

```ts
import { HttpTransport } from "@nktkas/hyperliquid";
import { SymbolConverter } from "@nktkas/hyperliquid/utils";

const transport = new HttpTransport();
const converter = await SymbolConverter.create({ transport });
```

### Asset IDs

`getAssetId` returns the numeric ID used in order parameters:

```ts
converter.getAssetId("BTC"); // 0
converter.getAssetId("HYPE/USDC"); // 10107
```

Perpetuals use the coin name. Spot markets use `"BASE/QUOTE"` format. Returns `undefined` if the symbol is not found.

### Size decimals

`getSzDecimals` returns the lot size precision for an asset:

```ts
converter.getSzDecimals("BTC"); // 5
converter.getSzDecimals("HYPE/USDC"); // 2
```

### Spot pair IDs

`getSpotPairId` returns the identifier used in info requests and subscriptions for spot markets:

```ts
converter.getSpotPairId("HYPE/USDC"); // "@107"
converter.getSpotPairId("PURR/USDC"); // "PURR/USDC"
```

### Refresh data

Call `reload` to update the symbol mappings when new assets are listed:

```ts
await converter.reload();
```

### Builder DEX support

Pass `dexs` to include assets from
[builder DEXs](https://hyperliquid.gitbook.io/hyperliquid-docs/hyperliquid-improvement-proposals-hips/hip-3-builder-deployed-perpetuals):

```ts
const converter = await SymbolConverter.create({
  transport,
  dexs: true, // all DEXs
});
```

```ts
const converter = await SymbolConverter.create({
  transport,
  dexs: ["test", "other"], // specific DEXs
});
```

Builder DEX assets use `"DEX:ASSET"` format:

```ts
converter.getAssetId("test:ABC"); // 110000
converter.getSzDecimals("test:ABC"); // 0
```

## Format and place an order

```ts
import { ExchangeClient, HttpTransport } from "@nktkas/hyperliquid";
import { formatPrice, formatSize, SymbolConverter } from "@nktkas/hyperliquid/utils";
import { privateKeyToAccount } from "viem/accounts";

const wallet = privateKeyToAccount("0x...");

const transport = new HttpTransport();
const converter = await SymbolConverter.create({ transport });
const client = new ExchangeClient({ transport, wallet });

// Parameters
const coin = "BTC";
const price = "97123.456789";
const size = "0.00123456789";
const isBuy = true;

// ! asserts the symbol exists - handle undefined in production
const assetId = converter.getAssetId(coin)!;
const szDecimals = converter.getSzDecimals(coin)!;

await client.order({
  orders: [{
    a: assetId, // asset index
    b: isBuy, // buy
    p: formatPrice(price, szDecimals), // price
    s: formatSize(size, szDecimals), // size
    r: false, // not reduce-only
    t: { limit: { tif: "Gtc" } }, // Good-Til-Cancelled
  }],
  grouping: "na",
});
```
