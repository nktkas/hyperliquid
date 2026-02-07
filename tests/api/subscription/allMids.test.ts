import type { AllMidsEvent } from "@nktkas/hyperliquid/api/subscription";
import { collectEventsOverTime, runTest } from "./_t.ts";
import { schemaCoverage } from "../_utils/schemaCoverage.ts";
import { typeToJsonSchema } from "../_utils/typeToJsonSchema.ts";

const sourceFile = new URL("../../../src/api/subscription/_methods/allMids.ts", import.meta.url).pathname;
const typeSchema = typeToJsonSchema(sourceFile, "AllMidsEvent");

runTest({
  name: "allMids",
  mode: "api",
  fn: async (_t, client) => {
    const data = await collectEventsOverTime<AllMidsEvent>(async (cb) => {
      await client.allMids(cb);
      await client.allMids({ dex: "unit" }, cb);
    }, 10_000);
    schemaCoverage(typeSchema, data);
  },
});
