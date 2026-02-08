import * as v from "@valibot/valibot";
import { type CandleEvent, type CandleParameters, CandleRequest } from "@nktkas/hyperliquid/api/subscription";
import { collectEventsOverTime, runTest } from "./_t.ts";
import { schemaCoverage } from "../_utils/schemaCoverage.ts";
import { typeToJsonSchema } from "../_utils/typeToJsonSchema.ts";
import { valibotToJsonSchema } from "../_utils/valibotToJsonSchema.ts";

const sourceFile = new URL("../../../src/api/subscription/_methods/candle.ts", import.meta.url).pathname;
const responseSchema = typeToJsonSchema(sourceFile, "CandleEvent");
const paramsSchema = valibotToJsonSchema(v.omit(CandleRequest, ["type"]));

runTest({
  name: "candle",
  mode: "api",
  fn: async (_t, client) => {
    const params: CandleParameters[] = [
      { coin: "BTC", interval: "1m" },
      { coin: "ETH", interval: "3m" },
      { coin: "SOL", interval: "5m" },
      { coin: "BTC", interval: "15m" },
      { coin: "ETH", interval: "30m" },
      { coin: "SOL", interval: "1h" },
      { coin: "BTC", interval: "2h" },
      { coin: "ETH", interval: "4h" },
      { coin: "SOL", interval: "8h" },
      { coin: "BTC", interval: "12h" },
      { coin: "ETH", interval: "1d" },
      { coin: "SOL", interval: "3d" },
      { coin: "BTC", interval: "1w" },
      { coin: "ETH", interval: "1M" },
    ];

    const data = await collectEventsOverTime<CandleEvent>(async (cb) => {
      await Promise.all(params.map((p) => client.candle(p, cb)));
    }, 60_000);

    schemaCoverage(paramsSchema, params);
    schemaCoverage(responseSchema, data, [
      "#/properties/i/enum/2",
      "#/properties/i/enum/5",
      "#/properties/i/enum/8",
      "#/properties/i/enum/11",
    ]);
  },
});
