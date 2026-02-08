import type { SpotAssetCtxsEvent } from "@nktkas/hyperliquid/api/subscription";
import { collectEventsOverTime, runTest } from "./_t.ts";
import { schemaCoverage } from "../_utils/schemaCoverage.ts";
import { typeToJsonSchema } from "../_utils/typeToJsonSchema.ts";

const sourceFile = new URL("../../../src/api/subscription/_methods/spotAssetCtxs.ts", import.meta.url).pathname;
const responseSchema = typeToJsonSchema(sourceFile, "SpotAssetCtxsEvent");

runTest({
  name: "spotAssetCtxs",
  mode: "api",
  fn: async (_t, client) => {
    const data = await collectEventsOverTime<SpotAssetCtxsEvent>(async (cb) => {
      await client.spotAssetCtxs(cb);
    }, 10_000);

    schemaCoverage(responseSchema, data);
  },
});
