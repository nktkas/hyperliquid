# Formatting

Utilities for formatting prices and sizes according to Hyperliquid's
[tick and lot size rules](https://hyperliquid.gitbook.io/hyperliquid-docs/for-developers/api/tick-and-lot-size).

## Import

```ts
import { formatPrice, formatSize } from "@nktkas/hyperliquid/utils";
```

## formatPrice

Formats a price according to Hyperliquid rules:

- Maximum 5 significant figures
- Maximum `(6 - szDecimals)` decimal places for perps, `(8 - szDecimals)` for spot
- Integer prices are always allowed regardless of significant figures

```ts
import { formatPrice } from "@nktkas/hyperliquid/utils";

// Perpetual (default)
formatPrice("1234.5", 0); // "1234.5" ✓
formatPrice("1234.56", 0); // "1234.5" (truncated to 5 sig figs)
formatPrice("0.001234", 0); // "0.001234" ✓
formatPrice("0.0012345", 0); // "0.001234" (truncated to 5 sig figs)

// Spot market
formatPrice("0.0001234", 0, "spot"); // "0.0001234" ✓
formatPrice("0.00012345", 2, "spot"); // "0.000123" (max 6 decimals for szDecimals=2)

// Integer prices always allowed
formatPrice("123456", 0); // "123456" ✓
```

### Parameters

#### price (required)

- **Type:** `string` | `number`

The price to format.

#### szDecimals (required)

- **Type:** `number`

Size decimals of the asset. Get from [`SymbolConverter.getSzDecimals()`](./symbol-converter.md#getszdecimals) or `meta`
response.

#### type (optional)

- **Type:** `"perp"` | `"spot"`
- **Default:** `"perp"`

Market type. Affects maximum decimal places (6 for perp, 8 for spot).

### Throws

- `RangeError` - if the formatted price becomes `0` after truncation

```ts
formatPrice("0.0000001", 0); // throws RangeError: Price is too small and was truncated to 0
```

## formatSize

Formats a size by truncating to `szDecimals` decimal places.

```ts
import { formatSize } from "@nktkas/hyperliquid/utils";

formatSize("1.23456789", 5); // "1.23456"
formatSize("1.23456789", 2); // "1.23"
formatSize("1.999", 0); // "1"
```

### Parameters

#### size (required)

- **Type:** `string` | `number`

The size to format.

#### szDecimals (required)

- **Type:** `number`

Size decimals of the asset. Get from [`SymbolConverter.getSzDecimals()`](./symbol-converter.md#getszdecimals) or `meta`
response.

### Throws

- `RangeError` - if the formatted size becomes `0` after truncation (prevents accidentally closing entire position)

```ts
formatSize("0.001", 2); // throws RangeError: Size is too small and was truncated to 0
```

## Example: Placing an Order

```ts
import { ExchangeClient, HttpTransport } from "@nktkas/hyperliquid";
import { formatPrice, formatSize, SymbolConverter } from "@nktkas/hyperliquid/utils";

const transport = new HttpTransport();
const converter = await SymbolConverter.create({ transport });
const client = new ExchangeClient({ transport, wallet });

const symbol = "BTC";
const assetId = converter.getAssetId(symbol); // 0
const szDecimals = converter.getSzDecimals(symbol); // 5

const price = formatPrice("97123.456789", szDecimals); // "97123"
const size = formatSize("0.00123456789", szDecimals); // "0.00123"

await client.order({
  orders: [{
    a: assetId,
    b: true,
    p: price,
    s: size,
    r: false,
    t: { limit: { tif: "Gtc" } },
  }],
  grouping: "na",
});
```
