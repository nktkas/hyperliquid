import {
  meta,
  type MetaResponse,
  outcomeMeta,
  type OutcomeMetaResponse,
  perpDexs,
  type PerpDexsResponse,
  spotMeta,
  type SpotMetaResponse,
} from "../api/info/mod.ts";
import type { IRequestTransport } from "../transport/mod.ts";

/** Options for creating a {@link SymbolConverter} instance. */
export interface SymbolConverterOptions {
  /** Transport instance to use for API requests. */
  transport: IRequestTransport;
  /** Optional dex support: array of dex names, true for all dexs, or false/undefined to skip. */
  dexs?: string[] | boolean;
}

/**
 * Utility class for converting asset symbols to their corresponding IDs and size decimals.
 * Supports perpetuals, spot markets, and optional builder dexs.
 *
 * @example
 * ```ts
 * import { HttpTransport } from "@nktkas/hyperliquid";
 * import { SymbolConverter } from "@nktkas/hyperliquid/utils";
 *
 * const transport = new HttpTransport(); // or `WebSocketTransport`
 * const converter = await SymbolConverter.create({ transport });
 *
 * // By default, dexs are not loaded; specify them when creating an instance
 * // const converter = await SymbolConverter.create({ transport, dexs: ["test"] });
 *
 * const btcId = converter.getAssetId("BTC"); // perpetual → 0
 * const hypeUsdcId = converter.getAssetId("HYPE/USDC"); // spot market → 10107
 * const dexAbcId = converter.getAssetId("test:ABC"); // builder dex (if enabled) → 110000
 *
 * const btcSzDecimals = converter.getSzDecimals("BTC"); // perpetual → 5
 * const hypeUsdcSzDecimals = converter.getSzDecimals("HYPE/USDC"); // spot market → 2
 * const dexAbcSzDecimals = converter.getSzDecimals("test:ABC"); // builder dex (if enabled) → 0
 *
 * const spotPairId = converter.getSpotPairId("HFUN/USDC"); // → "@2"
 *
 * const symbol = converter.getSymbolBySpotPairId("@107"); // → "HYPE/USDC"
 * ```
 *
 * @see https://hyperliquid.gitbook.io/hyperliquid-docs/for-developers/api/asset-ids
 */
export class SymbolConverter {
  private _transport: IRequestTransport;
  private _dexOption: string[] | boolean;
  private _nameToAssetId = new Map<string, number>();
  private _nameToSzDecimals = new Map<string, number>();
  private _nameToSpotPairId = new Map<string, string>();
  private _spotPairIdToName = new Map<string, string>();

  /**
   * Creates a new SymbolConverter instance, but does not initialize it.
   * Run {@link reload} to load asset data or use {@link create} to create and initialize in one step.
   *
   * @param options Configuration options including transport and optional dex support.
   */
  constructor(options: SymbolConverterOptions) {
    this._transport = options.transport;
    this._dexOption = options.dexs ?? false;
  }

  /**
   * Create and initialize a SymbolConverter instance.
   *
   * @param options Configuration options including transport and optional dex support.
   * @return Initialized SymbolConverter instance.
   *
   * @example
   * ```ts
   * import { HttpTransport } from "@nktkas/hyperliquid";
   * import { SymbolConverter } from "@nktkas/hyperliquid/utils";
   *
   * const transport = new HttpTransport(); // or `WebSocketTransport`
   * const converter = await SymbolConverter.create({ transport });
   * ```
   */
  static async create(options: SymbolConverterOptions): Promise<SymbolConverter> {
    const instance = new SymbolConverter(options);
    await instance.reload();
    return instance;
  }

