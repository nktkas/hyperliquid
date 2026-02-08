import * as v from "@valibot/valibot";
import { type BboEvent, type BboParameters, BboRequest } from "@nktkas/hyperliquid/api/subscription";
import { collectEventsOverTime, runTest } from "./_t.ts";
import { schemaCoverage } from "../_utils/schemaCoverage.ts";
import { typeToJsonSchema } from "../_utils/typeToJsonSchema.ts";
import { valibotToJsonSchema } from "../_utils/valibotToJsonSchema.ts";

const sourceFile = new URL("../../../src/api/subscription/_methods/bbo.ts", import.meta.url).pathname;
const responseSchema = typeToJsonSchema(sourceFile, "BboEvent");
const paramsSchema = valibotToJsonSchema(v.omit(BboRequest, ["type"]));

runTest({
  name: "bbo",
  mode: "api",
  fn: async (_t, client) => {
    const params: BboParameters[] = [
      { coin: "BTC" },
      { coin: "ETH" },
      { coin: "SOL" },
    ];

    const data = await collectEventsOverTime<BboEvent>(async (cb) => {
      await Promise.all(params.map((p) => client.bbo(p, cb)));
    }, 60_000);

    schemaCoverage(paramsSchema, params);
    schemaCoverage(responseSchema, data);
  },
});
