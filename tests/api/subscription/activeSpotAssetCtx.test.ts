import type { ActiveSpotAssetCtxEvent } from "@nktkas/hyperliquid/api/subscription";
import { collectEventsOverTime, runTest } from "./_t.ts";
import { schemaCoverage } from "../_utils/schemaCoverage.ts";
import { typeToJsonSchema } from "../_utils/typeToJsonSchema.ts";

const sourceFile = new URL("../../../src/api/subscription/_methods/activeSpotAssetCtx.ts", import.meta.url).pathname;
const typeSchema = typeToJsonSchema(sourceFile, "ActiveSpotAssetCtxEvent");

runTest({
  name: "activeSpotAssetCtx",
  mode: "api",
  fn: async (_t, client) => {
    const data = await collectEventsOverTime<ActiveSpotAssetCtxEvent>(async (cb) => {
      await client.activeSpotAssetCtx({ coin: "@107" }, cb);
      await client.activeSpotAssetCtx({ coin: "@27" }, cb);
    }, 10_000);
    schemaCoverage(typeSchema, data);
  },
});
