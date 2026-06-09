# Utilities

Helpers from `@nktkas/hyperliquid/utils` that keep order payloads compatible with Hyperliquid's tick, lot, and asset
rules.

## Three invariants you have to honor (by Hyperliquid)

| Invariant                                                                                             | What it means                                                        | SDK helper                                     |
| ----------------------------------------------------------------------------------------------------- | -------------------------------------------------------------------- | ---------------------------------------------- |
| [**Tick size**](https://hyperliquid.gitbook.io/hyperliquid-docs/for-developers/api/tick-and-lot-size) | Prices must fit a bounded number of significant figures and decimals | [`formatPrice`](#tick-size-formatprice)        |
| [**Lot size**](https://hyperliquid.gitbook.io/hyperliquid-docs/for-developers/api/tick-and-lot-size)  | Sizes must not exceed the asset's `szDecimals`                       | [`formatSize`](#lot-size-formatsize)           |
| [**Asset ID**](https://hyperliquid.gitbook.io/hyperliquid-docs/for-developers/api/asset-ids)          | The `a` field in an order is a numeric index, not a symbol           | [`SymbolConverter`](#asset-id-symbolconverter) |

<a id="tick-size-formatprice"></a>

## Tick size → `formatPrice`

Hyperliquid's tick and lot size rules constrain every order price to three conditions at once:

- At most **5 significant figures**.
- At most **`6 − szDecimals`** decimals for perpetuals, **`8 − szDecimals`** for spot.
- Integer prices are always valid, regardless of significant figures.

Use `formatPrice` — it applies both rules as a string operation, so arbitrary-precision inputs survive intact:

<!-- deno-fmt-ignore -->
```ts
import { formatPrice } from "@nktkas/hyperliquid/utils";

formatPrice("97123.456789", 0);            // "97123"       — perp, szDecimals=0
formatPrice("1.23456789", 5);              // "1.2"         — perp, szDecimals=5
formatPrice("0.0000123456789", 0, "spot"); // "0.00001234"  — spot, 8-decimal ceiling
```

The third argument selects the market type and defaults to `"perp"`. Pass `"spot"` when the price belongs to a spot
market — the decimal ceiling differs.

{% hint style="info" %}

Don't rely on
[`toFixed(n)`](https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/Number/toFixed): it
rounds instead of truncating, ignores the significant-figures ceiling and has issues with
[floating-point precision](https://floating-point-gui.de/).

{% endhint %}

{% hint style="warning" %}

`formatPrice` **truncates**, it does not round. If truncation collapses a very small price to `0`, it throws
`RangeError`.

{% endhint %}

<a id="lot-size-formatsize"></a>

## Lot size → `formatSize`

The lot-size rule is the simpler of the two: an order's size may not carry more decimal places than the asset's
`szDecimals`. Use `formatSize` to truncate the string to fit:

<!-- deno-fmt-ignore -->
```ts
import { formatSize } from "@nktkas/hyperliquid/utils";

formatSize("1.23456789", 5);  // "1.23456"
formatSize("0.123456789", 2); // "0.12"
formatSize("100", 0);         // "100"
```

{% hint style="warning" %}

Hyperliquid treats a literal `"0"` size on a reduce-only order as "close the whole position". `formatSize` refuses to
return `"0"` (it throws `RangeError`), so if you actually want that behavior, pass `"0"` directly into the order payload
instead of routing it through `formatSize`.

{% endhint %}

<a id="asset-id-symbolconverter"></a>

## Asset ID → `SymbolConverter`

A signed order carries `a: number`, not a symbol. Hyperliquid assigns asset IDs across four disjoint ranges, each driven
by a different info endpoint:

| Market type               | Asset ID                                  | Driven by                      |
| ------------------------- | ----------------------------------------- | ------------------------------ |
| Perpetuals                | `0, 1, 2, …`                              | `meta().universe`              |
| Spot markets              | `10000 + market.index`                    | `spotMeta()`                   |
| Builder DEX (HIP-3 perps) | `100000 + dexIndex * 10000 + asset.index` | `perpDexs()` + `meta({ dex })` |
| Outcome markets           | `100000000 + outcomeId * 10 + sideIndex`  | `outcomeMeta()`                |

For reliability, prefer fetching these mappings at runtime over hardcoding them. Use `SymbolConverter` to do that — it
fetches the metadata once and exposes the lookups as plain methods.

### Create

`SymbolConverter.create()` pulls `meta`, `spotMeta`, and `outcomeMeta` (plus builder-DEX metadata when enabled) and
resolves into a ready-to-use instance:

```ts
import { HttpTransport } from "@nktkas/hyperliquid";
import { SymbolConverter } from "@nktkas/hyperliquid/utils";

const transport = new HttpTransport();
const converter = await SymbolConverter.create({ transport });
```

If you need a synchronous constructor — e.g., to keep `SymbolConverter` as a field of a class built before any network
I/O — use `new SymbolConverter({ transport })` and call `await converter.reload()` explicitly. `create` is the shortcut
for the common case.

### Resolve an asset ID

`getAssetId` takes the symbol in whichever format its market uses:

<!-- deno-fmt-ignore -->
```ts
converter.getAssetId("BTC");       // 0       — perpetual
converter.getAssetId("HYPE/USDC"); // 10107   — spot market
converter.getAssetId("test:ABC");  // 110000  — builder DEX (if enabled)
converter.getAssetId("btc-above-61720-yes-jun-08-0600"); // 100002200 — outcome market
```

The accepted formats follow the asset-ID ranges one-for-one:

| Market type    | Name format      | Example                             |
| -------------- | ---------------- | ----------------------------------- |
| Perpetual      | `<COIN>`         | `"BTC"`                             |
| Spot           | `<BASE>/<QUOTE>` | `"HYPE/USDC"`                       |
| Builder DEX    | `<DEX>:<ASSET>`  | `"test:ABC"`                        |
| Outcome market | `<url-slug>`     | `"btc-above-61720-yes-jun-08-0600"` |

`getAssetId` returns `undefined` for an unknown symbol.

### Read `szDecimals`

`getSzDecimals` returns the same precision that `formatPrice` and `formatSize` need.

```ts
import { formatPrice, formatSize } from "@nktkas/hyperliquid/utils";

const szDecimals = converter.getSzDecimals("BTC")!; // 5

formatPrice("97123.456789", szDecimals); // "97123"
formatSize("0.00123456789", szDecimals); // "0.00123"
```

For spot markets, `getSzDecimals` returns the `szDecimals` of the **base** token — which is what both formatters expect
for an order on that pair.

Outcome markets carry no `szDecimals` metadata, so `getSzDecimals` always returns `5` for them.

### Spot pair IDs

The `a` field on an order is one identifier. Info endpoints and subscriptions (`l2Book`, `trades`, `candleSnapshot`, …)
use a different one for spot markets — usually a `"@<n>"` alias, with a handful of legacy pairs that kept their
`"BASE/QUOTE"` form. `getSpotPairId` gives you the identifier the info side expects:

```ts
converter.getSpotPairId("HYPE/USDC"); // "@107"
converter.getSpotPairId("PURR/USDC"); // "PURR/USDC"  — legacy pair
```

Round-trip back to the symbol with `getSymbolBySpotPairId`, useful when you receive a subscription event and want a
human-readable label:

<!-- deno-fmt-ignore -->
```ts
converter.getSymbolBySpotPairId("@107");      // "HYPE/USDC"
converter.getSymbolBySpotPairId("PURR/USDC"); // "PURR/USDC"
```

Both methods return `undefined` for unknown pairs.

### Refresh after a new listing

A converter is a snapshot of the universe at creation time. When Hyperliquid lists a new asset — or when your process
has been running long enough to race against one — call `reload` to re-fetch the metadata and rebuild the lookups in
place:

```ts
await converter.reload();
```

### Builder DEXs

[HIP-3 builder-deployed perpetuals](https://hyperliquid.gitbook.io/hyperliquid-docs/hyperliquid-improvement-proposals-hips/hip-3-builder-deployed-perpetuals)
live outside the default universe. `SymbolConverter` ignores them unless you opt in through the `dexs` option:

{% tabs %}

{% tab title="All builder DEXs" %}

```ts
const converter = await SymbolConverter.create({
  transport,
  dexs: true,
});
```

{% endtab %}

{% tab title="Selected DEXs" %}

```ts
const converter = await SymbolConverter.create({
  transport,
  dexs: ["test", "other"],
});
```

{% endtab %}

{% endtabs %}

Builder DEX assets use the `"DEX:ASSET"` naming convention:

<!-- deno-fmt-ignore -->
```ts
converter.getAssetId("test:ABC");    // 110000
converter.getSzDecimals("test:ABC"); // 0
```

{% hint style="info" %}

Enabling `dexs` adds a `perpDexs()` call plus one `meta({ dex })` request per builder DEX. Only enable it if you
actually trade there — the default `SymbolConverter.create()` is one round-trip each to `meta`, `spotMeta`, and
`outcomeMeta` in parallel.

{% endhint %}

## End-to-end: resolve, format, place

All three invariants in one flow — resolve the asset ID, read `szDecimals`, format price and size, submit the order:

<!-- deno-fmt-ignore -->
```ts
import { ExchangeClient, HttpTransport } from "@nktkas/hyperliquid";
import { formatPrice, formatSize, SymbolConverter } from "@nktkas/hyperliquid/utils";
import { privateKeyToAccount } from "viem/accounts";

const wallet = privateKeyToAccount("0x...");
const transport = new HttpTransport();
const converter = await SymbolConverter.create({ transport });
const client = new ExchangeClient({ transport, wallet });

const coin = "BTC";
const rawPrice = "97123.456789";
const rawSize = "0.00123456789";

// `!` asserts the symbol exists — in production, handle `undefined` explicitly
const assetId = converter.getAssetId(coin)!;
const szDecimals = converter.getSzDecimals(coin)!;

await client.order({
  orders: [{
    a: assetId,                           // "BTC" → 0
    b: true,
    p: formatPrice(rawPrice, szDecimals), // "97123.456789" → "97123"
    s: formatSize(rawSize, szDecimals),   // "0.00123456789" → "0.00123"
    r: false,
    t: { limit: { tif: "Gtc" } },
  }],
  grouping: "na",
});
```
