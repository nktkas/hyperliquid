import type { IRequestTransport } from "../transport/base.ts";
import { meta, type MetaResponse } from "../api/info/meta.ts";
import { spotMeta, type SpotMetaResponse } from "../api/info/spotMeta.ts";
import { perpDexs, type PerpDexsResponse } from "../api/info/perpDexs.ts";

export type DexOption = string[] | boolean;

/** Options for creating a SymbolConverter instance. */
export interface SymbolConverterOptions {
  /** Transport instance to use for API requests. */
  transport: IRequestTransport;
  /** Optional dex support: array of dex names, true for all dexs, or false/undefined to skip. */
  dexs?: DexOption;
}

/**
 * Utility class for converting asset symbols to their corresponding IDs and size decimals.
 * Supports perpetuals, spot markets, and optional builder dexs.
 * @see https://hyperliquid.gitbook.io/hyperliquid-docs/for-developers/api/asset-ids
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
 * ```
 */
export class SymbolConverter {
  private readonly transport: IRequestTransport;
  private readonly dexOption: DexOption;
  private readonly nameToAssetId = new Map<string, number>();
  private readonly nameToSzDecimals = new Map<string, number>();
  private readonly nameToSpotPairId = new Map<string, string>();

  private constructor(options: SymbolConverterOptions) {
    this.transport = options.transport;
    this.dexOption = options.dexs ?? false;
  }

  /**
   * Create and initialize a SymbolConverter instance.
   * @param options - Configuration options including transport and optional dex support.
   * @returns Initialized SymbolConverter instance.
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
   * Useful for refreshing data when new assets are added.
   */
  async reload(): Promise<void> {
    const config = { transport: this.transport };
    const [perpMetaData, spotMetaData, perpDexsData] = await Promise.all([
      meta(config),
      spotMeta(config),
      perpDexs(config),
    ]);

    if (!perpMetaData?.universe?.length) {
      throw new Error("Invalid perpetual metadata response");
    }

    if (!spotMetaData?.universe?.length || !spotMetaData?.tokens?.length) {
      throw new Error("Invalid spot metadata response");
    }

    this.nameToAssetId.clear();
    this.nameToSzDecimals.clear();
    this.nameToSpotPairId.clear();

    this.processDefaultPerps(perpMetaData);
    this.processSpotAssets(spotMetaData);

    // Only process builder dexs if dex support is enabled
    if (this.dexOption !== false) {
      await this.processBuilderDexs(perpDexsData);
    }
  }

  private processDefaultPerps(perpMeta: MetaResponse): void {
    perpMeta.universe.forEach((asset, index) => {
      this.nameToAssetId.set(asset.name, index);
      this.nameToSzDecimals.set(asset.name, asset.szDecimals);
    });
  }

  private async processBuilderDexs(perpDexs: PerpDexsResponse): Promise<void> {
    if (!perpDexs || perpDexs.length <= 1) return;

    const builderDexs = perpDexs
      .map((dex, index) => ({ dex, index }))
      .filter((item): item is { dex: NonNullable<PerpDexsResponse[number]>; index: number } => {
        return item.index > 0 && item.dex !== null && item.dex.name.length > 0;
      });

    if (builderDexs.length === 0) return;

    // Filter dexs based on the dexOption
    const dexsToProcess = Array.isArray(this.dexOption)
      ? builderDexs.filter((item) => (this.dexOption as string[]).includes(item.dex.name))
      : builderDexs; // true means process all

    if (dexsToProcess.length === 0) return;

    const config = { transport: this.transport };
    const results = await Promise.allSettled(
      dexsToProcess.map((item) => meta(config, { dex: item.dex.name })),
    );

    results.forEach((result, idx) => {
      if (result.status !== "fulfilled") return;
      this.processBuilderDexResult(result.value, dexsToProcess[idx].index);
    });
  }

  private processBuilderDexResult(meta: MetaResponse, perpDexIndex: number): void {
    const offset = 100000 + perpDexIndex * 10000;

    meta.universe.forEach((asset, index) => {
      const assetId = offset + index;
      this.nameToAssetId.set(asset.name, assetId);
      this.nameToSzDecimals.set(asset.name, asset.szDecimals);
    });
  }

  private processSpotAssets(spotMeta: SpotMetaResponse): void {
    const tokenMap = new Map<number, { name: string; szDecimals: number }>();
    spotMeta.tokens.forEach((token) => {
      tokenMap.set(token.index, { name: token.name, szDecimals: token.szDecimals });
    });

    spotMeta.universe.forEach((market) => {
      if (market.tokens.length < 2) return;
      const baseToken = tokenMap.get(market.tokens[0]);
      const quoteToken = tokenMap.get(market.tokens[1]);
      if (!baseToken || !quoteToken) return;

      const assetId = 10000 + market.index;
      const baseQuoteKey = `${baseToken.name}/${quoteToken.name}`;
      this.nameToAssetId.set(baseQuoteKey, assetId);
      this.nameToSzDecimals.set(baseQuoteKey, baseToken.szDecimals);
      this.nameToSpotPairId.set(baseQuoteKey, market.name);
    });
  }

  /**
   * Get asset ID for a coin.
   * - For Perpetuals, use the coin name (e.g., "BTC").
   * - For Spot markets, use the "BASE/QUOTE" format (e.g., "HYPE/USDC").
   * - For Builder Dex assets, use the "DEX_NAME:ASSET_NAME" format (e.g., "test:ABC").
   * @example "BTC" → 0, "HYPE/USDC" → 10107, "test:ABC" → 110000
   */
  getAssetId(name: string): number | undefined {
    return this.nameToAssetId.get(name);
  }

  /**
   * Get size decimals for a coin.
   * - For Perpetuals, use the coin name (e.g., "BTC").
   * - For Spot markets, use the "BASE/QUOTE" format (e.g., "HYPE/USDC").
   * - For Builder Dex assets, use the "DEX_NAME:ASSET_NAME" format (e.g., "test:ABC").
   * @example "BTC" → 5, "HYPE/USDC" → 2, "test:ABC" → 0
   */
  getSzDecimals(name: string): number | undefined {
    return this.nameToSzDecimals.get(name);
  }

  /**
   * Get spot pair ID for info endpoints and subscriptions (e.g., l2book, trades).
   *
   * Accepts spot markets in the "BASE/QUOTE" format (e.g., "HFUN/USDC").
   * @example "HFUN/USDC" → "@2", "PURR/USDC" → "PURR/USDC"
   */
  getSpotPairId(name: string): string | undefined {
    return this.nameToSpotPairId.get(name);
  }
}
