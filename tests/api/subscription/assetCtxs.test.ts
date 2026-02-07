import type { AssetCtxsEvent } from "@nktkas/hyperliquid/api/subscription";
import { collectEventsOverTime, runTest } from "./_t.ts";
import { schemaCoverage } from "../_utils/schemaCoverage.ts";
import { typeToJsonSchema } from "../_utils/typeToJsonSchema.ts";

const sourceFile = new URL("../../../src/api/subscription/_methods/assetCtxs.ts", import.meta.url).pathname;
const typeSchema = typeToJsonSchema(sourceFile, "AssetCtxsEvent");

runTest({
  name: "assetCtxs",
  mode: "api",
  fn: async (_t, client) => {
    const data = await collectEventsOverTime<AssetCtxsEvent>(async (cb) => {
      await client.assetCtxs(cb);
    }, 10_000);
    schemaCoverage(typeSchema, data);
  },
});