  /**
   * Reload asset mappings from the API.
   *
   * Useful for refreshing data when new assets are added.
   */
  async reload(): Promise<void> {
    const config = { transport: this._transport };
    const needDexs = this._dexOption === true || (Array.isArray(this._dexOption) && this._dexOption.length > 0);

    const [perpMetaData, spotMetaData, perpDexsData, outcomeMetaData] = await Promise.all([
      meta(config),
      spotMeta(config),
      needDexs ? perpDexs(config) : undefined,
      outcomeMeta(config),
    ]);

    if (!perpMetaData?.universe?.length) {
      throw new Error("Invalid perpetual metadata response");
    }

    if (!spotMetaData?.universe?.length || !spotMetaData?.tokens?.length) {
      throw new Error("Invalid spot metadata response");
    }

    this._nameToAssetId.clear();
    this._nameToSzDecimals.clear();
    this._nameToSpotPairId.clear();
    this._spotPairIdToName.clear();

    this._processDefaultPerps(perpMetaData);
    this._processSpotAssets(spotMetaData);
    this._processAllRecurringOutcomeAssets(outcomeMetaData);

    // Only process builder dexs if dex support is enabled
    if (perpDexsData) {
      await this._processBuilderDexs(perpDexsData);
    }
  }

  private _processDefaultPerps(perpMetaData: MetaResponse): void {
    perpMetaData.universe.forEach((asset, index) => {
      this._nameToAssetId.set(asset.name, index);
      this._nameToSzDecimals.set(asset.name, asset.szDecimals);
    });
  }

  private async _processBuilderDexs(perpDexsData: PerpDexsResponse): Promise<void> {
    if (!perpDexsData || perpDexsData.length <= 1) return;

    const builderDexs = perpDexsData
      .map((dex, index) => ({ dex, index }))
      .filter((item): item is { dex: NonNullable<PerpDexsResponse[number]>; index: number } => {
        return item.index > 0 && item.dex !== null && item.dex.name.length > 0;
      });

    if (builderDexs.length === 0) return;

    // Filter dexs based on the dexOption
    const dexsToProcess = Array.isArray(this._dexOption)
      ? builderDexs.filter((item) => (this._dexOption as string[]).includes(item.dex.name))
      : builderDexs; // true means process all

    if (dexsToProcess.length === 0) return;

    const config = { transport: this._transport };
    const results = await Promise.allSettled(
      dexsToProcess.map((item) => meta(config, { dex: item.dex.name })),
    );

    results.forEach((result, idx) => {
      if (result.status !== "fulfilled") return;
      this._processBuilderDexResult(result.value, dexsToProcess[idx].index);
    });
  }

  private _processBuilderDexResult(dexMeta: MetaResponse, perpDexIndex: number): void {
    const offset = 100000 + perpDexIndex * 10000;

    dexMeta.universe.forEach((asset, index) => {
      const assetId = offset + index;
      this._nameToAssetId.set(asset.name, assetId);
      this._nameToSzDecimals.set(asset.name, asset.szDecimals);
    });
  }

  private _processSpotAssets(spotMetaData: SpotMetaResponse): void {
    const tokenMap = new Map<number, { name: string; szDecimals: number }>();
    spotMetaData.tokens.forEach((token) => {
      tokenMap.set(token.index, { name: token.name, szDecimals: token.szDecimals });
    });

    spotMetaData.universe.forEach((market) => {
      if (market.tokens.length < 2) return;
      const baseToken = tokenMap.get(market.tokens[0]);
      const quoteToken = tokenMap.get(market.tokens[1]);
      if (!baseToken || !quoteToken) return;

      const assetId = 10000 + market.index;
      const baseQuoteKey = `${baseToken.name}/${quoteToken.name}`;
      this._nameToAssetId.set(baseQuoteKey, assetId);
      this._nameToSzDecimals.set(baseQuoteKey, baseToken.szDecimals);
      this._nameToSpotPairId.set(baseQuoteKey, market.name);
      this._spotPairIdToName.set(market.name, baseQuoteKey);
    });
  }

