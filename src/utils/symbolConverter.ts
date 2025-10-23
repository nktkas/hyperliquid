import type { IRequestTransport } from "../transport/base.ts";
import { meta, type MetaResponse } from "../api/info/meta.ts";
import { spotMeta, type SpotMetaResponse } from "../api/info/spotMeta.ts";
import { perpDexs, type PerpDexsResponse } from "../api/info/perpDexs.ts";

export type DexOption = string[] | boolean;

export interface SymbolConverterOptions {
  /** Transport instance to use for API requests. */
  transport: IRequestTransport;
  /** Optional dex support: array of dex names, true for all dexs, or false/undefined to skip. */
  dexs?: DexOption;
}

export class SymbolConverter {
  private readonly transport: IRequestTransport;
  private readonly dexOption: DexOption;
  private readonly nameToAssetId = new Map<string, number>();
  private readonly nameToSzDecimals = new Map<string, number>();

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
   * const converter = await SymbolConverter.create({ transport });
   * const btcId = converter.getAssetId("BTC");
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
    });
  }

  /**
   * Get asset ID for a coin.
   * @example "BTC" → 0, "PURR/USDC" → 10000
   */
  getAssetId(name: string): number | undefined {
    return this.nameToAssetId.get(name);
  }

  /**
   * Get size decimals for a coin.
   * @example "BTC" → 5, "PURR/USDC" → 0
   */
  getSzDecimals(name: string): number | undefined {
    return this.nameToSzDecimals.get(name);
  }

}
