# Utilities

Helpers that keep your order payloads compatible with Hyperliquid's on-chain rules. Read this page when you are building
an order, resolving a symbol, or wondering why the server rejected a number that looks fine. Everything here is imported
from `@nktkas/hyperliquid/utils` and lives in [`../src/utils/`](../src/utils/).

## Three invariants you have to honor

Hyperliquid's exchange rejects requests that break its price, size, and asset rules before they even reach the matching
engine. Three of those rules touch every order you build:

| Invariant     | What it means                                                        | SDK helper                                     |
| ------------- | -------------------------------------------------------------------- | ---------------------------------------------- |
| **Tick size** | Prices must fit a bounded number of significant figures and decimals | [`formatPrice`](#tick-size-formatprice)        |
| **Lot size**  | Sizes must not exceed the asset's `szDecimals`                       | [`formatSize`](#lot-size-formatsize)           |
| **Asset ID**  | The `a` field in an order is a numeric index, not `"BTC"`            | [`SymbolConverter`](#asset-id-symbolconverter) |

The rest of this page is those three invariants, each followed by the helper that resolves it, and an end-to-end example
that composes all three.

<a id="tick-size-formatprice"></a>

## Tick size → `formatPrice`

Hyperliquid's
[tick and lot size rules](https://hyperliquid.gitbook.io/hyperliquid-docs/for-developers/api/tick-and-lot-size)
constrain every order price to three conditions at once:

- At most **5 significant figures**.
- At most **`6 − szDecimals`** decimals for perpetuals, **`8 − szDecimals`** for spot.
- Integer prices are always valid, regardless of significant figures.

A plain `toFixed(n)` is not enough: it rounds instead of truncating and ignores the significant-figures ceiling.
[`formatPrice`](../src/utils/_format.ts) applies both rules at once, as a string operation so arbitrary-precision inputs
survive intact:

<!-- deno-fmt-ignore -->
```ts
import { formatPrice } from "@nktkas/hyperliquid/utils";

formatPrice("97123.456789", 0);            // "97123"       — perp, szDecimals=0
formatPrice("1.23456789", 5);              // "1.2"         — perp, szDecimals=5
formatPrice("0.0000123456789", 0, "spot"); // "0.00001234"  — spot, 8-decimal ceiling
```

The third argument selects the market type and defaults to `"perp"`. Pass `"spot"` when the price belongs to a spot
market — the decimal ceiling differs.

{% hint style="warning" %} `formatPrice` **truncates**, it does not round. If truncation collapses a very small price to
`0`, it throws `RangeError` instead of silently sending a zero-valued order. Treat that error as a signal to rescale the
input, not as something to catch and ignore. {% endhint %}

<a id="lot-size-formatsize"></a>

## Lot size → `formatSize`

The lot-size rule is the simpler of the two: an order's size may not carry more decimal places than the asset's
`szDecimals`. [`formatSize`](../src/utils/_format.ts) truncates the string to fit:

<!-- deno-fmt-ignore -->
```ts
import { formatSize } from "@nktkas/hyperliquid/utils";

formatSize("1.23456789", 5);  // "1.23456"
formatSize("0.123456789", 2); // "0.12"
formatSize("100", 0);         // "100"
```

Like `formatPrice`, it throws `RangeError` if truncation produces `0` — so an accidental 8-decimal size against a
`szDecimals = 3` asset fails at the call site rather than at the server.

{% hint style="warning" %} Hyperliquid treats a literal `"0"` size on a reduce-only order as "close the whole position".
`formatSize` refuses to return `"0"`, so if you actually want that behavior, pass `"0"` directly into the order payload
instead of routing it through `formatSize`. {% endhint %}

<a id="asset-id-symbolconverter"></a>

## Asset ID → `SymbolConverter`

A signed order carries `a: number`, not `"BTC"`. Hyperliquid assigns asset IDs across three disjoint ranges, each driven
by a different info endpoint:

```
┌───────────────────┬──────────────────────────────┬─────────────────────┐
│  Perpetuals       │  0, 1, 2, …                  │  meta().universe    │
├───────────────────┼──────────────────────────────┼─────────────────────┤
│  Spot markets     │  10000 + market.index        │  spotMeta()         │
├───────────────────┼──────────────────────────────┼─────────────────────┤
│  Builder DEX      │  100000 + dexIndex * 10000   │  perpDexs()         │
│  (HIP-3 perps)    │  + asset.index               │  + meta({dex})      │
└───────────────────┴──────────────────────────────┴─────────────────────┘
```

For reliability, prefer fetching these mappings at runtime over hardcoding them.
[`SymbolConverter`](../src/utils/_symbolConverter.ts) does that and exposes the lookups as plain methods.

### Create

`SymbolConverter.create()` pulls `meta` + `spotMeta` (and optionally builder-DEX metadata) and resolves into a
ready-to-use instance:

```ts
import { HttpTransport } from "@nktkas/hyperliquid";
import { SymbolConverter } from "@nktkas/hyperliquid/utils";

const transport = new HttpTransport();
const converter = await SymbolConverter.create({ transport });
```

If you need a synchronous constructor — for example, to keep `SymbolConverter` as a field of a class built before any
network I/O — use `new SymbolConverter({ transport })` and call `await converter.reload()` explicitly. `create` is the
shortcut for the common case.

### Resolve an asset ID

`getAssetId` takes the symbol in whichever format its market uses:

<!-- deno-fmt-ignore -->
```ts
converter.getAssetId("BTC");       // 0       — perpetual
converter.getAssetId("HYPE/USDC"); // 10107   — spot market
converter.getAssetId("test:ABC");  // 110000  — builder DEX (if enabled)
```

The accepted formats follow the asset-ID ranges one-for-one:

| Market type | Name format      | Example       |
| ----------- | ---------------- | ------------- |
| Perpetual   | `<COIN>`         | `"BTC"`       |
| Spot        | `<BASE>/<QUOTE>` | `"HYPE/USDC"` |
| Builder DEX | `<DEX>:<ASSET>`  | `"test:ABC"`  |

`getAssetId` returns `undefined` for an unknown symbol.

### Read `szDecimals`

`getSzDecimals` returns the same precision that `formatPrice` and `formatSize` need. This is the coupling the three
invariants share: you ask the converter once, then feed the same value into both formatters.

```ts
import { formatPrice, formatSize } from "@nktkas/hyperliquid/utils";

const szDecimals = converter.getSzDecimals("BTC")!; // 5

formatPrice("97123.456789", szDecimals); // "97123"
formatSize("0.00123456789", szDecimals); // "0.00123"
```

For spot markets, `getSzDecimals` returns the `szDecimals` of the **base** token — which is what both formatters expect
for an order on that pair.

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

`reload` reuses the transport and `dexs` option the instance was created with, so you do not need to pass them again.

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

Builder DEX assets use the `"DEX:ASSET"` naming convention and slot into the 100000+ ID range:

<!-- deno-fmt-ignore -->
```ts
converter.getAssetId("test:ABC");    // 110000
converter.getSzDecimals("test:ABC"); // 0
```

{% hint style="info" %} Enabling `dexs` adds a `perpDexs()` call plus one `meta({ dex })` request per builder DEX. Only
enable it if you actually trade there — the default `SymbolConverter.create()` is one round-trip each to `meta` and
`spotMeta` in parallel. {% endhint %}

## End-to-end: resolve, format, place

All three invariants in one flow — resolve the asset ID, read `szDecimals`, format price and size, submit the order:

{% code title="place-order.ts" %}

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
    a: assetId,                           // asset-ID invariant
    b: true,                              // buy
    p: formatPrice(rawPrice, szDecimals), // tick-size invariant → "97123"
    s: formatSize(rawSize, szDecimals),   // lot-size invariant → "0.00123"
    r: false,                             // not reduce-only
    t: { limit: { tif: "Gtc" } },         // Good-Til-Cancelled
  }],
  grouping: "na",
});
```

{% endcode %}
