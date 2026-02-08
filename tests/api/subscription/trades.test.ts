import * as v from "@valibot/valibot";
import { type TradesEvent, type TradesParameters, TradesRequest } from "@nktkas/hyperliquid/api/subscription";
import { collectEventsOverTime, runTest } from "./_t.ts";
import { schemaCoverage } from "../_utils/schemaCoverage.ts";
import { typeToJsonSchema } from "../_utils/typeToJsonSchema.ts";
import { valibotToJsonSchema } from "../_utils/valibotToJsonSchema.ts";

const sourceFile = new URL("../../../src/api/subscription/_methods/trades.ts", import.meta.url).pathname;
const responseSchema = typeToJsonSchema(sourceFile, "TradesEvent");
const paramsSchema = valibotToJsonSchema(v.omit(TradesRequest, ["type"]));

runTest({
  name: "trades",
  mode: "api",
  fn: async (_t, client) => {
    const params: TradesParameters[] = [
      { coin: "BTC" },
    ];

    const data = await collectEventsOverTime<TradesEvent>(async (cb) => {
      await Promise.all(params.map((p) => client.trades(p, cb)));
    }, 10_000);

    schemaCoverage(paramsSchema, params);
    schemaCoverage(responseSchema, data);
  },
});
