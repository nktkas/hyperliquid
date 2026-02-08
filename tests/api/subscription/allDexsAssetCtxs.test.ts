import type { AllDexsAssetCtxsEvent } from "@nktkas/hyperliquid/api/subscription";
import { collectEventsOverTime, runTest } from "./_t.ts";
import { schemaCoverage } from "../_utils/schemaCoverage.ts";
import { typeToJsonSchema } from "../_utils/typeToJsonSchema.ts";

const sourceFile = new URL("../../../src/api/subscription/_methods/allDexsAssetCtxs.ts", import.meta.url).pathname;
const responseSchema = typeToJsonSchema(sourceFile, "AllDexsAssetCtxsEvent");

runTest({
  name: "allDexsAssetCtxs",
  mode: "api",
  fn: async (_t, client) => {
    const data = await collectEventsOverTime<AllDexsAssetCtxsEvent>(async (cb) => {
      await client.allDexsAssetCtxs(cb);
    }, 10_000);

    schemaCoverage(responseSchema, data);
  },
});
