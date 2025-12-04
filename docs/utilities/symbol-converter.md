# Symbol Converter

Utility for converting human-readable asset symbols to Hyperliquid asset IDs.

Hyperliquid uses numeric asset IDs internally:

- **Perpetuals:** `0`, `1`, `2`, ... (index in `meta.universe`)
- **Spot:** `10000 + index` (e.g., `10107` for HYPE/USDC)
- **Builder DEX:** `100000 + dex_index * 10000 + asset_index`

See [Asset IDs](https://hyperliquid.gitbook.io/hyperliquid-docs/for-developers/api/asset-ids) in Hyperliquid docs.

## Import

```ts
import { SymbolConverter } from "@nktkas/hyperliquid/utils";
```

## Usage

```ts
import { HttpTransport } from "@nktkas/hyperliquid";
import { SymbolConverter } from "@nktkas/hyperliquid/utils";

const transport = new HttpTransport();
const converter = await SymbolConverter.create({ transport });

// Perpetual
converter.getAssetId("BTC"); // 0
converter.getSzDecimals("BTC"); // 5

// Spot market (BASE/QUOTE format)
converter.getAssetId("HYPE/USDC"); // 10107
converter.getSzDecimals("HYPE/USDC"); // 2
converter.getSpotPairId("HYPE/USDC"); // "@107"
```

## With Builder DEX

Builder DEX assets require explicit opt-in:

```ts
// Load specific dexs
const converter = await SymbolConverter.create({
  transport,
  dexs: ["test"], // load only "test" dex
});

// Or load all dexs
const converter = await SymbolConverter.create({
  transport,
  dexs: true, // load all available dexs
});

converter.getAssetId("test:ABC"); // 110000
```

## Methods

### getAssetId

Returns the numeric asset ID for use in exchange requests.

```ts
converter.getAssetId("BTC"); // 0 (perpetual)
converter.getAssetId("HYPE/USDC"); // 10107 (spot)
converter.getAssetId("test:ABC"); // 110000 (builder dex)
converter.getAssetId("UNKNOWN"); // undefined
```

### getSzDecimals

Returns the size decimals for an asset. Used for formatting order sizes and prices.

```ts
converter.getSzDecimals("BTC"); // 5 → size like "0.00001"
converter.getSzDecimals("HYPE/USDC"); // 2 → size like "0.01"
```

### getSpotPairId

Returns the spot pair ID for info endpoints and subscriptions (l2Book, trades, etc.).

```ts
converter.getSpotPairId("HYPE/USDC"); // "@107"
converter.getSpotPairId("PURR/USDC"); // "PURR/USDC" (special case)
```

### reload

Refreshes asset mappings from the API. Useful when new assets are listed.

```ts
await converter.reload();
```

## Parameters

### transport (required)

- **Type:** [`HttpTransport`](../core-concepts/transports.md#httptransport) |
  [`WebSocketTransport`](../core-concepts/transports.md#websockettransport)

Transport instance for API requests.

### dexs (optional)

- **Type:** `string[]` | `boolean`
- **Default:** `false`

Builder DEX support:

- `false` or omitted — don't load builder dexs
- `true` — load all available dexs
- `["dex1", "dex2"]` — load only specified dexs

```ts
// Don't load dexs (default)
await SymbolConverter.create({ transport });

// Load all dexs
await SymbolConverter.create({ transport, dexs: true });

// Load specific dexs
await SymbolConverter.create({ transport, dexs: ["test"] });
```