  private _processAllRecurringOutcomeAssets(outcomeMetaData: OutcomeMetaResponse): void {
    this._processBinaryOutcomeAssets(outcomeMetaData);
    this._processRecurringBucketOutcomeAssets(outcomeMetaData);
  }
  /**
   * Handle the population of binary(priceBinary) outcome market slugs
   */
  private _processBinaryOutcomeAssets(outcomeMetaData: OutcomeMetaResponse): void {
    outcomeMetaData.outcomes.forEach((outcome) => {
      if (outcome.name !== "Recurring" || !outcome.description.includes("class:priceBinary")) return;

      outcome.sideSpecs.forEach((sideSpec, sideIdx) => {
        this._populateIndividualBucketOutcome(
          outcome.outcome,
          sideSpec.name,
          sideIdx,
          outcome.description,
          0,
        );
      });
    });
  }

  /**
   * Handle the population of multi-price(priceBucket) outcome market slugs
   */
  private _processRecurringBucketOutcomeAssets(outcomeMetaData: OutcomeMetaResponse): void {
    outcomeMetaData.questions.forEach((question) => {
      if (question.name === "Recurring" && question.description.includes("class:priceBucket")) {
        if (question.namedOutcomes.length !== 3) return;

        question.namedOutcomes.forEach((outcomeId: number, outcomeIndex: number) => {
          const outcomeObj = outcomeMetaData.outcomes.find((entry) => entry.outcome === outcomeId);

          if (outcomeObj) {
            outcomeObj.sideSpecs.forEach((sideSpec, sideIdx) => {
              this._populateIndividualBucketOutcome(
                outcomeObj.outcome,
                sideSpec.name,
                sideIdx,
                question.description,
                outcomeIndex,
              );
            });
          }
        });
      }
    });
  }

  /**
   * Map the slug to the assetId as per the specification:
   * {@link https://hyperliquid.gitbook.io/hyperliquid-docs/for-developers/api/asset-ids}
   */
  private _populateIndividualBucketOutcome(
    outcomeId: number,
    sideSpec: string,
    sideIdx: number,
    description: string,
    outcomeIndex: number,
  ): void {
    const slug = this._descriptionToSlug(description, sideSpec, outcomeIndex);
    if (!slug) return;
    const encoding = 10 * outcomeId + sideIdx;
    const assetId = 100000000 + encoding;

    this._nameToAssetId.set(slug, assetId);
  }

  /**
   * Generate the appropiate slug for binary and multi-price(bucket) outcome markets
   * {@link https://hyperliquid.gitbook.io/hyperliquid-docs/trading/contract-specifications}
   * @param description complete description of an outcome
   * @param side for the requested slug retrieved from the sideSpecs
   * @param outcomeIndex for the classification of the bucket: (0 -> below, 1-between, 2-above)
   * @returns the generated slug
   */
  private _descriptionToSlug(description: string, side: string, outcomeIndex: number): string | null {
    const parts = description.split("|");
    const lookup: Record<string, string> = {};

    for (const part of parts) {
      const [key, value] = part.split(":");
      lookup[key] = value;
    }

    const { class: assetClass, underlying, expiry } = lookup;

    if (!assetClass || !underlying || !expiry) return null;

    const months = ["jan", "feb", "mar", "apr", "may", "jun", "jul", "aug", "sep", "oct", "nov", "dec"];
    const monthName = months[parseInt(expiry.slice(4, 6)) - 1];
    const day = expiry.slice(6, 8);
    const time = expiry.slice(9, 13);
    const dateStr = `${monthName}-${day}-${time}`;

    if (assetClass === "priceBinary") {
      const { targetPrice } = lookup;
      if (!targetPrice) return null;
      return `${underlying}-above-${targetPrice}-${side}-${dateStr}`.toLowerCase();
    }

    if (assetClass === "priceBucket") {
      const { priceThresholds } = lookup;
      if (!priceThresholds) return null;
      const prices = priceThresholds.split(",");
      if (prices.length !== 2) return null;

      const bucketStr = outcomeIndex === 0
        ? `below-${prices[0]}`
        : outcomeIndex === 1
        ? `${prices[0]}-to-${prices[1]}`
        : `above-${prices[1]}`;

      return `${underlying}-price-range-${dateStr}-${bucketStr}-${side}`.toLowerCase();
    }
    return null;
  }

