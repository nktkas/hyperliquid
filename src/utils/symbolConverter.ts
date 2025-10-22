import { HttpTransport } from "../transport/http/mod.ts";
import type { MetaResponse } from "../api/info/meta.ts";
import type { SpotMetaResponse  } from "../api/info/spotMeta.ts";
import type { PerpDexsResponse } from "../api/info/perpDexs.ts";

export class SymbolConverter {
  private readonly transport: HttpTransport;
  private readonly nameToAssetId = new Map<string, number>();
  private readonly nameToSzDecimals = new Map<string, number>();
  private initialized = false;

  constructor(isTestnet: boolean) {
    this.transport = new HttpTransport({ isTestnet });
  }

  async initialize(): Promise<void> {
    if (this.initialized) return;
    await this.fetchAssetMaps();
    this.initialized = true;
  }

  private ensureInitialized(): void {
    if (!this.initialized) {
      throw new Error("SymbolConverter must be initialized before use. Call initialize() first.");
    }
  }

  private request<T>(payload: Record<string, unknown>): Promise<T> {
    return this.transport.request<T>("info", payload);
  }

  async fetchAssetMaps(): Promise<void> {
    const [perpMeta, spotMeta, perpDexs] = await Promise.all([
      this.request<MetaResponse>({ type: "meta" }),
      this.request<SpotMetaResponse>({ type: "spotMeta" }),
      this.request<PerpDexsResponse>({ type: "perpDexs" }),
    ]);

    if (!perpMeta?.universe?.length) {
      throw new Error("Invalid perpetual metadata response");
    }

    if (!spotMeta?.universe?.length || !spotMeta?.tokens?.length) {
      throw new Error("Invalid spot metadata response");
    }

    this.nameToAssetId.clear();
    this.nameToSzDecimals.clear();

    this.processDefaultPerps(perpMeta);
    this.processSpotAssets(spotMeta);
    await this.processBuilderDexs(perpDexs);
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

    const results = await Promise.allSettled(
      builderDexs.map((item) => this.request<MetaResponse>({ type: "meta", dex: item.dex.name })),
    );

    results.forEach((result, idx) => {
      if (result.status !== "fulfilled") return;
      this.processBuilderDexResult(result.value, builderDexs[idx].index, builderDexs[idx].dex.name);
    });
  }

  private processBuilderDexResult(meta: MetaResponse, perpDexIndex: number, dexName: string): void {
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
      this.nameToAssetId.set(market.name, assetId);
      this.nameToSzDecimals.set(market.name, baseToken.szDecimals);
    });
  }

  /**
   * Get asset ID for a normalized symbol.
   * @example "BTC" → 0, "ETH" → 1
   */
  getAssetId(name: string): number | undefined {
    this.ensureInitialized();
    return this.nameToAssetId.get(name);
  }

  /**
   * Get size decimals for a normalized symbol.
   * @example "BTC" → 5
   */
  getSzDecimals(name: string): number | undefined {
    this.ensureInitialized();
    return this.nameToSzDecimals.get(name);
  }

}
