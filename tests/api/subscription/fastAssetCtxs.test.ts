import type { FastAssetCtxsEvent } from "@nktkas/hyperliquid/api/subscription";
import { schemaCoverage } from "../_utils/schemaCoverage.ts";
import { typeToJsonSchema } from "../_utils/typeToJsonSchema.ts";
import { collectEventsOverTime, runTest } from "./_t.ts";

const sourceFile = new URL("../../../src/api/subscription/_methods/fastAssetCtxs.ts", import.meta.url).pathname;
const responseSchema = typeToJsonSchema(sourceFile, "FastAssetCtxsEvent");

runTest({
  name: "fastAssetCtxs",
  mode: "api",
  fn: async (_t, client) => {
    const data = await collectEventsOverTime<FastAssetCtxsEvent>(async (cb) => {
      await client.fastAssetCtxs(cb);
    }, 10_000);

    schemaCoverage(responseSchema, data);
  },
});
