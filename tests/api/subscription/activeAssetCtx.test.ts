import type { ActiveAssetCtxEvent } from "@nktkas/hyperliquid/api/subscription";
import { collectEventsOverTime, runTest } from "./_t.ts";
import { schemaCoverage } from "../_utils/schemaCoverage.ts";
import { typeToJsonSchema } from "../_utils/typeToJsonSchema.ts";

const sourceFile = new URL("../../../src/api/subscription/_methods/activeAssetCtx.ts", import.meta.url).pathname;
const typeSchema = typeToJsonSchema(sourceFile, "ActiveAssetCtxEvent");

runTest({
  name: "activeAssetCtx",
  mode: "api",
  fn: async (_t, client) => {
    const data = await collectEventsOverTime<ActiveAssetCtxEvent>(async (cb) => {
      await client.activeAssetCtx({ coin: "ETH" }, cb);
      await client.activeAssetCtx({ coin: "AXL" }, cb);
    }, 10_000);
    schemaCoverage(typeSchema, data);
  },
});
