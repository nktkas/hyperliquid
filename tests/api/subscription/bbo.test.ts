import type { BboEvent } from "@nktkas/hyperliquid/api/subscription";
import { collectEventsOverTime, runTest } from "./_t.ts";
import { schemaCoverage } from "../_utils/schemaCoverage.ts";
import { typeToJsonSchema } from "../_utils/typeToJsonSchema.ts";

const sourceFile = new URL("../../../src/api/subscription/_methods/bbo.ts", import.meta.url).pathname;
const typeSchema = typeToJsonSchema(sourceFile, "BboEvent");

runTest({
  name: "bbo",
  mode: "api",
  fn: async (_t, client) => {
    const data = await collectEventsOverTime<BboEvent>(async (cb) => {
      await client.bbo({ coin: "BTC" }, cb);
      await client.bbo({ coin: "ETH" }, cb);
      await client.bbo({ coin: "SOL" }, cb);
    }, 60_000);
    schemaCoverage(typeSchema, data);
  },
});