  /**
   * Get asset ID for a coin.
   * - For Perpetuals, use the coin name (e.g., "BTC").
   * - For Spot markets, use the "BASE/QUOTE" format (e.g., "HYPE/USDC").
   * - For Builder Dex assets, use the "DEX_NAME:ASSET_NAME" format (e.g., "test:ABC").
   *
   * @example
   * ```ts
   * import { HttpTransport } from "@nktkas/hyperliquid";
   * import { SymbolConverter } from "@nktkas/hyperliquid/utils";
   *
   * const transport = new HttpTransport(); // or `WebSocketTransport`
   * const converter = await SymbolConverter.create({ transport });
   *
   * converter.getAssetId("BTC"); // → 0
   * converter.getAssetId("HYPE/USDC"); // → 10107
   * converter.getAssetId("test:ABC"); // → 110000
   * // Can also be used to retrieve the assetId of outcome markets using the same slug as in the URL
   * // Examples:
   * // For binary outcome markets: btc-above-81041-yes-may-08-0600
   * // For multi-price outcome markets:
   * //     btc-price-range-may-08-0600-below-79303-yes
   * //     btc-price-range-may-08-0600-79303-to-82540-yes
   * //     btc-price-range-may-08-0600-above-82540-yes
   * ```
   */
  getAssetId(name: string): number | undefined {
    return this._nameToAssetId.get(name);
  }

  /**
   * Get size decimals for a coin.
   * - For Perpetuals, use the coin name (e.g., "BTC").
   * - For Spot markets, use the "BASE/QUOTE" format (e.g., "HYPE/USDC").
   * - For Builder Dex assets, use the "DEX_NAME:ASSET_NAME" format (e.g., "test:ABC").
   *
   * @example
   * ```ts
   * import { HttpTransport } from "@nktkas/hyperliquid";
   * import { SymbolConverter } from "@nktkas/hyperliquid/utils";
   *
   * const transport = new HttpTransport(); // or `WebSocketTransport`
   * const converter = await SymbolConverter.create({ transport });
   *
   * converter.getSzDecimals("BTC"); // → 5
   * converter.getSzDecimals("HYPE/USDC"); // → 2
   * converter.getSzDecimals("test:ABC"); // → 0
   * ```
   */
  getSzDecimals(name: string): number | undefined {
    return this._nameToSzDecimals.get(name);
  }

  /**
   * Get spot pair ID for info endpoints and subscriptions (e.g., l2book, trades).
   *
   * Accepts spot markets in the "BASE/QUOTE" format (e.g., "HFUN/USDC").
   *
   * @example
   * ```ts
   * import { HttpTransport } from "@nktkas/hyperliquid";
   * import { SymbolConverter } from "@nktkas/hyperliquid/utils";
   *
   * const transport = new HttpTransport(); // or `WebSocketTransport`
   * const converter = await SymbolConverter.create({ transport });
   *
   * converter.getSpotPairId("HFUN/USDC"); // → "@2"
   * converter.getSpotPairId("PURR/USDC"); // → "PURR/USDC" (exceptions exist for some pairs)
   * ```
   */
  getSpotPairId(name: string): string | undefined {
    return this._nameToSpotPairId.get(name);
  }

  /**
   * Get the symbol ("BASE/QUOTE") from a spot pair ID.
   *
   * Accepts pair IDs such as "@107" or "PURR/USDC".
   *
   * @example
   * ```ts
   * import { HttpTransport } from "@nktkas/hyperliquid";
   * import { SymbolConverter } from "@nktkas/hyperliquid/utils";
   *
   * const transport = new HttpTransport(); // or `WebSocketTransport`
   * const converter = await SymbolConverter.create({ transport });
   *
   * converter.getSymbolBySpotPairId("@107"); // → "HYPE/USDC"
   * converter.getSymbolBySpotPairId("PURR/USDC"); // → "PURR/USDC"
   * ```
   */
  getSymbolBySpotPairId(pairId: string): string | undefined {
    return this._spotPairIdToName.get(pairId);
  }
}
