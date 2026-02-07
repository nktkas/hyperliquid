import type { CandleEvent } from "@nktkas/hyperliquid/api/subscription";
import { collectEventsOverTime, runTest } from "./_t.ts";
import { schemaCoverage } from "../_utils/schemaCoverage.ts";
import { typeToJsonSchema } from "../_utils/typeToJsonSchema.ts";

const sourceFile = new URL("../../../src/api/subscription/_methods/candle.ts", import.meta.url).pathname;
const typeSchema = typeToJsonSchema(sourceFile, "CandleEvent");

runTest({
  name: "candle",
  mode: "api",
  fn: async (_t, client) => {
    const data = await collectEventsOverTime<CandleEvent>(async (cb) => {
      await client.candle({ coin: "BTC", interval: "1m" }, cb);
      await client.candle({ coin: "ETH", interval: "1m" }, cb);
      await client.candle({ coin: "SOL", interval: "1m" }, cb);
    }, 60_000);
    schemaCoverage(typeSchema, data, [
      "#/properties/i/enum/1",
      "#/properties/i/enum/2",
      "#/properties/i/enum/3",
      "#/properties/i/enum/4",
      "#/properties/i/enum/5",
      "#/properties/i/enum/6",
      "#/properties/i/enum/7",
      "#/properties/i/enum/8",
      "#/properties/i/enum/9",
      "#/properties/i/enum/10",
      "#/properties/i/enum/11",
      "#/properties/i/enum/12",
      "#/properties/i/enum/13",
    ]);
  },
});
