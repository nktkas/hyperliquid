import type { TradesEvent } from "@nktkas/hyperliquid/api/subscription";
import { collectEventsOverTime, runTest } from "./_t.ts";
import { schemaCoverage } from "../_utils/schemaCoverage.ts";
import { typeToJsonSchema } from "../_utils/typeToJsonSchema.ts";

const sourceFile = new URL("../../../src/api/subscription/_methods/trades.ts", import.meta.url).pathname;
const typeSchema = typeToJsonSchema(sourceFile, "TradesEvent");

runTest({
  name: "trades",
  mode: "api",
  fn: async (_t, client) => {
    const data = await collectEventsOverTime<TradesEvent>(async (cb) => {
      await client.trades({ coin: "BTC" }, cb);
    }, 10_000);
    schemaCoverage(typeSchema, data);
  },
});
